/**
 * Firebase Analysis Storage Service
 * Provides cloud storage for analysis results with Firebase Firestore
 * Features:
 * - User-based storage with authentication
 * - Real-time sync across devices
 * - History management
 * - Offline support with sync
 * - Data compression for large results
 */

import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  where, 
  limit,
  serverTimestamp,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AnalysisResults } from '@/hooks/useAnalysis';
import { safeGetDoc, safeSetDoc } from '@/lib/firestore-utils';

import { logger } from '@/utils/logger';
export interface FirebaseAnalysisData {
  id: string;
  userId: string;
  timestamp: Timestamp;
  fileName: string;
  fileSize: number;
  fileHash: string;
  results: AnalysisResults;
  metadata: {
    userAgent: string;
    analysisEngine: string;
    engineVersion: string;
    sessionId: string;
    ipAddress?: string;
    deviceInfo?: string;
  };
  tags: string[];
  isPublic: boolean;
  compressed: boolean;
  syncStatus: 'synced' | 'pending' | 'error';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface AnalysisHistoryQuery {
  userId?: string;
  fileName?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
  limit?: number;
}

export class FirebaseAnalysisStorageService {
  private static readonly COLLECTION_NAME = 'analysisResults';
  private static readonly USER_STATS_COLLECTION = 'userStats';
  private static readonly MAX_HISTORY_SIZE = 50;
  private static readonly COMPRESSION_THRESHOLD = 100 * 1024; // 100KB

  private userId: string | null = null;
  private listeners: Set<(data: FirebaseAnalysisData[]) => void> = new Set();
  private unsubscribeSnapshot: (() => void) | null = null;

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state
   */
  private initializeAuth(): void {
    // This would typically be handled by the auth context
    // For now, we'll check if user is authenticated when methods are called
  }

  /**
   * Set current user ID
   */
  public setUserId(userId: string | null): void {
    if (this.userId !== userId) {
      this.userId = userId;
      this.setupRealtimeListener();
    }
  }

  /**
   * Get current user ID
   */
  public getUserId(): string | null {
    return this.userId;
  }

