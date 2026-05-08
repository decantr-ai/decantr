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
const webhookUrl =
  process.env.TELEMETRY_DIGEST_WEBHOOK_URL?.trim() ||
  process.env.TELEMETRY_HEALTH_WEBHOOK_URL?.trim() ||
  '';
const webhookFormat = normalizeWebhookFormat(
  process.env.TELEMETRY_DIGEST_WEBHOOK_FORMAT?.trim() || detectWebhookFormat(webhookUrl),
);
const webhookAlways = process.env.TELEMETRY_DIGEST_WEBHOOK_ALWAYS === 'true';
const generatedAt = new Date().toISOString();

if (!token) {
  fail('Missing DECANTR_TELEMETRY_SNAPSHOT_TOKEN. DECANTR_ADMIN_KEY is accepted as a fallback.');
}

const input = dryRun ? sampleDigestInput() : await fetchDigestInput();
const digest = buildDigest(input);
const markdown = renderMarkdown(digest, { apiUrl, dryRun, generatedAt });

console.log(markdown);

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (webhookUrl && (!dryRun || webhookAlways)) {
  await postWebhook({ apiUrl, digest, dryRun, generatedAt, markdown });
}

async function fetchDigestInput() {
  const [usageResponse, customerAttributionResponse, healthResults] = await Promise.all([
    fetchJson('/admin/telemetry-snapshots/usage?limit=60'),
    fetchJson('/admin/telemetry-snapshots/attribution?actor_type=customer&days=30&limit=10'),
    Promise.all([
      fetchJson('/admin/telemetry-snapshots/health?days=7'),
      fetchJson('/admin/telemetry-snapshots/health?days=30'),
      fetchJson('/admin/telemetry-snapshots/health?actor_type=customer&days=30'),
    ]),
  ]);

  return {
    attributionRows: readItems(customerAttributionResponse),
    healthResults,
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
    throw new Error(`Telemetry digest request failed ${response.status} ${response.statusText}: ${message}`);
  }

  return body;
}

function buildDigest(input) {
  const usageSnapshots = Array.isArray(input.usageSnapshots) ? input.usageSnapshots : [];
  const all7 = latestUsageSnapshot(usageSnapshots, { actorType: 'all', days: 7, source: 'all' });
  const all30 = latestUsageSnapshot(usageSnapshots, { actorType: 'all', days: 30, source: 'all' });
  const customer30 = latestUsageSnapshot(usageSnapshots, { actorType: 'customer', days: 30, source: 'all' });
  const attributionRows = latestAttributionRows(input.attributionRows ?? []);
  const healthResults = Array.isArray(input.healthResults) ? input.healthResults : [];
  const healthIssues = healthResults.filter((result) => result?.status !== 'success');
  const operatingAlerts = uniqueAlerts([
    ...readArray(all7?.operating_alerts),
    ...readArray(all30?.operating_alerts),
    ...readArray(customer30?.operating_alerts),
  ]);
  const bucketSnapshot = all7 ?? all30 ?? customer30 ?? null;
  const signalBuckets = readArray(bucketSnapshot?.signal_buckets)
    .map(normalizeSignalBucket)
    .filter((bucket) => bucket.key || bucket.label)
    .sort((a, b) => b.current_events - a.current_events);
  const topAttribution = attributionRows
    .map(normalizeAttributionRow)
    .filter((row) => row.events > 0)
    .sort((a, b) => b.events - a.events)
    .slice(0, 5);
  const totalEvents = readNumber(all7?.total_events);
  const previousTotalEvents = readNestedNumber(all7, ['previous_summary', 'total_events']);
  const customerEvents = readNumber(all7?.customer_events);
  const previousCustomerEvents = readNestedNumber(all7, ['previous_summary', 'customer_events']);
  const customer30Events = readNumber(customer30?.total_events);
  const failureEvents = readNumber(all7?.failure_events);
  const failureRate = totalEvents > 0 ? failureEvents / totalEvents : 0;
  const classificationCoverage = readNestedNullableNumber(all7, ['data_quality', 'classification_coverage']);
  const commercialIntent = signalBuckets.find((bucket) => bucket.key === 'commercial_intent');
  const status = digestStatus({
    all7,
    healthIssues,
    operatingAlerts,
  });

  return {
    all7,
    all30,
    attributionRows: topAttribution,
    commercialIntentEvents: commercialIntent?.current_events ?? 0,
    customer30,
    customer30Events,
    customerDelta: customerEvents - previousCustomerEvents,
    customerEvents,
    failureEvents,
    failureRate,
    healthResults,
    operatingAlerts,
    previousCustomerEvents,
    previousTotalEvents,
    signalBuckets,
    status,
    totalDelta: totalEvents - previousTotalEvents,
    totalEvents,
    totalEvents30: readNumber(all30?.total_events),
    active: {
      anonymousIds: readNumber(all7?.active_anonymous_ids),
      installs: readNumber(customer30?.active_installs) || readNumber(all30?.active_installs),
      orgs: readNumber(customer30?.active_orgs) || attributionActive('orgs', topAttribution),
      projects: readNumber(customer30?.active_projects) || attributionActive('projects', topAttribution),
    },
    quality: {
      candidateAliases: readNumber(all7?.candidate_aliases) || readNumber(customer30?.candidate_aliases),
      classificationCoverage,
      latestCapturedAt: latestTimestamp([all7, all30, customer30]),
    },
  };
}

