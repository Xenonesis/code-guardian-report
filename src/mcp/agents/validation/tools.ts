/**
 * SESC-MCP Validation Agent – Tool Registrations
 * Registers 3 MCP tools for the Validation Agent.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  ValidatePatchInputSchema,
  RunRegressionInputSchema,
  CheckConfidenceInputSchema,
} from "../../shared/zod-schemas.js";
import { validatePatch } from "./index.js";
import { toJsonString } from "../../shared/utils.js";
import type { Vulnerability } from "../../shared/types.js";

export function registerValidationTools(server: McpServer): void {
  // -------------------------------------------------------------------------
  // 13. validate_patch
  // -------------------------------------------------------------------------
  server.registerTool(
    "validate_patch",
    {
      description:
        "Run the full validation pipeline on a patch: syntax check, static re-scan " +
        "to verify the vulnerability is resolved, behavioral regression comparison, " +
        "and confidence scoring. Returns rollback recommendation if confidence is low.",
      inputSchema: ValidatePatchInputSchema.shape,
    },
    async ({
      originalContent,
      patchedContent,
      language,
      filename,
      vulnerability,
    }) => {
      const result = validatePatch({
        originalContent,
        patchedContent,
        language,
        filename,
        vulnerability: vulnerability as Vulnerability | undefined,
      });

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
  // 14. run_regression
  // -------------------------------------------------------------------------
  server.registerTool(
    "run_regression",
    {
      description:
        "Run a behavioral regression comparison between original and patched code. " +
        "Compares structural changes, function signatures, and line count deltas. " +
        "Optionally validates against provided test cases.",
      inputSchema: RunRegressionInputSchema.shape,
    },
    async ({ originalContent, patchedContent, filename, testCases }) => {
      // Run validation with regression focus
      const result = validatePatch({
        originalContent,
        patchedContent,
        filename,
      });

      const testResults =
        testCases && testCases.length > 0
          ? testCases.map((tc) => ({
              input: tc.input,
              expectedBehavior: tc.expectedBehavior,
              status: "manual-review-required",
              note:
                "Automated behavioral testing requires a runtime environment. " +
                "Please run your test suite against the patched code.",
            }))
          : [];

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              regressionPassed: result.regressionPassed,
              syntaxValid: result.syntaxValid,
              details: result.details,
              testResults,
            }),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 15. check_confidence
  // -------------------------------------------------------------------------
  server.registerTool(
    "check_confidence",
    {
      description:
        "Compute the confidence score for a patch based on validation and regression results. " +
        "Returns a score from 0.0 to 1.0 and a rollback recommendation if below threshold (0.7).",
      inputSchema: CheckConfidenceInputSchema.shape,
    },
    async ({ validationResult, vulnerability, patchStrategy }) => {
      const confidenceScore =
        "confidenceScore" in validationResult &&
        typeof validationResult.confidenceScore === "number"
          ? validationResult.confidenceScore
          : 0;

      const threshold = 0.7;
      const rollbackRecommended = confidenceScore < threshold;

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              vulnerabilityId: (vulnerability as Vulnerability).id,
              patchStrategy: patchStrategy ?? "unknown",
              confidenceScore,
              confidencePercent: Math.round(confidenceScore * 100),
              threshold,
              rollbackRecommended,
              recommendation: rollbackRecommended
                ? `Confidence ${Math.round(confidenceScore * 100)}% is below threshold ${Math.round(threshold * 100)}%. Rollback and review the patch manually.`
                : `Confidence ${Math.round(confidenceScore * 100)}% meets threshold. Patch can be applied.`,
            }),
          },
        ],
      };
    }
  );
}
