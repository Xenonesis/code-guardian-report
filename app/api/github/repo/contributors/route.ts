import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

function isValidRepoPart(value: string): boolean {
  return /^[a-zA-Z0-9._-]+$/.test(value);
}

function githubContributorsFetch(
  owner: string,
  repo: string,
  token: string | null
) {
  return fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=100`,
    {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "CodeGuardian-Security-Scanner/15.0.0",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const limiter = await checkRateLimit({
      prefix: "github-repo-contributors",
      identifier: clientIp,
      maxRequests: 30,
      windowMs: 60_000,
    });

    if (limiter.limited) {
      return NextResponse.json(
        { error: "Too many GitHub contributors requests." },
        { status: 429 }
      );
    }

    const body = (await request.json()) as { owner?: string; repo?: string };
    const owner = body.owner?.trim();
    const repo = body.repo?.trim();

    if (!owner || !repo || !isValidRepoPart(owner) || !isValidRepoPart(repo)) {
      return NextResponse.json(
        { error: "Valid owner and repo are required." },
        { status: 400 }
      );
    }

    const token = getBearerToken(request);
    let response = await githubContributorsFetch(owner, repo, token);
    let responseText = await response.text();

    // Fallback: retry anonymously if token fails
    if (!response.ok && token && [401, 403, 404].includes(response.status)) {
      const fallbackResponse = await githubContributorsFetch(owner, repo, null);
      if (fallbackResponse.ok) {
        response = fallbackResponse;
        responseText = await fallbackResponse.text();
      }
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch contributors",
          details: responseText || response.statusText,
          upstreamStatus: response.status,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("GitHub contributors proxy error:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch contributors",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
