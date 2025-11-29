/**
 * Enhanced File Analysis Service
 * Provides deep file-level security analysis including:
 * - Binary file analysis
 * - Metadata extraction
 * - File signature verification
 * - Embedded content detection
 * - Advanced pattern matching
 * - Multi-language support (JavaScript, TypeScript, Python, Java, C++, Go, Rust, PHP, C#)
 */

import { multiLanguageSecurityAnalyzer } from '../analysis/MultiLanguageSecurityAnalyzer';

export interface FileMetadata {
  filename: string;
  size: number;
  mimeType: string;
  encoding?: string;
  created?: Date;
  modified?: Date;
  hash: {
    md5: string;
    sha1: string;
    sha256: string;
  };
  fileSignature: {
    detected: string;
    expected: string;
    matches: boolean;
  };
}

export interface EmbeddedContent {
  type: 'script' | 'macro' | 'executable' | 'archive' | 'image' | 'unknown';
  location: string;
  size: number;
  description: string;
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  content?: string;
}

export interface DataFlowAnalysis {
  inputs: Array<{
    source: string;
    type: 'user_input' | 'file_input' | 'network_input' | 'environment';
    sanitized: boolean;
    line: number;
  }>;
  outputs: Array<{
    destination: string;
    type: 'file_output' | 'network_output' | 'database' | 'log';
    line: number;
  }>;
  sensitiveDataFlow: Array<{
    source: string;
    destination: string;
    dataType: 'credentials' | 'pii' | 'financial' | 'health' | 'other';
    encrypted: boolean;
    path: string[];
  }>;
}

export interface CodeComplexity {
  cyclomaticComplexity: number;
  cognitiveComplexity: number;
  halsteadMetrics: {
    vocabulary: number;
    length: number;
    difficulty: number;
    effort: number;
    bugs: number;
  };
  maintainabilityIndex: number;
  technicalDebt: {
    minutes: number;
    severity: 'Low' | 'Medium' | 'High';
    issues: string[];
  };
}

export interface APISecurityAnalysis {
  endpoints: Array<{
    method: string;
    path: string;
    authenticated: boolean;
    inputValidation: boolean;
    outputSanitization: boolean;
    rateLimit: boolean;
    cors: boolean;
    line: number;
  }>;
  authenticationMechanisms: string[];
  authorizationChecks: Array<{
    type: 'role' | 'permission' | 'attribute';
    location: string;
    secure: boolean;
  }>;
  dataValidation: {
    inputValidation: boolean;
    outputEncoding: boolean;
    sqlInjectionProtection: boolean;
    xssProtection: boolean;
  };
}

export interface EnhancedFileAnalysisResult {
  metadata: FileMetadata;
  embeddedContent: EmbeddedContent[];
  dataFlow: DataFlowAnalysis;
  complexity: CodeComplexity;
  apiSecurity?: APISecurityAnalysis;
  securityFindings: Array<{
    type: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    description: string;
    line?: number;
    column?: number;
    evidence: string;
    recommendation: string;
    cwe?: string;
    owasp?: string;
  }>;
  qualityIssues: Array<{
    type: 'code_smell' | 'bug' | 'vulnerability' | 'maintainability';
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    description: string;
    line: number;
    suggestion: string;
  }>;
  dependencies: Array<{
    name: string;
    version?: string;
    source: 'import' | 'require' | 'package_manager';
    line: number;
    vulnerabilities: number;
    outdated: boolean;
    license?: string;
  }>;
  performanceIssues: Array<{
    type: 'memory_leak' | 'inefficient_algorithm' | 'blocking_operation' | 'resource_intensive';
    description: string;
    line: number;
    impact: 'Low' | 'Medium' | 'High';
    suggestion: string;
  }>;
  complianceChecks: Array<{
    standard: 'PCI-DSS' | 'HIPAA' | 'SOX' | 'GDPR' | 'SOC2';
    requirement: string;
    compliant: boolean;
    findings: string[];
    remediation: string;
  }>;
}

