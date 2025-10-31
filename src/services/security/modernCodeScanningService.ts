/**
 * Modern Code Scanning Service
 * 
 * Integrates industry-standard code scanning tools and methodologies:
 * - SonarQube-style analysis (code smells, bugs, vulnerabilities, security hotspots)
 * - SAST (Static Application Security Testing) patterns
 * - Code quality metrics (cyclomatic complexity, cognitive complexity, maintainability)
 * - Security hotspot detection
 * - Code smell detection
 * - Technical debt calculation
 * - Dependency vulnerability scanning
 * 
 * Inspired by: SonarQube, Snyk, Checkmarx, Veracode, Fortify
 */

import { SecurityIssue } from '@/hooks/useAnalysis';

export type ScanSeverity = 'Blocker' | 'Critical' | 'Major' | 'Minor' | 'Info';
export type IssueType = 'Bug' | 'Vulnerability' | 'Code Smell' | 'Security Hotspot';
export type RuleType = 'Security' | 'Reliability' | 'Maintainability' | 'Performance' | 'Design';

export interface CodeQualityMetrics {
  // Complexity Metrics
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  
  // Size Metrics
  linesOfCode: number;
  commentLines: number;
  blankLines: number;
  
  // Quality Metrics
  maintainabilityIndex: number;
  technicalDebtRatio: number;
  codeSmells: number;
  bugs: number;
  vulnerabilities: number;
  securityHotspots: number;
  
  // Coverage (estimated)
  estimatedTestCoverage: number;
  
  // Duplication
  duplicatedBlocks: number;
  duplicatedLines: number;
}

export interface SonarRule {
  id: string;
  name: string;
  description: string;
  severity: ScanSeverity;
  type: IssueType;
  ruleType: RuleType;
  pattern: RegExp;
  languages: string[];
  tags: string[];
  remediationEffort: number; // in minutes
  debtRemediationTime: string;
  cwe?: string[];
  owaspTop10?: string[];
  sansTop25?: string[];
}

export interface DetectedIssue {
  rule: SonarRule;
  line: number;
  column: number;
  message: string;
  snippet: string;
  technicalDebt: number; // in minutes
  effort: string;
}

/**
 * Modern Code Scanning Engine
 * Implements SonarQube-style analysis
 */
export class ModernCodeScanningService {
  private rules: SonarRule[] = [];

  constructor() {
    this.initializeRules();
  }

