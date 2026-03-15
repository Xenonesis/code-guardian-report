/**
 * Code Guardian MCP Server Factory
 *
 * Creates and configures the McpServer instance with all 19 tools,
 * resources, and prompts. This is the main entry point for both
 * STDIO and HTTP transports.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { DEFAULT_CONFIG } from "./shared/types.js";
import type { MemoryStore } from "./memory/database.js";
import { createMemoryStore } from "./memory/database.js";
import { registerResources } from "./resources/index.js";
import { registerPrompts } from "./prompts/index.js";
import { registerScannerTools } from "./tools/scanner.js";
import { registerDataFlowTools } from "./tools/data-flow.js";
import { registerMetricsTools } from "./tools/metrics.js";
import { registerExploitSimTools } from "./tools/exploit-sim.js";
import { registerPatchGenTools } from "./tools/patch-gen.js";
import { registerValidationTools } from "./tools/validation.js";
import { registerRiskOptimizerTools } from "./tools/risk-optimizer.js";
import { registerMemoryTools } from "./tools/memory.js";
import { registerPipelineTools } from "./tools/pipeline.js";

export interface CreateServerOptions {
  /** Firestore database instance (omit for in-memory fallback) */
  firestoreDb?: FirebaseFirestore.Firestore;
}

/**
 * Create a fully-configured Code Guardian MCP server.
 */
export function createMcpServer(options: CreateServerOptions = {}): {
  server: McpServer;
  memory: MemoryStore;
} {
  const server = new McpServer(
    {
      name: DEFAULT_CONFIG.name,
      version: DEFAULT_CONFIG.version,
    },
    {
      capabilities: {
        logging: {},
      },
      instructions: [
        "Code Guardian is an enterprise-grade security analysis platform.",
        "Use the available tools to scan code for vulnerabilities, simulate exploits,",
        "generate patches, validate fixes, and optimize remediation priority.",
        "",
        "Recommended workflow:",
        "1. Start with `full_security_pipeline` for comprehensive analysis",
        "2. Use `build_exploit_graph` to visualize attack chains",
        "3. Use `simulate_exploit` for critical findings",
        "4. Generate and validate patches with `generate_patch` + `validate_patch`",
        "5. Prioritize fixes with `optimize_patches`",
        "6. Use `query_memory` to reference prior results",
      ].join("\n"),
    }
  );

  // Create memory store
  const memory = createMemoryStore(options.firestoreDb);

  // Register all components
  registerResources(server);
  registerPrompts(server);

  // Register all 19 tools (grouped by agent domain)
  registerScannerTools(server, memory);
  registerDataFlowTools(server, memory);
  registerMetricsTools(server, memory);
  registerExploitSimTools(server, memory);
  registerPatchGenTools(server, memory);
  registerValidationTools(server, memory);
  registerRiskOptimizerTools(server, memory);
  registerMemoryTools(server, memory);
  registerPipelineTools(server, memory);

  return { server, memory };
}
