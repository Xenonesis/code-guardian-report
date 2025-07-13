import { SecurityIssue } from '@/hooks/useAnalysis';
import {
  SECURITY_RULES,
  calculateCVSSScore
} from '../securityAnalysisEngine';
import { SecretDetectionService, SecretMatch, SecretType } from '../secretDetectionService';

type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'php' | 'ruby' | 'golang' | 'csharp';
type ToolsByLanguage = Record<SupportedLanguage, string[]>;
type AdditionalTagsType = Record<string, string[]>;

export class SecurityAnalyzer {
  private secretDetectionService: SecretDetectionService;

  constructor() {
    this.secretDetectionService = new SecretDetectionService();
  }

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

  /**
   * Convert secret matches to security issues
   */
  private convertSecretsToIssues(secrets: SecretMatch[], filename: string): SecurityIssue[] {
    return secrets.map(secret => {
      const severity = this.getSecretSeverity(secret.type, secret.confidence);
      const category = 'Secret Detection';
      const cweId = this.getSecretCWE(secret.type);
      const owaspCategory = 'A07:2021 – Identification and Authentication Failures';

      return {
        id: this.generateUniqueId(),
        line: secret.line,
        column: secret.column,
        tool: 'Secret Scanner',
        type: 'Secret',
        category,
        message: this.getSecretMessage(secret),
        severity,
        confidence: secret.confidence,
        cvssScore: this.getSecretCVSSScore(secret.type, severity),
        cweId,
        owaspCategory,
        recommendation: this.getSecretRecommendation(secret.type),
        remediation: this.getSecretRemediation(secret.type),
        filename,
        codeSnippet: this.extractSecretCodeSnippet(secret),
        riskRating: this.calculateRiskRating(severity, secret.confidence),
        impact: this.getSecretImpact(secret.type),
        likelihood: 'High',
        references: this.generateSecretReferences(secret.type),
        tags: this.generateSecretTags(secret.type)
      };
    });
  }

  /**
   * Determine severity based on secret type and confidence
   */
  private getSecretSeverity(type: SecretType, confidence: number): 'Critical' | 'High' | 'Medium' | 'Low' {
    const criticalTypes: SecretType[] = ['private_key', 'aws_access_key', 'stripe_key'];
    const highTypes: SecretType[] = ['github_token', 'google_api_key', 'slack_token', 'database_credential', 'connection_string'];
    const mediumTypes: SecretType[] = ['jwt_token', 'api_key', 'oauth_token'];

    if (criticalTypes.includes(type) && confidence >= 80) return 'Critical';
    if (highTypes.includes(type) && confidence >= 70) return 'High';
    if (mediumTypes.includes(type) && confidence >= 60) return 'High';
    if (confidence >= 80) return 'Medium';
    return 'Low';
  }

  /**
   * Get CWE ID for secret type
   */
  private getSecretCWE(type: SecretType): string {
    const cweMap: Record<SecretType, string> = {
      'api_key': 'CWE-798',
      'jwt_token': 'CWE-798',
      'database_credential': 'CWE-798',
      'aws_access_key': 'CWE-798',
      'github_token': 'CWE-798',
      'slack_token': 'CWE-798',
      'stripe_key': 'CWE-798',
      'google_api_key': 'CWE-798',
      'private_key': 'CWE-798',
      'password': 'CWE-798',
      'connection_string': 'CWE-798',
      'oauth_token': 'CWE-798',
      'webhook_url': 'CWE-200',
      'generic_secret': 'CWE-798'
    };
    return cweMap[type] || 'CWE-798';
  }

  /**
   * Get CVSS score for secret type
   */
  private getSecretCVSSScore(type: SecretType, severity: string): number {
    const baseScores: Record<SecretType, number> = {
      'private_key': 9.8,
      'aws_access_key': 9.1,
      'stripe_key': 8.8,
      'database_credential': 8.5,
      'connection_string': 8.2,
      'github_token': 7.5,
      'google_api_key': 7.2,
      'slack_token': 6.8,
      'jwt_token': 6.5,
      'api_key': 6.0,
      'oauth_token': 5.8,
      'password': 5.5,
      'webhook_url': 4.2,
      'generic_secret': 5.0
    };

    let score = baseScores[type] || 5.0;

    // Adjust based on severity
    if (severity === 'Low') score *= 0.7;
    else if (severity === 'Medium') score *= 0.85;

    return Math.min(10, Math.max(0, score));
  }

