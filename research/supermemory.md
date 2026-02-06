# Supermemory Research

**Website:** https://supermemory.ai  
**OpenClaw Plugin:** https://github.com/supermemoryai/openclaw-supermemory  
**Docs:** https://supermemory.ai/docs/integrations/openclaw

## What It Is

Cloud-based memory layer for AI agents. Handles:
- **Extraction** — pulls facts/preferences from conversations
- **Deduplication** — doesn't store the same thing twice
- **Profile building** — maintains persistent "user profile"
- **Semantic search** — finds relevant memories by meaning

## Installation

```bash
openclaw plugins install @supermemory/openclaw-supermemory
export SUPERMEMORY_OPENCLAW_API_KEY="sm_..."
openclaw gateway restart
```

## How It Works

**Zero-config after setup:**

1. **Auto-Recall** — Before every AI turn, queries Supermemory and injects relevant memories + user profile into context

2. **Auto-Capture** — After every AI turn, sends the exchange for extraction and storage

## Configuration Options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| autoRecall | boolean | true | Inject relevant memories before every AI turn |
| autoCapture | boolean | true | Store conversation content after every turn |
| maxRecallResults | number | 10 | Max memories injected into context per turn |
| profileFrequency | number | 50 | Inject full user profile every N turns |
| captureMode | string | "all" | "all" filters noise, "everything" captures all |
| debug | boolean | false | Verbose debug logs |

## AI Tools

The AI can use these autonomously:

| Tool | Description |
|------|-------------|
| `supermemory_store` | Save to long-term memory |
| `supermemory_search` | Search memories with similarity scores |
| `supermemory_forget` | Delete a memory |
| `supermemory_profile` | View user profile (facts + context) |

## Slash Commands

- `/remember <text>` — Manually save to memory
- `/recall <query>` — Search memories

## CLI Commands

```bash
openclaw supermemory search <query>  # Search memories
openclaw supermemory profile         # View user profile
openclaw supermemory wipe            # Delete all (destructive)
```

## Pricing

| Plan | Price | Tokens/mo | Searches/mo |
|------|-------|-----------|-------------|
| Free | $0 | 1M | 10K |
| **Pro** | **$19** | 3M | 100K |
| Scale | $399 | 80M | 20M |

**Overages:** $0.01/1K tokens, $0.10/1K searches

**Startup program:** $1K in Pro credits for 6 months (apply via email)
