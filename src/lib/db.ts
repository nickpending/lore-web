// Database connection for lore.db
// Only used at build time - not in browser

import type { Database as DatabaseInstance } from "better-sqlite3";
import { createRequire } from "node:module";
import { homedir } from "os";
import { join } from "path";
import type { LoreEntry, LoreSource } from "./types";

const require = createRequire(import.meta.url);
const Database: new (
  filename: string,
  options?: { readonly?: boolean },
) => DatabaseInstance = require("better-sqlite3");

const DB_PATH = join(homedir(), ".local", "share", "lore", "lore.db");

let db: DatabaseInstance | null = null;

function getDb(): DatabaseInstance {
  if (!db) {
    db = new Database(DB_PATH, { readonly: true });
  }
  return db;
}

// Query all entries for a given source
export function queryBySource(source: LoreSource): LoreEntry[] {
  const stmt = getDb().prepare(
    "SELECT source, title, content, metadata FROM search WHERE source = ?",
  );
  return stmt.all(source) as LoreEntry[];
}

// Query with FTS5 full-text search
export function searchEntries(query: string, source?: LoreSource): LoreEntry[] {
  const db = getDb();
  if (source) {
    const stmt = db.prepare(
      "SELECT source, title, content, metadata FROM search WHERE search MATCH ? AND source = ?",
    );
    return stmt.all(query, source) as LoreEntry[];
  }
  const stmt = db.prepare(
    "SELECT source, title, content, metadata FROM search WHERE search MATCH ?",
  );
  return stmt.all(query) as LoreEntry[];
}

// Get count by source
export function countBySource(source: LoreSource): number {
  const stmt = getDb().prepare(
    "SELECT COUNT(*) as count FROM search WHERE source = ?",
  );
  const result = stmt.get(source) as { count: number };
  return result.count;
}

// Get all counts
export function getAllCounts(): Record<LoreSource, number> {
  const stmt = getDb().prepare(
    "SELECT source, COUNT(*) as count FROM search GROUP BY source",
  );
  const rows = stmt.all() as { source: LoreSource; count: number }[];
  return rows.reduce(
    (acc, row) => {
      acc[row.source] = row.count;
      return acc;
    },
    {} as Record<LoreSource, number>,
  );
}

// Close database connection (call at end of build if needed)
export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
