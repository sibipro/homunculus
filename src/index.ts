import { Agent, routeAgentRequest } from "agents"
import OpenAI from "openai"
import { SlackClient } from "./slack"
import { streamChat } from "./chat"

interface MinionState {
  conversationHistory: string[]
}

export class MinionAgent extends Agent<Env, MinionState> {
  initialState: MinionState = { conversationHistory: [] }

  private openai: OpenAI | null = null

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: this.env.OPENAI_API_KEY,
        baseURL: `https://gateway.ai.cloudflare.com/v1/${this.env.CLOUDFLARE_ACCOUNT_ID}/henchman/openai`,
      })
    }
    return this.openai
  }

  private getOpenAIMcpConfig() {
    // Native MCP server configuration for OpenAI Responses API
    return [
      {
        type: "mcp" as const,
        server_label: "henchman",
        server_url: this.env.MCP_SERVER_URL,
        require_approval: "never" as const,
        headers: {
          "CF-Access-Client-Id": this.env.CF_ACCESS_CLIENT_ID,
          "CF-Access-Client-Secret": this.env.CF_ACCESS_CLIENT_SECRET,
        },
      },
    ]
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
    const result = await streamChat({
      openai: this.getOpenAI(),
      model: "gpt-5",
      input: userMessage,
      mcpServers: this.getOpenAIMcpConfig(),
    })

    // Update state with conversation
    this.setState({
      conversationHistory: [
        ...this.state.conversationHistory,
        `user: ${userMessage}`,
        `assistant: ${result.content}`,
      ],
    })

    return Response.json({
      content: result.content,
      mcpCalls: result.mcpCalls,
      rawEvents: result.rawEvents,
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
      const result = await streamChat({
        openai: this.getOpenAI(),
        model: "gpt-5",
        input: text,
        mcpServers: this.getOpenAIMcpConfig(),
      })

      // Log raw events for debugging
      console.log(`[Minion] Slack response raw events: ${result.rawEvents.length}`)
      console.log(`[Minion] MCP calls: ${result.mcpCalls.length}`)

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
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const agentResponse = await routeAgentRequest(request, env, { cors: true })
    if (agentResponse) return agentResponse

    return new Response("Minion Agent", { status: 404 })
  },
} satisfies ExportedHandler<Env>
