/**
 * Tests for src/mcp/server.ts — createMcpServer factory
 *
 * Verifies that the server factory:
 * - Creates an McpServer instance
 * - Returns a memory store
 * - All tool/resource/prompt registrations succeed without errors
 */

import { describe, it, expect } from "vitest";
import { createMcpServer } from "../server";
import { InMemoryStore } from "../memory/database";

describe("createMcpServer", () => {
  it("returns a server and memory store", () => {
    const { server, memory } = createMcpServer();
    expect(server).toBeDefined();
    expect(memory).toBeDefined();
  });

  it("uses InMemoryStore when no firestoreDb is provided", () => {
    const { memory } = createMcpServer();
    expect(memory).toBeInstanceOf(InMemoryStore);
  });

  it("memory store is functional (can save and query)", async () => {
    const { memory } = createMcpServer();

    const saved = await memory.save({
      sessionId: "test",
      type: "note",
      summary: "Test note",
      data: { key: "value" },
      tags: ["test"],
    });

    expect(saved.id).toBeTruthy();

    const results = await memory.query({ sessionId: "test" });
    expect(results).toHaveLength(1);
    expect(results[0].summary).toBe("Test note");
  });

  it("creates multiple independent servers", () => {
    const s1 = createMcpServer();
    const s2 = createMcpServer();
    expect(s1.server).not.toBe(s2.server);
    expect(s1.memory).not.toBe(s2.memory);
  });
});
