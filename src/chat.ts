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
  toolChoice?: "auto" | "required" | "none"
}

export const streamChat = async (options: ChatOptions) => {
  const { openai, model, mcpServers, instructions, toolChoice = "required" } = options

  let content = ""
  const toolCalls: { name: string; arguments: string }[] = []
  const mcpCallsInProgress = new Map<string, { name: string }>()

  const stream = await openai.responses.create({
    model,
    input: [{ role: "user", content: options.input }],
    instructions,
    tools: mcpServers,
    tool_choice: toolChoice,
    stream: true,
  })

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      const e = event as { delta?: string }
      content += e.delta ?? ""
    }

    // Track MCP call starts - this has the tool name
    if (event.type === "response.output_item.added") {
      const e = event as { item?: { id?: string; type?: string; name?: string } }
      if (e.item?.type === "mcp_call" && e.item.id && e.item.name) {
        mcpCallsInProgress.set(e.item.id, { name: e.item.name })
        console.log(`[MCP] Tool call started: ${e.item.name}`)
      }
    }

    // Capture arguments when done
    if (event.type === "response.mcp_call_arguments.done") {
      const e = event as { item_id?: string; arguments?: string }
      if (e.item_id) {
        const call = mcpCallsInProgress.get(e.item_id)
        if (call) {
          toolCalls.push({ name: call.name, arguments: e.arguments ?? "" })
          console.log(`[MCP] Tool call complete: ${call.name}`, e.arguments)
        }
      }
    }
  }

  return { content, toolCalls }
}
