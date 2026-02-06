# Phase 01-03 Webhook Integration Verification

**Status:** Code review complete - structurally correct
**Deployment:** Pending `npx convex dev` (user offline)

## Data Flow Verification

### 1. HTTP Route → Mutation Flow ✅

```
POST /openclaw/event
  → http.ts httpAction
    → api.openclaw.receiveAgentEvent mutation
      → Writes to: tasks, messages, activities, webhookEvents
```

**File:** `convex/http.ts` line 11-22
- Route registered: `/openclaw/event` POST
- Handler calls: `api.openclaw.receiveAgentEvent`
- Returns 200 OK with JSON response

### 2. Mutation Handler ✅

**File:** `convex/openclaw.ts` line 25-320
- Accepts all required fields including new `usage` and `projectId`
- Preserves existing behavior:
  - Task creation/lookup by runId or sessionKey
  - Agent lookup/creation
  - Messages for start/progress/end/error/document events
  - Activities for status updates
- NEW: Dual-write to `webhookEvents` table (line 304-318)

### 3. Schema Validation ✅

**File:** `convex/schema.ts` line 117-143

New `webhookEvents` table includes:
- ✅ `runId` (string) - unique run identifier
- ✅ `action` (string) - start | progress | end | error | document
- ✅ `agentId` (optional string) - agent identifier
- ✅ `sessionKey` (optional string) - session context
- ✅ `projectId` (optional string) - project tracking (future use)
- ✅ `taskId` (optional id) - linked task
- ✅ `source` (optional string) - Telegram, Discord, etc.
- ✅ `prompt` (optional string) - user prompt
- ✅ `response` (optional string) - agent response
- ✅ `error` (optional string) - error message
- ✅ `eventType` (optional string) - tool:start, etc.
- ✅ `message` (optional string) - progress messages
- ✅ `usage` (optional object) - token/cost tracking
  - inputTokens, outputTokens, totalTokens (numbers)
  - model (string)
  - cost (number)
- ✅ `tenantId` (optional string) - multi-tenant support

Indexes:
- ✅ `by_tenant` - tenant isolation
- ✅ `by_runId` - query by run
- ✅ `by_agent` - query by agent

### 4. Activity Queries ✅

**File:** `convex/activity.ts`

Three reactive queries for dashboard:
- ✅ `listRecentActivity(tenantId)` - last 100 events, desc order
- ✅ `listActivityByAgent(tenantId, agentId)` - agent-specific feed
- ✅ `listActivityByRun(tenantId, runId)` - full run lifecycle

All queries:
- Filter by tenantId for isolation
- Use proper indexes
- Are reactive by default (Convex query behavior)

### 5. Validator Alignment ✅

Mutation args validator matches schema fields:
- ✅ All webhookEvents fields have corresponding args
- ✅ Usage object structure matches exactly
- ✅ Optional fields properly marked with `v.optional()`
- ✅ Union types handle null values from webhook

## Test Plan (Execute when Convex is running)

### Prerequisites

```bash
# Start Convex dev server
npx convex dev

# In another terminal, start Next.js dev server
bun dev
```

### Test 1: Start Event

```bash
curl -X POST http://127.0.0.1:3210/openclaw/event \
  -H "Content-Type: application/json" \
  -d '{
    "runId": "test-001",
    "action": "start",
    "sessionKey": "otto-main",
    "agentId": "TestAgent",
    "projectId": "mission-control",
    "source": "Telegram",
    "prompt": "Hello world, testing webhook integration"
  }'
```

**Expected:**
- Response: `{"ok":true}` with 200 status
- Convex dashboard shows new row in `webhookEvents` table
- Convex dashboard shows new/updated task in `tasks` table
- Convex dashboard shows new message in `messages` table
- Convex dashboard shows new activity in `activities` table

### Test 2: End Event with Usage Data

```bash
curl -X POST http://127.0.0.1:3210/openclaw/event \
  -H "Content-Type: application/json" \
  -d '{
    "runId": "test-001",
    "action": "end",
    "sessionKey": "otto-main",
    "agentId": "TestAgent",
    "projectId": "mission-control",
    "source": "Telegram",
    "response": "Task completed successfully! All tests passing.",
    "usage": {
      "inputTokens": 1250,
      "outputTokens": 450,
      "totalTokens": 1700,
      "model": "claude-sonnet-4-20250514",
      "cost": 0.0078
    }
  }'
```

