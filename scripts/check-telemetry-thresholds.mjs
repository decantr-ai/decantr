#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const argv = process.argv.slice(2);
const args = new Set(argv);
const dryRun = args.has('--dry-run');
const sendWebhookTest = args.has('--send-webhook-test');

loadOptionalEnvFiles();

const apiUrl = normalizeApiUrl(
  process.env.DECANTR_API_URL?.trim() ||
    (dryRun ? 'https://api.decantr.ai/v1' : requiredEnv('DECANTR_API_URL')),
);
const token =
  process.env.DECANTR_TELEMETRY_SNAPSHOT_TOKEN?.trim() ||
  process.env.DECANTR_ADMIN_KEY?.trim() ||
  (dryRun ? 'dry-run' : '');
const webhookUrl =
  process.env.TELEMETRY_THRESHOLD_WEBHOOK_URL?.trim() ||
  process.env.TELEMETRY_HEALTH_WEBHOOK_URL?.trim() ||
  '';
const webhookFormat = normalizeWebhookFormat(
  process.env.TELEMETRY_THRESHOLD_WEBHOOK_FORMAT?.trim() || detectWebhookFormat(webhookUrl),
);
const webhookAlways = sendWebhookTest || process.env.TELEMETRY_THRESHOLD_WEBHOOK_ALWAYS === 'true';
const failureRateThreshold = readEnvNumber('TELEMETRY_FAILURE_RATE_ALERT_THRESHOLD', 0.05);
const candidateAliasThreshold = readEnvNumber('TELEMETRY_CANDIDATE_ALIAS_ALERT_THRESHOLD', 0);
const commercialIntentThreshold = readEnvNumber('TELEMETRY_COMMERCIAL_INTENT_ALERT_THRESHOLD', 5);
const generatedAt = new Date().toISOString();

if (!token) {
  fail('Missing DECANTR_TELEMETRY_SNAPSHOT_TOKEN. DECANTR_ADMIN_KEY is accepted as a fallback.');
}

const input = dryRun ? sampleThresholdInput() : await fetchThresholdInput();
const report = buildThresholdReport(input);
const markdown = renderMarkdown(report, { apiUrl, dryRun, generatedAt });

