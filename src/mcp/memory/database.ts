/**
 * MCP Memory Layer — Firestore-backed adaptive memory
 *
 * Stores scan results, exploit simulations, patches, and session notes
 * in a dedicated `mcpMemory` Firestore collection. Falls back to an
 * in-memory Map when Firebase credentials are unavailable (e.g. local dev).
 */

import type { Firestore } from "firebase-admin/firestore";
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

// ── Firestore Implementation ────────────────────────────────────────

const COLLECTION = "mcpMemory";

export class FirestoreMemoryStore implements MemoryStore {
  constructor(private readonly db: Firestore) {}

  async save(
    entry: Omit<MemoryEntry, "id" | "createdAt" | "updatedAt">
  ): Promise<MemoryEntry> {
    const now = new Date();
    const docRef = this.db.collection(COLLECTION).doc();
    const full: MemoryEntry = {
      ...entry,
      id: docRef.id,
      createdAt: now,
      updatedAt: now,
    };
    await docRef.set({
      ...full,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      expiresAt: full.expiresAt?.toISOString() ?? null,
    });
    return full;
  }

  async query(q: MemoryQuery): Promise<MemoryEntry[]> {
    let ref = this.db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc") as FirebaseFirestore.Query;

    if (q.sessionId) ref = ref.where("sessionId", "==", q.sessionId);
    if (q.type) ref = ref.where("type", "==", q.type);
    if (q.since) ref = ref.where("createdAt", ">=", q.since.toISOString());

    const limit = q.limit ?? 20;
    ref = ref.limit(limit);

    const snap = await ref.get();
    let results: MemoryEntry[] = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        id: d.id,
        createdAt: new Date(data["createdAt"] as string),
        updatedAt: new Date(data["updatedAt"] as string),
        expiresAt: data["expiresAt"]
          ? new Date(data["expiresAt"] as string)
          : undefined,
      } as MemoryEntry;
    });

    // Client-side filters that Firestore can't handle in a single compound query
    if (q.tags && q.tags.length > 0) {
      results = results.filter((e) => q.tags!.every((t) => e.tags.includes(t)));
    }
    if (q.searchText) {
      const lower = q.searchText.toLowerCase();
      results = results.filter((e) => e.summary.toLowerCase().includes(lower));
    }

    return results;
  }

  async getById(id: string): Promise<MemoryEntry | null> {
    const doc = await this.db.collection(COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    const data = doc.data()!;
    return {
      ...data,
      id: doc.id,
      createdAt: new Date(data["createdAt"] as string),
      updatedAt: new Date(data["updatedAt"] as string),
      expiresAt: data["expiresAt"]
        ? new Date(data["expiresAt"] as string)
        : undefined,
    } as MemoryEntry;
  }

  async deleteById(id: string): Promise<boolean> {
    const doc = this.db.collection(COLLECTION).doc(id);
    const snap = await doc.get();
    if (!snap.exists) return false;
    await doc.delete();
    return true;
  }

  async deleteExpired(): Promise<number> {
    const now = new Date().toISOString();
    const snap = await this.db
      .collection(COLLECTION)
      .where("expiresAt", "<=", now)
      .where("expiresAt", "!=", null)
      .get();
    const batch = this.db.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    return snap.size;
  }
}

// ── In-Memory Fallback ──────────────────────────────────────────────

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

export function createMemoryStore(db?: Firestore): MemoryStore {
  if (db) {
    return new FirestoreMemoryStore(db);
  }
  console.warn(
    "[MCP Memory] No Firestore instance provided — using in-memory store. " +
      "Data will not persist across restarts."
  );
  return new InMemoryStore();
}
