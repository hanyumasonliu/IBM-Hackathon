# MCP Shield Hackathon MVP Plan (Current)

## Goal

Deliver a compelling, reliable security-scanning demo for MCP/agent configs in under 3 minutes.

## Scope Kept for MVP

- Rule-based scanner (10 implemented rules)
- Risk score (`0-100`) with severity breakdown
- Web dashboard with unsafe/safe built-in demos
- Before/after comparison
- JSON + Markdown report export
- MCP server wrapper for tool-based integration

## Current Repository Shape

```text
apps/
  web/
  mcp-server/
packages/
  scanner/
  report/
demo/
docs/
```

## Demo KPI Targets

- Unsafe demo: `100/100`
- Safe demo: `0/100`
- Full story: under 3 minutes

## Priorities

1. Keep detection and scoring behavior stable.
2. Keep UI clear and non-technical-friendly.
3. Keep docs accurate to current file paths and commands.
4. Avoid scope creep beyond demo-critical capabilities.

## Out of Scope for This Hackathon

- Runtime instrumentation
- Large-scale multi-user backend
- Complex policy DSL
- Full enterprise compliance automation
