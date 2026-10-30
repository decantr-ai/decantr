#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import {
  appendFileSync,
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { readArgValue } from './cli-arg-lib.mjs';
import { getRepoRoot, loadPackageSurface, sortReleaseEntries } from './package-surface-lib.mjs';
import {
  publicRegistryOptions,
  readPublicRegistryChecks,
  retryVerification,
  verificationStatus,
} from './release-verification-lib.mjs';

const rawArgs = process.argv.slice(2);
const args = new Set(rawArgs);
const dryRun = args.has('--dry-run');
const includeExperimental = args.has('--include-experimental');
const jsonOutput = args.has('--json');
const noWebhook = args.has('--no-webhook');
const sendWebhook =
  args.has('--send-webhook') || process.env.RELEASE_VERIFICATION_WEBHOOK_ALWAYS === 'true';
const onlyWave = readArgValue(rawArgs, 'wave');
const tagOverride = readArgValue(rawArgs, 'tag-override') ?? readArgValue(rawArgs, 'tag');
const retries = readPositiveInteger(readArgValue(rawArgs, 'retries'), 3, 241);
const retryDelayMs = readPositiveInteger(readArgValue(rawArgs, 'retry-delay'), 5_000, 60_000);
const maxWaitMs = readPositiveInteger(readArgValue(rawArgs, 'max-wait'), 120_000, 1_800_000);
const reportJson = readArgValue(rawArgs, 'report-json');
let deadline = Date.now() + maxWaitMs;
const onlyNames = new Set(
  readArgValue(rawArgs, 'only')
    ? readArgValue(rawArgs, 'only')
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
    : [],
);

loadOptionalEnvFiles();

const webhookUrl =
  process.env.RELEASE_VERIFICATION_WEBHOOK_URL?.trim() ||
  process.env.TELEMETRY_HEALTH_WEBHOOK_URL?.trim() ||
  '';
const webhookFormat = normalizeWebhookFormat(
  process.env.RELEASE_VERIFICATION_WEBHOOK_FORMAT?.trim() || detectWebhookFormat(webhookUrl),
);

const root = getRepoRoot();
const surface = loadPackageSurface(root);
const generatedAt = new Date().toISOString();
const selected = sortReleaseEntries(surface.packages).filter((entry) => {
  if (!entry.publish) return false;
  if (!includeExperimental && entry.maturity === 'experimental') return false;
  if (onlyNames.size > 0 && !onlyNames.has(entry.name)) return false;
  if (onlyWave && entry.releaseWave !== onlyWave) return false;
  return true;
});

if (selected.length === 0) {
  console.log('No packages selected for published-package verification.');
  process.exit(0);
}

const results = [];
for (const entry of selected) {
  results.push(await verifyWithRetry(entry));
}

const failures = results.filter((result) => result.status === 'fail');
const pending = results.filter((result) => result.status === 'pending');
const output = {
  status: failures.length ? 'fail' : pending.length ? 'pending' : 'pass',
  generatedAt,
  dryRun,
  filters: {
    includeExperimental,
    only: [...onlyNames],
    tagOverride,
    wave: onlyWave,
  },
  results,
  registryPolling: { maxWaitMs, attemptsPerPackage: retries, retryDelayMs },
  recovery: {
    publishRunId: process.env.GITHUB_RUN_ID ?? null,
    releaseTag: process.env.DECANTR_RELEASE_TAG ?? null,
    instruction:
      'Resume verification and exact retained-artifact closeout with the original publish-run identity. Do not republish or move dist-tags to hide incomplete verification.',
  },
  summary: {
    failed: failures.length,
    packageCount: results.length,
    passed: results.length - failures.length - pending.length,
    pending: pending.length,
  },
};
const markdown = renderMarkdown(output);
if (reportJson) {
  const path = resolve(reportJson);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(output, null, 2)}\n`);
}

if (jsonOutput) {
  console.log(JSON.stringify(output, null, 2));
} else {
  console.log(markdown);
}

if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${markdown}\n`);
}

if (sendWebhook && !noWebhook && webhookUrl) {
  await postWebhook({ markdown, output });
} else if (sendWebhook && !noWebhook && !webhookUrl && !jsonOutput) {
  console.log('Release verification webhook was requested, but no webhook URL is configured.');
}

