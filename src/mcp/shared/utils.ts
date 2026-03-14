/**
 * SESC-MCP Shared Utilities
 * Provides the adaptation layer between MCP tool inputs ({name, content} arrays)
 * and the format that existing Next.js services expect.
 */

import * as crypto from "node:crypto";
import type { CodeFile, SeverityLevel, Vulnerability } from "./types.js";

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

export function generateId(prefix = "id"): string {
  return `${prefix}_${crypto.randomBytes(8).toString("hex")}`;
}

// ---------------------------------------------------------------------------
// Language detection from file extension
// ---------------------------------------------------------------------------

const EXT_LANGUAGE_MAP: Record<string, string> = {
  ts: "typescript",
  tsx: "typescript",
  js: "javascript",
  jsx: "javascript",
  mjs: "javascript",
  cjs: "javascript",
  py: "python",
  java: "java",
  cs: "csharp",
  php: "php",
  rb: "ruby",
  go: "golang",
  rs: "rust",
  cpp: "cpp",
  cc: "cpp",
  cxx: "cpp",
  c: "c",
  h: "c",
  hpp: "cpp",
  kt: "kotlin",
  swift: "swift",
  dart: "dart",
  scala: "scala",
  sql: "sql",
  sh: "bash",
  bash: "bash",
  yaml: "yaml",
  yml: "yaml",
  json: "json",
  xml: "xml",
  html: "html",
  htm: "html",
  css: "css",
  scss: "scss",
};

export function detectLanguageFromFilename(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  return EXT_LANGUAGE_MAP[ext] ?? "unknown";
}

// ---------------------------------------------------------------------------
// File content helpers
// ---------------------------------------------------------------------------

/**
 * Trims code content and removes null bytes that may corrupt analysis.
 */
export function sanitizeContent(content: string): string {
  return content.replace(/\0/g, "").trim();
}

/**
 * Enriches a CodeFile with auto-detected language if not already set.
 */
export function enrichFile(file: CodeFile): CodeFile {
  return {
    ...file,
    content: sanitizeContent(file.content),
    language: file.language ?? detectLanguageFromFilename(file.name),
  };
}

/**
 * Enriches an array of code files.
 */
export function enrichFiles(files: CodeFile[]): CodeFile[] {
  return files.map(enrichFile);
}

// ---------------------------------------------------------------------------
// Severity helpers
// ---------------------------------------------------------------------------

export const SEVERITY_WEIGHT: Record<SeverityLevel, number> = {
  critical: 10,
  high: 7,
  medium: 4,
  low: 2,
  info: 0.5,
};

export function severityWeight(s: SeverityLevel): number {
  return SEVERITY_WEIGHT[s] ?? 1;
}

/**
 * Computes a 0-100 security score from a list of vulnerabilities.
 * More severe issues reduce the score more.
 */
export function computeSecurityScore(vulnerabilities: Vulnerability[]): number {
  if (vulnerabilities.length === 0) return 100;
  const totalDeductions = vulnerabilities.reduce(
    (sum, v) => sum + severityWeight(v.severity),
    0
  );
  return Math.max(0, Math.round(100 - totalDeductions));
}

// ---------------------------------------------------------------------------
// Diff utilities  (simple unified diff generator)
// ---------------------------------------------------------------------------

/**
 * Generates a simple unified-diff string between two code strings.
 */
export function generateDiff(
  original: string,
  patched: string,
  filename = "file"
): string {
  const origLines = original.split("\n");
  const patchedLines = patched.split("\n");

  const lines: string[] = [];
  lines.push(`--- a/${filename}`);
  lines.push(`+++ b/${filename}`);

  // Simple line-by-line diff (sufficient for vulnerability patches)
  const maxLen = Math.max(origLines.length, patchedLines.length);
  let hunkStarted = false;
  let hunkLines: string[] = [];
  let removedCount = 0;
  let addedCount = 0;

  for (let i = 0; i < maxLen; i++) {
    const origLine = origLines[i];
    const patchedLine = patchedLines[i];

    if (origLine !== patchedLine) {
      if (!hunkStarted) {
        hunkLines.push(
          `@@ -${i + 1},${origLines.length} +${i + 1},${patchedLines.length} @@`
        );
        hunkStarted = true;
      }
      if (origLine !== undefined) {
        hunkLines.push(`-${origLine}`);
        removedCount++;
      }
      if (patchedLine !== undefined) {
        hunkLines.push(`+${patchedLine}`);
        addedCount++;
      }
    } else if (hunkStarted) {
      hunkLines.push(` ${origLine ?? ""}`);
    }
  }

  if (removedCount === 0 && addedCount === 0) {
    return "(no changes)";
  }

  lines.push(...hunkLines);
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Text truncation
// ---------------------------------------------------------------------------

export function truncate(text: string, maxLength = 200): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

// ---------------------------------------------------------------------------
// Safe JSON formatting
// ---------------------------------------------------------------------------

export function toJsonString(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
