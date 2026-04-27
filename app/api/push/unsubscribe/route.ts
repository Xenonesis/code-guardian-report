import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface UnsubscribePayload {
  userId?: string;
  endpoint?: string;
  subscriptionId?: string;
  unsubscribeAll?: boolean;
}

export async function GET() {
  return NextResponse.json({
    status: "push unsubscription endpoint is working",
    configured: false,
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

    // Push unsubscription disabled - Firebase removed
    return NextResponse.json({
      success: false,
      configured: false,
      message: "Push unsubscription is not available",
    });
  } catch (error) {
    console.error("Push unsubscription error:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscription" },
      { status: 500 }
    );
  }
}
