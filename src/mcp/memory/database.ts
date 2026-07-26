/**
 * MCP Memory Layer — Persistent & In-memory adaptive memory
 *
 * Stores scan results, exploit simulations, patches, and session notes.
 */

import type { MemoryEntry, MemoryQuery } from "../shared/types.js";
import { prisma } from "@/lib/prisma";

// ── Interface ───────────────────────────────────────────────────────

export interface MemoryStore {
  save(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry>;
  query(q: MemoryQuery): Promise<MemoryEntry[]>;
  getById(id: string): Promise<MemoryEntry | null>;
  deleteById(id: string): Promise<boolean>;
  deleteExpired(): Promise<number>;
}

// ── InMemoryStore ───────────────────────────────────────────────────

export class InMemoryStore implements MemoryStore {
  private entries = new Map<string, MemoryEntry>();
  private idCounter = 1;

  async save(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry> {
    const now = new Date();
    const full: MemoryEntry = {
      ...entry,
      id: `mem-${this.idCounter++}-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    this.entries.set(full.id, full);
    return full;
  }

  async query(q: MemoryQuery): Promise<MemoryEntry[]> {
    let results = Array.from(this.entries.values());

    if (q.sessionId) {
      results = results.filter((e) => e.sessionId === q.sessionId);
    }
    if (q.type) {
      results = results.filter((e) => e.type === q.type);
    }
    if (q.since) {
      results = results.filter((e) => e.createdAt >= q.since!);
    }
    if (q.tags && q.tags.length > 0) {
      results = results.filter((e) =>
        q.tags!.every((tag) => e.tags.includes(tag))
      );
    }
    if (q.searchText) {
      const lower = q.searchText.toLowerCase();
      results = results.filter(
        (e) =>
          e.summary.toLowerCase().includes(lower) ||
          JSON.stringify(e.data).toLowerCase().includes(lower)
      );
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (q.limit && q.limit > 0) {
      results = results.slice(0, q.limit);
    } else {
      results = results.slice(0, 20); // Default limit
    }

    return results;
  }

  async getById(id: string): Promise<MemoryEntry | null> {
    return this.entries.get(id) || null;
  }

  async deleteById(id: string): Promise<boolean> {
    return this.entries.delete(id);
  }

  async deleteExpired(): Promise<number> {
    const now = Date.now();
    let count = 0;
    for (const [id, entry] of this.entries) {
      if (entry.expiresAt && entry.expiresAt.getTime() <= now) {
        this.entries.delete(id);
        count++;
      }
    }
    return count;
  }
}

// ── PrismaMemoryStore ───────────────────────────────────────────────

export class PrismaMemoryStore implements MemoryStore {
  private fallbackStore = new InMemoryStore();
  private useFallback = false;

  async save(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry> {
    if (this.useFallback || !process.env.DATABASE_URL) {
      return this.fallbackStore.save(entry);
    }
    try {
      const record = await prisma.mcpMemoryEntry.create({
        data: {
          sessionId: entry.sessionId,
          type: entry.type,
          summary: entry.summary,
          data: entry.data as any,
          tags: entry.tags,
          expiresAt: entry.expiresAt || null,
        },
      });
      return this.toMemoryEntry(record);
    } catch (err) {
      console.warn(
        "PrismaMemoryStore save failed, switching to InMemoryStore fallback:",
        err
      );
      this.useFallback = true;
      return this.fallbackStore.save(entry);
    }
  }

  async query(q: MemoryQuery): Promise<MemoryEntry[]> {
    if (this.useFallback || !process.env.DATABASE_URL) {
      return this.fallbackStore.query(q);
    }
    try {
      const where: any = {};
      if (q.sessionId) where.sessionId = q.sessionId;
      if (q.type) where.type = q.type;
      if (q.since) where.createdAt = { gte: q.since };
      if (q.tags && q.tags.length > 0) {
        where.tags = { hasEvery: q.tags };
      }
      if (q.searchText) {
        where.summary = { contains: q.searchText, mode: "insensitive" };
      }

      const records = await prisma.mcpMemoryEntry.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: q.limit ?? 20,
      });

      return records.map((r: any) => this.toMemoryEntry(r));
    } catch (err) {
      console.warn(
        "PrismaMemoryStore query failed, switching to InMemoryStore fallback:",
        err
      );
      this.useFallback = true;
      return this.fallbackStore.query(q);
    }
  }

  async getById(id: string): Promise<MemoryEntry | null> {
    if (this.useFallback || !process.env.DATABASE_URL) {
      return this.fallbackStore.getById(id);
    }
    try {
      const record = await prisma.mcpMemoryEntry.findUnique({
        where: { id },
      });
      return record ? this.toMemoryEntry(record) : null;
    } catch (_err) {
      return this.fallbackStore.getById(id);
    }
  }

  async deleteById(id: string): Promise<boolean> {
    if (this.useFallback || !process.env.DATABASE_URL) {
      return this.fallbackStore.deleteById(id);
    }
    try {
      await prisma.mcpMemoryEntry.delete({
        where: { id },
      });
      return true;
    } catch (_err) {
      return this.fallbackStore.deleteById(id);
    }
  }

  async deleteExpired(): Promise<number> {
    if (this.useFallback || !process.env.DATABASE_URL) {
      return this.fallbackStore.deleteExpired();
    }
    try {
      const res = await prisma.mcpMemoryEntry.deleteMany({
        where: {
          expiresAt: {
            lte: new Date(),
          },
        },
      });
      return res.count;
    } catch (_err) {
      return this.fallbackStore.deleteExpired();
    }
  }

  private toMemoryEntry(record: any): MemoryEntry {
    return {
      id: record.id,
      sessionId: record.sessionId,
      type: record.type as MemoryEntry["type"],
      summary: record.summary,
      data: (record.data || {}) as Record<string, unknown>,
      tags: record.tags || [],
      createdAt: new Date(record.createdAt),
      updatedAt: new Date(record.updatedAt),
      expiresAt: record.expiresAt ? new Date(record.expiresAt) : undefined,
    };
  }
}

// ── Factory ─────────────────────────────────────────────────────────

export function createMemoryStore(): MemoryStore {
  if (process.env.DATABASE_URL && process.env.MCP_USE_IN_MEMORY !== "true") {
    return new PrismaMemoryStore();
  }
  return new InMemoryStore();
}
