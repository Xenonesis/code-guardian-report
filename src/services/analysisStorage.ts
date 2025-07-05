/**
 * Advanced Analysis Results Storage Service
 * Provides persistent storage for analysis results with advanced features:
 * - Persistent storage until new file upload
 * - Data compression to save space
 * - Version management
 * - Cross-tab synchronization
 * - Automatic cleanup
 * - Backup/restore functionality
 */

import { AnalysisResults } from '@/hooks/useAnalysis';
import { setLocalStorageItem, removeLocalStorageItem, createStorageChangeListener } from '@/utils/storageEvents';

interface StoredAnalysisData {
  id: string;
  timestamp: number;
  fileName: string;
  fileSize: number;
  fileHash: string;
  version: string;
  results: AnalysisResults;
  metadata: {
    userAgent: string;
    analysisEngine: string;
    engineVersion: string;
    sessionId: string;
  };
  compressed?: boolean;
}

export type { StoredAnalysisData };

interface AnalysisHistory {
  currentAnalysis: StoredAnalysisData | null;
  previousAnalyses: StoredAnalysisData[];
  maxHistorySize: number;
  totalStorageUsed: number;
}

export class AnalysisStorageService {
  private static readonly STORAGE_KEY = 'codeGuardianAnalysis';
  private static readonly HISTORY_KEY = 'codeGuardianHistory';
  private static readonly VERSION = '2.0.0';
  private static readonly MAX_HISTORY_SIZE = 5;
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly COMPRESSION_THRESHOLD = 100 * 1024; // 100KB

  private sessionId: string;
  private listeners: Set<(data: StoredAnalysisData | null) => void> = new Set();

  constructor() {
    this.sessionId = this.generateSessionId();
    this.initializeStorage();
    this.setupStorageListener();
  }

  /**
   * Store analysis results with advanced features
   */
  public async storeAnalysisResults(
    results: AnalysisResults,
    file: File
  ): Promise<void> {
    try {
      const fileHash = await this.calculateFileHash(file);
      const analysisData: StoredAnalysisData = {
        id: this.generateAnalysisId(),
        timestamp: Date.now(),
        fileName: file.name,
        fileSize: file.size,
        fileHash,
        version: AnalysisStorageService.VERSION,
        results,
        metadata: {
          userAgent: navigator.userAgent,
          analysisEngine: 'EnhancedAnalysisEngine',
          engineVersion: '3.0.0',
          sessionId: this.sessionId,
        },
      };

      // Compress large results
      if (this.getDataSize(analysisData) > AnalysisStorageService.COMPRESSION_THRESHOLD) {
        analysisData.compressed = true;
        analysisData.results = this.compressResults(results);
      }

      // Store current analysis
      setLocalStorageItem(AnalysisStorageService.STORAGE_KEY, JSON.stringify(analysisData));

      // Update history
      await this.updateAnalysisHistory(analysisData);

      // Notify listeners
      this.notifyListeners(analysisData);

      console.log('✅ Analysis results stored successfully:', {
        id: analysisData.id,
        fileName: file.name,
        size: this.formatBytes(this.getDataSize(analysisData)),
        compressed: analysisData.compressed,
      });

    } catch (error) {
      console.error('❌ Failed to store analysis results:', error);
      throw new Error('Failed to store analysis results');
    }
  }

