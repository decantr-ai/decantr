#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

loadOptionalEnvFiles();

const host = (process.env.POSTHOG_HOST?.trim() || (dryRun ? 'https://us.posthog.com' : requiredEnv('POSTHOG_HOST'))).replace(
  /\/+$/,
  '',
);
const projectId =
  process.env.POSTHOG_ENVIRONMENT_ID || process.env.POSTHOG_PROJECT_ID || (dryRun ? 'dry-run' : '');
const apiKey =
  process.env.POSTHOG_PERSONAL_API_KEY?.trim() ||
  (dryRun ? 'dry-run' : requiredEnv('POSTHOG_PERSONAL_API_KEY'));
const dashboardId = process.env.POSTHOG_DASHBOARD_ID || '1549290';

if (!projectId) {
  fail('Missing POSTHOG_ENVIRONMENT_ID. POSTHOG_PROJECT_ID is also accepted as an alias.');
}

if (projectId.startsWith('phc_')) {
  fail('POSTHOG_ENVIRONMENT_ID must be the numeric PostHog project/environment id, not the phc_ project API key.');
}

const dashboardUrl = `${host}/project/${encodeURIComponent(projectId)}/dashboard/${dashboardId}`;
const currentRows = await runHogQl(countsQuery(7, 0));
const previousRows = await runHogQl(countsQuery(14, 7));
const sourceRows = await runHogQl(sourceQuery(7, 0));
const failureRows = await runHogQl(failureQuery(7, 0));

const markdown = renderMarkdown({
  currentRows,
  dashboardUrl,
  failureRows,
  previousRows,
  sourceRows,
});

console.log(markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (process.env.TELEMETRY_WEEKLY_REPORT_WEBHOOK_URL) {
  await fetch(process.env.TELEMETRY_WEEKLY_REPORT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: markdown }),
  });
}

