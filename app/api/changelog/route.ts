import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 3600; // Cache for 1 hour

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  html_url: string;
  author: {
    login: string;
    avatar_url: string;
    html_url: string;
  } | null;
}

const GITHUB_API_BASE = "https://api.github.com";
const OWNER = "Xenonesis";
const REPO = "code-guardian-report";

async function fetchGitHubReleases(): Promise<GitHubRelease[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/releases?per_page=100`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.warn(
        `GitHub releases fetch failed with status ${response.status}`
      );
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch GitHub releases:", error);
    return [];
  }
}

async function fetchGitHubCommits(
  limit: number = 100
): Promise<GitHubCommit[]> {
  try {
    const response = await fetch(
      `${GITHUB_API_BASE}/repos/${OWNER}/${REPO}/commits?per_page=${limit}`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.warn(
        `GitHub commits fetch failed with status ${response.status}`
      );
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch GitHub commits:", error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get("type") || "all"; // 'releases', 'commits', 'all'
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  try {
    if (type === "releases" || type === "all") {
      const releases = await fetchGitHubReleases();
      if (type === "releases") {
        return NextResponse.json({
          success: true,
          source: releases.length > 0 ? "github" : "offline",
          data: releases,
          timestamp: new Date().toISOString(),
        });
      }
    }

    if (type === "commits" || type === "all") {
      const commits = await fetchGitHubCommits(limit);
      if (type === "commits") {
        return NextResponse.json({
          success: true,
          source: commits.length > 0 ? "github" : "offline",
          data: commits,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // type === 'all'
    const releases = await fetchGitHubReleases();
    const commits = await fetchGitHubCommits(limit);

    return NextResponse.json({
      success: true,
      source: releases.length > 0 && commits.length > 0 ? "github" : "offline",
      releases,
      commits,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Changelog API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch changelog data",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
