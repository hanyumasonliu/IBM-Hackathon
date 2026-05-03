import { SafePolicy, PolicyInput, PolicyGenerationResult } from './types';

/**
 * Generates safe policy configurations from unsafe tool definitions
 */
export class PolicyGenerator {
  /**
   * Generate a safe policy from an unsafe configuration
   */
  generate(input: PolicyInput): PolicyGenerationResult {
    const policy: SafePolicy = {
      allowlist: [],
      blocked_paths: [],
      blocked_commands: [],
      approval_required: false,
      audit_required: false,
      max_scope_explanation: '',
      environment_variables: {
        recommended: [],
        explanation: ''
      },
      recommendations: []
    };

    let riskReduction = 0;
    const changes: string[] = [];

    if (input.type === 'mcp_config') {
      const result = this.generateFromMCPConfig(input.data, policy);
      riskReduction = result.riskReduction;
      changes.push(...result.changes);
    } else {
      const result = this.generateFromAgentTools(input.data, policy);
      riskReduction = result.riskReduction;
      changes.push(...result.changes);
    }

    return {
      policy,
      summary: this.generateSummary(changes),
      estimated_risk_reduction: Math.min(riskReduction, 100)
    };
  }

  private generateFromMCPConfig(config: any, policy: SafePolicy): { riskReduction: number; changes: string[] } {
    let riskReduction = 0;
    const changes: string[] = [];

    if (!config.mcpServers) {
      return { riskReduction, changes };
    }

    // Analyze each server
    for (const [serverName, serverConfig] of Object.entries(config.mcpServers as Record<string, any>)) {
      // Check for filesystem access
      if (serverConfig.args && Array.isArray(serverConfig.args)) {
        const fsPath = serverConfig.args.find((arg: string) => 
          typeof arg === 'string' && (arg === '/' || arg.includes('*'))
        );
        
        if (fsPath === '/') {
          policy.allowlist.push('/home/user/documents', '/home/user/projects');
          policy.blocked_paths.push('/', '/etc', '/var', '/usr', '/sys', '/proc');
          changes.push('Restricted root filesystem access to specific user directories');
          riskReduction += 25;
        }
      }

      // Check for shell execution
      if (serverConfig.allowedCommands && serverConfig.allowedCommands.includes('*')) {
        policy.blocked_commands.push('rm -rf', 'sudo', 'chmod 777', 'curl | bash', 'wget | sh');
        policy.allowlist.push('ls', 'cat', 'grep', 'find', 'echo');
        changes.push('Replaced wildcard command access with safe command allowlist');
        riskReduction += 20;
      }

      // Check for hardcoded credentials
      if (serverConfig.env) {
        for (const [key, value] of Object.entries(serverConfig.env)) {
          if (typeof value === 'string' && this.looksLikeCredential(value)) {
            policy.environment_variables.recommended.push(key);
            changes.push(`Moved hardcoded credential to environment variable: ${key}`);
            riskReduction += 15;
          }
        }
      }
    }

    // Check security settings
    if (config.security) {
      if (config.security.sandboxing === false) {
        policy.recommendations.push('Enable sandboxing to isolate server processes');
        changes.push('Recommended enabling sandboxing');
        riskReduction += 10;
      }

      if (config.security.allowNetworkAccess === true && !config.security.allowedDomains) {
        policy.recommendations.push('Restrict network access to specific domains');
        changes.push('Recommended domain allowlist for network access');
        riskReduction += 10;
      }
    }

    // Set approval and audit requirements
    if (riskReduction > 30) {
      policy.approval_required = true;
      policy.audit_required = true;
      changes.push('Enabled approval and audit requirements for high-risk operations');
    }

    // Set environment variable explanation
    if (policy.environment_variables.recommended.length > 0) {
      policy.environment_variables.explanation = 
        'Environment variables prevent credentials from being committed to version control and allow different values per environment (dev/staging/prod).';
    }

    // Set max scope explanation
    policy.max_scope_explanation = this.generateMaxScopeExplanation(policy);

    return { riskReduction, changes };
  }

