/**
 * Multi-Language Security Analyzer
 * Provides language-specific security analysis for multiple programming languages
 * Supports: JavaScript, TypeScript, Python, Java, C++, Go, Rust, PHP, C#
 */

import { MultiLanguageParser, SupportedLanguage, ParsedAST } from './MultiLanguageParser';

/**
 * Security issue returned by the multi-language analyzer
 */
export interface MultiLanguageSecurityIssue {
  id: string;
  type: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  line: number;
  column?: number;
  file: string;
  recommendation?: string;
  cwe?: string;
  owasp?: string;
  codeSnippet?: string;
}

export interface LanguageSecurityRule {
  id: string;
  name: string;
  description: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  pattern: RegExp | RegExp[];
  languages: SupportedLanguage[];
  cwe?: string;
  owasp?: string;
  recommendation: string;
}

/**
 * Multi-Language Security Analyzer
 */
export class MultiLanguageSecurityAnalyzer {
  private parser: MultiLanguageParser;
  private securityRules: LanguageSecurityRule[];

  constructor() {
    this.parser = new MultiLanguageParser();
    this.securityRules = this.initializeSecurityRules();
  }

  /**
   * Initialize security rules for all supported languages
   */
  private initializeSecurityRules(): LanguageSecurityRule[] {
    return [
      // JavaScript/TypeScript Rules
      {
        id: 'js-eval-usage',
        name: 'Dangerous eval() Usage',
        description: 'Use of eval() can lead to code injection vulnerabilities',
        severity: 'Critical',
        pattern: /\beval\s*\(/g,
        languages: ['javascript', 'typescript'],
        cwe: 'CWE-95',
        owasp: 'A03:2021',
        recommendation: 'Avoid using eval(). Use safer alternatives like JSON.parse() or Function constructors with strict validation.'
      },
      {
        id: 'js-dangerous-inner-html',
        name: 'Dangerous innerHTML Usage',
        description: 'Direct HTML injection can lead to XSS vulnerabilities',
        severity: 'High',
        pattern: /\.innerHTML\s*=/g,
        languages: ['javascript', 'typescript'],
        cwe: 'CWE-79',
        owasp: 'A03:2021',
        recommendation: 'Use textContent, createElement, or a sanitization library like DOMPurify.'
      },
      {
        id: 'js-document-write',
        name: 'Dangerous document.write Usage',
        description: 'document.write can be exploited for XSS attacks',
        severity: 'High',
        pattern: /document\.write\s*\(/g,
        languages: ['javascript', 'typescript'],
        cwe: 'CWE-79',
        owasp: 'A03:2021',
        recommendation: 'Avoid document.write. Use DOM manipulation methods instead.'
      },

      // Python Rules
      {
        id: 'py-exec-usage',
        name: 'Dangerous exec() Usage',
        description: 'exec() can execute arbitrary code and lead to code injection',
        severity: 'Critical',
        pattern: /\bexec\s*\(/g,
        languages: ['python'],
        cwe: 'CWE-95',
        owasp: 'A03:2021',
        recommendation: 'Avoid using exec(). Redesign your code to avoid dynamic code execution.'
      },
      {
        id: 'py-pickle-load',
        name: 'Insecure Deserialization with pickle',
        description: 'pickle.load can execute arbitrary code from untrusted data',
        severity: 'Critical',
        pattern: /pickle\.loads?\s*\(/g,
        languages: ['python'],
        cwe: 'CWE-502',
        owasp: 'A08:2021',
        recommendation: 'Use safer serialization formats like JSON. If pickle is required, validate and sign the data.'
      },
      {
        id: 'py-sql-format',
        name: 'SQL Injection via String Formatting',
        description: 'String formatting in SQL queries can lead to SQL injection',
        severity: 'Critical',
        pattern: [
          /\.execute\s*\([^)]*%[sdf]/g,
          /\.execute\s*\([^)]*\.format\(/g,
          /\.execute\s*\([^)]*f['"]/g
        ],
        languages: ['python'],
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        recommendation: 'Use parameterized queries with placeholders (?) or named parameters.'
      },
      {
        id: 'py-yaml-unsafe-load',
        name: 'Unsafe YAML Loading',
        description: 'yaml.load without Loader can execute arbitrary code',
        severity: 'Critical',
        pattern: /yaml\.load\s*\([^,)]+\)/g,
        languages: ['python'],
        cwe: 'CWE-502',
        owasp: 'A08:2021',
        recommendation: 'Use yaml.safe_load() instead of yaml.load().'
      },
      {
        id: 'py-command-injection',
        name: 'Command Injection via os.system',
        description: 'os.system with user input can lead to command injection',
        severity: 'Critical',
        pattern: [
          /os\.system\s*\(/g,
          /subprocess\.call\s*\([^)]*shell\s*=\s*True/g,
          /subprocess\.run\s*\([^)]*shell\s*=\s*True/g
        ],
        languages: ['python'],
        cwe: 'CWE-78',
        owasp: 'A03:2021',
        recommendation: 'Use subprocess with shell=False and pass arguments as a list.'
      },

      // Java Rules
      {
        id: 'java-sql-injection',
        name: 'Potential SQL Injection',
        description: 'String concatenation in SQL queries can lead to SQL injection',
        severity: 'Critical',
        pattern: [
          /Statement\.execute[^(]*\([^)]*\+/g,
          /createStatement\(\)\.execute/g
        ],
        languages: ['java'],
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        recommendation: 'Use PreparedStatement with parameterized queries.'
      },
      {
        id: 'java-xxe',
        name: 'XML External Entity (XXE) Vulnerability',
        description: 'Insecure XML parsing can lead to XXE attacks',
        severity: 'High',
        pattern: [
          /DocumentBuilderFactory\.newInstance\(\)/g,
          /SAXParserFactory\.newInstance\(\)/g,
          /XMLInputFactory\.newFactory\(\)/g
        ],
        languages: ['java'],
        cwe: 'CWE-611',
        owasp: 'A05:2021',
        recommendation: 'Disable external entity processing in XML parsers.'
      },
      {
        id: 'java-deserialization',
        name: 'Insecure Deserialization',
        description: 'Deserializing untrusted data can lead to remote code execution',
        severity: 'Critical',
        pattern: /ObjectInputStream.*readObject\s*\(/g,
        languages: ['java'],
        cwe: 'CWE-502',
        owasp: 'A08:2021',
        recommendation: 'Implement input validation and use serialization filters.'
      },
      {
        id: 'java-random',
        name: 'Weak Random Number Generation',
        description: 'java.util.Random is not cryptographically secure',
        severity: 'Medium',
        pattern: /new\s+Random\s*\(/g,
        languages: ['java'],
        cwe: 'CWE-338',
        owasp: 'A02:2021',
        recommendation: 'Use SecureRandom for security-sensitive operations.'
      },

      // C++ Rules
      {
        id: 'cpp-buffer-overflow',
        name: 'Potential Buffer Overflow',
        description: 'Unsafe string functions can cause buffer overflows',
        severity: 'Critical',
        pattern: [
          /\b(strcpy|strcat|sprintf|gets)\s*\(/g,
          /\bscanf\s*\([^)]*%s/g
        ],
        languages: ['cpp', 'c'],
        cwe: 'CWE-120',
        owasp: 'A03:2021',
        recommendation: 'Use safer alternatives: strncpy, strncat, snprintf, fgets.'
      },
      {
        id: 'cpp-memory-leak',
        name: 'Potential Memory Leak',
        description: 'new without corresponding delete can cause memory leaks',
        severity: 'Medium',
        pattern: /\bnew\s+\w+/g,
        languages: ['cpp'],
        cwe: 'CWE-401',
        owasp: 'A04:2021',
        recommendation: 'Use smart pointers (unique_ptr, shared_ptr) to manage memory automatically.'
      },
      {
        id: 'cpp-null-pointer',
        name: 'Potential Null Pointer Dereference',
        description: 'Dereferencing pointers without null checks',
        severity: 'High',
        pattern: /\*\s*\w+\s*(?![=!]=)/g,
        languages: ['cpp', 'c'],
        cwe: 'CWE-476',
        owasp: 'A04:2021',
        recommendation: 'Always check pointers for null before dereferencing.'
      },

      // Go Rules
      {
        id: 'go-sql-injection',
        name: 'SQL Injection Risk',
        description: 'String concatenation in SQL queries',
        severity: 'Critical',
        pattern: [
          /db\.Query\s*\([^)]*\+/g,
          /db\.Exec\s*\([^)]*\+/g,
          /fmt\.Sprintf\s*\([^)]*SELECT|INSERT|UPDATE|DELETE/gi
        ],
        languages: ['go'],
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        recommendation: 'Use parameterized queries with $1, $2, etc.'
      },
      {
        id: 'go-command-injection',
        name: 'Command Injection Risk',
        description: 'Executing commands with user input',
        severity: 'Critical',
        pattern: [
          /exec\.Command\s*\([^)]*\+/g,
          /exec\.CommandContext\s*\([^)]*\+/g
        ],
        languages: ['go'],
        cwe: 'CWE-78',
        owasp: 'A03:2021',
        recommendation: 'Validate and sanitize all user inputs before using in commands.'
      },
      {
        id: 'go-path-traversal',
        name: 'Path Traversal Vulnerability',
        description: 'File operations with unsanitized paths',
        severity: 'High',
        pattern: [
          /os\.Open\s*\(/g,
          /ioutil\.ReadFile\s*\(/g,
          /os\.ReadFile\s*\(/g
        ],
        languages: ['go'],
        cwe: 'CWE-22',
        owasp: 'A01:2021',
        recommendation: 'Validate and sanitize file paths. Use filepath.Clean and check for path traversal.'
      },

      // Rust Rules
      {
        id: 'rust-unsafe-block',
        name: 'Unsafe Code Block',
        description: 'Unsafe blocks bypass Rust safety guarantees',
        severity: 'High',
        pattern: /\bunsafe\s*{/g,
        languages: ['rust'],
        cwe: 'CWE-119',
        owasp: 'A04:2021',
        recommendation: 'Minimize unsafe code. Ensure thorough review and testing of unsafe blocks.'
      },
      {
        id: 'rust-unwrap-usage',
        name: 'Potential Panic with unwrap()',
        description: 'unwrap() can cause panics if value is None or Err',
        severity: 'Medium',
        pattern: /\.unwrap\s*\(/g,
        languages: ['rust'],
        cwe: 'CWE-754',
        owasp: 'A04:2021',
        recommendation: 'Use pattern matching or expect() with descriptive messages. Handle errors explicitly.'
      },
      {
        id: 'rust-expect-usage',
        name: 'Potential Panic with expect()',
        description: 'expect() can cause panics if value is None or Err',
        severity: 'Low',
        pattern: /\.expect\s*\(/g,
        languages: ['rust'],
        cwe: 'CWE-754',
        owasp: 'A04:2021',
        recommendation: 'Consider proper error handling with match or if let.'
      },

      // PHP Rules
      {
        id: 'php-eval-usage',
        name: 'Dangerous eval() Usage',
        description: 'eval() executes arbitrary PHP code',
        severity: 'Critical',
        pattern: /\beval\s*\(/g,
        languages: ['php'],
        cwe: 'CWE-95',
        owasp: 'A03:2021',
        recommendation: 'Avoid eval(). Redesign code to eliminate need for dynamic code execution.'
      },
      {
        id: 'php-sql-injection',
        name: 'SQL Injection Risk',
        description: 'String concatenation in SQL queries',
        severity: 'Critical',
        pattern: [
          /mysqli?_query\s*\([^)]*\$/g,
          /->query\s*\([^)]*\$/g,
          /DB::raw\s*\([^)]*\$/g
        ],
        languages: ['php'],
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        recommendation: 'Use prepared statements with parameter binding.'
      },
      {
        id: 'php-xss',
        name: 'Cross-Site Scripting (XSS) Risk',
        description: 'Direct output of variables without escaping',
        severity: 'High',
        pattern: [
          /echo\s+\$(?!this->escape|htmlspecialchars|htmlentities)/g,
          /print\s+\$(?!this->escape|htmlspecialchars|htmlentities)/g
        ],
        languages: ['php'],
        cwe: 'CWE-79',
        owasp: 'A03:2021',
        recommendation: 'Use htmlspecialchars() or a templating engine with auto-escaping.'
      },
      {
        id: 'php-command-injection',
        name: 'Command Injection Risk',
        description: 'Executing system commands with user input',
        severity: 'Critical',
        pattern: [
          /\b(exec|shell_exec|system|passthru|popen)\s*\(/g,
          /`[^`]*\$/g  // backtick operator with variables
        ],
        languages: ['php'],
        cwe: 'CWE-78',
        owasp: 'A03:2021',
        recommendation: 'Avoid executing system commands. If necessary, use escapeshellarg() and escapeshellcmd().'
      },
      {
        id: 'php-file-inclusion',
        name: 'File Inclusion Vulnerability',
        description: 'Including files based on user input',
        severity: 'Critical',
        pattern: [
          /\b(include|require|include_once|require_once)\s*\([^)]*\$/g
        ],
        languages: ['php'],
        cwe: 'CWE-98',
        owasp: 'A03:2021',
        recommendation: 'Use a whitelist of allowed files. Never include files based on direct user input.'
      },

      // C# Rules
      {
        id: 'cs-sql-injection',
        name: 'SQL Injection Risk',
        description: 'String concatenation in SQL queries',
        severity: 'Critical',
        pattern: [
          /SqlCommand\s*\([^)]*\+/g,
          /ExecuteReader\s*\([^)]*\+/g,
          /ExecuteNonQuery\s*\([^)]*\+/g
        ],
        languages: ['csharp'],
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        recommendation: 'Use parameterized queries with SqlParameter.'
      },

      // Ruby Rules
      {
        id: 'ruby-sql-injection',
        name: 'SQL Injection Risk',
        description: 'String interpolation in SQL queries',
        severity: 'Critical',
        pattern: [
          /\.where\s*\([^)]*#\{/g,
          /\.find_by_sql\s*\([^)]*#\{/g,
          /ActiveRecord::Base\.connection\.execute\s*\([^)]*#\{/g
        ],
        languages: ['ruby'],
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        recommendation: 'Use parameterized queries or ActiveRecord query methods.'
      },
      {
        id: 'ruby-command-injection',
        name: 'Command Injection Risk',
        description: 'Executing system commands with user input',
        severity: 'Critical',
        pattern: [
          /system\s*\(/g,
          /exec\s*\(/g,
          /`[^`]*#\{/g,
          /%x\{[^}]*#\{/g
        ],
        languages: ['ruby'],
        cwe: 'CWE-78',
        owasp: 'A03:2021',
        recommendation: 'Use safe command execution methods with proper escaping.'
      },
      {
        id: 'ruby-yaml-load',
        name: 'Unsafe YAML Loading',
        description: 'YAML.load can execute arbitrary code',
        severity: 'Critical',
        pattern: /YAML\.load\s*\(/g,
        languages: ['ruby'],
        cwe: 'CWE-502',
        owasp: 'A08:2021',
        recommendation: 'Use YAML.safe_load instead of YAML.load.'
      },
      {
        id: 'ruby-mass-assignment',
        name: 'Mass Assignment Vulnerability',
        description: 'Unprotected mass assignment can lead to privilege escalation',
        severity: 'High',
        pattern: [
          /\.new\s*\(params\[/g,
          /\.create\s*\(params\[/g,
          /\.update\s*\(params\[/g
        ],
        languages: ['ruby'],
        cwe: 'CWE-915',
        owasp: 'A04:2021',
        recommendation: 'Use strong parameters to whitelist allowed attributes.'
      },
      {
        id: 'ruby-eval-usage',
        name: 'Dangerous eval() Usage',
        description: 'eval can execute arbitrary Ruby code',
        severity: 'Critical',
        pattern: /\beval\s*\(/g,
        languages: ['ruby'],
        cwe: 'CWE-95',
        owasp: 'A03:2021',
        recommendation: 'Avoid using eval. Use safer alternatives or validate input thoroughly.'
      },

      // Swift Rules
      {
        id: 'swift-sql-injection',
        name: 'SQL Injection Risk',
        description: 'String interpolation in SQL queries',
        severity: 'Critical',
        pattern: [
          /executeQuery\s*\([^)]*\\/g,
          /executeUpdate\s*\([^)]*\\/g
        ],
        languages: ['swift'],
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        recommendation: 'Use parameterized queries with prepared statements.'
      },
      {
        id: 'swift-force-unwrap',
        name: 'Force Unwrap Usage',
        description: 'Force unwrapping can cause runtime crashes',
        severity: 'Medium',
        pattern: /!\s*(?:\.|$|\))/g,
        languages: ['swift'],
        cwe: 'CWE-754',
        owasp: 'A04:2021',
        recommendation: 'Use optional binding (if let, guard let) or optional chaining instead.'
      },
      {
        id: 'swift-nsuserdefaults',
        name: 'Sensitive Data in UserDefaults',
        description: 'UserDefaults stores data unencrypted',
        severity: 'Medium',
        pattern: /UserDefaults\.standard\.set\(/g,
        languages: ['swift'],
        cwe: 'CWE-311',
        owasp: 'A02:2021',
        recommendation: 'Use Keychain for sensitive data like passwords and tokens.'
      },
      {
        id: 'swift-weak-crypto',
        name: 'Weak Cryptographic Algorithm',
        description: 'MD5 and SHA1 are cryptographically broken',
        severity: 'High',
        pattern: [
          /Insecure\.MD5/g,
          /Insecure\.SHA1/g
        ],
        languages: ['swift'],
        cwe: 'CWE-327',
        owasp: 'A02:2021',
        recommendation: 'Use SHA256 or SHA512 for hashing.'
      },

      // Kotlin Rules
      {
        id: 'kotlin-sql-injection',
        name: 'SQL Injection Risk',
        description: 'String concatenation in SQL queries',
        severity: 'Critical',
        pattern: [
          /rawQuery\s*\([^)]*\+/g,
          /execSQL\s*\([^)]*\+/g
        ],
        languages: ['kotlin'],
        cwe: 'CWE-89',
        owasp: 'A03:2021',
        recommendation: 'Use parameterized queries with placeholders.'
      },
      {
        id: 'kotlin-intent-injection',
        name: 'Intent Injection Risk',
        description: 'Untrusted intent data can be exploited',
        severity: 'High',
        pattern: [
          /getIntent\(\)\.get/g,
          /intent\.get(?:String|Int|Boolean|Serializable)/g
        ],
        languages: ['kotlin'],
        cwe: 'CWE-927',
        owasp: 'A03:2021',
        recommendation: 'Validate all data received from intents before use.'
      },
      {
        id: 'kotlin-webview-js',
        name: 'WebView JavaScript Enabled',
        description: 'Enabling JavaScript in WebView can lead to XSS',
        severity: 'High',
        pattern: /javaScriptEnabled\s*=\s*true/g,
        languages: ['kotlin'],
        cwe: 'CWE-79',
        owasp: 'A03:2021',
        recommendation: 'Only enable JavaScript if necessary and sanitize all content.'
      },
      {
        id: 'kotlin-insecure-random',
        name: 'Weak Random Number Generation',
        description: 'Random is not cryptographically secure',
        severity: 'Medium',
        pattern: /Random\(\)/g,
        languages: ['kotlin'],
        cwe: 'CWE-338',
        owasp: 'A02:2021',
        recommendation: 'Use SecureRandom for security-sensitive operations.'
      },
      {
        id: 'kotlin-hardcoded-key',
        name: 'Hardcoded Encryption Key',
        description: 'Hardcoded keys can be extracted from bytecode',
        severity: 'Critical',
        pattern: [
          /SecretKeySpec\s*\([^)]*"[^"]{8,}"/g,
          /IvParameterSpec\s*\([^)]*"[^"]{8,}"/g
        ],
        languages: ['kotlin'],
        cwe: 'CWE-798',
        owasp: 'A02:2021',
        recommendation: 'Store encryption keys in Android Keystore.'
      },
      {
        id: 'cs-xxe',
        name: 'XML External Entity (XXE) Vulnerability',
        description: 'Insecure XML parsing configuration',
        severity: 'High',
        pattern: [
          /new\s+XmlTextReader\s*\(/g,
          /XmlDocument\s*\(\)\.Load/g
        ],
        languages: ['csharp'],
        cwe: 'CWE-611',
        owasp: 'A05:2021',
        recommendation: 'Set XmlReaderSettings.DtdProcessing to DtdProcessing.Prohibit.'
      },
      {
        id: 'cs-deserialization',
        name: 'Insecure Deserialization',
        description: 'Deserializing untrusted data',
        severity: 'Critical',
        pattern: [
          /BinaryFormatter\.Deserialize\s*\(/g,
          /JavaScriptSerializer\.Deserialize\s*\(/g,
          /XmlSerializer\.Deserialize\s*\(/g
        ],
        languages: ['csharp'],
        cwe: 'CWE-502',
        owasp: 'A08:2021',
        recommendation: 'Use secure serialization methods like JSON.NET with type validation.'
      },
      {
        id: 'cs-weak-crypto',
        name: 'Weak Cryptographic Algorithm',
        description: 'Use of weak or deprecated cryptographic algorithms',
        severity: 'High',
        pattern: [
          /new\s+MD5CryptoServiceProvider\s*\(/g,
          /new\s+SHA1CryptoServiceProvider\s*\(/g,
          /new\s+DESCryptoServiceProvider\s*\(/g
        ],
        languages: ['csharp'],
        cwe: 'CWE-327',
        owasp: 'A02:2021',
        recommendation: 'Use SHA256 or SHA512 for hashing, AES for encryption.'
      }
    ];
  }

  /**
   * Analyze code for security issues based on language
   */
  public analyzeCode(code: string, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];
    
    // Detect language
    const language = this.parser.detectLanguageFromFilename(filename);
    if (!language) {
      return issues;
    }

    // Apply language-specific security rules
    const applicableRules = this.securityRules.filter(rule => 
      rule.languages.includes(language)
    );

    for (const rule of applicableRules) {
      const patterns = Array.isArray(rule.pattern) ? rule.pattern : [rule.pattern];
      
      for (const pattern of patterns) {
        const matches = code.matchAll(pattern);
        
        for (const match of matches) {
          const line = this.getLineNumber(code, match.index || 0);
          const column = this.getColumnNumber(code, match.index || 0);
          
          issues.push({
            id: `${rule.id}-${line}`,
            type: 'vulnerability',
            severity: rule.severity,
            title: rule.name,
            description: rule.description,
            line,
            column,
            file: filename,
            recommendation: rule.recommendation,
            cwe: rule.cwe,
            owasp: rule.owasp
          });
        }
      }
    }

    // Parse and perform AST-based analysis
    const parsed = this.parser.parse(code, language, filename);
    if (parsed.success && parsed.ast) {
      issues.push(...this.performASTAnalysis(parsed, filename, language));
    }

    return issues;
  }

  /**
   * Perform AST-based security analysis
   */
  private performASTAnalysis(parsed: ParsedAST, filename: string, language: SupportedLanguage): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    switch (language) {
      case 'python':
        issues.push(...this.analyzePythonAST(parsed.ast, filename));
        break;
      case 'java':
        issues.push(...this.analyzeJavaAST(parsed.ast, filename));
        break;
      case 'go':
        issues.push(...this.analyzeGoAST(parsed.ast, filename));
        break;
      case 'rust':
        issues.push(...this.analyzeRustAST(parsed.ast, filename));
        break;
      case 'php':
        issues.push(...this.analyzePHPAST(parsed.ast, filename));
        break;
      case 'csharp':
        issues.push(...this.analyzeCSharpAST(parsed.ast, filename));
        break;
      case 'ruby':
        issues.push(...this.analyzeRubyAST(parsed.ast, filename));
        break;
      case 'swift':
        issues.push(...this.analyzeSwiftAST(parsed.ast, filename));
        break;
      case 'kotlin':
        issues.push(...this.analyzeKotlinAST(parsed.ast, filename));
        break;
    }

    return issues;
  }

  /**
   * Analyze Python AST for security issues
   */
  private analyzePythonAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for dangerous imports
    const dangerousImports = ['pickle', 'marshal', 'shelve', 'exec', 'eval'];
    for (const imp of ast.imports || []) {
      if (dangerousImports.some(dangerous => imp.module?.includes(dangerous) || imp.names?.some((n: string) => n.includes(dangerous)))) {
        issues.push({
          id: `py-dangerous-import-${imp.line}`,
          type: 'vulnerability',
          severity: 'Medium',
          title: 'Potentially Dangerous Import',
          description: 'Import of module that can be misused for security vulnerabilities',
          line: imp.line,
          column: 0,
          file: filename,
          recommendation: 'Review usage of this import and ensure proper validation of inputs.',
          cwe: 'CWE-676'
        });
      }
    }

    // Check for functions with dangerous patterns
    for (const func of ast.functions || []) {
      if (func.name.startsWith('_') && !func.name.startsWith('__')) {
        // Private function - check if it handles sensitive data
      }
    }

    return issues;
  }

  /**
   * Analyze Java AST for security issues
   */
  private analyzeJavaAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for dangerous imports
    const dangerousImports = ['java.io.Serializable', 'java.lang.Runtime', 'java.lang.ProcessBuilder'];
    for (const imp of ast.imports || []) {
      if (dangerousImports.some(dangerous => imp.name?.includes(dangerous))) {
        issues.push({
          id: `java-dangerous-import-${imp.line}`,
          type: 'vulnerability',
          severity: 'Medium',
          title: 'Potentially Dangerous Import',
          description: 'Import of class that requires careful security consideration',
          line: imp.line,
          column: 0,
          file: filename,
          recommendation: 'Ensure proper security controls when using this class.',
          cwe: 'CWE-676'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze Go AST for security issues
   */
  private analyzeGoAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for dangerous imports
    const dangerousImports = ['os/exec', 'unsafe', 'reflect'];
    for (const imp of ast.imports || []) {
      if (dangerousImports.some(dangerous => imp.path?.includes(dangerous))) {
        issues.push({
          id: `go-dangerous-import-${imp.line}`,
          type: 'vulnerability',
          severity: 'Medium',
          title: 'Potentially Dangerous Import',
          description: 'Import of package that requires careful security consideration',
          line: imp.line,
          column: 0,
          file: filename,
          recommendation: 'Review usage and ensure proper input validation.',
          cwe: 'CWE-676'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze Rust AST for security issues
   */
  private analyzeRustAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for unsafe usage in function names
    for (const func of ast.functions || []) {
      if (func.name.includes('unsafe') || func.name.includes('raw')) {
        issues.push({
          id: `rust-unsafe-function-${func.line}`,
          type: 'vulnerability',
          severity: 'Medium',
          title: 'Function with Unsafe Naming',
          description: 'Function name suggests unsafe operations',
          line: func.line,
          column: 0,
          file: filename,
          recommendation: 'Ensure unsafe code is thoroughly reviewed and tested.',
          cwe: 'CWE-119'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze PHP AST for security issues
   */
  private analyzePHPAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for global variable usage in functions
    for (const func of ast.functions || []) {
      if (func.name === 'unserialize' || func.name === 'eval') {
        issues.push({
          id: `php-dangerous-function-${func.line}`,
          type: 'vulnerability',
          severity: 'High',
          title: 'Dangerous Function Definition',
          description: 'Function name matches dangerous PHP function',
          line: func.line,
          column: 0,
          file: filename,
          recommendation: 'Ensure this is intentional and inputs are properly validated.',
          cwe: 'CWE-95'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze C# AST for security issues
   */
  private analyzeCSharpAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for dangerous using statements
    const dangerousUsings = ['System.Runtime.Serialization.Formatters.Binary', 'System.Web.Script.Serialization'];
    for (const using of ast.usings || []) {
      if (dangerousUsings.some(dangerous => using.namespace?.includes(dangerous))) {
        issues.push({
          id: `cs-dangerous-using-${using.line}`,
          type: 'vulnerability',
          severity: 'Medium',
          title: 'Potentially Dangerous Using Statement',
          description: 'Using statement for namespace with security implications',
          line: using.line,
          column: 0,
          file: filename,
          recommendation: 'Review usage and consider safer alternatives.',
          cwe: 'CWE-502'
        });
      }
    }

    return issues;
  }

  /**
   * Get line number from character index
   */
  private getLineNumber(code: string, index: number): number {
    return code.substring(0, index).split('\n').length;
  }

  /**
   * Get column number from character index
   */
  private getColumnNumber(code: string, index: number): number {
    const lines = code.substring(0, index).split('\n');
    return lines[lines.length - 1].length;
  }

  /**
   * Analyze Ruby AST for security issues
   */
  private analyzeRubyAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for dangerous requires
    const dangerousRequires = ['open-uri', 'net/http', 'socket'];
    for (const req of ast.requires || []) {
      if (dangerousRequires.some(dangerous => req.module?.includes(dangerous))) {
        issues.push({
          id: `ruby-dangerous-require-${req.line}`,
          type: 'vulnerability',
          severity: 'Medium',
          title: 'Potentially Dangerous Require',
          description: 'Require of module that needs careful security consideration',
          line: req.line,
          column: 0,
          file: filename,
          recommendation: 'Review usage and ensure proper input validation.',
          cwe: 'CWE-676'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze Swift AST for security issues
   */
  private analyzeSwiftAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for sensitive imports
    const sensitiveImports = ['Security', 'CryptoKit'];
    for (const imp of ast.imports || []) {
      if (sensitiveImports.includes(imp.module)) {
        issues.push({
          id: `swift-sensitive-import-${imp.line}`,
          type: 'vulnerability',
          severity: 'Low',
          title: 'Sensitive Framework Import',
          description: 'Import of security-sensitive framework detected',
          line: imp.line,
          column: 0,
          file: filename,
          recommendation: 'Ensure proper usage of security APIs.',
          cwe: 'CWE-676'
        });
      }
    }

    return issues;
  }

  /**
   * Analyze Kotlin AST for security issues
   */
  private analyzeKotlinAST(ast: any, filename: string): MultiLanguageSecurityIssue[] {
    const issues: MultiLanguageSecurityIssue[] = [];

    // Check for Android-specific security issues
    const androidImports = ['android.webkit.WebView', 'android.content.Intent'];
    for (const imp of ast.imports || []) {
      if (androidImports.some(ai => imp.module?.includes(ai))) {
        issues.push({
          id: `kotlin-android-import-${imp.line}`,
          type: 'vulnerability',
          severity: 'Low',
          title: 'Android Security-Sensitive Import',
          description: 'Import of Android component that requires security consideration',
          line: imp.line,
          column: 0,
          file: filename,
          recommendation: 'Follow Android security best practices.',
          cwe: 'CWE-676'
        });
      }
    }

    return issues;
  }

  /**
   * Get supported languages
   */
  public getSupportedLanguages(): SupportedLanguage[] {
    return ['javascript', 'typescript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'csharp', 'ruby', 'swift', 'kotlin'];
  }

  /**
   * Get language-specific rule count
   */
  public getRuleCountForLanguage(language: SupportedLanguage): number {
    return this.securityRules.filter(rule => rule.languages.includes(language)).length;
  }
}

// Singleton instance
export const multiLanguageSecurityAnalyzer = new MultiLanguageSecurityAnalyzer();

