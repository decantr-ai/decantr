/**
 * decantr a11y — Accessibility audit
 *
 * Static analysis for common WCAG violations in project source files.
 * Scans all .js files under src/ and reports errors, warnings, and info.
 */

import { readdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { auditFiles, formatIssues } from '../../tools/a11y-audit.js';
import { heading, success } from '../art.js';

export async function run() {
  const cwd = process.cwd();
  console.log(heading('Running accessibility audit...'));

  // Collect all .js files from src/
  const files = await collectJsFiles(join(cwd, 'src'));

  if (files.length === 0) {
    console.log('  No source files found in src/');
    return;
  }

  console.log(`  Scanning ${files.length} file(s)...\n`);

  const issues = await auditFiles(files);
  console.log(formatIssues(issues));

  const errors = issues.filter(i => i.severity === 'error');
  if (errors.length === 0) {
    console.log(`  ${success('Accessibility audit passed')}\n`);
  } else {
    process.exitCode = 1;
  }
}

/**
 * Recursively collect .js files from a directory.
 * Skips node_modules, dist, and hidden directories.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function collectJsFiles(dir) {
  const results = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name.startsWith('.')) continue;
        results.push(...await collectJsFiles(full));
      } else if (extname(entry.name) === '.js') {
        results.push(full);
      }
    }
  } catch {
    // Skip inaccessible directories
  }
  return results;
}
