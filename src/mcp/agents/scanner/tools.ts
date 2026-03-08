/**
 * SESC-MCP Scanner Agent – Tool Registrations
 * Registers 6 MCP tools for the Scanner Agent.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ScanFileInputSchema,
  ScanCodebaseInputSchema,
  DetectSecretsInputSchema,
  ScanDependenciesInputSchema,
  AnalyzeDataFlowInputSchema,
  CalculateMetricsInputSchema,
} from "../../shared/zod-schemas.js";
import {
  scanFile,
  scanCodebase,
  detectSecrets,
  scanDependencies,
  analyzeDataFlow,
  calculateMetrics,
} from "./index.js";
import { enrichFile, enrichFiles, toJsonString } from "../../shared/utils.js";

export function registerScannerTools(server: McpServer): void {
  // -------------------------------------------------------------------------
  // 1. scan_file
  // -------------------------------------------------------------------------
  server.registerTool(
    "scan_file",
    {
      description:
        "Scan a single source code file for security vulnerabilities using " +
        "pattern matching and static analysis. Returns findings with severity, " +
        "CWE, OWASP category, line numbers, and remediation guidance.",
      inputSchema: ScanFileInputSchema.shape,
    },
    async ({ name, content, language }) => {
      const file = enrichFile({ name, content, language });
      const vulnerabilities = scanFile(file);

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              file: name,
              language: file.language,
              totalFindings: vulnerabilities.length,
              vulnerabilities,
            }),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 2. scan_codebase
  // -------------------------------------------------------------------------
  server.registerTool(
    "scan_codebase",
    {
      description:
        "Scan multiple source code files as a codebase. Performs cross-file " +
        "security analysis and returns aggregated vulnerability findings, metrics, " +
        "and OWASP/CWE coverage. Input an array of {name, content} objects.",
      inputSchema: ScanCodebaseInputSchema.shape,
    },
    async ({ files, severityThreshold }) => {
      const enriched = enrichFiles(
        files.map((f) => ({
          name: f.name,
          content: f.content,
          language: f.language ?? undefined,
        }))
      );

      const SEVERITY_ORDER = ["info", "low", "medium", "high", "critical"];
      const thresholdIndex = SEVERITY_ORDER.indexOf(
        severityThreshold ?? "info"
      );

      const result = scanCodebase(enriched);
      const filtered = result.vulnerabilities.filter(
        (v) => SEVERITY_ORDER.indexOf(v.severity) >= thresholdIndex
      );

      const metrics = calculateMetrics(filtered);

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              filesScanned: result.filesScanned,
              linesScanned: result.linesScanned,
              scanDurationMs: result.scanDurationMs,
              severityThreshold,
              totalFindings: filtered.length,
              metrics,
              vulnerabilities: filtered,
            }),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 3. detect_secrets
  // -------------------------------------------------------------------------
  server.registerTool(
    "detect_secrets",
    {
      description:
        "Scan a single file specifically for hardcoded secrets: API keys, " +
        "tokens, passwords, private keys, cloud credentials, etc. " +
        "Returns match locations and secret types.",
      inputSchema: DetectSecretsInputSchema.shape,
    },
    async ({ name, content }) => {
      const file = enrichFile({ name, content });
      const secrets = detectSecrets(file);

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              file: name,
              secretsFound: secrets.length,
              secrets,
            }),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 4. scan_dependencies
  // -------------------------------------------------------------------------
  server.registerTool(
    "scan_dependencies",
    {
      description:
        "Scan a package.json (npm) file for known vulnerable dependencies. " +
        "Returns CVE identifiers, severity levels, and upgrade recommendations.",
      inputSchema: ScanDependenciesInputSchema.shape,
    },
    async ({ packageJson }) => {
      const vulnerabilities = scanDependencies(packageJson);

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              vulnerableDependencies: vulnerabilities.length,
              vulnerabilities,
            }),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 5. analyze_data_flow
  // -------------------------------------------------------------------------
  server.registerTool(
    "analyze_data_flow",
    {
      description:
        "Perform taint / data-flow analysis on a source file. " +
        "Identifies sources of user-controlled input, dangerous sinks, " +
        "and potential taint propagation paths that could lead to injection attacks.",
      inputSchema: AnalyzeDataFlowInputSchema.shape,
    },
    async ({ name, content }) => {
      const file = enrichFile({ name, content });
      const result = analyzeDataFlow(file);

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              file: name,
              taintSources: result.taintSources.length,
              taintSinks: result.taintSinks.length,
              taintPaths: result.taintPaths.length,
              dataFlowAnalysis: result,
            }),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 6. calculate_metrics
  // -------------------------------------------------------------------------
  server.registerTool(
    "calculate_metrics",
    {
      description:
        "Calculate security metrics from a list of vulnerability findings. " +
        "Returns severity breakdown, security score (0-100), top CWE identifiers, " +
        "and counts by issue type.",
      inputSchema: CalculateMetricsInputSchema.shape,
    },
    async ({ findings, totalLines, totalFiles }) => {
      const metrics = calculateMetrics(
        findings.map((f) => ({
          ...f,
          type: f.type as import("../../shared/types.js").SecurityIssueType,
          severity: f.severity as import("../../shared/types.js").SeverityLevel,
        })),
        totalLines,
        totalFiles
      );

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString(metrics),
          },
        ],
      };
    }
  );
}
