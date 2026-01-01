import { NextRequest, NextResponse } from "next/server";

/**
 * Error Logging Endpoint
 * Receives client-side errors for server-side logging/monitoring
 */

interface ErrorLog {
  message: string;
  digest?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  stack?: string;
  componentStack?: string;
  extra?: Record<string, unknown>;
}

/**
 * POST /api/log-error
 * Logs client-side errors to the server
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<ErrorLog>;

    // Validate required fields
    if (!body.message || !body.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: message, timestamp" },
        { status: 400 }
      );
    }

    // Add server-side metadata
    const errorLog: ErrorLog & { serverTimestamp: string; ip: string | null } = {
      message: body.message,
      digest: body.digest,
      url: body.url,
      userAgent: body.userAgent,
      timestamp: body.timestamp,
      stack: body.stack,
      componentStack: body.componentStack,
      extra: body.extra,
      serverTimestamp: new Date().toISOString(),
      ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    };

    // Log to console (in production, send to logging service)
    console.error("[Client Error]", JSON.stringify(errorLog, null, 2));

    // In production, you could forward to:
    // - Sentry: Sentry.captureException(new Error(body.message))
    // - LogRocket: LogRocket.captureException(new Error(body.message))
    // - Datadog: datadogLogs.logger.error(body.message, errorLog)
    // - Custom logging service via HTTP
    // - Database for error analytics

    // Rate limiting could be implemented here
    // to prevent abuse of the logging endpoint

    return NextResponse.json(
      { success: true, logged: true },
      { 
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error logging failed:", error);
    return NextResponse.json(
      { error: "Failed to log error" },
      { status: 500 }
    );
  }
}
