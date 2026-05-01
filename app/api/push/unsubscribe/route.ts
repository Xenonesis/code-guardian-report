import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

interface UnsubscribePayload {
  userId?: string;
  endpoint?: string;
  subscriptionId?: string;
  unsubscribeAll?: boolean;
}

export async function GET() {
  const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
  const configured = !!(vapidPublicKey && vapidPrivateKey);

  return NextResponse.json({
    status: "push unsubscription endpoint is working",
    configured,
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as UnsubscribePayload;

    // Must provide either endpoint, subscriptionId, or unsubscribeAll with userId
    if (!body.endpoint && !body.subscriptionId && !body.unsubscribeAll) {
      return NextResponse.json(
        {
          error:
            "Must provide endpoint, subscriptionId, or set unsubscribeAll to true",
        },
        { status: 400 }
      );
    }

    if (body.unsubscribeAll && !body.userId) {
      return NextResponse.json(
        { error: "userId is required when unsubscribeAll is true" },
        { status: 400 }
      );
    }

    // Unsubscribe using Prisma
    if (body.subscriptionId) {
      await prisma.pushSubscription.delete({
        where: { id: body.subscriptionId },
      });
    } else if (body.endpoint) {
      await prisma.pushSubscription.delete({
        where: { endpoint: body.endpoint },
      });
    } else if (body.unsubscribeAll && body.userId) {
      await prisma.pushSubscription.deleteMany({
        where: { userId: body.userId },
      });
    }

    return NextResponse.json({
      success: true,
      configured: true,
      message: "Push subscription removed successfully",
    });
  } catch (error) {
    console.error("Push unsubscription error:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscription" },
      { status: 500 }
    );
  }
}