console.log(markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (webhookUrl && (report.alerts.length || webhookAlways)) {
  await postWebhook({ apiUrl, dryRun, generatedAt, markdown, report });
}

if (report.status === 'critical') {
  process.exitCode = 1;
}

async function fetchThresholdInput() {
  const [usageResponse, all7Health, all30Health, customer30Health] = await Promise.all([
    fetchJson('/admin/telemetry-snapshots/usage?limit=90'),
    fetchJson('/admin/telemetry-snapshots/health?days=7'),
    fetchJson('/admin/telemetry-snapshots/health?days=30'),
    fetchJson('/admin/telemetry-snapshots/health?actor_type=customer&days=30'),
  ]);

  return {
    healthResults: [all7Health, all30Health, customer30Health],
    usageSnapshots: readItems(usageResponse),
  };
}

async function fetchJson(path) {
  const response = await fetch(`${apiUrl}${path}`, {
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
    throw new Error(`Telemetry threshold request failed ${response.status} ${response.statusText}: ${message}`);
  }

  return body;
}

function buildThresholdReport(input) {
  const usageSnapshots = readArray(input.usageSnapshots);
  const all7 = latestUsageSnapshot(usageSnapshots, { actorType: 'all', days: 7, source: 'all' });
  const all30 = latestUsageSnapshot(usageSnapshots, { actorType: 'all', days: 30, source: 'all' });
  const customer30 = latestUsageSnapshot(usageSnapshots, { actorType: 'customer', days: 30, source: 'all' });
  const healthResults = readArray(input.healthResults).map(normalizeHealthResult);
  const eventTotals7 = readEventTotals(all7?.event_counts);
  const signalBuckets7 = readArray(all7?.signal_buckets).map(normalizeSignalBucket);
  const totalEvents7 = readNumber(all7?.total_events);
  const allEvents30 = readNumber(all30?.total_events);
  const customerEvents30 = readNumber(customer30?.total_events);
  const failureEvents7 = readNumber(all7?.failure_events);
  const failureRate7 = totalEvents7 > 0 ? failureEvents7 / totalEvents7 : 0;
  const candidateAliases = readNumber(all7?.candidate_aliases) || readNumber(customer30?.candidate_aliases);
  const cliActivationEvents = sumNamedEvents(eventTotals7, [
    'cli.command.completed',
    'decantr.new.completed',
    'decantr.init.completed',
    'decantr.refresh.completed',
    'decantr.check.completed',
    'health.report.generated',
    'studio.started',
  ]);
  const ciFailures7 = readEventCount(eventTotals7, 'health.ci.failed');
  const commercialIntent = signalBuckets7.find((bucket) => bucket.key === 'commercial_intent');
  const storedAlerts = uniqueAlerts([
    ...readArray(all7?.operating_alerts),
    ...readArray(all30?.operating_alerts),
    ...readArray(customer30?.operating_alerts),
  ]).map((alert) => ({
    ...alert,
    source: 'snapshot',
  }));
  const derivedAlerts = [];

  for (const health of healthResults) {
    if (health.status !== 'success') {
      derivedAlerts.push({
        detail: health.detail || `Latest snapshot: ${health.latest_captured_at ?? 'none'}.`,
        level: health.status === 'error' ? 'critical' : 'warning',
        source: 'health',
        title: `${health.label} for ${healthLabel(health)}`,
      });
    }
  }

  if (!all7) {
    derivedAlerts.push({
      detail: 'No all-actor 7-day durable usage snapshot was returned.',
      level: 'critical',
      source: 'usage',
      title: 'Missing 7-day usage snapshot',
    });
  } else if (totalEvents7 === 0) {
    derivedAlerts.push({
      detail: 'No Decantr telemetry events were recorded in the last 7-day usage snapshot.',
      level: 'critical',
      source: 'usage',
      title: 'No telemetry in the last 7 days',
    });
  }

  if (totalEvents7 > 0 && cliActivationEvents === 0) {
    derivedAlerts.push({
      detail: 'Telemetry exists, but no CLI activation, Project Health, or Studio events were recorded in the last 7 days.',
      level: 'warning',
      source: 'activation',
      title: 'No CLI activation events',
    });
  }

  if (allEvents30 > 0 && customerEvents30 === 0) {
    derivedAlerts.push({
      detail: 'Durable rollups have events, but none are currently customer-attributed over 30 days.',
      level: 'warning',
      source: 'attribution',
      title: 'No customer-attributed usage',
    });
  }

  if (failureRate7 >= failureRateThreshold && totalEvents7 > 0) {
    derivedAlerts.push({
      detail: `${formatNumber(failureEvents7)} failures represent ${formatPercent(failureRate7)} of last-7-day events.`,
      level: failureRate7 >= Math.max(0.1, failureRateThreshold * 2) ? 'critical' : 'warning',
      source: 'quality',
      title: 'Failure rate threshold crossed',
    });
  }

  if (candidateAliases > candidateAliasThreshold) {
    derivedAlerts.push({
      detail: `${formatNumber(candidateAliases)} active identities need classification review in /admin/telemetry/usage.`,
      level: 'info',
      source: 'identity',
      title: 'Unaliased identities need review',
    });
  }

  if (
    customerEvents30 > 0 &&
    readNestedNumber(customer30, ['previous_summary', 'total_events']) === 0
  ) {
    derivedAlerts.push({
      detail: `${formatNumber(customerEvents30)} customer-attributed events appeared with no previous-period baseline.`,
      level: 'info',
      source: 'growth',
      title: 'First customer usage detected',
    });
  }

  if (ciFailures7 > 0) {
    derivedAlerts.push({
      detail: `${formatNumber(ciFailures7)} Project Health CI failure events were recorded in the last 7 days.`,
      level: 'warning',
      source: 'project-health',
      title: 'Project Health CI failures detected',
    });
  }

  if (
    commercialIntent &&
    commercialIntent.current_events >= commercialIntentThreshold &&
    commercialIntent.delta > 0
  ) {
    derivedAlerts.push({
      detail: `${formatNumber(commercialIntent.current_events)} commercial-intent events are ${formatDelta(commercialIntent.delta)} versus the previous period.`,
      level: 'info',
      source: 'commercial',
      title: 'Commercial intent rising',
    });
  }

  const alerts = uniqueAlerts([...derivedAlerts, ...storedAlerts]);
  const status = alerts.some((alert) => alert.level === 'critical')
    ? 'critical'
    : alerts.some((alert) => alert.level === 'warning')
      ? 'warning'
      : 'healthy';

  return {
    alerts,
    healthResults,
    status,
    summary: {
      allEvents30,
      candidateAliases,
      cliActivationEvents,
      customerEvents30,
      failureEvents7,
      failureRate7,
      latestCapturedAt: latestTimestamp([all7, all30, customer30]),
      totalEvents7,
    },
  };
}

function renderMarkdown(report, { apiUrl, dryRun: isDryRun, generatedAt: timestamp }) {
  const lines = [
    '# Decantr Telemetry Threshold Alerts',
    '',
    isDryRun ? 'Mode: dry run' : `API: ${apiUrl}`,
    `Generated: ${timestamp}`,
    `Status: ${report.status}`,
    `Latest durable rollup: ${report.summary.latestCapturedAt ?? 'none'}`,
    '',
    '## Signal Summary',
    '',
    `- Last-7-day events: ${formatNumber(report.summary.totalEvents7)}`,
    `- Last-7-day CLI/Product Health activation events: ${formatNumber(report.summary.cliActivationEvents)}`,
    `- Last-7-day failure signals: ${formatNumber(report.summary.failureEvents7)} (${formatPercent(report.summary.failureRate7)})`,
    `- Last-30-day customer-attributed events: ${formatNumber(report.summary.customerEvents30)} of ${formatNumber(report.summary.allEvents30)} total`,
    `- Candidate aliases awaiting review: ${formatNumber(report.summary.candidateAliases)}`,
    '',
    '## Alerts',
    '',
  ];

  if (report.alerts.length) {
    lines.push('| Level | Source | Alert | Detail |');
    lines.push('| --- | --- | --- | --- |');
    for (const alert of report.alerts) {
      lines.push(
        `| ${escapeCell(alert.level)} | ${escapeCell(alert.source)} | ${escapeCell(alert.title)} | ${escapeCell(alert.detail)} |`,
      );
    }
  } else {
    lines.push('- No threshold alerts triggered.');
  }

  lines.push('', '## Snapshot Health', '');
  if (report.healthResults.length) {
    lines.push('| Check | Status | Latest | Detail |');
    lines.push('| --- | --- | --- | --- |');
    for (const health of report.healthResults) {
      lines.push(
        `| ${escapeCell(healthLabel(health))} | ${escapeCell(health.status)} | ${escapeCell(health.latest_captured_at ?? 'none')} | ${escapeCell(health.detail || '')} |`,
      );
    }
  } else {
    lines.push('No snapshot health checks were returned.');
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
    throw new Error(`Telemetry threshold webhook failed ${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  }
}

function webhookPayload(context) {
  if (webhookFormat === 'discord') {
    return discordWebhookPayload(context);
  }

  return { text: context.markdown };
}

function discordWebhookPayload({ apiUrl, dryRun: isDryRun, generatedAt: timestamp, report }) {
  const alerts = report.alerts.slice(0, 8);
  return {
    username: 'Decantr Telemetry',
    content: `Decantr telemetry thresholds are ${report.status}.`,
    embeds: [
      {
        title: 'Telemetry Threshold Alerts',
        description: [
          `Status: **${capitalize(report.status)}**`,
          isDryRun ? 'Mode: `dry run`' : `API: \`${apiUrl}\``,
          `Generated: \`${timestamp}\``,
          `Latest rollup: \`${report.summary.latestCapturedAt ?? 'none'}\``,
        ].join('\n'),
        color: statusColor(report.status),
        fields: [
          {
            name: 'Signal summary',
            value: [
              `Events 7d: **${formatNumber(report.summary.totalEvents7)}**`,
              `Activation 7d: **${formatNumber(report.summary.cliActivationEvents)}**`,
              `Failures 7d: **${formatNumber(report.summary.failureEvents7)}** (${formatPercent(report.summary.failureRate7)})`,
              `Customer 30d: **${formatNumber(report.summary.customerEvents30)} / ${formatNumber(report.summary.allEvents30)}**`,
              `Candidate aliases: **${formatNumber(report.summary.candidateAliases)}**`,
            ].join('\n'),
            inline: false,
          },
          {
            name: 'Alerts',
            value: alerts.length
              ? limitDiscordText(alerts.map((alert) =>
                `${alert.level.toUpperCase()} [${alert.source}]: ${alert.title}\n${alert.detail}`
              ).join('\n\n'), 1_024)
              : 'No threshold alerts triggered.',
            inline: false,
          },
          {
            name: 'Snapshot health',
            value: report.healthResults.length
              ? report.healthResults.map((health) =>
                `${healthLabel(health)}: **${health.status}**`
              ).join('\n')
              : 'No snapshot health checks returned.',
            inline: false,
          },
        ],
        footer: {
          text: 'Critical threshold alerts fail the workflow; warning/info alerts notify only.',
        },
        timestamp,
      },
    ],
  };
}

