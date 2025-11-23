import { logger } from '@/utils/logger';

// Background Sync Service for PWA
// Handles offline file uploads and analysis requests

export interface SyncTask {
  id: string;
  type: 'file-upload' | 'analysis-request' | 'user-action';
  data: any;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

class BackgroundSyncService {
  private static instance: BackgroundSyncService;
  private syncQueue: SyncTask[] = [];
  private readonly STORAGE_KEY = 'pwa-sync-queue';
  private readonly MAX_RETRIES = 3;

  static getInstance(): BackgroundSyncService {
    if (!BackgroundSyncService.instance) {
      BackgroundSyncService.instance = new BackgroundSyncService();
    }
    return BackgroundSyncService.instance;
  }

  constructor() {
    this.loadQueue();
    this.setupEventListeners();
  }

  // Add task to sync queue
  async addTask(type: SyncTask['type'], data: any): Promise<string> {
    const task: SyncTask = {
      id: this.generateId(),
      type,
      data,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: this.MAX_RETRIES
    };

    this.syncQueue.push(task);
    this.saveQueue();

    // Try to register background sync if supported
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.sync.register(`background-sync-${task.type}`);
      } catch (error) {
        logger.warn('Background sync registration failed:', error);
        // Fallback: try to process immediately if online
        if (navigator.onLine) {
          this.processQueue();
        }
      }
    } else {
      // Fallback for browsers without background sync
      if (navigator.onLine) {
        this.processQueue();
      }
    }

    return task.id;
  }

  // Process sync queue
  async processQueue(): Promise<void> {
    if (this.syncQueue.length === 0) return;

    const tasksToProcess = [...this.syncQueue];
    
    for (const task of tasksToProcess) {
      try {
        await this.processTask(task);
        this.removeTask(task.id);
      } catch (error) {
        logger.error(`Failed to process task ${task.id}:`, error);
        task.retries++;
        
        if (task.retries >= task.maxRetries) {
          logger.error(`Task ${task.id} exceeded max retries, removing from queue`);
          this.removeTask(task.id);
        }
      }
    }

    this.saveQueue();
  }

  // Process individual task
  private async processTask(task: SyncTask): Promise<void> {
    switch (task.type) {
      case 'file-upload':
        await this.processFileUpload(task);
        break;
      case 'analysis-request':
        await this.processAnalysisRequest(task);
        break;
      case 'user-action':
        await this.processUserAction(task);
        break;
      default:
        throw new Error(`Unknown task type: ${task.type}`);
    }
  }

  // Process file upload task
  private async processFileUpload(task: SyncTask): Promise<void> {
    const { files, analysisOptions } = task.data;
    
    // Convert stored file data back to File objects if needed
    const fileObjects = await this.reconstructFiles(files);
    
    // Perform the actual upload and analysis
    const formData = new FormData();
    fileObjects.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });
    
    if (analysisOptions) {
      formData.append('options', JSON.stringify(analysisOptions));
    }

    // Skip API calls in development mode
    if (import.meta.env.DEV) {
      logger.debug('File Upload (dev mode):', { formData: Array.from(formData.entries()) });
      this.notifyUser('File upload completed (dev mode)', 'Your files would be analyzed in production');
      return;
    }

    const response = await fetch('/api/analyze', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }

    // Notify user of successful upload
    this.notifyUser('File upload completed', 'Your files have been analyzed successfully');
  }

  // Process analysis request task
  private async processAnalysisRequest(task: SyncTask): Promise<void> {
    const { analysisId, options } = task.data;
    
    // Skip API calls in development mode
    if (import.meta.env.DEV) {
      logger.debug('Analysis Request (dev mode):', { analysisId, options });
      this.notifyUser('Analysis completed (dev mode)', 'Your security analysis would be updated in production');
      return;
    }
    
    const response = await fetch(`/api/analysis/${analysisId}/rerun`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(options)
    });

    if (!response.ok) {
      throw new Error(`Analysis request failed: ${response.statusText}`);
    }

    this.notifyUser('Analysis completed', 'Your security analysis has been updated');
  }

  // Process user action task
  private async processUserAction(task: SyncTask): Promise<void> {
    const { action, payload } = task.data;
    
    // Skip API calls in development mode
    if (import.meta.env.DEV) {
      logger.debug('User Action Sync (dev mode):', { action, payload, timestamp: task.timestamp });
      return;
    }
    
    const response = await fetch('/api/user-actions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ action, payload, timestamp: task.timestamp })
    });

    if (!response.ok) {
      throw new Error(`User action sync failed: ${response.statusText}`);
    }
  }

  // Reconstruct File objects from stored data
  private async reconstructFiles(fileData: any[]): Promise<File[]> {
    return Promise.all(
      fileData.map(async (data) => {
        if (data.content) {
          // If we have the content stored
          const blob = new Blob([data.content], { type: data.type });
          return new File([blob], data.name, { type: data.type });
        } else if (data.path) {
          // If we have a file path (for larger files)
          const response = await fetch(data.path);
          const blob = await response.blob();
          return new File([blob], data.name, { type: data.type });
        }
        throw new Error('Invalid file data');
      })
    );
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Process queue when coming back online
    window.addEventListener('online', () => {
      logger.debug('Back online, processing sync queue');
      this.processQueue();
    });

    // Listen for messages from service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'BACKGROUND_SYNC') {
          this.processQueue();
        }
      });
    }
  }

  // Utility methods
  private generateId(): string {
    return `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private removeTask(id: string): void {
    this.syncQueue = this.syncQueue.filter(task => task.id !== id);
  }

  private saveQueue(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.syncQueue));
    } catch (error) {
      logger.error('Failed to save sync queue:', error);
    }
  }

  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('Failed to load sync queue:', error);
      this.syncQueue = [];
    }
  }

  private async notifyUser(title: string, body: string): Promise<void> {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon-192x192.svg',
        badge: '/favicon-192x192.svg'
      });
    }
  }

  // Public methods for queue management
  getQueueStatus(): { pending: number; failed: number } {
    const pending = this.syncQueue.filter(task => task.retries < task.maxRetries).length;
    const failed = this.syncQueue.filter(task => task.retries >= task.maxRetries).length;
    return { pending, failed };
  }

  clearQueue(): void {
    this.syncQueue = [];
    this.saveQueue();
  }

  getQueue(): SyncTask[] {
    return [...this.syncQueue];
  }
}

export default BackgroundSyncService;