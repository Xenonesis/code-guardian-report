/**
 * MCP Data Flow Tool
 *
 * Tool: analyze_data_flow
 * Wraps: DataFlowAnalyzer (Babel AST-based taint tracking)
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { DataFlowAnalyzer } from "@/services/analysis/DataFlowAnalyzer";
import type { MemoryStore } from "../memory/database.js";
import { AnalyzeDataFlowSchema } from "../shared/zod-schemas.js";
import { toTextContent, toErrorResult } from "../shared/utils.js";

export function registerDataFlowTools(
  server: McpServer,
  memory: MemoryStore
): void {
  server.registerTool(
    "analyze_data_flow",
    {
      title: "Analyze Data Flow",
      description:
        "Perform taint analysis on source code using Babel AST parsing. " +
        "Tracks data from user-controlled sources (req.body, req.query, etc.) " +
        "to dangerous sinks (SQL queries, eval, DOM writes). " +
        "Works with JavaScript/TypeScript files.",
      inputSchema: AnalyzeDataFlowSchema,
      annotations: { readOnlyHint: true },
    },
    async ({ code, filename }) => {
      try {
        const startMs = performance.now();
        const analyzer = new DataFlowAnalyzer();
        const issues = analyzer.analyzeDataFlow([{ filename, content: code }]);
        const elapsed = Math.round(performance.now() - startMs);

        await memory.save({
          sessionId: "default",
          type: "scan_result",
          summary: `Data flow analysis of ${filename}: ${issues.length} taint flow(s) in ${elapsed}ms`,
          data: { filename, issueCount: issues.length, elapsed },
          tags: ["data-flow", filename],
        });

        return {
          content: [
            toTextContent({
              filename,
              issueCount: issues.length,
              analysisTimeMs: elapsed,
              issues,
            }),
          ],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );
}
