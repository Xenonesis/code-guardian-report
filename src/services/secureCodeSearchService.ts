/* eslint-disable no-useless-escape */
export interface CodeSnippet {
  id: string;
  title: string;
  description: string;
  language: string;
  framework?: string;
  category: string;
  securityLevel: 'secure' | 'insecure' | 'improved';
  code: string;
  explanation: string;
  tags: string[];
  vulnerabilityType?: string;
  cweId?: string;
  owaspCategory?: string;
  relatedPatterns: string[];
  lastUpdated: Date;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  useCase: string;
  alternatives?: string[];
}

export interface SearchFilters {
  language?: string;
  framework?: string;
  category?: string;
  securityLevel?: 'secure' | 'insecure' | 'improved';
  vulnerabilityType?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags?: string[];
}

export interface SearchResult {
  snippet: CodeSnippet;
  relevanceScore: number;
  matchedTerms: string[];
  highlightedCode: string;
}

export class SecureCodeSearchService {
  private snippets: CodeSnippet[] = [];
  private searchIndex: Map<string, Set<string>> = new Map();
  private initialized = false;

  constructor() {
    this.initializeDatabase();
  }

  /**
   * Initialize the secure code snippet database
   */
  private async initializeDatabase(): Promise<void> {
    if (this.initialized) return;

    // Load predefined secure code patterns
    this.snippets = this.getDefaultSnippets();
    
    // Build search index
    this.buildSearchIndex();
    
    this.initialized = true;
  }

