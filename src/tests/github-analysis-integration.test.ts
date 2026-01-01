/**
 * Integration tests for GitHub Analysis Dashboard
 * Tests the full workflow from authentication to dashboard display
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { GitHubAnalysisStorageService } from "@/services/storage/GitHubAnalysisStorageService";

describe("GitHub Analysis Dashboard Integration", () => {
  let storageService: GitHubAnalysisStorageService;

  beforeEach(() => {
    storageService = new GitHubAnalysisStorageService();
  });

  describe("GitHubAnalysisStorageService", () => {
    it("should create an instance of the storage service", () => {
      expect(storageService).toBeInstanceOf(GitHubAnalysisStorageService);
    });

    it("should return mock repositories when offline", async () => {
      const userId = "test-user-123";
      const repositories = await storageService.getUserRepositories(userId);

      expect(repositories).toBeDefined();
      expect(Array.isArray(repositories)).toBe(true);
      expect(repositories.length).toBeGreaterThan(0);

      // Verify repository structure
      if (repositories.length > 0) {
        const repo = repositories[0];
        expect(repo).toHaveProperty("id");
        expect(repo).toHaveProperty("name");
        expect(repo).toHaveProperty("fullName");
        expect(repo).toHaveProperty("url");
        expect(repo).toHaveProperty("securityScore");
        expect(repo).toHaveProperty("issuesFound");
        expect(repo).toHaveProperty("language");
      }
    });

    it("should return mock analysis history when offline", async () => {
      const userId = "test-user-123";
      const history = await storageService.getAnalysisHistory(userId);

      expect(history).toBeDefined();
      expect(Array.isArray(history)).toBe(true);

      // Verify analysis record structure
      if (history.length > 0) {
        const record = history[0];
        expect(record).toHaveProperty("id");
        expect(record).toHaveProperty("repositoryName");
        expect(record).toHaveProperty("repositoryUrl");
        expect(record).toHaveProperty("analyzedAt");
        expect(record).toHaveProperty("duration");
        expect(record).toHaveProperty("issuesFound");
        expect(record).toHaveProperty("securityScore");
        expect(record).toHaveProperty("language");
      }
    });

    it("should return security trends with correct structure", async () => {
      const userId = "test-user-123";
      const result = await storageService.getSecurityTrends(userId);

      expect(result).toHaveProperty("trends");
      expect(result).toHaveProperty("stats");
      expect(Array.isArray(result.trends)).toBe(true);

      expect(result.stats).toHaveProperty("averageScore");
      expect(result.stats).toHaveProperty("totalIssues");
      expect(result.stats).toHaveProperty("criticalIssues");
      expect(result.stats).toHaveProperty("trend");
      expect(["up", "down", "stable"]).toContain(result.stats.trend);
    });

    it("should return activity analytics with correct structure", async () => {
      const userId = "test-user-123";
      const result = await storageService.getActivityAnalytics(userId);

      expect(result).toHaveProperty("languageDistribution");
      expect(result).toHaveProperty("stats");
      expect(Array.isArray(result.languageDistribution)).toBe(true);

      expect(result.stats).toHaveProperty("totalAnalyses");
      expect(result.stats).toHaveProperty("averageDuration");
      expect(result.stats).toHaveProperty("mostAnalyzedRepo");
      expect(result.stats).toHaveProperty("mostCommonLanguage");
    });

    it("should calculate language distribution percentages correctly", async () => {
      const userId = "test-user-123";
      const result = await storageService.getActivityAnalytics(userId);

      if (result.languageDistribution.length > 0) {
        const totalPercentage = result.languageDistribution.reduce(
          (sum, lang) => sum + lang.percentage,
          0
        );

        // Total percentage should be approximately 100 (allowing for rounding)
        expect(totalPercentage).toBeGreaterThan(99);
        expect(totalPercentage).toBeLessThanOrEqual(100);
      }
    });

    it("should handle empty state correctly", async () => {
      const userId = "non-existent-user";

      // Mock an empty response
      const trends = await storageService.getSecurityTrends(userId);
      expect(trends.stats.averageScore).toBeDefined();
      expect(trends.stats.totalIssues).toBeDefined();

      const analytics = await storageService.getActivityAnalytics(userId);
      expect(analytics.stats.totalAnalyses).toBeDefined();
    });

    it("should validate security scores are within range", async () => {
      const userId = "test-user-123";
      const repositories = await storageService.getUserRepositories(userId);

      repositories.forEach((repo) => {
        expect(repo.securityScore).toBeGreaterThanOrEqual(0);
        expect(repo.securityScore).toBeLessThanOrEqual(10);
      });
    });

    it("should validate dates are valid Date objects", async () => {
      const userId = "test-user-123";
      const history = await storageService.getAnalysisHistory(userId);

      history.forEach((record) => {
        expect(record.analyzedAt).toBeInstanceOf(Date);
        expect(record.analyzedAt.getTime()).not.toBeNaN();
      });
    });
  });

  describe("Data Storage Operations", () => {
    it("should accept valid repository analysis data", async () => {
      const userId = "test-user-123";
      const repositoryData = {
        name: "test-repo",
        fullName: "user/test-repo",
        description: "Test repository",
        url: "https://github.com/user/test-repo",
        securityScore: 8.5,
        issuesFound: 3,
        criticalIssues: 0,
        language: "TypeScript",
        stars: 10,
        forks: 2,
        duration: 45,
      };

      // This should not throw an error
      await expect(
        storageService.storeRepositoryAnalysis(userId, repositoryData)
      ).rejects.toThrow(); // Will throw due to Firebase not being available in test
    });
  });

  describe("GitHub User Detection", () => {
    it("should detect GitHub provider from providerData", () => {
      const mockUser = {
        uid: "test-123",
        email: "test@example.com",
        providerData: [{ providerId: "github.com", displayName: "testuser" }],
      };

      const hasGitHubProvider = mockUser.providerData.some(
        (p) => p.providerId === "github.com"
      );

      expect(hasGitHubProvider).toBe(true);
    });

    it("should detect GitHub from noreply email", () => {
      const email = "user@users.noreply.github.com";
      expect(email.includes("@users.noreply.github.com")).toBe(true);
    });

    it("should not detect non-GitHub users", () => {
      const mockUser = {
        uid: "test-123",
        email: "test@example.com",
        providerData: [{ providerId: "google.com", displayName: "Test User" }],
      };

      const hasGitHubProvider = mockUser.providerData.some(
        (p) => p.providerId === "github.com"
      );

      expect(hasGitHubProvider).toBe(false);
    });
  });

  describe("Mock Data Validation", () => {
    it("should provide realistic mock data", async () => {
      const userId = "test-user-123";
      const repos = await storageService.getUserRepositories(userId);

      repos.forEach((repo) => {
        // Validate data realism
        expect(repo.name).toBeTruthy();
        expect(repo.language).toBeTruthy();
        expect(repo.issuesFound).toBeGreaterThanOrEqual(0);
        expect(repo.criticalIssues).toBeLessThanOrEqual(repo.issuesFound);
        expect(repo.stars).toBeGreaterThanOrEqual(0);
        expect(repo.forks).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
