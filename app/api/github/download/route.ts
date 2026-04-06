import { NextRequest, NextResponse } from "next/server";
import { PRODUCTION_CONFIG } from "@/config/security";

/**
 * GitHub Repository Download Proxy with Caching
 *
 * This API route acts as a server-side proxy to download GitHub repositories.
 * It solves CORS issues when downloading repository archives directly from the browser.
 *
 * Features:
 * - Server-side caching for frequently accessed repositories
 * - Automatic cache invalidation based on TTL
 * - LRU eviction for memory management
 * - Rate limit optimization through caching
 *
 * Endpoints:
 * - API zipball: /repos/{owner}/{repo}/zipball/{branch}
 * - Archive URL: github.com/{owner}/{repo}/archive/refs/heads/{branch}.zip
 */

export const runtime = "nodejs"; // Ensure Node.js runtime for fetch capabilities
export const maxDuration = 60; // Max 60 seconds for large repositories

// In-memory cache for server-side (simple implementation)
// For production, consider Redis or other distributed cache
interface CacheEntry {
  data: Buffer;
  timestamp: number;
  etag?: string;
  size: number;
}

const serverCache = new Map<string, CacheEntry>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
const MAX_CACHE_ENTRIES = 50;

interface DownloadParams {
  owner: string;
  repo: string;
  branch: string;
  useArchive?: boolean; // If true, use public archive URL instead of API
  bypassCache?: boolean; // If true, skip cache and fetch fresh data
}

const GITHUB_DOWNLOAD_TIMEOUT_MS = Math.min(
  PRODUCTION_CONFIG.apiTimeout * 2,
  55_000
);

function safeFilenamePart(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]/g, "-").slice(0, 100);
}

/**
 * Generate cache key for repository
 */
function generateCacheKey(owner: string, repo: string, branch: string): string {
  return `${owner}/${repo}@${branch}`.toLowerCase();
}

/**
 * Get total cache size
 */
function getCacheSize(): number {
  let totalSize = 0;
  for (const entry of serverCache.values()) {
    totalSize += entry.size;
  }
  return totalSize;
}

/**
 * Evict least recently used cache entries
 */
function evictLRUEntries(neededSpace: number): void {
  const entries = Array.from(serverCache.entries()).sort(
    (a, b) => a[1].timestamp - b[1].timestamp
  );

  let freedSpace = 0;
  for (const [key, entry] of entries) {
    if (freedSpace >= neededSpace && serverCache.size < MAX_CACHE_ENTRIES) {
      break;
    }
    serverCache.delete(key);
    freedSpace += entry.size;
    console.log(`[Cache] Evicted ${key} (${formatBytes(entry.size)})`);
  }
}

