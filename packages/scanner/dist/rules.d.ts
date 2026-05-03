import { Finding, MCPConfig, MCPServerConfig, AgentTool } from './types';
export declare function detectShellCommandExecution(config: MCPConfig, serverName: string, server: MCPServerConfig): Finding[];
export declare function detectBroadFilesystemAccess(config: MCPConfig, serverName: string, server: MCPServerConfig): Finding[];
export declare function detectSensitiveDirectoryAccess(config: MCPConfig, serverName: string, server: MCPServerConfig): Finding[];
export declare function detectMissingAuthentication(config: MCPConfig, serverName: string, server: MCPServerConfig): Finding[];
export declare function detectUnencryptedEndpoints(config: MCPConfig, serverName: string, server: MCPServerConfig): Finding[];
export declare function detectDestructiveTools(tool: AgentTool, toolIndex: number): Finding[];
export declare function detectSecretExfiltration(tools: AgentTool[]): Finding[];
export declare function detectAutoApproval(config: MCPConfig, serverName: string, server: MCPServerConfig): Finding[];
export declare function detectMissingAuditLog(config: MCPConfig, serverName: string, server: MCPServerConfig): Finding[];
export declare function detectMissingAttribution(config: MCPConfig, serverName: string, server: MCPServerConfig): Finding[];
export declare function scanMCPConfig(config: MCPConfig): Finding[];
export declare function scanAgentTools(tools: AgentTool[]): Finding[];
//# sourceMappingURL=rules.d.ts.map