# Mission Control Research

## pbteja1998's Mission Control (Viral Thread)

**Source:** https://x.com/pbteja1998/status/2017662163540971756  
**Stats:** 7.7K bookmarks, 3.4M views

### Architecture
- 10 OpenClaw agents working together like a real team
- Led by "Jarvis" (main agent) who delegates and spawns other agents
- Built with React + Convex for the dashboard
- Named agents (Hawkeye, etc.) each with specializations

### How it works
- Agents create tasks autonomously
- Agents claim tasks themselves
- They talk, debate, review each other's work
- Runs 24/7 doing content creation, revenue analysis, etc.

### Key Quote
> "I need 100 humans to actually read, review and implement everything these AI agents are producing... we as mere humans cannot keep up with the volume of work AI can do."

---

## Open Source Implementation

**Repo:** https://github.com/manish-raana/openclaw-mission-control

### Tech Stack
- Backend: Convex (Real-time Database, Functions, Auth)
- Frontend: React with Vite
- Styling: Tailwind CSS

### Features
- 🚀 Real-time Synchronization
- 🤖 Agent Oversight with live counts
- 📦 Mission Queue (kanban: Inbox → Assigned → In Progress → Review → Done)
- 🧭 Task Detail Panel
- 💬 Comments & Activity feed
- 🔗 OpenClaw Integration via webhooks

### OpenClaw Integration

Webhook endpoint: `POST /api/openclaw/event`

Payload:
```json
{
  "runId": "unique-run-id",
  "action": "start" | "end" | "error" | "progress",
  "sessionKey": "session-key",
  "prompt": "user prompt text",
  "source": "Telegram",
  "response": "agent response",
  "error": "error message"
}
```

### Setup
1. Copy hook to `~/.openclaw/hooks/mission-control/`
2. Set `MISSION_CONTROL_URL` env var or in config
3. Restart OpenClaw gateway

---

## GitHub Blog: Orchestrating Agents

**Source:** https://github.blog/ai-and-ml/github-copilot/how-to-orchestrate-agents-using-mission-control/

### Key Patterns

**Parallel vs Sequential:**
- Use sequential when tasks have dependencies or exploring unfamiliar territory
- Use parallel for research, analysis, docs, security reviews, different modules

**Writing good prompts:**
- Be specific with context
- Include screenshots, code snippets, links
- Bad: "Fix the authentication bug"
- Good: "Users report 'Invalid token' errors after 30 minutes. JWT tokens configured with 1-hour expiration in auth.config.js. Investigate why tokens expire early..."

**Steering agents:**
- Bad: "This doesn't look right"
- Good: "Don't modify database.js—that file is shared. Add the config in api/config/db-pool.js instead."

**Reading the signals (when to intervene):**
- Failing tests/fetches
- Unexpected files being created
- Scope creep beyond request
- Misunderstanding intent
- Circular behavior (same failing approach)

**Review tips:**
- Session logs reveal reasoning errors before they become PRs
- Ask agent to review its own work ("What edge cases am I missing?")
- Batch similar reviews together
