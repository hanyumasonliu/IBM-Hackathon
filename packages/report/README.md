# @mcp-shield/report

Markdown report generator for MCP Shield scan results.

## What It Produces

- Executive summary
- Risk score and severity breakdown
- Top risks and full findings table
- Recommended fixes by priority
- Optional before/after comparison
- Optional generated guardrail policy section

## Usage

```ts
import { ReportGenerator } from '@mcp-shield/report';

const generator = new ReportGenerator();
const markdown = generator.generate(scanResult, {
  organization: 'Your Organization',
  project: 'MCP Security Scan'
});
```

## Comparison Example

```ts
const markdown = generator.generate(after, {
  comparison: { before, after }
});
```

## Install / Build

```bash
npm install
npm run build
```
