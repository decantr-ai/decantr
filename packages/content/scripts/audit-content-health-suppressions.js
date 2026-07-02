#!/usr/bin/env node

/**
 * Turns Content Health warning debt into an explicit baseline.
 *
 * `decantr content-health` intentionally reports many warning-level reference
 * issues without blocking unrelated content work. For the V2 release line, we
 * still want those warnings to be deliberate: every active warning must either
 * be fixed or appear in content-health-suppressions.json with a rationale.
 */

import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const reportPath = readArgValue('--report') || 'content-health-report.json';
const suppressionsPath = readArgValue('--suppressions') || 'content-health-suppressions.json';

function readArgValue(name) {
  const prefix = `${name}=`;
  return args.find(arg => arg.startsWith(prefix))?.slice(prefix.length) || null;
}

function loadJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

const report = loadJson(reportPath);
const baseline = loadJson(suppressionsPath);
const suppressions = new Map((baseline.suppressions || []).map(entry => [entry.id, entry]));
const activeFindings = Array.isArray(report.findings) ? report.findings : [];
const activeIds = new Set(activeFindings.map(finding => finding.id));
const findings = [];

for (const finding of activeFindings) {
  if (finding.severity === 'error') continue;
  if (!suppressions.has(finding.id)) {
    findings.push(`Unsuppressed Content Health warning: ${finding.id} (${finding.file || 'unknown file'})`);
    continue;
  }

  const suppression = suppressions.get(finding.id);
  if (typeof suppression.rationale !== 'string' || suppression.rationale.trim().length < 20) {
    findings.push(`Suppression ${finding.id} must include a rationale of at least 20 characters.`);
  }
}

for (const suppression of suppressions.values()) {
  if (!activeIds.has(suppression.id)) {
    findings.push(`Stale Content Health suppression: ${suppression.id}`);
  }
}

if (findings.length > 0) {
  console.error('Content Health suppression audit failed:');
  for (const finding of findings.slice(0, 50)) {
    console.error(`- ${finding}`);
  }
  if (findings.length > 50) {
    console.error(`- ... ${findings.length - 50} more`);
  }
  process.exit(1);
}

console.log(`Content Health suppression audit passed: ${activeFindings.length} finding(s), ${suppressions.size} intentional warning suppression(s).`);
