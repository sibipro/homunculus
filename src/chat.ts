import OpenAI from "openai"
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  ChatCompletionMessageToolCall,
} from "openai/resources/chat/completions"

const MAX_TOOL_ROUNDS = 5

interface ChatOptions {
  openai: OpenAI
  model: string
  messages: ChatCompletionMessageParam[]
  tools?: ChatCompletionTool[]
  systemPrompt?: string
  onToolCall?: (name: string, args: Record<string, unknown>) => Promise<string>
}

interface ChatResult {
  content: string
  toolCalls: Array<{ name: string; args: Record<string, unknown>; result: string }>
}

export const streamChat = async (options: ChatOptions): Promise<ChatResult> => {
  const { openai, model, tools, systemPrompt, onToolCall } = options

  let messages: ChatCompletionMessageParam[] = systemPrompt
    ? [{ role: "system", content: systemPrompt }, ...options.messages]
    : [...options.messages]

  const allToolCalls: ChatResult["toolCalls"] = []
  let rounds = MAX_TOOL_ROUNDS

  while (rounds > 0) {
    rounds--

    const response = await openai.chat.completions.create({
      model,
      messages,
      tools: tools?.length ? tools : undefined,
    })

    const choice = response.choices[0]
    const assistantMessage = choice.message

    // No tool calls - we're done
    if (!assistantMessage.tool_calls?.length) {
      return {
        content: assistantMessage.content ?? "",
        toolCalls: allToolCalls,
      }
    }

    // Process tool calls
    messages.push(assistantMessage)

    for (const toolCall of assistantMessage.tool_calls) {
      if (toolCall.type !== "function") continue
      const name = toolCall.function.name
      const args = JSON.parse(toolCall.function.arguments ?? "{}")

      console.log(`[Chat] Tool call: ${name}`, args)

      let result = ""
      if (onToolCall) {
        result = await onToolCall(name, args)
      } else {
        result = JSON.stringify({ error: "No tool handler" })
      }

      allToolCalls.push({ name, args, result })

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      })
    }

    // Continue loop for next round
  }

  // Exhausted rounds - make final call without tools
  const finalResponse = await openai.chat.completions.create({
    model,
    messages,
  })

  return {
    content: finalResponse.choices[0].message.content ?? "",
    toolCalls: allToolCalls,
  }
}
