// @ts-nocheck - Suppress Babel type version mismatch errors
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import { parse as acornParse } from 'acorn';
import { SecurityIssue } from '@/hooks/useAnalysis';

export interface ASTNode {
  type: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface TaintSource {
  node: ASTNode;
  variableName: string;
  type: 'user_input' | 'external' | 'unsafe';
  line: number;
  column: number;
}

export interface TaintSink {
  node: ASTNode;
  type: 'sql' | 'xss' | 'command' | 'eval' | 'redirect';
  line: number;
  column: number;
  functionName: string;
}

export class ASTAnalyzer {
  private taintSources: Map<string, TaintSource[]> = new Map();
  private taintSinks: TaintSink[] = [];
  
  // Dangerous functions that can lead to vulnerabilities
  private readonly dangerousFunctions = {
    eval: ['eval', 'Function', 'setTimeout', 'setInterval'],
    exec: ['exec', 'execSync', 'spawn', 'spawnSync', 'execFile', 'fork'],
    sql: ['query', 'execute', 'raw', 'executeQuery', 'run'],
    xss: ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'document.writeln'],
    redirect: ['redirect', 'sendRedirect', 'location.href', 'location.replace'],
    deserialization: ['unserialize', 'pickle.loads', 'yaml.load', 'eval']
  };

  // User input sources
  private readonly userInputSources = [
    'req.body', 'req.query', 'req.params', 'req.cookies', 'req.headers',
    'request.form', 'request.args', 'request.values', 'request.json',
    '$_GET', '$_POST', '$_REQUEST', '$_COOKIE', '$_SERVER',
    'System.getenv', 'process.env', 'os.getenv'
  ];

