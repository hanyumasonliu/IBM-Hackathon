import { Finding, MCPConfig, MCPServerConfig, AgentTool } from './types';
import { createFinding, getConfigPath } from './utils';

// Rule 1: Shell command execution tools
export function detectShellCommandExecution(
  config: MCPConfig,
  serverName: string,
  server: MCPServerConfig
): Finding[] {
  const findings: Finding[] = [];

  // Check for wildcard command permissions
  if (server.allowedCommands?.includes('*')) {
    findings.push(createFinding(
      'Unrestricted Shell Command Execution',
      'critical',
      'This MCP server can execute ANY shell command on your computer. An attacker could run "rm -rf /" to delete everything, install malware, or steal your data. This is like giving a stranger admin access to your computer.',
      `Server "${serverName}" has allowedCommands: ["*"]`,
      'Remove the wildcard (*) and specify only the exact commands needed. For example: ["ls", "cat", "grep"]',
      getConfigPath(serverName, 'allowedCommands')
    ));
  }

  // Check for dangerous command patterns
  const dangerousCommands = ['rm', 'del', 'format', 'sudo', 'curl | bash', 'wget | sh'];
  const allowedCommands = server.allowedCommands || [];
  
  for (const cmd of allowedCommands) {
    for (const dangerous of dangerousCommands) {
      if (cmd.toLowerCase().includes(dangerous)) {
        findings.push(createFinding(
          `Dangerous Command Allowed: ${cmd}`,
          'high',
          `The command "${cmd}" can cause serious damage. It could delete files, install malicious software, or compromise your system security.`,
          `Server "${serverName}" allows command: "${cmd}"`,
          `Remove "${cmd}" from allowedCommands or use a safer alternative`,
          getConfigPath(serverName, 'allowedCommands')
        ));
      }
    }
  }

  return findings;
}

// Rule 2: Broad filesystem read/write access
export function detectBroadFilesystemAccess(
  config: MCPConfig,
  serverName: string,
  server: MCPServerConfig
): Finding[] {
  const findings: Finding[] = [];

  const path = server.path || server.args?.[server.args.length - 1];

  // Check for root access
  if (path === '/' || path === '*') {
    findings.push(createFinding(
      'Full Computer Access Detected',
      'critical',
      'This MCP server can read and write ANY file on your entire computer - your passwords, bank statements, private photos, everything. This is extremely dangerous, like giving a stranger the keys to your house and safe.',
      `Server "${serverName}" has filesystem access to: ${path}`,
      'Change the path to a specific folder. For example: "/home/user/documents" or "/Users/user/projects"',
      getConfigPath(serverName, 'path')
    ));
  }

  // Check for wildcard paths
  if (server.allowedPaths?.includes('*')) {
    findings.push(createFinding(
      'Wildcard Filesystem Access',
      'critical',
      'Using "*" for allowed paths means the AI can access any file anywhere on your computer. There are no restrictions.',
      `Server "${serverName}" has allowedPaths: ["*"]`,
      'Specify exact directories instead of "*". For example: ["/home/user/documents", "/home/user/projects"]',
      getConfigPath(serverName, 'allowedPaths')
    ));
  }

  return findings;
}

// Rule 3: Access to sensitive directories
export function detectSensitiveDirectoryAccess(
  config: MCPConfig,
  serverName: string,
  server: MCPServerConfig
): Finding[] {
  const findings: Finding[] = [];

  const path = server.path || server.args?.[server.args.length - 1];
  const allowedPaths = server.allowedPaths || [];
  const allPaths = [path, ...allowedPaths].filter(Boolean);

  const sensitivePatterns = [
    { pattern: /\.env/i, name: 'environment variables (.env files)', severity: 'critical' as const },
    { pattern: /secret/i, name: 'secrets directory', severity: 'critical' as const },
    { pattern: /credential/i, name: 'credentials directory', severity: 'critical' as const },
    { pattern: /\.ssh/i, name: 'SSH keys directory', severity: 'critical' as const },
    { pattern: /\.aws/i, name: 'AWS credentials directory', severity: 'critical' as const },
    { pattern: /^\/home\/[^/]+$/i, name: 'entire home directory', severity: 'high' as const },
    { pattern: /^~$/i, name: 'home directory', severity: 'high' as const },
    { pattern: /\/etc/i, name: 'system configuration (/etc)', severity: 'high' as const },
    { pattern: /\/var/i, name: 'system files (/var)', severity: 'medium' as const }
  ];

  for (const pathStr of allPaths) {
    if (typeof pathStr !== 'string') continue;

    for (const { pattern, name, severity } of sensitivePatterns) {
      if (pattern.test(pathStr)) {
        findings.push(createFinding(
          `Access to Sensitive Location: ${name}`,
          severity,
          `The path "${pathStr}" gives access to ${name}. This could expose passwords, API keys, private keys, and other secrets that should never be accessible to AI agents.`,
          `Server "${serverName}" can access: ${pathStr}`,
          `Remove access to ${name}. Use a dedicated, non-sensitive directory instead.`,
          getConfigPath(serverName, 'path')
        ));
      }
    }
  }

  return findings;
}