  /**
   * Initialize comprehensive rule set
   */
  private initializeRules(): void {
    this.rules = [
      // ==================== SECURITY VULNERABILITIES ====================
      
      // SQL Injection
      {
        id: 'typescript:S2077',
        name: 'SQL queries should not be vulnerable to injection attacks',
        description: 'Formatted SQL queries can be difficult to maintain, debug and is a potential security risk. Use parameterized queries instead.',
        severity: 'Critical',
        type: 'Vulnerability',
        ruleType: 'Security',
        pattern: /(?:query|execute|exec|sql|prepare)\s*\([^)]*["'`][^"'`]*(?:\+|FROM|WHERE)[^)]*["'`]|["'`]\s*SELECT[^"'`]*\+|["'`]\s*\+[^+]*(?:WHERE|FROM)/gi,
        languages: ['javascript', 'typescript', 'python'],
        tags: ['sql', 'injection', 'owasp', 'sans-top25', 'cwe'],
        remediationEffort: 30,
        debtRemediationTime: '30min',
        cwe: ['CWE-89'],
        owaspTop10: ['A03:2021'],
        sansTop25: ['CWE-89']
      },
      
      // XSS Vulnerabilities
      {
        id: 'typescript:S5147',
        name: 'User-provided data should be sanitized before use in HTML',
        description: 'Setting HTML from user-controlled data without sanitization exposes your application to XSS attacks.',
        severity: 'Critical',
        type: 'Vulnerability',
        ruleType: 'Security',
        pattern: /(?:innerHTML|dangerouslySetInnerHTML|outerHTML)\s*[:=]/gi,
        languages: ['javascript', 'typescript'],
        tags: ['xss', 'injection', 'owasp', 'sans-top25', 'cwe'],
        remediationEffort: 20,
        debtRemediationTime: '20min',
        cwe: ['CWE-79'],
        owaspTop10: ['A03:2021'],
        sansTop25: ['CWE-79']
      },
      
      // Command Injection
      {
        id: 'typescript:S4721',
        name: 'OS commands should not be vulnerable to injection attacks',
        description: 'Using OS commands with user input can lead to arbitrary command execution.',
        severity: 'Critical',
        type: 'Vulnerability',
        ruleType: 'Security',
        pattern: /(?:exec|spawn|execSync|spawnSync|execFile)\s*\([^)]*(?:\+|`\$\{)/gi,
        languages: ['javascript', 'typescript'],
        tags: ['command-injection', 'injection', 'owasp', 'sans-top25'],
        remediationEffort: 45,
        debtRemediationTime: '45min',
        cwe: ['CWE-78'],
        owaspTop10: ['A03:2021'],
        sansTop25: ['CWE-78']
      },
      
      // Path Traversal
      {
        id: 'typescript:S5145',
        name: 'File access should be restricted to intended directories',
        description: 'User-controlled file paths can lead to unauthorized file access.',
        severity: 'Critical',
        type: 'Vulnerability',
        ruleType: 'Security',
        pattern: /(?:readFile|writeFile|readFileSync|writeFileSync|createReadStream)\s*\([^)]*(?:\+|`\$\{)/gi,
        languages: ['javascript', 'typescript'],
        tags: ['path-traversal', 'owasp', 'sans-top25'],
        remediationEffort: 30,
        debtRemediationTime: '30min',
        cwe: ['CWE-22'],
        owaspTop10: ['A01:2021']
      },
      
      // Weak Cryptography
      {
        id: 'typescript:S4426',
        name: 'Cryptographic keys should be robust',
        description: 'Weak cryptographic algorithms should not be used.',
        severity: 'Critical',
        type: 'Vulnerability',
        ruleType: 'Security',
        pattern: /createHash\s*\(\s*["'](?:md5|sha1)["']\s*\)/gi,
        languages: ['javascript', 'typescript'],
        tags: ['cryptography', 'weak-crypto', 'owasp'],
        remediationEffort: 15,
        debtRemediationTime: '15min',
        cwe: ['CWE-327'],
        owaspTop10: ['A02:2021']
      },
      
      // Insecure Random
      {
        id: 'typescript:S2245',
        name: 'Pseudorandom number generators should not be used for security-sensitive applications',
        description: 'Math.random() is not cryptographically secure. Use crypto.randomBytes() instead.',
        severity: 'Critical',
        type: 'Security Hotspot',
        ruleType: 'Security',
        pattern: /Math\.random\s*\(\s*\)/gi,
        languages: ['javascript', 'typescript'],
        tags: ['random', 'cryptography', 'owasp'],
        remediationEffort: 10,
        debtRemediationTime: '10min',
        cwe: ['CWE-338'],
        owaspTop10: ['A02:2021']
      },
      
      // Hardcoded Secrets
      {
        id: 'typescript:S6290',
        name: 'Secrets should not be hard-coded',
        description: 'Hard-coded secrets can be extracted from source code and used maliciously.',
        severity: 'Blocker',
        type: 'Vulnerability',
        ruleType: 'Security',
        pattern: /(?:password|secret|api[_-]?key|token|private[_-]?key)\s*[:=]\s*["'][^"']{8,}["']/gi,
        languages: ['javascript', 'typescript', 'python', 'java'],
        tags: ['secrets', 'credentials', 'owasp'],
        remediationEffort: 20,
        debtRemediationTime: '20min',
        cwe: ['CWE-798'],
        owaspTop10: ['A07:2021']
      },
      
      // ==================== SECURITY HOTSPOTS ====================
      
      // Eval Usage
      {
        id: 'typescript:S1523',
        name: 'Dynamically executing code is security-sensitive',
        description: 'Review this code carefully as it executes dynamic code which could be exploited.',
        severity: 'Major',
        type: 'Security Hotspot',
        ruleType: 'Security',
        pattern: /\b(?:eval|Function)\s*\(/gi,
        languages: ['javascript', 'typescript'],
        tags: ['eval', 'code-injection', 'sans-top25'],
        remediationEffort: 30,
        debtRemediationTime: '30min',
        cwe: ['CWE-95'],
        owaspTop10: ['A03:2021']
      },
      
      // ==================== BUGS (RELIABILITY) ====================
      
      // Null Pointer Dereference
      {
        id: 'typescript:S2259',
        name: 'Null pointers should not be dereferenced',
        description: 'Dereferencing a value that could be null will result in a runtime error.',
        severity: 'Major',
        type: 'Bug',
        ruleType: 'Reliability',
        pattern: /(?:const|let|var)\s+\w+\s*=\s*(?:null|undefined);\s*\w+\./gm,
        languages: ['javascript', 'typescript'],
        tags: ['null-pointer', 'bug', 'reliability'],
        remediationEffort: 15,
        debtRemediationTime: '15min',
        cwe: ['CWE-476']
      },
      
      // Promise Without Catch
      {
        id: 'typescript:S6544',
        name: 'Promises should not be misused',
        description: 'Promises without proper error handling can cause silent failures.',
        severity: 'Major',
        type: 'Bug',
        ruleType: 'Reliability',
        pattern: /\.then\s*\([^)]*\)\s*(?!\.catch)/gi,
        languages: ['javascript', 'typescript'],
        tags: ['promise', 'async', 'error-handling'],
        remediationEffort: 10,
        debtRemediationTime: '10min'
      },
      
      // ==================== CODE SMELLS (MAINTAINABILITY) ====================
      
      // Cognitive Complexity
      {
        id: 'typescript:S3776',
        name: 'Cognitive Complexity should not be too high',
        description: 'Functions with high cognitive complexity are hard to understand and maintain.',
        severity: 'Major',
        type: 'Code Smell',
        ruleType: 'Maintainability',
        pattern: /function\s+\w+\s*\([^)]*\)\s*\{(?:[^}]*(?:if|else|while|for|switch|catch|&&|\|\|)){5,}/gi,
        languages: ['javascript', 'typescript'],
        tags: ['complexity', 'brain-overload'],
        remediationEffort: 60,
        debtRemediationTime: '1h'
      },
      
      // Function Too Long
      {
        id: 'typescript:S138',
        name: 'Functions should not have too many lines',
        description: 'Long functions are difficult to understand, test, and maintain.',
        severity: 'Major',
        type: 'Code Smell',
        ruleType: 'Maintainability',
        pattern: /function\s+\w+[^{]*\{[\s\S]{1000,}?\}/gm,
        languages: ['javascript', 'typescript'],
        tags: ['design', 'brain-overload'],
        remediationEffort: 90,
        debtRemediationTime: '1h30min'
      },
      
      // Too Many Parameters
      {
        id: 'typescript:S107',
        name: 'Functions should not have too many parameters',
        description: 'Functions with too many parameters are hard to use and understand.',
        severity: 'Major',
        type: 'Code Smell',
        ruleType: 'Maintainability',
        pattern: /function\s+\w+\s*\((?:[^,)]+,\s*){7,}[^)]*\)/gi,
        languages: ['javascript', 'typescript'],
        tags: ['design', 'confusing'],
        remediationEffort: 30,
        debtRemediationTime: '30min'
      },
      
      // Console.log in Production
      {
        id: 'typescript:S2228',
        name: 'Console logging should not be used',
        description: 'Console statements should be removed before pushing to production.',
        severity: 'Minor',
        type: 'Code Smell',
        ruleType: 'Maintainability',
        pattern: /console\.(log|debug|info|warn|error)/gi,
        languages: ['javascript', 'typescript'],
        tags: ['bad-practice', 'production'],
        remediationEffort: 2,
        debtRemediationTime: '2min'
      },
      
      // Commented Out Code
      {
        id: 'typescript:S125',
        name: 'Sections of code should not be commented out',
        description: 'Commented-out code makes the codebase harder to understand.',
        severity: 'Minor',
        type: 'Code Smell',
        ruleType: 'Maintainability',
        pattern: /\/\/\s*(?:const|let|var|function|class|if|for|while)\s+\w+/gi,
        languages: ['javascript', 'typescript'],
        tags: ['unused', 'confusing'],
        remediationEffort: 5,
        debtRemediationTime: '5min'
      },
      
      // Unused Variables
      {
        id: 'typescript:S1481',
        name: 'Unused local variables should be removed',
        description: 'Unused variables consume memory and make code harder to read.',
        severity: 'Minor',
        type: 'Code Smell',
        ruleType: 'Maintainability',
        pattern: /(?:const|let|var)\s+(\w+)\s*=(?:[^;]+);(?:(?!(?:\1)).)*$/gm,
        languages: ['javascript', 'typescript'],
        tags: ['unused', 'dead-code'],
        remediationEffort: 5,
        debtRemediationTime: '5min'
      },
      
      // Magic Numbers
      {
        id: 'typescript:S109',
        name: 'Magic numbers should not be used',
        description: 'Magic numbers make code less readable. Use named constants instead.',
        severity: 'Minor',
        type: 'Code Smell',
        ruleType: 'Maintainability',
        pattern: /(?:=|>|<|>=|<=|\+|-|\*|\/)\s*(?!0|1\b)\d{3,}/g,
        languages: ['javascript', 'typescript'],
        tags: ['design', 'confusing'],
        remediationEffort: 5,
        debtRemediationTime: '5min'
      },
      
      // ==================== PERFORMANCE ====================
      
      // Regex in Loop
      {
        id: 'typescript:S6353',
        name: 'Regular expressions should not be created in loops',
        description: 'Creating regex patterns inside loops is inefficient.',
        severity: 'Major',
        type: 'Code Smell',
        ruleType: 'Performance',
        pattern: /(?:for|while)\s*\([^)]*\)\s*\{[^}]*new\s+RegExp\s*\(/gi,
        languages: ['javascript', 'typescript'],
        tags: ['performance', 'regex'],
        remediationEffort: 10,
        debtRemediationTime: '10min'
      },
      
      // Inefficient Array Methods
      {
        id: 'typescript:S6582',
        name: 'Array methods should be used efficiently',
        description: 'Using multiple array iterations when one would suffice is inefficient.',
        severity: 'Minor',
        type: 'Code Smell',
        ruleType: 'Performance',
        pattern: /\.filter\([^)]+\)\.map\([^)]+\)/gi,
        languages: ['javascript', 'typescript'],
        tags: ['performance', 'optimization'],
        remediationEffort: 15,
        debtRemediationTime: '15min'
      }
    ];
  }

