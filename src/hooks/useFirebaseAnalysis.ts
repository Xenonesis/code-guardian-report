/**
  * Firebase Analysis Hook
  * Integrates Firebase storage with the existing analysis system
  * Provides seamless cloud storage with fallback to local storage
  */
 
import { useState, useCallback, useEffect } from 'react';
import { AnalysisResults } from '@/hooks/useAnalysis';
import {
  firebaseAnalysisStorage,
  FirebaseAnalysisData,
  AnalysisHistoryQuery
} from '@/services/firebaseAnalysisStorage';
import { analysisStorage } from '@/services/analysisStorage';
import { useAuth } from '@/lib/auth-context';

export interface FirebaseAnalysisState {
  analysisResults: AnalysisResults | null;
  cloudAnalysis: FirebaseAnalysisData | null;
  analysisHistory: FirebaseAnalysisData[];
  isAnalyzing: boolean;
  isSyncing: boolean;
  isOnline: boolean;
  selectedFile: File | null;
  hasCloudData: boolean;
  hasLocalData: boolean;
  syncStatus: 'synced' | 'pending' | 'error' | 'offline';
  lastSyncTime: Date | null;
}

export const useFirebaseAnalysis = () => {
  const { user, loading } = useAuth();
  const isAuthenticated = !loading && !!user;
  
  // State management
  const [analysisResults, setAnalysisResults] = useState<AnalysisResults | null>(null);
  const [cloudAnalysis, setCloudAnalysis] = useState<FirebaseAnalysisData | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<FirebaseAnalysisData[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [hasCloudData, setHasCloudData] = useState(false);
  const [hasLocalData, setHasLocalData] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'pending' | 'error' | 'offline'>('offline');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Initialize Firebase storage with user authentication
  useEffect(() => {
    if (user?.uid) {
      firebaseAnalysisStorage.setUserId(user.uid);
      loadInitialData();
    } else {
      firebaseAnalysisStorage.setUserId(null);
      // Fallback to local storage when not authenticated
      loadLocalData();
    }
  }, [user?.uid, isAuthenticated]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('synced');
      if (user?.uid) {
        syncPendingData();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user?.uid, isAuthenticated]);

  // Subscribe to real-time updates when authenticated
  useEffect(() => {
    if (!user?.uid || !isOnline) return;

    const unsubscribe = firebaseAnalysisStorage.subscribe((data) => {
      setAnalysisHistory(data);
      setHasCloudData(data.length > 0);
      
      // Set the most recent analysis as current if no local analysis exists
      if (data.length > 0 && !analysisResults) {
        const mostRecent = data[0];
        setCloudAnalysis(mostRecent);
        setAnalysisResults(mostRecent.results);
      }
    });

    firebaseAnalysisStorage.setupRealtimeListener();

    return () => {
      unsubscribe();
      firebaseAnalysisStorage.cleanup();
    };
  }, [user?.uid, isOnline, analysisResults]);

  const loadInitialData = async () => {
    try {
      setIsSyncing(true);
      
      // Load local data first (for immediate display)
      loadLocalData();
      
      // Then load cloud data if online
      if (isOnline && user?.uid) {
        const cloudHistory = await firebaseAnalysisStorage.getUserAnalysisHistory();
        setAnalysisHistory(cloudHistory);
        setHasCloudData(cloudHistory.length > 0);
        
        // If we have cloud data but no local data, use the most recent cloud analysis
        if (cloudHistory.length > 0 && !hasLocalData) {
          const mostRecent = cloudHistory[0];
          setCloudAnalysis(mostRecent);
          setAnalysisResults(mostRecent.results);
        }
        
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const loadLocalData = () => {
    const localAnalysis = analysisStorage.getCurrentAnalysis();
    if (localAnalysis) {
      setAnalysisResults(localAnalysis.results);
      setHasLocalData(true);
    }
  };

  const syncPendingData = async () => {
    if (!user?.uid || !isOnline) return;

    try {
      setIsSyncing(true);
      setSyncStatus('pending');

      // Check for local data that needs to be synced
      const localAnalysis = analysisStorage.getCurrentAnalysis();
      if (localAnalysis && selectedFile) {
        // Sync local data to cloud
        await firebaseAnalysisStorage.storeAnalysisResults(
          localAnalysis.results,
          selectedFile,
          [],
          false
        );
        
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    
    // Clear previous results
    setAnalysisResults(null);
    setCloudAnalysis(null);
    
    // Clear local storage for new file
    analysisStorage.clearCurrentAnalysis();
    
    setHasLocalData(false);
  }, []);

  const handleAnalysisComplete = useCallback(async (results: AnalysisResults) => {
    setAnalysisResults(results);
    setIsAnalyzing(false);
    
    if (!selectedFile) return;

    try {
      // Always store locally first (for immediate access)
      await analysisStorage.storeAnalysisResults(results, selectedFile);
      setHasLocalData(true);

      // Store to Firebase if user is authenticated and online
      if (user?.uid && isOnline) {
        setIsSyncing(true);
        setSyncStatus('pending');
        
        const analysisId = await firebaseAnalysisStorage.storeAnalysisResults(
          results,
          selectedFile,
          [],
          false
        );
        
        // Get the stored analysis to update state
        const storedAnalysis = await firebaseAnalysisStorage.getAnalysisById(analysisId);
        if (storedAnalysis) {
          setCloudAnalysis(storedAnalysis);
          setHasCloudData(true);
        }
        
        setSyncStatus('synced');
        setLastSyncTime(new Date());
      } else if (!isOnline) {
        setSyncStatus('offline');
      } else {
        setSyncStatus('pending'); // Will sync when user logs in
      }
    } catch (error) {
      console.error('Error storing analysis results:', error);
      setSyncStatus('error');
    } finally {
      setIsSyncing(false);
    }
  }, [selectedFile, user?.uid, isOnline]);

  const startAnalysis = useCallback(() => {
    setIsAnalyzing(true);
  }, []);

  const resetAnalysis = useCallback(() => {
    setAnalysisResults(null);
    setCloudAnalysis(null);
    setSelectedFile(null);
    setIsAnalyzing(false);
    setHasLocalData(false);
    setHasCloudData(false);
    
    // Clear local storage
    analysisStorage.clearCurrentAnalysis();
  }, []);

  const loadAnalysisFromHistory = useCallback(async (analysisId: string) => {
    try {
      setIsSyncing(true);
      
      const analysis = await firebaseAnalysisStorage.getAnalysisById(analysisId);
      if (analysis) {
        setCloudAnalysis(analysis);
        setAnalysisResults(analysis.results);
        
        // Create a mock file object for the loaded analysis
        const mockFile = new File([''], analysis.fileName, {
          type: 'application/zip'
        });
        setSelectedFile(mockFile);
      }
    } catch (error) {
      console.error('Error loading analysis from history:', error);
      throw error;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const deleteAnalysisFromHistory = useCallback(async (analysisId: string) => {
    try {
      await firebaseAnalysisStorage.deleteAnalysisResults(analysisId);
      
      // Update local state
      setAnalysisHistory(prev => prev.filter(analysis => analysis.id !== analysisId));
      
      // If the deleted analysis was the current one, clear it
      if (cloudAnalysis?.id === analysisId) {
        setCloudAnalysis(null);
        setAnalysisResults(null);
      }
    } catch (error) {
      console.error('Error deleting analysis:', error);
      throw error;
    }
  }, [cloudAnalysis?.id]);

  const searchAnalysisHistory = useCallback(async (
    searchTerm: string,
    filters: AnalysisHistoryQuery = {}
  ) => {
    try {
      const results = await firebaseAnalysisStorage.searchAnalysis(searchTerm, filters);
      return results;
    } catch (error) {
      console.error('Error searching analysis history:', error);
      throw error;
    }
  }, []);

  const exportAnalysisToCloud = useCallback(async (
    results: AnalysisResults,
    file: File,
    tags: string[] = []
  ) => {
    if (!user?.uid) {
      throw new Error('User must be authenticated to export to cloud');
    }

    try {
      const analysisId = await firebaseAnalysisStorage.storeAnalysisResults(
        results,
        file,
        tags,
        false
      );
      return analysisId;
    } catch (error) {
      console.error('Error exporting analysis to cloud:', error);
      throw error;
    }
  }, [user?.uid]);

  const retrySync = useCallback(async () => {
    if (!user?.uid || !isOnline) return;

    try {
      await syncPendingData();
    } catch (error) {
      console.error('Error retrying sync:', error);
      setSyncStatus('error');
    }
  }, [user?.uid, isOnline]);

  // Computed state
  const analysisState: FirebaseAnalysisState = {
    analysisResults,
    cloudAnalysis,
    analysisHistory,
    isAnalyzing,
    isSyncing,
    isOnline,
    selectedFile,
    hasCloudData,
    hasLocalData,
    syncStatus,
    lastSyncTime,
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
    
    // Firebase-specific functions
    cloudAnalysis,
    analysisHistory,
    loadAnalysisFromHistory,
    deleteAnalysisFromHistory,
    searchAnalysisHistory,
    exportAnalysisToCloud,
    
    // Sync and status
    isSyncing,
    isOnline,
    hasCloudData,
    hasLocalData,
    syncStatus,
    lastSyncTime,
    retrySync,
    
    // Combined state
    analysisState,
  };
};

export default useFirebaseAnalysis;
