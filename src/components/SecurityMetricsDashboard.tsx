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
        <div className="border-border/60 pb-6/60 mb-8 border-b-2">
          <h2 className="mb-3 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-3xl font-bold text-transparent sm:text-4xl dark:from-white dark:via-blue-100 dark:to-indigo-100">
            Detailed Security Metrics
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed font-medium sm:text-base">
            In-depth analysis of security vulnerabilities, code quality metrics,
            and actionable recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
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
            iconClassName="text-cyan-600"
            valueClassName="text-cyan-600"
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

        <div className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2">
          <SeverityChart
            criticalIssues={results.summary.criticalIssues}
            highIssues={results.summary.highIssues}
            mediumIssues={results.summary.mediumIssues}
            lowIssues={results.summary.lowIssues}
          />

          <OwaspChart issues={results.issues} />
        </div>

        {}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Coverage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Files Analyzed</span>
                <Badge variant="outline">{results.totalFiles}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Lines of Code</span>
                <Badge variant="outline">
                  {results.summary.linesAnalyzed.toLocaleString()}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
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

          <Card className="border-border bg-muted/50 dark:border-border border-2 shadow-xl transition-all duration-300 hover:shadow-2xl dark:from-blue-900/20 dark:via-indigo-900/15 dark:to-purple-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl">
                <div className="rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 p-2 shadow-lg">
                  <Bug className="h-5 w-5 text-white dark:text-white" />
                </div>
                <span className="text-foreground font-bold">
                  Advanced Quality Metrics
                </span>
              </CardTitle>
              <CardDescription className="mt-2 text-sm sm:text-base">
                Detailed code quality indicators and maintainability assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="bg-card/50 hover:bg-card/70/50/70 flex items-center justify-between rounded-lg p-3 transition-colors">
                  <div>
                    <span className="text-sm font-medium">Quality Rating</span>
                    <p className="text-muted-foreground text-xs">
                      {getQualityRating(safeQualityScore)}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-base font-bold">
                    {Math.round(safeQualityScore)}/100
                  </Badge>
                </div>
                <div className="bg-card/50 hover:bg-card/70/50/70 flex items-center justify-between rounded-lg p-3 transition-colors">
                  <div>
                    <span className="text-sm font-medium">
                      Maintainability Index
                    </span>
                    <p className="text-muted-foreground text-xs">
                      Code maintainability score
                    </p>
                  </div>
                  <Badge variant="outline">
                    {results.metrics.maintainabilityIndex}
                  </Badge>
                </div>
                <div className="bg-card/50 hover:bg-card/70/50/70 flex items-center justify-between rounded-lg p-3 transition-colors">
                  <div>
                    <span className="text-sm font-medium">
                      Duplicated Lines
                    </span>
                    <p className="text-muted-foreground text-xs">
                      Lines of duplicated code
                    </p>
                  </div>
                  <Badge variant="outline">
                    {results.metrics.duplicatedLines}
                  </Badge>
                </div>
                {results.metrics.testCoverage && (
                  <div className="bg-card/50 hover:bg-card/70/50/70 flex items-center justify-between rounded-lg p-3 transition-colors">
                    <div>
                      <span className="text-sm font-medium">Test Coverage</span>
                      <p className="text-muted-foreground text-xs">
                        Code covered by tests
                      </p>
                    </div>
                    <Badge variant="outline">
                      {results.metrics.testCoverage}%
                    </Badge>
                  </div>
                )}
              </div>
              <div className="border-border dark:border-border mt-4 rounded-lg border bg-teal-100 p-3 dark:bg-teal-900/30">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">
                  Quality Assessment: {getQualityRating(safeQualityScore)}
                </p>
                <p className="text-primary mt-1 text-xs dark:text-teal-300">
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Dependencies</span>
                    <Badge variant="outline">
                      {results.dependencies.total}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Vulnerable</span>
                    <Badge variant="destructive">
                      {results.dependencies.vulnerable}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Outdated</span>
                    <Badge variant="secondary">
                      {results.dependencies.outdated}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
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
