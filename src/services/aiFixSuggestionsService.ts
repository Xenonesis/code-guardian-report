// src/services/aiFixSuggestionsService.ts

import { SecurityIssue } from '@/hooks/useAnalysis';
import { AIService } from './aiService';
import { FixSuggestion, CodeChange, FrameworkSpecificFix, ConfigChange, AutoRefactorResult, FixSuggestionRequest } from './types';

export class AIFixSuggestionsService {
  private aiService: AIService;
  private fixCache: Map<string, FixSuggestion[]> = new Map();

  constructor() {
    this.aiService = new AIService();
  }

  /**
   * Generate AI-powered fix suggestions for a security issue
   */
  public async generateFixSuggestions(request: FixSuggestionRequest): Promise<FixSuggestion[]> {
    const cacheKey = this.generateCacheKey(request);
    
    // Check cache first
    if (this.fixCache.has(cacheKey)) {
      return this.fixCache.get(cacheKey)!;
    }

    try {
      // NOTE: This call is now a local mock implementation as per the maintainer's request.
      const suggestions = await this.generateAIFixSuggestions(request);
      
      // Cache the results
      this.fixCache.set(cacheKey, suggestions);
      
      return suggestions;
    } catch (error) {
      console.error('Error generating fix suggestions:', error);
      throw new Error(`Failed to generate fix suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate multiple fix approaches using AI (NOW MOCKED)
   */
  private async generateAIFixSuggestions(request: FixSuggestionRequest): Promise<FixSuggestion[]> {
    console.log("AIFixSuggestionsService: Returning MOCK fix suggestions for UI testing based on maintainer's feedback.");

    // Simulate network delay to make it feel real
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Original problematic code from app.py:
    const originalVulnerableCode = `
@app.route('/user', methods=['GET'])
def get_user():
    user_id = request.args.get('id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # This is the vulnerable line: Directly embedding user input into a SQL query
    query = f"SELECT * FROM users WHERE id = {user_id}"

    # For demonstration, we'll just print the query.
    print(f"Executing query: {query}")
`;

    const suggestedFixedCode = `
@app.route('/user', methods=['GET'])
def get_user():
    user_id = request.args.get('id')
    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    # Vulnerability fixed: Using parameterized queries with a placeholder
    # This prevents SQL Injection by separating data from the query structure.
    query = "SELECT * FROM users WHERE id = %s" # Use placeholder
    # In a real app, you'd use a DB API that supports parameters
    # For example: cursor.execute(query, (user_id,))

    # For demonstration, we'll just print the query.
    print(f"Executing secure query: {query} with ID: {user_id}")
`;

    const mockSuggestions: FixSuggestion[] = [
      {
        id: 'mock-sql-fix-1',
        issueId: request.issue.id,
        title: 'Implement Parameterized Query',
        description: 'Refactor SQL query to use parameterized statements to prevent injection.',
        explanation: 'Directly concatenating user input into SQL queries creates SQL Injection vulnerabilities. Parameterized queries separate the SQL logic from user-provided data, ensuring that input is treated as data, not executable code.',
        codeChanges: [
          {
            filename: 'app.py',
            originalCode: originalVulnerableCode,
            suggestedCode: suggestedFixedCode,
            type: 'replace',
            reasoning: 'The original code directly inserts user_id into the SQL string. The fix replaces this with a parameter placeholder and explains how to use it securely.',
            startLine: 30, // Approximate line numbers from your test file
            endLine: 34,
          },
        ],
        confidence: 95,
        effort: 'Low',
        priority: 5,
        securityBenefit: 'Completely eliminates SQL Injection risk for this query.',
        riskAssessment: 'Very low risk of breaking existing functionality if database client supports parameterized queries correctly.',
        testingRecommendations: [
          'Verify application functionality with valid user IDs.',
          'Attempt SQL injection payloads (e.g., "1 OR 1=1") to confirm they are correctly escaped and do not alter query logic.',
        ],
        relatedPatterns: ['OWASP A03:2021-Injection', 'CWE-89: Improper Neutralization of Special Elements in SQL Command'],
        frameworkSpecific: {
          framework: 'Flask',
          version: '2.x',
          dependencies: ['Flask', 'YourDatabaseConnector'],
        },
      },
      {
        id: 'mock-debug-fix-2',
        issueId: request.issue.id,
        title: 'Disable Flask Debug Mode in Production',
        description: 'Ensure Flask debug mode is explicitly set to False for production deployments.',
        explanation: 'Running Flask with debug=True in a production environment exposes sensitive information (e.g., stack traces, interactive debugger) which can be exploited by attackers to gain control or access data.',
        codeChanges: [
          {
            filename: 'app.py',
            originalCode: `if __name__ == '__main__':\n    app.run(debug=True)`,
            suggestedCode: `if __name__ == '__main__':\n    app.run(debug=False, host='0.0.0.0') # Set debug=False for production`,
            type: 'replace',
            reasoning: 'The debug parameter should always be false in production environments for security.',
            startLine: 37,
            endLine: 37,
          },
        ],
        confidence: 99,
        effort: 'Low',
        priority: 5,
        securityBenefit: 'Prevents information disclosure and remote code execution vulnerabilities.',
        riskAssessment: 'No functional risk; improves security posture significantly.',
        testingRecommendations: [
          'Verify application runs without debugger in production mode.',
          'Check logs for any errors that would normally appear in debug mode.',
        ],
        relatedPatterns: ['OWASP A06:2021-Vulnerable and Outdated Components', 'CWE-489: Leftover Debug Code'],
      },
    ];

