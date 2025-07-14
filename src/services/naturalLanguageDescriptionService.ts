import { SecurityIssue } from '@/hooks/useAnalysis';

/**
 * Natural Language Bug Description Service
 * Converts complex vulnerability findings into simplified natural language summaries
 */
export class NaturalLanguageDescriptionService {
  private static instance: NaturalLanguageDescriptionService;

  public static getInstance(): NaturalLanguageDescriptionService {
    if (!NaturalLanguageDescriptionService.instance) {
      NaturalLanguageDescriptionService.instance = new NaturalLanguageDescriptionService();
    }
    return NaturalLanguageDescriptionService.instance;
  }

  /**
   * Generate a natural language description for a security issue
   */
  public generateDescription(issue: SecurityIssue): string {
    try {
      // Use the issue type and category to determine the appropriate template
      const template = this.getDescriptionTemplate(issue);
      
      // Fill in the template with issue-specific details
      return this.populateTemplate(template, issue);
    } catch (error) {
      console.error('Error generating natural language description:', error);
      // Fallback to original message if generation fails
      return this.createFallbackDescription(issue);
    }
  }

  /**
   * Get the appropriate description template based on issue type and category
   */
  private getDescriptionTemplate(issue: SecurityIssue): DescriptionTemplate {
    const key = `${issue.category.toLowerCase()}_${issue.type.toLowerCase()}`;
    
    // Check for specific templates first
    if (this.specificTemplates.has(key)) {
      return this.specificTemplates.get(key)!;
    }

    // Check for category-based templates
    const categoryKey = issue.category.toLowerCase();
    if (this.categoryTemplates.has(categoryKey)) {
      return this.categoryTemplates.get(categoryKey)!;
    }

    // Check for type-based templates
    const typeKey = issue.type.toLowerCase();
    if (this.typeTemplates.has(typeKey)) {
      return this.typeTemplates.get(typeKey)!;
    }

    // Return default template
    return this.defaultTemplate;
  }

  /**
   * Populate a template with issue-specific information
   */
  private populateTemplate(template: DescriptionTemplate, issue: SecurityIssue): string {
    let description = template.pattern;

    // Replace placeholders with actual values
    description = description
      .replace('{severity}', this.getSeverityDescription(issue.severity))
      .replace('{file}', this.getFileDescription(issue.filename))
      .replace('{line}', issue.line.toString())
      .replace('{type}', this.getTypeDescription(issue.type))
      .replace('{category}', this.getCategoryDescription(issue.category))
      .replace('{impact}', this.getImpactDescription(issue.impact, issue.severity))
      .replace('{confidence}', this.getConfidenceDescription(issue.confidence))
      .replace('{risk}', this.getRiskDescription(issue.riskRating))
      .replace('{cvss}', issue.cvssScore ? `CVSS score of ${issue.cvssScore.toFixed(1)}` : 'unknown severity rating');

    // Add context-specific information
    if (template.addContext) {
      description += this.generateContextualInformation(issue);
    }

    return description;
  }

  /**
   * Create a fallback description when template generation fails
   */
  private createFallbackDescription(issue: SecurityIssue): string {
    return `A ${issue.severity.toLowerCase()} security issue was found in ${this.getFileDescription(issue.filename)} at line ${issue.line}. ${issue.message}`;
  }

  /**
   * Generate contextual information based on the issue
   */
  private generateContextualInformation(issue: SecurityIssue): string {
    let context = '';

    if (issue.cweId) {
      context += ` This is classified as ${issue.cweId} in the Common Weakness Enumeration.`;
    }

    if (issue.owaspCategory) {
      context += ` It falls under the OWASP ${issue.owaspCategory} category.`;
    }

    if (issue.confidence >= 90) {
      context += ' This finding has very high confidence.';
    } else if (issue.confidence >= 70) {
      context += ' This finding has high confidence.';
    } else if (issue.confidence >= 50) {
      context += ' This finding has moderate confidence.';
    } else {
      context += ' This finding has low confidence.';
    }

    return context;
  }

  /**
   * Get user-friendly severity description
   */
  private getSeverityDescription(severity: string): string {
    const severityMap: Record<string, string> = {
      'Critical': 'critical',
      'High': 'high-priority',
      'Medium': 'moderate',
      'Low': 'low-priority'
    };
    return severityMap[severity] || severity.toLowerCase();
  }

  /**
   * Get user-friendly file description
   */
  private getFileDescription(filename: string): string {
    const parts = filename.split('/');
    const fileName = parts[parts.length - 1];
    
    if (parts.length > 1) {
      return `file "${fileName}" in the ${parts[parts.length - 2]} directory`;
    }
    return `file "${fileName}"`;
  }

  /**
   * Get user-friendly type description
   */
  private getTypeDescription(type: string): string {
    const typeMap: Record<string, string> = {
      'SQL Injection': 'SQL injection vulnerability',
      'XSS': 'cross-site scripting (XSS) vulnerability',
      'CSRF': 'cross-site request forgery (CSRF) vulnerability',
      'Path Traversal': 'path traversal vulnerability',
      'Command Injection': 'command injection vulnerability',
      'Insecure Deserialization': 'insecure deserialization vulnerability',
      'Hardcoded Secret': 'hardcoded secret or credential',
      'Weak Cryptography': 'weak cryptographic implementation',
      'Authentication Bypass': 'authentication bypass vulnerability',
      'Authorization Issue': 'authorization control issue'
    };
    return typeMap[type] || type.toLowerCase();
  }