  /**
   * Store analysis results to Firebase
   */
  public async storeAnalysisResults(
    results: AnalysisResults,
    file: File,
    tags: string[] = [],
    isPublic: boolean = false
  ): Promise<string> {
    if (!this.userId) {
      throw new Error('User must be authenticated to store analysis results');
    }

    try {
      logger.debug('🔥 Storing analysis results to Firebase...', {
        fileName: file.name,
        fileSize: file.size,
        userId: this.userId,
        issuesCount: results.issues?.length
      });

      const fileHash = await this.calculateFileHash(file);
      const sessionId = this.generateSessionId();

      // Check if analysis with same hash already exists

      // Compress results if they're large
      const shouldCompress = this.getDataSize(results) > FirebaseAnalysisStorageService.COMPRESSION_THRESHOLD;
      const finalResults = shouldCompress ? this.compressResults(results) : results;

      const analysisData: Omit<FirebaseAnalysisData, 'id'> = {
        userId: this.userId,
        timestamp: serverTimestamp() as Timestamp,
        fileName: file.name,
        fileSize: file.size,
        fileHash,
        results: finalResults,
        metadata: {
          userAgent: navigator.userAgent,
          analysisEngine: 'EnhancedAnalysisEngine',
          engineVersion: '3.0.0',
          sessionId,
          deviceInfo: this.getDeviceInfo(),
        },
        tags: tags || [],
        isPublic,
        compressed: shouldCompress,
        syncStatus: 'pending',
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      };

      // Sanitize data before storing
      const sanitizedData = this.sanitizeObject(analysisData);

      // Store in Firestore
      const docRef = await addDoc(collection(db, FirebaseAnalysisStorageService.COLLECTION_NAME), sanitizedData);

      logger.debug('✅ Analysis stored successfully with ID:', docRef.id);

      // Update sync status
      await updateDoc(docRef, { syncStatus: 'synced' });
      await this.updateUserStats(file.size, results.issues?.length || 0);

      return docRef.id;

    } catch (error) {
      logger.error('❌ Failed to store analysis results to Firebase:', error);
      throw new Error(`Failed to store analysis results: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get analysis results by ID
   */
  public async getAnalysisById(analysisId: string): Promise<FirebaseAnalysisData | null> {
    try {
      const docRef = doc(db, FirebaseAnalysisStorageService.COLLECTION_NAME, analysisId);
      const result = await safeGetDoc<FirebaseAnalysisData>(docRef);
      
      if (result.exists && result.data) {
        const data = { ...result.data, id: analysisId };
        
        // Decompress if needed
        if (data.compressed) {
          data.results = this.decompressResults(data.results);
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      logger.error('Error getting analysis by ID:', error);
      return null;
    }
  }

  /**
   * Get user's analysis history
   */
  public async getUserAnalysisHistory(
    userId?: string,
    queryOptions: AnalysisHistoryQuery = {}
  ): Promise<FirebaseAnalysisData[]> {
    const targetUserId = userId || this.userId;
    if (!targetUserId) {
      throw new Error('User ID is required');
    }

    try {
      // Primary query with orderBy (may require a composite index)
      let q = query(
        collection(db, FirebaseAnalysisStorageService.COLLECTION_NAME),
        where('userId', '==', targetUserId)
      );

      // Add additional filters
      if (queryOptions.fileName) {
        q = query(q, where('fileName', '==', queryOptions.fileName));
      }

      if (queryOptions.tags && queryOptions.tags.length > 0) {
        q = query(q, where('tags', 'array-contains-any', queryOptions.tags));
      }

      let querySnapshot;
      try {
        querySnapshot = await getDocs(q);
      } catch (err: any) {
        // Fallback when composite index is missing or other precondition fails
        logger.warn('Primary history query failed, falling back to basic query:', err?.code || err);
        let fallback = query(
          collection(db, FirebaseAnalysisStorageService.COLLECTION_NAME),
          where('userId', '==', targetUserId)
        );
        // Note: we intentionally skip orderBy here to avoid composite index requirement
        if (queryOptions.fileName) {
          fallback = query(fallback, where('fileName', '==', queryOptions.fileName));
        }
        if (queryOptions.tags && queryOptions.tags.length > 0) {
          fallback = query(fallback, where('tags', 'array-contains-any', queryOptions.tags));
        }
        querySnapshot = await getDocs(fallback);
      }

      const results: FirebaseAnalysisData[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as Omit<FirebaseAnalysisData, 'id'>;
        
        // Apply date filters (client-side since Firestore has limitations)
        if (queryOptions.startDate && data.createdAt.toDate() < queryOptions.startDate) {
          return;
        }
        if (queryOptions.endDate && data.createdAt.toDate() > queryOptions.endDate) {
          return;
        }

        const analysisData: FirebaseAnalysisData = {
          ...data,
          id: doc.id,
        };

        // Decompress if needed
        if (analysisData.compressed) {
          analysisData.results = this.decompressResults(analysisData.results);
        }

        results.push(analysisData);
      });

      // Ensure results are sorted by createdAt desc if we used the fallback (no orderBy)
      results.sort((a, b) => {
        const ad = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt as any);
        const bd = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt as any);
        return bd.getTime() - ad.getTime();
      });

      const limitAmount = queryOptions.limit || FirebaseAnalysisStorageService.MAX_HISTORY_SIZE;
      return results.slice(0, limitAmount);

    } catch (error) {
      logger.error('Error getting user analysis history:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  public async getUserStats(userId?: string): Promise<any> {
    const targetUserId = userId || this.userId;
    if (!targetUserId) {
      throw new Error('User ID is required');
    }

    try {
      const userStatsRef = doc(db, FirebaseAnalysisStorageService.USER_STATS_COLLECTION, targetUserId);
      const userStatsDoc = await getDoc(userStatsRef);
      
      if (userStatsDoc.exists()) {
        const data = userStatsDoc.data();
        
        // Calculate average security score from analysis history if not stored
        if (!data.averageSecurityScore) {
          const history = await this.getUserAnalysisHistory(targetUserId, { limit: 100 });
          if (history.length > 0) {
            const totalScore = history.reduce((sum, analysis) => {
              return sum + (analysis.results.summary?.securityScore || 0);
            }, 0);
            data.averageSecurityScore = Math.round(totalScore / history.length);
          }
        }
        
        return data;
      }
      
      // Return default stats if no document exists
      return {
        totalAnalyses: 0,
        totalFilesAnalyzed: 0,
        totalIssuesFound: 0,
        totalBytesAnalyzed: 0,
        averageSecurityScore: 0,
        lastAnalysis: null,
      };
    } catch (error) {
      logger.error('Error getting user stats:', error);
      throw error;
    }
  }

  /**
   * Delete analysis results
   */
  public async deleteAnalysisResults(analysisId: string): Promise<void> {
    if (!this.userId) {
      throw new Error('User must be authenticated to delete analysis');
    }

    try {
      const analysisRef = doc(db, FirebaseAnalysisStorageService.COLLECTION_NAME, analysisId);
      
      // Verify ownership before deletion
      const analysisDoc = await getDoc(analysisRef);
      if (!analysisDoc.exists()) {
        throw new Error('Analysis not found');
      }
      
      const analysisData = analysisDoc.data();
      if (analysisData.userId !== this.userId) {
        throw new Error('Unauthorized: Cannot delete analysis belonging to another user');
      }
      
      // Delete the analysis document
      await deleteDoc(analysisRef);
      
      // Update user stats (decrease counters)
      await this.decrementUserStats(
        analysisData.fileSize || 0,
        analysisData.results?.issues?.length || 0
      );
      
    } catch (error) {
      logger.error('Error deleting analysis results:', error);
      throw error;
    }
  }

  /**
   * Decrement user stats when deleting an analysis
   */
  private async decrementUserStats(fileSize: number, issuesFound: number): Promise<void> {
    if (!this.userId) return;

    try {
      const userStatsRef = doc(db, FirebaseAnalysisStorageService.USER_STATS_COLLECTION, this.userId);
      const userStats = await safeGetDoc(userStatsRef, {
        totalAnalyses: 0,
        totalFilesAnalyzed: 0,
        totalIssuesFound: 0,
        totalBytesAnalyzed: 0,
      });

      const updateData = {
        totalAnalyses: Math.max(0, (userStats.data?.totalAnalyses || 0) - 1),
        totalFilesAnalyzed: Math.max(0, (userStats.data?.totalFilesAnalyzed || 0) - 1),
        totalIssuesFound: Math.max(0, (userStats.data?.totalIssuesFound || 0) - issuesFound),
        totalBytesAnalyzed: Math.max(0, (userStats.data?.totalBytesAnalyzed || 0) - fileSize),
        updatedAt: serverTimestamp(),
      };

      await safeSetDoc(userStatsRef, updateData, { merge: true });
    } catch (error) {
      logger.error('Error updating user stats after deletion:', error);
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
      throw new Error('User must be authenticated');
    }
    
    if (!analysisId) {
      throw new Error('Analysis ID is required to update results');
    }

    try {
      const docRef = doc(db, FirebaseAnalysisStorageService.COLLECTION_NAME, analysisId);
      
      // Check if document exists and belongs to user
      const existingDoc = await getDoc(docRef);
      if (!existingDoc.exists()) {
        throw new Error('Analysis not found');
      }
      
      const existingData = existingDoc.data() as FirebaseAnalysisData;
      if (existingData.userId !== this.userId) {
        throw new Error('Not authorized to update this analysis');
      }

      const shouldCompress = this.getDataSize(results) > FirebaseAnalysisStorageService.COMPRESSION_THRESHOLD;
      const finalResults = shouldCompress ? this.compressResults(results) : results;

      const updateData: Partial<FirebaseAnalysisData> = {
        results: finalResults,
        compressed: shouldCompress,
        updatedAt: serverTimestamp() as Timestamp,
        syncStatus: 'synced',
      };

      if (tags) {
        updateData.tags = tags;
      }

      await updateDoc(docRef, this.sanitizeObject(updateData));

      return analysisId;
    } catch (error) {
      logger.error('❌ Failed to update analysis results:', error);
      throw error;
    }
  }


  /**
   * Search analysis results
   */
  public async searchAnalysis(
    searchTerm: string,
    filters: AnalysisHistoryQuery = {}
  ): Promise<FirebaseAnalysisData[]> {
    if (!this.userId) {
      throw new Error('User must be authenticated');
    }

    try {
      // Get user's analysis history first
      const allResults = await this.getUserAnalysisHistory(this.userId, filters);
      
      // Filter by search term (client-side search)
      const searchResults = allResults.filter(analysis => {
        const searchLower = searchTerm.toLowerCase();
        return (
          analysis.fileName.toLowerCase().includes(searchLower) ||
          analysis.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          analysis.results.issues?.some(issue =>
            (issue.message || '').toLowerCase().includes(searchLower) ||
            issue.type.toLowerCase().includes(searchLower)
          )
        );
      });

      return searchResults;
    } catch (error) {
      logger.error('Error searching analysis results:', error);
      throw error;
    }
  }

  /**
   * Setup real-time listener for user's analysis results
   */
  public setupRealtimeListener(): void {
    if (!this.userId) {
      // Clean up any existing listener if no userId
      if (this.unsubscribeSnapshot) {
        this.unsubscribeSnapshot();
        this.unsubscribeSnapshot = null;
      }
      return;
    }

    // Unsubscribe from previous listener
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }

    try {
      const q = query(
        collection(db, FirebaseAnalysisStorageService.COLLECTION_NAME),
        where('userId', '==', this.userId)
      );

      this.unsubscribeSnapshot = onSnapshot(
        q, 
        (querySnapshot) => {
          const results: FirebaseAnalysisData[] = [];
          
          querySnapshot.forEach((doc) => {
            const data = doc.data() as Omit<FirebaseAnalysisData, 'id'>;
            const analysisData: FirebaseAnalysisData = {
              ...data,
              id: doc.id,
            };

            // Decompress if needed
            if (analysisData.compressed) {
              analysisData.results = this.decompressResults(analysisData.results);
            }

            results.push(analysisData);
          });

          // Notify listeners
          results.sort((a, b) => {
            const ad = (a.createdAt as any)?.toDate ? (a.createdAt as any).toDate() : new Date(a.createdAt as any);
            const bd = (b.createdAt as any)?.toDate ? (b.createdAt as any).toDate() : new Date(b.createdAt as any);
            return bd.getTime() - ad.getTime();
          });

          const limitAmount = FirebaseAnalysisStorageService.MAX_HISTORY_SIZE;
          this.notifyListeners(results.slice(0, limitAmount));
        }, 
        (error: any) => {
          // Handle permission errors gracefully
          if (error?.code === 'permission-denied') {
            logger.warn('⚠️ Firebase real-time listener: Permission denied. User may not be authenticated or lacks access rights.');
            // Clean up the listener
            if (this.unsubscribeSnapshot) {
              this.unsubscribeSnapshot();
              this.unsubscribeSnapshot = null;
            }
          } else {
            logger.error('❌ Real-time listener error:', error);
          }
        }
      );
    } catch (error) {
      logger.error('❌ Failed to setup real-time listener:', error);
    }
  }

  /**
   * Subscribe to real-time updates
   */
  public subscribe(callback: (data: FirebaseAnalysisData[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Clean up resources
   */
  public cleanup(): void {
    if (this.unsubscribeSnapshot) {
      this.unsubscribeSnapshot();
      this.unsubscribeSnapshot = null;
    }
    this.listeners.clear();
  }

  // Private helper methods

  private async getAnalysisByHash(fileHash: string, file: File): Promise<FirebaseAnalysisData | null> {
    if (!this.userId) return null;

    try {
      const q = query(
        collection(db, FirebaseAnalysisStorageService.COLLECTION_NAME),
        where('userId', '==', this.userId),
        where('fileHash', '==', fileHash),
        where('fileName', '==', file.name),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const data = doc.data() as Omit<FirebaseAnalysisData, 'id'>;
        return { ...data, id: doc.id };
      }

      return null;
    } catch (error) {
      logger.error('Error getting analysis by hash:', error);
      return null;
    }
  }

  private async updateUserStats(fileSize: number, issuesFound: number): Promise<void> {
    if (!this.userId) return;

    try {
      const userStatsRef = doc(db, FirebaseAnalysisStorageService.USER_STATS_COLLECTION, this.userId);
      const userStats = await safeGetDoc(userStatsRef, {
        totalAnalyses: 0,
        totalFilesAnalyzed: 0,
        totalIssuesFound: 0,
        totalBytesAnalyzed: 0,
        lastAnalysis: null,
      });

      const updateData = {
        totalAnalyses: (userStats.data?.totalAnalyses || 0) + 1,
        totalFilesAnalyzed: (userStats.data?.totalFilesAnalyzed || 0) + 1,
        totalIssuesFound: (userStats.data?.totalIssuesFound || 0) + issuesFound,
        totalBytesAnalyzed: (userStats.data?.totalBytesAnalyzed || 0) + fileSize,
        lastAnalysis: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await safeSetDoc(userStatsRef, this.sanitizeObject(updateData), { merge: true });
    } catch (error) {
      logger.error('Error updating user stats:', error);
    }
  }

  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private getDeviceInfo(): string {
    const platform = (navigator as any).userAgentData?.platform || 'Unknown';
    return `${platform} - ${navigator.userAgent.substring(0, 100)}`;
  }

  private compressResults(results: AnalysisResults): AnalysisResults {
    return {
      ...results,
      issues: results.issues?.map(issue => ({
        ...issue,
        codeSnippet: issue.codeSnippet ? this.compressString(issue.codeSnippet) : undefined,
      })) || [],
    };
  }

  private decompressResults(results: AnalysisResults): AnalysisResults {
    return {
      ...results,
      issues: results.issues?.map(issue => ({
        ...issue,
        codeSnippet: issue.codeSnippet ? this.decompressString(issue.codeSnippet) : undefined,
      })) || [],
    };
  }

  private compressString(str: string): string {
    try {
      return btoa(encodeURIComponent(str));
    } catch {
      return str;
    }
  }

  private decompressString(str: string): string {
    try {
      return decodeURIComponent(atob(str));
    } catch {
      return str;
    }
  }

  private getDataSize(data: any): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private notifyListeners(data: FirebaseAnalysisData[]): void {
    for (const callback of this.listeners) {
      try {
        callback(data);
      } catch (error) {
        logger.error('Error in listener callback:', error);
      }
    }
  }

  private sanitizeObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return null;
    }

    if (obj instanceof Date) {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    if (typeof obj === 'object' && obj.constructor === Object) {
      const newObj: { [key: string]: any } = {};
      for (const key in obj) {
        // Skip empty string keys (Firebase doesn't allow them)
        if (key === '') {
          continue;
        }
        if (Object.hasOwn(obj, key) && obj[key] !== undefined) {
          newObj[key] = this.sanitizeObject(obj[key]);
        }
      }
      return newObj;
    }

    return obj;
  }
}

// Global instance - lazy initialization for SSR compatibility
let _firebaseAnalysisStorage: FirebaseAnalysisStorageService | null = null;

export const getFirebaseAnalysisStorage = (): FirebaseAnalysisStorageService => {
  if (!_firebaseAnalysisStorage) {
    _firebaseAnalysisStorage = new FirebaseAnalysisStorageService();
  }
  return _firebaseAnalysisStorage;
};

// For backward compatibility - use getter instead
export const firebaseAnalysisStorage = typeof window !== 'undefined' 
  ? getFirebaseAnalysisStorage() 
  : (null as unknown as FirebaseAnalysisStorageService);
