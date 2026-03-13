import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { audit } from '../../tools/audit.js';

const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const RESET = '\x1b[0m';

const CHECK = `${GREEN}\u2713${RESET}`;
const CROSS = `${RED}\u2717${RESET}`;
const WARN = `${YELLOW}\u26A0${RESET}`;

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function sectionHeader(title) {
  return `  ${BOLD}${CYAN}${title}${RESET}`;
}

function printEssence(report) {
  console.log(sectionHeader('Essence'));
  if (!report.essence) {
    console.log(`    ${CROSS} No decantr.essence.json found`);
    return;
  }
  const e = report.essence;
  console.log(`    ${e.valid ? CHECK : CROSS} ${e.valid ? 'Valid' : 'Invalid'}`);
  if (e.terroir) console.log(`    ${DIM}terroir:${RESET} ${e.terroir}`);
  if (e.stagesCompleted != null || e.stagesSkipped != null) {
    const completed = e.stagesCompleted || 0;
    const skipped = e.stagesSkipped || 0;
    const total = completed + skipped;
    console.log(`    ${DIM}stages:${RESET} ${completed}/${total} completed${skipped > 0 ? ` ${YELLOW}(${skipped} skipped)${RESET}` : ''}`);
  }
  console.log();
}

function printCoverage(report) {
  console.log(sectionHeader('Coverage'));
  const c = report.coverage;
  if (!c) { console.log(`    ${DIM}No coverage data${RESET}\n`); return; }

  const pct = c.frameworkDerivedPct != null ? c.frameworkDerivedPct : 0;
  const pctColor = pct >= 80 ? GREEN : pct >= 50 ? YELLOW : RED;
  console.log(`    ${DIM}framework-derived:${RESET} ${pctColor}${pct}%${RESET}`);

  if (c.components) {
    const { used, total } = c.components;
    console.log(`    ${DIM}components:${RESET} ${used}/${total}`);
  }
  if (c.patterns) {
    const { used, total } = c.patterns;
    console.log(`    ${DIM}patterns:${RESET} ${used}/${total}`);
  }
  if (c.atomCalls != null) {
    console.log(`    ${DIM}atom calls:${RESET} ${c.atomCalls}`);
  }
  if (c.violations != null && c.violations > 0) {
    console.log(`    ${CROSS} ${RED}${c.violations} violation(s)${RESET}`);
  }
  console.log();
}

function printQuality(report) {
  console.log(sectionHeader('Quality'));
  const q = report.quality;
  if (!q) { console.log(`    ${DIM}No quality data${RESET}\n`); return; }

  const sections = [
    { key: 'hardcodedCSS', label: 'hardcoded CSS' },
    { key: 'missingAria', label: 'missing ARIA' },
    { key: 'leakedListeners', label: 'leaked listeners' }
  ];

  let clean = true;
  for (const { key, label } of sections) {
    const items = q[key];
    if (!Array.isArray(items) || items.length === 0) continue;
    clean = false;
    console.log(`    ${CROSS} ${RED}${items.length}${RESET} ${label}`);
    for (const item of items) {
      const loc = item.file ? `${DIM}${item.file}${item.line != null ? `:${item.line}` : ''}${RESET}` : '';
      const msg = item.message || item.detail || '';
      console.log(`      ${DIM}-${RESET} ${loc}${msg ? ` ${msg}` : ''}`);
    }
  }

  if (clean) {
    console.log(`    ${CHECK} No violations`);
  }
  console.log();
}

function printGaps(report) {
  console.log(sectionHeader('Gaps'));
  const g = report.gaps;
  if (!g) { console.log(`    ${DIM}No gap data${RESET}\n`); return; }

  let hasGaps = false;

  if (Array.isArray(g.unusedPatterns) && g.unusedPatterns.length > 0) {
    hasGaps = true;
    console.log(`    ${WARN} ${YELLOW}${g.unusedPatterns.length}${RESET} unused pattern(s): ${DIM}${g.unusedPatterns.join(', ')}${RESET}`);
  }
  if (Array.isArray(g.missingPages) && g.missingPages.length > 0) {
    hasGaps = true;
    console.log(`    ${WARN} ${YELLOW}${g.missingPages.length}${RESET} missing page(s): ${DIM}${g.missingPages.join(', ')}${RESET}`);
  }
  if (Array.isArray(g.unimplementedTannins) && g.unimplementedTannins.length > 0) {
    hasGaps = true;
    console.log(`    ${WARN} ${YELLOW}${g.unimplementedTannins.length}${RESET} unimplemented tannin(s): ${DIM}${g.unimplementedTannins.join(', ')}${RESET}`);
  }

  if (!hasGaps) {
    console.log(`    ${CHECK} No gaps detected`);
  }
  console.log();
}