  private generateFromAgentTools(tools: any, policy: SafePolicy): { riskReduction: number; changes: string[] } {
    let riskReduction = 0;
    const changes: string[] = [];

    if (!tools.tools || !Array.isArray(tools.tools)) {
      return { riskReduction, changes };
    }

    for (const tool of tools.tools) {
      // Check for dangerous tool names
      if (tool.name && this.isDangerousTool(tool.name)) {
        policy.approval_required = true;
        policy.audit_required = true;
        changes.push(`Flagged dangerous tool "${tool.name}" for approval and audit`);
        riskReduction += 15;
      }

      // Check for wildcard paths
      if (tool.allowedPaths && tool.allowedPaths.includes('*')) {
        policy.allowlist.push('/home/user/documents', '/home/user/projects');
        policy.blocked_paths.push('/', '/etc', '/var', '/usr', '/sys', '/proc', '~/.ssh', '~/.aws');
        changes.push(`Restricted wildcard path access in tool "${tool.name}"`);
        riskReduction += 20;
      }

      // Check for dangerous parameters
      if (tool.parameters) {
        if (tool.parameters.command || tool.parameters.query) {
          policy.recommendations.push(`Add input validation and sanitization for tool "${tool.name}"`);
          changes.push(`Recommended input validation for "${tool.name}"`);
          riskReduction += 10;
        }
      }

      // Check for missing validation
      if (tool.validation === 'none' || tool.sanitization === false) {
        policy.recommendations.push(`Enable input validation and sanitization for tool "${tool.name}"`);
        changes.push(`Recommended enabling validation for "${tool.name}"`);
        riskReduction += 10;
      }
    }

    // Set max scope explanation
    policy.max_scope_explanation = this.generateMaxScopeExplanation(policy);

    return { riskReduction, changes };
  }

  private looksLikeCredential(value: string): boolean {
    // Check for common credential patterns
    const patterns = [
      /password/i,
      /secret/i,
      /token/i,
      /key/i,
      /api[_-]?key/i,
      /^[A-Za-z0-9+/]{20,}={0,2}$/, // Base64
      /^[0-9a-f]{32,}$/i, // Hex
      /postgresql:\/\/.*:.*@/, // Connection strings
      /mysql:\/\/.*:.*@/,
      /mongodb:\/\/.*:.*@/
    ];

    return patterns.some(pattern => pattern.test(value));
  }

  private isDangerousTool(name: string): boolean {
    const dangerousNames = [
      'execute', 'exec', 'run', 'shell', 'command',
      'delete', 'drop', 'remove', 'destroy',
      'read_secret', 'get_credential', 'fetch_password',
      'write_file', 'modify_file', 'create_file'
    ];

    return dangerousNames.some(dangerous => 
      name.toLowerCase().includes(dangerous)
    );
  }

  private generateMaxScopeExplanation(policy: SafePolicy): string {
    const parts: string[] = [];

    if (policy.allowlist.length > 0) {
      parts.push(`File access limited to: ${policy.allowlist.slice(0, 3).join(', ')}`);
    }

    if (policy.blocked_paths.length > 0) {
      parts.push(`System directories blocked: ${policy.blocked_paths.slice(0, 3).join(', ')}`);
    }

    if (policy.blocked_commands.length > 0) {
      parts.push(`Dangerous commands blocked: ${policy.blocked_commands.slice(0, 3).join(', ')}`);
    }

    if (policy.approval_required) {
      parts.push('All operations require user approval');
    }

    if (policy.audit_required) {
      parts.push('All operations are logged for audit');
    }

    if (parts.length === 0) {
      return 'No specific restrictions applied. Consider adding allowlists and approval requirements.';
    }

    return parts.join('. ') + '.';
  }

  private generateSummary(changes: string[]): string {
    if (changes.length === 0) {
      return 'No security improvements identified. The configuration appears to be already secure or no unsafe patterns were detected.';
    }

    const summary = `Generated ${changes.length} security improvement${changes.length > 1 ? 's' : ''}:\n\n` +
      changes.map((change, i) => `${i + 1}. ${change}`).join('\n');

    return summary;
  }
}

// Made with Bob
