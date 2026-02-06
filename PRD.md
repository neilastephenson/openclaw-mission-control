# Otto Infrastructure v2 — PRD

**Author:** Neil Stephenson + Otto  
**Date:** 2026-02-06  
**Status:** Draft  

---

## 1. Overview

### 1.1 Problem Statement

The current Otto setup has three core pain points:

1. **Memory gaps** — Otto forgets things he should know. Memory relies on manual markdown files that require explicit "write this down" moments. Context slips through the cracks.

2. **No holistic visibility** — There's no dashboard showing what agents are doing, what tasks are in progress, or project status. It's a black box.

3. **Manual orchestration** — Every agent task requires human initiation and coordination. No autonomous task creation, delegation, or cross-agent collaboration.

### 1.2 Vision

A multi-agent system where:
- **Memory is automatic** — Every meaningful conversation is captured, extracted, and recallable without explicit commands
- **Everything is visible** — Real-time dashboard showing all agents, tasks, projects, and activity
- **Agents can self-organize** — Spawn sub-agents, create tasks, coordinate work with minimal human intervention

### 1.3 Users

- **Primary:** Neil Stephenson (personal use)
- **Future:** Potentially open-sourced or offered as a setup service for clients

### 1.4 Success Criteria

- Otto remembers relevant context without being told to
- Neil can see at a glance what all agents are working on
- Agents can spawn and coordinate without asking permission
- Projects and tasks update in real-time as work happens
- System is portable/reproducible for future users

---

## 2. Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Mission Control Dashboard                    │
│         (Convex + React — real-time project/task/agent view)    │
└─────────────────────────────────────────────────────────────────┘
                              ↑ webhooks
┌─────────────────────────────────────────────────────────────────┐
│                        OpenClaw Gateway                          │
│                    (existing infrastructure)                     │
└─────────────────────────────────────────────────────────────────┘
        ↓                    ↓                      ↓
┌──────────────┐    ┌──────────────┐      ┌──────────────┐
│    Otto      │    │  Dev Agent   │      │ Agent N...   │
│   (main)     │←──→│  (builder)   │←────→│ (expandable) │
│              │    │              │      │              │
│ Supermemory  │    │ Supermemory  │      │ Supermemory  │
│   plugin     │    │   plugin     │      │   plugin     │
└──────────────┘    └──────────────┘      └──────────────┘
        ↓                    ↓                      ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Supermemory Cloud                             │