  /**
   * Analyze code with modern scanning techniques
   */
  public analyzeCode(
    content: string,
    filename: string,
    language: string = 'typescript'
  ): {
    issues: DetectedIssue[];
    metrics: CodeQualityMetrics;
    technicalDebt: number;
    qualityGate: {
      passed: boolean;
      conditions: Array<{ metric: string; status: 'OK' | 'ERROR'; value: number; threshold: number }>;
    };
  } {
    const issues = this.detectIssues(content, filename, language);
    const metrics = this.calculateMetrics(content, issues);
    const technicalDebt = this.calculateTechnicalDebt(issues);
    const qualityGate = this.evaluateQualityGate(metrics, issues);

    return {
      issues,
      metrics,
      technicalDebt,
      qualityGate
    };
  }

  /**
   * Detect issues using all rules
   */
  private detectIssues(content: string, filename: string, language: string): DetectedIssue[] {
    const issues: DetectedIssue[] = [];
    const lines = content.split('\n');

    // Apply each rule
    for (const rule of this.rules) {
      // Check if rule applies to this language
      if (!rule.languages.includes(language)) {
        continue;
      }

      // Find matches
      let match: RegExpExecArray | null;
      const regex = new RegExp(rule.pattern.source, rule.pattern.flags);
      
      while ((match = regex.exec(content)) !== null) {
        const matchIndex = match.index;
        const lineNumber = content.substring(0, matchIndex).split('\n').length;
        const column = matchIndex - content.lastIndexOf('\n', matchIndex - 1);

        issues.push({
          rule,
          line: lineNumber,
          column: Math.max(1, column),
          message: rule.description,
          snippet: this.extractSnippet(lines, lineNumber),
          technicalDebt: rule.remediationEffort,
          effort: rule.debtRemediationTime
        });
      }
    }

    return issues;
  }

