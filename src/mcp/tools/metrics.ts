/**
 * MCP Metrics Tool
 *
 * Tool: calculate_metrics
 * Wraps: MetricsCalculator + calculateSecurityScore
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { MetricsCalculator } from "@/services/analysis/MetricsCalculator";
import { calculateSecurityScore } from "@/services/security/securityAnalysisEngine";
import type { MemoryStore } from "../memory/database.js";
import { CalculateMetricsSchema } from "../shared/zod-schemas.js";
import {
  toTextContent,
  toErrorResult,
  parseIssuesJson,
} from "../shared/utils.js";

export function registerMetricsTools(
  server: McpServer,
  memory: MemoryStore
): void {
  server.registerTool(
    "calculate_metrics",
    {
      title: "Calculate Metrics",
      description:
        "Calculate security score, code quality metrics, vulnerability density, " +
        "technical debt, and maintainability index for source code. " +
        "Optionally accepts issues from a prior scan for density calculations.",
      inputSchema: CalculateMetricsSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ code, filename, issuesJson }) => {
      try {
        const calc = new MetricsCalculator();
        const linesAnalyzed = code.split("\n").length;
        const issues = issuesJson ? parseIssuesJson(issuesJson) : [];

        const summary = calc.calculateSummaryMetrics(issues, linesAnalyzed);
        const detailed = calc.calculateDetailedMetrics(issues, linesAnalyzed);
        const securityScore = calculateSecurityScore(issues);

        const result = {
          filename,
          linesAnalyzed,
          securityScore,
          summary,
          detailed,
        };

        await memory.save({
          sessionId: "default",
          type: "scan_result",
          summary: `Metrics for ${filename}: security=${securityScore}, quality=${summary.qualityScore}`,
          data: result,
          tags: ["metrics", filename],
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