// Rule 4: Missing authentication for remote MCP servers
export function detectMissingAuthentication(
  config: MCPConfig,
  serverName: string,
  server: MCPServerConfig
): Finding[] {
  const findings: Finding[] = [];

  // Check if this is a remote server (has URL)
  const isRemote = server.url || server.args?.some(arg => 
    typeof arg === 'string' && (arg.startsWith('http://') || arg.startsWith('https://'))
  );

  if (isRemote) {
    const hasAuth = server.authentication?.enabled === true;
    
    if (!hasAuth) {
      findings.push(createFinding(
        'Remote Server Without Authentication',
        'high',
        'This MCP server connects to a remote endpoint without authentication. Anyone on the network could intercept or impersonate the connection, potentially stealing data or injecting malicious commands.',
        `Server "${serverName}" connects remotely but has no authentication configured`,
        'Enable authentication by adding: authentication: { enabled: true, type: "bearer" } and use secure tokens',
        getConfigPath(serverName, 'authentication')
      ));
    }
  }

  return findings;
}

// Rule 5: Unencrypted HTTP remote endpoints
export function detectUnencryptedEndpoints(
  config: MCPConfig,
  serverName: string,
  server: MCPServerConfig
): Finding[] {
  const findings: Finding[] = [];

  const urls = [
    server.url,
    ...(server.args || []).filter(arg => typeof arg === 'string' && arg.startsWith('http'))
  ];

  for (const url of urls) {
    if (typeof url === 'string' && url.startsWith('http://')) {
      findings.push(createFinding(
        'Unencrypted HTTP Connection',
        'high',
        `The connection to "${url}" uses HTTP instead of HTTPS. This means all data is sent in plain text over the network. Anyone on your WiFi or network can see everything - passwords, API keys, private data, everything.`,
        `Server "${serverName}" uses unencrypted URL: ${url}`,
        `Change "http://" to "https://" to encrypt the connection. For example: ${url.replace('http://', 'https://')}`,
        getConfigPath(serverName, 'url')
      ));
    }
  }

  return findings;
}

// Rule 6: Destructive tools
export function detectDestructiveTools(
  tool: AgentTool,
  toolIndex: number
): Finding[] {
  const findings: Finding[] = [];

  const destructiveKeywords = ['delete', 'remove', 'drop', 'truncate', 'overwrite', 'destroy', 'erase', 'wipe'];
  const toolName = tool.name.toLowerCase();
  const toolDesc = (tool.description || '').toLowerCase();

  for (const keyword of destructiveKeywords) {
    if (toolName.includes(keyword) || toolDesc.includes(keyword)) {
      findings.push(createFinding(
        `Destructive Tool Detected: ${tool.name}`,
        'high',
        `The tool "${tool.name}" can permanently delete or destroy data. If used incorrectly or maliciously, you could lose important files, databases, or configurations with no way to recover them.`,
        `Tool "${tool.name}" contains destructive keyword: "${keyword}"`,
        'Add confirmation prompts, implement undo functionality, or restrict this tool to non-critical data only',
        `tools[${toolIndex}]`
      ));
      break; // Only report once per tool
    }
  }

  return findings;
}

// Rule 7: Tools that combine read secrets + network send
export function detectSecretExfiltration(
  tools: AgentTool[]
): Finding[] {
  const findings: Finding[] = [];

  const canReadSecrets = tools.some(tool => {
    const name = tool.name.toLowerCase();
    const desc = (tool.description || '').toLowerCase();
    return name.includes('read') || name.includes('file') || name.includes('secret') ||
           desc.includes('read') || desc.includes('file') || desc.includes('secret');
  });

  const canSendNetwork = tools.some(tool => {
    const name = tool.name.toLowerCase();
    const desc = (tool.description || '').toLowerCase();
    return name.includes('http') || name.includes('request') || name.includes('send') ||
           name.includes('post') || name.includes('upload') ||
           desc.includes('http') || desc.includes('request') || desc.includes('send');
  });

  if (canReadSecrets && canSendNetwork) {
    findings.push(createFinding(
      'Secret Exfiltration Risk',
      'critical',
      'Your agent has both the ability to read files (potentially including secrets) AND send data over the network. A malicious prompt could trick the AI into reading your .env file and sending it to an attacker\'s server. This is a common attack pattern.',
      'Agent has tools for both file reading and network requests',
      'Separate these capabilities: use different agents for file access vs network access, or add explicit user confirmation before any network request',
      'tools'
    ));
  }

  return findings;
}

