// app/api/copilot/models/route.ts
// API route to fetch available GitHub Copilot models

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { error: "Authorization header required" },
        { status: 401 }
      );
    }

    // Try to fetch models from GitHub Copilot API
    const response = await fetch("https://api.githubcopilot.com/models", {
      headers: {
        Authorization: authHeader,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      // If models endpoint doesn't work, return empty list
      // The client will use fallback models
      return NextResponse.json({ data: [] }, { status: 200 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Copilot models API error:", error);
    // Return empty list on error, client will use fallback
    return NextResponse.json({ data: [] }, { status: 200 });
  }
}
