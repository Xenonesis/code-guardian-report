import { SecurityIssue } from '@/hooks/useAnalysis';
import {
  SECURITY_RULES,
  calculateCVSSScore
} from '../securityAnalysisEngine';
import { SecretDetectionService, SecretMatch, SecretType } from '../secretDetectionService';
import { LanguageDetectionService, DetectionResult, LanguageInfo, FrameworkInfo } from '../languageDetectionService';
import { FrameworkDetectionEngine, DependencyInfo } from '../frameworkDetectionEngine';
import { naturalLanguageDescriptionService } from '../naturalLanguageDescriptionService';

type SupportedLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'php' | 'ruby' | 'golang' | 'csharp';
type ToolsByLanguage = Record<SupportedLanguage, string[]>;
type AdditionalTagsType = Record<string, string[]>;

export interface EnhancedAnalysisContext {
  detectionResult: DetectionResult;
  frameworkSpecificRules: SecurityRule[];
  recommendedTools: string[];
}

export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  category: string;
  languages: string[];
  frameworks?: string[];
  pattern: RegExp;
  cweId?: string;
  owaspCategory?: string;
  remediation: {
    description: string;
    example?: string;
  };
}

export class SecurityAnalyzer {
  private secretDetectionService: SecretDetectionService;
  private languageDetectionService: LanguageDetectionService;
  private frameworkDetectionEngine: FrameworkDetectionEngine;
  private analysisContext?: EnhancedAnalysisContext;

  constructor() {
    this.secretDetectionService = new SecretDetectionService();
    this.languageDetectionService = new LanguageDetectionService();
    this.frameworkDetectionEngine = new FrameworkDetectionEngine();
  }

  /**
   * Initialize analysis context with smart language and framework detection
   */
  public async initializeAnalysisContext(files: { filename: string; content: string }[]): Promise<EnhancedAnalysisContext> {
    console.log('🔍 Initializing smart language detection...');

    // Detect languages and frameworks
    const detectionResult = await this.languageDetectionService.analyzeCodebase(files);

    // Get framework-specific security rules
    const frameworkSpecificRules = this.getFrameworkSpecificRules(detectionResult.frameworks);

    // Get recommended analysis tools
    const recommendedTools = this.languageDetectionService.getRecommendedTools(detectionResult);

    this.analysisContext = {
      detectionResult,
      frameworkSpecificRules,
      recommendedTools
    };

    console.log('✅ Language detection complete:', {
      primaryLanguage: detectionResult.primaryLanguage.name,
      frameworks: detectionResult.frameworks.map(f => f.name),
      projectType: detectionResult.projectStructure.type,
      recommendedTools: recommendedTools.slice(0, 3)
    });

    return this.analysisContext;
  }

