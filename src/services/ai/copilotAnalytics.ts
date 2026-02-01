// src/services/ai/copilotAnalytics.ts
// Analytics service for tracking GitHub Copilot usage and performance

import { logger } from "@/utils/logger";

export interface CopilotUsageMetrics {
  requestId: string;
  modelId: string;
  timestamp: number;
  duration: number; // milliseconds
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  success: boolean;
  errorType?: string;
  errorMessage?: string;
}

export interface CopilotModelStats {
  modelId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokens: number;
  totalDuration: number;
  averageTokensPerRequest: number;
  averageDuration: number;
  successRate: number;
  lastUsed: number;
}

export interface CopilotAnalyticsData {
  totalRequests: number;
  totalTokens: number;
  totalDuration: number;
  successRate: number;
  modelStats: Record<string, CopilotModelStats>;
  recentRequests: CopilotUsageMetrics[];
}

/**
 * Analytics service for GitHub Copilot usage tracking
 */
export class CopilotAnalyticsService {
  private static instance: CopilotAnalyticsService;
  private readonly STORAGE_KEY = "copilot_analytics";
  private readonly MAX_RECENT_REQUESTS = 100;
  private metrics: CopilotUsageMetrics[] = [];
  private sessionStartTime: number = Date.now();

  private constructor() {
    this.loadMetrics();
  }

  public static getInstance(): CopilotAnalyticsService {
    if (!CopilotAnalyticsService.instance) {
      CopilotAnalyticsService.instance = new CopilotAnalyticsService();
    }
    return CopilotAnalyticsService.instance;
  }

