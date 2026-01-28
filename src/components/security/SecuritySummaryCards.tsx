import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, AlertTriangle, Target, TrendingUp, Key } from "lucide-react";
import { AnalysisResults } from "@/hooks/useAnalysis";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SecuritySummaryCardsProps {
  results: AnalysisResults;
}

export const SecuritySummaryCards: React.FC<SecuritySummaryCardsProps> = ({
  results,
}) => {
  // Calculate secret detection metrics
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
    if (score >= 80) return "text-green-800 dark:text-green-200";
    if (score >= 60) return "text-yellow-800 dark:text-yellow-200";
    if (score >= 40) return "text-orange-800 dark:text-orange-200";
    return "text-red-800 dark:text-red-200";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80)
      return "from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800";
    if (score >= 60)
      return "from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 border-yellow-200 dark:border-yellow-800";
    if (score >= 40)
      return "from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800";
    return "from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-200 dark:border-red-800";
  };

  return (
    <TooltipProvider>
      <div className="xs:grid-cols-2 grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`bg-gradient-to-br ${getScoreBgColor(results.summary.securityScore)} cursor-help transition-shadow duration-200 hover:shadow-md`}
            >
              <CardContent className="p-4 sm:p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`bg-gradient-to-br p-2 ${getScoreColor(results.summary.securityScore)} flex-shrink-0 rounded-lg`}
                  >
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-2xl font-bold ${getScoreTextColor(results.summary.securityScore)} truncate`}
                    >
                      {results.summary.securityScore}
                    </p>
                    <p className="truncate text-sm text-slate-600 dark:text-slate-400">
                      Security Score
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">Security Score (0-100)</p>
            <p className="mt-1 text-xs">
              Calculated based on severity and density of security issues.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help border-red-200 bg-gradient-to-br from-red-50 to-red-100 transition-shadow duration-200 hover:shadow-md dark:border-red-800 dark:from-red-950/20 dark:to-red-900/20">
              <CardContent className="p-4 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 rounded-lg bg-red-500 p-2">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-2xl font-bold text-red-800 dark:text-red-200">
                      {results.summary.criticalIssues +
                        results.summary.highIssues}
                    </p>
                    <p className="truncate text-sm text-red-600 dark:text-red-400">
                      Critical & High
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">Critical & High Priority Issues</p>
            <p className="mt-1 text-xs">
              Critical: {results.summary.criticalIssues} | High:{" "}
              {results.summary.highIssues}
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="cursor-help border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 transition-shadow duration-200 hover:shadow-md dark:border-blue-800 dark:from-blue-950/20 dark:to-blue-900/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-500 p-2">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-800 dark:text-blue-200">
                      {results.metrics.vulnerabilityDensity}
                    </p>
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Vuln/1000 Lines
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">Vulnerability Density</p>
            <p className="mt-1 text-xs">
              Vulnerabilities per 1,000 lines of code. Lower is better.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`bg-gradient-to-br ${
                secretIssues.length > 0
                  ? "border-orange-200 from-orange-50 to-orange-100 dark:border-orange-800 dark:from-orange-950/20 dark:to-orange-900/20"
                  : "border-green-200 from-green-50 to-green-100 dark:border-green-800 dark:from-green-950/20 dark:to-green-900/20"
              } cursor-help transition-shadow duration-200 hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`rounded-lg p-2 ${secretIssues.length > 0 ? "bg-orange-500" : "bg-green-500"}`}
                  >
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${
                        secretIssues.length > 0
                          ? "text-orange-800 dark:text-orange-200"
                          : "text-green-800 dark:text-green-200"
                      }`}
                    >
                      {secretIssues.length}
                    </p>
                    <p
                      className={`text-sm ${
                        secretIssues.length > 0
                          ? "text-orange-600 dark:text-orange-400"
                          : "text-green-600 dark:text-green-400"
                      }`}
                    >
                      Secrets Found
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">Exposed Secrets</p>
            <p className="mt-1 text-xs">
              API keys, passwords, and sensitive data found in code.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`bg-gradient-to-br ${getScoreBgColor(results.summary.qualityScore)} cursor-help transition-shadow duration-200 hover:shadow-md`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`bg-gradient-to-br p-2 ${getScoreColor(results.summary.qualityScore)} rounded-lg`}
                  >
                    <TrendingUp className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p
                      className={`text-2xl font-bold ${getScoreTextColor(results.summary.qualityScore)}`}
                    >
                      {results.summary.qualityScore}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Quality Score
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">Code Quality Score (0-100)</p>
            <p className="mt-1 text-xs">
              Overall quality based on maintainability and best practices.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
