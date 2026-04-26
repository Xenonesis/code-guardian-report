import { NextRequest, NextResponse } from "next/server";
import {
  getFirebaseAdmin,
  isFirebaseAdminConfigured,
} from "@/lib/firebaseAdmin";

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
  const configured = isFirebaseAdminConfigured();
  return NextResponse.json({
    status: "push schedule endpoint is working",
    configured,
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

    // Check if Firebase Admin is configured
    if (!isFirebaseAdminConfigured()) {
      console.warn(
        "Push schedule: Firebase Admin not configured, notification not persisted"
      );
      return NextResponse.json(
        {
          success: false,
          configured: false,
          error:
            "Push scheduling storage is not configured. Set Firebase Admin credentials.",
        },
        { status: 503 }
      );
    }

    const { db } = getFirebaseAdmin();

    // Create scheduled notification record in Firestore
    const scheduledNotification = {
      title: body.title,
      body: body.body,
      scheduledTime: body.scheduledTime,
      scheduledTimestamp: scheduledDate.getTime(),
      userId: body.userId,
      icon: body.icon || "/icons/icon-192x192.png",
      data: body.data || {},
      status: "scheduled",
      createdAt: new Date().toISOString(),
    };

    // Store in Firestore - Cloud Functions will process scheduled notifications
    const docRef = await db
      .collection("scheduledNotifications")
      .add(scheduledNotification);

    return NextResponse.json({
      success: true,
      message: "Notification scheduled successfully",
      scheduledNotification: {
        id: docRef.id,
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
