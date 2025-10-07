// React hooks for PWA functionality

import { useState, useEffect, useCallback } from 'react';
import { pwaIntegrationService, PWAStatus } from '../services/pwa/pwaIntegration';

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
    notifications,
    promptInstall,
    enableNotifications,
    disableNotifications,
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
    console.log('Feature tracked:', feature);
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
  const [capabilities] = useState(() => pwaIntegrationService.getCapabilities());

  return capabilities;
}