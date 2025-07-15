/**
 * Secret Detection Service
 * Detects secrets using pattern matching and ML-like classifiers
 * Supports API keys, JWTs, database credentials, and other sensitive data
 */

export interface SecretMatch {
  type: SecretType;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
  entropy: number;
  context: string;
  line: number;
  column: number;
}

export interface SecretDetectionResult {
  secrets: SecretMatch[];
  totalSecrets: number;
  highConfidenceSecrets: number;
  secretTypes: Record<SecretType, number>;
  riskScore: number;
}

export type SecretType = 
  | 'api_key'
  | 'jwt_token'
  | 'database_credential'
  | 'aws_access_key'
  | 'github_token'
  | 'slack_token'
  | 'stripe_key'
  | 'google_api_key'
  | 'private_key'
  | 'password'
  | 'connection_string'
  | 'oauth_token'
  | 'webhook_url'
  | 'generic_secret';

interface SecretPattern {
  name: SecretType;
  pattern: RegExp;
  entropy: {
    min: number;
    max: number;
  };
  confidence: number;
  description: string;
  examples: string[];
}

interface MLClassifier {
  name: string;
  classify: (text: string, context: string) => number;
  threshold: number;
}

export class SecretDetectionService {
  private patterns: SecretPattern[];
  private classifiers: MLClassifier[];
  private contextWindow: number = 50;

  constructor() {
    this.patterns = this.initializePatterns();
    this.classifiers = this.initializeClassifiers();
  }

