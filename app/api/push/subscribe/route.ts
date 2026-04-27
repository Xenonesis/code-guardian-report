import { NextRequest, NextResponse } from "next/server";

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
  return NextResponse.json({
    status: "push subscription endpoint is working",
    configured: false,
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

    // Push subscription disabled - Firebase removed
    return NextResponse.json({
      success: false,
      configured: false,
      message: "Push subscription is not available",
    });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
