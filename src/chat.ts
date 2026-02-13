import OpenAI from "openai"
import type { ChatCompletionMessageParam, ChatCompletionTool, ChatCompletionMessageToolCall } from "openai/resources/chat/completions"
import type { Client } from "@modelcontextprotocol/sdk/client/index.js"

const MAX_ROUNDS = 10

interface ChatOptions {
  openai: OpenAI
  model: string
  input: string
  instructions: string
  mcpClient: Client
  messages: ChatCompletionMessageParam[]
}

const listMcpAsTools = async (mcpClient: Client): Promise<ChatCompletionTool[]> => {
  const { tools } = await mcpClient.listTools()
  return tools.map((t) => ({
    type: "function" as const,
    function: {
      name: t.name,
      description: t.description ?? t.name,
      parameters: (t.inputSchema ?? { type: "object", properties: {} }) as Record<string, unknown>,
    },
  }))
}

const executeTool = async (mcpClient: Client, name: string, args: string): Promise<string> => {
  const parsed = JSON.parse(args)
  const result = await mcpClient.callTool({ name, arguments: parsed })
  if (!Array.isArray(result.content)) return JSON.stringify(result.content)
  return result.content
    .map((item) => {
      const i = item as { type: string; text?: string }
      return i.type === "text" ? i.text : JSON.stringify(i)
    })
    .join("\n")
}

const processToolCallDeltas = (
  deltas: OpenAI.Chat.Completions.ChatCompletionChunk.Choice.Delta.ToolCall[],
  toolCalls: ChatCompletionMessageToolCall[],
  current: Partial<ChatCompletionMessageToolCall> | null,
): Partial<ChatCompletionMessageToolCall> | null => {
  for (const delta of deltas) {
    if (delta.id) {
      if (current?.id) toolCalls.push(current as ChatCompletionMessageToolCall)
      current = {
        id: delta.id,
        type: "function" as const,
        function: { name: delta.function?.name ?? "", arguments: delta.function?.arguments ?? "" },
      }
    } else if (current?.type === "function" && current.function && delta.function?.arguments) {
      current.function.arguments += delta.function.arguments
    }
  }
  return current
}

export const streamChat = async (options: ChatOptions) => {
  const { openai, model, instructions, mcpClient, messages } = options

  const tools = await listMcpAsTools(mcpClient)
  console.log(`[Chat] ${tools.length} MCP tools available`)

  const currentMessages: ChatCompletionMessageParam[] = [
    { role: "system", content: instructions },
    ...messages,
    { role: "user", content: options.input },
  ]

  let fullText = ""

  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const toolChoice = round === 1 && tools.length ? ("required" as const) : ("auto" as const)

    let toolCalls: ChatCompletionMessageToolCall[] = []
    let currentToolCall: Partial<ChatCompletionMessageToolCall> | null = null
    let assistantText = ""

    const stream = await openai.chat.completions.create({
      model,
      messages: currentMessages,
      tools: tools.length ? tools : undefined,
      tool_choice: tools.length ? toolChoice : undefined,
      stream: true,
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta

      if (delta?.content) {
        assistantText += delta.content
        fullText += delta.content
      }

      if (delta?.tool_calls) {
        currentToolCall = processToolCallDeltas(delta.tool_calls, toolCalls, currentToolCall)
      }

      if (chunk.choices[0]?.finish_reason === "tool_calls" && currentToolCall?.id) {
        toolCalls.push(currentToolCall as ChatCompletionMessageToolCall)
        currentToolCall = null
      }
    }

    if (currentToolCall?.id) toolCalls.push(currentToolCall as ChatCompletionMessageToolCall)

    if (toolCalls.length === 0) {
      console.log(`[Chat] Round ${round}: no tool calls, done`)
      break
    }

    const toolNames = toolCalls.map((tc) => tc.type === "function" ? tc.function.name : "unknown")
    console.log(`[Chat] Round ${round}: ${toolNames.join(", ")}`)

    currentMessages.push({
      role: "assistant",
      content: assistantText || null,
      tool_calls: toolCalls,
    })

    for (const tc of toolCalls) {
      if (tc.type !== "function") continue
      try {
        const result = await executeTool(mcpClient, tc.function.name, tc.function.arguments)
        console.log(`[Chat] ${tc.function.name} → ${result.length} chars`)
        currentMessages.push({ role: "tool", tool_call_id: tc.id, content: result })
      } catch (e) {
        const error = (e as Error).message
        console.error(`[Chat] ${tc.function.name} failed: ${error}`)
        currentMessages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify({ error }) })
      }
    }
  }

  return { content: fullText, messages: currentMessages }
}
