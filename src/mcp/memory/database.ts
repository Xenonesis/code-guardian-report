/**
 * MCP Memory Layer — In-memory adaptive memory
 *
 * Stores scan results, exploit simulations, patches, and session notes.
 */

import type { MemoryEntry, MemoryQuery } from "../shared/types.js";

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

// ── In-Memory Store ──────────────────────────────────────────────

export class InMemoryStore implements MemoryStore {
  private entries = new Map<string, MemoryEntry>();
  private counter = 0;

  async save(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry> {
    const now = new Date();
    const id = `mem_${++this.counter}_${Date.now()}`;
    const full: MemoryEntry = { ...entry, id, createdAt: now, updatedAt: now };
    this.entries.set(id, full);
    return full;
  }

  async query(q: MemoryQuery): Promise<MemoryEntry[]> {
    let results = Array.from(this.entries.values());

    if (q.sessionId)
      results = results.filter((e) => e.sessionId === q.sessionId);
    if (q.type) results = results.filter((e) => e.type === q.type);
    if (q.since) results = results.filter((e) => e.createdAt >= q.since!);
    if (q.tags && q.tags.length > 0) {
      results = results.filter((e) => q.tags!.every((t) => e.tags.includes(t)));
    }
    if (q.searchText) {
      const lower = q.searchText.toLowerCase();
      results = results.filter((e) => e.summary.toLowerCase().includes(lower));
    }

    results.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return results.slice(0, q.limit ?? 20);
  }

  async getById(id: string): Promise<MemoryEntry | null> {
    return this.entries.get(id) ?? null;
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

// ── Factory ─────────────────────────────────────────────────────────

export function createMemoryStore(): MemoryStore {
  return new InMemoryStore();
}
