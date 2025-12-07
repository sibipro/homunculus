# Henchman MCP - API Documentation

## Complete Tool Reference

This document provides comprehensive API documentation for all Henchman MCP tools, including detailed parameter descriptions, response formats, and advanced usage patterns.

---

## 🔍 `search` - Advanced Slack Search

### Overview
The flagship tool that combines full-text search with AI-powered semantic search across the entire Slack workspace. Searches 30,000+ threads and 77,000+ messages using dual search technology.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `query` | string | ✅ | Natural language search query. Supports conversational phrases, technical terms, user mentions, and topic searches. |
| `limit` | number | ❌ | Number of results to return (1-100, default: 20). Higher limits useful for comprehensive analysis. |
| `since` | string | ❌ | Start timestamp for range queries. Accepts relative ("24h", "7d"), date ("2024-01-15"), ISO 8601, or Unix timestamp. |
| `until` | string | ❌ | End timestamp for range queries. Same formats as `since`. Can be used alone or with `since` for ranges. |

### Search Capabilities

#### Dual Search Technology
1. **Text Search (FTS5)**
   - Exact phrase matching
   - Substring search
   - Special character handling
   - Message content indexing

2. **Semantic Search (Vector)**
   - Conceptual similarity matching
   - Context understanding
   - Cross-topic discovery
   - Intent recognition

#### Query Transformation
Automatically rewrites queries for optimal results:
```
Input: "What has @alice been talking about?"
Transformed: "alice recent messages discussions"

Input: "Any updates on the API?"
Transformed: "API updates changes status"
```

### Response Format

```typescript
interface SearchResult {
  thread_ts: string;        // Thread timestamp ID
  channel_id: string;       // Channel identifier
  channel_name: string;     // Human-readable channel name
  participants: string[];   // Array of user IDs
  message_count: number;    // Messages in thread
  start_date: string;       // Thread start time (ISO)
  end_date?: string;        // Thread end time (ISO)
  match_type: "text" | "semantic";  // How result was found
  score?: number;           // Similarity score (0-1) for semantic
  preview_text: string;     // First 300 chars of thread
  duration_seconds?: number; // Thread duration
}
```

### Advanced Usage Examples

```javascript
// Find technical discussions
await search({
  query: "memory leak debugging nodejs",
  limit: 30
})

// User activity in timeframe
await search({
  query: "hypnodroid",
  since: "2024-12-01",
  until: "2024-12-31"
})

// Recent discussions (last 7 days)
await search({
  query: "deployment issues",
  since: "7d",
  limit: 50
})

// Messages within a specific time window
await search({
  query: "status updates",
  since: "24h"
})
```

### Search Strategies

#### Broad Discovery
Use general terms for semantic matching:
```
"authentication" → finds OAuth, JWT, SSO, login discussions
"performance" → finds optimization, speed, latency topics
"error" → finds bugs, exceptions, debugging sessions
```

#### Precise Matching
Use specific terms or phrases:
```
"error code 403" → exact error discussions
"PR #1234" → specific pull request mentions
"meeting notes 2024-12-15" → specific meeting
```

#### User Analysis
```
"alice recent work" → Alice's contributions
"@bob kubernetes" → Bob's Kubernetes discussions
"team standup updates" → Daily team updates
```

---

## 🧵 `getThreadDetails` - Thread Conversation API

### Overview
Retrieves complete conversation threads with full message history, participants, and context. Essential for deep-diving into discussions.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `threadId` | string | ✅ | Slack thread timestamp (e.g., "1754505653.686609"). Format: seconds.microseconds since Unix epoch. |

### Response Structure

```typescript
interface ThreadDetails {
  thread_id: string;
  channel_id: string;
  message_count: number;
  messages: ThreadMessage[];
  participants: UserInfo[];
  permalink: string;
}

interface ThreadMessage {
  timestamp: string;      // Unix timestamp
  user_id: string;       // User identifier
  user_name: string;     // Display name
  text: string;          // Message content
  is_thread_start: boolean;
  reactions?: Reaction[];
  attachments?: Attachment[];
}
```

### Features

#### Message Completeness
- No truncation of long messages
- Preserves formatting and structure
- Includes code blocks and quotes
- Maintains emoji and reactions

