/**
 * SESC-MCP Memory Schema
 * SQLite table definitions for the adaptive learning memory module.
 */

export const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS memory_records (
    id          TEXT PRIMARY KEY,
    issue_type  TEXT NOT NULL,
    cwe         TEXT,
    language    TEXT,
    patch_strategy TEXT NOT NULL,
    validation_success INTEGER NOT NULL DEFAULT 0,
    rolled_back INTEGER NOT NULL DEFAULT 0,
    confidence_score REAL NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    metadata    TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_memory_issue_type  ON memory_records(issue_type);
  CREATE INDEX IF NOT EXISTS idx_memory_cwe         ON memory_records(cwe);
  CREATE INDEX IF NOT EXISTS idx_memory_language    ON memory_records(language);
  CREATE INDEX IF NOT EXISTS idx_memory_strategy    ON memory_records(patch_strategy);
  CREATE INDEX IF NOT EXISTS idx_memory_created_at  ON memory_records(created_at);
`;

export interface MemoryRow {
  id: string;
  issue_type: string;
  cwe: string | null;
  language: string | null;
  patch_strategy: string;
  validation_success: number;
  rolled_back: number;
  confidence_score: number;
  created_at: string;
  metadata: string | null;
}
