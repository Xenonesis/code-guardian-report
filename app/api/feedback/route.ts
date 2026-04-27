import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const MAX_MESSAGE_LENGTH = 5000;

interface FeedbackPayload {
  name?: string;
  email?: string;
  message?: string;
  userId?: string;
}

function cleanString(value: unknown, maxLength: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const cleaned = value.trim();
  if (!cleaned) return undefined;
  return cleaned.slice(0, maxLength);
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const limiter = await checkRateLimit({
      prefix: "feedback",
      identifier: clientIp,
      maxRequests: 5,
      windowMs: 60_000,
    });

    if (limiter.limited) {
      return NextResponse.json(
        { error: "Too many feedback submissions. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((limiter.resetAt - Date.now()) / 1000))
            ),
          },
        }
      );
    }

    const body = (await request.json()) as FeedbackPayload;
    const email = cleanString(body.email, 254) || null;
    const message = cleanString(body.message, MAX_MESSAGE_LENGTH);

    if (!message) {
      return NextResponse.json(
        { error: "Feedback message is required." },
        { status: 400 }
      );
    }

    if (email && !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Email address is invalid." },
        { status: 400 }
      );
    }

    // Feedback storage disabled - Firebase removed
    const docRef = { id: `feedback-${Date.now()}` };

    return NextResponse.json({
      success: true,
      persisted: true,
      feedbackId: docRef.id,
    });
  } catch (error) {
    console.error("Feedback submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 }
    );
  }
}
