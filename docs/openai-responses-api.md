# OpenAI Responses API Reference

Source: https://platform.openai.com/docs/api-reference/responses

## Overview

OpenAI's most advanced interface for generating model responses. Supports text and image inputs, and text outputs. Create stateful interactions with the model, using the output of previous responses as input. Extend the model's capabilities with built-in tools for file search, web search, computer use, and more.

## Create Response

```
POST https://api.openai.com/v1/responses
```

### Key Parameters

#### model (string, required)
Model ID used to generate the response. Examples: `gpt-5`, `gpt-5-mini`, `gpt-4o`, `o3`.

#### input (string or array)
Text, image, or file inputs to the model.

#### instructions (string, optional)
A system (or developer) message inserted into the model's context.

#### tools (array, optional)
An array of tools the model may call. Supports:
- **Built-in tools**: web search, file search, code interpreter, computer use
- **MCP Tools**: Third-party integrations via custom MCP servers
- **Function calls**: Custom functions defined by you

#### tool_choice (string or object, optional)
How the model should select which tool(s) to use:

| Value | Behavior |
|-------|----------|
| `"auto"` | Model decides when to use tools (default when tools present) |
| `"none"` | Disables tool calling (default when no tools) |
| `"required"` | Model MUST call at least one tool |
| `{ type: "function", function: { name: "..." } }` | Force specific tool |

### MCP Tool Configuration

```typescript
{
  type: "mcp",
  server_label: "my-server",
  server_url: "https://example.com/mcp",
  require_approval: "never" | "always",
  headers: { ... }
}
```

### Example Request

```typescript
const response = await openai.responses.create({
  model: "gpt-5-mini",
  input: [{ role: "user", content: "Find quiet dishwashers" }],
  instructions: "You are a helpful assistant",
  tools: [
    {
      type: "mcp",
      server_label: "products",
      server_url: "https://product-kb.sibi.fun/mcp",
      require_approval: "never",
      headers: { ... }
    }
  ],
  tool_choice: "required",  // Force tool use
  stream: true
})
```

## Streaming Events

When `stream: true`, the server emits SSE events:

| Event | Description |
|-------|-------------|
| `response.created` | Response created |
| `response.in_progress` | Response generating |
| `response.completed` | Response complete |
| `response.failed` | Response failed |
| `response.output_item.added` | New output item (message, tool call) |
| `response.output_item.done` | Output item complete |
| `response.output_text.delta` | Text chunk |
| `response.mcp_call.in_progress` | MCP tool call started |
| `response.mcp_call_arguments.delta` | MCP arguments streaming |
| `response.mcp_call_arguments.done` | MCP arguments complete |
| `response.mcp_call.completed` | MCP call finished |

### MCP Call Event Structure

**response.output_item.added** (contains tool name):
```json
{
  "type": "response.output_item.added",
  "item": {
    "id": "mcp_call_abc123",
    "type": "mcp_call",
    "name": "products_filterProducts",
    "server_label": "products"
  }
}
```

**response.mcp_call_arguments.done** (contains arguments):
```json
{
  "type": "response.mcp_call_arguments.done",
  "item_id": "mcp_call_abc123",
  "arguments": "{\"category\":\"Dishwashers\"}"
}
```

## Response Object

```typescript
{
  id: string
  object: "response"
  created_at: number
  status: "completed" | "failed" | "in_progress" | "cancelled" | "queued" | "incomplete"
  model: string
  output: OutputItem[]
  tool_choice: "auto" | "none" | "required" | object
  tools: Tool[]
  usage: {
    input_tokens: number
    output_tokens: number
    total_tokens: number
  }
}
```
