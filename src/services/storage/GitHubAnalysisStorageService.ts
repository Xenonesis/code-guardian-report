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
import { SecurityIssue, AnalysisResults } from "@/hooks/useAnalysis";

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
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Don't log permission errors as errors - they're expected when not authenticated
      if (errorMessage.includes('permission') || errorMessage.includes('insufficient permissions')) {
        logger.debug("Firebase read requires authentication. Using offline mode with empty data.");
      } else {
        logger.error("Error fetching repositories:", error);
      }

      // Return empty array gracefully for offline/unauthenticated mode
      return [];
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
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Don't log permission errors as errors - they're expected when not authenticated
      if (errorMessage.includes('permission') || errorMessage.includes('insufficient permissions')) {
        logger.debug("Firebase read requires authentication. Using offline mode with empty data.");
      } else {
        logger.error("Error fetching analysis history:", error);
      }

      // Return empty array gracefully for offline/unauthenticated mode
      return [];
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

  /**
   * Get detailed analysis results with security issues for a repository
   * This fetches from the main analysisResults collection which contains full issue details
   */
  async getDetailedAnalysisResults(
    userId: string,
    repositoryName?: string
  ): Promise<
    Array<{
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
    }>
  > {
    try {
      // First, get repositories to map names
      const repos = await this.getUserRepositories(userId);

      // Get detailed analysis from the main analysisResults collection
      const analysisResultsRef = collection(db, "analysisResults");
      let q = query(
        analysisResultsRef,
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(100)
      );

      const querySnapshot = await getDocs(q);
      const detailedResults: Array<{
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
      }> = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const results = data.results as AnalysisResults | undefined;

        if (!results) return;

        // Try to match with repository or use filename
        const fileName = data.fileName || "Unknown";
        let repoName = fileName;
        let language = "Unknown";

        // Try to find matching repository
        const matchingRepo = repos.find(
          (r) =>
            fileName.toLowerCase().includes(r.name.toLowerCase()) ||
            r.name
              .toLowerCase()
              .includes(fileName.replace(/\.zip$/i, "").toLowerCase())
        );

        if (matchingRepo) {
          repoName = matchingRepo.name;
          language = matchingRepo.language;
        } else if (results.languageDetection?.primaryLanguage?.name) {
          language = results.languageDetection.primaryLanguage.name;
        }

        // Filter by repository name if specified
        if (
          repositoryName &&
          !repoName.toLowerCase().includes(repositoryName.toLowerCase())
        ) {
          return;
        }

        detailedResults.push({
          repositoryName: repoName,
          language,
          issues: results.issues || [],
          analyzedAt: data.createdAt?.toDate() || new Date(),
          metrics: {
            totalLines:
              results.summary?.linesAnalyzed ||
              results.metrics?.vulnerabilityDensity
                ? Math.round(
                    results.issues?.length /
                      (results.metrics?.vulnerabilityDensity || 0.001)
                  )
                : 0,
            totalFiles: results.totalFiles || 0,
            codeComplexity: results.metrics?.maintainabilityIndex
              ? Math.round(100 - results.metrics.maintainabilityIndex) / 10
              : 0,
            maintainabilityIndex: results.metrics?.maintainabilityIndex || 0,
            testCoverage: results.metrics?.testCoverage,
            duplicatedLines: results.metrics?.duplicatedLines || 0,
          },
        });
      });

      // If we got detailed results, return them
      if (detailedResults.length > 0) {
        return detailedResults;
      }

      // Fallback: Create basic results from repository data (without detailed issues)
      return repos.map((repo) => ({
        repositoryName: repo.name,
        language: repo.language,
        issues: [], // No detailed issues available
        analyzedAt: repo.lastAnalyzed,
        metrics: undefined,
      }));
    } catch (error) {
      logger.error("Error fetching detailed analysis results:", error);

      // Return empty array in production
      if (process.env.NODE_ENV === "production") {
        return [];
      }

      // Return mock data in development
      return this.getMockDetailedResults();
    }
  }

  /**
   * Get aggregated security issues across all repositories
   */
  async getAggregatedSecurityIssues(userId: string): Promise<{
    totalIssues: number;
    criticalIssues: number;
    highIssues: number;
    mediumIssues: number;
    lowIssues: number;
    issuesByType: Record<string, number>;
    issuesByCategory: Record<string, number>;
  }> {
    try {
      const detailedResults = await this.getDetailedAnalysisResults(userId);

      const aggregation = {
        totalIssues: 0,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        issuesByType: {} as Record<string, number>,
        issuesByCategory: {} as Record<string, number>,
      };

      for (const result of detailedResults) {
        for (const issue of result.issues) {
          aggregation.totalIssues++;

          // Count by severity
          const severity = (issue.severity || "Low").toLowerCase();
          if (severity === "critical") aggregation.criticalIssues++;
          else if (severity === "high") aggregation.highIssues++;
          else if (severity === "medium") aggregation.mediumIssues++;
          else aggregation.lowIssues++;

          // Count by type
          const type = issue.type || "unknown";
          aggregation.issuesByType[type] =
            (aggregation.issuesByType[type] || 0) + 1;

          // Count by category
          const category = issue.category || "unknown";
          aggregation.issuesByCategory[category] =
            (aggregation.issuesByCategory[category] || 0) + 1;
        }
      }

      return aggregation;
    } catch (error) {
      logger.error("Error aggregating security issues:", error);
      return {
        totalIssues: 0,
        criticalIssues: 0,
        highIssues: 0,
        mediumIssues: 0,
        lowIssues: 0,
        issuesByType: {},
        issuesByCategory: {},
      };
    }
  }

  // Mock data for development with detailed issues
  private getMockDetailedResults(): Array<{
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
  }> {
    return [
      {
        repositoryName: "code-guardian",
        language: "TypeScript",
        issues: [
          {
            id: "mock-issue-1",
            line: 45,
            tool: "security-scanner",
            type: "sql-injection",
            category: "Injection",
            message: "Potential SQL injection vulnerability detected",
            severity: "High",
            confidence: 85,
            recommendation:
              "Use parameterized queries instead of string concatenation",
            remediation: {
              description:
                "Replace string concatenation with prepared statements",
              effort: "Medium",
              priority: 2,
            },
            filename: "src/database/queries.ts",
            riskRating: "High",
            impact: "Database compromise",
            likelihood: "Medium",
            cweId: "CWE-89",
            owaspCategory: "A03:2021 – Injection",
          },
          {
            id: "mock-issue-2",
            line: 120,
            tool: "security-scanner",
            type: "xss",
            category: "Cross-Site Scripting",
            message: "Unescaped user input in template",
            severity: "Medium",
            confidence: 90,
            recommendation: "Sanitize user input before rendering",
            remediation: {
              description:
                "Use HTML escaping or a templating library with auto-escaping",
              effort: "Low",
              priority: 3,
            },
            filename: "src/components/UserProfile.tsx",
            riskRating: "Medium",
            impact: "Session hijacking",
            likelihood: "Medium",
            cweId: "CWE-79",
            owaspCategory: "A03:2021 – Injection",
          },
        ],
        analyzedAt: new Date(Date.now() - 86400000),
        metrics: {
          totalLines: 5000,
          totalFiles: 45,
          codeComplexity: 12,
          maintainabilityIndex: 75,
          testCoverage: 68,
          duplicatedLines: 150,
        },
      },
      {
        repositoryName: "api-gateway",
        language: "JavaScript",
        issues: [
          {
            id: "mock-issue-3",
            line: 78,
            tool: "security-scanner",
            type: "hardcoded-credentials",
            category: "Sensitive Data Exposure",
            message: "Hardcoded API key detected",
            severity: "Critical",
            confidence: 95,
            recommendation: "Move secrets to environment variables",
            remediation: {
              description: "Use environment variables or a secrets manager",
              effort: "Low",
              priority: 1,
            },
            filename: "src/config/api.js",
            riskRating: "Critical",
            impact: "Credential theft",
            likelihood: "High",
            cweId: "CWE-798",
            owaspCategory: "A02:2021 – Cryptographic Failures",
          },
        ],
        analyzedAt: new Date(Date.now() - 172800000),
        metrics: {
          totalLines: 3200,
          totalFiles: 28,
          codeComplexity: 18,
          maintainabilityIndex: 62,
          testCoverage: 45,
          duplicatedLines: 280,
        },
      },
    ];
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
