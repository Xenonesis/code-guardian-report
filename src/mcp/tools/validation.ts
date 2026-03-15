/**
 * MCP Validation Tools
 *
 * Tools: validate_patch, run_regression, check_confidence
 * Re-scans patched code to verify fixes and detect regressions.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SecurityAnalyzer } from "@/services/analysis/SecurityAnalyzer";
import type { MemoryStore } from "../memory/database.js";
import {
  ValidatePatchSchema,
  RunRegressionSchema,
  CheckConfidenceSchema,
} from "../shared/zod-schemas.js";
import {
  toTextContent,
  toErrorResult,
  parseIssueJson,
} from "../shared/utils.js";

export function registerValidationTools(
  server: McpServer,
  memory: MemoryStore
): void {
  // ── validate_patch ────────────────────────────────────────────
  server.registerTool(
    "validate_patch",
    {
      title: "Validate Patch",
      description:
        "Validate a security patch by re-scanning the patched code. " +
        "Checks whether the target issue is resolved and whether " +
        "any new issues were introduced.",
      inputSchema: ValidatePatchSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ originalCode, patchedCode, filename, issueId }) => {
      try {
        const analyzer = new SecurityAnalyzer();

        // Scan original
        await analyzer.initializeAnalysisContext([
          { filename, content: originalCode },
        ]);
        const originalIssues = analyzer.analyzeFile(filename, originalCode);

        // Scan patched
        const patchedAnalyzer = new SecurityAnalyzer();
        await patchedAnalyzer.initializeAnalysisContext([
          { filename, content: patchedCode },
        ]);
        const patchedIssues = patchedAnalyzer.analyzeFile(
          filename,
          patchedCode
        );

        // Check if target issue is resolved
        const targetResolved = !patchedIssues.some((i) => i.id === issueId);
        const originalIds = new Set(originalIssues.map((i) => i.id));
        const newIssues = patchedIssues.filter((i) => !originalIds.has(i.id));
        const remainingOriginal = patchedIssues.filter((i) =>
          originalIds.has(i.id)
        );

        const result = {
          patchId: issueId,
          valid: targetResolved && newIssues.length === 0,
          targetIssueResolved: targetResolved,
          originalIssueCount: originalIssues.length,
          patchedIssueCount: patchedIssues.length,
          remainingIssues: remainingOriginal,
          newIssues,
          regressions: newIssues.map(
            (i) => `NEW: ${i.severity} ${i.type} at line ${i.line}`
          ),
          confidenceScore: targetResolved
            ? newIssues.length === 0
              ? 95
              : 60
            : 20,
        };

        await memory.save({
          sessionId: "default",
          type: "validation",
          summary: `Validation of ${issueId}: ${result.valid ? "PASSED" : "FAILED"} (confidence: ${result.confidenceScore}%)`,
          data: {
            issueId,
            valid: result.valid,
            confidenceScore: result.confidenceScore,
          },
          tags: ["validation", filename],
        });

        return { content: [toTextContent(result)] };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );

  // ── run_regression ────────────────────────────────────────────
  server.registerTool(
    "run_regression",
    {
      title: "Run Regression",
      description:
        "Compare security scan results between original and patched code " +
        "to detect any regressions (new vulnerabilities introduced by the patch).",
      inputSchema: RunRegressionSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ originalCode, patchedCode, filename }) => {
      try {
        const origAnalyzer = new SecurityAnalyzer();
        await origAnalyzer.initializeAnalysisContext([
          { filename, content: originalCode },
        ]);
        const originalIssues = origAnalyzer.analyzeFile(filename, originalCode);

        const patchAnalyzer = new SecurityAnalyzer();
        await patchAnalyzer.initializeAnalysisContext([
          { filename, content: patchedCode },
        ]);
        const patchedIssues = patchAnalyzer.analyzeFile(filename, patchedCode);

        const originalIds = new Set(originalIssues.map((i) => i.id));
        const patchedIds = new Set(patchedIssues.map((i) => i.id));

        const resolved = originalIssues.filter((i) => !patchedIds.has(i.id));
        const introduced = patchedIssues.filter((i) => !originalIds.has(i.id));
        const unchanged = patchedIssues.filter((i) => originalIds.has(i.id));

        return {
          content: [
            toTextContent({
              filename,
              hasRegressions: introduced.length > 0,
              resolved: {
                count: resolved.length,
                issues: resolved.map((i) => ({
                  id: i.id,
                  severity: i.severity,
                  type: i.type,
                  line: i.line,
                })),
              },
              introduced: {
                count: introduced.length,
                issues: introduced.map((i) => ({
                  id: i.id,
                  severity: i.severity,
                  type: i.type,
                  line: i.line,
                  message: i.message,
                })),
              },
              unchanged: {
                count: unchanged.length,
              },
            }),
          ],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );

  // ── check_confidence ──────────────────────────────────────────
  server.registerTool(
    "check_confidence",
    {
      title: "Check Confidence",
      description:
        "Evaluate the confidence score of a reported security issue. " +
        "Analyzes the code context to determine if the issue is a true positive " +
        "or likely false positive.",
      inputSchema: CheckConfidenceSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ issueJson, code }) => {
      try {
        const issue = parseIssueJson(issueJson);
        const lines = code.split("\n");
        const lineContent = lines[Math.max(0, issue.line - 1)] ?? "";

        // Heuristic confidence adjusters
        let confidence = issue.confidence;
        const adjustments: string[] = [];

        // Check if the line is a comment
        const trimmed = lineContent.trim();
        if (
          trimmed.startsWith("//") ||
          trimmed.startsWith("/*") ||
          trimmed.startsWith("*") ||
          trimmed.startsWith("#")
        ) {
          confidence -= 40;
          adjustments.push("Line appears to be a comment (-40)");
        }

        // Check if inside a test file
        if (
          issue.filename.includes("test") ||
          issue.filename.includes("spec") ||
          issue.filename.includes("__tests__")
        ) {
          confidence -= 20;
          adjustments.push("File appears to be a test file (-20)");
        }

        // Check if the line contains TODO/FIXME indicating known issue
        if (/TODO|FIXME|HACK|XXX/i.test(lineContent)) {
          confidence -= 10;
          adjustments.push("Line contains TODO/FIXME marker (-10)");
        }

        // Higher confidence if CVSS score is available
        if (issue.cvssScore && issue.cvssScore >= 7.0) {
          confidence += 10;
          adjustments.push(`High CVSS score ${issue.cvssScore} (+10)`);
        }

        // Higher confidence if CWE ID is specific
        if (issue.cweId && issue.cweId !== "CWE-0") {
          confidence += 5;
          adjustments.push(`Specific CWE ID ${issue.cweId} (+5)`);
        }

        confidence = Math.max(0, Math.min(100, confidence));

        return {
          content: [
            toTextContent({
              issueId: issue.id,
              originalConfidence: issue.confidence,
              adjustedConfidence: confidence,
              verdict:
                confidence >= 70
                  ? "Likely true positive"
                  : confidence >= 40
                    ? "Uncertain — manual review recommended"
                    : "Likely false positive",
              adjustments,
              lineContent: trimmed,
            }),
          ],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );
}
