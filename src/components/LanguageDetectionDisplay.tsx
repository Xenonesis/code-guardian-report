import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Code2, 
  Layers, 
  Package, 
  Settings, 
  Zap, 
  FileCode,
  Globe,
  Smartphone,
  Monitor,
  Database,
  Cloud
} from 'lucide-react';
import { DetectionResult, LanguageInfo, FrameworkInfo } from '@/services/languageDetectionService';

interface LanguageDetectionDisplayProps {
  detectionResult: DetectionResult;
  className?: string;
}

const getLanguageIcon = (language: string) => {
  switch (language.toLowerCase()) {
    case 'javascript':
    case 'typescript':
      return '🟨';
    case 'python':
      return '🐍';
    case 'java':
      return '☕';
    case 'php':
      return '🐘';
    case 'ruby':
      return '💎';
    case 'go':
      return '🐹';
    case 'rust':
      return '🦀';
    case 'csharp':
      return '🔷';
    case 'cpp':
    case 'c':
      return '⚙️';
    default:
      return '📄';
  }
};

const getFrameworkIcon = (framework: string) => {
  switch (framework.toLowerCase()) {
    case 'react':
    case 'next.js':
      return '⚛️';
    case 'vue.js':
    case 'nuxt.js':
      return '💚';
    case 'angular':
      return '🅰️';
    case 'svelte':
    case 'sveltekit':
      return '🧡';
    case 'django':
      return '🎸';
    case 'flask':
    case 'fastapi':
      return '🐍';
    case 'spring boot':
      return '🍃';
    case 'express.js':
    case 'nestjs':
      return '🚀';
    case 'laravel':
      return '🎭';
    case 'react native':
      return '📱';
    case 'flutter':
      return '🦋';
    case 'ionic':
      return '⚡';
    default:
      return '🔧';
  }
};

const getEcosystemIcon = (ecosystem: string) => {
  switch (ecosystem) {
    case 'web':
      return <Globe className="h-4 w-4" />;
    case 'mobile':
      return <Smartphone className="h-4 w-4" />;
    case 'desktop':
      return <Monitor className="h-4 w-4" />;
    case 'backend':
      return <Database className="h-4 w-4" />;
    case 'cloud':
      return <Cloud className="h-4 w-4" />;
    default:
      return <Code2 className="h-4 w-4" />;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'bg-green-500';
  if (confidence >= 60) return 'bg-yellow-500';
  if (confidence >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};

const getProjectTypeColor = (type: string) => {
  switch (type) {
    case 'web':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'mobile':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'desktop':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'library':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    case 'microservice':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
    case 'monorepo':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export const LanguageDetectionDisplay: React.FC<LanguageDetectionDisplayProps> = ({
  detectionResult,
  className = ''
}) => {
  const {
    primaryLanguage,
    allLanguages,
    frameworks,
    projectStructure,
    buildTools,
    packageManagers,
    totalFiles,
    analysisTime
  } = detectionResult;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header with Better Spacing */}
      <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30">
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-yellow-500 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">Language Detection Results</span>
            </CardTitle>
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-slate-800/60">
                <FileCode className="h-4 w-4" />
                <span>{totalFiles} files</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/60 dark:bg-slate-800/60">
                <Zap className="h-4 w-4" />
                <span>{analysisTime}ms</span>
              </div>
            </div>
          </div>
          <CardDescription className="text-base text-slate-700 dark:text-slate-300">
            Advanced pattern recognition and file analysis completed successfully
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Primary Language */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Primary Language
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getLanguageIcon(primaryLanguage.name)}</span>
              <div>
                <h3 className="font-semibold text-lg capitalize">{primaryLanguage.name}</h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  {getEcosystemIcon(primaryLanguage.ecosystem || 'web')}
                  {primaryLanguage.ecosystem || 'General Purpose'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">{primaryLanguage.confidence}%</div>
              <Progress 
                value={primaryLanguage.confidence} 
                className="w-24 h-2 mt-1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All Languages */}
      {allLanguages.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              All Detected Languages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allLanguages.map((language, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getLanguageIcon(language.name)}</span>
                    <div>
                      <span className="font-medium capitalize">{language.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {language.category} • {language.ecosystem || 'general'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{language.confidence}%</div>
                    <div className={`w-16 h-1 rounded-full ${getConfidenceColor(language.confidence)}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Frameworks */}
      {frameworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Detected Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {frameworks.map((framework, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getFrameworkIcon(framework.name)}</span>
                    <div>
                      <span className="font-medium">{framework.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {framework.category} • {framework.language}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{framework.confidence}%</div>
                    <Badge variant="outline" className="text-xs">
                      {framework.ecosystem}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            Project Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Project Type:</span>
            <Badge className={getProjectTypeColor(projectStructure.type)}>
              {projectStructure.type}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="font-medium">Confidence:</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold">{projectStructure.confidence}%</span>
              <Progress value={projectStructure.confidence} className="w-20 h-2" />
            </div>
          </div>

          {projectStructure.indicators.length > 0 && (
            <div>
              <span className="font-medium">Indicators:</span>
              <div className="mt-2 space-y-1">
                {projectStructure.indicators.map((indicator, index) => (
                  <div key={index} className="text-sm text-muted-foreground flex items-center gap-1">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    {indicator}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Build Tools & Package Managers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {buildTools.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Build Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {buildTools.map((tool, index) => (
                  <Badge key={index} variant="secondary">
                    {tool}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {packageManagers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Package Managers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {packageManagers.map((manager, index) => (
                  <Badge key={index} variant="outline">
                    {manager}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
