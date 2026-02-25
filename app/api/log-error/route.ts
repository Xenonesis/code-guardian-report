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

// Simple deduplication cache: hash -> timestamp
const recentErrorHashes = new Map<string, number>();
const DEDUP_WINDOW_MS = 60_000; // 1 minute
const MAX_PAYLOAD_SIZE = 10_240; // 10KB

function computeErrorHash(message: string, stack?: string): string {
  const raw = `${message}|${(stack || "").slice(0, 200)}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return hash.toString(36);
}

export async function POST(request: NextRequest) {
  try {
    // Enforce payload size limit
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: "Payload too large. Maximum 10KB allowed." },
        { status: 413 }
      );
    }

    const body = (await request.json()) as Partial<ErrorLog>;

    if (!body.message || !body.timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: message, timestamp" },
        { status: 400 }
      );
    }

    // Deduplicate: skip if same error was logged recently
    const errorHash = computeErrorHash(body.message, body.stack);
    const now = Date.now();
    const lastSeen = recentErrorHashes.get(errorHash);
    if (lastSeen && now - lastSeen < DEDUP_WINDOW_MS) {
      return NextResponse.json(
        { success: true, logged: false, deduplicated: true },
        { status: 200, headers: { "Cache-Control": "no-store" } }
      );
    }
    recentErrorHashes.set(errorHash, now);

    // Cleanup old entries periodically
    if (recentErrorHashes.size > 500) {
      for (const [key, ts] of recentErrorHashes) {
        if (now - ts > DEDUP_WINDOW_MS) recentErrorHashes.delete(key);
      }
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