  /**
   * Get user-friendly category description
   */
  private getCategoryDescription(category: string): string {
    const categoryMap: Record<string, string> = {
      'Injection': 'injection attack',
      'Broken Authentication': 'authentication security',
      'Sensitive Data Exposure': 'data protection',
      'XML External Entities': 'XML processing security',
      'Broken Access Control': 'access control',
      'Security Misconfiguration': 'configuration security',
      'Cross-Site Scripting': 'web application security',
      'Insecure Deserialization': 'data serialization security',
      'Using Components with Known Vulnerabilities': 'dependency security',
      'Insufficient Logging & Monitoring': 'security monitoring',
      'Secret Detection': 'credential security'
    };
    return categoryMap[category] || category.toLowerCase();
  }

  /**
   * Get user-friendly impact description
   */
  private getImpactDescription(impact: string, severity: string): string {
    if (!impact || impact === 'Unknown') {
      const severityImpactMap: Record<string, string> = {
        'Critical': 'could lead to complete system compromise',
        'High': 'could cause significant security breaches',
        'Medium': 'may allow unauthorized access or data exposure',
        'Low': 'presents a minor security risk'
      };
      return severityImpactMap[severity] || 'has unknown impact';
    }
    return impact.toLowerCase();
  }

  /**
   * Get user-friendly confidence description
   */
  private getConfidenceDescription(confidence: number): string {
    if (confidence >= 90) return 'very high confidence';
    if (confidence >= 70) return 'high confidence';
    if (confidence >= 50) return 'moderate confidence';
    return 'low confidence';
  }

  /**
   * Get user-friendly risk description
   */
  private getRiskDescription(risk: string): string {
    const riskMap: Record<string, string> = {
      'Critical': 'poses critical risk',
      'High': 'poses high risk',
      'Medium': 'poses moderate risk',
      'Low': 'poses low risk'
    };
    return riskMap[risk] || 'poses unknown risk';
  }

  // Template definitions
  private readonly defaultTemplate: DescriptionTemplate = {
    pattern: 'A {severity} {type} was detected in {file} at line {line}. This issue {impact} and {risk} to your application.',
    addContext: true
  };

  private readonly specificTemplates = new Map<string, DescriptionTemplate>([
    ['injection_sql injection', {
      pattern: 'Your application has a {severity} SQL injection vulnerability in {file} at line {line}. Attackers could potentially access, modify, or delete your database information.',
      addContext: true
    }],
    ['cross-site scripting_xss', {
      pattern: 'A {severity} cross-site scripting (XSS) vulnerability was found in {file} at line {line}. This could allow attackers to run malicious scripts in users\' browsers.',
      addContext: true
    }],
    ['secret detection_hardcoded secret', {
      pattern: 'A {severity} hardcoded secret or credential was found in {file} at line {line}. This could give attackers unauthorized access to your systems.',
      addContext: true
    }],
    ['broken access control_authorization issue', {
      pattern: 'A {severity} access control problem was detected in {file} at line {line}. Users might be able to access data or functions they shouldn\'t have permission to use.',
      addContext: true
    }]
  ]);

  private readonly categoryTemplates = new Map<string, DescriptionTemplate>([
    ['injection', {
      pattern: 'An injection vulnerability was found in {file} at line {line}. This {severity} issue could allow attackers to inject malicious code or commands into your application.',
      addContext: true
    }],
    ['secret detection', {
      pattern: 'Sensitive credentials or API keys were detected in {file} at line {line}. This {severity} security issue could expose your application to unauthorized access.',
      addContext: true
    }],
    ['broken authentication', {
      pattern: 'An authentication security issue was found in {file} at line {line}. This {severity} problem could allow attackers to bypass login protections.',
      addContext: true
    }],
    ['sensitive data exposure', {
      pattern: 'A data protection issue was detected in {file} at line {line}. This {severity} vulnerability could lead to unauthorized access to sensitive information.',
      addContext: true
    }]
  ]);

  private readonly typeTemplates = new Map<string, DescriptionTemplate>([
    ['path traversal', {
      pattern: 'A path traversal vulnerability was found in {file} at line {line}. This {severity} issue could allow attackers to access files outside the intended directory.',
      addContext: true
    }],
    ['command injection', {
      pattern: 'A command injection vulnerability was detected in {file} at line {line}. This {severity} issue could allow attackers to execute system commands on your server.',
      addContext: true
    }],
    ['weak cryptography', {
      pattern: 'Weak cryptographic practices were found in {file} at line {line}. This {severity} issue could make your encrypted data vulnerable to attacks.',
      addContext: true
    }]
  ]);
}

interface DescriptionTemplate {
  pattern: string;
  addContext: boolean;
}

// Export singleton instance
export const naturalLanguageDescriptionService = NaturalLanguageDescriptionService.getInstance();
