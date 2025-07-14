import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Code2, 
  Zap, 
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { DetectionResult } from '@/services/languageDetectionService';

interface LanguageDetectionSummaryProps {
  detectionResult: DetectionResult;
  className?: string;
  compact?: boolean;
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
    default:
      return '🔧';
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return 'text-green-600 dark:text-green-400';
  if (confidence >= 60) return 'text-yellow-600 dark:text-yellow-400';
  if (confidence >= 40) return 'text-orange-600 dark:text-orange-400';
  return 'text-red-600 dark:text-red-400';
};

const getConfidenceIcon = (confidence: number) => {
  if (confidence >= 80) return <CheckCircle className="h-3 w-3 text-green-500" />;
  if (confidence >= 60) return <AlertCircle className="h-3 w-3 text-yellow-500" />;
  return <AlertCircle className="h-3 w-3 text-orange-500" />;
};

export const LanguageDetectionSummary: React.FC<LanguageDetectionSummaryProps> = ({
  detectionResult,
  className = '',
  compact = false
}) => {
  const {
    primaryLanguage,
    allLanguages,
    frameworks,
    projectStructure,
    totalFiles,
    analysisTime
  } = detectionResult;

  if (compact) {
    return (
      <TooltipProvider>
        <div className={`flex items-center gap-2 ${className}`}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Smart Detection</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Analyzed {totalFiles} files in {analysisTime}ms</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1">
            <span className="text-sm">{getLanguageIcon(primaryLanguage.name)}</span>
            <span className="text-sm font-medium capitalize">{primaryLanguage.name}</span>
            <span className={`text-xs ${getConfidenceColor(primaryLanguage.confidence)}`}>
              {primaryLanguage.confidence}%
            </span>
          </div>

          {frameworks.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-sm">{getFrameworkIcon(frameworks[0].name)}</span>
              <span className="text-sm">{frameworks[0].name}</span>
              {frameworks.length > 1 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{frameworks.length - 1}
                </Badge>
              )}
            </div>
          )}

          <Badge variant="outline" className="text-xs">
            {projectStructure.type}
          </Badge>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Enhanced Header with Better Spacing */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="font-semibold text-slate-900 dark:text-white">Language Detection</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                <Code2 className="h-3 w-3" />
                <span>{totalFiles} files</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
                <Zap className="h-3 w-3" />
                <span>{analysisTime}ms</span>
              </div>
            </div>
          </div>

          {/* Primary Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getLanguageIcon(primaryLanguage.name)}</span>
              <div>
                <span className="font-medium capitalize">{primaryLanguage.name}</span>
                <div className="text-xs text-muted-foreground">Primary Language</div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {getConfidenceIcon(primaryLanguage.confidence)}
              <span className={`font-medium ${getConfidenceColor(primaryLanguage.confidence)}`}>
                {primaryLanguage.confidence}%
              </span>
            </div>
          </div>

          {/* Additional Languages */}
          {allLanguages.length > 1 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Other Languages:</div>
              <div className="flex flex-wrap gap-1">
                {allLanguages.slice(1, 4).map((lang, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs">
                          {getLanguageIcon(lang.name)} {lang.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{lang.confidence}% confidence</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {allLanguages.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{allLanguages.length - 4} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Frameworks */}
          {frameworks.length > 0 && (
            <div>
              <div className="text-xs text-muted-foreground mb-1">Frameworks:</div>
              <div className="flex flex-wrap gap-1">
                {frameworks.slice(0, 3).map((framework, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs">
                          {getFrameworkIcon(framework.name)} {framework.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{framework.confidence}% confidence • {framework.category}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
                {frameworks.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{frameworks.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Project Type */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Project Type:</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {projectStructure.type}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{projectStructure.confidence}% confidence</p>
                    {projectStructure.indicators && projectStructure.indicators.length > 0 && (
                      <div className="mt-1">
                        <p className="font-medium">Indicators:</p>
                        <ul className="text-xs">
                          {projectStructure.indicators.slice(0, 3).map((indicator, index) => (
                            <li key={index}>• {indicator}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
