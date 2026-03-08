/**
 * SESC-MCP Zod Schemas
 * Shared Zod input schemas for all MCP tool registrations.
 */

import { z } from "zod";

// ---------------------------------------------------------------------------
// Primitive schemas
// ---------------------------------------------------------------------------

export const SeverityLevelSchema = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "info",
]);

export const PatchStrategySchema = z.enum([
  "input-sanitization",
  "parameterized-query",
  "output-encoding",
  "secret-removal",
  "dependency-update",
  "access-control",
  "crypto-upgrade",
  "path-validation",
  "error-handling",
  "manual",
]);

// ---------------------------------------------------------------------------
// CodeFile schema  (used by every agent that accepts source code)
// ---------------------------------------------------------------------------

export const CodeFileSchema = z.object({
  name: z.string().describe("File name with extension, e.g. app.ts"),
  content: z.string().describe("Full source code content of the file"),
  language: z
    .string()
    .optional()
    .describe("Language hint (auto-detected from extension if omitted)"),
});

export const CodeFilesArraySchema = z
  .array(CodeFileSchema)
  .min(1)
  .describe("Array of source code files to analyse");

// ---------------------------------------------------------------------------
// Vulnerability schema  (returned by scanner, consumed by other agents)
// ---------------------------------------------------------------------------

export const VulnerabilitySchema = z.object({
  id: z.string(),
  type: z.enum([
    "vulnerability",
    "secret",
    "dependency",
    "code-quality",
    "security-misconfiguration",
  ]),
  severity: SeverityLevelSchema,
  title: z.string(),
  description: z.string(),
  file: z.string().optional(),
  line: z.number().int().positive().optional(),
  column: z.number().int().nonnegative().optional(),
  recommendation: z.string().optional(),
  cwe: z.string().optional(),
  owasp: z.string().optional(),
  snippet: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Scanner tools
// ---------------------------------------------------------------------------

export const ScanFileInputSchema = z.object({
  name: z.string().describe("File name with extension"),
  content: z.string().describe("Full source code content"),
  language: z.string().optional().describe("Optional language override"),
});

export const ScanCodebaseInputSchema = z.object({
  files: CodeFilesArraySchema,
  severityThreshold: SeverityLevelSchema.optional()
    .default("info")
    .describe("Minimum severity level to include in results"),
});

export const DetectSecretsInputSchema = z.object({
  name: z.string().describe("File name"),
  content: z.string().describe("Source code content to scan for secrets"),
});

export const ScanDependenciesInputSchema = z.object({
  packageJson: z
    .string()
    .describe("Contents of the package.json (or requirements.txt) file"),
  ecosystem: z
    .enum(["npm", "pip", "maven", "gradle", "gem"])
    .optional()
    .default("npm")
    .describe("Package ecosystem"),
});

export const AnalyzeDataFlowInputSchema = z.object({
  name: z.string().describe("File name"),
  content: z.string().describe("Source code content to trace data flows in"),
});

export const CalculateMetricsInputSchema = z.object({
  findings: z
    .array(VulnerabilitySchema)
    .describe("Vulnerability findings to compute metrics from"),
  totalLines: z.number().int().nonnegative().optional().default(0),
  totalFiles: z.number().int().nonnegative().optional().default(1),
});

// ---------------------------------------------------------------------------
// Exploit simulation tools
// ---------------------------------------------------------------------------

export const BuildExploitGraphInputSchema = z.object({
  files: CodeFilesArraySchema,
  scanResults: z
    .array(VulnerabilitySchema)
    .describe("Vulnerability scan results to build the graph from"),
});

export const SimulateExploitInputSchema = z.object({
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    attackPaths: z.array(z.any()),
  }),
  vulnerabilityId: z
    .string()
    .describe("ID of the vulnerability to simulate exploitation for"),
});

export const GetAttackPathsInputSchema = z.object({
  graph: z.object({
    nodes: z.array(z.any()),
    edges: z.array(z.any()),
    attackPaths: z.array(z.any()),
  }),
  maxPaths: z
    .number()
    .int()
    .positive()
    .optional()
    .default(5)
    .describe("Maximum number of attack paths to return"),
  minRiskScore: z
    .number()
    .min(0)
    .max(10)
    .optional()
    .default(0)
    .describe("Minimum risk score threshold"),
});

