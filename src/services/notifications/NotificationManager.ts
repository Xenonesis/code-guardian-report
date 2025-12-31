/**
 * Enhanced Notification Manager
 * Manages notifications with priorities, batching, history, and user preferences
 */

import { toast } from 'sonner';

import { logger } from '@/utils/logger';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationCategory = 
  | 'system' 
  | 'analysis' 
  | 'security' 
  | 'auth' 
  | 'storage' 
  | 'network'
  | 'export'
  | 'general';

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  category: NotificationCategory;
  title: string;
  message?: string;
  timestamp: number;
  read: boolean;
  dismissed: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  metadata?: Record<string, any>;
}

export interface NotificationPreferences {
  enabled: boolean;
  showBrowserNotifications: boolean;
  playSound: boolean;
  categories: Record<NotificationCategory, boolean>;
  priorities: Record<NotificationPriority, boolean>;
  batchingEnabled: boolean;
  batchingDelay: number; // milliseconds
  maxNotificationsPerBatch: number;
  autoMarkAsRead: boolean;
  autoMarkAsReadDelay: number; // seconds
  persistHistory: boolean;
  maxHistorySize: number;
}

const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  showBrowserNotifications: false,
  playSound: false,
  categories: {
    system: true,
    analysis: true,
    security: true,
    auth: true,
    storage: true,
    network: true,
    export: true,
    general: true,
  },
  priorities: {
    low: true,
    normal: true,
    high: true,
    urgent: true,
  },
  batchingEnabled: true,
  batchingDelay: 2000,
  maxNotificationsPerBatch: 3,
  autoMarkAsRead: true,
  autoMarkAsReadDelay: 5,
  persistHistory: true,
  maxHistorySize: 100,
};

class NotificationManagerClass {
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences;
  private batchQueue: Notification[] = [];
  private batchTimeout: NodeJS.Timeout | null = null;
  private listeners: Set<(notifications: Notification[]) => void> = new Set();
  private preferencesListeners: Set<(preferences: NotificationPreferences) => void> = new Set();
  
  constructor() {
    this.preferences = DEFAULT_PREFERENCES;
    // Only access browser APIs on client side
    if (typeof window !== 'undefined') {
      this.preferences = this.loadPreferences();
      this.loadHistory();
      this.requestBrowserNotificationPermission();
    }
  }

