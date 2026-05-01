import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

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

    const event = await prisma.pWAAnalyticsEvent.create({
      data: {
        userId: body.userId || null,
        event: body.event,
        properties: (body.properties as Prisma.InputJsonValue) || undefined,
        sessionId: body.sessionId || null,
        userAgent: request.headers.get("user-agent") || "unknown",
      },
    });

    return NextResponse.json({
      success: true,
      message: "PWA analytics event recorded",
      eventId: event.id,
      persisted: true,
    });
  } catch (error) {
    console.error("PWA Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to process PWA analytics" },
      { status: 500 }
    );
  }
}
