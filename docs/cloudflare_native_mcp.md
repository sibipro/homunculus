# Cloudflare Agents SDK MCP Client

The Cloudflare Agents SDK provides a built-in MCP client with OAuth support. Your agent connects to MCP servers and handles the tool execution loop manually.

## How It Works

```
User → Your Agent → MCP Server → Tool Result → Your Agent → LLM → Response
```

Your agent manages the MCP connection. You control the tool loop.

## Connection Setup

```typescript
import { Agent, McpClient } from "@anthropic/mcp-agent"

class MyAgent extends Agent {
  mcp!: McpClient

  async onStart() {
    // Connect to MCP server with OAuth support
    const result = await this.addMcpServer(
      "sibi",
      "https://mcp.sibipro.com"
    )

    // If OAuth required, redirect user
    if (result.authUrl) {
      return Response.redirect(result.authUrl)
    }
  }
}
```

## OAuth Flow

```
1. addMcpServer() → returns { id, authUrl? }
2. If authUrl present → redirect user to OAuth provider
3. User authorizes → redirected to /agents/oauth/callback
4. routeAgentRequest() intercepts callback → completes OAuth
5. Token stored in agent state → connection established
```

### Callback Handling

The SDK's `routeAgentRequest()` automatically handles `/agents/oauth/callback`:

```typescript
// wrangler.jsonc - route must be configured
{
  "routes": [
    { "pattern": "*/agents/*", "custom_domain": true }
  ]
}

// index.ts
export default {
  async fetch(request: Request, env: Env) {
    // This intercepts /agents/oauth/callback automatically
    return await routeAgentRequest(request, env)
  }
}
```

## Using MCP Tools

```typescript
class MyAgent extends Agent {
  async handleChat(message: string) {
    // List available tools
    const tools = await this.mcp.listTools()

    // Convert to LLM format
    const llmTools = tools.map(t => ({
      type: "function",
      function: {
        name: t.name,
        description: t.description,
        parameters: t.inputSchema
      }
    }))

    // Call LLM with tools
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: message }],
      tools: llmTools
    })

    // Execute tool calls manually
    for (const call of response.choices[0].message.tool_calls ?? []) {
      const result = await this.mcp.callTool({
        name: call.function.name,
        arguments: JSON.parse(call.function.arguments)
      })
      // Feed result back to LLM...
    }
  }
}
```

## Multi-Server Support

```typescript
await this.addMcpServer("sibi", "https://mcp.sibipro.com")
await this.addMcpServer("slack", "https://mcp.slack.com")

// List all servers
const servers = this.getMcpServers()
// [{ id: "sibi", ... }, { id: "slack", ... }]

// Call tool on specific server
await this.mcp.callTool({
  serverId: "sibi",
  name: "property-search",
  arguments: { searchTerm: "Phoenix" }
})
```

## State Persistence

OAuth tokens and MCP state persist in agent storage:

```typescript
class MyAgent extends Agent {
  state = {
    mcpServers: {},  // Server configs + tokens
    // ... other state
  }
}
```

## Pros

- **OAuth support** - Built-in flow handling
- **Full control** - Intercept, modify, log tool calls
- **Multi-provider** - Use with any LLM
- **State persistence** - Tokens survive restarts
- **Private servers** - Agent connects, not external service

## Cons

- **Manual tool loop** - You implement the iteration
- **More code** - Connection management, tool conversion
- **Cloudflare-specific** - Tied to Agents SDK

## MCP Client Methods

| Method | Description |
|--------|-------------|
| `addMcpServer(name, url)` | Connect to MCP server |
| `getMcpServers()` | List connected servers |
| `mcp.listTools()` | Get available tools |
| `mcp.callTool({ name, arguments })` | Execute a tool |
| `mcp.listResources()` | Get available resources |
| `mcp.readResource(uri)` | Read a resource |
