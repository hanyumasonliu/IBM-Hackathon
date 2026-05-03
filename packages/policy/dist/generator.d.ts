import { PolicyInput, PolicyGenerationResult } from './types';
/**
 * Generates safe policy configurations from unsafe tool definitions
 */
export declare class PolicyGenerator {
    /**
     * Generate a safe policy from an unsafe configuration
     */
    generate(input: PolicyInput): PolicyGenerationResult;
    private generateFromMCPConfig;
    private generateFromAgentTools;
    private looksLikeCredential;
    private isDangerousTool;
    private generateMaxScopeExplanation;
    private generateSummary;
}