if (failures.length) process.exitCode = 1;
else if (pending.length) process.exitCode = 2;

async function verifyWithRetry(entry) {
  const result = await retryVerification(
    (remainingMs) => (dryRun ? verifyPackageDryRun(entry) : verifyPackage(entry, remainingMs)),
    {
      attempts: retries,
      delayMs: retryDelayMs,
      deadline,
      onPending: (result) =>
        console.error(
          `${entry.name}@${result.version}: registry verification pending (attempt ${result.attempts}/${retries}); retrying read-only checks.`,
        ),
    },
  );
  if (!dryRun && entry.name === '@decantr/cli' && result.status === 'pass') {
    const smokeStart = Date.now();
    try {
      result.checks.push(...runCliSmokeChecks(result.version, result.distTag));
    } finally {
      deadline += Math.max(0, Date.now() - smokeStart);
    }
    result.status = verificationStatus(result.checks);
  }
  return result;
}

function verifyPackage(entry, remainingMs) {
  const packageJson = readLocalPackageJson(entry);
  const expectedVersion = packageJson.version;
  const distTag = tagOverride || entry.defaultDistTag || 'latest';
  const checks = [];

  addCheck(checks, 'local manifest', () => {
    assert(packageJson.name === entry.name, `expected ${entry.name}, found ${packageJson.name}`);
    assert(
      typeof expectedVersion === 'string' && expectedVersion.length > 0,
      'missing local version',
    );
    return expectedVersion;
  });

  if (verificationStatus(checks) === 'pass') {
    checks.push(...readPublicRegistryChecks(entry.name, expectedVersion, distTag, { remainingMs }));
  }

  return {
    checks,
    distTag,
    name: entry.name,
    path: entry.path,
    status: verificationStatus(checks),
    version: expectedVersion,
  };
}

function verifyPackageDryRun(entry) {
  const packageJson = readLocalPackageJson(entry);
  const distTag = tagOverride || entry.defaultDistTag || 'latest';
  const checks = [
    {
      detail: `${entry.name}@${packageJson.version}`,
      name: 'local manifest',
      status: 'pass',
    },
    {
      detail: 'dry run skips npm registry lookup',
      name: 'npm version exists',
      status: 'pass',
    },
    {
      detail: `dry run assumes ${distTag} -> ${packageJson.version}`,
      name: 'npm dist-tag',
      status: 'pass',
    },
    {
      detail: 'dry run skips published manifest lookup',
      name: 'published manifest',
      status: 'pass',
    },
  ];

  if (entry.name === '@decantr/cli') {
    checks.push({
      detail: 'dry run skips npx CLI smoke checks',
      name: 'published CLI smoke',
      status: 'pass',
    });
  }

  return {
    checks,
    distTag,
    name: entry.name,
    path: entry.path,
    status: 'pass',
    version: packageJson.version,
  };
}

