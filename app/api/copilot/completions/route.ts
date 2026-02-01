// app/api/copilot/completions/route.ts
// API route to proxy GitHub Copilot requests (solves CORS issues)

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      stream?: boolean;
      messages?: Array<{ role: string; content: string }>;
    };
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    // Forward the request to GitHub Copilot API
    const response = await fetch(
      "https://api.githubcopilot.com/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: authHeader,
          "Content-Type": "application/json",
          "Editor-Version": "vscode/1.85.0",
          "Editor-Plugin-Version": "copilot/1.150.0",
          "Openai-Organization": "github-copilot",
        },
        body: JSON.stringify(body),
      }
    );

    // Handle streaming responses
    if (body.stream) {
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

    // Handle non-streaming responses
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || "API request failed" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Copilot API proxy error:", error);
    return NextResponse.json(
      {
        error: {
          message:
            error instanceof Error ? error.message : "Internal server error",
        },
      },
      { status: 500 }
    );
  }
}
