/**
 * Smart Language Detection Service
 * Auto-detects programming languages, frameworks, and project types
 * from file extensions, content patterns, and project structure
 */

export interface LanguageInfo {
  name: string;
  confidence: number;
  extensions: string[];
  category: 'programming' | 'markup' | 'config' | 'data' | 'documentation';
  ecosystem?: string; // e.g., 'web', 'mobile', 'backend', 'data-science'
}

export interface FrameworkInfo {
  name: string;
  language: string;
  confidence: number;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'desktop' | 'testing' | 'build';
  version?: string;
  ecosystem: string;
}

export interface ProjectStructure {
  type: 'web' | 'mobile' | 'desktop' | 'library' | 'microservice' | 'monorepo' | 'unknown';
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
 * Comprehensive language patterns and signatures
 */
const LANGUAGE_PATTERNS = {
  // Programming Languages
  javascript: {
    extensions: ['.js', '.mjs', '.cjs', '.jsx'],
    patterns: [
      /\b(function|const|let|var|class|import|export|require)\b/,
      /\b(console\.log|document\.|window\.)/,
      /\b(async|await|Promise)\b/,
      /=>\s*\{/,
      /\$\{.*\}/
    ],
    keywords: ['function', 'const', 'let', 'var', 'class', 'import', 'export', 'async', 'await'],
    category: 'programming' as const,
    ecosystem: 'web'
  },
  typescript: {
    extensions: ['.ts', '.tsx', '.d.ts'],
    patterns: [
      /\b(interface|type|enum|namespace)\b/,
      /:\s*(string|number|boolean|any|void|unknown)/,
      /<.*>/,
      /\b(public|private|protected|readonly)\b/,
      /\b(implements|extends)\b/
    ],
    keywords: ['interface', 'type', 'enum', 'namespace', 'implements', 'extends'],
    category: 'programming' as const,
    ecosystem: 'web'
  },
  python: {
    extensions: ['.py', '.pyw', '.pyi', '.pyx'],
    patterns: [
      /\b(def|class|import|from|if __name__ == "__main__")\b/,
      /\b(print|len|range|enumerate)\b/,
      /\bself\./,
      /\b(try|except|finally|with|as)\b/,
      /#.*$/m
    ],
    keywords: ['def', 'class', 'import', 'from', 'if', 'elif', 'else', 'try', 'except'],
    category: 'programming' as const,
    ecosystem: 'backend'
  },
  java: {
    extensions: ['.java'],
    patterns: [
      /\b(public|private|protected|static|final|abstract)\b/,
      /\b(class|interface|enum|package|import)\b/,
      /\b(System\.out\.println|String|int|boolean|void)\b/,
      /\b(extends|implements|throws)\b/,
      /@\w+/
    ],
    keywords: ['public', 'private', 'protected', 'class', 'interface', 'package', 'import'],
    category: 'programming' as const,
    ecosystem: 'backend'
  },
  csharp: {
    extensions: ['.cs', '.csx'],
    patterns: [
      /\b(using|namespace|class|interface|struct|enum)\b/,
      /\b(public|private|protected|internal|static|readonly)\b/,
      /\b(string|int|bool|void|var|object)\b/,
      /\b(Console\.WriteLine|System\.)\b/,
      /\[.*\]/
    ],
    keywords: ['using', 'namespace', 'class', 'interface', 'public', 'private', 'static'],
    category: 'programming' as const,
    ecosystem: 'backend'
  },
  php: {
    extensions: ['.php', '.phtml', '.php3', '.php4', '.php5', '.phps'],
    patterns: [
      /<\?php/,
      /\$\w+/,
      /\b(function|class|interface|trait|namespace)\b/,
      /\b(echo|print|var_dump|isset|empty)\b/,
      /->/
    ],
    keywords: ['function', 'class', 'interface', 'namespace', 'echo', 'print'],
    category: 'programming' as const,
    ecosystem: 'web'
  },
  ruby: {
    extensions: ['.rb', '.rbw', '.rake', '.gemspec'],
    patterns: [
      /\b(def|class|module|end|require|include)\b/,
      /\b(puts|print|p|gets)\b/,
      /@\w+/,
      /\b(if|unless|while|until|for|in)\b/,
      /#.*$/m
    ],
    keywords: ['def', 'class', 'module', 'end', 'require', 'include'],
    category: 'programming' as const,
    ecosystem: 'backend'
  },
  go: {
    extensions: ['.go'],
    patterns: [
      /\b(package|import|func|var|const|type)\b/,
      /\b(fmt\.Print|fmt\.Sprintf)\b/,
      /\b(if|for|switch|select|go|defer)\b/,
      /\b(struct|interface|map|chan)\b/,
      /\/\/.*$/m
    ],
    keywords: ['package', 'import', 'func', 'var', 'const', 'type', 'struct', 'interface'],
    category: 'programming' as const,
    ecosystem: 'backend'
  },
  rust: {
    extensions: ['.rs'],
    patterns: [
      /\b(fn|let|mut|const|static|struct|enum|impl|trait)\b/,
      /\b(println!|print!|panic!)\b/,
      /\b(match|if|while|for|loop)\b/,
      /\b(pub|use|mod|crate)\b/,
      /\/\/.*$/m
    ],
    keywords: ['fn', 'let', 'mut', 'struct', 'enum', 'impl', 'trait', 'match'],
    category: 'programming' as const,
    ecosystem: 'backend'
  },
  cpp: {
    extensions: ['.cpp', '.cxx', '.cc', '.c++', '.hpp', '.hxx', '.h++'],
    patterns: [
      /\b(#include|#define|#ifdef|#ifndef)\b/,
      /\b(class|struct|namespace|template|typename)\b/,
      /\b(std::|cout|cin|endl)\b/,
      /\b(public|private|protected|virtual)\b/,
      /\/\/.*$/m
    ],
    keywords: ['class', 'struct', 'namespace', 'template', 'public', 'private', 'virtual'],
    category: 'programming' as const,
    ecosystem: 'backend'
  },
  c: {
    extensions: ['.c', '.h'],
    patterns: [
      /\b(#include|#define|#ifdef|#ifndef)\b/,
      /\b(int|char|float|double|void|struct|enum)\b/,
      /\b(printf|scanf|malloc|free)\b/,
      /\b(if|else|while|for|switch|case)\b/,
      /\/\*[\s\S]*?\*\//
    ],
    keywords: ['int', 'char', 'float', 'double', 'void', 'struct', 'enum'],
    category: 'programming' as const,
    ecosystem: 'backend'
  }
};

export class LanguageDetectionService {
  private fileAnalyses: FileAnalysis[] = [];
  private startTime: number = 0;

  /**
   * Analyze a codebase and detect languages, frameworks, and project structure
   */
  public async analyzeCodebase(files: { filename: string; content: string }[]): Promise<DetectionResult> {
    this.startTime = Date.now();
    this.fileAnalyses = [];

    // Analyze each file
    for (const file of files) {
      const analysis = this.analyzeFile(file.filename, file.content);
      this.fileAnalyses.push(analysis);
    }

    // Detect languages
    const allLanguages = this.detectLanguages();
    const primaryLanguage = this.determinePrimaryLanguage(allLanguages);

    // Detect frameworks
    const frameworks = this.detectFrameworks();

    // Analyze project structure
    const projectStructure = this.analyzeProjectStructure();

    // Detect build tools and package managers
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
      analysisTime
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
      content
    };
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot).toLowerCase() : '';
  }

  /**
   * Detect language for a single file
   */
  private detectFileLanguage(filename: string, content: string): LanguageInfo {
    const extension = this.getFileExtension(filename);
    const candidates: Array<{ name: string; confidence: number; info: Record<string, unknown> }> = [];

    // Check each language pattern
    for (const [langName, langInfo] of Object.entries(LANGUAGE_PATTERNS)) {
      let confidence = 0;

      // Extension match (high confidence)
      if (langInfo.extensions.includes(extension)) {
        confidence += 60;
      }

      // Content pattern matching
      if (content) {
        const patternMatches = langInfo.patterns.filter(pattern => pattern.test(content)).length;
        const patternConfidence = (patternMatches / langInfo.patterns.length) * 30;
        confidence += patternConfidence;

        // Keyword frequency analysis
        const keywordMatches = langInfo.keywords.filter(keyword =>
          new RegExp(`\\b${keyword}\\b`, 'g').test(content)
        ).length;
        const keywordConfidence = (keywordMatches / langInfo.keywords.length) * 10;
        confidence += keywordConfidence;
      }

      if (confidence > 0) {
        candidates.push({
          name: langName,
          confidence: Math.min(100, confidence),
          info: langInfo
        });
      }
    }

    // Sort by confidence and return the best match
    candidates.sort((a, b) => b.confidence - a.confidence);

    if (candidates.length > 0) {
      const best = candidates[0];
      return {
        name: best.name,
        confidence: best.confidence,
        extensions: best.info.extensions as string[],
        category: best.info.category as 'programming' | 'markup' | 'config' | 'data' | 'documentation',
        ecosystem: best.info.ecosystem as string | undefined
      };
    }

    // Default fallback
    return {
      name: 'unknown',
      confidence: 0,
      extensions: [extension],
      category: 'data'
    };
  }

  /**
   * Detect all languages in the codebase
   */
  private detectLanguages(): LanguageInfo[] {
    const languageMap = new Map<string, { totalSize: number; fileCount: number; maxConfidence: number; info: LanguageInfo }>();

    // Aggregate language statistics
    for (const analysis of this.fileAnalyses) {
      const lang = analysis.language;
      if (lang.name === 'unknown') continue;

      const existing = languageMap.get(lang.name);
      if (existing) {
        existing.totalSize += analysis.size;
        existing.fileCount += 1;
        existing.maxConfidence = Math.max(existing.maxConfidence, lang.confidence);
      } else {
        languageMap.set(lang.name, {
          totalSize: analysis.size,
          fileCount: 1,
          maxConfidence: lang.confidence,
          info: lang
        });
      }
    }

    // Calculate final confidence scores
    const totalFiles = this.fileAnalyses.length;
    const totalSize = this.fileAnalyses.reduce((sum, analysis) => sum + analysis.size, 0);

    const languages: LanguageInfo[] = [];
    for (const [name, stats] of languageMap.entries()) {
      const fileRatio = stats.fileCount / totalFiles;
      const sizeRatio = stats.totalSize / totalSize;
      const finalConfidence = Math.round(
        (stats.maxConfidence * 0.4) +
        (fileRatio * 100 * 0.3) +
        (sizeRatio * 100 * 0.3)
      );

      languages.push({
        ...stats.info,
        confidence: Math.min(100, finalConfidence)
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
        name: 'unknown',
        confidence: 0,
        extensions: [],
        category: 'data'
      };
    }

    return languages[0];
  }

  /**
   * Detect build tools from filenames
   */
  private detectBuildTools(): string[] {
    const buildTools: string[] = [];
    const filenames = this.fileAnalyses.map(f => f.filename.toLowerCase());

    const buildToolPatterns = {
      'Webpack': ['webpack.config.js', 'webpack.config.ts', 'webpack.dev.js', 'webpack.prod.js'],
      'Vite': ['vite.config.js', 'vite.config.ts'],
      'Rollup': ['rollup.config.js', 'rollup.config.ts'],
      'Parcel': ['parcel.config.js', '.parcelrc'],
      'Gulp': ['gulpfile.js', 'gulpfile.ts'],
      'Grunt': ['gruntfile.js', 'grunt.js'],
      'Maven': ['pom.xml'],
      'Gradle': ['build.gradle', 'build.gradle.kts', 'gradle.properties'],
      'Make': ['makefile', 'cmake.txt', 'cmakelist.txt'],
      'Cargo': ['cargo.toml'],
      'Go Modules': ['go.mod', 'go.sum'],
      'CMake': ['cmakelists.txt', 'cmake.txt']
    };

    for (const [tool, patterns] of Object.entries(buildToolPatterns)) {
      if (patterns.some(pattern => filenames.some(filename => filename.includes(pattern)))) {
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
    const filenames = this.fileAnalyses.map(f => f.filename.toLowerCase());

    const packageManagerPatterns = {
      'npm': ['package.json', 'package-lock.json'],
      'Yarn': ['yarn.lock', '.yarnrc'],
      'pnpm': ['pnpm-lock.yaml', '.pnpmrc'],
      'Bun': ['bun.lockb'],
      'pip': ['requirements.txt', 'pyproject.toml', 'setup.py'],
      'Poetry': ['poetry.lock', 'pyproject.toml'],
      'Conda': ['environment.yml', 'conda.yml'],
      'Composer': ['composer.json', 'composer.lock'],
      'Bundler': ['gemfile', 'gemfile.lock'],
      'Cargo': ['cargo.toml', 'cargo.lock'],
      'Go Modules': ['go.mod', 'go.sum'],
      'NuGet': ['packages.config', '*.csproj', '*.nuspec']
    };

    for (const [manager, patterns] of Object.entries(packageManagerPatterns)) {
      if (patterns.some(pattern =>
        filenames.some(filename =>
          pattern.includes('*') ?
            new RegExp(pattern.replace('*', '.*')).test(filename) :
            filename.includes(pattern)
        )
      )) {
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
    const filenames = this.fileAnalyses.map(f => f.filename.toLowerCase());
    const allContent = this.fileAnalyses.map(f => f.content || '').join('\n');

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

  private detectReactFramework(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    let confidence = 0;

    // File patterns
    if (filenames.some(f => f.includes('.jsx') || f.includes('.tsx'))) confidence += 30;
    if (filenames.some(f => f.includes('package.json'))) {
      if (content.includes('"react"') || content.includes('"@types/react"')) confidence += 40;
    }

    // Content patterns
    if (/import.*from\s+['"]react['"]/.test(content)) confidence += 20;
    if (/React\.Component|useState|useEffect|JSX\.Element/.test(content)) confidence += 20;
    if (/className=|onClick=|onChange=/.test(content)) confidence += 10;

    if (confidence > 50) {
      frameworks.push({
        name: 'React',
        language: 'javascript',
        confidence: Math.min(100, confidence),
        category: 'frontend',
        ecosystem: 'web'
      });
    }

    // Next.js detection
    if (filenames.some(f => f.includes('next.config')) || content.includes('next/')) {
      frameworks.push({
        name: 'Next.js',
        language: 'javascript',
        confidence: Math.min(100, confidence + 20),
        category: 'fullstack',
        ecosystem: 'web'
      });
    }
  }

  private detectVueFramework(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    let confidence = 0;

    if (filenames.some(f => f.includes('.vue'))) confidence += 40;
    if (content.includes('"vue"') || content.includes('@vue/')) confidence += 30;
    if (/import.*from\s+['"]vue['"]/.test(content)) confidence += 20;
    if (/<template>|<script>|<style>/.test(content)) confidence += 20;

    if (confidence > 50) {
      frameworks.push({
        name: 'Vue.js',
        language: 'javascript',
        confidence: Math.min(100, confidence),
        category: 'frontend',
        ecosystem: 'web'
      });
    }

    // Nuxt.js detection
    if (filenames.some(f => f.includes('nuxt.config')) || content.includes('nuxt')) {
      frameworks.push({
        name: 'Nuxt.js',
        language: 'javascript',
        confidence: Math.min(100, confidence + 20),
        category: 'fullstack',
        ecosystem: 'web'
      });
    }
  }

  private detectAngularFramework(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    let confidence = 0;

    if (filenames.some(f => f.includes('angular.json'))) confidence += 40;
    if (content.includes('@angular/')) confidence += 30;
    if (/@Component|@Injectable|@NgModule/.test(content)) confidence += 30;
    if (filenames.some(f => f.includes('.component.ts') || f.includes('.service.ts'))) confidence += 20;

    if (confidence > 50) {
      frameworks.push({
        name: 'Angular',
        language: 'typescript',
        confidence: Math.min(100, confidence),
        category: 'frontend',
        ecosystem: 'web'
      });
    }
  }

  private detectSvelteFramework(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    let confidence = 0;

    if (filenames.some(f => f.includes('.svelte'))) confidence += 40;
    if (content.includes('"svelte"') || content.includes('svelte/')) confidence += 30;
    if (filenames.some(f => f.includes('svelte.config'))) confidence += 20;

    if (confidence > 50) {
      frameworks.push({
        name: 'Svelte',
        language: 'javascript',
        confidence: Math.min(100, confidence),
        category: 'frontend',
        ecosystem: 'web'
      });
    }

    // SvelteKit detection
    if (content.includes('@sveltejs/kit') || filenames.some(f => f.includes('app.html'))) {
      frameworks.push({
        name: 'SvelteKit',
        language: 'javascript',
        confidence: Math.min(100, confidence + 20),
        category: 'fullstack',
        ecosystem: 'web'
      });
    }
  }

  private detectNodeFrameworks(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    // Express.js
    if (content.includes('express') && (content.includes('app.listen') || content.includes('app.get'))) {
      frameworks.push({
        name: 'Express.js',
        language: 'javascript',
        confidence: 85,
        category: 'backend',
        ecosystem: 'web'
      });
    }

    // Fastify
    if (content.includes('fastify') || content.includes('@fastify/')) {
      frameworks.push({
        name: 'Fastify',
        language: 'javascript',
        confidence: 80,
        category: 'backend',
        ecosystem: 'web'
      });
    }

    // NestJS
    if (content.includes('@nestjs/') || /@Controller|@Injectable|@Module/.test(content)) {
      frameworks.push({
        name: 'NestJS',
        language: 'typescript',
        confidence: 85,
        category: 'backend',
        ecosystem: 'web'
      });
    }
  }

  private detectPythonFrameworks(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    // Django
    if (content.includes('django') || filenames.some(f => f.includes('manage.py') || f.includes('settings.py'))) {
      frameworks.push({
        name: 'Django',
        language: 'python',
        confidence: 85,
        category: 'fullstack',
        ecosystem: 'web'
      });
    }

    // Flask
    if (content.includes('from flask import') || content.includes('Flask(__name__)')) {
      frameworks.push({
        name: 'Flask',
        language: 'python',
        confidence: 85,
        category: 'backend',
        ecosystem: 'web'
      });
    }

    // FastAPI
    if (content.includes('fastapi') || content.includes('from fastapi import')) {
      frameworks.push({
        name: 'FastAPI',
        language: 'python',
        confidence: 85,
        category: 'backend',
        ecosystem: 'web'
      });
    }
  }

  private detectJavaFrameworks(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    // Spring Boot
    if (content.includes('@SpringBootApplication') || content.includes('spring-boot')) {
      frameworks.push({
        name: 'Spring Boot',
        language: 'java',
        confidence: 90,
        category: 'backend',
        ecosystem: 'web'
      });
    }

    // Spring Framework
    if (content.includes('@Controller') || content.includes('@Service') || content.includes('springframework')) {
      frameworks.push({
        name: 'Spring Framework',
        language: 'java',
        confidence: 85,
        category: 'backend',
        ecosystem: 'web'
      });
    }
  }

  private detectPHPFrameworks(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    // Laravel
    if (content.includes('Illuminate\\') || filenames.some(f => f.includes('artisan'))) {
      frameworks.push({
        name: 'Laravel',
        language: 'php',
        confidence: 85,
        category: 'fullstack',
        ecosystem: 'web'
      });
    }

    // Symfony
    if (content.includes('Symfony\\') || filenames.some(f => f.includes('symfony.lock'))) {
      frameworks.push({
        name: 'Symfony',
        language: 'php',
        confidence: 85,
        category: 'fullstack',
        ecosystem: 'web'
      });
    }
  }

  private detectMobileFrameworks(filenames: string[], content: string, frameworks: FrameworkInfo[]): void {
    // React Native
    if (content.includes('react-native') || content.includes('@react-native/')) {
      frameworks.push({
        name: 'React Native',
        language: 'javascript',
        confidence: 90,
        category: 'mobile',
        ecosystem: 'mobile'
      });
    }

    // Flutter
    if (content.includes('flutter') || filenames.some(f => f.includes('pubspec.yaml'))) {
      frameworks.push({
        name: 'Flutter',
        language: 'dart',
        confidence: 90,
        category: 'mobile',
        ecosystem: 'mobile'
      });
    }

    // Ionic
    if (content.includes('@ionic/') || content.includes('ionic-angular')) {
      frameworks.push({
        name: 'Ionic',
        language: 'javascript',
        confidence: 85,
        category: 'mobile',
        ecosystem: 'mobile'
      });
    }
  }

  /**
   * Analyze project structure and determine project type
   */
  private analyzeProjectStructure(): ProjectStructure {
    const filenames = this.fileAnalyses.map(f => f.filename.toLowerCase());
    const directories = new Set<string>();

    // Extract directory structure
    filenames.forEach(filename => {
      const parts = filename.split('/');
      for (let i = 1; i < parts.length; i++) {
        directories.add(parts.slice(0, i).join('/'));
      }
    });

    const indicators: string[] = [];
    let projectType: ProjectStructure['type'] = 'unknown';
    let confidence = 0;

    // Web application indicators
    if (this.hasWebStructure(filenames, directories)) {
      projectType = 'web';
      confidence += 40;
      indicators.push('Web application structure detected');
    }

    // Mobile application indicators
    if (this.hasMobileStructure(filenames, directories)) {
      projectType = 'mobile';
      confidence += 40;
      indicators.push('Mobile application structure detected');
    }

    // Library/package indicators
    if (this.hasLibraryStructure(filenames, directories)) {
      projectType = 'library';
      confidence += 35;
      indicators.push('Library/package structure detected');
    }

    // Microservice indicators
    if (this.hasMicroserviceStructure(filenames, directories)) {
      projectType = 'microservice';
      confidence += 35;
      indicators.push('Microservice structure detected');
    }

    // Monorepo indicators
    if (this.hasMonorepoStructure(filenames, directories)) {
      projectType = 'monorepo';
      confidence += 30;
      indicators.push('Monorepo structure detected');
    }

    // Desktop application indicators
    if (this.hasDesktopStructure(filenames, directories)) {
      projectType = 'desktop';
      confidence += 30;
      indicators.push('Desktop application structure detected');
    }

    return {
      type: projectType,
      confidence: Math.min(100, confidence),
      indicators
    };
  }

  private hasWebStructure(filenames: string[], directories: Set<string>): boolean {
    const webIndicators = [
      'public/', 'static/', 'assets/',
      'src/components/', 'src/pages/', 'src/views/',
      'index.html', 'app.html',
      'package.json'
    ];

    return webIndicators.some(indicator =>
      filenames.some(f => f.includes(indicator)) ||
      directories.has(indicator.replace('/', ''))
    );
  }

  private hasMobileStructure(filenames: string[], directories: Set<string>): boolean {
    const mobileIndicators = [
      'android/', 'ios/', 'lib/',
      'pubspec.yaml', 'android/app/',
      'ios/runner/', 'react-native',
      'metro.config.js', 'app.json'
    ];

    return mobileIndicators.some(indicator =>
      filenames.some(f => f.includes(indicator)) ||
      directories.has(indicator.replace('/', ''))
    );
  }

  private hasLibraryStructure(filenames: string[], directories: Set<string>): boolean {
    const libraryIndicators = [
      'lib/', 'dist/', 'build/',
      'index.js', 'index.ts',
      'rollup.config', 'webpack.config',
      'tsconfig.json', '.npmignore'
    ];

    const hasMainEntry = filenames.some(f =>
      f === 'index.js' || f === 'index.ts' || f === 'main.js' || f === 'main.ts'
    );

    const hasConfigFiles = libraryIndicators.some(indicator =>
      filenames.some(f => f.includes(indicator))
    );

    return hasMainEntry && hasConfigFiles;
  }

  private hasMicroserviceStructure(filenames: string[], directories: Set<string>): boolean {
    const microserviceIndicators = [
      'dockerfile', 'docker-compose',
      'kubernetes/', 'k8s/',
      'helm/', 'charts/',
      'api/', 'routes/', 'controllers/',
      'middleware/', 'services/'
    ];

    const hasContainerization = filenames.some(f =>
      f.includes('dockerfile') || f.includes('docker-compose')
    );

    const hasApiStructure = microserviceIndicators.some(indicator =>
      filenames.some(f => f.includes(indicator)) ||
      directories.has(indicator.replace('/', ''))
    );

    return hasContainerization || hasApiStructure;
  }

  private hasMonorepoStructure(filenames: string[], directories: Set<string>): boolean {
    const monorepoIndicators = [
      'packages/', 'apps/', 'libs/',
      'lerna.json', 'nx.json',
      'workspace.json', 'rush.json',
      'pnpm-workspace.yaml'
    ];

    const hasWorkspaceConfig = filenames.some(f =>
      f.includes('lerna.json') || f.includes('nx.json') ||
      f.includes('workspace.json') || f.includes('pnpm-workspace.yaml')
    );

    const hasMultiplePackages = Array.from(directories).filter(dir =>
      dir.includes('packages/') || dir.includes('apps/') || dir.includes('libs/')
    ).length > 1;

    return hasWorkspaceConfig || hasMultiplePackages;
  }

  private hasDesktopStructure(filenames: string[], directories: Set<string>): boolean {
    const desktopIndicators = [
      'electron', 'tauri',
      'main.js', 'main.ts',
      'src-tauri/', 'electron-builder',
      'forge.config.js', 'tauri.conf.json'
    ];

    return desktopIndicators.some(indicator =>
      filenames.some(f => f.includes(indicator)) ||
      directories.has(indicator.replace('/', ''))
    );
  }

  /**
   * Get a summary of detected languages for quick reference
   */
  public getLanguageSummary(result: DetectionResult): string {
    const { primaryLanguage, allLanguages, frameworks } = result;

    let summary = `Primary: ${primaryLanguage.name} (${primaryLanguage.confidence}%)`;

    if (allLanguages.length > 1) {
      const others = allLanguages.slice(1, 3).map(lang => `${lang.name} (${lang.confidence}%)`);
      summary += `, Others: ${others.join(', ')}`;
    }

    if (frameworks.length > 0) {
      const topFrameworks = frameworks.slice(0, 2).map(fw => fw.name);
      summary += `, Frameworks: ${topFrameworks.join(', ')}`;
    }

    return summary;
  }

  /**
   * Get recommended analysis tools based on detected languages and frameworks
   */
  public getRecommendedTools(result: DetectionResult): string[] {
    const tools = new Set<string>();

    // Language-specific tools
    result.allLanguages.forEach(lang => {
      switch (lang.name) {
        case 'javascript':
        case 'typescript':
          tools.add('ESLint');
          tools.add('SonarJS');
          break;
        case 'python':
          tools.add('Bandit');
          tools.add('PyLint');
          tools.add('Safety');
          break;
        case 'java':
          tools.add('SpotBugs');
          tools.add('SonarJava');
          break;
        case 'csharp':
          tools.add('SonarC#');
          tools.add('Security Code Scan');
          break;
        case 'php':
          tools.add('PHPCS Security');
          tools.add('SonarPHP');
          break;
        case 'ruby':
          tools.add('Brakeman');
          tools.add('RuboCop Security');
          break;
        case 'go':
          tools.add('Gosec');
          tools.add('StaticCheck');
          break;
        case 'rust':
          tools.add('Clippy');
          tools.add('Cargo Audit');
          break;
      }
    });

    // Framework-specific tools
    result.frameworks.forEach(framework => {
      switch (framework.name) {
        case 'React':
        case 'Next.js':
          tools.add('React Security');
          tools.add('JSX A11y');
          break;
        case 'Angular':
          tools.add('Angular Security');
          tools.add('TSLint Security');
          break;
        case 'Vue.js':
          tools.add('Vue Security');
          break;
        case 'Django':
          tools.add('Django Security');
          tools.add('Bandit Django');
          break;
        case 'Spring Boot':
          tools.add('Spring Security Analyzer');
          break;
      }
    });

    // Universal tools
    tools.add('Semgrep');
    tools.add('CodeQL');
    tools.add('Secret Scanner');

    return Array.from(tools);
  }
}
