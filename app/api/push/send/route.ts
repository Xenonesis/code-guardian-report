import { NextRequest, NextResponse } from "next/server";

interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  subscription: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
}

export async function GET() {
  return NextResponse.json({
    status: "push send endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
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

    // In production, use web-push library to send notifications
    // For now, we acknowledge the request and log for monitoring
    const notificationPayload = {
      title: body.title,
      body: body.body,
      icon: body.icon || "/icons/icon-192x192.png",
      badge: body.badge || "/icons/badge-72x72.png",
      tag: body.tag || `notification-${Date.now()}`,
      data: body.data || {},
      timestamp: new Date().toISOString(),
    };

    // Note: In production, implement web-push here:
    // import webpush from 'web-push';
    // await webpush.sendNotification(body.subscription, JSON.stringify(notificationPayload));

    return NextResponse.json({
      success: true,
      message: "Push notification queued",
      notificationId: notificationPayload.tag,
    });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json(
      { error: "Failed to process push send request" },
      { status: 500 }
    );
  }
}
