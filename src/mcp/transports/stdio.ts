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
import {
  isFirebaseAdminConfigured,
  getFirebaseAdmin,
} from "../../lib/firebaseAdmin.js";

async function main(): Promise<void> {
  // Optionally connect to Firestore for persistent memory
  let firestoreDb: FirebaseFirestore.Firestore | undefined;
  if (isFirebaseAdminConfigured()) {
    try {
      const { db } = getFirebaseAdmin();
      firestoreDb = db;
      console.error("[MCP] Firestore connected — memory will persist");
    } catch (err) {
      console.error(
        "[MCP] Firestore init failed, falling back to in-memory store:",
        err instanceof Error ? err.message : err
      );
    }
  } else {
    console.error(
      "[MCP] Firebase not configured — using in-memory store. " +
        "Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY for persistence."
    );
  }

  const { server } = createMcpServer({ firestoreDb });
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
