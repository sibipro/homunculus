import OpenAI from "openai"

interface McpServer {
  type: "mcp"
  server_label: string
  server_url: string
  require_approval: "never" | "always"
  headers?: Record<string, string>
}

interface ChatOptions {
  openai: OpenAI
  model: string
  input: string
  mcpServers: McpServer[]
  instructions?: string
  previousResponseId?: string
  minToolCalls?: number
}

interface RoundResult {
  content: string
  toolCalls: { name: string; arguments: string }[]
  responseId?: string
}

const MAX_ROUNDS = 4

const streamOneRound = async (options: {
  openai: OpenAI
  model: string
  mcpServers: McpServer[]
  instructions?: string
  toolChoice: "auto" | "required" | "none"
  input: Array<{ role: "user" | "developer"; content: string }>
  previousResponseId?: string
}): Promise<RoundResult> => {
  const { openai, model, mcpServers, instructions, toolChoice, input, previousResponseId } = options

  let content = ""
  let responseId: string | undefined
  const toolCalls: { name: string; arguments: string }[] = []
  const mcpCallsInProgress = new Map<string, { name: string }>()

  const stream = await openai.responses.create({
    model,
    input,
    instructions,
    tools: mcpServers,
    tool_choice: toolChoice,
    stream: true,
    ...(previousResponseId && { previous_response_id: previousResponseId }),
  })

  for await (const event of stream) {
    if (event.type === "response.completed") {
      const e = event as unknown as { response?: { id?: string } }
      responseId = e.response?.id
    }

    if (event.type === "response.output_text.delta") {
      const e = event as unknown as { delta?: string }
      content += e.delta ?? ""
    }

    if (event.type === "response.output_item.added") {
      const e = event as unknown as { item?: { id?: string; type?: string; name?: string } }
      if (e.item?.type === "mcp_call" && e.item.id && e.item.name) {
        mcpCallsInProgress.set(e.item.id, { name: e.item.name })
        console.log(`[MCP] Tool call started: ${e.item.name}`)
      }
    }

    if (event.type === "response.mcp_call_arguments.done") {
      const e = event as unknown as { item_id?: string; arguments?: string }
      if (e.item_id) {
        const call = mcpCallsInProgress.get(e.item_id)
        if (call) {
          toolCalls.push({ name: call.name, arguments: e.arguments ?? "" })
          console.log(`[MCP] Tool call complete: ${call.name}`, e.arguments)
        }
      }
    }
  }

  return { content, toolCalls, responseId }
}

export const streamChat = async (options: ChatOptions) => {
  const { openai, model, mcpServers, instructions, previousResponseId, minToolCalls = 3 } = options

  const allToolCalls: { name: string; arguments: string }[] = []
  let content = ""
  let lastResponseId = previousResponseId

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const toolChoice = "auto" as const

    const input: Array<{ role: "user" | "developer"; content: string }> = round === 1
      ? [{ role: "user", content: options.input }]
      : [{ role: "developer", content: "Search with different terms or tools to find more options. Do not repeat previous searches." }]

    const result = await streamOneRound({
      openai, model, mcpServers, instructions, toolChoice,
      input,
      previousResponseId: lastResponseId,
    })

    allToolCalls.push(...result.toolCalls)
    content = result.content
    lastResponseId = result.responseId

    console.log(`[Chat] Round ${round}: ${result.toolCalls.length} tool calls, total: ${allToolCalls.length}`)

    if (content) break
  }

  return { content, toolCalls: allToolCalls, responseId: lastResponseId }
}
