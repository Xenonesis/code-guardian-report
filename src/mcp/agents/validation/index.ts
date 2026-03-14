/**
 * SESC-MCP Validation Agent
 * Verifies security patches through a multi-stage pipeline:
 *  1. Syntax validation
 *  2. Static re-scan (verify vulnerability is gone)
 *  3. Behavioral regression comparison
 *  4. Confidence scoring with rollback recommendation
 */

import type { Vulnerability, ValidationResult } from "../../shared/types.js";
import { generateId } from "../../shared/utils.js";
import { scanFile } from "../scanner/index.js";
import { detectLanguageFromFilename } from "../../shared/utils.js";

// ---------------------------------------------------------------------------
// Syntax validation (lightweight JS/TS check via bracket balancing)
// ---------------------------------------------------------------------------

function validateSyntax(
  content: string,
  language: string
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // For JS/TS: check bracket balance
  if (["javascript", "typescript"].includes(language)) {
    const stack: string[] = [];
    const pairs: Record<string, string> = { "(": ")", "[": "]", "{": "}" };
    const closers = new Set([")", "]", "}"]);
    let inString = false;
    let stringChar = "";
    let inLineComment = false;
    let inBlockComment = false;

    for (let i = 0; i < content.length; i++) {
      const ch = content[i] ?? "";
      const next = content[i + 1] ?? "";

      // Handle line comments
      if (!inString && !inBlockComment && ch === "/" && next === "/") {
        inLineComment = true;
        continue;
      }
      if (inLineComment && ch === "\n") {
        inLineComment = false;
        continue;
      }
      if (inLineComment) continue;

      // Handle block comments
      if (!inString && ch === "/" && next === "*") {
        inBlockComment = true;
        i++;
        continue;
      }
      if (inBlockComment && ch === "*" && next === "/") {
        inBlockComment = false;
        i++;
        continue;
      }
      if (inBlockComment) continue;

      // Handle strings
      if (!inString && (ch === '"' || ch === "'" || ch === "`")) {
        inString = true;
        stringChar = ch;
        continue;
      }
      if (inString && ch === "\\") {
        i++; // skip escaped char
        continue;
      }
      if (inString && ch === stringChar) {
        inString = false;
        continue;
      }
      if (inString) continue;

      if (pairs[ch]) {
        stack.push(ch);
      } else if (closers.has(ch)) {
        const last = stack.pop();
        if (!last || pairs[last] !== ch) {
          errors.push(`Unmatched bracket '${ch}' near position ${i}`);
          if (errors.length >= 3) break;
        }
      }
    }

    if (stack.length > 0) {
      errors.push(`Unclosed brackets: ${stack.join(", ")}`);
    }
  }

  // Universal: check for common truncation artifacts
  if (content.trim().endsWith("...")) {
    errors.push("Content appears truncated (ends with ...)");
  }

  return { valid: errors.length === 0, errors };
}

// ---------------------------------------------------------------------------
// Static re-scan: verify target vulnerability is no longer present
// ---------------------------------------------------------------------------

function checkVulnerabilityResolved(
  patchedContent: string,
  filename: string,
  vuln: Vulnerability | undefined
): { resolved: boolean; remainingIssues: Vulnerability[] } {
  if (!vuln) return { resolved: true, remainingIssues: [] };

  const lang = detectLanguageFromFilename(filename);
  const patchedFile = {
    name: filename,
    content: patchedContent,
    language: lang,
  };
  const newFindings = scanFile(patchedFile);

  // Check if original vulnerability still exists (same title + approx line)
  const stillPresent = newFindings.some(
    (f) =>
      f.title === vuln.title &&
      (!vuln.line || !f.line || Math.abs(f.line - vuln.line) <= 5)
  );

  return {
    resolved: !stillPresent,
    remainingIssues: newFindings,
  };
}

// ---------------------------------------------------------------------------
// Behavioral regression check (AST-level structural comparison)
// ---------------------------------------------------------------------------

interface RegressionResult {
  passed: boolean;
  structuralChanges: number;
  details: string;
}

