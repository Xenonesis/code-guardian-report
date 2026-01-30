import React from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Code2, Zap, Info, CheckCircle, AlertCircle } from "lucide-react";
import { DetectionResult } from "@/services/detection/languageDetectionService";

interface LanguageDetectionSummaryProps {
  detectionResult: DetectionResult;
  className?: string;
  compact?: boolean;
}

const getLanguageBadge = (language: string) => {
  const normalized = language.toLowerCase();
  const map: Record<string, { label: string; color: string }> = {
    javascript: { label: "JS", color: "bg-yellow-500" },
    typescript: { label: "TS", color: "bg-blue-600" },
    python: { label: "PY", color: "bg-blue-500" },
    java: { label: "JAVA", color: "bg-red-600" },
    php: { label: "PHP", color: "bg-indigo-600" },
    ruby: { label: "RB", color: "bg-red-500" },
    go: { label: "GO", color: "bg-cyan-600" },
    rust: { label: "RS", color: "bg-orange-600" },
    csharp: { label: "C#", color: "bg-purple-600" },
  };
  const { label, color } = map[normalized] ?? {
    label: "CODE",
    color: "bg-slate-500",
  };

  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[10px] font-semibold text-white ${color}`}
    >
      {label}
    </span>
  );
};

const getFrameworkBadge = (framework: string) => {
  const normalized = framework.toLowerCase();
  const map: Record<string, { label: string; color: string }> = {
    react: { label: "React", color: "bg-cyan-600" },
    "next.js": { label: "Next", color: "bg-slate-900" },
    "vue.js": { label: "Vue", color: "bg-emerald-600" },
    "nuxt.js": { label: "Nuxt", color: "bg-emerald-700" },
    angular: { label: "Ng", color: "bg-red-600" },
    svelte: { label: "Svelte", color: "bg-orange-600" },
    django: { label: "Django", color: "bg-green-700" },
    flask: { label: "Flask", color: "bg-slate-700" },
    fastapi: { label: "FastAPI", color: "bg-teal-600" },
    "spring boot": { label: "Spring", color: "bg-green-600" },
    "express.js": { label: "Express", color: "bg-slate-600" },
    nestjs: { label: "Nest", color: "bg-red-500" },
    laravel: { label: "Laravel", color: "bg-red-700" },
  };
  const { label, color } = map[normalized] ?? {
    label: "FW",
    color: "bg-slate-500",
  };

  return (
    <span
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded px-1 text-[9px] font-semibold text-white ${color}`}
    >
      {label}
    </span>
  );
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return "text-green-600 dark:text-green-400";
  if (confidence >= 60) return "text-yellow-600 dark:text-yellow-400";
  if (confidence >= 40) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
};

const getConfidenceIcon = (confidence: number) => {
  if (confidence >= 80)
    return <CheckCircle className="h-3 w-3 text-green-500" />;
  if (confidence >= 60)
    return <AlertCircle className="h-3 w-3 text-yellow-500" />;
  return <AlertCircle className="h-3 w-3 text-orange-500" />;
};

export const LanguageDetectionSummary: React.FC<
  LanguageDetectionSummaryProps
> = ({ detectionResult, className = "", compact = false }) => {
  const {
    primaryLanguage,
    allLanguages,
    frameworks,
    projectStructure,
    totalFiles,
    analysisTime,
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
              <p>
                Analyzed {totalFiles} files in {analysisTime}ms
              </p>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center gap-1">
            {getLanguageBadge(primaryLanguage.name)}
            <span className="text-sm font-medium capitalize">
              {primaryLanguage.name}
            </span>
            <span
              className={`text-xs ${getConfidenceColor(primaryLanguage.confidence)}`}
            >
              {primaryLanguage.confidence}%
            </span>
          </div>

          {frameworks.length > 0 && (
            <div className="flex items-center gap-1">
              {getFrameworkBadge(frameworks[0].name)}
              <span className="text-sm">{frameworks[0].name}</span>
              {frameworks.length > 1 && (
                <Badge variant="outline" className="px-1 py-0 text-xs">
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
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-1.5 dark:bg-yellow-900/30">
                <Zap className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-foreground font-semibold">
                Language Detection
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                <Code2 className="h-3 w-3" />
                <span>{totalFiles} files</span>
              </div>
              <div className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 dark:bg-slate-800">
                <Zap className="h-3 w-3" />
                <span>{analysisTime}ms</span>
              </div>
            </div>
          </div>

          {/* Primary Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getLanguageBadge(primaryLanguage.name)}
              <div>
                <span className="font-medium capitalize">
                  {primaryLanguage.name}
                </span>
                <div className="text-muted-foreground text-xs">
                  Primary Language
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {getConfidenceIcon(primaryLanguage.confidence)}
              <span
                className={`font-medium ${getConfidenceColor(primaryLanguage.confidence)}`}
              >
                {primaryLanguage.confidence}%
              </span>
            </div>
          </div>

          {/* Additional Languages */}
          {allLanguages.length > 1 && (
            <div>
              <div className="text-muted-foreground mb-1 text-xs">
                Other Languages:
              </div>
              <div className="flex flex-wrap gap-1">
                {allLanguages.slice(1, 4).map((lang, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="outline" className="text-xs">
                          {getLanguageBadge(lang.name)} {lang.name}
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
              <div className="text-muted-foreground mb-1 text-xs">
                Frameworks:
              </div>
              <div className="flex flex-wrap gap-1">
                {frameworks.slice(0, 3).map((framework, index) => (
                  <TooltipProvider key={index}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs">
                          {getFrameworkBadge(framework.name)} {framework.name}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {framework.confidence}% confidence •{" "}
                          {framework.category}
                        </p>
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
            <span className="text-muted-foreground text-sm">Project Type:</span>
            <div className="flex items-center gap-1">
              <Badge variant="outline" className="text-xs">
                {projectStructure.type}
              </Badge>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground h-3 w-3" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{projectStructure.confidence}% confidence</p>
                    {projectStructure.indicators &&
                      projectStructure.indicators.length > 0 && (
                        <div className="mt-1">
                          <p className="font-medium">Indicators:</p>
                          <ul className="text-xs">
                            {projectStructure.indicators
                              .slice(0, 3)
                              .map((indicator, index) => (
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
