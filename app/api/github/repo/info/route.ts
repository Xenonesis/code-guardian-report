import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface RepoInfoPayload {
  owner?: string;
  repo?: string;
}

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function isValidRepoPart(value: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(value);
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const limiter = await checkRateLimit({
      prefix: "github-repo-info",
      identifier: clientIp,
      maxRequests: 60,
      windowMs: 60_000,
    });

    if (limiter.limited) {
      return NextResponse.json(
        { error: "Too many GitHub repository info requests." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as RepoInfoPayload;
    const owner = body.owner?.trim();
    const repo = body.repo?.trim();

    if (!owner || !repo || !isValidRepoPart(owner) || !isValidRepoPart(repo)) {
      return NextResponse.json(
        { error: "Valid owner and repo are required." },
        { status: 400 }
      );
    }

    const token = getBearerToken(request);
    const response = await fetch(
      `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "CodeGuardian-Security-Scanner/15.0.0",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const responseText = await response.text();
    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch repository",
          details: responseText || response.statusText,
          upstreamStatus: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("GitHub repository info proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch repository info" },
      { status: 500 }
    );
  }
}
