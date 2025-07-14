import { describe, it, expect, beforeEach } from 'vitest';
import { SecureCodeSearchService, SearchFilters, CodeSnippet } from '../secureCodeSearchService';

describe('SecureCodeSearchService', () => {
  let service: SecureCodeSearchService;

  beforeEach(() => {
    service = new SecureCodeSearchService();
  });

  describe('searchSnippets', () => {
    it('should search for code snippets by query', async () => {
      const results = await service.searchSnippets('XSS prevention');

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      
      const firstResult = results[0];
      expect(firstResult).toHaveProperty('snippet');
      expect(firstResult).toHaveProperty('relevanceScore');
      expect(firstResult).toHaveProperty('matchedTerms');
      expect(firstResult).toHaveProperty('highlightedCode');
    });

    it('should filter results by language', async () => {
      const filters: SearchFilters = { language: 'javascript' };
      const results = await service.searchSnippets('security', filters);

      results.forEach(result => {
        expect(result.snippet.language).toBe('javascript');
      });
    });

    it('should filter results by security level', async () => {
      const filters: SearchFilters = { securityLevel: 'secure' };
      const results = await service.searchSnippets('code', filters);

      results.forEach(result => {
        expect(result.snippet.securityLevel).toBe('secure');
      });
    });

    it('should filter results by framework', async () => {
      const filters: SearchFilters = { framework: 'React' };
      const results = await service.searchSnippets('component', filters);

      results.forEach(result => {
        expect(result.snippet.framework).toBe('React');
      });
    });

    it('should limit results', async () => {
      const results = await service.searchSnippets('security', {}, 2);

      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('should return empty array for no matches', async () => {
      const results = await service.searchSnippets('nonexistent-term-xyz123');

      expect(results).toEqual([]);
    });

    it('should sort results by relevance score', async () => {
      const results = await service.searchSnippets('XSS');

      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].relevanceScore).toBeGreaterThanOrEqual(results[i].relevanceScore);
      }
    });

    it('should highlight matched terms in code', async () => {
      const results = await service.searchSnippets('DOMPurify');

      const resultWithMatch = results.find(r => r.snippet.code.includes('DOMPurify'));
      if (resultWithMatch) {
        expect(resultWithMatch.highlightedCode).toContain('<mark>');
      }
    });
  });

  describe('getSecureAlternatives', () => {
    it('should find secure alternatives for vulnerability types', async () => {
      const alternatives = await service.getSecureAlternatives(
        'Cross-Site Scripting',
        'javascript',
        'React'
      );

      expect(Array.isArray(alternatives)).toBe(true);
      alternatives.forEach(snippet => {
        expect(snippet.securityLevel).toBe('secure');
        expect(snippet.language).toBe('javascript');
        expect(snippet.framework).toBe('React');
      });
    });

    it('should work without framework filter', async () => {
      const alternatives = await service.getSecureAlternatives(
        'SQL Injection',
        'javascript'
      );

      expect(Array.isArray(alternatives)).toBe(true);
      alternatives.forEach(snippet => {
        expect(snippet.securityLevel).toBe('secure');
        expect(snippet.language).toBe('javascript');
      });
    });
  });

  describe('getSnippetsByCategory', () => {
    it('should get snippets by category', async () => {
      const snippets = await service.getSnippetsByCategory('XSS Prevention');

      expect(Array.isArray(snippets)).toBe(true);
      snippets.forEach(snippet => {
        expect(snippet.category).toBe('XSS Prevention');
      });
    });

    it('should filter by language and security level', async () => {
      const snippets = await service.getSnippetsByCategory(
        'XSS Prevention',
        'javascript',
        'secure'
      );

      snippets.forEach(snippet => {
        expect(snippet.category).toBe('XSS Prevention');
        expect(snippet.language).toBe('javascript');
        expect(snippet.securityLevel).toBe('secure');
      });
    });
  });

  describe('metadata methods', () => {
    it('should get all categories', () => {
      const categories = service.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories).toContain('XSS Prevention');
    });

    it('should get all languages', () => {
      const languages = service.getLanguages();

      expect(Array.isArray(languages)).toBe(true);
      expect(languages.length).toBeGreaterThan(0);
      expect(languages).toContain('javascript');
    });

    it('should get all frameworks', () => {
      const frameworks = service.getFrameworks();

      expect(Array.isArray(frameworks)).toBe(true);
      expect(frameworks.length).toBeGreaterThan(0);
    });

    it('should get all tags', () => {
      const tags = service.getTags();

      expect(Array.isArray(tags)).toBe(true);
      expect(tags.length).toBeGreaterThan(0);
    });
  });

  describe('snippet management', () => {
    it('should add new snippet', () => {
      const newSnippet = {
        title: 'Test Snippet',
        description: 'Test description',
        language: 'python',
        category: 'Test Category',
        securityLevel: 'secure' as const,
        code: 'print("Hello, World!")',
        explanation: 'Test explanation',
        tags: ['test'],
        relatedPatterns: [],
        difficulty: 'beginner' as const,
        useCase: 'Testing'
      };

      const id = service.addSnippet(newSnippet);

      expect(typeof id).toBe('string');
      expect(id.length).toBeGreaterThan(0);
    });

    it('should update existing snippet', () => {
      const newSnippet = {
        title: 'Test Snippet',
        description: 'Test description',
        language: 'python',
        category: 'Test Category',
        securityLevel: 'secure' as const,
        code: 'print("Hello, World!")',
        explanation: 'Test explanation',
        tags: ['test'],
        relatedPatterns: [],
        difficulty: 'beginner' as const,
        useCase: 'Testing'
      };

      const id = service.addSnippet(newSnippet);
      const success = service.updateSnippet(id, { title: 'Updated Title' });

      expect(success).toBe(true);
    });

    it('should fail to update non-existent snippet', () => {
      const success = service.updateSnippet('non-existent-id', { title: 'Updated Title' });

      expect(success).toBe(false);
    });

    it('should delete snippet', () => {
      const newSnippet = {
        title: 'Test Snippet',
        description: 'Test description',
        language: 'python',
        category: 'Test Category',
        securityLevel: 'secure' as const,
        code: 'print("Hello, World!")',
        explanation: 'Test explanation',
        tags: ['test'],
        relatedPatterns: [],
        difficulty: 'beginner' as const,
        useCase: 'Testing'
      };

      const id = service.addSnippet(newSnippet);
      const success = service.deleteSnippet(id);

      expect(success).toBe(true);
    });

    it('should fail to delete non-existent snippet', () => {
      const success = service.deleteSnippet('non-existent-id');

      expect(success).toBe(false);
    });
  });

  describe('getStatistics', () => {
    it('should return comprehensive statistics', () => {
      const stats = service.getStatistics();

      expect(stats).toHaveProperty('totalSnippets');
      expect(stats).toHaveProperty('secureSnippets');
      expect(stats).toHaveProperty('insecureSnippets');
      expect(stats).toHaveProperty('languageDistribution');
      expect(stats).toHaveProperty('categoryDistribution');

      expect(typeof stats.totalSnippets).toBe('number');
      expect(typeof stats.secureSnippets).toBe('number');
      expect(typeof stats.insecureSnippets).toBe('number');
      expect(typeof stats.languageDistribution).toBe('object');
      expect(typeof stats.categoryDistribution).toBe('object');
    });

    it('should have consistent statistics', () => {
      const stats = service.getStatistics();

      expect(stats.secureSnippets + stats.insecureSnippets).toBeLessThanOrEqual(stats.totalSnippets);
    });
  });

  describe('search relevance scoring', () => {
    it('should score exact title matches higher', async () => {
      const results = await service.searchSnippets('XSS Prevention');

      const exactMatch = results.find(r => r.snippet.title.includes('XSS Prevention'));
      if (exactMatch && results.length > 1) {
        const otherResults = results.filter(r => r !== exactMatch);
        expect(exactMatch.relevanceScore).toBeGreaterThan(otherResults[0].relevanceScore);
      }
    });

    it('should include matched terms', async () => {
      const results = await service.searchSnippets('sanitization DOMPurify');

      results.forEach(result => {
        expect(Array.isArray(result.matchedTerms)).toBe(true);
        expect(result.matchedTerms.length).toBeGreaterThan(0);
      });
    });

    it('should prefer secure snippets', async () => {
      const results = await service.searchSnippets('javascript');

      const secureResults = results.filter(r => r.snippet.securityLevel === 'secure');
      const insecureResults = results.filter(r => r.snippet.securityLevel === 'insecure');

      if (secureResults.length > 0 && insecureResults.length > 0) {
        // Secure snippets should generally score higher for the same content
        const avgSecureScore = secureResults.reduce((sum, r) => sum + r.relevanceScore, 0) / secureResults.length;
        const avgInsecureScore = insecureResults.reduce((sum, r) => sum + r.relevanceScore, 0) / insecureResults.length;
        
        // This is a general trend, not a strict rule
        expect(avgSecureScore).toBeGreaterThanOrEqual(avgInsecureScore - 5);
      }
    });
  });

  describe('search filters combination', () => {
    it('should apply multiple filters correctly', async () => {
      const filters: SearchFilters = {
        language: 'javascript',
        securityLevel: 'secure',
        difficulty: 'intermediate'
      };

      const results = await service.searchSnippets('security', filters);

      results.forEach(result => {
        expect(result.snippet.language).toBe('javascript');
        expect(result.snippet.securityLevel).toBe('secure');
        expect(result.snippet.difficulty).toBe('intermediate');
      });
    });

    it('should handle tag filters', async () => {
      const filters: SearchFilters = {
        tags: ['xss', 'sanitization']
      };

      const results = await service.searchSnippets('security', filters);

      results.forEach(result => {
        const hasMatchingTag = filters.tags!.some(tag => 
          result.snippet.tags.includes(tag)
        );
        expect(hasMatchingTag).toBe(true);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty search query', async () => {
      const results = await service.searchSnippets('');

      expect(results).toEqual([]);
    });

    it('should handle very short search terms', async () => {
      const results = await service.searchSnippets('a b');

      // Short terms should be filtered out
      expect(results).toEqual([]);
    });

    it('should handle special characters in search', async () => {
      const results = await service.searchSnippets('function() { }');

      expect(Array.isArray(results)).toBe(true);
      // Should not throw errors
    });

    it('should handle case insensitive search', async () => {
      const lowerResults = await service.searchSnippets('xss');
      const upperResults = await service.searchSnippets('XSS');

      expect(lowerResults.length).toBeGreaterThan(0);
      expect(upperResults.length).toBeGreaterThan(0);
      // Results should be similar (though not necessarily identical due to scoring)
    });
  });
});
