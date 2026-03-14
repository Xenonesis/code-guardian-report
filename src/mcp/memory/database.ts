/**
 * SESC-MCP Memory Database
 * SQLite-backed adaptive learning memory module.
 * Records every vulnerability-fix cycle so strategies can be refined over time.
 */

import Database from "better-sqlite3";
import { CREATE_TABLES_SQL, type MemoryRow } from "./schema.js";
import type { MemoryRecord, PatchStrategy } from "../shared/types.js";
import { generateId } from "../shared/utils.js";

export interface MemoryStats {
  totalRecords: number;
  successRate: number;
  rollbackRate: number;
  topStrategies: Array<{
    strategy: string;
    count: number;
    successRate: number;
  }>;
  byLanguage: Array<{ language: string; count: number }>;
  byCwe: Array<{ cwe: string; count: number }>;
}

export class MemoryDatabase {
  private db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.pragma("foreign_keys = ON");
    this.db.exec(CREATE_TABLES_SQL);
  }

  // ---------------------------------------------------------------------------
  // Write
  // ---------------------------------------------------------------------------

  /**
   * Records a completed vulnerability-fix cycle.
   */
  record(entry: {
    issueType: string;
    cwe?: string;
    language?: string;
    patchStrategy: PatchStrategy;
    validationSuccess: boolean;
    rolledBack: boolean;
    confidenceScore: number;
    metadata?: Record<string, unknown>;
  }): MemoryRecord {
    const id = generateId("mem");
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO memory_records
        (id, issue_type, cwe, language, patch_strategy,
         validation_success, rolled_back, confidence_score, created_at, metadata)
      VALUES
        (@id, @issue_type, @cwe, @language, @patch_strategy,
         @validation_success, @rolled_back, @confidence_score, @created_at, @metadata)
    `);

    stmt.run({
      id,
      issue_type: entry.issueType,
      cwe: entry.cwe ?? null,
      language: entry.language ?? null,
      patch_strategy: entry.patchStrategy,
      validation_success: entry.validationSuccess ? 1 : 0,
      rolled_back: entry.rolledBack ? 1 : 0,
      confidence_score: entry.confidenceScore,
      created_at: now,
      metadata: entry.metadata ? JSON.stringify(entry.metadata) : null,
    });

    return {
      id,
      issueType: entry.issueType,
      cwe: entry.cwe,
      language: entry.language,
      patchStrategy: entry.patchStrategy,
      validationSuccess: entry.validationSuccess,
      rolledBack: entry.rolledBack,
      confidenceScore: entry.confidenceScore,
      createdAt: now,
      metadata: entry.metadata,
    };
  }

  // ---------------------------------------------------------------------------
  // Query
  // ---------------------------------------------------------------------------

  /**
   * Searches memory records by optional filters.
   */
  query(filters: {
    issueType?: string;
    language?: string;
    cwe?: string;
    limit?: number;
  }): MemoryRecord[] {
    const conditions: string[] = [];
    const params: Record<string, string | number> = {};

    if (filters.issueType) {
      conditions.push("issue_type = @issue_type");
      params["issue_type"] = filters.issueType;
    }
    if (filters.language) {
      conditions.push("language = @language");
      params["language"] = filters.language;
    }
    if (filters.cwe) {
      conditions.push("cwe = @cwe");
      params["cwe"] = filters.cwe;
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = filters.limit ?? 10;

    const rows = this.db
      .prepare(
        `SELECT * FROM memory_records ${where} ORDER BY created_at DESC LIMIT ${limit}`
      )
      .all(params) as MemoryRow[];

    return rows.map(this.rowToRecord);
  }

  /**
   * Returns the best patch strategy for a given issue type based on past success.
   */
  getBestStrategy(issueType: string, language?: string): PatchStrategy | null {
    let row: MemoryRow | undefined;

    if (language) {
      row = this.db
        .prepare(
          `SELECT patch_strategy,
                  SUM(validation_success) * 1.0 / COUNT(*) as success_rate,
                  COUNT(*) as cnt
           FROM memory_records
           WHERE issue_type = ? AND language = ? AND rolled_back = 0
           GROUP BY patch_strategy
           ORDER BY success_rate DESC, cnt DESC
           LIMIT 1`
        )
        .get(issueType, language) as MemoryRow | undefined;
    }

    if (!row) {
      row = this.db
        .prepare(
          `SELECT patch_strategy,
                  SUM(validation_success) * 1.0 / COUNT(*) as success_rate,
                  COUNT(*) as cnt
           FROM memory_records
           WHERE issue_type = ? AND rolled_back = 0
           GROUP BY patch_strategy
           ORDER BY success_rate DESC, cnt DESC
           LIMIT 1`
        )
        .get(issueType) as MemoryRow | undefined;
    }

    return row ? (row.patch_strategy as PatchStrategy) : null;
  }

  // ---------------------------------------------------------------------------
  // Statistics
  // ---------------------------------------------------------------------------

  getStats(): MemoryStats {
    const totalRow = this.db
      .prepare("SELECT COUNT(*) as cnt FROM memory_records")
      .get() as { cnt: number };
    const total = totalRow.cnt;

    if (total === 0) {
      return {
        totalRecords: 0,
        successRate: 0,
        rollbackRate: 0,
        topStrategies: [],
        byLanguage: [],
        byCwe: [],
      };
    }

    const successRow = this.db
      .prepare(
        "SELECT AVG(CAST(validation_success AS REAL)) as rate FROM memory_records"
      )
      .get() as { rate: number };

    const rollbackRow = this.db
      .prepare(
        "SELECT AVG(CAST(rolled_back AS REAL)) as rate FROM memory_records"
      )
      .get() as { rate: number };

    const topStrategiesRows = this.db
      .prepare(
        `SELECT patch_strategy as strategy,
                COUNT(*) as count,
                AVG(CAST(validation_success AS REAL)) as successRate
         FROM memory_records
         GROUP BY patch_strategy
         ORDER BY count DESC
         LIMIT 5`
      )
      .all() as Array<{
      strategy: string;
      count: number;
      successRate: number;
    }>;

    const byLanguageRows = this.db
      .prepare(
        `SELECT language, COUNT(*) as count
         FROM memory_records
         WHERE language IS NOT NULL
         GROUP BY language
         ORDER BY count DESC
         LIMIT 10`
      )
      .all() as Array<{ language: string; count: number }>;

    const byCweRows = this.db
      .prepare(
        `SELECT cwe, COUNT(*) as count
         FROM memory_records
         WHERE cwe IS NOT NULL
         GROUP BY cwe
         ORDER BY count DESC
         LIMIT 10`
      )
      .all() as Array<{ cwe: string; count: number }>;

    return {
      totalRecords: total,
      successRate: Math.round(successRow.rate * 100) / 100,
      rollbackRate: Math.round(rollbackRow.rate * 100) / 100,
      topStrategies: topStrategiesRows,
      byLanguage: byLanguageRows,
      byCwe: byCweRows,
    };
  }

  getRecentRecords(limit = 20): MemoryRecord[] {
    const rows = this.db
      .prepare(`SELECT * FROM memory_records ORDER BY created_at DESC LIMIT ?`)
      .all(limit) as MemoryRow[];
    return rows.map(this.rowToRecord);
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private rowToRecord(row: MemoryRow): MemoryRecord {
    return {
      id: row.id,
      issueType: row.issue_type,
      cwe: row.cwe ?? undefined,
      language: row.language ?? undefined,
      patchStrategy: row.patch_strategy as PatchStrategy,
      validationSuccess: row.validation_success === 1,
      rolledBack: row.rolled_back === 1,
      confidenceScore: row.confidence_score,
      createdAt: row.created_at,
      metadata: row.metadata
        ? (JSON.parse(row.metadata) as Record<string, unknown>)
        : undefined,
    };
  }

  close(): void {
    this.db.close();
  }
}
