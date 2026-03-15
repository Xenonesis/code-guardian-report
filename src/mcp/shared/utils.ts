/**
 * MCP Shared Utilities
 */

import type { SecurityIssue } from "@/types/security-types";

/**
 * Safely parse a JSON string into a SecurityIssue array.
 * Throws a descriptive error if parsing fails.
 */
export function parseIssuesJson(json: string): SecurityIssue[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) {
      throw new Error("Expected a JSON array of SecurityIssue objects");
    }
    return parsed as SecurityIssue[];
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse issues JSON: ${message}`);
  }
}

/**
 * Safely parse a JSON string into a single SecurityIssue.
 */
export function parseIssueJson(json: string): SecurityIssue {
  try {
    const parsed: unknown = JSON.parse(json);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      throw new Error("Expected a single SecurityIssue object");
    }
    return parsed as SecurityIssue;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse issue JSON: ${message}`);
  }
}

/**
 * Build MCP text content from a structured result.
 */
export function toTextContent(data: unknown): { type: "text"; text: string } {
  return {
    type: "text" as const,
    text: typeof data === "string" ? data : JSON.stringify(data, null, 2),
  };
}

/**
 * Build an MCP error result.
 */
export function toErrorResult(error: unknown): {
  content: Array<{ type: "text"; text: string }>;
  isError: true;
} {
  const message = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: "text" as const, text: `Error: ${message}` }],
    isError: true,
  };
}

/**
 * Generate a simple unified diff between two strings.
 */
export function unifiedDiff(
  original: string,
  modified: string,
  filename: string
): string {
  const origLines = original.split("\n");
  const modLines = modified.split("\n");
  const lines: string[] = [];
  lines.push(`--- a/${filename}`);
  lines.push(`+++ b/${filename}`);

  // Simple line-by-line diff (not optimal, but functional)
  const maxLen = Math.max(origLines.length, modLines.length);
  let chunkStart = -1;
  let chunkOrig: string[] = [];
  let chunkMod: string[] = [];

  const flushChunk = () => {
    if (chunkStart < 0) return;
    lines.push(
      `@@ -${chunkStart + 1},${chunkOrig.length} +${chunkStart + 1},${chunkMod.length} @@`
    );
    for (const l of chunkOrig) lines.push(`-${l}`);
    for (const l of chunkMod) lines.push(`+${l}`);
    chunkStart = -1;
    chunkOrig = [];
    chunkMod = [];
  };

  for (let i = 0; i < maxLen; i++) {
    const o = origLines[i] ?? "";
    const m = modLines[i] ?? "";
    if (o === m) {
      flushChunk();
      lines.push(` ${o}`);
    } else {
      if (chunkStart < 0) chunkStart = i;
      if (i < origLines.length) chunkOrig.push(o);
      if (i < modLines.length) chunkMod.push(m);
    }
  }
  flushChunk();
  return lines.join("\n");
}

/**
 * Create a deterministic ID from input strings.
 */
export function deterministicId(...parts: string[]): string {
  let hash = 0;
  const str = parts.join("|");
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash + chr) | 0;
  }
  return Math.abs(hash).toString(36).padStart(8, "0");
}

/**
 * Truncate text to a maximum length, appending "..." if truncated.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}
