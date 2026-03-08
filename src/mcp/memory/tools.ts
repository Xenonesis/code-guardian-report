/**
 * SESC-MCP Memory Tools
 * Registers the query_memory MCP tool.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { QueryMemoryInputSchema } from "../shared/zod-schemas.js";
import type { MemoryDatabase } from "./database.js";
import { toJsonString } from "../shared/utils.js";

export function registerMemoryTools(
  server: McpServer,
  db: MemoryDatabase
): void {
  server.registerTool(
    "query_memory",
    {
      description:
        "Search the adaptive learning memory for past vulnerability-fix records. " +
        "Returns historical patches, their success rates, and recommended strategies. " +
        "Use this before generating patches to leverage institutional knowledge.",
      inputSchema: QueryMemoryInputSchema.shape,
    },
    async ({ issueType, language, cwe, limit }) => {
      const records = db.query({ issueType, language, cwe, limit });
      const bestStrategy = issueType
        ? db.getBestStrategy(issueType, language)
        : null;

      const result = {
        totalFound: records.length,
        bestStrategy,
        records: records.map((r) => ({
          id: r.id,
          issueType: r.issueType,
          cwe: r.cwe,
          language: r.language,
          patchStrategy: r.patchStrategy,
          validationSuccess: r.validationSuccess,
          rolledBack: r.rolledBack,
          confidenceScore: r.confidenceScore,
          createdAt: r.createdAt,
        })),
      };

      return {
        content: [
          {
            type: "text" as const,
            text: toJsonString(result),
          },
        ],
      };
    }
  );
}
