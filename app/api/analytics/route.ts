import { NextRequest, NextResponse } from "next/server";
import {
  getFirebaseAdmin,
  isFirebaseAdminConfigured,
} from "@/lib/firebaseAdmin";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX_REQUESTS;
}

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
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

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

async function handleSingleAnalytics(
  body: AnalyticsPayload,
  request: NextRequest
) {
  // Validate required fields
  if (!body.event) {
    return NextResponse.json(
      { error: "Missing required fields: event is required" },
      { status: 400 }
    );
  }

  // Create analytics record
  const analyticsRecord = {
    id: `analytics-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: body.userId || "anonymous",
    event: body.event,
    properties: body.properties || {},
    sessionId: body.sessionId || null,
    pageUrl: body.pageUrl || request.headers.get("referer") || null,
    referrer: body.referrer || null,
    userAgent: request.headers.get("user-agent") || "unknown",
    timestamp: new Date().toISOString(),
    ip: request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown",
  };

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Analytics storage is not configured. Set Firebase Admin credentials.",
      },
      { status: 503 }
    );
  }

  const { db } = getFirebaseAdmin();
  await db.collection("analytics").add(analyticsRecord);

  return NextResponse.json({
    success: true,
    message: "Analytics event recorded",
    eventId: analyticsRecord.id,
    persisted: true,
  });
}

async function handleBatchAnalytics(
  body: AnalyticsBatchPayload,
  request: NextRequest
) {
  // Validate required fields
  if (!body.events?.length) {
    return NextResponse.json(
      {
        error: "Missing required fields: events array are required",
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
    userId: body.userId || "anonymous",
    event: event.event,
    properties: event.properties || {},
    sessionId: body.sessionId || null,
    timestamp: event.timestamp || new Date().toISOString(),
    userAgent: request.headers.get("user-agent") || "unknown",
  }));

  if (!isFirebaseAdminConfigured()) {
    return NextResponse.json(
      {
        error:
          "Analytics storage is not configured. Set Firebase Admin credentials.",
      },
      { status: 503 }
    );
  }

  const { db } = getFirebaseAdmin();
  const batch = db.batch();
  processedEvents.forEach((event) => {
    const ref = db.collection("analytics").doc(event.id);
    batch.set(ref, event);
  });
  await batch.commit();

  return NextResponse.json({
    success: true,
    message: `${processedEvents.length} analytics events recorded`,
    batchId,
    eventCount: processedEvents.length,
    persisted: true,
  });
}
