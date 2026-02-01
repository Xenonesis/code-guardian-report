import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";

// Configure VAPID keys for web-push
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject =
  process.env.VAPID_SUBJECT || "mailto:admin@codeguardian.dev";

// Initialize web-push with VAPID credentials if available
if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{ action: string; title: string; icon?: string }>;
  requireInteraction?: boolean;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

export async function GET() {
  const configured = !!(vapidPublicKey && vapidPrivateKey);
  return NextResponse.json({
    status: "push send endpoint is working",
    configured,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    // Validate VAPID configuration
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: "Push notifications not configured. VAPID keys missing." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as PushNotificationPayload;

    // Validate required fields
    if (!body.title || !body.body || !body.subscription?.endpoint) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, body, and subscription.endpoint are required",
        },
        { status: 400 }
      );
    }

    // Validate subscription keys
    if (!body.subscription.keys?.p256dh || !body.subscription.keys?.auth) {
      return NextResponse.json(
        { error: "Invalid subscription: missing p256dh or auth keys" },
        { status: 400 }
      );
    }

    const notificationPayload = {
      title: body.title,
      body: body.body,
      icon: body.icon || "/icons/icon-192x192.png",
      badge: body.badge || "/icons/badge-72x72.png",
      tag: body.tag || `notification-${Date.now()}`,
      data: body.data || {},
      actions: body.actions,
      requireInteraction: body.requireInteraction || false,
    };

    // Send push notification using web-push
    await webpush.sendNotification(
      {
        endpoint: body.subscription.endpoint,
        keys: body.subscription.keys,
      },
      JSON.stringify(notificationPayload)
    );

    return NextResponse.json({
      success: true,
      message: "Push notification sent successfully",
      notificationId: notificationPayload.tag,
    });
  } catch (error: unknown) {
    console.error("Push send error:", error);

    // Handle specific web-push errors
    const webPushError = error as { statusCode?: number };
    if (webPushError.statusCode === 410 || webPushError.statusCode === 404) {
      return NextResponse.json(
        {
          error: "Subscription has expired or is no longer valid",
          code: "SUBSCRIPTION_EXPIRED",
        },
        { status: 410 }
      );
    }

    if (webPushError.statusCode === 413) {
      return NextResponse.json(
        { error: "Notification payload too large" },
        { status: 413 }
      );
    }

    return NextResponse.json(
      { error: "Failed to send push notification" },
      { status: 500 }
    );
  }
}
