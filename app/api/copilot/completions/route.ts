// app/api/copilot/completions/route.ts
// API route to proxy GitHub Copilot requests (solves CORS issues)

import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { PRODUCTION_CONFIG } from "@/config/security";
import { checkRateLimit } from "@/lib/rate-limit";

interface CopilotMessage {
  role: string;
  content: string;
}

interface CopilotCompletionsBody {
  stream?: boolean;
  messages: CopilotMessage[];
}

function isValidAuthHeader(header: string): boolean {
  // Bearer tokens used by GitHub services are URL-safe and dot-separated.
  return /^Bearer\s+[A-Za-z0-9._~-]+$/.test(header.trim());
}

function validateRequestBody(value: unknown): {
  valid: boolean;
  body?: CopilotCompletionsBody;
  message?: string;
} {
  if (!value || typeof value !== "object") {
    return { valid: false, message: "Request body must be a JSON object." };
  }

  const body = value as Partial<CopilotCompletionsBody>;
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return {
      valid: false,
      message: "Request body must include a non-empty messages array.",
    };
  }

  for (const msg of body.messages) {
    if (!msg || typeof msg !== "object") {
      return { valid: false, message: "Each message must be an object." };
    }
    if (typeof msg.role !== "string" || typeof msg.content !== "string") {
      return {
        valid: false,
        message: "Each message must include string role and content fields.",
      };
    }
    if (!msg.content.trim()) {
      return { valid: false, message: "Message content cannot be empty." };
    }
  }

  if (typeof body.stream !== "undefined" && typeof body.stream !== "boolean") {
    return { valid: false, message: "stream must be a boolean when provided." };
  }

  return {
    valid: true,
    body: {
      stream: body.stream,
      messages: body.messages,
    },
  };
}

function sanitizedUpstreamError(status: number) {
  return {
    error: {
      message: "Copilot upstream request failed",
      status,
    },
  };
}

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: { message: "Authorization header required" } },
        { status: 401 }
      );
    }

    if (!isValidAuthHeader(authHeader)) {
      console.warn("[Copilot Proxy] Invalid auth header format", { requestId });
      return NextResponse.json(
        { error: { message: "Invalid authorization header format" } },
        { status: 400 }
      );
    }

    const tokenFingerprint = createHash("sha256")
      .update(authHeader)
      .digest("hex")
      .slice(0, 24);

    const limiter = await checkRateLimit({
      prefix: "copilot",
      identifier: tokenFingerprint,
      maxRequests: 60,
      windowMs: 60_000,
    });

    if (limiter.limited) {
      return NextResponse.json(
        {
          error: {
            message: "Rate limit exceeded",
          },
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((limiter.resetAt - Date.now()) / 1000))
            ),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(limiter.resetAt),
          },
        }
      );
    }

    const parsedBody = validateRequestBody(await request.json());
    if (!parsedBody.valid || !parsedBody.body) {
      return NextResponse.json(
        { error: { message: parsedBody.message ?? "Invalid request body" } },
        { status: 400 }
      );
    }

    const body = parsedBody.body;

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      PRODUCTION_CONFIG.apiTimeout
    );

    // Forward the request to GitHub Copilot API
    let response: Response;
    try {
      response = await fetch("https://api.githubcopilot.com/chat/completions", {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          "Editor-Version": "vscode/1.85.0",
          "Editor-Plugin-Version": "copilot/1.150.0",
          "Openai-Organization": "github-copilot",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    // Handle streaming responses
    if (body.stream && response.ok && response.body) {
      // Return the stream directly
      return new NextResponse(response.body, {
        status: response.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    if (!response.ok) {
      return NextResponse.json(sanitizedUpstreamError(response.status), {
        status: response.status,
      });
    }

    // Handle non-streaming responses
    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return NextResponse.json(
        {
          error: {
            message: "Copilot upstream request timed out",
            status: 504,
          },
        },
        { status: 504 }
      );
    }

    console.error("Copilot API proxy error", {
      requestId,
      message: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        error: {
          message: "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
