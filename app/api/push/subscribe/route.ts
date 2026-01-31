import { NextRequest, NextResponse } from "next/server";

interface PushSubscriptionPayload {
  userId: string;
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
  return NextResponse.json({
    status: "push subscription endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PushSubscriptionPayload;

    // Validate required fields
    if (
      !body.userId ||
      !body.subscription?.endpoint ||
      !body.subscription?.keys
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: userId and subscription with endpoint and keys are required",
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

    // Create subscription record
    const subscriptionRecord = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId,
      endpoint: body.subscription.endpoint,
      expirationTime: body.subscription.expirationTime || null,
      keys: body.subscription.keys,
      userAgent:
        body.userAgent || request.headers.get("user-agent") || "unknown",
      deviceType: body.deviceType || "desktop",
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // Note: In production, store in Firestore:
    // await db.collection('pushSubscriptions').doc(subscriptionRecord.id).set(subscriptionRecord);

    return NextResponse.json({
      success: true,
      message: "Subscription registered successfully",
      subscriptionId: subscriptionRecord.id,
    });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