// ---------------------------------------------------------------------------
// Patch generation tools
// ---------------------------------------------------------------------------

export const GeneratePatchInputSchema = z.object({
  vulnerability: VulnerabilitySchema,
  fileContent: z.string().describe("Current content of the affected file"),
  strategy: PatchStrategySchema.optional().describe(
    "Patch strategy hint (auto-selected if omitted)"
  ),
});

export const PreviewPatchInputSchema = z.object({
  originalContent: z.string().describe("Original file content"),
  patchedContent: z.string().describe("Patched file content"),
  filename: z
    .string()
    .optional()
    .default("file")
    .describe("File name for diff header"),
});

export const ApplyPatchInputSchema = z.object({
  originalContent: z.string().describe("Original file content"),
  patchedContent: z.string().describe("The patched content to apply"),
});

// ---------------------------------------------------------------------------
// Validation tools
// ---------------------------------------------------------------------------

export const ValidatePatchInputSchema = z.object({
  originalContent: z.string().describe("Original file content before patch"),
  patchedContent: z.string().describe("Patched file content"),
  language: z.string().optional().describe("Language of the file"),
  filename: z.string().optional().default("file"),
  vulnerability: VulnerabilitySchema.optional().describe(
    "The vulnerability the patch targets"
  ),
});

export const RunRegressionInputSchema = z.object({
  originalContent: z.string(),
  patchedContent: z.string(),
  filename: z.string().optional().default("file"),
  testCases: z
    .array(
      z.object({
        input: z.string(),
        expectedBehavior: z.string(),
      })
    )
    .optional()
    .describe("Optional test cases for behavioral comparison"),
});

export const CheckConfidenceInputSchema = z.object({
  validationResult: z.object({
    staticValid: z.boolean(),
    syntaxValid: z.boolean(),
    regressionPassed: z.boolean(),
    vulnerabilityResolved: z.boolean(),
    issuesIntroduced: z.array(z.any()),
    details: z.string(),
  }),
  vulnerability: VulnerabilitySchema,
  patchStrategy: PatchStrategySchema.optional(),
});

// ---------------------------------------------------------------------------
// Risk optimization tools
// ---------------------------------------------------------------------------

export const OptimizePatchesInputSchema = z.object({
  patches: z
    .array(
      z.object({
        id: z.string(),
        vulnerabilityId: z.string(),
        confidence: z.number().min(0).max(1),
        instabilityCost: z.number().min(0),
        strategy: PatchStrategySchema,
      })
    )
    .min(1)
    .describe("List of patches to optimize"),
  vulnerabilities: z
    .array(VulnerabilitySchema)
    .describe("Corresponding vulnerabilities"),
});

export const CalculateRiskScoreInputSchema = z.object({
  vulnerabilities: z
    .array(VulnerabilitySchema)
    .describe("All discovered vulnerabilities"),
  appliedPatchIds: z
    .array(z.string())
    .optional()
    .default([])
    .describe("IDs of patches already applied"),
  patchVulnMap: z
    .record(z.string(), z.string())
    .optional()
    .default({})
    .describe("Map of patchId -> vulnerabilityId"),
});

// ---------------------------------------------------------------------------
// Memory tools
// ---------------------------------------------------------------------------

export const QueryMemoryInputSchema = z.object({
  issueType: z
    .string()
    .optional()
    .describe("Filter by issue type (e.g. vulnerability, secret)"),
  language: z.string().optional().describe("Filter by programming language"),
  cwe: z.string().optional().describe("Filter by CWE identifier (e.g. CWE-89)"),
  limit: z
    .number()
    .int()
    .positive()
    .optional()
    .default(10)
    .describe("Maximum records to return"),
});

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export const FullPipelineInputSchema = z.object({
  files: CodeFilesArraySchema,
  severityThreshold: SeverityLevelSchema.optional().default("low"),
  maxAttackPaths: z.number().int().positive().optional().default(5),
  confidenceThreshold: z
    .number()
    .min(0)
    .max(1)
    .optional()
    .default(0.7)
    .describe("Minimum confidence score to accept a patch"),
});
