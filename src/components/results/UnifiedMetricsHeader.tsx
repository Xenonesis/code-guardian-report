import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Shield,
  AlertTriangle,
  Target,
  Key,
  TrendingUp,
  Info,
} from "lucide-react";
import { AnalysisResults } from "@/hooks/useAnalysis";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface UnifiedMetricsHeaderProps {
  results: AnalysisResults;
}

export const UnifiedMetricsHeader: React.FC<UnifiedMetricsHeaderProps> = ({
  results,
}) => {
  const secretIssues = results.issues.filter(
    (issue) => issue.category === "Secret Detection" || issue.type === "Secret"
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "from-green-500 to-emerald-500";
    if (score >= 60) return "from-yellow-500 to-orange-400";
    if (score >= 40) return "from-orange-500 to-red-400";
    return "from-red-500 to-rose-600";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-700 dark:text-green-300";
    if (score >= 60) return "text-yellow-700 dark:text-yellow-300";
    if (score >= 40) return "text-orange-700 dark:text-orange-300";
    return "text-red-700 dark:text-red-300";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) {
      return "border-green-300 dark:border-green-600 ring-1 ring-inset ring-green-200/60 dark:ring-green-900/40";
    }
    if (score >= 60) {
      return "border-amber-300 dark:border-amber-600 ring-1 ring-inset ring-amber-200/60 dark:ring-amber-900/40";
    }
    if (score >= 40) {
      return "border-orange-300 dark:border-orange-600 ring-1 ring-inset ring-orange-200/60 dark:ring-orange-900/40";
    }
    return "border-red-300 dark:border-red-600 ring-1 ring-inset ring-red-200/60 dark:ring-red-900/40";
  };

  return (
    <TooltipProvider>
      <div className="mb-6 rounded-2xl border border-slate-200/70 bg-white/95 shadow-sm backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/80">
        <div className="flex items-center justify-center border-b border-slate-200/60 px-3 py-4 sm:px-6 sm:py-5 md:justify-between dark:border-slate-700/60">
          <div className="flex items-center justify-center gap-2 sm:gap-3 md:justify-start">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md sm:h-11 sm:w-11">
              <Shield className="h-4 w-4 text-white sm:h-5 sm:w-5" />
            </div>
            <div className="flex flex-col items-start leading-tight md:hidden">
              <span className="bg-gradient-to-r from-slate-900 to-blue-900 bg-clip-text text-sm font-bold text-transparent dark:from-white dark:to-blue-100">
                Code Guardian
              </span>
              <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Security Analysis
              </span>
            </div>
            <div className="hidden flex-col md:flex">
              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                Executive Summary
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Security Analysis Overview
              </h3>
            </div>
          </div>
          <div className="hidden flex-col items-end text-sm text-slate-500 md:flex dark:text-slate-400">
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {results.totalFiles}
              </span>{" "}
              files
            </span>
            <span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                {results.summary.linesAnalyzed.toLocaleString()}
              </span>{" "}
              lines analyzed
            </span>
          </div>
        </div>

        <div className="px-3 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {/* Security Score */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`border border-slate-200/70 bg-white/95 dark:border-slate-700/60 dark:bg-slate-900/70 ${getScoreBgColor(results.summary.securityScore)} group cursor-help transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br sm:h-10 sm:w-10 ${getScoreColor(results.summary.securityScore)} shadow-sm transition-shadow group-hover:shadow-md`}
                      >
                        <Shield className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                      </div>
                      <p
                        className={`text-lg font-semibold sm:text-xl ${getScoreTextColor(results.summary.securityScore)} tabular-nums`}
                      >
                        {results.summary.securityScore}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Security Score
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="mb-1 font-semibold">Security Score (0-100)</p>
                <p className="text-xs">
                  Based on severity and density of issues.
                </p>
                <div className="mt-2 space-y-0.5 text-xs">
                  <p>• 80-100: Excellent</p>
                  <p>• 60-79: Good</p>
                  <p>• 40-59: Needs Work</p>
                  <p>• 0-39: Critical</p>
                </div>
              </TooltipContent>
            </Tooltip>

            {/* Critical & High Issues */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group cursor-help border border-slate-200/70 bg-white/95 ring-1 ring-red-200/60 transition-all duration-300 ring-inset hover:scale-[1.02] hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/70 dark:ring-red-900/40">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-sm transition-shadow group-hover:shadow-md sm:h-10 sm:w-10">
                        <AlertTriangle className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                      </div>
                      <p className="text-lg font-semibold text-red-700 tabular-nums sm:text-xl dark:text-red-300">
                        {results.summary.criticalIssues +
                          results.summary.highIssues}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Critical & High
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="mb-1 font-semibold">Critical & High Priority</p>
                <p className="text-xs">
                  Critical ({results.summary.criticalIssues}) + High (
                  {results.summary.highIssues}) severity issues requiring
                  immediate attention.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Vulnerability Density */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group cursor-help border border-slate-200/70 bg-white/95 ring-1 ring-blue-200/60 transition-all duration-300 ring-inset hover:scale-[1.02] hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/70 dark:ring-blue-900/40">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm transition-shadow group-hover:shadow-md sm:h-10 sm:w-10">
                        <Target className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                      </div>
                      <p className="text-lg font-semibold text-blue-700 tabular-nums sm:text-xl dark:text-blue-300">
                        {results.metrics.vulnerabilityDensity}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Vuln Density
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="mb-1 font-semibold">Vulnerability Density</p>
                <p className="text-xs">
                  Issues per 1,000 lines. Benchmark: &lt;5. Lower is better.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Secrets Found */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`group cursor-help border border-slate-200/70 bg-white/95 ring-1 transition-all duration-300 ring-inset hover:scale-[1.02] hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/70 ${
                    secretIssues.length > 0
                      ? "border-orange-300 ring-amber-200/60 dark:border-orange-700 dark:ring-amber-900/40"
                      : "border-emerald-300 ring-emerald-200/60 dark:border-emerald-700 dark:ring-emerald-900/40"
                  }`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br sm:h-10 sm:w-10 ${secretIssues.length > 0 ? "from-orange-500 to-amber-500" : "from-green-500 to-emerald-500"} shadow-sm transition-shadow group-hover:shadow-md`}
                      >
                        <Key className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                      </div>
                      <p
                        className={`text-lg font-semibold sm:text-xl ${
                          secretIssues.length > 0
                            ? "text-orange-700 dark:text-orange-300"
                            : "text-green-700 dark:text-green-300"
                        } tabular-nums`}
                      >
                        {secretIssues.length}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Secrets Found
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="mb-1 font-semibold">Exposed Secrets</p>
                <p className="text-xs">
                  API keys, passwords, tokens found in code. Should NEVER be
                  committed.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Quality Score */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`border border-slate-200/70 bg-white/95 dark:border-slate-700/60 dark:bg-slate-900/70 ${getScoreBgColor(results.summary.qualityScore)} group cursor-help transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br sm:h-10 sm:w-10 ${getScoreColor(results.summary.qualityScore)} shadow-sm transition-shadow group-hover:shadow-md`}
                      >
                        <TrendingUp className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                      </div>
                      <p
                        className={`text-lg font-semibold sm:text-xl ${getScoreTextColor(results.summary.qualityScore)} tabular-nums`}
                      >
                        {results.summary.qualityScore}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Quality Score
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="mb-1 font-semibold">Code Quality Score (0-100)</p>
                <p className="text-xs">
                  Based on maintainability, complexity, and best practices.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Total Issues */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="group cursor-help border border-slate-200/70 bg-white/95 ring-1 ring-purple-200/60 transition-all duration-300 ring-inset hover:scale-[1.02] hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-900/70 dark:ring-purple-900/40">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-sm transition-shadow group-hover:shadow-md sm:h-10 sm:w-10">
                        <Info className="h-4 w-4 text-white sm:h-5 sm:w-5" />
                      </div>
                      <p className="text-lg font-semibold text-purple-700 tabular-nums sm:text-xl dark:text-purple-300">
                        {results.issues.length}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold tracking-wide text-slate-500 uppercase dark:text-slate-400">
                      Total Issues
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="mb-1 font-semibold">Total Issues</p>
                <p className="text-xs">
                  All security and quality concerns found.
                </p>
                <div className="mt-2 space-y-0.5 text-xs">
                  <p>• Critical: {results.summary.criticalIssues}</p>
                  <p>• High: {results.summary.highIssues}</p>
                  <p>• Medium: {results.summary.mediumIssues}</p>
                  <p>• Low: {results.summary.lowIssues}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
