/**
 * Core Security Types
 *
 * Canonical type definitions for SecurityIssue and AnalysisResults.
 * Extracted from src/hooks/useAnalysis.ts so that pure Node.js code
 * (services, MCP server, CLI tools) can import them without pulling
 * in React dependencies.
 *
 * The hook file re-exports these types for backward compatibility,
 * so existing UI code is unaffected.
 */

import type { DetectionResult } from "@/services/detection/languageDetectionService";
import type { ZipAnalysisResult } from "@/services/security/zipAnalysisService";
import type { DependencyScanResult } from "@/services/security/dependencyVulnerabilityScanner";

export interface SecurityIssue {
  id: string;
  line: number;
  column?: number;
  endLine?: number;
  endColumn?: number;
  startColumn?: number; // Alternative naming for column ranges
  tool: string;
  type: string;
  category: string; // OWASP category
  message: string;
  naturalLanguageDescription?: string; // Simplified natural language summary
  severity: "Critical" | "High" | "Medium" | "Low";
  confidence: number; // 0-100
  cvssScore?: number; // 0-10
  cweId?: string; // CWE reference
  cveId?: string; // CVE reference
  owaspCategory?: string; // OWASP Top 10 category
  recommendation: string;
  remediation: {
    description: string;
    codeExample?: string;
    fixExample?: string;
    effort: "Low" | "Medium" | "High";
    priority: number; // 1-5
  };
  filename: string;
  codeSnippet?: string;
  riskRating: "Critical" | "High" | "Medium" | "Low";
  impact: string;
  likelihood: string;
  references?: string[];
  tags?: string[];
  aiSummary?: string; // AI-generated summary
  affectedFunction?: string; // Function where issue was found
  effort?: "Low" | "Medium" | "High"; // Remediation effort (duplicate of remediation.effort for backward compat)
}

export interface AnalysisResults {
  issues: SecurityIssue[];
  totalFiles: number;
  analysisTime: string;
  summary: {
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    securityScore: number; // 0-100
    qualityScore: number; // 0-100
    coveragePercentage: number;
    linesAnalyzed: number;
  };
  languageDetection?: DetectionResult; // Smart language detection results
  metrics: {
    vulnerabilityDensity: number;
    technicalDebt: string;
    maintainabilityIndex: number;
    duplicatedLines: number;
    testCoverage?: number;
  };
  dependencies?: {
    total: number;
    vulnerable: number;
    outdated: number;
    licenses: string[];
  };
  zipAnalysis?: ZipAnalysisResult;
  dependencyAnalysis?: DependencyScanResult;
}
