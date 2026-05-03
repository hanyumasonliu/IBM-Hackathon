/**
 * Types for report generation
 */

export interface ScanResult {
  overall_risk_score: number;
  risk_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'MINIMAL';
  severity_counts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  findings: Finding[];
  scanned_at: string;
  suggested_policy?: SafePolicy;
}

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  explanation: string;
  evidence: string;
  recommended_fix: string;
  affected_config_path: string;
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

export interface ComparisonData {
  before: ScanResult;
  after: ScanResult;
}

export interface ReportOptions {
  /** Title of the report */
  title?: string;
  
  /** Organization name */
  organization?: string;
  
  /** Project name */
  project?: string;
  
  /** List of scanned files/configs */
  scanned_files?: string[];
  
  /** Before/after comparison data */
  comparison?: ComparisonData;
  
  /** Include executive summary */
  include_executive_summary?: boolean;
  
  /** Include technical details */
  include_technical_details?: boolean;
}

// Made with Bob
