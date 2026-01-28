import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { analysisStorage } from "./analysisStorage";
import type { AnalysisResults, SecurityIssue } from "@/hooks/useAnalysis";

function makeIssue(i: number): SecurityIssue {
  return {
    id: `id_${i}`,
    line: i,
    tool: "test",
    type: "test",
    category: "A01",
    message: `message_${i}`,
    severity:
      i % 4 === 0
        ? "Critical"
        : i % 4 === 1
          ? "High"
          : i % 4 === 2
            ? "Medium"
            : "Low",
    confidence: 80,
    recommendation: "do thing",
    remediation: { description: "fix", effort: "Low", priority: 1 },
    filename: "file.ts",
    riskRating: "Low",
    impact: "low",
    likelihood: "low",
    // Very large snippets to simulate real payloads
    codeSnippet: "x".repeat(5000),
    aiSummary: "y".repeat(2000),
  };
}

function makeResults(issueCount: number): AnalysisResults {
  const issues = Array.from({ length: issueCount }, (_, i) => makeIssue(i));
  return {
    issues,
    totalFiles: 10,
    analysisTime: "1s",
    summary: {
      criticalIssues: 0,
      highIssues: 0,
      mediumIssues: 0,
      lowIssues: 0,
      securityScore: 50,
      qualityScore: 50,
      coveragePercentage: 0,
      linesAnalyzed: 1000,
    },
    metrics: {
      vulnerabilityDensity: 1,
      technicalDebt: "0",
      maintainabilityIndex: 50,
      duplicatedLines: 0,
    },
  };
}

describe("AnalysisStorageService - large payload handling", () => {
  const originalStringify = JSON.stringify;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    JSON.stringify = originalStringify;
  });

  it("stores a reduced payload when JSON.stringify would throw RangeError", async () => {
    // Simulate RangeError for extremely large arrays/objects.
    JSON.stringify = ((value: unknown, replacer?: any, space?: any) => {
      // If we see a large issues array, throw like the browser would for huge strings.
      if (
        value &&
        typeof value === "object" &&
        (value as any).results?.issues &&
        Array.isArray((value as any).results.issues) &&
        (value as any).results.issues.length > 3000
      ) {
        throw new RangeError("Invalid string length");
      }
      return originalStringify(value as any, replacer as any, space as any);
    }) as any;

    const results = makeResults(6000);
    const file = new File(["zip"], "test.zip", { type: "application/zip" });

    await expect(
      analysisStorage.storeAnalysisResults(results, file)
    ).resolves.toBeUndefined();

    // Ensure something was stored.
    expect(localStorage.setItem).toHaveBeenCalled();

    const storedArg = vi
      .mocked(localStorage.setItem)
      .mock.calls.find((c) => c[0] === "codeGuardianAnalysis")?.[1];

    expect(typeof storedArg).toBe("string");

    const parsed = JSON.parse(storedArg as string);
    expect(parsed.results.issues.length).toBeLessThanOrEqual(2000);
    // Ensure we stripped huge fields
    expect(parsed.results.issues[0].codeSnippet).toBeUndefined();
  });
});
