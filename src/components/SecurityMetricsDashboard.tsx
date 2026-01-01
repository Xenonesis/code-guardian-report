import React from "react";
import { Clock, FileText, Bug, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AnalysisResults } from "@/hooks/useAnalysis";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { SeverityChart } from "@/components/dashboard/SeverityChart";
import { OwaspChart } from "@/components/dashboard/OwaspChart";
import { SecurityRecommendations } from "@/components/dashboard/SecurityRecommendations";

interface SecurityMetricsDashboardProps {
  results: AnalysisResults;
}

export const SecurityMetricsDashboard: React.FC<
  SecurityMetricsDashboardProps
> = ({ results }) => {
  // Ensure quality score is a valid number
  const safeQualityScore =
    typeof results.summary.qualityScore === "number" &&
    !Number.isNaN(results.summary.qualityScore)
      ? results.summary.qualityScore
      : 0;

  const getQualityRating = (score: number): string => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 40) return "Poor";
    return "Critical";
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="mb-8 pb-6 border-b-2 border-slate-200/60 dark:border-slate-700/60">
          <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 dark:from-white dark:via-blue-100 dark:to-indigo-100 bg-clip-text text-transparent mb-3">
            Detailed Security Metrics
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
            In-depth analysis of security vulnerabilities, code quality metrics,
            and actionable recommendations
          </p>
        </div>

        {/* Key Metrics Grid - Focus on unique metrics not in header */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          <MetricsCard
            title="Technical Debt"
            value={results.metrics.technicalDebt}
            subtitle="estimated time to fix"
            icon={Clock}
            className="bg-purple-50 dark:bg-purple-900/20"
            iconClassName="text-purple-600"
            valueClassName="text-purple-600"
          />

          <MetricsCard
            title="Maintainability Index"
            value={results.metrics.maintainabilityIndex}
            subtitle="0-100 scale"
            icon={Bug}
            className="bg-indigo-50 dark:bg-indigo-900/20"
            iconClassName="text-indigo-600"
            valueClassName="text-indigo-600"
          />

          <MetricsCard
            title="Code Duplication"
            value={`${results.metrics.duplicatedLines}`}
            subtitle="lines duplicated"
            icon={Zap}
            className="bg-amber-50 dark:bg-amber-900/20"
            iconClassName="text-amber-600"
            valueClassName="text-amber-600"
          />
        </div>

        {/* Detailed Metrics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <SeverityChart
            criticalIssues={results.summary.criticalIssues}
            highIssues={results.summary.highIssues}
            mediumIssues={results.summary.mediumIssues}
            lowIssues={results.summary.lowIssues}
          />

          <OwaspChart issues={results.issues} />
        </div>

        {/* Analysis Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Coverage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Files Analyzed</span>
                <Badge variant="outline">{results.totalFiles}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Lines of Code</span>
                <Badge variant="outline">
                  {results.summary.linesAnalyzed.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Coverage</span>
                <Badge variant="outline">
                  {results.summary.coveragePercentage}%
                </Badge>
              </div>
              <Progress
                value={results.summary.coveragePercentage}
                className="h-2"
              />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50/50 dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/10 border-2 border-blue-200 dark:border-blue-800 shadow-xl hover:shadow-2xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                  <Bug className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">
                  Advanced Quality Metrics
                </span>
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2">
                Detailed code quality indicators and maintainability assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors">
                  <div>
                    <span className="text-sm font-medium">Quality Rating</span>
                    <p className="text-xs text-slate-500">
                      {getQualityRating(safeQualityScore)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-base font-bold">
                    {Math.round(safeQualityScore)}/100
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors">
                  <div>
                    <span className="text-sm font-medium">
                      Maintainability Index
                    </span>
                    <p className="text-xs text-slate-500">
                      Code maintainability score
                    </p>
                  </div>
                  <Badge variant="outline">
                    {results.metrics.maintainabilityIndex}
                  </Badge>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors">
                  <div>
                    <span className="text-sm font-medium">
                      Duplicated Lines
                    </span>
                    <p className="text-xs text-slate-500">
                      Lines of duplicated code
                    </p>
                  </div>
                  <Badge variant="outline">
                    {results.metrics.duplicatedLines}
                  </Badge>
                </div>
                {results.metrics.testCoverage && (
                  <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg hover:bg-white/70 dark:hover:bg-slate-800/70 transition-colors">
                    <div>
                      <span className="text-sm font-medium">Test Coverage</span>
                      <p className="text-xs text-slate-500">
                        Code covered by tests
                      </p>
                    </div>
                    <Badge variant="outline">
                      {results.metrics.testCoverage}%
                    </Badge>
                  </div>
                )}
              </div>
              <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-800 dark:text-blue-200 font-medium">
                  Quality Assessment: {getQualityRating(safeQualityScore)}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                  Based on complexity, maintainability, duplication, and
                  industry best practices
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Dependencies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {results.dependencies && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Dependencies</span>
                    <Badge variant="outline">
                      {results.dependencies.total}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Vulnerable</span>
                    <Badge variant="destructive">
                      {results.dependencies.vulnerable}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Outdated</span>
                    <Badge variant="secondary">
                      {results.dependencies.outdated}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Secure</span>
                    <Badge
                      variant="default"
                      className="bg-green-100 text-green-800"
                    >
                      {results.dependencies.total -
                        results.dependencies.vulnerable -
                        results.dependencies.outdated}
                    </Badge>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <SecurityRecommendations results={results} />
      </div>
    </TooltipProvider>
  );
};