function renderMarkdown(digest, { apiUrl, dryRun, generatedAt }) {
  const lines = [
    '# Decantr Executive Telemetry Digest',
    '',
    dryRun ? 'Mode: dry run' : `API: ${apiUrl}`,
    `Generated: ${generatedAt}`,
    `Status: ${digest.status}`,
    `Latest durable rollup: ${digest.quality.latestCapturedAt ?? 'none'}`,
    '',
    '## CEO Pulse',
    '',
    `- Tracked events, last 7 days: ${formatNumber(digest.totalEvents)} (${formatDelta(digest.totalDelta)} vs previous period)`,
    `- Customer-attributed events, last 7 days: ${formatNumber(digest.customerEvents)} (${formatDelta(digest.customerDelta)} vs previous period)`,
    `- Customer-attributed events, last 30 days: ${formatNumber(digest.customer30Events)}`,
    `- Active customer orgs/projects/installs: ${formatNumber(digest.active.orgs)} orgs, ${formatNumber(digest.active.projects)} projects, ${formatNumber(digest.active.installs)} installs`,
    `- Commercial-intent signals: ${formatNumber(digest.commercialIntentEvents)}`,
    `- Failure signals: ${formatNumber(digest.failureEvents)} (${formatPercent(digest.failureRate)} of last-7-day events)`,
    `- Classification coverage: ${formatNullablePercent(digest.quality.classificationCoverage)}`,
    `- Candidate aliases to review: ${formatNumber(digest.quality.candidateAliases)}`,
    '',
    '## Adoption Buckets',
    '',
  ];

  if (digest.signalBuckets.length) {
    lines.push('| Bucket | Current | Previous | Delta | Change |');
    lines.push('| --- | ---: | ---: | ---: | ---: |');
    for (const bucket of digest.signalBuckets.slice(0, 8)) {
      lines.push(
        `| ${escapeCell(bucket.label || bucket.key)} | ${formatNumber(bucket.current_events)} | ${formatNumber(bucket.previous_events)} | ${formatDelta(bucket.delta)} | ${formatNullablePercent(bucket.change_rate)} |`,
      );
    }
  } else {
    lines.push('No adoption bucket data is available in the latest durable rollup.');
  }

  lines.push('', '## Top Customer Activity', '');
  if (digest.attributionRows.length) {
    lines.push('| Org | Project | Source | Events | Last seen |');
    lines.push('| --- | --- | --- | ---: | --- |');
    for (const row of digest.attributionRows) {
      lines.push(
        `| ${escapeCell(row.orgLabel)} | ${escapeCell(row.projectId || 'none')} | ${escapeCell(row.source || 'unknown')} | ${formatNumber(row.events)} | ${escapeCell(row.lastSeen || 'unknown')} |`,
      );
    }
  } else {
    lines.push('No customer attribution rows are available in the latest 30-day customer rollup.');
  }

  lines.push('', '## Operating Alerts', '');
  if (digest.operatingAlerts.length) {
    for (const alert of digest.operatingAlerts.slice(0, 8)) {
      lines.push(`- ${alert.level.toUpperCase()}: ${alert.title} - ${alert.detail}`);
    }
  } else {
    lines.push('- No operating alerts are stored on the latest durable rollups.');
  }

  lines.push('', '## Snapshot Health', '');
  if (digest.healthResults.length) {
    lines.push('| Check | Status | Latest | Detail |');
    lines.push('| --- | --- | --- | --- |');
    for (const health of digest.healthResults) {
      lines.push(
        `| ${escapeCell(healthLabel(health))} | ${escapeCell(health.status ?? 'unknown')} | ${escapeCell(health.latest_captured_at ?? 'none')} | ${escapeCell(health.detail ?? '')} |`,
      );
    }
  } else {
    lines.push('No health checks were returned.');
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
    throw new Error(`Telemetry digest webhook failed ${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  }
}

function webhookPayload(context) {
  if (webhookFormat === 'discord') {
    return discordWebhookPayload(context);
  }

  return { text: context.markdown };
}

function discordWebhookPayload({ apiUrl, digest, dryRun, generatedAt }) {
  return {
    username: 'Decantr Telemetry',
    content: `Decantr executive telemetry digest: ${digest.status}.`,
    embeds: [
      {
        title: 'Executive Telemetry Digest',
        description: [
          `Status: **${capitalize(digest.status)}**`,
          dryRun ? 'Mode: `dry run`' : `API: \`${apiUrl}\``,
          `Generated: \`${generatedAt}\``,
          `Latest rollup: \`${digest.quality.latestCapturedAt ?? 'none'}\``,
        ].join('\n'),
        color: digestColor(digest),
        fields: [
          {
            name: 'CEO pulse',
            value: [
              `Tracked 7d: **${formatNumber(digest.totalEvents)}** (${formatDelta(digest.totalDelta)})`,
              `Customer 7d: **${formatNumber(digest.customerEvents)}** (${formatDelta(digest.customerDelta)})`,
              `Customer 30d: **${formatNumber(digest.customer30Events)}**`,
              `Active: **${formatNumber(digest.active.orgs)} orgs / ${formatNumber(digest.active.projects)} projects / ${formatNumber(digest.active.installs)} installs**`,
              `Commercial intent: **${formatNumber(digest.commercialIntentEvents)}**`,
              `Failures: **${formatNumber(digest.failureEvents)}** (${formatPercent(digest.failureRate)})`,
            ].join('\n'),
            inline: false,
          },
          {
            name: 'Adoption buckets',
            value: digest.signalBuckets.length
              ? digest.signalBuckets.slice(0, 5).map((bucket) =>
                `${bucket.label || bucket.key}: **${formatNumber(bucket.current_events)}** (${formatDelta(bucket.delta)})`
              ).join('\n')
              : 'No adoption bucket data available.',
            inline: false,
          },
          {
            name: 'Top customer activity',
            value: digest.attributionRows.length
              ? limitDiscordText(digest.attributionRows.slice(0, 5).map((row) =>
                `${row.orgLabel} / ${row.projectId || 'none'}: **${formatNumber(row.events)}** via ${row.source || 'unknown'}`
              ).join('\n'), 1_024)
              : 'No customer attribution rows available.',
            inline: false,
          },
          {
            name: 'Alerts',
            value: digest.operatingAlerts.length
              ? limitDiscordText(digest.operatingAlerts.slice(0, 5).map((alert) =>
                `${alert.level.toUpperCase()}: ${alert.title}`
              ).join('\n'), 1_024)
              : 'No stored operating alerts.',
            inline: false,
          },
          {
            name: 'Snapshot health',
            value: digest.healthResults.length
              ? digest.healthResults.map((health) =>
                `${healthLabel(health)}: **${health.status ?? 'unknown'}**`
              ).join('\n')
              : 'No health checks returned.',
            inline: false,
          },
        ],
        footer: {
          text: 'Durable Supabase rollups; PostHog remains the raw event explorer.',
        },
        timestamp: generatedAt,
      },
    ],
  };
}

