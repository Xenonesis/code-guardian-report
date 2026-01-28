import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity, GitBranch, Code, Zap, BarChart2 } from "lucide-react";
import { GitHubAnalysisStorageService } from "@/services/storage/GitHubAnalysisStorageService";
import { logger } from "@/utils/logger";
import { cn } from "@/lib/utils";

interface LanguageDistribution {
  language: string;
  count: number;
  percentage: number;
}

interface RepositoryActivityAnalyticsProps {
  userId: string;
  detailed?: boolean;
}

export const RepositoryActivityAnalytics: React.FC<
  RepositoryActivityAnalyticsProps
> = ({ userId, detailed = false }) => {
  const [languageDistribution, setLanguageDistribution] = useState<
    LanguageDistribution[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activityStats, setActivityStats] = useState({
    totalAnalyses: 0,
    averageDuration: 0,
    mostAnalyzedRepo: "",
    mostCommonLanguage: "",
  });

  useEffect(() => {
    loadActivityAnalytics();
  }, [userId]);

  const loadActivityAnalytics = async () => {
    setLoading(true);
    try {
      const storageService = new GitHubAnalysisStorageService();
      const data = await storageService.getActivityAnalytics(userId);
      setLanguageDistribution(data.languageDistribution);
      setActivityStats(data.stats);
    } catch (error) {
      logger.error("Error loading activity analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="border-slate-200 p-6 dark:border-slate-800"
            >
              <div className="mb-4 h-10 w-10 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800"></div>
              <div className="mb-2 h-8 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
              <div className="h-4 w-28 animate-pulse rounded bg-slate-100 dark:bg-slate-800"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-slate-900 dark:text-white">
          <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Repository Activity
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Insights into your repository analysis patterns and language usage
        </p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <Card className="group border-slate-200 p-6 transition-all duration-300 hover:shadow-lg dark:border-slate-800">
          <div className="mb-4 w-fit rounded-xl bg-purple-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-purple-900/20">
            <BarChart2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="mb-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {activityStats.totalAnalyses.toLocaleString()}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Total Analyses
          </div>
        </Card>

        <Card className="group border-slate-200 p-6 transition-all duration-300 hover:shadow-lg dark:border-slate-800">
          <div className="mb-4 w-fit rounded-xl bg-blue-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-blue-900/20">
            <Zap className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mb-1 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {activityStats.averageDuration}s
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Avg. Analysis Time
          </div>
        </Card>

        <Card className="group border-slate-200 p-6 transition-all duration-300 hover:shadow-lg dark:border-slate-800">
          <div className="mb-4 w-fit rounded-xl bg-green-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-green-900/20">
            <GitBranch className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div
            className="mb-1 truncate text-xl font-bold text-slate-900 dark:text-white"
            title={activityStats.mostAnalyzedRepo}
          >
            {activityStats.mostAnalyzedRepo || "N/A"}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Most Analyzed Repo
          </div>
        </Card>

        <Card className="group border-slate-200 p-6 transition-all duration-300 hover:shadow-lg dark:border-slate-800">
          <div className="mb-4 w-fit rounded-xl bg-orange-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-orange-900/20">
            <Code className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="mb-1 truncate text-xl font-bold text-slate-900 dark:text-white">
            {activityStats.mostCommonLanguage || "N/A"}
          </div>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Most Common Language
          </div>
        </Card>
      </div>

      {/* Language Distribution */}
      {detailed && languageDistribution.length > 0 && (
        <Card className="border-slate-200 p-8 dark:border-slate-800">
          <h3 className="mb-6 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
            <Code className="h-5 w-5 text-slate-500" />
            Language Distribution
          </h3>
          <div className="space-y-6">
            {languageDistribution.map((lang, index) => (
              <div key={index} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {lang.language}
                  </span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {lang.count} repos{" "}
                    <span className="mx-1 text-slate-300 dark:text-slate-600">
                      |
                    </span>{" "}
                    {lang.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={cn(
                      "relative h-full rounded-full transition-all duration-1000 ease-out",
                      index === 0
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600"
                        : index === 1
                          ? "bg-gradient-to-r from-purple-500 to-pink-600"
                          : index === 2
                            ? "bg-gradient-to-r from-orange-500 to-red-600"
                            : "bg-gradient-to-r from-slate-500 to-slate-600"
                    )}
                    style={{ width: `${lang.percentage}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 transition-colors group-hover:bg-transparent" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
