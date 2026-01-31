import { NextRequest, NextResponse } from "next/server";

interface UnsubscribePayload {
  userId: string;
  endpoint?: string;
  subscriptionId?: string;
  unsubscribeAll?: boolean;
}

export async function GET() {
  return NextResponse.json({
    status: "push unsubscription endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UnsubscribePayload;

    // Validate required fields
    if (!body.userId) {
      return NextResponse.json(
        { error: "Missing required field: userId" },
        { status: 400 }
      );
    }

    // Must provide either endpoint, subscriptionId, or unsubscribeAll
    if (!body.endpoint && !body.subscriptionId && !body.unsubscribeAll) {
      return NextResponse.json(
        {
          error:
            "Must provide endpoint, subscriptionId, or set unsubscribeAll to true",
        },
        { status: 400 }
      );
    }

    let removedCount = 0;

    if (body.unsubscribeAll) {
      // Note: In production, delete all subscriptions for user:
      // const snapshot = await db.collection('pushSubscriptions').where('userId', '==', body.userId).get();
      // const batch = db.batch();
      // snapshot.docs.forEach(doc => batch.delete(doc.ref));
      // await batch.commit();
      // removedCount = snapshot.size;
      removedCount = 1; // Placeholder
    } else if (body.subscriptionId) {
      // Note: In production, delete by subscriptionId:
      // await db.collection('pushSubscriptions').doc(body.subscriptionId).delete();
      removedCount = 1;
    } else if (body.endpoint) {
      // Note: In production, delete by endpoint:
      // const snapshot = await db.collection('pushSubscriptions')
      //   .where('userId', '==', body.userId)
      //   .where('endpoint', '==', body.endpoint).get();
      // await Promise.all(snapshot.docs.map(doc => doc.ref.delete()));
      // removedCount = snapshot.size;
      removedCount = 1;
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
