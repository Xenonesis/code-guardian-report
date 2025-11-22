/**
 * Multi-Language Support Display Component
 * Shows comprehensive language support information and statistics
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Code2, 
  Shield, 
  CheckCircle2, 
  AlertTriangle,
  FileCode,
  Languages,
  TrendingUp,
  Zap
} from 'lucide-react';
import { multiLanguageSecurityAnalyzer } from '@/services/analysis/MultiLanguageSecurityAnalyzer';

interface LanguageStats {
  language: string;
  fileCount: number;
  lineCount: number;
  percentage: number;
  securityIssues: number;
  ruleCount: number;
}

interface MultiLanguageSupportDisplayProps {
  languageStats?: LanguageStats[];
  totalFiles?: number;
  totalLines?: number;
  showFeatures?: boolean;
}

const SUPPORTED_LANGUAGES = [
  {
    name: 'JavaScript',
    icon: '🟨',
    extensions: ['.js', '.jsx', '.mjs', '.cjs'],
    color: 'bg-yellow-500',
    ecosystem: 'Web'
  },
  {
    name: 'TypeScript',
    icon: '🔷',
    extensions: ['.ts', '.tsx', '.d.ts'],
    color: 'bg-blue-500',
    ecosystem: 'Web'
  },
  {
    name: 'Python',
    icon: '🐍',
    extensions: ['.py', '.pyw', '.pyi'],
    color: 'bg-blue-600',
    ecosystem: 'Backend / Data Science'
  },
  {
    name: 'Java',
    icon: '☕',
    extensions: ['.java'],
    color: 'bg-red-600',
    ecosystem: 'Enterprise / Backend'
  },
  {
    name: 'C++',
    icon: '⚙️',
    extensions: ['.cpp', '.cxx', '.cc', '.hpp'],
    color: 'bg-purple-600',
    ecosystem: 'Systems / Performance'
  },
  {
    name: 'C',
    icon: '🔧',
    extensions: ['.c', '.h'],
    color: 'bg-gray-600',
    ecosystem: 'Systems / Embedded'
  },
  {
    name: 'Go',
    icon: '🐹',
    extensions: ['.go'],
    color: 'bg-cyan-500',
    ecosystem: 'Backend / Cloud'
  },
  {
    name: 'Rust',
    icon: '🦀',
    extensions: ['.rs'],
    color: 'bg-orange-600',
    ecosystem: 'Systems / WebAssembly'
  },
  {
    name: 'PHP',
    icon: '🐘',
    extensions: ['.php', '.phtml'],
    color: 'bg-indigo-600',
    ecosystem: 'Web / Backend'
  },
  {
    name: 'C#',
    icon: '💜',
    extensions: ['.cs', '.csx'],
    color: 'bg-purple-700',
    ecosystem: 'Enterprise / Gaming'
  },
  {
    name: 'Ruby',
    icon: '💎',
    extensions: ['.rb', '.rake'],
    color: 'bg-red-500',
    ecosystem: 'Web / Backend'
  },
  {
    name: 'Swift',
    icon: '🦅',
    extensions: ['.swift'],
    color: 'bg-orange-500',
    ecosystem: 'iOS / macOS'
  },
  {
    name: 'Kotlin',
    icon: '🤖',
    extensions: ['.kt', '.kts'],
    color: 'bg-purple-500',
    ecosystem: 'Android / Backend'
  }
];

const SECURITY_FEATURES = [
  {
    title: 'Code Injection Detection',
    description: 'Identifies eval(), exec(), and dynamic code execution',
    languages: ['All'],
    icon: Shield
  },
  {
    title: 'SQL Injection Prevention',
    description: 'Detects unsafe SQL query construction',
    languages: ['JavaScript', 'Python', 'Java', 'PHP', 'Go', 'C#'],
    icon: AlertTriangle
  },
  {
    title: 'XSS Vulnerability Scanning',
    description: 'Finds DOM manipulation and HTML injection risks',
    languages: ['JavaScript', 'TypeScript', 'PHP'],
    icon: Shield
  },
  {
    title: 'Buffer Overflow Detection',
    description: 'Identifies unsafe memory operations',
    languages: ['C', 'C++'],
    icon: AlertTriangle
  },
  {
    title: 'Command Injection Checks',
    description: 'Detects unsafe system command execution',
    languages: ['Python', 'PHP', 'Go', 'Java'],
    icon: Shield
  },
  {
    title: 'Deserialization Vulnerabilities',
    description: 'Identifies insecure object deserialization',
    languages: ['Java', 'Python', 'C#', 'PHP'],
    icon: AlertTriangle
  },
  {
    title: 'Cryptographic Weaknesses',
    description: 'Detects weak encryption algorithms',
    languages: ['Java', 'C#', 'Go'],
    icon: Shield
  },
  {
    title: 'Memory Safety Analysis',
    description: 'Unsafe code blocks and pointer operations',
    languages: ['Rust', 'C++', 'C'],
    icon: Zap
  }
];

export const MultiLanguageSupportDisplay: React.FC<MultiLanguageSupportDisplayProps> = ({
  languageStats = [],
  totalFiles = 0,
  totalLines = 0,
  showFeatures = true
}) => {
  const analyzer = multiLanguageSecurityAnalyzer;

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="w-8 h-8 text-primary" />
              <div>
                <CardTitle className="text-2xl">Multi-Language Security Analysis</CardTitle>
                <CardDescription>
                  Comprehensive security scanning across 10+ programming languages
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <TrendingUp className="w-4 h-4 mr-2" />
              3-5x Market Reach
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Code2 className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Supported Languages
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{SUPPORTED_LANGUAGES.length}</p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                JavaScript, TypeScript, Python, Java, C++, C, Go, Rust, PHP, C#, Ruby, Swift, Kotlin
              </p>
            </div>
            
            <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span className="font-semibold text-green-900 dark:text-green-100">
                  Security Rules
                </span>
              </div>
              <p className="text-3xl font-bold text-green-600">170+</p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Language-specific vulnerability patterns
              </p>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-950 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <FileCode className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900 dark:text-purple-100">
                  Files Analyzed
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-600">{totalFiles}</p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                {totalLines.toLocaleString()} lines of code scanned
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supported Languages Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5" />
            Supported Programming Languages
          </CardTitle>
          <CardDescription>
            Full security analysis coverage across major programming ecosystems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const ruleCount = analyzer.getRuleCountForLanguage(lang.name.toLowerCase() as any);
              const stats = languageStats.find(s => s.language.toLowerCase() === lang.name.toLowerCase());
              
              return (
                <Card key={lang.name} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{lang.icon}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{lang.name}</h3>
                          <p className="text-xs text-muted-foreground">{lang.ecosystem}</p>
                        </div>
                      </div>
                      {stats && (
                        <Badge variant="secondary">{stats.fileCount} files</Badge>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Security Rules:</span>
                        <span className="font-semibold">{ruleCount}</span>
                      </div>
                      
                      {stats && (
                        <>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Code Coverage:</span>
                            <span className="font-semibold">{stats.percentage.toFixed(1)}%</span>
                          </div>
                          <Progress value={stats.percentage} className="h-2" />
                          
                          {stats.securityIssues > 0 && (
                            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400">
                              <AlertTriangle className="w-4 h-4" />
                              <span>{stats.securityIssues} issues found</span>
                            </div>
                          )}
                        </>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-2">
                        {lang.extensions.map(ext => (
                          <Badge key={ext} variant="outline" className="text-xs">
                            {ext}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      {showFeatures && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Language-Specific Security Features
            </CardTitle>
            <CardDescription>
              Advanced vulnerability detection tailored to each language's unique risks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SECURITY_FEATURES.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-primary mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{feature.title}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {feature.description}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {feature.languages.slice(0, 4).map((lang) => (
                            <Badge key={lang} variant="secondary" className="text-xs">
                              {lang}
                            </Badge>
                          ))}
                          {feature.languages.length > 4 && (
                            <Badge variant="secondary" className="text-xs">
                              +{feature.languages.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Benefits Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle>Why Multi-Language Support Matters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                <h4 className="font-semibold">Broader Market Appeal</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Expand beyond web developers to backend, systems, and enterprise developers
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-6 h-6 text-green-600" />
                <h4 className="font-semibold">Comprehensive Security</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Language-specific vulnerability detection with tailored security rules
              </p>
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-6 h-6 text-purple-600" />
                <h4 className="font-semibold">Faster Analysis</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Optimized parsers and analyzers for each programming language
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiLanguageSupportDisplay;
