import { Finding, Severity } from './types';
export declare function createFinding(title: string, severity: Severity, explanation: string, evidence: string, recommended_fix: string, affected_config_path: string): Finding;
export declare function generateId(): string;
export declare function getConfigPath(serverName?: string, field?: string): string;
//# sourceMappingURL=utils.d.ts.map