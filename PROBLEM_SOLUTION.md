# Problem and Solution

## The Problem

AI agents connected to MCP servers can become high-risk quickly when configuration is too broad.

Common mistakes include:

- Full filesystem access (`/`)
- Wildcard command execution (`*`)
- Remote endpoints without proper auth
- HTTP endpoints for sensitive traffic
- Missing audit logging and attribution

These mistakes are easy to ship because configs look simple but carry deep security implications.

## The Gap

Most teams do one of the following:

- Manual review (slow and inconsistent)
- Generic security tooling (not MCP-aware)
- Runtime monitoring (too late for prevention)

What is missing is a fast pre-deployment scanner that is MCP-aware and understandable by non-security stakeholders.

## MCP Shield

MCP Shield scans MCP and agent configurations before deployment and returns:

- A `0-100` risk score
- Severity counts (critical/high/medium/low/info)
- Plain-English findings
- Actionable fix guidance
- Exportable reports (JSON + Markdown)

## Why This Matters in a Demo

- Unsafe config can show `100/100` immediately.
- Safe config can show `0/100` with clear before/after improvement.
- Judges see both technical depth and business clarity in under 3 minutes.

## Target Users

- AI engineers building MCP workflows
- Platform and DevOps teams operating agent systems
- Security teams reviewing deployment risk

## Outcome

MCP Shield turns security review from "expert-only and slow" into "fast, visual, and actionable" for hackathon demos and early production adoption.
