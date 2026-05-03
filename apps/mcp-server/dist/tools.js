/**
 * MCP Shield Tool Definitions
 * Defines the 4 security scanning tools exposed via MCP protocol
 */
import { MCPShieldScanner } from '@mcp-shield/scanner';
import { ReportGenerator } from '@mcp-shield/report';
// Tool definitions following MCP protocol schema
export const TOOLS = [
    {
        name: 'scan_mcp_config',
        description: 'Scan an MCP server configuration for security vulnerabilities. Returns risk score, findings, and suggested guardrail policy.',
        inputSchema: {
            type: 'object',
            properties: {
                config: {
                    type: 'string',
                    description: 'JSON string of MCP server configuration to scan'
                }
            },
            required: ['config']
        }
    },
    {
        name: 'scan_agent_tools',
        description: 'Scan AI agent tool definitions for security risks. Identifies dangerous capabilities and permissions.',
        inputSchema: {
            type: 'object',
            properties: {
                tools: {
                    type: 'string',
                    description: 'JSON string of agent tool definitions to scan'
                }
            },
            required: ['tools']
        }
    },
    {
        name: 'generate_guardrail_policy',
        description: 'Generate a safe guardrail policy based on scan results. Provides allowlists, blocklists, and security recommendations.',
        inputSchema: {
            type: 'object',
            properties: {
                scan_result: {
                    type: 'string',
                    description: 'JSON string of previous scan result to generate policy from'
                }
            },
            required: ['scan_result']
        }
    },
    {
        name: 'generate_security_report',
        description: 'Generate a comprehensive markdown security report from scan results. Includes executive summary, findings, and remediation steps.',
        inputSchema: {
            type: 'object',
            properties: {
                scan_result: {
                    type: 'string',
                    description: 'JSON string of scan result to generate report from'
                },
                organization: {
                    type: 'string',
                    description: 'Organization name for the report header (optional)'
                },
                project: {
                    type: 'string',
                    description: 'Project name for the report header (optional)'
                }
            },
            required: ['scan_result']
        }
    }
];
// Tool handler implementations
export class ToolHandlers {
    scanner;
    reportGenerator;
    constructor() {
        this.scanner = new MCPShieldScanner();
        this.reportGenerator = new ReportGenerator();
    }
    async scanMcpConfig(config) {
        try {
            // Parse and validate the config JSON
            JSON.parse(config); // Validate it's valid JSON
            // Scan the configuration
            const result = await this.scanner.scan(config);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to scan MCP config: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async scanAgentTools(tools) {
        try {
            // Parse and validate the tools JSON
            JSON.parse(tools); // Validate it's valid JSON
            // Scan the agent tools
            const result = await this.scanner.scan(tools);
            return result;
        }
        catch (error) {
            throw new Error(`Failed to scan agent tools: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateGuardrailPolicy(scanResultJson) {
        try {
            // Parse the scan result
            const scanResult = JSON.parse(scanResultJson);
            // Return the suggested policy from the scan result
            if (!scanResult.suggested_policy) {
                throw new Error('Scan result does not contain a suggested policy');
            }
            return scanResult.suggested_policy;
        }
        catch (error) {
            throw new Error(`Failed to generate guardrail policy: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async generateSecurityReport(scanResultJson, organization, project) {
        try {
            // Parse the scan result
            const scanResult = JSON.parse(scanResultJson);
            // Generate the markdown report
            const report = this.reportGenerator.generate(scanResult, {
                organization: organization || 'Your Organization',
                project: project || 'Security Scan',
                include_executive_summary: true,
                include_technical_details: true
            });
            return report;
        }
        catch (error) {
            throw new Error(`Failed to generate security report: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async handleToolCall(toolName, args) {
        switch (toolName) {
            case 'scan_mcp_config':
                return this.scanMcpConfig(args.config);
            case 'scan_agent_tools':
                return this.scanAgentTools(args.tools);
            case 'generate_guardrail_policy':
                return this.generateGuardrailPolicy(args.scan_result);
            case 'generate_security_report':
                return this.generateSecurityReport(args.scan_result, args.organization, args.project);
            default:
                throw new Error(`Unknown tool: ${toolName}`);
        }
    }
}
// Made with Bob
//# sourceMappingURL=tools.js.map