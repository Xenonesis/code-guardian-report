/**
 * MCP Pipeline Tool
 *
 * Tool: full_security_pipeline
 * Orchestrates scan_file + detect_secrets + analyze_data_flow +
 * calculate_metrics into a single comprehensive analysis.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SecurityAnalyzer } from "@/services/analysis/SecurityAnalyzer";
import { SecretDetectionService } from "@/services/security/secretDetectionService";
import { DataFlowAnalyzer } from "@/services/analysis/DataFlowAnalyzer";
import { MetricsCalculator } from "@/services/analysis/MetricsCalculator";
import { calculateSecurityScore } from "@/services/security/securityAnalysisEngine";
import type { SecurityIssue } from "@/types/security-types";
import type { MemoryStore } from "../memory/database.js";
import { FullSecurityPipelineSchema } from "../shared/zod-schemas.js";
import { toTextContent, toErrorResult } from "../shared/utils.js";

export function registerPipelineTools(
  server: McpServer,
  memory: MemoryStore
): void {
  server.registerTool(
    "full_security_pipeline",
    {
      title: "Full Security Pipeline",
      description:
        "Run a comprehensive security analysis pipeline on source code. " +
        "Combines: static analysis (AST-based), secret detection, data flow " +
        "taint analysis, and code quality metrics. Optionally includes exploit " +
        "simulation and patch generation for found issues.",
      inputSchema: FullSecurityPipelineSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ code, filename, includeExploitSim, includePatchGen }) => {
      try {
        const startMs = performance.now();
        const linesAnalyzed = code.split("\n").length;

        // ── Step 1: Static Analysis ───────────────────────────────
        const analyzer = new SecurityAnalyzer();
        await analyzer.initializeAnalysisContext([{ filename, content: code }]);
        const staticIssues = analyzer.analyzeFile(filename, code);

        // ── Step 2: Secret Detection ──────────────────────────────
        const secretService = new SecretDetectionService();
        const secretResult = secretService.detectSecrets(code);

        // ── Step 3: Data Flow Analysis ────────────────────────────
        let dataFlowIssues: SecurityIssue[] = [];
        const jsExtensions = [".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"];
        const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
        if (jsExtensions.includes(ext)) {
          const dfAnalyzer = new DataFlowAnalyzer();
          dataFlowIssues = dfAnalyzer.analyzeDataFlow([
            { filename, content: code },
          ]);
        }

        // ── Step 4: Metrics ───────────────────────────────────────
        const allIssues = [...staticIssues, ...dataFlowIssues];
        // Deduplicate by id
        const seenIds = new Set<string>();
        const dedupedIssues = allIssues.filter((i) => {
          if (seenIds.has(i.id)) return false;
          seenIds.add(i.id);
          return true;
        });

        const calc = new MetricsCalculator();
        const summary = calc.calculateSummaryMetrics(
          dedupedIssues,
          linesAnalyzed
        );
        const detailed = calc.calculateDetailedMetrics(
          dedupedIssues,
          linesAnalyzed
        );
        const securityScore = calculateSecurityScore(dedupedIssues);

        // ── Step 5: Optional Exploit Simulation ───────────────────
        let exploitSummary = null;
        if (includeExploitSim !== false && dedupedIssues.length > 0) {
          // Build exploit chains from CWE relationships
          const byCwe = new Map<string, number>();
          for (const issue of dedupedIssues) {
            if (issue.cweId) {
              byCwe.set(issue.cweId, (byCwe.get(issue.cweId) ?? 0) + 1);
            }
          }
          exploitSummary = {
            totalVulnerableCWEs: byCwe.size,
            cweDistribution: Object.fromEntries(byCwe),
            recommendation:
              "Use build_exploit_graph and simulate_exploit tools for detailed analysis",
          };
        }

        // ── Step 6: Optional Patch Suggestions ────────────────────
        let patchSummary = null;
        if (includePatchGen !== false && dedupedIssues.length > 0) {
          const criticalAndHigh = dedupedIssues.filter(
            (i) => i.severity === "Critical" || i.severity === "High"
          );
          patchSummary = {
            patchableIssues: criticalAndHigh.length,
            totalIssues: dedupedIssues.length,
            recommendation:
              "Use generate_patch tool for each issue to get specific code fixes",
          };
        }

        const elapsed = Math.round(performance.now() - startMs);

        const result = {
          filename,
          linesAnalyzed,
          analysisTimeMs: elapsed,
          securityScore,
          issues: {
            total: dedupedIssues.length,
            static: staticIssues.length,
            dataFlow: dataFlowIssues.length,
            secrets: secretResult.totalSecrets,
            bySevertiy: {
              critical: summary.criticalIssues,
              high: summary.highIssues,
              medium: summary.mediumIssues,
              low: summary.lowIssues,
            },
          },
          secretDetection: {
            totalSecrets: secretResult.totalSecrets,
            highConfidence: secretResult.highConfidenceSecrets,
            riskScore: secretResult.riskScore,
            types: secretResult.secretTypes,
          },
          metrics: {
            summary,
            detailed,
          },
          exploitSimulation: exploitSummary,
          patchGeneration: patchSummary,
          allIssues: dedupedIssues,
        };

        await memory.save({
          sessionId: "default",
          type: "pipeline_run",
          summary: `Pipeline: ${filename} — ${dedupedIssues.length} issues, score ${securityScore}, ${elapsed}ms`,
          data: {
            filename,
            issueCount: dedupedIssues.length,
            securityScore,
            elapsed,
          },
          tags: ["pipeline", filename],
        });

        return { content: [toTextContent(result)] };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );
}