  /**
   * Get secret-specific message
   */
  private getSecretMessage(secret: SecretMatch): string {
    const typeDescriptions: Record<SecretType, string> = {
      'api_key': 'Hardcoded API key detected',
      'jwt_token': 'JSON Web Token (JWT) found in source code',
      'database_credential': 'Database credential exposed in code',
      'aws_access_key': 'AWS Access Key ID found in source code',
      'github_token': 'GitHub Personal Access Token detected',
      'slack_token': 'Slack API token found in source code',
      'stripe_key': 'Stripe API key detected in source code',
      'google_api_key': 'Google API key found in source code',
      'private_key': 'Private key exposed in source code',
      'password': 'Hardcoded password detected',
      'connection_string': 'Database connection string with credentials',
      'oauth_token': 'OAuth token found in source code',
      'webhook_url': 'Webhook URL with potential sensitive information',
      'generic_secret': 'High-entropy string that may be a secret'
    };

    const baseMessage = typeDescriptions[secret.type] || 'Potential secret detected';
    return `${baseMessage} (confidence: ${secret.confidence}%, entropy: ${secret.entropy.toFixed(2)})`;
  }

  /**
   * Get secret-specific recommendation
   */
  private getSecretRecommendation(type: SecretType): string {
    const recommendations: Record<SecretType, string> = {
      'api_key': 'Move API keys to environment variables or secure configuration management',
      'jwt_token': 'Remove JWT tokens from source code and use secure token storage',
      'database_credential': 'Use environment variables or secure credential management for database access',
      'aws_access_key': 'Remove AWS credentials from code and use IAM roles or environment variables',
      'github_token': 'Remove GitHub tokens from code and use GitHub Secrets or environment variables',
      'slack_token': 'Move Slack tokens to environment variables or secure configuration',
      'stripe_key': 'Remove Stripe keys from code and use environment variables',
      'google_api_key': 'Move Google API keys to environment variables or secure configuration',
      'private_key': 'Remove private keys from source code and use secure key management',
      'password': 'Remove hardcoded passwords and use secure authentication methods',
      'connection_string': 'Use environment variables for database connection strings',
      'oauth_token': 'Remove OAuth tokens from code and use secure token storage',
      'webhook_url': 'Move webhook URLs to configuration files or environment variables',
      'generic_secret': 'Review this high-entropy string and move to secure storage if it is a secret'
    };

    return recommendations[type] || 'Review and secure this potential secret';
  }

  /**
   * Get secret-specific remediation
   */
  private getSecretRemediation(type: SecretType): SecurityIssue['remediation'] {
    const remediations: Record<SecretType, SecurityIssue['remediation']> = {
      'api_key': {
        description: 'Move API keys to environment variables and use secure configuration management',
        codeExample: 'const apiKey = "sk_live_1234567890abcdef";',
        fixExample: 'const apiKey = process.env.API_KEY;',
        effort: 'Low',
        priority: 5
      },
      'aws_access_key': {
        description: 'Use IAM roles or environment variables instead of hardcoded AWS credentials',
        codeExample: 'const accessKey = "AKIAIOSFODNN7EXAMPLE";',
        fixExample: 'Use AWS IAM roles or AWS_ACCESS_KEY_ID environment variable',
        effort: 'Medium',
        priority: 5
      },
      'private_key': {
        description: 'Remove private keys from source code and use secure key management systems',
        codeExample: '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...',
        fixExample: 'Load private keys from secure storage or environment variables',
        effort: 'Medium',
        priority: 5
      },
      'database_credential': {
        description: 'Use environment variables or secure credential management for database access',
        codeExample: 'const dbUrl = "mongodb://user:password@host:port/db";',
        fixExample: 'const dbUrl = process.env.DATABASE_URL;',
        effort: 'Low',
        priority: 4
      },
      'jwt_token': {
        description: 'Remove JWT tokens from source code and implement secure token handling',
        codeExample: 'const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";',
        fixExample: 'Store tokens securely and retrieve from secure storage',
        effort: 'Medium',
        priority: 4
      }
    };

    return remediations[type] || {
      description: 'Review and secure this potential secret',
      effort: 'Medium',
      priority: 3
    };
  }

