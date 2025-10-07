/**
 * Enhanced Analysis Hook with Persistent Storage
 * Integrates the useAnalysis hook with the advanced storage service
 */

import { useState, useCallback, useEffect } from 'react';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { analysisStorage, type StoredAnalysisData } from '../services/storage/analysisStorage';
import { analysisIntegrationService } from '@/services/analysisIntegrationService';
import { firebaseAnalysisStorage } from '../services/storage/firebaseAnalysisStorage';
import { useAuth } from '@/lib/auth-context';

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

  // Sync userId with Firebase storage whenever user changes
  useEffect(() => {
    if (user?.uid) {
      // Small delay to ensure auth is fully ready before setting up listeners
      const timeoutId = setTimeout(() => {
        firebaseAnalysisStorage.setUserId(user.uid);
        console.log('✅ Firebase storage userId synced:', user.uid);
      }, 300);
      
      return () => clearTimeout(timeoutId);
    } else {
      firebaseAnalysisStorage.setUserId(null);
      console.log('ℹ️ Firebase storage userId cleared (user logged out)');
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

  const handleAnalysisComplete = useCallback(async (results: AnalysisResults, userId?: string, fileOverride?: File) => {
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
        
        console.log('🔄 Analysis Complete - User Info:', {
          providedUserId: userId,
          currentUserId: currentUserId,
          hasCurrentUser: !!user,
          userObject: user ? { uid: user.uid, email: user.email } : null,
          fileName: fileToUse.name,
          willStoreInFirebase: !!currentUserId
        });
        
        if (!currentUserId) {
          console.warn('⚠️ WARNING: No user ID available - Firebase storage will be skipped');
          console.warn('User auth state:', { user, hasUser: !!user, uid: user?.uid });
        }
        
        const storageResult = await analysisIntegrationService.handleAnalysisComplete(
          results,
          fileToUse,
          currentUserId // Pass the actual user ID
        );
        
        // Update state based on storage results
        if (storageResult.local.success || storageResult.firebase.success) {
          setHasStoredData(true);
          updateStorageStats();
        }
        
        // Enhanced logging for debugging
        console.log('📊 Final Storage Result:', {
          ...storageResult,
          localSuccess: storageResult.local.success,
          firebaseSuccess: storageResult.firebase.success,
          firebaseId: storageResult.firebase.analysisId,
          localError: storageResult.local.error,
          firebaseError: storageResult.firebase.error
        });
        
        // Alert user if Firebase storage failed
        if (!storageResult.firebase.success && currentUserId) {
          console.error('❌ Firebase storage failed despite having userId:', {
            userId: currentUserId,
            error: storageResult.firebase.error
          });
        }
      } catch (error) {
        console.error('❌ Error storing analysis results:', error);
        console.error('Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          selectedFile: fileToUse?.name,
          userId: user?.uid
        });
      }
    } else {
      console.error('❌ No selected file - cannot store analysis results');
    }
  }, [selectedFile, updateStorageStats, user]);

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
