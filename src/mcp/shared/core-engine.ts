/**
 * SESC-MCP Core Engine
 *
 * Node.js-compatible extraction of the pure security analysis logic that lives
 * in the browser/Next.js services.  None of the imports here pull in React,
 * Next.js, Firebase, or any other browser-only module, so this file compiles
 * cleanly under the MCP tsconfig (NodeNext / emit-to-dist/mcp).
 *
 * Sources:
 *   src/services/security/securityAnalysisEngine.ts  — rules, CVSS, scoring
 *   src/services/security/secretDetectionService.ts  — re-exported as-is
 *
 * The browser services continue to work unchanged — they import from their own
 * locations.  This file is additive only.
 */

// ---------------------------------------------------------------------------
// Re-export the secret detection service (zero browser dependencies)
// ---------------------------------------------------------------------------

export type {
  SecretMatch,
  SecretDetectionResult,
  SecretType,
} from "../../services/security/secretDetectionService.js";

export { SecretDetectionService } from "../../services/security/secretDetectionService.js";

// ---------------------------------------------------------------------------
// Minimal shared type used by the engine functions below.
// We define our own here so we don't need to import from @/hooks/useAnalysis.
// ---------------------------------------------------------------------------

export interface EngineIssue {
  severity?: "Critical" | "High" | "Medium" | "Low" | "Info";
  category?: string;
  type?: string;
  message?: string;
  confidence?: number;
  filename: string;
}

// ---------------------------------------------------------------------------
// OWASP Top 10 2025 Categories
// ---------------------------------------------------------------------------

export const OWASP_CATEGORIES_2025 = {
  A01_BROKEN_ACCESS_CONTROL: "A01:2025 – Broken Access Control",
  A02_SECURITY_MISCONFIGURATION: "A02:2025 – Security Misconfiguration",
  A03_SOFTWARE_SUPPLY_CHAIN: "A03:2025 – Software Supply Chain Failures",
  A04_CRYPTOGRAPHIC_FAILURES: "A04:2025 – Cryptographic Failures",
  A05_INJECTION: "A05:2025 – Injection",
  A06_INSECURE_DESIGN: "A06:2025 – Insecure Design",
  A07_AUTHENTICATION_FAILURES: "A07:2025 – Authentication Failures",
  A08_SOFTWARE_INTEGRITY_FAILURES:
    "A08:2025 – Software or Data Integrity Failures",
  A09_LOGGING_ALERTING_FAILURES: "A09:2025 – Logging and Alerting Failures",
  A10_EXCEPTIONAL_CONDITIONS:
    "A10:2025 – Mishandling of Exceptional Conditions",
};

// ---------------------------------------------------------------------------
// OWASP Top 10 2021 Categories
// ---------------------------------------------------------------------------

export const OWASP_CATEGORIES_2021 = {
  A01_BROKEN_ACCESS_CONTROL: "A01:2021 – Broken Access Control",
  A02_CRYPTOGRAPHIC_FAILURES: "A02:2021 – Cryptographic Failures",
  A03_INJECTION: "A03:2021 – Injection",
  A04_INSECURE_DESIGN: "A04:2021 – Insecure Design",
  A05_SECURITY_MISCONFIGURATION: "A05:2021 – Security Misconfiguration",
  A06_VULNERABLE_COMPONENTS: "A06:2021 – Vulnerable and Outdated Components",
  A07_IDENTIFICATION_FAILURES:
    "A07:2021 – Identification and Authentication Failures",
  A08_SOFTWARE_INTEGRITY_FAILURES:
    "A08:2021 – Software and Data Integrity Failures",
  A09_LOGGING_FAILURES: "A09:2021 – Security Logging and Monitoring Failures",
  A10_SSRF: "A10:2021 – Server-Side Request Forgery (SSRF)",
};

export const OWASP_CATEGORIES = OWASP_CATEGORIES_2021;

// ---------------------------------------------------------------------------
// CWE Mappings
// ---------------------------------------------------------------------------

