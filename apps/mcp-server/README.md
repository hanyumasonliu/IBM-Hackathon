# MCP Shield MCP Server

MCP STDIO server that exposes MCP Shield scanning and reporting as callable tools.

## Tools

1. `scan_mcp_config`
2. `scan_agent_tools`
3. `generate_guardrail_policy`
4. `generate_security_report`

## Run

```bash
npm install
npm run build
npm start
```

Transport: STDIO  
Protocol: JSON-RPC 2.0 via MCP

## Example MCP Server Config

```json
{
  "mcpServers": {
    "mcp-shield": {
      "command": "node",
      "args": ["/absolute/path/to/IBM_Bob/apps/mcp-server/dist/index.js"]
    }
  }
}
```

## Notes

- Inputs are parsed as JSON and validated before scanning.
- Findings use plain-English explanations for non-security audiences.