async function runHogQl(query) {
  if (dryRun) {
    return sampleRows(query);
  }

  const response = await fetch(`${host}/api/projects/${encodeURIComponent(projectId)}/query/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: {
        kind: 'HogQLQuery',
        query,
      },
    }),
  });

  const text = await response.text();
  const body = text ? parseJson(text) : {};

  if (!response.ok) {
    const message =
      typeof body === 'object' && body !== null ? JSON.stringify(body) : text.slice(0, 600);
    throw new Error(`PostHog query failed ${response.status} ${response.statusText}: ${message}`);
  }

  return Array.isArray(body.results) ? body.results : [];
}

function countsQuery(daysFrom, daysTo) {
  return `
    select
      event,
      count() as count
    from events
    where timestamp >= now() - interval ${daysFrom} day
      and timestamp < now() - interval ${daysTo} day
      and event in (${eventListSql()})
    group by event
    order by count desc
  `;
}

function sourceQuery(daysFrom, daysTo) {
  return `
    select
      properties.decantr_source as source,
      count() as count
    from events
    where timestamp >= now() - interval ${daysFrom} day
      and timestamp < now() - interval ${daysTo} day
      and event in (${eventListSql()})
    group by source
    order by count desc
  `;
}

function failureQuery(daysFrom, daysTo) {
  return `
    select
      event,
      count() as count
    from events
    where timestamp >= now() - interval ${daysFrom} day
      and timestamp < now() - interval ${daysTo} day
      and event in (${eventListSql()})
      and (properties.success = false or properties.valid = false)
    group by event
    order by count desc
  `;
}

function eventListSql() {
  return [
    'api_key.created',
    'audit.completed',
    'cli.command.completed',
    'content.publish.completed',
    'content.validation.completed',
    'critique.completed',
    'execution_pack.compiled',
    'execution_pack.selected',
    'org.created',
    'registry.item.resolved',
    'registry.sync.completed',
    'registry_web.api_key_page_viewed',
    'registry_web.billing_viewed',
    'registry_web.content_opened',
    'registry_web.identity_linked',
    'registry_web.organization_viewed',
    'registry_web.page_viewed',
    'registry_web.search_performed',
    'registry_web.signup_clicked',
    'user.signup.completed',
  ]
    .map((event) => `'${event}'`)
    .join(', ');
}

function renderMarkdown({ currentRows, dashboardUrl, failureRows, previousRows, sourceRows }) {
  const current = rowsToMap(currentRows);
  const previous = rowsToMap(previousRows);
  const eventNames = [...new Set([...current.keys(), ...previous.keys()])].sort();
  const totalCurrent = sumMap(current);
  const totalPrevious = sumMap(previous);
  const totalDelta = totalCurrent - totalPrevious;

  const lines = [
    '# Decantr Weekly Telemetry Snapshot',
    '',
    `Dashboard: ${dashboardUrl}`,
    '',
    `Total tracked events: ${formatNumber(totalCurrent)} (${formatDelta(totalDelta)} vs previous 7 days)`,
    '',
    '## Event Movement',
    '',
    '| Event | Last 7d | Previous 7d | Delta |',
    '| --- | ---: | ---: | ---: |',
  ];

  for (const event of eventNames) {
    const currentCount = current.get(event) ?? 0;
    const previousCount = previous.get(event) ?? 0;
    lines.push(
      `| \`${event}\` | ${formatNumber(currentCount)} | ${formatNumber(previousCount)} | ${formatDelta(currentCount - previousCount)} |`,
    );
  }

  lines.push('', '## Source Mix', '', '| Source | Last 7d |', '| --- | ---: |');
  for (const [source, count] of sourceRows) {
    lines.push(`| ${source || 'unknown'} | ${formatNumber(Number(count) || 0)} |`);
  }

  lines.push('', '## Failure Signals', '');
  if (failureRows.length === 0) {
    lines.push('No failure events were recorded in the last 7 days.');
  } else {
    lines.push('| Event | Count |', '| --- | ---: |');
    for (const [event, count] of failureRows) {
      lines.push(`| \`${event}\` | ${formatNumber(Number(count) || 0)} |`);
    }
  }

  lines.push(
    '',
    '## CEO Readout',
    '',
    `- Activation signals: ${formatNumber((current.get('user.signup.completed') ?? 0) + (current.get('api_key.created') ?? 0))}`,
    `- Registry discovery signals: ${formatNumber((current.get('registry_web.search_performed') ?? 0) + (current.get('registry_web.content_opened') ?? 0) + (current.get('registry.item.resolved') ?? 0))}`,
    `- Commercial-intent signals: ${formatNumber((current.get('registry_web.billing_viewed') ?? 0) + (current.get('registry_web.api_key_page_viewed') ?? 0) + (current.get('registry_web.organization_viewed') ?? 0) + (current.get('org.created') ?? 0))}`,
  );

  return lines.join('\n');
}

function rowsToMap(rows) {
  return new Map(rows.map(([key, value]) => [key, Number(value) || 0]));
}

function sumMap(map) {
  let total = 0;
  for (const value of map.values()) total += value;
  return total;
}

function sampleRows(query) {
  if (query.includes('properties.decantr_source')) {
    return [
      ['registry-web', 42],
      ['api', 25],
      ['cli', 7],
    ];
  }
  if (query.includes('properties.success = false')) {
    return [['registry.item.resolved', 1]];
  }
  if (query.includes('interval 14 day')) {
    return [
      ['registry.item.resolved', 18],
      ['execution_pack.compiled', 8],
      ['registry_web.page_viewed', 11],
    ];
  }
  return [
    ['registry.item.resolved', 25],
    ['execution_pack.compiled', 9],
    ['registry_web.page_viewed', 42],
    ['registry_web.content_opened', 10],
    ['api_key.created', 2],
  ];
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDelta(value) {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return '0';
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
  console.error('  POSTHOG_HOST=https://us.posthog.com \\');
  console.error('  POSTHOG_ENVIRONMENT_ID=<environment-id> \\');
  console.error('  POSTHOG_PERSONAL_API_KEY=<personal-api-key> \\');
  console.error('  node scripts/posthog-weekly-telemetry-report.mjs');
  process.exit(1);
}

function loadOptionalEnvFiles() {
  const explicitFile = readArgValue('--env-file');
  const candidates = [
    explicitFile,
    '.env.posthog.local',
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
