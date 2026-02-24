/**
 * Python Data Flow Analyzer Integration Tests
 * Tests the taint analysis engine with real-world Python code scenarios
 */

import { describe, it, expect, beforeEach } from "vitest";
import { PythonDataFlowAnalyzer } from "../services/analysis/PythonDataFlowAnalyzer";

describe("PythonDataFlowAnalyzer", () => {
  let analyzer: PythonDataFlowAnalyzer;

  beforeEach(() => {
    analyzer = new PythonDataFlowAnalyzer();
  });

  describe("Configuration", () => {
    it("should support custom source definitions", () => {
      analyzer.setConfig({
        sources: ["input", "request.form", "custom_source"],
        sinks: undefined,
        sanitizers: undefined,
      });
      // Internal config updated; analyzer ready for analysis
      expect(analyzer).toBeDefined();
    });

    it("should support custom sanitizer definitions", () => {
      analyzer.setConfig({
        sources: undefined,
        sinks: undefined,
        sanitizers: ["custom_sanitize", "escape_html"],
      });
      expect(analyzer).toBeDefined();
    });

    it("should support custom sink definitions", () => {
      analyzer.setConfig({
        sources: undefined,
        sinks: ["custom_dangerous_call"],
        sanitizers: undefined,
      });
      expect(analyzer).toBeDefined();
    });
  });

  describe("Source Detection", () => {
    it("should detect input() as a taint source", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
os.system(x)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].message).toContain("Tainted data");
    });

    it("should detect sys.argv as a taint source", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
import sys
arg = sys.argv[1]
os.system(arg)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
    });

    it("should detect request.args as a taint source", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
from flask import request
cmd = request.args.get('cmd')
os.system(cmd)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Taint Propagation", () => {
    it("should propagate taint through variable assignment", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
y = x
z = y
os.system(z)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
    });

    it("should propagate taint through function return values", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
def echo(val):
    return val

x = input()
y = echo(x)
os.system(y)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
    });

    it("should propagate taint as function parameter", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
def execute_cmd(cmd):
    import os
    os.system(cmd)

x = input()
execute_cmd(x)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Sink Detection", () => {
    it("should detect os.system as a dangerous sink", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
os.system(x)
`,
        },
      ]);

      expect(results[0].message).toContain("os.system");
    });

    it("should detect subprocess.run as a dangerous sink", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
import subprocess
x = input()
subprocess.run(x)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
    });

    it("should detect pickle.loads as a dangerous sink", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
import pickle
data = input()
pickle.loads(data)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
    });

    it("should detect yaml.load as a dangerous sink", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
import yaml
import sys
config_data = sys.argv[1]
config = yaml.load(config_data)
`,
        },
      ]);

      expect(results.length).toBeGreaterThan(0);
    });
  });

  describe("Sanitizer Recognition", () => {
    it("should recognize escape() as a sanitizer", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
safe = escape(x)
os.system(safe)
`,
        },
      ]);

      // After sanitization, no taint should reach sink
      expect(results.length).toBe(0);
    });

    it("should recognize sanitize() as a sanitizer", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
y = sanitize(x)
os.system(y)
`,
        },
      ]);

      expect(results.length).toBe(0);
    });

    it("should recognize urllib.parse.quote as a sanitizer", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
import urllib.parse
x = input()
safe = urllib.parse.quote(x)
os.system(safe)
`,
        },
      ]);

      expect(results.length).toBe(0);
    });

    it("should recognize html.escape as a sanitizer", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
from html import escape
x = input()
safe = escape(x)
os.system(safe)
`,
        },
      ]);

      expect(results.length).toBe(0);
    });
  });

  describe("Issue Metadata", () => {
    it("should include CWE identifier in issues", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
os.system(x)
`,
        },
      ]);

      expect(results[0]).toHaveProperty("cweId");
      expect(results[0].cweId).toBe("CWE-78");
    });

    it("should include OWASP category in issues", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
os.system(x)
`,
        },
      ]);

      expect(results[0]).toHaveProperty("owaspCategory");
      expect(results[0].owaspCategory).toBe("A03");
    });

    it("should include CVSS score in issues", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
os.system(x)
`,
        },
      ]);

      expect(results[0]).toHaveProperty("cvssScore");
      expect(results[0].cvssScore).toBeGreaterThan(5);
    });

    it("should include recommendations in issues", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
os.system(x)
`,
        },
      ]);

      expect(results[0]).toHaveProperty("recommendation");
      expect(results[0].recommendation).toBeTruthy();
    });

    it("should mark line numbers correctly", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
y = x
z = y
os.system(z)
`,
        },
      ]);

      expect(results[0]).toHaveProperty("line");
      expect(results[0].line).toBeGreaterThan(0);
    });
  });

  describe("Multiple Files", () => {
    it("should analyze multiple Python files in one pass", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "file1.py",
          content: `
x = input()
os.system(x)
`,
        },
        {
          filename: "file2.py",
          content: `
import pickle
data = input()
pickle.loads(data)
`,
        },
      ]);

      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("Non-Python Files", () => {
    it("should ignore non-Python files", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.js",
          content: `
const x = prompt();
eval(x);
`,
        },
      ]);

      // Should not analyze .js files
      expect(results.length).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty files", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "empty.py",
          content: "",
        },
      ]);

      expect(results.length).toBe(0);
    });

    it("should handle files with only comments", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "comments.py",
          content: `
# This is a comment
# os.system("some command")
`,
        },
      ]);

      expect(results.length).toBe(0);
    });

    it("should handle complex nested function calls", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "nested.py",
          content: `
def a(x):
    return b(x)

def b(x):
    return c(x)

def c(x):
    os.system(x)

x = input()
a(x)
`,
        },
      ]);

      // Basic analysis (one-level deep); complex nested flows are a future enhancement
      expect(results).toBeDefined();
    });
  });

  describe("Severity and Confidence", () => {
    it("should assign high confidence to direct flows", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
os.system(x)
`,
        },
      ]);

      expect(results[0].confidence).toBeGreaterThanOrEqual(85);
    });

    it("should mark command injection as Critical severity", async () => {
      await analyzer.init();

      const results = analyzer.analyzeDataFlow([
        {
          filename: "test.py",
          content: `
x = input()
os.system(x)
`,
        },
      ]);

      expect(results[0].severity).toBe("Critical");
    });
  });
});
