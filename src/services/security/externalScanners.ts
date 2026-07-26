/**
 * External Scanner Execution Service
 *
 * Checks if local third-party CLI SAST tools (e.g. ESLint, Semgrep, Flake8, Bandit)
 * are installed in the user's environment or node_modules, and provides methods
 * to execute them directly against codebase files or projects.
 */

import { exec } from "child_process";
import { promisify } from "util";
import { logger } from "@/utils/logger";
import type { SecurityIssue } from "@/types/security-types";

const execAsync = promisify(exec);

export interface ExternalScannerStatus {
  name: string;
  command: string;
  installed: boolean;
  version?: string;
  type: string;
  language: string;
}

export interface ExternalScanResult {
  tool: string;
  success: boolean;
  issues: SecurityIssue[];
  rawOutput?: string;
  executionTimeMs: number;
  error?: string;
}

const SUPPORTED_SCANNERS: Omit<
  ExternalScannerStatus,
  "installed" | "version"
>[] = [
  {
    name: "ESLint",
    command: "eslint",
    type: "Quality & Security",
    language: "JavaScript/TypeScript",
  },
  {
    name: "Semgrep",
    command: "semgrep",
    type: "Security & SAST",
    language: "Multi-language",
  },
  {
    name: "Bandit",
    command: "bandit",
    type: "Security Scanner",
    language: "Python",
  },
  {
    name: "Flake8",
    command: "flake8",
    type: "Style & Convention",
    language: "Python",
  },
  {
    name: "Pylint",
    command: "pylint",
    type: "Code Quality",
    language: "Python",
  },
  {
    name: "SonarQube",
    command: "sonar-scanner",
    type: "Enterprise SAST",
    language: "Multi-language",
  },
];

export class ExternalScannerService {
  /**
   * Check the local installation status of all supported scanners
   */
  async checkAllScannersStatus(): Promise<ExternalScannerStatus[]> {
    const results = await Promise.all(
      SUPPORTED_SCANNERS.map(async (scanner) => {
        return this.checkScannerStatus(scanner);
      })
    );
    return results;
  }

  /**
   * Check if a specific tool is installed in PATH or local node_modules (.bin)
   */
  async checkScannerStatus(
    scanner: Omit<ExternalScannerStatus, "installed" | "version">
  ): Promise<ExternalScannerStatus> {
    try {
      // For Node tools like eslint, check npx / local .bin as well as global command
      const cmd =
        scanner.command === "eslint"
          ? "npx --no-install eslint --version"
          : `${scanner.command} --version`;
      const { stdout } = await execAsync(cmd, { timeout: 3000 });
      const version =
        stdout
          .trim()
          .split("\n")[0]
          ?.replace(/[^0-9.]/g, "") || "Installed";
      return {
        ...scanner,
        installed: true,
        version,
      };
    } catch (_err) {
      return {
        ...scanner,
        installed: false,
      };
    }
  }

