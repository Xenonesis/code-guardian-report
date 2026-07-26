/**
 * Tests for ExternalScannerService (CLI SAST wrappers)
 */

import { describe, it, expect } from "vitest";
import { ExternalScannerService } from "@/services/security/externalScanners";

describe("ExternalScannerService", () => {
  it("checks status of all supported scanners without crashing", async () => {
    const service = new ExternalScannerService();
    const statuses = await service.checkAllScannersStatus();
    expect(statuses).toHaveLength(6);
    expect(statuses.map((s) => s.name)).toContain("ESLint");
    expect(statuses.map((s) => s.name)).toContain("Semgrep");
    expect(statuses.map((s) => s.name)).toContain("Bandit");
  });

  it("returns error result when running an unsupported scanner", async () => {
    const service = new ExternalScannerService();
    const result = await service.runScanner("NonExistentScanner", "./src");
    expect(result.success).toBe(false);
    expect(result.error).toContain("Unsupported external scanner");
  });

  it("parses ESLint JSON output correctly", () => {
    const service = new ExternalScannerService();
    const sampleJson = JSON.stringify([
      {
        filePath: "/app/src/index.js",
        messages: [
          {
            ruleId: "no-eval",
            severity: 2,
            message: "eval can be harmful.",
            line: 10,
            column: 5,
          },
        ],
      },
    ]);
    const issues = (service as any).parseScannerOutput("ESLint", sampleJson);
    expect(issues).toHaveLength(1);
    expect(issues[0].tool).toBe("ESLint");
    expect(issues[0].type).toBe("no-eval");
    expect(issues[0].severity).toBe("High");
    expect(issues[0].filename).toBe("/app/src/index.js");
  });

  it("parses Semgrep JSON output correctly", () => {
    const service = new ExternalScannerService();
    const sampleJson = JSON.stringify({
      results: [
        {
          check_id: "javascript.lang.security.detect-eval-with-expression",
          path: "server.ts",
          start: { line: 42, col: 12 },
          extra: {
            message: "Detected eval with dynamic expression",
            severity: "ERROR",
            metadata: { cwe: ["CWE-95"] },
          },
        },
      ],
    });
    const issues = (service as any).parseScannerOutput("Semgrep", sampleJson);
    expect(issues).toHaveLength(1);
    expect(issues[0].tool).toBe("Semgrep");
    expect(issues[0].cweId).toBe("CWE-95");
    expect(issues[0].severity).toBe("High");
  });

  it("parses Bandit JSON output correctly", () => {
    const service = new ExternalScannerService();
    const sampleJson = JSON.stringify({
      results: [
        {
          test_id: "B602",
          test_name: "subprocess_popen_with_shell_equals_true",
          issue_text:
            "subprocess call with shell=True identified, security issue.",
          filename: "deploy.py",
          line_number: 15,
          issue_severity: "HIGH",
          issue_confidence: "HIGH",
        },
      ],
    });
    const issues = (service as any).parseScannerOutput("Bandit", sampleJson);
    expect(issues).toHaveLength(1);
    expect(issues[0].tool).toBe("Bandit");
    expect(issues[0].type).toContain("B602");
    expect(issues[0].severity).toBe("High");
    expect(issues[0].filename).toBe("deploy.py");
  });
});
