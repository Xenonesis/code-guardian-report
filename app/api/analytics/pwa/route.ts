import { NextRequest, NextResponse } from "next/server";

interface PWAAnalyticsPayload {
  event:
    | "install"
    | "update"
    | "share"
    | "offline_usage"
    | "push_received"
    | "custom";
  userId?: string;
  sessionId?: string;
  properties?: Record<string, unknown>;
}

export async function GET() {
  return NextResponse.json({
    status: "PWA analytics endpoint is working",
    timestamp: new Date().toISOString(),
    supportedEvents: [
      "install",
      "update",
      "share",
      "offline_usage",
      "push_received",
      "custom",
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PWAAnalyticsPayload;

    // Validate required fields
    if (!body.event) {
      return NextResponse.json(
        { error: "Missing required field: event" },
        { status: 400 }
      );
    }

    // Create PWA analytics record
    const pwaAnalyticsRecord = {
      id: `pwa-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      event: body.event,
      userId: body.userId || null,
      sessionId: body.sessionId || null,
      properties: body.properties || {},
      userAgent: request.headers.get("user-agent") || "unknown",
      timestamp: new Date().toISOString(),
    };

    // Note: In production, store in Firestore:
    // await db.collection('pwaAnalytics').add(pwaAnalyticsRecord);

    return NextResponse.json({
      success: true,
      message: "PWA analytics event recorded",
      eventId: pwaAnalyticsRecord.id,
    });
  } catch (error) {
    console.error("PWA Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to process PWA analytics" },
      { status: 500 }
    );
  }
}
