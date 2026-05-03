# MCP Shield Web App

Frontend dashboard for scanning MCP and agent configurations in-browser.

## Highlights

- Two-panel workflow: input on left, results on right
- Built-in unsafe and safe demo payloads
- Risk score, severity cards, findings list, and detail panel
- Before/after comparison when scans change
- Guardrail policy preview with copy support
- Export JSON and Markdown reports

## Run Locally

```bash
npm install
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

## Build

```bash
npm run build
```

## Demo Expectations

- Unsafe demo should show `100/100` (`CRITICAL`)
- Safe demo should show `0/100` (`MINIMAL`)

## Tech

- React 18
- TypeScript
- Vite
- `@mcp-shield/scanner`
- `@mcp-shield/report`
