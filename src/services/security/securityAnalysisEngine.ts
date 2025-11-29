import { SecurityIssue } from '@/hooks/useAnalysis';

// OWASP Top 10 2025 Categories (Release Candidate - November 2025)
export const OWASP_CATEGORIES_2025 = {
  A01_BROKEN_ACCESS_CONTROL: 'A01:2025 – Broken Access Control',
  A02_SECURITY_MISCONFIGURATION: 'A02:2025 – Security Misconfiguration',
  A03_SOFTWARE_SUPPLY_CHAIN: 'A03:2025 – Software Supply Chain Failures',
  A04_CRYPTOGRAPHIC_FAILURES: 'A04:2025 – Cryptographic Failures',
  A05_INJECTION: 'A05:2025 – Injection',
  A06_INSECURE_DESIGN: 'A06:2025 – Insecure Design',
  A07_AUTHENTICATION_FAILURES: 'A07:2025 – Authentication Failures',
  A08_SOFTWARE_INTEGRITY_FAILURES: 'A08:2025 – Software or Data Integrity Failures',
  A09_LOGGING_ALERTING_FAILURES: 'A09:2025 – Logging and Alerting Failures',
  A10_EXCEPTIONAL_CONDITIONS: 'A10:2025 – Mishandling of Exceptional Conditions'
};

// OWASP Top 10 2021 Categories (Stable - for backward compatibility)
export const OWASP_CATEGORIES_2021 = {
  A01_BROKEN_ACCESS_CONTROL: 'A01:2021 – Broken Access Control',
  A02_CRYPTOGRAPHIC_FAILURES: 'A02:2021 – Cryptographic Failures',
  A03_INJECTION: 'A03:2021 – Injection',
  A04_INSECURE_DESIGN: 'A04:2021 – Insecure Design',
  A05_SECURITY_MISCONFIGURATION: 'A05:2021 – Security Misconfiguration',
  A06_VULNERABLE_COMPONENTS: 'A06:2021 – Vulnerable and Outdated Components',
  A07_IDENTIFICATION_FAILURES: 'A07:2021 – Identification and Authentication Failures',
  A08_SOFTWARE_INTEGRITY_FAILURES: 'A08:2021 – Software and Data Integrity Failures',
  A09_LOGGING_FAILURES: 'A09:2021 – Security Logging and Monitoring Failures',
  A10_SSRF: 'A10:2021 – Server-Side Request Forgery (SSRF)'
};

// Primary OWASP Categories (using 2021 as stable, with 2025 available for future migration)
// Using 2021 as default since 2025 is still Release Candidate
export const OWASP_CATEGORIES = OWASP_CATEGORIES_2021;

// Common Weakness Enumeration (CWE) mappings - Updated 2025
export const CWE_MAPPINGS = {
  // Injection vulnerabilities
  SQL_INJECTION: 'CWE-89',
  XSS: 'CWE-79',
  COMMAND_INJECTION: 'CWE-78',
  CODE_INJECTION: 'CWE-94',
  LDAP_INJECTION: 'CWE-90',
  XPATH_INJECTION: 'CWE-91',
  NOSQL_INJECTION: 'CWE-943',
  
  // Authentication & Access Control
  HARDCODED_CREDENTIALS: 'CWE-798',
  BROKEN_ACCESS_CONTROL: 'CWE-284',
  MISSING_AUTH: 'CWE-306',
  IMPROPER_AUTH: 'CWE-287',
  SESSION_FIXATION: 'CWE-384',
  
  // Cryptographic Issues
  WEAK_CRYPTO: 'CWE-327',
  INSECURE_RANDOM: 'CWE-338',
  INSUFFICIENT_KEY_SIZE: 'CWE-326',
  BROKEN_CRYPTO: 'CWE-328',
  CLEARTEXT_TRANSMISSION: 'CWE-319',
  CLEARTEXT_STORAGE: 'CWE-312',
  
  // File & Path Operations
  PATH_TRAVERSAL: 'CWE-22',
  UNRESTRICTED_UPLOAD: 'CWE-434',
  INSECURE_FILE_ACCESS: 'CWE-552',
  
  // Memory & Resource Management
  BUFFER_OVERFLOW: 'CWE-120',
  NULL_POINTER: 'CWE-476',
  RACE_CONDITION: 'CWE-362',
  USE_AFTER_FREE: 'CWE-416',
  MEMORY_LEAK: 'CWE-401',
  
  // Deserialization & Data Handling
  INSECURE_DESERIALIZATION: 'CWE-502',
  PROTOTYPE_POLLUTION: 'CWE-1321',
  XXE: 'CWE-611',
  SSRF: 'CWE-918',
  
  // Supply Chain & Dependencies
  VULNERABLE_DEPENDENCY: 'CWE-1395',
  UNTRUSTED_SOURCE: 'CWE-494',
  
  // Information Disclosure
  SENSITIVE_DATA_EXPOSURE: 'CWE-200',
  ERROR_MESSAGE_EXPOSURE: 'CWE-209',
  
  // Logging & Monitoring
  INSUFFICIENT_LOGGING: 'CWE-778',
  LOG_INJECTION: 'CWE-117'
};

