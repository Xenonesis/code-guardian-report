/**
 * SESC-MCP Resources
 * Exposes read-only server-side data via MCP resource URIs.
 *
 * Available resources:
 *   sesc://memory/stats          – learning memory statistics
 *   sesc://memory/recent         – recent vulnerability-fix records
 *   sesc://config/rules          – active security rule catalogue
 *   sesc://config/languages      – supported languages
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MemoryDatabase } from "../memory/database.js";

// ---------------------------------------------------------------------------
// Security rule catalogue (static, for inspection by AI clients)
// ---------------------------------------------------------------------------

const SECURITY_RULES = [
  // Injection
  {
    id: "INJ-001",
    cwe: "CWE-89",
    owasp: "A03:2021",
    title: "SQL Injection",
    severity: "critical",
    languages: ["javascript", "typescript", "python", "java", "php"],
  },
  {
    id: "INJ-002",
    cwe: "CWE-79",
    owasp: "A03:2021",
    title: "Cross-Site Scripting",
    severity: "high",
    languages: ["javascript", "typescript", "html"],
  },
  {
    id: "INJ-003",
    cwe: "CWE-78",
    owasp: "A03:2021",
    title: "OS Command Injection",
    severity: "critical",
    languages: ["javascript", "typescript", "python", "ruby"],
  },
  {
    id: "INJ-004",
    cwe: "CWE-94",
    owasp: "A03:2021",
    title: "Code Injection / eval()",
    severity: "critical",
    languages: ["javascript", "typescript", "python"],
  },
  {
    id: "INJ-005",
    cwe: "CWE-611",
    owasp: "A05:2021",
    title: "XML External Entity",
    severity: "high",
    languages: ["java", "python", "javascript"],
  },
  // Authentication / secrets
  {
    id: "AUTH-001",
    cwe: "CWE-798",
    owasp: "A07:2021",
    title: "Hard-coded Credentials",
    severity: "critical",
    languages: ["*"],
  },
  {
    id: "AUTH-002",
    cwe: "CWE-259",
    owasp: "A07:2021",
    title: "Hard-coded Password",
    severity: "critical",
    languages: ["*"],
  },
  {
    id: "AUTH-003",
    cwe: "CWE-321",
    owasp: "A07:2021",
    title: "Hard-coded JWT Secret",
    severity: "critical",
    languages: ["javascript", "typescript", "python"],
  },
  // Cryptography
  {
    id: "CRYPT-001",
    cwe: "CWE-327",
    owasp: "A02:2021",
    title: "Weak Hash Algorithm",
    severity: "high",
    languages: ["*"],
  },
  {
    id: "CRYPT-002",
    cwe: "CWE-326",
    owasp: "A02:2021",
    title: "Weak Encryption",
    severity: "high",
    languages: ["*"],
  },
  {
    id: "CRYPT-003",
    cwe: "CWE-330",
    owasp: "A02:2021",
    title: "Insecure Randomness",
    severity: "medium",
    languages: ["javascript", "typescript", "python"],
  },
  // Path / file
  {
    id: "PATH-001",
    cwe: "CWE-22",
    owasp: "A01:2021",
    title: "Path Traversal",
    severity: "high",
    languages: ["*"],
  },
  // Network / SSRF
  {
    id: "NET-001",
    cwe: "CWE-918",
    owasp: "A10:2021",
    title: "Server-Side Request Forgery",
    severity: "high",
    languages: ["javascript", "typescript", "python", "java"],
  },
  // Prototype pollution
  {
    id: "PROTO-001",
    cwe: "CWE-1321",
    owasp: "A03:2021",
    title: "Prototype Pollution",
    severity: "high",
    languages: ["javascript", "typescript"],
  },
  // Dependency
  {
    id: "DEP-001",
    cwe: "CWE-1035",
    owasp: "A06:2021",
    title: "Vulnerable Dependency",
    severity: "medium",
    languages: ["*"],
  },
] as const;

const SUPPORTED_LANGUAGES = [
  {
    id: "javascript",
    extensions: [".js", ".mjs", ".cjs"],
    label: "JavaScript",
  },
  {
    id: "typescript",
    extensions: [".ts", ".tsx", ".mts", ".cts"],
    label: "TypeScript",
  },
  { id: "python", extensions: [".py", ".pyw"], label: "Python" },
  { id: "java", extensions: [".java"], label: "Java" },
  { id: "go", extensions: [".go"], label: "Go" },
  { id: "ruby", extensions: [".rb"], label: "Ruby" },
  { id: "php", extensions: [".php"], label: "PHP" },
  { id: "rust", extensions: [".rs"], label: "Rust" },
  { id: "csharp", extensions: [".cs"], label: "C#" },
  {
    id: "cpp",
    extensions: [".cpp", ".cc", ".cxx", ".h", ".hpp"],
    label: "C/C++",
  },
] as const;

// ---------------------------------------------------------------------------
// Register all resources
// ---------------------------------------------------------------------------

export function registerResources(server: McpServer, db: MemoryDatabase): void {
  // ── sesc://memory/stats ──────────────────────────────────────────────────
  server.resource(
    "memory-stats",
    "sesc://memory/stats",
    {
      description:
        "Adaptive learning memory statistics: total records, success rates per strategy, " +
        "top performing strategies, language breakdown.",
      mimeType: "application/json",
    },
    async () => {
      const stats = db.getStats();
      return {
        contents: [
          {
            uri: "sesc://memory/stats",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                description: "SESC-MCP Adaptive Learning Memory Statistics",
                ...stats,
                generatedAt: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ── sesc://memory/recent ─────────────────────────────────────────────────
  server.resource(
    "memory-recent",
    "sesc://memory/recent",
    {
      description:
        "Most recent 20 vulnerability-fix records stored by the adaptive memory module.",
      mimeType: "application/json",
    },
    async () => {
      const records = db.getRecentRecords(20);
      return {
        contents: [
          {
            uri: "sesc://memory/recent",
            mimeType: "application/json",
            text: JSON.stringify(
              {
                description: "Recent SESC-MCP vulnerability-fix records",
                count: records.length,
                records,
                generatedAt: new Date().toISOString(),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  // ── sesc://config/rules ──────────────────────────────────────────────────
  server.resource(
    "security-rules",
    "sesc://config/rules",
    {
      description:
        "Full catalogue of security rules used by the Scanner Agent, " +
        "including CWE identifiers, OWASP categories, severity, and applicable languages.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "sesc://config/rules",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              description: "SESC-MCP Security Rule Catalogue",
              version: "1.0.0",
              totalRules: SECURITY_RULES.length,
              rules: SECURITY_RULES,
            },
            null,
            2
          ),
        },
      ],
    })
  );

  // ── sesc://config/languages ──────────────────────────────────────────────
  server.resource(
    "supported-languages",
    "sesc://config/languages",
    {
      description:
        "Programming languages supported by the SESC-MCP scanner, " +
        "with their file extensions.",
      mimeType: "application/json",
    },
    async () => ({
      contents: [
        {
          uri: "sesc://config/languages",
          mimeType: "application/json",
          text: JSON.stringify(
            {
              description: "Languages supported by the SESC-MCP Scanner Agent",
              count: SUPPORTED_LANGUAGES.length,
              languages: SUPPORTED_LANGUAGES,
            },
            null,
            2
          ),
        },
      ],
    })
  );
}
