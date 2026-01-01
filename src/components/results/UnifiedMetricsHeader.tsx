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
      <div className="mb-6 rounded-2xl border border-slate-200/70 dark:border-slate-700/60 bg-white/95 dark:bg-slate-900/80 shadow-sm backdrop-blur-sm">
        <div className="flex items-center justify-center md:justify-between px-3 sm:px-6 py-4 sm:py-5 border-b border-slate-200/60 dark:border-slate-700/60">
          <div className="flex items-center justify-center md:justify-start gap-2 sm:gap-3">
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md">
              <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex md:hidden flex-col items-start leading-tight">
              <span className="text-sm font-bold bg-gradient-to-r from-slate-900 to-blue-900 dark:from-white dark:to-blue-100 bg-clip-text text-transparent">
                Code Guardian
              </span>
              <span className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-slate-400 font-medium">
                Security Analysis
              </span>
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                Executive Summary
              </span>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Security Analysis Overview
              </h3>
            </div>
          </div>
          <div className="hidden md:flex flex-col items-end text-sm text-slate-500 dark:text-slate-400">
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

        <div className="px-3 sm:px-6 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {/* Security Score */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`bg-white/95 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 ${getScoreBgColor(results.summary.securityScore)} hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-help group`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getScoreColor(results.summary.securityScore)} shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <p
                        className={`text-lg sm:text-xl font-semibold ${getScoreTextColor(results.summary.securityScore)} tabular-nums`}
                      >
                        {results.summary.securityScore}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Security Score
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Security Score (0-100)</p>
                <p className="text-xs">
                  Based on severity and density of issues.
                </p>
                <div className="mt-2 text-xs space-y-0.5">
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
                <Card className="bg-white/95 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-help group ring-1 ring-inset ring-red-200/60 dark:ring-red-900/40">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-rose-500 shadow-sm group-hover:shadow-md transition-shadow">
                        <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-red-700 dark:text-red-300 tabular-nums">
                        {results.summary.criticalIssues +
                          results.summary.highIssues}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Critical & High
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Critical & High Priority</p>
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
                <Card className="bg-white/95 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-help group ring-1 ring-inset ring-blue-200/60 dark:ring-blue-900/40">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-500 shadow-sm group-hover:shadow-md transition-shadow">
                        <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-blue-700 dark:text-blue-300 tabular-nums">
                        {results.metrics.vulnerabilityDensity}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Vuln Density
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Vulnerability Density</p>
                <p className="text-xs">
                  Issues per 1,000 lines. Benchmark: &lt;5. Lower is better.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Secrets Found */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card
                  className={`bg-white/95 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-help group ring-1 ring-inset ${
                    secretIssues.length > 0
                      ? "border-orange-300 dark:border-orange-700 ring-amber-200/60 dark:ring-amber-900/40"
                      : "border-emerald-300 dark:border-emerald-700 ring-emerald-200/60 dark:ring-emerald-900/40"
                  }`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br ${secretIssues.length > 0 ? "from-orange-500 to-amber-500" : "from-green-500 to-emerald-500"} shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <Key className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <p
                        className={`text-lg sm:text-xl font-semibold ${
                          secretIssues.length > 0
                            ? "text-orange-700 dark:text-orange-300"
                            : "text-green-700 dark:text-green-300"
                        } tabular-nums`}
                      >
                        {secretIssues.length}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Secrets Found
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Exposed Secrets</p>
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
                  className={`bg-white/95 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 ${getScoreBgColor(results.summary.qualityScore)} hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-help group`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div
                        className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br ${getScoreColor(results.summary.qualityScore)} shadow-sm group-hover:shadow-md transition-shadow`}
                      >
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <p
                        className={`text-lg sm:text-xl font-semibold ${getScoreTextColor(results.summary.qualityScore)} tabular-nums`}
                      >
                        {results.summary.qualityScore}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Quality Score
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Code Quality Score (0-100)</p>
                <p className="text-xs">
                  Based on maintainability, complexity, and best practices.
                </p>
              </TooltipContent>
            </Tooltip>

            {/* Total Issues */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Card className="bg-white/95 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg hover:scale-[1.02] transition-all duration-300 cursor-help group ring-1 ring-inset ring-purple-200/60 dark:ring-purple-900/40">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-violet-600 shadow-sm group-hover:shadow-md transition-shadow">
                        <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                      </div>
                      <p className="text-lg sm:text-xl font-semibold text-purple-700 dark:text-purple-300 tabular-nums">
                        {results.issues.length}
                      </p>
                    </div>
                    <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                      Total Issues
                    </p>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p className="font-semibold mb-1">Total Issues</p>
                <p className="text-xs">
                  All security and quality concerns found.
                </p>
                <div className="mt-2 text-xs space-y-0.5">
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
