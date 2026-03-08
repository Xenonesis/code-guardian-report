/**
 * SESC-MCP Patch Generation Agent
 * Template-based patch engine that generates fixes for known vulnerability patterns.
 * Leverages the adaptive memory module for strategy selection.
 */

import type {
  Vulnerability,
  Patch,
  PatchStrategy,
} from "../../shared/types.js";
import { generateId, generateDiff } from "../../shared/utils.js";

// ---------------------------------------------------------------------------
// Strategy selector: picks the best strategy for a given vulnerability
// ---------------------------------------------------------------------------

export function selectPatchStrategy(vuln: Vulnerability): PatchStrategy {
  const cwe = vuln.cwe ?? "";
  const title = vuln.title.toLowerCase();

  if (cwe === "CWE-89" || title.includes("sql injection"))
    return "parameterized-query";
  if (
    cwe === "CWE-79" ||
    title.includes("xss") ||
    title.includes("cross-site scripting")
  )
    return "output-encoding";
  if (cwe === "CWE-78" || title.includes("command injection"))
    return "input-sanitization";
  if (cwe === "CWE-22" || title.includes("path traversal"))
    return "path-validation";
  if (
    cwe === "CWE-798" ||
    cwe === "CWE-321" ||
    title.includes("hardcoded") ||
    title.includes("secret")
  )
    return "secret-removal";
  if (
    cwe === "CWE-1395" ||
    title.includes("dependency") ||
    title.includes("vulnerable")
  )
    return "dependency-update";
  if (cwe === "CWE-284" || title.includes("access control"))
    return "access-control";
  if (
    cwe === "CWE-327" ||
    cwe === "CWE-328" ||
    cwe === "CWE-338" ||
    title.includes("crypto") ||
    title.includes("random")
  )
    return "crypto-upgrade";
  if (title.includes("error") || title.includes("exception"))
    return "error-handling";

  return "input-sanitization";
}

// ---------------------------------------------------------------------------
// Template-based patch generators
// ---------------------------------------------------------------------------

type PatchTemplate = (
  original: string,
  vuln: Vulnerability
) => { patchedContent: string; explanation: string } | null;

