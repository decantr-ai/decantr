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
const webhookUrl = process.env.TELEMETRY_HEALTH_WEBHOOK_URL?.trim() || '';
const webhookFormat = normalizeWebhookFormat(
  process.env.TELEMETRY_HEALTH_WEBHOOK_FORMAT?.trim() || detectWebhookFormat(webhookUrl),
);
const webhookAlways = process.env.TELEMETRY_HEALTH_WEBHOOK_ALWAYS === 'true';

if (!token) {
  fail('Missing DECANTR_TELEMETRY_SNAPSHOT_TOKEN. DECANTR_ADMIN_KEY is accepted as a fallback.');
}

const checks = [
  { days: 7, label: 'All actors, 7 days' },
  { days: 30, label: 'All actors, 30 days' },
  { actorType: 'customer', days: 30, label: 'Customer actors, 30 days' },
];

const results = dryRun
  ? sampleHealthResponses(checks)
  : await Promise.all(checks.map((check) => runHealthCheck(check)));
const unhealthyResults = results.filter((result) => result.status !== 'success');
const generatedAt = new Date().toISOString();
const markdown = renderMarkdown(results, { apiUrl, dryRun, generatedAt });

console.log(markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (webhookUrl && (unhealthyResults.length || webhookAlways)) {
  await postWebhook({ apiUrl, dryRun, generatedAt, markdown, results });
}

if (unhealthyResults.length) {
  process.exitCode = 1;
}

async function runHealthCheck(check) {
  try {
    const response = await fetch(healthUrl(check), {
      headers: {
        'X-Telemetry-Snapshot-Token': token,
      },
    });
    const text = await response.text();
    const body = text ? parseJson(text) : {};

    if (!response.ok) {
      const message = typeof body === 'object' && body !== null
        ? JSON.stringify(body)
        : text.slice(0, 600);
      throw new Error(`Telemetry health check failed ${response.status} ${response.statusText}: ${message}`);
    }

    return normalizeHealthResult(check, body);
  } catch (error) {
    return normalizeHealthResult(check, {
      detail: error instanceof Error ? error.message : String(error),
      label: 'Request failed',
      status: 'error',
    });
  }
}

function healthUrl(check) {
  const url = new URL(`${apiUrl}/admin/telemetry-snapshots/health`);
  url.searchParams.set('days', String(check.days));
  if (check.actorType) {
    url.searchParams.set('actor_type', check.actorType);
  }
  return url;
}

function normalizeHealthResult(check, body) {
  const status = normalizeStatus(body?.status);
  return {
    actor_type: readString(body?.actor_type) || check.actorType || 'all',
    attribution_snapshot: normalizeSnapshotMetric(body?.attribution_snapshot),
    check_label: check.label,
    detail: readString(body?.detail),
    generated_at: readString(body?.generated_at),
    label: readString(body?.label) || labelForStatus(status),
    latest_captured_at: readNullableString(body?.latest_captured_at),
    latest_snapshot_age_days: readNullableNumber(body?.latest_snapshot_age_days),
    range_days: readNumber(body?.range_days) || check.days,
    source: readString(body?.source) || 'all',
    status,
    usage_snapshot: normalizeSnapshotMetric(body?.usage_snapshot),
  };
}

function normalizeSnapshotMetric(value) {
  return {
    captured_at: readNullableString(value?.captured_at),
    rows: readNumber(value?.rows),
    snapshot_date: readNullableString(value?.snapshot_date),
    total_events: readNumber(value?.total_events),
  };
}

function normalizeStatus(value) {
  return value === 'success' || value === 'warning' || value === 'error' || value === 'info'
    ? value
    : 'error';
}

function labelForStatus(status) {
  if (status === 'success') return 'Fresh';
  if (status === 'warning') return 'Stale';
  if (status === 'info') return 'No stored snapshots';
  return 'Missed snapshot';
}

function renderMarkdown(results, { apiUrl, dryRun, generatedAt }) {
  const unhealthyResults = results.filter((result) => result.status !== 'success');
  const lines = [
    '# Telemetry Health Check',
    '',
    dryRun ? 'Mode: dry run' : `API: ${apiUrl}`,
    `Generated: ${generatedAt}`,
    `Overall: ${unhealthyResults.length ? 'unhealthy' : 'healthy'}`,
    '',
    '| Check | Status | Latest snapshot | Usage events | Attribution rows | Attribution events | Detail |',
    '| --- | --- | --- | ---: | ---: | ---: | --- |',
  ];

  for (const result of results) {
    lines.push(
      `| ${escapeCell(result.check_label)} | ${escapeCell(result.status)} (${escapeCell(result.label)}) | ${escapeCell(result.latest_captured_at ?? 'none')} | ${formatNumber(result.usage_snapshot.total_events)} | ${formatNumber(result.attribution_snapshot.rows)} | ${formatNumber(result.attribution_snapshot.total_events)} | ${escapeCell(result.detail || 'No detail provided.')} |`,
    );
  }

  if (unhealthyResults.length) {
    lines.push(
      '',
      '## Action Required',
      '',
      'At least one durable telemetry rollup is not fresh. Check the Telemetry Weekly Snapshot workflow, Fly API logs, PostHog query credentials, and Supabase snapshot tables.',
    );
  }

  return lines.join('\n');
}

async function postWebhook(context) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload(context)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Telemetry health webhook failed ${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  }
}

