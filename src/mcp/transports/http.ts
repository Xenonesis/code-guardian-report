/**
 * MCP Streamable HTTP Transport Entry Point
 *
 * Exposes the Code Guardian MCP server over HTTP for use with
 * ChatGPT, remote AI clients, and any HTTP-based MCP consumer.
 *
 * Usage:
 *   npx tsx src/mcp/transports/http.ts          # Development
 *   node dist/mcp/transports/http.js             # Production (after mcp:build)
 *
 * Environment variables:
 *   MCP_HTTP_PORT   — Port to listen on (default: 3100)
 *   MCP_HTTP_HOST   — Host to bind to (default: 127.0.0.1)
 */

import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from "node:http";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createMcpServer } from "../server.js";

const PORT = parseInt(process.env["MCP_HTTP_PORT"] ?? "3100", 10);
const HOST = process.env["MCP_HTTP_HOST"] ?? "127.0.0.1";
const MCP_PATH = "/mcp";

// ── Session management ──────────────────────────────────────────────

interface SessionEntry {
  transport: StreamableHTTPServerTransport;
  createdAt: number;
}

const sessions = new Map<string, SessionEntry>();

async function getOrCreateSession(): Promise<SessionEntry> {
  const sessionId = randomUUID();

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: () => sessionId,
  });

  const { server } = createMcpServer();
  await server.connect(transport);

  const entry: SessionEntry = { transport, createdAt: Date.now() };
  sessions.set(sessionId, entry);

  return entry;
}

function getSessionFromHeader(req: IncomingMessage): SessionEntry | undefined {
  const sid = req.headers["mcp-session-id"];
  if (typeof sid === "string" && sessions.has(sid)) {
    return sessions.get(sid);
  }
  return undefined;
}

// ── Request body helper ─────────────────────────────────────────────

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

// ── HTTP handler ────────────────────────────────────────────────────

async function handleRequest(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

  // Only serve the MCP endpoint
  if (url.pathname !== MCP_PATH) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  // Health check
  if (req.method === "GET" && !req.headers["mcp-session-id"]) {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        name: "code-guardian-mcp",
        status: "ok",
        sessions: sessions.size,
      })
    );
    return;
  }

  try {
    if (req.method === "POST") {
      const bodyStr = await readBody(req);
      const body = JSON.parse(bodyStr);

      // Try to find existing session or create a new one
      let session = getSessionFromHeader(req);
      if (!session) {
        session = await getOrCreateSession();
      }

      await session.transport.handleRequest(req, res, body);
    } else if (req.method === "GET") {
      // SSE stream for existing session
      const session = getSessionFromHeader(req);
      if (!session) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "Missing or invalid mcp-session-id header" })
        );
        return;
      }
      await session.transport.handleRequest(req, res);
    } else if (req.method === "DELETE") {
      // Terminate session
      const session = getSessionFromHeader(req);
      if (session) {
        await session.transport.handleRequest(req, res);
        const sid = req.headers["mcp-session-id"] as string;
        sessions.delete(sid);
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Session not found" }));
      }
    } else {
      res.writeHead(405, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Method not allowed" }));
    }
  } catch (err) {
    console.error("[MCP HTTP] Error handling request:", err);
    if (!res.headersSent) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: err instanceof Error ? err.message : "Internal server error",
        })
      );
    }
  }
}

// ── Start server ────────────────────────────────────────────────────

const httpServer = createServer(handleRequest);

httpServer.listen(PORT, HOST, () => {
  console.error(
    `[MCP HTTP] Code Guardian MCP server listening on http://${HOST}:${PORT}${MCP_PATH}`
  );
  console.error("[MCP HTTP] Ready for connections");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.error("\n[MCP HTTP] Shutting down...");
  httpServer.close(() => process.exit(0));
});

process.on("SIGTERM", () => {
  console.error("[MCP HTTP] Shutting down...");
  httpServer.close(() => process.exit(0));
});
