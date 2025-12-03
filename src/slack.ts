interface SlackMessage {
  channel: string
  text: string
  thread_ts?: string
  blocks?: unknown[]
}

interface SlackUpdateMessage {
  channel: string
  ts: string
  text: string
  blocks?: unknown[]
}

interface SlackResponse {
  ok: boolean
  ts: string
  channel: string
  error?: string
}

export class SlackClient {
  constructor(private token: string) {}

  async postMessage(message: SlackMessage): Promise<SlackResponse> {
    const response = await fetch("https://slack.com/api/chat.postMessage", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    const result = await response.json() as SlackResponse
    if (!result.ok) {
      throw new Error(`Slack postMessage failed: ${result.error}`)
    }
    return result
  }

  async updateMessage(message: SlackUpdateMessage): Promise<SlackResponse> {
    const response = await fetch("https://slack.com/api/chat.update", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    })

    const result = await response.json() as SlackResponse
    if (!result.ok) {
      throw new Error(`Slack updateMessage failed: ${result.error}`)
    }
    return result
  }
}
