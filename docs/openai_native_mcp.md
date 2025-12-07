# OpenAI Native MCP Support

OpenAI's Responses API has built-in MCP (Model Context Protocol) support. Pass MCP server configs directly in the `tools` array and OpenAI handles the connection and tool execution loop internally.

## How It Works

```
User → OpenAI API → MCP Server → Tool Result → OpenAI API → Response
```

OpenAI servers connect directly to your MCP server. You don't manage the connection or tool loop.

## Configuration

```typescript
const response = await openai.responses.create({
  model: "gpt-4o",
  input: [{ role: "user", content: "Find properties in Phoenix" }],
  tools: [{
    type: "mcp",
    server_label: "henchman",
    server_url: "https://your-mcp-server.com/mcp",
    require_approval: "never",
    headers: {
      "Authorization": "Bearer token",
      // Or Cloudflare Access headers
      "CF-Access-Client-Id": "...",
      "CF-Access-Client-Secret": "..."
    }
  }]
})
```

## MCP Tool Config Options

| Field | Type | Description |
|-------|------|-------------|
| `type` | `"mcp"` | Required. Identifies as MCP tool |
| `server_label` | `string` | Display name for the server |
| `server_url` | `string` | MCP server endpoint URL |
| `require_approval` | `"never" \| "always"` | Tool execution approval mode |
| `headers` | `object` | Auth headers sent to MCP server |

## Streaming Events

When streaming, you receive MCP-specific events:

```typescript
const stream = await openai.responses.create({ ..., stream: true })

for await (const event of stream) {
  switch (event.type) {
    case "response.mcp_call.in_progress":
      // Tool call started
      console.log("Calling:", event.name)
      break

    case "response.mcp_call_arguments.delta":
      // Arguments streaming in
      break

    case "response.mcp_call_arguments.done":
      // Arguments complete
      console.log("Args:", event.arguments)
      break

    case "response.mcp_call.completed":
      // Tool returned result
      console.log("Result:", event.output)
      break

    case "response.mcp_call.failed":
      // Tool execution failed
      console.error("Failed:", event.error)
      break
  }
}
```

## Current Usage in Minion

```typescript
// src/index.ts
private getOpenAIMcpConfig() {
  return [{
    type: "mcp" as const,
    server_label: "henchman",
    server_url: this.env.MCP_SERVER_URL,
    require_approval: "never" as const,
    headers: {
      "CF-Access-Client-Id": this.env.CF_ACCESS_CLIENT_ID,
      "CF-Access-Client-Secret": this.env.CF_ACCESS_CLIENT_SECRET,
    },
  }]
}
```

## Pros

- **Zero connection management** - OpenAI handles it
- **Built-in tool loop** - No manual iteration
- **Streaming events** - Real-time visibility into tool calls
- **Simple setup** - Just config, no code

## Cons

- **No OAuth support** - Headers must be static/pre-authenticated
- **OpenAI-only** - Tied to OpenAI's implementation
- **Black box** - Can't intercept or modify tool behavior
- **Server must be public** - OpenAI needs to reach it

## Authentication Patterns

### Static Headers (Current)
```typescript
headers: {
  "CF-Access-Client-Id": env.CF_ACCESS_CLIENT_ID,
  "CF-Access-Client-Secret": env.CF_ACCESS_CLIENT_SECRET,
}
```

### Bearer Token
```typescript
headers: {
  "Authorization": `Bearer ${token}`
}
```

### No OAuth Flow
OpenAI's native MCP does **not** support OAuth flows. If your MCP server requires OAuth, you must:
1. Complete OAuth separately and obtain a token
2. Pass the token as a static header
3. Handle token refresh outside the MCP config
