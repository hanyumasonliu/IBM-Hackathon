# MCP Shield Architecture

## Overview

MCP Shield is a monorepo with a browser-first scanner UX and shared TypeScript packages.

## Repository Layout

```text
apps/
  web/            # React UI for scanning and reporting
  mcp-server/     # MCP STDIO server exposing scan/report tools
packages/
  scanner/        # Detection rules + scoring engine
  report/         # Markdown report generation
demo/             # Unsafe/safe demo inputs
docs/             # Technical and operational docs
```

## Runtime Model

### Web App (`apps/web`)

- Runs scanner directly in the browser via `@mcp-shield/scanner`
- No required backend for core demo flow
- Presents:
  - risk score
  - severity counts
  - finding details
  - policy section (when relevant)
  - export actions

### Scanner Package (`packages/scanner`)

- Parses input (`MCP config`, `agent tools`, or prompt text)
- Applies rule set
- Aggregates severity counts
- Computes risk score
- Returns normalized `ScanResult`

### Report Package (`packages/report`)

- Converts `ScanResult` into Markdown report
- Supports before/after comparison sections

### MCP Server (`apps/mcp-server`)

- Exposes scanner/report capabilities as MCP tools over STDIO
- Intended for integration with AI assistants

## Data Flow

```text
Input JSON/Text -> scanner.scan() -> findings + score -> UI render/export
```

## Scoring Model

- critical: 25
- high: 15
- medium: 8
- low: 3
- info: 1

Total score is capped at 100.

## Demo Baseline

- Unsafe sample is intentionally configured for `100/100`.
- Safe sample is intentionally configured for `0/100`.
