/**
 * SESC-MCP Scanner Agent
 * Core security scanning engine that runs vulnerability analysis on source code.
 *
 * Uses the shared core-engine which provides the same SECURITY_RULES (100+ patterns),
 * SecretDetectionService (33 types + entropy), DEPENDENCY_VULNERABILITIES (25+ CVEs),
 * and CVSS/security scoring as the web application — ensuring identical results
 * across both surfaces.
 */

import * as crypto from "node:crypto";
import type {
  Vulnerability,
  SeverityLevel,
  CodeFile,
} from "../../shared/types.js";
import { detectLanguageFromFilename, generateId } from "../../shared/utils.js";
import {
  SECURITY_RULES,
  SecretDetectionService,
  DEPENDENCY_VULNERABILITIES,
  calculateCVSSScore,
  calculateSecurityScore,
  type EngineIssue,
  type SecretMatch,
} from "../../shared/core-engine.js";

// ---------------------------------------------------------------------------
// Singleton secret detection service
// ---------------------------------------------------------------------------

const secretService = new SecretDetectionService();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Map the engine's title-case severity to the MCP SeverityLevel type.
 */
function mapSeverity(
  s: "Critical" | "High" | "Medium" | "Low" | undefined
): SeverityLevel {
  switch (s) {
    case "Critical":
      return "critical";
    case "High":
      return "high";
    case "Medium":
      return "medium";
    case "Low":
      return "low";
    default:
      return "info";
  }
}

// ---------------------------------------------------------------------------
// Scanner implementation
// ---------------------------------------------------------------------------

export interface ScanResult {
  vulnerabilities: Vulnerability[];
  secretsFound: number;
  scanDurationMs: number;
  filesScanned: number;
  linesScanned: number;
}

/**
 * Scan a single file for security vulnerabilities using the full rule set.
 */
export function scanFile(file: CodeFile): Vulnerability[] {
  const lang = file.language ?? detectLanguageFromFilename(file.name);
  const vulnerabilities: Vulnerability[] = [];
  const lines = file.content.split("\n");

  // ── 1. Security rules (from core-engine / securityAnalysisEngine) ────────
  // Match on both exact language key and "javascript" for TypeScript files
  const langKeys = new Set([lang]);
  if (lang === "typescript") langKeys.add("javascript"); // TS benefits from JS rules too

  for (const langKey of langKeys) {
    const rules = SECURITY_RULES[langKey] ?? [];
    for (const rule of rules) {
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      let match: RegExpExecArray | null;

      while ((match = regex.exec(file.content)) !== null) {
        const lineNum = file.content.slice(0, match.index).split("\n").length;
        const snippet = lines[lineNum - 1]?.trim() ?? "";

        vulnerabilities.push({
          id: generateId("vuln"),
          type: "vulnerability",
          severity: mapSeverity(rule.severity),
          title: rule.type,
          description: rule.message,
          file: file.name,
          line: lineNum,
          recommendation: rule.remediation.description,
          cwe: rule.cweId,
          owasp: rule.owaspCategory,
          snippet:
            snippet.length > 120 ? snippet.slice(0, 120) + "..." : snippet,
        });

        if (vulnerabilities.length >= 200) break;
      }
      if (vulnerabilities.length >= 200) break;
    }
    if (vulnerabilities.length >= 200) break;
  }

  // ── 2. Secret detection (SecretDetectionService — 33 types + entropy) ────
  const secretResult = secretService.detectSecrets(file.content);
  for (const secret of secretResult.secrets) {
    const lineNum = secret.line;
    const snippet = lines[lineNum - 1]?.trim() ?? "";
    const sev: SeverityLevel = secret.confidence >= 90 ? "critical" : "high";

    vulnerabilities.push({
      id: generateId("secret"),
      type: "secret",
      severity: sev,
      title: `Hardcoded ${secret.type.replace(/_/g, " ")}`,
      description: `${secretService.getSecretTypeDescription(secret.type)} (confidence: ${secret.confidence}%, entropy: ${secret.entropy.toFixed(2)})`,
      file: file.name,
      line: lineNum,
      recommendation:
        "Remove this secret immediately. Rotate it and store in environment variables or a secrets manager.",
      cwe: "CWE-798",
      owasp: "A07:2021 – Identification and Authentication Failures",
      snippet: snippet.length > 120 ? snippet.slice(0, 120) + "..." : snippet,
    });
  }

  return deduplicateVulnerabilities(vulnerabilities);
}

/**
 * Scan multiple files and return aggregated results.
 */
export function scanCodebase(files: CodeFile[]): ScanResult {
  const start = Date.now();
  const allVulns: Vulnerability[] = [];
  let linesScanned = 0;

  for (const file of files) {
    allVulns.push(...scanFile(file));
    linesScanned += file.content.split("\n").length;
  }

  const secretsFound = allVulns.filter((v) => v.type === "secret").length;

  return {
    vulnerabilities: allVulns,
    secretsFound,
    scanDurationMs: Date.now() - start,
    filesScanned: files.length,
    linesScanned,
  };
}