const PATCH_TEMPLATES: Record<PatchStrategy, PatchTemplate> = {
  "parameterized-query": (original, vuln) => {
    const lines = original.split("\n");
    const lineIdx = (vuln.line ?? 1) - 1;
    const targetLine = lines[lineIdx];
    if (!targetLine) return null;

    // Replace template literal SQL with parameterized query
    const patched = targetLine
      .replace(
        /`([^`]*)\$\{([^}]+)\}([^`]*)`/g,
        (_, before, varName, after) =>
          `"${before}?"` + (before || after ? `, [${varName}]` : "")
      )
      .replace(
        /["']([^"']*(SELECT|INSERT|UPDATE|DELETE)[^"']*?)["']\s*\+\s*(\w+)/gi,
        '"$1?"'
      );

    if (patched === targetLine) return null;

    lines[lineIdx] = patched;
    return {
      patchedContent: lines.join("\n"),
      explanation:
        "Replaced string interpolation/concatenation in SQL query with a parameterized query " +
        "to prevent SQL injection (CWE-89). The user input is now passed as a bound parameter.",
    };
  },

  "output-encoding": (original, vuln) => {
    const lines = original.split("\n");
    const lineIdx = (vuln.line ?? 1) - 1;
    const targetLine = lines[lineIdx];
    if (!targetLine) return null;

    let patched = targetLine;

    // Replace innerHTML with textContent
    patched = patched.replace(/\.innerHTML\s*=/g, ".textContent =");

    // Replace dangerouslySetInnerHTML with a comment suggesting sanitization
    patched = patched.replace(
      /dangerouslySetInnerHTML\s*=\s*\{\s*\{/g,
      "// TODO: sanitize with DOMPurify before using dangerouslySetInnerHTML\n    dangerouslySetInnerHTML={{ "
    );

    if (patched === targetLine) return null;

    lines[lineIdx] = patched;
    return {
      patchedContent: lines.join("\n"),
      explanation:
        "Replaced innerHTML assignment with textContent to prevent XSS (CWE-79). " +
        "textContent automatically HTML-encodes the value, preventing script injection.",
    };
  },

  "input-sanitization": (original, vuln) => {
    const lines = original.split("\n");
    const lineIdx = (vuln.line ?? 1) - 1;
    const targetLine = lines[lineIdx];
    if (!targetLine) return null;

    // For eval(), suggest replacement
    let patched = targetLine;
    patched = patched.replace(
      /\beval\s*\(([^)]+)\)/g,
      "JSON.parse($1) /* Replaced eval() with JSON.parse to prevent code injection */"
    );

    // For shell commands with template literals
    patched = patched.replace(
      /(exec|spawn|execSync|spawnSync)\s*\(`[^`]*\$\{([^}]+)\}[^`]*`\)/g,
      (_, fn, varName) =>
        `${fn}(sanitizeShellArg(${varName})) /* Sanitize input before shell execution */`
    );

    if (patched === targetLine) {
      // Generic: add a comment with the recommendation
      lines.splice(
        lineIdx,
        0,
        `  // SECURITY FIX: Validate/sanitize input before use`
      );
      return {
        patchedContent: lines.join("\n"),
        explanation:
          `Added a comment to mark the location that requires input sanitization. ` +
          (vuln.recommendation ?? ""),
      };
    }

    lines[lineIdx] = patched;
    return {
      patchedContent: lines.join("\n"),
      explanation:
        "Applied input sanitization to prevent injection attack (CWE-78/CWE-94). " +
        "User input must be validated and sanitized before use in sensitive operations.",
    };
  },

  "path-validation": (original, vuln) => {
    const lines = original.split("\n");
    const lineIdx = (vuln.line ?? 1) - 1;
    const targetLine = lines[lineIdx];
    if (!targetLine) return null;

    const indent = targetLine.match(/^(\s*)/)?.[1] ?? "";
    const safePathCheck =
      `${indent}// SECURITY FIX: Validate path is within allowed base directory\n` +
      `${indent}const resolvedPath = path.resolve(BASE_DIR, userInput);\n` +
      `${indent}if (!resolvedPath.startsWith(path.resolve(BASE_DIR))) {\n` +
      `${indent}  throw new Error('Access denied: path traversal attempt detected');\n` +
      `${indent}}\n`;

    lines.splice(lineIdx, 0, safePathCheck);
    return {
      patchedContent: lines.join("\n"),
      explanation:
        "Added path traversal protection (CWE-22). The patched code resolves the path " +
        "and verifies it stays within the intended base directory before file operations.",
    };
  },

  "secret-removal": (original, vuln) => {
    const lines = original.split("\n");
    const lineIdx = (vuln.line ?? 1) - 1;
    const targetLine = lines[lineIdx];
    if (!targetLine) return null;

    // Replace hardcoded value with environment variable reference
    const patched = targetLine
      .replace(
        /(password|api[_-]?key|apikey|secret|token|credential)\s*[=:]\s*["'][^"']+["']/gi,
        (match) => {
          const keyPart = match.split(/[=:]/)[0]?.trim() ?? "SECRET";
          const envName = keyPart.toUpperCase().replace(/[^A-Z0-9]/g, "_");
          return `${keyPart}: process.env.${envName}`;
        }
      )
      .replace(
        /-----BEGIN [A-Z ]* PRIVATE KEY-----[\s\S]*?-----END [A-Z ]* PRIVATE KEY-----/g,
        "/* REMOVED: Private key should be loaded from secure storage, not hardcoded */"
      );

    if (patched === targetLine) return null;

    lines[lineIdx] = patched;
    return {
      patchedContent: lines.join("\n"),
      explanation:
        "Replaced hardcoded secret with an environment variable reference (CWE-798). " +
        "The secret must be added to your environment configuration (.env file, secrets manager). " +
        "IMPORTANT: Rotate this secret immediately as it was exposed in source code.",
    };
  },

  "dependency-update": (original, vuln) => {
    // For dependency updates, suggest the upgrade in the explanation
    return {
      patchedContent: original,
      explanation:
        `${vuln.title}: ${vuln.description}\n\n` +
        (vuln.recommendation ??
          "Update the dependency to the latest secure version.") +
        "\n\nRun: npm update <package-name> or npm install <package-name>@latest",
    };
  },

  "access-control": (original, vuln) => {
    const lines = original.split("\n");
    const lineIdx = (vuln.line ?? 1) - 1;
    const targetLine = lines[lineIdx];
    if (!targetLine) return null;

    const indent = targetLine.match(/^(\s*)/)?.[1] ?? "";
    const authCheck =
      `${indent}// SECURITY FIX: Add authorization check before proceeding\n` +
      `${indent}if (!req.user || !req.user.hasPermission('required-permission')) {\n` +
      `${indent}  return res.status(403).json({ error: 'Forbidden' });\n` +
      `${indent}}\n`;

    lines.splice(lineIdx, 0, authCheck);
    return {
      patchedContent: lines.join("\n"),
      explanation:
        "Added authorization check to prevent broken access control (CWE-284). " +
        "The handler now verifies the user has the required permission before processing the request.",
    };
  },

  "crypto-upgrade": (original, vuln) => {
    const lines = original.split("\n");
    const lineIdx = (vuln.line ?? 1) - 1;
    const targetLine = lines[lineIdx];
    if (!targetLine) return null;

    let patched = targetLine;
    // MD5 → SHA-256
    patched = patched.replace(
      /createHash\s*\(\s*["']md5["']\s*\)/g,
      "createHash('sha256')"
    );
    // SHA-1 → SHA-256
    patched = patched.replace(
      /createHash\s*\(\s*["']sha1["']\s*\)/g,
      "createHash('sha256')"
    );
    // Math.random() → crypto.randomBytes
    patched = patched.replace(
      /Math\.random\s*\(\s*\)/g,
      "crypto.randomInt(0, 2**31) / 2**31 /* Use crypto.randomBytes for security */"
    );

    if (patched === targetLine) return null;

    lines[lineIdx] = patched;
    return {
      patchedContent: lines.join("\n"),
      explanation:
        "Upgraded weak cryptographic algorithm to a stronger alternative. " +
        "MD5/SHA-1 replaced with SHA-256 (CWE-327/328). Math.random() replaced with " +
        "cryptographically secure random (CWE-338).",
    };
  },

  "error-handling": (original, vuln) => {
    const lines = original.split("\n");
    const lineIdx = (vuln.line ?? 1) - 1;
    const targetLine = lines[lineIdx];
    if (!targetLine) return null;

    const indent = targetLine.match(/^(\s*)/)?.[1] ?? "";
    lines.splice(
      lineIdx,
      0,
      `${indent}// SECURITY FIX: Ensure errors are handled securely without leaking details`
    );

    return {
      patchedContent: lines.join("\n"),
      explanation:
        "Added secure error handling guidance. Errors should be caught and logged server-side " +
        "without exposing stack traces or sensitive information to the client.",
    };
  },

  manual: (_original, vuln) => {
    return {
      patchedContent: _original,
      explanation:
        `This vulnerability requires manual remediation:\n${vuln.description}\n\n` +
        (vuln.recommendation ?? "Please review and fix manually."),
    };
  },
};

// ---------------------------------------------------------------------------
// Main patch generator
// ---------------------------------------------------------------------------

export function generatePatch(
  vuln: Vulnerability,
  fileContent: string,
  strategyOverride?: PatchStrategy,
  memoryStrategy?: PatchStrategy | null
): Patch {
  const strategy =
    strategyOverride ?? memoryStrategy ?? selectPatchStrategy(vuln);

  const template = PATCH_TEMPLATES[strategy];
  const result = template(fileContent, vuln);

  const patchedContent = result?.patchedContent ?? fileContent;
  const explanation =
    result?.explanation ?? vuln.recommendation ?? "Manual review required.";

  const changed = patchedContent !== fileContent;
  const diff = changed
    ? generateDiff(fileContent, patchedContent, vuln.file ?? "file")
    : "(no automatic code change generated – see explanation)";

  // Confidence score: higher for templates that produce actual code changes
  const confidence = changed
    ? strategy === "manual" || strategy === "dependency-update"
      ? 0.5
      : 0.75
    : 0.4;

  // Instability cost: proportional to lines changed
  const linesChanged = Math.abs(
    patchedContent.split("\n").length - fileContent.split("\n").length
  );
  const instabilityCost = Math.min(
    1,
    linesChanged * 0.05 + (changed ? 0.1 : 0.2)
  );

  return {
    id: generateId("patch"),
    vulnerabilityId: vuln.id,
    file: vuln.file ?? "unknown",
    originalContent: fileContent,
    patchedContent,
    diff,
    strategy,
    explanation,
    confidence,
    instabilityCost,
  };
}
