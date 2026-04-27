import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ScheduledNotificationPayload {
  title: string;
  body: string;
  scheduledTime: string; // ISO 8601 datetime
  userId: string;
  icon?: string;
  data?: Record<string, unknown>;
}

export async function GET() {
  return NextResponse.json({
    status: "push schedule endpoint is working",
    configured: false,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ScheduledNotificationPayload;

    // Validate required fields
    if (!body.title || !body.body || !body.scheduledTime || !body.userId) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: title, body, scheduledTime, and userId are required",
        },
        { status: 400 }
      );
    }

    // Validate scheduledTime is a valid future date
    const scheduledDate = new Date(body.scheduledTime);
    if (isNaN(scheduledDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid scheduledTime format. Use ISO 8601 format." },
        { status: 400 }
      );
    }

    if (scheduledDate <= new Date()) {
      return NextResponse.json(
        { error: "scheduledTime must be in the future" },
        { status: 400 }
      );
    }

    // Push scheduling disabled - Firebase removed
    return NextResponse.json({
      success: false,
      scheduled: false,
      error: "Push scheduling is not available",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Push schedule error:", error);
    return NextResponse.json(
      { error: "Failed to process push schedule request" },
      { status: 500 }
    );
  }
}
