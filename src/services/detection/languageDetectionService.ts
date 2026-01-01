/**
 * Smart Language Detection Service
 * Auto-detects programming languages, frameworks, and project types
 * from file extensions, content patterns, and project structure
 */

export interface LanguageInfo {
  name: string;
  confidence: number;
  extensions: string[];
  category: "programming" | "markup" | "config" | "data" | "documentation";
  ecosystem?: string; // e.g., 'web', 'mobile', 'backend', 'data-science'
}

export interface FrameworkInfo {
  name: string;
  language: string;
  confidence: number;
  category:
    | "frontend"
    | "backend"
    | "fullstack"
    | "mobile"
    | "desktop"
    | "testing"
    | "build";
  version?: string;
  ecosystem: string;
}

export interface ProjectStructure {
  type:
    | "web"
    | "mobile"
    | "desktop"
    | "library"
    | "microservice"
    | "monorepo"
    | "unknown";
  confidence: number;
  indicators: string[];
}

export interface DetectionResult {
  primaryLanguage: LanguageInfo;
  allLanguages: LanguageInfo[];
  frameworks: FrameworkInfo[];
  projectStructure: ProjectStructure;
  buildTools: string[];
  packageManagers: string[];
  totalFiles: number;
  analysisTime: number;
}

export interface FileAnalysis {
  filename: string;
  extension: string;
  language: LanguageInfo;
  size: number;
  content?: string;
}

/**
 * Comprehensive language patterns and signatures - ULTRA ACCURATE
 */