  /**
   * Search for secure code snippets
   */
  public async searchSnippets(
    query: string, 
    filters: SearchFilters = {},
    limit: number = 20
  ): Promise<SearchResult[]> {
    await this.initializeDatabase();

    const queryTerms = this.tokenizeQuery(query);
    const results: SearchResult[] = [];

    for (const snippet of this.snippets) {
      // Apply filters
      if (!this.matchesFilters(snippet, filters)) {
        continue;
      }

      // Calculate relevance score
      const { score, matchedTerms } = this.calculateRelevanceScore(snippet, queryTerms);
      
      if (score > 0) {
        results.push({
          snippet,
          relevanceScore: score,
          matchedTerms,
          highlightedCode: this.highlightMatches(snippet.code, matchedTerms)
        });
      }
    }

    // Sort by relevance score and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Get secure alternatives for insecure code patterns
   */
  public async getSecureAlternatives(
    vulnerabilityType: string,
    language: string,
    framework?: string
  ): Promise<CodeSnippet[]> {
    await this.initializeDatabase();

    return this.snippets.filter(snippet => 
      snippet.securityLevel === 'secure' &&
      snippet.language === language &&
      (snippet.vulnerabilityType === vulnerabilityType || 
       snippet.tags.includes(vulnerabilityType)) &&
      (!framework || snippet.framework === framework)
    );
  }

  /**
   * Get code snippets by category
   */
  public async getSnippetsByCategory(
    category: string,
    language?: string,
    securityLevel?: 'secure' | 'insecure' | 'improved'
  ): Promise<CodeSnippet[]> {
    await this.initializeDatabase();

    return this.snippets.filter(snippet =>
      snippet.category === category &&
      (!language || snippet.language === language) &&
      (!securityLevel || snippet.securityLevel === securityLevel)
    );
  }

  /**
   * Get all available categories
   */
  public getCategories(): string[] {
    return [...new Set(this.snippets.map(s => s.category))].sort();
  }

  /**
   * Get all available languages
   */
  public getLanguages(): string[] {
    return [...new Set(this.snippets.map(s => s.language))].sort();
  }

  /**
   * Get all available frameworks
   */
  public getFrameworks(): string[] {
    return [...new Set(this.snippets.map(s => s.framework).filter(Boolean))].sort();
  }

  /**
   * Get all available tags
   */
  public getTags(): string[] {
    const allTags = this.snippets.flatMap(s => s.tags);
    return [...new Set(allTags)].sort();
  }

  /**
   * Add a new code snippet
   */
  public addSnippet(snippet: Omit<CodeSnippet, 'id' | 'lastUpdated'>): string {
    const id = this.generateId();
    const newSnippet: CodeSnippet = {
      ...snippet,
      id,
      lastUpdated: new Date()
    };

    this.snippets.push(newSnippet);
    this.updateSearchIndex(newSnippet);
    
    return id;
  }

  /**
   * Update an existing snippet
   */
  public updateSnippet(id: string, updates: Partial<CodeSnippet>): boolean {
    const index = this.snippets.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.snippets[index] = {
      ...this.snippets[index],
      ...updates,
      lastUpdated: new Date()
    };

    this.updateSearchIndex(this.snippets[index]);
    return true;
  }

  /**
   * Delete a snippet
   */
  public deleteSnippet(id: string): boolean {
    const index = this.snippets.findIndex(s => s.id === id);
    if (index === -1) return false;

    this.snippets.splice(index, 1);
    this.buildSearchIndex(); // Rebuild index
    return true;
  }

  /**
   * Get snippet statistics
   */
  public getStatistics(): {
    totalSnippets: number;
    secureSnippets: number;
    insecureSnippets: number;
    languageDistribution: Record<string, number>;
    categoryDistribution: Record<string, number>;
  } {
    const stats = {
      totalSnippets: this.snippets.length,
      secureSnippets: this.snippets.filter(s => s.securityLevel === 'secure').length,
      insecureSnippets: this.snippets.filter(s => s.securityLevel === 'insecure').length,
      languageDistribution: {} as Record<string, number>,
      categoryDistribution: {} as Record<string, number>
    };

    // Calculate distributions
    this.snippets.forEach(snippet => {
      stats.languageDistribution[snippet.language] = 
        (stats.languageDistribution[snippet.language] || 0) + 1;
      stats.categoryDistribution[snippet.category] = 
        (stats.categoryDistribution[snippet.category] || 0) + 1;
    });

    return stats;
  }

  /**
   * Tokenize search query
   */
  private tokenizeQuery(query: string): string[] {
    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(term => term.length > 2)
      .map(term => term.replace(/[^\w]/g, ''));
  }

  /**
   * Check if snippet matches filters
   */
  private matchesFilters(snippet: CodeSnippet, filters: SearchFilters): boolean {
    if (filters.language && snippet.language !== filters.language) return false;
    if (filters.framework && snippet.framework !== filters.framework) return false;
    if (filters.category && snippet.category !== filters.category) return false;
    if (filters.securityLevel && snippet.securityLevel !== filters.securityLevel) return false;
    if (filters.vulnerabilityType && snippet.vulnerabilityType !== filters.vulnerabilityType) return false;
    if (filters.difficulty && snippet.difficulty !== filters.difficulty) return false;
    if (filters.tags && !filters.tags.some(tag => snippet.tags.includes(tag))) return false;

    return true;
  }

  /**
   * Calculate relevance score for a snippet
   */
  private calculateRelevanceScore(
    snippet: CodeSnippet, 
    queryTerms: string[]
  ): { score: number; matchedTerms: string[] } {
    let score = 0;
    const matchedTerms: string[] = [];

    const searchableText = [
      snippet.title,
      snippet.description,
      snippet.explanation,
      snippet.code,
      ...snippet.tags,
      snippet.category,
      snippet.useCase
    ].join(' ').toLowerCase();

    queryTerms.forEach(term => {
      const termRegex = new RegExp(term, 'gi');
      const matches = searchableText.match(termRegex);
      
      if (matches) {
        matchedTerms.push(term);
        
        // Weight different fields differently
        if (snippet.title.toLowerCase().includes(term)) score += 10;
        if (snippet.description.toLowerCase().includes(term)) score += 5;
        if (snippet.tags.some(tag => tag.toLowerCase().includes(term))) score += 8;
        if (snippet.code.toLowerCase().includes(term)) score += 3;
        if (snippet.explanation.toLowerCase().includes(term)) score += 2;
        
        // Bonus for exact matches
        if (snippet.title.toLowerCase() === term) score += 20;
        
        // Bonus for secure snippets
        if (snippet.securityLevel === 'secure') score += 2;
      }
    });

    return { score, matchedTerms };
  }

  /**
   * Highlight matched terms in code
   */
  private highlightMatches(code: string, matchedTerms: string[]): string {
    let highlightedCode = code;
    
    matchedTerms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedCode = highlightedCode.replace(regex, '<mark>$1</mark>');
    });