/**
 * Deduplicate by (title + file + line).
 */
function deduplicateVulnerabilities(vulns: Vulnerability[]): Vulnerability[] {
  const seen = new Set<string>();
  return vulns.filter((v) => {
    const key = `${v.title}::${v.file ?? ""}::${v.line ?? ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Detect secrets specifically (used by detect_secrets tool).
 * Uses the full SecretDetectionService (33 types + entropy).
 */
export function detectSecrets(file: CodeFile): Vulnerability[] {
  const lines = file.content.split("\n");
  const result = secretService.detectSecrets(file.content);

  return result.secrets.map((secret: SecretMatch) => {
    const lineNum = secret.line;
    const snippet = lines[lineNum - 1]?.trim() ?? "";
    const sev: SeverityLevel = secret.confidence >= 90 ? "critical" : "high";

    return {
      id: generateId("secret"),
      type: "secret" as const,
      severity: sev,
      title: `Hardcoded ${secret.type.replace(/_/g, " ")}`,
      description: `${secretService.getSecretTypeDescription(secret.type)} found at line ${lineNum}. Entropy: ${secret.entropy.toFixed(2)}, Confidence: ${secret.confidence}%.`,
      file: file.name,
      line: lineNum,
      recommendation: "Remove this secret and rotate it immediately.",
      cwe: "CWE-798",
      owasp: "A07:2021 – Identification and Authentication Failures",
      snippet,
    };
  });
}

/**
 * Scan a package.json / requirements.txt for known vulnerable dependencies.
 * Uses the full DEPENDENCY_VULNERABILITIES database (25+ CVEs).
 */
export function scanDependencies(packageJsonContent: string): Vulnerability[] {
  const results: Vulnerability[] = [];

  let parsed: Record<string, unknown>;
  try {
    parsed = JSON.parse(packageJsonContent) as Record<string, unknown>;
  } catch {
    results.push({
      id: generateId("dep"),
      type: "dependency",
      severity: "low",
      title: "Invalid package.json",
      description: "Could not parse package.json content",
      recommendation: "Ensure package.json is valid JSON.",
    });
    return results;
  }

  const deps: Record<string, string> = {
    ...((parsed["dependencies"] as Record<string, string>) ?? {}),
    ...((parsed["devDependencies"] as Record<string, string>) ?? {}),
  };

  for (const [name, rawVersion] of Object.entries(deps)) {
    // Find all CVE entries for this package
    const entries = DEPENDENCY_VULNERABILITIES.filter(
      (v) => v.package === name
    );

    for (const entry of entries) {
      // Parse the version constraint from the DB entry (e.g. "< 4.17.21")
      const constraint = entry.versions[0] ?? "";
      const threshold = constraint
        .replace(/[^0-9.]/g, "")
        .split(".")
        .map(Number);
      const installed = rawVersion
        .replace(/[\^~>=<\s]/g, "")
        .split(".")
        .map(Number);

      const isBelow =
        installed.length > 0 &&
        installed.some((v, i) => (v ?? 0) < (threshold[i] ?? 0));
      const isWild =
        rawVersion.includes("*") ||
        rawVersion === "latest" ||
        rawVersion === "x";

      if (isBelow || isWild) {
        results.push({
          id: generateId("dep"),
          type: "dependency",
          severity: mapSeverity(entry.severity),
          title: `Vulnerable dependency: ${name}`,
          description: `${name}@${rawVersion} – ${entry.description} (${entry.cveId})`,
          recommendation: entry.remediation,
          cwe: "CWE-1395",
          owasp: "A06:2021 – Vulnerable and Outdated Components",
        });
      }
    }

    // Warn about wildcard versions (only once per package)
    if (
      (rawVersion === "*" || rawVersion === "latest" || rawVersion === "x") &&
      entries.length === 0
    ) {
      results.push({
        id: generateId("dep"),
        type: "dependency",
        severity: "medium",
        title: `Unpinned dependency: ${name}`,
        description: `Dependency ${name} uses an unpinned version "${rawVersion}"`,
        recommendation: `Pin ${name} to a specific version range to ensure reproducible builds.`,
        cwe: "CWE-1395",
        owasp: "A06:2021 – Vulnerable and Outdated Components",
      });
    }
  }

  return results;
}

/**
 * Analyse data flow patterns for taint tracking.
 */
export interface DataFlowResult {
  taintSources: Array<{ line: number; variable: string; source: string }>;
  taintSinks: Array<{ line: number; variable: string; sink: string }>;
  taintPaths: Array<{
    sourceVar: string;
    sinkVar: string;
    risk: SeverityLevel;
  }>;
}

export function analyzeDataFlow(file: CodeFile): DataFlowResult {
  const lines = file.content.split("\n");
  const sources: DataFlowResult["taintSources"] = [];
  const sinks: DataFlowResult["taintSinks"] = [];

  const SOURCE_PATTERNS = [
    {
      pattern: /req\.(body|query|params|headers)\[?["']?(\w+)["']?\]?/g,
      source: "HTTP request",
    },
    { pattern: /process\.argv\[(\d+)\]/g, source: "CLI argument" },
    { pattern: /process\.env\.(\w+)/g, source: "Environment variable" },
    { pattern: /fs\.(readFile|readFileSync)\s*\(/g, source: "File system" },
    { pattern: /JSON\.parse\s*\(/g, source: "JSON deserialization" },
  ];

  const SINK_PATTERNS = [
    { pattern: /db\.(query|execute)\s*\(/g, sink: "Database query" },
    { pattern: /(child_process|exec|spawn)\s*\(/g, sink: "Shell execution" },
    { pattern: /res\.(send|json|write|end)\s*\(/g, sink: "HTTP response" },
    {
      pattern: /fs\.(writeFile|appendFile|createWriteStream)\s*\(/g,
      sink: "File write",
    },
    {
      pattern: /(fetch|http\.request|https\.request)\s*\(/g,
      sink: "HTTP request",
    },
  ];

  lines.forEach((line, i) => {
    for (const { pattern, source } of SOURCE_PATTERNS) {
      pattern.lastIndex = 0;
      const match = new RegExp(pattern.source, pattern.flags).exec(line);
      if (match) {
        sources.push({
          line: i + 1,
          variable: match[2] ?? match[1] ?? "unknown",
          source,
        });
      }
    }

    for (const { pattern, sink } of SINK_PATTERNS) {
      pattern.lastIndex = 0;
      const match = new RegExp(pattern.source, pattern.flags).exec(line);
      if (match) {
        sinks.push({ line: i + 1, variable: line.trim().slice(0, 40), sink });
      }
    }
  });

  const taintPaths: DataFlowResult["taintPaths"] = [];
  for (const source of sources) {
    for (const sink of sinks) {
      if (sink.line > source.line && sink.line - source.line < 20) {
        taintPaths.push({
          sourceVar: source.variable,
          sinkVar: sink.variable,
          risk:
            sink.sink === "Database query" || sink.sink === "Shell execution"
              ? "critical"
              : "high",
        });
      }
    }
  }

  return { taintSources: sources, taintSinks: sinks, taintPaths };
}

/**
 * Calculate security metrics from a list of vulnerabilities.
 * Uses the shared calculateSecurityScore from core-engine.
 */
export interface SecurityMetrics {
  totalIssues: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  securityScore: number;
  secretsCount: number;
  dependencyVulns: number;
  topCwe: string[];
}

export function calculateMetrics(
  vulnerabilities: Vulnerability[],
  _totalLines = 0,
  _totalFiles = 1
): SecurityMetrics {
  const counts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  const cweMap = new Map<string, number>();

  for (const v of vulnerabilities) {
    counts[v.severity] = (counts[v.severity] ?? 0) + 1;
    if (v.cwe) cweMap.set(v.cwe, (cweMap.get(v.cwe) ?? 0) + 1);
  }

  // Build EngineIssue array for the shared scoring function
  const engineIssues: EngineIssue[] = vulnerabilities.map((v) => ({
    severity:
      v.severity === "critical"
        ? "Critical"
        : v.severity === "high"
          ? "High"
          : v.severity === "medium"
            ? "Medium"
            : v.severity === "low"
              ? "Low"
              : undefined,
    category: v.type,
    type: v.title,
    message: v.description,
    filename: v.file ?? "unknown",
  }));

  const securityScore = calculateSecurityScore(engineIssues);

  const topCwe = [...cweMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([cwe]) => cwe);

  return {
    totalIssues: vulnerabilities.length,
    criticalCount: counts.critical,
    highCount: counts.high,
    mediumCount: counts.medium,
    lowCount: counts.low,
    infoCount: counts.info,
    securityScore,
    secretsCount: vulnerabilities.filter((v) => v.type === "secret").length,
    dependencyVulns: vulnerabilities.filter((v) => v.type === "dependency")
      .length,
    topCwe,
  };
}

/**
 * Calculate a CVSS score for a single vulnerability.
 * Thin wrapper around the shared calculateCVSSScore.
 */
export function cvssForVulnerability(vuln: Vulnerability): number {
  return calculateCVSSScore({
    severity:
      vuln.severity === "critical"
        ? "Critical"
        : vuln.severity === "high"
          ? "High"
          : vuln.severity === "medium"
            ? "Medium"
            : vuln.severity === "low"
              ? "Low"
              : undefined,
    category: vuln.type,
    type: vuln.title,
    message: vuln.description,
    filename: vuln.file ?? "unknown",
  });
}

void crypto; // ensure import is used (used by generateId via utils)
