import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Clock,
  GitBranch,
  Search,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Filter,
  ExternalLink,
  X,
  Shield,
  Bug,
  FileCode,
  ArrowRight,
} from "lucide-react";
import { GitHubAnalysisStorageService } from "@/services/storage/GitHubAnalysisStorageService";
import { logger } from "@/utils/logger";
import { cn } from "@/lib/utils";

interface AnalysisRecord {
  id: string;
  repositoryName: string;
  repositoryUrl: string;
  analyzedAt: Date;
  duration: number;
  issuesFound: number;
  criticalIssues: number;
  securityScore: number;
  language: string;
}

interface AnalysisHistorySectionProps {
  userId: string;
}

export const AnalysisHistorySection: React.FC<AnalysisHistorySectionProps> = ({
  userId,
}) => {
  const [analyses, setAnalyses] = useState<AnalysisRecord[]>([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState<AnalysisRecord[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"timeline" | "list">("timeline");
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<AnalysisRecord | null>(null);

  useEffect(() => {
    loadAnalysisHistory();
  }, [userId]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredAnalyses(
        analyses.filter((a) =>
          a.repositoryName.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredAnalyses(analyses);
    }
  }, [searchQuery, analyses]);

  const loadAnalysisHistory = async () => {
    setLoading(true);
    try {
      const storageService = new GitHubAnalysisStorageService();
      const history = await storageService.getAnalysisHistory(userId);
      setAnalyses(history);
      setFilteredAnalyses(history);
    } catch (error) {
      logger.error("Error loading analysis history:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}m ${secs}s`;
  };

  const getScoreBadge = (score: number) => {
    if (score >= 8) {
      return (
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400">
          <CheckCircle className="h-3.5 w-3.5" />
          Excellent
        </div>
      );
    } else if (score >= 6) {
      return (
        <div className="flex items-center gap-1.5 rounded-full border border-yellow-100 bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-600 dark:border-yellow-900/30 dark:bg-yellow-900/20 dark:text-yellow-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          Good
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 rounded-full border border-red-100 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 dark:border-red-900/30 dark:bg-red-900/20 dark:text-red-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          Poor
        </div>
      );
    }
  };

  const handleViewReport = (analysis: AnalysisRecord) => {
    setSelectedAnalysis(analysis);
  };

  const handleCloseReport = () => {
    setSelectedAnalysis(null);
  };

  const handleOpenInGitHub = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="mb-2 h-7 w-48 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
            <div className="h-4 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
            <div className="h-9 w-20 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
          </div>
        </div>
        <div className="h-10 w-full animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="border-slate-200 p-6 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
                  <div className="h-4 w-56 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
                </div>
                <div className="h-8 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
            Analysis History
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Track your repository security improvements over time
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-lg bg-slate-100 p-1 dark:bg-slate-800/50">
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              viewMode === "timeline"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <Calendar className="h-4 w-4" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all",
              viewMode === "list"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            )}
          >
            <Filter className="h-4 w-4" />
            List View
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="group relative">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-slate-400 transition-colors group-focus-within:text-blue-500" />
        <Input
          placeholder="Search analysis history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-11 border-slate-200 bg-white pl-10 transition-all focus:ring-2 focus:ring-blue-500 dark:border-slate-800 dark:bg-slate-900"
        />
      </div>

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="relative pl-4 md:pl-8">
          {/* Timeline Line */}
          <div className="absolute top-0 bottom-0 left-4 w-px bg-slate-200 md:left-8 dark:bg-slate-800"></div>

          <div className="space-y-8">
            {filteredAnalyses.map((analysis, _index) => (
              <div key={analysis.id} className="relative pl-8 md:pl-12">
                {/* Timeline Dot */}
                <div className="absolute top-6 left-2.5 z-10 h-3 w-3 rounded-full border-2 border-blue-500 bg-white md:left-[2.1rem] dark:bg-slate-900"></div>

                <Card className="group border-slate-200 p-6 transition-all duration-300 hover:shadow-lg dark:border-slate-800">
                  <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                    <div className="flex-1">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          <GitBranch className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
                            {analysis.repositoryName}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="h-3 w-3" />
                            {new Date(analysis.analyzedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {analysis.language}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          <TrendingUp className="h-4 w-4" />
                          {formatDuration(analysis.duration)}
                        </div>
                      </div>
                    </div>

                    <div className="flex min-w-[140px] flex-col items-start gap-4 md:items-end">
                      {getScoreBadge(analysis.securityScore)}

                      <div className="flex items-center gap-3 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {analysis.issuesFound}
                          </span>{" "}
                          issues
                        </div>
                        {analysis.criticalIssues > 0 && (
                          <div className="flex items-center gap-1 font-medium text-red-600 dark:text-red-400">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {analysis.criticalIssues} critical
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReport(analysis)}
                        className="group/btn w-full hover:bg-slate-100 md:w-auto dark:hover:bg-slate-800"
                      >
                        View Report
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Repository
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Issues
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900">
                {filteredAnalyses.map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="mr-3 rounded-lg bg-slate-100 p-2 dark:bg-slate-800">
                          <GitBranch className="h-4 w-4 text-slate-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {analysis.repositoryName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {analysis.language}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm whitespace-nowrap text-slate-600 dark:text-slate-400">
                      {new Date(analysis.analyzedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getScoreBadge(analysis.securityScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {analysis.issuesFound}
                        </span>
                        {analysis.criticalIssues > 0 && (
                          <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 dark:bg-red-900/20 dark:text-red-400">
                            {analysis.criticalIssues} critical
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReport(analysis)}
                        className="hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {filteredAnalyses.length === 0 && (
        <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 p-16 text-center dark:border-slate-800 dark:bg-slate-900/50">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
            <Clock className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-white">
            {searchQuery ? "No results found" : "No analysis history yet"}
          </h3>
          <p className="mx-auto max-w-md text-slate-500 dark:text-slate-400">
            {searchQuery
              ? "Try adjusting your search terms to find what you're looking for."
              : "Your repository security analysis history will appear here once you start analyzing repositories."}
          </p>
        </Card>
      )}

      {/* Analysis Report Modal */}
      {selectedAnalysis && (
        <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm duration-200">
          <Card className="animate-in zoom-in-95 flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border-slate-200 shadow-2xl duration-200 dark:border-slate-800">
            <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-900/20">
                  <GitBranch className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {selectedAnalysis.repositoryName}
                  </h2>
                  <p className="text-xs text-slate-500">Analysis Report</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCloseReport}
                className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-8 overflow-y-auto p-6">
              {/* Security Score */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-center text-white dark:from-slate-800 dark:to-slate-950">
                <div className="pointer-events-none absolute top-0 right-0 -mt-32 -mr-32 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

                <div className="relative z-10">
                  <div
                    className={cn(
                      "mb-2 text-6xl font-bold tracking-tighter",
                      selectedAnalysis.securityScore >= 8
                        ? "text-emerald-400"
                        : selectedAnalysis.securityScore >= 6
                          ? "text-yellow-400"
                          : "text-red-400"
                    )}
                  >
                    {selectedAnalysis.securityScore.toFixed(1)}
                  </div>
                  <div className="mb-4 text-sm font-medium tracking-wider text-slate-400 uppercase">
                    Security Score
                  </div>
                  <div className="inline-flex">
                    {getScoreBadge(selectedAnalysis.securityScore)}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {[
                  {
                    icon: Bug,
                    label: "Total Issues",
                    value: selectedAnalysis.issuesFound,
                    color: "text-orange-500",
                    bg: "bg-orange-50 dark:bg-orange-900/10",
                  },
                  {
                    icon: AlertTriangle,
                    label: "Critical",
                    value: selectedAnalysis.criticalIssues,
                    color: "text-red-500",
                    bg: "bg-red-50 dark:bg-red-900/10",
                  },
                  {
                    icon: Clock,
                    label: "Duration",
                    value: formatDuration(selectedAnalysis.duration),
                    color: "text-blue-500",
                    bg: "bg-blue-50 dark:bg-blue-900/10",
                  },
                  {
                    icon: FileCode,
                    label: "Language",
                    value: selectedAnalysis.language,
                    color: "text-purple-500",
                    bg: "bg-purple-50 dark:bg-purple-900/10",
                  },
                ].map((stat, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl border border-transparent p-4 text-center transition-colors hover:border-slate-200 dark:hover:border-slate-700",
                      stat.bg
                    )}
                  >
                    <stat.icon
                      className={cn("mx-auto mb-2 h-6 w-6", stat.color)}
                    />
                    <div className="mb-1 text-xl font-bold text-slate-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs font-medium text-slate-600 uppercase dark:text-slate-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Analysis Details */}
              <div className="space-y-4">
                <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Analysis Details
                </h3>
                <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/50">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-4 text-sm dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">
                      Analyzed At
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {new Date(selectedAnalysis.analyzedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Repository URL
                    </span>
                    <a
                      href={selectedAnalysis.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 font-medium text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      View on GitHub <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-xl border border-blue-100 bg-blue-50 p-5 dark:border-blue-900/30 dark:bg-blue-900/10">
                <h4 className="mb-2 flex items-center gap-2 font-semibold text-blue-900 dark:text-blue-100">
                  <TrendingUp className="h-4 w-4" />
                  Executive Summary
                </h4>
                <p className="text-sm leading-relaxed text-blue-800 dark:text-blue-200">
                  {selectedAnalysis.criticalIssues > 0 ? (
                    <>
                      This repository has{" "}
                      <strong className="text-red-600 dark:text-red-400">
                        {selectedAnalysis.criticalIssues} critical security
                        issues
                      </strong>{" "}
                      that require immediate attention. It is recommended to
                      prioritize fixing these vulnerabilities before deployment.
                    </>
                  ) : selectedAnalysis.issuesFound > 0 ? (
                    <>
                      This repository has {selectedAnalysis.issuesFound} issues
                      detected. While there are no critical vulnerabilities,
                      addressing these issues will improve the overall code
                      quality and maintainability of the project.
                    </>
                  ) : (
                    <>
                      Excellent work! No security issues were detected in this
                      repository. The codebase appears to follow security best
                      practices. Continue monitoring for new vulnerabilities.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-shrink-0 gap-3 border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
              <Button
                className="flex-1 bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                onClick={() =>
                  handleOpenInGitHub(selectedAnalysis.repositoryUrl)
                }
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in GitHub
              </Button>
              <Button
                variant="outline"
                onClick={handleCloseReport}
                className="flex-1"
              >
                Close Report
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
