/**
 * Secret Detection Service
 * Detects secrets using pattern matching and ML-like classifiers
 * Supports API keys, JWTs, database credentials, and other sensitive data
 * Updated: November 2025 with latest secret patterns
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
  secretTypes: Partial<Record<SecretType, number>>;
  riskScore: number;
}

export type SecretType =
  | "api_key"
  | "jwt_token"
  | "database_credential"
  | "aws_access_key"
  | "aws_secret_key"
  | "github_token"
  | "gitlab_token"
  | "slack_token"
  | "slack_webhook"
  | "stripe_key"
  | "google_api_key"
  | "google_oauth"
  | "private_key"
  | "ssh_key"
  | "password"
  | "connection_string"
  | "oauth_token"
  | "webhook_url"
  | "azure_key"
  | "npm_token"
  | "pypi_token"
  | "docker_auth"
  | "openai_key"
  | "anthropic_key"
  | "firebase_key"
  | "twilio_key"
  | "sendgrid_key"
  | "mailchimp_key"
  | "discord_token"
  | "telegram_token"
  | "vercel_token"
  | "netlify_token"
  | "heroku_key"
  | "digitalocean_token"
  | "generic_secret";

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
        name: "aws_access_key",
        pattern: /AKIA[0-9A-Z]{16}/gi,
        entropy: { min: 3.0, max: 6.0 },
        confidence: 95,
        description: "AWS Access Key ID",
        examples: ["AKIAIOSFODNN7EXAMPLE"],
      },

      // GitHub Personal Access Tokens
      {
        name: "github_token",
        pattern: /gh[pousr]_[A-Za-z0-9_]{36,255}/gi,
        entropy: { min: 3.5, max: 6.0 },
        confidence: 95,
        description: "GitHub Personal Access Token",
        examples: ["ghp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // GitHub Fine-grained PAT (NEW 2024+)
      {
        name: "github_token",
        pattern: /github_pat_[A-Za-z0-9_]{22,}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "GitHub Fine-grained Personal Access Token",
        examples: ["github_pat_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // GitLab Tokens (NEW)
      {
        name: "gitlab_token",
        pattern: /glpat-[A-Za-z0-9_-]{20,}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "GitLab Personal Access Token",
        examples: ["glpat-XXXXXXXXXXXXXXXXXXXX"],
      },

      // JWT Tokens
      {
        name: "jwt_token",
        pattern: /eyJ[A-Za-z0-9_-]*\.eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 85,
        description: "JSON Web Token (JWT)",
        examples: [
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ0ZXN0In0.dummy_signature",
        ],
      },

      // Slack Tokens
      {
        name: "slack_token",
        pattern:
          /xox[bpars]-[0-9A-Za-z]{10,48}-[0-9A-Za-z]{10,48}(?:-[0-9a-zA-Z]{24,48})?/gi,
        entropy: { min: 3.0, max: 5.5 },
        confidence: 95,
        description: "Slack API Token",
        examples: ["xoxb-XXXXXXXXXXXX-XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // Slack Webhooks (NEW)
      {
        name: "slack_webhook",
        pattern:
          /https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/gi,
        entropy: { min: 3.0, max: 5.0 },
        confidence: 95,
        description: "Slack Webhook URL",
        examples: [
          "https://hooks.slack.com/services/TXXXXXX/BXXXXXX/xxxx (example format)",
        ],
      },

      // Stripe API Keys
      {
        name: "stripe_key",
        pattern: /(?:sk|pk|rk)_(?:live|test)_[0-9a-zA-Z]{24,}/gi,
        entropy: { min: 4.0, max: 5.5 },
        confidence: 95,
        description: "Stripe API Key",
        examples: ["sk_test_xxxx...xxxx (example format)"],
      },

      // Google API Keys
      {
        name: "google_api_key",
        pattern: /AIza[0-9A-Za-z_-]{35}/gi,
        entropy: { min: 4.0, max: 5.5 },
        confidence: 90,
        description: "Google API Key",
        examples: ["AIzaSyAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"],
      },

      // Google OAuth Client Secret (NEW)
      {
        name: "google_oauth",
        pattern: /GOCSPX-[A-Za-z0-9_-]{28}/gi,
        entropy: { min: 4.0, max: 5.5 },
        confidence: 95,
        description: "Google OAuth Client Secret",
        examples: ["GOCSPX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // OpenAI API Key (NEW)
      {
        name: "openai_key",
        pattern: /sk-(?:proj-)?[A-Za-z0-9]{20,}T3BlbkFJ[A-Za-z0-9]{20,}/gi,
        entropy: { min: 4.5, max: 6.0 },
        confidence: 98,
        description: "OpenAI API Key",
        examples: ["sk-xxxx...xxxx (example format)"],
      },

      // Anthropic API Key (NEW)
      {
        name: "anthropic_key",
        pattern: /sk-ant-(?:api03-)?[A-Za-z0-9_-]{93,}/gi,
        entropy: { min: 4.5, max: 6.0 },
        confidence: 98,
        description: "Anthropic Claude API Key",
        examples: [
          "sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        ],
      },

      // Firebase/Google Cloud (NEW)
      {
        name: "firebase_key",
        pattern: /AAAA[A-Za-z0-9_-]{7}:[A-Za-z0-9_-]{140,}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 90,
        description: "Firebase Cloud Messaging Server Key",
        examples: [
          "AAAAAAA:APA91bXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        ],
      },

      // Azure Storage Key (NEW)
      {
        name: "azure_key",
        pattern:
          /DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=[A-Za-z0-9+\/=]{88}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "Azure Storage Connection String",
        examples: [
          "DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...",
        ],
      },

      // npm Token (NEW)
      {
        name: "npm_token",
        pattern: /npm_[A-Za-z0-9]{36}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "npm Access Token",
        examples: ["npm_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // PyPI Token (NEW)
      {
        name: "pypi_token",
        pattern: /pypi-AgE[A-Za-z0-9_-]{70,}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "PyPI API Token",
        examples: [
          "pypi-AgEIcHlwaS5vcmcXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        ],
      },

      // Twilio (NEW)
      {
        name: "twilio_key",
        pattern: /SK[a-f0-9]{32}/gi,
        entropy: { min: 3.5, max: 5.0 },
        confidence: 85,
        description: "Twilio API Key SID",
        examples: ["SKXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // SendGrid (NEW)
      {
        name: "sendgrid_key",
        pattern: /SG\.[A-Za-z0-9_-]{22}\.[A-Za-z0-9_-]{43}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "SendGrid API Key",
        examples: [
          "SG.XXXXXXXXXXXXXXXXXXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        ],
      },

      // Discord (NEW)
      {
        name: "discord_token",
        pattern: /[MN][A-Za-z\d]{23,}\.[\w-]{6}\.[\w-]{27,}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 90,
        description: "Discord Bot Token",
        examples: [
          "XXXXXXXXXXXXXXXXXXXXXXXX.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXXXXX",
        ],
      },

      // Telegram Bot Token (NEW)
      {
        name: "telegram_token",
        pattern: /\d{8,10}:[A-Za-z0-9_-]{35}/gi,
        entropy: { min: 4.0, max: 5.5 },
        confidence: 90,
        description: "Telegram Bot Token",
        examples: ["1234567890:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // Vercel Token (NEW)
      {
        name: "vercel_token",
        pattern: /vercel_[A-Za-z0-9]{24}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "Vercel API Token",
        examples: ["vercel_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // Netlify Token (NEW)
      {
        name: "netlify_token",
        pattern: /nfp_[A-Za-z0-9]{40}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "Netlify Personal Access Token",
        examples: ["nfp_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"],
      },

      // Heroku API Key (NEW)
      {
        name: "heroku_key",
        pattern:
          /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,
        entropy: { min: 3.5, max: 5.0 },
        confidence: 60, // Lower confidence as UUID format is common
        description: "Heroku API Key (UUID format)",
        examples: ["12345678-1234-1234-1234-XXXXXXXXXXXX"],
      },

      // DigitalOcean Token (NEW)
      {
        name: "digitalocean_token",
        pattern: /dop_v1_[a-f0-9]{64}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "DigitalOcean Personal Access Token",
        examples: [
          "dop_v1_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
        ],
      },

      // Docker Auth Token (NEW)
      {
        name: "docker_auth",
        pattern: /dckr_pat_[A-Za-z0-9_-]{20,}/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 95,
        description: "Docker Personal Access Token",
        examples: ["dckr_pat_XXXXXXXXXXXXXXXXXX"],
      },

      // Private Keys
      {
        name: "private_key",
        pattern:
          /-----BEGIN[A-Z\s]+PRIVATE KEY-----[\s\S]*?-----END[A-Z\s]+PRIVATE KEY-----/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 98,
        description: "Private Key",
        examples: ["-----BEGIN RSA PRIVATE KEY-----\n..."],
      },

      // SSH Private Key (NEW)
      {
        name: "ssh_key",
        pattern:
          /-----BEGIN OPENSSH PRIVATE KEY-----[\s\S]*?-----END OPENSSH PRIVATE KEY-----/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 98,
        description: "OpenSSH Private Key",
        examples: ["-----BEGIN OPENSSH PRIVATE KEY-----\n..."],
      },

      // Database Connection Strings
      {
        name: "connection_string",
        pattern:
          /(mongodb(?:\+srv)?|mysql|postgresql|postgres|redis|mssql|oracle):\/\/[^\s"']+/gi,
        entropy: { min: 3.0, max: 5.0 },
        confidence: 85,
        description: "Database Connection String",
        examples: [
          "mongodb://user:pass@host:port/db",
          "postgresql://user:pass@host:port/db",
        ],
      },

      // Generic API Keys (high entropy strings)
      {
        name: "api_key",
        pattern:
          /['"](api[_-]?key|apikey|access[_-]?token|secret[_-]?key|auth[_-]?token)['"]\s*[:=]\s*['"]\s*[A-Za-z0-9_-]{20,}['"]/gi,
        entropy: { min: 4.0, max: 6.0 },
        confidence: 75,
        description: "Generic API Key",
        examples: ['"api_key": "XXXXXXXXXXXXXXXXXXXXXXXXXX"'],
      },

      // Password patterns
      {
        name: "password",
        pattern:
          /['"](password|passwd|pwd|secret|credentials)['"]\s*[:=]\s*['"]\s*[A-Za-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}['"]/gi,
        entropy: { min: 3.0, max: 5.0 },
        confidence: 75,
        description: "Hardcoded Password",
        examples: ['"password": "XXXXXXXXXXXXXXXXXX"'],
      },

      // Mailchimp API Key (NEW)
      {
        name: "mailchimp_key",
        pattern: /[a-f0-9]{32}-us\d{1,2}/gi,
        entropy: { min: 3.5, max: 5.0 },
        confidence: 85,
        description: "Mailchimp API Key",
        examples: ["xxxx...xxxx-usXX (example format)"],
      },
    ];
  }

  /**
   * Initialize ML-like classifiers for secret detection
   */
  private initializeClassifiers(): MLClassifier[] {
    return [
      {
        name: "entropy_classifier",
        classify: this.entropyClassifier.bind(this),
        threshold: 0.7,
      },
      {
        name: "base64_classifier",
        classify: this.base64Classifier.bind(this),
        threshold: 0.6,
      },
      {
        name: "hex_classifier",
        classify: this.hexClassifier.bind(this),
        threshold: 0.65,
      },
      {
        name: "context_classifier",
        classify: this.contextClassifier.bind(this),
        threshold: 0.5,
      },
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
    if (text.length === 40 || text.length === 64 || text.length === 128)
      score += 0.2;

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
      "api",
      "key",
      "token",
      "secret",
      "password",
      "auth",
      "credential",
      "access",
      "private",
      "config",
      "env",
      "bearer",
      "oauth",
      "jwt",
    ];

    secretKeywords.forEach((keyword) => {
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
      /bearer[_-]?token/i,
    ];

    variablePatterns.forEach((pattern) => {
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
  private extractContext(
    content: string,
    startIndex: number,
    endIndex: number
  ): string {
    const start = Math.max(0, startIndex - this.contextWindow);
    const end = Math.min(content.length, endIndex + this.contextWindow);
    return content.substring(start, end);
  }

  /**
   * Get line and column numbers for a match
   */
  private getLineAndColumn(
    content: string,
    index: number
  ): { line: number; column: number } {
    const lines = content.substring(0, index).split("\n");
    return {
      line: lines.length,
      column: lines[lines.length - 1].length + 1,
    };
  }

  /**
   * Detect secrets using pattern matching
   */
  private detectPatternBasedSecrets(content: string): SecretMatch[] {
    const secrets: SecretMatch[] = [];

    this.patterns.forEach((pattern) => {
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
            column,
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

    potentialSecrets.forEach((candidate) => {
      const context = this.extractContext(
        content,
        candidate.startIndex,
        candidate.endIndex
      );
      let totalScore = 0;
      let classifierCount = 0;

      // Run all classifiers
      this.classifiers.forEach((classifier) => {
        const score = classifier.classify(candidate.value, context);
        if (score >= classifier.threshold) {
          totalScore += score;
          classifierCount++;
        }
      });

      // If multiple classifiers agree, it's likely a secret
      if (classifierCount >= 2) {
        const confidence = Math.min(
          95,
          (totalScore / this.classifiers.length) * 100
        );
        const { line, column } = this.getLineAndColumn(
          content,
          candidate.startIndex
        );

        secrets.push({
          type: "generic_secret",
          value: candidate.value,
          startIndex: candidate.startIndex,
          endIndex: candidate.endIndex,
          confidence,
          entropy: this.calculateEntropy(candidate.value),
          context,
          line,
          column,
        });
      }
    });

    return secrets;
  }

  /**
   * Find potential secret candidates for ML classification
   */
  private findPotentialSecrets(
    content: string
  ): Array<{ value: string; startIndex: number; endIndex: number }> {
    const candidates: Array<{
      value: string;
      startIndex: number;
      endIndex: number;
    }> = [];

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
          endIndex: match.index + match[0].length - 1, // Skip the closing quote
        });
      }
    }

    // Look for assignment patterns with potential secrets
    const assignmentPattern =
      /(\w+)\s*[:=]\s*['"`]([A-Za-z0-9+/=_-]{20,})['"`]/g;

    while ((match = assignmentPattern.exec(content)) !== null) {
      const value = match[2];
      const entropy = this.calculateEntropy(value);

      if (entropy > 4.0) {
        const valueStart = match.index + match[0].indexOf(match[2]);
        candidates.push({
          value,
          startIndex: valueStart,
          endIndex: valueStart + value.length,
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

    secrets.forEach((secret) => {
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
    const typeWeights: Partial<Record<SecretType, number>> = {
      private_key: 10,
      ssh_key: 10,
      aws_access_key: 9,
      aws_secret_key: 9,
      azure_key: 9,
      stripe_key: 8,
      github_token: 7,
      gitlab_token: 7,
      google_api_key: 7,
      google_oauth: 7,
      openai_key: 8,
      anthropic_key: 8,
      firebase_key: 7,
      slack_token: 6,
      slack_webhook: 5,
      discord_token: 6,
      telegram_token: 6,
      jwt_token: 6,
      database_credential: 8,
      connection_string: 7,
      npm_token: 7,
      pypi_token: 7,
      docker_auth: 8,
      twilio_key: 6,
      sendgrid_key: 6,
      mailchimp_key: 5,
      vercel_token: 7,
      netlify_token: 7,
      heroku_key: 7,
      digitalocean_token: 7,
      api_key: 5,
      oauth_token: 5,
      password: 4,
      webhook_url: 3,
      generic_secret: 3,
    };

    secrets.forEach((secret) => {
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
    // Detect using both pattern matching and ML classifiers
    const patternSecrets = this.detectPatternBasedSecrets(content);
    const mlSecrets = this.detectMLBasedSecrets(content);

    // Combine and deduplicate results
    const allSecrets = this.deduplicateSecrets([
      ...patternSecrets,
      ...mlSecrets,
    ]);

    // Calculate statistics
    const highConfidenceSecrets = allSecrets.filter(
      (s) => s.confidence >= 80
    ).length;
    const secretTypes: Partial<Record<SecretType, number>> = {};

    allSecrets.forEach((secret) => {
      secretTypes[secret.type] = (secretTypes[secret.type] || 0) + 1;
    });

    const riskScore = this.calculateRiskScore(allSecrets);

    return {
      secrets: allSecrets,
      totalSecrets: allSecrets.length,
      highConfidenceSecrets,
      secretTypes,
      riskScore,
    };
  }

  /**
   * Get secret type description
   */
  public getSecretTypeDescription(type: SecretType): string {
    const descriptions: Partial<Record<SecretType, string>> = {
      api_key: "Generic API Key - Could provide access to external services",
      jwt_token: "JSON Web Token - May contain sensitive user information",
      database_credential:
        "Database Credential - Provides access to database systems",
      aws_access_key: "AWS Access Key - Provides access to Amazon Web Services",
      aws_secret_key: "AWS Secret Key - Provides access to Amazon Web Services",
      github_token: "GitHub Token - Provides access to GitHub repositories",
      gitlab_token: "GitLab Token - Provides access to GitLab repositories",
      slack_token: "Slack Token - Provides access to Slack workspace",
      slack_webhook:
        "Slack Webhook - Provides posting access to Slack channels",
      stripe_key: "Stripe API Key - Provides access to payment processing",
      google_api_key: "Google API Key - Provides access to Google services",
      google_oauth: "Google OAuth - Provides OAuth access to Google services",
      private_key: "Private Key - Used for cryptographic operations",
      ssh_key: "SSH Key - Used for secure shell authentication",
      password: "Hardcoded Password - Authentication credential",
      connection_string:
        "Database Connection String - Contains database access information",
      oauth_token: "OAuth Token - Provides delegated access to resources",
      webhook_url: "Webhook URL - May contain sensitive callback information",
      azure_key: "Azure Key - Provides access to Microsoft Azure services",
      npm_token: "NPM Token - Provides access to NPM registry",
      pypi_token: "PyPI Token - Provides access to Python Package Index",
      docker_auth: "Docker Auth - Provides access to Docker registry",
      openai_key: "OpenAI API Key - Provides access to OpenAI services",
      anthropic_key:
        "Anthropic API Key - Provides access to Anthropic/Claude services",
      firebase_key: "Firebase Key - Provides access to Firebase services",
      twilio_key: "Twilio Key - Provides access to Twilio communications",
      sendgrid_key: "SendGrid Key - Provides access to SendGrid email services",
      mailchimp_key:
        "Mailchimp Key - Provides access to Mailchimp marketing services",
      discord_token: "Discord Token - Provides bot access to Discord servers",
      telegram_token: "Telegram Token - Provides bot access to Telegram",
      vercel_token:
        "Vercel Token - Provides access to Vercel deployment services",
      netlify_token: "Netlify Token - Provides access to Netlify services",
      heroku_key: "Heroku Key - Provides access to Heroku platform",
      digitalocean_token:
        "DigitalOcean Token - Provides access to DigitalOcean cloud services",
      generic_secret:
        "Generic Secret - High-entropy string that may be sensitive",
    };

    return descriptions[type] || "Unknown secret type";
  }
}
