// PWA Configuration
// Production-ready configuration for PWA features

// Feature detection - must be a function to avoid SSR issues
export const getPWAFeatures = () => {
  if (typeof window === "undefined") {
    // SSR - return false for all features
    return {
      serviceWorker: false,
      pushManager: false,
      backgroundSync: false,
      webShare: false,
      notifications: false,
      indexedDB: false,
      cacheAPI: false,
      persistentStorage: false,
    };
  }

  return {
    serviceWorker: "serviceWorker" in navigator,
    pushManager: "PushManager" in window,
    backgroundSync:
      "serviceWorker" in navigator &&
      "sync" in (window.ServiceWorkerRegistration?.prototype || {}),
    webShare: "share" in navigator,
    notifications: "Notification" in window,
    indexedDB: "indexedDB" in window,
    cacheAPI: "caches" in window,
    persistentStorage: "storage" in navigator && "persist" in navigator.storage,
  };
};

export const PWA_CONFIG = {
  // Service Worker
  serviceWorker: {
    scope: "/",
    updateViaCache: "none" as ServiceWorkerUpdateViaCache,
  },

  // Push Notifications
  pushNotifications: {
    vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
    userVisibleOnly: true,
  },

  // Analytics
  analytics: {
    endpoint: "/api/analytics",
    pwaEndpoint: "/api/analytics/pwa",
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  },

  // Background Sync
  backgroundSync: {
    uploadEndpoint: "/api/upload",
    syncEndpoint: "/api/sync",
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
  },

  // Offline Storage
  offlineStorage: {
    dbName: "CodeGuardianOffline",
    dbVersion: 2,
    syncInterval: 300000, // 5 minutes
    cleanupInterval: 86400000, // 24 hours
    maxAge: 2592000000, // 30 days
  },

  // Cache Configuration
  cache: {
    staticCacheName: "code-guardian-static-v8.5.0",
    dynamicCacheName: "code-guardian-dynamic-v8.5.0",
    apiCacheName: "code-guardian-api-v8.5.0",
    uploadCacheName: "code-guardian-uploads-v8.5.0",
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

  // Feature Detection - NOTE: Use getPWAFeatures() function instead of this static property
  // This is kept for backward compatibility but will always return false during SSR
  features: {
    serviceWorker: false,
    pushManager: false,
    backgroundSync: false,
    webShare: false,
    notifications: false,
    indexedDB: false,
    cacheAPI: false,
    persistentStorage: false,
  },
} as const;

export type PWAConfig = typeof PWA_CONFIG;
