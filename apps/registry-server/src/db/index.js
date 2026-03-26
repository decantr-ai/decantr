/**
 * Database connection + migration runner.
 *
 * Uses better-sqlite3 for synchronous, single-file SQLite.
 * Migrations live in src/db/migrations/ and run in filename order.
 */

import Database from 'better-sqlite3';
import { readFileSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from '../config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

let db;

/**
 * Get or create the database connection.
 * @param {string} [dbPath] - Override path (use ':memory:' for tests)
 * @returns {Database.Database}
 */
export function getDb(dbPath) {
  if (db) return db;
  const path = dbPath || config.dbPath;

  // Ensure data directory exists for file-based DBs
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }

  db = new Database(path);

  // Performance pragmas
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  return db;
}

/**
 * Run all pending migrations in order.
 * Tracks applied migrations in a `_migrations` table.
 */
export function runMigrations(database) {
  const d = database || getDb();

  // Create migrations tracking table
  d.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      filename  TEXT    NOT NULL UNIQUE,
      applied   TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = new Set(
    d.prepare('SELECT filename FROM _migrations').all().map(r => r.filename)
  );

  const migrationsDir = join(__dirname, 'migrations');
  let files;
  try {
    files = readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();
  } catch {
    files = [];
  }

  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    d.exec(sql);
    d.prepare('INSERT INTO _migrations (filename) VALUES (?)').run(file);
  }
}

/**
 * Initialize database: run schema + migrations.
 */
export function initDb(dbPath) {
  const d = getDb(dbPath);
  const schema = readFileSync(join(__dirname, 'schema.sql'), 'utf-8');
  d.exec(schema);
  runMigrations(d);
  return d;
}

/**
 * Close the database connection.
 */
export function closeDb() {
  if (db) {
    db.close();
    db = null;
  }
}

/**
 * Reset module-level db reference (for tests).
 */
export function resetDb() {
  db = null;
}
