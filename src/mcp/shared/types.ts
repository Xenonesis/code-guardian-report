/**
 * MCP Shared Types
 *
 * Types specific to the MCP server layer. Domain types (SecurityIssue, etc.)
 * live in @/types/security-types and are NOT duplicated here.
 */

import type { SecurityIssue, AnalysisResults } from "@/types/security-types";

// ── Memory / Persistence ────────────────────────────────────────────

export interface MemoryEntry {
  id: string;
  sessionId: string;
  type:
    | "scan_result"
    | "exploit_simulation"
    | "patch"
    | "validation"
    | "pipeline_run"
    | "note";
  summary: string;
  data: Record<string, unknown>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface MemoryQuery {
  sessionId?: string;
  type?: MemoryEntry["type"];
  tags?: string[];
  limit?: number;
  since?: Date;
  searchText?: string;
}

// ── Tool Result Wrappers ────────────────────────────────────────────

export interface ScanResult {
  issues: SecurityIssue[];
  totalFiles: number;
  analysisTimeMs: number;
  summary: AnalysisResults["summary"];
}

export interface ExploitGraph {
  nodes: ExploitNode[];
  edges: ExploitEdge[];
  entryPoints: string[];
  criticalPaths: string[][];
}

export interface ExploitNode {
  id: string;
  issueId: string;
  type: string;
  severity: SecurityIssue["severity"];
  cweId?: string;
  label: string;
}

export interface ExploitEdge {
  source: string;
  target: string;
  relationship: "enables" | "escalates" | "chains_with" | "depends_on";
  description: string;
}

export interface ExploitSimulation {
  scenarioId: string;
  name: string;
  description: string;
  attackVector: string;
  cweIds: string[];
  steps: ExploitStep[];
  likelihood: "High" | "Medium" | "Low";
  impact: "Critical" | "High" | "Medium" | "Low";
  mitigations: string[];
}

export interface ExploitStep {
  order: number;
  action: string;
  target: string;
  precondition?: string;
  outcome: string;
}

export interface PatchSuggestion {
  issueId: string;
  filename: string;
  description: string;
  originalCode: string;
  patchedCode: string;
  diff: string;
  confidence: number; // 0-100
  effort: "Low" | "Medium" | "High";
  breakingChange: boolean;
}

export interface ValidationResult {
  patchId: string;
  valid: boolean;
  remainingIssues: SecurityIssue[];
  newIssues: SecurityIssue[];
  regressions: string[];
  confidenceScore: number; // 0-100
}

export interface RiskOptimization {
  prioritizedIssues: Array<{
    issue: SecurityIssue;
    riskScore: number;
    suggestedOrder: number;
    rationale: string;
  }>;
  totalRiskReduction: number;
  estimatedEffort: string;
}

// ── Server Configuration ────────────────────────────────────────────

export interface McpServerConfig {
  name: string;
  version: string;
  firebaseEnabled: boolean;
  maxFileSizeBytes: number;
  scanTimeoutMs: number;
  memoryTtlDays: number;
}

export const DEFAULT_CONFIG: McpServerConfig = {
  name: "code-guardian",
  version: "15.0.0",
  firebaseEnabled: true,
  maxFileSizeBytes: 10 * 1024 * 1024, // 10 MB
  scanTimeoutMs: 120_000, // 2 minutes
  memoryTtlDays: 30,
};
