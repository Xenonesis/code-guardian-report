import { SecurityIssue, AnalysisResults } from '@/hooks/useAnalysis';
import { 
  SECURITY_RULES, 
  DEPENDENCY_VULNERABILITIES, 
  calculateCVSSScore, 
  calculateSecurityScore,
  OWASP_CATEGORIES,
  CWE_MAPPINGS 
} from './securityAnalysisEngine';

export class EnhancedAnalysisEngine {
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
        return 'javascript'; // Default fallback
    }
  }

  private generateRealisticCode(language: string, issueType: string): string {
    const codeExamples = {
      javascript: {
        'Code Injection': `
function processUserInput(input) {
  // Vulnerable: Using eval with user input
  return eval(input);
}`,
        'XSS': `
function displayMessage(message) {
  // Vulnerable: Direct innerHTML assignment
  document.getElementById('output').innerHTML = message;
}`,
        'Hardcoded Credentials': `
const config = {
  apiKey: "sk-1234567890abcdef",
  password: "admin123"
};`,
        'Weak Cryptography': `
function generateToken() {
  // Vulnerable: Using Math.random for security
  return Math.random().toString(36);
}`
      },
      python: {
        'Code Injection': `
def execute_command(user_input):
    # Vulnerable: Using exec with user input
    exec(user_input)`,
        'Command Injection': `
import subprocess
def run_command(cmd):
    # Vulnerable: shell=True with user input
    subprocess.call(cmd, shell=True)`
      }
    };

    return codeExamples[language]?.[issueType] || `// Code example for ${issueType}`;
  }

  private analyzeFileContent(filename: string, content?: string): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const language = this.getFileLanguage(filename);
    const rules = SECURITY_RULES[language] || SECURITY_RULES.javascript;

    // Simulate realistic file analysis
    const numIssues = Math.floor(Math.random() * 8) + 2; // 2-9 issues per file
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
        confidence: rule.confidence + Math.floor(Math.random() * 10) - 5, // ±5 variation
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

  private analyzeDependencies(): {
    total: number;
    vulnerable: number;
    outdated: number;
    riskScore: number;
    recommendations: string[];
  } {
    // Simulate dependency analysis
    const totalDeps = Math.floor(Math.random() * 50) + 20;
    const vulnerableDeps = Math.floor(Math.random() * 5) + 1;
    const outdatedDeps = Math.floor(Math.random() * 10) + 3;

    return {
      total: totalDeps,
      vulnerable: vulnerableDeps,
      outdated: outdatedDeps,
      licenses: ['MIT', 'Apache-2.0', 'BSD-3-Clause', 'ISC', 'GPL-3.0']
    };
  }

  public async analyzeCodebase(filename: string): Promise<AnalysisResults> {
    console.log('Starting enhanced security analysis for:', filename);

    // Simulate analyzing multiple files
    const fileTypes = ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.php'];
    const directories = ['components', 'utils', 'services', 'pages', 'api', 'lib'];
    const totalFiles = Math.floor(Math.random() * 30) + 15;
    
    let allIssues: SecurityIssue[] = [];
    let linesAnalyzed = 0;

    // Generate issues for multiple files
    for (let i = 0; i < totalFiles; i++) {
      const dir = directories[Math.floor(Math.random() * directories.length)];
      const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)];
      const fileName = `src/${dir}/${filename.replace('.zip', '')}_${i}${fileType}`;
      
      const fileIssues = this.analyzeFileContent(fileName);
      allIssues = [...allIssues, ...fileIssues];
      linesAnalyzed += Math.floor(Math.random() * 200) + 50;
    }

    // Calculate metrics
    const criticalIssues = allIssues.filter(i => i.severity === 'Critical').length;
    const highIssues = allIssues.filter(i => i.severity === 'High').length;
    const mediumIssues = allIssues.filter(i => i.severity === 'Medium').length;
    const lowIssues = allIssues.filter(i => i.severity === 'Low').length;

    const securityScore = calculateSecurityScore(allIssues);
    const qualityScore = Math.max(0, 100 - (allIssues.length * 2));
    const vulnerabilityDensity = (allIssues.length / linesAnalyzed) * 1000; // per 1000 lines

    const analysisResults: AnalysisResults = {
      issues: allIssues,
      totalFiles,
      analysisTime: (Math.random() * 8 + 2).toFixed(1) + 's',
      summary: {
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues,
        securityScore,
        qualityScore,
        coveragePercentage: Math.floor(Math.random() * 30) + 70,
        linesAnalyzed
      },
      metrics: {
        vulnerabilityDensity: Math.round(vulnerabilityDensity * 100) / 100,
        technicalDebt: `${Math.floor(Math.random() * 20) + 5} hours`,
        maintainabilityIndex: Math.floor(Math.random() * 40) + 60,
        duplicatedLines: Math.floor(Math.random() * 500) + 100,
        testCoverage: Math.floor(Math.random() * 40) + 60
      },
      dependencies: this.analyzeDependencies()
    };

    console.log('Enhanced analysis complete:', {
      totalIssues: allIssues.length,
      securityScore,
      qualityScore
    });

    return analysisResults;
  }
}
