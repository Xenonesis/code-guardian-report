// @ts-nocheck - Suppress Babel type version mismatch errors
import { SecurityIssue } from '@/hooks/useAnalysis';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';

export interface TaintFlow {
  source: {
    line: number;
    column: number;
    type: 'user_input' | 'external' | 'file_read' | 'database';
    variableName: string;
  };
  sinks: Array<{
    line: number;
    column: number;
    type: 'sql' | 'xss' | 'command' | 'file_write' | 'eval';
    functionName: string;
  }>;
  path: string[];
  confidence: number;
  fileName: string;
}

export class DataFlowAnalyzer {
  private taintedVariables = new Map<string, TaintFlow['source']>();
  private dataFlows: TaintFlow[] = [];

  // Known taint sources
  private readonly taintSources = {
    user_input: [
      'req.body', 'req.query', 'req.params', 'req.cookies', 'req.headers',
      'request.form', 'request.args', 'request.json', 'request.data',
      '$_GET', '$_POST', '$_REQUEST', '$_COOKIE', 'input()',
      'System.in', 'Scanner', 'BufferedReader'
    ],
    external: [
      'fetch', 'axios', 'http.get', 'http.post', 'urllib.request',
      'requests.get', 'requests.post', 'file_get_contents'
    ],
    file_read: [
      'fs.readFile', 'fs.readFileSync', 'open(', 'File.read',
      'readFile', 'readlines()'
    ],
    database: [
      'db.query', 'db.execute', 'cursor.execute', 'Statement.executeQuery'
    ]
  };

  // Known taint sinks
  private readonly taintSinks = {
    sql: ['query', 'execute', 'executeQuery', 'raw', 'cursor.execute'],
    xss: ['innerHTML', 'outerHTML', 'insertAdjacentHTML', 'document.write', 'res.send', 'res.write'],
    command: ['exec', 'execSync', 'spawn', 'system(', 'Runtime.getRuntime().exec', 'os.system'],
    file_write: ['fs.writeFile', 'fs.writeFileSync', 'open(', 'File.write'],
    eval: ['eval', 'Function', 'exec(', 'compile(', 'eval(']
  };

  /**
   * Analyze data flows in the codebase
   */
  public analyzeDataFlow(files: { filename: string; content: string }[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];

    for (const file of files) {
      if (this.isJavaScriptFile(file.filename)) {
        try {
          this.dataFlows = [];
          this.taintedVariables.clear();

          const ast = this.parseCode(file.content, file.filename);
          if (ast) {
            this.trackDataFlow(ast, file.filename, file.content);
            const flowIssues = this.convertFlowsToIssues(file.filename, file.content);
            issues.push(...flowIssues);
          }
        } catch (error) {
          console.warn(`Error analyzing data flow in ${file.filename}:`, error);
        }
      }
    }

    return issues;
  }

  /**
   * Parse code into AST
   */
  private parseCode(code: string, filename: string): t.File | null {
    try {
      return parse(code, {
        sourceType: 'module',
        plugins: [
          'jsx',
          'typescript',
          'decorators-legacy',
          'classProperties',
          'dynamicImport'
        ],
        errorRecovery: true
      });
    } catch (error) {
      console.warn(`Failed to parse ${filename}:`, error);
      return null;
    }
  }