export class EnhancedFileAnalysisService {
  private readonly fileSignatures: Record<string, string> = {
    'pdf': '25504446',        // %PDF
    'zip': '504b0304',        // PK..
    'exe': '4d5a',            // MZ
    'png': '89504e47',        // PNG
    'jpg': 'ffd8ffe0',        // JPEG
    'gif': '47494638',        // GIF8
    'mp4': '66747970',        // ftyp
    'doc': 'd0cf11e0',        // Microsoft Office
    'jar': '504b0304',        // JAR (ZIP format)
  };

  private readonly sensitivePatterns = [
    { pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, type: 'credit_card' },
    { pattern: /\b\d{3}-\d{2}-\d{4}\b/g, type: 'ssn' },
    { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, type: 'email' },
    { pattern: /\b(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b/g, type: 'phone' },
    { pattern: /\b[A-Z]{2}\d{2}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b/g, type: 'iban' },
  ];

  private readonly apiPatterns = [
    { pattern: /@app\.route\(['"`]([^'"`]+)['"`].*methods\s*=\s*\[['"`]([^'"`]+)['"`]\]/g, framework: 'flask' },
    { pattern: /app\.(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g, framework: 'express' },
    { pattern: /@(Get|Post|Put|Delete|Patch)Mapping\(['"`]([^'"`]+)['"`]\)/g, framework: 'spring' },
    { pattern: /Route\:\:(get|post|put|delete|patch)\(['"`]([^'"`]+)['"`]/g, framework: 'laravel' },
  ];

  /**
   * Perform comprehensive file analysis
   */
  public async analyzeFile(file: File, content: string): Promise<EnhancedFileAnalysisResult> {
    const metadata = await this.extractMetadata(file, content);
    const embeddedContent = await this.detectEmbeddedContent(content);
    const dataFlow = this.analyzeDataFlow(content);
    const complexity = this.calculateComplexity(content);
    const apiSecurity = this.analyzeAPISecurity(content);
    const securityFindings = this.performSecurityAnalysis(content, file.name);
    const qualityIssues = this.analyzeCodeQuality(content);
    const dependencies = this.analyzeDependencies(content);
    const performanceIssues = this.analyzePerformance(content);
    const complianceChecks = this.checkCompliance(content);

    return {
      metadata,
      embeddedContent,
      dataFlow,
      complexity,
      apiSecurity,
      securityFindings,
      qualityIssues,
      dependencies,
      performanceIssues,
      complianceChecks
    };
  }

  /**
   * Extract comprehensive file metadata
   */
  private async extractMetadata(file: File, content: string): Promise<FileMetadata> {
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Calculate hashes
    const md5 = await this.calculateHash(buffer, 'MD5');
    const sha1 = await this.calculateHash(buffer, 'SHA-1');
    const sha256 = await this.calculateHash(buffer, 'SHA-256');

    // Detect file signature
    const signature = this.detectFileSignature(uint8Array);
    const expectedSignature = this.getExpectedSignature(file.name);

    return {
      filename: file.name,
      size: file.size,
      mimeType: file.type || 'application/octet-stream',
      encoding: this.detectEncoding(content),
      created: new Date(file.lastModified),
      modified: new Date(file.lastModified),
      hash: { md5, sha1, sha256 },
      fileSignature: {
        detected: signature,
        expected: expectedSignature,
        matches: signature === expectedSignature
      }
    };
  }

  /**
   * Detect embedded content in files
   */
  private async detectEmbeddedContent(content: string): Promise<EmbeddedContent[]> {
    const embedded: EmbeddedContent[] = [];

    // Detect base64 encoded content
    const base64Pattern = /data:([^;]+);base64,([A-Za-z0-9+/]+=*)/g;
    let match;
    while ((match = base64Pattern.exec(content)) !== null) {
      embedded.push({
        type: 'script',
        location: `Base64 embedded at position ${match.index}`,
        size: match[2].length,
        description: `Base64 encoded ${match[1]} content`,
        riskLevel: 'Medium',
        content: match[2].substring(0, 100) + '...'
      });
    }

    // Detect JavaScript in HTML/other files
    const scriptPattern = /<script[^>]*>([\s\S]*?)<\/script>/gi;
    while ((match = scriptPattern.exec(content)) !== null) {
      embedded.push({
        type: 'script',
        location: `Script tag at position ${match.index}`,
        size: match[1].length,
        description: 'Embedded JavaScript code',
        riskLevel: this.assessScriptRisk(match[1]),
        content: match[1].substring(0, 200) + '...'
      });
    }

    // Detect Office macros (simplified)
    if (content.includes('Sub ') && content.includes('End Sub')) {
      embedded.push({
        type: 'macro',
        location: 'VBA Macro detected',
        size: 0,
        description: 'VBA macro code found',
        riskLevel: 'High'
      });
    }

    return embedded;
  }

  /**
   * Analyze data flow through the code
   */
  private analyzeDataFlow(content: string): DataFlowAnalysis {
    const inputs: DataFlowAnalysis['inputs'] = [];
    const outputs: DataFlowAnalysis['outputs'] = [];
    const sensitiveDataFlow: DataFlowAnalysis['sensitiveDataFlow'] = [];

    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Detect inputs
      if (line.includes('input(') || line.includes('scanf(') || line.includes('readline()')) {
        inputs.push({
          source: 'user_input',
          type: 'user_input',
          sanitized: line.includes('sanitize') || line.includes('validate'),
          line: index + 1
        });
      }

      // Detect file operations
      if (line.includes('readFile') || line.includes('writeFile') || line.includes('fs.')) {
        const isRead = line.includes('read');
        (isRead ? inputs : outputs).push({
          source: isRead ? 'file_input' : 'file_output',
          type: isRead ? 'file_input' : 'file_output',
          sanitized: false,
          line: index + 1
        } as any);
      }

      // Detect sensitive data patterns
      this.sensitivePatterns.forEach(({ pattern, type }) => {
        const matches = line.match(pattern);
        if (matches) {
          sensitiveDataFlow.push({
            source: `Line ${index + 1}`,
            destination: 'unknown',
            dataType: type as any,
            encrypted: line.includes('encrypt') || line.includes('hash'),
            path: [`Line ${index + 1}`]
          });
        }
      });
    });

    return { inputs, outputs, sensitiveDataFlow };
  }

  /**
   * Calculate code complexity metrics
   */
  private calculateComplexity(content: string): CodeComplexity {
    const lines = content.split('\n');
    let cyclomaticComplexity = 1; // Base complexity
    let cognitiveComplexity = 0;
    const operators: string[] = [];
    const operands: string[] = [];

    // Count decision points for cyclomatic complexity
    const decisionPatterns = [
      /\bif\b/g, /\belse\b/g, /\bwhile\b/g, /\bfor\b/g,
      /\bswitch\b/g, /\bcase\b/g, /\bcatch\b/g, /\?\s*:/g
    ];

    lines.forEach((line, index) => {
      decisionPatterns.forEach(pattern => {
        const matches = line.match(pattern);
        if (matches) {
          cyclomaticComplexity += matches.length;
          
          // Cognitive complexity considers nesting
          const indentation = line.match(/^\s*/)?.[0].length || 0;
          cognitiveComplexity += matches.length * (1 + Math.floor(indentation / 2));
        }
      });

      // Extract operators and operands for Halstead metrics
      const operatorMatches = line.match(/[+\-*/=<>!&|]+/g);
      const operandMatches = line.match(/\b\w+\b/g);
      
      if (operatorMatches) operators.push(...operatorMatches);
      if (operandMatches) operands.push(...operandMatches);
    });

    // Calculate Halstead metrics
    const distinctOperators = new Set(operators).size;
    const distinctOperands = new Set(operands).size;
    const vocabulary = distinctOperators + distinctOperands;
    const length = operators.length + operands.length;
    const difficulty = (distinctOperators / 2) * (operands.length / distinctOperands);
    const effort = difficulty * length;
    const bugs = effort / 3000; // Estimated bugs

    // Maintainability Index (simplified)
    const linesOfCode = lines.filter(line => line.trim().length > 0).length;
    const maintainabilityIndex = Math.max(0, 
      171 - 5.2 * Math.log(linesOfCode) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)
    );

    return {
      cyclomaticComplexity,
      cognitiveComplexity,
      halsteadMetrics: {
        vocabulary,
        length,
        difficulty,
        effort,
        bugs
      },
      maintainabilityIndex,
      technicalDebt: {
        minutes: Math.round(effort / 60),
        severity: cyclomaticComplexity > 20 ? 'High' : cyclomaticComplexity > 10 ? 'Medium' : 'Low',
        issues: cyclomaticComplexity > 10 ? ['High complexity detected'] : []
      }
    };
  }

  /**
   * Analyze API security
   */
  private analyzeAPISecurity(content: string): APISecurityAnalysis | undefined {
    const endpoints: APISecurityAnalysis['endpoints'] = [];
    const authenticationMechanisms: string[] = [];
    const authorizationChecks: APISecurityAnalysis['authorizationChecks'] = [];

    const lines = content.split('\n');

    // Detect API endpoints
    this.apiPatterns.forEach(({ pattern, framework }) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const lineNumber = content.substring(0, match.index).split('\n').length;
        
        endpoints.push({
          method: match[1] || match[2],
          path: match[2] || match[3],
          authenticated: this.hasAuthentication(content, match.index),
          inputValidation: this.hasInputValidation(content, match.index),
          outputSanitization: this.hasOutputSanitization(content, match.index),
          rateLimit: this.hasRateLimit(content, match.index),
          cors: this.hasCORSHeaders(content, match.index),
          line: lineNumber
        });
      }
    });

    if (endpoints.length === 0) return undefined;

    // Detect authentication mechanisms
    if (content.includes('jwt') || content.includes('JWT')) {
      authenticationMechanisms.push('JWT');
    }
    if (content.includes('oauth') || content.includes('OAuth')) {
      authenticationMechanisms.push('OAuth');
    }
    if (content.includes('session') || content.includes('cookie')) {
      authenticationMechanisms.push('Session');
    }

    return {
      endpoints,
      authenticationMechanisms,
      authorizationChecks,
      dataValidation: {
        inputValidation: content.includes('validate') || content.includes('sanitize'),
        outputEncoding: content.includes('encode') || content.includes('escape'),
        sqlInjectionProtection: content.includes('prepared') || content.includes('parameterized'),
        xssProtection: content.includes('xss') || content.includes('htmlspecialchars')
      }
    };
  }

  /**
   * Perform comprehensive security analysis
   */
  private performSecurityAnalysis(content: string, filename?: string): EnhancedFileAnalysisResult['securityFindings'] {
    const findings: EnhancedFileAnalysisResult['securityFindings'] = [];
    const lines = content.split('\n');

    // Use multi-language analyzer if filename is provided
    if (filename) {
      const multiLangIssues = multiLanguageSecurityAnalyzer.analyzeCode(content, filename);
      
      // Convert multi-language issues to findings format
      for (const issue of multiLangIssues) {
        findings.push({
          type: issue.type,
          severity: issue.severity,
          description: issue.description,
          line: issue.line,
          column: issue.column,
          evidence: issue.codeSnippet || '',
          recommendation: issue.recommendation || 'Review and fix this security issue',
          cwe: issue.cwe,
          owasp: issue.owasp
        });
      }
    }

    // Check for hardcoded secrets
    const secretPatterns = [
      { pattern: /password\s*=\s*['"`][^'"`]{3,}['"`]/gi, type: 'Hardcoded Password' },
      { pattern: /api[_-]?key\s*=\s*['"`][^'"`]{10,}['"`]/gi, type: 'Hardcoded API Key' },
      { pattern: /secret\s*=\s*['"`][^'"`]{10,}['"`]/gi, type: 'Hardcoded Secret' },
    ];

    lines.forEach((line, index) => {
      secretPatterns.forEach(({ pattern, type }) => {
        const matches = line.match(pattern);
        if (matches) {
          findings.push({
            type: 'hardcoded_credentials',
            severity: 'Critical',
            description: `${type} detected in source code`,
            line: index + 1,
            evidence: matches[0],
            recommendation: 'Use environment variables or secure vaults for credentials',
            cwe: 'CWE-798',
            owasp: 'A07:2021 – Identification and Authentication Failures'
          });
        }
      });

      // Check for SQL injection vulnerabilities
      if (line.includes('query') && line.includes('+') && !line.includes('prepared')) {
        findings.push({
          type: 'sql_injection',
          severity: 'Critical',
          description: 'Potential SQL injection vulnerability detected',
          line: index + 1,
          evidence: line.trim(),
          recommendation: 'Use parameterized queries or prepared statements',
          cwe: 'CWE-89',
          owasp: 'A03:2021 – Injection'
        });
      }

      // Check for XSS vulnerabilities
      if (line.includes('innerHTML') || line.includes('document.write')) {
        findings.push({
          type: 'xss',
          severity: 'High',
          description: 'Potential XSS vulnerability detected',
          line: index + 1,
          evidence: line.trim(),
          recommendation: 'Sanitize user input and use safe DOM manipulation methods',
          cwe: 'CWE-79',
          owasp: 'A03:2021 – Injection'
        });
      }
    });

    return findings;
  }

  /**
   * Analyze code quality issues
   */
  private analyzeCodeQuality(content: string): EnhancedFileAnalysisResult['qualityIssues'] {
    const issues: EnhancedFileAnalysisResult['qualityIssues'] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for code smells
      if (line.length > 120) {
        issues.push({
          type: 'code_smell',
          severity: 'Low',
          description: 'Line too long (>120 characters)',
          line: index + 1,
          suggestion: 'Break long lines into multiple shorter lines'
        });
      }

      // Check for TODO/FIXME comments
      if (line.includes('TODO') || line.includes('FIXME')) {
        issues.push({
          type: 'maintainability',
          severity: 'Low',
          description: 'TODO/FIXME comment found',
          line: index + 1,
          suggestion: 'Complete the TODO item or create a proper issue tracker entry'
        });
      }

      // Check for console.log (in production code)
      if (line.includes('console.log') || line.includes('print(')) {
        issues.push({
          type: 'code_smell',
          severity: 'Low',
          description: 'Debug statement found',
          line: index + 1,
          suggestion: 'Remove debug statements from production code'
        });
      }
    });

    return issues;
  }

  /**
   * Analyze dependencies
   */
  private analyzeDependencies(content: string): EnhancedFileAnalysisResult['dependencies'] {
    const dependencies: EnhancedFileAnalysisResult['dependencies'] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // JavaScript/TypeScript imports
      const importMatch = line.match(/import.*from\s+['"`]([^'"`]+)['"`]/);
      if (importMatch) {
        dependencies.push({
          name: importMatch[1],
          source: 'import',
          line: index + 1,
          vulnerabilities: 0, // Would be populated from vulnerability database
          outdated: false
        });
      }

      // Python imports
      const pythonImportMatch = line.match(/(?:import|from)\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
      if (pythonImportMatch) {
        dependencies.push({
          name: pythonImportMatch[1],
          source: 'import',
          line: index + 1,
          vulnerabilities: 0,
          outdated: false
        });
      }
    });

    return dependencies;
  }

  /**
   * Analyze performance issues
   */
  private analyzePerformance(content: string): EnhancedFileAnalysisResult['performanceIssues'] {
    const issues: EnhancedFileAnalysisResult['performanceIssues'] = [];
    const lines = content.split('\n');

    lines.forEach((line, index) => {
      // Check for nested loops
      if (line.includes('for') && content.includes('for', content.indexOf(line) + line.length)) {
        issues.push({
          type: 'inefficient_algorithm',
          description: 'Nested loops detected - potential O(n²) complexity',
          line: index + 1,
          impact: 'Medium',
          suggestion: 'Consider optimizing algorithm complexity'
        });
      }

      // Check for synchronous file operations
      if (line.includes('readFileSync') || line.includes('writeFileSync')) {
        issues.push({
          type: 'blocking_operation',
          description: 'Synchronous file operation detected',
          line: index + 1,
          impact: 'High',
          suggestion: 'Use asynchronous file operations to avoid blocking'
        });
      }
    });

    return issues;
  }

  /**
   * Check compliance with various standards
   */
  private checkCompliance(content: string): EnhancedFileAnalysisResult['complianceChecks'] {
    const checks: EnhancedFileAnalysisResult['complianceChecks'] = [];

    // GDPR compliance
    if (content.includes('email') || content.includes('personal')) {
      const hasDataProtection = content.includes('encrypt') || content.includes('anonymize');
      checks.push({
        standard: 'GDPR',
        requirement: 'Personal data protection',
        compliant: hasDataProtection,
        findings: hasDataProtection ? [] : ['Personal data without encryption detected'],
        remediation: 'Implement data encryption and anonymization'
      });
    }

    return checks;
  }

  // Helper methods
  private async calculateHash(buffer: ArrayBuffer, algorithm: string): Promise<string> {
    const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private detectFileSignature(buffer: Uint8Array): string {
    const signature = Array.from(buffer.slice(0, 8))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return signature;
  }

  private getExpectedSignature(filename: string): string {
    const extension = filename.split('.').pop()?.toLowerCase();
    return this.fileSignatures[extension || ''] || 'unknown';
  }

  private detectEncoding(content: string): string | undefined {
    // Simple encoding detection
    try {
      // Try to detect UTF-8 BOM
      if (content.charCodeAt(0) === 0xFEFF) return 'UTF-8-BOM';
      
      // Check for common encodings based on character patterns
      if (/[\u0080-\uFFFF]/.test(content)) return 'UTF-8';
      
      return 'ASCII';
    } catch {
      return undefined;
    }
  }

  private assessScriptRisk(script: string): 'Low' | 'Medium' | 'High' | 'Critical' {
    const dangerousPatterns = [
      /eval\s*\(/gi,
      /document\.write\s*\(/gi,
      /innerHTML\s*=/gi,
      /outerHTML\s*=/gi,
      /setTimeout\s*\(\s*['"`]/gi,
      /setInterval\s*\(\s*['"`]/gi
    ];

    const riskyPatterns = dangerousPatterns.filter(pattern => pattern.test(script));
    
    if (riskyPatterns.length >= 3) return 'Critical';
    if (riskyPatterns.length >= 2) return 'High';
    if (riskyPatterns.length >= 1) return 'Medium';
    return 'Low';
  }

  private hasAuthentication(content: string, position: number): boolean {
    const context = content.substring(Math.max(0, position - 200), position + 200);
    return /auth|login|token|session/i.test(context);
  }

  private hasInputValidation(content: string, position: number): boolean {
    const context = content.substring(Math.max(0, position - 200), position + 200);
    return /validate|sanitize|clean|filter/i.test(context);
  }

  private hasOutputSanitization(content: string, position: number): boolean {
    const context = content.substring(Math.max(0, position - 200), position + 200);
    return /encode|escape|sanitize/i.test(context);
  }

  private hasRateLimit(content: string, position: number): boolean {
    const context = content.substring(Math.max(0, position - 200), position + 200);
    return /rate.?limit|throttle|bucket/i.test(context);
  }

  private hasCORSHeaders(content: string, position: number): boolean {
    const context = content.substring(Math.max(0, position - 200), position + 200);
    return /cors|access.control.allow/i.test(context);
  }
}