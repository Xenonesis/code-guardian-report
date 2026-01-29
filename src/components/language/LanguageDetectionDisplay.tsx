import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
  Cloud,
} from "lucide-react";
import { DetectionResult } from "@/services/detection/languageDetectionService";

interface LanguageDetectionDisplayProps {
  detectionResult: DetectionResult;
  className?: string;
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
    cpp: { label: "C++", color: "bg-purple-700" },
    c: { label: "C", color: "bg-gray-600" },
  };
  const { label, color } = map[normalized] ?? {
    label: "CODE",
    color: "bg-slate-500",
  };

  return (
    <span
      className={`inline-flex h-7 min-w-7 items-center justify-center rounded-md px-1 text-[11px] font-semibold text-white ${color}`}
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
    sveltekit: { label: "Svelte", color: "bg-orange-700" },
    django: { label: "Django", color: "bg-green-700" },
    flask: { label: "Flask", color: "bg-slate-700" },
    fastapi: { label: "FastAPI", color: "bg-teal-600" },
    "spring boot": { label: "Spring", color: "bg-green-600" },
    "express.js": { label: "Express", color: "bg-slate-600" },
    nestjs: { label: "Nest", color: "bg-red-500" },
    laravel: { label: "Laravel", color: "bg-red-700" },
    "react native": { label: "RN", color: "bg-indigo-600" },
    flutter: { label: "Flutter", color: "bg-blue-600" },
    ionic: { label: "Ionic", color: "bg-blue-700" },
  };
  const { label, color } = map[normalized] ?? {
    label: "FW",
    color: "bg-slate-500",
  };

  return (
    <span
      className={`inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1 text-[10px] font-semibold text-white ${color}`}
    >
      {label}
    </span>
  );
};

const getEcosystemIcon = (ecosystem: string) => {
  switch (ecosystem) {
    case "web":
      return <Globe className="h-4 w-4" />;
    case "mobile":
      return <Smartphone className="h-4 w-4" />;
    case "desktop":
      return <Monitor className="h-4 w-4" />;
    case "backend":
      return <Database className="h-4 w-4" />;
    case "cloud":
      return <Cloud className="h-4 w-4" />;
    default:
      return <Code2 className="h-4 w-4" />;
  }
};

const getConfidenceColor = (confidence: number) => {
  if (confidence >= 80) return "bg-green-500";
  if (confidence >= 60) return "bg-yellow-500";
  if (confidence >= 40) return "bg-orange-500";
  return "bg-red-500";
};

const getProjectTypeColor = (type: string) => {
  switch (type) {
    case "web":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
    case "mobile":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
    case "desktop":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
    case "library":
      return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300";
    case "microservice":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300";
    case "monorepo":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
  }
};

export const LanguageDetectionDisplay: React.FC<
  LanguageDetectionDisplayProps
> = ({ detectionResult, className = "" }) => {
  const {
    primaryLanguage,
    allLanguages,
    frameworks,
    projectStructure,
    buildTools,
    packageManagers,
    totalFiles,
    analysisTime,
  } = detectionResult;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Enhanced Header with Better Spacing */}
      <Card className="border-2 border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:border-yellow-800 dark:from-yellow-950/30 dark:to-amber-950/30">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-500 p-2 text-white">
                <Zap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Language Detection Results
              </span>
            </CardTitle>
            <div className="flex items-center gap-4 text-sm font-semibold text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 dark:bg-slate-800/60">
                <FileCode className="h-4 w-4" />
                <span>{totalFiles} files</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/60 px-3 py-1 dark:bg-slate-800/60">
                <Zap className="h-4 w-4" />
                <span>{analysisTime}ms</span>
              </div>
            </div>
          </div>
          <CardDescription className="text-base text-slate-700 dark:text-slate-300">
            Advanced pattern recognition and file analysis completed
            successfully
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
              {getLanguageBadge(primaryLanguage.name)}
              <div>
                <h3 className="text-lg font-semibold capitalize">
                  {primaryLanguage.name}
                </h3>
                <p className="text-muted-foreground flex items-center gap-1 text-sm">
                  {getEcosystemIcon(primaryLanguage.ecosystem || "web")}
                  {String(primaryLanguage.ecosystem || "General Purpose")}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">
                {primaryLanguage.confidence}%
              </div>
              <Progress
                value={primaryLanguage.confidence}
                className="mt-1 h-2 w-24"
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {allLanguages.map((language, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    {getLanguageBadge(language.name)}
                    <div>
                      <span className="font-medium capitalize">
                        {language.name}
                      </span>
                      <div className="text-muted-foreground text-xs">
                        {language.category} •{" "}
                        {String(language.ecosystem || "general")}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{language.confidence}%</div>
                    <div
                      className={`h-1 w-16 rounded-full ${getConfidenceColor(language.confidence)}`}
                    />
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
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {frameworks.map((framework, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    {getFrameworkBadge(framework.name)}
                    <div>
                      <span className="font-medium">{framework.name}</span>
                      <div className="text-muted-foreground text-xs">
                        {framework.category} • {framework.language}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{framework.confidence}%</div>
                    <Badge variant="outline" className="text-xs">
                      {String(framework.ecosystem)}
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
              <span className="font-semibold">
                {projectStructure.confidence}%
              </span>
              <Progress
                value={projectStructure.confidence}
                className="h-2 w-20"
              />
            </div>
          </div>

          {projectStructure.indicators.length > 0 && (
            <div>
              <span className="font-medium">Indicators:</span>
              <div className="mt-2 space-y-1">
                {projectStructure.indicators.map((indicator, index) => (
                  <div
                    key={index}
                    className="text-muted-foreground flex items-center gap-1 text-sm"
                  >
                    <div className="h-1 w-1 rounded-full bg-green-500" />
                    {indicator}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Build Tools & Package Managers */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