  /**
   * Initialize secret detection patterns
   */
  private initializePatterns(): SecretPattern[] {
    return [
      // AWS Access Keys
      {
        name: 'aws_access_key',
        pattern: /AKIA[0-9A-Z]{16}/gi,
        entropy: { min: 3.0, max: 6.0 },
        confidence: 95,
        description: 'AWS Access Key ID',
        examples: ['AKIAIOSFODNN7EXAMPLE']
      },
      
      // GitHub Personal Access Tokens
      {
        name: 'github_token',
        pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/gi,
        entropy: { min: 3.5, max: 6.0 },
        confidence: 90,
        description: 'GitHub Personal Access Token',
        examples: ['ghp_1234567890abcdef1234567890abcdef12345678']
      },
      
      // JWT Tokens
      {
        name: 'jwt_token',
        pattern: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 85,
        description: 'JSON Web Token (JWT)',
        examples: ['eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c']
      },
      
      // Slack Tokens
      {
        name: 'slack_token',
        pattern: /xox[bpars]-[0-9A-Za-z]{12}-[0-9A-Za-z]{12}-[0-9a-zA-Z]{24}/gi,
        entropy: { min: 3.0, max: 5.5 },
        confidence: 90,
        description: 'Slack API Token',
        examples: ['xoxb-XXXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX']
      },
      
      // Stripe API Keys
      {
        name: 'stripe_key',
        pattern: /sk_live_[0-9a-zA-Z]{24,}/gi,
        entropy: { min: 4.0, max: 5.5 },
        confidence: 95,
        description: 'Stripe Live API Key',
        examples: ['sk_live_1234567890abcdef1234567890abcdef']
      },
      
      // Google API Keys
      {
        name: 'google_api_key',
        pattern: /AIza[0-9A-Za-z_-]{35}/gi,
        entropy: { min: 4.0, max: 5.5 },
        confidence: 85,
        description: 'Google API Key',
        examples: ['AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe']
      },
      
      // Private Keys
      {
        name: 'private_key',
        pattern: /-----BEGIN[A-Z\s]+PRIVATE KEY-----[\s\S]*?-----END[A-Z\s]+PRIVATE KEY-----/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: 'Private Key',
        examples: ['-----BEGIN RSA PRIVATE KEY-----\n...']
      },
      
      // Database Connection Strings
      {
        name: 'connection_string',
        pattern: /(mongodb|mysql|postgresql|postgres|redis):\/\/[^\s"']+/gi,
        entropy: { min: 3.0, max: 5.0 },
        confidence: 80,
        description: 'Database Connection String',
        examples: ['mongodb://user:pass@host:port/db', 'postgresql://user:pass@host:port/db']
      },
      
      // Generic API Keys (high entropy strings)
      {
        name: 'api_key',
        pattern: /['"](api[_-]?key|apikey|access[_-]?token|secret[_-]?key)['"]\s*[:=]\s*['"]\s*[A-Za-z0-9_-]{20,}['"]/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 75,
        description: 'Generic API Key',
        examples: ['"api_key": "abcdef1234567890abcdef1234567890"']
      },
      
      // Password patterns
      {
        name: 'password',
        pattern: /['"](password|passwd|pwd)['"]\s*[:=]\s*['"]\s*[A-Za-z0-9!@#$%^&*()_+-=]{8,}['"]/gi,
        entropy: { min: 3.0, max: 5.0 },
        confidence: 70,
        description: 'Hardcoded Password',
        examples: ['"password": "mySecretPassword123!"']
      }
    ];
  }

  /**
   * Initialize ML-like classifiers for secret detection
   */
  private initializeClassifiers(): MLClassifier[] {
    return [
      {
        name: 'entropy_classifier',
        classify: this.entropyClassifier.bind(this),
        threshold: 0.7
      },
      {
        name: 'base64_classifier',
        classify: this.base64Classifier.bind(this),
        threshold: 0.6
      },
      {
        name: 'hex_classifier',
        classify: this.hexClassifier.bind(this),
        threshold: 0.65
      },
      {
        name: 'context_classifier',
        classify: this.contextClassifier.bind(this),
        threshold: 0.5
      }
    ];
  }

  /**
   * Calculate Shannon entropy of a string
   */
  private calculateEntropy(str: string): number {
    const len = str.length;
    const frequencies: Record<string, number> = {};

    // Count character frequencies
    for (let i = 0; i < len; i++) {
      const char = str[i];
      frequencies[char] = (frequencies[char] || 0) + 1;
    }

    // Calculate entropy
    let entropy = 0;
    for (const char in frequencies) {
      const probability = frequencies[char] / len;
      entropy -= probability * Math.log2(probability);
    }

    return entropy;
  }

  /**
   * Entropy-based classifier for detecting high-entropy strings
   */
  private entropyClassifier(text: string, context: string): number {
    const entropy = this.calculateEntropy(text);
    const length = text.length;

    // Normalize entropy based on string length and character set
    let score = 0;

    if (entropy > 4.5 && length >= 20) score += 0.4;
    if (entropy > 5.0 && length >= 32) score += 0.3;
    if (entropy > 5.5 && length >= 40) score += 0.2;

    // Bonus for mixed case and numbers
    if (/[a-z]/.test(text) && /[A-Z]/.test(text) && /[0-9]/.test(text)) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * Base64 pattern classifier
   */
  private base64Classifier(text: string, context: string): number {
    // Check if string looks like base64
    const base64Pattern = /^[A-Za-z0-9+/]*={0,2}$/;
    const isBase64Like = base64Pattern.test(text);

    if (!isBase64Like) return 0;

    let score = 0;

    // Length checks for common base64 encoded secrets
    if (text.length >= 20 && text.length % 4 === 0) score += 0.3;
    if (text.length >= 32) score += 0.2;
    if (text.length >= 64) score += 0.2;

    // Entropy check
    const entropy = this.calculateEntropy(text);
    if (entropy > 4.0) score += 0.3;

    return Math.min(1.0, score);
  }

  /**
   * Hexadecimal pattern classifier
   */
  private hexClassifier(text: string, context: string): number {
    const hexPattern = /^[a-fA-F0-9]+$/;
    const isHex = hexPattern.test(text);

    if (!isHex) return 0;

    let score = 0;

    // Length checks for common hex-encoded secrets
    if (text.length >= 32) score += 0.3;
    if (text.length >= 64) score += 0.2;
    if (text.length === 40 || text.length === 64 || text.length === 128) score += 0.2;

    // Entropy check
    const entropy = this.calculateEntropy(text);
    if (entropy > 3.5) score += 0.3;

    return Math.min(1.0, score);
  }

  /**
   * Context-based classifier using surrounding code
   */
  private contextClassifier(text: string, context: string): number {
    const lowerContext = context.toLowerCase();
    let score = 0;

    // Secret-related keywords in context
    const secretKeywords = [
      'api', 'key', 'token', 'secret', 'password', 'auth', 'credential',
      'access', 'private', 'config', 'env', 'bearer', 'oauth', 'jwt'
    ];

    secretKeywords.forEach(keyword => {
      if (lowerContext.includes(keyword)) {
        score += 0.1;
      }
    });

    // Variable naming patterns
    const variablePatterns = [
      /api[_-]?key/i,
      /access[_-]?token/i,
      /secret[_-]?key/i,
      /private[_-]?key/i,
      /auth[_-]?token/i,
      /bearer[_-]?token/i
    ];

    variablePatterns.forEach(pattern => {
      if (pattern.test(context)) {
        score += 0.15;
      }
    });

    // Assignment patterns
    if (/[:=]\s*['"`]/.test(context)) {
      score += 0.1;
    }

    return Math.min(1.0, score);
  }

  /**
   * Extract context around a match
   */
  private extractContext(content: string, startIndex: number, endIndex: number): string {
    const start = Math.max(0, startIndex - this.contextWindow);
    const end = Math.min(content.length, endIndex + this.contextWindow);
    return content.substring(start, end);
  }

  /**
   * Get line and column numbers for a match
   */
  private getLineAndColumn(content: string, index: number): { line: number; column: number } {
    const lines = content.substring(0, index).split('\n');
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1
    };
  }

  /**
   * Detect secrets using pattern matching
   */
  private detectPatternBasedSecrets(content: string): SecretMatch[] {
    const secrets: SecretMatch[] = [];

    this.patterns.forEach(pattern => {
      let match;
      const regex = new RegExp(pattern.pattern.source, pattern.pattern.flags);

      while ((match = regex.exec(content)) !== null) {
        const value = match[0];
        const startIndex = match.index;
        const endIndex = startIndex + value.length;
        const context = this.extractContext(content, startIndex, endIndex);
        const { line, column } = this.getLineAndColumn(content, startIndex);
        const entropy = this.calculateEntropy(value);

        // Validate entropy range
        if (entropy >= pattern.entropy.min && entropy <= pattern.entropy.max) {
          secrets.push({
            type: pattern.name,
            value,
            startIndex,
            endIndex,
            confidence: pattern.confidence,
            entropy,
            context,
            line,
            column
          });
        }
      }
    });

    return secrets;
  }

  /**
   * Detect secrets using ML classifiers
   */
  private detectMLBasedSecrets(content: string): SecretMatch[] {
    const secrets: SecretMatch[] = [];

    // Look for potential secret strings (high entropy, specific patterns)
    const potentialSecrets = this.findPotentialSecrets(content);

    potentialSecrets.forEach(candidate => {
      const context = this.extractContext(content, candidate.startIndex, candidate.endIndex);
      let totalScore = 0;
      let classifierCount = 0;

      // Run all classifiers
      this.classifiers.forEach(classifier => {
        const score = classifier.classify(candidate.value, context);
        if (score >= classifier.threshold) {
          totalScore += score;
          classifierCount++;
        }
      });

      // If multiple classifiers agree, it's likely a secret
      if (classifierCount >= 2) {
        const confidence = Math.min(95, (totalScore / this.classifiers.length) * 100);
        const { line, column } = this.getLineAndColumn(content, candidate.startIndex);

        secrets.push({
          type: 'generic_secret',
          value: candidate.value,
          startIndex: candidate.startIndex,
          endIndex: candidate.endIndex,
          confidence,
          entropy: this.calculateEntropy(candidate.value),
          context,
          line,
          column
        });
      }
    });

    return secrets;
  }

  /**
   * Find potential secret candidates for ML classification
   */
  private findPotentialSecrets(content: string): Array<{ value: string; startIndex: number; endIndex: number }> {
    const candidates: Array<{ value: string; startIndex: number; endIndex: number }> = [];

    // Look for quoted strings with high entropy
    const quotedStringPattern = /['"`]([A-Za-z0-9+/=_-]{16,})['"`]/g;
    let match;

    while ((match = quotedStringPattern.exec(content)) !== null) {
      const value = match[1];
      const entropy = this.calculateEntropy(value);

      if (entropy > 3.5 && value.length >= 16) {
        candidates.push({
          value,
          startIndex: match.index + 1, // Skip the quote
          endIndex: match.index + match[0].length - 1 // Skip the closing quote
        });
      }
    }

    // Look for assignment patterns with potential secrets
    const assignmentPattern = /(\w+)\s*[:=]\s*['"`]([A-Za-z0-9+/=_-]{20,})['"`]/g;

    while ((match = assignmentPattern.exec(content)) !== null) {
      const value = match[2];
      const entropy = this.calculateEntropy(value);

      if (entropy > 4.0) {
        const valueStart = match.index + match[0].indexOf(match[2]);
        candidates.push({
          value,
          startIndex: valueStart,
          endIndex: valueStart + value.length
        });
      }
    }

    return candidates;
  }

  /**
   * Remove duplicate secrets and merge similar ones
   */
  private deduplicateSecrets(secrets: SecretMatch[]): SecretMatch[] {
    const seen = new Set<string>();
    const deduplicated: SecretMatch[] = [];

    secrets.forEach(secret => {
      const key = `${secret.type}:${secret.value}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicated.push(secret);
      }
    });

    return deduplicated;
  }

  /**
   * Calculate risk score based on detected secrets
   */
  private calculateRiskScore(secrets: SecretMatch[]): number {
    if (secrets.length === 0) return 0;

    let riskScore = 0;
    const typeWeights: Record<SecretType, number> = {
      'private_key': 10,
      'aws_access_key': 9,
      'stripe_key': 8,
      'github_token': 7,
      'google_api_key': 7,
      'slack_token': 6,
      'jwt_token': 6,
      'database_credential': 8,
      'connection_string': 7,
      'api_key': 5,
      'oauth_token': 5,
      'password': 4,
      'webhook_url': 3,
      'generic_secret': 3
    };

    secrets.forEach(secret => {
      const baseWeight = typeWeights[secret.type] || 3;
      const confidenceMultiplier = secret.confidence / 100;
      const entropyMultiplier = Math.min(1.5, secret.entropy / 5);

      riskScore += baseWeight * confidenceMultiplier * entropyMultiplier;
    });

    // Normalize to 0-100 scale
    return Math.min(100, Math.round(riskScore));
  }

  /**
   * Main method to detect secrets in content
   */
  public detectSecrets(content: string): SecretDetectionResult {
    console.log(`🔐 REAL SECRET DETECTION: Analyzing ${content.length} characters for secrets...`);

    // Detect using both pattern matching and ML classifiers
    const patternSecrets = this.detectPatternBasedSecrets(content);
    const mlSecrets = this.detectMLBasedSecrets(content);

    console.log(`🔍 REAL SECRET DETECTION: Pattern-based detection found ${patternSecrets.length} secrets`);
    console.log(`🤖 REAL SECRET DETECTION: ML-based detection found ${mlSecrets.length} secrets`);

    // Combine and deduplicate results
    const allSecrets = this.deduplicateSecrets([...patternSecrets, ...mlSecrets]);

    console.log(`✅ REAL SECRET DETECTION: Total unique secrets found: ${allSecrets.length}`);

    // Calculate statistics
    const highConfidenceSecrets = allSecrets.filter(s => s.confidence >= 80).length;
    const secretTypes: Record<SecretType, number> = {} as Record<SecretType, number>;

    allSecrets.forEach(secret => {
      secretTypes[secret.type] = (secretTypes[secret.type] || 0) + 1;
    });

    const riskScore = this.calculateRiskScore(allSecrets);

    if (allSecrets.length > 0) {
      console.log(`🎯 REAL SECRET DETECTION: Secret types found: ${Object.keys(secretTypes).join(', ')}`);
      console.log(`⚠️ REAL SECRET DETECTION: High confidence secrets: ${highConfidenceSecrets}/${allSecrets.length}`);
      console.log(`📊 REAL SECRET DETECTION: Risk score: ${riskScore}/100`);
    }

    return {
      secrets: allSecrets,
      totalSecrets: allSecrets.length,
      highConfidenceSecrets,
      secretTypes,
      riskScore
    };
  }

  /**
   * Get secret type description
   */
  public getSecretTypeDescription(type: SecretType): string {
    const descriptions: Record<SecretType, string> = {
      'api_key': 'Generic API Key - Could provide access to external services',
      'jwt_token': 'JSON Web Token - May contain sensitive user information',
      'database_credential': 'Database Credential - Provides access to database systems',
      'aws_access_key': 'AWS Access Key - Provides access to Amazon Web Services',
      'github_token': 'GitHub Token - Provides access to GitHub repositories',
      'slack_token': 'Slack Token - Provides access to Slack workspace',
      'stripe_key': 'Stripe API Key - Provides access to payment processing',
      'google_api_key': 'Google API Key - Provides access to Google services',
      'private_key': 'Private Key - Used for cryptographic operations',
      'password': 'Hardcoded Password - Authentication credential',
      'connection_string': 'Database Connection String - Contains database access information',
      'oauth_token': 'OAuth Token - Provides delegated access to resources',
      'webhook_url': 'Webhook URL - May contain sensitive callback information',
      'generic_secret': 'Generic Secret - High-entropy string that may be sensitive'
    };

    return descriptions[type] || 'Unknown secret type';
  }
}
