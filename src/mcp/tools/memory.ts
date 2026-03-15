/**
 * MCP Memory Tool
 *
 * Tool: query_memory
 * Queries the Firestore/in-memory adaptive memory store.
 */

import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { MemoryStore } from "../memory/database.js";
import { QueryMemorySchema } from "../shared/zod-schemas.js";
import { toTextContent, toErrorResult } from "../shared/utils.js";

export function registerMemoryTools(
  server: McpServer,
  memory: MemoryStore
): void {
  server.registerTool(
    "query_memory",
    {
      title: "Query Memory",
      description:
        "Search the adaptive memory store for prior scan results, " +
        "exploit simulations, patches, and validations. " +
        "Filter by session, type, tags, or free-text search.",
      inputSchema: QueryMemorySchema,
      annotations: { readOnlyHint: true },
    },
    async ({ sessionId, type, tags, limit, searchText }) => {
      try {
        const entries = await memory.query({
          sessionId,
          type,
          tags,
          limit,
          searchText,
        });

        return {
          content: [
            toTextContent({
              totalResults: entries.length,
              entries: entries.map((e) => ({
                id: e.id,
                type: e.type,
                summary: e.summary,
                tags: e.tags,
                createdAt: e.createdAt.toISOString(),
                data: e.data,
              })),
            }),
          ],
        };
      } catch (err) {
        return toErrorResult(err);
      }
    }
  );
}
