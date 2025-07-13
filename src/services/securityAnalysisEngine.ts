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
