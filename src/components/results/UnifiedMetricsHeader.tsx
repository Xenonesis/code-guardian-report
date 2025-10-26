import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, AlertTriangle, Target, Key, TrendingUp, FileText, Info } from 'lucide-react';
import { AnalysisResults } from '@/hooks/useAnalysis';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface UnifiedMetricsHeaderProps {
  results: AnalysisResults;
}

export const UnifiedMetricsHeader: React.FC<UnifiedMetricsHeaderProps> = ({ results }) => {
  // Calculate secret detection metrics
  const secretIssues = results.issues.filter(
    issue => issue.category === 'Secret Detection' || issue.type === 'Secret'
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-green-500 to-emerald-500';
    if (score >= 60) return 'from-yellow-500 to-orange-400';
    if (score >= 40) return 'from-orange-500 to-red-400';
    return 'from-red-500 to-rose-600';
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return 'text-green-800 dark:text-green-200';
    if (score >= 60) return 'text-yellow-800 dark:text-yellow-200';
    if (score >= 40) return 'text-orange-800 dark:text-orange-200';
    return 'text-red-800 dark:text-red-200';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800';
    if (score >= 60) return 'from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 border-yellow-200 dark:border-yellow-800';
    if (score >= 40) return 'from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 border-orange-200 dark:border-orange-800';
    return 'from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800';
  };

  return (
    <TooltipProvider>
      <div className="mb-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/50 dark:to-slate-800/50 rounded-xl p-4 sm:p-6 border-2 border-slate-200 dark:border-slate-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Analysis Summary
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              {results.totalFiles} files analyzed • {results.summary.linesAnalyzed.toLocaleString()} lines of code
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {/* Security Score */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={`bg-gradient-to-br ${getScoreBgColor(results.summary.securityScore)} hover:shadow-md transition-all duration-200 cursor-help`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${getScoreColor(results.summary.securityScore)} rounded-lg flex-shrink-0`}>
                      <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xl sm:text-2xl font-bold ${getScoreTextColor(results.summary.securityScore)} truncate`}>
                        {results.summary.securityScore}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Security Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Security Score (0-100)</p>
              <p className="text-xs">Calculated based on severity and density of security issues. Higher is better.</p>
              <div className="mt-2 text-xs space-y-1">
                <p>• 80-100: Excellent</p>
                <p>• 60-79: Good</p>
                <p>• 40-59: Needs Improvement</p>
                <p>• 0-39: Critical Action Required</p>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Critical & High Issues */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-200 dark:border-red-800 hover:shadow-md transition-all duration-200 cursor-help">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-red-500 to-rose-500 rounded-lg flex-shrink-0">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-red-800 dark:text-red-200 truncate">
                        {results.summary.criticalIssues + results.summary.highIssues}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Critical & High</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Critical & High Priority Issues</p>
              <p className="text-xs">Combined count of Critical ({results.summary.criticalIssues}) and High ({results.summary.highIssues}) severity security issues that require immediate attention.</p>
            </TooltipContent>
          </Tooltip>

          {/* Vulnerability Density */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800 hover:shadow-md transition-all duration-200 cursor-help">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg flex-shrink-0">
                      <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200 truncate">
                        {results.metrics.vulnerabilityDensity}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Vuln/1000 Lines</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Vulnerability Density</p>
              <p className="text-xs">Number of vulnerabilities per 1,000 lines of code. Industry benchmark is typically &lt;5. Lower is better.</p>
            </TooltipContent>
          </Tooltip>

          {/* Secrets Found */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={`bg-gradient-to-br ${secretIssues.length > 0
                ? 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800'
                : 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800'
              } hover:shadow-md transition-all duration-200 cursor-help`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${secretIssues.length > 0 ? 'from-orange-500 to-amber-500' : 'from-green-500 to-emerald-500'} rounded-lg flex-shrink-0`}>
                      <Key className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xl sm:text-2xl font-bold ${secretIssues.length > 0
                        ? 'text-orange-800 dark:text-orange-200'
                        : 'text-green-800 dark:text-green-200'
                      } truncate`}>
                        {secretIssues.length}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Secrets Found</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Exposed Secrets Detection</p>
              <p className="text-xs">API keys, passwords, tokens, and other sensitive data found in code. These should NEVER be committed to source code.</p>
            </TooltipContent>
          </Tooltip>

          {/* Quality Score */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={`bg-gradient-to-br ${getScoreBgColor(results.summary.qualityScore)} hover:shadow-md transition-all duration-200 cursor-help`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className={`p-1.5 sm:p-2 bg-gradient-to-br ${getScoreColor(results.summary.qualityScore)} rounded-lg flex-shrink-0`}>
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-xl sm:text-2xl font-bold ${getScoreTextColor(results.summary.qualityScore)} truncate`}>
                        {results.summary.qualityScore}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Quality Score</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Code Quality Score (0-100)</p>
              <p className="text-xs">Overall code quality based on maintainability, complexity, duplication, and best practices. Higher is better.</p>
            </TooltipContent>
          </Tooltip>

          {/* Total Issues */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800 hover:shadow-md transition-all duration-200 cursor-help">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-gradient-to-br from-purple-500 to-violet-500 rounded-lg flex-shrink-0">
                      <Info className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xl sm:text-2xl font-bold text-purple-800 dark:text-purple-200 truncate">
                        {results.issues.length}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Total Issues</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p className="font-semibold mb-1">Total Issues Detected</p>
              <p className="text-xs">All security issues, vulnerabilities, and code quality concerns found across all files.</p>
              <div className="mt-2 text-xs space-y-1">
                <p>• Critical: {results.summary.criticalIssues}</p>
                <p>• High: {results.summary.highIssues}</p>
                <p>• Medium: {results.summary.mediumIssues}</p>
                <p>• Low: {results.summary.lowIssues}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
};
