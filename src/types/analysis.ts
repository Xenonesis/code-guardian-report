// Analysis-related types

export interface AnalysisResult {
  id: string;
  fileName: string;
  fileSize: number;
  analysisType: AnalysisType;
  securityIssues: SecurityIssue[];
  metrics: AnalysisMetrics;
  timestamp: Date;
  duration: number;
  status: AnalysisStatus;
}

export type AnalysisType = 'security' | 'quality' | 'performance' | 'full';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface SecurityIssue {
  id: string;
  type: SecurityIssueType;
  severity: SeverityLevel;
  title: string;
  description: string;
  line?: number;
  column?: number;
  file?: string;
  recommendation?: string;
  cwe?: string;
  owasp?: string;
}

export type SecurityIssueType = 
  | 'vulnerability'
  | 'secret'
  | 'dependency'
  | 'code-quality'
  | 'performance'
  | 'security-misconfiguration';

export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low' | 'info';

export interface AnalysisMetrics {
  totalLines: number;
  totalFiles: number;
  codeComplexity: number;
  securityScore: number;
  qualityScore: number;
  performanceScore: number;
  maintainabilityIndex: number;
  testCoverage?: number;
}

export interface FrameworkDetection {
  framework: string;
  version?: string;
  confidence: number;
  files: string[];
}

export interface LanguageDetection {
  language: string;
  percentage: number;
  files: string[];
  totalLines: number;
}

// Upload types
export interface UploadFile {
  file: File;
  id: string;
  status: UploadStatus;
  progress: number;
  error?: string;
}

export type UploadStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

// Analysis configuration
export interface AnalysisConfig {
  includeTests: boolean;
  includeDependencies: boolean;
  severityThreshold: SeverityLevel;
  customRules: CustomRule[];
  outputFormat: OutputFormat[];
}

export interface CustomRule {
  id: string;
  name: string;
  pattern: string;
  severity: SeverityLevel;
  message: string;
  enabled: boolean;
}

export type OutputFormat = 'json' | 'pdf' | 'html' | 'csv' | 'sarif';