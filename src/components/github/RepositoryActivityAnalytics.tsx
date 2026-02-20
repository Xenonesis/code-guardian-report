import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Activity, GitBranch, Code, Zap, BarChart2 } from "lucide-react";
import { GitHubAnalysisStorageService } from "@/services/storage/GitHubAnalysisStorageService";
import { logger } from "@/utils/logger";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

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
            <Card key={i} className="border-border p-6">
              <Skeleton className="mb-4 h-10 w-10 rounded-lg" />
              <Skeleton className="mb-2 h-8 w-16 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </Card>
          ))}
        </div>
      </div>
    );
  }
  // Empty state when no analyses have been performed
  if (activityStats.totalAnalyses === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold">
            <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            Repository Activity
          </h2>
          <p className="text-muted-foreground">
            Insights into your repository analysis patterns and language usage
          </p>
        </div>
        <Card className="border-border bg-muted/50 text-center/50 border-2 border-dashed p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
            <Activity className="h-8 w-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-foreground mb-2 text-xl font-semibold">
            No Activity Data Yet
          </h3>
          <p className="text-muted-foreground mx-auto max-w-md">
            Start analyzing repositories to see your activity patterns and
            language distribution.
          </p>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold">
          <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          Repository Activity
        </h2>
        <p className="text-muted-foreground">
          Insights into your repository analysis patterns and language usage
        </p>
      </div>

      {/* Activity Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <Card className="group border-border p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4 w-fit rounded-xl bg-purple-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-purple-900/20">
            <BarChart2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-foreground mb-1 text-3xl font-bold tracking-tight">
            {activityStats.totalAnalyses.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            Total Analyses
          </div>
        </Card>

        <Card className="group border-border p-6 transition-all duration-300 hover:shadow-lg">
          <div className="bg-muted mb-4 w-fit rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-teal-900/20">
            <Zap className="text-primary dark:text-primary h-6 w-6" />
          </div>
          <div className="text-foreground mb-1 text-3xl font-bold tracking-tight">
            {activityStats.averageDuration}s
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            Avg. Analysis Time
          </div>
        </Card>

        <Card className="group border-border p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4 w-fit rounded-xl bg-green-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-green-900/20">
            <GitBranch className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <div
            className="text-foreground mb-1 truncate text-xl font-bold"
            title={activityStats.mostAnalyzedRepo}
          >
            {activityStats.mostAnalyzedRepo || "N/A"}
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            Most Analyzed Repo
          </div>
        </Card>

        <Card className="group border-border p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4 w-fit rounded-xl bg-orange-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-orange-900/20">
            <Code className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div className="text-foreground mb-1 truncate text-xl font-bold">
            {activityStats.mostCommonLanguage || "N/A"}
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            Most Common Language
          </div>
        </Card>
      </div>

      {/* Language Distribution */}
      {detailed && languageDistribution.length > 0 && (
        <Card className="border-border p-8">
          <h3 className="text-foreground mb-6 flex items-center gap-2 text-lg font-bold">
            <Code className="text-muted-foreground h-5 w-5" />
            Language Distribution
          </h3>
          <div className="space-y-6">
            {languageDistribution.map((lang, index) => (
              <div key={index} className="group">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-foreground/80 flex items-center gap-2 text-sm font-semibold">
                    {lang.language}
                  </span>
                  <span className="text-muted-foreground text-sm font-medium">
                    {lang.count} repos{" "}
                    <span className="text-muted-foreground mx-1">|</span>{" "}
                    {lang.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="bg-muted h-3 w-full overflow-hidden rounded-full">
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