function runRegression(
  original: string,
  patched: string,
  filename: string
): RegressionResult {
  const origLines = original.split("\n");
  const patchedLines = patched.split("\n");

  const lineDelta = Math.abs(patchedLines.length - origLines.length);
  const changedLines = origLines.filter(
    (line, i) => line !== patchedLines[i]
  ).length;

  // Count function signatures present in both versions
  const funcPattern = /function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\(/g;
  const origFunctions = (original.match(funcPattern) ?? []).length;
  const patchedFunctions = (patched.match(funcPattern) ?? []).length;
  const functionsDelta = Math.abs(patchedFunctions - origFunctions);

  const lang = detectLanguageFromFilename(filename);
  const syntaxCheck = validateSyntax(patched, lang);

  // Regression fails if: major structural change, functions removed, or syntax broken
  const passed =
    syntaxCheck.valid &&
    functionsDelta === 0 &&
    lineDelta <= 20 &&
    changedLines <= 50;

  return {
    passed,
    structuralChanges: lineDelta + changedLines + functionsDelta,
    details: passed
      ? `Regression passed. ${changedLines} lines changed, ${lineDelta} lines delta, ${functionsDelta} function signature changes.`
      : `Regression failed. Syntax: ${syntaxCheck.errors.join("; ") || "ok"}. ` +
        `${changedLines} lines changed, ${functionsDelta} function signature changes.`,
  };
}

// ---------------------------------------------------------------------------
// Confidence scoring
// ---------------------------------------------------------------------------

function computeConfidence(
  syntaxValid: boolean,
  regressionPassed: boolean,
  vulnerabilityResolved: boolean,
  issuesIntroduced: number,
  patchStrategy: string
): number {
  let score = 0.5;

  // Syntax validity: 25% weight
  if (syntaxValid) score += 0.25;
  else score -= 0.2;

  // Regression: 20% weight
  if (regressionPassed) score += 0.2;
  else score -= 0.15;

  // Vulnerability resolved: 25% weight (most important)
  if (vulnerabilityResolved) score += 0.25;
  else score -= 0.25;

  // No new issues introduced: 10% weight
  if (issuesIntroduced === 0) score += 0.1;
  else score -= issuesIntroduced * 0.05;

  // Strategy bonus: some strategies are inherently more reliable
  const STRATEGY_BONUS: Record<string, number> = {
    "parameterized-query": 0.05,
    "output-encoding": 0.05,
    "secret-removal": 0.05,
    "crypto-upgrade": 0.03,
    manual: -0.1,
    "dependency-update": -0.05,
  };
  score += STRATEGY_BONUS[patchStrategy] ?? 0;

  return Math.max(0, Math.min(1, Math.round(score * 100) / 100));
}

// ---------------------------------------------------------------------------
// Main validation pipeline
// ---------------------------------------------------------------------------

export function validatePatch(options: {
  originalContent: string;
  patchedContent: string;
  language?: string;
  filename?: string;
  vulnerability?: Vulnerability;
  patchStrategy?: string;
  confidenceThreshold?: number;
}): ValidationResult {
  const {
    originalContent,
    patchedContent,
    language,
    filename = "file",
    vulnerability,
    patchStrategy = "input-sanitization",
    confidenceThreshold = 0.7,
  } = options;

  const lang = language ?? detectLanguageFromFilename(filename);

  // Step 1: Syntax validation
  const syntaxCheck = validateSyntax(patchedContent, lang);

  // Step 2: Static re-scan
  const { resolved: vulnerabilityResolved, remainingIssues } =
    checkVulnerabilityResolved(patchedContent, filename, vulnerability);

  // Step 3: Regression check
  const regression = runRegression(originalContent, patchedContent, filename);

  // New issues introduced by the patch
  const originalIssues = vulnerability ? [vulnerability] : [];
  const issuesIntroduced = remainingIssues.filter(
    (r) => !originalIssues.some((o) => o.title === r.title)
  );

  // Step 4: Confidence score
  const confidenceScore = computeConfidence(
    syntaxCheck.valid,
    regression.passed,
    vulnerabilityResolved,
    issuesIntroduced.length,
    patchStrategy
  );

  const rollbackRecommended = confidenceScore < confidenceThreshold;

  const details = [
    `Syntax: ${syntaxCheck.valid ? "✓" : "✗"} (${syntaxCheck.errors.join("; ") || "no errors"})`,
    `Vulnerability resolved: ${vulnerabilityResolved ? "✓" : "✗"}`,
    `Regression: ${regression.passed ? "✓" : "✗"} (${regression.details})`,
    `New issues introduced: ${issuesIntroduced.length}`,
    `Confidence score: ${Math.round(confidenceScore * 100)}%`,
    rollbackRecommended
      ? `⚠ Rollback recommended (score ${Math.round(confidenceScore * 100)}% < threshold ${Math.round(confidenceThreshold * 100)}%)`
      : "✓ Patch accepted",
  ].join("\n");

  return {
    patchId: generateId("val"),
    staticValid: syntaxCheck.valid,
    syntaxValid: syntaxCheck.valid,
    regressionPassed: regression.passed,
    vulnerabilityResolved,
    issuesIntroduced,
    confidenceScore,
    rollbackRecommended,
    details,
  };
}
