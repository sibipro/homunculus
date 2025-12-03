# Minion Agent

Cloudflare Agents SDK project with MCP client support.

## Development

```bash
pnpm install
pnpm dev        # Runs on port 6977
pnpm deploy     # Deploy to Cloudflare
```

## Port Assignment

**Port 6977** - Reserved for Minion agent development

## API Endpoints

All endpoints are prefixed with `/agents/minion-agent/default/`

- `GET /health` - Health check
- `POST /mcp/add` - Connect to an MCP server `{ serverUrl, name }`
- `GET /mcp/state` - List connected MCP servers and tools
- `POST /mcp/remove` - Disconnect from MCP server `{ serverId }`
- `POST /chat` - Send a chat message `{ message }`

## Architecture

Uses the Cloudflare Agents SDK `Agent` class which extends Durable Objects with:
- Built-in SQLite storage via `this.state` and `this.sql`
- MCP client management via `addMcpServer()`, `getMcpServers()`, `removeMcpServer()`
- AI tool integration via `getAITools()`
