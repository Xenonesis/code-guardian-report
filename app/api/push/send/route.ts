import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "push send endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log push notification data
    // TODO: Send push notification

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push send error:", error);
    return NextResponse.json(
      { error: "Failed to process push send request" },
      { status: 500 }
    );
  }
}
