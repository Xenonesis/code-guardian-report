import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";

export const dynamic = "force-dynamic";

const handlers = auth.handler();

/**
 * Wrap the auth handler so that /api/auth/get-session returns
 * a clean 200 with `{ user: null }` instead of a 404 when not logged in.
 */
async function wrappedHandler(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const path = (await context.params).path?.join("/");

  if (path === "get-session") {
    // Try the actual handler first
    const response = await handlers.GET(request, context);

    if (response.status === 404) {
      // No active session — return clean null response
      return NextResponse.json({ data: { user: null, session: null } });
    }

    return response;
  }

  return handlers.GET(request, context);
}

export const GET = wrappedHandler;
export const { POST } = handlers;
