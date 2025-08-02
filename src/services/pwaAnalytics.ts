// PWA Analytics Service
// Tracks PWA-specific metrics and user engagement

import { PWA_CONFIG } from '../config/pwa';

export interface PWAMetrics {
  installPrompts: number;
  installations: number;
  launches: number;
  offlineUsage: number;
  cacheHitRate: number;
  backgroundSyncs: number;
  pushNotifications: number;
  shareActions: number;
  fileHandling: number;
}

export interface PerformanceMetrics {
  loadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
}

export interface UserEngagement {
  sessionDuration: number;
  pageViews: number;
  interactions: number;
  features: string[];
  returnVisits: number;
}

class PWAAnalyticsService {
  private metrics: PWAMetrics = {
    installPrompts: 0,
    installations: 0,
    launches: 0,
    offlineUsage: 0,
    cacheHitRate: 0,
    backgroundSyncs: 0,
    pushNotifications: 0,
    shareActions: 0,
    fileHandling: 0
  };

  private performance: PerformanceMetrics = {
    loadTime: 0,
    firstContentfulPaint: 0,
    largestContentfulPaint: 0,
    cumulativeLayoutShift: 0,
    firstInputDelay: 0,
    timeToInteractive: 0
  };

  private engagement: UserEngagement = {
    sessionDuration: 0,
    pageViews: 0,
    interactions: 0,
    features: [],
    returnVisits: 0
  };

  private sessionStart = Date.now();
  private isOnline = navigator.onLine;

  async init(): Promise<void> {
    this.loadStoredMetrics();
    this.setupEventListeners();
    this.trackLaunch();
    this.measurePerformance();
    
    // Track return visits
    const lastVisit = localStorage.getItem('pwa-last-visit');
    if (lastVisit) {
      this.engagement.returnVisits++;
    }
    localStorage.setItem('pwa-last-visit', Date.now().toString());
  }