│     (shared memory layer — extraction, dedup, profiles)         │
└─────────────────────────────────────────────────────────────────┘
```

### 2.1 Components

| Component | Purpose | Technology |
|-----------|---------|------------|
| **Mission Control** | Real-time dashboard for projects, tasks, agents | Convex + React |
| **Supermemory** | Automatic memory capture and recall | Cloud service ($19/mo) |
| **Otto (main agent)** | Primary interface, orchestrator | OpenClaw (existing) |
| **Dev Agent** | Dedicated builder for GSD tasks | OpenClaw (new workspace) |
| **Future agents** | Specialized roles (research, content, etc.) | OpenClaw (expandable) |

---

## 3. Features

### 3.1 Automatic Memory (Supermemory Integration)

**Requirement:** Memory should be automatic. No "remember this" commands needed.

| Feature | Description |
|---------|-------------|
| Auto-capture | Every conversation automatically extracted for facts, preferences, decisions |
| Auto-recall | Relevant memories injected before each AI turn |
| Profile building | Persistent user profile (Neil's preferences, context, history) |
| Cross-channel | Same memory across Telegram, WhatsApp, Discord, etc. |
| Cross-agent | All agents share the same memory namespace |

**Configuration:**
```json
{
  "autoRecall": true,
  "autoCapture": true,
  "captureMode": "all",
  "maxRecallResults": 10,
  "profileFrequency": 50
}
```

**Smart context saving rules:**
- Decisions and their reasoning
- Project updates and status changes
- User preferences expressed
- Key facts about people, dates, commitments
- Task outcomes and learnings

### 3.2 Mission Control Dashboard

**Requirement:** Real-time visibility into all agent activity, projects, and tasks.

#### 3.2.1 Projects View
| Field | Description |
|-------|-------------|
| Name | Project name |
| Status | Active / Paused / Complete |
| Agents | Which agents are working on it |
| Tasks | Linked tasks with status |
| Last activity | Timestamp of most recent update |
| Notes | Auto-updated from conversations |

**Projects auto-update when:**
- Discussed in any conversation
- Tasks are created/completed
- Agents report progress

#### 3.2.2 Tasks View (Kanban)
| Column | Description |
|--------|-------------|
| Inbox | New tasks, unassigned |
| Assigned | Claimed by an agent |
| In Progress | Actively being worked |
| Review | Needs human review |
| Done | Completed |

**Task metadata:**
- Title, description
- Assigned agent
- Parent project
- Created/updated timestamps
- Duration tracking
- Source (which channel/conversation created it)

#### 3.2.3 Agents View
| Field | Description |
|-------|-------------|
| Name | Agent identifier |
| Status | Online / Busy / Offline |
| Current task | What they're working on |
| Recent activity | Last N actions |
| Session info | Uptime, token usage |

#### 3.2.4 Activity Feed
- Real-time stream of all events
- Filterable by: agent, project, task, event type
- Event types: task created, task status change, agent spawned, memory saved, message sent

### 3.3 Multi-Agent Orchestration

**Requirement:** 3-4 agents for now, expandable. Agents can spawn without asking.

#### 3.3.1 Agent Roster (Initial)

| Agent | Role | Workspace |
|-------|------|-----------|
| **Otto** | Main agent, orchestrator, human interface | `/Users/otto/clawd` |
| **Dev Agent** | GSD builds, coding tasks | `/Users/otto/dev-agent` |
| **Agent 3** | TBD (research? content?) | TBD |
| **Agent 4** | TBD | TBD |

#### 3.3.2 Agent Capabilities

| Capability | Description |
|------------|-------------|
| Spawn agents | Any agent can spawn a sub-agent for a task |
| Create tasks | Agents can create tasks in Mission Control |
| Claim tasks | Agents can self-assign from Inbox |
| Update tasks | Auto-update status as work progresses |
| Cross-agent comms | Agents can message each other via sessions_send |

#### 3.3.3 Spawn Behavior
- **No permission required** — agents can spawn freely
- Spawned agents inherit Supermemory access
- Spawned agent activity logged to Mission Control
- Completion notifications sent to spawning agent

### 3.4 Usage Tracking

**Requirement:** No hard limits for now, but track everything.

| Metric | Tracked |
|--------|---------|
| Token usage | Per agent, per task, per day |
| Cost estimate | Based on model pricing |
| API calls | LLM calls, Supermemory calls |
| Task duration | Time from start to completion |

**Dashboard displays:**
- Daily/weekly/monthly rollups
- Per-agent breakdown
- Per-project breakdown
- Trend charts

### 3.5 Configurable Approvals

**Requirement:** Some operations should require human approval. Configurable.

| Operation | Default | Configurable |
|-----------|---------|--------------|
| Delete files | Require approval | Yes |
| External sends (email, tweet) | Require approval | Yes |
| Spawn agent | Auto-approve | Yes |
| Create task | Auto-approve | Yes |
| Modify system config | Require approval | Yes |

**Approval flow:**
1. Agent requests approval via Mission Control
2. Notification sent to Neil (Telegram)
3. Neil approves/denies in dashboard or via reply
4. Agent proceeds or aborts

---

## 4. Technical Implementation

### 4.1 Phase 1: Supermemory Integration
**Effort:** 30 minutes

1. Install Supermemory plugin on Otto
2. Configure API key
3. Test auto-capture and recall
4. Verify cross-channel memory

**Commands:**
```bash
openclaw plugins install @supermemory/openclaw-supermemory
export SUPERMEMORY_OPENCLAW_API_KEY="sm_..."
openclaw gateway restart
```

### 4.2 Phase 2: Mission Control Deployment
**Effort:** 2-3 hours

1. Fork/clone `manish-raana/openclaw-mission-control`
2. Create Convex project
3. Deploy to Convex
4. Configure OpenClaw webhook
5. Seed initial data (agents, projects)

**Customizations needed:**
- Add Projects view (stock repo has tasks only)
- Add usage tracking display
- Add approval workflow UI

### 4.3 Phase 3: Mission Control Customization
**Effort:** GSD build (1-2 days)

1. Projects data model and CRUD
2. Projects ↔ Tasks relationships
3. Auto-update projects from conversations (webhook enhancement)
4. Usage tracking data model and display
5. Approval workflow backend + UI

### 4.4 Phase 4: Dev Agent Setup
**Effort:** 1-2 hours

1. Create `/Users/otto/dev-agent` workspace
2. Configure as separate OpenClaw agent
3. Install Supermemory plugin (same API key = shared memory)
4. Configure webhook to Mission Control
5. Set up GSD in workspace

### 4.5 Phase 5: Orchestration Skill
**Effort:** GSD build (1 day)

1. Skill for agents to create/update tasks via Mission Control API
2. Skill for agents to spawn other agents
3. Auto-log all activity to Mission Control
4. Configurable approval rules

---

## 5. Data Models

### 5.1 Project
```typescript
interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'complete';
  agents: string[]; // agent IDs working on this
  createdAt: number;
  updatedAt: number;
  notes: string; // auto-updated from conversations
  metadata: Record<string, any>;
}
```

### 5.2 Task
```typescript
interface Task {
  id: string;
  projectId?: string;
  title: string;
  description: string;
  status: 'inbox' | 'assigned' | 'in_progress' | 'review' | 'done';
  assignedAgent?: string;
  createdBy: string; // agent or 'human'
  source: string; // channel/conversation that created it
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  durationMs?: number;
  metadata: Record<string, any>;
}
```

### 5.3 Agent
```typescript
interface Agent {
  id: string;
  name: string;
  role: string;
  workspace: string;
  status: 'online' | 'busy' | 'offline';
  currentTaskId?: string;
  lastActivity: number;
  createdAt: number;
}
```

### 5.4 Activity
```typescript
interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'agent_spawned' | 'memory_saved' | 'message_sent' | 'approval_requested' | 'approval_resolved';
  agentId: string;
  projectId?: string;
  taskId?: string;
  description: string;
  timestamp: number;
  metadata: Record<string, any>;
}
```

### 5.5 UsageRecord
```typescript
interface UsageRecord {
  id: string;
  agentId: string;
  taskId?: string;
  projectId?: string;
  date: string; // YYYY-MM-DD
  tokensInput: number;
  tokensOutput: number;
  estimatedCost: number;
  apiCalls: number;
}
```

---

## 6. Integration Points

### 6.1 OpenClaw → Mission Control Webhook

**Endpoint:** `POST /api/openclaw/event`

**Events:**
```typescript
type OpenClawEvent = {
  runId: string;
  action: 'start' | 'progress' | 'end' | 'error';
  agentId: string;
  sessionKey: string;
  prompt?: string;
  response?: string;
  source?: string; // telegram, whatsapp, etc.
  error?: string;
  usage?: {
    tokensInput: number;
    tokensOutput: number;
  };
};
```

### 6.2 Supermemory → Mission Control

When memory is saved that mentions a project/task, update Mission Control:
- Extract project/task references from memory
- Update `notes` field on Project
- Create Activity record

### 6.3 Agent → Mission Control API

Agents can call Mission Control directly:
```typescript
// Create task
POST /api/tasks { title, description, projectId }

