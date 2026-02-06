# Otto Mission Control

## What This Is

A real-time dashboard for managing multi-agent AI infrastructure. Forked from manish-raana/openclaw-mission-control (Convex + React), customized with projects management, usage tracking, and approval workflows. Gives Neil a single screen to see what every agent is doing, what it costs, and what needs his attention.

## Core Value

Real-time visibility into all agent activity — Neil can see at a glance what every agent is working on, catch problems, and approve actions without context-switching.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Agent sidebar with live status indicators (active/idle/error), click-to-filter
- [ ] Activity feed — real-time stream of agent actions (messages, tool calls, approvals), filterable by agent/project/type
- [ ] Projects view — kanban-style board with project cards (name, status, assigned agents, last activity, progress), click-to-expand with linked tasks
- [ ] Tasks view — standalone cross-project kanban (Inbox → Assigned → In Progress → Review → Done), plus tasks visible within expanded project cards
- [ ] Project CRUD — create, edit, archive projects; link/unlink tasks to projects
- [ ] Project tagging — agents explicitly tag project ID in webhook payloads, dashboard routes events to correct project
- [ ] Usage tracking — token usage over time charts (by agent, by model), cost estimates (daily/weekly/monthly), table of expensive operations
- [ ] Approval workflows — pending queue with action description, requesting agent, reason; approve/deny buttons; configurable approval rules
- [ ] Telegram notifications — approval requests push to Neil via Telegram, can approve/deny via reply
- [ ] Header quick stats — total agents, pending approvals count, today's cost estimate
- [ ] Tab navigation — Activity | Projects | Tasks | Usage | Approvals
- [ ] OpenClaw webhook integration — receive events from gateway, parse agent/task/project data, update dashboard in real-time
- [ ] Settings page — configurable approval rules per operation type, notification preferences

### Out of Scope

- Supermemory integration — separate phase, not part of dashboard v1
- Dev Agent workspace setup — infrastructure task, not dashboard
- Orchestration skills (agent-to-agent comms) — depends on dashboard API being stable first
- Auto-detection of project references in conversations — agents tag explicitly for v1, LLM matching is v2
- Mobile app — web dashboard is sufficient for personal use
- Multi-user support — Neil is the only user
- Hard cost limits / automatic shutoff — track only for now
- Self-hosted Supermemory alternative — cloud service is fine

## Context

- **Starting point:** Fork of [manish-raana/openclaw-mission-control](https://github.com/manish-raana/openclaw-mission-control) which provides tasks kanban, agents view, activity feed, and OpenClaw webhook integration
- **Existing infrastructure:** Otto runs on OpenClaw with gateway live, Telegram integration working
- **Research done:** Evaluated pbteja1998's 10-agent architecture, CoWork OS security patterns, Supermemory cloud memory, Sage privacy-first approach (see `/research/` directory)
- **Stock repo tech:** Convex (real-time DB + functions + auth), React + Vite, Tailwind CSS
- **Webhook format:** POST to `/api/openclaw/event` with runId, action, sessionKey, prompt, response, source, usage fields

## Constraints

- **Tech stack**: Must build on Convex + React (stock repo's stack) — Convex provides real-time sync which is core to the value
- **Deployment**: Convex backend + Vercel frontend hosting
- **Starting point**: Fork manish-raana/openclaw-mission-control — extend, don't rewrite
- **Integration**: OpenClaw gateway is the event source — webhook is the integration point
- **Notifications**: Telegram is the notification channel (already working with Otto)
- **Single user**: Neil only — no auth complexity needed beyond basic Convex auth

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Fork manish-raana repo vs build from scratch | Stock repo has tasks kanban, agents, activity feed, webhook — saves significant time | — Pending |
| Convex + Vercel deployment | Convex provides real-time sync out of the box, Vercel pairs naturally | — Pending |
| Explicit project tagging (not auto-detection) | Deterministic, simple, reliable for v1 — auto-detection is a v2 optimization | — Pending |
| Dashboard-only v1 (no memory/orchestration) | Ship visibility layer first, then build automation on top of it | — Pending |
| Five-tab layout (Activity/Projects/Tasks/Usage/Approvals) | Matches mental model — each tab is a distinct concern with its own view | — Pending |

---
*Last updated: 2026-02-06 after initialization*
