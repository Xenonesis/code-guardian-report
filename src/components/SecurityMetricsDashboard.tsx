import React from 'react';
import { Shield, Target, Clock, FileText, Bug, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { MetricsCard } from '@/components/dashboard/MetricsCard';
import { QualityScoreCard } from '@/components/dashboard/QualityScoreCard';
import { SeverityChart } from '@/components/dashboard/SeverityChart';
import { OwaspChart } from '@/components/dashboard/OwaspChart';
import { SecurityRecommendations } from '@/components/dashboard/SecurityRecommendations';

interface SecurityMetricsDashboardProps {
  results: AnalysisResults;
}

export const SecurityMetricsDashboard: React.FC<SecurityMetricsDashboardProps> = ({ results }) => {

  // Ensure quality score is a valid number
  const safeQualityScore = typeof results.summary.qualityScore === 'number' && !isNaN(results.summary.qualityScore)
    ? results.summary.qualityScore
    : 0;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/20';
    if (score >= 60) return 'bg-yellow-100 dark:bg-yellow-900/20';
    if (score >= 40) return 'bg-orange-100 dark:bg-orange-900/20';
    return 'bg-red-100 dark:bg-red-900/20';
  };

  const getQualityRating = (score: number): string => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Very Good';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Fair';
    if (score >= 40) return 'Poor';
    return 'Critical';
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricsCard
            title="Security Score"
            value={`${results.summary.securityScore}/100`}
            icon={Shield}
            score={results.summary.securityScore}
            className={getScoreBgColor(results.summary.securityScore)}
            iconClassName={getScoreColor(results.summary.securityScore)}
            valueClassName={getScoreColor(results.summary.securityScore)}
            showProgress={true}
          />

          <QualityScoreCard score={safeQualityScore} />

          <MetricsCard
            title="Vulnerability Density"
            value={results.metrics.vulnerabilityDensity}
            subtitle="per 1000 lines"
            icon={Target}
            className="bg-blue-50 dark:bg-blue-900/20"
            iconClassName="text-blue-600"
            valueClassName="text-blue-600"
          />

          <MetricsCard
            title="Technical Debt"
            value={results.metrics.technicalDebt}
            subtitle="estimated"
            icon={Clock}
            className="bg-purple-50 dark:bg-purple-900/20"
            iconClassName="text-purple-600"
            valueClassName="text-purple-600"
          />
        </div>

        {/* Detailed Metrics Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
              <Badge variant="outline">{results.summary.linesAnalyzed.toLocaleString()}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Coverage</span>
              <Badge variant="outline">{results.summary.coveragePercentage}%</Badge>
            </div>
            <Progress value={results.summary.coveragePercentage} className="h-2" />
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5 text-blue-600" />
              Code Quality Metrics
            </CardTitle>
            <CardDescription>
              Detailed quality assessment and maintainability indicators
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/50 dark:bg-slate-800/50 rounded-lg">
              <div>
                <span className="text-sm font-medium">Quality Score</span>
                <p className="text-xs text-slate-500">Overall code quality rating</p>
              </div>
              <Badge variant="outline" className={`text-lg font-bold ${getScoreColor(safeQualityScore)}`}>
                {Math.round(safeQualityScore)}/100
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Maintainability Index</span>
              <Badge variant="outline">{results.metrics.maintainabilityIndex}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Duplicated Lines</span>
              <Badge variant="outline">{results.metrics.duplicatedLines}</Badge>
            </div>
            {results.metrics.testCoverage && (
              <div className="flex justify-between items-center">
                <span className="text-sm">Test Coverage</span>
                <Badge variant="outline">{results.metrics.testCoverage}%</Badge>
              </div>
            )}
            <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                <strong>Quality Rating:</strong> {getQualityRating(safeQualityScore)}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Based on code complexity, maintainability, and best practices
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
                  <Badge variant="outline">{results.dependencies.total}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Vulnerable</span>
                  <Badge variant="destructive">{results.dependencies.vulnerable}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Outdated</span>
                  <Badge variant="secondary">{results.dependencies.outdated}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Secure</span>
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    {results.dependencies.total - results.dependencies.vulnerable - results.dependencies.outdated}
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
