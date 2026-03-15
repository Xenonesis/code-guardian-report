/**
 * MCP Patch Generation Tools
 *
 * Tools: generate_patch, preview_patch, apply_patch
 * Template-based code transforms for common vulnerability fixes.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { SecurityIssue } from "@/types/security-types";
import type { MemoryStore } from "../memory/database.js";
import type { PatchSuggestion } from "../shared/types.js";
import {
  GeneratePatchSchema,
  PreviewPatchSchema,
  ApplyPatchSchema,
} from "../shared/zod-schemas.js";
import {
  toTextContent,
  toErrorResult,
  parseIssueJson,
  unifiedDiff,
} from "../shared/utils.js";

// ── Patch templates by CWE ──────────────────────────────────────────

interface PatchTemplate {
  cwe: string;
  patterns: Array<{
    match: RegExp;
    replacement: string;
    description: string;
  }>;
  effort: PatchSuggestion["effort"];
}

const PATCH_TEMPLATES: PatchTemplate[] = [
  {
    cwe: "CWE-79",
    patterns: [
      {
        match: /innerHTML\s*=\s*(.+)/g,
        replacement: "textContent = $1",
        description: "Replace innerHTML with textContent to prevent XSS",
      },
      {
        match: /document\.write\((.+)\)/g,
        replacement: "document.createTextNode($1)",
        description: "Replace document.write with safe DOM API",
      },
      {
        match:
          /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*(.+?)\s*\}\s*\}/g,
        replacement:
          "dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize($1) }}",
        description: "Sanitize dangerouslySetInnerHTML with DOMPurify",
      },
    ],
    effort: "Low",
  },
  {
    cwe: "CWE-89",
    patterns: [
      {
        match: /(\w+)\.query\(\s*(['"`])(.+?)\2\s*\+\s*(.+?)\)/g,
        replacement: "$1.query($2$3$$$2, [$4])",
        description: "Convert string concatenation to parameterized query",
      },
      {
        match: /`([^`]*)\$\{(\w+)\}([^`]*)`/g,
        replacement: "'$1$$$3', [$2]",
        description: "Convert template literal SQL to parameterized query",
      },
    ],
    effort: "Medium",
  },
  {
    cwe: "CWE-78",
    patterns: [
      {
        match: /exec\((.+)\)/g,
        replacement: "execFile($1)",
        description: "Replace exec with execFile to prevent command injection",
      },
      {
        match: /child_process\.exec\((.+)\)/g,
        replacement: "child_process.execFile($1)",
        description: "Replace exec with safer execFile",
      },
    ],
    effort: "Medium",
  },
  {
    cwe: "CWE-22",
    patterns: [
      {
        match: /((?:fs|path)\.\w+)\((\s*)(\w+)/g,
        replacement:
          "$1($2path.resolve(safeBaseDir, path.normalize($3).replace(/^\\.\\.\\//, ''))",
        description:
          "Add path traversal protection with normalize and base dir check",
      },
    ],
    effort: "Medium",
  },
  {
    cwe: "CWE-327",
    patterns: [
      {
        match: /createHash\(['"]md5['"]\)/g,
        replacement: "createHash('sha256')",
        description: "Replace weak MD5 hash with SHA-256",
      },
      {
        match: /createHash\(['"]sha1['"]\)/g,
        replacement: "createHash('sha256')",
        description: "Replace weak SHA-1 hash with SHA-256",
      },
    ],
    effort: "Low",
  },
  {
    cwe: "CWE-798",
    patterns: [
      {
        match:
          /(password|secret|apiKey|api_key|token)\s*[:=]\s*(['"`])([^'"`]+)\2/gi,
        replacement: "$1 = process.env.$1_VALUE",
        description: "Move hardcoded credential to environment variable",
      },
    ],
    effort: "Low",
  },
];

function generatePatchForIssue(
  issue: SecurityIssue,
  code: string,
  filename: string
): PatchSuggestion {
  let patchedCode = code;
  let description = `Fix ${issue.type} vulnerability (${issue.cweId ?? "unknown CWE"})`;
  let confidence = 60;
  let effort: PatchSuggestion["effort"] = "Medium";
  let applied = false;

  // Try CWE-specific templates
  if (issue.cweId) {
    const template = PATCH_TEMPLATES.find((t) => t.cwe === issue.cweId);
    if (template) {
      for (const pattern of template.patterns) {
        const before = patchedCode;
        patchedCode = patchedCode.replace(pattern.match, pattern.replacement);
        if (patchedCode !== before) {
          description = pattern.description;
          effort = template.effort;
          confidence = 80;
          applied = true;
          break;
        }
      }
    }
  }

  // If no template matched, try generic fix based on severity
  if (!applied) {
    // Add a TODO comment at the vulnerable line
    const lines = patchedCode.split("\n");
    const lineIdx = Math.max(0, issue.line - 1);
    if (lineIdx < lines.length) {
      const indent = lines[lineIdx]!.match(/^(\s*)/)?.[1] ?? "";
      lines.splice(
        lineIdx,
        0,
        `${indent}// TODO: SECURITY FIX REQUIRED — ${issue.severity} ${issue.type}`,
        `${indent}// ${issue.recommendation}`
      );
      patchedCode = lines.join("\n");
      description = `Added security TODO for ${issue.type} (manual fix required)`;
      confidence = 40;
      effort = "High";
    }
  }

  return {
    issueId: issue.id,
    filename,
    description,
    originalCode: code,
    patchedCode,
    diff: unifiedDiff(code, patchedCode, filename),
    confidence,
    effort,
    breakingChange: false,
  };
}

export function registerPatchGenTools(
  server: McpServer,
  memory: MemoryStore
): void {
  // ── generate_patch ────────────────────────────────────────────
  server.registerTool(
    "generate_patch",
    {
      title: "Generate Patch",
      description:
        "Generate a security patch for a specific vulnerability. " +
        "Uses CWE-aware code transform templates to produce a fixed version of the code. " +
        "Returns the patched code, unified diff, confidence score, and effort estimate.",
      inputSchema: GeneratePatchSchema,
    },
    async ({ issueJson, code, filename }) => {
      try {
        const issue = parseIssueJson(issueJson);
        const patch = generatePatchForIssue(issue, code, filename);

        await memory.save({
          sessionId: "default",
          type: "patch",
          summary: `Patch for ${issue.id} in ${filename}: ${patch.description} (confidence: ${patch.confidence}%)`,
          data: { issueId: issue.id, filename, confidence: patch.confidence },
          tags: ["patch", filename, issue.cweId ?? "unknown"],
        });

        return { content: [toTextContent(patch)] };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );

  // ── preview_patch ─────────────────────────────────────────────
  server.registerTool(
    "preview_patch",
    {
      title: "Preview Patch",
      description:
        "Generate a unified diff between original and patched code. " +
        "Useful for reviewing changes before applying them.",
      inputSchema: PreviewPatchSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ originalCode, patchedCode, filename }) => {
      try {
        const diff = unifiedDiff(originalCode, patchedCode, filename);
        return { content: [toTextContent(diff)] };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );

  // ── apply_patch ───────────────────────────────────────────────
  server.registerTool(
    "apply_patch",
    {
      title: "Apply Patch",
      description:
        "Apply a patch by returning the patched code. " +
        "In dry-run mode (default), returns the result without writing to disk. " +
        "Set dryRun=false to write the file (requires filesystem access).",
      inputSchema: ApplyPatchSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: true,
      },
    },
    async ({ originalCode, patchedCode, filename, dryRun }) => {
      try {
        const isDryRun = dryRun !== false;

        if (!isDryRun) {
          // Write to filesystem
          const fs = await import("node:fs/promises");
          const path = await import("node:path");
          const resolved = path.resolve(filename);
          await fs.writeFile(resolved, patchedCode, "utf-8");

          return {
            content: [
              toTextContent({
                applied: true,
                filename: resolved,
                diff: unifiedDiff(originalCode, patchedCode, filename),
                message: `Patch written to ${resolved}`,
              }),
            ],
          };
        }

        return {
          content: [
            toTextContent({
              applied: false,
              dryRun: true,
              filename,
              diff: unifiedDiff(originalCode, patchedCode, filename),
              message:
                "Dry run — no files modified. Set dryRun=false to apply.",
            }),
          ],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );
}
