import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import {
  Shield,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
} from "lucide-react";
import { GitHubAnalysisStorageService } from "@/services/storage/GitHubAnalysisStorageService";
import { logger } from "@/utils/logger";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SecurityTrend {
  date: string;
  score: number;
  issues: number;
}

interface SecurityAnalyticsSectionProps {
  userId: string;
  detailed?: boolean;
}

export const SecurityAnalyticsSection: React.FC<
  SecurityAnalyticsSectionProps
> = ({ userId, detailed = false }) => {
  const [trends, setTrends] = useState<SecurityTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    averageScore: 0,
    totalIssues: 0,
    criticalIssues: 0,
    trend: "up" as "up" | "down" | "stable",
  });

  useEffect(() => {
    loadSecurityAnalytics();
  }, [userId]);

  const loadSecurityAnalytics = async () => {
    setLoading(true);
    try {
      const storageService = new GitHubAnalysisStorageService();
      const data = await storageService.getSecurityTrends(userId);
      setTrends(data.trends);
      setStats(data.stats);
    } catch (error) {
      logger.error("Error loading security analytics:", error);
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
              <div className="mb-4 flex items-start justify-between">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
              <Skeleton className="mb-2 h-8 w-16 rounded" />
              <Skeleton className="h-4 w-28 rounded" />
            </Card>
          ))}
        </div>
        {detailed && (
          <Card className="border-border p-6">
            <Skeleton className="mb-6 h-6 w-48 rounded" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-4 w-24 rounded" />
                  <Skeleton className="h-3 flex-1 rounded-full" />
                  <Skeleton className="h-4 w-12 rounded" />
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Empty state when no analyses have been performed
  if (trends.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold">
            <Shield className="text-primary dark:text-primary h-6 w-6" />
            Security Analytics
          </h2>
          <p className="text-muted-foreground">
            Comprehensive overview of your security posture and trends
          </p>
        </div>
        <Card className="border-border bg-muted/50 text-center/50 border-2 border-dashed p-12">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
            <Shield className="text-primary dark:text-primary h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-2 text-xl font-semibold">
            No Security Data Yet
          </h3>
          <p className="text-muted-foreground mx-auto max-w-md">
            Analyze your first repository to see security analytics. Go to the
            Repositories tab and analyze a GitHub repository to get started.
          </p>
        </Card>
      </div>
    );
  }
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-foreground mb-2 flex items-center gap-2 text-2xl font-bold">
          <Shield className="text-primary dark:text-primary h-6 w-6" />
          Security Analytics
        </h2>
        <p className="text-muted-foreground">
          Comprehensive overview of your security posture and trends
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        <Card className="group border-border p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="bg-muted rounded-xl p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-teal-900/20">
              <Activity className="text-primary dark:text-primary h-6 w-6" />
            </div>
            {stats.trend === "up" ? (
              <div className="flex items-center rounded-full bg-green-50 px-2 py-1 text-sm font-medium text-green-600 dark:bg-green-900/20">
                <TrendingUp className="mr-1 h-3 w-3" />
                +2.4%
              </div>
            ) : (
              <div className="flex items-center rounded-full bg-red-50 px-2 py-1 text-sm font-medium text-red-600 dark:bg-red-900/20">
                <TrendingDown className="mr-1 h-3 w-3" />
                -1.2%
              </div>
            )}
          </div>
          <div className="text-foreground mb-1 text-3xl font-bold tracking-tight">
            {stats.averageScore.toFixed(1)}
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            Average Security Score
          </div>
        </Card>

        <Card className="group border-border p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-yellow-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-yellow-900/20">
              <AlertTriangle className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="text-foreground mb-1 text-3xl font-bold tracking-tight">
            {stats.totalIssues.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            Total Issues Found
          </div>
        </Card>

        <Card className="group border-border p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-red-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-red-900/20">
              <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="text-foreground mb-1 text-3xl font-bold tracking-tight">
            {stats.criticalIssues.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            Critical Issues
          </div>
        </Card>

        <Card className="group border-border p-6 transition-all duration-300 hover:shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="rounded-xl bg-green-50 p-3 transition-transform duration-300 group-hover:scale-110 dark:bg-green-900/20">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="text-foreground mb-1 text-3xl font-bold tracking-tight">
            {trends.length.toLocaleString()}
          </div>
          <div className="text-muted-foreground text-sm font-medium">
            Analyses Completed
          </div>
        </Card>
      </div>

      {/* Trend Chart */}
      {detailed && trends.length > 0 && (
        <Card className="border-border p-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-foreground mb-1 text-lg font-bold">
                Security Score Trend
              </h3>
              <p className="text-muted-foreground text-sm">
                Historical performance of your repository security scores
              </p>
            </div>
            <div className="flex gap-2">
              <div className="text-muted-foreground flex items-center text-xs">
                <div className="mr-1 h-2 w-2 rounded-full bg-green-500"></div>{" "}
                Excellent
              </div>
              <div className="text-muted-foreground flex items-center text-xs">
                <div className="mr-1 h-2 w-2 rounded-full bg-yellow-500"></div>{" "}
                Good
              </div>
              <div className="text-muted-foreground flex items-center text-xs">
                <div className="mr-1 h-2 w-2 rounded-full bg-red-500"></div>{" "}
                Poor
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {trends.slice(0, 10).map((trend, index) => (
              <div key={index} className="group">
                <div className="mb-2 flex items-end justify-between text-sm">
                  <span className="text-foreground/80 font-medium">
                    {new Date(trend.date).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span className="text-muted-foreground">
                    {trend.issues} issues found
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="bg-muted h-3 flex-1 overflow-hidden rounded-full">
                    <div
                      className={cn(
                        "relative h-full rounded-full transition-all duration-1000 ease-out",
                        trend.score >= 8
                          ? "bg-gradient-to-r from-green-500 to-emerald-400"
                          : trend.score >= 6
                            ? "bg-gradient-to-r from-yellow-500 to-orange-400"
                            : "bg-gradient-to-r from-red-500 to-rose-400"
                      )}
                      style={{ width: `${(trend.score / 10) * 100}%` }}
                    >
                      <div className="bg-background/20 absolute inset-0 transition-colors group-hover:bg-transparent" />
                    </div>
                  </div>
                  <div className="text-foreground w-12 text-right font-bold">
                    {trend.score.toFixed(1)}
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
