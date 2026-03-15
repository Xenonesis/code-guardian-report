/**
 * Tests for src/mcp/memory/database.ts
 *
 * Tests the InMemoryStore implementation (no Firestore dependency).
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryStore, createMemoryStore } from "../memory/database";

describe("InMemoryStore", () => {
  let store: InMemoryStore;

  beforeEach(() => {
    store = new InMemoryStore();
  });

  // ── save ────────────────────────────────────────────────────────

  describe("save", () => {
    it("saves an entry and returns it with id, createdAt, updatedAt", async () => {
      const entry = await store.save({
        sessionId: "sess1",
        type: "scan_result",
        summary: "Test scan",
        data: { foo: "bar" },
        tags: ["test"],
      });

      expect(entry.id).toBeTruthy();
      expect(entry.sessionId).toBe("sess1");
      expect(entry.type).toBe("scan_result");
      expect(entry.summary).toBe("Test scan");
      expect(entry.data).toEqual({ foo: "bar" });
      expect(entry.tags).toEqual(["test"]);
      expect(entry.createdAt).toBeInstanceOf(Date);
      expect(entry.updatedAt).toBeInstanceOf(Date);
    });

    it("generates unique IDs for each save", async () => {
      const e1 = await store.save({
        sessionId: "s",
        type: "note",
        summary: "a",
        data: {},
        tags: [],
      });
      const e2 = await store.save({
        sessionId: "s",
        type: "note",
        summary: "b",
        data: {},
        tags: [],
      });
      expect(e1.id).not.toBe(e2.id);
    });
  });

  // ── getById ─────────────────────────────────────────────────────

  describe("getById", () => {
    it("retrieves a saved entry by ID", async () => {
      const saved = await store.save({
        sessionId: "s",
        type: "patch",
        summary: "test",
        data: {},
        tags: ["a"],
      });
      const retrieved = await store.getById(saved.id);
      expect(retrieved).not.toBeNull();
      expect(retrieved!.id).toBe(saved.id);
      expect(retrieved!.summary).toBe("test");
    });

    it("returns null for non-existent ID", async () => {
      const result = await store.getById("nonexistent");
      expect(result).toBeNull();
    });
  });

  // ── deleteById ──────────────────────────────────────────────────

  describe("deleteById", () => {
    it("deletes an existing entry and returns true", async () => {
      const saved = await store.save({
        sessionId: "s",
        type: "note",
        summary: "delete me",
        data: {},
        tags: [],
      });
      const deleted = await store.deleteById(saved.id);
      expect(deleted).toBe(true);

      const retrieved = await store.getById(saved.id);
      expect(retrieved).toBeNull();
    });

    it("returns false for non-existent ID", async () => {
      const deleted = await store.deleteById("nope");
      expect(deleted).toBe(false);
    });
  });

  // ── query ───────────────────────────────────────────────────────

  describe("query", () => {
    beforeEach(async () => {
      await store.save({
        sessionId: "sess1",
        type: "scan_result",
        summary: "Scan of app.ts",
        data: {},
        tags: ["scan", "app.ts"],
      });
      await store.save({
        sessionId: "sess1",
        type: "patch",
        summary: "Patch for XSS",
        data: {},
        tags: ["patch", "xss"],
      });
      await store.save({
        sessionId: "sess2",
        type: "scan_result",
        summary: "Scan of index.ts",
        data: {},
        tags: ["scan", "index.ts"],
      });
    });

    it("returns all entries with empty query", async () => {
      const results = await store.query({});
      expect(results).toHaveLength(3);
    });

    it("filters by sessionId", async () => {
      const results = await store.query({ sessionId: "sess1" });
      expect(results).toHaveLength(2);
      expect(results.every((e) => e.sessionId === "sess1")).toBe(true);
    });

    it("filters by type", async () => {
      const results = await store.query({ type: "patch" });
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe("patch");
    });

    it("filters by tags (AND logic)", async () => {
      const results = await store.query({ tags: ["scan", "app.ts"] });
      expect(results).toHaveLength(1);
      expect(results[0].summary).toBe("Scan of app.ts");
    });

    it("filters by searchText (case-insensitive)", async () => {
      const results = await store.query({ searchText: "xss" });
      expect(results).toHaveLength(1);
      expect(results[0].summary).toContain("XSS");
    });

    it("respects limit", async () => {
      const results = await store.query({ limit: 2 });
      expect(results).toHaveLength(2);
    });

    it("defaults to limit 20", async () => {
      // Save 25 entries
      for (let i = 0; i < 25; i++) {
        await store.save({
          sessionId: "bulk",
          type: "note",
          summary: `Note ${i}`,
          data: {},
          tags: [],
        });
      }
      const results = await store.query({ sessionId: "bulk" });
      expect(results).toHaveLength(20);
    });

    it("returns results sorted by createdAt descending", async () => {
      const results = await store.query({});
      for (let i = 1; i < results.length; i++) {
        expect(results[i - 1].createdAt.getTime()).toBeGreaterThanOrEqual(
          results[i].createdAt.getTime()
        );
      }
    });
  });

  // ── deleteExpired ───────────────────────────────────────────────

  describe("deleteExpired", () => {
    it("deletes entries whose expiresAt is in the past", async () => {
      await store.save({
        sessionId: "s",
        type: "note",
        summary: "expired",
        data: {},
        tags: [],
        expiresAt: new Date(Date.now() - 10000), // 10 seconds ago
      });
      await store.save({
        sessionId: "s",
        type: "note",
        summary: "still valid",
        data: {},
        tags: [],
        expiresAt: new Date(Date.now() + 100000), // future
      });
      await store.save({
        sessionId: "s",
        type: "note",
        summary: "no expiry",
        data: {},
        tags: [],
      });

      const deleted = await store.deleteExpired();
      expect(deleted).toBe(1);

      const remaining = await store.query({});
      expect(remaining).toHaveLength(2);
      expect(remaining.some((e) => e.summary === "expired")).toBe(false);
    });

    it("returns 0 when nothing is expired", async () => {
      await store.save({
        sessionId: "s",
        type: "note",
        summary: "fresh",
        data: {},
        tags: [],
      });
      const deleted = await store.deleteExpired();
      expect(deleted).toBe(0);
    });
  });
});

// ── createMemoryStore factory ──────────────────────────────────────

describe("createMemoryStore", () => {
  it("returns InMemoryStore when no db is provided", () => {
    const store = createMemoryStore();
    expect(store).toBeInstanceOf(InMemoryStore);
  });
});
