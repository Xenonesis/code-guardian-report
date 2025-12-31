import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "push schedule endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log scheduled notification data
    console.log("Push notification schedule request received:", body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push schedule error:", error);
    return NextResponse.json(
      { error: "Failed to process push schedule request" },
      { status: 500 }
    );
  }
}