export const CWE_MAPPINGS = {
  // Injection
  SQL_INJECTION: "CWE-89",
  XSS: "CWE-79",
  COMMAND_INJECTION: "CWE-78",
  CODE_INJECTION: "CWE-94",
  LDAP_INJECTION: "CWE-90",
  XPATH_INJECTION: "CWE-91",
  NOSQL_INJECTION: "CWE-943",

  // Authentication & Access Control
  HARDCODED_CREDENTIALS: "CWE-798",
  BROKEN_ACCESS_CONTROL: "CWE-284",
  MISSING_AUTH: "CWE-306",
  IMPROPER_AUTH: "CWE-287",
  SESSION_FIXATION: "CWE-384",

  // Cryptographic Issues
  WEAK_CRYPTO: "CWE-327",
  INSECURE_RANDOM: "CWE-338",
  INSUFFICIENT_KEY_SIZE: "CWE-326",
  BROKEN_CRYPTO: "CWE-328",
  CLEARTEXT_TRANSMISSION: "CWE-319",
  CLEARTEXT_STORAGE: "CWE-312",

  // File & Path Operations
  PATH_TRAVERSAL: "CWE-22",
  UNRESTRICTED_UPLOAD: "CWE-434",
  INSECURE_FILE_ACCESS: "CWE-552",

  // Memory & Resource Management
  BUFFER_OVERFLOW: "CWE-120",
  NULL_POINTER: "CWE-476",
  RACE_CONDITION: "CWE-362",
  USE_AFTER_FREE: "CWE-416",
  MEMORY_LEAK: "CWE-401",

  // Deserialization & Data Handling
  INSECURE_DESERIALIZATION: "CWE-502",
  PROTOTYPE_POLLUTION: "CWE-1321",
  XXE: "CWE-611",
  SSRF: "CWE-918",

  // Supply Chain & Dependencies
  VULNERABLE_DEPENDENCY: "CWE-1395",
  UNTRUSTED_SOURCE: "CWE-494",

  // Information Disclosure
  SENSITIVE_DATA_EXPOSURE: "CWE-200",
  ERROR_MESSAGE_EXPOSURE: "CWE-209",

  // Logging & Monitoring
  INSUFFICIENT_LOGGING: "CWE-778",
  LOG_INJECTION: "CWE-117",
};

// ---------------------------------------------------------------------------
// Security rule patterns (full set from securityAnalysisEngine.ts)
// ---------------------------------------------------------------------------

export interface SecurityRule {
  pattern: RegExp;
  severity: "Critical" | "High" | "Medium" | "Low";
  type: string;
  category: string;
  cweId: string;
  owaspCategory?: string;
  message: string;
  confidence: number;
  cvssScore: number;
  impact: string;
  likelihood: string;
  remediation: {
    description: string;
    codeExample: string;
    fixExample: string;
    effort: "Low" | "Medium" | "High";
    priority: number;
  };
}

