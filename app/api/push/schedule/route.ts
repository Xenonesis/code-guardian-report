import { NextRequest, NextResponse } from "next/server";

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

    // Create scheduled notification record
    const scheduledNotification = {
      id: `scheduled-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: body.title,
      body: body.body,
      scheduledTime: body.scheduledTime,
      userId: body.userId,
      icon: body.icon || "/icons/icon-192x192.png",
      data: body.data || {},
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    // Note: In production, store in database and use a job scheduler
    // e.g., Firebase Cloud Functions scheduled triggers or a job queue

    return NextResponse.json({
      success: true,
      message: "Notification scheduled successfully",
      scheduledNotification: {
        id: scheduledNotification.id,
        scheduledTime: scheduledNotification.scheduledTime,
        status: scheduledNotification.status,
      },
    });
  } catch (error) {
    console.error("Push schedule error:", error);
    return NextResponse.json(
      { error: "Failed to process push schedule request" },
      { status: 500 }
    );
  }
}
