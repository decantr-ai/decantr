#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

loadOptionalEnvFiles();

const apiUrl = normalizeApiUrl(
  process.env.DECANTR_API_URL?.trim() ||
    (dryRun ? 'https://api.decantr.ai/v1' : requiredEnv('DECANTR_API_URL')),
);
const token =
  process.env.DECANTR_TELEMETRY_SNAPSHOT_TOKEN?.trim() ||
  process.env.DECANTR_ADMIN_KEY?.trim() ||
  (dryRun ? 'dry-run' : '');

if (!token) {
  fail('Missing DECANTR_TELEMETRY_SNAPSHOT_TOKEN. DECANTR_ADMIN_KEY is accepted as a fallback.');
}

const response = dryRun ? sampleRollupResponse() : await persistRollups();
const markdown = renderMarkdown(response, { apiUrl, dryRun });

console.log(markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

async function persistRollups() {
  const response = await fetch(`${apiUrl}/admin/telemetry-snapshots/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Telemetry-Snapshot-Token': token,
    },
    body: '{}',
  });
  const text = await response.text();
  const body = text ? parseJson(text) : {};

  if (!response.ok) {
    const message = typeof body === 'object' && body !== null
      ? JSON.stringify(body)
      : text.slice(0, 600);
    throw new Error(`Telemetry rollup persistence failed ${response.status} ${response.statusText}: ${message}`);
  }

  return body;
}

function renderMarkdown(response, { apiUrl, dryRun }) {
  const generatedAt = readString(response?.generated_at) || new Date().toISOString();
  const snapshots = Array.isArray(response?.snapshots) ? response.snapshots : [];
  const attributionSnapshots = Array.isArray(response?.attribution_snapshots)
    ? response.attribution_snapshots
    : [];
  const totalEvents = snapshots.reduce((total, snapshot) => total + readNumber(snapshot.total_events), 0);
  const attributedEvents = attributionSnapshots.reduce(
    (total, snapshot) => total + readNumber(snapshot.total_events),
    0,
  );
  const attributionRows = attributionSnapshots.reduce(
    (total, snapshot) => total + readNumber(snapshot.rows),
    0,
  );

  const lines = [
    '# Durable Telemetry Rollups',
    '',
    dryRun ? 'Mode: dry run' : `API: ${apiUrl}`,
    `Generated: ${generatedAt}`,
    '',
    `Usage snapshots: ${formatNumber(snapshots.length)}`,
    `Usage events captured across persisted views: ${formatNumber(totalEvents)}`,
    `Attribution snapshots: ${formatNumber(attributionSnapshots.length)}`,
    `Attribution rows captured: ${formatNumber(attributionRows)}`,
    `Attribution events captured across persisted views: ${formatNumber(attributedEvents)}`,
    '',
    '## Usage Snapshots',
    '',
  ];

  if (snapshots.length) {
    lines.push('| Actor | Source | Range | Events | Customer | Internal | Failures | Active projects |');
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: |');
    for (const snapshot of snapshots) {
      lines.push(
        `| ${readString(snapshot.actor_type) || 'all'} | ${readString(snapshot.source) || 'all'} | ${formatNumber(readNumber(snapshot.range_days))}d | ${formatNumber(readNumber(snapshot.total_events))} | ${formatNumber(readNumber(snapshot.customer_events))} | ${formatNumber(readNumber(snapshot.internal_events))} | ${formatNumber(readNumber(snapshot.failure_events))} | ${formatNumber(readNumber(snapshot.active_projects))} |`,
      );
    }
  } else {
    lines.push('No usage snapshots were persisted.');
  }

  lines.push('', '## Attribution Snapshots', '');

  if (attributionSnapshots.length) {
    lines.push('| Actor | Source | Range | Events | Active orgs | Active projects | Rows |');
    lines.push('| --- | --- | ---: | ---: | ---: | ---: | ---: |');
    for (const snapshot of attributionSnapshots) {
      lines.push(
        `| ${readString(snapshot.actor_type) || 'all'} | ${readString(snapshot.source) || 'all'} | ${formatNumber(readNumber(snapshot.range_days))}d | ${formatNumber(readNumber(snapshot.total_events))} | ${formatNumber(readNumber(snapshot.active_orgs))} | ${formatNumber(readNumber(snapshot.active_projects))} | ${formatNumber(readNumber(snapshot.rows))} |`,
      );
    }
  } else {
    lines.push('No attribution snapshots were persisted.');
  }

  return lines.join('\n');
}

function sampleRollupResponse() {
  return {
    generated_at: '2026-05-06T00:00:00.000Z',
    snapshots: [
      {
        actor_type: 'all',
        active_projects: 7,
        customer_events: 18,
        failure_events: 1,
        internal_events: 4,
        range_days: 7,
        source: 'all',
        total_events: 31,
      },
      {
        actor_type: 'customer',
        active_projects: 4,
        customer_events: 42,
        failure_events: 0,
        internal_events: 0,
        range_days: 30,
        source: 'all',
        total_events: 42,
      },
    ],
    attribution_snapshots: [
      {
        actor_type: 'all',
        active_orgs: 3,
        active_projects: 7,
        range_days: 7,
        rows: 6,
        source: 'all',
        total_events: 31,
      },
      {
        actor_type: 'customer',
        active_orgs: 2,
        active_projects: 4,
        range_days: 30,
        rows: 4,
        source: 'all',
        total_events: 42,
      },
    ],
  };
}

function normalizeApiUrl(value) {
  return value.replace(/\/+$/, '');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function readString(value) {
  return typeof value === 'string' ? value : '';
}

function readNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function requiredEnv(key) {
  const value = process.env[key]?.trim();
  if (!value) fail(`Missing ${key}.`);
  return value;
}

function fail(message) {
  console.error(message);
  console.error('');
  console.error('Usage:');
  console.error('  DECANTR_API_URL=https://api.decantr.ai/v1 \\');
  console.error('  DECANTR_TELEMETRY_SNAPSHOT_TOKEN=<snapshot-token> \\');
  console.error('  node scripts/persist-telemetry-rollups.mjs');
  process.exit(1);
}

function loadOptionalEnvFiles() {
  const explicitFile = readArgValue('--env-file');
  const candidates = [
    explicitFile,
    '.env.telemetry.local',
    '.env.local',
    'apps/api/.env.local',
  ].filter(Boolean);

  for (const candidate of candidates) {
    const path = resolve(process.cwd(), candidate);
    if (existsSync(path)) {
      loadEnvFile(path);
    }
  }
}

function loadEnvFile(path) {
  const raw = readFileSync(path, 'utf8');
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;

    const [, key, rawValue] = match;
    if (process.env[key]) continue;

    process.env[key] = stripQuotes(rawValue.trim());
  }
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function readArgValue(name) {
  const argv = process.argv.slice(2);
  const index = argv.indexOf(name);
  if (index === -1) return null;
  return argv[index + 1] || null;
}

function parseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
