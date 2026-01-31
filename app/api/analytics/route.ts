import { NextRequest, NextResponse } from "next/server";

type AnalyticsEventType =
  | "page_view"
  | "analysis_started"
  | "analysis_completed"
  | "file_uploaded"
  | "github_connected"
  | "export_pdf"
  | "error_occurred"
  | "feature_used"
  | "custom";

interface AnalyticsPayload {
  userId: string;
  event: AnalyticsEventType;
  properties?: Record<string, unknown>;
  sessionId?: string;
  pageUrl?: string;
  referrer?: string;
}

interface AnalyticsBatchPayload {
  userId: string;
  events: Array<{
    event: AnalyticsEventType;
    properties?: Record<string, unknown>;
    timestamp?: string;
  }>;
  sessionId?: string;
}

export async function GET() {
  return NextResponse.json({
    status: "analytics endpoint is working",
    timestamp: new Date().toISOString(),
    supportedEvents: [
      "page_view",
      "analysis_started",
      "analysis_completed",
      "file_uploaded",
      "github_connected",
      "export_pdf",
      "error_occurred",
      "feature_used",
      "custom",
    ],
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a batch request
    if ("events" in body && Array.isArray(body.events)) {
      return handleBatchAnalytics(body as AnalyticsBatchPayload, request);
    }

    return handleSingleAnalytics(body as AnalyticsPayload, request);
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to process analytics" },
      { status: 500 }
    );
  }
}

function handleSingleAnalytics(body: AnalyticsPayload, request: NextRequest) {
  // Validate required fields
  if (!body.userId || !body.event) {
    return NextResponse.json(
      { error: "Missing required fields: userId and event are required" },
      { status: 400 }
    );
  }

  // Create analytics record
  const analyticsRecord = {
    id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: body.userId,
    event: body.event,
    properties: body.properties || {},
    sessionId: body.sessionId || null,
    pageUrl: body.pageUrl || request.headers.get("referer") || null,
    referrer: body.referrer || null,
    userAgent: request.headers.get("user-agent") || "unknown",
    timestamp: new Date().toISOString(),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
  };

  // Note: In production, store in Firestore:
  // await db.collection('analytics').add(analyticsRecord);

  return NextResponse.json({
    success: true,
    message: "Analytics event recorded",
    eventId: analyticsRecord.id,
  });
}

function handleBatchAnalytics(
  body: AnalyticsBatchPayload,
  request: NextRequest
) {
  // Validate required fields
  if (!body.userId || !body.events?.length) {
    return NextResponse.json(
      {
        error: "Missing required fields: userId and events array are required",
      },
      { status: 400 }
    );
  }

  // Limit batch size
  if (body.events.length > 100) {
    return NextResponse.json(
      { error: "Batch size exceeds maximum of 100 events" },
      { status: 400 }
    );
  }

  const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const processedEvents = body.events.map((event, index) => ({
    id: `${batchId}-${index}`,
    userId: body.userId,
    event: event.event,
    properties: event.properties || {},
    sessionId: body.sessionId || null,
    timestamp: event.timestamp || new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || "unknown",
  }));

  // Note: In production, batch write to Firestore:
  // const batch = db.batch();
  // processedEvents.forEach(event => {
  //   const ref = db.collection('analytics').doc(event.id);
  //   batch.set(ref, event);
  // });
  // await batch.commit();

  return NextResponse.json({
    success: true,
    message: `${processedEvents.length} analytics events recorded`,
    batchId,
    eventCount: processedEvents.length,
  });
}
