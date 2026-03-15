/**
 * MCP Risk Optimizer Tools
 *
 * Tools: calculate_risk_score, optimize_patches
 * Wraps: calculateCVSSScore from securityAnalysisEngine + risk-based prioritization
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  calculateCVSSScore,
  calculateSecurityScore,
} from "@/services/security/securityAnalysisEngine";
import type { SecurityIssue } from "@/types/security-types";
import type { MemoryStore } from "../memory/database.js";
import {
  CalculateRiskScoreSchema,
  OptimizePatchesSchema,
} from "../shared/zod-schemas.js";
import {
  toTextContent,
  toErrorResult,
  parseIssueJson,
  parseIssuesJson,
} from "../shared/utils.js";

const SEVERITY_WEIGHT: Record<string, number> = {
  Critical: 10,
  High: 7,
  Medium: 4,
  Low: 1,
};

const EFFORT_COST: Record<string, number> = {
  Low: 1,
  Medium: 3,
  High: 5,
};

function computeRiskScore(issue: SecurityIssue): number {
  const cvss = issue.cvssScore ?? calculateCVSSScore(issue);
  const severityW = SEVERITY_WEIGHT[issue.severity] ?? 4;
  const confidenceFactor = (issue.confidence ?? 50) / 100;
  // Composite: 40% CVSS + 40% severity + 20% confidence
  return Math.round((cvss * 4 + severityW + confidenceFactor * 10) * 10) / 10;
}

export function registerRiskOptimizerTools(
  server: McpServer,
  memory: MemoryStore
): void {
  // ── calculate_risk_score ──────────────────────────────────────
  server.registerTool(
    "calculate_risk_score",
    {
      title: "Calculate Risk Score",
      description:
        "Calculate a CVSS-based risk score for a single security issue. " +
        "Combines CVSS score, severity weight, and confidence for a composite risk metric.",
      inputSchema: CalculateRiskScoreSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ issueJson }) => {
      try {
        const issue = parseIssueJson(issueJson);
        const cvss = calculateCVSSScore(issue);
        const riskScore = computeRiskScore(issue);

        return {
          content: [
            toTextContent({
              issueId: issue.id,
              severity: issue.severity,
              cvssScore: cvss,
              confidence: issue.confidence,
              compositeRiskScore: riskScore,
              riskLevel:
                riskScore >= 8
                  ? "Critical"
                  : riskScore >= 6
                    ? "High"
                    : riskScore >= 4
                      ? "Medium"
                      : "Low",
            }),
          ],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );

  // ── optimize_patches ──────────────────────────────────────────
  server.registerTool(
    "optimize_patches",
    {
      title: "Optimize Patches",
      description:
        "Prioritize security issues by risk-adjusted remediation order. " +
        "Considers CVSS score, severity, confidence, and remediation effort " +
        "to produce an optimal fix order that maximizes risk reduction per effort.",
      inputSchema: OptimizePatchesSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ issuesJson, maxEffort }) => {
      try {
        const issues = parseIssuesJson(issuesJson);
        const effortCap = maxEffort ?? "High";
        const effortCapCost = EFFORT_COST[effortCap] ?? 5;

        // Score and rank each issue
        const scored = issues
          .map((issue) => {
            const riskScore = computeRiskScore(issue);
            const effortLevel =
              issue.remediation?.effort ?? issue.effort ?? "Medium";
            const effortCost = EFFORT_COST[effortLevel] ?? 3;
            // ROI = risk reduction per unit effort
            const roi = effortCost > 0 ? riskScore / effortCost : riskScore;
            return { issue, riskScore, effortLevel, effortCost, roi };
          })
          .filter((s) => s.effortCost <= effortCapCost)
          .sort((a, b) => b.roi - a.roi);

        const prioritized = scored.map((s, idx) => ({
          issue: s.issue,
          riskScore: s.riskScore,
          suggestedOrder: idx + 1,
          rationale:
            `Risk ${s.riskScore} / Effort ${s.effortLevel} = ROI ${s.roi.toFixed(1)}. ` +
            `${s.issue.severity} severity ${s.issue.type} with ${s.issue.confidence}% confidence.`,
        }));

        const overallSecurityScore = calculateSecurityScore(issues);
        const totalRiskReduction = scored.reduce(
          (sum, s) => sum + s.riskScore,
          0
        );
        const totalEffort = scored.reduce((sum, s) => sum + s.effortCost, 0);

        const result = {
          overallSecurityScore,
          totalIssues: issues.length,
          includedIssues: scored.length,
          excludedByEffort: issues.length - scored.length,
          maxEffort: effortCap,
          totalRiskReduction,
          estimatedEffort:
            totalEffort <= 5 ? "Low" : totalEffort <= 15 ? "Medium" : "High",
          prioritizedIssues: prioritized,
        };

        await memory.save({
          sessionId: "default",
          type: "scan_result",
          summary: `Risk optimization: ${scored.length} issues prioritized, total risk reduction ${totalRiskReduction}`,
          data: {
            totalIssues: issues.length,
            includedIssues: scored.length,
            totalRiskReduction,
          },
          tags: ["optimization"],
        });

        return { content: [toTextContent(result)] };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );
}
