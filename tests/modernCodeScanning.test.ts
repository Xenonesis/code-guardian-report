/**
 * Test suite for Modern Code Scanning Service
 * Verifies that the service produces REAL analysis results, not mock/hardcoded data
 */

import { modernCodeScanningService } from "../src/services/security/modernCodeScanningService";

// Test samples with known vulnerabilities
const VULNERABLE_CODE_SAMPLES = {
  sqlInjection: `
    function getUserData(userId: string) {
      return db.execute("SELECT * FROM users WHERE id = '" + userId + "'");
    }
  `,

  xss: `
    function displayMessage(msg: string) {
      document.getElementById('output').innerHTML = msg;
    }
  `,

  commandInjection: `
    import { exec } from 'child_process';
    function runCommand(userInput: string) {
      exec('ls ' + userInput, (error, stdout) => {
        console.log(stdout);
      });
    }
  `,

  weakCrypto: `
    import crypto from 'crypto';
    function hashPassword(password: string) {
      return crypto.createHash('md5').update(password).digest('hex');
    }
  `,

  hardcodedSecret: `
    const API_KEY = "sk-1234567890abcdef";
    const PASSWORD = "admin123";
  `,

  highComplexity: `
    function processData(data: any) {
      if (data) {
        if (data.type === 'user') {
          if (data.active) {
            if (data.verified) {
              if (data.premium) {
                if (data.age > 18) {
                  return 'premium-adult';
                }
              }
            }
          }
        }
      }
      return 'unknown';
    }
  `,

  longFunction: `
    function veryLongFunction() {
      ${Array(150).fill('      console.log("line");').join("\n")}
    }
  `,

  tooManyParams: `
    function createUser(name: string, email: string, age: number, address: string, 
                       phone: string, country: string, city: string, zip: string) {
      return { name, email, age, address, phone, country, city, zip };
    }
  `,

  cleanCode: `
    function add(a: number, b: number): number {
      return a + b;
    }
  `,
};

// ====== Simple Test Framework ======
let passedTests = 0;
let failedTests = 0;

function describe(suiteName: string, fn: () => void) {
  console.log(`\n📋 ${suiteName}`);
  try {
    fn();
  } catch (error) {
    console.log(
      `  ❌ Suite Error: ${error instanceof Error ? error.message : String(error)}`
    );
    if (error instanceof Error && error.stack) {
      console.log(error.stack);
    }
    failedTests++;
  }
}

