// TypeScript types for MCP Shield Scanner

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface Finding {
  id: string;
  title: string;
  severity: Severity;
  explanation: string;
  evidence: string;
  recommended_fix: string;
  affected_config_path: string;
}

export interface SeverityCounts {
  critical: number;
  high: number;
  medium: number;
  low: number;
  info: number;
}

export interface SafePolicy {
  allowlist: string[];
  blocked_paths: string[];
  blocked_commands: string[];
  approval_required: boolean;
  audit_required: boolean;
  max_scope_explanation: string;
  environment_variables: {
    recommended: string[];
    explanation: string;
  };
  recommendations: string[];
}

export interface ScanResult {
  overall_risk_score: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MINIMAL';
  severity_counts: SeverityCounts;
  findings: Finding[];
  scanned_at: string;
  suggested_policy?: SafePolicy;
}

export interface MCPServerConfig {
  command?: string;
  args?: string[];
  env?: Record<string, string>;
  path?: string;
  allowedPaths?: string[];
  allowedCommands?: string[];
  allowedDomains?: string[];
  url?: string;
  authentication?: {
    enabled: boolean;
    type?: string;
  };
  permissions?: {
    autoApprove?: boolean;
    alwaysAllow?: boolean;
  };
  logging?: {
    enabled?: boolean;
    auditTrail?: boolean;
    userAttribution?: boolean;
  };
}

export interface MCPConfig {
  mcpServers?: Record<string, MCPServerConfig>;
  security?: {
    sandboxing?: boolean;
    allowNetworkAccess?: boolean;
    allowFileSystemAccess?: boolean;
    logging?: {
      enabled?: boolean;
      auditTrail?: boolean;
    };
  };
}

export interface AgentTool {
  name: string;
  description?: string;
  parameters?: Record<string, any>;
  dangerous?: boolean;
  allowedPaths?: string[];
  allowedCommands?: string[];
  permissions?: {
    read?: boolean;
    write?: boolean;
    execute?: boolean;
    network?: boolean;
  };
}

export interface AgentToolsConfig {
  tools: AgentTool[];
}

export type ScanInput = MCPConfig | AgentToolsConfig | string;

// Made with Bob
