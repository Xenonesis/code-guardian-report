// PWA Analytics Service
// Tracks PWA usage, performance, and user engagement

export interface PWAAnalytics {
  // Performance metrics
  cacheHits: number;
  cacheMisses: number;
  networkRequests: number;
  offlineRequests: number;
  
  // PWA specific metrics
  installEvents: number;
  updateEvents: number;
  backgroundSyncs: number;
  pushNotifications: number;
  
  // User engagement
  sessionDuration: number;
  pageViews: number;
  offlineUsage: number;
  
  // Technical metrics
  cacheSize: number;
  storageUsage: number;
  loadTime: number;
}

export interface AnalyticsEvent {
  type: string;
  timestamp: number;
  data?: any;
  sessionId: string;
}

class PWAAnalyticsService {
  private static instance: PWAAnalyticsService;
  private analytics: PWAAnalytics;
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private sessionStart: number;
  private readonly STORAGE_KEY = 'pwa-analytics';
  private readonly EVENTS_KEY = 'pwa-events';

  static getInstance(): PWAAnalyticsService {
    if (!PWAAnalyticsService.instance) {
      PWAAnalyticsService.instance = new PWAAnalyticsService();
    }
    return PWAAnalyticsService.instance;
  }

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStart = Date.now();
    this.analytics = this.loadAnalytics();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
  }

  // Track PWA installation
  trackInstall(): void {
    this.analytics.installEvents++;
    this.trackEvent('pwa_install', { timestamp: Date.now() });
    this.saveAnalytics();
  }

  // Track PWA updates
  trackUpdate(): void {
    this.analytics.updateEvents++;
    this.trackEvent('pwa_update', { timestamp: Date.now() });
    this.saveAnalytics();
  }

  // Track offline usage
  trackOfflineUsage(duration: number): void {
    this.analytics.offlineUsage += duration;
    this.trackEvent('offline_usage', { duration });
    this.saveAnalytics();
  }

  // Track page views
  trackPageView(path: string): void {
    this.analytics.pageViews++;
    this.trackEvent('page_view', { path });
    this.saveAnalytics();
  }

  // Track background sync
  trackBackgroundSync(type: string): void {
    this.analytics.backgroundSyncs++;
    this.trackEvent('background_sync', { type });
    this.saveAnalytics();
  }

  // Track push notifications
  trackPushNotification(action: 'received' | 'clicked' | 'dismissed'): void {
    if (action === 'received') {
      this.analytics.pushNotifications++;
    }
    this.trackEvent('push_notification', { action });
    this.saveAnalytics();
  }

  // Track cache performance
  async trackCachePerformance(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Get analytics from service worker
        const messageChannel = new MessageChannel();
        const analyticsPromise = new Promise<any>((resolve) => {
          messageChannel.port1.onmessage = (event) => {
            resolve(event.data);
          };
        });
        
        registration.active?.postMessage(
          { type: 'GET_ANALYTICS' },
          [messageChannel.port2]
        );
        
        const swAnalytics = await analyticsPromise;
        
        if (swAnalytics) {
          this.analytics.cacheHits = swAnalytics.cacheHits;
          this.analytics.cacheMisses = swAnalytics.cacheMisses;
          this.analytics.networkRequests = swAnalytics.networkRequests;
          this.analytics.offlineRequests = swAnalytics.offlineRequests;
          this.saveAnalytics();
        }
      } catch (error) {
        console.error('Failed to get cache analytics:', error);
      }
    }
  }

  // Track storage usage
  async trackStorageUsage(): Promise<void> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        this.analytics.storageUsage = estimate.usage || 0;
        this.saveAnalytics();
      }
    } catch (error) {
      console.error('Failed to get storage estimate:', error);
    }
  }

  // Track cache size
  async trackCacheSize(): Promise<void> {
    try {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        let totalSize = 0;
        
        for (const cacheName of cacheNames) {
          const cache = await caches.open(cacheName);
          const requests = await cache.keys();
          
          for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
              const blob = await response.blob();
              totalSize += blob.size;
            }
          }
        }
        
        this.analytics.cacheSize = totalSize;
        this.saveAnalytics();
      }
    } catch (error) {
      console.error('Failed to calculate cache size:', error);
    }
  }

  // Track load time
  trackLoadTime(): void {
    if ('performance' in window) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.analytics.loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        this.trackEvent('load_time', { loadTime: this.analytics.loadTime });
        this.saveAnalytics();
      }
    }
  }

  // Track custom event
  trackEvent(type: string, data?: any): void {
    const event: AnalyticsEvent = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId
    };
    
    this.events.push(event);
    this.saveEvents();
  }

  // Get analytics data
  getAnalytics(): PWAAnalytics {
    return { ...this.analytics };
  }

  // Get events
  getEvents(limit?: number): AnalyticsEvent[] {
    return limit ? this.events.slice(-limit) : [...this.events];
  }

  // Get session duration
  getSessionDuration(): number {
    return Date.now() - this.sessionStart;
  }

  // Export analytics data
  exportAnalytics(): string {
    const exportData = {
      analytics: this.analytics,
      events: this.events,
      sessionId: this.sessionId,
      sessionDuration: this.getSessionDuration(),
      exportTimestamp: Date.now()
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Clear analytics data
  clearAnalytics(): void {
    this.analytics = this.createEmptyAnalytics();
    this.events = [];
    this.saveAnalytics();
    this.saveEvents();
  }

  // Setup event listeners
  private setupEventListeners(): void {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.trackEvent('page_hidden');
      } else {
        this.trackEvent('page_visible');
      }
    });

    // Track online/offline status
    window.addEventListener('online', () => {
      this.trackEvent('online');
    });

    window.addEventListener('offline', () => {
      this.trackEvent('offline');
    });

    // Track beforeunload for session duration
    window.addEventListener('beforeunload', () => {
      this.analytics.sessionDuration += this.getSessionDuration();
      this.saveAnalytics();
    });
  }

  // Start performance monitoring
  private startPerformanceMonitoring(): void {
    // Track performance metrics every 30 seconds
    setInterval(() => {
      this.trackCachePerformance();
      this.trackStorageUsage();
      this.trackCacheSize();
    }, 30000);

    // Track load time on page load
    if (document.readyState === 'complete') {
      this.trackLoadTime();
    } else {
      window.addEventListener('load', () => {
        this.trackLoadTime();
      });
    }
  }

  // Utility methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createEmptyAnalytics(): PWAAnalytics {
    return {
      cacheHits: 0,
      cacheMisses: 0,
      networkRequests: 0,
      offlineRequests: 0,
      installEvents: 0,
      updateEvents: 0,
      backgroundSyncs: 0,
      pushNotifications: 0,
      sessionDuration: 0,
      pageViews: 0,
      offlineUsage: 0,
      cacheSize: 0,
      storageUsage: 0,
      loadTime: 0
    };
  }

  private loadAnalytics(): PWAAnalytics {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return { ...this.createEmptyAnalytics(), ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
    return this.createEmptyAnalytics();
  }

  private saveAnalytics(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.analytics));
    } catch (error) {
      console.error('Failed to save analytics:', error);
    }
  }

  private saveEvents(): void {
    try {
      // Keep only last 1000 events to prevent storage overflow
      const eventsToSave = this.events.slice(-1000);
      localStorage.setItem(this.EVENTS_KEY, JSON.stringify(eventsToSave));
    } catch (error) {
      console.error('Failed to save events:', error);
    }
  }
}

export default PWAAnalyticsService;