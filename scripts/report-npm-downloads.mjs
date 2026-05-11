#!/usr/bin/env node
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fetchNpmDownloadSummary } from './npm-downloads-lib.mjs';

const argv = process.argv.slice(2);
const args = new Set(argv);
const dryRun = args.has('--dry-run');
const json = args.has('--json');
const sendWebhook = args.has('--send-webhook');

loadOptionalEnvFiles();

const periods = readRepeatableArgs('--period');
const only = readRepeatableArgs('--only')
  .flatMap((value) => value.split(','))
  .map((value) => value.trim())
  .filter(Boolean);
const webhookUrl =
  process.env.NPM_DOWNLOAD_WEBHOOK_URL?.trim() ||
  process.env.TELEMETRY_DIGEST_WEBHOOK_URL?.trim() ||
  process.env.TELEMETRY_HEALTH_WEBHOOK_URL?.trim() ||
  '';
const webhookFormat = normalizeWebhookFormat(
  process.env.NPM_DOWNLOAD_WEBHOOK_FORMAT?.trim() || detectWebhookFormat(webhookUrl),
);
const webhookAlways = process.env.NPM_DOWNLOAD_WEBHOOK_ALWAYS === 'true';

const summary = await fetchNpmDownloadSummary({
  dryRun,
  packageNames: only,
  periods,
});
const markdown = renderMarkdown(summary, { dryRun });

if (json) {
  console.log(JSON.stringify(summary, null, 2));
} else {
  console.log(markdown);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (webhookUrl && (sendWebhook || webhookAlways) && !json) {
  await postWebhook({ markdown, summary });
}

function renderMarkdown(summary, { dryRun: isDryRun }) {
  const lines = [
    '# Decantr npm Download Interest',
    '',
    isDryRun ? 'Mode: dry run' : 'Source: npm downloads API',
    `Generated: ${summary.generatedAt}`,
    '',
    '## Totals',
    '',
  ];

  for (const period of summary.periods) {
    lines.push(`- ${formatPeriod(period)}: ${formatNumber(summary.totals[period] ?? 0)} downloads`);
  }

  lines.push('', '## Top Packages', '');
  for (const period of summary.periods) {
    lines.push(`### ${formatPeriod(period)}`, '');
    const rows = summary.top[period] ?? [];
    if (rows.length) {
      lines.push('| Package | Downloads |');
      lines.push('| --- | ---: |');
      for (const row of rows) {
        lines.push(`| ${escapeCell(row.name)} | ${formatNumber(row.downloads[period] ?? 0)} |`);
      }
    } else {
      lines.push('No package download data was returned.');
    }
    lines.push('');
  }

  const errors = summary.packages.flatMap((row) =>
    Object.entries(row.errors ?? {}).map(([period, error]) => ({
      error,
      packageName: row.name,
      period,
    })),
  );

  if (errors.length) {
    lines.push('## Warnings', '');
    for (const warning of errors.slice(0, 12)) {
      lines.push(`- ${warning.packageName} ${formatPeriod(warning.period)}: ${warning.error}`);
    }
    if (errors.length > 12) {
      lines.push(`- ${formatNumber(errors.length - 12)} additional npm API warnings omitted.`);
    }
    lines.push('');
  }

  return lines.join('\n').trimEnd();
}

async function postWebhook(context) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload(context)),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`npm download webhook failed ${response.status} ${response.statusText}: ${text.slice(0, 600)}`);
  }
}

function webhookPayload(context) {
  if (webhookFormat === 'discord') {
    return discordWebhookPayload(context.summary);
  }

  return { text: context.markdown };
}

function discordWebhookPayload(summary) {
  const fields = summary.periods.map((period) => ({
    inline: false,
    name: formatPeriod(period),
    value: [
      `Total downloads: **${formatNumber(summary.totals[period] ?? 0)}**`,
      ...((summary.top[period] ?? []).slice(0, 5).map((row) =>
        `${row.name}: **${formatNumber(row.downloads[period] ?? 0)}**`
      )),
    ].join('\n'),
  }));

  const warningCount = summary.packages.reduce(
    (count, row) => count + Object.keys(row.errors ?? {}).length,
    0,
  );
  if (warningCount) {
    fields.push({
      inline: false,
      name: 'Warnings',
      value: `${formatNumber(warningCount)} npm API warning${warningCount === 1 ? '' : 's'} recorded. Open the workflow summary for details.`,
    });
  }

  return {
    username: 'Decantr Telemetry',
    content: 'Decantr npm download interest summary.',
    embeds: [
      {
        title: 'npm Download Interest',
        description: 'Install/download demand for the public Decantr package surface.',
        color: warningCount ? 0xf5a524 : 0x2f80ed,
        fields,
        footer: {
          text: 'npm downloads are install-interest signals, not authenticated Decantr product usage.',
        },
        timestamp: summary.generatedAt,
      },
    ],
  };
}

function formatPeriod(period) {
  return period
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function escapeCell(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
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

function readRepeatableArgs(name) {
  const values = [];
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === name && argv[i + 1]) {
      values.push(argv[++i]);
    } else if (arg.startsWith(`${name}=`)) {
      values.push(arg.slice(name.length + 1));
    }
  }
  return values;
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
