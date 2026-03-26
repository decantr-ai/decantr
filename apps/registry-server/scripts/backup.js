#!/usr/bin/env node

/**
 * Manual backup helper — copies the SQLite database to a timestamped file.
 *
 * Usage: node scripts/backup.js [output-dir]
 */

import { copyFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../src/config.js';

const outputDir = process.argv[2] || './backups';
mkdirSync(outputDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const dest = join(outputDir, `registry-${timestamp}.db`);

try {
  copyFileSync(config.dbPath, dest);
  console.log(`Backup saved to ${dest}`);
} catch (err) {
  console.error(`Backup failed: ${err.message}`);
  process.exit(1);
}