  /**
   * Parse JavaScript/TypeScript code into AST
   */
  public parseJavaScript(code: string, filename: string): ASTNode | null {
    try {
      const ast = parse(code, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'dynamicImport',
          'optionalChaining',
          'nullishCoalescingOperator'
        ],
        errorRecovery: true
      });
      return ast as unknown as ASTNode;
    } catch {
      // Fallback to acorn for plain JavaScript
      try {
        return acornParse(code, {
          ecmaVersion: 2022,
          sourceType: 'module',
          locations: true
        }) as unknown as ASTNode;
      } catch (fallbackError) {
        console.warn(`Failed to parse ${filename}:`, fallbackError);
        return null;
      }
    }
  }

  /**
   * Analyze AST for security vulnerabilities
   */
  public analyzeAST(filename: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    
    if (!this.isJavaScriptFile(filename)) {
      return issues;
    }

    const ast = this.parseJavaScript(content, filename);
    if (!ast) {
      return issues;
    }

    // Reset taint tracking
    this.taintSources.clear();
    this.taintSinks = [];

    try {
      // Use Babel traverse for detailed analysis
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const traverseFunction = typeof traverse === 'function' ? traverse : (traverse as any).default;
      traverseFunction(ast as any, {
        // Detect dangerous function calls
        // @ts-expect-error - Babel type version mismatch
        CallExpression: (path: NodePath<t.CallExpression>) => {
          try {
            const node = path.node;
            
            // Check for eval usage
            if (t.isIdentifier(node.callee) && this.dangerousFunctions.eval.includes(node.callee.name)) {
              issues.push(this.createIssue(
                'Code Injection via eval',
                'Critical',
                'Use of eval() or Function constructor can lead to arbitrary code execution',
                filename,
                node.loc?.start.line || 1,
                node.loc?.start.column || 0,
                this.extractSnippet(content, node.loc?.start.line || 1)
              ));
            }

            // Check for command execution
            if (t.isMemberExpression(node.callee)) {
              const memberName = this.getMemberExpressionName(node.callee);
              if (this.dangerousFunctions.exec.some(fn => memberName.includes(fn))) {
                issues.push(this.createIssue(
                  'Command Injection Risk',
                  'Critical',
                  'Direct command execution with user input can lead to command injection',
                  filename,
                  node.loc?.start.line || 1,
                  node.loc?.start.column || 0,
                  this.extractSnippet(content, node.loc?.start.line || 1)
                ));
              }
            }

            // Track taint sources
            this.trackTaintSources(path);
            
            // Track taint sinks
            this.trackTaintSinks(path);
          } catch (error) {
            console.warn(`Error in CallExpression visitor for ${filename}:`, error);
          }
        },

        // Detect dangerous member expressions (e.g., dangerouslySetInnerHTML)
        // @ts-expect-error - Babel type version mismatch
        JSXAttribute: (path: NodePath<t.JSXAttribute>) => {
          try {
            const node = path.node;
            if (t.isJSXIdentifier(node.name) && node.name.name === 'dangerouslySetInnerHTML') {
              issues.push(this.createIssue(
                'XSS via dangerouslySetInnerHTML',
                'High',
                'Using dangerouslySetInnerHTML without sanitization can lead to XSS attacks',
                filename,
                node.loc?.start.line || 1,
                node.loc?.start.column || 0,
                this.extractSnippet(content, node.loc?.start.line || 1)
              ));
            }
          } catch (error) {
            console.warn(`Error in JSXAttribute visitor for ${filename}:`, error);
          }
        },

        // Detect assignment to innerHTML
        AssignmentExpression: (path: NodePath<t.AssignmentExpression>) => {
          try {
            const node = path.node;
            if (t.isMemberExpression(node.left)) {
              const memberName = this.getMemberExpressionName(node.left);
              if (this.dangerousFunctions.xss.some(prop => memberName.includes(prop))) {
                issues.push(this.createIssue(
                  'XSS via DOM Manipulation',
                  'High',
                  'Direct manipulation of innerHTML or similar properties can lead to XSS',
                  filename,
                  node.loc?.start.line || 1,
                  node.loc?.start.column || 0,
                  this.extractSnippet(content, node.loc?.start.line || 1)
                ));
              }
            }
          } catch (error) {
            console.warn(`Error in AssignmentExpression visitor for ${filename}:`, error);
          }
        },

        // Detect hardcoded secrets
        VariableDeclarator: (path: NodePath<t.VariableDeclarator>) => {
          try {
            const node = path.node;
            if (t.isIdentifier(node.id) && t.isStringLiteral(node.init)) {
              const varName = node.id.name.toLowerCase();
              const value = node.init.value;
              
              // Check for potential secrets
              if ((varName.includes('password') || varName.includes('secret') || 
                   varName.includes('key') || varName.includes('token')) &&
                  value.length > 8 && !value.includes('your_') && !value.includes('example')) {
                issues.push(this.createIssue(
                  'Hardcoded Secret',
                  'High',
                  `Potential hardcoded ${varName} detected in source code`,
                  filename,
                  node.loc?.start.line || 1,
                  node.loc?.start.column || 0,
                  this.extractSnippet(content, node.loc?.start.line || 1, true)
                ));
              }
            }
          } catch (error) {
            console.warn(`Error in VariableDeclarator visitor for ${filename}:`, error);
          }
        },

        // Detect weak random number generation
        MemberExpression: (path: NodePath<t.MemberExpression>) => {
          try {
            const node = path.node;
            const memberName = this.getMemberExpressionName(node);
            
            if (memberName === 'Math.random' && this.isUsedForSecurity(path)) {
              issues.push(this.createIssue(
                'Weak Random Number Generation',
                'Medium',
                'Math.random() is not cryptographically secure. Use crypto.getRandomValues() instead',
                filename,
                node.loc?.start.line || 1,
                node.loc?.start.column || 0,
                this.extractSnippet(content, node.loc?.start.line || 1)
              ));
            }
          } catch (error) {
            console.warn(`Error in MemberExpression visitor for ${filename}:`, error);
          }
        }
      });

      // Analyze taint flows
      const taintFlowIssues = this.analyzeTaintFlows(filename, content);
      issues.push(...taintFlowIssues);

    } catch (error) {
      console.warn(`Error analyzing AST for ${filename}:`, error);
    }

    return issues;
  }

  /**
   * Track taint sources (user inputs)
   */
  private trackTaintSources(path: NodePath<t.CallExpression>): void {
    try {
      const node = path.node;
      
      // Check if this is a user input source
      const sourceName = t.isExpression(node.callee) ? this.getMemberExpressionName(node.callee) : '';
      if (this.userInputSources.some(src => sourceName.includes(src))) {
        const parent = path.parentPath?.node;
        if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
          const varName = parent.id.name;
          const source: TaintSource = {
            node: node as unknown as ASTNode,
            variableName: varName,
            type: 'user_input',
            line: node.loc?.start.line || 1,
            column: node.loc?.start.column || 0
          };
          
          const sources = this.taintSources.get(varName) || [];
          sources.push(source);
          this.taintSources.set(varName, sources);
        }
      }
    } catch (error) {
      console.warn('Error in trackTaintSources:', error);
    }
  }

  /**
   * Track taint sinks (dangerous operations)
   */
  private trackTaintSinks(path: NodePath<t.CallExpression>): void {
    try {
      const node = path.node;
      const calleeName = t.isExpression(node.callee) ? this.getMemberExpressionName(node.callee) : '';
      
      // Check for SQL sinks
      if (this.dangerousFunctions.sql.some(fn => calleeName.includes(fn))) {
        this.taintSinks.push({
          node: node as unknown as ASTNode,
          type: 'sql',
          line: node.loc?.start.line || 1,
          column: node.loc?.start.column || 0,
          functionName: calleeName
        });
      }
      
      // Check for XSS sinks
      if (this.dangerousFunctions.xss.some(fn => calleeName.includes(fn))) {
        this.taintSinks.push({
          node: node as unknown as ASTNode,
          type: 'xss',
          line: node.loc?.start.line || 1,
          column: node.loc?.start.column || 0,
          functionName: calleeName
        });
      }
      
      // Check for command execution sinks
      if (this.dangerousFunctions.exec.some(fn => calleeName.includes(fn))) {
        this.taintSinks.push({
          node: node as unknown as ASTNode,
          type: 'command',
          line: node.loc?.start.line || 1,
          column: node.loc?.start.column || 0,
          functionName: calleeName
        });
      }
    } catch (error) {
      console.warn('Error in trackTaintSinks:', error);
    }
  }

  /**
   * Analyze taint flows from sources to sinks
   */
  private analyzeTaintFlows(filename: string, content: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    
    // For each taint sink, check if any tainted variable reaches it
    for (const sink of this.taintSinks) {
      for (const [varName, sources] of this.taintSources.entries()) {
        // Simple analysis: check if variable name appears in sink arguments
        const sinkCode = content.split('\n')[sink.line - 1] || '';
        if (sinkCode.includes(varName)) {
          const source = sources[0];
          issues.push({
            id: this.generateId(),
            type: `Data Flow - ${this.getTaintFlowType(sink.type)}`,
            category: this.getTaintFlowCategory(sink.type),
            message: `Tainted data from ${source.type} flows to ${sink.type} operation`,
            severity: this.getTaintFlowSeverity(sink.type),
            confidence: 75,
            filename,
            line: sink.line,
            column: sink.column,
            codeSnippet: this.extractSnippet(content, sink.line),
            recommendation: this.getTaintFlowRecommendation(sink.type),
            remediation: {
              description: this.getTaintFlowRemediation(sink.type),
              effort: 'Medium',
              priority: 4
            },
            riskRating: this.getTaintFlowSeverity(sink.type),
            impact: `User-controlled data reaches ${sink.type} operation without proper validation`,
            likelihood: 'High',
            references: this.getTaintFlowReferences(sink.type),
            tags: ['data-flow', 'taint-analysis', sink.type],
            tool: 'AST Taint Analyzer',
            cvssScore: this.getTaintFlowCVSS(sink.type)
          });
        }
      }
    }
    
    return issues;
  }

  /**
   * Helper methods
   */
  private getMemberExpressionName(node: t.Expression): string {
    try {
      if (t.isIdentifier(node)) {
        return node.name;
      }
      if (t.isMemberExpression(node)) {
        const object = this.getMemberExpressionName(node.object as t.Expression);
        const property = t.isIdentifier(node.property) ? node.property.name : '';
        return `${object}.${property}`;
      }
      return '';
    } catch (error) {
      console.warn('Error in getMemberExpressionName:', error);
      return '';
    }
  }

  private isUsedForSecurity(path: NodePath<t.MemberExpression>): boolean {
    try {
      const parent = path.parentPath?.node;
      
      // Safely check if getSource is available and the hub/scope has the necessary data
      let code = '';
      if (typeof path.getSource === 'function') {
        try {
          const source = path.getSource();
          code = source || '';
        } catch {
          // getSource might fail if hub/scope is not properly initialized
          // Fall back to checking the node structure directly
          code = '';
        }
      }
      
      // If we couldn't get source code, check node structure directly
      if (!code) {
        const node = path.node;
        if (t.isIdentifier(node.property)) {
          code = node.property.name;
        }
      }
      
      // Check if it's used in security-related context
      return code.includes('token') || code.includes('session') || 
             code.includes('id') || code.includes('key') ||
             (parent && t.isCallExpression(parent));
    } catch (error) {
      console.error('Error in isUsedForSecurity:', error);
      return false;
    }
  }

  private isJavaScriptFile(filename: string): boolean {
    return /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(filename);
  }

  private extractSnippet(content: string, line: number, maskSecrets = false): string {
    const lines = content.split('\n');
    const start = Math.max(0, line - 2);
    const end = Math.min(lines.length, line + 2);
    
    let snippet = '';
    for (let i = start; i < end; i++) {
      let lineContent = lines[i];
      if (maskSecrets && i === line - 1) {
        lineContent = lineContent.replace(/["'][^"']{8,}["']/g, '"***REDACTED***"');
      }
      const marker = i === line - 1 ? '→ ' : '  ';
      snippet += `${marker}${(i + 1).toString().padStart(3, ' ')}: ${lineContent}\n`;
    }
    
    return snippet.trim();
  }

  private createIssue(
    type: string,
    severity: 'Critical' | 'High' | 'Medium' | 'Low',
    message: string,
    filename: string,
    line: number,
    column: number,
    codeSnippet: string
  ): SecurityIssue {
    return {
      id: this.generateId(),
      type,
      category: this.getCategoryFromType(type),
      message,
      severity,
      confidence: 85,
      filename,
      line,
      column,
      codeSnippet,
      recommendation: this.getRecommendation(type),
      remediation: {
        description: this.getRemediation(type),
        effort: severity === 'Critical' ? 'High' : 'Medium',
        priority: severity === 'Critical' ? 5 : 4
      },
      riskRating: severity,
      impact: this.getImpact(type),
      likelihood: 'High',
      references: this.getReferences(type),
      tags: ['ast-analysis', type.toLowerCase().replace(/\s+/g, '-')],
      tool: 'AST Security Analyzer',
      cvssScore: this.getCVSSScore(severity)
    };
  }

  private generateId(): string {
    return `ast_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCategoryFromType(type: string): string {
    if (type.includes('XSS')) return 'Cross-Site Scripting';
    if (type.includes('Injection')) return 'Code Injection';
    if (type.includes('Command')) return 'Command Injection';
    if (type.includes('Secret')) return 'Secret Detection';
    if (type.includes('Random')) return 'Weak Cryptography';
    return 'Security';
  }

  private getRecommendation(type: string): string {
    const recommendations: Record<string, string> = {
      'Code Injection via eval': 'Avoid using eval(). Use JSON.parse() for data or safer alternatives',
      'Command Injection Risk': 'Validate and sanitize all inputs before command execution. Use parameterized commands',
      'XSS via dangerouslySetInnerHTML': 'Sanitize HTML content using DOMPurify before rendering',
      'XSS via DOM Manipulation': 'Use safe DOM manipulation methods or sanitize content before insertion',
      'Hardcoded Secret': 'Move secrets to environment variables or secure configuration management',
      'Weak Random Number Generation': 'Use crypto.getRandomValues() or crypto.randomBytes() for security-sensitive operations'
    };
    return recommendations[type] || 'Follow security best practices';
  }

  private getRemediation(type: string): string {
    return this.getRecommendation(type);
  }

  private getImpact(type: string): string {
    const impacts: Record<string, string> = {
      'Code Injection via eval': 'Arbitrary code execution, complete system compromise',
      'Command Injection Risk': 'System command execution, potential server takeover',
      'XSS via dangerouslySetInnerHTML': 'Cross-site scripting, session hijacking, data theft',
      'XSS via DOM Manipulation': 'Cross-site scripting, client-side code execution',
      'Hardcoded Secret': 'Credential exposure, unauthorized access',
      'Weak Random Number Generation': 'Predictable tokens, session hijacking'
    };
    return impacts[type] || 'Security vulnerability';
  }

  private getReferences(_type: string): string[] {
    return [
      'https://owasp.org/www-project-top-ten/',
      'https://cwe.mitre.org/'
    ];
  }

  private getCVSSScore(severity: string): number {
    switch (severity) {
      case 'Critical': return 9.5;
      case 'High': return 7.5;
      case 'Medium': return 5.0;
      case 'Low': return 2.5;
      default: return 5.0;
    }
  }

  private getTaintFlowType(sinkType: string): string {
    const types: Record<string, string> = {
      'sql': 'SQL Injection',
      'xss': 'Cross-Site Scripting',
      'command': 'Command Injection',
      'eval': 'Code Injection',
      'redirect': 'Open Redirect'
    };
    return types[sinkType] || 'Injection';
  }

  private getTaintFlowCategory(sinkType: string): string {
    const categories: Record<string, string> = {
      'sql': 'SQL Injection',
      'xss': 'Cross-Site Scripting',
      'command': 'Command Injection',
      'eval': 'Code Injection',
      'redirect': 'Open Redirect'
    };
    return categories[sinkType] || 'Injection';
  }

  private getTaintFlowSeverity(sinkType: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    const severities: Record<string, 'Critical' | 'High' | 'Medium' | 'Low'> = {
      'sql': 'Critical',
      'command': 'Critical',
      'eval': 'Critical',
      'xss': 'High',
      'redirect': 'Medium'
    };
    return severities[sinkType] || 'Medium';
  }

  private getTaintFlowRecommendation(sinkType: string): string {
    const recommendations: Record<string, string> = {
      'sql': 'Use parameterized queries or ORM to prevent SQL injection',
      'xss': 'Sanitize user input before rendering in HTML',
      'command': 'Validate and sanitize input before command execution. Use safe APIs',
      'eval': 'Avoid eval() with user input. Use JSON.parse() or safer alternatives',
      'redirect': 'Validate redirect URLs against a whitelist'
    };
    return recommendations[sinkType] || 'Validate and sanitize user input';
  }

  private getTaintFlowRemediation(sinkType: string): string {
    return this.getTaintFlowRecommendation(sinkType);
  }

  private getTaintFlowReferences(_sinkType: string): string[] {
    return [
      'https://owasp.org/www-project-top-ten/',
      'https://cwe.mitre.org/',
      'https://owasp.org/www-community/controls/Input_Validation_Cheat_Sheet'
    ];
  }

  private getTaintFlowCVSS(sinkType: string): number {
    const scores: Record<string, number> = {
      'sql': 9.8,
      'command': 9.8,
      'eval': 9.8,
      'xss': 7.5,
      'redirect': 5.0
    };
    return scores[sinkType] || 5.0;
  }
}
