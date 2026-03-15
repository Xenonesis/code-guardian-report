/**
 * Tests for src/mcp/shared/utils.ts
 *
 * Pure utility functions with no external service dependencies.
 */

import { describe, it, expect } from "vitest";
import {
  parseIssuesJson,
  parseIssueJson,
  toTextContent,
  toErrorResult,
  unifiedDiff,
  deterministicId,
  truncate,
} from "../shared/utils";

// ── parseIssuesJson ─────────────────────────────────────────────────

describe("parseIssuesJson", () => {
  it("parses a valid JSON array", () => {
    const json = JSON.stringify([
      { id: "1", severity: "High" },
      { id: "2", severity: "Low" },
    ]);
    const result = parseIssuesJson(json);
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: "1", severity: "High" });
  });

  it("throws on non-array JSON", () => {
    expect(() => parseIssuesJson('{"id": "1"}')).toThrow(
      "Expected a JSON array"
    );
  });

  it("throws on invalid JSON", () => {
    expect(() => parseIssuesJson("not json")).toThrow(
      "Failed to parse issues JSON"
    );
  });

  it("returns empty array for empty JSON array", () => {
    expect(parseIssuesJson("[]")).toEqual([]);
  });
});

// ── parseIssueJson ──────────────────────────────────────────────────

describe("parseIssueJson", () => {
  it("parses a valid JSON object", () => {
    const json = JSON.stringify({ id: "1", severity: "Critical" });
    const result = parseIssueJson(json);
    expect(result).toEqual({ id: "1", severity: "Critical" });
  });

  it("throws on JSON array input", () => {
    expect(() => parseIssueJson("[]")).toThrow(
      "Expected a single SecurityIssue object"
    );
  });

  it("throws on non-object JSON", () => {
    expect(() => parseIssueJson('"string"')).toThrow(
      "Expected a single SecurityIssue object"
    );
  });

  it("throws on null JSON", () => {
    expect(() => parseIssueJson("null")).toThrow(
      "Expected a single SecurityIssue object"
    );
  });

  it("throws on invalid JSON", () => {
    expect(() => parseIssueJson("{bad}")).toThrow("Failed to parse issue JSON");
  });
});

// ── toTextContent ───────────────────────────────────────────────────

describe("toTextContent", () => {
  it("wraps a string as text content", () => {
    const result = toTextContent("hello");
    expect(result).toEqual({ type: "text", text: "hello" });
  });

  it("JSON-stringifies non-string data", () => {
    const result = toTextContent({ a: 1 });
    expect(result.type).toBe("text");
    expect(JSON.parse(result.text)).toEqual({ a: 1 });
  });

  it("pretty-prints with 2-space indentation", () => {
    const result = toTextContent({ key: "val" });
    expect(result.text).toContain("\n");
    expect(result.text).toContain("  ");
  });
});

// ── toErrorResult ───────────────────────────────────────────────────

describe("toErrorResult", () => {
  it("wraps an Error object", () => {
    const result = toErrorResult(new Error("boom"));
    expect(result.isError).toBe(true);
    expect(result.content).toHaveLength(1);
    expect(result.content[0].text).toBe("Error: boom");
  });

  it("wraps a string", () => {
    const result = toErrorResult("something failed");
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toBe("Error: something failed");
  });

  it("wraps other types via String()", () => {
    const result = toErrorResult(42);
    expect(result.content[0].text).toBe("Error: 42");
  });
});

// ── unifiedDiff ─────────────────────────────────────────────────────

describe("unifiedDiff", () => {
  it("produces diff headers", () => {
    const diff = unifiedDiff("a", "b", "test.ts");
    expect(diff).toContain("--- a/test.ts");
    expect(diff).toContain("+++ b/test.ts");
  });

  it("shows unchanged lines with space prefix", () => {
    const diff = unifiedDiff("same\nline", "same\nline", "f.ts");
    expect(diff).toContain(" same");
    expect(diff).toContain(" line");
  });

  it("shows added/removed lines with +/- prefix", () => {
    const diff = unifiedDiff("old", "new", "f.ts");
    expect(diff).toContain("-old");
    expect(diff).toContain("+new");
  });

  it("includes @@ hunk headers", () => {
    const diff = unifiedDiff("a", "b", "f.ts");
    expect(diff).toMatch(/@@ -\d+,\d+ \+\d+,\d+ @@/);
  });

  it("handles multi-line changes", () => {
    const orig = "line1\nline2\nline3";
    const mod = "line1\nchanged\nline3";
    const diff = unifiedDiff(orig, mod, "f.ts");
    expect(diff).toContain("-line2");
    expect(diff).toContain("+changed");
    expect(diff).toContain(" line1");
    expect(diff).toContain(" line3");
  });

  it("handles empty strings", () => {
    const diff = unifiedDiff("", "", "f.ts");
    expect(diff).toContain("--- a/f.ts");
  });
});

// ── deterministicId ─────────────────────────────────────────────────

describe("deterministicId", () => {
  it("returns same ID for same inputs", () => {
    const id1 = deterministicId("a", "b", "c");
    const id2 = deterministicId("a", "b", "c");
    expect(id1).toBe(id2);
  });

  it("returns different IDs for different inputs", () => {
    const id1 = deterministicId("a", "b");
    const id2 = deterministicId("x", "y");
    expect(id1).not.toBe(id2);
  });

  it("returns a base-36 string padded to 8 chars", () => {
    const id = deterministicId("test");
    expect(id).toMatch(/^[0-9a-z]{8,}$/);
  });
});

// ── truncate ────────────────────────────────────────────────────────

describe("truncate", () => {
  it("returns text unchanged if within limit", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("returns text unchanged if exactly at limit", () => {
    expect(truncate("hello", 5)).toBe("hello");
  });

  it("truncates with ... if over limit", () => {
    const result = truncate("hello world", 8);
    expect(result).toBe("hello...");
    expect(result.length).toBe(8);
  });

  it("handles very short max length", () => {
    const result = truncate("abcdefgh", 4);
    expect(result).toBe("a...");
  });
});
