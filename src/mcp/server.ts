/**
 * SESC-MCP Server
 * Creates and configures the McpServer instance with all tools, resources,
 * and prompts registered. Transport-agnostic: transport is injected by
 * stdio.ts or http.ts launchers.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerScannerTools } from "./agents/scanner/tools.js";
import { registerExploitSimTools } from "./agents/exploit-sim/tools.js";
import { registerPatchGenTools } from "./agents/patch-gen/tools.js";
import { registerValidationTools } from "./agents/validation/tools.js";
import { registerRiskOptimizerTools } from "./agents/risk-optimizer/tools.js";
import { registerMemoryTools } from "./memory/tools.js";
import { registerOrchestratorTools } from "./orchestrator/tools.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";
import { MemoryDatabase } from "./memory/database.js";

export const SERVER_NAME = "sesc-mcp";
export const SERVER_VERSION = "1.0.0";

export interface SescMcpServerOptions {
  /** Path to the SQLite database file. Defaults to ./sesc-memory.db */
  dbPath?: string;
  /** Confidence threshold below which rollback is recommended. Defaults to 0.7 */
  confidenceThreshold?: number;
}

/**
 * Creates and fully-configured SESC-MCP server.
 * Call server.connect(transport) to start serving.
 */
export function createSescMcpServer(options: SescMcpServerOptions = {}): {
  server: McpServer;
  db: MemoryDatabase;
} {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const db = new MemoryDatabase(options.dbPath ?? "./sesc-memory.db");

  // Register all agents' tools
  registerScannerTools(server);
  registerExploitSimTools(server);
  registerPatchGenTools(server);
  registerValidationTools(server);
  registerRiskOptimizerTools(server);
  registerMemoryTools(server, db);
  registerOrchestratorTools(server, db, options.confidenceThreshold ?? 0.7);

  // Register resources and prompts
  registerResources(server, db);
  registerPrompts(server);

  return { server, db };
}