function runCliSmokeChecks(version, distTag) {
  const checks = [];
  const packageSpec = `@decantr/cli@${version}`;
  const cache = mkdtempSync(join(tmpdir(), 'decantr-public-cli-smoke-'));
  const runSmoke = (spec, args, options = {}) => runNpx(spec, args, { ...options, cache });
  try {
    addCheck(checks, 'CLI --version smoke', () => {
      const output = runSmoke(packageSpec, ['--version']).trim();
      assert(output === version, `expected ${version}, found ${output}`);
      return output;
    });

    if (distTag === 'latest') {
      addCheck(checks, 'CLI latest smoke', () => {
        const output = runSmoke('@decantr/cli@latest', ['--version']).trim();
        assert(output === version, `latest expected ${version}, found ${output}`);
        return output;
      });
    }

    addCheck(checks, 'health help smoke', () => {
      const output = runSmoke(packageSpec, ['health', '--help']);
      assert(output.includes('decantr health'), 'missing health help title');
      assert(!output.includes('No decantr.essence.json'), 'health help executed a project report');
      return 'help rendered without running health';
    });

    addCheck(checks, 'content-health help smoke', () => {
      const output = runSmoke(packageSpec, ['content-health', '--help']);
      assert(output.includes('decantr content-health'), 'missing content-health help title');
      assert(
        !output.includes('Run this command from a content corpus repository'),
        'content-health help executed repository detection',
      );
      return 'help rendered without repository detection';
    });

    addCheck(checks, 'studio help smoke', () => {
      const output = runSmoke(packageSpec, ['studio', '--help']);
      assert(output.includes('GET  /api/health'), 'missing Studio API help');
      assert(!output.includes('Decantr Studio is running'), 'Studio help started the server');
      return 'help rendered without starting Studio';
    });

    addCheck(checks, 'health JSON smoke', () => {
      const tempDir = mkdtempSync(join(tmpdir(), 'decantr-release-health-'));
      try {
        writeFileSync(
          join(tempDir, 'decantr.essence.json'),
          `${JSON.stringify(sampleEssence(), null, 2)}\n`,
        );
        const output = runSmoke(packageSpec, ['health', '--json'], { cwd: tempDir });
        const report = JSON.parse(output);
        assert(
          report?.$schema === 'https://decantr.ai/schemas/project-health-report.v2.json',
          'missing Project Health v2 schema',
        );
        assert(typeof report.status === 'string', 'missing health status');
        assert(Array.isArray(report.findings), 'missing findings array');
        assert(report.loop?.schemaVersion === 2, 'missing loop readiness v2 block');
        assert(report.evidenceTier?.schemaVersion === 2, 'missing evidence tier v2 block');
        assert(report.authority?.schemaVersion === 2, 'missing authority resolution v2 block');
        return `${report.status} report with ${report.findings.length} findings`;
      } finally {
        rmSync(tempDir, { recursive: true, force: true });
      }
    });

    return checks;
  } finally {
    rmSync(cache, { recursive: true, force: true });
  }
}

function runNpx(packageSpec, cliArgs, options = {}) {
  return execFileSync(
    'npx',
    [...publicRegistryOptions('@decantr/cli', options.cache), '--yes', packageSpec, ...cliArgs],
    {
      cwd: options.cwd || root,
      encoding: 'utf8',
      env: {
        ...process.env,
        DECANTR_OFFLINE: 'true',
        npm_config_loglevel: 'error',
      },
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 30_000,
    },
  );
}

function addCheck(checks, name, fn) {
  try {
    const detail = fn();
    const check = {
      detail: String(detail || 'ok'),
      name,
      status: 'pass',
    };
    checks.push(check);
    return check;
  } catch (error) {
    const check = {
      detail: error instanceof Error ? error.message : String(error),
      name,
      status: 'fail',
    };
    checks.push(check);
    return check;
  }
}

function readLocalPackageJson(entry) {
  return JSON.parse(readFileSync(join(root, entry.path, 'package.json'), 'utf8'));
}

function renderMarkdown(output) {
  const lines = [
    '# Published Package Verification',
    '',
    output.dryRun ? 'Mode: dry run' : 'Mode: live npm verification',
    `Generated: ${output.generatedAt}`,
    `Overall: ${output.summary.failed ? 'failed' : output.summary.pending ? 'pending verification' : 'passed'}`,
    `Packages: ${formatNumber(output.summary.passed)} passed / ${formatNumber(output.summary.failed)} failed / ${formatNumber(output.summary.pending)} pending`,
    '',
    '| Package | Version | Tag | Status | Checks |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const result of output.results) {
    const checkSummary = result.checks
      .map((check) => `${check.status} ${check.name}: ${check.detail}`)
      .join('<br>');
    lines.push(
      `| \`${escapeCell(result.name)}\` | \`${escapeCell(result.version)}\` | \`${escapeCell(result.distTag)}\` | ${result.status} | ${escapeCell(checkSummary)} |`,
    );
  }

  if (output.summary.failed) {
    lines.push(
      '',
      '## Action Required',
      '',
      'At least one published package did not match the local release manifest or failed its public install smoke checks. Inspect the failed checks before any publication or registry mutation. This verifier does not establish publish authorization.',
    );
  }

  if (output.summary.pending)
    lines.push(
      '',
      '## Verification Pending',
      '',
      'The bounded public-registry wait ended without consistent visibility. The cause is unconfirmed; staging, propagation, or registry availability must be checked separately. Release completion remains blocked. Resume verification, then close out using the original retained tarballs and publish-run identity. Do not republish merely because these reads are pending.',
    );
  return lines.join('\n');
}

