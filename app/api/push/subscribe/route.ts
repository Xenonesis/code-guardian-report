import { NextRequest, NextResponse } from "next/server";
import {
  getFirebaseAdmin,
  isFirebaseAdminConfigured,
} from "@/lib/firebaseAdmin";

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
  const configured = isFirebaseAdminConfigured();
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

    // Generate userId if not provided (hash of endpoint for anonymous users)
    const userId =
      body.userId ||
      `anon-${Buffer.from(body.subscription.endpoint).toString("base64").slice(0, 16)}`;

    // Check if Firebase Admin is configured
    if (!isFirebaseAdminConfigured()) {
      // Development mode: return success without persisting
      const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      console.warn(
        "Push subscribe: Firebase Admin not configured, subscription not persisted"
      );
      return NextResponse.json({
        success: true,
        message: "Subscription registered (development mode - not persisted)",
        subscriptionId,
      });
    }

    const { db } = getFirebaseAdmin();

    // Check for existing subscription with same endpoint
    const existingQuery = await db
      .collection("pushSubscriptions")
      .where("endpoint", "==", body.subscription.endpoint)
      .limit(1)
      .get();

    if (!existingQuery.empty) {
      // Update existing subscription
      const existingDoc = existingQuery.docs[0];
      await existingDoc.ref.update({
        keys: body.subscription.keys,
        expirationTime: body.subscription.expirationTime || null,
        userAgent:
          body.userAgent || request.headers.get("user-agent") || "unknown",
        deviceType: body.deviceType || "desktop",
        updatedAt: new Date().toISOString(),
        isActive: true,
      });

      return NextResponse.json({
        success: true,
        message: "Subscription updated successfully",
        subscriptionId: existingDoc.id,
      });
    }

    // Create new subscription record
    const subscriptionRecord = {
      userId,
      endpoint: body.subscription.endpoint,
      expirationTime: body.subscription.expirationTime || null,
      keys: body.subscription.keys,
      userAgent:
        body.userAgent || request.headers.get("user-agent") || "unknown",
      deviceType: body.deviceType || "desktop",
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    // Store in Firestore
    const docRef = await db
      .collection("pushSubscriptions")
      .add(subscriptionRecord);

    return NextResponse.json({
      success: true,
      message: "Subscription registered successfully",
      subscriptionId: docRef.id,
    });
  } catch (error) {
    console.error("Push subscription error:", error);
    return NextResponse.json(
      { error: "Failed to process subscription" },
      { status: 500 }
    );
  }
}
