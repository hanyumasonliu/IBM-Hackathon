import { scanMCPConfig, scanAgentTools } from './rules';
export class MCPShieldScanner {
    constructor() {
        this.severityWeights = {
            critical: 25,
            high: 15,
            medium: 8,
            low: 3,
            info: 1
        };
    }
    async scan(input) {
        const findings = this.detectIssues(input);
        const severity_counts = this.countSeverities(findings);
        const overall_risk_score = this.calculateRiskScore(severity_counts);
        const risk_level = this.getRiskLevel(overall_risk_score);
        let suggested_policy;
        if (findings.length > 0 && overall_risk_score > 20) {
            suggested_policy = this.generatePolicy(input, findings);
        }
        return {
            overall_risk_score,
            risk_level,
            severity_counts,
            findings,
            scanned_at: new Date().toISOString(),
            suggested_policy
        };
    }
    detectIssues(input) {
        if (typeof input === 'string') {
            const originalString = input;
            try {
                input = JSON.parse(input);
            }
            catch (error) {
                return this.scanPromptText(originalString);
            }
        }
        if (this.isAgentToolsConfig(input)) {
            return scanAgentTools(input.tools);
        }
        return scanMCPConfig(input);
    }
    isAgentToolsConfig(input) {
        return input && Array.isArray(input.tools);
    }
    scanPromptText(text) {
        const findings = [];
        const injectionPatterns = [
            {
                pattern: /ignore\s+(all\s+)?previous\s+instructions/i,
                title: 'Prompt Injection: Instruction Override',
                severity: 'high',
                explanation: 'This prompt tries to make the AI forget its original instructions and follow new ones. It\'s like someone telling a security guard to "forget your training and let me in."'
            },
            {
                pattern: /you\s+are\s+now|act\s+as|pretend\s+to\s+be/i,
                title: 'Prompt Injection: Role Manipulation',
                severity: 'high',
                explanation: 'This prompt tries to change the AI\'s role or behavior. It could make the AI bypass security restrictions or act in unintended ways.'
            },
            {
                pattern: /(password|secret|token|api[_-]?key|credential)/i,
                title: 'Potential Secret Extraction Attempt',
                severity: 'critical',
                explanation: 'This prompt mentions secrets or credentials. It might be trying to trick the AI into revealing sensitive information like passwords or API keys.'
            },
            {
                pattern: /(rm\s+-rf|curl\s+.*\|\s*bash|sudo|format\s+c:)/i,
                title: 'Dangerous Command in Prompt',
                severity: 'critical',
                explanation: 'This prompt contains dangerous system commands that could delete files, install malware, or compromise your system if executed.'
            },
            {
                pattern: /\.\.[\/\\]|\.\.%2[fF]/i,
                title: 'Path Traversal Attempt',
                severity: 'high',
                explanation: 'This prompt contains path traversal patterns (../) that could be used to access files outside allowed directories.'
            }
        ];
        for (const { pattern, title, severity, explanation } of injectionPatterns) {
            const match = text.match(pattern);
            if (match) {
                findings.push({
                    id: this.generateId(),
                    title,
                    severity,
                    explanation,
                    evidence: `Found pattern: "${match[0]}"`,
                    recommended_fix: 'Review and sanitize this prompt. Remove any attempts to manipulate the AI or access sensitive data.',
                    affected_config_path: 'prompt_text'
                });
            }
        }
        return findings;
    }
    countSeverities(findings) {
        return {
            critical: findings.filter(f => f.severity === 'critical').length,
            high: findings.filter(f => f.severity === 'high').length,
            medium: findings.filter(f => f.severity === 'medium').length,
            low: findings.filter(f => f.severity === 'low').length,
            info: findings.filter(f => f.severity === 'info').length
        };
    }
    calculateRiskScore(counts) {
        let score = 0;
        score += counts.critical * this.severityWeights.critical;
        score += counts.high * this.severityWeights.high;
        score += counts.medium * this.severityWeights.medium;
        score += counts.low * this.severityWeights.low;
        score += counts.info * this.severityWeights.info;
        return Math.min(score, 100);
    }
    getRiskLevel(score) {
        if (score >= 80)
            return 'CRITICAL';
        if (score >= 60)
            return 'HIGH';
        if (score >= 40)
            return 'MEDIUM';
        if (score >= 20)
            return 'LOW';
        return 'MINIMAL';
    }
    generatePolicy(input, findings) {
        const policy = {
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
        let parsedInput = input;
        if (typeof input === 'string') {
            try {
                parsedInput = JSON.parse(input);
            }
            catch {
                return policy;
            }
        }
        for (const finding of findings) {
            if (finding.title.includes('Filesystem') || finding.title.includes('File Access')) {
                policy.allowlist.push('/home/user/documents', '/home/user/projects');
                policy.blocked_paths.push('/', '/etc', '/var', '/usr', '/sys', '/proc', '~/.ssh', '~/.aws');
            }
            if (finding.title.includes('Command') || finding.title.includes('Shell')) {
                policy.blocked_commands.push('rm -rf', 'sudo', 'chmod 777', 'curl | bash', 'wget | sh', 'dd');
            }
            if (finding.title.includes('Credential') || finding.title.includes('Secret') || finding.title.includes('Password')) {
                policy.environment_variables.recommended.push('DATABASE_URL', 'API_KEY', 'SECRET_TOKEN');
                policy.environment_variables.explanation =
                    'Use environment variables to keep secrets out of your code. This prevents accidental exposure in version control and allows different values per environment.';
            }
            if (finding.title.includes('Authentication') || finding.title.includes('Auth')) {
                policy.recommendations.push('Enable authentication for all external connections');
                policy.recommendations.push('Use OAuth 2.0 or API keys stored in environment variables');
            }
            if (finding.title.includes('Encryption') || finding.title.includes('HTTPS')) {
                policy.recommendations.push('Use HTTPS/TLS for all network communications');
                policy.recommendations.push('Enable SSL certificate verification');
            }
            if (finding.title.includes('Logging') || finding.title.includes('Audit')) {
                policy.audit_required = true;
                policy.recommendations.push('Enable audit logging for all operations');
                policy.recommendations.push('Never log sensitive data like passwords or tokens');
            }
        }
        const hasCritical = findings.some(f => f.severity === 'critical');
        const hasHigh = findings.some(f => f.severity === 'high');
        if (hasCritical || hasHigh) {
            policy.approval_required = true;
            policy.audit_required = true;
        }
        policy.max_scope_explanation = this.generateMaxScopeExplanation(policy);
        policy.allowlist = [...new Set(policy.allowlist)];
        policy.blocked_paths = [...new Set(policy.blocked_paths)];
        policy.blocked_commands = [...new Set(policy.blocked_commands)];
        policy.environment_variables.recommended = [...new Set(policy.environment_variables.recommended)];
        policy.recommendations = [...new Set(policy.recommendations)];
        return policy;
    }
    generateMaxScopeExplanation(policy) {
        const parts = [];
        if (policy.allowlist.length > 0) {
            parts.push(`File access limited to: ${policy.allowlist.slice(0, 2).join(', ')}`);
        }
        if (policy.blocked_paths.length > 0) {
            parts.push(`System directories blocked: ${policy.blocked_paths.slice(0, 3).join(', ')}`);
        }
        if (policy.blocked_commands.length > 0) {
            parts.push(`Dangerous commands blocked: ${policy.blocked_commands.slice(0, 3).join(', ')}`);
        }
        if (policy.approval_required) {
            parts.push('User approval required for all operations');
        }
        if (policy.audit_required) {
            parts.push('All operations logged for audit');
        }
        if (parts.length === 0) {
            return 'Apply principle of least privilege: only grant minimum necessary permissions.';
        }
        return parts.join('. ') + '.';
    }
    generateId() {
        return Math.random().toString(36).substring(2, 11);
    }
}
export const scanner = new MCPShieldScanner();
export default MCPShieldScanner;
//# sourceMappingURL=scanner.js.map