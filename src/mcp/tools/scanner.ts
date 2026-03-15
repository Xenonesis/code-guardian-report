/**
 * MCP Scanner Tools
 *
 * Tools: scan_file, scan_codebase, detect_secrets, scan_dependencies
 * Wraps: SecurityAnalyzer, SecretDetectionService, DependencyVulnerabilityScanner
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SecurityAnalyzer } from "@/services/analysis/SecurityAnalyzer";
import { SecretDetectionService } from "@/services/security/secretDetectionService";
import { DependencyVulnerabilityScanner } from "@/services/security/dependencyVulnerabilityScanner";
import type { MemoryStore } from "../memory/database.js";
import {
  ScanFileSchema,
  ScanCodebaseSchema,
  DetectSecretsSchema,
  ScanDependenciesSchema,
} from "../shared/zod-schemas.js";
import { toTextContent, toErrorResult } from "../shared/utils.js";

export function registerScannerTools(
  server: McpServer,
  memory: MemoryStore
): void {
  // ── scan_file ─────────────────────────────────────────────────
  server.registerTool(
    "scan_file",
    {
      title: "Scan File",
      description:
        "Analyze a single source file for security vulnerabilities using AST-based " +
        "static analysis. Returns SecurityIssue[] with severity, CVSS, CWE, and remediation.",
      inputSchema: ScanFileSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ code, filename, language }) => {
      try {
        const startMs = performance.now();
        const analyzer = new SecurityAnalyzer();

        // Initialize context for framework-aware rules
        await analyzer.initializeAnalysisContext([{ filename, content: code }]);

        const issues = analyzer.analyzeFile(filename, code);
        const elapsed = Math.round(performance.now() - startMs);

        // Persist to memory
        await memory.save({
          sessionId: "default",
          type: "scan_result",
          summary: `Scanned ${filename}: ${issues.length} issue(s) in ${elapsed}ms`,
          data: { filename, issueCount: issues.length, elapsed },
          tags: ["scan", filename],
        });

        return {
          content: [
            toTextContent({
              filename,
              language: language ?? "auto-detected",
              issueCount: issues.length,
              analysisTimeMs: elapsed,
              issues,
            }),
          ],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );

  // ── scan_codebase ─────────────────────────────────────────────
  server.registerTool(
    "scan_codebase",
    {
      title: "Scan Codebase",
      description:
        "Analyze multiple source files for security vulnerabilities. " +
        "Provide an array of {filename, code} objects. Returns aggregated results.",
      inputSchema: ScanCodebaseSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ files }) => {
      try {
        const startMs = performance.now();
        const analyzer = new SecurityAnalyzer();

        await analyzer.initializeAnalysisContext(
          files.map((f) => ({ filename: f.filename, content: f.code }))
        );

        const allIssues = files.flatMap((f) =>
          analyzer.analyzeFile(f.filename, f.code)
        );
        const elapsed = Math.round(performance.now() - startMs);

        const summary = {
          totalFiles: files.length,
          totalIssues: allIssues.length,
          critical: allIssues.filter((i) => i.severity === "Critical").length,
          high: allIssues.filter((i) => i.severity === "High").length,
          medium: allIssues.filter((i) => i.severity === "Medium").length,
          low: allIssues.filter((i) => i.severity === "Low").length,
          analysisTimeMs: elapsed,
        };

        await memory.save({
          sessionId: "default",
          type: "scan_result",
          summary: `Codebase scan: ${files.length} files, ${allIssues.length} issue(s) in ${elapsed}ms`,
          data: { summary, fileNames: files.map((f) => f.filename) },
          tags: ["scan", "codebase"],
        });

        return {
          content: [toTextContent({ summary, issues: allIssues })],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );

  // ── detect_secrets ────────────────────────────────────────────
  server.registerTool(
    "detect_secrets",
    {
      title: "Detect Secrets",
      description:
        "Scan source code for hardcoded secrets, API keys, tokens, and credentials " +
        "using pattern matching and entropy analysis.",
      inputSchema: DetectSecretsSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ code, filename }) => {
      try {
        const service = new SecretDetectionService();
        const result = service.detectSecrets(code);

        // Redact actual secret values in the response
        const sanitized = {
          ...result,
          secrets: result.secrets.map((s) => ({
            ...s,
            value: s.value.slice(0, 4) + "****" + s.value.slice(-2),
          })),
        };

        await memory.save({
          sessionId: "default",
          type: "scan_result",
          summary: `Secret scan of ${filename}: ${result.totalSecrets} secret(s) found`,
          data: {
            filename,
            totalSecrets: result.totalSecrets,
            riskScore: result.riskScore,
          },
          tags: ["secrets", filename],
        });

        return {
          content: [toTextContent({ filename, ...sanitized })],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );

  // ── scan_dependencies ─────────────────────────────────────────
  server.registerTool(
    "scan_dependencies",
    {
      title: "Scan Dependencies",
      description:
        "Scan package.json (and optional lockfile) for known vulnerabilities, " +
        "outdated packages, license issues, and supply-chain risks.",
      inputSchema: ScanDependenciesSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ packageJson, lockfile }) => {
      try {
        const scanner = new DependencyVulnerabilityScanner();
        const files: Array<{ name: string; content: string }> = [
          { name: "package.json", content: packageJson },
        ];
        if (lockfile) {
          files.push({ name: "package-lock.json", content: lockfile });
        }

        const result = await scanner.scanDependencies(files);

        await memory.save({
          sessionId: "default",
          type: "scan_result",
          summary: `Dependency scan: ${result.summary.totalPackages} packages, ${result.summary.vulnerablePackages} vulnerable`,
          data: { summary: result.summary },
          tags: ["dependencies"],
        });

        return {
          content: [toTextContent(result)],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );
}
