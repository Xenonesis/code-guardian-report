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

import { AnalysisResults } from "@/hooks/useAnalysis";
import {
  setLocalStorageItem,
  removeLocalStorageItem,
  createStorageChangeListener,
} from "@/utils/storageEvents";
import { logger } from "@/utils/logger";
import { toast } from "@/hooks/use-toast";

function structuredCloneSafe<T>(value: T): T {
  // structuredClone isn't available everywhere (and can be expensive). We only need a cheap deep copy.
  try {
    const sc = (globalThis as any).structuredClone as ((v: T) => T) | undefined;
    if (typeof sc === "function") {
      return sc(value);
    }
  } catch {
    // ignore
  }

  // Fallback: JSON clone. Good enough for our plain data objects.
  return JSON.parse(JSON.stringify(value)) as T;
}

// Custom error class for storage-related errors
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly code:
      | "QUOTA_EXCEEDED"
      | "PARSE_ERROR"
      | "VERSION_MISMATCH"
      | "NOT_FOUND"
      | "UNKNOWN",
    public readonly recoverable: boolean = true
  ) {
    super(message);
    this.name = "StorageError";
  }
}

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

export interface StorageStats {
  currentSize: number;
  maxSize: number;
  usagePercentage: number;
  historyCount: number;
  compressionRatio?: number;
}

interface AnalysisHistory {
  currentAnalysis: StoredAnalysisData | null;
  previousAnalyses: StoredAnalysisData[];
  maxHistorySize: number;
  totalStorageUsed: number;
}

export class AnalysisStorageService {
  private static readonly STORAGE_KEY = "codeGuardianAnalysis";
  private static readonly HISTORY_KEY = "codeGuardianHistory";
  private static readonly VERSION = "2.0.0";
  private static readonly MAX_HISTORY_SIZE = 5;
  private static readonly MAX_STORAGE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly COMPRESSION_THRESHOLD = 100 * 1024; // 100KB

  private sessionId: string;
  private listeners: Set<(data: StoredAnalysisData | null) => void> = new Set();

