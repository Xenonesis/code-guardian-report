import React, { useState, useCallback } from 'react';
import { ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';
import { NotificationContext, type Notification, type NotificationContextType } from '@/hooks/useNotifications';

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [activeNotifications, setActiveNotifications] = useState<Map<string, Notification>>(new Map());

  const generateId = useCallback(() => {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = generateId();
    const fullNotification: Notification = {
      id,
      duration: 5000,
      ...notification,
    };

    setActiveNotifications(prev => new Map(prev.set(id, fullNotification)));

    const variant = notification.type === 'error' ? 'destructive' : notification.type;

    toast({
      variant,
      title: notification.title,
      description: notification.description,
      duration: notification.persistent ? Infinity : notification.duration,
      action: notification.action ? (
        <ToastAction 
          altText={notification.action.label}
          onClick={notification.action.onClick}
        >
          {notification.action.label}
        </ToastAction>
      ) : undefined,
    });

    if (!notification.persistent) {
      setTimeout(() => {
        setActiveNotifications(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      }, notification.duration || 5000);
    }
  }, [toast, generateId]);

  const showSuccess = useCallback((title: string, description?: string) => {
    showNotification({
      type: 'success',
      title,
      description,
      duration: 4000,
    });
  }, [showNotification]);

  const showError = useCallback((title: string, description?: string) => {
    showNotification({
      type: 'error',
      title,
      description,
      duration: 8000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    });
  }, [showNotification]);

  const showWarning = useCallback((title: string, description?: string) => {
    showNotification({
      type: 'warning',
      title,
      description,
      duration: 6000,
    });
  }, [showNotification]);

  const showInfo = useCallback((title: string, description?: string) => {
    showNotification({
      type: 'info',
      title,
      description,
      duration: 5000,
    });
  }, [showNotification]);

  const showUploadProgress = useCallback((progress: number) => {
    if (progress === 100) {
      showSuccess(
        'Upload Complete',
        'Your file has been uploaded successfully and analysis is starting.'
      );
    } else if (progress === 0) {
      showInfo(
        'Upload Started',
        'Your file is being uploaded. Please wait...'
      );
    }
  }, [showSuccess, showInfo]);

  const showAnalysisComplete = useCallback((results: { issues: number; files: number }) => {
    showSuccess(
      'Analysis Complete',
      `Found ${results.issues} issues across ${results.files} files. Check the results tab for details.`,
    );
  }, [showSuccess]);

  const showFileError = useCallback((filename: string, error: string) => {
    showError(
      'File Processing Error',
      `Failed to process ${filename}: ${error}`,
    );
  }, [showError]);

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showUploadProgress,
    showAnalysisComplete,
    showFileError,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

// Templates and hooks moved to separate files for better fast refresh support
