// Background Sync Service for File Uploads
// Handles offline file uploads and queues them for when connection is restored

import { PWA_CONFIG } from '@/config/pwa';

export interface UploadTask {
  id: string;
  file: File;
  metadata: {
    name: string;
    size: number;
    type: string;
    timestamp: number;
  };
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
}

class BackgroundSyncService {
  private dbName = PWA_CONFIG.offlineStorage.dbName + 'Sync';
  private dbVersion = PWA_CONFIG.offlineStorage.dbVersion;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof indexedDB === 'undefined') {
      return; // SSR guard
    }
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create upload tasks store
        if (!db.objectStoreNames.contains('uploadTasks')) {
          const store = db.createObjectStore('uploadTasks', { keyPath: 'id' });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('timestamp', 'metadata.timestamp', { unique: false });
        }
        
        // Create analytics store
        if (!db.objectStoreNames.contains('analytics')) {
          db.createObjectStore('analytics', { keyPath: 'id' });
        }
      };
    });
  }

  async queueUpload(file: File, metadata?: Partial<UploadTask['metadata']>): Promise<string> {
    if (!this.db) await this.init();
    
    const taskId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const task: UploadTask = {
      id: taskId,
      file,
      metadata: {
        name: file.name,
        size: file.size,
        type: file.type,
        timestamp: Date.now(),
        ...metadata
      },
      progress: 0,
      status: 'pending',
      retryCount: 0
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['uploadTasks'], 'readwrite');
      const store = transaction.objectStore('uploadTasks');
      
      const request = store.add(task);
      request.onsuccess = () => {
        this.registerBackgroundSync('file-upload');
        resolve(taskId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getPendingUploads(): Promise<UploadTask[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['uploadTasks'], 'readonly');
      const store = transaction.objectStore('uploadTasks');
      const index = store.index('status');
      
      const request = index.getAll('pending');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTaskStatus(taskId: string, status: UploadTask['status'], progress?: number): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['uploadTasks'], 'readwrite');
      const store = transaction.objectStore('uploadTasks');
      
      const getRequest = store.get(taskId);
      getRequest.onsuccess = () => {
        const task = getRequest.result;
        if (task) {
          task.status = status;
          if (progress !== undefined) task.progress = progress;
          
          const updateRequest = store.put(task);
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(updateRequest.error);
        } else {
          reject(new Error('Task not found'));
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async processUploadQueue(): Promise<void> {
    const pendingUploads = await this.getPendingUploads();
    
    for (const task of pendingUploads) {
      try {
        await this.uploadFile(task);
      } catch (error) {
        await this.updateTaskStatus(task.id, 'failed');
      }
    }
  }

  private async uploadFile(task: UploadTask): Promise<void> {
    await this.updateTaskStatus(task.id, 'uploading', 0);
    
    const formData = new FormData();
    formData.append('file', task.file);
    formData.append('metadata', JSON.stringify(task.metadata));
    
    const response = await fetch(PWA_CONFIG.backgroundSync.uploadEndpoint, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    await this.updateTaskStatus(task.id, 'completed', 100);
  }

  private async registerBackgroundSync(tag: string): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
    }
  }

  async getUploadHistory(): Promise<UploadTask[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['uploadTasks'], 'readonly');
      const store = transaction.objectStore('uploadTasks');
      const index = store.index('timestamp');
      
      const request = index.getAll();
      request.onsuccess = () => {
        const tasks = request.result.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);
        resolve(tasks);
      };
      request.onerror = () => reject(request.error);
    });
  }
}

export const backgroundSyncService = new BackgroundSyncService();