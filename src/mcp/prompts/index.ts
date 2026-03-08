/**
 * SESC-MCP Prompts
 * Provides reusable prompt templates for common security workflows.
 *
 * Available prompts:
 *   security-audit       – generate a full security audit report
 *   fix-vulnerability    – step-by-step remediation guide for a single vuln
 *   risk-assessment      – contextual risk assessment with remediation priority
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPrompts(server: McpServer): void {
  // ── security-audit ───────────────────────────────────────────────────────
  server.prompt(
    "security-audit",
    "Generate a comprehensive security audit report for a codebase. " +
      "Use this prompt to instruct the AI to run the full SESC-MCP pipeline " +
      "and produce a structured report with findings, risk scores, and remediation steps.",
    {
      projectName: z
        .string()
        .optional()
        .describe("Name of the project being audited"),
      complianceFramework: z
        .enum(["OWASP Top 10", "NIST", "PCI-DSS", "HIPAA", "SOC2", "none"])
        .optional()
        .describe("Compliance framework to align findings with"),
      severityThreshold: z
        .enum(["critical", "high", "medium", "low", "info"])
        .optional()
        .describe("Minimum severity to report (default: medium)"),
    },
    ({ projectName, complianceFramework, severityThreshold }) => {
      const project = projectName ?? "the provided codebase";
      const framework = complianceFramework ?? "OWASP Top 10";
      const threshold = severityThreshold ?? "medium";

      return {
        description: `Security audit prompt for ${project}`,
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                `You are a senior application security engineer performing a full security audit of ${project}.`,
                ``,
                `## Your Task`,
                `1. Use the \`scan_codebase\` tool to scan all provided files for vulnerabilities.`,
                `2. Use the \`build_exploit_graph\` tool to map attack paths between vulnerabilities.`,
                `3. Use the \`get_attack_paths\` tool to identify the highest-risk attack chains.`,
                `4. For each finding at ${threshold} severity or above, use \`generate_patch\` to propose a fix.`,
                `5. Use \`validate_patch\` to verify each proposed fix is safe and effective.`,
                `6. Use \`optimize_patches\` to prioritize fixes by risk reduction vs. implementation cost.`,
                `7. Use \`calculate_risk_score\` to compute the overall residual risk after remediation.`,
                ``,
                `## Report Format`,
                `Structure your final report as follows:`,
                ``,
                `### Executive Summary`,
                `- Overall security posture (0-100 score)`,
                `- Critical/High/Medium/Low finding counts`,
                `- Top 3 most urgent remediation actions`,
                ``,
                `### Findings`,
                `For each vulnerability (${threshold}+):`,
                `- ID, Title, Severity, CWE, OWASP category`,
                `- Affected file and line number`,
                `- Description and exploit scenario`,
                `- Recommended fix with code diff`,
                ``,
                `### Attack Path Analysis`,
                `- Exploit graph summary (nodes, edges)`,
                `- Top attack chains with risk scores`,
                ``,
                `### Remediation Plan`,
                `- Prioritized patch list (risk-optimized order)`,
                `- Estimated effort per patch`,
                `- Residual risk after all patches applied`,
                ``,
                `### Compliance Mapping`,
                `- Map findings to ${framework} categories`,
                `- Compliance gaps identified`,
                ``,
                `Be thorough, precise, and actionable. Include code examples for all patches.`,
              ].join("\n"),
            },
          },
        ],
      };
    }
  );

  // ── fix-vulnerability ────────────────────────────────────────────────────
  server.prompt(
    "fix-vulnerability",
    "Get step-by-step remediation guidance for a specific vulnerability. " +
      "Generates a detailed fix workflow using the patch generation and validation agents.",
    {
      vulnerabilityId: z
        .string()
        .describe("ID of the vulnerability to fix (from scan results)"),
      vulnerabilityTitle: z
        .string()
        .optional()
        .describe("Human-readable title of the vulnerability"),
      cwe: z.string().optional().describe("CWE identifier (e.g. CWE-89)"),
      severity: z
        .enum(["critical", "high", "medium", "low", "info"])
        .optional()
        .describe("Severity of the vulnerability"),
      patchStrategy: z
        .enum([
          "input-sanitization",
          "parameterized-query",
          "output-encoding",
          "secret-removal",
          "dependency-update",
          "access-control",
          "crypto-upgrade",
          "path-validation",
          "error-handling",
          "manual",
        ])
        .optional()
        .describe("Preferred patch strategy (auto-selected if omitted)"),
    },
    ({ vulnerabilityId, vulnerabilityTitle, cwe, severity, patchStrategy }) => {
      const title = vulnerabilityTitle ?? vulnerabilityId;
      const cweStr = cwe ? ` (${cwe})` : "";
      const severityStr = severity ? ` [${severity.toUpperCase()}]` : "";
      const strategyHint = patchStrategy
        ? `Use the \`${patchStrategy}\` patch strategy.`
        : "Auto-select the most appropriate patch strategy based on the vulnerability type.";

      return {
        description: `Fix guidance for ${title}`,
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                `You are a security engineer fixing vulnerability: **${title}**${severityStr}${cweStr}`,
                ``,
                `## Remediation Workflow`,
                ``,
                `### Step 1 — Confirm the Vulnerability`,
                `Use \`scan_file\` on the affected file to confirm the vulnerability is present`,
                `and locate the exact line(s) that need patching.`,
                ``,
                `### Step 2 — Check Memory for Prior Fixes`,
                `Use \`query_memory\` to check if this type of vulnerability has been fixed before.`,
                `If a successful strategy exists in memory, prefer it.`,
                ``,
                `### Step 3 — Generate the Patch`,
                `Use \`generate_patch\` with vulnerability ID \`${vulnerabilityId}\`.`,
                strategyHint,
                ``,
                `### Step 4 — Preview the Diff`,
                `Use \`preview_patch\` to display a human-readable diff of the change.`,
                ``,
                `### Step 5 — Validate the Patch`,
                `Use \`validate_patch\` to verify:`,
                `- The patched code has valid syntax`,
                `- The vulnerability is resolved (no re-scan hits)`,
                `- No new vulnerabilities are introduced`,
                `- Confidence score is ≥ 0.7`,
                ``,
                `### Step 6 — Apply (if validated)`,
                `If validation passes, use \`apply_patch\` to finalize the fix.`,
                `If rollback is recommended, explain why and suggest alternatives.`,
                ``,
                `### Step 7 — Report`,
                `Provide:`,
                `- The complete patched file content`,
                `- A diff showing all changes`,
                `- Confidence score and validation details`,
                `- An explanation of why the patch resolves the vulnerability`,
                ``,
                `Be precise. Never introduce new vulnerabilities while fixing existing ones.`,
              ].join("\n"),
            },
          },
        ],
      };
    }
  );

  // ── risk-assessment ──────────────────────────────────────────────────────
  server.prompt(
    "risk-assessment",
    "Perform a contextual risk assessment of discovered vulnerabilities. " +
      "Produces a risk-prioritized remediation roadmap using the exploit simulation " +
      "and risk optimization agents.",
    {
      context: z
        .string()
        .optional()
        .describe(
          "Business context (e.g. 'public API', 'internal tool', 'e-commerce checkout')"
        ),
      threatModel: z
        .enum([
          "external-attacker",
          "insider-threat",
          "automated-scanner",
          "supply-chain",
        ])
        .optional()
        .describe("Primary threat model to consider"),
      budget: z
        .enum(["low", "medium", "high", "unlimited"])
        .optional()
        .describe("Remediation effort budget"),
    },
    ({ context, threatModel, budget }) => {
      const ctx = context ?? "a production web application";
      const threat = threatModel ?? "external-attacker";
      const effort = budget ?? "medium";

      return {
        description: "Risk assessment and remediation roadmap",
        messages: [
          {
            role: "user" as const,
            content: {
              type: "text" as const,
              text: [
                `You are a security risk analyst performing a risk assessment for ${ctx}.`,
                `Threat model: **${threat}** | Remediation budget: **${effort}**`,
                ``,
                `## Assessment Workflow`,
                ``,
                `### Phase 1 — Scan & Discover`,
                `Use \`scan_codebase\` to identify all vulnerabilities.`,
                `Use \`detect_secrets\` on configuration files.`,
                `Use \`scan_dependencies\` if package.json is available.`,
                ``,
                `### Phase 2 — Build Exploit Graph`,
                `Use \`build_exploit_graph\` to model how vulnerabilities chain together.`,
                `Use \`get_attack_paths\` to find the most dangerous attack chains.`,
                `Use \`simulate_exploit\` for the top 3 critical vulnerabilities.`,
                ``,
                `### Phase 3 — Risk Scoring`,
                `Use \`calculate_risk_score\` to score all vulnerabilities.`,
                `Consider the threat model: a **${threat}** would most likely target:`,
                ...(threat === "external-attacker"
                  ? [
                      "- Injection vulnerabilities (SQLi, XSS, RCE)",
                      "- Authentication bypass",
                      "- Exposed secrets",
                    ]
                  : threat === "insider-threat"
                    ? [
                        "- Access control issues",
                        "- Sensitive data exposure",
                        "- Audit log manipulation",
                      ]
                    : threat === "supply-chain"
                      ? [
                          "- Vulnerable dependencies",
                          "- Build process injection",
                          "- Secret exfiltration",
                        ]
                      : [
                          "- All OWASP Top 10 categories",
                          "- Automated exploit patterns",
                        ]),
                ``,
                `### Phase 4 — Optimization`,
                `Use \`optimize_patches\` to create a remediation plan that maximizes risk`,
                `reduction within a **${effort}** effort budget.`,
                ``,
                `### Phase 5 — Roadmap`,
                `Present a phased remediation roadmap:`,
                ``,
                `**Immediate (within 24h)** — Critical vulnerabilities, active exploits`,
                `**Short-term (1 sprint)** — High severity, easy wins`,
                `**Medium-term (1 month)** — Medium severity, architecture changes`,
                `**Long-term (quarter)** — Low severity, process improvements`,
                ``,
                `For each item include: vulnerability ID, risk score, effort estimate, business impact.`,
                ``,
                `Quantify residual risk before and after remediation.`,
              ].join("\n"),
            },
          },
        ],
      };
    }
  );
}