function digestStatus({ all7, healthIssues, operatingAlerts }) {
  if (!all7 || healthIssues.some((health) => health?.status === 'error')) return 'attention';
  if (operatingAlerts.some((alert) => alert.level === 'critical')) return 'attention';
  if (healthIssues.length || operatingAlerts.some((alert) => alert.level === 'warning')) return 'watch';
  return 'healthy';
}

function digestColor(digest) {
  if (digest.status === 'attention') return 0xe5484d;
  if (digest.status === 'watch') return 0xf5a524;
  return 0x2fb344;
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

function latestAttributionRows(items) {
  const sorted = items.slice().sort(compareCapturedDesc);
  const latest = sorted[0];
  if (!latest) return [];
  const capturedAt = readString(latest.captured_at);
  const snapshotDate = readString(latest.snapshot_date);
  const rangeDays = readNumber(latest.range_days);
  const actorType = readString(latest.actor_type);
  const source = readString(latest.source);
  return sorted.filter((item) =>
    readString(item.captured_at) === capturedAt &&
    readString(item.snapshot_date) === snapshotDate &&
    readNumber(item.range_days) === rangeDays &&
    readString(item.actor_type) === actorType &&
    readString(item.source) === source
  );
}

function compareCapturedDesc(a, b) {
  return parseDate(b?.captured_at || b?.created_at) - parseDate(a?.captured_at || a?.created_at);
}

function latestTimestamp(items) {
  const timestamps = items
    .map((item) => item ? parseDate(item.captured_at || item.created_at) : 0)
    .filter((timestamp) => timestamp > 0);
  if (!timestamps.length) return null;
  return new Date(Math.max(...timestamps)).toISOString();
}

function uniqueAlerts(alerts) {
  const seen = new Set();
  const normalized = [];
  for (const alert of alerts) {
    const title = readString(alert?.title);
    const detail = readString(alert?.detail);
    if (!title && !detail) continue;
    const level = ['critical', 'warning', 'info'].includes(alert?.level) ? alert.level : 'info';
    const key = `${level}:${title}:${detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    normalized.push({ detail, level, title });
  }
  return normalized.sort((a, b) => alertSeverity(b.level) - alertSeverity(a.level));
}

function alertSeverity(level) {
  if (level === 'critical') return 3;
  if (level === 'warning') return 2;
  return 1;
}

function normalizeSignalBucket(value) {
  return {
    change_rate: readNullableNumber(value?.change_rate),
    current_events: readNumber(value?.current_events),
    delta: readNumber(value?.delta),
    key: readString(value?.bucket_key) || readString(value?.key),
    label: readString(value?.label),
    previous_events: readNumber(value?.previous_events),
  };
}

function normalizeAttributionRow(value) {
  const orgLabel =
    readString(value?.org_name) ||
    readString(value?.org_slug) ||
    readString(value?.org_id) ||
    'Unattributed';
  return {
    events: readNumber(value?.events),
    lastSeen: readNullableString(value?.last_seen),
    orgLabel,
    projectId: readString(value?.project_id),
    source: readString(value?.row_source) || readString(value?.source),
  };
}

function attributionActive(kind, rows) {
  const values = new Set();
  for (const row of rows) {
    if (kind === 'orgs' && row.orgLabel && row.orgLabel !== 'Unattributed') values.add(row.orgLabel);
    if (kind === 'projects' && row.projectId) values.add(row.projectId);
  }
  return values.size;
}

function healthLabel(health) {
  const actor = readString(health?.actor_type) || 'all';
  const days = readNumber(health?.range_days);
  return `${actor}, ${days || '?'}d`;
}

function sampleDigestInput() {
  const generated = '2026-05-08T14:30:00.000Z';
  return {
    healthResults: [
      {
        actor_type: 'all',
        detail: 'Latest stored telemetry snapshot was captured today.',
        latest_captured_at: generated,
        range_days: 7,
        status: 'success',
      },
      {
        actor_type: 'all',
        detail: 'Latest stored telemetry snapshot was captured today.',
        latest_captured_at: generated,
        range_days: 30,
        status: 'success',
      },
      {
        actor_type: 'customer',
        detail: 'Latest stored telemetry snapshot was captured today.',
        latest_captured_at: generated,
        range_days: 30,
        status: 'success',
      },
    ],
    usageSnapshots: [
      {
        active_anonymous_ids: 2,
        active_installs: 6,
        active_orgs: 2,
        active_projects: 5,
        actor_type: 'all',
        candidate_aliases: 1,
        captured_at: generated,
        customer_events: 42,
        data_quality: { classification_coverage: 0.91 },
        failure_events: 1,
        operating_alerts: [],
        previous_summary: { customer_events: 31, total_events: 86 },
        range_days: 7,
        signal_buckets: [
          { bucket_key: 'registry_discovery', current_events: 48, delta: 12, label: 'Registry discovery', previous_events: 36 },
          { bucket_key: 'hosted_intelligence', current_events: 21, delta: 4, label: 'Hosted intelligence', previous_events: 17 },
          { bucket_key: 'commercial_intent', current_events: 7, delta: 3, label: 'Commercial intent', previous_events: 4 },
        ],
        source: 'all',
        total_events: 103,
      },
      {
        active_installs: 10,
        active_orgs: 4,
        active_projects: 8,
        actor_type: 'all',
        captured_at: generated,
        range_days: 30,
        source: 'all',
        total_events: 389,
      },
      {
        active_installs: 5,
        active_orgs: 2,
        active_projects: 4,
        actor_type: 'customer',
        captured_at: generated,
        operating_alerts: [
          {
            detail: '1 active identity needs customer/internal classification review.',
            level: 'info',
            title: 'Unaliased identities found',
          },
        ],
        range_days: 30,
        source: 'all',
        total_events: 118,
      },
    ],
    attributionRows: [
      {
        actor_type: 'customer',
        captured_at: generated,
        events: 54,
        last_seen: '2026-05-08T13:42:00.000Z',
        org_name: 'Customer Co',
        project_id: 'project_alpha',
        range_days: 30,
        row_source: 'cli',
        snapshot_date: '2026-05-08',
        source: 'all',
      },
      {
        actor_type: 'customer',
        captured_at: generated,
        events: 31,
        last_seen: '2026-05-08T12:10:00.000Z',
        org_name: 'Studio Labs',
        project_id: 'project_beta',
        range_days: 30,
        row_source: 'api',
        snapshot_date: '2026-05-08',
        source: 'all',
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

function formatNullablePercent(value) {
  return value === null ? 'n/a' : formatPercent(value);
}

function formatDelta(value) {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return '0';
}

function escapeCell(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, '<br>');
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
  console.error('  node scripts/report-telemetry-digest.mjs');
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
