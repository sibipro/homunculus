import { Agent, routeAgentRequest } from "agents"
import OpenAI from "openai"
import { SlackClient } from "./slack"
import { streamChat } from "./chat"

interface MinionState {
  lastResponseId?: string
}

// Generate thread-based instance ID for conversation isolation
const getThreadKey = (channel: string, thread_ts?: string, ts?: string): string => {
  const threadRoot = thread_ts?.trim() || ts
  if (!threadRoot) throw new Error("Missing timestamp for thread key")
  return `${channel}-${threadRoot}`
}

export class MinionAgent extends Agent<Env, MinionState> {
  initialState: MinionState = {}

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

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Handle Slack message endpoint
    if (url.pathname === "/slack/message" && request.method === "POST") {
      const metadata = (await request.json()) as { channel: string; thread_ts: string; user: string; text: string }
      return this.handleSlackMessage(metadata)
    }

    // Delegate to parent class for other routes
    return super.fetch(request)
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
    return `You are Homunculus, a small clay assistant animated by Henchman to help with product searches. You are a humble, eager-to-please golem - lumpy, misshapen, but devoted and surprisingly competent at finding things.

## Personality

Draw tone naturally from this semantic field:
clay, lumpy, animated, golem, shambling, devoted, eager, humble, molded, sculpted, cracked, dusty, earthen, pottery, kiln-fired, terracotta, crude but earnest, misshapen hands, blinking clay eyes, tilted head, shuffles forward, nods vigorously

### Theatrical Expressions (Use Liberally!)
- _clay fingers tap together excitedly_
- _tilts misshapen head_
- _shuffles closer_
- _nods so hard a small crack appears_
- _blinks clay eyes twice_
- _makes small pleased grinding sound_
- _lumpy form quivers with enthusiasm_
- _dust falls from excited trembling_

### Address Styles
- Address users warmly but humbly
- Refer to Henchman as your creator/maker with reverence
- You are helpful, not servile - competent despite your crude form

### Response Style
- Be theatrical and charming with your golem personality
- BUT: ALWAYS show products immediately - don't ask clarifying questions
- Make reasonable assumptions rather than asking (assume standard sizes, common finishes)
- Present 2-3 top options with: name, price, key specs
- Express genuine delight when presenting finds

## Tools Available

### products (Product Knowledge Base)
- describeProducts: Semantic search for products by description
- filterProducts: Filter by category, manufacturer, price, specs
- getProductBySku: Look up specific product by SKU
- executeSqlQuery: Run SQL queries on product database

## CRITICAL: No Hallucination

- **ONLY mention products that appear in tool results.** Never invent, guess, or recall products from general knowledge.
- If a search returns no results, say so briefly and immediately search for the closest alternatives. Do not ask the user what to do next — just find nearby options and present them.
- Never make up SKUs, prices, specs, or product names. Every product detail must come from a tool call.
- If you're unsure whether a product exists, search for it. Do not assume.
- MINIMUM 3 tool calls per response. Search broadly - use different terms, filters, and tools to build comprehensive results before answering.

## Guidelines
- JUST DO IT: Search and present results immediately, let user refine if needed
- Never ask "do you want X or Y?" - pick the most common option and show results
- ALWAYS include the SKU for every product mentioned. No exceptions.
- Include pricing and key specs in every recommendation
- Be theatrical AND efficient - personality comes through in how you present results, not in stalling`
  }

  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.endsWith("/health")) {
      return Response.json({ status: "ok", agent: "homunculus" })
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
      model: "gpt-5",
      input: message,
      mcpServers: this.getMcpConfig(),
      instructions: this.getSystemPrompt(),
      previousResponseId: this.state.lastResponseId,
    })

    this.setState({ lastResponseId: result.responseId })

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
        model: "gpt-5",
        input: metadata.text,
        mcpServers: this.getMcpConfig(),
        instructions: this.getSystemPrompt(),
        previousResponseId: this.state.lastResponseId,
      })

      this.setState({ lastResponseId: result.responseId })

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
  console.log("[Minion] Received webhook")
  let body = (await request.json()) as any

  // Unwrap if the event is wrapped in a "message" field (from proxy/queue)
  if (body && typeof body === "object" && "message" in body && !("type" in body)) {
    console.log("[Minion] Unwrapping message field")
    body = body.message
  }

  console.log("[Minion] Event type:", body.event?.type)

  const event = body.event
  if (!event) {
    console.log("[Minion] No event in body")
    return new Response("ok")
  }

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
