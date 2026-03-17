#!/usr/bin/env node

/**
 * verify-pack.js — Verify npm package contents before publishing.
 * Runs `npm pack --dry-run --json`, checks expected files are included,
 * sensitive files are excluded, and reports packed size.
 */

import { execSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

const green = (s) => `\x1b[32m✓\x1b[0m ${s}`;
const red = (s) => `\x1b[31m✗\x1b[0m ${s}`;
const yellow = (s) => `\x1b[33m⚠\x1b[0m ${s}`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;

let passes = 0;
let warns = 0;
let fails = 0;

function pass(msg) { passes++; console.log(green(msg)); }
function warn(msg) { warns++; console.log(yellow(msg)); }
function fail(msg) { fails++; console.log(red(msg)); }

// ── Expected file patterns ────────────────────────────────────────
const EXPECTED_DIRS = ['src/', 'cli/', 'tools/', 'types/', 'reference/'];
const EXPECTED_FILES = ['CLAUDE.md', 'AGENTS.md', 'CHANGELOG.md', 'README.md', 'LICENSE', 'package.json'];
const SENSITIVE_PATTERNS = ['.env', '.npmrc', 'credentials', '.secret', 'private-key', '.DS_Store', 'node_modules/'];

async function main() {
  console.log(`\n${bold('verify-pack')} ${dim('— checking npm package contents')}\n`);

  // Read package.json for metadata
  let pkg;
  try {
    const raw = await readFile(join(process.cwd(), 'package.json'), 'utf-8');
    pkg = JSON.parse(raw);
    pass(`Package: ${pkg.name}@${pkg.version}`);
  } catch (e) {
    fail('Cannot read package.json');
    process.exit(1);
  }

  // Run npm pack --dry-run
  let packOutput;
  try {
    packOutput = execSync('npm pack --dry-run --json 2>/dev/null', {
      encoding: 'utf-8',
      cwd: process.cwd(),
    });
  } catch (e) {
    // npm pack --json may not be supported in all versions, fallback
    try {
      packOutput = execSync('npm pack --dry-run 2>&1', {
        encoding: 'utf-8',
        cwd: process.cwd(),
      });
      // Parse line-based output
      const lines = packOutput.split('\n').filter(l => l.trim());
      console.log(`\n${bold('Files in package:')}`);
      for (const line of lines.slice(0, -1)) {
        console.log(`  ${line.trim()}`);
      }
      const lastLine = lines[lines.length - 1];
      console.log(`\n${dim(lastLine)}\n`);

      // Check for expected dirs in line output
      for (const dir of EXPECTED_DIRS) {
        if (lines.some(l => l.includes(dir))) {
          pass(`Includes ${dir}`);
        } else {
          fail(`Missing ${dir}`);
        }
      }

      // Check for expected files
      for (const file of EXPECTED_FILES) {
        if (lines.some(l => l.includes(file))) {
          pass(`Includes ${file}`);
        } else {
          if (file === 'LICENSE') {
            warn(`Missing ${file} — create before v1.0`);
          } else {
            fail(`Missing ${file}`);
          }
        }
      }

      // Check for sensitive files
      for (const pattern of SENSITIVE_PATTERNS) {
        if (lines.some(l => l.toLowerCase().includes(pattern.toLowerCase()))) {
          fail(`SENSITIVE FILE DETECTED: ${pattern}`);
        }
      }
      pass('No sensitive files detected');

      printSummary();
      return;
    } catch {
      fail('npm pack failed');
      process.exit(1);
    }
  }

  // Parse JSON output
  let packData;
  try {
    packData = JSON.parse(packOutput);
    if (Array.isArray(packData)) packData = packData[0];
  } catch {
    fail('Cannot parse npm pack output');
    process.exit(1);
  }

  const files = packData.files || [];
  const size = packData.size || 0;
  const unpackedSize = packData.unpackedSize || 0;

  console.log(`${bold('Package size:')} ${formatSize(size)} packed, ${formatSize(unpackedSize)} unpacked`);
  console.log(`${bold('File count:')} ${files.length}\n`);

  // Check expected directories are present
  for (const dir of EXPECTED_DIRS) {
    if (files.some(f => f.path?.startsWith(dir) || (typeof f === 'string' && f.startsWith(dir)))) {
      pass(`Includes ${dir}`);
    } else {
      fail(`Missing ${dir}`);
    }
  }

  // Check expected files
  for (const file of EXPECTED_FILES) {
    const found = files.some(f => {
      const path = f.path || f;
      return path === file || path.endsWith('/' + file);
    });
    if (found) {
      pass(`Includes ${file}`);
    } else {
      if (file === 'LICENSE') {
        warn(`Missing ${file} — create before v1.0`);
      } else {
        fail(`Missing ${file}`);
      }
    }
  }

  // Check for sensitive files
  let sensitiveFound = false;
  for (const pattern of SENSITIVE_PATTERNS) {
    for (const f of files) {
      const path = (f.path || f).toLowerCase();
      if (path.includes(pattern.toLowerCase())) {
        fail(`SENSITIVE FILE DETECTED: ${f.path || f}`);
        sensitiveFound = true;
      }
    }
  }
  if (!sensitiveFound) {
    pass('No sensitive files detected');
  }

  // Size checks
  if (unpackedSize > 5 * 1024 * 1024) {
    warn(`Unpacked size ${formatSize(unpackedSize)} exceeds 5 MB`);
  } else {
    pass(`Unpacked size ${formatSize(unpackedSize)} is under 5 MB`);
  }

  if (size > 1024 * 1024) {
    warn(`Packed size ${formatSize(size)} exceeds 1 MB`);
  } else {
    pass(`Packed size ${formatSize(size)} is under 1 MB`);
  }

  printSummary();
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function printSummary() {
  console.log(`\n${bold('Results:')} ${passes} passed${warns ? `, ${warns} warnings` : ''}${fails ? `, ${fails} failed` : ''}\n`);

  if (fails > 0) {
    console.log(red('Package verification failed. Fix issues before publishing.\n'));
    process.exit(1);
  } else if (warns > 0) {
    console.log(yellow('Package looks good with minor warnings.\n'));
  } else {
    console.log(green('Package is clean and ready to publish!\n'));
  }
}

main().catch(e => {
  console.error(red(`Unexpected error: ${e.message}`));
  process.exit(1);
});
