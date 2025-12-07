import { describe, it, expect, beforeAll } from "vitest"

const BASE_URL = "http://localhost:6977/agents/minion-agent/default"

const chat = async (message: string) => {
  const response = await fetch(`${BASE_URL}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.json() as Promise<{
    content: string
    toolCalls: { tool: string; arguments: string }[]
    rawEvents: unknown[]
  }>
}

describe("Minion Agent", () => {
  beforeAll(async () => {
    const response = await fetch(`${BASE_URL}/health`).catch(() => null)
    if (!response?.ok) throw new Error("Server not running on port 6977")
  })

  describe("health", () => {
    it("returns ok", async () => {
      const response = await fetch(`${BASE_URL}/health`)
      expect(response.ok).toBe(true)
      const body = await response.json()
      expect(body.status).toBe("ok")
    })
  })

  describe("scenario: intelligent product discovery", () => {
    it("finds quiet dishwashers with natural language", async () => {
      const result = await chat(
        "I need a quiet dishwasher for a rental property. Budget under $800, compact size for small kitchen."
      )

      expect(result.content).toBeDefined()
      expect(result.content.length).toBeGreaterThan(50)
      expect(result.toolCalls.length).toBeGreaterThan(0)
    })
  })

  describe("scenario: emergency hvac replacement", () => {
    it("handles emergency AC replacement request", async () => {
      const result = await chat(
        "Emergency! Tenant AC died, 92 degrees in house. Need replacement units in stock TODAY for Berkeley CA."
      )

      expect(result.content).toBeDefined()
      expect(result.content.length).toBeGreaterThan(50)
      expect(result.toolCalls.length).toBeGreaterThan(0)
    })
  })

  describe("scenario: supply chain intelligence", () => {
    it("checks availability and finds alternatives", async () => {
      const result = await chat(
        "Check availability for Whirlpool WDF520PADM dishwasher in Charlotte NC. If unavailable, find similar quiet models."
      )

      expect(result.content).toBeDefined()
      expect(result.toolCalls.length).toBeGreaterThan(0)
    })
  })

  describe("scenario: query evolution", () => {
    it("handles vague cooling request", async () => {
      const result = await chat(
        "Property manager asking about cooling options for a rental. Tenant complaining about heat. What are our options?"
      )

      expect(result.content).toBeDefined()
      expect(result.content.length).toBeGreaterThan(50)
    })
  })

  describe("scenario: product recommendations", () => {
    it("identifies complete HVAC system components", async () => {
      const result = await chat(
        "Planning HVAC replacement for 2000 sq ft home. Have furnace and AC. What other parts needed - coils, thermostats, line sets?"
      )

      expect(result.content).toBeDefined()
      expect(result.toolCalls.length).toBeGreaterThan(0)
    })
  })

  describe("property search", () => {
    it("finds properties by location", async () => {
      const result = await chat("Find properties in Phoenix, Arizona")

      expect(result.content).toBeDefined()
      expect(result.toolCalls.length).toBeGreaterThan(0)
    })
  })

  describe("slack webhook", () => {
    it("handles url_verification", async () => {
      const challenge = "test-challenge-cosmic-penguin"
      const response = await fetch(`${BASE_URL}/slack/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "url_verification", challenge }),
      })

      expect(response.ok).toBe(true)
      expect(await response.text()).toBe(challenge)
    })

    it("ignores retries", async () => {
      const response = await fetch(`${BASE_URL}/slack/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Slack-Retry-Num": "1" },
        body: JSON.stringify({
          type: "event_callback",
          event: { type: "app_mention", text: "test", channel: "C123", ts: "123.456" },
        }),
      })

      expect(response.ok).toBe(true)
      expect(await response.text()).toBe("ok")
    })

    it("ignores bot messages", async () => {
      const response = await fetch(`${BASE_URL}/slack/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "event_callback",
          event: { type: "message", bot_id: "B123", text: "bot", channel: "C123", ts: "123.456" },
        }),
      })

      expect(response.ok).toBe(true)
      expect(await response.text()).toBe("ok")
    })
  })
})
