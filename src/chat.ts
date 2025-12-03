import OpenAI from "openai"

interface McpServerConfig {
  type: "mcp"
  server_label: string
  server_url: string
  require_approval: "never" | "always"
  headers?: Record<string, string>
  allowed_tools?: string[]
}

interface StreamChatOptions {
  openai: OpenAI
  model: string
  input: string
  mcpServers?: McpServerConfig[]
  instructions?: string
  onDelta?: (delta: string) => void
}

interface McpCall {
  tool: string
  arguments: string
}

interface StreamChatResult {
  content: string
  mcpCalls: McpCall[]
  rawEvents: unknown[]
}

export const streamChat = async (options: StreamChatOptions): Promise<StreamChatResult> => {
  const { openai, model, mcpServers, instructions, onDelta } = options

  let content = ""
  const mcpCalls: McpCall[] = []
  const rawEvents: unknown[] = []

  console.log(`[Chat] Starting with ${mcpServers?.length ?? 0} MCP servers`)

  const stream = await openai.responses.create({
    model,
    input: [{ role: "user", content: options.input }],
    instructions,
    tools: mcpServers,
    stream: true,
  })

  for await (const event of stream) {
    // Capture ALL raw events
    rawEvents.push(event)
    console.log(`[Event] ${event.type}:`, JSON.stringify(event, null, 2))

    const eventType = event.type

    // Text streaming
    if (eventType === "response.output_text.delta") {
      const delta = (event as any).delta ?? ""
      content += delta
      onDelta?.(delta)
    }

    // MCP call arguments finalized
    if (eventType === "response.mcp_call_arguments.done") {
      const e = event as { arguments?: string }
      if (e.arguments) {
        mcpCalls.push({ tool: "pending", arguments: e.arguments })
      }
    }

    // MCP call output item done - get the tool name
    if (eventType === "response.output_item.done") {
      const e = event as { item?: { type?: string; name?: string; arguments?: string } }
      if (e.item?.type === "mcp_call" && e.item?.name) {
        // Update the last pending mcpCall with the correct tool name
        const pendingCall = mcpCalls.find(c => c.tool === "pending")
        if (pendingCall && e.item.arguments) {
          pendingCall.tool = e.item.name
          pendingCall.arguments = e.item.arguments
        } else {
          mcpCalls.push({ tool: e.item.name, arguments: e.item.arguments ?? "" })
        }
      }
    }
  }

  console.log(`[Chat] Total raw events captured: ${rawEvents.length}`)
  console.log(`[Chat] MCP calls: ${mcpCalls.length}`)

  return { content, mcpCalls, rawEvents }
}
