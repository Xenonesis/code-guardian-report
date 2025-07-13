import { describe, it, expect, beforeEach } from 'vitest';
import { SecurityAnalyzer } from './SecurityAnalyzer';

describe('SecurityAnalyzer with Secret Detection', () => {
  let analyzer: SecurityAnalyzer;

  beforeEach(() => {
    analyzer = new SecurityAnalyzer();
  });

  describe('Secret detection integration', () => {
    it('should detect secrets and convert them to security issues', () => {
      const content = `
        const config = {
          apiKey: "AKIAIOSFODNN7EXAMPLE",
          dbUrl: "mongodb://user:password@localhost:27017/mydb",
          jwtToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
        };
      `;
      
      const issues = analyzer.analyzeFile('config.js', content);
      
      // Should detect secret issues
      const secretIssues = issues.filter(issue => 
        issue.category === 'Secret Detection' || issue.type === 'Secret'
      );
      
      expect(secretIssues.length).toBeGreaterThan(0);
      
      // Check that secret issues have proper structure
      secretIssues.forEach(issue => {
        expect(issue.id).toBeDefined();
        expect(issue.line).toBeGreaterThan(0);
        expect(issue.tool).toBe('Secret Scanner');
        expect(issue.type).toBe('Secret');
        expect(issue.category).toBe('Secret Detection');
        expect(issue.severity).toMatch(/^(Critical|High|Medium|Low)$/);
        expect(issue.confidence).toBeGreaterThan(0);
        expect(issue.confidence).toBeLessThanOrEqual(100);
        expect(issue.cvssScore).toBeGreaterThan(0);
        expect(issue.cweId).toBeDefined();
        expect(issue.owaspCategory).toBeDefined();
        expect(issue.recommendation).toBeDefined();
        expect(issue.remediation).toBeDefined();
        expect(issue.impact).toBeDefined();
        expect(issue.references).toBeDefined();
        expect(issue.tags).toBeDefined();
      });
    });

    it('should handle files with no secrets', () => {
      const content = `
        function greet(name) {
          return \`Hello, \${name}!\`;
        }
        
        const numbers = [1, 2, 3, 4, 5];
        console.log(numbers.map(n => n * 2));
      `;
      
      const issues = analyzer.analyzeFile('utils.js', content);
      
      const secretIssues = issues.filter(issue => 
        issue.category === 'Secret Detection' || issue.type === 'Secret'
      );
      
      expect(secretIssues.length).toBe(0);
    });

    it('should detect multiple types of secrets in one file', () => {
      const content = `
        const config = {
          aws: {
            accessKey: "AKIAIOSFODNN7EXAMPLE",
            secretKey: "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
          },
          github: {
            token: "ghp_1234567890abcdef1234567890abcdef12345678"
          },
          stripe: {
            key: "sk_live_1234567890abcdef1234567890abcdef"
          },
          database: {
            url: "postgresql://user:pass@host:5432/db"
          }
        };
      `;
      
      const issues = analyzer.analyzeFile('config.js', content);
      
      const secretIssues = issues.filter(issue => 
        issue.category === 'Secret Detection' || issue.type === 'Secret'
      );
      
      expect(secretIssues.length).toBeGreaterThan(3);
      
      // Should have different types of secrets
      const secretTypes = new Set(secretIssues.map(issue => issue.message));
      expect(secretTypes.size).toBeGreaterThan(1);
    });

    it('should assign appropriate severity levels', () => {
      const content = `
        const criticalSecret = "sk_live_1234567890abcdef1234567890abcdef"; // Stripe live key
        const highSecret = "AKIAIOSFODNN7EXAMPLE"; // AWS access key
        const mediumSecret = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"; // JWT
      `;
      
      const issues = analyzer.analyzeFile('secrets.js', content);
      
      const secretIssues = issues.filter(issue => 
        issue.category === 'Secret Detection' || issue.type === 'Secret'
      );
      
      expect(secretIssues.length).toBeGreaterThan(0);
      
      // Should have at least one high-severity secret
      const highSeveritySecrets = secretIssues.filter(issue => 
        issue.severity === 'Critical' || issue.severity === 'High'
      );
      expect(highSeveritySecrets.length).toBeGreaterThan(0);
    });

    it('should provide proper remediation guidance', () => {
      const content = `
        const apiKey = "sk_live_1234567890abcdef1234567890abcdef";
      `;
      
      const issues = analyzer.analyzeFile('payment.js', content);
      
      const secretIssues = issues.filter(issue => 
        issue.category === 'Secret Detection' || issue.type === 'Secret'
      );
      
      expect(secretIssues.length).toBeGreaterThan(0);
      
      const secretIssue = secretIssues[0];
      expect(secretIssue.remediation.description).toContain('environment');
      expect(secretIssue.remediation.effort).toMatch(/^(Low|Medium|High)$/);
      expect(secretIssue.remediation.priority).toBeGreaterThan(0);
      expect(secretIssue.remediation.priority).toBeLessThanOrEqual(5);
    });

    it('should include proper references and tags', () => {
      const content = `
        const privateKey = \`-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA1234567890abcdef...
-----END RSA PRIVATE KEY-----\`;
      `;
      
      const issues = analyzer.analyzeFile('crypto.js', content);
      
      const secretIssues = issues.filter(issue => 
        issue.category === 'Secret Detection' || issue.type === 'Secret'
      );
      
      expect(secretIssues.length).toBeGreaterThan(0);
      
      const secretIssue = secretIssues[0];
      expect(secretIssue.references).toBeDefined();
      expect(secretIssue.references!.length).toBeGreaterThan(0);
      expect(secretIssue.tags).toBeDefined();
      expect(secretIssue.tags!.length).toBeGreaterThan(0);
      expect(secretIssue.tags).toContain('secret');
    });
  });

  describe('Combined analysis', () => {
    it('should detect both traditional security issues and secrets', () => {
      const content = `
        const apiKey = "AKIAIOSFODNN7EXAMPLE";
        
        function unsafeEval(userInput) {
          return eval(userInput); // Traditional security issue
        }
        
        const dbPassword = "hardcodedPassword123"; // Secret issue
      `;
      
      const issues = analyzer.analyzeFile('vulnerable.js', content);
      
      const secretIssues = issues.filter(issue => 
        issue.category === 'Secret Detection' || issue.type === 'Secret'
      );
      const traditionalIssues = issues.filter(issue => 
        issue.category !== 'Secret Detection' && issue.type !== 'Secret'
      );
      
      expect(secretIssues.length).toBeGreaterThan(0);
      expect(traditionalIssues.length).toBeGreaterThan(0);
      expect(issues.length).toBe(secretIssues.length + traditionalIssues.length);
    });
  });

  describe('File type handling', () => {
    it('should detect secrets in different file types', () => {
      const content = `
        const config = {
          apiKey: "AKIAIOSFODNN7EXAMPLE"
        };
      `;
      
      const fileTypes = ['config.js', 'app.ts', 'settings.py', 'Config.java'];
      
      fileTypes.forEach(filename => {
        const issues = analyzer.analyzeFile(filename, content);
        const secretIssues = issues.filter(issue => 
          issue.category === 'Secret Detection' || issue.type === 'Secret'
        );
        
        expect(secretIssues.length).toBeGreaterThan(0);
        expect(secretIssues[0].filename).toBe(filename);
      });
    });
  });
});