// Rule 8: Auto-approval or always-allow permissions
export function detectAutoApproval(
  config: MCPConfig,
  serverName: string,
  server: MCPServerConfig
): Finding[] {
  const findings: Finding[] = [];

  if (server.permissions?.autoApprove === true) {
    findings.push(createFinding(
      'Auto-Approval Enabled',
      'high',
      'This server automatically approves all actions without asking you first. The AI could delete files, send data, or make changes without your knowledge or consent.',
      `Server "${serverName}" has autoApprove: true`,
      'Set autoApprove to false and review each action before it executes',
      getConfigPath(serverName, 'permissions.autoApprove')
    ));
  }

  if (server.permissions?.alwaysAllow === true) {
    findings.push(createFinding(
      'Always-Allow Permissions',
      'high',
      'This server has "always allow" permissions, meaning it bypasses all security checks. This removes your ability to control what the AI does.',
      `Server "${serverName}" has alwaysAllow: true`,
      'Set alwaysAllow to false and implement proper permission checks',
      getConfigPath(serverName, 'permissions.alwaysAllow')
    ));
  }

  return findings;
}

// Rule 9: No audit logging
export function detectMissingAuditLog(
  config: MCPConfig,
  serverName: string,
  server: MCPServerConfig
): Finding[] {
  const findings: Finding[] = [];

  const hasLogging = server.logging?.enabled === true;
  const hasAuditTrail = server.logging?.auditTrail === true;

  if (!hasLogging) {
    findings.push(createFinding(
      'No Audit Logging',
      'medium',
      'This server doesn\'t log what actions the AI takes. If something goes wrong or data is leaked, you won\'t be able to investigate what happened or who did it.',
      `Server "${serverName}" has logging disabled or not configured`,
      'Enable logging: { enabled: true, auditTrail: true } to track all AI actions',
      getConfigPath(serverName, 'logging')
    ));
  } else if (!hasAuditTrail) {
    findings.push(createFinding(
      'No Audit Trail',
      'low',
      'Logging is enabled but audit trail is not. You can see that actions happened, but not the full history needed for security investigations.',
      `Server "${serverName}" has logging but no audit trail`,
      'Enable audit trail: { enabled: true, auditTrail: true }',
      getConfigPath(serverName, 'logging.auditTrail')
    ));
  }

  return findings;
}

// Rule 10: No user/session attribution
export function detectMissingAttribution(
  config: MCPConfig,
  serverName: string,
  server: MCPServerConfig
): Finding[] {
  const findings: Finding[] = [];

  const hasUserAttribution = server.logging?.userAttribution === true;

  if (!hasUserAttribution && server.logging?.enabled === true) {
    findings.push(createFinding(
      'No User Attribution',
      'low',
      'The logs don\'t track which user or session performed each action. In a multi-user environment, you can\'t tell who did what, making it impossible to investigate security incidents or unauthorized access.',
      `Server "${serverName}" has no user attribution in logs`,
      'Enable user attribution: { enabled: true, userAttribution: true } to track who performs each action',
      getConfigPath(serverName, 'logging.userAttribution')
    ));
  }

  return findings;
}

// Apply all rules to MCP config
export function scanMCPConfig(config: MCPConfig): Finding[] {
  const findings: Finding[] = [];

  if (!config.mcpServers) {
    return findings;
  }

  for (const [serverName, server] of Object.entries(config.mcpServers)) {
    findings.push(...detectShellCommandExecution(config, serverName, server));
    findings.push(...detectBroadFilesystemAccess(config, serverName, server));
    findings.push(...detectSensitiveDirectoryAccess(config, serverName, server));
    findings.push(...detectMissingAuthentication(config, serverName, server));
    findings.push(...detectUnencryptedEndpoints(config, serverName, server));
    findings.push(...detectAutoApproval(config, serverName, server));
    findings.push(...detectMissingAuditLog(config, serverName, server));
    findings.push(...detectMissingAttribution(config, serverName, server));
  }

  return findings;
}

// Apply tool-specific rules
export function scanAgentTools(tools: AgentTool[]): Finding[] {
  const findings: Finding[] = [];

  tools.forEach((tool, index) => {
    findings.push(...detectDestructiveTools(tool, index));
  });

  findings.push(...detectSecretExfiltration(tools));

  return findings;
}

// Made with Bob
