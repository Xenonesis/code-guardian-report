import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { isValidGitHubUsername } from "@/utils/githubValidation";

export const dynamic = "force-dynamic";

function getBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  const match = authHeader?.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || null;
}

async function githubFetch(url: string, token: string | null) {
  return fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      "User-Agent": "CodeGuardian-Security-Scanner/15.0.0",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";
    const limiter = await checkRateLimit({
      prefix: "github-repos",
      identifier: clientIp,
      maxRequests: 30,
      windowMs: 60_000,
    });

    if (limiter.limited) {
      return NextResponse.json(
        { error: "Too many GitHub repository requests." },
        { status: 429 }
      );
    }

    const token = getBearerToken(request);
    const username = request.nextUrl.searchParams.get("username")?.trim();

    let url: string;
    if (token) {
      url =
        "https://api.github.com/user/repos?per_page=100&sort=updated&direction=desc&visibility=all&affiliation=owner,collaborator,organization_member";
    } else {
      if (!username || !isValidGitHubUsername(username)) {
        return NextResponse.json(
          {
            error:
              "A valid username is required when no GitHub access token is provided.",
          },
          { status: 400 }
        );
      }

      url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&direction=desc`;
    }

    const response = await githubFetch(url, token);
    const responseText = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: "Failed to fetch GitHub repositories",
          details: responseText || response.statusText,
          upstreamStatus: response.status,
        },
        { status: response.status === 403 ? 429 : response.status }
      );
    }

    return NextResponse.json(JSON.parse(responseText));
  } catch (error) {
    console.error("GitHub repositories proxy error:", error);
    return NextResponse.json(
      { error: "Failed to fetch GitHub repositories" },
      { status: 500 }
    );
  }
}
