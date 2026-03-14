/**
 * SESC-MCP STDIO Transport
 *
 * Launches the SESC-MCP server over STDIO — the standard transport for
 * Claude Desktop, Cursor, VS Code (Copilot), and other local MCP clients.
 *
 * Usage:
 *   node dist/mcp/transports/stdio.js
 *   node dist/mcp/transports/stdio.js --db ./my-memory.db --confidence 0.75
 *
 * Environment variables (override CLI flags):
 *   SESC_DB_PATH           Path to SQLite database file
 *   SESC_CONFIDENCE        Minimum confidence threshold (0.0 – 1.0)
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createSescMcpServer } from "../server.js";

// ---------------------------------------------------------------------------
// Parse options
// ---------------------------------------------------------------------------

function parseArgs(): { dbPath?: string; confidence?: number } {
  const args = process.argv.slice(2);
  const opts: { dbPath?: string; confidence?: number } = {};

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--db" && args[i + 1]) {
      opts.dbPath = args[++i];
    } else if (args[i] === "--confidence" && args[i + 1]) {
      const val = parseFloat(args[++i]);
      if (!isNaN(val) && val >= 0 && val <= 1) opts.confidence = val;
    }
  }

  if (process.env.SESC_DB_PATH) opts.dbPath = process.env.SESC_DB_PATH;
  if (process.env.SESC_CONFIDENCE) {
    const val = parseFloat(process.env.SESC_CONFIDENCE);
    if (!isNaN(val) && val >= 0 && val <= 1) opts.confidence = val;
  }

  return opts;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  const opts = parseArgs();

  const { server } = createSescMcpServer({
    dbPath: opts.dbPath,
    confidenceThreshold: opts.confidence,
  });

  const transport = new StdioServerTransport();

  // Pipe stderr for diagnostics (stdout is reserved for MCP protocol)
  process.stderr.write(
    `[SESC-MCP] Starting STDIO transport (db=${opts.dbPath ?? "./sesc-memory.db"}, confidence=${opts.confidence ?? 0.7})\n`
  );

  await server.connect(transport);

  process.stderr.write(
    "[SESC-MCP] Server connected. Waiting for requests...\n"
  );
}

main().catch((err: unknown) => {
  process.stderr.write(`[SESC-MCP] Fatal error: ${String(err)}\n`);
  process.exit(1);
});
