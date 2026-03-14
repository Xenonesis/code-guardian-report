/**
 * SESC-MCP Risk Optimization Agent – Tool Registrations
 * Registers 2 MCP tools for the Risk Optimization Agent.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  OptimizePatchesInputSchema,
  CalculateRiskScoreInputSchema,
} from "../../shared/zod-schemas.js";
import { optimizePatches, computeRiskScores } from "./index.js";
import { toJsonString } from "../../shared/utils.js";
import type { Vulnerability } from "../../shared/types.js";

export function registerRiskOptimizerTools(server: McpServer): void {
  // -------------------------------------------------------------------------
  // 16. optimize_patches
  // -------------------------------------------------------------------------
  server.registerTool(
    "optimize_patches",
    {
      description:
        "Optimize patch application order using the objective min(Rs + Cp), where " +
        "Rs is residual security risk and Cp is patch instability cost. " +
        "Uses a greedy risk/cost ratio heuristic to maximize risk reduction per unit of instability. " +
        "Returns patches sorted by priority with a full explanation.",
      inputSchema: OptimizePatchesInputSchema.shape,
    },
    async ({ patches, vulnerabilities }) => {
      const result = optimizePatches(
        patches.map((p) => ({
          id: p.id,
          vulnerabilityId: p.vulnerabilityId,
          confidence: p.confidence,
          instabilityCost: p.instabilityCost,
          strategy: p.strategy,
        })),
        vulnerabilities as Vulnerability[]
      );

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString(result),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 17. calculate_risk_score
  // -------------------------------------------------------------------------
  server.registerTool(
    "calculate_risk_score",
    {
      description:
        "Calculate CVSS-like risk scores for a set of vulnerabilities, " +
        "taking into account which patches have already been applied. " +
        "Returns per-vulnerability risk scores and the overall residual risk.",
      inputSchema: CalculateRiskScoreInputSchema.shape,
    },
    async ({ vulnerabilities, appliedPatchIds, patchVulnMap }) => {
      const riskScores = computeRiskScores(
        vulnerabilities as Vulnerability[],
        appliedPatchIds ?? [],
        (patchVulnMap ?? {}) as Record<string, string>
      );

      const totalResidualRisk = riskScores.reduce(
        (sum, r) => sum + r.residualRisk,
        0
      );
      const overallRiskLevel =
        totalResidualRisk > 30
          ? "critical"
          : totalResidualRisk > 15
            ? "high"
            : totalResidualRisk > 7
              ? "medium"
              : "low";

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              totalResidualRisk: Math.round(totalResidualRisk * 100) / 100,
              overallRiskLevel,
              patchesApplied: (appliedPatchIds ?? []).length,
              riskScores,
            }),
          },
        ],
      };
    }
  );
}
