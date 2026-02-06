# CoWork OS Research

**Repo:** https://github.com/CoWork-OS/CoWork-OS  
**Type:** OpenClaw competitor (Electron desktop app)

## Overview

"Operating System for personal AI assistants" — security-first approach with multi-channel, multi-provider support. macOS desktop app (cross-platform planned).

## Key Differentiators from OpenClaw

| Aspect | CoWork OS | OpenClaw |
|--------|-----------|----------|
| Architecture | Desktop app (Electron) | CLI + Gateway daemon |
| Security | Heavy focus (2350+ tests, ZeroLeaks verified) | Less documented |
| Model providers | 20+ explicitly listed | Any model (more flexible) |
| Enterprise connectors | 8 (Salesforce, Jira, HubSpot, Zendesk, ServiceNow, Linear, Asana, Okta) | Not stated |
| Cloud storage | 6 (Notion, Box, OneDrive, Google Workspace, Dropbox, SharePoint) | Not stated |
| Skills | 75+ bundled | Skills platform |
| MCP support | Yes | Not stated |
| Sandbox | macOS sandbox-exec or Docker | Not stated |

## Features Worth Stealing

### Configurable Guardrails

| Guardrail | Description | Default | Range |
|-----------|-------------|---------|-------|
| Token Budget | Total tokens per task | 100,000 | 1K - 10M |
| Cost Budget | Estimated cost (USD) per task | $1.00 (disabled) | $0.01 - $100 |
| Iteration Limit | LLM calls per task | 50 | 5 - 500 |
| Dangerous Command Blocking | Block shell commands matching patterns | Enabled | On/Off + custom |
| Auto-Approve Trusted Commands | Skip approval for safe commands | Disabled | On/Off + patterns |
| File Size Limit | Max file size agent can write | 50 MB | 1 - 500 MB |
| Domain Allowlist | Restrict browser to approved domains | Disabled | On/Off + domains |

### Security Architecture

| Layer | Protection |
|-------|------------|
| Channel Access | Pairing codes, allowlists, brute-force lockout (5 attempts, 15 min cooldown) |
| Context Policies | Per-context security modes (DM vs group), tool restrictions |
| Encrypted Storage | OS keychain + AES-256 fallback, SHA-256 integrity |
| Tool Execution | Risk-level categorization, context-aware isolation |
| Sandbox Isolation | Docker containers or macOS sandbox-exec |
| File Operations | Workspace boundaries, path traversal protection |
| Shell Commands | Dangerous command blocking, explicit approval |
| Browser Automation | Domain allowlist, configurable restrictions |
| Resource Limits | Token budgets, cost caps, iteration limits |

### Approval Workflows

Operations requiring user approval:
- File deletion
- Shell commands
- Bulk operations
- Destructive actions

### Per-Context Security Policies

| Context | Default Mode | Default Restrictions |
|---------|--------------|---------------------|
| DM | Pairing | No restrictions |
| Group | Pairing | Memory tools blocked |

## Voice Mode

| Feature | Description |
|---------|-------------|
| TTS | ElevenLabs (premium), OpenAI TTS, or local Web Speech API |
| STT | OpenAI Whisper |
| Voices | Multiple options (alloy, echo, fable, onyx, nova, shimmer) |

## Persistent Memory System

| Feature | Description |
|---------|-------------|
| Auto-Capture | Observations, decisions, errors during execution |
| Privacy Protection | Auto-detects sensitive patterns (API keys, passwords) |
| FTS5 Search | Full-text search with relevance ranking |
| LLM Compression | Summarizes for ~10x token efficiency |
| Progressive Retrieval | 3-layer: snippets → timeline → full details |

Privacy Modes:
- **Normal** — Auto-detect and mark sensitive data as private
- **Strict** — Mark all memories as private (local only)
- **Disabled** — No memory capture
