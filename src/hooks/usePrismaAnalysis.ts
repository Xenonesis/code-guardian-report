/**
 * Prisma Analysis Hook
 * Integrates Neon PostgreSQL + Prisma with the existing analysis system
 * Provides seamless cloud storage with fallback to local storage
 */

import { useState, useCallback, useEffect } from "react";
import { AnalysisResults } from "@/hooks/useAnalysis";
import {
  prismaAnalysisStorage,
  AnalysisHistoryQuery,
} from "../services/storage/prismaAnalysisStorage";
import { analysisStorage } from "../services/storage/analysisStorage";
import { useSession } from "next-auth/react";

import { logger } from "@/utils/logger";
export interface PrismaAnalysisState {
  analysisResults: AnalysisResults | null;
  cloudAnalysis: any | null;
  analysisHistory: any[];
  isAnalyzing: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  selectedFile: File | null;
  hasCloudData: boolean;
  hasLocalData: boolean;
  syncStatus: "synced" | "pending" | "error" | "offline";
  lastSyncTime: Date | null;
}

export const usePrismaAnalysis = () => {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isAuthenticated = status === "authenticated" && !!user;

  // State management
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [cloudAnalysis, setCloudAnalysis] = useState<any | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasCloudData, setHasCloudData] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<
    "synced" | "pending" | "error" | "offline"
  >("offline");
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Set user ID when authenticated
  useEffect(() => {
    const userId = (user as { id?: string })?.id;
    if (userId) {
      prismaAnalysisStorage.setUserId(userId);
      loadInitialData();
    } else {
      prismaAnalysisStorage.setUserId(null);
      // Fallback to local storage when not authenticated
      loadLocalData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Load initial data from cloud or local
  const loadInitialData = async () => {
    try {
      setIsSyncing(true);
      setSyncStatus("pending");

      // Load from Prisma database
      const cloudHistory =
        await prismaAnalysisStorage.getUserAnalysisHistory();
      setAnalysisHistory(cloudHistory);
      setHasCloudData(cloudHistory.length > 0);

      // Also check local storage
      const localHistory = analysisStorage.getAnalysisHistory();
      setHasLocalData(localHistory.length > 0);

      setSyncStatus("synced");
      setLastSyncTime(new Date());
    } catch (error) {
      logger.error("Error loading initial data:", error);
      setSyncStatus("error");
      // Fallback to local storage
      loadLocalData();
    } finally {
      setIsSyncing(false);
    }
  };

  // Load data from local storage only
  const loadLocalData = () => {
    const localHistory = analysisStorage.getAnalysisHistory();
    setAnalysisHistory(localHistory as any[]);
    setHasLocalData(localHistory.length > 0);
    setHasCloudData(false);
    setSyncStatus("offline");
  };

  // Store analysis results
  const storeAnalysis = useCallback(
    async (results: AnalysisResults, file: File) => {
      setIsAnalyzing(true);
      try {
        // Always store locally first
        analysisStorage.storeAnalysis(results, file.name, file.size);
        setHasLocalData(true);

        // If authenticated, also store in cloud
        if (isAuthenticated && user?.id) {
          try {
            const analysisId = await prismaAnalysisStorage.storeAnalysisResults(
              results,
              file
            );
            setCloudAnalysis({ id: analysisId, results });
            setHasCloudData(true);
            setSyncStatus("synced");
            setLastSyncTime(new Date());

            // Refresh history
            const history =
              await prismaAnalysisStorage.getUserAnalysisHistory();
            setAnalysisHistory(history);

            logger.debug("Analysis stored in database:", analysisId);
          } catch (error) {
            logger.error("Database storage failed:", error);
            setSyncStatus("error");
          }
        }

        setAnalysisResults(results);
        return true;
      } catch (error) {
        logger.error("Error storing analysis:", error);
        return false;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [isAuthenticated, user]
  );

  // Sync local data to cloud
  const syncToCloud = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      logger.warn("Cannot sync: User not authenticated");
      return false;
    }

    setIsSyncing(true);
    setSyncStatus("pending");

    try {
      const localHistory = analysisStorage.getAnalysisHistory();
      let syncCount = 0;

      for (const localAnalysis of localHistory) {
        try {
          // Check if analysis already exists in database
          const cloudHistory =
            await prismaAnalysisStorage.getUserAnalysisHistory(user.id, {
              fileName: localAnalysis.fileName,
              limit: 1,
            });

          if (cloudHistory.length === 0) {
            // Create a mock file object for sync
            const mockFile = new File(
              [""],
              localAnalysis.fileName,
              { size: localAnalysis.fileSize || 0 } as any
            );

            // Sync to database
            await prismaAnalysisStorage.storeAnalysisResults(
              localAnalysis.results,
              mockFile
            );
            syncCount++;
          }
        } catch (error) {
          logger.error("Error syncing analysis:", error);
        }
      }

      // Refresh history
      const history = await prismaAnalysisStorage.getUserAnalysisHistory();
      setAnalysisHistory(history);
      setHasCloudData(history.length > 0);

      setSyncStatus("synced");
      setLastSyncTime(new Date());
      logger.debug(`Synced ${syncCount} analyses to database`);

      return true;
    } catch (error) {
      logger.error("Sync failed:", error);
      setSyncStatus("error");
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated, user]);

  // Delete analysis
  const deleteAnalysis = useCallback(
    async (analysisId: string) => {
      try {
        // Delete from database if authenticated
        if (isAuthenticated) {
          await prismaAnalysisStorage.deleteAnalysisResults(analysisId);
        }

        // Also delete from local storage
        analysisStorage.deleteAnalysis(analysisId);

        // Refresh history
        if (isAuthenticated && user?.id) {
          const history =
            await prismaAnalysisStorage.getUserAnalysisHistory();
          setAnalysisHistory(history);
        } else {
          const localHistory = analysisStorage.getAnalysisHistory();
          setAnalysisHistory(localHistory.previousAnalyses);
        }

        return true;
      } catch (error) {
        logger.error("Error deleting analysis:", error);
        return false;
      }
    },
    [isAuthenticated, user]
  );

  // Get analysis by ID
  const getAnalysisById = useCallback(
    async (analysisId: string) => {
      try {
        // Try database first if authenticated
        if (isAuthenticated) {
          const analysis =
            await prismaAnalysisStorage.getAnalysisById(analysisId);
          if (analysis) {
            return analysis;
          }
        }

        // Fallback to local storage - search in history
        const history = analysisStorage.getAnalysisHistory();
        return (
          history.previousAnalyses.find((a) => a.id === analysisId) || null
        );
      } catch (error) {
        logger.error("Error getting analysis:", error);
        return null;
      }
    },
    [isAuthenticated]
  );

  // Search analysis history
  const searchAnalysis = useCallback(
    async (searchTerm: string, filters?: AnalysisHistoryQuery) => {
      try {
        if (isAuthenticated) {
          return await prismaAnalysisStorage.searchAnalysis(searchTerm, filters);
        }

        // Local search fallback
        const localHistory = analysisStorage.getAnalysisHistory();
        return localHistory.previousAnalyses.filter((item) =>
          item.fileName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      } catch (error) {
        logger.error("Error searching analysis:", error);
        return [];
      }
    },
    [isAuthenticated]
  );

  // Select file for analysis
  const selectFile = useCallback((file: File | null) => {
    setSelectedFile(file);
    if (file) {
      setAnalysisResults(null);
      setCloudAnalysis(null);
    }
  }, []);

  return {
    // State
    analysisResults,
    cloudAnalysis,
    analysisHistory,
    isAnalyzing,
    isSyncing,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    selectedFile,
    hasCloudData,
    hasLocalData,
    syncStatus,
    lastSyncTime,
    isAuthenticated,

    // Actions
    storeAnalysis,
    syncToCloud,
    deleteAnalysis,
    getAnalysisById,
    searchAnalysis,
    selectFile,
    refreshData: loadInitialData,
  };
};
