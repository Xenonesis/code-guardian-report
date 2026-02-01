import { NextRequest, NextResponse } from "next/server";
import {
  getFirebaseAdmin,
  isFirebaseAdminConfigured,
} from "@/lib/firebaseAdmin";

interface UnsubscribePayload {
  userId?: string;
  endpoint?: string;
  subscriptionId?: string;
  unsubscribeAll?: boolean;
}

export async function GET() {
  const configured = isFirebaseAdminConfigured();
  return NextResponse.json({
    status: "push unsubscription endpoint is working",
    configured,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UnsubscribePayload;

    // Must provide either endpoint, subscriptionId, or unsubscribeAll with userId
    if (!body.endpoint && !body.subscriptionId && !body.unsubscribeAll) {
      return NextResponse.json(
        {
          error:
            "Must provide endpoint, subscriptionId, or set unsubscribeAll to true",
        },
        { status: 400 }
      );
    }

    if (body.unsubscribeAll && !body.userId) {
      return NextResponse.json(
        { error: "userId is required when unsubscribeAll is true" },
        { status: 400 }
      );
    }

    // Check if Firebase Admin is configured
    if (!isFirebaseAdminConfigured()) {
      console.warn("Push unsubscribe: Firebase Admin not configured");
      return NextResponse.json({
        success: true,
        message: "Unsubscription processed (development mode)",
        removedCount: 1,
      });
    }

    const { db } = getFirebaseAdmin();
    let removedCount = 0;

    if (body.unsubscribeAll && body.userId) {
      // Delete all subscriptions for user
      const snapshot = await db
        .collection("pushSubscriptions")
        .where("userId", "==", body.userId)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      removedCount = snapshot.size;
    } else if (body.subscriptionId) {
      // Delete by subscriptionId
      await db
        .collection("pushSubscriptions")
        .doc(body.subscriptionId)
        .delete();
      removedCount = 1;
    } else if (body.endpoint) {
      // Delete by endpoint
      const snapshot = await db
        .collection("pushSubscriptions")
        .where("endpoint", "==", body.endpoint)
        .get();

      await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
      removedCount = snapshot.size;
    }

    return NextResponse.json({
      success: true,
      message: body.unsubscribeAll
        ? "All subscriptions removed successfully"
        : "Subscription removed successfully",
      removedCount,
    });
  } catch (error) {
    console.error("Push unsubscription error:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscription" },
      { status: 500 }
    );
  }
}
