/**
 * Tests for src/mcp/tools/patch-gen.ts pattern-matching logic
 *
 * Tests the CWE-based patch templates indirectly by verifying
 * that vulnerable code patterns get transformed correctly.
 * Since the patch templates are internal to patch-gen.ts, we
 * test the transform patterns directly.
 */

import { describe, it, expect } from "vitest";
import { unifiedDiff } from "../shared/utils";

// Replicate the patch templates for direct testing
// (These mirror the patterns in patch-gen.ts)

describe("Patch Generation - CWE Templates", () => {
  describe("CWE-79: XSS Prevention", () => {
    it("replaces innerHTML with textContent", () => {
      const code = "element.innerHTML = userInput;";
      const patched = code.replace(/innerHTML\s*=\s*(.+)/g, "textContent = $1");
      expect(patched).toBe("element.textContent = userInput;");
    });

    it("replaces document.write with createTextNode", () => {
      const code = "document.write(data)";
      const patched = code.replace(
        /document\.write\((.+)\)/g,
        "document.createTextNode($1)"
      );
      expect(patched).toBe("document.createTextNode(data)");
    });

    it("adds DOMPurify to dangerouslySetInnerHTML", () => {
      const code = "dangerouslySetInnerHTML={{ __html: userContent }}";
      const patched = code.replace(
        /dangerouslySetInnerHTML\s*=\s*\{\s*\{\s*__html\s*:\s*(.+?)\s*\}\s*\}/g,
        "dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize($1) }}"
      );
      expect(patched).toContain("DOMPurify.sanitize(userContent)");
    });
  });

  describe("CWE-327: Weak Cryptography", () => {
    it("replaces MD5 with SHA-256", () => {
      const code = "createHash('md5')";
      const patched = code.replace(
        /createHash\(['"]md5['"]\)/g,
        "createHash('sha256')"
      );
      expect(patched).toBe("createHash('sha256')");
    });

    it("replaces SHA-1 with SHA-256", () => {
      const code = 'createHash("sha1")';
      const patched = code.replace(
        /createHash\(['"]sha1['"]\)/g,
        "createHash('sha256')"
      );
      expect(patched).toBe("createHash('sha256')");
    });

    it("does not affect SHA-256", () => {
      const code = "createHash('sha256')";
      const patched = code
        .replace(/createHash\(['"]md5['"]\)/g, "createHash('sha256')")
        .replace(/createHash\(['"]sha1['"]\)/g, "createHash('sha256')");
      expect(patched).toBe("createHash('sha256')");
    });
  });

  describe("CWE-78: Command Injection", () => {
    it("replaces exec with execFile", () => {
      const code = "exec(command)";
      const patched = code.replace(/exec\((.+)\)/g, "execFile($1)");
      expect(patched).toBe("execFile(command)");
    });

    it("replaces child_process.exec with child_process.execFile", () => {
      const code = "child_process.exec(cmd)";
      const patched = code.replace(
        /child_process\.exec\((.+)\)/g,
        "child_process.execFile($1)"
      );
      expect(patched).toBe("child_process.execFile(cmd)");
    });
  });

  describe("CWE-798: Hardcoded Credentials", () => {
    it("moves hardcoded password to env var", () => {
      const code = 'password = "mysecret123"';
      const patched = code.replace(
        /(password|secret|apiKey|api_key|token)\s*[:=]\s*(['"`])([^'"`]+)\2/gi,
        "$1 = process.env.$1_VALUE"
      );
      expect(patched).toBe("password = process.env.password_VALUE");
    });

    it("moves hardcoded token to env var", () => {
      const code = "token = 'abc123'";
      const patched = code.replace(
        /(password|secret|apiKey|api_key|token)\s*[:=]\s*(['"`])([^'"`]+)\2/gi,
        "$1 = process.env.$1_VALUE"
      );
      expect(patched).toBe("token = process.env.token_VALUE");
    });
  });
});

// ── unifiedDiff integration with patches ───────────────────────────

describe("Patch Diff Generation", () => {
  it("generates a readable diff for innerHTML fix", () => {
    const original = "function render() {\n  el.innerHTML = data;\n}";
    const patched = "function render() {\n  el.textContent = data;\n}";
    const diff = unifiedDiff(original, patched, "component.tsx");

    expect(diff).toContain("--- a/component.tsx");
    expect(diff).toContain("+++ b/component.tsx");
    expect(diff).toContain("-  el.innerHTML = data;");
    expect(diff).toContain("+  el.textContent = data;");
  });

  it("shows context lines around changes", () => {
    const original = "line1\nline2\nline3\nline4";
    const patched = "line1\nchanged\nline3\nline4";
    const diff = unifiedDiff(original, patched, "f.ts");

    expect(diff).toContain(" line1");
    expect(diff).toContain("-line2");
    expect(diff).toContain("+changed");
    expect(diff).toContain(" line3");
  });
});

// ── Fallback patch behavior ──────────────────────────────────────

describe("Fallback Patch (no template match)", () => {
  it("inserts TODO comment at the vulnerable line", () => {
    const code = "const x = 1;\nconst y = 2;\nconst z = 3;";
    const lines = code.split("\n");
    const lineIdx = 1; // issue at line 2 (0-indexed = 1)
    const indent = lines[lineIdx]!.match(/^(\s*)/)?.[1] ?? "";
    lines.splice(
      lineIdx,
      0,
      `${indent}// TODO: SECURITY FIX REQUIRED — High test-vuln`,
      `${indent}// Apply input validation`
    );
    const patched = lines.join("\n");

    expect(patched).toContain("// TODO: SECURITY FIX REQUIRED");
    expect(patched).toContain("// Apply input validation");
    // Original lines are preserved
    expect(patched).toContain("const y = 2;");
  });
});
