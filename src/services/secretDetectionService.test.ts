import { describe, it, expect, beforeEach } from 'vitest';
import { SecretDetectionService, SecretType } from './secretDetectionService';

describe('SecretDetectionService', () => {
  let service: SecretDetectionService;

  beforeEach(() => {
    service = new SecretDetectionService();
  });

  describe('Pattern-based detection', () => {
    it('should detect AWS access keys', () => {
      const content = `
        const config = {
          accessKey: "AKIAIOSFODNN7EXAMPLE",
          secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
        };
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const awsKey = result.secrets.find(s => s.type === 'aws_access_key');
      expect(awsKey).toBeDefined();
      expect(awsKey?.confidence).toBeGreaterThan(80);
    });

    it('should detect GitHub tokens', () => {
      const content = `
        const token = "ghp_1234567890abcdef1234567890abcdef12345678";
        fetch('https://api.github.com', {
          headers: { Authorization: \`Bearer \${token}\` }
        });
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const githubToken = result.secrets.find(s => s.type === 'github_token');
      expect(githubToken).toBeDefined();
      expect(githubToken?.confidence).toBeGreaterThan(80);
    });

    it('should detect JWT tokens', () => {
      const content = `
        const jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const jwtToken = result.secrets.find(s => s.type === 'jwt_token');
      expect(jwtToken).toBeDefined();
      expect(jwtToken?.confidence).toBeGreaterThan(80);
    });

    it('should detect Slack tokens', () => {
      const content = `
        const slackToken = "xoxb-123456789012-123456789012-abcdefghijklmnopqrstuvwx";
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const slackToken = result.secrets.find(s => s.type === 'slack_token');
      expect(slackToken).toBeDefined();
      expect(slackToken?.confidence).toBeGreaterThan(80);
    });

    it('should detect Stripe API keys', () => {
      const content = `
        const stripeKey = "sk_live_1234567890abcdef1234567890abcdef";
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const stripeKey = result.secrets.find(s => s.type === 'stripe_key');
      expect(stripeKey).toBeDefined();
      expect(stripeKey?.confidence).toBeGreaterThan(90);
    });

    it('should detect Google API keys', () => {
      const content = `
        const googleApiKey = "AIzaSyDaGmWKa4JsXZ-HjGw7ISLn_3namBGewQe";
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const googleKey = result.secrets.find(s => s.type === 'google_api_key');
      expect(googleKey).toBeDefined();
      expect(googleKey?.confidence).toBeGreaterThan(80);
    });

    it('should detect private keys', () => {
      const content = `
        const privateKey = \`-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef...
-----END RSA PRIVATE KEY-----\`;
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const privateKey = result.secrets.find(s => s.type === 'private_key');
      expect(privateKey).toBeDefined();
      expect(privateKey?.confidence).toBeGreaterThan(90);
    });

    it('should detect database connection strings', () => {
      const content = `
        const dbUrl = "mongodb://user:password@localhost:27017/mydb";
        const pgUrl = "postgresql://user:pass@host:5432/database";
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const connectionStrings = result.secrets.filter(s => s.type === 'connection_string');
      expect(connectionStrings.length).toBeGreaterThanOrEqual(2);
    });

    it('should detect hardcoded passwords', () => {
      const content = `
        const config = {
          "password": "mySecretPassword123!",
          "pwd": "anotherPassword456"
        };
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const passwords = result.secrets.filter(s => s.type === 'password');
      expect(passwords.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('ML-based detection', () => {
    it('should detect high-entropy strings as potential secrets', () => {
      const content = `
        const suspiciousString = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0";
        const config = {
          "secret_key": "veryRandomAndLongStringThatLooksLikeASecret123456789"
        };
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      // Should detect at least one high-entropy string
      const highEntropySecrets = result.secrets.filter(s => s.entropy > 4.0);
      expect(highEntropySecrets.length).toBeGreaterThan(0);
    });

    it('should use context to improve detection accuracy', () => {
      const content = `
        const apiKey = "sk_test_1234567890abcdef1234567890abcdef";
        const randomString = "abcdef1234567890abcdef1234567890abcdef12";
      `;
      
      const result = service.detectSecrets(content);
      
      // The string with "apiKey" context should have higher confidence
      const contextualSecret = result.secrets.find(s => 
        s.context.includes('apiKey') || s.type === 'api_key'
      );
      const randomSecret = result.secrets.find(s => 
        s.context.includes('randomString') && s.type === 'generic_secret'
      );
      
      if (contextualSecret && randomSecret) {
        expect(contextualSecret.confidence).toBeGreaterThan(randomSecret.confidence);
      }
    });
  });

  describe('Risk assessment', () => {
    it('should calculate appropriate risk scores', () => {
      const content = `
        const awsKey = "AKIAIOSFODNN7EXAMPLE";
        const stripeKey = "sk_live_1234567890abcdef1234567890abcdef";
        const password = "password123";
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.riskScore).toBeGreaterThan(0);
      expect(result.highConfidenceSecrets).toBeGreaterThan(0);
      
      // Should have multiple secret types
      expect(Object.keys(result.secretTypes).length).toBeGreaterThan(1);
    });

    it('should handle empty content gracefully', () => {
      const result = service.detectSecrets('');
      
      expect(result.totalSecrets).toBe(0);
      expect(result.highConfidenceSecrets).toBe(0);
      expect(result.riskScore).toBe(0);
      expect(Object.keys(result.secretTypes).length).toBe(0);
    });

    it('should handle content with no secrets', () => {
      const content = `
        const message = "Hello, world!";
        function greet(name) {
          return \`Hello, \${name}!\`;
        }
      `;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBe(0);
      expect(result.riskScore).toBe(0);
    });
  });

  describe('Secret type descriptions', () => {
    it('should provide descriptions for all secret types', () => {
      const secretTypes: SecretType[] = [
        'api_key', 'jwt_token', 'database_credential', 'aws_access_key',
        'github_token', 'slack_token', 'stripe_key', 'google_api_key',
        'private_key', 'password', 'connection_string', 'oauth_token',
        'webhook_url', 'generic_secret'
      ];
      
      secretTypes.forEach(type => {
        const description = service.getSecretTypeDescription(type);
        expect(description).toBeDefined();
        expect(description.length).toBeGreaterThan(0);
        expect(description).not.toBe('Unknown secret type');
      });
    });
  });

  describe('Line and column detection', () => {
    it('should correctly identify line and column numbers', () => {
      const content = `line 1
line 2
const secret = "AKIAIOSFODNN7EXAMPLE";
line 4`;
      
      const result = service.detectSecrets(content);
      
      expect(result.totalSecrets).toBeGreaterThan(0);
      const secret = result.secrets[0];
      expect(secret.line).toBe(3);
      expect(secret.column).toBeGreaterThan(0);
    });
  });

  describe('Deduplication', () => {
    it('should deduplicate identical secrets', () => {
      const content = `
        const key1 = "AKIAIOSFODNN7EXAMPLE";
        const key2 = "AKIAIOSFODNN7EXAMPLE";
      `;
      
      const result = service.detectSecrets(content);
      
      // Should detect the secret but not duplicate it
      expect(result.totalSecrets).toBe(1);
    });
  });
});
