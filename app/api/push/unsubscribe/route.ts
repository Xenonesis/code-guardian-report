import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "push unsubscription endpoint is working",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log unsubscription data
    console.log("Push unsubscription received:", body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Push unsubscription error:", error);
    return NextResponse.json(
      { error: "Failed to process unsubscription" },
      { status: 500 }
    );
  }
}
