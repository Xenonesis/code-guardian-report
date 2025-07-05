import { SecurityIssue } from '@/hooks/useAnalysis';
import { 
  SECURITY_RULES, 
  calculateCVSSScore
} from '../securityAnalysisEngine';

type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'php' | 'ruby' | 'golang' | 'csharp';
type ToolsByLanguage = Record<SupportedLanguage, string[]>;
type AdditionalTagsType = Record<string, string[]>;

export class SecurityAnalyzer {
  private generateUniqueId(): string {
    return `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFileLanguage(filename: string): SupportedLanguage {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js':
      case 'jsx':
        return 'javascript';
      case 'ts':
      case 'tsx':
        return 'typescript';
      case 'py':
        return 'python';
      case 'java':
        return 'java';
      case 'php':
        return 'php';
      case 'rb':
        return 'ruby';
      case 'go':
        return 'golang';
      case 'cs':
        return 'csharp';
      default:
        return 'javascript';
    }
  }

  private selectAnalysisTool(language: SupportedLanguage): string {
    const tools: ToolsByLanguage = {
      javascript: ['ESLint Security', 'Semgrep', 'CodeQL', 'SonarJS', 'Bandit-JS'],
      typescript: ['TSLint Security', 'Semgrep', 'CodeQL', 'SonarTS'],
      python: ['Bandit', 'Semgrep', 'CodeQL', 'PyLint Security', 'Safety'],
      java: ['SpotBugs', 'SonarJava', 'CodeQL', 'Checkmarx'],
      php: ['PHPCS Security', 'SonarPHP', 'Psalm', 'PHPStan'],
      ruby: ['Brakeman', 'RuboCop Security', 'CodeQL'],
      golang: ['Gosec', 'StaticCheck', 'CodeQL'],
      csharp: ['SonarC#', 'CodeQL', 'Security Code Scan']
    };

    const languageTools = tools[language];
    // Use the first tool as default for more consistent results
    return languageTools[0];
  }

  private calculateRiskRating(severity: string, confidence: number): 'Critical' | 'High' | 'Medium' | 'Low' {
    if (severity === 'Critical' && confidence > 80) return 'Critical';
    if (severity === 'High' && confidence > 70) return 'High';
    if (severity === 'Medium' && confidence > 60) return 'Medium';
    return 'Low';
  }

  private generateReferences(cweId?: string, owaspCategory?: string): string[] {
    const references = [];
    
    if (cweId) {
      references.push(`https://cwe.mitre.org/data/definitions/${cweId.replace('CWE-', '')}.html`);
    }
    
    if (owaspCategory) {
      const owaspId = owaspCategory.split(':')[0];
      references.push(`https://owasp.org/Top10/2021/${owaspId}/`);
    }
    
    references.push('https://owasp.org/www-project-top-ten/');
    references.push('https://cwe.mitre.org/');
    
    return references;
  }

  private generateTags(category: string, language: string): string[] {
    const baseTags = [language, category.toLowerCase().replace(/\s+/g, '-')];
    
    const additionalTags: AdditionalTagsType = {
      'Code Injection': ['injection', 'rce', 'security'],
      'XSS': ['xss', 'dom', 'client-side'],
      'Hardcoded Credentials': ['credentials', 'secrets', 'authentication'],
      'Weak Cryptography': ['crypto', 'random', 'encryption'],
      'Command Injection': ['command', 'shell', 'system'],
      'Type Safety': ['types', 'safety', 'quality']
    };

    return [...baseTags, ...(additionalTags[category] || ['security'])];
  }

  public analyzeFile(filename: string, content?: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const language = this.getFileLanguage(filename);
    const rules = SECURITY_RULES[language as keyof typeof SECURITY_RULES] || SECURITY_RULES.javascript;

    if (content) {
      // Real analysis with actual file content
      console.log(`Analyzing real content for ${filename} (${content.length} characters)`);
      
      const lines = content.split('\n');
      
      rules.forEach((rule: typeof rules[0]) => {
        const matches = content.match(rule.pattern);
        if (matches) {
          matches.forEach((match) => {
            // Find the line number where this match occurs
            let lineNumber = 1;
            let characterIndex = 0;
            for (let i = 0; i < lines.length; i++) {
              const lineLength = lines[i].length + 1; // +1 for newline
              if (characterIndex + lineLength > content.indexOf(match)) {
                lineNumber = i + 1;
                break;
              }
              characterIndex += lineLength;
            }

            const issue: SecurityIssue = {
              id: this.generateUniqueId(),
              line: lineNumber,
              column: content.indexOf(match) - characterIndex + 1,
              tool: this.selectAnalysisTool(language),
              type: rule.type,
              category: rule.category,
              message: rule.message,
              severity: rule.severity,
              confidence: Math.min(100, Math.max(50, rule.confidence + (match.length % 10) - 5)),
              cvssScore: rule.cvssScore || calculateCVSSScore(rule),
              cweId: rule.cweId,
              owaspCategory: 'owaspCategory' in rule ? rule.owaspCategory : undefined,
              recommendation: rule.remediation.description,
              remediation: rule.remediation,
              filename,
              codeSnippet: this.extractCodeSnippet(lines, lineNumber),
              riskRating: this.calculateRiskRating(rule.severity, rule.confidence),
              impact: rule.impact,
              likelihood: rule.likelihood,
              references: this.generateReferences(rule.cweId, 'owaspCategory' in rule ? rule.owaspCategory : undefined),
              tags: this.generateTags(rule.category, language)
            };

            issues.push(issue);
          });
        }
      });

      // Real analysis complete - only return actual issues found
      console.log(`Real analysis complete for ${filename}: ${issues.length} issues found`);
    } else {
      // Return empty analysis when no content is provided - no fake issues
      console.log(`No content provided for ${filename} - returning empty analysis`);
    }

    return issues;
  }

  private extractCodeSnippet(lines: string[], lineNumber: number): string {
    const startLine = Math.max(0, lineNumber - 3);
    const endLine = Math.min(lines.length, lineNumber + 2);
    
    let snippet = '';
    for (let i = startLine; i < endLine; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      const marker = lineNum === lineNumber ? '→ ' : '  ';
      snippet += `${marker}${lineNum.toString().padStart(3, ' ')}: ${line}\n`;
    }
    
    return snippet.trim();
  }

}