  /**
   * Load preferences from localStorage
   */
  private loadPreferences(): NotificationPreferences {
    // Guard for server-side rendering
    if (typeof localStorage === 'undefined') return DEFAULT_PREFERENCES;
    
    try {
      const stored = localStorage.getItem('notificationPreferences');
      if (stored) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(stored) };
      }
    } catch (error) {
      logger.error('Failed to load notification preferences:', error);
    }
    return DEFAULT_PREFERENCES;
  }

  /**
   * Save preferences to localStorage
   */
  private savePreferences(): void {
    // Guard for server-side rendering
    if (typeof localStorage === 'undefined') return;
    
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(this.preferences));
      this.notifyPreferencesListeners();
    } catch (error) {
      logger.error('Failed to save notification preferences:', error);
    }
  }

  /**
   * Load notification history from localStorage
   */
  private loadHistory(): void {
    // Guard for server-side rendering
    if (typeof localStorage === 'undefined') return;
    if (!this.preferences.persistHistory) return;
    
    try {
      const stored = localStorage.getItem('notificationHistory');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.notifyListeners();
      }
    } catch (error) {
      logger.error('Failed to load notification history:', error);
    }
  }

  /**
   * Save notification history to localStorage
   */
  private saveHistory(): void {
    if (!this.preferences.persistHistory) return;
    
    try {
      // Keep only the most recent notifications
      const toSave = this.notifications.slice(-this.preferences.maxHistorySize);
      localStorage.setItem('notificationHistory', JSON.stringify(toSave));
    } catch (error) {
      logger.error('Failed to save notification history:', error);
    }
  }

  /**
   * Request browser notification permission
   */
  private async requestBrowserNotificationPermission(): Promise<void> {
    if ('Notification' in window && this.preferences.showBrowserNotifications) {
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    }
  }

  /**
   * Show a browser notification
   */
  private showBrowserNotification(notification: Notification): void {
    if (!this.preferences.showBrowserNotifications) return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const options: NotificationOptions = {
      body: notification.message,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: notification.id,
      requireInteraction: notification.priority === 'urgent',
    };

    const browserNotification = new Notification(notification.title, options);
    
    if (notification.action) {
      browserNotification.onclick = () => {
        notification.action?.onClick();
        browserNotification.close();
      };
    }

    // Auto close after delay based on priority
    const autoCloseDelay = notification.priority === 'urgent' ? 10000 : 5000;
    setTimeout(() => browserNotification.close(), autoCloseDelay);
  }

  /**
   * Play notification sound
   */
  private playSound(priority: NotificationPriority): void {
    if (!this.preferences.playSound) return;
    
    try {
      const audio = new Audio();
      // Different sounds for different priorities
      switch (priority) {
        case 'urgent':
          audio.src = '/sounds/urgent.mp3';
          break;
        case 'high':
          audio.src = '/sounds/high.mp3';
          break;
        default:
          audio.src = '/sounds/default.mp3';
          break;
      }
      audio.play().catch(() => {
        // Ignore errors (e.g., user hasn't interacted with page yet)
      });
    } catch (error) {
      // Ignore sound errors
    }
  }

  /**
   * Generate unique notification ID
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if notification should be shown based on preferences
   */
  private shouldShowNotification(notification: Notification): boolean {
    if (!this.preferences.enabled) return false;
    if (!this.preferences.categories[notification.category]) return false;
    if (!this.preferences.priorities[notification.priority]) return false;
    return true;
  }

  /**
   * Get duration based on priority
   */
  private getDuration(priority: NotificationPriority): number {
    switch (priority) {
      case 'urgent':
        return 10000;
      case 'high':
        return 6000;
      case 'normal':
        return 4000;
      case 'low':
        return 3000;
      default:
        return 4000;
    }
  }

  /**
   * Show toast notification
   */
  private showToast(notification: Notification): void {
    const options: any = {
      description: notification.message,
      duration: this.getDuration(notification.priority),
      action: notification.action ? {
        label: notification.action.label,
        onClick: notification.action.onClick,
      } : undefined,
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.title, options);
        break;
      case 'error':
        toast.error(notification.title, options);
        break;
      case 'warning':
        toast.warning(notification.title, options);
        break;
      case 'info':
      default:
        toast.info(notification.title, options);
        break;
    }
  }

  /**
   * Process batched notifications
   */
  private processBatch(): void {
    if (this.batchQueue.length === 0) return;

    // Sort by priority (urgent first)
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    this.batchQueue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    // Take top N notifications based on max batch size
    const toShow = this.batchQueue.slice(0, this.preferences.maxNotificationsPerBatch);
    const remaining = this.batchQueue.slice(this.preferences.maxNotificationsPerBatch);

    // Show individual notifications
    toShow.forEach(notification => {
      this.showToast(notification);
      this.showBrowserNotification(notification);
      this.playSound(notification.priority);
    });

    // If there are remaining notifications, show a summary
    if (remaining.length > 0) {
      toast.info(
        `+${remaining.length} more notifications`,
        {
          description: 'Click to view all notifications',
          action: {
            label: 'View',
            onClick: () => {
              // This will be handled by the UI component
              window.dispatchEvent(new CustomEvent('openNotificationPanel'));
            },
          },
        }
      );
    }

    // Clear the batch queue
    this.batchQueue = [];
    this.batchTimeout = null;
  }

  /**
   * Add notification to batch queue
   */
  private addToBatch(notification: Notification): void {
    this.batchQueue.push(notification);

    // Clear existing timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Set new timeout
    this.batchTimeout = setTimeout(() => {
      this.processBatch();
    }, this.preferences.batchingDelay);
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  /**
   * Notify preferences listeners
   */
  private notifyPreferencesListeners(): void {
    this.preferencesListeners.forEach(listener => listener({ ...this.preferences }));
  }

  /**
   * Show a notification
   */
  public notify(
    type: NotificationType,
    title: string,
    options: {
      message?: string;
      priority?: NotificationPriority;
      category?: NotificationCategory;
      action?: { label: string; onClick: () => void };
      metadata?: Record<string, any>;
    } = {}
  ): string {
    const notification: Notification = {
      id: this.generateId(),
      type,
      title,
      message: options.message,
      priority: options.priority || 'normal',
      category: options.category || 'general',
      timestamp: Date.now(),
      read: false,
      dismissed: false,
      action: options.action,
      metadata: options.metadata,
    };

    // Add to history
    this.notifications.push(notification);
    this.saveHistory();
    this.notifyListeners();

    // Check if should be shown
    if (!this.shouldShowNotification(notification)) {
      return notification.id;
    }

    // Auto mark as read after delay
    if (this.preferences.autoMarkAsRead) {
      setTimeout(() => {
        this.markAsRead(notification.id);
      }, this.preferences.autoMarkAsReadDelay * 1000);
    }

    // Handle batching or show immediately
    if (this.preferences.batchingEnabled && notification.priority !== 'urgent') {
      this.addToBatch(notification);
    } else {
      // Show immediately for urgent notifications or when batching is disabled
      this.showToast(notification);
      this.showBrowserNotification(notification);
      this.playSound(notification.priority);
    }

    return notification.id;
  }

  /**
   * Mark notification as read
   */
  public markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveHistory();
      this.notifyListeners();
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveHistory();
    this.notifyListeners();
  }

  /**
   * Dismiss notification
   */
  public dismiss(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.dismissed = true;
      this.saveHistory();
      this.notifyListeners();
    }
  }

  /**
   * Clear all notifications
   */
  public clearAll(): void {
    this.notifications = [];
    this.saveHistory();
    this.notifyListeners();
  }

  /**
   * Clear old notifications (older than N days)
   */
  public clearOld(days: number = 7): void {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    this.notifications = this.notifications.filter(n => n.timestamp > cutoff);
    this.saveHistory();
    this.notifyListeners();
  }

  /**
   * Get all notifications
   */
  public getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get unread notifications
   */
  public getUnread(): Notification[] {
    return this.notifications.filter(n => !n.read && !n.dismissed);
  }

  /**
   * Get notifications by category
   */
  public getByCategory(category: NotificationCategory): Notification[] {
    return this.notifications.filter(n => n.category === category);
  }

  /**
   * Get notifications by priority
   */
  public getByPriority(priority: NotificationPriority): Notification[] {
    return this.notifications.filter(n => n.priority === priority);
  }

  /**
   * Subscribe to notification changes
   */
  public subscribe(listener: (notifications: Notification[]) => void): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener([...this.notifications]);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  /**
   * Subscribe to preferences changes
   */
  public subscribeToPreferences(listener: (preferences: NotificationPreferences) => void): () => void {
    this.preferencesListeners.add(listener);
    // Immediately notify with current state
    listener({ ...this.preferences });
    // Return unsubscribe function
    return () => this.preferencesListeners.delete(listener);
  }

  /**
   * Get preferences
   */
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Update preferences
   */
  public updatePreferences(updates: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...updates };
    this.savePreferences();
    
    // Request browser notification permission if enabled
    if (updates.showBrowserNotifications) {
      this.requestBrowserNotificationPermission();
    }
  }

  /**
   * Reset preferences to default
   */
  public resetPreferences(): void {
    this.preferences = { ...DEFAULT_PREFERENCES };
    this.savePreferences();
  }

  /**
   * Get statistics
   */
  public getStats() {
    const total = this.notifications.length;
    const unread = this.getUnread().length;
    const byType = {
      success: this.notifications.filter(n => n.type === 'success').length,
      error: this.notifications.filter(n => n.type === 'error').length,
      warning: this.notifications.filter(n => n.type === 'warning').length,
      info: this.notifications.filter(n => n.type === 'info').length,
    };
    const byPriority = {
      urgent: this.notifications.filter(n => n.priority === 'urgent').length,
      high: this.notifications.filter(n => n.priority === 'high').length,
      normal: this.notifications.filter(n => n.priority === 'normal').length,
      low: this.notifications.filter(n => n.priority === 'low').length,
    };
    const byCategory = Object.keys(this.preferences.categories).reduce((acc, cat) => {
      acc[cat as NotificationCategory] = this.notifications.filter(
        n => n.category === cat
      ).length;
      return acc;
    }, {} as Record<NotificationCategory, number>);

    return {
      total,
      unread,
      byType,
      byPriority,
      byCategory,
    };
  }
}

// Export singleton instance
export const NotificationManager = new NotificationManagerClass();

// Export convenience methods
export const notify = {
  success: (title: string, options?: Omit<Parameters<typeof NotificationManager.notify>[2], 'type'>) =>
    NotificationManager.notify('success', title, options),
  
  error: (title: string, options?: Omit<Parameters<typeof NotificationManager.notify>[2], 'type'>) =>
    NotificationManager.notify('error', title, options),
  
  warning: (title: string, options?: Omit<Parameters<typeof NotificationManager.notify>[2], 'type'>) =>
    NotificationManager.notify('warning', title, options),
  
  info: (title: string, options?: Omit<Parameters<typeof NotificationManager.notify>[2], 'type'>) =>
    NotificationManager.notify('info', title, options),
};