  private loadStoredMetrics(): void {
    const stored = localStorage.getItem('pwa-metrics');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.metrics = { ...this.metrics, ...data.metrics };
        this.engagement = { ...this.engagement, ...data.engagement };
      } catch (error) {
        // Failed to load stored metrics - continue with defaults
      }
    }
  }

  private saveMetrics(): void {
    const data = {
      metrics: this.metrics,
      engagement: this.engagement,
      timestamp: Date.now()
    };
    localStorage.setItem('pwa-metrics', JSON.stringify(data));
  }

  private setupEventListeners(): void {
    // Install prompt tracking
    window.addEventListener('beforeinstallprompt', (e) => {
      this.trackInstallPrompt();
      e.preventDefault();
      
      // Store the event for later use
      (window as any).deferredPrompt = e;
    });

    // Installation tracking
    window.addEventListener('appinstalled', () => {
      this.trackInstallation();
    });

    // Online/offline tracking
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page visibility for session tracking
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.updateSessionDuration();
        this.saveMetrics();
      } else {
        this.sessionStart = Date.now();
      }
    });

    // Interaction tracking
    ['click', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      document.addEventListener(event, () => {
        this.engagement.interactions++;
      }, { passive: true });
    });

    // Service worker messages
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === 'ANALYTICS_DATA') {
          this.updateServiceWorkerMetrics(event.data.data);
        }
      });
    }
  }

  private async measurePerformance(): Promise<void> {
    if ('performance' in window) {
      // Wait for page load
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          const paint = performance.getEntriesByType('paint');
          
          this.performance.loadTime = navigation.loadEventEnd - navigation.fetchStart;
          
          const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
          if (fcp) this.performance.firstContentfulPaint = fcp.startTime;
          
          // Web Vitals
          this.measureWebVitals();
        }, 1000);
      });
    }
  }

  private async measureWebVitals(): Promise<void> {
    try {
      const { getCLS, getFID, getFCP, getLCP, getTTFB } = await import('web-vitals');
      
      getCLS((metric) => {
        this.performance.cumulativeLayoutShift = metric.value;
      });
      
      getFID((metric) => {
        this.performance.firstInputDelay = metric.value;
      });
      
      getFCP((metric) => {
        this.performance.firstContentfulPaint = metric.value;
      });
      
      getLCP((metric) => {
        this.performance.largestContentfulPaint = metric.value;
      });
    } catch (error) {
      // Web Vitals not available - continue without them
    }
  }

  trackInstallPrompt(): void {
    this.metrics.installPrompts++;
    this.saveMetrics();
    this.sendAnalytics('install_prompt_shown');
  }

  trackInstallation(): void {
    this.metrics.installations++;
    this.saveMetrics();
    this.sendAnalytics('pwa_installed');
  }

  trackLaunch(): void {
    this.metrics.launches++;
    this.engagement.pageViews++;
    
    // Detect launch mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const launchMode = isStandalone ? 'standalone' : 'browser';
    
    this.saveMetrics();
    this.sendAnalytics('pwa_launch', { mode: launchMode });
  }

  trackFeatureUsage(feature: string): void {
    if (!this.engagement.features.includes(feature)) {
      this.engagement.features.push(feature);
    }
    this.saveMetrics();
    this.sendAnalytics('feature_used', { feature });
  }

  trackOfflineUsage(): void {
    if (!this.isOnline) {
      this.metrics.offlineUsage++;
      this.saveMetrics();
      this.sendAnalytics('offline_usage');
    }
  }

  trackBackgroundSync(): void {
    this.metrics.backgroundSyncs++;
    this.saveMetrics();
    this.sendAnalytics('background_sync');
  }

  trackPushNotification(): void {
    this.metrics.pushNotifications++;
    this.saveMetrics();
    this.sendAnalytics('push_notification_received');
  }

  trackShareAction(): void {
    this.metrics.shareActions++;
    this.saveMetrics();
    this.sendAnalytics('share_action');
  }

  trackFileHandling(): void {
    this.metrics.fileHandling++;
    this.saveMetrics();
    this.sendAnalytics('file_handled');
  }

  private updateSessionDuration(): void {
    this.engagement.sessionDuration += Date.now() - this.sessionStart;
  }

  private updateServiceWorkerMetrics(data: any): void {
    if (data.cacheHits && data.networkRequests) {
      this.metrics.cacheHitRate = (data.cacheHits / (data.cacheHits + data.networkRequests)) * 100;
    }
    this.saveMetrics();
  }

  async getServiceWorkerAnalytics(): Promise<any> {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      
      return new Promise((resolve) => {
        const channel = new MessageChannel();
        channel.port1.onmessage = (event) => {
          resolve(event.data);
        };
        
        registration.active?.postMessage(
          { type: 'GET_ANALYTICS' },
          [channel.port2]
        );
      });
    }
    return null;
  }

  getMetrics(): { metrics: PWAMetrics; performance: PerformanceMetrics; engagement: UserEngagement } {
    this.updateSessionDuration();
    return {
      metrics: this.metrics,
      performance: this.performance,
      engagement: this.engagement
    };
  }

  async generateReport(): Promise<string> {
    const swAnalytics = await this.getServiceWorkerAnalytics();
    const data = this.getMetrics();
    
    const report = {
      timestamp: new Date().toISOString(),
      pwa: data.metrics,
      performance: data.performance,
      engagement: data.engagement,
      serviceWorker: swAnalytics,
      browser: {
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      }
    };
    
    return JSON.stringify(report, null, 2);
  }

  private async sendAnalytics(event: string, data?: any): Promise<void> {
    try {
      await fetch(PWA_CONFIG.analytics.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event,
          data,
          timestamp: Date.now(),
          session: this.getSessionId()
        })
      });
    } catch (error) {
      // Silently fail in production to avoid disrupting user experience
    }
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('pwa-session-id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('pwa-session-id', sessionId);
    }
    return sessionId;
  }

  // Export data for external analytics
  async exportData(): Promise<Blob> {
    const report = await this.generateReport();
    return new Blob([report], { type: 'application/json' });
  }
}

export const pwaAnalyticsService = new PWAAnalyticsService();