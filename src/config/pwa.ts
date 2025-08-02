// PWA Configuration
// Production-ready configuration for PWA features

export const PWA_CONFIG = {
  // Service Worker
  serviceWorker: {
    scope: '/',
    updateViaCache: 'none' as ServiceWorkerUpdateViaCache,
  },

  // Push Notifications
  pushNotifications: {
    vapidPublicKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || '',
    userVisibleOnly: true,
  },

  // Analytics
  analytics: {
    endpoint: '/api/analytics',
    pwaEndpoint: '/api/analytics/pwa',
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  },

  // Background Sync
  backgroundSync: {
    uploadEndpoint: '/api/upload',
    syncEndpoint: '/api/sync',
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
  },

  // Offline Storage
  offlineStorage: {
    dbName: 'CodeGuardianOffline',
    dbVersion: 2,
    syncInterval: 300000, // 5 minutes
    cleanupInterval: 86400000, // 24 hours
    maxAge: 2592000000, // 30 days
  },

  // Cache Configuration
  cache: {
    staticCacheName: 'code-guardian-static-v5.8.0',
    dynamicCacheName: 'code-guardian-dynamic-v5.8.0',
    apiCacheName: 'code-guardian-api-v5.8.0',
    uploadCacheName: 'code-guardian-uploads-v5.8.0',
    maxEntries: {
      static: 100,
      dynamic: 50,
      api: 50,
    },
    maxAge: {
      static: 2592000000, // 30 days
      dynamic: 86400000, // 24 hours
      api: 300000, // 5 minutes
    },
  },

  // Feature Detection
  features: {
    serviceWorker: 'serviceWorker' in navigator,
    pushManager: 'PushManager' in window,
    backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
    webShare: 'share' in navigator,
    notifications: 'Notification' in window,
    indexedDB: 'indexedDB' in window,
    cacheAPI: 'caches' in window,
    persistentStorage: 'storage' in navigator && 'persist' in navigator.storage,
  },
} as const;

export type PWAConfig = typeof PWA_CONFIG;