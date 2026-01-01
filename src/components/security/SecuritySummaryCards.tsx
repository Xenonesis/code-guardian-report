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
      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-4 md:gap-6">
        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`bg-gradient-to-br ${getScoreBgColor(results.summary.securityScore)} hover:shadow-md transition-shadow duration-200 cursor-help`}
            >
              <CardContent className="p-4 sm:p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 bg-gradient-to-br ${getScoreColor(results.summary.securityScore)} rounded-lg flex-shrink-0`}
                  >
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-2xl font-bold ${getScoreTextColor(results.summary.securityScore)} truncate`}
                    >
                      {results.summary.securityScore}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                      Security Score
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">Security Score (0-100)</p>
            <p className="text-xs mt-1">
              Calculated based on severity and density of security issues.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200 dark:border-red-800 hover:shadow-md transition-shadow duration-200 cursor-help">
              <CardContent className="p-4 sm:p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500 rounded-lg flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-2xl font-bold text-red-800 dark:text-red-200 truncate">
                      {results.summary.criticalIssues +
                        results.summary.highIssues}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 truncate">
                      Critical & High
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-semibold">Critical & High Priority Issues</p>
            <p className="text-xs mt-1">
              Critical: {results.summary.criticalIssues} | High:{" "}
              {results.summary.highIssues}
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200 dark:border-blue-800 hover:shadow-md transition-shadow duration-200 cursor-help">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
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
            <p className="text-xs mt-1">
              Vulnerabilities per 1,000 lines of code. Lower is better.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`bg-gradient-to-br ${
                secretIssues.length > 0
                  ? "from-orange-50 to-orange-100 dark:from-orange-950/20 dark:to-orange-900/20 border-orange-200 dark:border-orange-800"
                  : "from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 border-green-200 dark:border-green-800"
              } hover:shadow-md transition-shadow duration-200 cursor-help`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${secretIssues.length > 0 ? "bg-orange-500" : "bg-green-500"}`}
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
            <p className="text-xs mt-1">
              API keys, passwords, and sensitive data found in code.
            </p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Card
              className={`bg-gradient-to-br ${getScoreBgColor(results.summary.qualityScore)} hover:shadow-md transition-shadow duration-200 cursor-help`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 bg-gradient-to-br ${getScoreColor(results.summary.qualityScore)} rounded-lg`}
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
            <p className="text-xs mt-1">
              Overall quality based on maintainability and best practices.
            </p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};
