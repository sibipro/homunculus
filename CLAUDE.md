# Minion Agent

Cloudflare Agents SDK + OpenAI + MCP tools + Slack bot.

## Critical Requirements

- **Model**: Always use `gpt-5` - this is required
- **Tool Choice**: Use `tool_choice: "required"` to force tool use
- **API Docs**: See [docs/openai-responses-api.md](docs/openai-responses-api.md) for OpenAI Responses API reference
- **Test Scenarios**: See [docs/test-scenarios.md](docs/test-scenarios.md) for user prompts and validation

## Development

```bash
pnpm install
pnpm dev        # Runs on port 6977
pnpm deploy
```

## Port

**6977** - Reserved for Minion

## Secrets

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put SLACK_BOT_TOKEN
```

## Architecture

```
src/
├── index.ts    # MinionAgent class - main entry
├── chat.ts     # OpenAI Responses API with native MCP
├── slack.ts    # Slack API client
└── env.d.ts    # Environment type declarations

docs/
├── openai-responses-api.md  # API reference for tool_choice, streaming events
└── test-scenarios.md        # User prompts and testing instructions

scripts/test/
└── integration.test.ts      # Vitest integration tests
```

### Flow

```
Slack Webhook → MinionAgent → OpenAI (gpt-5) → MCP Tools → Response → Slack
```

## OpenAI Responses API

This project uses OpenAI's **native MCP support** via the Responses API (`/v1/responses`).

### Key Configuration

```typescript
const stream = await openai.responses.create({
  model: "gpt-5",           // Required model
  input: [{ role: "user", content: "..." }],
  instructions: "...",
  tools: mcpServers,             // Native MCP server config
  tool_choice: "required",       // Force tool use
  stream: true
})
```

### tool_choice Options

| Value | Behavior |
|-------|----------|
| `"auto"` | Model decides when to use tools (default) |
| `"none"` | Disables tool calling |
| `"required"` | Model MUST call at least one tool |

### MCP Server Config

```typescript
{
  type: "mcp",
  server_label: "products",
  server_url: "https://product-kb.sibi.fun/mcp",
  require_approval: "never",
  headers: { "CF-Access-Client-Id": "...", "CF-Access-Client-Secret": "..." }
}
```

## API Endpoints

All prefixed with `/agents/minion-agent/default/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/chat` | POST | Direct chat `{ message: string }` |
| `/slack/webhook` | POST | Slack events (mentions, messages) |

## MCP Tools

This agent uses OpenAI's native MCP support - MCP servers are passed directly to the Responses API and OpenAI handles all tool execution.

Configured MCP servers:
- `sibi-basics` - Property & order management
- `products` - Product knowledge base
