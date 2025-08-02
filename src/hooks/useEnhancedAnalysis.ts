/**
 * Enhanced Analysis Hook with Persistent Storage
 * Integrates the useAnalysis hook with the advanced storage service
 */

import { useState, useCallback, useEffect } from 'react';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { analysisStorage, type StoredAnalysisData } from '@/services/analysisStorage';

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
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [storedAnalysis, setStoredAnalysis] = useState<StoredAnalysisData | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasStoredData, setHasStoredData] = useState(false);
  const [storageStats, setStorageStats] = useState(() => analysisStorage.getStorageStats());
  const [isNewFile, setIsNewFile] = useState(true);

  const updateStorageStats = useCallback(() => {
    setStorageStats(analysisStorage.getStorageStats());
  }, []);

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

  const handleAnalysisComplete = useCallback(async (results: AnalysisResults) => {
    setAnalysisResults(results);
    setIsAnalyzing(false);
    
    // Store results with the selected file
    if (selectedFile) {
      try {
        await analysisStorage.storeAnalysisResults(results, selectedFile);
        setHasStoredData(true);
        updateStorageStats();
      } catch (error) {
        // Silent error handling
      }
    }
  }, [selectedFile, updateStorageStats]);

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

  const exportAnalysis = useCallback((format: 'json' | 'compressed' = 'json') => {
    try {
      const exported = analysisStorage.exportAnalysis(format);
      
      // Create download
      const blob = new Blob([exported], { 
        type: format === 'json' ? 'application/json' : 'text/plain' 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analysis-export-${Date.now()}.${format === 'json' ? 'json' : 'txt'}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      // Silent error handling
      throw error;
    }
  }, []);

  const importAnalysis = useCallback((data: string, compressed: boolean = false) => {
    try {
      analysisStorage.importAnalysis(data, compressed);
      updateStorageStats();
    } catch (error) {
      throw error;
    }
  }, [updateStorageStats]);

  const getAnalysisHistory = useCallback(() => {
    return analysisStorage.getAnalysisHistory();
  }, []);

  const optimizeStorage = useCallback(async () => {
    try {
      await analysisStorage.optimizeStorage();
      updateStorageStats();
    } catch (error) {
      throw error;
    }
  }, [updateStorageStats]);

  const restoreFromHistory = useCallback((analysisData: StoredAnalysisData) => {
    setStoredAnalysis(analysisData);
    setAnalysisResults(analysisData.results);
    setHasStoredData(true);
    
    // Create a file object for the restored analysis
    const restoredFile = new File([''], analysisData.fileName, {
      type: 'application/zip'
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
