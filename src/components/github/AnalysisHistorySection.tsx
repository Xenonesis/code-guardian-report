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
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium border border-emerald-100 dark:border-emerald-900/30">
          <CheckCircle className="w-3.5 h-3.5" />
          Excellent
        </div>
      );
    } else if (score >= 6) {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 text-xs font-medium border border-yellow-100 dark:border-yellow-900/30">
          <AlertTriangle className="w-3.5 h-3.5" />
          Good
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium border border-red-100 dark:border-red-900/30">
          <AlertTriangle className="w-3.5 h-3.5" />
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
            <div className="h-7 w-48 bg-slate-100 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
            <div className="h-9 w-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="h-10 w-full bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card
              key={i}
              className="p-6 border-slate-200 dark:border-slate-800"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                  <div className="h-4 w-56 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
                </div>
                <div className="h-8 w-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
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
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Analysis History
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Track your repository security improvements over time
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
          <button
            onClick={() => setViewMode("timeline")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              viewMode === "timeline"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Calendar className="w-4 h-4" />
            Timeline
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all",
              viewMode === "list"
                ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <Filter className="w-4 h-4" />
            List View
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input
          placeholder="Search analysis history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-11 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <div className="relative pl-4 md:pl-8">
          {/* Timeline Line */}
          <div className="absolute left-4 md:left-8 top-0 bottom-0 w-px bg-slate-200 dark:bg-slate-800"></div>

          <div className="space-y-8">
            {filteredAnalyses.map((analysis, _index) => (
              <div key={analysis.id} className="relative pl-8 md:pl-12">
                {/* Timeline Dot */}
                <div className="absolute left-2.5 md:left-[2.1rem] top-6 w-3 h-3 rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 z-10"></div>

                <Card className="p-6 hover:shadow-lg transition-all duration-300 border-slate-200 dark:border-slate-800 group">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                          <GitBranch className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {analysis.repositoryName}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            {new Date(analysis.analyzedAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <Badge
                          variant="secondary"
                          className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        >
                          {analysis.language}
                        </Badge>
                        <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                          <TrendingUp className="w-4 h-4" />
                          {formatDuration(analysis.duration)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 items-start md:items-end min-w-[140px]">
                      {getScoreBadge(analysis.securityScore)}

                      <div className="flex items-center gap-3 text-sm">
                        <div className="text-slate-600 dark:text-slate-400">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {analysis.issuesFound}
                          </span>{" "}
                          issues
                        </div>
                        {analysis.criticalIssues > 0 && (
                          <div className="text-red-600 dark:text-red-400 font-medium flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {analysis.criticalIssues} critical
                          </div>
                        )}
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleViewReport(analysis)}
                        className="w-full md:w-auto hover:bg-slate-100 dark:hover:bg-slate-800 group/btn"
                      >
                        View Report
                        <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
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
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Repository
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Score
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Issues
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                {filteredAnalyses.map((analysis) => (
                  <tr
                    key={analysis.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg mr-3">
                          <GitBranch className="w-4 h-4 text-slate-500" />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
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
                          <span className="text-red-600 dark:text-red-400 ml-2 text-xs font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full">
                            {analysis.criticalIssues} critical
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
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
        <Card className="p-16 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            {searchQuery ? "No results found" : "No analysis history yet"}
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            {searchQuery
              ? "Try adjusting your search terms to find what you're looking for."
              : "Your repository security analysis history will appear here once you start analyzing repositories."}
          </p>
        </Card>
      )}

      {/* Analysis Report Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <GitBranch className="w-5 h-5 text-blue-600 dark:text-blue-400" />
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
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-8 overflow-y-auto">
              {/* Security Score */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 text-white p-8 text-center">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />

                <div className="relative z-10">
                  <div
                    className={cn(
                      "text-6xl font-bold mb-2 tracking-tighter",
                      selectedAnalysis.securityScore >= 8
                        ? "text-emerald-400"
                        : selectedAnalysis.securityScore >= 6
                          ? "text-yellow-400"
                          : "text-red-400"
                    )}
                  >
                    {selectedAnalysis.securityScore.toFixed(1)}
                  </div>
                  <div className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-4">
                    Security Score
                  </div>
                  <div className="inline-flex">
                    {getScoreBadge(selectedAnalysis.securityScore)}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                      "p-4 rounded-xl text-center border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-colors",
                      stat.bg
                    )}
                  >
                    <stat.icon
                      className={cn("w-6 h-6 mx-auto mb-2", stat.color)}
                    />
                    <div className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400 font-medium uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Analysis Details */}
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  Analysis Details
                </h3>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-5 space-y-4 border border-slate-200 dark:border-slate-800">
                  <div className="flex justify-between items-center text-sm pb-4 border-b border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600 dark:text-slate-400">
                      Analyzed At
                    </span>
                    <span className="text-slate-900 dark:text-white font-medium">
                      {new Date(selectedAnalysis.analyzedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Repository URL
                    </span>
                    <a
                      href={selectedAnalysis.repositoryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 hover:underline"
                    >
                      View on GitHub <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Executive Summary
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
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

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex gap-3 flex-shrink-0">
              <Button
                className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                onClick={() =>
                  handleOpenInGitHub(selectedAnalysis.repositoryUrl)
                }
              >
                <ExternalLink className="w-4 h-4 mr-2" />
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
