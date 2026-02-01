// src/components/ai/CopilotAnalyticsDashboard.tsx
// Analytics dashboard for GitHub Copilot usage

"use client";

import React, { useState, useEffect } from "react";
import { copilotAnalytics } from "@/services/ai/copilotAnalytics";
import type { CopilotAnalyticsData } from "@/services/ai/copilotAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  TrendingUp,
  Clock,
  Zap,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function CopilotAnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<CopilotAnalyticsData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const data = copilotAnalytics.getAnalytics();
    setAnalytics(data);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleExport = () => {
    const json = copilotAnalytics.exportAnalytics();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `copilot-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to clear all analytics data?")) {
      copilotAnalytics.clearAnalytics();
      handleRefresh();
    }
  };

  if (!analytics) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
        <span className="text-muted-foreground ml-2 text-sm">
          Loading analytics...
        </span>
      </div>
    );
  }

  const todayUsage = copilotAnalytics.getTodayUsage();
  const sessionUsage = copilotAnalytics.getSessionUsage();
  const errorStats = copilotAnalytics.getErrorStats();
  const insights = copilotAnalytics.getPerformanceInsights();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Copilot Analytics</h2>
          <p className="text-muted-foreground text-sm">
            Track your AI usage and performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={handleClear}>
            Clear Data
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Requests</p>
                <p className="text-2xl font-bold">{analytics.totalRequests}</p>
              </div>
              <div className="rounded-full bg-blue-100 p-3 dark:bg-blue-900/30">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="text-muted-foreground mt-2 flex items-center text-xs">
              <TrendingUp className="mr-1 h-3 w-3" />
              <span>{sessionUsage.requests} this session</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Total Tokens</p>
                <p className="text-2xl font-bold">
                  {analytics.totalTokens.toLocaleString()}
                </p>
              </div>
              <div className="rounded-full bg-purple-100 p-3 dark:bg-purple-900/30">
                <Zap className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-muted-foreground mt-2 flex items-center text-xs">
              <span>{todayUsage.tokens.toLocaleString()} today</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Success Rate</p>
                <p className="text-2xl font-bold">
                  {(analytics.successRate * 100).toFixed(1)}%
                </p>
              </div>
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900/30">
                <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <Progress value={analytics.successRate * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm">Avg Response</p>
                <p className="text-2xl font-bold">
                  {(insights.averageResponseTime / 1000).toFixed(1)}s
                </p>
              </div>
              <div className="rounded-full bg-orange-100 p-3 dark:bg-orange-900/30">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="text-muted-foreground mt-2 flex items-center text-xs">
              <span>Average response time</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Lightbulb className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <CardTitle>Performance Insights</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950/20">
              <p className="text-muted-foreground mb-1 text-xs">
                Fastest Model
              </p>
              <p className="font-semibold">{insights.fastestModel || "N/A"}</p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
              <p className="text-muted-foreground mb-1 text-xs">
                Most Reliable
              </p>
              <p className="font-semibold">
                {insights.mostReliableModel || "N/A"}
              </p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 dark:border-purple-800 dark:bg-purple-950/20">
              <p className="text-muted-foreground mb-1 text-xs">Most Used</p>
              <p className="font-semibold">{insights.mostUsedModel || "N/A"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold">Recommendations:</p>
            {insights.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20"
              >
                <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {rec}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Model Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.values(analytics.modelStats).map((stats) => (
              <div
                key={stats.modelId}
                className="rounded-lg border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{stats.modelId}</h4>
                    <p className="text-muted-foreground text-xs">
                      Last used: {new Date(stats.lastUsed).toLocaleString()}
                    </p>
                  </div>
                  <Badge
                    variant={
                      stats.successRate > 0.9
                        ? "default"
                        : stats.successRate > 0.7
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {(stats.successRate * 100).toFixed(1)}% success
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                  <div>
                    <p className="text-muted-foreground">Requests</p>
                    <p className="font-semibold">{stats.totalRequests}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Tokens</p>
                    <p className="font-semibold">
                      {stats.totalTokens.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Tokens</p>
                    <p className="font-semibold">
                      {Math.round(stats.averageTokensPerRequest)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Avg Time</p>
                    <p className="font-semibold">
                      {(stats.averageDuration / 1000).toFixed(2)}s
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center space-x-4 text-xs">
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    <span>{stats.successfulRequests} success</span>
                  </div>
                  {stats.failedRequests > 0 && (
                    <div className="flex items-center text-red-600 dark:text-red-400">
                      <XCircle className="mr-1 h-3 w-3" />
                      <span>{stats.failedRequests} failed</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {Object.keys(analytics.modelStats).length === 0 && (
              <div className="text-muted-foreground py-8 text-center">
                <BarChart3 className="mx-auto mb-2 h-12 w-12 opacity-50" />
                <p>No model usage data yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Statistics */}
      {errorStats.totalErrors > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Error Analysis</CardTitle>
              <Badge variant="destructive">
                {errorStats.totalErrors} errors
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="mb-2 text-sm font-semibold">Errors by Type:</p>
                <div className="space-y-2">
                  {Object.entries(errorStats.errorsByType).map(
                    ([type, count]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between rounded bg-red-50 p-2 dark:bg-red-950/20"
                      >
                        <span className="text-sm">{type}</span>
                        <Badge variant="destructive">{count}</Badge>
                      </div>
                    )
                  )}
                </div>
              </div>

              {errorStats.recentErrors.length > 0 && (
                <div>
                  <p className="mb-2 text-sm font-semibold">Recent Errors:</p>
                  <div className="space-y-2">
                    {errorStats.recentErrors.map((error) => (
                      <div
                        key={error.requestId}
                        className="rounded-lg bg-red-50 p-3 text-xs dark:bg-red-950/20"
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <span className="font-semibold">{error.modelId}</span>
                          <span className="text-muted-foreground">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-red-700 dark:text-red-300">
                          {error.errorMessage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