function latestUsageSnapshot(items, filters) {
  return items
    .filter((item) =>
      readString(item?.actor_type) === filters.actorType &&
      readNumber(item?.range_days) === filters.days &&
      readString(item?.source) === filters.source
    )
    .sort(compareCapturedDesc)[0] ?? null;
}

function compareCapturedDesc(a, b) {
  return parseDate(b?.captured_at || b?.created_at) - parseDate(a?.captured_at || a?.created_at);
}

function readEventTotals(value) {
  const totals = new Map();
  for (const row of readArray(value)) {
    const event = Array.isArray(row) ? readString(row[0]) : readString(row?.event);
    const count = Array.isArray(row) ? readNumber(row[1]) : readNumber(row?.count);
    if (!event) continue;
    totals.set(event, (totals.get(event) ?? 0) + count);
  }
  return totals;
}

function sumNamedEvents(totals, events) {
  return events.reduce((total, event) => total + readEventCount(totals, event), 0);
}

function readEventCount(totals, event) {
  return totals.get(event) ?? 0;
}

function normalizeSignalBucket(value) {
  return {
    current_events: readNumber(value?.current_events),
    delta: readNumber(value?.delta),
    key: readString(value?.bucket_key) || readString(value?.key),
    label: readString(value?.label),
  };
}

