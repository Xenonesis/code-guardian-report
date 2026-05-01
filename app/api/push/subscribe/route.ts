import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface PushSubscriptionPayload {
  userId?: string;
  subscription: {
    endpoint: string;
    expirationTime?: number | null;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  userAgent?: string;
  deviceType?: "desktop" | "mobile" | "tablet";
}

export async function GET() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const configured = !!(vapidPublicKey && vapidPrivateKey);

  return NextResponse.json({
    status: "push subscription endpoint is working",
    configured,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PushSubscriptionPayload;

    // Validate required fields
    if (!body.subscription?.endpoint || !body.subscription?.keys) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: subscription with endpoint and keys are required",
        },
        { status: 400 }
      );
    }

    // Validate subscription keys
    if (!body.subscription.keys.p256dh || !body.subscription.keys.auth) {
      return NextResponse.json(
        { error: "Invalid subscription: missing p256dh or auth keys" },
        { status: 400 }
      );
    }

    // Store subscription using Prisma
    const subscription = await prisma.pushSubscription.create({
      data: {
        userId: body.userId || "anonymous",
        endpoint: body.subscription.endpoint,
        p256dh: body.subscription.keys.p256dh,
        auth: body.subscription.keys.auth,
        expirationTime: body.subscription.expirationTime
          ? new Date(body.subscription.expirationTime)
          : null,
        userAgent: body.userAgent || request.headers.get("user-agent") || null,
        deviceType: body.deviceType || null,
      },
    });

    return NextResponse.json({
      success: true,
      configured: true,
      message: "Push subscription registered successfully",
      subscriptionId: subscription.id,
    });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
