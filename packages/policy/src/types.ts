/**
 * Safe policy configuration generated from unsafe tool definitions
 */
export interface SafePolicy {
  /** Allowed paths for file operations */
  allowlist: string[];
  
  /** Blocked paths that should never be accessed */
  blocked_paths: string[];
  
  /** Blocked commands that should never be executed */
  blocked_commands: string[];
  
  /** Whether user approval is required before execution */
  approval_required: boolean;
  
  /** Whether all operations should be logged for audit */
  audit_required: boolean;
  
  /** Plain English explanation of the maximum safe scope */
  max_scope_explanation: string;
  
  /** Recommended environment variable handling */
  environment_variables: {
    /** Variables that should be used instead of hardcoded values */
    recommended: string[];
    
    /** Plain English explanation of why env vars are safer */
    explanation: string;
  };
  
  /** Additional security recommendations */
  recommendations: string[];
}

/**
 * Input for policy generation
 */
export interface PolicyInput {
  /** Type of input (MCP config or agent tools) */
  type: 'mcp_config' | 'agent_tools';
  
  /** The configuration or tool definitions */
  data: any;
}

/**
 * Result of policy generation
 */
export interface PolicyGenerationResult {
  /** The generated safe policy */
  policy: SafePolicy;
  
  /** Summary of changes made */
  summary: string;
  
  /** Risk reduction estimate (0-100) */
  estimated_risk_reduction: number;
}

// Made with Bob
