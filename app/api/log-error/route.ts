import { NextRequest, NextResponse } from "next/server";
import {
  getFirebaseAdmin,
  isFirebaseAdminConfigured,
} from "@/lib/firebaseAdmin";

interface ErrorLog {
  message: string;
  digest?: string;
  url?: string;
  userAgent?: string;
  timestamp: string;
  stack?: string;
  componentStack?: string;
  extra?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as Partial<ErrorLog>;

    if (!body.message || !body.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: message, timestamp" },
        { status: 400 }
      );
    }

    const errorLog: ErrorLog & { serverTimestamp: string; ip: string | null } =
      {
        message: body.message,
        digest: body.digest,
        url: body.url,
        userAgent: body.userAgent,
        timestamp: body.timestamp,
        stack: body.stack,
        componentStack: body.componentStack,
        extra: body.extra,
        serverTimestamp: new Date().toISOString(),
        ip:
          request.headers.get("x-forwarded-for") ||
          request.headers.get("x-real-ip"),
      };

    if (process.env.NODE_ENV === "development") {
      console.error("[Client Error]", JSON.stringify(errorLog, null, 2));
    }

    if (!isFirebaseAdminConfigured()) {
      return NextResponse.json(
        {
          success: false,
          logged: false,
          persisted: false,
          error:
            "Error log storage is not configured. Set Firebase Admin credentials.",
        },
        {
          status: 503,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    const { db } = getFirebaseAdmin();
    const docRef = await db.collection("errorLogs").add(errorLog);

    return NextResponse.json(
      {
        success: true,
        logged: true,
        persisted: true,
        logId: docRef.id,
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Error logging failed:", error);
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
  }
}
