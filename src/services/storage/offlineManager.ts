// Enhanced Offline Manager
// Provides comprehensive offline functionality and data synchronization

import { PWA_CONFIG } from '../../config/pwa';

export interface OfflineData {
  id: string;
  type: 'analysis' | 'report' | 'settings' | 'user-data';
  data: any;
  timestamp: number;
  synced: boolean;
  version: number;
}

export interface SyncConflict {
  id: string;
  localData: OfflineData;
  serverData: OfflineData;
  resolution?: 'local' | 'server' | 'merge';
}

class OfflineManager {
  private dbName = PWA_CONFIG.offlineStorage.dbName;
  private dbVersion = PWA_CONFIG.offlineStorage.dbVersion;
  private db: IDBDatabase | null = null;
  private isOnline = navigator.onLine;
  private syncQueue: string[] = [];

  async init(): Promise<void> {
    await this.initDatabase();
    this.setupEventListeners();
    this.startPeriodicSync();
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Offline data store
        if (!db.objectStoreNames.contains('offlineData')) {
          const store = db.createObjectStore('offlineData', { keyPath: 'id' });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('synced', 'synced', { unique: false });
        }
        
        // Sync conflicts store
        if (!db.objectStoreNames.contains('syncConflicts')) {
          db.createObjectStore('syncConflicts', { keyPath: 'id' });
        }
        
        // Cache metadata store
        if (!db.objectStoreNames.contains('cacheMetadata')) {
          const store = db.createObjectStore('cacheMetadata', { keyPath: 'key' });
          store.createIndex('expiry', 'expiry', { unique: false });
        }
      };
    });
  }

  private setupEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Listen for service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'BACKGROUND_SYNC') {
          this.handleBackgroundSync(event.data.tag);
        }
      });
    }
  }

  async saveOfflineData(type: OfflineData['type'], data: any, id?: string): Promise<string> {
    if (!this.db) await this.init();
    
    const dataId = id || `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const offlineData: OfflineData = {
      id: dataId,
      type,
      data,
      timestamp: Date.now(),
      synced: false,
      version: 1
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const request = store.put(offlineData);
      request.onsuccess = () => {
        this.queueForSync(dataId);
        resolve(dataId);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineData(id: string): Promise<OfflineData | null> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getOfflineDataByType(type: OfflineData['type']): Promise<OfflineData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('type');
      
      const request = index.getAll(type);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getUnsyncedData(): Promise<OfflineData[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readonly');
      const store = transaction.objectStore('offlineData');
      const index = store.index('synced');
      
      // Query for unsynced records (synced = 0 or false)
      const request = index.getAll(IDBKeyRange.only(0));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private queueForSync(id: string): void {
    if (!this.syncQueue.includes(id)) {
      this.syncQueue.push(id);
    }
    
    if (this.isOnline) {
      this.syncPendingData();
    }
  }

  async syncPendingData(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;
    
    const unsyncedData = await this.getUnsyncedData();
    
    for (const data of unsyncedData) {
      try {
        await this.syncDataItem(data);
        await this.markAsSynced(data.id);
        this.syncQueue = this.syncQueue.filter(id => id !== data.id);
      } catch (error) {
        if (error instanceof SyncConflictError) {
          await this.handleSyncConflict(error.conflict);
        }
      }
    }
  }

  private async syncDataItem(data: OfflineData): Promise<void> {
    const response = await fetch(PWA_CONFIG.backgroundSync.syncEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: data.id,
        type: data.type,
        data: data.data,
        timestamp: data.timestamp,
        version: data.version
      })
    });

    if (!response.ok) {
      if (response.status === 409) {
        // Conflict detected
        const serverData = await response.json();
        throw new SyncConflictError({
          id: data.id,
          localData: data,
          serverData: serverData
        });
      }
      throw new Error(`Sync failed: ${response.statusText}`);
    }
  }

  private async markAsSynced(id: string): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const getRequest = store.get(id);
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.synced = true;
          const putRequest = store.put(data);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        } else {
          resolve();
        }
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  private async handleSyncConflict(conflict: SyncConflict): Promise<void> {
    // Store conflict for user resolution
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncConflicts'], 'readwrite');
      const store = transaction.objectStore('syncConflicts');
      
      const request = store.put(conflict);
      request.onsuccess = () => {
        // Notify app about conflict
        window.dispatchEvent(new CustomEvent('syncConflict', {
          detail: conflict
        }));
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }

  async resolveSyncConflict(conflictId: string, resolution: 'local' | 'server' | 'merge', mergedData?: any): Promise<void> {
    const conflict = await this.getSyncConflict(conflictId);
    if (!conflict) return;

    let resolvedData: OfflineData;

    switch (resolution) {
      case 'local':
        resolvedData = conflict.localData;
        break;
      case 'server':
        resolvedData = conflict.serverData;
        break;
      case 'merge':
        resolvedData = {
          ...conflict.localData,
          data: mergedData || conflict.localData.data,
          version: Math.max(conflict.localData.version, conflict.serverData.version) + 1
        };
        break;
    }

    // Update local data
    await this.updateOfflineData(resolvedData);
    
    // Sync resolved data
    await this.syncDataItem(resolvedData);
    await this.markAsSynced(resolvedData.id);
    
    // Remove conflict
    await this.removeSyncConflict(conflictId);
  }

  private async getSyncConflict(id: string): Promise<SyncConflict | null> {
    if (!this.db) return null;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncConflicts'], 'readonly');
      const store = transaction.objectStore('syncConflicts');
      
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  private async removeSyncConflict(id: string): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['syncConflicts'], 'readwrite');
      const store = transaction.objectStore('syncConflicts');
      
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private async updateOfflineData(data: OfflineData): Promise<void> {
    if (!this.db) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      
      const request = store.put(data);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  private handleBackgroundSync(tag: string): void {
    if (tag.includes('offline-sync')) {
      this.syncPendingData();
    }
  }

  private startPeriodicSync(): void {
    // Sync every 5 minutes when online
    setInterval(() => {
      if (this.isOnline) {
        this.syncPendingData();
      }
    }, 5 * 60 * 1000);
  }

  async clearOfflineData(olderThan?: number): Promise<void> {
    if (!this.db) return;
    
    const cutoff = olderThan || (Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['offlineData'], 'readwrite');
      const store = transaction.objectStore('offlineData');
      const index = store.index('timestamp');
      
      const range = IDBKeyRange.upperBound(cutoff);
      const request = index.openCursor(range);
      
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          if (cursor.value.synced) {
            cursor.delete();
          }
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  getStatus(): { online: boolean; pendingSync: number; conflicts: number } {
    return {
      online: this.isOnline,
      pendingSync: this.syncQueue.length,
      conflicts: 0 // Would need to query conflicts store
    };
  }
}

class SyncConflictError extends Error {
  constructor(public conflict: SyncConflict) {
    super('Sync conflict detected');
    this.name = 'SyncConflictError';
  }
}

export const offlineManager = new OfflineManager();