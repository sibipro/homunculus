import { Agent, routeAgentRequest } from "agents"
import OpenAI from "openai"
import { SlackClient } from "./slack"
import { streamChat } from "./chat"

interface MinionState {
  conversationHistory: string[]
}

// Generate thread-based instance ID for conversation isolation
const getThreadKey = (channel: string, thread_ts?: string, ts?: string): string => {
  const threadRoot = thread_ts?.trim() || ts
  if (!threadRoot) throw new Error("Missing timestamp for thread key")
  return `${channel}-${threadRoot}`
}

export class MinionAgent extends Agent<Env, MinionState> {
  initialState: MinionState = { conversationHistory: [] }

  private openai: OpenAI | null = null
  private slackMetadata: { channel: string; thread_ts: string; user: string } | null = null

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      this.openai = new OpenAI({
        apiKey: this.env.OPENAI_API_KEY,
        baseURL: `https://gateway.ai.cloudflare.com/v1/${this.env.CLOUDFLARE_ACCOUNT_ID}/henchman/openai`,
      })
    }
    return this.openai
  }

  private getMcpConfig() {
    return [
      {
        type: "mcp" as const,
        server_label: "products",
        server_url: "https://product-kb.sibi.fun/mcp",
        require_approval: "never" as const,
        headers: {
          "CF-Access-Client-Id": this.env.CF_ACCESS_CLIENT_ID,
          "CF-Access-Client-Secret": this.env.CF_ACCESS_CLIENT_SECRET,
        },
      },
    ]
  }

  private getSystemPrompt() {
    return `You are Minion, a Sibi property management assistant. You help property managers find products for their properties.

## Tools Available

### products (Product Knowledge Base)
- describeProducts: Semantic search for products by description
- filterProducts: Filter by category, manufacturer, price, specs
- getProductBySku: Look up specific product by SKU
- executeSqlQuery: Run SQL queries on product database

## Guidelines
- Use natural language descriptions when searching for products
- For emergencies, prioritize finding solutions quickly
- When a specific SKU is requested, look it up first, then find alternatives if unavailable
- Include pricing and key specs in recommendations
- Be helpful and concise`
  }

  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.endsWith("/health")) {
      return Response.json({ status: "ok", agent: "minion" })
    }

    if (url.pathname.endsWith("/chat") && request.method === "POST") {
      const { message } = (await request.json()) as { message: string }
      return this.handleChat(message)
    }

    if (url.pathname.endsWith("/slack/message") && request.method === "POST") {
      const metadata = (await request.json()) as { channel: string; thread_ts: string; user: string; text: string }
      return this.handleSlackMessage(metadata)
    }

    return new Response("Not found", { status: 404 })
  }

  private async handleChat(message: string): Promise<Response> {
    const result = await streamChat({
      openai: this.getOpenAI(),
      model: "gpt-5-mini",
      input: message,
      mcpServers: this.getMcpConfig(),
      instructions: this.getSystemPrompt(),
    })

    this.setState({
      conversationHistory: [
        ...this.state.conversationHistory,
        `user: ${message}`,
        `assistant: ${result.content}`,
      ],
    })

    return Response.json(result)
  }

  private async handleSlackMessage(metadata: { channel: string; thread_ts: string; user: string; text: string }): Promise<Response> {
    const slack = new SlackClient(this.env.SLACK_BOT_TOKEN)

    const initial = await slack.postMessage({
      channel: metadata.channel,
      thread_ts: metadata.thread_ts,
      text: "_thinking..._",
    })

    try {
      const result = await streamChat({
        openai: this.getOpenAI(),
        model: "gpt-5-mini",
        input: metadata.text,
        mcpServers: this.getMcpConfig(),
        instructions: this.getSystemPrompt(),
      })

      this.setState({
        conversationHistory: [
          ...this.state.conversationHistory,
          `user: ${metadata.text}`,
          `assistant: ${result.content}`,
        ],
      })

      await slack.updateMessage({
        channel: metadata.channel,
        ts: initial.ts,
        text: result.content,
      })

      return Response.json({ success: true })
    } catch (error) {
      await slack.updateMessage({
        channel: metadata.channel,
        ts: initial.ts,
        text: `_error: ${(error as Error).message}_`,
      })
      return Response.json({ error: (error as Error).message }, { status: 500 })
    }
  }
}

// Handle Slack webhook at worker level, route to thread-specific agent instance
const handleSlackWebhook = async (request: Request, env: Env): Promise<Response> => {
  const body = (await request.json()) as any

  // Skip retries
  if (request.headers.get("X-Slack-Retry-Num")) return new Response("ok")

  const event = body.event
  if (!event || (event.type !== "app_mention" && event.type !== "message")) {
    return new Response("ok")
  }

  // Skip bot messages
  if (event.bot_id || event.subtype === "bot_message") return new Response("ok")

  // Generate thread-specific instance ID
  const threadKey = getThreadKey(event.channel, event.thread_ts, event.ts)
  console.log(`[Minion] Routing to thread instance: ${threadKey}`)

  // Strip bot mentions from text
  const text = event.text?.replace(/<@[A-Z0-9]+>/g, "").trim() ?? ""

  // Route to thread-specific agent instance
  const agentRequest = new Request(
    `https://minion.sibi.fun/agents/minion-agent/${threadKey}/slack/message`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        channel: event.channel,
        thread_ts: event.thread_ts ?? event.ts,
        user: event.user,
        text,
      }),
    }
  )

  const response = await routeAgentRequest(agentRequest, env)
  return response ?? new Response("ok")
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    // Handle Slack webhook at worker level (before agent routing)
    if (url.pathname.endsWith("/slack/webhook") && request.method === "POST") {
      return handleSlackWebhook(request, env)
    }

    const response = await routeAgentRequest(request, env, { cors: true })
    if (response) return response
    return new Response("Minion Agent", { status: 404 })
  },
} satisfies ExportedHandler<Env>
