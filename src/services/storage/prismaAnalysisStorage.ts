/**
 * Prisma Analysis Storage Service
 * Replaces Firebase Analysis Storage with Neon PostgreSQL + Prisma
 * Features:
 * - User-based storage with NextAuth authentication
 * - No document size limits (unlike Firestore's 1MB)
 * - Full ACID compliance
 * - Advanced querying capabilities
 */

import { prisma } from "@/lib/prisma";
import { AnalysisResults } from "@/types/security-types";
import { logger } from "@/utils/logger";

export interface AnalysisHistoryQuery {
  userId?: string;
  fileName?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  limit?: number;
}

export class PrismaAnalysisStorageService {
  private static readonly MAX_HISTORY_SIZE = 50;

  private userId: string | null = null;

  /**
   * Set current user ID
   */
  public setUserId(userId: string | null): void {
    this.userId = userId;
  }

  /**
   * Get current user ID
   */
  public getUserId(): string | null {
    return this.userId;
  }

  /**
   * Store analysis results to database
   */
  public async storeAnalysisResults(
    results: AnalysisResults,
    file: File,
    tags: string[] = [],
    isPublic: boolean = false
  ): Promise<string> {
    if (!this.userId) {
      throw new Error("User must be authenticated to store analysis results");
    }

    try {
      logger.debug("Storing analysis results to database...", {
        fileName: file.name,
        fileSize: file.size,
        userId: this.userId,
        issuesCount: results.issues?.length,
      });

      const fileHash = await this.calculateFileHash(file);
      const sessionId = this.generateSessionId();

      // Store full results - no truncation needed unlike Firestore 1MB limit!
      const analysis = await prisma.analysisResult.create({
        data: {
          userId: this.userId,
          fileName: file.name,
          fileSize: file.size,
          fileHash,
          results: results as any,
          metadata: {
            userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "server",
            analysisEngine: "EnhancedAnalysisEngine",
            engineVersion: "3.0.0",
            sessionId,
            deviceInfo: this.getDeviceInfo(),
          },
          tags: tags || [],
          isPublic,
          syncStatus: "synced",
        },
      });

      logger.debug("Analysis stored successfully with ID:", analysis.id);

      // Update user stats
      await this.updateUserStats(file.size, results.issues?.length || 0);

      return analysis.id;
    } catch (error) {
      logger.error("Failed to store analysis results:", error);
      throw new Error(
        `Failed to store analysis results: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  /**
   * Get analysis results by ID
   */
  public async getAnalysisById(
    analysisId: string
  ): Promise<any | null> {
    try {
      const analysis = await prisma.analysisResult.findUnique({
        where: { id: analysisId },
      });

      return analysis;
    } catch (error) {
      logger.error("Error getting analysis by ID:", error);
      return null;
    }
  }

  /**
   * Get user's analysis history
   */
  public async getUserAnalysisHistory(
    userId?: string,
    queryOptions: AnalysisHistoryQuery = {}
  ): Promise<any[]> {
    const targetUserId = userId || this.userId;
    if (!targetUserId) {
      throw new Error("User ID is required");
    }

    try {
      const analyses = await prisma.analysisResult.findMany({
        where: {
          userId: targetUserId,
          ...(queryOptions.fileName && { fileName: queryOptions.fileName }),
          ...(queryOptions.tags && queryOptions.tags.length > 0 && {
            tags: { hasSome: queryOptions.tags },
          }),
          ...(queryOptions.startDate && {
            createdAt: { gte: queryOptions.startDate },
          }),
          ...(queryOptions.endDate && {
            createdAt: { lte: queryOptions.endDate },
          }),
        },
        orderBy: { createdAt: "desc" },
        take: queryOptions.limit || PrismaAnalysisStorageService.MAX_HISTORY_SIZE,
      });

      return analyses;
    } catch (error) {
      logger.error("Error getting user analysis history:", error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  public async getUserStats(userId?: string): Promise<any> {
    const targetUserId = userId || this.userId;
    if (!targetUserId) {
      throw new Error("User ID is required");
    }

    try {
      const stats = await prisma.userStats.findUnique({
        where: { userId: targetUserId },
      });

      if (stats) {
        // Calculate average security score from recent analyses
        if (!stats.averageSecurityScore) {
          const history = await this.getUserAnalysisHistory(targetUserId, {
            limit: 100,
          });
          if (history.length > 0) {
            const totalScore = history.reduce((sum: number, analysis: any) => {
              return sum + (analysis.results?.summary?.securityScore || 0);
            }, 0);
            stats.averageSecurityScore = Math.round(totalScore / history.length);
          }
        }
        return stats;
      }

      // Return default stats if no record exists
      return {
        totalAnalyses: 0,
        totalFilesAnalyzed: 0,
        totalIssuesFound: 0,
        totalBytesAnalyzed: 0,
        averageSecurityScore: 0,
        lastAnalysis: null,
      };
    } catch (error) {
      logger.error("Error getting user stats:", error);
      throw error;
    }
  }

  /**
   * Delete analysis results
   */
  public async deleteAnalysisResults(analysisId: string): Promise<void> {
    if (!this.userId) {
      throw new Error("User must be authenticated to delete analysis");
    }

    try {
      // Verify ownership before deletion
      const analysis = await prisma.analysisResult.findFirst({
        where: {
          id: analysisId,
          userId: this.userId,
        },
      });

      if (!analysis) {
        throw new Error("Analysis not found or unauthorized");
      }

      // Delete the analysis
      await prisma.analysisResult.delete({
        where: { id: analysisId },
      });

      // Update user stats (decrease counters)
      await this.decrementUserStats(
        analysis.fileSize || 0,
        (analysis.results as any)?.issues?.length || 0
      );
    } catch (error) {
      logger.error("Error deleting analysis results:", error);
      throw error;
    }
  }

  /**
   * Update analysis results
   */
  public async updateAnalysisResults(
    analysisId: string,
    results: AnalysisResults,
    tags?: string[]
  ): Promise<string> {
    if (!this.userId) {
      throw new Error("User must be authenticated");
    }

    if (!analysisId) {
      throw new Error("Analysis ID is required to update results");
    }

    try {
      // Check if document exists and belongs to user
      const existing = await prisma.analysisResult.findFirst({
        where: {
          id: analysisId,
          userId: this.userId,
        },
      });

      if (!existing) {
        throw new Error("Analysis not found or unauthorized");
      }

      const updateData: any = {
        results: results as any,
        syncStatus: "synced",
      };

      if (tags) {
        updateData.tags = tags;
      }

      await prisma.analysisResult.update({
        where: { id: analysisId },
        data: updateData,
      });

      return analysisId;
    } catch (error) {
      logger.error("Failed to update analysis results:", error);
      throw error;
    }
  }

  /**
   * Search analysis results
   */
  public async searchAnalysis(
    searchTerm: string,
    filters: AnalysisHistoryQuery = {}
  ): Promise<any[]> {
    if (!this.userId) {
      throw new Error("User must be authenticated");
    }

    try {
      // Get user's analysis history first
      const allResults = await this.getUserAnalysisHistory(
        this.userId,
        filters
      );

      // Filter by search term (client-side search)
      const searchResults = allResults.filter((analysis: any) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          analysis.fileName.toLowerCase().includes(searchLower) ||
          analysis.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchLower)
          ) ||
          (analysis.results as any)?.issues?.some(
            (issue: any) =>
              (issue.message || "").toLowerCase().includes(searchLower) ||
              issue.type.toLowerCase().includes(searchLower)
          )
        );
      });

      return searchResults;
    } catch (error) {
      logger.error("Error searching analysis results:", error);
      throw error;
    }
  }

  // Private helper methods

  private async updateUserStats(
    fileSize: number,
    issuesFound: number
  ): Promise<void> {
    if (!this.userId) return;

    try {
      await prisma.userStats.upsert({
        where: { userId: this.userId },
        update: {
          totalAnalyses: { increment: 1 },
          totalFilesAnalyzed: { increment: 1 },
          totalIssuesFound: { increment: issuesFound },
          totalBytesAnalyzed: { increment: fileSize },
          lastAnalysis: new Date(),
        },
        create: {
          userId: this.userId,
          totalAnalyses: 1,
          totalFilesAnalyzed: 1,
          totalIssuesFound: issuesFound,
          totalBytesAnalyzed: fileSize,
          lastAnalysis: new Date(),
        },
      });
    } catch (error) {
      logger.error("Error updating user stats:", error);
    }
  }

  private async decrementUserStats(
    fileSize: number,
    issuesFound: number
  ): Promise<void> {
    if (!this.userId) return;

    try {
      const currentStats = await prisma.userStats.findUnique({
        where: { userId: this.userId },
      });

      if (currentStats) {
        await prisma.userStats.update({
          where: { userId: this.userId },
          data: {
            totalAnalyses: Math.max(0, currentStats.totalAnalyses - 1),
            totalFilesAnalyzed: Math.max(0, currentStats.totalFilesAnalyzed - 1),
            totalIssuesFound: Math.max(0, currentStats.totalIssuesFound - issuesFound),
            totalBytesAnalyzed: Math.max(0, currentStats.totalBytesAnalyzed - fileSize),
          },
        });
      }
    } catch (error) {
      logger.error("Error decrementing user stats:", error);
    }
  }

  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private getDeviceInfo(): string {
    if (typeof navigator === "undefined") return "server";
    const platform = (navigator as any).userAgentData?.platform || "Unknown";
    return `${platform} - ${navigator.userAgent.substring(0, 100)}`;
  }
}

// Singleton instance
export const prismaAnalysisStorage = new PrismaAnalysisStorageService();
