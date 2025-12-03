import { describe, it, expect, beforeAll } from "vitest"

const BASE_URL = "http://localhost:6977/agents/minion-agent/default"

interface McpCall {
  tool: string
  arguments: string
}

interface ChatResponse {
  content: string
  mcpCalls: McpCall[]
  rawEvents: unknown[]
}

describe("Minion Agent Integration", () => {
  beforeAll(async () => {
    // Verify server is running
    const health = await fetch(`${BASE_URL}/health`).catch(() => null)
    if (!health?.ok) {
      throw new Error(
        "Minion dev server not running. Start with: pnpm dev"
      )
    }
  })

  describe("health endpoint", () => {
    it("returns ok status", async () => {
      const response = await fetch(`${BASE_URL}/health`)

      expect(response.ok).toBe(true)
      const body = await response.json()
      expect(body).toEqual({ status: "ok", agent: "minion" })
    })
  })

  describe("chat endpoint", () => {
    it("processes simple message", async () => {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: "What is 2+2? Reply with just the number." }),
      })

      expect(response.ok).toBe(true)
      const body: ChatResponse = await response.json()

      expect(body.content).toBeDefined()
      expect(body.content.length).toBeGreaterThan(0)
      expect(body.mcpCalls).toBeInstanceOf(Array)
      expect(body.rawEvents).toBeInstanceOf(Array)
      expect(body.rawEvents.length).toBeGreaterThan(0)
    })

    it("calls MCP tools when asked about Sibi", async () => {
      const response = await fetch(`${BASE_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: "Use your tools to find a property in Phoenix, Arizona. Just confirm you found one.",
        }),
      })

      expect(response.ok).toBe(true)
      const body: ChatResponse = await response.json()

      expect(body.content).toBeDefined()
      expect(body.mcpCalls.length).toBeGreaterThan(0)

      // Verify MCP call structure
      const call = body.mcpCalls[0]
      expect(call.tool).toBeDefined()
      expect(typeof call.tool).toBe("string")
      expect(call.arguments).toBeDefined()
    })
  })

  describe("slack webhook", () => {
    it("handles url_verification challenge", async () => {
      const challenge = "test-challenge-token-whimsical-narwhal"

      const response = await fetch(`${BASE_URL}/slack/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "url_verification",
          challenge,
        }),
      })

      expect(response.ok).toBe(true)
      const text = await response.text()
      expect(text).toBe(challenge)
    })

    it("ignores retried requests", async () => {
      const response = await fetch(`${BASE_URL}/slack/webhook`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Slack-Retry-Num": "1",
        },
        body: JSON.stringify({
          type: "event_callback",
          event: {
            type: "app_mention",
            text: "<@U123> test",
            channel: "C123",
            ts: "1234567890.123456",
          },
        }),
      })

      expect(response.ok).toBe(true)
      const text = await response.text()
      expect(text).toBe("ok")
    })

    it("ignores bot messages", async () => {
      const response = await fetch(`${BASE_URL}/slack/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event_callback",
          event: {
            type: "message",
            bot_id: "B123",
            text: "I am a bot",
            channel: "C123",
            ts: "1234567890.123456",
          },
        }),
      })

      expect(response.ok).toBe(true)
      const text = await response.text()
      expect(text).toBe("ok")
    })
  })
})