  constructor() {
    this.sessionId = this.generateSessionId();
    if (typeof window !== "undefined") {
      this.initializeStorage();
      this.setupStorageListener();
    }
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
          analysisEngine: "EnhancedAnalysisEngine",
          engineVersion: "3.0.0",
          sessionId: this.sessionId,
        },
      };

      // Prepare payload (compress/reduce) before writing to localStorage.
      const { payloadToStore, serialized } = this.preparePayloadForStorage(
        analysisData,
        AnalysisStorageService.DEFAULT_ITEM_BUDGET_BYTES
      );

      // Store current analysis with quota error handling
      try {
        setLocalStorageItem(AnalysisStorageService.STORAGE_KEY, serialized);
      } catch (storageError) {
        // Check if it's a quota exceeded error
        if (
          storageError instanceof Error &&
          (storageError.name === "QuotaExceededError" ||
            storageError.message.includes("quota"))
        ) {
          logger.warn("Storage quota exceeded, attempting cleanup...");
          await this.optimizeStorage();
          // Retry after cleanup
          setLocalStorageItem(AnalysisStorageService.STORAGE_KEY, serialized);
        } else {
          throw storageError;
        }
      }

      // Ensure in-memory/history uses the same payload as persisted
      analysisData.compressed = payloadToStore.compressed;
      analysisData.results = payloadToStore.results;

      // Update history
      await this.updateAnalysisHistory(analysisData);

      // Notify listeners
      this.notifyListeners(analysisData);

      logger.debug("Analysis results stored successfully");
    } catch (error) {
      logger.error("Failed to store analysis results:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      throw new StorageError(
        `Failed to store analysis results: ${errorMessage}`,
        errorMessage.includes("quota") ? "QUOTA_EXCEEDED" : "UNKNOWN",
        true
      );
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
        toast({
          title: "Version Mismatch",
          description:
            "Your stored data is from an older version and will be refreshed.",
          variant: "destructive",
        });
        this.clearCurrentAnalysis();
        return null;
      }

      return data;
    } catch (error) {
      toast({
        title: "Data Corrupted",
        description: "Unable to read stored analysis data. Starting fresh.",
        variant: "destructive",
      });
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
      toast({
        title: "Storage Error",
        description: "Unable to retrieve analysis history.",
        variant: "destructive",
      });
      return this.createEmptyHistory();
    }
  }

  /**
   * Export analysis results
   */
  public exportAnalysis(format: "json" | "compressed" = "json"): string {
    const current = this.getCurrentAnalysis();
    if (!current) throw new Error("No analysis results to export");

    if (format === "compressed") {
      return this.compressData(JSON.stringify(current));
    }

    return JSON.stringify(current, null, 2);
  }

  /**
   * Import analysis results
   */
  public importAnalysis(data: string, compressed: boolean = false): void {
    try {
      const parsedData = compressed
        ? JSON.parse(this.decompressData(data))
        : JSON.parse(data);

      if (this.validateAnalysisData(parsedData)) {
        setLocalStorageItem(
          AnalysisStorageService.STORAGE_KEY,
          JSON.stringify(parsedData)
        );
        this.notifyListeners(parsedData);
      } else {
        throw new Error("Invalid analysis data format");
      }
    } catch (error) {
      throw new Error("Failed to import analysis results");
    }
  }

  /**
   * Get storage statistics
   */
  public getStorageStats(): StorageStats {
    const current = this.getCurrentAnalysis();
    const history = this.getAnalysisHistory();

    const currentSize = current ? this.getDataSize(current) : 0;
    const historySize = history.previousAnalyses.reduce(
      (sum, analysis) => sum + this.getDataSize(analysis),
      0
    );

    const totalSize = currentSize + historySize;
    const compressionRatio = current?.compressed
      ? this.calculateCompressionRatio(current)
      : undefined;

    return {
      currentSize: totalSize,
      maxSize: AnalysisStorageService.MAX_STORAGE_SIZE,
      usagePercentage:
        (totalSize / AnalysisStorageService.MAX_STORAGE_SIZE) * 100,
      historyCount: history.previousAnalyses.length,
      compressionRatio,
    };
  }

  /**
   * Subscribe to storage changes
   */
  public subscribe(
    callback: (data: StoredAnalysisData | null) => void
  ): () => void {
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
      const sortedHistory = history.previousAnalyses.sort(
        (a, b) => a.timestamp - b.timestamp
      );

      // Remove oldest entries
      const toRemove = Math.ceil(sortedHistory.length * 0.3);
      const optimizedHistory = sortedHistory.slice(toRemove);

      await this.saveHistory({
        ...history,
        previousAnalyses: optimizedHistory,
      });
    }
  }

  // Private methods

  private initializeStorage(): void {
    // Ensure storage keys exist
    if (!localStorage.getItem(AnalysisStorageService.HISTORY_KEY)) {
      const emptyHistory = this.createEmptyHistory();
      localStorage.setItem(
        AnalysisStorageService.HISTORY_KEY,
        JSON.stringify(emptyHistory)
      );
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
            // Silent error handling
          }
        } else {
          this.notifyListeners(null);
        }
      }
    );
  }

  private async updateAnalysisHistory(
    analysisData: StoredAnalysisData
  ): Promise<void> {
    const history = this.getAnalysisHistory();

    // Add current to history if it exists
    if (
      history.currentAnalysis &&
      history.currentAnalysis.id !== analysisData.id
    ) {
      history.previousAnalyses.unshift(history.currentAnalysis);
    }

    // Limit history size
    if (
      history.previousAnalyses.length > AnalysisStorageService.MAX_HISTORY_SIZE
    ) {
      history.previousAnalyses = history.previousAnalyses.slice(
        0,
        AnalysisStorageService.MAX_HISTORY_SIZE
      );
    }

    await this.saveHistory(history);
  }

  private async saveHistory(history: AnalysisHistory): Promise<void> {
    const historyToSave = {
      ...history,
      currentAnalysis: null, // Don't duplicate current analysis in history
      totalStorageUsed: this.calculateTotalStorageUsed(history),
    };

    localStorage.setItem(
      AnalysisStorageService.HISTORY_KEY,
      JSON.stringify(historyToSave)
    );
  }

  private async calculateFileHash(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  private generateAnalysisId(): string {
    return `analysis_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }

  private compressResults(results: AnalysisResults): AnalysisResults {
    // Implement basic compression by removing unnecessary data
    return {
      ...results,
      issues: results.issues.map((issue) => ({
        ...issue,
        codeSnippet: issue.codeSnippet
          ? this.compressString(issue.codeSnippet)
          : undefined,
      })),
    };
  }

  private decompressResults(results: AnalysisResults): AnalysisResults {
    return {
      ...results,
      issues: results.issues.map((issue) => ({
        ...issue,
        codeSnippet: issue.codeSnippet
          ? this.decompressString(issue.codeSnippet)
          : undefined,
      })),
    };
  }

  private compressString(str: string): string {
    // Handle Unicode characters correctly
    return btoa(encodeURIComponent(str));
  }

  private decompressString(str: string): string {
    try {
      return decodeURIComponent(atob(str));
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

  private static readonly DEFAULT_ITEM_BUDGET_BYTES = 4.5 * 1024 * 1024; // ~4.5MB per item (safe across browsers)
  private static readonly MAX_ISSUES_STORED = 2000;
  private static readonly MAX_ISSUES_STORED_MIN = 200;

  private safeStringify(value: unknown): string {
    // JSON.stringify can throw (e.g. RangeError: Invalid string length) on extremely large payloads.
    try {
      return JSON.stringify(value);
    } catch (error) {
      if (error instanceof RangeError) {
        throw error;
      }
      // Re-throw other errors for visibility
      throw error;
    }
  }

  private getUtf8ByteLength(str: string): number {
    // TextEncoder exists in browsers + happy-dom; fallback to Blob if needed.
    try {
      return new TextEncoder().encode(str).byteLength;
    } catch {
      return new Blob([str]).size;
    }
  }

  private getDataSize(data: StoredAnalysisData): number {
    // Avoid RangeError by estimating size when payload is too large to stringify.
    try {
      return this.getUtf8ByteLength(this.safeStringify(data));
    } catch (error) {
      if (error instanceof RangeError) {
        return this.estimateDataSize(data);
      }
      throw error;
    }
  }

  private estimateDataSize(data: StoredAnalysisData): number {
    // Estimate based on sampling issues to avoid serializing the entire payload.
    const baseOverhead = 4 * 1024; // conservative fixed overhead
    const issues = data.results?.issues ?? [];

    const sampleCount = Math.min(50, issues.length);
    let sampleBytes = 0;
    for (let i = 0; i < sampleCount; i++) {
      try {
        sampleBytes += this.getUtf8ByteLength(this.safeStringify(issues[i]));
      } catch {
        // If even a single issue can't stringify, assume it's huge.
        sampleBytes += 50 * 1024;
      }
    }

    const avgIssueBytes = sampleCount > 0 ? sampleBytes / sampleCount : 512;
    return baseOverhead + Math.ceil(avgIssueBytes * issues.length);
  }

  private preparePayloadForStorage(
    original: StoredAnalysisData,
    budgetBytes: number
  ): { payloadToStore: StoredAnalysisData; serialized: string } {
    // Strategy:
    // 1) Try original
    // 2) If above threshold, compress snippets
    // 3) If still too big, strip heavy optional fields
    // 4) If still too big, progressively truncate issues list

    const steps: Array<(d: StoredAnalysisData) => StoredAnalysisData> = [
      (d) => d,
      (d) => {
        // Only compress when we expect it to help (or when forced due to size issues)
        const shouldCompress =
          this.getDataSize(d) > AnalysisStorageService.COMPRESSION_THRESHOLD;
        if (!shouldCompress) return d;
        return {
          ...d,
          compressed: true,
          results: this.compressResults(d.results),
        };
      },
      (d) => this.stripHeavyFields(d),
    ];

    for (const transform of steps) {
      const candidate = transform(structuredCloneSafe(original));
      const attempt = this.trySerializeWithinBudget(candidate, budgetBytes);
      if (attempt) return attempt;
    }

    // Last resort: truncate issues progressively
    const base = this.stripHeavyFields({
      ...original,
      compressed: true,
      results: this.compressResults(original.results),
    });

    const total = base.results.issues.length;
    let keep = Math.min(AnalysisStorageService.MAX_ISSUES_STORED, total);
    keep = Math.max(keep, AnalysisStorageService.MAX_ISSUES_STORED_MIN);

    while (keep >= AnalysisStorageService.MAX_ISSUES_STORED_MIN) {
      const truncated = this.truncateIssues(base, keep, total);
      const attempt = this.trySerializeWithinBudget(truncated, budgetBytes);
      if (attempt) return attempt;
      keep = Math.floor(keep * 0.7);
    }

    // Absolute last resort: store only summary/metadata without issues
    const minimal = this.truncateIssues(base, 0, total);
    const serialized = this.safeStringify(minimal);
    return { payloadToStore: minimal, serialized };
  }

  private trySerializeWithinBudget(
    payload: StoredAnalysisData,
    budgetBytes: number
  ): { payloadToStore: StoredAnalysisData; serialized: string } | null {
    try {
      const serialized = this.safeStringify(payload);
      const bytes = this.getUtf8ByteLength(serialized);
      if (bytes <= budgetBytes) {
        return { payloadToStore: payload, serialized };
      }
      return null;
    } catch (error) {
      // If stringify fails due to size, fall back to next step.
      if (error instanceof RangeError) return null;
      throw error;
    }
  }

  private stripHeavyFields(data: StoredAnalysisData): StoredAnalysisData {
    const strippedResults: AnalysisResults = {
      ...data.results,
      // Keep issues but strip the largest optional fields.
      issues: data.results.issues.map((issue) => ({
        ...issue,
        codeSnippet: undefined,
        aiSummary: undefined,
        naturalLanguageDescription: undefined,
        remediation: {
          ...issue.remediation,
          codeExample: undefined,
          fixExample: undefined,
        },
        references: issue.references?.slice(0, 10),
        tags: issue.tags?.slice(0, 10),
      })),
      // zipAnalysis/dependencyAnalysis can be very large; drop for local storage to keep UI stable.
      zipAnalysis: undefined,
      dependencyAnalysis: undefined,
    };

    return {
      ...data,
      results: strippedResults,
      compressed: data.compressed ?? false,
    };
  }

  private truncateIssues(
    data: StoredAnalysisData,
    keepCount: number,
    totalCount: number
  ): StoredAnalysisData {
    const keptIssues = data.results.issues.slice(0, keepCount);

    const recalculatedSummary = this.recalculateSummaryFromIssues(
      keptIssues,
      data.results.summary
    );

    return {
      ...data,
      results: {
        ...data.results,
        issues: keptIssues,
        summary: {
          ...recalculatedSummary,
          // Signal truncation to UI/exporters if they want to show a warning.
          // (extra fields are safe as consumers treat summary as a plain object)
          ...(totalCount > keepCount
            ? { truncated: true, originalIssueCount: totalCount }
            : {}),
        } as AnalysisResults["summary"] & {
          truncated?: boolean;
          originalIssueCount?: number;
        },
      },
    };
  }

  private recalculateSummaryFromIssues(
    issues: AnalysisResults["issues"],
    existingSummary: AnalysisResults["summary"]
  ): AnalysisResults["summary"] {
    // Keep scores/coverage/linesAnalyzed from existing summary; recompute severity counts.
    let criticalIssues = 0;
    let highIssues = 0;
    let mediumIssues = 0;
    let lowIssues = 0;

    for (const issue of issues) {
      switch (issue.severity) {
        case "Critical":
          criticalIssues++;
          break;
        case "High":
          highIssues++;
          break;
        case "Medium":
          mediumIssues++;
          break;
        case "Low":
          lowIssues++;
          break;
      }
    }

    return {
      ...existingSummary,
      criticalIssues,
      highIssues,
      mediumIssues,
      lowIssues,
    };
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return (
      Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
    );
  }

  private isVersionCompatible(version: string): boolean {
    const [major] = version.split(".").map(Number);
    const [currentMajor] =
      AnalysisStorageService.VERSION.split(".").map(Number);
    return major === currentMajor;
  }

  private validateAnalysisData(data: unknown): data is StoredAnalysisData {
    if (!data || typeof data !== "object" || data === null) return false;

    const obj = data as Record<string, unknown>;

    if (typeof obj.id !== "string") return false;
    if (typeof obj.timestamp !== "number") return false;
    if (typeof obj.fileName !== "string") return false;
    if (!obj.results || typeof obj.results !== "object" || obj.results === null)
      return false;

    const results = obj.results as Record<string, unknown>;
    if (!("issues" in results) || !Array.isArray(results.issues)) return false;

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
    for (const callback of this.listeners) {
      try {
        callback(data);
      } catch (error) {
        // Silent error handling
      }
    }
  }
}

// Global instance
export const analysisStorage = new AnalysisStorageService();

// Export hook for React components
export function useAnalysisStorage() {
  return analysisStorage;
}
