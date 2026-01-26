import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "PWA analytics endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log PWA analytics data
    // TODO: Store PWA analytics in database

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PWA Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to process PWA analytics" },
      { status: 500 }
    );
  }
}
