/**
 * MCP Prompts
 *
 * Pre-built prompt templates that AI clients can invoke to guide
 * their interaction with Code Guardian tools.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  // ── Security Audit Prompt ─────────────────────────────────────
  server.registerPrompt(
    "security-audit",
    {
      title: "Security Audit",
      description:
        "Guides a comprehensive security audit of source code using the full pipeline",
      argsSchema: {
        filename: z.string().describe("The filename to audit"),
        focus: z
          .string()
          .optional()
          .describe("Optional focus area (e.g. 'injection', 'auth', 'crypto')"),
      },
    },
    async ({ filename, focus }) => {
      const focusClause = focus
        ? ` Focus especially on ${focus}-related vulnerabilities.`
        : "";
      return {
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                `Please perform a comprehensive security audit of the file "${filename}".`,
                "",
                "Steps:",
                "1. Use the **full_security_pipeline** tool to run all scanners, data-flow analysis, and metrics.",
                "2. Review the results and use **build_exploit_graph** to visualize attack chains.",
                "3. For any Critical or High severity issues, use **simulate_exploit** to assess real-world risk.",
                "4. Use **generate_patch** for each exploitable issue.",
                "5. Validate each patch with **validate_patch** and **run_regression**.",
                "6. Use **optimize_patches** to prioritize remediation by risk.",
                "7. Save results to memory with **query_memory** for future reference.",
                "",
                `Present a summary table of all findings sorted by risk.${focusClause}`,
              ].join("\n"),
            },
          },
        ],
      };
    }
  );

  // ── Quick Scan Prompt ─────────────────────────────────────────
  server.registerPrompt(
    "quick-scan",
    {
      title: "Quick Scan",
      description: "Runs a fast security scan on a single file",
      argsSchema: {
        filename: z.string().describe("The filename to scan"),
      },
    },
    async ({ filename }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Run a quick security scan on "${filename}":`,
              "1. Use **scan_file** to identify vulnerabilities.",
              "2. Use **detect_secrets** to check for leaked credentials.",
              "3. Summarize findings with severity counts and top 3 recommendations.",
            ].join("\n"),
          },
        },
      ],
    })
  );

  // ── Dependency Audit Prompt ───────────────────────────────────
  server.registerPrompt(
    "dependency-audit",
    {
      title: "Dependency Audit",
      description:
        "Audits package.json for vulnerable or outdated dependencies",
      argsSchema: {},
    },
    async () => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              "Please audit this project's dependencies:",
              "1. Use **scan_dependencies** with the package.json contents.",
              "2. Identify all packages with known CVEs.",
              "3. Highlight supply-chain risks.",
              "4. Recommend specific version upgrades.",
            ].join("\n"),
          },
        },
      ],
    })
  );

  // ── Fix Issue Prompt ──────────────────────────────────────────
  server.registerPrompt(
    "fix-issue",
    {
      title: "Fix Security Issue",
      description:
        "Generates, previews, and validates a fix for a specific security issue",
      argsSchema: {
        issueId: z.string().describe("ID of the SecurityIssue to fix"),
        filename: z.string().describe("File containing the issue"),
      },
    },
    async ({ issueId, filename }) => ({
      messages: [
        {
          role: "user" as const,
          content: {
            type: "text" as const,
            text: [
              `Fix the security issue ${issueId} in "${filename}":`,
              "1. Use **generate_patch** to create a fix.",
              "2. Use **preview_patch** to show the unified diff.",
              "3. Use **validate_patch** to confirm the fix resolves the issue without regressions.",
              "4. Use **check_confidence** to assess fix reliability.",
              "5. If validation passes, present the patch for approval.",
            ].join("\n"),
          },
        },
      ],
    })
  );
}