  /**
   * Execute a scanner against a specific target directory or file
   */
  async runScanner(
    toolName: string,
    targetPath: string
  ): Promise<ExternalScanResult> {
    const startMs = performance.now();
    const scanner = SUPPORTED_SCANNERS.find(
      (s) => s.name.toLowerCase() === toolName.toLowerCase()
    );

    if (!scanner) {
      return {
        tool: toolName,
        success: false,
        issues: [],
        executionTimeMs: 0,
        error: `Unsupported external scanner: ${toolName}`,
      };
    }

    try {
      logger.info(`Running external scanner ${scanner.name} on ${targetPath}`);
      let cmd = "";
      if (scanner.name === "ESLint") {
        cmd = `npx --no-install eslint --format json ${targetPath}`;
      } else if (scanner.name === "Semgrep") {
        cmd = `semgrep scan --json ${targetPath}`;
      } else if (scanner.name === "Bandit") {
        cmd = `bandit -r -f json ${targetPath}`;
      } else {
        cmd = `${scanner.command} ${targetPath}`;
      }

      const { stdout } = await execAsync(cmd, { timeout: 30000 });
      const elapsed = Math.round(performance.now() - startMs);

      const issues = this.parseScannerOutput(scanner.name, stdout);

      return {
        tool: scanner.name,
        success: true,
        issues,
        rawOutput: stdout,
        executionTimeMs: elapsed,
      };
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - startMs);
      const errorObj = err as { stdout?: string; message?: string };
      // Scanners often exit with non-zero code when vulnerabilities are found
      if (
        errorObj.stdout &&
        (errorObj.stdout.startsWith("[") || errorObj.stdout.startsWith("{"))
      ) {
        try {
          const issues = this.parseScannerOutput(scanner.name, errorObj.stdout);
          return {
            tool: scanner.name,
            success: true,
            issues,
            rawOutput: errorObj.stdout,
            executionTimeMs: elapsed,
          };
        } catch (_parseErr) {
          // Ignore parse error and fall through to failure return
        }
      }

      return {
        tool: scanner.name,
        success: false,
        issues: [],
        executionTimeMs: elapsed,
        error: errorObj.message || String(err),
      };
    }
  }

  /**
   * Parse JSON output from external CLI scanners into standardized SecurityIssue[]
   */
  private parseScannerOutput(
    toolName: string,
    rawJson: string
  ): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    try {
      if (toolName === "ESLint") {
        const results = JSON.parse(rawJson) as Array<{
          filePath: string;
          messages: Array<{
            ruleId?: string;
            severity: number;
            message: string;
            line: number;
            column: number;
          }>;
        }>;

        for (const fileResult of results) {
          for (const msg of fileResult.messages) {
            issues.push({
              id: `eslint-${Math.random().toString(36).substring(2, 9)}`,
              line: msg.line || 1,
              column: msg.column || 1,
              tool: "ESLint",
              type: msg.ruleId || "Syntax/Quality Issue",
              category: "Code Quality",
              message: msg.message,
              severity: msg.severity === 2 ? "High" : "Medium",
              confidence: 90,
              recommendation: `Fix ESLint rule violation: ${msg.ruleId || "unknown"}`,
              remediation: {
                description: `Apply automated fix or manual correction for ${msg.ruleId}`,
                effort: "Low",
                priority: msg.severity === 2 ? 4 : 2,
              },
              filename: fileResult.filePath,
              riskRating: msg.severity === 2 ? "High" : "Medium",
              impact: "Code quality degradation or potential runtime error",
              likelihood: "High",
            });
          }
        }
      } else if (toolName === "Semgrep") {
        const result = JSON.parse(rawJson) as {
          results?: Array<{
            check_id: string;
            path: string;
            start: { line: number; col: number };
            extra: {
              message: string;
              severity: string;
              metadata?: { cwe?: string[] };
            };
          }>;
        };

        if (result.results) {
          for (const match of result.results) {
            const sev =
              match.extra.severity === "ERROR"
                ? "High"
                : match.extra.severity === "WARNING"
                  ? "Medium"
                  : "Low";
            const cweId = match.extra.metadata?.cwe?.[0];
            issues.push({
              id: `semgrep-${Math.random().toString(36).substring(2, 9)}`,
              line: match.start.line || 1,
              column: match.start.col || 1,
              tool: "Semgrep",
              type: match.check_id,
              category: "Security",
              message: match.extra.message,
              severity: sev,
              confidence: 95,
              cweId,
              recommendation: `Review and remediate Semgrep check: ${match.check_id}`,
              remediation: {
                description: match.extra.message,
                effort: "Medium",
                priority: sev === "High" ? 4 : 3,
              },
              filename: match.path,
              riskRating: sev,
              impact:
                "Potential security vulnerability identified by Semgrep SAST",
              likelihood: "Medium",
            });
          }
        }
      } else if (toolName === "Bandit") {
        const result = JSON.parse(rawJson) as {
          results?: Array<{
            test_id: string;
            test_name: string;
            issue_text: string;
            filename: string;
            line_number: number;
            issue_severity: string;
            issue_confidence: string;
          }>;
        };

        if (result.results) {
          for (const match of result.results) {
            const sev =
              match.issue_severity === "HIGH"
                ? "High"
                : match.issue_severity === "MEDIUM"
                  ? "Medium"
                  : "Low";
            issues.push({
              id: `bandit-${Math.random().toString(36).substring(2, 9)}`,
              line: match.line_number || 1,
              tool: "Bandit",
              type: `${match.test_id}: ${match.test_name}`,
              category: "Python Security",
              message: match.issue_text,
              severity: sev,
              confidence: match.issue_confidence === "HIGH" ? 90 : 70,
              recommendation: `Fix Python security flaw identified by Bandit (${match.test_id})`,
              remediation: {
                description: match.issue_text,
                effort: "Medium",
                priority: sev === "High" ? 4 : 2,
              },
              filename: match.filename,
              riskRating: sev,
              impact: "Python application vulnerability",
              likelihood: "Medium",
            });
          }
        }
      }
    } catch (err) {
      logger.error(`Failed to parse scanner output for ${toolName}:`, err);
    }
    return issues;
  }
}
