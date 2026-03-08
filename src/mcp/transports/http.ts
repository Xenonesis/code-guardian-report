/**
 * SESC-MCP Streamable HTTP Transport
 *
 * Launches the SESC-MCP server over Streamable HTTP — the MCP transport for
 * remote AI clients (ChatGPT, n8n, custom integrations, etc.).
 *
 * Implements the MCP Streamable HTTP specification:
 *   POST /mcp    — JSON-RPC requests / responses (stateless or stateful)
 *   GET  /mcp    — SSE event stream (server-initiated messages)
 *   DELETE /mcp  — close a session
 *   GET  /health — liveness probe
 *
 * Usage:
 *   node dist/mcp/transports/http.js
 *   node dist/mcp/transports/http.js --port 3001 --host 0.0.0.0 --stateless
 *
 * Environment variables:
 *   PORT                   HTTP port (default 3001)
 *   HOST                   Bind address (default 127.0.0.1)
 *   SESC_DB_PATH           SQLite database path
 *   SESC_CONFIDENCE        Confidence threshold
 *   SESC_STATELESS         Set to "true" for stateless mode (no session IDs)
 *   SESC_CORS_ORIGINS      Comma-separated allowed CORS origins (default *)
 */

import * as http from "node:http";
import * as crypto from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { createSescMcpServer } from "../server.js";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ServerOptions {
  port: number;
  host: string;
  dbPath?: string;
  confidence?: number;
  stateless: boolean;
  corsOrigins: string;
}

// ---------------------------------------------------------------------------
// Parse options
// ---------------------------------------------------------------------------

function parseArgs(): ServerOptions {
  const args = process.argv.slice(2);
  const opts: ServerOptions = {
    port: 3001,
    host: "127.0.0.1",
    stateless: false,
    corsOrigins: "*",
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case "--port":
        opts.port = parseInt(args[++i] ?? "3001", 10);
        break;
      case "--host":
        opts.host = args[++i] ?? "127.0.0.1";
        break;
      case "--db":
        opts.dbPath = args[++i];
        break;
      case "--confidence": {
        const v = parseFloat(args[++i] ?? "0.7");
        if (!isNaN(v)) opts.confidence = v;
        break;
      }
      case "--stateless":
        opts.stateless = true;
        break;
      case "--cors":
        opts.corsOrigins = args[++i] ?? "*";
        break;
    }
  }

  if (process.env.PORT) opts.port = parseInt(process.env.PORT, 10);
  if (process.env.HOST) opts.host = process.env.HOST;
  if (process.env.SESC_DB_PATH) opts.dbPath = process.env.SESC_DB_PATH;
  if (process.env.SESC_CONFIDENCE) {
    const v = parseFloat(process.env.SESC_CONFIDENCE);
    if (!isNaN(v)) opts.confidence = v;
  }
  if (process.env.SESC_STATELESS === "true") opts.stateless = true;
  if (process.env.SESC_CORS_ORIGINS)
    opts.corsOrigins = process.env.SESC_CORS_ORIGINS;

  return opts;
}

// ---------------------------------------------------------------------------
// CORS helper
// ---------------------------------------------------------------------------

function addCorsHeaders(res: http.ServerResponse, corsOrigins: string): void {
  res.setHeader("Access-Control-Allow-Origin", corsOrigins);
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, mcp-session-id"
  );
  res.setHeader("Access-Control-Expose-Headers", "mcp-session-id");
}

// ---------------------------------------------------------------------------
// Collect request body
// ---------------------------------------------------------------------------

