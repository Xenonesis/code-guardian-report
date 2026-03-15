/**
 * MCP Zod Schemas
 *
 * Input validation schemas for all 19 MCP tools.
 * These are Zod raw shapes (not z.object()), matching McpServer.registerTool() API.
 */

import { z } from "zod";

// ── Scanner Tools ───────────────────────────────────────────────────

export const ScanFileSchema = {
  code: z.string().describe("Source code content to analyze"),
  filename: z.string().describe("Filename including extension (e.g. 'app.ts')"),
  language: z
    .string()
    .optional()
    .describe("Language override (auto-detected if omitted)"),
};

export const ScanCodebaseSchema = {
  files: z
    .array(
      z.object({
        filename: z.string(),
        code: z.string(),
      })
    )
    .describe("Array of {filename, code} objects to scan"),
};

export const DetectSecretsSchema = {
  code: z.string().describe("Source code content to scan for secrets"),
  filename: z.string().describe("Filename for context"),
};

export const ScanDependenciesSchema = {
  packageJson: z.string().describe("Contents of package.json file"),
  lockfile: z
    .string()
    .optional()
    .describe("Contents of package-lock.json or yarn.lock (optional)"),
};

// ── Data Flow ───────────────────────────────────────────────────────

export const AnalyzeDataFlowSchema = {
  code: z
    .string()
    .describe("Source code to analyze for data flow vulnerabilities"),
  filename: z.string().describe("Filename for context"),
  language: z
    .string()
    .optional()
    .describe("Language hint (auto-detected if omitted)"),
};

// ── Metrics ─────────────────────────────────────────────────────────

export const CalculateMetricsSchema = {
  code: z.string().describe("Source code content"),
  filename: z.string().describe("Filename for context"),
  issuesJson: z
    .string()
    .optional()
    .describe(
      "JSON-encoded SecurityIssue[] from a prior scan (used for density calc)"
    ),
};

// ── Exploit Simulation ──────────────────────────────────────────────

export const BuildExploitGraphSchema = {
  issuesJson: z
    .string()
    .describe("JSON-encoded SecurityIssue[] from a prior scan"),
};

export const SimulateExploitSchema = {
  issuesJson: z
    .string()
    .describe("JSON-encoded SecurityIssue[] from a prior scan"),
  cweFilter: z
    .array(z.string())
    .optional()
    .describe(
      "Optional CWE IDs to focus simulation on (e.g. ['CWE-79','CWE-89'])"
    ),
};

export const GetAttackPathsSchema = {
  issuesJson: z
    .string()
    .describe("JSON-encoded SecurityIssue[] from a prior scan"),
  maxPaths: z
    .number()
    .int()
    .min(1)
    .max(50)
    .optional()
    .describe("Maximum number of attack paths to return (default: 10)"),
};

// ── Patch Generation ────────────────────────────────────────────────

export const GeneratePatchSchema = {
  issueJson: z
    .string()
    .describe("JSON-encoded SecurityIssue to generate a fix for"),
  code: z
    .string()
    .describe("Original source code containing the vulnerability"),
  filename: z.string().describe("Filename of the source"),
};

export const PreviewPatchSchema = {
  originalCode: z.string().describe("Original source code"),
  patchedCode: z.string().describe("Patched source code"),
  filename: z.string().describe("Filename for diff header"),
};

export const ApplyPatchSchema = {
  originalCode: z.string().describe("Original source code"),
  patchedCode: z.string().describe("Patched source code to apply"),
  filename: z.string().describe("Target filename"),
  dryRun: z
    .boolean()
    .optional()
    .describe(
      "If true, return the result without writing to disk (default: true)"
    ),
};

// ── Validation ──────────────────────────────────────────────────────

export const ValidatePatchSchema = {
  originalCode: z.string().describe("Original source code (before patch)"),
  patchedCode: z.string().describe("Patched source code (after patch)"),
  filename: z.string().describe("Filename of the source"),
  issueId: z.string().describe("ID of the issue the patch targets"),
};

export const RunRegressionSchema = {
  originalCode: z.string().describe("Original source code"),
  patchedCode: z.string().describe("Patched source code"),
  filename: z.string().describe("Filename of the source"),
};

export const CheckConfidenceSchema = {
  issueJson: z.string().describe("JSON-encoded SecurityIssue to evaluate"),
  code: z.string().describe("Source code containing the issue"),
};

// ── Risk Optimization ───────────────────────────────────────────────

export const OptimizePatchesSchema = {
  issuesJson: z.string().describe("JSON-encoded SecurityIssue[] to prioritize"),
  maxEffort: z
    .enum(["Low", "Medium", "High"])
    .optional()
    .describe("Maximum remediation effort to include (default: 'High')"),
};

export const CalculateRiskScoreSchema = {
  issueJson: z
    .string()
    .describe("JSON-encoded SecurityIssue to calculate CVSS/risk score for"),
};

// ── Memory ──────────────────────────────────────────────────────────

export const QueryMemorySchema = {
  sessionId: z.string().optional().describe("Filter by session ID"),
  type: z
    .enum([
      "scan_result",
      "exploit_simulation",
      "patch",
      "validation",
      "pipeline_run",
      "note",
    ])
    .optional()
    .describe("Filter by memory entry type"),
  tags: z.array(z.string()).optional().describe("Filter by tags (AND logic)"),
  limit: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .describe("Max entries to return (default: 20)"),
  searchText: z
    .string()
    .optional()
    .describe("Free-text search across summaries"),
};

// ── Pipeline ────────────────────────────────────────────────────────

export const FullSecurityPipelineSchema = {
  code: z.string().describe("Source code to run the full security pipeline on"),
  filename: z.string().describe("Filename of the source"),
  includeExploitSim: z
    .boolean()
    .optional()
    .describe("Include exploit simulation (default: true)"),
  includePatchGen: z
    .boolean()
    .optional()
    .describe("Generate patches for found issues (default: true)"),
};
