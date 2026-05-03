/**
 * MCP Shield Tool Definitions
 * Defines the 4 security scanning tools exposed via MCP protocol
 */
import type { ScanResult } from '@mcp-shield/scanner';
export declare const TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            config: {
                type: string;
                description: string;
            };
            tools?: undefined;
            scan_result?: undefined;
            organization?: undefined;
            project?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            tools: {
                type: string;
                description: string;
            };
            config?: undefined;
            scan_result?: undefined;
            organization?: undefined;
            project?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scan_result: {
                type: string;
                description: string;
            };
            config?: undefined;
            tools?: undefined;
            organization?: undefined;
            project?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            scan_result: {
                type: string;
                description: string;
            };
            organization: {
                type: string;
                description: string;
            };
            project: {
                type: string;
                description: string;
            };
            config?: undefined;
            tools?: undefined;
        };
        required: string[];
    };
})[];
export declare class ToolHandlers {
    private scanner;
    private reportGenerator;
    constructor();
    scanMcpConfig(config: string): Promise<ScanResult>;
    scanAgentTools(tools: string): Promise<ScanResult>;
    generateGuardrailPolicy(scanResultJson: string): Promise<object>;
    generateSecurityReport(scanResultJson: string, organization?: string, project?: string): Promise<string>;
    handleToolCall(toolName: string, args: Record<string, unknown>): Promise<unknown>;
}
//# sourceMappingURL=tools.d.ts.map