function webhookPayload(context) {
  if (webhookFormat === 'discord') {
    return discordWebhookPayload(context);
  }

  return { text: context.markdown };
}

function discordWebhookPayload({ apiUrl, dryRun, generatedAt, results }) {
  const unhealthyResults = results.filter((result) => result.status !== 'success');
  const overall = unhealthyResults.length ? 'unhealthy' : 'healthy';
  const fields = results.map((result) => ({
    name: result.check_label,
    value: discordCheckValue(result),
    inline: false,
  }));

  if (unhealthyResults.length) {
    fields.push({
      name: 'Action required',
      value: 'Inspect the Telemetry Weekly Snapshot workflow, Fly API logs, PostHog query credentials, and Supabase snapshot tables.',
      inline: false,
    });
  }

  return {
    username: 'Decantr Telemetry',
    content: `Decantr telemetry health is ${overall}.`,
    embeds: [
      {
        title: 'Telemetry Health Check',
        description: [
          `Overall: **${capitalize(overall)}**`,
          dryRun ? 'Mode: `dry run`' : `API: \`${apiUrl}\``,
          `Generated: \`${generatedAt}\``,
        ].join('\n'),
        color: discordStatusColor(results),
        fields,
        footer: {
          text: unhealthyResults.length
            ? 'Freshness alert: durable telemetry rollups need attention.'
            : 'Durable telemetry rollups are fresh.',
        },
        timestamp: generatedAt,
      },
    ],
  };
}

function discordCheckValue(result) {
  const lines = [
    `Status: **${result.status}** (${result.label})`,
    `Latest snapshot: \`${result.latest_captured_at ?? 'none'}\``,
    `Usage events: **${formatNumber(result.usage_snapshot.total_events)}**`,
    `Attribution: **${formatNumber(result.attribution_snapshot.rows)} rows / ${formatNumber(result.attribution_snapshot.total_events)} events**`,
  ];

  if (result.detail) {
    lines.push(`Detail: ${limitDiscordText(result.detail, 420)}`);
  }

  return limitDiscordText(lines.join('\n'), 1_024);
}

function discordStatusColor(results) {
  const worstStatus = results.reduce((worst, result) => (
    statusSeverity(result.status) > statusSeverity(worst) ? result.status : worst
  ), 'success');

  if (worstStatus === 'error') return 0xe5484d;
  if (worstStatus === 'warning') return 0xf5a524;
  if (worstStatus === 'info') return 0x2f80ed;
  return 0x2fb344;
}

function statusSeverity(status) {
  if (status === 'error') return 3;
  if (status === 'warning') return 2;
  if (status === 'info') return 1;
  return 0;
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function detectWebhookFormat(value) {
  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    if (hostname === 'discord.com' || hostname.endsWith('.discord.com')) return 'discord';
    if (hostname === 'discordapp.com' || hostname.endsWith('.discordapp.com')) return 'discord';
  } catch {
    return 'text';
  }

  return 'text';
}

function normalizeWebhookFormat(value) {
  return value === 'discord' ? 'discord' : 'text';
}

function limitDiscordText(value, maxLength) {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 75))}\n[Trimmed: open the GitHub Actions summary for full detail.]`;
}

function sampleHealthResponses(checks) {
  return checks.map((check, index) => normalizeHealthResult(check, {
    actor_type: check.actorType ?? 'all',
    attribution_snapshot: {
      captured_at: '2026-05-08T14:00:00.000Z',
      rows: index === 2 ? 3 : 6,
      snapshot_date: '2026-05-08',
      total_events: index === 2 ? 42 : 84,
    },
    detail: 'Latest stored telemetry snapshot was captured today.',
    generated_at: '2026-05-08T14:05:00.000Z',
    label: 'Fresh',
    latest_captured_at: '2026-05-08T14:00:00.000Z',
    latest_snapshot_age_days: 0.01,
    range_days: check.days,
    source: 'all',
    status: 'success',
    usage_snapshot: {
      captured_at: '2026-05-08T14:00:00.000Z',
      rows: 1,
      snapshot_date: '2026-05-08',
      total_events: index === 2 ? 42 : 84,
    },
  }));
}

function normalizeApiUrl(value) {
  return value.replace(/\/+$/, '');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function readString(value) {
  return typeof value === 'string' ? value : '';
}

function readNullableString(value) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readNullableNumber(value) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
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
  console.error('  node scripts/check-telemetry-health.mjs');
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