    return highlightedCode;
  }

  /**
   * Build search index for faster searching
   */
  private buildSearchIndex(): void {
    this.searchIndex.clear();

    this.snippets.forEach(snippet => {
      this.updateSearchIndex(snippet);
    });
  }

  /**
   * Update search index for a single snippet
   */
  private updateSearchIndex(snippet: CodeSnippet): void {
    const terms = this.tokenizeQuery([
      snippet.title,
      snippet.description,
      snippet.explanation,
      snippet.code,
      ...snippet.tags
    ].join(' '));

    terms.forEach(term => {
      if (!this.searchIndex.has(term)) {
        this.searchIndex.set(term, new Set());
      }
      this.searchIndex.get(term)!.add(snippet.id);
    });
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `snippet-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get default secure code snippets
   */
  private getDefaultSnippets(): CodeSnippet[] {
    return [
      // JavaScript/TypeScript Security Patterns
      {
        id: 'js-xss-prevention-1',
        title: 'XSS Prevention with DOMPurify',
        description: 'Secure way to sanitize HTML content before rendering',
        language: 'javascript',
        framework: 'React',
        category: 'XSS Prevention',
        securityLevel: 'secure',
        code: `import DOMPurify from 'dompurify';

// Secure HTML sanitization
function SafeHtmlComponent({ htmlContent }) {
  const sanitizedHtml = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em'],
    ALLOWED_ATTR: []
  });

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: sanitizedHtml
      }}
    />
  );
}`,
        explanation: 'This code uses DOMPurify to sanitize HTML content before rendering it with dangerouslySetInnerHTML. It explicitly allows only safe tags and removes all attributes to prevent XSS attacks.',
        tags: ['xss', 'sanitization', 'dompurify', 'react', 'html'],
        vulnerabilityType: 'Cross-Site Scripting',
        cweId: 'CWE-79',
        owaspCategory: 'A03:2021 – Injection',
        relatedPatterns: ['js-xss-prevention-2', 'js-input-validation-1'],
        lastUpdated: new Date(),
        difficulty: 'intermediate',
        useCase: 'Rendering user-generated HTML content safely',
        alternatives: ['textContent', 'innerText', 'createElement']
      },

      // Insecure XSS Example
      {
        id: 'js-xss-vulnerable-1',
        title: 'Vulnerable XSS Pattern',
        description: 'Dangerous use of dangerouslySetInnerHTML without sanitization',
        language: 'javascript',
        framework: 'React',
        category: 'XSS Prevention',
        securityLevel: 'insecure',
        code: `// VULNERABLE: Never do this!
function UnsafeHtmlComponent({ htmlContent }) {
  return (
    <div
      dangerouslySetInnerHTML={{
        __html: htmlContent  // Direct injection - XSS risk!
      }}
    />
  );
}

// Also vulnerable
function AnotherUnsafePattern({ userInput }) {
  document.getElementById('content').innerHTML = userInput;
}`,
        explanation: 'This code directly injects user-provided HTML without any sanitization, making it vulnerable to XSS attacks. Malicious scripts can be executed in the user\'s browser.',
        tags: ['xss', 'vulnerable', 'dangerous', 'react', 'html'],
        vulnerabilityType: 'Cross-Site Scripting',
        cweId: 'CWE-79',
        owaspCategory: 'A03:2021 – Injection',
        relatedPatterns: ['js-xss-prevention-1'],
        lastUpdated: new Date(),
        difficulty: 'beginner',
        useCase: 'Example of what NOT to do when handling user content',
        alternatives: ['DOMPurify sanitization', 'textContent', 'createElement']
      },

      // SQL Injection Prevention
      {
        id: 'js-sql-injection-prevention-1',
        title: 'SQL Injection Prevention with Parameterized Queries',
        description: 'Secure database queries using parameterized statements',
        language: 'javascript',
        framework: 'Node.js',
        category: 'SQL Injection Prevention',
        securityLevel: 'secure',
        code: `const mysql = require('mysql2/promise');

// Secure parameterized query
async function getUserById(userId) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // Use parameterized query to prevent SQL injection
    const [rows] = await connection.execute(
      'SELECT * FROM users WHERE id = ? AND active = ?',
      [userId, true]
    );

    return rows[0];
  } finally {
    await connection.end();
  }
}