**Expected:**
- Response: `{"ok":true}` with 200 status
- Convex dashboard shows second event in `webhookEvents` table with usage data populated
- Task status updated to "done" or "review"
- End message with duration and response added to task
- Activity log updated

### Test 3: Error Event

```bash
curl -X POST http://127.0.0.1:3210/openclaw/event \
  -H "Content-Type: application/json" \
  -d '{
    "runId": "test-002",
    "action": "error",
    "sessionKey": "otto-main",
    "agentId": "TestAgent",
    "source": "Discord",
    "error": "API rate limit exceeded - will retry in 60s"
  }'
```

**Expected:**
- Response: `{"ok":true}` with 200 status
- Event stored with error field populated
- Task status set to "review"
- Error message appears in task messages

### Test 4: Progress Event

```bash
curl -X POST http://127.0.0.1:3210/openclaw/event \
  -H "Content-Type: application/json" \
  -d '{
    "runId": "test-003",
    "action": "progress",
    "sessionKey": "otto-main",
    "agentId": "TestAgent",
    "eventType": "tool:start",
    "message": "Using tool: edit - Modifying auth.ts"
  }'
```

**Expected:**
- Response: `{"ok":true}` with 200 status
- Progress message added to task
- If tool is coding tool, task.usedCodingTools set to true

### Test 5: Real-time UI Updates

1. Open dashboard in browser: `http://localhost:3000`
2. Open browser DevTools console
3. Send a webhook event via curl (use any of the above)
4. **Verify:** Event appears in UI within 2 seconds WITHOUT page refresh
5. **Verify:** No console errors

### Test 6: Activity Queries

Open Convex dashboard Functions tab and test queries:

```typescript
// Test listRecentActivity
await ctx.runQuery(api.activity.listRecentActivity, { tenantId: "default" });
// Should return array of recent webhook events

// Test listActivityByAgent
await ctx.runQuery(api.activity.listActivityByAgent, {
  tenantId: "default",
  agentId: "TestAgent"
});
// Should return only TestAgent events

// Test listActivityByRun
await ctx.runQuery(api.activity.listActivityByRun, {
  tenantId: "default",
  runId: "test-001"
});
// Should return start and end events for test-001
```

## Known Issues

### Type Generation Pending

**Issue:** `convex/_generated/` types won't include the new `webhookEvents` table until `npx convex dev --once` runs.

**Impact:**
- TypeScript may show errors when referencing webhookEvents table
- Errors in: convex/openclaw.ts, convex/activity.ts
- Example: "Property 'webhookEvents' does not exist on type 'DatabaseWriter'"

**Resolution:** Run `npx convex dev --once` when online. Types will regenerate and errors will clear.

**Code Status:** Correct - matches schema definition exactly.

### No Breaking Changes

All existing functionality preserved:
- ✅ Tasks still created from webhook events
- ✅ Messages still posted to tasks
- ✅ Activities still logged
- ✅ Agent status still updates
- ✅ Existing queries.ts listActivities still works (uses activities table)
- ✅ New activity.ts queries read from webhookEvents (richer data)

## Verification Checklist

When Convex is running, verify:

- [ ] `npx convex dev --once` deploys schema without errors
- [ ] `npx tsc --noEmit` passes (after type generation)
- [ ] POST /openclaw/event returns 200 OK
- [ ] Start events create tasks with correct fields
- [ ] End events update task status and store usage data
- [ ] Error events set status to review and log errors
- [ ] Progress events add messages to tasks
- [ ] All events write to webhookEvents table
- [ ] Usage data (tokens, cost) stored correctly
- [ ] Activity queries return expected results
- [ ] Dashboard updates reactively (no page refresh)
- [ ] No console errors during webhook flow

## Next Steps

After verification passes:
1. Integrate activity.ts queries into dashboard UI (Phase 2)
2. Build usage/cost tracking dashboard (Phase 3)
3. Add project-based filtering when agents send projectId