function normalizeHealthResult(value) {
  const status = normalizeStatus(value?.status);
  return {
    actor_type: readString(value?.actor_type) || 'all',
    detail: readString(value?.detail),
    label: readString(value?.label) || labelForStatus(status),
    latest_captured_at: readNullableString(value?.latest_captured_at),
    range_days: readNumber(value?.range_days),
    source: readString(value?.source) || 'all',
    status,
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

function uniqueAlerts(alerts) {
  const seen = new Set();
  const normalized = [];
  for (const alert of alerts) {
    const title = readString(alert?.title);
    const detail = readString(alert?.detail);
    if (!title && !detail) continue;
    const level = ['critical', 'warning', 'info'].includes(alert?.level) ? alert.level : 'info';
    const source = readString(alert?.source) || 'snapshot';
    const key = `${level}:${source}:${title}:${detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({ detail, level, source, title });
  }
  return normalized.sort((a, b) => alertSeverity(b.level) - alertSeverity(a.level));
}

function alertSeverity(level) {
  if (level === 'critical') return 3;
  if (level === 'warning') return 2;
  return 1;
}

function healthLabel(health) {
  const actor = readString(health?.actor_type) || 'all';
  const days = readNumber(health?.range_days);
  return `${actor}, ${days || '?'}d`;
}

function latestTimestamp(items) {
  const timestamps = items
    .map((item) => item ? parseDate(item.captured_at || item.created_at) : 0)
    .filter((timestamp) => timestamp > 0);
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function sampleThresholdInput() {
  const generated = '2026-05-11T14:00:00.000Z';
  return {
    healthResults: [
      {
        actor_type: 'all',
        detail: 'Latest stored telemetry snapshot was captured today.',
        label: 'Fresh',
        latest_captured_at: generated,
        range_days: 7,
        source: 'all',
        status: 'success',
      },
      {
        actor_type: 'all',
        detail: 'Latest stored telemetry snapshot was captured today.',
        label: 'Fresh',
        latest_captured_at: generated,
        range_days: 30,
        source: 'all',
        status: 'success',
      },
      {
        actor_type: 'customer',
        detail: 'Latest stored telemetry snapshot was captured today.',
        label: 'Fresh',
        latest_captured_at: generated,
        range_days: 30,
        source: 'all',
        status: 'success',
      },
    ],
    usageSnapshots: [
      {
        actor_type: 'all',
        candidate_aliases: 2,
        captured_at: generated,
        event_counts: [
          { event: 'cli.command.completed', count: 4 },
          { event: 'decantr.init.completed', count: 2 },
          { event: 'health.report.generated', count: 3 },
          { event: 'health.ci.failed', count: 1 },
        ],
        failure_events: 2,
        operating_alerts: [],
        previous_summary: { total_events: 50 },
        range_days: 7,
        signal_buckets: [
          { bucket_key: 'commercial_intent', current_events: 8, delta: 3, label: 'Commercial intent' },
        ],
        source: 'all',
        total_events: 70,
      },
      {
        actor_type: 'all',
        captured_at: generated,
        previous_summary: { total_events: 120 },
        range_days: 30,
        source: 'all',
        total_events: 190,
      },
      {
        actor_type: 'customer',
        captured_at: generated,
        previous_summary: { total_events: 0 },
        range_days: 30,
        source: 'all',
        total_events: 24,
      },
    ],
  };
}

function readItems(value) {
  return Array.isArray(value?.items) ? value.items : [];
}

function readArray(value) {
  return Array.isArray(value) ? value : [];
}

function readNestedNumber(value, path) {
  const result = readNestedNullableNumber(value, path);
  return result ?? 0;
}

function readNestedNullableNumber(value, path) {
  let current = value;
  for (const key of path) {
    if (!current || typeof current !== 'object') return null;
    current = current[key];
  }
  return readNullableNumber(current);
}

function parseDate(value) {
  const timestamp = Date.parse(String(value ?? ''));
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function statusColor(status) {
  if (status === 'critical') return 0xe5484d;
  if (status === 'warning') return 0xf5a524;
  return 0x2fb344;
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatPercent(value) {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
    style: 'percent',
  }).format(value);
}

function formatDelta(value) {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return '0';
}

function escapeCell(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
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

function normalizeApiUrl(value) {
  return value.replace(/\/+$/, '');
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

function readEnvNumber(key, fallback) {
  const value = readNullableNumber(process.env[key]);
  return value ?? fallback;
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
  console.error('  node scripts/check-telemetry-thresholds.mjs');
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
