// Push Notification Service
// Handles push notification subscription and server integration

import { PWA_CONFIG } from "@/config/pwa";

import { logger } from "@/utils/logger";
export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: NotificationAction[];
  tag?: string;
  requireInteraction?: boolean;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}

class PushNotificationService {
  private vapidPublicKey = PWA_CONFIG.pushNotifications.vapidPublicKey;
  private subscription: PushSubscription | null = null;

  async init(): Promise<boolean> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription =
        await registration.pushManager.getSubscription();

      if (existingSubscription) {
        this.subscription = existingSubscription;
        await this.sendSubscriptionToServer(existingSubscription);
        return true;
      }

      return await this.requestPermission();
    } catch {
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    const permission = await Notification.requestPermission();

    if (permission === "granted") {
      return await this.subscribe();
    }

    return false;
  }

  async subscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const appServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      });

      this.subscription = subscription;
      await this.sendSubscriptionToServer(subscription);

      return true;
    } catch {
      return false;
    }
  }

  async unsubscribe(): Promise<boolean> {
    if (!this.subscription) return true;

    try {
      await this.subscription.unsubscribe();
      await this.removeSubscriptionFromServer();
      this.subscription = null;
      return true;
    } catch {
      return false;
    }
  }

  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    // Skip API calls in development mode or when no backend is available
    if (
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost"
    ) {
      logger.debug("Push Subscription (dev mode):", {
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      });
      return;
    }

    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription: subscription.toJSON(),
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send subscription to server");
    }
  }

  private async removeSubscriptionFromServer(): Promise<void> {
    if (!this.subscription) return;

    // Skip API calls in development mode or when no backend is available
    if (
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost"
    ) {
      logger.debug("Push Unsubscribe (dev mode):", {
        endpoint: this.subscription.endpoint,
      });
      return;
    }

    const response = await fetch("/api/push/unsubscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        endpoint: this.subscription.endpoint,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to remove subscription from server");
    }
  }

  async sendTestNotification(): Promise<void> {
    if (!this.subscription) {
      throw new Error("No active subscription");
    }

    const payload: NotificationPayload = {
      title: "Code Guardian Test",
      body: "Push notifications are working correctly!",
      icon: "/favicon-192x192.svg",
      badge: "/favicon-192x192.svg",
      data: { test: true },
      actions: [
        { action: "view", title: "View App" },
        { action: "close", title: "Close" },
      ],
    };

    // Skip API calls in development mode or when no backend is available
    if (
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost"
    ) {
      logger.debug("Test Notification (dev mode):", {
        subscription: this.subscription.toJSON(),
        payload,
      });
      return;
    }

    const response = await fetch("/api/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        badge: payload.badge,
        tag: payload.tag,
        data: payload.data,
        actions: payload.actions,
        requireInteraction: payload.requireInteraction,
        subscription: this.subscription.toJSON(),
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to send test notification");
    }
  }

  async scheduleNotification(
    payload: NotificationPayload,
    delay: number,
    userId?: string
  ): Promise<void> {
    // Skip API calls in development mode or when no backend is available
    if (
      process.env.NODE_ENV === "development" ||
      window.location.hostname === "localhost"
    ) {
      logger.debug("Schedule Notification (dev mode):", {
        subscription: this.subscription?.toJSON(),
        payload,
        delay,
      });
      return;
    }

    if (!userId) {
      throw new Error("User ID is required to schedule notifications");
    }

    const scheduledTime = new Date(Date.now() + delay).toISOString();

    const response = await fetch("/api/push/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: payload.title,
        body: payload.body,
        icon: payload.icon,
        data: payload.data,
        scheduledTime,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to schedule notification");
    }
  }

  getSubscriptionStatus(): { subscribed: boolean; endpoint?: string } {
    return {
      subscribed: !!this.subscription,
      endpoint: this.subscription?.endpoint,
    };
  }

  private urlBase64ToUint8Array(base64String: string): BufferSource {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray.buffer;
  }

  // Listen for push events from service worker
  setupMessageListener(): void {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data?.type === "PUSH_RECEIVED") {
          this.handlePushMessage(event.data.payload);
        }
      });
    }
  }

  private handlePushMessage(payload: Record<string, unknown>): void {
    // Dispatch custom event for app to handle
    window.dispatchEvent(
      new CustomEvent("pushNotification", {
        detail: payload,
      })
    );
  }
}

export const pushNotificationService = new PushNotificationService();