  /**
   * Retrieve current analysis results
   */
  public getCurrentAnalysis(): StoredAnalysisData | null {
    try {
      const stored = localStorage.getItem(AnalysisStorageService.STORAGE_KEY);
      if (!stored) return null;

      const data: StoredAnalysisData = JSON.parse(stored);
      
      // Decompress if needed
      if (data.compressed) {
        data.results = this.decompressResults(data.results);
      }

      // Validate version compatibility
      if (!this.isVersionCompatible(data.version)) {
        console.warn('⚠️ Analysis data version incompatible, clearing storage');
        this.clearCurrentAnalysis();
        return null;
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to retrieve analysis results:', error);
      this.clearCurrentAnalysis();
      return null;
    }
  }

  /**
   * Check if analysis results exist for the current session
   */
  public hasStoredAnalysis(): boolean {
    return this.getCurrentAnalysis() !== null;
  }

  /**
   * Check if new file is different from stored analysis
   */
  public async isNewFile(file: File): Promise<boolean> {
    const current = this.getCurrentAnalysis();
    if (!current) return true;

    const newHash = await this.calculateFileHash(file);
    return current.fileHash !== newHash || current.fileName !== file.name;
  }

  /**
   * Clear current analysis (called when new file is uploaded)
   */
  public clearCurrentAnalysis(): void {
    removeLocalStorageItem(AnalysisStorageService.STORAGE_KEY);
    this.notifyListeners(null);
    console.log('🗑️ Current analysis cleared');
  }

  /**
   * Get analysis history
   */
  public getAnalysisHistory(): AnalysisHistory {
    try {
      const stored = localStorage.getItem(AnalysisStorageService.HISTORY_KEY);
      if (!stored) {
        return this.createEmptyHistory();
      }

      const history: AnalysisHistory = JSON.parse(stored);
      return {
        ...history,
        currentAnalysis: this.getCurrentAnalysis(),
      };
    } catch (error) {
      console.error('❌ Failed to retrieve analysis history:', error);
      return this.createEmptyHistory();
    }
  }

  /**
   * Export analysis results
   */
  public exportAnalysis(format: 'json' | 'compressed' = 'json'): string {
    const current = this.getCurrentAnalysis();
    if (!current) throw new Error('No analysis results to export');

    if (format === 'compressed') {
      return this.compressData(JSON.stringify(current));
    }

    return JSON.stringify(current, null, 2);
  }

  /**
   * Import analysis results
   */
  public importAnalysis(data: string, compressed: boolean = false): void {
    try {
      const parsedData = compressed ? 
        JSON.parse(this.decompressData(data)) : 
        JSON.parse(data);

      if (this.validateAnalysisData(parsedData)) {
        setLocalStorageItem(AnalysisStorageService.STORAGE_KEY, JSON.stringify(parsedData));
        this.notifyListeners(parsedData);
        console.log('✅ Analysis results imported successfully');
      } else {
        throw new Error('Invalid analysis data format');
      }
    } catch (error) {
      console.error('❌ Failed to import analysis results:', error);
      throw new Error('Failed to import analysis results');
    }
  }

  /**
   * Get storage statistics
   */
  public getStorageStats(): {
    currentSize: number;
    maxSize: number;
    usagePercentage: number;
    historyCount: number;
    compressionRatio?: number;
  } {
    const current = this.getCurrentAnalysis();
    const history = this.getAnalysisHistory();
    
    const currentSize = current ? this.getDataSize(current) : 0;
    const historySize = history.previousAnalyses.reduce(
      (sum, analysis) => sum + this.getDataSize(analysis), 
      0
    );
    
    const totalSize = currentSize + historySize;
    const compressionRatio = current?.compressed ? 
      this.calculateCompressionRatio(current) : undefined;

    return {
      currentSize: totalSize,
      maxSize: AnalysisStorageService.MAX_STORAGE_SIZE,
      usagePercentage: (totalSize / AnalysisStorageService.MAX_STORAGE_SIZE) * 100,
      historyCount: history.previousAnalyses.length,
      compressionRatio,
    };
  }

  /**
   * Subscribe to storage changes
   */
  public subscribe(callback: (data: StoredAnalysisData | null) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Cleanup old data and optimize storage
   */
  public async optimizeStorage(): Promise<void> {
    const history = this.getAnalysisHistory();
    const stats = this.getStorageStats();

    // Remove old entries if storage is full
    if (stats.usagePercentage > 80) {
      const sortedHistory = history.previousAnalyses
        .sort((a, b) => a.timestamp - b.timestamp);

      // Remove oldest entries
      const toRemove = Math.ceil(sortedHistory.length * 0.3);
      const optimizedHistory = sortedHistory.slice(toRemove);

      await this.saveHistory({
        ...history,
        previousAnalyses: optimizedHistory,
      });

      console.log(`🧹 Storage optimized: removed ${toRemove} old entries`);
    }
  }

  // Private methods

  private initializeStorage(): void {
    // Ensure storage keys exist
    if (!localStorage.getItem(AnalysisStorageService.HISTORY_KEY)) {
      const emptyHistory = this.createEmptyHistory();
      localStorage.setItem(AnalysisStorageService.HISTORY_KEY, JSON.stringify(emptyHistory));
    }
  }

  private setupStorageListener(): void {
    createStorageChangeListener(
      AnalysisStorageService.STORAGE_KEY,
      (newValue) => {
        if (newValue) {
          try {
            const data: StoredAnalysisData = JSON.parse(newValue);
            this.notifyListeners(data);
          } catch (error) {
            console.error('Failed to parse storage change:', error);
          }
        } else {
          this.notifyListeners(null);
        }
      }
    );
  }

  private async updateAnalysisHistory(analysisData: StoredAnalysisData): Promise<void> {
    const history = this.getAnalysisHistory();
    
    // Add current to history if it exists
    if (history.currentAnalysis && history.currentAnalysis.id !== analysisData.id) {
      history.previousAnalyses.unshift(history.currentAnalysis);
    }

    // Limit history size
    if (history.previousAnalyses.length > AnalysisStorageService.MAX_HISTORY_SIZE) {
      history.previousAnalyses = history.previousAnalyses.slice(0, AnalysisStorageService.MAX_HISTORY_SIZE);
    }

    await this.saveHistory(history);
  }

  private async saveHistory(history: AnalysisHistory): Promise<void> {
    const historyToSave = {
      ...history,
      currentAnalysis: null, // Don't duplicate current analysis in history
      totalStorageUsed: this.calculateTotalStorageUsed(history),
    };

    localStorage.setItem(AnalysisStorageService.HISTORY_KEY, JSON.stringify(historyToSave));
  }

  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private compressResults(results: AnalysisResults): AnalysisResults {
    // Implement basic compression by removing unnecessary data
    return {
      ...results,
      issues: results.issues.map(issue => ({
        ...issue,
        codeSnippet: issue.codeSnippet ? this.compressString(issue.codeSnippet) : undefined,
      })),
    };
  }

  private decompressResults(results: AnalysisResults): AnalysisResults {
    return {
      ...results,
      issues: results.issues.map(issue => ({
        ...issue,
        codeSnippet: issue.codeSnippet ? this.decompressString(issue.codeSnippet) : undefined,
      })),
    };
  }

  private compressString(str: string): string {
    // Simple compression simulation (in real implementation, use LZ-string or similar)
    return btoa(str);
  }

  private decompressString(str: string): string {
    try {
      return atob(str);
    } catch {
      return str; // Return as-is if decompression fails
    }
  }

  private compressData(data: string): string {
    return btoa(data);
  }

  private decompressData(data: string): string {
    return atob(data);
  }

  private getDataSize(data: StoredAnalysisData): number {
    return new Blob([JSON.stringify(data)]).size;
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  private isVersionCompatible(version: string): boolean {
    const [major] = version.split('.').map(Number);
    const [currentMajor] = AnalysisStorageService.VERSION.split('.').map(Number);
    return major === currentMajor;
  }

  private validateAnalysisData(data: unknown): data is StoredAnalysisData {
    if (!data || typeof data !== 'object' || data === null) return false;
    
    const obj = data as Record<string, unknown>;
    
    if (typeof obj.id !== 'string') return false;
    if (typeof obj.timestamp !== 'number') return false;
    if (typeof obj.fileName !== 'string') return false;
    if (!obj.results || typeof obj.results !== 'object' || obj.results === null) return false;
    
    const results = obj.results as Record<string, unknown>;
    if (!('issues' in results) || !Array.isArray(results.issues)) return false;
    
    return true;
  }

  private createEmptyHistory(): AnalysisHistory {
    return {
      currentAnalysis: null,
      previousAnalyses: [],
      maxHistorySize: AnalysisStorageService.MAX_HISTORY_SIZE,
      totalStorageUsed: 0,
    };
  }

  private calculateTotalStorageUsed(history: AnalysisHistory): number {
    return history.previousAnalyses.reduce(
      (sum, analysis) => sum + this.getDataSize(analysis),
      0
    );
  }

  private calculateCompressionRatio(data: StoredAnalysisData): number {
    const originalSize = this.getDataSize({
      ...data,
      compressed: false,
      results: this.decompressResults(data.results),
    });
    const compressedSize = this.getDataSize(data);
    return compressedSize / originalSize;
  }

  private notifyListeners(data: StoredAnalysisData | null): void {
    this.listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in storage listener:', error);
      }
    });
  }
}

// Global instance
export const analysisStorage = new AnalysisStorageService();

// Export hook for React components
export function useAnalysisStorage() {
  return analysisStorage;
}
