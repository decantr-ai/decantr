#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();

const CHECKS = [
  {
    id: 'stale-2x-current-claim',
    pattern:
      /\b(?:current|stable|supported|default|graduated|live|active|package surface|reliability layer)[^\n]{0,90}\b2\.x\b|\b2\.x\b[^\n]{0,90}\b(?:line|surface|reliability layer|latest|stable|implementation|graduated|live|current|default)\b/i,
    message: 'Current docs should not describe Decantr as a 2.x line or surface.',
  },
  {
    id: 'capital-v2-v3-product-claim',
    pattern: /\bDecantr\s+V[23]\b|\bV[23]\s+(?:package|release|line|product|surface|implementation)\b/,
    message: 'Use Decantr 3 wording for current product docs; reserve V2/V3 wording for archived history.',
  },
  {
    id: 'mcp-2x-claim',
    pattern: /\bMCP[^\n]{0,100}\b2\.x\b|\b2\.x\b[^\n]{0,100}\bMCP\b/i,
    message: 'Current MCP docs should describe the Decantr 3 tool surface, not a 2.x MCP line.',
  },
  {
    id: 'old-mcp-primary-flow',
    pattern:
      /\b(?:first|start|begin|primary|preferred)[^\n]{0,100}\bdecantr_(?:create_essence|resolve_archetype|resolve_pattern|check_drift)\b/i,
    message:
      'Current MCP docs should lead with project state, task context, graph context, findings, repair plans, and evidence.',
  },
];

const HISTORICAL_RELEASE_ALLOWLIST = new Set([
  'docs/releases/2026-05-23-decantr-3-next-foundation.md',
  'docs/runbooks/decantr-3-prerelease.md',
]);

function toPosix(path) {
  return path.split('\\').join('/');
}

function readTextFiles(dir, predicate) {
  if (!existsSync(dir)) return [];
  const files = [];

  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) {
        walk(path);
        continue;
      }
      if (!entry.isFile()) continue;
      const rel = toPosix(relative(ROOT, path));
      if (predicate(rel)) {
        files.push(rel);
      }
    }
  };

  walk(dir);
  return files;
}

function packageReadmes() {
  const packagesDir = join(ROOT, 'packages');
  if (!existsSync(packagesDir)) return [];
  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => `packages/${entry.name}/README.md`)
    .filter((path) => existsSync(join(ROOT, path)));
}

const files = [
  'README.md',
  'CLAUDE.md',
  'DECANTR.md',
  'docs/css-scaffolding-guide.md',
  ...packageReadmes(),
  ...readTextFiles(join(ROOT, 'docs', 'guides'), (rel) => /\.(?:md|html)$/.test(rel)),
  ...readTextFiles(join(ROOT, 'docs', 'reference'), (rel) => /\.(?:md|html)$/.test(rel)),
  ...readTextFiles(join(ROOT, 'docs', 'runbooks'), (rel) => /\.md$/.test(rel)),
  ...readTextFiles(join(ROOT, 'docs', 'releases'), (rel) => {
    if (!/\.md$/.test(rel)) return false;
    const file = rel.slice(rel.lastIndexOf('/') + 1);
    return file.includes('decantr-3-') || file.includes('decantr-3-next');
  }),
].filter((path, index, all) => all.indexOf(path) === index && existsSync(join(ROOT, path)));

const failures = [];

for (const file of files) {
  if (HISTORICAL_RELEASE_ALLOWLIST.has(file)) continue;
  const absolute = join(ROOT, file);
  if (statSync(absolute).size > 1_500_000) continue;
  const lines = readFileSync(absolute, 'utf8').split(/\r?\n/);

  lines.forEach((line, index) => {
    for (const check of CHECKS) {
      if (!check.pattern.test(line)) continue;
      failures.push({
        file,
        line: index + 1,
        check: check.id,
        message: check.message,
        text: line.trim(),
      });
    }
  });
}

if (failures.length > 0) {
  console.error('Docs drift audit failed:\n');
  for (const failure of failures) {
    console.error(
      `- ${failure.file}:${failure.line} [${failure.check}] ${failure.message}\n  ${failure.text}`,
    );
  }
  process.exit(1);
}

console.log(`Docs drift audit passed: ${files.length} current docs/readmes checked.`);