  /**
   * Calculate comprehensive code quality metrics
   */
  private calculateMetrics(content: string, issues: DetectedIssue[]): CodeQualityMetrics {
    const lines = content.split('\n');
    
    // Line metrics
    const linesOfCode = lines.filter(line => line.trim() && !line.trim().startsWith('//')).length;
    const commentLines = lines.filter(line => line.trim().startsWith('//')).length;
    const blankLines = lines.filter(line => !line.trim()).length;

    // Complexity metrics
    const cyclomaticComplexity = this.calculateCyclomaticComplexity(content);
    const cognitiveComplexity = this.calculateCognitiveComplexity(content);

    // Issue counts by type
    const bugs = issues.filter(i => i.rule.type === 'Bug').length;
    const vulnerabilities = issues.filter(i => i.rule.type === 'Vulnerability').length;
    const codeSmells = issues.filter(i => i.rule.type === 'Code Smell').length;
    const securityHotspots = issues.filter(i => i.rule.type === 'Security Hotspot').length;

    // Duplication analysis (simplified)
    const { duplicatedBlocks, duplicatedLines } = this.analyzeDuplication(lines);

    // Technical debt
    const technicalDebtMinutes = issues.reduce((sum, issue) => sum + issue.technicalDebt, 0);
    const technicalDebtRatio = (technicalDebtMinutes / (linesOfCode * 0.06)) * 100; // 0.06 = 3.6 min per 60 LOC

    // Maintainability Index (0-100)
    const maintainabilityIndex = this.calculateMaintainabilityIndex(
      linesOfCode,
      cyclomaticComplexity,
      commentLines,
      codeSmells
    );

    // Estimated test coverage (heuristic)
    const estimatedTestCoverage = this.estimateTestCoverage(content);

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      linesOfCode,
      commentLines,
      blankLines,
      maintainabilityIndex,
      technicalDebtRatio,
      codeSmells,
      bugs,
      vulnerabilities,
      securityHotspots,
      estimatedTestCoverage,
      duplicatedBlocks,
      duplicatedLines
    };
  }

  /**
   * Calculate Cyclomatic Complexity (McCabe)
   */
  private calculateCyclomaticComplexity(content: string): number {
    const decisionPoints = [
      /\bif\s*\(/g,
      /\belse\s+if\s*\(/g,
      /\bwhile\s*\(/g,
      /\bfor\s*\(/g,
      /\bcase\s+/g,
      /\bcatch\s*\(/g,
      /&&/g,
      /\|\|/g,
      /\?/g // ternary operator
    ];

    let complexity = 1; // Base complexity
    for (const pattern of decisionPoints) {
      const matches = content.match(pattern);
      complexity += matches ? matches.length : 0;
    }

    return complexity;
  }

  /**
   * Calculate Cognitive Complexity
   * More nuanced than cyclomatic - considers nesting depth
   */
  private calculateCognitiveComplexity(content: string): number {
    let complexity = 0;
    let nestingLevel = 0;
    const lines = content.split('\n');

    for (const line of lines) {
      // Track nesting
      if (line.includes('{')) nestingLevel++;
      if (line.includes('}')) nestingLevel = Math.max(0, nestingLevel - 1);

      // Add complexity for control structures with nesting multiplier
      if (/\b(?:if|else|while|for|case|catch)\b/.test(line)) {
        complexity += 1 + nestingLevel;
      }

      // Add complexity for logical operators
      const logicalOps = (line.match(/&&|\|\|/g) || []).length;
      complexity += logicalOps;
    }

    return complexity;
  }

  /**
   * Calculate Maintainability Index (Microsoft variant)
   * MI = MAX(0, (171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)) * 100 / 171)
   */
  private calculateMaintainabilityIndex(
    loc: number,
    complexity: number,
    comments: number,
    codeSmells: number
  ): number {
    if (loc === 0) return 100;

    // Simplified MI calculation
    const halsteadVolume = Math.log(loc + 1) * 10; // Simplified Halstead volume
    const cyclomaticComplexityFactor = complexity;
    const commentRatio = comments / (loc + comments);

    let mi = Math.max(
      0,
      (171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexityFactor - 16.2 * Math.log(loc)) * 100 / 171
    );

    // Adjust for comment ratio (bonus for well-commented code)
    mi += commentRatio * 5;

    // Penalty for code smells
    mi -= Math.min(30, codeSmells * 2);

    return Math.max(0, Math.min(100, mi));
  }

  /**
   * Analyze code duplication
   */
  private analyzeDuplication(lines: string[]): { duplicatedBlocks: number; duplicatedLines: number } {
    const blockSize = 6; // Minimum block size to consider
    const blocks = new Map<string, number>();
    let duplicatedBlocks = 0;
    let duplicatedLines = 0;

    // Create sliding window of lines
    for (let i = 0; i <= lines.length - blockSize; i++) {
      const block = lines.slice(i, i + blockSize)
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//'))
        .join('\n');

      if (block) {
        const count = blocks.get(block) || 0;
        blocks.set(block, count + 1);
        
        if (count === 1) {
          duplicatedBlocks++;
          duplicatedLines += blockSize;
        } else if (count > 1) {
          duplicatedLines += blockSize;
        }
      }
    }

    return { duplicatedBlocks, duplicatedLines };
  }

  /**
   * Estimate test coverage based on code patterns
   */
  private estimateTestCoverage(content: string): number {
    // Look for test patterns
    const hasTests = /(?:describe|it|test|expect)\s*\(/gi.test(content);
    const testCount = (content.match(/(?:it|test)\s*\(/gi) || []).length;
    const functionCount = (content.match(/function\s+\w+/gi) || []).length;

    if (!hasTests) return 0;
    if (functionCount === 0) return 0;

    // Rough estimate: test count / function count * 100
    return Math.min(100, Math.round((testCount / functionCount) * 100));
  }

  /**
   * Calculate total technical debt in minutes
   */
  private calculateTechnicalDebt(issues: DetectedIssue[]): number {
    return issues.reduce((total, issue) => total + issue.technicalDebt, 0);
  }

  /**
   * Evaluate quality gate (SonarQube-style)
   */
  private evaluateQualityGate(
    metrics: CodeQualityMetrics,
    _issues: DetectedIssue[]
  ): {
    passed: boolean;
    conditions: Array<{ metric: string; status: 'OK' | 'ERROR'; value: number; threshold: number }>;
  } {
    const conditions: Array<{ metric: string; status: 'OK' | 'ERROR'; value: number; threshold: number }> = [
      {
        metric: 'New Vulnerabilities',
        status: (metrics.vulnerabilities === 0 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
        value: metrics.vulnerabilities,
        threshold: 0
      },
      {
        metric: 'New Bugs',
        status: (metrics.bugs <= 5 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
        value: metrics.bugs,
        threshold: 5
      },
      {
        metric: 'Maintainability Index',
        status: (metrics.maintainabilityIndex >= 65 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
        value: metrics.maintainabilityIndex,
        threshold: 65
      },
      {
        metric: 'Technical Debt Ratio',
        status: (metrics.technicalDebtRatio <= 5 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
        value: Number(metrics.technicalDebtRatio.toFixed(1)),
        threshold: 5
      },
      {
        metric: 'Code Smells',
        status: (metrics.codeSmells <= 10 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
        value: metrics.codeSmells,
        threshold: 10
      },
      {
        metric: 'Duplicated Lines Density',
        status: ((metrics.duplicatedLines / metrics.linesOfCode * 100) <= 3 ? 'OK' : 'ERROR') as 'OK' | 'ERROR',
        value: Number(((metrics.duplicatedLines / metrics.linesOfCode) * 100).toFixed(1)),
        threshold: 3
      }
    ];

    const passed = conditions.every(c => c.status === 'OK');

    return { passed, conditions };
  }

  /**
   * Extract code snippet around issue
   */
  private extractSnippet(lines: string[], lineNumber: number): string {
    const start = Math.max(0, lineNumber - 2);
    const end = Math.min(lines.length, lineNumber + 2);
    
    return lines.slice(start, end)
      .map((line, idx) => {
        const num = start + idx + 1;
        const marker = num === lineNumber ? '→' : ' ';
        return `${marker} ${num.toString().padStart(4)} | ${line}`;
      })
      .join('\n');
  }

  /**
   * Convert detected issues to SecurityIssue format
   */
  public convertToSecurityIssues(
    detectedIssues: DetectedIssue[],
    filename: string
  ): SecurityIssue[] {
    return detectedIssues.map(issue => {
      const sonarSeverityToStandard = (severity: ScanSeverity): 'Critical' | 'High' | 'Medium' | 'Low' => {
        switch (severity) {
          case 'Blocker':
          case 'Critical':
            return 'Critical';
          case 'Major':
            return 'High';
          case 'Minor':
            return 'Medium';
          case 'Info':
            return 'Low';
          default:
            return 'Medium';
        }
      };

      const severity = sonarSeverityToStandard(issue.rule.severity);

      return {
        id: `sonar_${issue.rule.id}_${issue.line}`,
        line: issue.line,
        column: issue.column,
        tool: 'SonarQube Analysis',
        type: issue.rule.type,
        category: issue.rule.ruleType,
        message: issue.message,
        severity,
        confidence: this.calculateConfidence(issue.rule),
        cvssScore: this.calculateCVSS(issue.rule),
        cweId: issue.rule.cwe?.[0],
        owaspCategory: issue.rule.owaspTop10?.[0],
        recommendation: this.generateRecommendation(issue.rule),
        remediation: {
          description: issue.rule.description,
          effort: this.mapEffort(issue.rule.remediationEffort),
          priority: this.calculatePriority(issue.rule.severity)
        },
        filename,
        codeSnippet: issue.snippet,
        riskRating: severity,
        impact: this.getImpact(issue.rule),
        likelihood: this.getLikelihood(issue.rule),
        references: this.generateReferences(issue.rule),
        tags: issue.rule.tags
      };
    });
  }

  private calculateConfidence(rule: SonarRule): number {
    // Higher confidence for well-established rules
    if (rule.type === 'Vulnerability') return 95;
    if (rule.type === 'Bug') return 90;
    if (rule.type === 'Security Hotspot') return 80;
    return 75;
  }

  private calculateCVSS(rule: SonarRule): number {
    switch (rule.severity) {
      case 'Blocker': return 9.8;
      case 'Critical': return 9;
      case 'Major': return 7;
      case 'Minor': return 4;
      case 'Info': return 2;
      default: return 5;
    }
  }

  private generateRecommendation(rule: SonarRule): string {
    return `${rule.description} (Rule: ${rule.id})`;
  }

  private mapEffort(minutes: number): 'Low' | 'Medium' | 'High' {
    if (minutes <= 15) return 'Low';
    if (minutes <= 45) return 'Medium';
    return 'High';
  }

  private calculatePriority(severity: ScanSeverity): number {
    switch (severity) {
      case 'Blocker': return 5;
      case 'Critical': return 5;
      case 'Major': return 4;
      case 'Minor': return 3;
      case 'Info': return 2;
      default: return 3;
    }
  }

  private getImpact(rule: SonarRule): string {
    const impacts = {
      'Blocker': 'Critical impact on application security and stability',
      'Critical': 'High impact on application security or reliability',
      'Major': 'Moderate impact on code quality and maintainability',
      'Minor': 'Minor impact on code quality',
      'Info': 'Informational - no immediate impact'
    };
    return impacts[rule.severity];
  }

  private getLikelihood(rule: SonarRule): string {
    if (rule.type === 'Vulnerability') return 'High';
    if (rule.type === 'Bug') return 'Medium';
    if (rule.type === 'Security Hotspot') return 'Medium';
    return 'Low';
  }

  private generateReferences(rule: SonarRule): string[] {
    const refs: string[] = [];
    
    if (rule.cwe) {
      for (const cwe of rule.cwe) {
        refs.push(`https://cwe.mitre.org/data/definitions/${cwe.replace('CWE-', '')}.html`);
      }
    }
    
    if (rule.owaspTop10) {
      refs.push('https://owasp.org/Top10/');
    }
    
    refs.push(`https://rules.sonarsource.com/typescript/RSPEC-${rule.id.split(':')[1]}`);
    
    return refs;
  }

  /**
   * Get comprehensive analysis summary
   */
  public getAnalysisSummary(
    metrics: CodeQualityMetrics,
    technicalDebt: number,
    qualityGate: { passed: boolean; conditions: Array<{ metric: string; status: 'OK' | 'ERROR'; value: number; threshold: number }> }
  ): string {
    const rating = this.calculateRating(metrics.maintainabilityIndex);
    const debtDays = (technicalDebt / (8 * 60)).toFixed(1); // Convert to days

    return `
Quality Gate: ${qualityGate.passed ? '✓ PASSED' : '✗ FAILED'}

Reliability Rating: ${this.getReliabilityRating(metrics.bugs)}
Security Rating: ${this.getSecurityRating(metrics.vulnerabilities)}
Maintainability Rating: ${rating}

Technical Debt: ${debtDays} days
Debt Ratio: ${metrics.technicalDebtRatio.toFixed(1)}%

Issues:
- ${metrics.vulnerabilities} Vulnerabilities
- ${metrics.bugs} Bugs  
- ${metrics.codeSmells} Code Smells
- ${metrics.securityHotspots} Security Hotspots

Metrics:
- Cyclomatic Complexity: ${metrics.cyclomaticComplexity}
- Cognitive Complexity: ${metrics.cognitiveComplexity}
- Lines of Code: ${metrics.linesOfCode}
- Duplicated Lines: ${metrics.duplicatedLines} (${((metrics.duplicatedLines / metrics.linesOfCode) * 100).toFixed(1)}%)
`.trim();
  }

  private calculateRating(maintainabilityIndex: number): string {
    if (maintainabilityIndex >= 80) return 'A (Excellent)';
    if (maintainabilityIndex >= 65) return 'B (Good)';
    if (maintainabilityIndex >= 50) return 'C (Fair)';
    if (maintainabilityIndex >= 35) return 'D (Poor)';
    return 'E (Very Poor)';
  }

  private getReliabilityRating(bugs: number): string {
    if (bugs === 0) return 'A';
    if (bugs <= 3) return 'B';
    if (bugs <= 7) return 'C';
    if (bugs <= 15) return 'D';
    return 'E';
  }

  private getSecurityRating(vulnerabilities: number): string {
    if (vulnerabilities === 0) return 'A';
    if (vulnerabilities <= 2) return 'B';
    if (vulnerabilities <= 5) return 'C';
    if (vulnerabilities <= 10) return 'D';
    return 'E';
  }
}

// Export singleton instance
export const modernCodeScanningService = new ModernCodeScanningService();
