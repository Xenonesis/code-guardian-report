import { describe, it, expect } from 'vitest';
import { naturalLanguageDescriptionService } from '../naturalLanguageDescriptionService';
import { SecurityIssue } from '@/hooks/useAnalysis';

describe('NaturalLanguageDescriptionService', () => {
  const createMockIssue = (overrides: Partial<SecurityIssue> = {}): SecurityIssue => ({
    id: 'test-id',
    line: 42,
    column: 10,
    tool: 'Test Tool',
    type: 'SQL Injection',
    category: 'Injection',
    message: 'SQL injection vulnerability detected in user input handling',
    severity: 'High',
    confidence: 85,
    cvssScore: 8.5,
    cweId: 'CWE-89',
    owaspCategory: 'A03:2021 – Injection',
    recommendation: 'Use parameterized queries to prevent SQL injection',
    remediation: {
      description: 'Use parameterized queries to prevent SQL injection',
      effort: 'Medium',
      priority: 4
    },
    filename: 'src/controllers/userController.js',
    codeSnippet: 'const query = "SELECT * FROM users WHERE id = " + userId;',
    riskRating: 'High',
    impact: 'Could allow unauthorized database access',
    likelihood: 'High',
    references: ['https://owasp.org/www-project-top-ten/'],
    tags: ['injection', 'sql'],
    ...overrides
  });

  describe('generateDescription', () => {
    it('should generate natural language description for SQL injection', () => {
      const issue = createMockIssue({
        type: 'SQL Injection',
        category: 'Injection',
        severity: 'High',
        filename: 'src/controllers/userController.js',
        line: 42
      });

      const description = naturalLanguageDescriptionService.generateDescription(issue);

      expect(description).toContain('SQL injection vulnerability');
      expect(description).toContain('userController.js');
      expect(description).toContain('line 42');
      expect(description).toContain('high-priority');
      expect(description).toBeTruthy();
    });

    it('should generate natural language description for XSS vulnerability', () => {
      const issue = createMockIssue({
        type: 'XSS',
        category: 'Cross-Site Scripting',
        severity: 'Medium',
        filename: 'src/views/profile.html',
        line: 15,
        impact: 'Could allow script injection in user browsers'
      });

      const description = naturalLanguageDescriptionService.generateDescription(issue);

      expect(description).toContain('cross-site scripting');
      expect(description).toContain('profile.html');
      expect(description).toContain('line 15');
      expect(description).toContain('moderate');
      expect(description).toBeTruthy();
    });

    it('should generate natural language description for secret detection', () => {
      const issue = createMockIssue({
        type: 'Hardcoded Secret',
        category: 'Secret Detection',
        severity: 'Critical',
        filename: 'config/database.js',
        line: 8,
        message: 'AWS Access Key detected in source code',
        impact: 'Could expose AWS infrastructure to unauthorized access'
      });

      const description = naturalLanguageDescriptionService.generateDescription(issue);

      expect(description).toContain('hardcoded secret');
      expect(description).toContain('database.js');
      expect(description).toContain('line 8');
      expect(description).toContain('critical');
      expect(description).toBeTruthy();
    });

    it('should generate natural language description for access control issues', () => {
      const issue = createMockIssue({
        type: 'Authorization Issue',
        category: 'Broken Access Control',
        severity: 'High',
        filename: 'src/middleware/auth.js',
        line: 25,
        impact: 'Users could access unauthorized resources'
      });

      const description = naturalLanguageDescriptionService.generateDescription(issue);

      expect(description).toContain('access control');
      expect(description).toContain('auth.js');
      expect(description).toContain('line 25');
      expect(description).toContain('high-priority');
      expect(description).toBeTruthy();
    });

    it('should handle unknown issue types gracefully', () => {
      const issue = createMockIssue({
        type: 'Unknown Vulnerability',
        category: 'Unknown Category',
        severity: 'Low',
        filename: 'src/unknown.js',
        line: 1,
        message: 'Some unknown security issue'
      });

      const description = naturalLanguageDescriptionService.generateDescription(issue);

      expect(description).toContain('unknown.js');
      expect(description).toContain('line 1');
      expect(description).toContain('low-priority');
      expect(description).toBeTruthy();
    });

    it('should include contextual information when available', () => {
      const issue = createMockIssue({
        type: 'SQL Injection',
        category: 'Injection',
        severity: 'Critical',
        confidence: 95,
        cweId: 'CWE-89',
        owaspCategory: 'A03:2021 – Injection',
        filename: 'src/api/users.js',
        line: 100
      });

      const description = naturalLanguageDescriptionService.generateDescription(issue);

      expect(description).toContain('CWE-89');
      expect(description).toContain('OWASP');
      expect(description).toContain('very high confidence');
      expect(description).toBeTruthy();
    });

    it('should handle missing optional fields gracefully', () => {
      const issue = createMockIssue({
        type: 'Generic Issue',
        category: 'Security',
        severity: 'Medium',
        filename: 'test.js',
        line: 5,
        cweId: undefined,
        owaspCategory: undefined,
        cvssScore: undefined,
        confidence: 50
      });

      const description = naturalLanguageDescriptionService.generateDescription(issue);

      expect(description).toContain('test.js');
      expect(description).toContain('line 5');
      expect(description).toContain('moderate');
      expect(description).toBeTruthy();
    });

    it('should provide appropriate confidence descriptions', () => {
      const highConfidenceIssue = createMockIssue({ confidence: 95 });
      const mediumConfidenceIssue = createMockIssue({ confidence: 75 });
      const lowConfidenceIssue = createMockIssue({ confidence: 40 });

      const highDescription = naturalLanguageDescriptionService.generateDescription(highConfidenceIssue);
      const mediumDescription = naturalLanguageDescriptionService.generateDescription(mediumConfidenceIssue);
      const lowDescription = naturalLanguageDescriptionService.generateDescription(lowConfidenceIssue);

      expect(highDescription).toContain('very high confidence');
      expect(mediumDescription).toContain('high confidence');
      expect(lowDescription).toContain('low confidence');
    });

    it('should handle different severity levels appropriately', () => {
      const criticalIssue = createMockIssue({ severity: 'Critical' });
      const highIssue = createMockIssue({ severity: 'High' });
      const mediumIssue = createMockIssue({ severity: 'Medium' });
      const lowIssue = createMockIssue({ severity: 'Low' });

      const criticalDescription = naturalLanguageDescriptionService.generateDescription(criticalIssue);
      const highDescription = naturalLanguageDescriptionService.generateDescription(highIssue);
      const mediumDescription = naturalLanguageDescriptionService.generateDescription(mediumIssue);
      const lowDescription = naturalLanguageDescriptionService.generateDescription(lowIssue);

      expect(criticalDescription).toContain('critical');
      expect(highDescription).toContain('high-priority');
      expect(mediumDescription).toContain('moderate');
      expect(lowDescription).toContain('low-priority');
    });

    it('should create fallback description when generation fails', () => {
      // Create an issue that might cause issues in template processing
      const problematicIssue = createMockIssue({
        type: '',
        category: '',
        severity: 'High',
        filename: 'test.js',
        line: 1,
        message: 'Test message'
      });

      const description = naturalLanguageDescriptionService.generateDescription(problematicIssue);

      expect(description).toContain('test.js');
      expect(description).toContain('line 1');
      expect(description).toBeTruthy();
    });
  });
});
