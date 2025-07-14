/**
 * Framework Detection Engine
 * Advanced framework detection with dependency analysis and version detection
 */

import { FrameworkInfo } from './languageDetectionService';

export interface DependencyInfo {
  name: string;
  version?: string;
  type: 'dependency' | 'devDependency' | 'peerDependency';
  ecosystem: string;
}

export interface FrameworkPattern {
  name: string;
  language: string;
  category: 'frontend' | 'backend' | 'fullstack' | 'mobile' | 'desktop' | 'testing' | 'build';
  ecosystem: string;
  filePatterns: string[];
  contentPatterns: RegExp[];
  dependencies: string[];
  configFiles: string[];
  directoryStructure: string[];
  minimumConfidence: number;
}

export interface FrameworkDetectionResult {
  frameworks: FrameworkInfo[];
  dependencies: DependencyInfo[];
  confidence: number;
  detectionMethod: 'file-pattern' | 'dependency' | 'content' | 'structure' | 'hybrid';
}

/**
 * Comprehensive framework patterns database
 */
const FRAMEWORK_PATTERNS: FrameworkPattern[] = [
  // Frontend Frameworks
  {
    name: 'React',
    language: 'javascript',
    category: 'frontend',
    ecosystem: 'web',
    filePatterns: ['*.jsx', '*.tsx'],
    contentPatterns: [
      /import.*from\s+['"]react['"]/,
      /React\.Component|useState|useEffect/,
      /JSX\.Element|ReactNode/,
      /className=|onClick=/
    ],
    dependencies: ['react', '@types/react', 'react-dom'],
    configFiles: ['package.json'],
    directoryStructure: ['src/components', 'src/hooks'],
    minimumConfidence: 40
  },
  {
    name: 'Next.js',
    language: 'javascript',
    category: 'fullstack',
    ecosystem: 'web',
    filePatterns: ['next.config.*', 'pages/**', 'app/**'],
    contentPatterns: [
      /import.*from\s+['"]next\//,
      /export\s+default\s+function.*Page/,
      /getServerSideProps|getStaticProps/
    ],
    dependencies: ['next', '@next/'],
    configFiles: ['next.config.js', 'next.config.ts'],
    directoryStructure: ['pages/', 'app/', 'public/'],
    minimumConfidence: 30
  },
  {
    name: 'Vue.js',
    language: 'javascript',
    category: 'frontend',
    ecosystem: 'web',
    filePatterns: ['*.vue'],
    contentPatterns: [
      /import.*from\s+['"]vue['"]/,
      /<template>|<script>|<style>/,
      /Vue\.createApp|createApp/,
      /v-if|v-for|v-model/
    ],
    dependencies: ['vue', '@vue/', 'vue-router'],
    configFiles: ['vue.config.js', 'vite.config.js'],
    directoryStructure: ['src/components', 'src/views'],
    minimumConfidence: 40
  },
  {
    name: 'Nuxt.js',
    language: 'javascript',
    category: 'fullstack',
    ecosystem: 'web',
    filePatterns: ['nuxt.config.*', 'layouts/**', 'middleware/**'],
    contentPatterns: [
      /import.*from\s+['"]nuxt/,
      /export\s+default\s+defineNuxtConfig/,
      /useFetch|useAsyncData/
    ],
    dependencies: ['nuxt', '@nuxt/', 'nitro'],
    configFiles: ['nuxt.config.js', 'nuxt.config.ts'],
    directoryStructure: ['pages/', 'layouts/', 'middleware/'],
    minimumConfidence: 25
  },
  {
    name: 'Angular',
    language: 'typescript',
    category: 'frontend',
    ecosystem: 'web',
    filePatterns: ['*.component.ts', '*.service.ts', '*.module.ts'],
    contentPatterns: [
      /@Component|@Injectable|@NgModule/,
      /import.*from\s+['"]@angular\//,
      /selector:|templateUrl:|styleUrls:/
    ],
    dependencies: ['@angular/core', '@angular/common', '@angular/cli'],
    configFiles: ['angular.json', 'tsconfig.json'],
    directoryStructure: ['src/app/', 'src/environments/'],
    minimumConfidence: 40
  },
  {
    name: 'Svelte',
    language: 'javascript',
    category: 'frontend',
    ecosystem: 'web',
    filePatterns: ['*.svelte'],
    contentPatterns: [
      /import.*from\s+['"]svelte/,
      /<script>[\s\S]*<\/script>/,
      /\$:|on:|bind:/
    ],
    dependencies: ['svelte', '@sveltejs/'],
    configFiles: ['svelte.config.js', 'vite.config.js'],
    directoryStructure: ['src/lib/', 'src/routes/'],
    minimumConfidence: 70
  },

  // Backend Frameworks
  {
    name: 'Express.js',
    language: 'javascript',
    category: 'backend',
    ecosystem: 'web',
    filePatterns: ['app.js', 'server.js', 'index.js'],
    contentPatterns: [
      /require\(['"]express['"]\)|import.*from\s+['"]express['"]/,
      /app\.listen|app\.get|app\.post/,
      /express\(\)/
    ],
    dependencies: ['express'],
    configFiles: ['package.json'],
    directoryStructure: ['routes/', 'middleware/', 'controllers/'],
    minimumConfidence: 30
  },
  {
    name: 'NestJS',
    language: 'typescript',
    category: 'backend',
    ecosystem: 'web',
    filePatterns: ['*.controller.ts', '*.service.ts', '*.module.ts'],
    contentPatterns: [
      /@Controller|@Injectable|@Module/,
      /import.*from\s+['"]@nestjs\//,
      /@Get|@Post|@Put|@Delete/
    ],
    dependencies: ['@nestjs/core', '@nestjs/common'],
    configFiles: ['nest-cli.json', 'tsconfig.json'],
    directoryStructure: ['src/modules/', 'src/controllers/', 'src/services/'],
    minimumConfidence: 30
  },
  {
    name: 'Fastify',
    language: 'javascript',
    category: 'backend',
    ecosystem: 'web',
    filePatterns: ['app.js', 'server.js'],
    contentPatterns: [
      /require\(['"]fastify['"]\)|import.*from\s+['"]fastify['"]/,
      /fastify\(\)/,
      /fastify\.register|fastify\.listen/
    ],
    dependencies: ['fastify', '@fastify/'],
    configFiles: ['package.json'],
    directoryStructure: ['routes/', 'plugins/'],
    minimumConfidence: 75
  },
  {
    name: 'Django',
    language: 'python',
    category: 'fullstack',
    ecosystem: 'web',
    filePatterns: ['manage.py', 'settings.py', 'urls.py', 'models.py'],
    contentPatterns: [
      /from django import|import django/,
      /django\.conf|django\.urls/,
      /class.*\(models\.Model\)/
    ],
    dependencies: ['Django', 'django'],
    configFiles: ['requirements.txt', 'pyproject.toml', 'setup.py'],
    directoryStructure: ['apps/', 'templates/', 'static/'],
    minimumConfidence: 20
  },
  {
    name: 'Flask',
    language: 'python',
    category: 'backend',
    ecosystem: 'web',
    filePatterns: ['app.py', 'main.py', 'run.py'],
    contentPatterns: [
      /from flask import|import flask/,
      /Flask\(__name__\)/,
      /@app\.route/
    ],
    dependencies: ['Flask', 'flask'],
    configFiles: ['requirements.txt', 'pyproject.toml'],
    directoryStructure: ['templates/', 'static/'],
    minimumConfidence: 30
  },
  {
    name: 'FastAPI',
    language: 'python',
    category: 'backend',
    ecosystem: 'web',
    filePatterns: ['main.py', 'app.py'],
    contentPatterns: [
      /from fastapi import|import fastapi/,
      /FastAPI\(\)/,
      /@app\.get|@app\.post/
    ],
    dependencies: ['fastapi', 'uvicorn'],
    configFiles: ['requirements.txt', 'pyproject.toml'],
    directoryStructure: ['routers/', 'models/'],
    minimumConfidence: 80
  },
  {
    name: 'Spring Boot',
    language: 'java',
    category: 'backend',
    ecosystem: 'web',
    filePatterns: ['Application.java', '*.java'],
    contentPatterns: [
      /@SpringBootApplication/,
      /import org\.springframework/,
      /@RestController|@Controller/
    ],
    dependencies: ['spring-boot-starter', 'springframework'],
    configFiles: ['pom.xml', 'build.gradle', 'application.properties'],
    directoryStructure: ['src/main/java/', 'src/main/resources/'],
    minimumConfidence: 40
  },
  {
    name: 'Laravel',
    language: 'php',
    category: 'fullstack',
    ecosystem: 'web',
    filePatterns: ['artisan', '*.php'],
    contentPatterns: [
      /use Illuminate\\/,
      /namespace App\\/,
      /Route::|Eloquent/
    ],
    dependencies: ['laravel/framework'],
    configFiles: ['composer.json', 'artisan'],
    directoryStructure: ['app/', 'resources/', 'routes/'],
    minimumConfidence: 80
  },

  // Mobile Frameworks
  {
    name: 'React Native',
    language: 'javascript',
    category: 'mobile',
    ecosystem: 'mobile',
    filePatterns: ['App.js', 'App.tsx', 'index.js'],
    contentPatterns: [
      /import.*from\s+['"]react-native['"]/,
      /AppRegistry\.registerComponent/,
      /StyleSheet\.create/
    ],
    dependencies: ['react-native', '@react-native/'],
    configFiles: ['metro.config.js', 'app.json'],
    directoryStructure: ['android/', 'ios/'],
    minimumConfidence: 25
  },
  {
    name: 'Flutter',
    language: 'dart',
    category: 'mobile',
    ecosystem: 'mobile',
    filePatterns: ['*.dart', 'main.dart'],
    contentPatterns: [
      /import 'package:flutter\//,
      /class.*extends StatelessWidget|StatefulWidget/,
      /Widget build\(BuildContext context\)/
    ],
    dependencies: ['flutter'],
    configFiles: ['pubspec.yaml'],
    directoryStructure: ['lib/', 'android/', 'ios/'],
    minimumConfidence: 40
  },
  {
    name: 'Ionic',
    language: 'javascript',
    category: 'mobile',
    ecosystem: 'mobile',
    filePatterns: ['ionic.config.json', '*.page.ts'],
    contentPatterns: [
      /import.*from\s+['"]@ionic\//,
      /IonicModule|IonicPage/,
      /ion-/
    ],
    dependencies: ['@ionic/angular', '@ionic/react', '@ionic/vue'],
    configFiles: ['ionic.config.json', 'capacitor.config.ts'],
    directoryStructure: ['src/pages/', 'src/components/'],
    minimumConfidence: 80
  }
];

export class FrameworkDetectionEngine {
  private patterns: FrameworkPattern[] = FRAMEWORK_PATTERNS;

  /**
   * Detect frameworks in a codebase
   */
  public detectFrameworks(
    files: { filename: string; content: string }[],
    dependencies?: DependencyInfo[]
  ): FrameworkDetectionResult {
    const detectedFrameworks: FrameworkInfo[] = [];
    const filenames = files.map(f => f.filename.toLowerCase());
    const allContent = files.map(f => f.content).join('\n');

    for (const pattern of this.patterns) {
      const confidence = this.calculateFrameworkConfidence(pattern, filenames, allContent, dependencies);
      
      if (confidence >= pattern.minimumConfidence) {
        detectedFrameworks.push({
          name: pattern.name,
          language: pattern.language,
          confidence,
          category: pattern.category,
          ecosystem: pattern.ecosystem
        });
      }
    }

    // Sort by confidence and remove duplicates
    const uniqueFrameworks = this.deduplicateFrameworks(detectedFrameworks);
    
    return {
      frameworks: uniqueFrameworks.sort((a, b) => b.confidence - a.confidence),
      dependencies: dependencies || [],
      confidence: uniqueFrameworks.length > 0 ? Math.max(...uniqueFrameworks.map(f => f.confidence)) : 0,
      detectionMethod: this.determineDetectionMethod(uniqueFrameworks, dependencies)
    };
  }

  /**
   * Calculate confidence score for a framework pattern
   */
  private calculateFrameworkConfidence(
    pattern: FrameworkPattern,
    filenames: string[],
    content: string,
    dependencies?: DependencyInfo[]
  ): number {
    let confidence = 0;

    // File pattern matching (30% weight)
    const fileMatches = this.matchFilePatterns(pattern.filePatterns, filenames);
    confidence += (fileMatches / pattern.filePatterns.length) * 30;

    // Content pattern matching (25% weight)
    const contentMatches = pattern.contentPatterns.filter(regex => regex.test(content)).length;
    confidence += (contentMatches / pattern.contentPatterns.length) * 25;

    // Dependency matching (25% weight)
    if (dependencies && pattern.dependencies.length > 0) {
      const depMatches = this.matchDependencies(pattern.dependencies, dependencies);
      confidence += (depMatches / pattern.dependencies.length) * 25;
    }

    // Config file matching (10% weight)
    const configMatches = this.matchFilePatterns(pattern.configFiles, filenames);
    confidence += (configMatches / Math.max(1, pattern.configFiles.length)) * 10;

    // Directory structure matching (10% weight)
    const structureMatches = this.matchDirectoryStructure(pattern.directoryStructure, filenames);
    confidence += (structureMatches / Math.max(1, pattern.directoryStructure.length)) * 10;





    return Math.min(100, Math.round(confidence));
  }

  private matchFilePatterns(patterns: string[], filenames: string[]): number {
    let matches = 0;
    for (const pattern of patterns) {
      // Convert glob pattern to regex - handle file extensions and directory patterns properly
      let regexPattern = pattern;
      if (pattern.startsWith('*.')) {
        // For patterns like *.jsx, match any file ending with .jsx
        const extension = pattern.substring(2); // Remove the *.
        regexPattern = `.*\\.${extension}$`;
      } else if (pattern.includes('/**')) {
        // For patterns like pages/**, match any file in that directory
        const dirPath = pattern.replace('/**', '');
        regexPattern = `^${dirPath}/.*`;
      } else if (pattern.includes('**')) {
        // For patterns like **/*.ts, match any file with that pattern
        regexPattern = pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*').replace(/\./g, '\\.');
      } else {
        // For other patterns, replace * with .* and escape dots
        regexPattern = pattern.replace(/\*/g, '.*').replace(/\./g, '\\.');
      }

      const regex = new RegExp(regexPattern, 'i'); // Case insensitive
      if (filenames.some(filename => regex.test(filename))) {
        matches++;
      }
    }
    return matches;
  }

  private matchDependencies(requiredDeps: string[], actualDeps: DependencyInfo[]): number {
    let matches = 0;
    const depNames = actualDeps.map(dep => dep.name.toLowerCase());
    
    for (const required of requiredDeps) {
      if (depNames.some(name => name.includes(required.toLowerCase()))) {
        matches++;
      }
    }
    return matches;
  }

  private matchDirectoryStructure(requiredStructure: string[], filenames: string[]): number {
    let matches = 0;
    for (const structure of requiredStructure) {
      if (filenames.some(filename => filename.includes(structure.toLowerCase()))) {
        matches++;
      }
    }
    return matches;
  }

  private deduplicateFrameworks(frameworks: FrameworkInfo[]): FrameworkInfo[] {
    const seen = new Set<string>();
    return frameworks.filter(framework => {
      const key = `${framework.name}-${framework.language}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  private determineDetectionMethod(
    frameworks: FrameworkInfo[],
    dependencies?: DependencyInfo[]
  ): FrameworkDetectionResult['detectionMethod'] {
    if (frameworks.length === 0) return 'hybrid';
    if (dependencies && dependencies.length > 0) return 'dependency';
    return 'hybrid';
  }

  /**
   * Parse package.json dependencies
   */
  public parseDependencies(packageJsonContent: string): DependencyInfo[] {
    try {
      const packageJson = JSON.parse(packageJsonContent);
      const dependencies: DependencyInfo[] = [];

      // Regular dependencies
      if (packageJson.dependencies) {
        for (const [name, version] of Object.entries(packageJson.dependencies)) {
          dependencies.push({
            name,
            version: version as string,
            type: 'dependency',
            ecosystem: 'npm'
          });
        }
      }

      // Dev dependencies
      if (packageJson.devDependencies) {
        for (const [name, version] of Object.entries(packageJson.devDependencies)) {
          dependencies.push({
            name,
            version: version as string,
            type: 'devDependency',
            ecosystem: 'npm'
          });
        }
      }

      // Peer dependencies
      if (packageJson.peerDependencies) {
        for (const [name, version] of Object.entries(packageJson.peerDependencies)) {
          dependencies.push({
            name,
            version: version as string,
            type: 'peerDependency',
            ecosystem: 'npm'
          });
        }
      }

      return dependencies;
    } catch (error) {
      console.warn('Failed to parse package.json:', error);
      return [];
    }
  }

  /**
   * Add custom framework pattern
   */
  public addCustomPattern(pattern: FrameworkPattern): void {
    this.patterns.push(pattern);
  }

  /**
   * Get all supported frameworks
   */
  public getSupportedFrameworks(): string[] {
    return this.patterns.map(p => p.name);
  }
}
