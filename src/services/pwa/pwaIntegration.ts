// PWA Integration Service
// Main service that coordinates all PWA features

import { backgroundSyncService } from "./backgroundSync";
import { pushNotificationService } from "./pushNotifications";
import { pwaAnalyticsService } from "./pwaAnalytics";
import { offlineManager } from "../storage/offlineManager";
import { PWA_CONFIG } from "../../config/pwa";

import { logger } from "@/utils/logger";
export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  hasNotificationPermission: boolean;
  backgroundSyncSupported: boolean;
  serviceWorkerReady: boolean;
  installPromptAvailable: boolean;
}

class PWAIntegrationService {
  private installPrompt: import("../../utils/pwaUtils").BeforeInstallPromptEvent | null = null;
  private status: PWAStatus = {
    isInstalled: false,
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    hasNotificationPermission: false,
    backgroundSyncSupported: false,
    serviceWorkerReady: false,
    installPromptAvailable: false,
  };

  async init(): Promise<void> {
    // Guard for server-side rendering
    if (typeof window === "undefined") return;

    // Initialize all services
    await Promise.all([
      this.initServiceWorker(),
      backgroundSyncService.init(),
      pushNotificationService.init(),
      pwaAnalyticsService.init(),
      offlineManager.init(),
    ]);

    this.setupEventListeners();
    this.updateStatus();
  }

