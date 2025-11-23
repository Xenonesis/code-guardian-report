// React hooks for PWA functionality

import { useState, useEffect, useCallback } from 'react';
import { pwaIntegrationService, PWAStatus } from '../services/pwa/pwaIntegration';

import { logger } from '@/utils/logger';
export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    hasNotificationPermission: false,
    backgroundSyncSupported: false,
    serviceWorkerReady: false,
    installPromptAvailable: false
  });

  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Initialize PWA service
    pwaIntegrationService.init();

    // Listen for status updates
    const handleStatusUpdate = (event: CustomEvent) => {
      setStatus(event.detail);
    };

    // Listen for PWA notifications
    const handleNotification = (event: CustomEvent) => {
      setNotifications(prev => [...prev, event.detail]);
    };

    window.addEventListener('pwaStatusUpdate', handleStatusUpdate as EventListener);
    window.addEventListener('pwaNotification', handleNotification as EventListener);

    // Get initial status
    setStatus(pwaIntegrationService.getStatus());

    return () => {
      window.removeEventListener('pwaStatusUpdate', handleStatusUpdate as EventListener);
      window.removeEventListener('pwaNotification', handleNotification as EventListener);
    };
  }, []);

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
  }, []);

  const clearNotification = useCallback((index: number) => {
    setNotifications(prev => prev.filter((_, i) => i !== index));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    status,
    isInstalled: status.isInstalled,
    isOnline: status.isOnline,
    isInstallable: status.installPromptAvailable,
    isUpdateAvailable: false, // TODO: Track update availability
    hasNotificationPermission: status.hasNotificationPermission,
    notifications,
    promptInstall,
    installApp: promptInstall, // Alias for compatibility
    enableNotifications,
    disableNotifications,
    requestNotificationPermission: enableNotifications, // Alias for compatibility
    sendTestNotification,
    shareContent,
    updateApp,
    clearNotification,
    clearAllNotifications
  };
}

export function useOfflineStorage() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveData = useCallback(async (type: string, data: any) => {
    return await pwaIntegrationService.saveOfflineData(type, data);
  }, []);

  const getData = useCallback(async (type: string) => {
    return await pwaIntegrationService.getOfflineData(type);
  }, []);

  return {
    isOnline,
    saveData,
    getData
  };
}

export function useFileUpload() {
  const [uploadQueue, setUploadQueue] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    try {
      const taskId = await pwaIntegrationService.uploadFile(file);
      setUploadQueue(prev => [...prev, { id: taskId, file, status: 'queued' }]);
      return taskId;
    } finally {
      setIsUploading(false);
    }
  }, []);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const promises = fileArray.map(file => uploadFile(file));
    return await Promise.all(promises);
  }, [uploadFile]);

  return {
    uploadQueue,
    isUploading,
    uploadFile,
    uploadFiles
  };
}

export function usePWAAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);

  const refreshAnalytics = useCallback(async () => {
    const data = await pwaIntegrationService.getAnalytics();
    setAnalytics(data);
  }, []);

  const exportAnalytics = useCallback(async () => {
    return await pwaIntegrationService.exportAnalytics();
  }, []);

  const trackFeature = useCallback((feature: string) => {
    // This would be handled by the analytics service internally
    logger.debug('Feature tracked:', feature);
  }, []);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    analytics,
    refreshAnalytics,
    exportAnalytics,
    trackFeature
  };
}

export function usePWACapabilities() {
  const [capabilities] = useState(() => {
    // Get capabilities from the service
    let backgroundSyncSupported = false;
    try {
      backgroundSyncSupported = 'sync' in ServiceWorkerRegistration.prototype;
    } catch {
      backgroundSyncSupported = false;
    }
    
    return {
      install: 'serviceWorker' in navigator,
      notifications: 'Notification' in window,
      backgroundSync: backgroundSyncSupported,
      share: 'share' in navigator
    };
  });

  return capabilities;
}