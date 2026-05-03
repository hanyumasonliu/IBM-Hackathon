# MCP Shield Extended Demo Notes

This is a longer backup script if you need more than the 3-minute pitch.

## Main Story

1. Show unsafe config (`100/100`)
2. Explain a few critical findings
3. Show safe config (`0/100`)
4. Show comparison and exports

## Useful Commands

```bash
# Install and build
npm install
npm run build

# Run scanner tests
cd packages/scanner && npm test

# Run web app
cd apps/web && npm run dev
```

## Talking Points

- Risk scoring is deterministic and transparent.
- Findings are plain English, not only security jargon.
- Safe demo proves least-privilege configuration with zero findings.
- Reports can be exported for audits and stakeholder reviews.