async function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const opts = parseArgs();

  // Session storage for stateful mode
  const sessions = new Map<string, StreamableHTTPServerTransport>();

  const httpServer = http.createServer(async (req, res) => {
    // CORS pre-flight
    addCorsHeaders(res, opts.corsOrigins);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    // ── Health check ───────────────────────────────────────────────────────
    if (url.pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          status: "ok",
          server: "sesc-mcp",
          version: "1.0.0",
          mode: opts.stateless ? "stateless" : "stateful",
          uptime: process.uptime(),
        })
      );
      return;
    }

    // ── MCP endpoint ───────────────────────────────────────────────────────
    if (url.pathname !== "/mcp") {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found. Use POST /mcp" }));
      return;
    }

    try {
      if (opts.stateless) {
        // ── Stateless mode: new transport per request ──────────────────────
        if (req.method !== "POST") {
          res.writeHead(405, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({ error: "Stateless mode only accepts POST" })
          );
          return;
        }

        const body = await readBody(req);
        const parsedBody = JSON.parse(body) as unknown;

        const transport = new StreamableHTTPServerTransport({
          sessionIdGenerator: undefined, // stateless
        });
        const { server } = createSescMcpServer({
          dbPath: opts.dbPath,
          confidenceThreshold: opts.confidence,
        });
        await server.connect(transport);
        await transport.handleRequest(req, res, parsedBody);
      } else {
        // ── Stateful mode: session per client ─────────────────────────────
        const sessionId = req.headers["mcp-session-id"] as string | undefined;

        if (req.method === "DELETE") {
          if (sessionId && sessions.has(sessionId)) {
            await sessions.get(sessionId)!.close();
            sessions.delete(sessionId);
          }
          res.writeHead(204);
          res.end();
          return;
        }

        if (req.method === "GET") {
          // SSE stream for existing session
          if (!sessionId || !sessions.has(sessionId)) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(
              JSON.stringify({ error: "Missing or unknown mcp-session-id" })
            );
            return;
          }
          await sessions.get(sessionId)!.handleRequest(req, res);
          return;
        }

        if (req.method === "POST") {
          const body = await readBody(req);
          const parsedBody = JSON.parse(body) as unknown;

          let transport: StreamableHTTPServerTransport;

          if (sessionId && sessions.has(sessionId)) {
            // Existing session
            transport = sessions.get(sessionId)!;
          } else {
            // New session
            const newSessionId = crypto.randomUUID();
            transport = new StreamableHTTPServerTransport({
              sessionIdGenerator: () => newSessionId,
            });
            sessions.set(newSessionId, transport);

            const { server } = createSescMcpServer({
              dbPath: opts.dbPath,
              confidenceThreshold: opts.confidence,
            });
            await server.connect(transport);

            // Clean up session when transport closes
            transport.onclose = () => {
              sessions.delete(newSessionId);
            };
          }

          await transport.handleRequest(req, res, parsedBody);
          return;
        }

        res.writeHead(405, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Method not allowed" }));
      }
    } catch (err: unknown) {
      process.stderr.write(`[SESC-MCP] Request error: ${String(err)}\n`);
      if (!res.headersSent) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
  });

  httpServer.listen(opts.port, opts.host, () => {
    process.stderr.write(
      `[SESC-MCP] Streamable HTTP server listening on http://${opts.host}:${opts.port}/mcp\n` +
        `[SESC-MCP] Mode: ${opts.stateless ? "stateless" : "stateful"} | ` +
        `DB: ${opts.dbPath ?? "./sesc-memory.db"} | ` +
        `Confidence: ${opts.confidence ?? 0.7}\n` +
        `[SESC-MCP] Health check: http://${opts.host}:${opts.port}/health\n`
    );
  });

  // Graceful shutdown
  const shutdown = async (): Promise<void> => {
    process.stderr.write("[SESC-MCP] Shutting down...\n");
    for (const [id, transport] of sessions) {
      await transport.close();
      sessions.delete(id);
    }
    httpServer.close(() => process.exit(0));
  };
  process.on("SIGTERM", () => {
    void shutdown();
  });
  process.on("SIGINT", () => {
    void shutdown();
  });
}

main().catch((err: unknown) => {
  process.stderr.write(`[SESC-MCP] Fatal error: ${String(err)}\n`);
  process.exit(1);
});
