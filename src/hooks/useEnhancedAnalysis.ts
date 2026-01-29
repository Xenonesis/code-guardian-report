/**
 * Enhanced Analysis Hook with Persistent Storage
 * Integrates the useAnalysis hook with the advanced storage service
 */

import { useState, useCallback, useEffect } from "react";
import { AnalysisResults } from "@/hooks/useAnalysis";
import {
  analysisStorage,
  type StoredAnalysisData,
} from "../services/storage/analysisStorage";
import { analysisIntegrationService } from "@/services/analysisIntegrationService";
import { firebaseAnalysisStorage } from "../services/storage/firebaseAnalysisStorage";
import { useAuth } from "@/lib/auth-context";

import { logger } from "@/utils/logger";
export interface EnhancedAnalysisState {
  analysisResults: AnalysisResults | null;
  storedAnalysis: StoredAnalysisData | null;
  isAnalyzing: boolean;
  selectedFile: File | null;
  hasStoredData: boolean;
  storageStats: {
    currentSize: number;
    maxSize: number;
    usagePercentage: number;
    historyCount: number;
    compressionRatio?: number;
  };
  isNewFile: boolean;
}

export const useEnhancedAnalysis = () => {
  const { user } = useAuth();
  const [analysisResults, setAnalysisResults] =
    useState<AnalysisResults | null>(null);
  const [storedAnalysis, setStoredAnalysis] =
    useState<StoredAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [storageStats, setStorageStats] = useState(() =>
    analysisStorage.getStorageStats()
  );
  const [isNewFile, setIsNewFile] = useState(true);

  const updateStorageStats = useCallback(() => {
    setStorageStats(analysisStorage.getStorageStats());
  }, []);

  // Sync userId with Firebase storage whenever user changes
  useEffect(() => {
    if (user?.uid) {
      firebaseAnalysisStorage.setUserId(user.uid);
    } else {
      firebaseAnalysisStorage.setUserId(null);
    }
  }, [user?.uid]);

  // Initialize from storage on mount
  useEffect(() => {
    const stored = analysisStorage.getCurrentAnalysis();
    if (stored) {
      setStoredAnalysis(stored);
      setAnalysisResults(stored.results);
      setHasStoredData(true);
    }

    updateStorageStats();
  }, [updateStorageStats]);

  // Subscribe to storage changes
  useEffect(() => {
    const unsubscribe = analysisStorage.subscribe((data) => {
      setStoredAnalysis(data);
      setAnalysisResults(data?.results || null);
      setHasStoredData(!!data);
      updateStorageStats();
    });

    return unsubscribe;
  }, [updateStorageStats]);

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);

    // Check if this is a new file
    const isNewFileCheck = await analysisStorage.isNewFile(file);
    setIsNewFile(isNewFileCheck);

    if (isNewFileCheck) {
      // Clear previous results when new file is selected
      analysisStorage.clearCurrentAnalysis();
      setAnalysisResults(null);
      setStoredAnalysis(null);
      setHasStoredData(false);
    }
  }, []);

  const handleAnalysisComplete = useCallback(
    async (results: AnalysisResults, userId?: string, fileOverride?: File) => {
      setAnalysisResults(results);
      setIsAnalyzing(false);

      // Use fileOverride if provided, otherwise use selectedFile
      const fileToUse = fileOverride || selectedFile;

      // Store results using the integration service (both local and Firebase)
      if (fileToUse) {
        try {
          // Get current user ID from Firebase Auth if not provided
          // CRITICAL: Always use the latest user.uid from auth context
          const currentUserId = userId || user?.uid;

          const storageResult =
            await analysisIntegrationService.handleAnalysisComplete(
              results,
              fileToUse,
              currentUserId // Pass the actual user ID
            );

          // Update state based on storage results
          if (storageResult.local.success || storageResult.firebase.success) {
            setHasStoredData(true);
            updateStorageStats();
          }

          // Log errors for debugging
          if (!storageResult.firebase.success && currentUserId) {
            logger.error(
              "Firebase storage failed:",
              storageResult.firebase.error
            );
          }
        } catch (error) {
          logger.error(
            "Error storing analysis results:",
            error instanceof Error ? error.message : "Unknown error"
          );
        }
      } else {
        logger.error("No selected file - cannot store analysis results");
      }
    },
    [selectedFile, updateStorageStats, user]
  );

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
  }, []);

  const resetAnalysis = useCallback(() => {
    analysisStorage.clearCurrentAnalysis();
    setAnalysisResults(null);
    setStoredAnalysis(null);
    setSelectedFile(null);
    setIsAnalyzing(false);
    setHasStoredData(false);
    setIsNewFile(true);
    updateStorageStats();
  }, [updateStorageStats]);

  const clearStoredData = useCallback(() => {
    analysisStorage.clearCurrentAnalysis();
    setStoredAnalysis(null);
    setHasStoredData(false);
    updateStorageStats();
  }, [updateStorageStats]);

  const exportAnalysis = useCallback(
    (format: "json" | "compressed" = "json") => {
      const exported = analysisStorage.exportAnalysis(format);

      // Create download
      const blob = new Blob([exported], {
        type: format === "json" ? "application/json" : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `analysis-export-${Date.now()}.${format === "json" ? "json" : "txt"}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  const importAnalysis = useCallback(
    (data: string, compressed: boolean = false) => {
      analysisStorage.importAnalysis(data, compressed);
      updateStorageStats();
    },
    [updateStorageStats]
  );

  const getAnalysisHistory = useCallback(() => {
    return analysisStorage.getAnalysisHistory();
  }, []);

  const optimizeStorage = useCallback(async () => {
    await analysisStorage.optimizeStorage();
    updateStorageStats();
  }, [updateStorageStats]);

  const restoreFromHistory = useCallback((analysisData: StoredAnalysisData) => {
    setStoredAnalysis(analysisData);
    setAnalysisResults(analysisData.results);
    setHasStoredData(true);

    // Create a file object for the restored analysis
    const restoredFile = new File([""], analysisData.fileName, {
      type: "application/zip",
    });
    setSelectedFile(restoredFile);
  }, []);

  // Advanced analysis state
  const analysisState: EnhancedAnalysisState = {
    analysisResults,
    storedAnalysis,
    isAnalyzing,
    selectedFile,
    hasStoredData,
    storageStats,
    isNewFile,
  };

  return {
    // Basic analysis functions
    analysisResults,
    isAnalyzing,
    selectedFile,
    handleFileSelect,
    handleAnalysisComplete,
    startAnalysis,
    resetAnalysis,

    // Enhanced storage functions
    storedAnalysis,
    hasStoredData,
    isNewFile,
    clearStoredData,
    exportAnalysis,
    importAnalysis,
    getAnalysisHistory,
    optimizeStorage,
    restoreFromHistory,

    // Statistics and state
    storageStats,
    analysisState,
    updateStorageStats,
  };
};

export default useEnhancedAnalysis;
