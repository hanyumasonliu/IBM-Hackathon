import { ScanResult, ReportOptions } from './types';
/**
 * Generates professional markdown reports from scan results
 */
export declare class ReportGenerator {
    /**
     * Generate a complete markdown report
     */
    generate(result: ScanResult, options?: ReportOptions): string;
    private generateHeader;
    private generateExecutiveSummary;
    private generateRiskScoreSection;
    private generateComparisonSection;
    private generateTop5Risks;
    private generateEvidenceTable;
    private generateRecommendedFixes;
    private generatePolicySection;
    private generateTechnicalDetails;
    private generateAppendix;
    private getRiskEmoji;
    private getSeverityEmoji;
    private getSeverityWeight;
    private generateRiskBar;
    private formatDiff;
}
