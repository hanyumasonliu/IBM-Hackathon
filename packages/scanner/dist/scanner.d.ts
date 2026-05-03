import { ScanResult, ScanInput } from './types';
export declare class MCPShieldScanner {
    private severityWeights;
    scan(input: ScanInput): Promise<ScanResult>;
    private detectIssues;
    private isAgentToolsConfig;
    private scanPromptText;
    private countSeverities;
    private calculateRiskScore;
    private getRiskLevel;
    private generatePolicy;
    private generateMaxScopeExplanation;
    private generateId;
}
export declare const scanner: MCPShieldScanner;
export default MCPShieldScanner;
//# sourceMappingURL=scanner.d.ts.map