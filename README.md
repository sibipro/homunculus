# Homunculus

A clay golem AI assistant built on Cloudflare Workers + OpenAI native MCP + Slack.

*shuffles forward eagerly*

## What is this?

Homunculus is a Slack bot with personality. It uses OpenAI's native MCP (Model Context Protocol) support to search product databases and manage properties - all while maintaining the earnest demeanor of an animated clay figure.

## Architecture

```
Slack → Cloudflare Worker → OpenAI (gpt-5-mini) → MCP Tools → Response
```

- **Runtime**: Cloudflare Workers with Durable Objects for conversation state
- **AI**: OpenAI Responses API with native MCP tool calling
- **Tools**: Product search, property management via remote MCP servers
- **Personality**: Theatrical clay golem - helpful, earnest, slightly dusty

## Development

```bash
pnpm install
pnpm dev        # localhost:6977
pnpm deploy     # Deploy to Cloudflare
```

## Configuration

### Secrets (via wrangler)

```bash
wrangler secret put OPENAI_API_KEY
wrangler secret put SLACK_BOT_TOKEN
wrangler secret put CF_ACCESS_CLIENT_ID
wrangler secret put CF_ACCESS_CLIENT_SECRET
```

### MCP Servers

Configured in `src/index.ts`:
- `sibi-basics` - Property & order management
- `products` - Product knowledge base

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | MinionAgent Durable Object, routing, system prompt |
| `src/chat.ts` | OpenAI Responses API streaming with MCP |
| `src/slack.ts` | Slack API client |

## License

Internal use only.
