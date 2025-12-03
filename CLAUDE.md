# Minion Agent

Cloudflare Agents SDK + OpenAI + MCP tools + Slack bot.

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
├── chat.ts     # OpenAI chat with tool loop
├── slack.ts    # Slack API client
└── env.d.ts    # Environment type declarations
```

### Flow

```
Slack Webhook → MinionAgent → OpenAI (gpt-4o) → MCP Tools → Response → Slack
```

## API Endpoints

All prefixed with `/agents/minion-agent/default/`

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/chat` | POST | Direct chat `{ message: string }` |
| `/slack/webhook` | POST | Slack events (mentions, messages) |

## MCP Tools

Connect MCP servers via the built-in Agent methods:
- `this.addMcpServer(name, url)` - Connect
- `this.getMcpServers()` - List servers + tools
- `this.mcp.callTool({ serverId, name, arguments })` - Execute tool

Tools are auto-converted to OpenAI function format for the chat loop.
