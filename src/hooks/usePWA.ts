// React hooks for PWA functionality

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  pwaIntegrationService,
  PWAStatus,
} from "../services/pwa/pwaIntegration";
import { getCacheSize, formatBytes } from "../utils/pwaUtils";

import { logger } from "@/utils/logger";

export interface PWAMetrics {
  cacheSize: number;
  cacheSizeFormatted: string;
  pendingSyncs: number;
  lastSyncTime: Date | null;
  offlineDataCount: number;
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    hasNotificationPermission: false,
    backgroundSyncSupported: false,
    serviceWorkerReady: false,
    installPromptAvailable: false,
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [metrics, setMetrics] = useState<PWAMetrics>({
    cacheSize: 0,
    cacheSizeFormatted: "0 Bytes",
    pendingSyncs: 0,
    lastSyncTime: null,
    offlineDataCount: 0,
  });

  // Refresh metrics
  const refreshMetrics = useCallback(async () => {
    try {
      const cacheSize = await getCacheSize();
      const analytics = await pwaIntegrationService.getAnalytics();

      setMetrics({
        cacheSize,
        cacheSizeFormatted: formatBytes(cacheSize),
        pendingSyncs: analytics?.pendingSyncs || 0,
        lastSyncTime: analytics?.lastSyncTime
          ? new Date(analytics.lastSyncTime)
          : null,
        offlineDataCount: analytics?.offlineDataCount || 0,
      });
    } catch (error) {
      logger.warn("Failed to refresh PWA metrics", error);
    }
  }, []);

  useEffect(() => {
    // Initialize PWA service
    pwaIntegrationService.init();

    // Listen for status updates
    const handleStatusUpdate = (event: CustomEvent) => {
      setStatus(event.detail);
    };

    // Listen for PWA notifications
    const handleNotification = (event: CustomEvent) => {
      const notificationData = event.detail;
      setNotifications((prev) => [...prev, notificationData]);

      // Check for update available notification
      if (notificationData.type === "updateAvailable") {
        setIsUpdateAvailable(true);
      }
    };

    window.addEventListener(
      "pwaStatusUpdate",
      handleStatusUpdate as EventListener
    );
    window.addEventListener(
      "pwaNotification",
      handleNotification as EventListener
    );

    // Get initial status
    setStatus(pwaIntegrationService.getStatus());

    // Refresh metrics initially and periodically
    refreshMetrics();
    const metricsInterval = setInterval(refreshMetrics, 60000); // Every minute

    return () => {
      window.removeEventListener(
        "pwaStatusUpdate",
        handleStatusUpdate as EventListener
      );
      window.removeEventListener(
        "pwaNotification",
        handleNotification as EventListener
      );
      clearInterval(metricsInterval);
    };
  }, [refreshMetrics]);

  const promptInstall = useCallback(async () => {
    return await pwaIntegrationService.promptInstall();
  }, []);

  const enableNotifications = useCallback(async () => {
    return await pwaIntegrationService.enableNotifications();
  }, []);

  const disableNotifications = useCallback(async () => {
    return await pwaIntegrationService.disableNotifications();
  }, []);

  const sendTestNotification = useCallback(async () => {
    await pwaIntegrationService.sendTestNotification();
  }, []);

  const shareContent = useCallback(async (data: ShareData) => {
    return await pwaIntegrationService.shareContent(data);
  }, []);

  const updateApp = useCallback(async () => {
    await pwaIntegrationService.updateServiceWorker();
    setIsUpdateAvailable(false);
  }, []);

  const clearNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Save data for offline use
  const saveOfflineData = useCallback(
    async (type: string, data: any) => {
      const id = await pwaIntegrationService.saveOfflineData(type, data);
      await refreshMetrics();
      return id;
    },
    [refreshMetrics]
  );

  // Get offline data
  const getOfflineData = useCallback(async (type: string) => {
    return await pwaIntegrationService.getOfflineData(type);
  }, []);

  // Clear cache
  const clearCache = useCallback(
    async (cacheName?: string) => {
      await pwaIntegrationService.clearCache(cacheName);
      await refreshMetrics();
    },
    [refreshMetrics]
  );

  // Preload routes for faster navigation
  const preloadRoutes = useCallback(async (routes: string[]) => {
    await pwaIntegrationService.preloadRoutes(routes);
  }, []);

  // Export analytics
  const exportAnalytics = useCallback(async () => {
    return await pwaIntegrationService.exportAnalytics();
  }, []);