  private generateUniqueId(): string {
    return `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get framework-specific security rules
   */
  private getFrameworkSpecificRules(frameworks: FrameworkInfo[]): SecurityRule[] {
    const rules: SecurityRule[] = [];

    for (const framework of frameworks) {
      switch (framework.name) {
        case 'React':
        case 'Next.js':
          rules.push(...this.getReactSecurityRules());
          break;
        case 'Angular':
          rules.push(...this.getAngularSecurityRules());
          break;
        case 'Vue.js':
        case 'Nuxt.js':
          rules.push(...this.getVueSecurityRules());
          break;
        case 'Django':
          rules.push(...this.getDjangoSecurityRules());
          break;
        case 'Flask':
        case 'FastAPI':
          rules.push(...this.getPythonWebSecurityRules());
          break;
        case 'Spring Boot':
          rules.push(...this.getSpringSecurityRules());
          break;
        case 'Express.js':
        case 'NestJS':
          rules.push(...this.getNodeSecurityRules());
          break;
        case 'Laravel':
          rules.push(...this.getLaravelSecurityRules());
          break;
      }
    }

    return rules;
  }

  private getReactSecurityRules(): SecurityRule[] {
    return [
      {
        id: 'react-xss-dangerouslySetInnerHTML',
        name: 'Dangerous innerHTML Usage',
        description: 'Usage of dangerouslySetInnerHTML without proper sanitization can lead to XSS attacks',
        severity: 'High',
        category: 'Cross-Site Scripting',
        languages: ['javascript', 'typescript'],
        frameworks: ['React', 'Next.js'],
        pattern: /dangerouslySetInnerHTML\s*:\s*\{\s*__html\s*:/,
        cweId: 'CWE-79',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Use DOMPurify or similar library to sanitize HTML content before rendering',
          example: 'import DOMPurify from "dompurify"; const clean = DOMPurify.sanitize(dirty);'
        }
      },
      {
        id: 'react-href-javascript',
        name: 'JavaScript URL in href',
        description: 'Using javascript: URLs in href attributes can lead to XSS vulnerabilities',
        severity: 'Medium',
        category: 'Cross-Site Scripting',
        languages: ['javascript', 'typescript'],
        frameworks: ['React', 'Next.js'],
        pattern: /href\s*=\s*["`']javascript:/,
        cweId: 'CWE-79',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Use onClick handlers instead of javascript: URLs',
          example: '<a onClick={handleClick}>Click me</a>'
        }
      },
      {
        id: 'react-eval-usage',
        name: 'Eval Usage in React',
        description: 'Using eval() function can lead to code injection vulnerabilities',
        severity: 'Critical',
        category: 'Code Injection',
        languages: ['javascript', 'typescript'],
        frameworks: ['React', 'Next.js'],
        pattern: /\beval\s*\(/,
        cweId: 'CWE-95',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Avoid using eval(). Use JSON.parse() for JSON data or Function constructor for safer alternatives',
          example: 'const data = JSON.parse(jsonString);'
        }
      }
    ];
  }

  private getAngularSecurityRules(): SecurityRule[] {
    return [
      {
        id: 'angular-bypassSecurityTrust',
        name: 'Bypassing Angular Security',
        description: 'Using bypassSecurityTrust methods without proper validation can introduce XSS vulnerabilities',
        severity: 'High',
        category: 'Cross-Site Scripting',
        languages: ['typescript'],
        frameworks: ['Angular'],
        pattern: /bypassSecurityTrust(Html|Style|Script|Url|ResourceUrl)/,
        cweId: 'CWE-79',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Validate and sanitize content before bypassing Angular security',
          example: 'Only bypass security for trusted content from secure sources'
        }
      },
      {
        id: 'angular-innerHTML',
        name: 'Direct innerHTML Usage',
        description: 'Direct manipulation of innerHTML bypasses Angular sanitization',
        severity: 'Medium',
        category: 'Cross-Site Scripting',
        languages: ['typescript'],
        frameworks: ['Angular'],
        pattern: /\.innerHTML\s*=/,
        cweId: 'CWE-79',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Use Angular data binding or Renderer2 for DOM manipulation',
          example: 'Use [innerHTML] binding or this.renderer.setProperty()'
        }
      }
    ];
  }

  private getVueSecurityRules(): SecurityRule[] {
    return [
      {
        id: 'vue-v-html-xss',
        name: 'Unsafe v-html Usage',
        description: 'Using v-html directive with unsanitized content can lead to XSS attacks',
        severity: 'High',
        category: 'Cross-Site Scripting',
        languages: ['javascript', 'typescript'],
        frameworks: ['Vue.js', 'Nuxt.js'],
        pattern: /v-html\s*=\s*["`'][^"`']*["`']/,
        cweId: 'CWE-79',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Sanitize HTML content before using v-html directive',
          example: 'Use DOMPurify.sanitize() before binding to v-html'
        }
      }
    ];
  }

  private getDjangoSecurityRules(): SecurityRule[] {
    return [
      {
        id: 'django-sql-injection',
        name: 'Django SQL Injection',
        description: 'Raw SQL queries without parameterization can lead to SQL injection',
        severity: 'Critical',
        category: 'SQL Injection',
        languages: ['python'],
        frameworks: ['Django'],
        pattern: /\.raw\s*\(\s*[f"'`][^"'`]*%[^"'`]*[f"'`]/,
        cweId: 'CWE-89',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Use Django ORM or parameterized queries',
          example: 'Model.objects.raw("SELECT * FROM table WHERE id = %s", [user_id])'
        }
      },
      {
        id: 'django-debug-true',
        name: 'Debug Mode in Production',
        description: 'DEBUG = True in production exposes sensitive information',
        severity: 'High',
        category: 'Information Disclosure',
        languages: ['python'],
        frameworks: ['Django'],
        pattern: /DEBUG\s*=\s*True/,
        cweId: 'CWE-200',
        owaspCategory: 'A01:2021 – Broken Access Control',
        remediation: {
          description: 'Set DEBUG = False in production settings',
          example: 'DEBUG = False'
        }
      }
    ];
  }

  private getPythonWebSecurityRules(): SecurityRule[] {
    return [
      {
        id: 'flask-debug-mode',
        name: 'Flask Debug Mode',
        description: 'Running Flask in debug mode in production is dangerous',
        severity: 'High',
        category: 'Information Disclosure',
        languages: ['python'],
        frameworks: ['Flask'],
        pattern: /app\.run\s*\([^)]*debug\s*=\s*True/,
        cweId: 'CWE-200',
        owaspCategory: 'A01:2021 – Broken Access Control',
        remediation: {
          description: 'Disable debug mode in production',
          example: 'app.run(debug=False)'
        }
      }
    ];
  }

  private getSpringSecurityRules(): SecurityRule[] {
    return [
      {
        id: 'spring-sql-injection',
        name: 'Spring SQL Injection',
        description: 'String concatenation in SQL queries can lead to SQL injection',
        severity: 'Critical',
        category: 'SQL Injection',
        languages: ['java'],
        frameworks: ['Spring Boot'],
        pattern: /createQuery\s*\(\s*["`'][^"`']*\+[^"`']*["`']/,
        cweId: 'CWE-89',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Use parameterized queries or JPA criteria API',
          example: 'createQuery("SELECT u FROM User u WHERE u.id = :id").setParameter("id", userId)'
        }
      }
    ];
  }

  private getNodeSecurityRules(): SecurityRule[] {
    return [
      {
        id: 'node-eval-usage',
        name: 'Node.js Eval Usage',
        description: 'Using eval() in Node.js can lead to code injection',
        severity: 'Critical',
        category: 'Code Injection',
        languages: ['javascript', 'typescript'],
        frameworks: ['Express.js', 'NestJS'],
        pattern: /\beval\s*\(/,
        cweId: 'CWE-95',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Avoid eval(). Use JSON.parse() or safer alternatives',
          example: 'const data = JSON.parse(jsonString);'
        }
      }
    ];
  }

  private getLaravelSecurityRules(): SecurityRule[] {
    return [
      {
        id: 'laravel-raw-queries',
        name: 'Laravel Raw SQL',
        description: 'Raw SQL queries without parameter binding can cause SQL injection',
        severity: 'Critical',
        category: 'SQL Injection',
        languages: ['php'],
        frameworks: ['Laravel'],
        pattern: /DB::raw\s*\(\s*["`'][^"`']*\$[^"`']*["`']/,
        cweId: 'CWE-89',
        owaspCategory: 'A03:2021 – Injection',
        remediation: {
          description: 'Use Eloquent ORM or parameter binding',
          example: 'DB::select("SELECT * FROM users WHERE id = ?", [$id])'
        }
      }
    ];
  }

  private getFileLanguage(filename: string): SupportedLanguage {
    // Use the enhanced language detection if available
    if (this.analysisContext?.detectionResult) {
      const detectedLang = this.analysisContext.detectionResult.primaryLanguage.name;
      switch (detectedLang) {
        case 'javascript':
        case 'typescript':
        case 'python':
        case 'java':
        case 'php':
        case 'ruby':
        case 'go':
        case 'csharp':
          return detectedLang as SupportedLanguage;
        default:
          break;
      }
    }

    // Fallback to extension-based detection
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

  private selectAnalysisTool(language: SupportedLanguage, filename?: string): string {
    // Use recommended tools from language detection if available
    if (this.analysisContext?.recommendedTools.length) {
      const recommendedTool = this.analysisContext.recommendedTools[0];
      if (recommendedTool) {
        return recommendedTool;
      }
    }

    // Enhanced tool selection based on language and frameworks
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

    // Framework-specific tool selection
    if (this.analysisContext?.detectionResult.frameworks.length) {
      const frameworks = this.analysisContext.detectionResult.frameworks;

      for (const framework of frameworks) {
        switch (framework.name) {
          case 'React':
          case 'Next.js':
            return 'React Security Scanner';
          case 'Angular':
            return 'Angular Security Scanner';
          case 'Vue.js':
            return 'Vue Security Scanner';
          case 'Django':
            return 'Django Security Scanner';
          case 'Spring Boot':
            return 'Spring Security Scanner';
          case 'Laravel':
            return 'Laravel Security Scanner';
        }
      }
    }

    const languageTools = tools[language];
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

      const issue: SecurityIssue = {
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

      // Generate natural language description
      issue.naturalLanguageDescription = naturalLanguageDescriptionService.generateDescription(issue);

      return issue;
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
      description: 'Review and secure this potential secret by moving it to environment variables or secure configuration',
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
      console.log(`🔍 REAL SECURITY ANALYSIS: Analyzing ${filename} (${content.length} characters) with smart detection`);
      console.log(`📝 REAL ANALYSIS: Language detected: ${language}, Rules available: ${rules.length}`);

      // Apply framework-specific rules if available
      if (this.analysisContext?.frameworkSpecificRules.length) {
        console.log(`📋 REAL ANALYSIS: Applying ${this.analysisContext.frameworkSpecificRules.length} framework-specific rules`);
        const frameworkIssues = this.applyFrameworkSpecificRules(filename, content, this.analysisContext.frameworkSpecificRules);
        issues.push(...frameworkIssues);
        console.log(`🎯 REAL ANALYSIS: Framework rules found ${frameworkIssues.length} issues`);
      }

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
              tool: this.selectAnalysisTool(language, filename),
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

            // Generate natural language description
            issue.naturalLanguageDescription = naturalLanguageDescriptionService.generateDescription(issue);

            issues.push(issue);
          });
        }
      });

      // Perform secret detection
      console.log(`🔐 REAL ANALYSIS: Running secret detection for ${filename}...`);
      const secretDetectionResult = this.secretDetectionService.detectSecrets(content);
      const secretIssues = this.convertSecretsToIssues(secretDetectionResult.secrets, filename);
      issues.push(...secretIssues);

      // Real analysis complete - only return actual issues found
      console.log(`✅ REAL ANALYSIS COMPLETE for ${filename}: ${issues.length} total issues found`);
      console.log(`🔐 REAL ANALYSIS: ${secretIssues.length} secrets detected`);
      console.log(`🛡️ REAL ANALYSIS: ${issues.length - secretIssues.length} other security issues found`);

      if (issues.length > 0) {
        const severityCounts = issues.reduce((acc, issue) => {
          acc[issue.severity] = (acc[issue.severity] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        console.log(`📊 REAL ANALYSIS: Severity breakdown: ${JSON.stringify(severityCounts)}`);
      }
    } else {
      // Return empty analysis when no content is provided - no fake issues
      console.log(`⚠️ REAL ANALYSIS: No content provided for ${filename} - returning empty analysis`);
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

  /**
   * Apply framework-specific security rules
   */
  private applyFrameworkSpecificRules(filename: string, content: string, rules: SecurityRule[]): SecurityIssue[] {
    const issues: SecurityIssue[] = [];
    const lines = content.split('\n');

    for (const rule of rules) {
      // Check if rule applies to this file's language/framework
      const language = this.getFileLanguage(filename);
      if (!rule.languages.includes(language)) {
        continue;
      }

      // Apply the rule pattern
      const matches = content.match(new RegExp(rule.pattern.source, 'g'));
      if (matches) {
        for (const match of matches) {
          const matchIndex = content.indexOf(match);
          const lineNumber = content.substring(0, matchIndex).split('\n').length;
          const column = matchIndex - content.lastIndexOf('\n', matchIndex - 1);

          const issue: SecurityIssue = {
            id: this.generateUniqueId(),
            line: lineNumber,
            column: Math.max(1, column),
            tool: this.getFrameworkSpecificTool(rule),
            type: rule.name,
            category: rule.category,
            message: rule.description,
            severity: rule.severity,
            confidence: 85, // High confidence for framework-specific rules
            cvssScore: this.calculateFrameworkRuleCVSS(rule.severity),
            cweId: rule.cweId,
            owaspCategory: rule.owaspCategory,
            recommendation: rule.remediation.description,
            remediation: {
              description: rule.remediation.description,
              example: rule.remediation.example || '',
              references: []
            },
            filename,
            codeSnippet: this.extractCodeSnippet(lines, lineNumber),
            riskRating: this.calculateRiskRating(rule.severity, 85),
            impact: this.getFrameworkRuleImpact(rule.severity),
            likelihood: 'Medium',
            references: [`Framework: ${rule.frameworks?.join(', ') || 'Generic'}`],
            tags: [`framework-specific`, rule.category.toLowerCase().replace(/\s+/g, '-')]
          };

          // Generate natural language description
          issue.naturalLanguageDescription = naturalLanguageDescriptionService.generateDescription(issue);

          issues.push(issue);
        }
      }
    }

    return issues;
  }

  /**
   * Get tool name for framework-specific rules
   */
  private getFrameworkSpecificTool(rule: SecurityRule): string {
    if (rule.frameworks?.length) {
      return `${rule.frameworks[0]} Security Scanner`;
    }
    return 'Framework Security Scanner';
  }

  /**
   * Calculate CVSS score for framework-specific rules
   */
  private calculateFrameworkRuleCVSS(severity: SecurityRule['severity']): number {
    switch (severity) {
      case 'Critical': return 9.0;
      case 'High': return 7.5;
      case 'Medium': return 5.0;
      case 'Low': return 2.5;
      default: return 5.0;
    }
  }

  /**
   * Get impact description for framework-specific rules
   */
  private getFrameworkRuleImpact(severity: SecurityRule['severity']): string {
    switch (severity) {
      case 'Critical': return 'Critical security vulnerability that could lead to complete system compromise';
      case 'High': return 'High-risk vulnerability that could lead to significant security breach';
      case 'Medium': return 'Medium-risk vulnerability that could be exploited under certain conditions';
      case 'Low': return 'Low-risk vulnerability with limited impact';
      default: return 'Security vulnerability requiring attention';
    }
  }

  /**
   * Get analysis context for external use
   */
  public getAnalysisContext(): EnhancedAnalysisContext | undefined {
    return this.analysisContext;
  }

  /**
   * Get language detection summary
   */
  public getLanguageDetectionSummary(): string {
    if (!this.analysisContext) {
      return 'Language detection not initialized';
    }

    return this.languageDetectionService.getLanguageSummary(this.analysisContext.detectionResult);
  }

}