/**
 * Clean up expired cache entries
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  let deletedCount = 0;

  for (const [key, entry] of serverCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL) {
      serverCache.delete(key);
      deletedCount++;
    }
  }

  if (deletedCount > 0) {
    console.log(`[Cache] Cleaned up ${deletedCount} expired entries`);
  }
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * POST /api/github/download
 * Downloads a GitHub repository as a zip file via server-side proxy
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.toLowerCase().includes("application/json")) {
      return NextResponse.json(
        { error: "Content-Type must be application/json" },
        { status: 415 }
      );
    }

    const body: DownloadParams = await request.json();
    const {
      owner,
      repo,
      branch,
      useArchive = false,
      bypassCache = false,
    } = body;

    // Generate cache key
    const cacheKey = generateCacheKey(owner, repo, branch);

    // Periodic cleanup of expired entries
    cleanupExpiredEntries();

    // Validate required parameters
    if (!owner || !repo || !branch) {
      return NextResponse.json(
        { error: "Missing required parameters: owner, repo, branch" },
        { status: 400 }
      );
    }

    // Security: Validate owner and repo names (GitHub restrictions)
    const validNamePattern = /^[a-zA-Z0-9._-]+$/;
    if (!validNamePattern.test(owner) || !validNamePattern.test(repo)) {
      return NextResponse.json(
        { error: "Invalid owner or repository name" },
        { status: 400 }
      );
    }

    // Validate branch name (allow slashes for branch names like 'feature/branch')
    const validBranchPattern = /^[a-zA-Z0-9._/-]+$/;
    if (!validBranchPattern.test(branch)) {
      return NextResponse.json(
        { error: "Invalid branch name" },
        { status: 400 }
      );
    }

    // Check cache first (unless bypass requested)
    if (!bypassCache && serverCache.has(cacheKey)) {
      const cached = serverCache.get(cacheKey)!;
      const age = Date.now() - cached.timestamp;

      // Check if cache is still valid
      if (age < CACHE_TTL) {
        console.log(
          `[Cache HIT] ${cacheKey} (age: ${Math.round(age / 1000 / 60)}min, size: ${formatBytes(cached.size)})`
        );

        // Convert Buffer to ArrayBuffer for NextResponse
        const arrayBuffer = cached.data.buffer.slice(
          cached.data.byteOffset,
          cached.data.byteOffset + cached.data.byteLength
        ) as ArrayBuffer;

        return new NextResponse(arrayBuffer, {
          status: 200,
          headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${owner}-${repo}-${branch}.zip"`,
            "Content-Length": cached.size.toString(),
            "X-Cache": "HIT",
            "X-Cache-Age": Math.round(age / 1000).toString(),
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      } else {
        // Remove expired entry
        serverCache.delete(cacheKey);
        console.log(`[Cache] Expired entry removed: ${cacheKey}`);
      }
    }

    console.log(`[Cache MISS] ${cacheKey} - Fetching from GitHub...`);

    // Construct the download URL
    let downloadUrl: string;
    const headers: HeadersInit = {
      "User-Agent": "CodeGuardian-Security-Scanner/11.0.0",
      Accept: "application/vnd.github+json",
    };

    if (useArchive) {
      // Use public archive URL (no authentication required for public repos)
      downloadUrl = `https://github.com/${owner}/${repo}/archive/refs/heads/${branch}.zip`;
    } else {
      // Use GitHub API zipball endpoint
      downloadUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;

      // Add GitHub token if available for higher rate limits
      const githubToken =
        process.env.GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN;
      if (githubToken) {
        headers["Authorization"] = `Bearer ${githubToken}`;
      }
    }

    console.log(`[GitHub Proxy] Downloading from: ${downloadUrl}`);

    // Fetch the repository archive from GitHub with timeout protection.
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      GITHUB_DOWNLOAD_TIMEOUT_MS
    );
    let response: Response;
    try {
      response = await fetch(downloadUrl, {
        headers,
        redirect: "follow",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error(
        `[GitHub Proxy] Download failed: ${response.status} ${response.statusText}`
      );

      // Handle specific error cases
      if (response.status === 404) {
        return NextResponse.json(
          {
            error: `Repository or branch not found. Please verify that ${owner}/${repo} exists and branch '${branch}' is correct.`,
            status: 404,
          },
          { status: 404 }
        );
      }

      if (response.status === 403) {
        const rateLimitRemaining = response.headers.get(
          "x-ratelimit-remaining"
        );
        if (rateLimitRemaining === "0") {
          return NextResponse.json(
            {
              error:
                "GitHub API rate limit exceeded. Please try again later or configure a GitHub token.",
              status: 403,
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          {
            error:
              "Access forbidden. The repository might be private or require authentication.",
            status: 403,
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        {
          error: "Failed to download repository from upstream source.",
          status: response.status,
        },
        { status: response.status }
      );
    }

    // Get the content as a blob
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();

    console.log(
      `[GitHub Proxy] Successfully downloaded ${arrayBuffer.byteLength} bytes`
    );

    // Store in cache if size is reasonable
    const dataSize = arrayBuffer.byteLength;
    if (dataSize <= MAX_CACHE_SIZE / 10) {
      // Don't cache if larger than 10% of max cache
      try {
        // Check if we need to evict entries
        const currentCacheSize = getCacheSize();
        if (
          currentCacheSize + dataSize > MAX_CACHE_SIZE ||
          serverCache.size >= MAX_CACHE_ENTRIES
        ) {
          evictLRUEntries(dataSize);
        }

        // Store in cache
        const etag = response.headers.get("etag") || undefined;
        serverCache.set(cacheKey, {
          data: Buffer.from(arrayBuffer),
          timestamp: Date.now(),
          etag,
          size: dataSize,
        });

        console.log(
          `[Cache] Stored ${cacheKey} (${formatBytes(dataSize)}, total cached: ${serverCache.size} repos, ${formatBytes(getCacheSize())})`
        );
      } catch (cacheError) {
        console.error("[Cache] Failed to cache repository:", cacheError);
        // Continue without caching
      }
    } else {
      console.log(
        `[Cache] Skipping cache for large repository (${formatBytes(dataSize)})`
      );
    }

    const fileOwner = safeFilenamePart(owner);
    const fileRepo = safeFilenamePart(repo);
    const fileBranch = safeFilenamePart(branch);

    // Return the zip file with appropriate headers
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileOwner}-${fileRepo}-${fileBranch}.zip"`,
        "Content-Length": arrayBuffer.byteLength.toString(),
        "X-Cache": "MISS",
        // CORS headers for client-side access
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    console.error("[GitHub Proxy] Error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: "Repository download timed out while contacting upstream.",
        },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error while downloading repository",
      },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/github/download
 * Handle CORS preflight requests
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400", // 24 hours
    },
  });
}
