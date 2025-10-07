/**
 * Analysis Integration Service
 * Integrates local and Firebase storage for analysis results
 * Provides a unified interface for storing and retrieving scan results
 */

import { AnalysisResults } from '@/hooks/useAnalysis';
import { analysisStorage } from './storage/analysisStorage';
import { firebaseAnalysisStorage } from './storage/firebaseAnalysisStorage';

export interface AnalysisStorageOptions {
  storeLocally?: boolean;
  storeInFirebase?: boolean;
  userId?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface StorageResult {
  local: {
    success: boolean;
    error?: string;
  };
  firebase: {
    success: boolean;
    error?: string;
    analysisId?: string;
  };
}

export class AnalysisIntegrationService {
  private static instance: AnalysisIntegrationService;
  
  private constructor() {}
  
  public static getInstance(): AnalysisIntegrationService {
    if (!AnalysisIntegrationService.instance) {
      AnalysisIntegrationService.instance = new AnalysisIntegrationService();
    }
    return AnalysisIntegrationService.instance;
  }

  /**
   * Store analysis results with both local and Firebase options
   */
  public async storeAnalysisResults(
    results: AnalysisResults,
    file: File,
    options: AnalysisStorageOptions = {}
  ): Promise<StorageResult> {
    const {
      storeLocally = true,
      storeInFirebase = true,
      userId,
      tags = [],
      isPublic = false
    } = options;

    const result: StorageResult = {
      local: { success: false },
      firebase: { success: false }
    };

    // Store locally (always recommended for immediate access)
    if (storeLocally) {
      try {
        await analysisStorage.storeAnalysisResults(results, file);
        result.local.success = true;
        console.log('✅ Analysis stored locally');
      } catch (error) {
        result.local.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to store analysis locally:', error);
      }
    }

    // Store in Firebase (if user is authenticated)
    if (storeInFirebase && userId) {
      try {
        firebaseAnalysisStorage.setUserId(userId);
        const analysisId = await firebaseAnalysisStorage.storeAnalysisResults(
          results,
          file,
          tags,
          isPublic
        );
        result.firebase.success = true;
        result.firebase.analysisId = analysisId;
        console.log('✅ Analysis stored in Firebase:', analysisId);
      } catch (error) {
        result.firebase.error = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Failed to store analysis in Firebase:', error);
      }
    } else if (storeInFirebase && !userId) {
      result.firebase.error = 'User authentication required for Firebase storage';
    }

    return result;
  }

  /**
   * Enhanced analysis complete handler
   * Automatically stores results in both local and Firebase storage
   */
  public async handleAnalysisComplete(
    results: AnalysisResults,
    file: File,
    userId?: string,
    options: Partial<AnalysisStorageOptions> = {}
  ): Promise<StorageResult> {
    console.log('🔄 Handling analysis completion...');
    console.log('📊 Input params:', {
      hasResults: !!results,
      fileName: file?.name,
      fileSize: file?.size,
      userId: userId || 'anonymous',
      optionsProvided: Object.keys(options).length > 0
    });
    
    const storageOptions: AnalysisStorageOptions = {
      storeLocally: true,
      storeInFirebase: !!userId, // Only store in Firebase if user is authenticated
      userId,
      tags: options.tags || [],
      isPublic: options.isPublic || false,
      ...options
    };

    console.log('⚙️ Storage options:', storageOptions);

    try {
      const result = await this.storeAnalysisResults(results, file, storageOptions);

      // Enhanced logging with more detail
      console.log('📝 Storage result:', result);
      
      if (result.local.success && result.firebase.success) {
        console.log('✅ SUCCESS: Analysis stored in both local and Firebase storage');
        console.log(`🔥 Firebase analysis ID: ${result.firebase.analysisId}`);
      } else if (result.local.success) {
        console.log('✅ SUCCESS: Analysis stored locally');
        console.log('⚠️ Firebase storage failed or unavailable:', result.firebase.error);
      } else if (result.firebase.success) {
        console.log('✅ SUCCESS: Analysis stored in Firebase');
        console.log('⚠️ Local storage failed:', result.local.error);
      } else {
        console.error('❌ FAILED: Both local and Firebase storage failed');
        console.error('Local error:', result.local.error);
        console.error('Firebase error:', result.firebase.error);
      }

      return result;
    } catch (error) {
      console.error('❌ CRITICAL ERROR in handleAnalysisComplete:', error);
      console.error('Stack trace:', error.stack);
      throw error;
    }
  }

  /**
   * Get current analysis results from best available source
   */
  public async getCurrentAnalysis(userId?: string) {
    // Try Firebase first if user is authenticated
    if (userId) {
      try {
        firebaseAnalysisStorage.setUserId(userId);
        const cloudHistory = await firebaseAnalysisStorage.getUserAnalysisHistory(userId, { limit: 1 });
        if (cloudHistory.length > 0) {
          return {
            source: 'firebase' as const,
            data: cloudHistory[0]
          };
        }
      } catch (error) {
        console.error('Error getting Firebase analysis:', error);
      }
    }

    // Fallback to local storage
    const localAnalysis = analysisStorage.getCurrentAnalysis();
    if (localAnalysis) {
      return {
        source: 'local' as const,
        data: localAnalysis
      };
    }

    return null;
  }

  /**
   * Sync local analysis to Firebase when user logs in
   */
  public async syncLocalToFirebase(userId: string, file?: File): Promise<boolean> {
    if (!userId) {
      console.error('User ID required for syncing to Firebase');
      return false;
    }

    try {
      const localAnalysis = analysisStorage.getCurrentAnalysis();
      if (!localAnalysis || !file) {
        console.log('No local analysis to sync or file missing');
        return false;
      }

      firebaseAnalysisStorage.setUserId(userId);
      
      // Check if analysis already exists in Firebase
      const cloudHistory = await firebaseAnalysisStorage.getUserAnalysisHistory(userId, { limit: 10 });
      const existingAnalysis = cloudHistory.find(analysis => 
        analysis.fileHash === localAnalysis.fileHash && 
        analysis.fileName === localAnalysis.fileName
      );

      if (existingAnalysis) {
        console.log('Analysis already exists in Firebase, skipping sync');
        return true;
      }

      // Sync to Firebase
      await firebaseAnalysisStorage.storeAnalysisResults(
        localAnalysis.results,
        file,
        [],
        false
      );

      console.log('✅ Local analysis synced to Firebase');
      return true;
    } catch (error) {
      console.error('❌ Failed to sync local analysis to Firebase:', error);
      return false;
    }
  }

  /**
   * Clear all stored analysis data
   */
  public clearAllAnalysisData(userId?: string): void {
    // Clear local storage
    analysisStorage.clearCurrentAnalysis();
    console.log('✅ Local analysis data cleared');

    // Note: Firebase data is not automatically cleared for safety
    // Users can manually delete from the Firebase dashboard
    if (userId) {
      console.log('ℹ️ Firebase data preserved. Use Firebase dashboard to manage cloud data.');
    }
  }

  /**
   * Get storage status information
   */
  public getStorageStatus(userId?: string) {
    const localStats = analysisStorage.getStorageStats();
    const hasLocalData = analysisStorage.hasStoredAnalysis();
    
    return {
      local: {
        hasData: hasLocalData,
        stats: localStats
      },
      firebase: {
        available: !!userId,
        userId: userId || null
      }
    };
  }
}

// Export singleton instance
export const analysisIntegrationService = AnalysisIntegrationService.getInstance();

// Convenience function for React components
export const useAnalysisIntegration = () => {
  return analysisIntegrationService;
};