  /**
   * Track data flow through the code
   */
  private trackDataFlow(ast: t.File, fileName: string, content: string): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const traverseFunction = typeof traverse === 'function' ? traverse : (traverse as any).default;
    traverseFunction(ast as any, {
      // Track variable declarations and assignments
      VariableDeclarator: (path: NodePath<t.VariableDeclarator>) => {
        const node = path.node;
        
        if (t.isIdentifier(node.id) && node.init) {
          const varName = node.id.name;
          
          // Check if the initial value is tainted
          if (this.isTaintedExpression(node.init, content)) {
            const sourceType = this.getSourceType(node.init, content);
            this.taintedVariables.set(varName, {
              line: node.loc?.start.line || 1,
              column: node.loc?.start.column || 0,
              type: sourceType,
              variableName: varName
            });
          }
        }
      },

      // Track assignments
      AssignmentExpression: (path: NodePath<t.AssignmentExpression>) => {
        const node = path.node;
        
        if (t.isIdentifier(node.left)) {
          const varName = node.left.name;
          
          // Check if assigned value is tainted
          if (this.isTaintedExpression(node.right, content)) {
            const sourceType = this.getSourceType(node.right, content);
            this.taintedVariables.set(varName, {
              line: node.loc?.start.line || 1,
              column: node.loc?.start.column || 0,
              type: sourceType,
              variableName: varName
            });
          }
        }
      },

      // Track function calls (potential sinks)
      CallExpression: (path: NodePath<t.CallExpression>) => {
        const node = path.node;
        const sinkInfo = this.getSinkInfo(node, content);
        
        if (sinkInfo) {
          // Check if any arguments are tainted
          for (const arg of node.arguments) {
            const taintedVars = this.findTaintedVariables(arg);
            
            for (const varName of taintedVars) {
              const source = this.taintedVariables.get(varName);
              if (source) {
                this.dataFlows.push({
                  source,
                  sinks: [sinkInfo],
                  path: [varName],
                  confidence: this.calculateConfidence(source.type, sinkInfo.type),
                  fileName
                });
              }
            }
          }
        }
      },

      // Track member expressions (like innerHTML assignments)
      MemberExpression: (path: NodePath<t.MemberExpression>) => {
        const node = path.node;
        const parent = path.parent;
        
        // Check if this is an XSS sink assignment
        if (t.isAssignmentExpression(parent) && parent.left === node) {
          const memberName = this.getMemberExpressionName(node);
          if (this.taintSinks.xss.some(sink => memberName.includes(sink))) {
            const taintedVars = this.findTaintedVariables(parent.right);
            
            for (const varName of taintedVars) {
              const source = this.taintedVariables.get(varName);
              if (source) {
                this.dataFlows.push({
                  source,
                  sinks: [{
                    line: node.loc?.start.line || 1,
                    column: node.loc?.start.column || 0,
                    type: 'xss',
                    functionName: memberName
                  }],
                  path: [varName],
                  confidence: 85,
                  fileName
                });
              }
            }
          }
        }
      }
    });
  }

  /**
   * Check if an expression is tainted (comes from user input or external source)
   */
  private isTaintedExpression(node: t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder, _content: string): boolean {
    if (!('type' in node)) return false;
    
    if (t.isCallExpression(node)) {
      const calleeName = t.isExpression(node.callee) ? this.getMemberExpressionName(node.callee) : '';
      return Object.values(this.taintSources).flat().some(source => 
        calleeName.includes(source)
      );
    }
    
    if (t.isMemberExpression(node)) {
      const memberName = this.getMemberExpressionName(node);
      return Object.values(this.taintSources).flat().some(source => 
        memberName.includes(source)
      );
    }
    
    if (t.isIdentifier(node)) {
      return this.taintedVariables.has(node.name);
    }
    
    return false;
  }

  /**
   * Get the type of taint source
   */
  private getSourceType(node: t.Expression | t.SpreadElement | t.JSXNamespacedName | t.ArgumentPlaceholder, _content: string): TaintFlow['source']['type'] {
    if (!('type' in node)) return 'external';
    
    if (t.isCallExpression(node) || t.isMemberExpression(node)) {
      const name = t.isCallExpression(node) && t.isExpression(node.callee)
        ? this.getMemberExpressionName(node.callee)
        : t.isMemberExpression(node)
        ? this.getMemberExpressionName(node)
        : '';
      
      if (this.taintSources.user_input.some(src => name.includes(src))) return 'user_input';
      if (this.taintSources.file_read.some(src => name.includes(src))) return 'file_read';
      if (this.taintSources.database.some(src => name.includes(src))) return 'database';
    }
    
    return 'external';
  }

  /**
   * Get sink information from a call expression
   */
  private getSinkInfo(node: t.CallExpression, _content: string): TaintFlow['sinks'][0] | null {
    const calleeName = t.isExpression(node.callee) ? this.getMemberExpressionName(node.callee) : '';
    
    for (const [sinkType, sinkPatterns] of Object.entries(this.taintSinks)) {
      if (sinkPatterns.some(pattern => calleeName.includes(pattern))) {
        return {
          line: node.loc?.start.line || 1,
          column: node.loc?.start.column || 0,
          type: sinkType as 'sql' | 'xss' | 'command' | 'file_write' | 'eval',
          functionName: calleeName
        };
      }
    }
    
    return null;
  }

  /**
   * Find all tainted variables used in an expression
   */
  private findTaintedVariables(node: t.Node): string[] {
    const taintedVars: string[] = [];
    
    try {
      const traverseFunction = typeof traverse === 'function' ? traverse : (traverse as any).default;
      traverseFunction(
        t.file(t.program([t.expressionStatement(node as t.Expression)])),
        {
          Identifier: (path: NodePath<t.Identifier>) => {
            const varName = path.node.name;
            if (this.taintedVariables.has(varName)) {
              taintedVars.push(varName);
            }
          }
        },
        undefined,
        {}
      );
    } catch (error) {
      // Fallback: simple regex-based variable extraction
      const nodeStr = String(node);
      for (const [varName] of this.taintedVariables) {
        if (nodeStr.includes(varName)) {
          taintedVars.push(varName);
        }
      }
    }
    
    return [...new Set(taintedVars)];
  }

  /**
   * Get member expression name as string
   */
  private getMemberExpressionName(node: t.Expression): string {
    if (t.isIdentifier(node)) {
      return node.name;
    }
    if (t.isMemberExpression(node)) {
      const object = this.getMemberExpressionName(node.object);
      const property = t.isIdentifier(node.property) ? node.property.name : '';
      return `${object}.${property}`;
    }
    return '';
  }

  /**
   * Calculate confidence based on source and sink types
   */
  private calculateConfidence(sourceType: string, sinkType: string): number {
    // User input to dangerous sinks is highly confident
    if (sourceType === 'user_input') {
      if (sinkType === 'sql' || sinkType === 'command' || sinkType === 'eval') return 95;
      if (sinkType === 'xss') return 90;
      if (sinkType === 'file_write') return 80;
    }
    
    // External data to sinks is moderately confident
    if (sourceType === 'external' || sourceType === 'file_read') {
      if (sinkType === 'sql' || sinkType === 'command') return 75;
      if (sinkType === 'xss') return 70;
    }
    
    return 60;
  }

  /**
   * Convert data flows to security issues
   */
  private convertFlowsToIssues(filename: string, content: string): SecurityIssue[] {
    return this.dataFlows.map(flow => {
      const sink = flow.sinks[0];
      const severity = this.getSeverity(sink.type);
      const category = this.getCategory(sink.type);
      
      return {
        id: this.generateId(),
        type: `Data Flow - ${this.getVulnerabilityType(sink.type)}`,
        category,
        message: `Tainted data from ${flow.source.type.replace('_', ' ')} flows to ${sink.type} operation (${sink.functionName})`,
        severity,
        confidence: flow.confidence,
        filename,
        line: sink.line,
        column: sink.column,
        codeSnippet: this.extractSnippet(content, sink.line),
        recommendation: this.getRecommendation(sink.type),
        remediation: {
          description: this.getRemediationDescription(sink.type),
          effort: 'Medium',
          priority: severity === 'Critical' ? 5 : 4
        },
        riskRating: severity,
        impact: `User-controlled data from ${flow.source.variableName} reaches ${sink.type} operation without proper validation`,
        likelihood: 'High',
        references: this.getReferences(sink.type),
        tags: ['data-flow', 'taint-analysis', sink.type, flow.source.type],
        tool: 'Data Flow Analyzer',
        cvssScore: this.getCVSSScore(sink.type),
        cweId: this.getCWEId(sink.type),
        owaspCategory: this.getOWASPCategory(sink.type)
      };
    });
  }

  /**
   * Helper methods
   */
  private isJavaScriptFile(filename: string): boolean {
    return /\.(js|jsx|ts|tsx|mjs|cjs)$/.test(filename);
  }

  private extractSnippet(content: string, line: number): string {
    const lines = content.split('\n');
    const start = Math.max(0, line - 2);
    const end = Math.min(lines.length, line + 2);
    
    let snippet = '';
    for (let i = start; i < end; i++) {
      const marker = i === line - 1 ? '→ ' : '  ';
      snippet += `${marker}${(i + 1).toString().padStart(3, ' ')}: ${lines[i]}\n`;
    }
    
    return snippet.trim();
  }

  private generateId(): string {
    return `df_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private getVulnerabilityType(sinkType: string): string {
    const types: Record<string, string> = {
      sql: 'SQL Injection',
      xss: 'Cross-Site Scripting',
      command: 'Command Injection',
      eval: 'Code Injection',
      file_write: 'Path Traversal'
    };
    return types[sinkType] || 'Injection';
  }

  private getSeverity(sinkType: string): 'Critical' | 'High' | 'Medium' | 'Low' {
    const critical = ['sql', 'command', 'eval'];
    const high = ['xss', 'file_write'];
    
    if (critical.includes(sinkType)) return 'Critical';
    if (high.includes(sinkType)) return 'High';
    return 'Medium';
  }

  private getCategory(sinkType: string): string {
    const categories: Record<string, string> = {
      sql: 'SQL Injection',
      xss: 'Cross-Site Scripting',
      command: 'Command Injection',
      eval: 'Code Injection',
      file_write: 'Path Traversal'
    };
    return categories[sinkType] || 'Injection';
  }

  private getRecommendation(sinkType: string): string {
    const recommendations: Record<string, string> = {
      sql: 'Use parameterized queries or prepared statements to prevent SQL injection',
      xss: 'Sanitize user input before rendering in HTML using DOMPurify or similar',
      command: 'Validate and sanitize input before command execution. Use safe APIs',
      eval: 'Avoid using eval() with user input. Use JSON.parse() or safer alternatives',
      file_write: 'Validate file paths and use path.join() with basedir restriction'
    };
    return recommendations[sinkType] || 'Validate and sanitize all user input';
  }

  private getRemediationDescription(sinkType: string): string {
    return this.getRecommendation(sinkType);
  }

  private getReferences(sinkType: string): string[] {
    const base = [
      'https://owasp.org/www-project-top-ten/',
      'https://cwe.mitre.org/'
    ];
    
    const specific: Record<string, string[]> = {
      sql: ['https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html'],
      xss: ['https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html'],
      command: ['https://cheatsheetseries.owasp.org/cheatsheets/OS_Command_Injection_Defense_Cheat_Sheet.html']
    };
    
    return [...base, ...(specific[sinkType] || [])];
  }

  private getCVSSScore(sinkType: string): number {
    const scores: Record<string, number> = {
      sql: 9.8,
      command: 9.8,
      eval: 9.5,
      xss: 7.5,
      file_write: 6.5
    };
    return scores[sinkType] || 5;
  }

  private getCWEId(sinkType: string): string {
    const cwes: Record<string, string> = {
      sql: 'CWE-89',
      xss: 'CWE-79',
      command: 'CWE-78',
      eval: 'CWE-95',
      file_write: 'CWE-22'
    };
    return cwes[sinkType] || 'CWE-707';
  }

  private getOWASPCategory(_sinkType: string): string {
    return 'A03:2021 – Injection';
  }
}