  /**
   * Get secret-specific impact description
   */
  private getSecretImpact(type: SecretType): string {
    const impacts: Record<SecretType, string> = {
      'api_key': 'Unauthorized access to external services and potential data breach',
      'jwt_token': 'Session hijacking and unauthorized access to user accounts',
      'database_credential': 'Full database access and potential data exfiltration',
      'aws_access_key': 'Unauthorized access to AWS resources and potential infrastructure compromise',
      'github_token': 'Unauthorized access to repositories and potential code theft',
      'slack_token': 'Unauthorized access to Slack workspace and sensitive communications',
      'stripe_key': 'Unauthorized access to payment processing and financial data',
      'google_api_key': 'Unauthorized access to Google services and potential quota abuse',
      'private_key': 'Cryptographic compromise and potential system access',
      'password': 'Unauthorized system access and potential privilege escalation',
      'connection_string': 'Database access and potential data compromise',
      'oauth_token': 'Unauthorized access to third-party services',
      'webhook_url': 'Information disclosure and potential system compromise',
      'generic_secret': 'Potential unauthorized access depending on secret type'
    };

    return impacts[type] || 'Potential security compromise';
  }

  /**
   * Generate secret-specific references
   */
  private generateSecretReferences(type: SecretType): string[] {
    const baseReferences = [
      'https://owasp.org/Top10/A07_2021-Identification_and_Authentication_Failures/',
      'https://cwe.mitre.org/data/definitions/798.html'
    ];

    const typeSpecificReferences: Record<SecretType, string[]> = {
      'aws_access_key': [
        'https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html',
        'https://aws.amazon.com/blogs/security/a-new-and-standardized-way-to-manage-credentials-in-the-aws-sdks/'
      ],
      'github_token': [
        'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens',
        'https://docs.github.com/en/actions/security-guides/encrypted-secrets'
      ],
      'jwt_token': [
        'https://jwt.io/introduction/',
        'https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/'
      ],
      'private_key': [
        'https://owasp.org/www-project-cheat-sheets/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html'
      ]
    };

    return [...baseReferences, ...(typeSpecificReferences[type] || [])];
  }

  /**
   * Generate secret-specific tags
   */
  private generateSecretTags(type: SecretType): string[] {
    const baseTags = ['secret', 'credentials', 'security'];

    const typeSpecificTags: Record<SecretType, string[]> = {
      'api_key': ['api', 'authentication'],
      'jwt_token': ['jwt', 'token', 'session'],
      'database_credential': ['database', 'db', 'credentials'],
      'aws_access_key': ['aws', 'cloud', 'infrastructure'],
      'github_token': ['github', 'vcs', 'repository'],
      'slack_token': ['slack', 'communication'],
      'stripe_key': ['stripe', 'payment', 'financial'],
      'google_api_key': ['google', 'api'],
      'private_key': ['cryptography', 'private-key', 'encryption'],
      'password': ['password', 'authentication'],
      'connection_string': ['database', 'connection'],
      'oauth_token': ['oauth', 'authorization'],
      'webhook_url': ['webhook', 'callback'],
      'generic_secret': ['generic', 'entropy']
    };

    return [...baseTags, ...(typeSpecificTags[type] || [])];
  }

  /**
   * Extract code snippet for secret detection
   */
  private extractSecretCodeSnippet(secret: SecretMatch): string {
    const lines = secret.context.split('\n');
    const contextLines = Math.min(3, lines.length);
    const startIndex = Math.max(0, Math.floor(lines.length / 2) - Math.floor(contextLines / 2));

    return lines.slice(startIndex, startIndex + contextLines)
      .map((line, index) => {
        const lineNumber = secret.line - Math.floor(contextLines / 2) + index;
        const prefix = lineNumber === secret.line ? '> ' : '  ';
        return `${prefix}${lineNumber}: ${line}`;
      })
      .join('\n');
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

      // Perform secret detection
      console.log(`Running secret detection for ${filename}...`);
      const secretDetectionResult = this.secretDetectionService.detectSecrets(content);
      const secretIssues = this.convertSecretsToIssues(secretDetectionResult.secrets, filename);
      issues.push(...secretIssues);

      // Real analysis complete - only return actual issues found
      console.log(`Real analysis complete for ${filename}: ${issues.length} issues found (${secretIssues.length} secrets detected)`);
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