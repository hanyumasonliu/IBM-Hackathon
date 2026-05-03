import { Finding, Severity } from './types';

export function createFinding(
  title: string,
  severity: Severity,
  explanation: string,
  evidence: string,
  recommended_fix: string,
  affected_config_path: string
): Finding {
  return {
    id: generateId(),
    title,
    severity,
    explanation,
    evidence,
    recommended_fix,
    affected_config_path
  };
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getConfigPath(serverName?: string, field?: string): string {
  if (serverName && field) {
    return `mcpServers.${serverName}.${field}`;
  }
  if (serverName) {
    return `mcpServers.${serverName}`;
  }
  return 'root';
}

// Made with Bob
