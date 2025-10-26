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
      <div className="mb-8 bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/40 dark:from-slate-900/95 dark:via-slate-800/90 dark:to-blue-950/30 rounded-3xl p-6 sm:p-8 border-2 border-slate-200/70 dark:border-slate-700/50 shadow-2xl hover:shadow-3xl transition-all duration-500 backdrop-blur-md">
        <div className="flex items-center justify-between mb-7">
          <div className="space-y-2.5">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300">
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              Analysis Overview
            </h3>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 font-semibold ml-14 tracking-tight">
              <span className="text-blue-700 dark:text-blue-400 font-bold">{results.totalFiles}</span> files • <span className="text-blue-700 dark:text-blue-400 font-bold">{results.summary.linesAnalyzed.toLocaleString()}</span> lines analyzed
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-5 lg:gap-6">
          {/* Security Score */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className={`bg-gradient-to-br ${getScoreBgColor(results.summary.securityScore)} hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-help border-2 group`}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${getScoreColor(results.summary.securityScore)} rounded-xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${getScoreTextColor(results.summary.securityScore)} tabular-nums`}>
                        {results.summary.securityScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Security Score</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Overall security rating</p>
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
              <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-200 dark:border-red-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-help group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 sm:p-2.5 bg-gradient-to-br from-red-500 to-rose-500 rounded-xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-red-800 dark:text-red-200 tabular-nums">
                        {results.summary.criticalIssues + results.summary.highIssues}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Critical & High</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Urgent issues found</p>
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
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-2 border-blue-200 dark:border-blue-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-help group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 sm:p-2.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-blue-800 dark:text-blue-200 tabular-nums">
                        {results.metrics.vulnerabilityDensity}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Vuln Density</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Per 1000 lines</p>
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
                ? 'from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-2 border-orange-200 dark:border-orange-800'
                : 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-2 border-green-200 dark:border-green-800'
              } hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-help group`}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${secretIssues.length > 0 ? 'from-orange-500 to-amber-500' : 'from-green-500 to-emerald-500'} rounded-xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <Key className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${secretIssues.length > 0
                        ? 'text-orange-800 dark:text-orange-200'
                        : 'text-green-800 dark:text-green-200'
                      } tabular-nums`}>
                        {secretIssues.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Secrets Found</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Exposed credentials</p>
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
              <Card className={`bg-gradient-to-br ${getScoreBgColor(results.summary.qualityScore)} hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-help border-2 group`}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 sm:p-2.5 bg-gradient-to-br ${getScoreColor(results.summary.qualityScore)} rounded-xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${getScoreTextColor(results.summary.qualityScore)} tabular-nums`}>
                        {results.summary.qualityScore}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Quality Score</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">Code quality rating</p>
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
              <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-2 border-purple-200 dark:border-purple-800 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-help group">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 sm:p-2.5 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                        <Info className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <p className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-purple-800 dark:text-purple-200 tabular-nums">
                        {results.issues.length}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">Total Issues</p>
                      <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 mt-0.5 font-medium">All findings</p>
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