// Security rule patterns for different languages
export const SECURITY_RULES = {
  javascript: [
    {
      pattern: /SELECT.*FROM.*["'`]\s*\+|query.*["'`]\s*\+/gi,
      severity: 'Critical' as const,
      type: 'SQL Injection',
      category: 'Injection',
      cweId: 'CWE-89',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'Potential SQL injection vulnerability - dynamic SQL query construction detected',
      confidence: 90,
      cvssScore: 9.8,
      impact: 'Database compromise, data theft, or manipulation',
      likelihood: 'High',
      remediation: {
        description: 'Use parameterized queries or prepared statements instead of string concatenation',
        codeExample: 'const query = "SELECT * FROM users WHERE id = \'" + userId + "\'";',
        fixExample: 'const query = "SELECT * FROM users WHERE id = ?"; db.query(query, [userId]);',
        effort: 'Low' as const,
        priority: 5
      }
    },
    {
      pattern: /\.query\(["'`].*["'`]\s*\+|\.execute\(["'`].*["'`]\s*\+/gi,
      severity: 'Critical' as const,
      type: 'SQL Injection',
      category: 'Injection',
      cweId: 'CWE-89',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'SQL query with string concatenation detected - use parameterized queries',
      confidence: 92,
      cvssScore: 9.8,
      impact: 'SQL injection leading to data breach',
      likelihood: 'High',
      remediation: {
        description: 'Use parameterized queries with placeholders',
        codeExample: 'db.query("SELECT * FROM users WHERE id = \'" + id + "\'");',
        fixExample: 'db.query("SELECT * FROM users WHERE id = ?", [id]);',
        effort: 'Low' as const,
        priority: 5
      }
    },
    {
      pattern: /dangerouslySetInnerHTML|__html:/gi,
      severity: 'High' as const,
      type: 'XSS',
      category: 'Cross-Site Scripting',
      cweId: 'CWE-79',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'dangerouslySetInnerHTML usage detected - potential XSS vulnerability',
      confidence: 88,
      cvssScore: 8.2,
      impact: 'Cross-site scripting attacks possible',
      likelihood: 'High',
      remediation: {
        description: 'Sanitize HTML content or use textContent instead',
        codeExample: '<div dangerouslySetInnerHTML={{__html: userInput}} />',
        fixExample: '<div>{DOMPurify.sanitize(userInput)}</div>',
        effort: 'Medium' as const,
        priority: 4
      }
    },
    {
      pattern: /\bexec\s*\(|\bspawn\s*\(|\bexecSync\s*\(|child_process\.exec|child_process\.spawn/gi,
      severity: 'Critical' as const,
      type: 'Command Injection',
      category: 'Injection',
      cweId: 'CWE-78',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'Command execution detected - potential command injection vulnerability',
      confidence: 85,
      cvssScore: 9.1,
      impact: 'Remote command execution possible',
      likelihood: 'High',
      remediation: {
        description: 'Validate and sanitize all user inputs before executing system commands, use execFile with argument array',
        codeExample: 'exec("command " + userInput);',
        fixExample: 'execFile("command", [sanitizedInput]);',
        effort: 'Medium' as const,
        priority: 5
      }
    },
    {
      pattern: /['"]\.\/.*['"]\s*\+|\+\s*['"]\.\/|require\s*\(.*\+|import\s*\(.*\+/gi,
      severity: 'High' as const,
      type: 'Path Traversal',
      category: 'Injection',
      cweId: 'CWE-22',
      owaspCategory: OWASP_CATEGORIES.A01_BROKEN_ACCESS_CONTROL,
      message: 'Dynamic module loading with concatenation - potential path traversal',
      confidence: 80,
      cvssScore: 7.5,
      impact: 'Arbitrary file access or code execution',
      likelihood: 'Medium',
      remediation: {
        description: 'Use a whitelist of allowed modules or validate input against allowed paths',
        codeExample: 'require("./" + userInput);',
        fixExample: 'const allowedModules = {mod1: "./mod1"}; require(allowedModules[userInput]);',
        effort: 'Medium' as const,
        priority: 4
      }
    },
    {
      pattern: /createHash\s*\(\s*["']md5["']|createHash\s*\(\s*["']sha1["']/gi,
      severity: 'Medium' as const,
      type: 'Weak Cryptography',
      category: 'Cryptographic Failure',
      cweId: 'CWE-327',
      owaspCategory: OWASP_CATEGORIES.A02_CRYPTOGRAPHIC_FAILURES,
      message: 'Weak cryptographic algorithm (MD5/SHA1) detected',
      confidence: 95,
      cvssScore: 5.9,
      impact: 'Cryptographic weaknesses may be exploited',
      likelihood: 'Medium',
      remediation: {
        description: 'Use stronger hashing algorithms like SHA-256 or bcrypt',
        codeExample: 'crypto.createHash("md5");',
        fixExample: 'crypto.createHash("sha256");',
        effort: 'Low' as const,
        priority: 3
      }
    },
    {
      pattern: /\beval\s*\(|\bnew\s+Function\s*\(/gi,
      severity: 'Critical' as const,
      type: 'Security',
      category: 'Code Quality',
      cweId: 'CWE-95',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'Use of eval() or new Function() detected - potential code injection vulnerability',
      confidence: 95,
      cvssScore: 9.3,
      impact: 'Remote code execution possible',
      likelihood: 'High',
      remediation: {
        description: 'Replace eval() with safer alternatives like JSON.parse() for data parsing or Function constructor for controlled code execution',
        codeExample: 'eval(userInput); // Dangerous',
        fixExample: 'JSON.parse(userInput); // Safer for JSON data',
        effort: 'Medium' as const,
        priority: 5
      }
    },
    {
      pattern: /document\.write\s*\(/gi,
      severity: 'High' as const,
      type: 'Security',
      category: 'XSS',
      cweId: 'CWE-79',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'document.write() with user input can lead to XSS vulnerabilities',
      confidence: 85,
      cvssScore: 7.5,
      impact: 'Cross-site scripting attacks possible',
      likelihood: 'Medium',
      remediation: {
        description: 'Use safer DOM manipulation methods like createElement() and textContent',
        codeExample: 'document.write(userInput);',
        fixExample: 'const element = document.createElement("div"); element.textContent = userInput;',
        effort: 'Low' as const,
        priority: 4
      }
    },
    {
      pattern: /innerHTML\s*=.*\+/gi,
      severity: 'High' as const,
      type: 'Security',
      category: 'XSS',
      cweId: 'CWE-79',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'Dynamic innerHTML assignment may lead to XSS vulnerabilities',
      confidence: 80,
      cvssScore: 6.8,
      impact: 'Cross-site scripting through DOM manipulation',
      likelihood: 'Medium',
      remediation: {
        description: 'Use textContent for text or properly sanitize HTML content',
        codeExample: 'element.innerHTML = userInput;',
        fixExample: 'element.textContent = userInput; // or use DOMPurify.sanitize()',
        effort: 'Low' as const,
        priority: 4
      }
    },
    {
      pattern: /password\s*[:=]\s*["'][^"']*["']/gi,
      severity: 'Critical' as const,
      type: 'Security',
      category: 'Hardcoded Credentials',
      cweId: 'CWE-798',
      owaspCategory: OWASP_CATEGORIES.A07_IDENTIFICATION_FAILURES,
      message: 'Hardcoded password detected in source code',
      confidence: 90,
      cvssScore: 8.5,
      impact: 'Credential exposure and unauthorized access',
      likelihood: 'High',
      remediation: {
        description: 'Store passwords in environment variables or secure configuration files',
        codeExample: 'const password = "mySecretPassword123";',
        fixExample: 'const password = process.env.PASSWORD;',
        effort: 'Low' as const,
        priority: 5
      }
    },
    {
      pattern: /Math\.random\(\)/gi,
      severity: 'Medium' as const,
      type: 'Security',
      category: 'Weak Cryptography',
      cweId: 'CWE-338',
      owaspCategory: OWASP_CATEGORIES.A02_CRYPTOGRAPHIC_FAILURES,
      message: 'Math.random() is not cryptographically secure',
      confidence: 75,
      cvssScore: 5.3,
      impact: 'Predictable random values in security contexts',
      likelihood: 'Medium',
      remediation: {
        description: 'Use crypto.getRandomValues() for cryptographically secure random numbers',
        codeExample: 'Math.random();',
        fixExample: 'crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;',
        effort: 'Low' as const,
        priority: 3
      }
    },
    // Zip Slip Vulnerability (NEW)
    {
      pattern: /\.async\s*\(\s*["']string["']\s*\)|new\s+JSZip/gi,
      severity: 'Critical' as const,
      type: 'Vulnerability',
      category: 'Security',
      cweId: 'CWE-22',
      owaspCategory: OWASP_CATEGORIES.A01_BROKEN_ACCESS_CONTROL,
      message: 'Zip archives should be extracted securely (Zip Slip)',
      confidence: 85,
      cvssScore: 7.5,
      impact: 'Arbitrary file overwrite via path traversal',
      likelihood: 'Medium',
      remediation: {
        description: 'Validate paths in zip archives before extraction',
        codeExample: 'zip.file(entry.name).async("string")',
        fixExample: 'if (entry.name.includes("..")) throw new Error("Invalid path");',
        effort: 'Medium' as const,
        priority: 5
      }
    },
    // Unsafe React href (NEW)
    {
      pattern: /href\s*=\s*["']javascript:/gi,
      severity: 'Critical' as const,
      type: 'XSS',
      category: 'Cross-Site Scripting',
      cweId: 'CWE-79',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'Links should not use javascript: protocol',
      confidence: 95,
      cvssScore: 6.1,
      impact: 'Cross-site scripting attacks possible',
      likelihood: 'High',
      remediation: {
        description: 'Avoid using javascript: protocol in href attributes',
        codeExample: '<a href="javascript:void(0)">',
        fixExample: '<button onClick={handler}>',
        effort: 'Low' as const,
        priority: 4
      }
    },
    // HTTP Header Injection (NEW)
    {
      pattern: /(?:setHeader|writeHead)\s*\([^,]+,\s*(?:req\.|request\.|body|params|query)/gi,
      severity: 'Critical' as const,
      type: 'Injection',
      category: 'Security',
      cweId: 'CWE-113',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'HTTP headers should not be vulnerable to injection',
      confidence: 85,
      cvssScore: 6.5,
      impact: 'HTTP Response Splitting or Header Injection',
      likelihood: 'Medium',
      remediation: {
        description: 'Validate and sanitize user input before using in HTTP headers',
        codeExample: 'res.setHeader("X-User", req.query.user)',
        fixExample: 'res.setHeader("X-User", sanitize(req.query.user))',
        effort: 'Medium' as const,
        priority: 4
      }
    },
    // NoSQL Injection (NEW)
    {
      pattern: /\$where\s*:|\.find\s*\([^)]*\$|\$regex\s*:/gi,
      severity: 'Critical' as const,
      type: 'NoSQL Injection',
      category: 'Injection',
      cweId: 'CWE-943',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'NoSQL injection vulnerability detected',
      confidence: 90,
      cvssScore: 9.5,
      impact: 'Database compromise and data leakage',
      likelihood: 'High',
      remediation: {
        description: 'Sanitize user input and avoid using $where or $regex with user input',
        codeExample: 'db.users.find({ $where: "this.age > " + input })',
        fixExample: 'db.users.find({ age: { $gt: parseInt(input) } })',
        effort: 'Medium' as const,
        priority: 5
      }
    },
    // SSRF (NEW)
    {
      pattern: /(?:fetch|axios|request|http\.get|https\.get)\s*\([^)]*(?:\+|`\$\{)/gi,
      severity: 'Critical' as const,
      type: 'SSRF',
      category: 'Server-Side Request Forgery',
      cweId: 'CWE-918',
      owaspCategory: OWASP_CATEGORIES.A10_SSRF,
      message: 'Potential Server-Side Request Forgery (SSRF)',
      confidence: 85,
      cvssScore: 8.5,
      impact: 'Internal network scanning and unauthorized access',
      likelihood: 'Medium',
      remediation: {
        description: 'Validate and whitelist URLs before making requests',
        codeExample: 'fetch(userInput)',
        fixExample: 'if (allowedUrls.includes(userInput)) fetch(userInput)',
        effort: 'Medium' as const,
        priority: 5
      }
    },
    // Prototype Pollution (NEW)
    {
      pattern: /Object\.assign\s*\([^,]+,\s*(?:req\.|request\.|body|params|query)|\.\.\.(?:req\.|request\.|body|params|query)/gi,
      severity: 'Critical' as const,
      type: 'Prototype Pollution',
      category: 'Injection',
      cweId: 'CWE-1321',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'Potential Prototype Pollution vulnerability',
      confidence: 80,
      cvssScore: 7.5,
      impact: 'Denial of service or remote code execution',
      likelihood: 'Low',
      remediation: {
        description: 'Avoid merging user input directly into objects, use deep merge libraries with protection',
        codeExample: 'Object.assign(target, req.body)',
        fixExample: 'const safeMerge = require("deepmerge"); safeMerge(target, req.body)',
        effort: 'Medium' as const,
        priority: 4
      }
    },
    // Insecure Deserialization (NEW)
    {
      pattern: /(?:JSON\.parse|unserialize|deserialize|yaml\.load)\s*\([^)]*(?:req\.|request\.|body|user)/gi,
      severity: 'Critical' as const,
      type: 'Insecure Deserialization',
      category: 'Serialization',
      cweId: 'CWE-502',
      owaspCategory: OWASP_CATEGORIES.A08_SOFTWARE_INTEGRITY_FAILURES,
      message: 'Unsafe deserialization of user input',
      confidence: 85,
      cvssScore: 8.8,
      impact: 'Remote code execution',
      likelihood: 'Medium',
      remediation: {
        description: 'Verify data integrity before deserialization',
        codeExample: 'JSON.parse(req.body.data)',
        fixExample: 'if (verifySignature(req.body.data)) JSON.parse(req.body.data)',
        effort: 'High' as const,
        priority: 5
      }
    },
    // Logging Sensitive Data (NEW)
    {
      pattern: /console\.(?:log|info|debug|warn|error)\s*\([^)]*(?:password|token|secret|apiKey|api_key|authorization)/gi,
      severity: 'High' as const,
      type: 'Sensitive Data Exposure',
      category: 'Logging',
      cweId: 'CWE-532',
      owaspCategory: OWASP_CATEGORIES.A09_LOGGING_FAILURES,
      message: 'Potential logging of sensitive data',
      confidence: 95,
      cvssScore: 7.5,
      impact: 'Exposure of sensitive credentials in logs',
      likelihood: 'High',
      remediation: {
        description: 'Remove logging of sensitive information',
        codeExample: 'console.log("User password:", password)',
        fixExample: 'console.log("User authenticated")',
        effort: 'Low' as const,
        priority: 4
      }
    },
    // Reverse Tabnabbing (NEW)
    {
      pattern: /target\s*=\s*["']_blank["'](?![^>]*rel\s*=\s*["'][^"']*(?:noopener|noreferrer)[^"']*["'])/gi,
      severity: 'Medium' as const,
      type: 'Reverse Tabnabbing',
      category: 'XSS',
      cweId: 'CWE-1022',
      owaspCategory: OWASP_CATEGORIES.A01_BROKEN_ACCESS_CONTROL,
      message: 'target="_blank" without rel="noopener noreferrer"',
      confidence: 90,
      cvssScore: 6.1,
      impact: 'Phishing attacks via window.opener',
      likelihood: 'Medium',
      remediation: {
        description: 'Add rel="noopener noreferrer" to links with target="_blank"',
        codeExample: '<a href="..." target="_blank">',
        fixExample: '<a href="..." target="_blank" rel="noopener noreferrer">',
        effort: 'Low' as const,
        priority: 3
      }
    },
    // AWS Access Key (NEW)
    {
      pattern: /(?:AKIA|ASIA)[0-9A-Z]{16}/g,
      severity: 'Critical' as const,
      type: 'Hardcoded Secret',
      category: 'Secrets',
      cweId: 'CWE-798',
      owaspCategory: OWASP_CATEGORIES.A07_IDENTIFICATION_FAILURES,
      message: 'Hardcoded AWS Access Key detected',
      confidence: 99,
      cvssScore: 9.0,
      impact: 'Cloud account compromise',
      likelihood: 'High',
      remediation: {
        description: 'Remove hardcoded keys and use environment variables',
        codeExample: 'const awsKey = "AKIA..."',
        fixExample: 'const awsKey = process.env.AWS_ACCESS_KEY_ID',
        effort: 'Low' as const,
        priority: 5
      }
    }
  ],
  typescript: [
    {
      pattern: /any\s+\w+/gi,
      severity: 'Medium' as const,
      type: 'Code Quality',
      category: 'Type Safety',
      cweId: 'CWE-704',
      message: 'Use of "any" type reduces type safety',
      confidence: 70,
      cvssScore: 3.1,
      impact: 'Reduced type checking and potential runtime errors',
      likelihood: 'Low',
      remediation: {
        description: 'Replace "any" with specific types or use union types',
        codeExample: 'let data: any = getUserInput();',
        fixExample: 'let data: string | number = getUserInput();',
        effort: 'Medium' as const,
        priority: 2
      }
    }
  ],
  python: [
    {
      pattern: /exec\s*\(/gi,
      severity: 'Critical' as const,
      type: 'Security',
      category: 'Code Injection',
      cweId: 'CWE-95',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'Use of exec() function - potential code injection vulnerability',
      confidence: 95,
      cvssScore: 9.8,
      impact: 'Remote code execution possible',
      likelihood: 'High',
      remediation: {
        description: 'Avoid exec() with user input. Use safer alternatives like ast.literal_eval() for data parsing',
        codeExample: 'exec(user_input)',
        fixExample: 'import ast; ast.literal_eval(user_input)  # For safe evaluation',
        effort: 'Medium' as const,
        priority: 5
      }
    },
    {
      pattern: /subprocess\.call\([^)]*shell\s*=\s*True/gi,
      severity: 'High' as const,
      type: 'Security',
      category: 'Command Injection',
      cweId: 'CWE-78',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'subprocess with shell=True can lead to command injection',
      confidence: 90,
      cvssScore: 8.1,
      impact: 'Command injection and system compromise',
      likelihood: 'High',
      remediation: {
        description: 'Use subprocess without shell=True and pass arguments as a list',
        codeExample: 'subprocess.call(cmd, shell=True)',
        fixExample: 'subprocess.call(["/bin/ls", "-l"])  # Pass as list',
        effort: 'Low' as const,
        priority: 4
      }
    },
    {
      pattern: /os\.system\s*\(/gi,
      severity: 'Critical' as const,
      type: 'Command Injection',
      category: 'Injection',
      cweId: 'CWE-78',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'os.system() detected - potential command injection vulnerability',
      confidence: 95,
      cvssScore: 9.8,
      impact: 'Remote command execution possible',
      likelihood: 'High',
      remediation: {
        description: 'Use subprocess.run() with argument list instead of os.system()',
        codeExample: 'os.system(user_command)',
        fixExample: 'subprocess.run(["command", arg1, arg2], check=True)',
        effort: 'Low' as const,
        priority: 5
      }
    },
    {
      pattern: /pickle\.loads?\s*\(/gi,
      severity: 'High' as const,
      type: 'Deserialization',
      category: 'Security',
      cweId: 'CWE-502',
      owaspCategory: OWASP_CATEGORIES.A08_SOFTWARE_INTEGRITY_FAILURES,
      message: 'Unsafe deserialization with pickle detected',
      confidence: 90,
      cvssScore: 8.1,
      impact: 'Arbitrary code execution through deserialization',
      likelihood: 'High',
      remediation: {
        description: 'Avoid pickle for untrusted data. Use JSON or safer serialization formats',
        codeExample: 'pickle.loads(untrusted_data)',
        fixExample: 'json.loads(untrusted_data)  # Use JSON instead',
        effort: 'Medium' as const,
        priority: 4
      }
    },
    {
      pattern: /random\.randint|random\.random|random\.choice/gi,
      severity: 'Medium' as const,
      type: 'Security',
      category: 'Weak Cryptography',
      cweId: 'CWE-338',
      owaspCategory: OWASP_CATEGORIES.A02_CRYPTOGRAPHIC_FAILURES,
      message: 'random module is not cryptographically secure',
      confidence: 80,
      cvssScore: 5.3,
      impact: 'Predictable random values in security contexts',
      likelihood: 'Medium',
      remediation: {
        description: 'Use secrets module for cryptographically secure random operations',
        codeExample: 'random.randint(1, 100)',
        fixExample: 'secrets.randbelow(100) + 1',
        effort: 'Low' as const,
        priority: 3
      }
    },
    {
      pattern: /open\s*\([^)]*['"]\s*\+/gi,
      severity: 'High' as const,
      type: 'Security',
      category: 'Path Traversal',
      cweId: 'CWE-22',
      owaspCategory: OWASP_CATEGORIES.A01_BROKEN_ACCESS_CONTROL,
      message: 'Dynamic file path construction may lead to path traversal',
      confidence: 85,
      cvssScore: 7.5,
      impact: 'Unauthorized file access and path traversal',
      likelihood: 'Medium',
      remediation: {
        description: 'Validate and sanitize file paths, use os.path.join() safely',
        codeExample: 'open("/uploads/" + filename)',
        fixExample: 'import os; safe_path = os.path.join("/uploads", os.path.basename(filename))',
        effort: 'Medium' as const,
        priority: 4
      }
    },
    {
      pattern: /password\s*=\s*["'][^"']+["']/gi,
      severity: 'Critical' as const,
      type: 'Security',
      category: 'Hardcoded Credentials',
      cweId: 'CWE-798',
      owaspCategory: OWASP_CATEGORIES.A07_IDENTIFICATION_FAILURES,
      message: 'Hardcoded password detected in Python code',
      confidence: 90,
      cvssScore: 8.5,
      impact: 'Credential exposure and unauthorized access',
      likelihood: 'High',
      remediation: {
        description: 'Store passwords in environment variables or secure configuration',
        codeExample: 'password = "secret123"',
        fixExample: 'password = os.environ.get("PASSWORD")',
        effort: 'Low' as const,
        priority: 5
      }
    }
  ]
};

// Dependency vulnerability patterns - Updated November 2025
export const DEPENDENCY_VULNERABILITIES = [
  // Critical vulnerabilities
  {
    package: 'lodash',
    versions: ['< 4.17.21'],
    severity: 'High' as const,
    cveId: 'CVE-2021-23337',
    description: 'Command injection vulnerability in lodash',
    remediation: 'Update to lodash >= 4.17.21'
  },
  {
    package: 'axios',
    versions: ['< 1.6.0'],
    severity: 'High' as const,
    cveId: 'CVE-2023-45857',
    description: 'CSRF vulnerability due to cookie exposure in cross-site requests',
    remediation: 'Update to axios >= 1.6.0'
  },
  {
    package: 'axios',
    versions: ['< 1.7.4'],
    severity: 'High' as const,
    cveId: 'CVE-2024-39338',
    description: 'Server-Side Request Forgery (SSRF) vulnerability',
    remediation: 'Update to axios >= 1.7.4'
  },
  {
    package: 'express',
    versions: ['< 4.19.2'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-29041',
    description: 'Open redirect vulnerability in express',
    remediation: 'Update to express >= 4.19.2'
  },
  {
    package: 'ip',
    versions: ['< 2.0.1'],
    severity: 'High' as const,
    cveId: 'CVE-2024-29415',
    description: 'SSRF vulnerability in ip package',
    remediation: 'Update to ip >= 2.0.1'
  },
  {
    package: 'ws',
    versions: ['< 8.17.1'],
    severity: 'High' as const,
    cveId: 'CVE-2024-37890',
    description: 'Denial of Service vulnerability in WebSocket library',
    remediation: 'Update to ws >= 8.17.1'
  },
  {
    package: 'braces',
    versions: ['< 3.0.3'],
    severity: 'High' as const,
    cveId: 'CVE-2024-4068',
    description: 'Uncontrolled resource consumption (ReDoS)',
    remediation: 'Update to braces >= 3.0.3'
  },
  {
    package: 'follow-redirects',
    versions: ['< 1.15.6'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-28849',
    description: 'Exposure of sensitive information through redirect',
    remediation: 'Update to follow-redirects >= 1.15.6'
  },
  {
    package: 'tar',
    versions: ['< 6.2.1'],
    severity: 'High' as const,
    cveId: 'CVE-2024-28863',
    description: 'Denial of Service vulnerability in tar extraction',
    remediation: 'Update to tar >= 6.2.1'
  },
  {
    package: 'undici',
    versions: ['< 5.28.4'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-30260',
    description: 'Cookie leakage in cross-origin redirects',
    remediation: 'Update to undici >= 5.28.4 or >= 6.11.1'
  },
  {
    package: 'jsonwebtoken',
    versions: ['< 9.0.0'],
    severity: 'High' as const,
    cveId: 'CVE-2022-23529',
    description: 'Insecure implementation of key retrieval function',
    remediation: 'Update to jsonwebtoken >= 9.0.0'
  },
  {
    package: 'shell-quote',
    versions: ['< 1.8.1'],
    severity: 'Critical' as const,
    cveId: 'CVE-2024-4067',
    description: 'Command injection vulnerability',
    remediation: 'Update to shell-quote >= 1.8.1'
  },
  {
    package: 'cross-spawn',
    versions: ['< 7.0.5'],
    severity: 'High' as const,
    cveId: 'CVE-2024-21538',
    description: 'Regular Expression Denial of Service (ReDoS)',
    remediation: 'Update to cross-spawn >= 7.0.5'
  },
  {
    package: 'esbuild',
    versions: ['< 0.24.2'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-56334',
    description: 'Development server vulnerability',
    remediation: 'Update to esbuild >= 0.24.2'
  },
  {
    package: 'body-parser',
    versions: ['< 1.20.3'],
    severity: 'High' as const,
    cveId: 'CVE-2024-45590',
    description: 'Denial of Service through malformed URL encoding',
    remediation: 'Update to body-parser >= 1.20.3'
  },
  {
    package: 'path-to-regexp',
    versions: ['< 0.1.10'],
    severity: 'High' as const,
    cveId: 'CVE-2024-45296',
    description: 'ReDoS vulnerability in path matching',
    remediation: 'Update to path-to-regexp >= 0.1.10 or >= 8.0.0'
  },
  {
    package: 'send',
    versions: ['< 0.19.0'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-43799',
    description: 'Template injection vulnerability',
    remediation: 'Update to send >= 0.19.0'
  },
  {
    package: 'serve-static',
    versions: ['< 1.16.0'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-43800',
    description: 'Template injection through malicious filenames',
    remediation: 'Update to serve-static >= 1.16.0'
  },
  // Python packages
  {
    package: 'requests',
    versions: ['< 2.32.2'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-35195',
    description: 'Certificate verification bypass',
    remediation: 'Update to requests >= 2.32.2'
  },
  {
    package: 'jinja2',
    versions: ['< 3.1.4'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-34064',
    description: 'Cross-site scripting through template attributes',
    remediation: 'Update to jinja2 >= 3.1.4'
  },
  {
    package: 'werkzeug',
    versions: ['< 3.0.3'],
    severity: 'High' as const,
    cveId: 'CVE-2024-34069',
    description: 'Debugger RCE vulnerability',
    remediation: 'Update to werkzeug >= 3.0.3'
  },
  {
    package: 'urllib3',
    versions: ['< 2.2.2'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-37891',
    description: 'Proxy-Authorization header leak in cross-origin redirects',
    remediation: 'Update to urllib3 >= 2.2.2'
  },
  // Java/Maven packages  
  {
    package: 'org.springframework:spring-web',
    versions: ['< 6.1.6'],
    severity: 'High' as const,
    cveId: 'CVE-2024-22259',
    description: 'Open redirect vulnerability',
    remediation: 'Update to spring-web >= 6.1.6 or >= 6.0.19'
  },
  {
    package: 'org.apache.logging.log4j:log4j-core',
    versions: ['< 2.24.0'],
    severity: 'Medium' as const,
    cveId: 'CVE-2024-23672',
    description: 'Denial of Service in Log4j',
    remediation: 'Update to log4j-core >= 2.24.0'
  },
  {
    package: 'com.fasterxml.jackson.core:jackson-databind',
    versions: ['< 2.17.0'],
    severity: 'High' as const,
    cveId: 'CVE-2023-35116',
    description: 'Polymorphic deserialization vulnerability',
    remediation: 'Update to jackson-databind >= 2.17.0'
  }
];

// Calculate CVSS score based on issue characteristics
export function calculateCVSSScore(issue: Partial<SecurityIssue>): number {
  let baseScore = 0;
  
  // Impact scoring
  if (issue.severity === 'Critical') baseScore += 4;
  else if (issue.severity === 'High') baseScore += 3;
  else if (issue.severity === 'Medium') baseScore += 2;
  else baseScore += 1;
  
  // Exploitability factors
  if (issue.category?.includes('Injection')) baseScore += 3;
  if (issue.category?.includes('XSS')) baseScore += 2.5;
  if (issue.category?.includes('Hardcoded')) baseScore += 2;
  if (issue.category?.includes('Secret Detection')) baseScore += 2.5;
  
  // Confidence adjustment
  const confidenceMultiplier = (issue.confidence || 50) / 100;
  baseScore *= confidenceMultiplier;
  
  return Math.min(10, Math.max(0, baseScore));
}

// Generate security score based on issues
export function calculateSecurityScore(issues: SecurityIssue[]): number {
  if (issues.length === 0) {
    return 95; // Perfect score for no issues, but not 100 to indicate room for improvement
  }

  // Enhanced scoring algorithm with multiple factors
  const criticalIssues = issues.filter(issue => issue.severity === 'Critical').length;
  const highIssues = issues.filter(issue => issue.severity === 'High').length;
  const mediumIssues = issues.filter(issue => issue.severity === 'Medium').length;
  const lowIssues = issues.filter(issue => issue.severity === 'Low').length;

  // Weighted severity scoring with exponential penalties for critical issues
  const criticalWeight = criticalIssues * 20; // Increased penalty for critical
  const highWeight = highIssues * 12; // Increased penalty for high
  const mediumWeight = mediumIssues * 5; // Increased penalty for medium
  const lowWeight = lowIssues * 1;

  // Additional complexity factors
  const diversityPenalty = calculateIssueDiversityPenalty(issues);
  const concentrationPenalty = calculateIssueConcentrationPenalty(issues);
  const severityDistributionPenalty = calculateSeverityDistributionPenalty(issues);

  const totalPenalty = criticalWeight + highWeight + mediumWeight + lowWeight + 
                      diversityPenalty + concentrationPenalty + severityDistributionPenalty;

  // Base score calculation with logarithmic scaling
  let securityScore = 100;
  
  // Apply penalty with diminishing returns for very high issue counts
  if (totalPenalty > 0) {
    const penaltyImpact = Math.min(85, totalPenalty * 1.2); // Cap maximum penalty
    securityScore = Math.max(5, 100 - penaltyImpact); // Minimum score of 5
  }

  // Apply additional modifiers
  securityScore = applySecurityModifiers(securityScore, issues);

  return Math.round(securityScore);
}

function calculateIssueDiversityPenalty(issues: SecurityIssue[]): number {
  // Penalty for having many different types of security issues
  const uniqueCategories = new Set(issues.map(issue => issue.category || issue.type));
  const uniqueTypes = new Set(issues.map(issue => issue.type));
  
  // More diverse issues indicate broader security problems
  const categoryPenalty = uniqueCategories.size > 4 ? (uniqueCategories.size - 4) * 2 : 0;
  const typePenalty = uniqueTypes.size > 6 ? (uniqueTypes.size - 6) * 1.5 : 0;
  
  return categoryPenalty + typePenalty;
}

function calculateIssueConcentrationPenalty(issues: SecurityIssue[]): number {
  // Penalty for issues concentrated in few files vs distributed
  const fileIssueMap = new Map<string, number>();
  issues.forEach(issue => {
    const count = fileIssueMap.get(issue.filename) || 0;
    fileIssueMap.set(issue.filename, count + 1);
  });

  let concentrationPenalty = 0;
  fileIssueMap.forEach(issueCount => {
    if (issueCount > 5) {
      concentrationPenalty += (issueCount - 5) * 0.8; // Penalty for files with many issues
    }
  });

  return concentrationPenalty;
}

function calculateSeverityDistributionPenalty(issues: SecurityIssue[]): number {
  // Penalty for poor severity distribution (too many critical/high severity issues)
  const totalIssues = issues.length;
  if (totalIssues === 0) return 0;

  const criticalRatio = issues.filter(i => i.severity === 'Critical').length / totalIssues;
  const highRatio = issues.filter(i => i.severity === 'High').length / totalIssues;
  
  // Penalty increases exponentially with higher ratios of severe issues
  const criticalPenalty = criticalRatio > 0.2 ? Math.pow(criticalRatio, 2) * 15 : 0;
  const highPenalty = highRatio > 0.3 ? Math.pow(highRatio, 1.5) * 8 : 0;
  
  return criticalPenalty + highPenalty;
}

function applySecurityModifiers(baseScore: number, issues: SecurityIssue[]): number {
  let modifiedScore = baseScore;

  // Bonus for having only low-severity issues
  const hasOnlyLowSeverity = issues.every(issue => issue.severity === 'Low');
  if (hasOnlyLowSeverity && issues.length > 0 && issues.length < 5) {
    modifiedScore += 5;
  }

  // Penalty for having any critical issues
  const hasCriticalIssues = issues.some(issue => issue.severity === 'Critical');
  if (hasCriticalIssues) {
    modifiedScore -= 10;
  }

  // Bonus for good security practices (no injection vulnerabilities)
  const hasInjectionIssues = issues.some(issue => 
    issue.type.toLowerCase().includes('injection') || 
    issue.type.toLowerCase().includes('xss') ||
    issue.message.toLowerCase().includes('sql')
  );
  if (!hasInjectionIssues && issues.length > 0) {
    modifiedScore += 3;
  }

  // Additional penalty for authentication/authorization issues
  const hasAuthIssues = issues.some(issue =>
    issue.message.toLowerCase().includes('auth') ||
    issue.message.toLowerCase().includes('session') ||
    issue.message.toLowerCase().includes('password') ||
    issue.type.toLowerCase().includes('hardcoded')
  );
  if (hasAuthIssues) {
    modifiedScore -= 5;
  }

  // Additional penalty for secret detection issues
  const hasSecretIssues = issues.some(issue =>
    issue.category === 'Secret Detection' ||
    issue.type === 'Secret'
  );
  if (hasSecretIssues) {
    modifiedScore -= 8; // Higher penalty for exposed secrets
  }

  return Math.max(5, Math.min(100, modifiedScore));
}
