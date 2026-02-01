// src/services/ai/__tests__/copilotAnalytics.test.ts
// Unit tests for Copilot analytics service

import { describe, it, expect, beforeEach } from "vitest";
import { CopilotAnalyticsService } from "../copilotAnalytics";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(global, "localStorage", {
  value: localStorageMock,
});

describe("CopilotAnalyticsService", () => {
  let service: CopilotAnalyticsService;

  beforeEach(() => {
    localStorageMock.clear();
    service = (CopilotAnalyticsService as any).instance = null;
    service = CopilotAnalyticsService.getInstance();
  });

  describe("Singleton Pattern", () => {
    it("should return the same instance", () => {
      const instance1 = CopilotAnalyticsService.getInstance();
      const instance2 = CopilotAnalyticsService.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe("Request Tracking", () => {
    it("should track successful requests", () => {
      const metrics = {
        requestId: "req_123",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 1500,
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        success: true,
      };

      service.trackRequest(metrics);
      const analytics = service.getAnalytics();

      expect(analytics.totalRequests).toBe(1);
      expect(analytics.totalTokens).toBe(150);
      expect(analytics.successRate).toBe(1);
    });

    it("should track failed requests", () => {
      const metrics = {
        requestId: "req_124",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 500,
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        success: false,
        errorType: "RateLimitError",
        errorMessage: "Rate limit exceeded",
      };

      service.trackRequest(metrics);
      const errorStats = service.getErrorStats();

      expect(errorStats.totalErrors).toBe(1);
      expect(errorStats.errorsByType["RateLimitError"]).toBe(1);
    });

    it("should use tracking helper", () => {
      const endTracking = service.startTracking("gpt-4o");

      // Simulate successful completion
      endTracking(true, { prompt: 100, completion: 50, total: 150 });

      const analytics = service.getAnalytics();
      expect(analytics.totalRequests).toBe(1);
      expect(analytics.totalTokens).toBe(150);
    });
  });

  describe("Model Statistics", () => {
    it("should calculate per-model statistics", () => {
      service.trackRequest({
        requestId: "req_1",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 1000,
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
        success: true,
      });

      service.trackRequest({
        requestId: "req_2",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 2000,
        promptTokens: 200,
        completionTokens: 100,
        totalTokens: 300,
        success: true,
      });

      const stats = service.getModelStats("gpt-4o");
      expect(stats?.totalRequests).toBe(2);
      expect(stats?.totalTokens).toBe(450);
      expect(stats?.averageDuration).toBe(1500);
      expect(stats?.successRate).toBe(1);
    });

    it("should track multiple models separately", () => {
      service.trackRequest({
        requestId: "req_1",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 1000,
        totalTokens: 150,
        promptTokens: 100,
        completionTokens: 50,
        success: true,
      });

      service.trackRequest({
        requestId: "req_2",
        modelId: "gpt-3.5-turbo",
        timestamp: Date.now(),
        duration: 500,
        totalTokens: 100,
        promptTokens: 70,
        completionTokens: 30,
        success: true,
      });

      const analytics = service.getAnalytics();
      expect(Object.keys(analytics.modelStats).length).toBe(2);
      expect(analytics.modelStats["gpt-4o"]).toBeDefined();
      expect(analytics.modelStats["gpt-3.5-turbo"]).toBeDefined();
    });
  });

  describe("Time Period Analytics", () => {
    it("should get usage by period", () => {
      const now = Date.now();

      service.trackRequest({
        requestId: "req_1",
        modelId: "gpt-4o",
        timestamp: now - 1000,
        duration: 1000,
        totalTokens: 150,
        promptTokens: 100,
        completionTokens: 50,
        success: true,
      });

      const usage = service.getUsageByPeriod(5000);
      expect(usage.requests).toBe(1);
      expect(usage.tokens).toBe(150);
    });

    it("should filter out old requests", () => {
      const now = Date.now();

      service.trackRequest({
        requestId: "req_old",
        modelId: "gpt-4o",
        timestamp: now - 10000,
        duration: 1000,
        totalTokens: 150,
        promptTokens: 100,
        completionTokens: 50,
        success: true,
      });

      const usage = service.getUsageByPeriod(5000);
      expect(usage.requests).toBe(0);
    });
  });

  describe("Performance Insights", () => {
    beforeEach(() => {
      // Add sample data
      service.trackRequest({
        requestId: "req_1",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 2000,
        totalTokens: 150,
        promptTokens: 100,
        completionTokens: 50,
        success: true,
      });

      service.trackRequest({
        requestId: "req_2",
        modelId: "gpt-3.5-turbo",
        timestamp: Date.now(),
        duration: 1000,
        totalTokens: 100,
        promptTokens: 70,
        completionTokens: 30,
        success: true,
      });
    });

    it("should identify fastest model", () => {
      const insights = service.getPerformanceInsights();
      expect(insights.fastestModel).toBe("gpt-3.5-turbo");
    });

    it("should provide recommendations", () => {
      const insights = service.getPerformanceInsights();
      expect(insights.recommendations).toBeDefined();
      expect(insights.recommendations.length).toBeGreaterThan(0);
    });
  });

  describe("Data Persistence", () => {
    it("should persist analytics to localStorage", () => {
      service.trackRequest({
        requestId: "req_1",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 1000,
        totalTokens: 150,
        promptTokens: 100,
        completionTokens: 50,
        success: true,
      });

      const stored = localStorageMock.getItem("copilot_analytics");
      expect(stored).toBeDefined();
    });

    it("should load analytics from localStorage", () => {
      const data = {
        metrics: [
          {
            requestId: "req_1",
            modelId: "gpt-4o",
            timestamp: Date.now(),
            duration: 1000,
            totalTokens: 150,
            promptTokens: 100,
            completionTokens: 50,
            success: true,
          },
        ],
        sessionStartTime: Date.now(),
      };

      localStorageMock.setItem("copilot_analytics", JSON.stringify(data));

      // Create new instance to test loading
      service = (CopilotAnalyticsService as any).instance = null;
      service = CopilotAnalyticsService.getInstance();

      const analytics = service.getAnalytics();
      expect(analytics.totalRequests).toBe(1);
    });

    it("should clear analytics", () => {
      service.trackRequest({
        requestId: "req_1",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 1000,
        totalTokens: 150,
        promptTokens: 100,
        completionTokens: 50,
        success: true,
      });

      service.clearAnalytics();

      const analytics = service.getAnalytics();
      expect(analytics.totalRequests).toBe(0);
    });
  });

  describe("Export", () => {
    it("should export analytics as JSON", () => {
      service.trackRequest({
        requestId: "req_1",
        modelId: "gpt-4o",
        timestamp: Date.now(),
        duration: 1000,
        totalTokens: 150,
        promptTokens: 100,
        completionTokens: 50,
        success: true,
      });

      const exported = service.exportAnalytics();
      expect(exported).toBeDefined();

      const parsed = JSON.parse(exported);
      expect(parsed.totalRequests).toBe(1);
    });
  });
});