  return {
    // Status
    status,
    isInstalled: status.isInstalled,
    isOnline: status.isOnline,
    isInstallable: status.installPromptAvailable,
    isUpdateAvailable,
    hasNotificationPermission: status.hasNotificationPermission,
    isServiceWorkerReady: status.serviceWorkerReady,
    isBackgroundSyncSupported: status.backgroundSyncSupported,

    // Metrics
    metrics,
    refreshMetrics,

    // Notifications
    notifications,
    clearNotification,
    clearAllNotifications,

    // Actions
    promptInstall,
    installApp: promptInstall, // Alias for compatibility
    enableNotifications,
    disableNotifications,
    requestNotificationPermission: enableNotifications, // Alias for compatibility
    sendTestNotification,
    shareContent,
    updateApp,

    // Data management
    saveOfflineData,
    getOfflineData,
    clearCache,
    preloadRoutes,
    exportAnalytics,
  };
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [pendingChanges, setPendingChanges] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsOnline(true);
      // Trigger sync when back online
      pwaIntegrationService.getAnalytics().then((analytics) => {
        setPendingChanges(analytics?.pendingSyncs || 0);
      });
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const saveData = useCallback(async (type: string, data: any) => {
    const id = await pwaIntegrationService.saveOfflineData(type, data);
    setPendingChanges((prev) => prev + 1);
    return id;
  }, []);

  const getData = useCallback(async (type: string) => {
    return await pwaIntegrationService.getOfflineData(type);
  }, []);

  return {
    isOnline,
    pendingChanges,
    saveData,
    getData,
  };
}

export function useFileUpload() {
  const [uploadQueue, setUploadQueue] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress] = useState<Record<string, number>>({});

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const taskId = await pwaIntegrationService.uploadFile(file);
      setUploadQueue((prev) => [
        ...prev,
        {
          id: taskId,
          file,
          status: "queued",
          progress: 0,
          timestamp: Date.now(),
        },
      ]);
      return taskId;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      const fileArray = Array.from(files);
      const promises = fileArray.map((file) => uploadFile(file));
      return await Promise.all(promises);
    },
    [uploadFile]
  );

  const clearCompleted = useCallback(() => {
    setUploadQueue((prev) =>
      prev.filter((item) => item.status !== "completed")
    );
  }, []);

  const retryFailed = useCallback(async () => {
    const failedUploads = uploadQueue.filter(
      (item) => item.status === "failed"
    );
    for (const upload of failedUploads) {
      await uploadFile(upload.file);
    }
  }, [uploadQueue, uploadFile]);

  return {
    uploadQueue,
    isUploading,
    uploadProgress,
    uploadFile,
    uploadFiles,
    clearCompleted,
    retryFailed,
  };
}

export function usePWAAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await pwaIntegrationService.getAnalytics();
      setAnalytics(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const exportAnalytics = useCallback(async () => {
    return await pwaIntegrationService.exportAnalytics();
  }, []);

  const trackFeature = useCallback((feature: string) => {
    logger.debug("Feature tracked:", feature);
  }, []);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    analytics,
    isLoading,
    refreshAnalytics,
    exportAnalytics,
    trackFeature,
  };
}

export function usePWACapabilities() {
  const capabilities = useMemo(() => {
    // SSR guard - return empty capabilities during server-side rendering
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return {
        install: false,
        notifications: false,
        backgroundSync: false,
        share: false,
        clipboard: false,
        vibration: false,
        bluetooth: false,
        usb: false,
        geolocation: false,
        camera: false,
        storage: false,
        indexedDB: false,
        cacheAPI: false,
        webWorkers: false,
        webSockets: false,
      };
    }

    let backgroundSyncSupported = false;
    try {
      backgroundSyncSupported = "sync" in ServiceWorkerRegistration.prototype;
    } catch {
      backgroundSyncSupported = false;
    }

    return {
      install: "serviceWorker" in navigator,
      notifications: "Notification" in window,
      backgroundSync: backgroundSyncSupported,
      share: "share" in navigator,
      clipboard: "clipboard" in navigator,
      vibration: "vibrate" in navigator,
      bluetooth: "bluetooth" in navigator,
      usb: "usb" in navigator,
      geolocation: "geolocation" in navigator,
      camera: "mediaDevices" in navigator,
      storage: "storage" in navigator,
      indexedDB: "indexedDB" in window,
      cacheAPI: "caches" in window,
      webWorkers: "Worker" in window,
      webSockets: "WebSocket" in window,
    };
  }, []);

  return capabilities;
}

// Hook for monitoring network quality
export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    effectiveType:
      typeof navigator !== "undefined"
        ? (navigator as any).connection?.effectiveType || "unknown"
        : "unknown",
    downlink:
      typeof navigator !== "undefined"
        ? (navigator as any).connection?.downlink || 0
        : 0,
    rtt:
      typeof navigator !== "undefined"
        ? (navigator as any).connection?.rtt || 0
        : 0,
    saveData:
      typeof navigator !== "undefined"
        ? (navigator as any).connection?.saveData || false
        : false,
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection;
      setNetworkStatus({
        isOnline: navigator.onLine,
        effectiveType: connection?.effectiveType || "unknown",
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
        saveData: connection?.saveData || false,
      });
    };

    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateNetworkStatus);
    }

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
      if (connection) {
        connection.removeEventListener("change", updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
}
