/**
 * Modern Security Dashboard Component
 *
 * Displays SonarQube-style security and code quality metrics:
 * - Quality Gate status
 * - Security Rating (A-E)
 * - Reliability Rating (A-E)
 * - Maintainability Rating (A-E)
 * - Technical Debt
 * - Code Coverage estimate
 * - Complexity metrics
 * - Issue breakdown by type
 */

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Shield,
  Bug,
  AlertTriangle,
  Code2,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Activity,
  Target,
  Zap,
} from "lucide-react";
import { CodeQualityMetrics } from "@/services/security/modernCodeScanningService";

export interface ModernSecurityDashboardProps {
  metrics: CodeQualityMetrics;
  technicalDebt: number;
  qualityGate: {
    passed: boolean;
    conditions: Array<{
      metric: string;
      status: "OK" | "ERROR";
      value: number;
      threshold: number;
    }>;
  };
  totalIssues: number;
}

const getRatingColor = (rating: string): string => {
  switch (rating) {
    case "A":
      return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300";
    case "B":
      return "bg-lime-100 text-lime-800 border-lime-200 dark:bg-lime-900/30 dark:text-lime-300";
    case "C":
      return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300";
    case "D":
      return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300";
    case "E":
      return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/30 dark:text-gray-300";
  }
};

const calculateSecurityRating = (vulnerabilities: number): string => {
  if (vulnerabilities === 0) return "A";
  if (vulnerabilities <= 2) return "B";
  if (vulnerabilities <= 5) return "C";
  if (vulnerabilities <= 10) return "D";
  return "E";
};

const calculateReliabilityRating = (bugs: number): string => {
  if (bugs === 0) return "A";
  if (bugs <= 3) return "B";
  if (bugs <= 7) return "C";
  if (bugs <= 15) return "D";
  return "E";
};

const calculateMaintainabilityRating = (
  maintainabilityIndex: number
): string => {
  if (maintainabilityIndex >= 80) return "A";
  if (maintainabilityIndex >= 65) return "B";
  if (maintainabilityIndex >= 50) return "C";
  if (maintainabilityIndex >= 35) return "D";
  return "E";
};

export const ModernSecurityDashboard: React.FC<
  ModernSecurityDashboardProps
> = ({ metrics, technicalDebt, qualityGate, totalIssues }) => {
  const securityRating = calculateSecurityRating(metrics.vulnerabilities);
  const reliabilityRating = calculateReliabilityRating(metrics.bugs);
  const maintainabilityRating = calculateMaintainabilityRating(
    metrics.maintainabilityIndex
  );
  const debtDays = (technicalDebt / (8 * 60)).toFixed(1);
  const duplicatedLinesPercent = (
    (metrics.duplicatedLines / metrics.linesOfCode) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Quality Gate Status */}
      <Card
        className={`border-2 ${qualityGate.passed ? "border-green-500 dark:border-green-700" : "border-red-500 dark:border-red-700"}`}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {qualityGate.passed ? (
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              ) : (
                <XCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              )}
              <div>
                <CardTitle className="text-2xl">
                  Quality Gate {qualityGate.passed ? "Passed" : "Failed"}
                </CardTitle>
                <CardDescription>
                  {qualityGate.passed
                    ? "All quality conditions met"
                    : `${qualityGate.conditions.filter((c) => c.status === "ERROR").length} condition(s) failed`}
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        {!qualityGate.passed && (
          <CardContent>
            <div className="space-y-2">
              {qualityGate.conditions
                .filter((c) => c.status === "ERROR")
                .map((condition, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg bg-red-50 p-3 dark:bg-red-900/20"
                  >
                    <span className="text-sm font-medium text-red-900 dark:text-red-100">
                      {condition.metric}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-red-700 dark:text-red-300">
                        {condition.value} / {condition.threshold} threshold
                      </span>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Rating Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Security Rating */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <CardTitle className="text-lg">Security</CardTitle>
              </div>
              <Badge
                className={`${getRatingColor(securityRating)} px-3 py-1 text-xl font-bold`}
              >
                {securityRating}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Vulnerabilities
                </span>
                <span className="text-foreground font-semibold">
                  {metrics.vulnerabilities}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Security Hotspots
                </span>
                <span className="text-foreground font-semibold">
                  {metrics.securityHotspots}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reliability Rating */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bug className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                <CardTitle className="text-lg">Reliability</CardTitle>
              </div>
              <Badge
                className={`${getRatingColor(reliabilityRating)} px-3 py-1 text-xl font-bold`}
              >
                {reliabilityRating}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">Bugs</span>
                <span className="text-foreground font-semibold">
                  {metrics.bugs}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Total Issues
                </span>
                <span className="text-foreground font-semibold">
                  {totalIssues}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Maintainability Rating */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <CardTitle className="text-lg">Maintainability</CardTitle>
              </div>
              <Badge
                className={`${getRatingColor(maintainabilityRating)} px-3 py-1 text-xl font-bold`}
              >
                {maintainabilityRating}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Code Smells
                </span>
                <span className="text-foreground font-semibold">
                  {metrics.codeSmells}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-600 dark:text-slate-400">
                  Maintainability
                </span>
                <span className="text-foreground font-semibold">
                  {metrics.maintainabilityIndex.toFixed(1)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Technical Debt & Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Technical Debt */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              <CardTitle>Technical Debt</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Remediation Time
                </span>
                <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {debtDays} days
                </span>
              </div>
              <Progress
                value={Math.min(100, metrics.technicalDebtRatio * 20)}
                className="h-2"
              />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Debt Ratio
              </span>
              <span className="text-foreground font-semibold">
                {metrics.technicalDebtRatio.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Remediation Effort
              </span>
              <span className="text-foreground font-semibold">
                {technicalDebt} min
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Code Metrics */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <CardTitle>Code Metrics</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Lines of Code
              </span>
              <span className="text-foreground font-semibold">
                {metrics.linesOfCode.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Comment Lines
              </span>
              <span className="text-foreground font-semibold">
                {metrics.commentLines}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">
                Duplicated Lines
              </span>
              <span className="text-foreground font-semibold">
                {duplicatedLinesPercent}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complexity Metrics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <CardTitle className="text-base">Cyclomatic Complexity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
              {metrics.cyclomaticComplexity}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Decision points in code
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <CardTitle className="text-base">Cognitive Complexity</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {metrics.cognitiveComplexity}
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Code readability measure
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              <CardTitle className="text-base">Test Coverage</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {metrics.estimatedTestCoverage}%
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Estimated coverage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Issue Breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <CardTitle>Issue Breakdown</CardTitle>
          </div>
          <CardDescription>
            Issues detected by type and severity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-red-50 p-4 text-center dark:bg-red-900/20">
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {metrics.vulnerabilities}
              </div>
              <div className="mt-1 text-sm text-red-700 dark:text-red-300">
                Vulnerabilities
              </div>
            </div>
            <div className="rounded-lg bg-orange-50 p-4 text-center dark:bg-orange-900/20">
              <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {metrics.bugs}
              </div>
              <div className="mt-1 text-sm text-orange-700 dark:text-orange-300">
                Bugs
              </div>
            </div>
            <div className="rounded-lg bg-yellow-50 p-4 text-center dark:bg-yellow-900/20">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {metrics.codeSmells}
              </div>
              <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Code Smells
              </div>
            </div>
            <div className="rounded-lg bg-blue-50 p-4 text-center dark:bg-blue-900/20">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {metrics.securityHotspots}
              </div>
              <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                Security Hotspots
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