    return mockSuggestions;
  }

  /**
   * Parse AI response and validate fix suggestions
   */
  private parseAIResponse(response: string, request: FixSuggestionRequest): Omit<FixSuggestion, 'id' | 'issueId'>[] {
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\[([\s\S]*)\]/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response;
      
      const suggestions = JSON.parse(jsonString) as unknown[];
      
      if (!Array.isArray(suggestions)) {
        throw new Error('Response is not an array');
      }

      return suggestions.map((suggestion, index) => this.validateAndEnhanceSuggestion(suggestion, request, index));
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      // Fallback to basic suggestion
      return [this.createFallbackSuggestion(request)];
    }
  }

  /**
   * Validate and enhance a single fix suggestion
   */
  private validateAndEnhanceSuggestion(
    suggestion: unknown, 
    request: FixSuggestionRequest, 
    index: number
  ): Omit<FixSuggestion, 'id' | 'issueId'> {
    const suggestionObj = suggestion as Record<string, unknown>;
    return {
      title: (suggestionObj.title as string) || `Fix Approach ${index + 1}`,
      description: (suggestionObj.description as string) || 'AI-generated fix suggestion',
      confidence: Math.min(100, Math.max(0, (suggestionObj.confidence as number) || 70)),
      effort: this.validateEffort(suggestionObj.effort),
      priority: Math.min(5, Math.max(1, (suggestionObj.priority as number) || 3)),
      codeChanges: this.validateCodeChanges((suggestionObj.codeChanges as unknown[]) || [], request),
      explanation: (suggestionObj.explanation as string) || 'This fix addresses the security vulnerability by implementing secure coding practices.',
      securityBenefit: (suggestionObj.securityBenefit as string) || 'Improves application security posture.',
      riskAssessment: (suggestionObj.riskAssessment as string) || 'Low risk of breaking changes.',
      testingRecommendations: Array.isArray(suggestionObj.testingRecommendations) 
        ? suggestionObj.testingRecommendations as string[]
        : ['Test the fix thoroughly before deployment'],
      relatedPatterns: Array.isArray(suggestionObj.relatedPatterns) 
        ? suggestionObj.relatedPatterns as string[]
        : [],
      frameworkSpecific: suggestionObj.frameworkSpecific as FrameworkSpecificFix | undefined
    };
  }

  /**
   * Validate effort level
   */
  private validateEffort(effort: unknown): 'Low' | 'Medium' | 'High' {
    const validEfforts = ['Low', 'Medium', 'High'];
    return validEfforts.includes(effort) ? effort : 'Medium';
  }

  /**
   * Validate and enhance code changes
   */
  private validateCodeChanges(changes: unknown[], request: FixSuggestionRequest): CodeChange[] {
    if (!Array.isArray(changes)) {
      return [];
    }

    return changes.map(change => {
      const changeObj = change as Record<string, unknown>;
      return {
        type: this.validateChangeType(changeObj.type),
        filename: (changeObj.filename as string) || request.issue.filename,
        startLine: Math.max(1, (changeObj.startLine as number) || request.issue.line),
        endLine: Math.max((changeObj.startLine as number) || request.issue.line, (changeObj.endLine as number) || request.issue.line),
        originalCode: (changeObj.originalCode as string) || '',
        suggestedCode: (changeObj.suggestedCode as string) || '',
        reasoning: (changeObj.reasoning as string) || 'Security improvement'
      };
    });
  }

  /**
   * Validate change type
   */
  private validateChangeType(type: unknown): 'replace' | 'insert' | 'delete' | 'refactor' {
    const validTypes = ['replace', 'insert', 'delete', 'refactor'];
    return validTypes.includes(type) ? type : 'replace';
  }

  /**
   * Generate cache key for fix suggestions
   */
  private generateCacheKey(request: FixSuggestionRequest): string {
    const { issue, language, framework } = request;
    return `${issue.id}-${issue.type}-${language}-${framework || 'none'}-${issue.line}`;
  }

  /**
   * Generate unique fix ID
   */
  private generateFixId(issueId: string, index: number): string {
    return `fix-${issueId}-${index}-${Date.now()}`;
  }

  /**
   * Clear fix suggestions cache
   */
  public clearCache(): void {
    this.fixCache.clear();
  }

  /**
   * Get cached suggestions count
   */
  public getCacheSize(): number {
    return this.fixCache.size;
  }

  /**
   * Create fallback suggestion when AI parsing fails
   */
  private createFallbackSuggestion(request: FixSuggestionRequest): Omit<FixSuggestion, 'id' | 'issueId'> {
    return {
      title: 'Basic Security Fix',
      description: `Address ${request.issue.type} vulnerability in ${request.issue.filename}`,
      confidence: 60,
      effort: 'Medium',
      priority: 3,
      codeChanges: [{
        type: 'replace',
        filename: request.issue.filename,
        startLine: request.issue.line,
        endLine: request.issue.line,
        originalCode: 'Vulnerable code pattern',
        suggestedCode: 'Secure implementation',
        reasoning: 'Apply security best practices'
      }],
      explanation: 'This fix addresses the identified security vulnerability using standard security practices.',
      securityBenefit: 'Reduces security risk and improves code safety.',
      riskAssessment: 'Review changes carefully before applying.',
      testingRecommendations: [
        'Test functionality after applying fix',
        'Run security scans to verify fix effectiveness',
        'Perform regression testing'
      ],
      relatedPatterns: []
    };
  }

  /**
   * Apply automated refactoring for simple fixes
   */
  public async applyAutomatedRefactor(
    suggestion: FixSuggestion,
    fileContents: Map<string, string>
  ): Promise<AutoRefactorResult> {
    const result: AutoRefactorResult = {
      success: false,
      appliedChanges: [],
      warnings: [],
      errors: [],
      testSuggestions: []
    };

    try {
      for (const change of suggestion.codeChanges) {
        const fileContent = fileContents.get(change.filename);

        if (!fileContent) {
          result.errors.push(`File not found: ${change.filename}`);
          continue;
        }

        const lines = fileContent.split('\n');

        // Validate line numbers
        if (change.startLine < 1 || change.startLine > lines.length) {
          result.errors.push(`Invalid line number ${change.startLine} in ${change.filename}`);
          continue;
        }

        // Apply the change based on type
        switch (change.type) {
          case 'replace':
            this.applyReplaceChange(lines, change, result);
            break;
          case 'insert':
            this.applyInsertChange(lines, change, result);
            break;
          case 'delete':
            this.applyDeleteChange(lines, change, result);
            break;
          case 'refactor':
            this.applyRefactorChange(lines, change, result);
            break;
        }

        // Update file content
        fileContents.set(change.filename, lines.join('\n'));
        result.appliedChanges.push(change);
      }

      result.success = result.errors.length === 0;
      result.testSuggestions = suggestion.testingRecommendations;

      if (result.success) {
        result.warnings.push('Please review all changes before committing');
        result.warnings.push('Run comprehensive tests to ensure functionality');
      }

    } catch (error) {
      result.errors.push(`Refactoring failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return result;
  }

  /**
   * Apply replace-type code change
   */
  private applyReplaceChange(lines: string[], change: CodeChange, result: AutoRefactorResult): void {
    const startIdx = change.startLine - 1;
    const endIdx = change.endLine - 1;

    // Verify original code matches (basic check)
    const originalLines = lines.slice(startIdx, endIdx + 1);
    const originalCode = originalLines.join('\n').trim();

    if (change.originalCode && !originalCode.includes(change.originalCode.trim())) {
      result.warnings.push(`Original code mismatch in ${change.filename}:${change.startLine}`);
    }

    // Replace the lines
    const newLines = change.suggestedCode.split('\n');
    lines.splice(startIdx, endIdx - startIdx + 1, ...newLines);
  }

  /**
   * Apply insert-type code change
   */
  private applyInsertChange(lines: string[], change: CodeChange, result: AutoRefactorResult): void {
    const insertIdx = change.startLine - 1;
    const newLines = change.suggestedCode.split('\n');
    lines.splice(insertIdx, 0, ...newLines);
  }

  /**
   * Apply delete-type code change
   */
  private applyDeleteChange(lines: string[], change: CodeChange, result: AutoRefactorResult): void {
    const startIdx = change.startLine - 1;
    const endIdx = change.endLine - 1;
    lines.splice(startIdx, endIdx - startIdx + 1);
  }

  /**
   * Apply refactor-type code change (more complex transformation)
   */
  private applyRefactorChange(lines: string[], change: CodeChange, result: AutoRefactorResult): void {
    // For refactor changes, we'll treat them as replace for now
    // In a more advanced implementation, this could involve AST manipulation
    this.applyReplaceChange(lines, change, result);
    result.warnings.push(`Refactor change applied as replacement in ${change.filename}`);
  }

  /**
   * Generate fix suggestions for multiple issues at once
   */
  public async generateBatchFixSuggestions(
    requests: FixSuggestionRequest[]
  ): Promise<Map<string, FixSuggestion[]>> {
    const results = new Map<string, FixSuggestion[]>();

    // Process requests in parallel with rate limiting
    const batchSize = 3; // Limit concurrent AI requests

    for (let i = 0; i < requests.length; i += batchSize) {
      const batch = requests.slice(i, i + batchSize);

      const batchPromises = batch.map(async (request) => {
        try {
          const suggestions = await this.generateFixSuggestions(request);
          return { issueId: request.issue.id, suggestions };
        } catch (error) {
          return { issueId: request.issue.id, suggestions: [] };
        }
      });

      const batchResults = await Promise.all(batchPromises);

      batchResults.forEach(({ issueId, suggestions }) => {
        results.set(issueId, suggestions);
      });

      // Small delay between batches to avoid rate limiting
      if (i + batchSize < requests.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Get fix suggestions statistics
   */
  public getFixStatistics(suggestions: FixSuggestion[]): {
    totalSuggestions: number;
    averageConfidence: number;
    effortDistribution: Record<string, number>;
    priorityDistribution: Record<number, number>;
    mostCommonPatterns: string[];
  } {
    if (suggestions.length === 0) {
      return {
        totalSuggestions: 0,
        averageConfidence: 0,
        effortDistribution: {},
        priorityDistribution: {},
        mostCommonPatterns: []
      };
    }

    const totalConfidence = suggestions.reduce((sum, s) => sum + s.confidence, 0);
    const averageConfidence = totalConfidence / suggestions.length;

    const effortDistribution: Record<string, number> = {};
    const priorityDistribution: Record<number, number> = {};
    const patternCounts: Record<string, number> = {};

    suggestions.forEach(suggestion => {
      // Effort distribution
      effortDistribution[suggestion.effort] = (effortDistribution[suggestion.effort] || 0) + 1;

      // Priority distribution
      priorityDistribution[suggestion.priority] = (priorityDistribution[suggestion.priority] || 0) + 1;

      // Pattern frequency
      suggestion.relatedPatterns.forEach(pattern => {
        patternCounts[pattern] = (patternCounts[pattern] || 0) + 1;
      });
    });

    const mostCommonPatterns = Object.entries(patternCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([pattern]) => pattern);

    return {
      totalSuggestions: suggestions.length,
      averageConfidence: Math.round(averageConfidence),
      effortDistribution,
      priorityDistribution,
      mostCommonPatterns
    };
  }
}