// Enhanced Background Sync Service for File Uploads and Data Sync
import { toast } from 'sonner';

import { logger } from '@/utils/logger';
export interface SyncTask {
  id: string;
  type: 'file-upload' | 'analysis-data' | 'user-preferences' | 'analytics';
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'syncing' | 'completed' | 'failed';
}

export interface SyncProgress {
  taskId: string;
  progress: number;
  status: string;
  error?: string;
}

class EnhancedBackgroundSyncService {
  private syncTasks: Map<string, SyncTask> = new Map();
  private syncInProgress: Set<string> = new Set();
  private eventListeners: Map<string, Function[]> = new Map();
  private retryTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Only initialize on client side
    if (typeof window !== 'undefined') {
      this.initializeService();
    }
  }

  private async initializeService() {
    // Guard for SSR
    if (typeof window === 'undefined') return;
    
    // Load pending tasks from IndexedDB
    await this.loadPendingTasks();
    
    // Register service worker sync events
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
    }

    // Listen for online/offline events
    window.addEventListener('online', this.handleOnlineEvent.bind(this));
    window.addEventListener('offline', this.handleOfflineEvent.bind(this));
  }

  // Enhanced file upload with chunking and resume capability
  async scheduleFileUpload(files: File[], metadata: any = {}): Promise<string> {
    const taskId = this.generateTaskId();
    
    const task: SyncTask = {
      id: taskId,
      type: 'file-upload',
      data: {
        files: await this.prepareFilesForSync(files),
        metadata,
        chunks: await this.createFileChunks(files),
        uploadedChunks: []
      },
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      priority: 'high',
      status: 'pending'
    };

    this.syncTasks.set(taskId, task);
    await this.persistTask(task);
    
    // Try immediate sync if online
    if (navigator.onLine) {
      this.processSyncTask(taskId);
    } else {
      // Register for background sync
      await this.registerBackgroundSync('file-upload-' + taskId);
      toast.info('File upload queued for when connection is restored');
    }

    return taskId;
  }

  // Enhanced analysis data sync with conflict resolution
  async scheduleAnalysisDataSync(analysisData: any): Promise<string> {
    const taskId = this.generateTaskId();
    
    const task: SyncTask = {
      id: taskId,
      type: 'analysis-data',
      data: {
        ...analysisData,
        clientTimestamp: Date.now(),
        version: this.generateDataVersion()
      },
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 5,
      priority: 'medium',
      status: 'pending'
    };

    this.syncTasks.set(taskId, task);
    await this.persistTask(task);
    
    if (navigator.onLine) {
      this.processSyncTask(taskId);
    } else {
      await this.registerBackgroundSync('analysis-data-' + taskId);
    }

    return taskId;
  }

  // User preferences sync with local-first approach
  async schedulePreferencesSync(preferences: any): Promise<string> {
    const taskId = this.generateTaskId();
    
    const task: SyncTask = {
      id: taskId,
      type: 'user-preferences',
      data: {
        preferences,
        lastModified: Date.now(),
        deviceId: await this.getDeviceId()
      },
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: 3,
      priority: 'low',
      status: 'pending'
    };

    this.syncTasks.set(taskId, task);
    await this.persistTask(task);
    
    if (navigator.onLine) {
      this.processSyncTask(taskId);
    } else {
      await this.registerBackgroundSync('user-preferences-' + taskId);
    }

    return taskId;
  }

  private async processSyncTask(taskId: string): Promise<void> {
    const task = this.syncTasks.get(taskId);
    if (!task || this.syncInProgress.has(taskId)) return;

    this.syncInProgress.add(taskId);
    task.status = 'syncing';
    
    this.emitEvent('syncProgress', {
      taskId,
      progress: 0,
      status: 'Starting sync...'
    });

    try {
      switch (task.type) {
        case 'file-upload':
          await this.processFileUpload(task);
          break;
        case 'analysis-data':
          await this.processAnalysisDataSync(task);
          break;
        case 'user-preferences':
          await this.processPreferencesSync(task);
          break;
      }

      task.status = 'completed';
      this.emitEvent('syncCompleted', { taskId, task });
      await this.removeTask(taskId);
      
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      logger.error('Sync task failed:', err);
      task.retryCount++;
      task.status = 'failed';
      
      if (task.retryCount < task.maxRetries) {
        // Exponential backoff retry
        const retryDelay = Math.pow(2, task.retryCount) * 1000;
        this.retryTimeouts.set(taskId, setTimeout(() => {
          this.processSyncTask(taskId);
        }, retryDelay));
        
        this.emitEvent('syncRetry', { taskId, retryCount: task.retryCount, nextRetry: retryDelay });
      } else {
        this.emitEvent('syncFailed', { taskId, error: err.message });
        toast.error(`Sync failed for ${task.type}: ${err.message}`);
      }
    } finally {
      this.syncInProgress.delete(taskId);
    }
  }

  private async processFileUpload(task: SyncTask): Promise<void> {
    const { chunks, uploadedChunks, metadata } = task.data;
    const totalChunks = chunks.length;
    
    for (let i = 0; i < chunks.length; i++) {
      if (uploadedChunks.includes(i)) continue; // Skip already uploaded chunks
      
      const chunk = chunks[i];
      const progress = (i / totalChunks) * 100;
      
      this.emitEvent('syncProgress', {
        taskId: task.id,
        progress,
        status: `Uploading chunk ${i + 1} of ${totalChunks}`
      });

      // Upload chunk with retry logic
      await this.uploadChunk(chunk, i, task.id);
      uploadedChunks.push(i);
      
      // Update task progress
      task.data.uploadedChunks = uploadedChunks;
      await this.persistTask(task);
    }

    // Finalize upload
    await this.finalizeFileUpload(task.id, metadata);
  }

  private async processAnalysisDataSync(task: SyncTask): Promise<void> {
    const { data } = task;
    
    this.emitEvent('syncProgress', {
      taskId: task.id,
      progress: 25,
      status: 'Checking for conflicts...'
    });

    // Check for server-side conflicts
    const serverData = await this.fetchServerData(data.id);
    if (serverData && serverData.version > data.version) {
      // Resolve conflict using merge strategy
      const mergedData = await this.mergeAnalysisData(data, serverData);
      data.mergedData = mergedData;
    }

    this.emitEvent('syncProgress', {
      taskId: task.id,
      progress: 75,
      status: 'Uploading analysis data...'
    });

    await this.uploadAnalysisData(data);
  }

  private async processPreferencesSync(task: SyncTask): Promise<void> {
    const { preferences, deviceId } = task.data;
    
    this.emitEvent('syncProgress', {
      taskId: task.id,
      progress: 50,
      status: 'Syncing preferences...'
    });

    await this.uploadUserPreferences(preferences, deviceId);
  }

  // File chunking for large file uploads
  private async createFileChunks(files: File[]): Promise<any[]> {
    const chunks = [];
    const chunkSize = 1024 * 1024; // 1MB chunks
    
    for (const file of files) {
      const fileChunks = [];
      let offset = 0;
      
      while (offset < file.size) {
        const chunk = file.slice(offset, offset + chunkSize);
        const chunkData = await this.fileToBase64(chunk);
        
        fileChunks.push({
          data: chunkData,
          offset,
          size: chunk.size,
          fileName: file.name,
          fileType: file.type
        });
        
        offset += chunkSize;
      }
      
      chunks.push(...fileChunks);
    }
    
    return chunks;
  }

  private async prepareFilesForSync(files: File[]): Promise<any[]> {
    return Promise.all(files.map(async (file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      checksum: await this.calculateFileChecksum(file)
    })));
  }

  private async calculateFileChecksum(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private async fileToBase64(file: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // API calls for actual sync operations
  private async uploadChunk(chunk: any, index: number, taskId: string): Promise<void> {
    // Skip API calls in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Upload Chunk (dev mode):', { chunk, index, taskId });
      return;
    }

    const response = await fetch('/api/upload/chunk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chunk, index, taskId })
    });
    
    if (!response.ok) {
      throw new Error(`Chunk upload failed: ${response.statusText}`);
    }
  }

  private async finalizeFileUpload(taskId: string, metadata: any): Promise<void> {
    // Skip API calls in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Finalize File Upload (dev mode):', { taskId, metadata });
      return;
    }

    const response = await fetch('/api/upload/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId, metadata })
    });
    
    if (!response.ok) {
      throw new Error(`File upload finalization failed: ${response.statusText}`);
    }
  }

  private async uploadAnalysisData(data: any): Promise<void> {
    // Skip API calls in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Upload Analysis Data (dev mode):', data);
      return;
    }

    const response = await fetch('/api/analysis/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Analysis data sync failed: ${response.statusText}`);
    }
  }

  private async uploadUserPreferences(preferences: any, deviceId: string): Promise<void> {
    // Skip API calls in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Upload User Preferences (dev mode):', { preferences, deviceId });
      return;
    }

    const response = await fetch('/api/user/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preferences, deviceId })
    });
    
    if (!response.ok) {
      throw new Error(`Preferences sync failed: ${response.statusText}`);
    }
  }

  private async fetchServerData(id: string): Promise<any> {
    // Skip API calls in development mode
    if (process.env.NODE_ENV === 'development') {
      logger.debug('Fetch Server Data (dev mode):', { id });
      return null;
    }

    const response = await fetch(`/api/analysis/${id}`);
    return response.ok ? response.json() : null;
  }

  private async mergeAnalysisData(localData: any, serverData: any): Promise<any> {
    // Implement your merge strategy here
    return {
      ...serverData,
      ...localData,
      mergedAt: Date.now(),
      conflicts: this.detectConflicts(localData, serverData)
    };
  }

  private detectConflicts(local: any, server: any): string[] {
    const conflicts: string[] = [];
    // Add conflict detection logic
    return conflicts;
  }

  // Event handling
  addEventListener(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) listeners.splice(index, 1);
    }
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Service Worker integration
  private async registerBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    if (event.data?.type === 'BACKGROUND_SYNC_SUCCESS') {
      const { tag } = event.data;
      const taskId = tag.split('-').pop();
      if (taskId && this.syncTasks.has(taskId)) {
        this.processSyncTask(taskId);
      }
    }
  }

  private handleOnlineEvent(): void {
    // Process all pending tasks when coming online
    this.syncTasks.forEach((task, taskId) => {
      if (task.status === 'pending' || task.status === 'failed') {
        this.processSyncTask(taskId);
      }
    });
  }

  private handleOfflineEvent(): void {
    // Cancel ongoing syncs and prepare for offline mode
    this.syncInProgress.forEach(taskId => {
      const task = this.syncTasks.get(taskId);
      if (task) {
        task.status = 'pending';
      }
    });
    this.syncInProgress.clear();
  }

  // Utility methods
  private generateTaskId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDataVersion(): number {
    return Date.now();
  }

  private async getDeviceId(): Promise<string> {
    // Generate or retrieve device ID
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
      deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
  }

  // IndexedDB persistence
  private async persistTask(task: SyncTask): Promise<void> {
    // Implement IndexedDB storage
    const tasks = JSON.parse(localStorage.getItem('syncTasks') || '{}');
    tasks[task.id] = task;
    localStorage.setItem('syncTasks', JSON.stringify(tasks));
  }

  private async loadPendingTasks(): Promise<void> {
    const tasks = JSON.parse(localStorage.getItem('syncTasks') || '{}');
    Object.values(tasks).forEach((task: any) => {
      if (task.status === 'pending' || task.status === 'failed') {
        this.syncTasks.set(task.id, task);
      }
    });
  }

  private async removeTask(taskId: string): Promise<void> {
    this.syncTasks.delete(taskId);
    const tasks = JSON.parse(localStorage.getItem('syncTasks') || '{}');
    delete tasks[taskId];
    localStorage.setItem('syncTasks', JSON.stringify(tasks));
  }

  // Public API
  getSyncTasks(): SyncTask[] {
    return Array.from(this.syncTasks.values());
  }

  getSyncTask(taskId: string): SyncTask | undefined {
    return this.syncTasks.get(taskId);
  }

  cancelSyncTask(taskId: string): void {
    const timeout = this.retryTimeouts.get(taskId);
    if (timeout) {
      clearTimeout(timeout);
      this.retryTimeouts.delete(taskId);
    }
    this.removeTask(taskId);
  }

  async clearAllTasks(): Promise<void> {
    this.syncTasks.clear();
    this.retryTimeouts.forEach(timeout => clearTimeout(timeout));
    this.retryTimeouts.clear();
    localStorage.removeItem('syncTasks');
  }
}

export default new EnhancedBackgroundSyncService();