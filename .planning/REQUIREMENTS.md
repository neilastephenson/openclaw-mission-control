# Requirements: Otto Mission Control

**Defined:** 2026-02-06
**Core Value:** Real-time visibility into all agent activity — Neil can see at a glance what every agent is working on, catch problems, and approve actions without context-switching.

## v1 Requirements

### Layout & Navigation

- [ ] **LAYO-01**: Left sidebar with agent list showing live status indicators (active/idle/error)
- [ ] **LAYO-02**: Click agent in sidebar to filter all views to that agent's activity
- [ ] **LAYO-03**: Top tab navigation: Activity | Projects | Tasks | Usage | Approvals
- [ ] **LAYO-04**: Header bar with quick stats (total agents, pending approvals count, today's cost estimate)
- [ ] **LAYO-05**: Settings page accessible from header gear icon

### Activity Feed

- [ ] **ACTV-01**: Real-time stream of all agent events (messages sent, tools called, status changes, approvals)
- [ ] **ACTV-02**: Each entry shows timestamp, agent name, action type, and brief context
- [ ] **ACTV-03**: Filterable by agent, project, task, and event type

### Projects

- [ ] **PROJ-01**: Kanban-style project board with cards showing name, status, assigned agents, last activity, progress indicator
- [ ] **PROJ-02**: Project CRUD — create, edit, archive projects
- [ ] **PROJ-03**: Link/unlink tasks to projects
- [ ] **PROJ-04**: Click project card to expand and see linked tasks and recent activity
- [ ] **PROJ-05**: Project status tracking (active/paused/complete)

### Tasks

- [ ] **TASK-01**: Standalone cross-project kanban board (Inbox → Assigned → In Progress → Review → Done)
- [ ] **TASK-02**: Task metadata: title, description, assigned agent, parent project, created/updated timestamps, source channel
- [ ] **TASK-03**: Tasks also visible within expanded project cards
- [ ] **TASK-04**: Drag-and-drop status changes on kanban board

### Usage Tracking

- [ ] **USAG-01**: Token usage over time charts, filterable by agent and model
- [ ] **USAG-02**: Cost estimates displayed with daily/weekly/monthly toggle
- [ ] **USAG-03**: Per-agent usage breakdown table
- [ ] **USAG-04**: Table of recent expensive operations
- [ ] **USAG-05**: Usage data collected from OpenClaw webhook payload (tokensInput, tokensOutput fields)

### Approvals

- [ ] **APPR-01**: Pending approval queue showing action description, requesting agent, and flagged reason
- [ ] **APPR-02**: Approve/deny buttons with inline action on each queue item
- [ ] **APPR-03**: Configurable approval rules per operation type (delete files, external sends, spawn agent, modify config)
- [ ] **APPR-04**: Telegram notification pushed when approval is requested
- [ ] **APPR-05**: Approve/deny via Telegram reply routed back to dashboard

### Integration

- [ ] **INTG-01**: OpenClaw webhook endpoint receives start/progress/end/error events from gateway
- [ ] **INTG-02**: Parse agent ID, task ID, project ID, and usage data from webhook payloads
- [ ] **INTG-03**: Real-time dashboard updates via Convex reactive subscriptions
- [ ] **INTG-04**: REST API for agents to create/update tasks in Mission Control
- [ ] **INTG-05**: REST API for agents to request approvals via Mission Control

## v2 Requirements

### Auto-Detection

- **AUTO-01**: LLM-based project reference detection from conversation content
- **AUTO-02**: Auto-create tasks from conversation mentions

### Advanced Usage

- **USAG-06**: Per-project cost breakdown
- **USAG-07**: Cost trend alerts (spending spikes)
- **USAG-08**: Hard cost limits with automatic shutoff

### Notifications

- **NOTF-01**: Configurable notification preferences (all activity vs approvals only)
- **NOTF-02**: Notification digest (daily summary)

### Multi-Agent

- **AGNT-01**: Agent-to-agent messaging visible in dashboard
- **AGNT-02**: Agent spawn tracking with parent-child relationships

## Out of Scope

| Feature | Reason |
|---------|--------|
| Supermemory integration | Separate phase — not part of dashboard v1 |
| Dev Agent workspace setup | Infrastructure task, not dashboard |
| Orchestration skills | Depends on dashboard API being stable first |
| Mobile app | Web dashboard sufficient for personal use |
| Multi-user support | Neil is the only user |
| Self-hosted memory | Cloud Supermemory is fine |
| Public-facing API | Personal use only |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| LAYO-01 | Phase 1 | Pending |
| LAYO-02 | Phase 1 | Pending |
| LAYO-03 | Phase 1 | Pending |
| LAYO-04 | Phase 1 | Pending |
| LAYO-05 | Phase 1 | Pending |
| INTG-01 | Phase 1 | Pending |
| INTG-02 | Phase 1 | Pending |
| INTG-03 | Phase 1 | Pending |
| ACTV-01 | Phase 2 | Pending |
| ACTV-02 | Phase 2 | Pending |
| ACTV-03 | Phase 2 | Pending |
| PROJ-01 | Phase 2 | Pending |
| PROJ-02 | Phase 2 | Pending |
| PROJ-03 | Phase 2 | Pending |
| PROJ-04 | Phase 2 | Pending |
| PROJ-05 | Phase 2 | Pending |
| TASK-01 | Phase 3 | Pending |
| TASK-02 | Phase 3 | Pending |
| TASK-03 | Phase 3 | Pending |
| TASK-04 | Phase 3 | Pending |
| USAG-01 | Phase 3 | Pending |
| USAG-02 | Phase 3 | Pending |
| USAG-03 | Phase 3 | Pending |
| USAG-04 | Phase 3 | Pending |
| USAG-05 | Phase 3 | Pending |
| APPR-01 | Phase 4 | Pending |
| APPR-02 | Phase 4 | Pending |
| APPR-03 | Phase 4 | Pending |
| APPR-04 | Phase 4 | Pending |
| APPR-05 | Phase 4 | Pending |
| INTG-04 | Phase 4 | Pending |
| INTG-05 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27
- Unmapped: 0

---
*Requirements defined: 2026-02-06*
*Last updated: 2026-02-06 after roadmap creation*
