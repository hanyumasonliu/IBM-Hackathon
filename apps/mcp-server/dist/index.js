#!/usr/bin/env node
/**
 * MCP Shield STDIO Server
 * Exposes security scanning tools via Model Context Protocol
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { TOOLS, ToolHandlers } from './tools.js';
// Server metadata
const SERVER_NAME = 'mcp-shield';
const SERVER_VERSION = '0.1.0';
class MCPShieldServer {
    server;
    toolHandlers;
    constructor() {
        this.server = new Server({
            name: SERVER_NAME,
            version: SERVER_VERSION,
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.toolHandlers = new ToolHandlers();
        this.setupHandlers();
        // Error handling
        this.server.onerror = (error) => {
            console.error('[MCP Error]', error);
        };
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }
    setupHandlers() {
        // Handle tools/list request
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: TOOLS,
            };
        });
        // Handle tools/call request
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                const result = await this.toolHandlers.handleToolCall(name, args || {});
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify(result, null, 2),
                        },
                    ],
                };
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({
                                error: errorMessage,
                                tool: name,
                            }, null, 2),
                        },
                    ],
                    isError: true,
                };
            }
        });
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        // Log to stderr so it doesn't interfere with STDIO protocol
        console.error(`MCP Shield Server v${SERVER_VERSION} running on STDIO`);
        console.error('Available tools:', TOOLS.map(t => t.name).join(', '));
    }
}
// Start the server
const server = new MCPShieldServer();
server.run().catch((error) => {
    console.error('Failed to start server:', error);
    process.exit(1);
});
// Made with Bob
//# sourceMappingURL=index.js.map