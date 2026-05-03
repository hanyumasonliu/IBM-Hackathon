# @mcp-shield/scanner

Core scanning engine for MCP Shield.

## Purpose

This package analyzes:

- MCP server configs
- Agent tool definitions
- Prompt text

It returns findings, severity counts, and a normalized risk score (`0-100`).

## Usage

```ts
import { MCPShieldScanner } from '@mcp-shield/scanner';

const scanner = new MCPShieldScanner();
const result = await scanner.scan(input);

console.log(result.overall_risk_score, result.risk_level);
console.log(result.findings.length);
```

## Scoring

- `critical`: 25
- `high`: 15
- `medium`: 8
- `low`: 3
- `info`: 1

Score is capped at `100`.

## Rules Implemented

1. Unrestricted shell command execution
2. Broad filesystem access
3. Sensitive directory access
4. Missing remote authentication
5. Unencrypted HTTP endpoint usage
6. Destructive tool detection
7. Secret exfiltration risk pattern
8. Auto-approval / always-allow permissions
9. Missing audit logging
10. Missing user attribution

## Development

```bash
npm run build
npm test
```