async function postWebhook(context) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { Connection: 'close', 'Content-Type': 'application/json' },
    body: JSON.stringify(webhookPayload(context)),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Release verification webhook failed ${response.status} ${response.statusText}: ${text.slice(0, 600)}`,
    );
  }
  await response.arrayBuffer();
}

function webhookPayload({ markdown, output }) {
  if (webhookFormat === 'discord') {
    return discordWebhookPayload(output);
  }
  return { text: markdown };
}

function discordWebhookPayload(output) {
  const failed = output.summary.failed > 0;
  const pending = !failed && output.summary.pending > 0;
  const fields = output.results.map((result) => ({
    inline: false,
    name: `${result.name}@${result.version}`,
    value: limitDiscordText(
      [
        `Status: **${result.status}**`,
        `Tag: \`${result.distTag}\``,
        ...result.checks.map((check) => `- ${check.status}: ${check.name} - ${check.detail}`),
      ].join('\n'),
      1_024,
    ),
  }));

  return {
    username: 'Decantr Release',
    content: `Decantr published package verification ${failed ? 'failed' : pending ? 'pending' : 'passed'}.`,
    embeds: [
      {
        color: failed ? 0xe5484d : pending ? 0xd99a00 : 0x2fb344,
        description: [
          output.dryRun ? 'Mode: `dry run`' : 'Mode: `live npm verification`',
          `Generated: \`${output.generatedAt}\``,
          `Packages: **${formatNumber(output.summary.passed)} passed / ${formatNumber(output.summary.failed)} failed / ${formatNumber(output.summary.pending)} pending**`,
        ].join('\n'),
        fields,
        footer: {
          text: failed
            ? 'Release action needed: npm version, dist-tag, manifest, or public install smoke failed.'
            : pending
              ? 'Registry visibility remains unverified. Resume verification; do not republish.'
              : 'Public npm install surface is verified.',
        },
        timestamp: output.generatedAt,
        title: 'Published Package Verification',
      },
    ],
  };
}

function sampleEssence() {
  return {
    version: '4.0.0',
    dna: {
      theme: { id: 'default', mode: 'light', shape: 'rounded' },
      spacing: { base_unit: 4, scale: 'linear', density: 'comfortable', content_gap: '_gap4' },
      typography: { scale: 'modular', heading_weight: 600, body_weight: 400 },
      color: { palette: 'semantic', accent_count: 1, cvd_preference: 'auto' },
      radius: { philosophy: 'rounded', base: 8 },
      elevation: { system: 'layered', max_levels: 3 },
      motion: { preference: 'subtle', duration_scale: 1, reduce_motion: true },
      accessibility: { wcag_level: 'AA', focus_visible: true, skip_nav: true },
      personality: ['clean'],
    },
    blueprint: {
      sections: [
        {
          id: 'marketing',
          role: 'public',
          shell: 'top-nav-footer',
          features: [],
          description: 'Marketing surface',
          pages: [{ id: 'home', route: '/', layout: ['hero'] }],
        },
      ],
      features: [],
      routes: {
        '/': { section: 'marketing', page: 'home' },
      },
    },
    meta: {
      archetype: 'marketing',
      target: 'react',
      platform: { type: 'spa', routing: 'hash' },
      guard: { mode: 'guided', dna_enforcement: 'error', blueprint_enforcement: 'warn' },
    },
  };
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

function escapeCell(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

function readPositiveInteger(value, fallback, maximum) {
  if (value == null) return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > maximum)
    throw new Error(`Expected an integer between 1 and ${maximum}, received ${value}.`);
  return parsed;
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function loadOptionalEnvFiles() {
  const explicitFile = readArgValue(rawArgs, 'env-file');
  const candidates = [
    explicitFile,
    '.env.release.local',
    '.env.telemetry.local',
    '.env.local',
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