function it(testName: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ ${testName}`);
    passedTests++;
  } catch (error) {
    console.log(`  ❌ ${testName}`);
    console.log(
      `     Error: ${error instanceof Error ? error.message : String(error)}`
    );
    failedTests++;
  }
}

function expect(actual: unknown) {
  return {
    toBe(expected: unknown) {
      if (actual !== expected) {
        throw new Error(`Expected ${actual} to be ${expected}`);
      }
    },
    toBeDefined() {
      if (actual === undefined) {
        throw new Error("Expected value to be defined");
      }
    },
    toBeGreaterThan(expected: number) {
      if (typeof actual !== "number" || actual <= expected) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual < expected) {
        throw new Error(
          `Expected ${actual} to be greater than or equal to ${expected}`
        );
      }
    },
    toBeLessThanOrEqual(expected: number) {
      if (typeof actual !== "number" || actual > expected) {
        throw new Error(
          `Expected ${actual} to be less than or equal to ${expected}`
        );
      }
    },
    toContain(expected: string) {
      if (typeof actual !== "string" || !actual.includes(expected)) {
        throw new Error(`Expected "${actual}" to contain "${expected}"`);
      }
    },
  };
}

// ====== Run Tests ======
console.log("🧪 Running Modern Code Scanning Tests...\n");

describe("Modern Code Scanning Service - Real Results Verification", () => {
  describe("SQL Injection Detection", () => {
    it("should detect SQL injection vulnerability", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.sqlInjection,
        "test.ts",
        "typescript"
      );

      const sqlInjectionIssue = result.issues.find(
        (issue) => issue.rule.id === "typescript:S2077"
      );

      expect(sqlInjectionIssue).toBeDefined();
      expect(sqlInjectionIssue?.rule.severity).toBe("Critical");
      expect(sqlInjectionIssue?.rule.type).toBe("Vulnerability");
      expect(sqlInjectionIssue?.line).toBeGreaterThan(0);
      expect(result.metrics.vulnerabilities).toBeGreaterThan(0); // Has vulnerabilities
    });
  });

  describe("XSS Detection", () => {
    it("should detect XSS vulnerability with innerHTML", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.xss,
        "test.ts",
        "typescript"
      );

      const xssIssue = result.issues.find(
        (issue) => issue.rule.id === "typescript:S5147"
      );

      expect(xssIssue).toBeDefined();
      expect(xssIssue?.rule.severity).toBe("Critical");
      expect(xssIssue?.message).toContain("sanitization");
    });
  });

  describe("Command Injection Detection", () => {
    it("should detect command injection vulnerability", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.commandInjection,
        "test.ts",
        "typescript"
      );

      const cmdInjectionIssue = result.issues.find(
        (issue) => issue.rule.id === "typescript:S4721"
      );

      expect(cmdInjectionIssue).toBeDefined();
      expect(cmdInjectionIssue?.rule.severity).toBe("Critical");
      expect(cmdInjectionIssue?.rule.cwe?.[0]).toBe("CWE-78");
    });
  });

  describe("Weak Cryptography Detection", () => {
    it("should detect weak cryptographic algorithm (MD5)", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.weakCrypto,
        "test.ts",
        "typescript"
      );

      const weakCryptoIssue = result.issues.find(
        (issue) => issue.rule.id === "typescript:S4426"
      );

      expect(weakCryptoIssue).toBeDefined();
      expect(weakCryptoIssue?.rule.severity).toBe("Critical");
      expect(weakCryptoIssue?.message).toContain("cryptographic");
    });
  });

  describe("Hardcoded Secrets Detection", () => {
    it("should detect hardcoded API keys and passwords", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.hardcodedSecret,
        "test.ts",
        "typescript"
      );

      const secretIssues = result.issues.filter(
        (issue) => issue.rule.id === "typescript:S6290"
      );

      expect(secretIssues.length).toBeGreaterThan(0);
      expect(secretIssues[0].rule.severity).toBe("Blocker");
    });
  });

  describe("Complexity Metrics - Real Calculations", () => {
    it("should calculate high cyclomatic complexity correctly", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.highComplexity,
        "test.ts",
        "typescript"
      );

      // Should detect high complexity (6 nested ifs = complexity > 15)
      expect(result.metrics.cyclomaticComplexity).toBeGreaterThan(5);

      const complexityIssue = result.issues.find(
        (issue) => issue.rule.id === "typescript:S3776"
      );
      expect(complexityIssue).toBeDefined();
    });

    it("should calculate cognitive complexity for nested conditions", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.highComplexity,
        "test.ts",
        "typescript"
      );

      // Cognitive complexity should be higher due to nesting
      expect(result.metrics.cognitiveComplexity).toBeGreaterThan(10);
    });

    it("should calculate maintainability index", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.cleanCode,
        "test.ts",
        "typescript"
      );

      // Clean, simple code should have high maintainability
      expect(result.metrics.maintainabilityIndex).toBeGreaterThan(70);
      expect(result.metrics.maintainabilityIndex).toBeLessThanOrEqual(100);
    });
  });

  describe("Code Smells Detection", () => {
    it("should detect functions that are too long", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.longFunction,
        "test.ts",
        "typescript"
      );

      const longFunctionIssue = result.issues.find(
        (issue) => issue.rule.id === "typescript:S138"
      );

      expect(longFunctionIssue).toBeDefined();
      expect(longFunctionIssue?.rule.type).toBe("Code Smell");
      expect(result.metrics.linesOfCode).toBeGreaterThan(100);
    });

    it("should detect functions with too many parameters", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.tooManyParams,
        "test.ts",
        "typescript"
      );

      const tooManyParamsIssue = result.issues.find(
        (issue) => issue.rule.id === "typescript:S107"
      );

      expect(tooManyParamsIssue).toBeDefined();
      expect(tooManyParamsIssue?.message).toContain("parameter");
    });
  });

  describe("Quality Gate - Real Evaluation", () => {
    it("should fail quality gate for vulnerable code", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.sqlInjection,
        "test.ts",
        "typescript"
      );

      expect(result.qualityGate.passed).toBe(false);

      const failedConditions = result.qualityGate.conditions.filter(
        (c) => c.status === "ERROR"
      );
      expect(failedConditions.length).toBeGreaterThan(0);

      // Should fail on vulnerabilities condition
      const vulnCondition = result.qualityGate.conditions.find(
        (c) => c.metric === "New Vulnerabilities"
      );
      expect(vulnCondition?.status).toBe("ERROR");
      expect(vulnCondition?.value).toBeGreaterThan(0);
    });

    it("should pass quality gate for clean code", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.cleanCode,
        "test.ts",
        "typescript"
      );

      expect(result.qualityGate.passed).toBe(true);

      const passedConditions = result.qualityGate.conditions.filter(
        (c) => c.status === "OK"
      );
      expect(passedConditions.length).toBe(6); // All 6 conditions should pass
    });
  });

  describe("Technical Debt - Real Calculation", () => {
    it("should calculate non-zero technical debt for vulnerable code", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.sqlInjection,
        "test.ts",
        "typescript"
      );

      expect(result.technicalDebt).toBeGreaterThan(0);

      // SQL injection has 30 min remediation time
      expect(result.technicalDebt).toBeGreaterThanOrEqual(30);
    });

    it("should calculate zero technical debt for clean code", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.cleanCode,
        "test.ts",
        "typescript"
      );

      expect(result.technicalDebt).toBe(0);
    });
  });

  describe("Vulnerability Counting - Real Assessment", () => {
    it("should count vulnerabilities in code", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.sqlInjection,
        "test.ts",
        "typescript"
      );

      expect(result.metrics.vulnerabilities).toBeGreaterThan(0);
    });

    it("should count zero vulnerabilities in clean code", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.cleanCode,
        "test.ts",
        "typescript"
      );

      expect(result.metrics.vulnerabilities).toBe(0);
    });
  });

  describe("Line Number Accuracy", () => {
    it("should report accurate line numbers for issues", () => {
      const code = `
function test() {
  db.execute("SELECT * FROM users WHERE id = '" + userId + "'");
}
      `.trim();

      const result = modernCodeScanningService.analyzeCode(
        code,
        "test.ts",
        "typescript"
      );

      const sqlIssue = result.issues.find(
        (i) => i.rule.id === "typescript:S2077"
      );
      expect(sqlIssue?.line).toBe(2); // Issue is on line 2
    });
  });

  describe("Multiple Vulnerabilities", () => {
    it("should detect all vulnerabilities in complex code", () => {
      const complexCode = `
        const API_KEY = "sk-test123";
        
        function processUser(userId: string, data: string) {
          db.execute("SELECT * FROM users WHERE id = '" + userId + "'");
          
          document.getElementById('output').innerHTML = data;
          
          const hash = crypto.createHash('md5').update(data).digest('hex');
          return hash;
        }
      `;

      const result = modernCodeScanningService.analyzeCode(
        complexCode,
        "test.ts",
        "typescript"
      );

      // Should detect: hardcoded secret, SQL injection, XSS, weak crypto
      expect(result.issues.length).toBeGreaterThanOrEqual(4);

      const vulnerabilities = result.issues.filter(
        (i) => i.rule.type === "Vulnerability"
      );
      expect(vulnerabilities.length).toBeGreaterThanOrEqual(4);
    });
  });

  describe("Analysis Summary - Real Data", () => {
    it("should generate accurate summary with real metrics", () => {
      const result = modernCodeScanningService.analyzeCode(
        VULNERABLE_CODE_SAMPLES.sqlInjection,
        "test.ts",
        "typescript"
      );

      const summary = modernCodeScanningService.getAnalysisSummary(
        result.metrics,
        result.technicalDebt,
        result.qualityGate
      );

      expect(summary).toContain("Vulnerabilities");
      expect(summary).toContain("FAILED");
      // Summary should be from real analysis, not mock data
    });
  });
});

// Print summary
console.log(`\n\n${"=".repeat(60)}`);
console.log(`✅ Passed: ${passedTests}`);
console.log(`❌ Failed: ${failedTests}`);
console.log(`Total: ${passedTests + failedTests}`);
console.log("=".repeat(60));

if (failedTests > 0) {
  process.exit(1);
}

// Export for use in other test runners
if (typeof module !== "undefined" && module.exports) {
  module.exports = { VULNERABLE_CODE_SAMPLES };
}