  private async initServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      try {
        // Reuse existing registration if available to avoid duplicate listeners/registration
        const existing =
          await navigator.serviceWorker.getRegistration("/sw.js");
        const registration =
          existing ||
          (await navigator.serviceWorker.register(
            "/sw.js",
            PWA_CONFIG.serviceWorker
          ));

        // Handle updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (
                newWorker.state === "installed" &&
                navigator.serviceWorker.controller
              ) {
                this.notifyUpdate();
              }
            });
          }
        });

        this.status.serviceWorkerReady = true;
        this.status.backgroundSyncSupported = "sync" in registration;
      } catch {
        // Service worker registration failed - continue without PWA features
      }
    }
  }

  private setupEventListeners(): void {
    // Guard for server-side rendering
    if (typeof window === "undefined") return;

    // Install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.installPrompt = e;
      this.status.installPromptAvailable = true;
      pwaAnalyticsService.trackInstallPrompt();
      this.dispatchStatusUpdate();
    });

    // App installed
    window.addEventListener("appinstalled", () => {
      this.status.isInstalled = true;
      this.status.installPromptAvailable = false;
      this.installPrompt = null;
      pwaAnalyticsService.trackInstallation();
      this.dispatchStatusUpdate();
    });

    // Online/offline
    window.addEventListener("online", () => {
      this.status.isOnline = true;
      this.dispatchStatusUpdate();
    });

    window.addEventListener("offline", () => {
      this.status.isOnline = false;
      pwaAnalyticsService.trackOfflineUsage();
      this.dispatchStatusUpdate();
    });

    // Service worker messages
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        this.handleServiceWorkerMessage(event.data);
      });
    }

    // Push notifications
    window.addEventListener("pushNotification", (event: any) => {
      pwaAnalyticsService.trackPushNotification();
      this.handlePushNotification(event.detail);
    });

    // Sync conflicts
    window.addEventListener("syncConflict", (event: any) => {
      this.handleSyncConflict(event.detail);
    });
  }

  private handleServiceWorkerMessage(data: any): void {
    switch (data.type) {
      case "PROCESS_UPLOAD_QUEUE":
        backgroundSyncService.processUploadQueue();
        break;
      case "SYNC_OFFLINE_DATA":
        offlineManager.syncPendingData();
        break;
      case "SYNC_ANALYTICS":
        this.syncAnalytics();
        break;
      case "BACKGROUND_SYNC":
        pwaAnalyticsService.trackBackgroundSync();
        break;
      case "PUSH_NOTIFICATION_RECEIVED":
        this.handlePushNotification(data.payload);
        break;
      case "UPDATE_APP":
        this.notifyUpdate();
        break;
    }
  }

  private handlePushNotification(payload: any): void {
    // Dispatch custom event for app components to handle
    window.dispatchEvent(
      new CustomEvent("pwaNotification", {
        detail: { type: "push", payload },
      })
    );
  }

  private handleSyncConflict(conflict: any): void {
    // Dispatch custom event for app components to handle
    window.dispatchEvent(
      new CustomEvent("pwaNotification", {
        detail: { type: "syncConflict", conflict },
      })
    );
  }

  private notifyUpdate(): void {
    window.dispatchEvent(
      new CustomEvent("pwaNotification", {
        detail: { type: "updateAvailable" },
      })
    );
  }

  private async syncAnalytics(): Promise<void> {
    try {
      const report = await pwaAnalyticsService.generateReport();

      // Skip API calls in development mode or when no backend is available
      if (
        process.env.NODE_ENV === "development" ||
        window.location.hostname === "localhost"
      ) {
        logger.debug("PWA Analytics Sync (dev mode):", report);
        return;
      }

      await fetch("/api/analytics/pwa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: report,
      });
    } catch {
      // Silently fail to avoid disrupting user experience
    }
  }

  async promptInstall(): Promise<boolean> {
    if (!this.installPrompt) return false;

    try {
      // `prompt()` must be triggered from a user gesture (e.g. button click)
      await this.installPrompt.prompt();

      const choice = await this.installPrompt.userChoice;
      const accepted = choice.outcome === "accepted";

      // The event can only be used once
      this.installPrompt = null;
      this.status.installPromptAvailable = false;

      if (accepted) {
        // `appinstalled` will also fire, but update state immediately for UX
        this.status.isInstalled = true;
      }

      this.dispatchStatusUpdate();
      return accepted;
    } catch {
      return false;
    }
  }

  async enableNotifications(): Promise<boolean> {
    const enabled = await pushNotificationService.requestPermission();
    this.status.hasNotificationPermission = enabled;
    this.dispatchStatusUpdate();
    return enabled;
  }

  async disableNotifications(): Promise<boolean> {
    const disabled = await pushNotificationService.unsubscribe();
    this.status.hasNotificationPermission = !disabled;
    this.dispatchStatusUpdate();
    return disabled;
  }

  async sendTestNotification(): Promise<void> {
    await pushNotificationService.sendTestNotification();
  }

  async uploadFile(file: File): Promise<string> {
    pwaAnalyticsService.trackFeatureUsage("file-upload");
    return await backgroundSyncService.queueUpload(file);
  }

  async saveOfflineData(type: string, data: any): Promise<string> {
    pwaAnalyticsService.trackFeatureUsage("offline-storage");
    return await offlineManager.saveOfflineData(type as any, data);
  }

  async getOfflineData(type: string): Promise<any[]> {
    return await offlineManager.getOfflineDataByType(type as any);
  }

  async shareContent(data: ShareData): Promise<boolean> {
    if (navigator.share) {
      try {
        await navigator.share(data);
        pwaAnalyticsService.trackShareAction();
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }

  async updateServiceWorker(): Promise<void> {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.waiting) {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      }
    }
  }

  async clearCache(cacheName?: string): Promise<void> {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.active) {
        registration.active.postMessage({
          type: "CLEAR_CACHE",
          cacheName,
        });
      }
    }
  }

  async preloadRoutes(routes: string[]): Promise<void> {
    if ("serviceWorker" in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration?.active) {
        registration.active.postMessage({
          type: "PRELOAD_ROUTES",
          routes,
        });
      }
    }
  }

  async getAnalytics(): Promise<any> {
    return pwaAnalyticsService.getMetrics();
  }

  async exportAnalytics(): Promise<Blob> {
    return await pwaAnalyticsService.exportData();
  }

  getStatus(): PWAStatus {
    return { ...this.status };
  }

  private updateStatus(): void {
    // Check if app is installed
    this.status.isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    // Check notification permission
    this.status.hasNotificationPermission =
      Notification.permission === "granted";

    this.dispatchStatusUpdate();
  }

  private dispatchStatusUpdate(): void {
    window.dispatchEvent(
      new CustomEvent("pwaStatusUpdate", {
        detail: this.status,
      })
    );
  }

  // Feature detection
  static getCapabilities() {
    return {
      serviceWorker: "serviceWorker" in navigator,
      pushNotifications: "PushManager" in window,
      backgroundSync:
        "serviceWorker" in navigator &&
        "sync" in window.ServiceWorkerRegistration.prototype,
      webShare: "share" in navigator,
      fileHandling: "launchQueue" in window,
      installPrompt: true, // Will be updated when beforeinstallprompt fires
      persistentStorage:
        "storage" in navigator && "persist" in navigator.storage,
      notifications: "Notification" in window,
      indexedDB: "indexedDB" in window,
      cacheAPI: "caches" in window,
    };
  }
}

export const pwaIntegrationService = new PWAIntegrationService();
