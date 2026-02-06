# Roadmap: Otto Mission Control

## Overview

Transform the forked openclaw-mission-control into Neil's real-time agent dashboard. Start by deploying the stock version, then layer in projects, tasks, usage tracking, and approval workflows. Each phase delivers complete, verifiable capabilities that Neil can use immediately.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Fork repo, deploy stock version, add basic layout and OpenClaw integration
- [ ] **Phase 2: Activity & Projects** - Real-time activity feed and project kanban
- [ ] **Phase 3: Tasks & Usage** - Task management and cost tracking
- [ ] **Phase 4: Approvals & API** - Approval workflow with Telegram integration and agent APIs

## Phase Details

### Phase 1: Foundation
**Goal**: Deploy working dashboard with stock UI and OpenClaw webhook integration
**Depends on**: Nothing (first phase)
**Requirements**: LAYO-01, LAYO-02, LAYO-03, LAYO-04, LAYO-05, INTG-01, INTG-02, INTG-03
**Success Criteria** (what must be TRUE):
  1. Dashboard deployed at production URL with stock openclaw-mission-control UI visible
  2. Left sidebar displays agent list with clickable filtering
  3. Top navigation shows Activity/Projects/Tasks/Usage/Approvals tabs
  4. Header bar displays quick stats (agent count, approval count, cost estimate)
  5. OpenClaw webhook receives and parses events in Convex backend
  6. Real-time dashboard updates when webhook events arrive
**Plans**: 3 plans

Plans:
- [ ] 01-01-PLAN.md — Fork stock repo, set up Convex, deploy to Vercel (DEFERRED: awaiting Convex auth)
- [x] 01-02-PLAN.md — Customize layout: agent sidebar, tab navigation, header stats
- [x] 01-03-PLAN.md — Enhance webhook integration: parse usage data, verify real-time pipeline

### Phase 2: Activity & Projects
**Goal**: Neil can see real-time agent activity and manage projects visually
**Depends on**: Phase 1
**Requirements**: ACTV-01, ACTV-02, ACTV-03, PROJ-01, PROJ-02, PROJ-03, PROJ-04, PROJ-05
**Success Criteria** (what must be TRUE):
  1. Activity tab shows live stream of all agent events with timestamp, agent name, action type, and context
  2. Activity feed filters by agent, project, task, and event type
  3. Projects tab displays kanban board with project cards showing status, agents, and progress
  4. Neil can create, edit, and archive projects from the UI
  5. Clicking a project card expands to show linked tasks and recent activity
**Plans**: TBD

Plans:
- [ ] 02-01: TBD
- [ ] 02-02: TBD

### Phase 3: Tasks & Usage
**Goal**: Neil can track cross-project tasks and monitor agent costs
**Depends on**: Phase 2
**Requirements**: TASK-01, TASK-02, TASK-03, TASK-04, USAG-01, USAG-02, USAG-03, USAG-04, USAG-05
**Success Criteria** (what must be TRUE):
  1. Tasks tab shows standalone kanban board with five columns (Inbox → Assigned → In Progress → Review → Done)
  2. Tasks display metadata (title, description, assigned agent, parent project, timestamps, source channel)
  3. Neil can drag tasks between columns to update status
  4. Usage tab displays token usage charts filterable by agent and model
  5. Cost estimates show with daily/weekly/monthly toggle
  6. Per-agent usage breakdown table and recent expensive operations list visible
**Plans**: TBD

Plans:
- [ ] 03-01: TBD
- [ ] 03-02: TBD

### Phase 4: Approvals & API
**Goal**: Neil can approve/deny agent actions from dashboard or Telegram, agents can interact via REST API
**Depends on**: Phase 3
**Requirements**: APPR-01, APPR-02, APPR-03, APPR-04, APPR-05, INTG-04, INTG-05
**Success Criteria** (what must be TRUE):
  1. Approvals tab displays pending queue with action description, requesting agent, and flagged reason
  2. Neil can approve/deny each item with inline buttons
  3. Approval rules configurable per operation type (delete files, external sends, spawn agent, modify config)
  4. Telegram notification sent when approval requested
  5. Neil can approve/deny via Telegram reply and see result reflected in dashboard
  6. Agents can create/update tasks via REST API endpoint
  7. Agents can request approvals via REST API endpoint
**Plans**: TBD

Plans:
- [ ] 04-01: TBD
- [ ] 04-02: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 2/3 | In progress (01-01 deferred) | - |
| 2. Activity & Projects | 0/2 | Not started | - |
| 3. Tasks & Usage | 0/2 | Not started | - |
| 4. Approvals & API | 0/2 | Not started | - |