// Secure query with multiple parameters
async function searchUsers(name, email, limit = 10) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    const [rows] = await connection.execute(
      'SELECT id, name, email FROM users WHERE name LIKE ? AND email LIKE ? LIMIT ?',
      [\`%\${name}%\`, \`%\${email}%\`, limit]
    );

    return rows;
  } finally {
    await connection.end();
  }
}`,
        explanation: 'This code uses parameterized queries with placeholders (?) to safely insert user input into SQL statements. The database driver automatically escapes the parameters, preventing SQL injection attacks.',
        tags: ['sql-injection', 'parameterized-queries', 'database', 'mysql', 'nodejs'],
        vulnerabilityType: 'SQL Injection',
        cweId: 'CWE-89',
        owaspCategory: 'A03:2021 – Injection',
        relatedPatterns: ['js-sql-injection-vulnerable-1'],
        lastUpdated: new Date(),
        difficulty: 'intermediate',
        useCase: 'Safe database queries with user input',
        alternatives: ['ORM with built-in protection', 'stored procedures', 'query builders']
      },

      // Vulnerable SQL Injection
      {
        id: 'js-sql-injection-vulnerable-1',
        title: 'Vulnerable SQL Injection Pattern',
        description: 'Dangerous string concatenation in SQL queries',
        language: 'javascript',
        framework: 'Node.js',
        category: 'SQL Injection Prevention',
        securityLevel: 'insecure',
        code: `const mysql = require('mysql2/promise');

// VULNERABLE: String concatenation in SQL
async function getUserById(userId) {
  const connection = await mysql.createConnection(dbConfig);

  try {
    // DANGEROUS: Direct string concatenation
    const query = \`SELECT * FROM users WHERE id = '\${userId}'\`;
    const [rows] = await connection.execute(query);

    return rows[0];
  } finally {
    await connection.end();
  }
}

// Also vulnerable
async function searchUsers(searchTerm) {
  const query = "SELECT * FROM users WHERE name = '" + searchTerm + "'";
  // Attacker could inject: '; DROP TABLE users; --
  return await db.query(query);
}`,
        explanation: 'This code is vulnerable to SQL injection because it directly concatenates user input into SQL queries. An attacker could inject malicious SQL code to access or modify unauthorized data.',
        tags: ['sql-injection', 'vulnerable', 'string-concatenation', 'database'],
        vulnerabilityType: 'SQL Injection',
        cweId: 'CWE-89',
        owaspCategory: 'A03:2021 – Injection',
        relatedPatterns: ['js-sql-injection-prevention-1'],
        lastUpdated: new Date(),
        difficulty: 'beginner',
        useCase: 'Example of vulnerable database query patterns',
        alternatives: ['Parameterized queries', 'ORM frameworks', 'input validation']
      },

      // Secure Authentication
      {
        id: 'js-auth-secure-1',
        title: 'Secure Password Hashing with bcrypt',
        description: 'Proper password hashing and verification',
        language: 'javascript',
        framework: 'Node.js',
        category: 'Authentication',
        securityLevel: 'secure',
        code: `const bcrypt = require('bcrypt');
const crypto = require('crypto');

class SecureAuth {
  static async hashPassword(password) {
    // Use high salt rounds for security (12+ recommended)
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static generateSecureToken() {
    // Generate cryptographically secure random token
    return crypto.randomBytes(32).toString('hex');
  }

  static async createUser(email, password) {
    // Validate password strength
    if (!this.isPasswordStrong(password)) {
      throw new Error('Password does not meet security requirements');
    }

    const hashedPassword = await this.hashPassword(password);
    const verificationToken = this.generateSecureToken();

    return {
      email,
      password: hashedPassword,
      verificationToken,
      isVerified: false,
      createdAt: new Date()
    };
  }

  static isPasswordStrong(password) {
    // Minimum 8 characters, at least one uppercase, lowercase, number, and special char
    // eslint-disable-next-line no-useless-escape
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }
}`,
        explanation: 'This code implements secure password handling using bcrypt for hashing with proper salt rounds, secure token generation, and password strength validation. It follows security best practices for authentication.',
        tags: ['authentication', 'password-hashing', 'bcrypt', 'security', 'nodejs'],
        vulnerabilityType: 'Weak Authentication',
        cweId: 'CWE-287',
        owaspCategory: 'A07:2021 – Identification and Authentication Failures',
        relatedPatterns: ['js-auth-vulnerable-1'],
        lastUpdated: new Date(),
        difficulty: 'intermediate',
        useCase: 'Secure user registration and authentication',
        alternatives: ['Argon2', 'PBKDF2', 'scrypt']
      }
    ];
  }
}
