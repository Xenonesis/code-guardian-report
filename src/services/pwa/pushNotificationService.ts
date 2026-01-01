import { logger } from "@/utils/logger";

// Push Notification Service for PWA
// Handles server integration and notification management

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  tag?: string;
  requireInteraction?: boolean;
}

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

class PushNotificationService {
  private static instance: PushNotificationService;
  private vapidPublicKey =
    "BEl62iUYgUivxIkv69yViEuiBIa40HI80NqIUHI-lzKkMiWd2_MzC4AkMaHPXQdmPfflWGxJ4lWzwILyaEp2dDY"; // Replace with your VAPID key
  private serverEndpoint = "/api/push-notifications";

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService();
    }
    return PushNotificationService.instance;
  }

  // Request notification permission and subscribe
  async subscribe(): Promise<PushSubscription | null> {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      logger.warn("Push notifications not supported");
      return null;
    }

    try {
      // Request permission
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission denied");
      }

      // Get service worker registration
      const registration = await navigator.serviceWorker.ready;
      const appServerKey = this.urlBase64ToUint8Array(this.vapidPublicKey);

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: appServerKey,
      });

      // Send subscription to server
      const subscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
      };

      await this.sendSubscriptionToServer(subscriptionData);

      // Store subscription locally
      localStorage.setItem(
        "push-subscription",
        JSON.stringify(subscriptionData)
      );

      return subscriptionData;
    } catch (error) {
      logger.error("Failed to subscribe to push notifications:", error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
        await this.removeSubscriptionFromServer();
        localStorage.removeItem("push-subscription");
        return true;
      }
      return false;
    } catch (error) {
      logger.error("Failed to unsubscribe from push notifications:", error);
      return false;
    }
  }

  // Check if user is subscribed
  async isSubscribed(): Promise<boolean> {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return false;
      }

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      return subscription !== null;
    } catch (error) {
      return false;
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(
    subscription: PushSubscription
  ): Promise<void> {
    const response = await fetch(`${this.serverEndpoint}/subscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Failed to send subscription to server: ${response.statusText}`
      );
    }
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(): Promise<void> {
    const storedSubscription = localStorage.getItem("push-subscription");
    if (!storedSubscription) return;

    const subscription = JSON.parse(storedSubscription);

    const response = await fetch(`${this.serverEndpoint}/unsubscribe`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subscription }),
    });

    if (!response.ok) {
      logger.warn(
        `Failed to remove subscription from server: ${response.statusText}`
      );
    }
  }

  // Send notification to specific user (server-side)
  async sendNotification(
    userId: string,
    payload: NotificationPayload
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverEndpoint}/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          payload: {
            title: payload.title,
            body: payload.body,
            icon: payload.icon || "/favicon-192x192.svg",
            badge: payload.badge || "/favicon-192x192.svg",
            image: payload.image,
            data: payload.data,
            actions: payload.actions,
            tag: payload.tag,
            requireInteraction: payload.requireInteraction || false,
          },
        }),
      });

      return response.ok;
    } catch (error) {
      logger.error("Failed to send notification:", error);
      return false;
    }
  }

  // Send notification to all subscribers (server-side)
  async broadcastNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const response = await fetch(`${this.serverEndpoint}/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ payload }),
      });

      return response.ok;
    } catch (error) {
      logger.error("Failed to broadcast notification:", error);
      return false;
    }
  }

  // Show local notification (fallback)
  async showLocalNotification(payload: NotificationPayload): Promise<void> {
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || "/favicon-192x192.svg",
        badge: payload.badge || "/favicon-192x192.svg",
        data: payload.data,
        tag: payload.tag,
        requireInteraction: payload.requireInteraction || false,
      });

      // Handle notification click
      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (payload.data?.url && typeof payload.data.url === "string") {
          window.open(payload.data.url, "_blank");
        }
        notification.close();
      };
    }
  }

  // Utility methods
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

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  // Notification templates for common scenarios
  async notifyAnalysisComplete(
    analysisId: string,
    results: any
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: "Security Analysis Complete",
      body: `Analysis ${analysisId} found ${results.issueCount} security issues`,
      icon: "/favicon-192x192.svg",
      data: {
        url: `/?analysis=${analysisId}`,
        analysisId,
        results,
      },
      actions: [
        {
          action: "view",
          title: "View Results",
          icon: "/favicon-192x192.svg",
        },
        {
          action: "dismiss",
          title: "Dismiss",
        },
      ],
      tag: `analysis-${analysisId}`,
    };

    await this.showLocalNotification(payload);
  }

  async notifySecurityAlert(
    severity: "high" | "medium" | "low",
    message: string
  ): Promise<void> {
    const payload: NotificationPayload = {
      title: `Security Alert - ${severity.toUpperCase()}`,
      body: message,
      icon: "/favicon-192x192.svg",
      requireInteraction: severity === "high",
      data: {
        severity,
        timestamp: Date.now(),
      },
      tag: "security-alert",
    };

    await this.showLocalNotification(payload);
  }

  async notifyUpdateAvailable(): Promise<void> {
    const payload: NotificationPayload = {
      title: "App Update Available",
      body: "A new version of Code Guardian is ready to install",
      icon: "/favicon-192x192.svg",
      actions: [
        {
          action: "update",
          title: "Update Now",
          icon: "/favicon-192x192.svg",
        },
        {
          action: "later",
          title: "Later",
        },
      ],
      tag: "app-update",
    };

    await this.showLocalNotification(payload);
  }
}

export default PushNotificationService;
