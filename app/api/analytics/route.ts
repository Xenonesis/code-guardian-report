import { NextRequest, NextResponse } from "next/server";
import {
  getFirebaseAdmin,
  isFirebaseAdminConfigured,
} from "@/lib/firebaseAdmin";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP

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

const SUPPORTED_EVENTS: readonly AnalyticsEventType[] = [
  "page_view",
  "analysis_started",
  "analysis_completed",
  "file_uploaded",
  "github_connected",
  "export_pdf",
  "error_occurred",
  "feature_used",
  "custom",
] as const;

function isSupportedEvent(event: unknown): event is AnalyticsEventType {
  return (
    typeof event === "string" &&
    SUPPORTED_EVENTS.includes(event as AnalyticsEventType)
  );
}

function validateSinglePayload(body: AnalyticsPayload): string | null {
  if (!isSupportedEvent(body.event)) {
    return "event is required and must be one of the supported event types";
  }
  if (body.userId && typeof body.userId !== "string") {
    return "userId must be a string when provided";
  }
  if (body.sessionId && typeof body.sessionId !== "string") {
    return "sessionId must be a string when provided";
  }
  return null;
}

function validateBatchPayload(body: AnalyticsBatchPayload): string | null {
  if (!Array.isArray(body.events) || body.events.length === 0) {
    return "events array is required and must not be empty";
  }
  if (body.events.length > 100) {
    return "Batch size exceeds maximum of 100 events";
  }
  for (const event of body.events) {
    if (!isSupportedEvent(event.event)) {
      return "Each event item must include a supported event type";
    }
    if (event.timestamp && Number.isNaN(Date.parse(event.timestamp))) {
      return "Each event timestamp must be a valid ISO date";
    }
  }
  return null;
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
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown";

    const rateLimit = await checkRateLimit({
      prefix: "analytics",
      identifier: clientIp,
      maxRequests: RATE_LIMIT_MAX_REQUESTS,
      windowMs: RATE_LIMIT_WINDOW_MS,
    });
    if (rateLimit.limited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))
            ),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(rateLimit.resetAt),
          },
        }
      );
    }

    const body = await request.json();

    // Check if this is a batch request
    if ("events" in body && Array.isArray(body.events)) {
      const validationError = validateBatchPayload(
        body as AnalyticsBatchPayload
      );
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 });
      }
      return handleBatchAnalytics(
        body as AnalyticsBatchPayload,
        request,
        rateLimit
      );
    }

    const validationError = validateSinglePayload(body as AnalyticsPayload);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    return handleSingleAnalytics(body as AnalyticsPayload, request, rateLimit);
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
  request: NextRequest,
  rateLimit: { remaining: number; resetAt: number }
) {
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

  return NextResponse.json(
    {
      success: true,
      message: "Analytics event recorded",
      eventId: analyticsRecord.id,
      persisted: true,
    },
    {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt),
      },
    }
  );
}

async function handleBatchAnalytics(
  body: AnalyticsBatchPayload,
  request: NextRequest,
  rateLimit: { remaining: number; resetAt: number }
) {
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

  return NextResponse.json(
    {
      success: true,
      message: `${processedEvents.length} analytics events recorded`,
      batchId,
      eventCount: processedEvents.length,
      persisted: true,
    },
    {
      headers: {
        "X-RateLimit-Remaining": String(rateLimit.remaining),
        "X-RateLimit-Reset": String(rateLimit.resetAt),
      },
    }
  );
}