export const SECURITY_RULES: Record<string, SecurityRule[]> = {
  javascript: [
    {
      pattern: /SELECT.*FROM.*["'`]\s*\+|query.*["'`]\s*\+/gi,
      severity: "Critical",
      type: "SQL Injection",
      category: "Injection",
      cweId: "CWE-89",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message:
        "Potential SQL injection vulnerability - dynamic SQL query construction detected",
      confidence: 90,
      cvssScore: 9.8,
      impact: "Database compromise, data theft, or manipulation",
      likelihood: "High",
      remediation: {
        description:
          "Use parameterized queries or prepared statements instead of string concatenation",
        codeExample:
          'const query = "SELECT * FROM users WHERE id = \'" + userId + "\'";',
        fixExample:
          'const query = "SELECT * FROM users WHERE id = ?"; db.query(query, [userId]);',
        effort: "Low",
        priority: 5,
      },
    },
    {
      pattern: /\.query\(["'`].*["'`]\s*\+|\.execute\(["'`].*["'`]\s*\+/gi,
      severity: "Critical",
      type: "SQL Injection",
      category: "Injection",
      cweId: "CWE-89",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message:
        "SQL query with string concatenation detected - use parameterized queries",
      confidence: 92,
      cvssScore: 9.8,
      impact: "SQL injection leading to data breach",
      likelihood: "High",
      remediation: {
        description: "Use parameterized queries with placeholders",
        codeExample:
          'db.query("SELECT * FROM users WHERE id = \'" + id + "\'");',
        fixExample: 'db.query("SELECT * FROM users WHERE id = ?", [id]);',
        effort: "Low",
        priority: 5,
      },
    },
    {
      pattern: /dangerouslySetInnerHTML|__html:/gi,
      severity: "High",
      type: "XSS",
      category: "Cross-Site Scripting",
      cweId: "CWE-79",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message:
        "dangerouslySetInnerHTML usage detected - potential XSS vulnerability",
      confidence: 88,
      cvssScore: 8.2,
      impact: "Cross-site scripting attacks possible",
      likelihood: "High",
      remediation: {
        description: "Sanitize HTML content or use textContent instead",
        codeExample: "<div dangerouslySetInnerHTML={{__html: userInput}} />",
        fixExample: "<div>{DOMPurify.sanitize(userInput)}</div>",
        effort: "Medium",
        priority: 4,
      },
    },
    {
      pattern:
        /\bexec\s*\(|\bspawn\s*\(|\bexecSync\s*\(|child_process\.exec|child_process\.spawn/gi,
      severity: "Critical",
      type: "Command Injection",
      category: "Injection",
      cweId: "CWE-78",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message:
        "Command execution detected - potential command injection vulnerability",
      confidence: 85,
      cvssScore: 9.1,
      impact: "Remote command execution possible",
      likelihood: "High",
      remediation: {
        description:
          "Validate and sanitize all user inputs before executing system commands, use execFile with argument array",
        codeExample: 'exec("command " + userInput);',
        fixExample: 'execFile("command", [sanitizedInput]);',
        effort: "Medium",
        priority: 5,
      },
    },
    {
      pattern:
        /['"]\.\/.*['"]\s*\+|\+\s*['"]\.\/|require\s*\(.*\+|import\s*\(.*\+/gi,
      severity: "High",
      type: "Path Traversal",
      category: "Injection",
      cweId: "CWE-22",
      owaspCategory: OWASP_CATEGORIES.A01_BROKEN_ACCESS_CONTROL,
      message:
        "Dynamic module loading with concatenation - potential path traversal",
      confidence: 80,
      cvssScore: 7.5,
      impact: "Arbitrary file access or code execution",
      likelihood: "Medium",
      remediation: {
        description:
          "Use a whitelist of allowed modules or validate input against allowed paths",
        codeExample: 'require("./" + userInput);',
        fixExample:
          'const allowedModules = {mod1: "./mod1"}; require(allowedModules[userInput]);',
        effort: "Medium",
        priority: 4,
      },
    },
    {
      pattern: /createHash\s*\(\s*["']md5["']|createHash\s*\(\s*["']sha1["']/gi,
      severity: "Medium",
      type: "Weak Cryptography",
      category: "Cryptographic Failure",
      cweId: "CWE-327",
      owaspCategory: OWASP_CATEGORIES.A02_CRYPTOGRAPHIC_FAILURES,
      message: "Weak cryptographic algorithm (MD5/SHA1) detected",
      confidence: 95,
      cvssScore: 5.9,
      impact: "Cryptographic weaknesses may be exploited",
      likelihood: "Medium",
      remediation: {
        description: "Use stronger hashing algorithms like SHA-256 or bcrypt",
        codeExample: 'crypto.createHash("md5");',
        fixExample: 'crypto.createHash("sha256");',
        effort: "Low",
        priority: 3,
      },
    },
    {
      pattern: /\beval\s*\(|\bnew\s+Function\s*\(/gi,
      severity: "Critical",
      type: "Security",
      category: "Code Quality",
      cweId: "CWE-95",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message:
        "Use of eval() or new Function() detected - potential code injection vulnerability",
      confidence: 95,
      cvssScore: 9.3,
      impact: "Remote code execution possible",
      likelihood: "High",
      remediation: {
        description:
          "Replace eval() with safer alternatives like JSON.parse() for data parsing or Function constructor for controlled code execution",
        codeExample: "eval(userInput); // Dangerous",
        fixExample: "JSON.parse(userInput); // Safer for JSON data",
        effort: "Medium",
        priority: 5,
      },
    },
    {
      pattern: /document\.write\s*\(/gi,
      severity: "High",
      type: "Security",
      category: "XSS",
      cweId: "CWE-79",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message:
        "document.write() with user input can lead to XSS vulnerabilities",
      confidence: 85,
      cvssScore: 7.5,
      impact: "Cross-site scripting attacks possible",
      likelihood: "Medium",
      remediation: {
        description:
          "Use safer DOM manipulation methods like createElement() and textContent",
        codeExample: "document.write(userInput);",
        fixExample:
          'const element = document.createElement("div"); element.textContent = userInput;',
        effort: "Low",
        priority: 4,
      },
    },
    {
      pattern: /innerHTML\s*=.*\+/gi,
      severity: "High",
      type: "Security",
      category: "XSS",
      cweId: "CWE-79",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: "Dynamic innerHTML assignment may lead to XSS vulnerabilities",
      confidence: 80,
      cvssScore: 6.8,
      impact: "Cross-site scripting through DOM manipulation",
      likelihood: "Medium",
      remediation: {
        description:
          "Use textContent for text or properly sanitize HTML content",
        codeExample: "element.innerHTML = userInput;",
        fixExample:
          "element.textContent = userInput; // or use DOMPurify.sanitize()",
        effort: "Low",
        priority: 4,
      },
    },
    {
      pattern: /password\s*[:=]\s*["'][^"']*["']/gi,
      severity: "Critical",
      type: "Security",
      category: "Hardcoded Credentials",
      cweId: "CWE-798",
      owaspCategory: OWASP_CATEGORIES.A07_IDENTIFICATION_FAILURES,
      message: "Hardcoded password detected in source code",
      confidence: 90,
      cvssScore: 8.5,
      impact: "Credential exposure and unauthorized access",
      likelihood: "High",
      remediation: {
        description:
          "Store passwords in environment variables or secure configuration files",
        codeExample: 'const password = "mySecretPassword123";',
        fixExample: "const password = process.env.PASSWORD;",
        effort: "Low",
        priority: 5,
      },
    },
    {
      pattern: /Math\.random\(\)/gi,
      severity: "Medium",
      type: "Security",
      category: "Weak Cryptography",
      cweId: "CWE-338",
      owaspCategory: OWASP_CATEGORIES.A02_CRYPTOGRAPHIC_FAILURES,
      message: "Math.random() is not cryptographically secure",
      confidence: 75,
      cvssScore: 5.3,
      impact: "Predictable random values in security contexts",
      likelihood: "Medium",
      remediation: {
        description:
          "Use crypto.getRandomValues() for cryptographically secure random numbers",
        codeExample: "Math.random();",
        fixExample:
          "crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;",
        effort: "Low",
        priority: 3,
      },
    },
    {
      pattern: /\.async\s*\(\s*["']string["']\s*\)|new\s+JSZip/gi,
      severity: "Critical",
      type: "Vulnerability",
      category: "Security",
      cweId: "CWE-22",
      owaspCategory: OWASP_CATEGORIES.A01_BROKEN_ACCESS_CONTROL,
      message: "Zip archives should be extracted securely (Zip Slip)",
      confidence: 85,
      cvssScore: 7.5,
      impact: "Arbitrary file overwrite via path traversal",
      likelihood: "Medium",
      remediation: {
        description: "Validate paths in zip archives before extraction",
        codeExample: 'zip.file(entry.name).async("string")',
        fixExample:
          'if (entry.name.includes("..")) throw new Error("Invalid path");',
        effort: "Medium",
        priority: 5,
      },
    },
    {
      pattern: /href\s*=\s*["']javascript:/gi,
      severity: "Critical",
      type: "XSS",
      category: "Cross-Site Scripting",
      cweId: "CWE-79",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: "Links should not use javascript: protocol",
      confidence: 95,
      cvssScore: 6.1,
      impact: "Cross-site scripting attacks possible",
      likelihood: "High",
      remediation: {
        description: "Avoid using javascript: protocol in href attributes",
        codeExample: '<a href="javascript:void(0)">',
        fixExample: "<button onClick={handler}>",
        effort: "Low",
        priority: 4,
      },
    },
    {
      pattern:
        /(?:setHeader|writeHead)\s*\([^,]+,\s*(?:req\.|request\.|body|params|query)/gi,
      severity: "Critical",
      type: "Injection",
      category: "Security",
      cweId: "CWE-113",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: "HTTP headers should not be vulnerable to injection",
      confidence: 85,
      cvssScore: 6.5,
      impact: "HTTP Response Splitting or Header Injection",
      likelihood: "Medium",
      remediation: {
        description:
          "Validate and sanitize user input before using in HTTP headers",
        codeExample: 'res.setHeader("X-User", req.query.user)',
        fixExample: 'res.setHeader("X-User", sanitize(req.query.user))',
        effort: "Medium",
        priority: 4,
      },
    },
    {
      pattern: /\$where\s*:|\.find\s*\([^)]*\$|\$regex\s*:/gi,
      severity: "Critical",
      type: "NoSQL Injection",
      category: "Injection",
      cweId: "CWE-943",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: "NoSQL injection vulnerability detected",
      confidence: 90,
      cvssScore: 9.5,
      impact: "Database compromise and data leakage",
      likelihood: "High",
      remediation: {
        description:
          "Sanitize user input and avoid using $where or $regex with user input",
        codeExample: 'db.users.find({ $where: "this.age > " + input })',
        fixExample: "db.users.find({ age: { $gt: parseInt(input) } })",
        effort: "Medium",
        priority: 5,
      },
    },
    {
      pattern:
        /(?:fetch|axios|request|http\.get|https\.get)\s*\([^)]*(?:\+|`\$\{)/gi,
      severity: "Critical",
      type: "SSRF",
      category: "Server-Side Request Forgery",
      cweId: "CWE-918",
      owaspCategory: OWASP_CATEGORIES.A10_SSRF,
      message: "Potential Server-Side Request Forgery (SSRF)",
      confidence: 85,
      cvssScore: 8.5,
      impact: "Internal network scanning and unauthorized access",
      likelihood: "Medium",
      remediation: {
        description: "Validate and whitelist URLs before making requests",
        codeExample: "fetch(userInput)",
        fixExample: "if (allowedUrls.includes(userInput)) fetch(userInput)",
        effort: "Medium",
        priority: 5,
      },
    },
    {
      pattern:
        /Object\.assign\s*\([^,]+,\s*(?:req\.|request\.|body|params|query)|\.\.\.(?:req\.|request\.|body|params|query)/gi,
      severity: "Critical",
      type: "Prototype Pollution",
      category: "Injection",
      cweId: "CWE-1321",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: "Potential Prototype Pollution vulnerability",
      confidence: 80,
      cvssScore: 7.5,
      impact: "Denial of service or remote code execution",
      likelihood: "Low",
      remediation: {
        description:
          "Avoid merging user input directly into objects, use deep merge libraries with protection",
        codeExample: "Object.assign(target, req.body)",
        fixExample:
          'const safeMerge = require("deepmerge"); safeMerge(target, req.body)',
        effort: "Medium",
        priority: 4,
      },
    },
    {
      pattern:
        /(?:JSON\.parse|unserialize|deserialize|yaml\.load)\s*\([^)]*(?:req\.|request\.|body|user)/gi,
      severity: "Critical",
      type: "Insecure Deserialization",
      category: "Serialization",
      cweId: "CWE-502",
      owaspCategory: OWASP_CATEGORIES.A08_SOFTWARE_INTEGRITY_FAILURES,
      message: "Unsafe deserialization of user input",
      confidence: 85,
      cvssScore: 8.8,
      impact: "Remote code execution",
      likelihood: "Medium",
      remediation: {
        description: "Verify data integrity before deserialization",
        codeExample: "JSON.parse(req.body.data)",
        fixExample:
          "if (verifySignature(req.body.data)) JSON.parse(req.body.data)",
        effort: "High",
        priority: 5,
      },
    },
    {
      pattern:
        /console\.(?:log|info|debug|warn|error)\s*\([^)]*(?:password|token|secret|apiKey|api_key|authorization)/gi,
      severity: "High",
      type: "Sensitive Data Exposure",
      category: "Logging",
      cweId: "CWE-532",
      owaspCategory: OWASP_CATEGORIES.A09_LOGGING_FAILURES,
      message: "Potential logging of sensitive data",
      confidence: 95,
      cvssScore: 7.5,
      impact: "Exposure of sensitive credentials in logs",
      likelihood: "High",
      remediation: {
        description: "Remove logging of sensitive information",
        codeExample: 'console.log("User password:", password)',
        fixExample: 'console.log("User authenticated")',
        effort: "Low",
        priority: 4,
      },
    },
    {
      pattern:
        /target\s*=\s*["']_blank["'](?![^>]*rel\s*=\s*["'][^"']*(?:noopener|noreferrer)[^"']*["'])/gi,
      severity: "Medium",
      type: "Reverse Tabnabbing",
      category: "XSS",
      cweId: "CWE-1022",
      owaspCategory: OWASP_CATEGORIES.A01_BROKEN_ACCESS_CONTROL,
      message: 'target="_blank" without rel="noopener noreferrer"',
      confidence: 90,
      cvssScore: 6.1,
      impact: "Phishing attacks via window.opener",
      likelihood: "Medium",
      remediation: {
        description:
          'Add rel="noopener noreferrer" to links with target="_blank"',
        codeExample: '<a href="..." target="_blank">',
        fixExample: '<a href="..." target="_blank" rel="noopener noreferrer">',
        effort: "Low",
        priority: 3,
      },
    },
    {
      pattern: /(?:AKIA|ASIA)[0-9A-Z]{16}/g,
      severity: "Critical",
      type: "Hardcoded Secret",
      category: "Secrets",
      cweId: "CWE-798",
      owaspCategory: OWASP_CATEGORIES.A07_IDENTIFICATION_FAILURES,
      message: "Hardcoded AWS Access Key detected",
      confidence: 99,
      cvssScore: 9.0,
      impact: "Cloud account compromise",
      likelihood: "High",
      remediation: {
        description: "Remove hardcoded keys and use environment variables",
        codeExample: 'const awsKey = "AKIA..."',
        fixExample: "const awsKey = process.env.AWS_ACCESS_KEY_ID",
        effort: "Low",
        priority: 5,
      },
    },
  ],
  typescript: [
    {
      pattern: /any\s+\w+/gi,
      severity: "Medium",
      type: "Code Quality",
      category: "Type Safety",
      cweId: "CWE-704",
      message: 'Use of "any" type reduces type safety',
      confidence: 70,
      cvssScore: 3.1,
      impact: "Reduced type checking and potential runtime errors",
      likelihood: "Low",
      remediation: {
        description: 'Replace "any" with specific types or use union types',
        codeExample: "let data: any = getUserInput();",
        fixExample: "let data: string | number = getUserInput();",
        effort: "Medium",
        priority: 2,
      },
    },
  ],
  python: [
    {
      pattern: /exec\s*\(/gi,
      severity: "Critical",
      type: "Security",
      category: "Code Injection",
      cweId: "CWE-95",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message:
        "Use of exec() function - potential code injection vulnerability",
      confidence: 95,
      cvssScore: 9.8,
      impact: "Remote code execution possible",
      likelihood: "High",
      remediation: {
        description:
          "Avoid exec() with user input. Use safer alternatives like ast.literal_eval() for data parsing",
        codeExample: "exec(user_input)",
        fixExample:
          "import ast; ast.literal_eval(user_input)  # For safe evaluation",
        effort: "Medium",
        priority: 5,
      },
    },
    {
      pattern: /subprocess\.call\([^)]*shell\s*=\s*True/gi,
      severity: "High",
      type: "Security",
      category: "Command Injection",
      cweId: "CWE-78",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: "subprocess with shell=True can lead to command injection",
      confidence: 90,
      cvssScore: 8.1,
      impact: "Command injection and system compromise",
      likelihood: "High",
      remediation: {
        description:
          "Use subprocess without shell=True and pass arguments as a list",
        codeExample: "subprocess.call(cmd, shell=True)",
        fixExample: 'subprocess.call(["/bin/ls", "-l"])  # Pass as list',
        effort: "Low",
        priority: 4,
      },
    },
    {
      pattern: /os\.system\s*\(/gi,
      severity: "Critical",
      type: "Command Injection",
      category: "Injection",
      cweId: "CWE-78",
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message:
        "os.system() detected - potential command injection vulnerability",
      confidence: 95,
      cvssScore: 9.8,
      impact: "Remote command execution possible",
      likelihood: "High",
      remediation: {
        description:
          "Use subprocess.run() with argument list instead of os.system()",
        codeExample: "os.system(user_command)",
        fixExample: 'subprocess.run(["command", arg1, arg2], check=True)',
        effort: "Low",
        priority: 5,
      },
    },
    {
      pattern: /pickle\.loads?\s*\(/gi,
      severity: "High",
      type: "Deserialization",
      category: "Security",
      cweId: "CWE-502",
      owaspCategory: OWASP_CATEGORIES.A08_SOFTWARE_INTEGRITY_FAILURES,
      message: "Unsafe deserialization with pickle detected",
      confidence: 90,
      cvssScore: 8.1,
      impact: "Arbitrary code execution through deserialization",
      likelihood: "High",
      remediation: {
        description:
          "Avoid pickle for untrusted data. Use JSON or safer serialization formats",
        codeExample: "pickle.loads(untrusted_data)",
        fixExample: "json.loads(untrusted_data)  # Use JSON instead",
        effort: "Medium",
        priority: 4,
      },
    },
    {
      pattern: /random\.randint|random\.random|random\.choice/gi,
      severity: "Medium",
      type: "Security",
      category: "Weak Cryptography",
      cweId: "CWE-338",
      owaspCategory: OWASP_CATEGORIES.A02_CRYPTOGRAPHIC_FAILURES,
      message: "random module is not cryptographically secure",
      confidence: 80,
      cvssScore: 5.3,
      impact: "Predictable random values in security contexts",
      likelihood: "Medium",
      remediation: {
        description:
          "Use secrets module for cryptographically secure random operations",
        codeExample: "random.randint(1, 100)",
        fixExample: "secrets.randbelow(100) + 1",
        effort: "Low",
        priority: 3,
      },
    },
    {
      pattern: /open\s*\([^)]*['"]\s*\+/gi,
      severity: "High",
      type: "Security",
      category: "Path Traversal",
      cweId: "CWE-22",
      owaspCategory: OWASP_CATEGORIES.A01_BROKEN_ACCESS_CONTROL,
      message: "Dynamic file path construction may lead to path traversal",
      confidence: 85,
      cvssScore: 7.5,
      impact: "Unauthorized file access and path traversal",
      likelihood: "Medium",
      remediation: {
        description:
          "Validate and sanitize file paths, use os.path.join() safely",
        codeExample: 'open("/uploads/" + filename)',
        fixExample:
          'import os; safe_path = os.path.join("/uploads", os.path.basename(filename))',
        effort: "Medium",
        priority: 4,
      },
    },
    {
      pattern: /password\s*=\s*["'][^"']+["']/gi,
      severity: "Critical",
      type: "Security",
      category: "Hardcoded Credentials",
      cweId: "CWE-798",
      owaspCategory: OWASP_CATEGORIES.A07_IDENTIFICATION_FAILURES,
      message: "Hardcoded password detected in Python code",
      confidence: 90,
      cvssScore: 8.5,
      impact: "Credential exposure and unauthorized access",
      likelihood: "High",
      remediation: {
        description:
          "Store passwords in environment variables or secure configuration",
        codeExample: 'password = "secret123"',
        fixExample: 'password = os.environ.get("PASSWORD")',
        effort: "Low",
        priority: 5,
      },
    },
  ],
};

// ---------------------------------------------------------------------------
// Dependency vulnerability database (from securityAnalysisEngine.ts)
// ---------------------------------------------------------------------------

export interface DependencyVulnerability {
  package: string;
  versions: string[];
  severity: "Critical" | "High" | "Medium" | "Low";
  cveId: string;
  description: string;
  remediation: string;
}

export const DEPENDENCY_VULNERABILITIES: DependencyVulnerability[] = [
  {
    package: "lodash",
    versions: ["< 4.17.21"],
    severity: "High",
    cveId: "CVE-2021-23337",
    description: "Command injection vulnerability in lodash",
    remediation: "Update to lodash >= 4.17.21",
  },
  {
    package: "axios",
    versions: ["< 1.6.0"],
    severity: "High",
    cveId: "CVE-2023-45857",
    description:
      "CSRF vulnerability due to cookie exposure in cross-site requests",
    remediation: "Update to axios >= 1.6.0",
  },
  {
    package: "axios",
    versions: ["< 1.7.4"],
    severity: "High",
    cveId: "CVE-2024-39338",
    description: "Server-Side Request Forgery (SSRF) vulnerability",
    remediation: "Update to axios >= 1.7.4",
  },
  {
    package: "express",
    versions: ["< 4.19.2"],
    severity: "Medium",
    cveId: "CVE-2024-29041",
    description: "Open redirect vulnerability in express",
    remediation: "Update to express >= 4.19.2",
  },
  {
    package: "ip",
    versions: ["< 2.0.1"],
    severity: "High",
    cveId: "CVE-2024-29415",
    description: "SSRF vulnerability in ip package",
    remediation: "Update to ip >= 2.0.1",
  },
  {
    package: "ws",
    versions: ["< 8.17.1"],
    severity: "High",
    cveId: "CVE-2024-37890",
    description: "Denial of Service vulnerability in WebSocket library",
    remediation: "Update to ws >= 8.17.1",
  },
  {
    package: "braces",
    versions: ["< 3.0.3"],
    severity: "High",
    cveId: "CVE-2024-4068",
    description: "Uncontrolled resource consumption (ReDoS)",
    remediation: "Update to braces >= 3.0.3",
  },
  {
    package: "follow-redirects",
    versions: ["< 1.15.6"],
    severity: "Medium",
    cveId: "CVE-2024-28849",
    description: "Exposure of sensitive information through redirect",
    remediation: "Update to follow-redirects >= 1.15.6",
  },
  {
    package: "tar",
    versions: ["< 6.2.1"],
    severity: "High",
    cveId: "CVE-2024-28863",
    description: "Denial of Service vulnerability in tar extraction",
    remediation: "Update to tar >= 6.2.1",
  },
  {
    package: "undici",
    versions: ["< 5.28.4"],
    severity: "Medium",
    cveId: "CVE-2024-30260",
    description: "Cookie leakage in cross-origin redirects",
    remediation: "Update to undici >= 5.28.4 or >= 6.11.1",
  },
  {
    package: "jsonwebtoken",
    versions: ["< 9.0.0"],
    severity: "High",
    cveId: "CVE-2022-23529",
    description: "Insecure implementation of key retrieval function",
    remediation: "Update to jsonwebtoken >= 9.0.0",
  },
  {
    package: "shell-quote",
    versions: ["< 1.8.1"],
    severity: "Critical",
    cveId: "CVE-2024-4067",
    description: "Command injection vulnerability",
    remediation: "Update to shell-quote >= 1.8.1",
  },
  {
    package: "cross-spawn",
    versions: ["< 7.0.5"],
    severity: "High",
    cveId: "CVE-2024-21538",
    description: "Regular Expression Denial of Service (ReDoS)",
    remediation: "Update to cross-spawn >= 7.0.5",
  },
  {
    package: "esbuild",
    versions: ["< 0.24.2"],
    severity: "Medium",
    cveId: "CVE-2024-56334",
    description: "Development server vulnerability",
    remediation: "Update to esbuild >= 0.24.2",
  },
  {
    package: "body-parser",
    versions: ["< 1.20.3"],
    severity: "High",
    cveId: "CVE-2024-45590",
    description: "Denial of Service through malformed URL encoding",
    remediation: "Update to body-parser >= 1.20.3",
  },
  {
    package: "path-to-regexp",
    versions: ["< 0.1.10"],
    severity: "High",
    cveId: "CVE-2024-45296",
    description: "ReDoS vulnerability in path matching",
    remediation: "Update to path-to-regexp >= 0.1.10 or >= 8.0.0",
  },
  {
    package: "send",
    versions: ["< 0.19.0"],
    severity: "Medium",
    cveId: "CVE-2024-43799",
    description: "Template injection vulnerability",
    remediation: "Update to send >= 0.19.0",
  },
  {
    package: "serve-static",
    versions: ["< 1.16.0"],
    severity: "Medium",
    cveId: "CVE-2024-43800",
    description: "Template injection through malicious filenames",
    remediation: "Update to serve-static >= 1.16.0",
  },
  {
    package: "requests",
    versions: ["< 2.32.2"],
    severity: "Medium",
    cveId: "CVE-2024-35195",
    description: "Certificate verification bypass",
    remediation: "Update to requests >= 2.32.2",
  },
  {
    package: "jinja2",
    versions: ["< 3.1.4"],
    severity: "Medium",
    cveId: "CVE-2024-34064",
    description: "Cross-site scripting through template attributes",
    remediation: "Update to jinja2 >= 3.1.4",
  },
  {
    package: "werkzeug",
    versions: ["< 3.0.3"],
    severity: "High",
    cveId: "CVE-2024-34069",
    description: "Debugger RCE vulnerability",
    remediation: "Update to werkzeug >= 3.0.3",
  },
  {
    package: "urllib3",
    versions: ["< 2.2.2"],
    severity: "Medium",
    cveId: "CVE-2024-37891",
    description: "Proxy-Authorization header leak in cross-origin redirects",
    remediation: "Update to urllib3 >= 2.2.2",
  },
  {
    package: "org.springframework:spring-web",
    versions: ["< 6.1.6"],
    severity: "High",
    cveId: "CVE-2024-22259",
    description: "Open redirect vulnerability",
    remediation: "Update to spring-web >= 6.1.6 or >= 6.0.19",
  },
  {
    package: "org.apache.logging.log4j:log4j-core",
    versions: ["< 2.24.0"],
    severity: "Medium",
    cveId: "CVE-2024-23672",
    description: "Denial of Service in Log4j",
    remediation: "Update to log4j-core >= 2.24.0",
  },
  {
    package: "com.fasterxml.jackson.core:jackson-databind",
    versions: ["< 2.17.0"],
    severity: "High",
    cveId: "CVE-2023-35116",
    description: "Polymorphic deserialization vulnerability",
    remediation: "Update to jackson-databind >= 2.17.0",
  },
];

// ---------------------------------------------------------------------------
// CVSS scoring
// ---------------------------------------------------------------------------

/**
 * Calculate a rough CVSS-like score from issue characteristics.
 * Accepts a partial EngineIssue so callers don't need all fields.
 */
export function calculateCVSSScore(issue: Partial<EngineIssue>): number {
  let baseScore = 0;

  if (issue.severity === "Critical") baseScore += 4;
  else if (issue.severity === "High") baseScore += 3;
  else if (issue.severity === "Medium") baseScore += 2;
  else baseScore += 1;

  if (issue.category?.includes("Injection")) baseScore += 3;
  if (issue.category?.includes("XSS")) baseScore += 2.5;
  if (issue.category?.includes("Hardcoded")) baseScore += 2;
  if (issue.category?.includes("Secret Detection")) baseScore += 2.5;

  const confidenceMultiplier = (issue.confidence ?? 50) / 100;
  baseScore *= confidenceMultiplier;

  return Math.min(10, Math.max(0, baseScore));
}

// ---------------------------------------------------------------------------
// Security score from a list of issues
// ---------------------------------------------------------------------------

/**
 * Generate a 0–100 security score from an array of EngineIssues.
 */
export function calculateSecurityScore(issues: EngineIssue[]): number {
  if (issues.length === 0) return 95;

  const criticalIssues = issues.filter((i) => i.severity === "Critical").length;
  const highIssues = issues.filter((i) => i.severity === "High").length;
  const mediumIssues = issues.filter((i) => i.severity === "Medium").length;
  const lowIssues = issues.filter((i) => i.severity === "Low").length;

  const criticalWeight = criticalIssues * 20;
  const highWeight = highIssues * 12;
  const mediumWeight = mediumIssues * 5;
  const lowWeight = lowIssues * 1;

  const diversityPenalty = _calcDiversityPenalty(issues);
  const concentrationPenalty = _calcConcentrationPenalty(issues);
  const distributionPenalty = _calcDistributionPenalty(issues);

  const totalPenalty =
    criticalWeight +
    highWeight +
    mediumWeight +
    lowWeight +
    diversityPenalty +
    concentrationPenalty +
    distributionPenalty;

  let score = 100;
  if (totalPenalty > 0) {
    const penaltyImpact = Math.min(85, totalPenalty * 1.2);
    score = Math.max(5, 100 - penaltyImpact);
  }

  return Math.round(_applyModifiers(score, issues));
}

function _calcDiversityPenalty(issues: EngineIssue[]): number {
  const cats = new Set(issues.map((i) => i.category ?? i.type ?? ""));
  const types = new Set(issues.map((i) => i.type ?? ""));
  const catPenalty = cats.size > 4 ? (cats.size - 4) * 2 : 0;
  const typePenalty = types.size > 6 ? (types.size - 6) * 1.5 : 0;
  return catPenalty + typePenalty;
}

function _calcConcentrationPenalty(issues: EngineIssue[]): number {
  const fileMap = new Map<string, number>();
  issues.forEach((i) => {
    fileMap.set(i.filename, (fileMap.get(i.filename) ?? 0) + 1);
  });
  let penalty = 0;
  fileMap.forEach((count) => {
    if (count > 5) penalty += (count - 5) * 0.8;
  });
  return penalty;
}

function _calcDistributionPenalty(issues: EngineIssue[]): number {
  const total = issues.length;
  if (total === 0) return 0;
  const criticalRatio =
    issues.filter((i) => i.severity === "Critical").length / total;
  const highRatio = issues.filter((i) => i.severity === "High").length / total;
  const criticalPenalty =
    criticalRatio > 0.2 ? Math.pow(criticalRatio, 2) * 15 : 0;
  const highPenalty = highRatio > 0.3 ? Math.pow(highRatio, 1.5) * 8 : 0;
  return criticalPenalty + highPenalty;
}

function _applyModifiers(base: number, issues: EngineIssue[]): number {
  let score = base;
  if (issues.every((i) => i.severity === "Low") && issues.length < 5)
    score += 5;
  if (issues.some((i) => i.severity === "Critical")) score -= 10;
  const hasInjection = issues.some(
    (i) =>
      (i.type ?? "").toLowerCase().includes("injection") ||
      (i.type ?? "").toLowerCase().includes("xss") ||
      (i.message ?? "").toLowerCase().includes("sql")
  );
  if (!hasInjection && issues.length > 0) score += 3;
  const hasAuth = issues.some(
    (i) =>
      (i.message ?? "").toLowerCase().includes("auth") ||
      (i.message ?? "").toLowerCase().includes("session") ||
      (i.message ?? "").toLowerCase().includes("password") ||
      (i.type ?? "").toLowerCase().includes("hardcoded")
  );
  if (hasAuth) score -= 5;
  const hasSecrets = issues.some(
    (i) => i.category === "Secret Detection" || i.type === "Secret"
  );
  if (hasSecrets) score -= 8;
  return Math.max(5, Math.min(100, score));
}