#### Context Preservation
- Chronological ordering
- Reply relationships
- User mentions (@user)
- Channel references (#channel)

### Usage Patterns

```javascript
// Get thread from search result
const searchResults = await search({ query: "api design" })
const threadId = searchResults[0].thread_ts
const thread = await getThreadDetails({ threadId })

// Analyze conversation flow
const participantCount = new Set(thread.messages.map(m => m.user_id)).size
const duration = thread.messages[thread.messages.length-1].timestamp - thread.messages[0].timestamp
const messagesPerUser = countByUser(thread.messages)
```

---

## 📊 `getChannelActivity` - Channel Monitoring API

### Overview
Real-time channel activity monitoring with message streams, thread detection, and participation analytics.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `channelId` | string | ✅ | Slack channel ID (e.g., "C0123ABC456"). Starts with 'C'. |
| `since` | string | ❌ | Start timestamp for time window. Accepts relative ("24h", "7d"), date ("2024-01-15"), ISO 8601, or Unix timestamp. |
| `until` | string | ❌ | End timestamp for time window. Same formats as `since`. Can be used alone or with `since` for ranges. |
| `limit` | number | ❌ | Maximum number of messages to retrieve (1-200, default: 50). |

### Response Structure

```typescript
interface ChannelActivity {
  channel_id: string;
  channel_name: string;
  message_count: number;
  time_range: {
    start: string;  // ISO timestamp
    end: string;    // ISO timestamp
  };
  messages: ActivityMessage[];
  active_users: string[];
  thread_count: number;
}

interface ActivityMessage {
  timestamp: string;
  user: {
    id: string;
    name: string;
  };
  text: string;
  thread_id?: string;
  is_thread_start?: boolean;
  permalink: string;
}
```

### Activity Analysis Features

#### Thread Detection
- Identifies thread-starting messages
- Links replies to parent threads
- Tracks thread participation
- Shows thread branching

#### Temporal Patterns
- Message frequency over time
- Peak activity periods
- User activity distribution
- Response time analysis

### Monitoring Workflows

```javascript
// Daily standup summary
const activity = await getChannelActivity({
  channelId: "C123STANDUP",
  since: "24h"
})
const standupMessages = filterStandupFormat(activity.messages)

// Incident monitoring
const incidents = await getChannelActivity({
  channelId: "C456INCIDENTS",
  since: "1h"  // Last hour only
})
const newIncidents = incidents.messages.filter(m => m.text.includes("INCIDENT"))

// Team engagement analysis
const engineering = await getChannelActivity({
  channelId: "C789ENGINEERING",
  since: "7d",  // Last week
  limit: 200
})
const userEngagement = calculateEngagementMetrics(engineering)
```

---

## 👤 `userLookup` - User Resolution API

### Overview
Bidirectional user lookup service for resolving IDs to profiles or finding users by name.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ❌* | Slack user ID (e.g., "U123ABC456"). Use this OR name. |
| `name` | string | ❌* | User name, username, or partial match. Use this OR id. |

*One parameter required, but not both.

### Response Structure

```typescript
interface UserInfo {
  user_id: string;
  display_name: string;
  username: string;
  email?: string;
  title?: string;
  department?: string;
  team?: string;
  timezone?: string;
  status?: {
    text: string;
    emoji: string;
  };
  is_bot: boolean;
  is_admin: boolean;
  profile_image?: string;
}
```

### Lookup Strategies

#### ID → Profile Resolution
```javascript
// From search results
const user = await userLookup({ id: "U123ABC456" })
console.log(`User: ${user.display_name} (${user.email})`)
```

#### Name → ID Discovery
```javascript
// Find by full name
const alice = await userLookup({ name: "Alice Smith" })

// Find by username
const bob = await userLookup({ name: "bsmith" })

// Partial match
const matches = await userLookup({ name: "smi" })  // Returns all "Smith" users
```

### Advanced Features

#### Multiple Match Handling
When name search returns multiple users:
```javascript
const results = await userLookup({ name: "John" })
if (results.length > 1) {
  // Disambiguate by email, department, or team
  const engineering = results.filter(u => u.department === "Engineering")
}
```

#### Bot Detection
```javascript
const user = await userLookup({ id: userId })
if (user.is_bot) {
  // Skip bot messages in analysis
}
```

---

## 📍 `channelLookup` - Channel Resolution API

### Overview
Channel information service for ID/name resolution and metadata retrieval.

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | ❌* | Slack channel ID (e.g., "C0123ABC456"). Use this OR name. |
| `name` | string | ❌* | Channel name with or without #. Use this OR id. |

*One parameter required, but not both.

### Response Structure

```typescript
interface ChannelInfo {
  channel_id: string;
  name: string;
  purpose?: string;
  topic?: string;
  member_count: number;
  created: string;        // ISO timestamp
  creator: string;        // User ID
  is_archived: boolean;
  is_private: boolean;
  is_general: boolean;
  last_activity?: string; // ISO timestamp
  pinned_items?: number;
}
```

### Discovery Patterns

#### Channel Name Patterns
```javascript
// Team channels
const teams = await channelLookup({ name: "team" })  // Finds all *team* channels

// Project channels
const projects = await channelLookup({ name: "proj-" })  // Finds proj-* channels

// Support channels
const support = await channelLookup({ name: "support" })
```

#### Channel Validation
```javascript
const channel = await channelLookup({ name: "engineering" })
if (channel.is_archived) {
  console.log("Channel is archived")
}
if (channel.is_private) {
  console.log("Private channel - limited visibility")
}
```

---

## 🔄 Integration Patterns

### Complete Workflow Examples

#### 1. Comprehensive User Analysis
```javascript
async function analyzeUserActivity(userName) {
  // Step 1: Resolve user
  const user = await userLookup({ name: userName })

  // Step 2: Search for user's messages
  const messages = await search({
    query: user.display_name,
    limit: 100
  })

  // Step 3: Get full threads for top discussions
  const threads = await Promise.all(
    messages.slice(0, 5).map(m =>
      getThreadDetails({ threadId: m.thread_ts })
    )
  )

  // Step 4: Analyze channels of activity
  const channels = [...new Set(messages.map(m => m.channel_id))]
  const channelInfo = await Promise.all(
    channels.map(id => channelLookup({ id }))
  )

  return {
    user,
    messageCount: messages.length,
    topThreads: threads,
    activeChannels: channelInfo
  }
}
```

#### 2. Incident Response Monitoring
```javascript
async function monitorIncidents() {
  // Find incidents channel
  const channel = await channelLookup({ name: "incidents" })

  // Get recent activity
  const activity = await getChannelActivity({
    channelId: channel.channel_id,
    hours: 1
  })

  // Find new incident threads
  const incidents = activity.messages
    .filter(m => m.is_thread_start)
    .filter(m => m.text.match(/SEV-[123]|INCIDENT/))

  // Get full context for each incident
  const incidentDetails = await Promise.all(
    incidents.map(async (inc) => {
      const thread = await getThreadDetails({ threadId: inc.thread_id })
      const participants = await Promise.all(
        thread.participants.map(id => userLookup({ id }))
      )
      return { incident: inc, thread, responders: participants }
    })
  )

  return incidentDetails
}
```

#### 3. Knowledge Discovery System
```javascript
async function discoverKnowledge(topic) {
  // Semantic search for topic
  const threads = await search({
    query: topic,
    limit: 50
  })

  // Group by channel
  const byChannel = {}
  for (const thread of threads) {
    if (!byChannel[thread.channel_id]) {
      byChannel[thread.channel_id] = []
    }
    byChannel[thread.channel_id].push(thread)
  }

  // Get channel contexts
  const channelContexts = await Promise.all(
    Object.keys(byChannel).map(async (channelId) => {
      const info = await channelLookup({ id: channelId })
      return {
        channel: info,
        threads: byChannel[channelId],
        topExperts: await identifyExperts(byChannel[channelId])
      }
    })
  )

  return {
    topic,
    totalThreads: threads.length,
    channels: channelContexts,
    timeRange: getTimeRange(threads)
  }
}

async function identifyExperts(threads) {
  const userCounts = {}
  threads.forEach(t => {
    t.participants.forEach(userId => {
      userCounts[userId] = (userCounts[userId] || 0) + 1
    })
  })

  const topUsers = Object.entries(userCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([userId]) => userId)

  return Promise.all(topUsers.map(id => userLookup({ id })))
}
```

---

## 🎯 Best Practices

### Performance Optimization

#### Batch Operations
```javascript
// Good: Parallel lookups
const users = await Promise.all(
  userIds.map(id => userLookup({ id }))
)

// Bad: Sequential lookups
for (const id of userIds) {
  const user = await userLookup({ id })  // Slower
}
```

#### Result Caching
```javascript
const cache = new Map()

async function getCachedUser(id) {
  if (!cache.has(id)) {
    cache.set(id, await userLookup({ id }))
  }
  return cache.get(id)
}
```

#### Pagination Strategy
```javascript
async function getAllResults(query) {
  const results = []
  let offset = 0
  const limit = 100

  while (true) {
    const batch = await search({
      query,
      limit,
      // Note: Real pagination would need API support
    })
    results.push(...batch)
    if (batch.length < limit) break
    offset += limit
  }

  return results
}
```

### Error Handling

```javascript
async function safeSearch(params) {
  try {
    return await search(params)
  } catch (error) {
    if (error.message.includes("timeout")) {
      // Retry with smaller limit
      return await search({ ...params, limit: 10 })
    }
    if (error.message.includes("rate limit")) {
      // Wait and retry
      await sleep(1000)
      return await search(params)
    }
    throw error
  }
}
```

### Query Construction

#### Dynamic Query Building
```javascript
function buildSearchQuery(options) {
  const parts = []

  if (options.user) parts.push(options.user)
  if (options.topic) parts.push(options.topic)
  if (options.keywords) parts.push(...options.keywords)

  return parts.join(" ")
}

const query = buildSearchQuery({
  user: "alice",
  topic: "kubernetes",
  keywords: ["deployment", "production"]
})
// Result: "alice kubernetes deployment production"
```

#### Time Range Helpers
```javascript
function getDateRange(days) {
  const now = new Date()
  const after = new Date(now - days * 24 * 60 * 60 * 1000)
  return {
    after: after.toISOString().split('T')[0],
    before: now.toISOString().split('T')[0]
  }
}

// Last 7 days
const weekResults = await search({
  query: "updates",
  ...getDateRange(7)
})
```

---

## 📈 Analytics Patterns

### Message Frequency Analysis
```javascript
function analyzeMessageFrequency(messages) {
  const byHour = {}
  messages.forEach(msg => {
    const hour = new Date(msg.timestamp * 1000).getHours()
    byHour[hour] = (byHour[hour] || 0) + 1
  })
  return byHour
}
```

### Participation Metrics
```javascript
function calculateParticipation(threads) {
  const stats = {
    totalThreads: threads.length,
    totalMessages: threads.reduce((sum, t) => sum + t.message_count, 0),
    uniqueParticipants: new Set(threads.flatMap(t => t.participants)).size,
    avgMessagesPerThread: 0,
    avgParticipantsPerThread: 0
  }

  stats.avgMessagesPerThread = stats.totalMessages / stats.totalThreads
  stats.avgParticipantsPerThread = threads.reduce((sum, t) =>
    sum + t.participants.length, 0) / stats.totalThreads

  return stats
}
```

### Topic Trending
```javascript
async function findTrendingTopics(timeWindow = 24) {
  const recent = await search({
    query: "*",  // All messages
    limit: 100
  })

  // Extract topics (simplified - real implementation would use NLP)
  const topics = {}
  recent.forEach(thread => {
    const words = thread.preview_text.toLowerCase().split(/\s+/)
    words.forEach(word => {
      if (word.length > 4) {  // Skip short words
        topics[word] = (topics[word] || 0) + 1
      }
    })
  })

  return Object.entries(topics)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
}
```

---

## 🔐 Security Considerations

### Authentication
- All requests require Cloudflare Access headers
- API keys stored in environment variables
- Token rotation handled automatically

### Data Privacy
- Bot messages filtered (U08RZUVQSMA excluded)
- Private channels require appropriate permissions
- User email addresses may be redacted

### Rate Limiting
- Requests routed through Cloudflare AI Gateway
- Automatic retry with exponential backoff
- Circuit breaker for failed services

---

## 🚀 Performance Specifications

### Latency Targets
- Search: <500ms p95
- Thread Details: <200ms p95
- Channel Activity: <300ms p95
- User/Channel Lookup: <100ms p95

### Throughput
- 1000+ requests/second capability
- Cloudflare Workers auto-scaling
- Global edge network distribution

### Data Limits
- Search: 100 results maximum
- Thread Details: No message limit
- Channel Activity: 168 hours maximum
- Lookups: Single result per call

---

## 📚 Additional Resources

### Data Formats
- Timestamps: Unix seconds with microseconds (Slack format)
- Dates: ISO 8601 strings
- IDs: Alphanumeric with type prefix (U=user, C=channel)
- Permalinks: Direct Slack workspace URLs

### Error Codes
- 400: Invalid parameters
- 404: Resource not found
- 429: Rate limit exceeded
- 500: Internal server error
- 503: Service unavailable

### Support
- GitHub Issues: Report bugs and feature requests
- Slack Channel: #henchman-support
- Documentation: This file and README.md

---

*Last Updated: November 2024*
*Version: 2.0.0*