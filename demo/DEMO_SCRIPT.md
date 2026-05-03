# MCP Shield Demo Script (3 Minutes)

## Setup

1. Start web app:

```bash
cd apps/web
npm run dev
```

2. Open `http://127.0.0.1:3000`.

## Demo Flow

### 1) Problem (20-30s)

Say:
> "MCP configs are easy to misconfigure. One wildcard or root permission can expose everything."

Action:
- Click **Load Unsafe Demo**
- Click **Run Scan**

### 2) Unsafe Result (45-60s)

Point out:
- Risk score at `100/100` (`CRITICAL`)
- Critical findings count
- One finding detail: impact + recommendation

### 3) Safe Result (45-60s)

Action:
- Click **Load Safe Demo**
- Click **Run Scan**

Point out:
- Risk score now `0/100` (`MINIMAL`)
- Comparison card shows the reduction

### 4) Close with Actionability (30-40s)

Point out:
- Plain-English explanations
- Generated policy section
- Export JSON/Markdown buttons

Say:
> "MCP Shield catches risky configs before deployment and tells teams exactly what to fix."

## Backup Notes

- If comparison card does not show, rescan unsafe then safe once.
- Keep one screenshot each for unsafe and safe scans as backup.
