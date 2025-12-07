# Test Scenarios

Real-world user prompts for validating the Minion agent's product discovery and property management capabilities.

## Running Tests

### Integration Tests

```bash
# Start the agent
pnpm dev

# Run all tests
pnpm test:integration
```

### Manual Testing

```bash
# Chat endpoint
curl -X POST http://localhost:6977/agents/minion-agent/default/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "YOUR_PROMPT_HERE"}'
```

---

## Scenario 1: Intelligent Product Discovery

**Goal**: Natural language product search with multiple constraints

### User Prompt

> I need a quiet dishwasher for a rental property. Budget under $800, needs to be compact size for a small kitchen. If there's one with a third rack for utensils, even better.

### Expected Behavior

- Uses `products` MCP server for semantic search
- Filters by: category (Dishwashers), noise level, price, dimensions
- Ranks results by relevance to "quiet" and "compact"
- Mentions third rack feature if available

### Key Tool Calls

- `products_filterProducts` or `products_describeProducts`

---

## Scenario 2: Emergency HVAC Replacement

**Goal**: Urgent request prioritizing availability and speed

### User Prompt

> Emergency! Tenant's AC just died and it's 92 degrees in the house. They have a toddler. Need replacement AC units that are in stock and can be delivered TODAY to the Berkeley, CA area. Don't care about brand, just need cooling ASAP.

### Expected Behavior

- Prioritizes in-stock items
- Checks distribution network for Berkeley CA coverage
- Filters for immediate availability
- May check fulfillment calendar for same-day delivery
- Focuses on portable/window AC for fast installation

### Key Tool Calls

- `products_filterProducts` (AC/cooling category, in-stock)
- `sibi-basics_distribution-network` (Berkeley CA)
- `sibi-basics_get-fulfillment-calendar` (delivery dates)

---

## Scenario 3: Supply Chain Intelligence

**Goal**: SKU lookup with fallback to alternatives

### User Prompt

> Customer is asking specifically for the Whirlpool WDF520PADM dishwasher for a property in Charlotte, NC. Can you check if it's available? If not, what similar quiet dishwashers do we have in that area?

### Expected Behavior

- First searches for specific SKU
- If unavailable, finds similar products (quiet dishwashers)
- Checks Charlotte NC distribution coverage
- Provides alternatives with comparison

### Key Tool Calls

- `products_getProductBySku` (WDF520PADM)
- `sibi-basics_distribution-network` (Charlotte NC)
- `products_filterProducts` (alternatives)

---

## Scenario 4: Query Evolution

**Goal**: Handle vague requests, ask clarifying context

### User Prompt

> Hey, property manager here. One of our tenants is complaining about the heat. What are our options for cooling?

### Expected Behavior

- Recognizes vague request
- Provides range of cooling options (central AC, mini-splits, portable, window)
- May ask for property details (size, existing HVAC)
- Offers to narrow down based on budget/urgency

### Key Tool Calls

- `products_describeProducts` (cooling category overview)
- Possibly `sibi-basics_property-search` if property context provided

---

## Scenario 5: Product Recommendations

**Goal**: Complete system component identification

### User Prompt

> Planning an HVAC replacement for a 2000 sq ft single family home. Currently has a gas furnace and central AC. Besides the main units, what other parts do I need to order? Thinking about evaporator coils, thermostats, line sets, etc.

### Expected Behavior

- Identifies complete HVAC system components
- Lists: furnace, AC condenser, evaporator coil, thermostat, line set, refrigerant
- May suggest matching components for compatibility
- Provides sizing guidance for 2000 sq ft

### Key Tool Calls

- `products_filterProducts` (HVAC components)
- `products_describeProducts` (system requirements)
- `sibi-basics_product-recommendations` (related parts)

---

## Test Validation Checklist

For each scenario, verify:

- [ ] Agent makes at least one tool call
- [ ] Response addresses the user's specific request
- [ ] Response length is substantial (>50 characters)
- [ ] Tool calls match expected MCP servers
- [ ] No errors in response

## Automated Test Coverage

The integration tests in `scripts/test/integration.test.ts` cover these scenarios:

| Scenario | Test Name |
|----------|-----------|
| Intelligent Product Discovery | `finds quiet dishwashers with natural language` |
| Emergency HVAC Replacement | `handles emergency AC replacement request` |
| Supply Chain Intelligence | `checks availability and finds alternatives` |
| Query Evolution | `handles vague cooling request` |
| Product Recommendations | `identifies complete HVAC system components` |