  /**
   * Load metrics from localStorage
   */
  private loadMetrics(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = data.metrics || [];
        this.sessionStartTime = data.sessionStartTime || Date.now();

        // Clean up old metrics (keep last 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        this.metrics = this.metrics.filter((m) => m.timestamp > sevenDaysAgo);
      }
    } catch (error) {
      logger.error("Error loading Copilot analytics:", error);
      this.metrics = [];
    }
  }

  /**
   * Save metrics to localStorage
   */
  private saveMetrics(): void {
    try {
      const data = {
        metrics: this.metrics.slice(-this.MAX_RECENT_REQUESTS),
        sessionStartTime: this.sessionStartTime,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      logger.error("Error saving Copilot analytics:", error);
    }
  }

  /**
   * Track a Copilot API request
   */
  public trackRequest(metrics: CopilotUsageMetrics): void {
    this.metrics.push(metrics);

    // Keep only recent requests in memory
    if (this.metrics.length > this.MAX_RECENT_REQUESTS) {
      this.metrics = this.metrics.slice(-this.MAX_RECENT_REQUESTS);
    }

    this.saveMetrics();

    logger.debug("Copilot request tracked:", {
      modelId: metrics.modelId,
      duration: metrics.duration,
      tokens: metrics.totalTokens,
      success: metrics.success,
    });
  }

  /**
   * Start tracking a request (returns a tracking function)
   */
  public startTracking(
    modelId: string
  ): (
    success: boolean,
    tokens?: { prompt: number; completion: number; total: number },
    error?: Error
  ) => void {
    const startTime = Date.now();
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return (
      success: boolean,
      tokens?: { prompt: number; completion: number; total: number },
      error?: Error
    ) => {
      const duration = Date.now() - startTime;

      const metrics: CopilotUsageMetrics = {
        requestId,
        modelId,
        timestamp: startTime,
        duration,
        promptTokens: tokens?.prompt || 0,
        completionTokens: tokens?.completion || 0,
        totalTokens: tokens?.total || 0,
        success,
        errorType: error?.name,
        errorMessage: error?.message,
      };

      this.trackRequest(metrics);
    };
  }

  /**
   * Get analytics data for all models
   */
  public getAnalytics(): CopilotAnalyticsData {
    const modelStatsMap: Record<string, CopilotModelStats> = {};

    // Calculate per-model statistics
    this.metrics.forEach((metric) => {
      if (!modelStatsMap[metric.modelId]) {
        modelStatsMap[metric.modelId] = {
          modelId: metric.modelId,
          totalRequests: 0,
          successfulRequests: 0,
          failedRequests: 0,
          totalTokens: 0,
          totalDuration: 0,
          averageTokensPerRequest: 0,
          averageDuration: 0,
          successRate: 0,
          lastUsed: 0,
        };
      }

      const stats = modelStatsMap[metric.modelId];
      stats.totalRequests++;
      stats.totalTokens += metric.totalTokens;
      stats.totalDuration += metric.duration;
      stats.lastUsed = Math.max(stats.lastUsed, metric.timestamp);

      if (metric.success) {
        stats.successfulRequests++;
      } else {
        stats.failedRequests++;
      }
    });

    // Calculate averages and rates
    Object.values(modelStatsMap).forEach((stats) => {
      stats.averageTokensPerRequest =
        stats.totalRequests > 0 ? stats.totalTokens / stats.totalRequests : 0;
      stats.averageDuration =
        stats.totalRequests > 0 ? stats.totalDuration / stats.totalRequests : 0;
      stats.successRate =
        stats.totalRequests > 0
          ? stats.successfulRequests / stats.totalRequests
          : 0;
    });

    // Calculate overall statistics
    const totalRequests = this.metrics.length;
    const successfulRequests = this.metrics.filter((m) => m.success).length;
    const totalTokens = this.metrics.reduce((sum, m) => sum + m.totalTokens, 0);
    const totalDuration = this.metrics.reduce((sum, m) => sum + m.duration, 0);

    return {
      totalRequests,
      totalTokens,
      totalDuration,
      successRate: totalRequests > 0 ? successfulRequests / totalRequests : 0,
      modelStats: modelStatsMap,
      recentRequests: this.metrics.slice(-20).reverse(), // Last 20 requests
    };
  }

  /**
   * Get statistics for a specific model
   */
  public getModelStats(modelId: string): CopilotModelStats | null {
    const analytics = this.getAnalytics();
    return analytics.modelStats[modelId] || null;
  }

  /**
   * Get usage statistics for a time period
   */
  public getUsageByPeriod(periodMs: number): {
    requests: number;
    tokens: number;
    duration: number;
  } {
    const cutoffTime = Date.now() - periodMs;
    const periodMetrics = this.metrics.filter((m) => m.timestamp > cutoffTime);

    return {
      requests: periodMetrics.length,
      tokens: periodMetrics.reduce((sum, m) => sum + m.totalTokens, 0),
      duration: periodMetrics.reduce((sum, m) => sum + m.duration, 0),
    };
  }

  /**
   * Get usage statistics for today
   */
  public getTodayUsage() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return this.getUsageByPeriod(Date.now() - today.getTime());
  }

  /**
   * Get usage statistics for this session
   */
  public getSessionUsage() {
    return this.getUsageByPeriod(Date.now() - this.sessionStartTime);
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): {
    totalErrors: number;
    errorsByType: Record<string, number>;
    recentErrors: CopilotUsageMetrics[];
  } {
    const errors = this.metrics.filter((m) => !m.success);
    const errorsByType: Record<string, number> = {};

    errors.forEach((error) => {
      const type = error.errorType || "Unknown";
      errorsByType[type] = (errorsByType[type] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      errorsByType,
      recentErrors: errors.slice(-10).reverse(),
    };
  }

  /**
   * Clear all analytics data
   */
  public clearAnalytics(): void {
    this.metrics = [];
    this.sessionStartTime = Date.now();
    localStorage.removeItem(this.STORAGE_KEY);
    logger.debug("Copilot analytics cleared");
  }

  /**
   * Export analytics data as JSON
   */
  public exportAnalytics(): string {
    const analytics = this.getAnalytics();
    return JSON.stringify(analytics, null, 2);
  }

  /**
   * Get performance insights
   */
  public getPerformanceInsights(): {
    fastestModel: string | null;
    mostReliableModel: string | null;
    mostUsedModel: string | null;
    averageResponseTime: number;
    recommendations: string[];
  } {
    const analytics = this.getAnalytics();
    const models = Object.values(analytics.modelStats);

    if (models.length === 0) {
      return {
        fastestModel: null,
        mostReliableModel: null,
        mostUsedModel: null,
        averageResponseTime: 0,
        recommendations: [
          "No usage data available yet. Start using Copilot to see insights.",
        ],
      };
    }

    // Find fastest model (lowest average duration)
    const fastestModel = models.reduce((fastest, model) =>
      model.averageDuration < fastest.averageDuration ? model : fastest
    );

    // Find most reliable model (highest success rate)
    const mostReliableModel = models.reduce((reliable, model) =>
      model.successRate > reliable.successRate ? model : reliable
    );

    // Find most used model
    const mostUsedModel = models.reduce((used, model) =>
      model.totalRequests > used.totalRequests ? model : used
    );

    // Calculate average response time across all models
    const averageResponseTime =
      analytics.totalDuration / analytics.totalRequests || 0;

    // Generate recommendations
    const recommendations: string[] = [];

    if (analytics.successRate < 0.9) {
      recommendations.push(
        `Success rate is ${(analytics.successRate * 100).toFixed(1)}%. Consider checking your network connection.`
      );
    }

    if (averageResponseTime > 5000) {
      recommendations.push(
        `Average response time is ${(averageResponseTime / 1000).toFixed(1)}s. Try using ${fastestModel.modelId} for faster responses.`
      );
    }

    if (
      mostReliableModel.successRate > 0.95 &&
      mostReliableModel.modelId !== mostUsedModel.modelId
    ) {
      recommendations.push(
        `${mostReliableModel.modelId} has the highest success rate (${(mostReliableModel.successRate * 100).toFixed(1)}%). Consider using it more often.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push(
        "Performance is optimal! Keep using your current model selection."
      );
    }

    return {
      fastestModel: fastestModel.modelId,
      mostReliableModel: mostReliableModel.modelId,
      mostUsedModel: mostUsedModel.modelId,
      averageResponseTime,
      recommendations,
    };
  }
}

// Export singleton instance
export const copilotAnalytics = CopilotAnalyticsService.getInstance();
