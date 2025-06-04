import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastWithIcon, ToastAction } from '@/components/ui/toast';
import { useToast } from '@/components/ui/use-toast';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  persistent?: boolean;
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showUploadProgress: (progress: number) => void;
  showAnalysisComplete: (results: { issues: number; files: number }) => void;
  showFileError: (filename: string, error: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

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

// Predefined notification templates for common scenarios
export const NotificationTemplates = {
  fileUploadStart: () => ({
    type: 'info' as const,
    title: 'Upload Started',
    description: 'Your file is being uploaded. Please wait...',
  }),

  fileUploadComplete: () => ({
    type: 'success' as const,
    title: 'Upload Complete',
    description: 'File uploaded successfully. Starting analysis...',
  }),

  analysisComplete: (issueCount: number, fileCount: number) => ({
    type: 'success' as const,
    title: 'Analysis Complete',
    description: `Found ${issueCount} issues across ${fileCount} files.`,
  }),

  analysisError: (error: string) => ({
    type: 'error' as const,
    title: 'Analysis Failed',
    description: `Analysis could not be completed: ${error}`,
    action: {
      label: 'Try Again',
      onClick: () => window.location.reload(),
    },
  }),

  fileTooLarge: (maxSize: string) => ({
    type: 'warning' as const,
    title: 'File Too Large',
    description: `Please select a file smaller than ${maxSize}.`,
  }),

  invalidFileType: (allowedTypes: string[]) => ({
    type: 'warning' as const,
    title: 'Invalid File Type',
    description: `Please select a ${allowedTypes.join(' or ')} file.`,
  }),

  networkError: () => ({
    type: 'error' as const,
    title: 'Network Error',
    description: 'Please check your internet connection and try again.',
    action: {
      label: 'Retry',
      onClick: () => window.location.reload(),
    },
  }),

  apiKeyAdded: (provider: string) => ({
    type: 'success' as const,
    title: 'API Key Added',
    description: `${provider} API key has been saved successfully.`,
  }),

  apiKeyRemoved: (provider: string) => ({
    type: 'info' as const,
    title: 'API Key Removed',
    description: `${provider} API key has been removed.`,
  }),

  chatError: () => ({
    type: 'error' as const,
    title: 'Chat Error',
    description: 'Unable to send message. Please check your API configuration.',
  }),

  exportSuccess: (format: string) => ({
    type: 'success' as const,
    title: 'Export Complete',
    description: `Results exported successfully as ${format}.`,
  }),

  exportError: () => ({
    type: 'error' as const,
    title: 'Export Failed',
    description: 'Unable to export results. Please try again.',
  }),
};

// Hook for easy access to notification templates
export const useNotificationTemplates = () => {
  const { showNotification } = useNotifications();

  return {
    ...NotificationTemplates,
    show: showNotification,
  };
};
