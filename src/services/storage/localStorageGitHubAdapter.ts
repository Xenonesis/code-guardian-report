import { SecurityIssue, AnalysisResults } from "@/types/security-types";
import { logger } from "@/utils/logger";

// Re-defining interfaces since they aren't exported from the service yet
// In a real refactor, these should be moved to a shared types file
export interface Repository {
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

export interface AnalysisRecord {
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

export interface SecurityTrend {
  date: string;
  score: number;
  issues: number;
}

export interface LanguageDistribution {
  language: string;
  count: number;
  percentage: number;
}

export interface DetailedAnalysisResult {
  repositoryName: string;
  language: string;
  issues: SecurityIssue[];
  analyzedAt: Date;
  metrics?: {
    totalLines?: number;
    totalFiles?: number;
    codeComplexity?: number;
    maintainabilityIndex?: number;
    testCoverage?: number;
    duplicatedLines?: number;
  };
}

const STORAGE_KEYS = {
  REPOSITORIES: "github_guardian_repositories",
  ANALYSES: "github_guardian_analyses",
  DETAILED_RESULTS: "github_guardian_detailed_results",
};

export class LocalStorageGitHubAdapter {
  private getStored<T>(key: string): T[] {
    if (typeof window === "undefined") return [];
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      logger.error(`Error reading from localStorage key ${key}:`, error);
      return [];
    }
  }