const LANGUAGE_PATTERNS = {
  // Programming Languages with enhanced detection
  typescript: {
    extensions: [".ts", ".tsx", ".d.ts"],
    patterns: [
      /\b(interface|type|enum|namespace)\b/g,
      /:\s*(string|number|boolean|any|void|unknown|never)/g,
      /<[A-Z]\w*>/g,
      /\b(public|private|protected|readonly)\b/g,
      /\b(implements|extends)\b/g,
      /\b(as\s+const|as\s+\w+)/g,
      /\bexport\s+(type|interface|enum|namespace)\b/g,
      /\bgeneric\s*<\w+>/g,
      /\?\s*:/g, // optional chaining
      /!\./g, // non-null assertion
    ],
    keywords: [
      "interface",
      "type",
      "enum",
      "namespace",
      "implements",
      "extends",
      "readonly",
      "private",
      "public",
      "protected",
      "abstract",
      "as",
    ],
    uniquePatterns: [
      /:\s*(string|number|boolean|any)/g, // Type annotations
      /\b(interface|type)\s+\w+/g, // Type definitions
      /\bexport\s+type\b/g,
      /@types\//g,
    ],
    category: "programming" as const,
    ecosystem: "web",
    priority: 10, // Higher priority than JS
  },
  javascript: {
    extensions: [".js", ".mjs", ".cjs", ".jsx"],
    patterns: [
      /\b(function|const|let|var|class|import|export|require)\b/g,
      /\b(console\.log|document\.|window\.)/g,
      /\b(async|await|Promise)\b/g,
      /=>\s*[{(]/g,
      /\$\{[^}]+\}/g,
      /\b(module\.exports|exports\.)/g,
      /\brequire\s*\(/g,
      /\b(\.then|\.catch|\.finally)\(/g,
    ],
    keywords: [
      "function",
      "const",
      "let",
      "var",
      "class",
      "import",
      "export",
      "async",
      "await",
      "require",
      "module",
    ],
    uniquePatterns: [
      /\bvar\s+\w+/g, // var declarations (JS specific)
      /\brequire\s*\(['"][^'"]+['"]\)/g,
      /module\.exports\s*=/g,
    ],
    category: "programming" as const,
    ecosystem: "web",
    priority: 5,
  },
  python: {
    extensions: [".py", ".pyw", ".pyi", ".pyx"],
    patterns: [
      /\b(def|class|import|from|if\s+__name__\s*==\s*["']__main__["'])\b/g,
      /\b(print|len|range|enumerate|str|int|float|list|dict|tuple)\b/g,
      /\bself\.\w+/g,
      /\b(try|except|finally|with|as|raise)\b/g,
      /^#.*$/gm,
      /\b(lambda|yield|return)\b/g,
      /@\w+\s*$/gm, // decorators
      /(?:^\s{4}|\t)/gm, // indentation
      /:\s*$/gm, // colon at line end
    ],
    keywords: [
      "def",
      "class",
      "import",
      "from",
      "if",
      "elif",
      "else",
      "try",
      "except",
      "finally",
      "with",
      "lambda",
      "yield",
      "self",
    ],
    uniquePatterns: [
      /\bdef\s+\w+\s*\(/g,
      /\bself\./g,
      /__init__/g,
      /\bimport\s+\w+/g,
      /\bfrom\s+\w+\s+import/g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 8,
  },
  java: {
    extensions: [".java"],
    patterns: [
      /\b(public|private|protected|static|final|abstract|synchronized)\b/g,
      /\b(class|interface|enum|package|import)\b/g,
      /\b(System\.out\.println|System\.err|String|Integer|Boolean|void)\b/g,
      /\b(extends|implements|throws|throw)\b/g,
      /@(Override|Deprecated|SuppressWarnings|FunctionalInterface)\b/g,
      /\bnew\s+\w+\s*\(/g,
      /\bthis\./g,
      /\bsuper\./g,
    ],
    keywords: [
      "public",
      "private",
      "protected",
      "class",
      "interface",
      "package",
      "import",
      "static",
      "final",
      "void",
      "extends",
      "implements",
    ],
    uniquePatterns: [
      /\bpublic\s+class\s+\w+/g,
      /\bpublic\s+static\s+void\s+main/g,
      /\bSystem\.out\./g,
      /@\w+/g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 8,
  },
  csharp: {
    extensions: [".cs", ".csx"],
    patterns: [
      /\b(using|namespace|class|interface|struct|enum|record)\b/g,
      /\b(public|private|protected|internal|static|readonly|const)\b/g,
      /\b(string|int|bool|void|var|object|decimal|double|float)\b/g,
      /\b(Console\.WriteLine|Console\.Write|System\.)/g,
      /\[\w+\]/g,
      /\b(async|await|Task)\b/g,
      /\bnew\s+\w+\s*\(/g,
      /=>/g,
    ],
    keywords: [
      "using",
      "namespace",
      "class",
      "interface",
      "public",
      "private",
      "static",
      "void",
      "string",
      "int",
      "bool",
      "var",
    ],
    uniquePatterns: [
      /\busing\s+System\b/g,
      /\bnamespace\s+\w+/g,
      /\bConsole\./g,
      /\[assembly:/g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 8,
  },
  php: {
    extensions: [".php", ".phtml", ".php3", ".php4", ".php5", ".phps"],
    patterns: [
      /<\?php/g,
      /\$\w+/g,
      /\b(function|class|interface|trait|namespace|use)\b/g,
      /\b(echo|print|var_dump|print_r|isset|empty|die|exit)\b/g,
      /->/g,
      /::/g,
      /\bpublic\s+function/g,
      /\bprivate\s+function/g,
    ],
    keywords: [
      "function",
      "class",
      "interface",
      "namespace",
      "echo",
      "print",
      "use",
      "trait",
      "extends",
      "implements",
    ],
    uniquePatterns: [/<\?php/g, /\$\w+\s*=/g, /->\w+/g, /::\w+/g],
    category: "programming" as const,
    ecosystem: "web",
    priority: 9,
  },
  ruby: {
    extensions: [".rb", ".rbw", ".rake", ".gemspec"],
    patterns: [
      /\b(def|class|module|end|require|include|extend)\b/g,
      /\b(puts|print|p|gets|attr_accessor|attr_reader|attr_writer)\b/g,
      /@\w+/g,
      /\b(if|unless|while|until|for|in|case|when)\b/g,
      /^#.*$/gm,
      /\bdo\s*\|/g,
      /\.each\b/g,
      /:\w+/g, // symbols
    ],
    keywords: [
      "def",
      "class",
      "module",
      "end",
      "require",
      "include",
      "puts",
      "attr_accessor",
    ],
    uniquePatterns: [
      /\bdef\s+\w+/g,
      /\bend\b/g,
      /\battr_accessor\b/g,
      /\.each\s+do/g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 7,
  },
  go: {
    extensions: [".go"],
    patterns: [
      /\b(package|import|func|var|const|type)\b/g,
      /\b(fmt\.Print|fmt\.Sprintf|fmt\.Errorf)\b/g,
      /\b(if|for|switch|select|go|defer|return)\b/g,
      /\b(struct|interface|map|chan|make|new)\b/g,
      /\/\/.*$/gm,
      /:=/g,
      /\bfunc\s+\w+\s*\(/g,
      /\bfunc\s*\(/g, // anonymous functions
    ],
    keywords: [
      "package",
      "import",
      "func",
      "var",
      "const",
      "type",
      "struct",
      "interface",
      "go",
      "defer",
      "chan",
    ],
    uniquePatterns: [
      /\bpackage\s+main\b/g,
      /\bfunc\s+main\(\)/g,
      /:=/g,
      /\bfmt\./g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 9,
  },
  rust: {
    extensions: [".rs"],
    patterns: [
      /\b(fn|let|mut|const|static|struct|enum|impl|trait|mod)\b/g,
      /\b(println!|print!|panic!|assert!|vec!)\b/g,
      /\b(match|if|while|for|loop|break|continue)\b/g,
      /\b(pub|use|mod|crate|self|super)\b/g,
      /\/\/.*$/gm,
      /\bSome\(|None\b/g,
      /\bOk\(|Err\(/g,
      /&\w+/g, // references
      /&mut\s+/g,
    ],
    keywords: [
      "fn",
      "let",
      "mut",
      "struct",
      "enum",
      "impl",
      "trait",
      "match",
      "pub",
      "mod",
      "use",
    ],
    uniquePatterns: [
      /\bfn\s+\w+/g,
      /\blet\s+mut\b/g,
      /\bimpl\s+\w+/g,
      /println!\(/g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 9,
  },
  cpp: {
    extensions: [".cpp", ".cxx", ".cc", ".c++", ".hpp", ".hxx", ".h++"],
    patterns: [
      /\b(#include|#define|#ifdef|#ifndef|#pragma)\b/g,
      /\b(class|struct|namespace|template|typename)\b/g,
      /\b(std::|cout|cin|endl|vector|string)\b/g,
      /\b(public|private|protected|virtual|override)\b/g,
      /\/\/.*$/gm,
      /::/g,
      /\btemplate\s*</g,
      /\busing\s+namespace\b/g,
    ],
    keywords: [
      "class",
      "struct",
      "namespace",
      "template",
      "public",
      "private",
      "virtual",
      "typename",
      "using",
    ],
    uniquePatterns: [
      /\bstd::/g,
      /\btemplate\s*</g,
      /\busing\s+namespace\s+std/g,
      /#include\s*<\w+>/g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 8,
  },
  c: {
    extensions: [".c", ".h"],
    patterns: [
      /\b(#include|#define|#ifdef|#ifndef|#pragma)\b/g,
      /\b(int|char|float|double|void|struct|enum|union|typedef)\b/g,
      /\b(printf|scanf|malloc|calloc|realloc|free|sizeof)\b/g,
      /\b(if|else|while|for|switch|case|break|continue|return)\b/g,
      /\/\*[\s\S]*?\*\//g,
      /\bmain\s*\(\s*(void|int\s+argc)/g,
    ],
    keywords: [
      "int",
      "char",
      "float",
      "double",
      "void",
      "struct",
      "enum",
      "typedef",
      "sizeof",
    ],
    uniquePatterns: [
      /\bprintf\s*\(/g,
      /\bscanf\s*\(/g,
      /\bmalloc\s*\(/g,
      /#include\s*<\w+\.h>/g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 7,
  },
  kotlin: {
    extensions: [".kt", ".kts"],
    patterns: [
      /\b(fun|val|var|class|interface|object|companion)\b/g,
      /\b(private|public|protected|internal|open|abstract)\b/g,
      /\b(if|when|for|while|return|break|continue)\b/g,
      /\b(println|print|require|check)\b/g,
      /\?:/g, // elvis operator
      /\?\./g, // safe call
      /\b(suspend|async|coroutine)\b/g,
    ],
    keywords: [
      "fun",
      "val",
      "var",
      "class",
      "interface",
      "object",
      "when",
      "companion",
    ],
    uniquePatterns: [/\bfun\s+\w+/g, /\bval\s+\w+/g, /\?\./g, /\?:/g],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 8,
  },
  swift: {
    extensions: [".swift"],
    patterns: [
      /\b(func|var|let|class|struct|enum|protocol|extension)\b/g,
      /\b(import|public|private|internal|fileprivate|open)\b/g,
      /\b(if|guard|for|while|switch|case|return)\b/g,
      /\b(print|String|Int|Bool|Array|Dictionary)\b/g,
      /->/g,
      /\?/g,
      /!/g, // force unwrap
    ],
    keywords: [
      "func",
      "var",
      "let",
      "class",
      "struct",
      "enum",
      "protocol",
      "guard",
    ],
    uniquePatterns: [
      /\bfunc\s+\w+/g,
      /\blet\s+\w+/g,
      /\bguard\s+let/g,
      /\bimport\s+Foundation\b/g,
    ],
    category: "programming" as const,
    ecosystem: "mobile",
    priority: 8,
  },
  dart: {
    extensions: [".dart"],
    patterns: [
      /\b(void|class|abstract|extends|implements|with|mixin)\b/g,
      /\b(var|final|const|static|dynamic)\b/g,
      /\b(if|else|for|while|switch|case|return)\b/g,
      /\b(print|String|int|bool|List|Map)\b/g,
      /\b(async|await|Future|Stream)\b/g,
      /@override/g,
    ],
    keywords: [
      "void",
      "class",
      "var",
      "final",
      "const",
      "async",
      "await",
      "Future",
    ],
    uniquePatterns: [
      /\bFuture\s*</g,
      /\bStream\s*</g,
      /\bWidget\b/g,
      /@override/g,
    ],
    category: "programming" as const,
    ecosystem: "mobile",
    priority: 8,
  },
  scala: {
    extensions: [".scala"],
    patterns: [
      /\b(def|val|var|class|object|trait|case|match)\b/g,
      /\b(implicit|override|sealed|abstract|final)\b/g,
      /\b(if|else|for|while|yield|return)\b/g,
      /\b(println|print|String|Int|Boolean)\b/g,
      /=>/g,
      /::/g,
      /<-/g,
    ],
    keywords: [
      "def",
      "val",
      "var",
      "class",
      "object",
      "trait",
      "case",
      "match",
      "implicit",
    ],
    uniquePatterns: [
      /\bdef\s+\w+/g,
      /\bcase\s+class/g,
      /\bcase\s+object/g,
      /<-/g,
    ],
    category: "programming" as const,
    ecosystem: "backend",
    priority: 7,
  },
};

export class LanguageDetectionService {
  private fileAnalyses: FileAnalysis[] = [];
  private startTime: number = 0;

  /**
   * Analyze a codebase and detect languages, frameworks, and project structure
   * 100% REAL ANALYSIS
   */
  public async analyzeCodebase(
    files: { filename: string; content: string }[]
  ): Promise<DetectionResult> {
    this.startTime = Date.now();
    this.fileAnalyses = [];

    // REAL FILE ANALYSIS - Analyze each actual file from the uploaded ZIP
    for (const file of files) {
      if (!file.content || file.content.length === 0) {
        continue; // Skip empty files
      }
      const analysis = this.analyzeFile(file.filename, file.content);
      this.fileAnalyses.push(analysis);
    }

    // REAL LANGUAGE DETECTION - Based on actual file extensions and content patterns
    const allLanguages = this.detectLanguages();
    const primaryLanguage = this.determinePrimaryLanguage(allLanguages);

    // REAL FRAMEWORK DETECTION - Based on actual dependencies and file patterns
    const frameworks = this.detectFrameworks();

    // REAL PROJECT STRUCTURE ANALYSIS - Based on actual directory structure
    const projectStructure = this.analyzeProjectStructure();

    // REAL BUILD TOOLS DETECTION - Based on actual config files
    const buildTools = this.detectBuildTools();
    const packageManagers = this.detectPackageManagers();

    const analysisTime = Date.now() - this.startTime;

    return {
      primaryLanguage,
      allLanguages,
      frameworks,
      projectStructure,
      buildTools,
      packageManagers,
      totalFiles: files.length,
      analysisTime,
    };
  }

  /**
   * Analyze a single file to determine its language
   */
  private analyzeFile(filename: string, content: string): FileAnalysis {
    const extension = this.getFileExtension(filename);
    const language = this.detectFileLanguage(filename, content);

    return {
      filename,
      extension,
      language,
      size: content.length,
      content,
    };
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf(".");
    return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : "";
  }

  /**
   * ULTRA-ACCURATE language detection with multi-layer analysis
   * Uses extension, content patterns, unique signatures, and disambiguation
   */
  private detectFileLanguage(filename: string, content: string): LanguageInfo {
    const extension = this.getFileExtension(filename);
    const candidates: Array<{
      name: string;
      confidence: number;
      info: (typeof LANGUAGE_PATTERNS)[keyof typeof LANGUAGE_PATTERNS];
      scores: {
        extension: number;
        patterns: number;
        keywords: number;
        unique: number;
        priority: number;
      };
    }> = [];

    // LAYER 1: Multi-dimensional scoring for each language
    for (const [langName, langInfo] of Object.entries(LANGUAGE_PATTERNS)) {
      const scores = {
        extension: 0,
        patterns: 0,
        keywords: 0,
        unique: 0,
        priority: 0,
      };

      // SCORE 1: Extension match (strong indicator)
      if (langInfo.extensions.includes(extension)) {
        scores.extension = 40;

        // Boost for exact primary extension match
        if (langInfo.extensions[0] === extension) {
          scores.extension += 10;
        }
      }

      // SCORE 2: Pattern matching (syntax analysis)
      if (content && content.length > 0) {
        const contentSample = content.substring(
          0,
          Math.min(5000, content.length)
        );

        // Count pattern matches with weighted scoring
        let patternMatchCount = 0;
        for (const pattern of langInfo.patterns) {
          const matches = contentSample.match(pattern);
          if (matches && matches.length > 0) {
            patternMatchCount += Math.min(matches.length, 5); // Cap at 5 per pattern
          }
        }
        scores.patterns = Math.min(
          25,
          (patternMatchCount / langInfo.patterns.length) * 25
        );

        // SCORE 3: Keyword frequency (language-specific identifiers)
        let keywordCount = 0;
        for (const keyword of langInfo.keywords) {
          const regex = new RegExp(`\\b${this.escapeRegex(keyword)}\\b`, "g");
          const matches = contentSample.match(regex);
          if (matches) {
            keywordCount += matches.length;
          }
        }
        scores.keywords = Math.min(15, (keywordCount / 10) * 15);

        // SCORE 4: Unique signatures (language-specific patterns)
        if ("uniquePatterns" in langInfo && langInfo.uniquePatterns) {
          let uniqueMatchCount = 0;
          for (const pattern of langInfo.uniquePatterns) {
            const matches = contentSample.match(pattern);
            if (matches && matches.length > 0) {
              uniqueMatchCount += matches.length;
            }
          }
          scores.unique = Math.min(
            20,
            (uniqueMatchCount / langInfo.uniquePatterns.length) * 20
          );
        }

        // SCORE 5: Priority bonus (for disambiguation)
        if ("priority" in langInfo) {
          scores.priority = (langInfo.priority || 0) * 0.5;
        }
      }

      // Calculate total confidence
      const totalConfidence =
        scores.extension +
        scores.patterns +
        scores.keywords +
        scores.unique +
        scores.priority;

      if (totalConfidence > 0) {
        candidates.push({
          name: langName,
          confidence: Math.min(100, Math.round(totalConfidence)),
          info: langInfo,
          scores,
        });
      }
    }

    // LAYER 2: Advanced disambiguation
    if (candidates.length > 1) {
      candidates.sort((a, b) => {
        // First sort by total confidence
        if (Math.abs(a.confidence - b.confidence) > 5) {
          return b.confidence - a.confidence;
        }

        // If close, prioritize unique pattern matches
        if (Math.abs(a.scores.unique - b.scores.unique) > 3) {
          return b.scores.unique - a.scores.unique;
        }

        // Then by priority
        return b.scores.priority - a.scores.priority;
      });

      // Special disambiguation rules
      const top = candidates[0];
      const second = candidates[1];

      // TypeScript vs JavaScript: TypeScript wins with type annotations
      if (
        (top.name === "javascript" && second.name === "typescript") ||
        (top.name === "typescript" && second.name === "javascript")
      ) {
        const tsCandidate = candidates.find((c) => c.name === "typescript");
        if (tsCandidate && tsCandidate.scores.unique > 5) {
          candidates.sort(
            (a, b) =>
              (b.name === "typescript" ? 1 : 0) -
              (a.name === "typescript" ? 1 : 0)
          );
        }
      }

      // C vs C++: C++ wins with std:: or class
      if (
        (top.name === "c" && second.name === "cpp") ||
        (top.name === "cpp" && second.name === "c")
      ) {
        const cppCandidate = candidates.find((c) => c.name === "cpp");
        if (cppCandidate && cppCandidate.scores.unique > 3) {
          candidates.sort(
            (a, b) => (b.name === "cpp" ? 1 : 0) - (a.name === "cpp" ? 1 : 0)
          );
        }
      }
    } else if (candidates.length === 1) {
      // Single candidate, but verify it's a good match
      candidates.sort((a, b) => b.confidence - a.confidence);
    }

    // LAYER 3: Return best match with validated confidence
    if (candidates.length > 0) {
      const best = candidates[0];

      // Adjust confidence for very short files
      let finalConfidence = best.confidence;
      if (content.length < 100 && best.scores.extension > 0) {
        finalConfidence = Math.max(finalConfidence, 70); // Trust extension for tiny files
      }

      return {
        name: best.name,
        confidence: Math.round(finalConfidence),
        extensions: best.info.extensions,
        category: best.info.category,
        ecosystem: best.info.ecosystem,
      };
    }

    // Only return unknown if truly no patterns matched
    return {
      name: "unknown",
      confidence: 0,
      extensions: [extension],
      category: "data",
    };
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /**
   * Detect all languages in the codebase
   */
  private detectLanguages(): LanguageInfo[] {
    const languageMap = new Map<
      string,
      {
        totalSize: number;
        fileCount: number;
        maxConfidence: number;
        info: LanguageInfo;
      }
    >();

    // Aggregate language statistics
    for (const analysis of this.fileAnalyses) {
      const lang = analysis.language;
      if (lang.name === "unknown") continue;

      const existing = languageMap.get(lang.name);
      if (existing) {
        existing.totalSize += analysis.size;
        existing.fileCount += 1;
        existing.maxConfidence = Math.max(
          existing.maxConfidence,
          lang.confidence
        );
      } else {
        languageMap.set(lang.name, {
          totalSize: analysis.size,
          fileCount: 1,
          maxConfidence: lang.confidence,
          info: lang,
        });
      }
    }

    // Calculate final confidence scores with enhanced weighting
    const totalFiles = this.fileAnalyses.length;
    const totalSize = this.fileAnalyses.reduce(
      (sum, analysis) => sum + analysis.size,
      0
    );

    const languages: LanguageInfo[] = [];
    for (const [langName, stats] of languageMap.entries()) {
      const fileRatio = stats.fileCount / totalFiles;
      const sizeRatio = stats.totalSize / totalSize;

      // Enhanced scoring algorithm
      // - Base confidence from pattern matching (40%)
      // - File count ratio (30%)
      // - Code size ratio (20%)
      // - Bonus for dominant language (10%)
      const baseScore = stats.maxConfidence * 0.4;
      const fileScore = fileRatio * 100 * 0.3;
      const sizeScore = sizeRatio * 100 * 0.2;
      const dominanceBonus = fileRatio > 0.5 || sizeRatio > 0.6 ? 10 : 0;

      const finalConfidence = Math.round(
        baseScore + fileScore + sizeScore + dominanceBonus
      );

      languages.push({
        ...stats.info,
        name: langName,
        confidence: Math.min(
          100,
          Math.max(finalConfidence, stats.maxConfidence)
        ),
      });
    }

    return languages.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Determine the primary language
   */
  private determinePrimaryLanguage(languages: LanguageInfo[]): LanguageInfo {
    if (languages.length === 0) {
      return {
        name: "unknown",
        confidence: 0,
        extensions: [],
        category: "data",
      };
    }

    return languages[0];
  }

  /**
   * Detect build tools from filenames
   */
  private detectBuildTools(): string[] {
    const buildTools: string[] = [];
    const filenames = this.fileAnalyses.map((f) => f.filename.toLowerCase());

    const buildToolPatterns = {
      Webpack: [
        "webpack.config.js",
        "webpack.config.ts",
        "webpack.dev.js",
        "webpack.prod.js",
      ],
      Vite: ["vite.config.js", "vite.config.ts"],
      Rollup: ["rollup.config.js", "rollup.config.ts"],
      Parcel: ["parcel.config.js", ".parcelrc"],
      Gulp: ["gulpfile.js", "gulpfile.ts"],
      Grunt: ["gruntfile.js", "grunt.js"],
      Maven: ["pom.xml"],
      Gradle: ["build.gradle", "build.gradle.kts", "gradle.properties"],
      Make: ["makefile", "cmake.txt", "cmakelist.txt"],
      Cargo: ["cargo.toml"],
      "Go Modules": ["go.mod", "go.sum"],
      CMake: ["cmakelists.txt", "cmake.txt"],
    };

    for (const [tool, patterns] of Object.entries(buildToolPatterns)) {
      if (
        patterns.some((pattern) =>
          filenames.some((filename) => filename.includes(pattern))
        )
      ) {
        buildTools.push(tool);
      }
    }

    return buildTools;
  }

  /**
   * Detect package managers from filenames
   */
  private detectPackageManagers(): string[] {
    const packageManagers: string[] = [];
    const filenames = this.fileAnalyses.map((f) => f.filename.toLowerCase());

    const packageManagerPatterns = {
      npm: ["package.json", "package-lock.json"],
      Yarn: ["yarn.lock", ".yarnrc"],
      pnpm: ["pnpm-lock.yaml", ".pnpmrc"],
      Bun: ["bun.lockb"],
      pip: ["requirements.txt", "pyproject.toml", "setup.py"],
      Poetry: ["poetry.lock", "pyproject.toml"],
      Conda: ["environment.yml", "conda.yml"],
      Composer: ["composer.json", "composer.lock"],
      Bundler: ["gemfile", "gemfile.lock"],
      Cargo: ["cargo.toml", "cargo.lock"],
      "Go Modules": ["go.mod", "go.sum"],
      NuGet: ["packages.config", "*.csproj", "*.nuspec"],
    };

    for (const [manager, patterns] of Object.entries(packageManagerPatterns)) {
      if (
        patterns.some((pattern) =>
          filenames.some((filename) =>
            pattern.includes("*")
              ? new RegExp(pattern.replace("*", ".*")).test(filename)
              : filename.includes(pattern)
          )
        )
      ) {
        packageManagers.push(manager);
      }
    }

    return packageManagers;
  }

  /**
   * Detect frameworks based on file patterns and content
   */
  private detectFrameworks(): FrameworkInfo[] {
    const frameworks: FrameworkInfo[] = [];
    const filenames = this.fileAnalyses.map((f) => f.filename.toLowerCase());
    const allContent = this.fileAnalyses.map((f) => f.content || "").join("\n");

    // Frontend Frameworks
    this.detectReactFramework(filenames, allContent, frameworks);
    this.detectVueFramework(filenames, allContent, frameworks);
    this.detectAngularFramework(filenames, allContent, frameworks);
    this.detectSvelteFramework(filenames, allContent, frameworks);

    // Backend Frameworks
    this.detectNodeFrameworks(filenames, allContent, frameworks);
    this.detectPythonFrameworks(filenames, allContent, frameworks);
    this.detectJavaFrameworks(filenames, allContent, frameworks);
    this.detectPHPFrameworks(filenames, allContent, frameworks);

    // Mobile Frameworks
    this.detectMobileFrameworks(filenames, allContent, frameworks);

    return frameworks.sort((a, b) => b.confidence - a.confidence);
  }

  private detectReactFramework(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    let confidence = 0;

    // File patterns
    if (filenames.some((f) => f.includes(".jsx") || f.includes(".tsx")))
      confidence += 30;
    if (filenames.some((f) => f.includes("package.json"))) {
      if (content.includes('"react"') || content.includes('"@types/react"'))
        confidence += 40;
    }

    // Content patterns
    if (/import.*from\s+['"]react['"]/.test(content)) confidence += 20;
    if (/React\.Component|useState|useEffect|JSX\.Element/.test(content))
      confidence += 20;
    if (/className=|onClick=|onChange=/.test(content)) confidence += 10;

    if (confidence > 50) {
      frameworks.push({
        name: "React",
        language: "javascript",
        confidence: Math.min(100, confidence),
        category: "frontend",
        ecosystem: "web",
      });
    }

    // Next.js detection
    if (
      filenames.some((f) => f.includes("next.config")) ||
      content.includes("next/")
    ) {
      frameworks.push({
        name: "Next.js",
        language: "javascript",
        confidence: Math.min(100, confidence + 20),
        category: "fullstack",
        ecosystem: "web",
      });
    }
  }

  private detectVueFramework(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    let confidence = 0;

    if (filenames.some((f) => f.includes(".vue"))) confidence += 40;
    if (content.includes('"vue"') || content.includes("@vue/"))
      confidence += 30;
    if (/import.*from\s+['"]vue['"]/.test(content)) confidence += 20;
    if (/<template>|<script>|<style>/.test(content)) confidence += 20;

    if (confidence > 50) {
      frameworks.push({
        name: "Vue.js",
        language: "javascript",
        confidence: Math.min(100, confidence),
        category: "frontend",
        ecosystem: "web",
      });
    }

    // Nuxt.js detection
    if (
      filenames.some((f) => f.includes("nuxt.config")) ||
      content.includes("nuxt")
    ) {
      frameworks.push({
        name: "Nuxt.js",
        language: "javascript",
        confidence: Math.min(100, confidence + 20),
        category: "fullstack",
        ecosystem: "web",
      });
    }
  }

  private detectAngularFramework(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    let confidence = 0;

    if (filenames.some((f) => f.includes("angular.json"))) confidence += 40;
    if (content.includes("@angular/")) confidence += 30;
    if (/@Component|@Injectable|@NgModule/.test(content)) confidence += 30;
    if (
      filenames.some(
        (f) => f.includes(".component.ts") || f.includes(".service.ts")
      )
    )
      confidence += 20;

    if (confidence > 50) {
      frameworks.push({
        name: "Angular",
        language: "typescript",
        confidence: Math.min(100, confidence),
        category: "frontend",
        ecosystem: "web",
      });
    }
  }

  private detectSvelteFramework(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    let confidence = 0;

    if (filenames.some((f) => f.includes(".svelte"))) confidence += 40;
    if (content.includes('"svelte"') || content.includes("svelte/"))
      confidence += 30;
    if (filenames.some((f) => f.includes("svelte.config"))) confidence += 20;

    if (confidence > 50) {
      frameworks.push({
        name: "Svelte",
        language: "javascript",
        confidence: Math.min(100, confidence),
        category: "frontend",
        ecosystem: "web",
      });
    }

    // SvelteKit detection
    if (
      content.includes("@sveltejs/kit") ||
      filenames.some((f) => f.includes("app.html"))
    ) {
      frameworks.push({
        name: "SvelteKit",
        language: "javascript",
        confidence: Math.min(100, confidence + 20),
        category: "fullstack",
        ecosystem: "web",
      });
    }
  }

  private detectNodeFrameworks(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    // Express.js
    if (
      content.includes("express") &&
      (content.includes("app.listen") || content.includes("app.get"))
    ) {
      frameworks.push({
        name: "Express.js",
        language: "javascript",
        confidence: 85,
        category: "backend",
        ecosystem: "web",
      });
    }

    // Fastify
    if (content.includes("fastify") || content.includes("@fastify/")) {
      frameworks.push({
        name: "Fastify",
        language: "javascript",
        confidence: 80,
        category: "backend",
        ecosystem: "web",
      });
    }

    // NestJS
    if (
      content.includes("@nestjs/") ||
      /@Controller|@Injectable|@Module/.test(content)
    ) {
      frameworks.push({
        name: "NestJS",
        language: "typescript",
        confidence: 85,
        category: "backend",
        ecosystem: "web",
      });
    }
  }

  private detectPythonFrameworks(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    // Django
    if (
      content.includes("django") ||
      filenames.some(
        (f) => f.includes("manage.py") || f.includes("settings.py")
      )
    ) {
      frameworks.push({
        name: "Django",
        language: "python",
        confidence: 85,
        category: "fullstack",
        ecosystem: "web",
      });
    }

    // Flask
    if (
      content.includes("from flask import") ||
      content.includes("Flask(__name__)")
    ) {
      frameworks.push({
        name: "Flask",
        language: "python",
        confidence: 85,
        category: "backend",
        ecosystem: "web",
      });
    }

    // FastAPI
    if (
      content.includes("fastapi") ||
      content.includes("from fastapi import")
    ) {
      frameworks.push({
        name: "FastAPI",
        language: "python",
        confidence: 85,
        category: "backend",
        ecosystem: "web",
      });
    }
  }

  private detectJavaFrameworks(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    // Spring Boot
    if (
      content.includes("@SpringBootApplication") ||
      content.includes("spring-boot")
    ) {
      frameworks.push({
        name: "Spring Boot",
        language: "java",
        confidence: 90,
        category: "backend",
        ecosystem: "web",
      });
    }

    // Spring Framework
    if (
      content.includes("@Controller") ||
      content.includes("@Service") ||
      content.includes("springframework")
    ) {
      frameworks.push({
        name: "Spring Framework",
        language: "java",
        confidence: 85,
        category: "backend",
        ecosystem: "web",
      });
    }
  }

  private detectPHPFrameworks(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    // Laravel
    if (
      content.includes("Illuminate\\") ||
      filenames.some((f) => f.includes("artisan"))
    ) {
      frameworks.push({
        name: "Laravel",
        language: "php",
        confidence: 85,
        category: "fullstack",
        ecosystem: "web",
      });
    }

    // Symfony
    if (
      content.includes("Symfony\\") ||
      filenames.some((f) => f.includes("symfony.lock"))
    ) {
      frameworks.push({
        name: "Symfony",
        language: "php",
        confidence: 85,
        category: "fullstack",
        ecosystem: "web",
      });
    }
  }

  private detectMobileFrameworks(
    filenames: string[],
    content: string,
    frameworks: FrameworkInfo[]
  ): void {
    // React Native
    if (
      content.includes("react-native") ||
      content.includes("@react-native/")
    ) {
      frameworks.push({
        name: "React Native",
        language: "javascript",
        confidence: 90,
        category: "mobile",
        ecosystem: "mobile",
      });
    }

    // Flutter
    if (
      content.includes("flutter") ||
      filenames.some((f) => f.includes("pubspec.yaml"))
    ) {
      frameworks.push({
        name: "Flutter",
        language: "dart",
        confidence: 90,
        category: "mobile",
        ecosystem: "mobile",
      });
    }

    // Ionic
    if (content.includes("@ionic/") || content.includes("ionic-angular")) {
      frameworks.push({
        name: "Ionic",
        language: "javascript",
        confidence: 85,
        category: "mobile",
        ecosystem: "mobile",
      });
    }
  }

  /**
   * Analyze project structure and determine project type
   */
  private analyzeProjectStructure(): ProjectStructure {
    const filenames = this.fileAnalyses.map((f) => f.filename.toLowerCase());
    const directories = new Set<string>();

    // Extract directory structure
    filenames.forEach((filename) => {
      const parts = filename.split("/");
      for (let i = 1; i < parts.length; i++) {
        directories.add(parts.slice(0, i).join("/"));
      }
    });

    const indicators: string[] = [];
    let projectType: ProjectStructure["type"] = "unknown";
    let confidence = 0;

    // Web application indicators
    if (this.hasWebStructure(filenames, directories)) {
      projectType = "web";
      confidence += 40;
      indicators.push("Web application structure detected");
    }

    // Mobile application indicators
    if (this.hasMobileStructure(filenames, directories)) {
      projectType = "mobile";
      confidence += 40;
      indicators.push("Mobile application structure detected");
    }

    // Library/package indicators
    if (this.hasLibraryStructure(filenames, directories)) {
      projectType = "library";
      confidence += 35;
      indicators.push("Library/package structure detected");
    }

    // Microservice indicators
    if (this.hasMicroserviceStructure(filenames, directories)) {
      projectType = "microservice";
      confidence += 35;
      indicators.push("Microservice structure detected");
    }

    // Monorepo indicators
    if (this.hasMonorepoStructure(filenames, directories)) {
      projectType = "monorepo";
      confidence += 30;
      indicators.push("Monorepo structure detected");
    }

    // Desktop application indicators
    if (this.hasDesktopStructure(filenames, directories)) {
      projectType = "desktop";
      confidence += 30;
      indicators.push("Desktop application structure detected");
    }

    return {
      type: projectType,
      confidence: Math.min(100, confidence),
      indicators,
    };
  }

  private hasWebStructure(
    filenames: string[],
    directories: Set<string>
  ): boolean {
    const webIndicators = [
      "public/",
      "static/",
      "assets/",
      "src/components/",
      "src/pages/",
      "src/views/",
      "index.html",
      "app.html",
      "package.json",
    ];

    return webIndicators.some(
      (indicator) =>
        filenames.some((f) => f.includes(indicator)) ||
        directories.has(indicator.replace("/", ""))
    );
  }

  private hasMobileStructure(
    filenames: string[],
    directories: Set<string>
  ): boolean {
    const mobileIndicators = [
      "android/",
      "ios/",
      "lib/",
      "pubspec.yaml",
      "android/app/",
      "ios/runner/",
      "react-native",
      "metro.config.js",
      "app.json",
    ];

    return mobileIndicators.some(
      (indicator) =>
        filenames.some((f) => f.includes(indicator)) ||
        directories.has(indicator.replace("/", ""))
    );
  }

  private hasLibraryStructure(
    filenames: string[],
    _directories: Set<string>
  ): boolean {
    const libraryIndicators = [
      "lib/",
      "dist/",
      "build/",
      "index.js",
      "index.ts",
      "rollup.config",
      "webpack.config",
      "tsconfig.json",
      ".npmignore",
    ];

    const hasMainEntry = filenames.some(
      (f) =>
        f === "index.js" ||
        f === "index.ts" ||
        f === "main.js" ||
        f === "main.ts"
    );

    const hasConfigFiles = libraryIndicators.some((indicator) =>
      filenames.some((f) => f.includes(indicator))
    );

    return hasMainEntry && hasConfigFiles;
  }

  private hasMicroserviceStructure(
    filenames: string[],
    directories: Set<string>
  ): boolean {
    const microserviceIndicators = [
      "dockerfile",
      "docker-compose",
      "kubernetes/",
      "k8s/",
      "helm/",
      "charts/",
      "api/",
      "routes/",
      "controllers/",
      "middleware/",
      "services/",
    ];

    const hasContainerization = filenames.some(
      (f) => f.includes("dockerfile") || f.includes("docker-compose")
    );

    const hasApiStructure = microserviceIndicators.some(
      (indicator) =>
        filenames.some((f) => f.includes(indicator)) ||
        directories.has(indicator.replace("/", ""))
    );

    return hasContainerization || hasApiStructure;
  }

  private hasMonorepoStructure(
    filenames: string[],
    directories: Set<string>
  ): boolean {
    const hasWorkspaceConfig = filenames.some(
      (f) =>
        f.includes("lerna.json") ||
        f.includes("nx.json") ||
        f.includes("workspace.json") ||
        f.includes("pnpm-workspace.yaml")
    );

    const hasMultiplePackages =
      Array.from(directories).filter(
        (dir) =>
          dir.includes("packages/") ||
          dir.includes("apps/") ||
          dir.includes("libs/")
      ).length > 1;

    return hasWorkspaceConfig || hasMultiplePackages;
  }

  private hasDesktopStructure(
    filenames: string[],
    directories: Set<string>
  ): boolean {
    const desktopIndicators = [
      "electron",
      "tauri",
      "main.js",
      "main.ts",
      "src-tauri/",
      "electron-builder",
      "forge.config.js",
      "tauri.conf.json",
    ];

    return desktopIndicators.some(
      (indicator) =>
        filenames.some((f) => f.includes(indicator)) ||
        directories.has(indicator.replace("/", ""))
    );
  }

  /**
   * Get a summary of detected languages for quick reference
   */
  public getLanguageSummary(result: DetectionResult): string {
    const { primaryLanguage, allLanguages, frameworks } = result;

    let summary = `Primary: ${primaryLanguage.name} (${primaryLanguage.confidence}%)`;

    if (allLanguages.length > 1) {
      const others = allLanguages
        .slice(1, 3)
        .map((lang) => `${lang.name} (${lang.confidence}%)`);
      summary += `, Others: ${others.join(", ")}`;
    }

    if (frameworks.length > 0) {
      const topFrameworks = frameworks.slice(0, 2).map((fw) => fw.name);
      summary += `, Frameworks: ${topFrameworks.join(", ")}`;
    }

    return summary;
  }

  /**
   * Get recommended analysis tools based on detected languages and frameworks
   */
  public getRecommendedTools(result: DetectionResult): string[] {
    const tools = new Set<string>();

    // Language-specific tools
    result.allLanguages.forEach((lang) => {
      switch (lang.name) {
        case "javascript":
        case "typescript":
          tools.add("ESLint");
          tools.add("SonarJS");
          break;
        case "python":
          tools.add("Bandit");
          tools.add("PyLint");
          tools.add("Safety");
          break;
        case "java":
          tools.add("SpotBugs");
          tools.add("SonarJava");
          break;
        case "csharp":
          tools.add("SonarC#");
          tools.add("Security Code Scan");
          break;
        case "php":
          tools.add("PHPCS Security");
          tools.add("SonarPHP");
          break;
        case "ruby":
          tools.add("Brakeman");
          tools.add("RuboCop Security");
          break;
        case "go":
          tools.add("Gosec");
          tools.add("StaticCheck");
          break;
        case "rust":
          tools.add("Clippy");
          tools.add("Cargo Audit");
          break;
      }
    });

    // Framework-specific tools
    result.frameworks.forEach((framework) => {
      switch (framework.name) {
        case "React":
        case "Next.js":
          tools.add("React Security");
          tools.add("JSX A11y");
          break;
        case "Angular":
          tools.add("Angular Security");
          tools.add("TSLint Security");
          break;
        case "Vue.js":
          tools.add("Vue Security");
          break;
        case "Django":
          tools.add("Django Security");
          tools.add("Bandit Django");
          break;
        case "Spring Boot":
          tools.add("Spring Security Analyzer");
          break;
      }
    });

    // Universal tools
    tools.add("Semgrep");
    tools.add("CodeQL");
    tools.add("Secret Scanner");

    return Array.from(tools);
  }
}
