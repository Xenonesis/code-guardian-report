import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GitBranch,
  TrendingUp,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  Plus,
  BarChart3,
} from "lucide-react";
import { GitHubAnalysisStorageService } from "@/services/storage/GitHubAnalysisStorageService";

import { logger } from "@/utils/logger";
interface Repository {
  id: string;
  name: string;
  fullName: string;
  url: string;
  securityScore: number;
  issuesFound: number;
  criticalIssues: number;
  language: string;
  lastAnalyzed: Date;
}

interface ComparisonMetric {
  label: string;
  getValue: (repo: Repository) => number | string;
  format: (value: any) => string;
  icon: React.ReactNode;
}

interface RepositoryComparisonToolProps {
  userId: string;
}

export const RepositoryComparisonTool: React.FC<
  RepositoryComparisonToolProps
> = ({ userId }) => {
  const [availableRepos, setAvailableRepos] = useState<Repository[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    loadRepositories();
  }, [userId]);

  const loadRepositories = async () => {
    setLoading(true);
    try {
      const storageService = new GitHubAnalysisStorageService();
      const repos = await storageService.getUserRepositories(userId);
      setAvailableRepos(repos);

      // Auto-select first 2 repos if available
      if (repos.length >= 2 && selectedRepos.length === 0) {
        setSelectedRepos([repos[0], repos[1]]);
      }
    } catch (error) {
      logger.error("Error loading repositories:", error);
    } finally {
      setLoading(false);
    }
  };

  const comparisonMetrics: ComparisonMetric[] = [
    {
      label: "Security Score",
      getValue: (repo) => repo.securityScore,
      format: (val) => `${val.toFixed(1)}/10`,
      icon: <Shield className="w-4 h-4" />,
    },
    {
      label: "Total Issues",
      getValue: (repo) => repo.issuesFound,
      format: (val) => val.toString(),
      icon: <AlertTriangle className="w-4 h-4" />,
    },
    {
      label: "Critical Issues",
      getValue: (repo) => repo.criticalIssues,
      format: (val) => val.toString(),
      icon: <XCircle className="w-4 h-4" />,
    },
    {
      label: "Language",
      getValue: (repo) => repo.language,
      format: (val) => val,
      icon: <GitBranch className="w-4 h-4" />,
    },
    {
      label: "Last Analyzed",
      getValue: (repo) => repo.lastAnalyzed.getTime(),
      format: (val) => new Date(val).toLocaleDateString(),
      icon: <TrendingUp className="w-4 h-4" />,
    },
  ];

  const addRepository = (repo: Repository) => {
    if (
      selectedRepos.length < 4 &&
      !selectedRepos.find((r) => r.id === repo.id)
    ) {
      setSelectedRepos([...selectedRepos, repo]);
      setShowSelector(false);
    }
  };

  const removeRepository = (repoId: string) => {
    setSelectedRepos(selectedRepos.filter((r) => r.id !== repoId));
  };

  const getBestValue = (metric: ComparisonMetric): any => {
    if (selectedRepos.length === 0) return null;

    const values = selectedRepos.map((repo) => metric.getValue(repo));

    // For security score, higher is better
    if (metric.label === "Security Score") {
      return Math.max(...(values as number[]));
    }

    // For issues, lower is better
    if (metric.label.includes("Issues")) {
      return Math.min(...(values as number[]));
    }

    return null;
  };

  const isWinner = (repo: Repository, metric: ComparisonMetric): boolean => {
    const bestValue = getBestValue(metric);
    if (bestValue === null) return false;

    const currentValue = metric.getValue(repo);
    return currentValue === bestValue;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 8) return "text-green-600 dark:text-green-400";
    if (score >= 6) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getIssueColor = (issues: number): string => {
    if (issues === 0) return "text-green-600 dark:text-green-400";
    if (issues < 5) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <BarChart3 className="w-8 h-8 animate-pulse text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Repository Comparison
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Compare security metrics across repositories
          </p>
        </div>

        <Button
          onClick={() => setShowSelector(!showSelector)}
          disabled={selectedRepos.length >= 4}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Repository
        </Button>
      </div>

      {/* Repository Selector */}
      {showSelector && (
        <Card className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Select Repository
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSelector(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {availableRepos
              .filter((repo) => !selectedRepos.find((r) => r.id === repo.id))
              .map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => addRepository(repo)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                >
                  <GitBranch className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-slate-900 dark:text-white truncate">
                      {repo.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Score: {repo.securityScore.toFixed(1)}
                    </div>
                  </div>
                </button>
              ))}
          </div>
        </Card>
      )}

      {/* Comparison Grid */}
      {selectedRepos.length === 0 ? (
        <Card className="p-12 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-slate-300 mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
            No repositories selected
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Select at least 2 repositories to compare their metrics
          </p>
          <Button onClick={() => setShowSelector(true)}>
            Select Repositories
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Repository Headers */}
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: `200px repeat(${selectedRepos.length}, 1fr)`,
            }}
          >
            <div></div>
            {selectedRepos.map((repo) => (
              <Card key={repo.id} className="p-4 relative">
                <button
                  onClick={() => removeRepository(repo.id)}
                  className="absolute top-2 right-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="w-3 h-3 text-slate-600 dark:text-slate-400" />
                </button>

                <div className="pr-6">
                  <h4 className="font-semibold text-slate-900 dark:text-white mb-1 truncate">
                    {repo.name}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 truncate">
                    {repo.fullName}
                  </p>
                </div>
              </Card>
            ))}
          </div>

          {/* Comparison Metrics */}
          <div className="space-y-2">
            {comparisonMetrics.map((metric, idx) => (
              <div
                key={idx}
                className="grid gap-4"
                style={{
                  gridTemplateColumns: `200px repeat(${selectedRepos.length}, 1fr)`,
                }}
              >
                {/* Metric Label */}
                <div className="flex items-center gap-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                  <div className="text-slate-600 dark:text-slate-400">
                    {metric.icon}
                  </div>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {metric.label}
                  </span>
                </div>

                {/* Metric Values */}
                {selectedRepos.map((repo) => {
                  const value = metric.getValue(repo);
                  const formattedValue = metric.format(value);
                  const winner = isWinner(repo, metric);

                  return (
                    <Card
                      key={repo.id}
                      className={`p-4 flex items-center justify-center ${
                        winner
                          ? "ring-2 ring-green-500 dark:ring-green-400"
                          : ""
                      }`}
                    >
                      <div className="text-center">
                        <div
                          className={`text-lg font-bold ${
                            metric.label === "Security Score"
                              ? getScoreColor(value as number)
                              : metric.label.includes("Issues")
                                ? getIssueColor(value as number)
                                : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {formattedValue}
                        </div>
                        {winner && (
                          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mx-auto mt-1" />
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Radar Chart Visualization */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Security Score Comparison
            </h3>

            <div className="space-y-4">
              {selectedRepos.map((repo) => (
                <div key={repo.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      {repo.name}
                    </span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(repo.securityScore)}`}
                    >
                      {repo.securityScore.toFixed(1)}/10
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        repo.securityScore >= 8
                          ? "bg-green-500"
                          : repo.securityScore >= 6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                      }`}
                      style={{ width: `${(repo.securityScore / 10) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Summary Insights */}
          <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
              Comparison Insights
            </h3>

            <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
              {(() => {
                const avgScore =
                  selectedRepos.reduce((sum, r) => sum + r.securityScore, 0) /
                  selectedRepos.length;
                const totalIssues = selectedRepos.reduce(
                  (sum, r) => sum + r.issuesFound,
                  0
                );
                const bestRepo = selectedRepos.reduce(
                  (best, repo) =>
                    repo.securityScore > best.securityScore ? repo : best,
                  selectedRepos[0]
                );

                return (
                  <>
                    <p>
                      • Average Security Score:{" "}
                      <strong>{avgScore.toFixed(1)}/10</strong>
                    </p>
                    <p>
                      • Total Issues Across Repositories:{" "}
                      <strong>{totalIssues}</strong>
                    </p>
                    <p>
                      • Best Performing Repository:{" "}
                      <strong>{bestRepo.name}</strong> (
                      {bestRepo.securityScore.toFixed(1)}/10)
                    </p>
                    <p>
                      • Repositories Compared:{" "}
                      <strong>{selectedRepos.length}</strong>
                    </p>
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
