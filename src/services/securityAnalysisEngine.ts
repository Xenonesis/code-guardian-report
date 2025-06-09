import { SecurityIssue } from '@/hooks/useAnalysis';

// OWASP Top 10 2021 Categories
export const OWASP_CATEGORIES = {
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

// Common Weakness Enumeration (CWE) mappings
export const CWE_MAPPINGS = {
  SQL_INJECTION: 'CWE-89',
  XSS: 'CWE-79',
  HARDCODED_CREDENTIALS: 'CWE-798',
  WEAK_CRYPTO: 'CWE-327',
  PATH_TRAVERSAL: 'CWE-22',
  COMMAND_INJECTION: 'CWE-78',
  INSECURE_RANDOM: 'CWE-338',
  BUFFER_OVERFLOW: 'CWE-120',
  NULL_POINTER: 'CWE-476',
  RACE_CONDITION: 'CWE-362'
};

// Security rule patterns for different languages
export const SECURITY_RULES = {
  javascript: [
    {
      pattern: /eval\s*\(/gi,
      severity: 'Critical' as const,
      type: 'Security',
      category: 'Code Injection',
      cweId: 'CWE-95',
      owaspCategory: OWASP_CATEGORIES.A03_INJECTION,
      message: 'Use of eval() function detected - potential code injection vulnerability',
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
    }
  ]
};

// Dependency vulnerability patterns
export const DEPENDENCY_VULNERABILITIES = [
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
    versions: ['< 0.21.2'],
    severity: 'Medium' as const,
    cveId: 'CVE-2021-3749',
    description: 'Regular expression denial of service (ReDoS)',
    remediation: 'Update to axios >= 0.21.2'
  },
  {
    package: 'express',
    versions: ['< 4.17.3'],
    severity: 'Medium' as const,
    cveId: 'CVE-2022-24999',
    description: 'Open redirect vulnerability',
    remediation: 'Update to express >= 4.17.3'
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
  
  // Confidence adjustment
  const confidenceMultiplier = (issue.confidence || 50) / 100;
  baseScore *= confidenceMultiplier;
  
  return Math.min(10, Math.max(0, baseScore));
}

// Generate security score based on issues
export function calculateSecurityScore(issues: SecurityIssue[]): number {
  if (issues.length === 0) return 100;
  
  const weights = { Critical: 10, High: 5, Medium: 2, Low: 1 };
  const totalWeight = issues.reduce((sum, issue) => {
    return sum + (weights[issue.severity] || 1);
  }, 0);
  
  // Base score starts at 100 and decreases based on weighted issues
  const maxPossibleWeight = issues.length * 10; // If all were critical
  const score = Math.max(0, 100 - (totalWeight / maxPossibleWeight) * 100);
  
  return Math.round(score);
}
