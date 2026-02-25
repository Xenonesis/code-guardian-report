import React, { Suspense, useEffect, useMemo } from "react";
import {
  FileCode,
  AlertTriangle,
  Shield,
  Clock,
  FileText,
  Bug,
  TrendingUp,
  Target,
  Key,
  Download,
  Layers,
  Upload,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { UploadForm } from "@/components/UploadForm";
import { LoadingSpinner } from "../../common/LoadingSpinner";
import { AnalysisResults } from "@/hooks/useAnalysis";
import PromptGenerator from "../../ai/PromptGenerator";
import { toast } from "sonner";

// Lazy load heavy components
const ResultsTable = React.lazy(() =>
  import("../../analysis/ResultsTable").then((module) => ({
    default: module.ResultsTable,
  }))
);
const AIKeyManager = React.lazy(() =>
  import("../../ai/AIKeyManager").then((module) => ({
    default: module.AIKeyManager,
  }))
);
const EnhancedSecurityResults = React.lazy(() =>
  import("../../analysis/EnhancedSecurityResults").then((module) => ({
    default: module.EnhancedSecurityResults,
  }))
);

// ─── Helpers ───────────────────────────────────────────────

function getScoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Fair";
  if (score >= 25) return "Poor";
  return "Critical";
}

function getScoreColor(score: number): string {
  if (score >= 90)
    return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  if (score >= 75) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (score >= 50)
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  if (score >= 25)
    return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

function getSeverityBadgeClass(
  count: number,
  type: "critical" | "high" | "medium" | "low"
): string {
  if (count === 0)
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  const colors = {
    critical: "bg-red-500/15 text-red-400 border-red-500/30",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    medium: "bg-yellow-500/15 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  };
  return colors[type];
}

// ─── Component ─────────────────────────────────────────────

interface TabContentProps {
  analysisResults: AnalysisResults | null;
  onFileSelect: (file: File) => void;
  onAnalysisComplete: (results: AnalysisResults) => void;
}

export const TabContent: React.FC<TabContentProps> = ({
  analysisResults,
  onFileSelect,
  onAnalysisComplete,
}) => {
  // Persist analysis results to localStorage
  useEffect(() => {
    if (analysisResults) {
      try {
        localStorage.setItem(
          "latestAnalysisResults",
          JSON.stringify(analysisResults)
        );
        localStorage.setItem(
          "latestAnalysisTimestamp",
          new Date().toISOString()
        );
      } catch {
        // Silently fail if localStorage is full or unavailable
      }
    }
  }, [analysisResults]);

  // Computed stats from the analysis
  const stats = useMemo(() => {
    if (!analysisResults) return null;
    const { summary, issues, totalFiles, analysisTime } = analysisResults;
    const totalIssues = issues.length;
    const criticalCount =
      summary?.criticalIssues ??
      issues.filter((i) => i.severity === "Critical").length;
    const highCount =
      summary?.highIssues ?? issues.filter((i) => i.severity === "High").length;
    const mediumCount =
      summary?.mediumIssues ??
      issues.filter((i) => i.severity === "Medium").length;
    const lowCount =
      summary?.lowIssues ?? issues.filter((i) => i.severity === "Low").length;
    const securityScore = summary?.securityScore ?? 0;
    const qualityScore = summary?.qualityScore ?? 0;
    const linesAnalyzed = summary?.linesAnalyzed ?? 0;
    const vulnDensity = analysisResults.metrics?.vulnerabilityDensity ?? 0;
    const secretsFound = issues.filter(
      (i) => i.category === "Secret Detection" || i.type === "Secret"
    ).length;

    return {
      totalIssues,
      criticalCount,
      highCount,
      mediumCount,
      lowCount,
      securityScore,
      qualityScore,
      linesAnalyzed,
      totalFiles,
      analysisTime,
      vulnDensity,
      secretsFound,
    };
  }, [analysisResults]);

  // JSON Export handler
  const handleExportJSON = () => {
    if (!analysisResults) return;
    try {
      const blob = new Blob([JSON.stringify(analysisResults, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `security-analysis-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Analysis results exported as JSON");
    } catch {
      toast.error("Failed to export results");
    }
  };

  return (
    <>
      <TabsContent
        value="upload"
        className="animate-fade-in space-y-6 sm:space-y-8"
        role="tabpanel"
        id="upload-panel"
        aria-labelledby="upload-tab"
      >
        <UploadForm
          onFileSelect={onFileSelect}
          onAnalysisComplete={onAnalysisComplete}
        />
      </TabsContent>

      <TabsContent
        value="ai-config"
        className="animate-fade-in"
        role="tabpanel"
        id="ai-config-panel"
        aria-labelledby="ai-config-tab"
      >
        <Suspense
          fallback={
            <div
              className="flex justify-center p-8"
              role="status"
              aria-label="Loading AI configuration"
            >
              <LoadingSpinner size="lg" message="Loading AI Configuration..." />
            </div>
          }
        >
          <AIKeyManager />
        </Suspense>
      </TabsContent>

      <TabsContent
        value="prompts"
        className="animate-fade-in"
        role="tabpanel"
        id="prompts-panel"
        aria-labelledby="prompts-tab"
      >
        <PromptGenerator analysisResults={analysisResults} />
      </TabsContent>

      <TabsContent
        value="results"
        className="animate-fade-in"
        role="tabpanel"
        id="results-panel"
        aria-labelledby="results-tab"
      >
        {analysisResults && stats ? (
          <Suspense
            fallback={
              <div
                className="flex justify-center p-8"
                role="status"
                aria-label="Loading analysis results"
              >
                <LoadingSpinner size="lg" message="Loading Results..." />
              </div>
            }
          >
            {/* ── Executive Summary Banner ── */}
            <div className="border-border/50 bg-card/80 mb-8 overflow-hidden rounded-2xl border shadow-xl backdrop-blur-sm">
              {/* Banner Header */}
              <div className="border-border/40 border-b px-4 py-4 sm:px-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 p-2">
                      <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-foreground text-lg font-bold">
                        Executive Summary
                      </h2>
                      <p className="text-muted-foreground text-xs">
                        {stats.totalFiles} files •{" "}
                        {stats.linesAnalyzed.toLocaleString()} lines analyzed
                        {stats.analysisTime ? ` • ${stats.analysisTime}` : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${getScoreColor(stats.securityScore)} border px-3 py-1.5 text-sm font-bold`}
                    >
                      {getScoreLabel(stats.securityScore)} —{" "}
                      {stats.securityScore}/100
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportJSON}
                      className="border-border bg-card/90 hover:bg-card gap-1.5 text-xs backdrop-blur-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Export
                    </Button>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="bg-border/30 grid grid-cols-2 gap-px sm:grid-cols-3 lg:grid-cols-6">
                {[
                  {
                    icon: Shield,
                    label: "Security",
                    value: stats.securityScore,
                    suffix: "/100",
                    color: "text-emerald-400",
                    bgColor: "bg-emerald-500/10",
                  },
                  {
                    icon: AlertTriangle,
                    label: "Critical+High",
                    value: stats.criticalCount + stats.highCount,
                    color:
                      stats.criticalCount + stats.highCount > 0
                        ? "text-red-400"
                        : "text-emerald-400",
                    bgColor:
                      stats.criticalCount + stats.highCount > 0
                        ? "bg-red-500/10"
                        : "bg-emerald-500/10",
                  },
                  {
                    icon: Target,
                    label: "Vuln Density",
                    value: stats.vulnDensity.toFixed(2),
                    color: "text-purple-400",
                    bgColor: "bg-purple-500/10",
                  },
                  {
                    icon: Key,
                    label: "Secrets",
                    value: stats.secretsFound,
                    color:
                      stats.secretsFound > 0
                        ? "text-red-400"
                        : "text-emerald-400",
                    bgColor:
                      stats.secretsFound > 0
                        ? "bg-red-500/10"
                        : "bg-emerald-500/10",
                  },
                  {
                    icon: TrendingUp,
                    label: "Quality",
                    value: stats.qualityScore,
                    suffix: "/100",
                    color: "text-blue-400",
                    bgColor: "bg-blue-500/10",
                  },
                  {
                    icon: Bug,
                    label: "Issues",
                    value: stats.totalIssues,
                    color:
                      stats.totalIssues > 0
                        ? "text-amber-400"
                        : "text-emerald-400",
                    bgColor:
                      stats.totalIssues > 0
                        ? "bg-amber-500/10"
                        : "bg-emerald-500/10",
                  },
                ].map(
                  ({ icon: Icon, label, value, suffix, color, bgColor }) => (
                    <div
                      key={label}
                      className="bg-card/60 hover:bg-card/90 flex flex-col items-center justify-center gap-2 px-3 py-4 transition-colors"
                    >
                      <div className={`rounded-lg ${bgColor} p-2`}>
                        <Icon className={`h-4 w-4 ${color}`} />
                      </div>
                      <span className="text-foreground text-lg font-bold tabular-nums sm:text-xl">
                        {value}
                        {suffix && (
                          <span className="text-muted-foreground text-xs font-normal sm:text-sm">
                            {suffix}
                          </span>
                        )}
                      </span>
                      <span className="text-muted-foreground text-center text-[10px] font-medium tracking-wider uppercase sm:text-xs">
                        {label}
                      </span>
                    </div>
                  )
                )}
              </div>

              {/* Severity Breakdown Bar */}
              <div className="border-border/40 border-t px-4 py-3 sm:px-6">
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <span className="text-muted-foreground text-xs font-medium">
                    Breakdown:
                  </span>
                  {(
                    [
                      {
                        label: "Critical",
                        count: stats.criticalCount,
                        type: "critical" as const,
                      },
                      {
                        label: "High",
                        count: stats.highCount,
                        type: "high" as const,
                      },
                      {
                        label: "Medium",
                        count: stats.mediumCount,
                        type: "medium" as const,
                      },
                      {
                        label: "Low",
                        count: stats.lowCount,
                        type: "low" as const,
                      },
                    ] as const
                  ).map(({ label, count, type }) => (
                    <Badge
                      key={type}
                      variant="outline"
                      className={`${getSeverityBadgeClass(count, type)} border text-xs font-semibold`}
                    >
                      {label}: {count}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Analysis Metadata Cards ── */}
            <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  icon: FileText,
                  label: "Files Analyzed",
                  value: stats.totalFiles.toString(),
                  description: "Total source files scanned",
                },
                {
                  icon: Layers,
                  label: "Lines of Code",
                  value: stats.linesAnalyzed.toLocaleString(),
                  description: "Lines analyzed for security",
                },
                {
                  icon: Clock,
                  label: "Analysis Duration",
                  value: stats.analysisTime || "N/A",
                  description: "Time to complete the scan",
                },
                {
                  icon: Target,
                  label: "Vuln Density",
                  value: `${stats.vulnDensity.toFixed(2)}/KLOC`,
                  description: "Issues per thousand lines",
                },
              ].map(({ icon: Icon, label, value, description }) => (
                <Card
                  key={label}
                  className="bg-card/80 border-border/50 group transition-all duration-200 hover:shadow-lg"
                >
                  <CardContent className="flex items-start gap-3 p-4">
                    <div className="bg-muted rounded-lg p-2 transition-transform duration-200 group-hover:scale-110">
                      <Icon className="text-primary h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-xs font-medium">
                        {label}
                      </p>
                      <p className="text-foreground truncate text-lg font-bold">
                        {value}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* ── Suspicious Files Section ── */}
            {analysisResults.zipAnalysis && (
              <div className="mb-8 space-y-6">
                {analysisResults.zipAnalysis.fileStructure.suspiciousFiles
                  .length > 0 && (
                  <Card className="bg-card border-2 border-amber-200/60 shadow-xl transition-all duration-300 hover:shadow-2xl dark:border-amber-800/40 dark:from-amber-950/20 dark:via-orange-950/10 dark:to-yellow-950/20">
                    <CardHeader className="pb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary rounded-xl p-2.5 shadow-lg">
                          <AlertTriangle className="text-primary-foreground h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="bg-gradient-to-r from-amber-900 via-orange-900 to-yellow-900 bg-clip-text text-lg font-bold text-transparent sm:text-xl dark:from-amber-200 dark:via-orange-200 dark:to-yellow-200">
                            Suspicious Files (
                            {
                              analysisResults.zipAnalysis.fileStructure
                                .suspiciousFiles.length
                            }
                            )
                          </CardTitle>
                          <CardDescription className="mt-0.5 text-xs font-medium sm:text-sm">
                            Files flagged due to risky extensions or patterns
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2.5">
                        {analysisResults.zipAnalysis.fileStructure.suspiciousFiles
                          .slice(0, 12)
                          .map((file) => (
                            <div
                              key={file}
                              className="group bg-muted/60 flex items-center gap-3 rounded-xl border-2 border-amber-300/50 p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400/70 hover:shadow-lg dark:border-amber-700/30 dark:from-amber-900/40 dark:via-orange-900/30 dark:to-yellow-900/40 dark:hover:border-amber-600/50"
                            >
                              <div className="bg-primary rounded-lg p-1.5 shadow-sm transition-transform duration-200 group-hover:scale-110">
                                <AlertTriangle className="text-primary-foreground h-3.5 w-3.5" />
                              </div>
                              <span className="flex-1 truncate font-mono text-sm font-medium text-amber-900 dark:text-amber-100">
                                {file}
                              </span>
                            </div>
                          ))}
                        {analysisResults.zipAnalysis.fileStructure
                          .suspiciousFiles.length > 12 && (
                          <div className="mt-3 border-t border-amber-300/30 pt-3 dark:border-amber-700/20">
                            <p className="text-center text-xs font-medium text-amber-700 dark:text-amber-300">
                              +{" "}
                              {analysisResults.zipAnalysis.fileStructure
                                .suspiciousFiles.length - 12}{" "}
                              more files omitted
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ── Main Results with Fallback ── */}
            {analysisResults.summary ? (
              <EnhancedSecurityResults results={analysisResults} />
            ) : (
              <ResultsTable
                issues={analysisResults.issues}
                totalFiles={analysisResults.totalFiles}
                analysisTime={analysisResults.analysisTime}
                results={analysisResults}
              />
            )}

            {/* ── Footer Actions ── */}
            <div className="border-border/40 mt-10 flex flex-col items-center justify-center gap-3 border-t pt-6 sm:flex-row">
              <Button
                variant="outline"
                onClick={handleExportJSON}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export as JSON
              </Button>
            </div>
          </Suspense>
        ) : (
          <Card className="bg-card/90 border-border/50 shadow-xl backdrop-blur-sm">
            <CardContent className="p-8 text-center sm:p-16">
              <div className="bg-muted mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full p-6">
                <FileCode
                  className="text-primary h-12 w-12"
                  aria-hidden="true"
                />
              </div>
              <h3 className="text-foreground mb-3 text-xl font-bold sm:mb-4 sm:text-2xl">
                No Analysis Results
              </h3>
              <p className="text-muted-foreground mx-auto mb-6 max-w-md text-base sm:text-lg">
                Upload and analyze your code to see comprehensive security
                results here.
              </p>
              <Button
                variant="outline"
                className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 shadow-lg"
                onClick={() => {
                  // Switch to the upload tab
                  const uploadTab = document.querySelector(
                    '[value="upload"]'
                  ) as HTMLButtonElement | null;
                  uploadTab?.click();
                }}
              >
                <Upload className="h-5 w-5" />
                Go to Upload
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </>
  );
};
