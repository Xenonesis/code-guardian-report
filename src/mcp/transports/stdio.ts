/**
 * MCP STDIO Transport Entry Point
 *
 * Connects the Code Guardian MCP server to stdin/stdout for use with
 * Claude Desktop, Cursor, VS Code Copilot, and other STDIO-based clients.
 *
 * Usage:
 *   npx tsx src/mcp/transports/stdio.ts        # Development
 *   node dist/mcp/transports/stdio.js           # Production (after mcp:build)
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createMcpServer } from "../server.js";

async function main(): Promise<void> {
  const { server } = createMcpServer();
  const transport = new StdioServerTransport();

  // Log to stderr (stdout is reserved for MCP JSON-RPC messages)
  console.error("[MCP] Code Guardian MCP server starting via STDIO...");

  await server.connect(transport);

  console.error("[MCP] Server connected and ready");
}

main().catch((err) => {
  console.error("[MCP] Fatal error:", err);
  process.exit(1);
});