  private setStored<T>(key: string, data: T[]): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      logger.error(`Error writing to localStorage key ${key}:`, error);
    }
  }

  async getUserRepositories(userId: string): Promise<Repository[]> {
    const allRepos = this.getStored<Repository & { userId: string }>(
      STORAGE_KEYS.REPOSITORIES
    );
    return allRepos
      .filter((r) => r.userId === userId)
      .map((r) => ({
        ...r,
        lastAnalyzed: new Date(r.lastAnalyzed),
      }))
      .sort((a, b) => b.lastAnalyzed.getTime() - a.lastAnalyzed.getTime());
  }

  async getAnalysisHistory(userId: string): Promise<AnalysisRecord[]> {
    const allAnalyses = this.getStored<AnalysisRecord & { userId: string }>(
      STORAGE_KEYS.ANALYSES
    );
    return allAnalyses
      .filter((a) => a.userId === userId)
      .map((a) => ({
        ...a,
        analyzedAt: new Date(a.analyzedAt),
      }))
      .sort((a, b) => b.analyzedAt.getTime() - a.analyzedAt.getTime());
  }

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
    const now = new Date();

    // Store Analysis Record
    const allAnalyses = this.getStored<AnalysisRecord & { userId: string }>(
      STORAGE_KEYS.ANALYSES
    );
    const newAnalysis: AnalysisRecord & { userId: string } = {
      id: `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      repositoryName: repositoryData.name,
      repositoryUrl: repositoryData.url,
      analyzedAt: now,
      duration: repositoryData.duration,
      issuesFound: repositoryData.issuesFound,
      criticalIssues: repositoryData.criticalIssues,
      securityScore: repositoryData.securityScore,
      language: repositoryData.language,
    };
    this.setStored(STORAGE_KEYS.ANALYSES, [...allAnalyses, newAnalysis]);

    // Update Repository Record
    const allRepos = this.getStored<Repository & { userId: string }>(
      STORAGE_KEYS.REPOSITORIES
    );
    const repoIndex = allRepos.findIndex(
      (r) => r.userId === userId && r.fullName === repositoryData.fullName
    );

    const repoData: Repository & { userId: string } = {
      id: repoIndex >= 0 ? allRepos[repoIndex].id : `repo_${Date.now()}`,
      userId,
      name: repositoryData.name,
      fullName: repositoryData.fullName,
      description: repositoryData.description,
      url: repositoryData.url,
      lastAnalyzed: now,
      securityScore: repositoryData.securityScore,
      issuesFound: repositoryData.issuesFound,
      criticalIssues: repositoryData.criticalIssues,
      language: repositoryData.language,
      stars: repositoryData.stars || 0,
      forks: repositoryData.forks || 0,
    };

    if (repoIndex >= 0) {
      allRepos[repoIndex] = repoData;
    } else {
      allRepos.push(repoData);
    }
    this.setStored(STORAGE_KEYS.REPOSITORIES, allRepos);
  }

  async saveDetailedAnalysisResults(
    userId: string,
    repositoryName: string,
    results: AnalysisResults,
    language: string
  ): Promise<void> {
    const allDetailed = this.getStored<
      DetailedAnalysisResult & { userId: string }
    >(STORAGE_KEYS.DETAILED_RESULTS);

    const newDetailed: DetailedAnalysisResult & { userId: string } = {
      userId,
      repositoryName,
      language,
      issues: results.issues || [],
      analyzedAt: new Date(),
      metrics: {
        totalLines: results.summary?.linesAnalyzed || 0,
        totalFiles: results.totalFiles || 0,
        codeComplexity: results.metrics?.maintainabilityIndex
          ? Math.round(100 - results.metrics.maintainabilityIndex) / 10
          : 0,
        maintainabilityIndex: results.metrics?.maintainabilityIndex || 0,
        testCoverage: results.metrics?.testCoverage,
        duplicatedLines: results.metrics?.duplicatedLines || 0,
      },
    };

    // Keep only the latest 50 detailed results to avoid hitting localStorage limits
    const updatedDetailed = [newDetailed, ...allDetailed].slice(0, 50);
    this.setStored(STORAGE_KEYS.DETAILED_RESULTS, updatedDetailed);
  }

  async getDetailedAnalysisResults(
    userId: string,
    repositoryName?: string
  ): Promise<DetailedAnalysisResult[]> {
    const allDetailed = this.getStored<
      DetailedAnalysisResult & { userId: string }
    >(STORAGE_KEYS.DETAILED_RESULTS);

    return allDetailed
      .filter((d) => {
        if (d.userId !== userId) return false;
        if (
          repositoryName &&
          !d.repositoryName.toLowerCase().includes(repositoryName.toLowerCase())
        )
          return false;
        return true;
      })
      .map((d) => ({
        ...d,
        analyzedAt: new Date(d.analyzedAt),
      }));
  }

  async getSecurityTrends(userId: string): Promise<{
    trends: SecurityTrend[];
    stats: {
      averageScore: number;
      totalIssues: number;
      criticalIssues: number;
      trend: "up" | "down" | "stable";
    };
  }> {
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

    // Create trends
    const trends: SecurityTrend[] = analyses
      .map((a) => ({
        date: a.analyzedAt.toISOString(),
        score: a.securityScore,
        issues: a.issuesFound,
      }))
      .reverse(); // Oldest first for charts

    // Calculate stats
    const totalScore = analyses.reduce((sum, a) => sum + a.securityScore, 0);
    const totalIssues = analyses.reduce((sum, a) => sum + a.issuesFound, 0);
    const criticalIssues = analyses.reduce(
      (sum, a) => sum + a.criticalIssues,
      0
    );
    const averageScore = totalScore / analyses.length;

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
  }

  async getActivityAnalytics(userId: string): Promise<{
    languageDistribution: LanguageDistribution[];
    stats: {
      totalAnalyses: number;
      averageDuration: number;
      mostAnalyzedRepo: string;
      mostCommonLanguage: string;
    };
  }> {
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

    const totalDuration = analyses.reduce((sum, a) => sum + a.duration, 0);
    const averageDuration = Math.round(totalDuration / analyses.length);

    const repoCount: { [key: string]: number } = {};
    analyses.forEach((a) => {
      repoCount[a.repositoryName] = (repoCount[a.repositoryName] || 0) + 1;
    });
    const mostAnalyzedRepo =
      Object.entries(repoCount).sort((a, b) => b[1] - a[1])[0]?.[0] || "";

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
  }
}

export const localStorageGitHubAdapter = new LocalStorageGitHubAdapter();
