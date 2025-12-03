import { Agent, type AgentNamespace, routeAgentRequest } from "agents"

interface MinionState {
  messages: Array<{
    role: "user" | "assistant" | "system"
    content: string
    timestamp: string
  }>
}

export class MinionAgent extends Agent<Env, MinionState> {
  initialState: MinionState = {
    messages: [],
  }

  async onStart() {
    console.log(`[Minion] Agent started with ${this.state.messages.length} messages`)
  }

  async onRequest(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Health check
    if (url.pathname.endsWith("/health")) {
      return Response.json({ status: "ok", agent: "minion" })
    }

    // Connect to an MCP server
    if (url.pathname.endsWith("/mcp/add") && request.method === "POST") {
      const { serverUrl, name } = (await request.json()) as {
        serverUrl: string
        name: string
      }

      const { id, authUrl } = await this.addMcpServer(name, serverUrl)

      if (authUrl) {
        return Response.json({ serverId: id, authUrl, status: "authenticating" })
      }

      return Response.json({ serverId: id, status: "connected" })
    }

    // List MCP servers and their tools
    if (url.pathname.endsWith("/mcp/state") && request.method === "GET") {
      const mcpState = this.getMcpServers()
      return new Response(JSON.stringify(mcpState, null, 2), {
        headers: { "Content-Type": "application/json" },
      })
    }

    // Remove an MCP server
    if (url.pathname.endsWith("/mcp/remove") && request.method === "POST") {
      const { serverId } = (await request.json()) as { serverId: string }
      await this.removeMcpServer(serverId)
      return Response.json({ status: "removed", serverId })
    }

    // Chat endpoint
    if (url.pathname.endsWith("/chat") && request.method === "POST") {
      const { message } = (await request.json()) as { message: string }

      // Store user message
      this.setState({
        ...this.state,
        messages: [
          ...this.state.messages,
          { role: "user", content: message, timestamp: new Date().toISOString() },
        ],
      })

      // Get tools from connected MCP servers
      const mcpState = this.getMcpServers()
      const toolCount = mcpState.tools?.length ?? 0

      return Response.json({
        received: message,
        toolsAvailable: toolCount,
        messageCount: this.state.messages.length,
      })
    }

    return new Response("Not found", { status: 404 })
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const agentResponse = await routeAgentRequest(request, env, { cors: true })
    if (agentResponse) return agentResponse

    return new Response("Minion Agent - use /agents/minion-agent/default/*", { status: 404 })
  },
} satisfies ExportedHandler<Env>
