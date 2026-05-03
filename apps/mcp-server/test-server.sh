#!/bin/bash

# Test script for MCP Shield STDIO Server
# This sends a simple MCP protocol message to test the server

echo "Testing MCP Shield Server..."
echo ""

# Test 1: Initialize
echo "Test 1: Initialize"
echo '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2024-11-05","capabilities":{},"clientInfo":{"name":"test-client","version":"1.0.0"}}}' | node dist/index.js 2>&1 | head -1
echo ""

# Test 2: List Tools
echo "Test 2: List Tools"
echo '{"jsonrpc":"2.0","id":2,"method":"tools/list","params":{}}' | node dist/index.js 2>&1 | grep -A 5 "tools"
echo ""

echo "If you see tool names above, the server is working!"
echo ""
echo "To use with Bob, add this to your MCP config:"
echo "{"
echo "  \"mcpServers\": {"
echo "    \"mcp-shield\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"$(pwd)/dist/index.js\"]"
echo "    }"
echo "  }"
echo "}"

# Made with Bob
