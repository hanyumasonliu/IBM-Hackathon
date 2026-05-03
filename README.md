# MCP Shield

Security scanner for Model Context Protocol (MCP) configurations and AI agent tools.

Built as an IBM Bob hackathon project to make risky agent permissions easy to detect, explain, and fix.

## What It Does

- Scans MCP configs, agent tool definitions, and prompt text
- Scores risk from `0-100` with severity breakdowns
- Explains findings in plain English
- Generates guardrail policy recommendations
- Exports JSON and Markdown reports

## Current Demo Targets

- **Unsafe demo:** `100/100` (`CRITICAL`)
- **Safe demo:** `0/100` (`MINIMAL`)

## Project Structure

```text
IBM_Bob/
├── apps/
│   ├── web/           # React dashboard (Vite)
│   └── mcp-server/    # MCP STDIO server
├── packages/
│   ├── scanner/       # Core scanner engine and rules
│   └── report/        # Markdown report generator
├── demo/              # Demo configs and scripts (fake data only)
└── docs/              # Architecture and implementation docs
```

## Quick Start

```bash
npm install
npm run build
```

### Run Web Dashboard

```bash
cd apps/web
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

### Run Tests

```bash
cd packages/scanner
npm test
```

## 3-Minute Demo Flow

1. Load **Unsafe Demo** and run scan (`100/100`).
2. Open 1-2 critical findings and explain impact.
3. Load **Safe Demo** and run scan (`0/100`).
4. Show before/after improvement and export report.

Detailed script: [`demo/DEMO_SCRIPT.md`](demo/DEMO_SCRIPT.md)

## Key Packages

- [`packages/scanner`](packages/scanner): rule-based scanner, scoring, policy suggestions
- [`packages/report`](packages/report): stakeholder-friendly Markdown reports
- [`apps/mcp-server`](apps/mcp-server): MCP tools wrapping scanner/report capabilities

## Notes

- This is a hackathon MVP optimized for a fast, clear live demo.
- All demo credentials and domains are intentionally fake.
