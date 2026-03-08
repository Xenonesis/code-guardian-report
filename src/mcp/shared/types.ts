/**
 * SESC-MCP Shared Types
 * Core types shared across all agents in the Self-Evolving Secure Codebase framework.
 */

// ---------------------------------------------------------------------------
// Input file format (what AI clients send to all tools)
// ---------------------------------------------------------------------------

export interface CodeFile {
  name: string;
  content: string;
  language?: string;
}

// ---------------------------------------------------------------------------
// Vulnerability / Finding  (mirrors src/types/analysis.ts but standalone)
// ---------------------------------------------------------------------------

export type SeverityLevel = "critical" | "high" | "medium" | "low" | "info";

export type SecurityIssueType =
  | "vulnerability"
  | "secret"
  | "dependency"
  | "code-quality"
  | "security-misconfiguration";

export interface Vulnerability {
  id: string;
  type: SecurityIssueType;
  severity: SeverityLevel;
  title: string;
  description: string;
  file?: string;
  line?: number;
  column?: number;
  recommendation?: string;
  cwe?: string;
  owasp?: string;
  /** Raw source snippet for context */
  snippet?: string;
}

// ---------------------------------------------------------------------------
// Exploit graph types  (Agent 2)
// ---------------------------------------------------------------------------

export interface GraphNode {
  id: string;
  label: string;
  type: "entry" | "sink" | "propagation" | "component";
  file?: string;
  line?: number;
  vulnerabilityIds: string[];
}

export interface GraphEdge {
  from: string;
  to: string;
  label: string;
  type: "data-flow" | "control-flow" | "call" | "dependency";
}

export interface ExploitGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
  /** Ranked attack paths */
  attackPaths: AttackPath[];
}

export interface AttackPath {
  id: string;
  nodes: string[];
  riskScore: number;
  exploitProbability: number;
  impact: number;
  narrative: string;
}

// ---------------------------------------------------------------------------
// Patch types  (Agent 3)
// ---------------------------------------------------------------------------

export interface Patch {
  id: string;
  vulnerabilityId: string;
  file: string;
  originalContent: string;
  patchedContent: string;
  diff: string;
  strategy: PatchStrategy;
  explanation: string;
  confidence: number;
  instabilityCost: number;
}

export type PatchStrategy =
  | "input-sanitization"
  | "parameterized-query"
  | "output-encoding"
  | "secret-removal"
  | "dependency-update"
  | "access-control"
  | "crypto-upgrade"
  | "path-validation"
  | "error-handling"
  | "manual";

// ---------------------------------------------------------------------------
// Validation types  (Agent 4)
// ---------------------------------------------------------------------------

export interface ValidationResult {
  patchId: string;
  staticValid: boolean;
  syntaxValid: boolean;
  regressionPassed: boolean;
  vulnerabilityResolved: boolean;
  issuesIntroduced: Vulnerability[];
  confidenceScore: number;
  rollbackRecommended: boolean;
  details: string;
}

// ---------------------------------------------------------------------------
// Risk optimization types  (Agent 5)
// ---------------------------------------------------------------------------

export interface RiskScore {
  vulnerabilityId: string;
  residualRisk: number;
  exploitProbability: number;
  impact: number;
  cvssLike: number;
}

export interface OptimizationResult {
  orderedPatches: string[];
  totalResidualRisk: number;
  totalInstabilityCost: number;
  objectiveValue: number;
  explanation: string;
}

// ---------------------------------------------------------------------------
// Memory types  (Memory module)
// ---------------------------------------------------------------------------

export interface MemoryRecord {
  id: string;
  issueType: string;
  cwe?: string;
  language?: string;
  patchStrategy: PatchStrategy;
  validationSuccess: boolean;
  rolledBack: boolean;
  confidenceScore: number;
  createdAt: string;
  metadata?: Record<string, unknown>;
}

// ---------------------------------------------------------------------------
// Pipeline / Orchestrator types
// ---------------------------------------------------------------------------

export interface PipelineResult {
  scanResults: Vulnerability[];
  exploitGraph: ExploitGraph;
  patches: Patch[];
  validations: ValidationResult[];
  optimizationResult: OptimizationResult;
  summary: PipelineSummary;
}

export interface PipelineSummary {
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  patchesGenerated: number;
  patchesValidated: number;
  overallRiskScore: number;
  remediationCoverage: number;
}