// Update task status
PATCH /api/tasks/:id { status }

// Log activity
POST /api/activity { type, description, ... }

// Request approval
POST /api/approvals { operation, details }
```

---

## 7. Open Questions

1. **Project auto-detection:** How smart should the system be about detecting project references in conversations? Keyword matching? LLM classification?

2. **Agent specialization:** What should agents 3 and 4 specialize in? Research? Content? Marketing? Leave flexible for now?

3. **Notification preferences:** How/when should Neil be notified? All activity? Only approvals? Configurable?

4. **Backup/export:** Should there be a way to export all data from Supermemory + Mission Control for portability?

---

## 8. Out of Scope (v2)

- Hard cost limits / automatic shutoff
- Public-facing API for clients
- Mobile app
- Self-hosted Supermemory alternative
- Multi-user support

---

## 9. Timeline

| Phase | Description | Effort | Dependencies |
|-------|-------------|--------|--------------|
| 1 | Supermemory integration | 30 min | None |
| 2 | Mission Control deployment (stock) | 2-3 hours | Phase 1 |
| 3 | Mission Control customization | 1-2 days (GSD) | Phase 2 |
| 4 | Dev Agent setup | 1-2 hours | Phase 1 |
| 5 | Orchestration skill | 1 day (GSD) | Phase 3, 4 |

**Total estimated effort:** 3-4 days

---

## 10. Appendix

### A. Research Sources

- **Mission Control (pbteja1998):** 10-agent squad architecture, autonomous task creation
- **openclaw-mission-control (manish-raana):** Open source Convex + React dashboard
- **CoWork OS:** Security patterns, guardrails, approval workflows
- **Supermemory:** Cloud memory API with OpenClaw plugin

### B. Existing Infrastructure

- **Otto workspace:** `/Users/otto/clawd`
- **QMD collections:** clawd-memory, clawd-workspace, clawd-notes, bookmarks
- **Current memory:** MEMORY.md + memory/*.md (will become backup/audit trail)
- **Compound engineering:** Nightly review cron (keep running)