function printBundle(report) {
  console.log(sectionHeader('Bundle'));
  const b = report.bundle;
  if (!b) { console.log(`    ${DIM}No bundle data (run decantr build first)${RESET}\n`); return; }

  const rows = [];
  for (const asset of ['js', 'css', 'html']) {
    const entry = b[asset];
    if (!entry) continue;
    rows.push({
      type: asset.toUpperCase(),
      raw: entry.raw != null ? formatSize(entry.raw) : '-',
      gzip: entry.gzip != null ? formatSize(entry.gzip) : '-',
      brotli: entry.brotli != null ? formatSize(entry.brotli) : '-'
    });
  }

  if (rows.length === 0) {
    console.log(`    ${DIM}No bundle data (run decantr build first)${RESET}\n`);
    return;
  }

  // Column widths
  const typeW = 6;
  const colW = 12;
  const header = `    ${''.padEnd(typeW)}${'Raw'.padStart(colW)}${'Gzip'.padStart(colW)}${'Brotli'.padStart(colW)}`;
  console.log(`${DIM}${header}${RESET}`);
  for (const row of rows) {
    console.log(`    ${BOLD}${row.type.padEnd(typeW)}${RESET}${row.raw.padStart(colW)}${row.gzip.padStart(colW)}${row.brotli.padStart(colW)}`);
  }

  if (b.total != null) {
    console.log(`${DIM}    ${'------'.padEnd(typeW)}${'--------'.padStart(colW)}${'--------'.padStart(colW)}${'--------'.padStart(colW)}${RESET}`);
    const total = b.total;
    console.log(`    ${BOLD}${'Total'.padEnd(typeW)}${RESET}${(total.raw != null ? formatSize(total.raw) : '-').padStart(colW)}${(total.gzip != null ? formatSize(total.gzip) : '-').padStart(colW)}${(total.brotli != null ? formatSize(total.brotli) : '-').padStart(colW)}`);
  }
  console.log();
}

export async function run() {
  const { values } = parseArgs({
    options: {
      json: { type: 'boolean', default: false },
      ci: { type: 'boolean', default: false }
    },
    strict: false
  });

  const cwd = process.cwd();
  console.log(`\n  ${BOLD}decantr audit${RESET}\n`);

  let report;
  try {
    report = await audit(cwd);
  } catch (err) {
    console.error(`  ${CROSS} Audit failed: ${err.message}`);
    process.exitCode = 1;
    return;
  }

  if (values.json) {
    console.log(JSON.stringify(report, null, 2));
    if (values.ci && hasViolations(report)) process.exitCode = 1;
    return;
  }

  printEssence(report);
  printCoverage(report);
  printQuality(report);
  printGaps(report);
  printBundle(report);

  // Summary line
  const violations = countViolations(report);
  if (violations === 0) {
    console.log(`  ${CHECK} ${GREEN}Audit passed${RESET}\n`);
  } else {
    console.log(`  ${CROSS} ${RED}${violations} violation(s) found${RESET}\n`);
  }

  if (values.ci && hasViolations(report)) {
    process.exitCode = 1;
  }
}

function countViolations(report) {
  let count = 0;
  const q = report.quality;
  if (!q) return 0;
  if (Array.isArray(q.hardcodedCSS)) count += q.hardcodedCSS.length;
  if (Array.isArray(q.missingAria)) count += q.missingAria.length;
  if (Array.isArray(q.leakedListeners)) count += q.leakedListeners.length;
  return count;
}

function hasViolations(report) {
  return countViolations(report) > 0;
}
