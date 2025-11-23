/**
 * useNotifications Hook
 * React hook for using the enhanced notification system
 */

import { useState, useEffect } from 'react';
import { 
  NotificationManager, 
  Notification, 
  NotificationPreferences,
  notify 
} from '@/services/notifications/NotificationManager';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const unsubscribe = NotificationManager.subscribe((notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read && !n.dismissed).length);
    });

    return unsubscribe;
  }, []);

  return {
    notifications,
    unreadCount,
    notify,
    markAsRead: NotificationManager.markAsRead.bind(NotificationManager),
    markAllAsRead: NotificationManager.markAllAsRead.bind(NotificationManager),
    dismiss: NotificationManager.dismiss.bind(NotificationManager),
    clearAll: NotificationManager.clearAll.bind(NotificationManager),
    getUnread: NotificationManager.getUnread.bind(NotificationManager),
    getByCategory: NotificationManager.getByCategory.bind(NotificationManager),
    getByPriority: NotificationManager.getByPriority.bind(NotificationManager),
    getStats: NotificationManager.getStats.bind(NotificationManager),
  };
}

export function useNotificationPreferences() {
  const [preferences, setPreferences] = useState<NotificationPreferences>(
    NotificationManager.getPreferences()
  );

  useEffect(() => {
    const unsubscribe = NotificationManager.subscribeToPreferences((prefs) => {
      setPreferences(prefs);
    });

    return unsubscribe;
  }, []);

  return {
    preferences,
    updatePreferences: NotificationManager.updatePreferences.bind(NotificationManager),
    resetPreferences: NotificationManager.resetPreferences.bind(NotificationManager),
  };
}

export { notify };
