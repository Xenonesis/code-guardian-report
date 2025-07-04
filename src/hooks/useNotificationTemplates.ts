import { useNotifications } from './useNotifications';
import { NotificationTemplates } from '@/utils/notificationTemplates';

// Hook for easy access to notification templates
export const useNotificationTemplates = () => {
  const { showNotification } = useNotifications();

  return {
    ...NotificationTemplates,
    show: showNotification,
  };
};
