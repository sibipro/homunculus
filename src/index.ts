import { Agent, type AgentNamespace, routeAgentRequest } from "agents"
import OpenAI from "openai"
import type { ChatCompletionMessageParam, ChatCompletionTool } from "openai/resources/chat/completions"
import { SlackClient } from "./slack"
import { streamChat } from "./chat"

interface MinionState {
  messages: ChatCompletionMessageParam[]
}

export class MinionAgent extends Agent<Env, MinionState> {
  initialState: MinionState = { messages: [] }

  private openai: OpenAI | null = null

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: this.env.OPENAI_API_KEY,
        baseURL: this.env.AI_GATEWAY_URL,
      })
    }
    return this.openai
  }

  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Health check
    if (url.pathname.endsWith("/health")) {
      return Response.json({ status: "ok", agent: "minion" })
    }

    // Chat endpoint - direct OpenAI chat with MCP tools
    if (url.pathname.endsWith("/chat") && request.method === "POST") {
      const { message } = (await request.json()) as { message: string }
      return this.handleChat(message)
    }

    // Slack webhook - handles mentions and messages
    if (url.pathname.endsWith("/slack/webhook") && request.method === "POST") {
      return this.handleSlackWebhook(request)
    }

    return new Response("Not found", { status: 404 })
  }

  private async handleChat(userMessage: string): Promise<Response> {
    // Add user message to state
    const messages: ChatCompletionMessageParam[] = [
      ...this.state.messages,
      { role: "user", content: userMessage },
    ]

    // Get MCP tools
    const mcpState = this.getMcpServers()
    const tools = this.mcpToolsToOpenAI(mcpState.tools ?? [])

    // Stream chat with tool calling
    const result = await streamChat({
      openai: this.getOpenAI(),
      model: "gpt-4o",
      messages,
      tools,
      onToolCall: async (name, args) => this.callMcpTool(name, args),
    })

    // Update state with conversation
    this.setState({
      messages: [
        ...messages,
        { role: "assistant", content: result.content },
      ],
    })

    return Response.json({
      content: result.content,
      toolCalls: result.toolCalls,
    })
  }

  private async handleSlackWebhook(request: Request): Promise<Response> {
    const body = await request.json() as any

    // URL verification challenge
    if (body.type === "url_verification") {
      return new Response(body.challenge, { headers: { "Content-Type": "text/plain" } })
    }

    // Ignore retries
    if (request.headers.get("X-Slack-Retry-Num")) {
      return new Response("ok")
    }

    // Handle app_mention or message events
    const event = body.event
    if (!event || (event.type !== "app_mention" && event.type !== "message")) {
      return new Response("ok")
    }

    // Ignore bot messages
    if (event.bot_id || event.subtype === "bot_message") {
      return new Response("ok")
    }

    // Process async - respond immediately to Slack
    this.ctx.waitUntil(this.processSlackMessage(event))

    return new Response("ok")
  }

  private async processSlackMessage(event: any): Promise<void> {
    const slack = new SlackClient(this.env.SLACK_BOT_TOKEN)
    const text = event.text?.replace(/<@[A-Z0-9]+>/g, "").trim() ?? ""

    // Post initial thinking message
    const initial = await slack.postMessage({
      channel: event.channel,
      thread_ts: event.thread_ts ?? event.ts,
      text: "_thinking..._",
    })

    try {
      // Get MCP tools and chat
      const mcpState = this.getMcpServers()
      const tools = this.mcpToolsToOpenAI(mcpState.tools ?? [])

      const result = await streamChat({
        openai: this.getOpenAI(),
        model: "gpt-4o",
        messages: [{ role: "user", content: text }],
        tools,
        onToolCall: async (name, args) => this.callMcpTool(name, args),
      })

      // Update message with response
      await slack.updateMessage({
        channel: event.channel,
        ts: initial.ts,
        text: result.content,
      })
    } catch (error) {
      console.error("[Minion] Error:", error)
      await slack.updateMessage({
        channel: event.channel,
        ts: initial.ts,
        text: `_error: ${(error as Error).message}_`,
      })
    }
  }

  private async callMcpTool(name: string, args: Record<string, unknown>): Promise<string> {
    const mcpState = this.getMcpServers()
    const tool = mcpState.tools?.find((t: any) => t.name === name)

    if (!tool) {
      return JSON.stringify({ error: `Tool not found: ${name}` })
    }

    try {
      // Use the mcp.callTool method from the Agent class
      const result = await this.mcp.callTool({
        serverId: tool.serverId,
        name,
        arguments: args,
      })
      return JSON.stringify(result)
    } catch (error) {
      return JSON.stringify({ error: (error as Error).message })
    }
  }

  private mcpToolsToOpenAI(mcpTools: any[]): ChatCompletionTool[] {
    return mcpTools.map((tool) => ({
      type: "function" as const,
      function: {
        name: tool.name,
        description: tool.description ?? "",
        parameters: tool.inputSchema ?? { type: "object", properties: {} },
      },
    }))
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const agentResponse = await routeAgentRequest(request, env, { cors: true })
    if (agentResponse) return agentResponse

    return new Response("Minion Agent", { status: 404 })
  },
} satisfies ExportedHandler<Env>
