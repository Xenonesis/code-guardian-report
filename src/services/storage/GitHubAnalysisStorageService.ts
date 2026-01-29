import {
  collection,
  doc,
  getDocs,
  setDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

import { logger } from "@/utils/logger";
interface Repository {
  id: string;
  name: string;
  fullName: string;
  description?: string;
  url: string;
  lastAnalyzed: Date;
  securityScore: number;
  issuesFound: number;
  criticalIssues: number;
  language: string;
  stars: number;
  forks: number;
}

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

interface SecurityTrend {
  date: string;
  score: number;
  issues: number;
}

interface LanguageDistribution {
  language: string;
  count: number;
  percentage: number;
}

export class GitHubAnalysisStorageService {
  private readonly GITHUB_ANALYSES_COLLECTION = "github_analyses";
  private readonly GITHUB_REPOSITORIES_COLLECTION = "github_repositories";

  /**
   * Get all repositories analyzed by a user
   */
  async getUserRepositories(userId: string): Promise<Repository[]> {
    try {
      const reposRef = collection(db, this.GITHUB_REPOSITORIES_COLLECTION);
      const q = query(
        reposRef,
        where("userId", "==", userId),
        orderBy("lastAnalyzed", "desc")
      );

      const querySnapshot = await getDocs(q);
      const repositories: Repository[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        repositories.push({
          id: doc.id,
          name: data.name,
          fullName: data.fullName,
          description: data.description,
          url: data.url,
          lastAnalyzed: data.lastAnalyzed?.toDate() || new Date(),
          securityScore: data.securityScore || 0,
          issuesFound: data.issuesFound || 0,
          criticalIssues: data.criticalIssues || 0,
          language:
            typeof data.language === "object" && data.language !== null
              ? data.language.name || "Unknown"
              : data.language || "Unknown",
          stars: data.stars || 0,
          forks: data.forks || 0,
        });
      });

      return repositories;
    } catch (error) {
      logger.error("Error fetching repositories:", error);
      logger.warn(
        "Using offline mode - Firebase unavailable. Returning empty data."
      );

      if (typeof window !== "undefined") {
        setTimeout(() => {
          const toastNotifications = (window as any).toastNotifications;
          if (toastNotifications) {
            toastNotifications.offline();
          } else if ((window as any).showToast) {
            (window as any).showToast(
              "warning",
              "Offline Mode",
              "Unable to fetch repositories. Please check your connection."
            );
          }
        }, 0);
      }

      // Return empty array instead of mock data in production
      if (process.env.NODE_ENV === "production") {
        return [];
      }

      // Only return mock data in development (with warning)
      if (typeof window !== "undefined" && (window as any).toastNotifications) {
        setTimeout(() => {
          (window as any).toastNotifications.mockDataWarning();
        }, 0);
      }
      return this.getMockRepositories();
    }
  }

  /**
   * Get analysis history for a user
   */
  async getAnalysisHistory(userId: string): Promise<AnalysisRecord[]> {
    try {
      const analysesRef = collection(db, this.GITHUB_ANALYSES_COLLECTION);
      const q = query(
        analysesRef,
        where("userId", "==", userId),
        orderBy("analyzedAt", "desc"),
        limit(50)
      );

      const querySnapshot = await getDocs(q);
      const analyses: AnalysisRecord[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        analyses.push({
          id: doc.id,
          repositoryName: data.repositoryName,
          repositoryUrl: data.repositoryUrl,
          analyzedAt: data.analyzedAt?.toDate() || new Date(),
          duration: data.duration || 0,
          issuesFound: data.issuesFound || 0,
          criticalIssues: data.criticalIssues || 0,
          securityScore: data.securityScore || 0,
          language:
            typeof data.language === "object" && data.language !== null
              ? data.language.name || "Unknown"
              : data.language || "Unknown",
        });
      });

      return analyses;
    } catch (error) {
      logger.error("Error fetching analysis history:", error);
      logger.warn(
        "Using offline mode - Firebase unavailable. Returning empty data."
      );

      if (typeof window !== "undefined") {
        setTimeout(() => {
          const serviceToasts = (window as any).toastNotifications?.services;
          if (serviceToasts) {
            serviceToasts.analysisHistory.loadError();
          } else if ((window as any).showToast) {
            (window as any).showToast(
              "warning",
              "Offline Mode",
              "Unable to fetch analysis history. Please check your connection."
            );
          }
        }, 0);
      }

      // Return empty array instead of mock data in production
      if (process.env.NODE_ENV === "production") {
        return [];
      }

      // Only return mock data in development (with warning)
      if (typeof window !== "undefined" && (window as any).toastNotifications) {
        setTimeout(() => {
          (window as any).toastNotifications.mockDataWarning();
        }, 0);
      }
      return this.getMockAnalysisHistory();
    }
  }

  /**
   * Get security trends for a user
   */
  async getSecurityTrends(userId: string): Promise<{
    trends: SecurityTrend[];
    stats: {
      averageScore: number;
      totalIssues: number;
      criticalIssues: number;
      trend: "up" | "down" | "stable";
    };
  }> {
    try {
      const analyses = await this.getAnalysisHistory(userId);

      if (analyses.length === 0) {
        return {
          trends: [],
          stats: {
            averageScore: 0,
            totalIssues: 0,
            criticalIssues: 0,
            trend: "stable",
          },
        };
      }

      // Create trends from analyses
      const trends: SecurityTrend[] = analyses.map((a) => ({
        date: a.analyzedAt.toISOString(),
        score: a.securityScore,
        issues: a.issuesFound,
      }));

      // Calculate stats
      const totalScore = analyses.reduce((sum, a) => sum + a.securityScore, 0);
      const totalIssues = analyses.reduce((sum, a) => sum + a.issuesFound, 0);
      const criticalIssues = analyses.reduce(
        (sum, a) => sum + a.criticalIssues,
        0
      );
      const averageScore = totalScore / analyses.length;

      // Determine trend
      let trend: "up" | "down" | "stable" = "stable";
      if (analyses.length >= 2) {
        const recentScore = analyses[0].securityScore;
        const previousScore = analyses[1].securityScore;
        if (recentScore > previousScore + 0.5) trend = "up";
        else if (recentScore < previousScore - 0.5) trend = "down";
      }

      return {
        trends,
        stats: {
          averageScore,
          totalIssues,
          criticalIssues,
          trend,
        },
      };
    } catch (error) {
      logger.error("Error fetching security trends:", error);
      logger.warn("Using offline mode - Firebase unavailable.");
      // Return empty data in production
      if (process.env.NODE_ENV === "production") {
        return {
          trends: [],
          stats: {
            averageScore: 0,
            totalIssues: 0,
            criticalIssues: 0,
            trend: "stable" as const,
          },
        };
      }
      // Only return mock data in development
      return this.getMockSecurityTrends();
    }
  }

  /**
   * Get activity analytics for a user
   */
  async getActivityAnalytics(userId: string): Promise<{
    languageDistribution: LanguageDistribution[];
    stats: {
      totalAnalyses: number;
      averageDuration: number;
      mostAnalyzedRepo: string;
      mostCommonLanguage: string;
    };
  }> {
    try {
      const analyses = await this.getAnalysisHistory(userId);

      if (analyses.length === 0) {
        return {
          languageDistribution: [],
          stats: {
            totalAnalyses: 0,
            averageDuration: 0,
            mostAnalyzedRepo: "",
            mostCommonLanguage: "",
          },
        };
      }

      // Calculate language distribution
      const languageCount: { [key: string]: number } = {};
      analyses.forEach((a) => {
        languageCount[a.language] = (languageCount[a.language] || 0) + 1;
      });

      const languageDistribution: LanguageDistribution[] = Object.entries(
        languageCount
      )
        .map(([language, count]) => ({
          language,
          count,
          percentage: (count / analyses.length) * 100,
        }))
        .sort((a, b) => b.count - a.count);

      // Calculate stats
      const totalDuration = analyses.reduce((sum, a) => sum + a.duration, 0);
      const averageDuration = Math.round(totalDuration / analyses.length);

      // Find most analyzed repo
      const repoCount: { [key: string]: number } = {};
      analyses.forEach((a) => {
        repoCount[a.repositoryName] = (repoCount[a.repositoryName] || 0) + 1;
      });
      const mostAnalyzedRepo =
        Object.entries(repoCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

      // Most common language
      const mostCommonLanguage = languageDistribution[0]?.language || "";

      return {
        languageDistribution,
        stats: {
          totalAnalyses: analyses.length,
          averageDuration,
          mostAnalyzedRepo,
          mostCommonLanguage,
        },
      };
    } catch (error) {
      logger.error("Error fetching activity analytics:", error);
      logger.warn("Using offline mode - Firebase unavailable.");
      // Return empty data in production
      if (process.env.NODE_ENV === "production") {
        return {
          languageDistribution: [],
          stats: {
            totalAnalyses: 0,
            averageDuration: 0,
            mostAnalyzedRepo: "",
            mostCommonLanguage: "",
          },
        };
      }
      // Only return mock data in development
      return this.getMockActivityAnalytics();
    }
  }

  /**
   * Store a repository analysis
   */
  async storeRepositoryAnalysis(
    userId: string,
    repositoryData: {
      name: string;
      fullName: string;
      description?: string;
      url: string;
      securityScore: number;
      issuesFound: number;
      criticalIssues: number;
      language: string;
      stars?: number;
      forks?: number;
      duration: number;
    }
  ): Promise<void> {
    try {
      // Store analysis record
      const analysisRef = doc(collection(db, this.GITHUB_ANALYSES_COLLECTION));
      await setDoc(analysisRef, {
        userId,
        repositoryName: repositoryData.name,
        repositoryUrl: repositoryData.url,
        analyzedAt: new Date(),
        duration: repositoryData.duration,
        issuesFound: repositoryData.issuesFound,
        criticalIssues: repositoryData.criticalIssues,
        securityScore: repositoryData.securityScore,
        language: repositoryData.language,
      });

      // Update or create repository record
      const repoId = `${userId}_${repositoryData.fullName.replace(/\//g, "_")}`;
      const repoRef = doc(db, this.GITHUB_REPOSITORIES_COLLECTION, repoId);
      await setDoc(
        repoRef,
        {
          userId,
          name: repositoryData.name,
          fullName: repositoryData.fullName,
          description: repositoryData.description,
          url: repositoryData.url,
          lastAnalyzed: new Date(),
          securityScore: repositoryData.securityScore,
          issuesFound: repositoryData.issuesFound,
          criticalIssues: repositoryData.criticalIssues,
          language: repositoryData.language,
          stars: repositoryData.stars || 0,
          forks: repositoryData.forks || 0,
        },
        { merge: true }
      );
    } catch (error) {
      logger.error("Error storing repository analysis:", error);
      throw error;
    }
  }

  // Mock data methods for offline/fallback scenarios
  private getMockRepositories(): Repository[] {
    return [
      {
        id: "mock-1",
        name: "code-guardian",
        fullName: "user/code-guardian",
        description: "Advanced security analysis tool",
        url: "https://github.com/user/code-guardian",
        lastAnalyzed: new Date(Date.now() - 86400000),
        securityScore: 8.5,
        issuesFound: 3,
        criticalIssues: 0,
        language: "TypeScript",
        stars: 42,
        forks: 8,
      },
      {
        id: "mock-2",
        name: "api-gateway",
        fullName: "user/api-gateway",
        description: "Microservices API gateway",
        url: "https://github.com/user/api-gateway",
        lastAnalyzed: new Date(Date.now() - 172800000),
        securityScore: 7.2,
        issuesFound: 8,
        criticalIssues: 2,
        language: "JavaScript",
        stars: 28,
        forks: 5,
      },
    ];
  }

  private getMockAnalysisHistory(): AnalysisRecord[] {
    return [
      {
        id: "analysis-1",
        repositoryName: "code-guardian",
        repositoryUrl: "https://github.com/user/code-guardian",
        analyzedAt: new Date(Date.now() - 86400000),
        duration: 45,
        issuesFound: 3,
        criticalIssues: 0,
        securityScore: 8.5,
        language: "TypeScript",
      },
      {
        id: "analysis-2",
        repositoryName: "api-gateway",
        repositoryUrl: "https://github.com/user/api-gateway",
        analyzedAt: new Date(Date.now() - 172800000),
        duration: 62,
        issuesFound: 8,
        criticalIssues: 2,
        securityScore: 7.2,
        language: "JavaScript",
      },
    ];
  }

  private getMockSecurityTrends() {
    return {
      trends: [
        {
          date: new Date(Date.now() - 86400000).toISOString(),
          score: 8.5,
          issues: 3,
        },
        {
          date: new Date(Date.now() - 172800000).toISOString(),
          score: 7.2,
          issues: 8,
        },
      ],
      stats: {
        averageScore: 7.85,
        totalIssues: 11,
        criticalIssues: 2,
        trend: "up" as const,
      },
    };
  }

  private getMockActivityAnalytics() {
    return {
      languageDistribution: [
        { language: "TypeScript", count: 1, percentage: 50 },
        { language: "JavaScript", count: 1, percentage: 50 },
      ],
      stats: {
        totalAnalyses: 2,
        averageDuration: 54,
        mostAnalyzedRepo: "code-guardian",
        mostCommonLanguage: "TypeScript",
      },
    };
  }
}
