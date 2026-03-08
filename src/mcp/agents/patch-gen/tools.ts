/**
 * SESC-MCP Patch Generation Agent – Tool Registrations
 * Registers 3 MCP tools for the Patch Generation Agent.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  GeneratePatchInputSchema,
  PreviewPatchInputSchema,
  ApplyPatchInputSchema,
} from "../../shared/zod-schemas.js";
import { generatePatch } from "./index.js";
import { generateDiff, toJsonString } from "../../shared/utils.js";
import type { PatchStrategy, Vulnerability } from "../../shared/types.js";

export function registerPatchGenTools(server: McpServer): void {
  // -------------------------------------------------------------------------
  // 10. generate_patch
  // -------------------------------------------------------------------------
  server.registerTool(
    "generate_patch",
    {
      description:
        "Generate a security patch for a vulnerability. Uses template-based strategies " +
        "for common vulnerability types (SQL injection, XSS, command injection, secrets, etc.). " +
        "Returns the patched content, a unified diff, the strategy used, and confidence score.",
      inputSchema: GeneratePatchInputSchema.shape,
    },
    async ({ vulnerability, fileContent, strategy }) => {
      const vuln = vulnerability as Vulnerability;
      const patch = generatePatch(
        vuln,
        fileContent,
        strategy as PatchStrategy | undefined
      );

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              patchId: patch.id,
              vulnerabilityId: patch.vulnerabilityId,
              file: patch.file,
              strategy: patch.strategy,
              confidence: patch.confidence,
              instabilityCost: patch.instabilityCost,
              explanation: patch.explanation,
              diff: patch.diff,
              patchedContent: patch.patchedContent,
            }),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 11. preview_patch
  // -------------------------------------------------------------------------
  server.registerTool(
    "preview_patch",
    {
      description:
        "Preview what a patch looks like as a unified diff. " +
        "Useful for reviewing changes before applying them.",
      inputSchema: PreviewPatchInputSchema.shape,
    },
    async ({ originalContent, patchedContent, filename }) => {
      const diff = generateDiff(originalContent, patchedContent, filename);
      const linesAdded =
        patchedContent.split("\n").length - originalContent.split("\n").length;

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              filename,
              linesAdded,
              diff,
            }),
          },
        ],
      };
    }
  );

  // -------------------------------------------------------------------------
  // 12. apply_patch
  // -------------------------------------------------------------------------
  server.registerTool(
    "apply_patch",
    {
      description:
        "Apply a patch by returning the patched file content. " +
        "This returns the in-memory result; you are responsible for writing " +
        "the result back to the file system.",
      inputSchema: ApplyPatchInputSchema.shape,
    },
    async ({ originalContent, patchedContent }) => {
      const changed = originalContent !== patchedContent;
      const linesChanged = Math.abs(
        patchedContent.split("\n").length - originalContent.split("\n").length
      );

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString({
              success: true,
              changed,
              linesChanged,
              patchedContent,
            }),
          },
        ],
      };
    }
  );
}
