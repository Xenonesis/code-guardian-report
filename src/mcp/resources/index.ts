/**
 * MCP Resources
 *
 * Exposes server metadata, supported CWE/OWASP categories, and
 * configuration as MCP resources that AI clients can read.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DEFAULT_CONFIG } from "../shared/types.js";

export function registerResources(server: McpServer): void {
  // ── Server Info ─────────────────────────────────────────────────
  server.registerResource(
    "server-info",
    "codeguardian://info",
    {
      description: "Code Guardian MCP server information and capabilities",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "codeguardian://info",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              name: DEFAULT_CONFIG.name,
              version: DEFAULT_CONFIG.version,
              description:
                "Enterprise-grade security analysis platform with 19 MCP tools across 5 agent domains",
              tools: 19,
              agents: [
                "Scanner (scan_file, scan_codebase, detect_secrets, scan_dependencies)",
                "DataFlow (analyze_data_flow)",
                "Metrics (calculate_metrics)",
                "ExploitSim (build_exploit_graph, simulate_exploit, get_attack_paths)",
                "PatchGen (generate_patch, preview_patch, apply_patch)",
                "Validation (validate_patch, run_regression, check_confidence)",
                "RiskOptimizer (optimize_patches, calculate_risk_score)",
                "Memory (query_memory)",
                "Pipeline (full_security_pipeline)",
              ],
              supportedLanguages: [
                "TypeScript",
                "JavaScript",
                "Python",
                "Java",
                "C++",
                "Go",
                "Rust",
                "PHP",
                "Ruby",
                "C#",
                "Swift",
                "Kotlin",
              ],
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // ── OWASP Top 10 (2025 RC) ─────────────────────────────────────
  server.registerResource(
    "owasp-categories",
    "codeguardian://owasp-2025",
    {
      description:
        "OWASP Top 10 2025 Release Candidate categories used by the scanner",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "codeguardian://owasp-2025",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              standard: "OWASP Top 10 2025 RC",
              categories: [
                { id: "A01", name: "Broken Access Control" },
                { id: "A02", name: "Cryptographic Failures" },
                { id: "A03", name: "Injection" },
                { id: "A04", name: "Insecure Design" },
                { id: "A05", name: "Security Misconfiguration" },
                { id: "A06", name: "Vulnerable and Outdated Components" },
                {
                  id: "A07",
                  name: "Identification and Authentication Failures",
                },
                { id: "A08", name: "Software and Data Integrity Failures" },
                { id: "A09", name: "Security Logging and Monitoring Failures" },
                { id: "A10", name: "Server-Side Request Forgery (SSRF)" },
              ],
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // ── Configuration ──────────────────────────────────────────────
  server.registerResource(
    "server-config",
    "codeguardian://config",
    {
      description: "Current server configuration and limits",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "codeguardian://config",
          mimeType: "application/json",
          text: JSON.stringify(DEFAULT_CONFIG, null, 2),
        },
      ],
    })
  );
}
