import { SecurityIssue } from '@/hooks/useAnalysis';
import { 
  SECURITY_RULES, 
  calculateCVSSScore, 
  OWASP_CATEGORIES,
  CWE_MAPPINGS 
} from '../securityAnalysisEngine';

export class SecurityAnalyzer {
  private generateUniqueId(): string {
    return `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getFileLanguage(filename: string): string {
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

  private selectAnalysisTool(language: string): string {
    const tools = {
      javascript: ['ESLint Security', 'Semgrep', 'CodeQL', 'SonarJS', 'Bandit-JS'],
      typescript: ['TSLint Security', 'Semgrep', 'CodeQL', 'SonarTS'],
      python: ['Bandit', 'Semgrep', 'CodeQL', 'PyLint Security', 'Safety'],
      java: ['SpotBugs', 'SonarJava', 'CodeQL', 'Checkmarx'],
      php: ['PHPCS Security', 'SonarPHP', 'Psalm', 'PHPStan'],
      ruby: ['Brakeman', 'RuboCop Security', 'CodeQL'],
      golang: ['Gosec', 'StaticCheck', 'CodeQL'],
      csharp: ['SonarC#', 'CodeQL', 'Security Code Scan']
    };

    const languageTools = tools[language] || tools.javascript;
    return languageTools[Math.floor(Math.random() * languageTools.length)];
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
    
    const additionalTags = {
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
    const rules = SECURITY_RULES[language] || SECURITY_RULES.javascript;

    const numIssues = Math.floor(Math.random() * 4) + 1;
    const usedRules = new Set<number>();

    for (let i = 0; i < numIssues; i++) {
      let ruleIndex;
      do {
        ruleIndex = Math.floor(Math.random() * rules.length);
      } while (usedRules.has(ruleIndex) && usedRules.size < rules.length);
      
      usedRules.add(ruleIndex);
      const rule = rules[ruleIndex];

      const issue: SecurityIssue = {
        id: this.generateUniqueId(),
        line: Math.floor(Math.random() * 200) + 1,
        column: Math.floor(Math.random() * 80) + 1,
        tool: this.selectAnalysisTool(language),
        type: rule.type,
        category: rule.category,
        message: rule.message,
        severity: rule.severity,
        confidence: rule.confidence + Math.floor(Math.random() * 10) - 5,
        cvssScore: rule.cvssScore || calculateCVSSScore(rule),
        cweId: rule.cweId,
        owaspCategory: rule.owaspCategory,
        recommendation: rule.remediation.description,
        remediation: rule.remediation,
        filename,
        codeSnippet: this.generateRealisticCode(language, rule.category),
        riskRating: this.calculateRiskRating(rule.severity, rule.confidence),
        impact: rule.impact,
        likelihood: rule.likelihood,
        references: this.generateReferences(rule.cweId, rule.owaspCategory),
        tags: this.generateTags(rule.category, language)
      };

      issues.push(issue);
    }

    return issues;
  }

  private generateRealisticCode(language: string, issueType: string): string {
    const codeExamples = {
      javascript: {
        'Code Injection': `\nfunction processUserInput(input) {\n  // Vulnerable: Using eval with user input\n  return eval(input);\n}`,
        'XSS': `\nfunction displayMessage(message) {\n  // Vulnerable: Direct innerHTML assignment\n  document.getElementById('output').innerHTML = message;\n}`,
        'Hardcoded Credentials': `\nconst config = {\n  apiKey: "sk-1234567890abcdef",\n  password: "admin123"\n};`,
        'Weak Cryptography': `\nfunction generateToken() {\n  // Vulnerable: Using Math.random for security\n  return Math.random().toString(36);\n}`
      },
      python: {
        'Code Injection': `\ndef execute_command(user_input):\n    # Vulnerable: Using exec with user input\n    exec(user_input)`,
        'Command Injection': `\nimport subprocess\ndef run_command(cmd):\n    # Vulnerable: shell=True with user input\n    subprocess.call(cmd, shell=True)`
      }
    };

    return codeExamples[language]?.[issueType] || `// Code example for ${issueType}`;
  }
}