#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DASHBOARD_NAME = process.env.POSTHOG_DASHBOARD_NAME || 'Decantr Operating Dashboard';
const DASHBOARD_DESCRIPTION =
  'CEO/operator view of Decantr activation, registry usage, content pipeline health, and commercial intent.';
const TAGS = ['decantr', 'telemetry', 'operating-dashboard'];
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

loadOptionalEnvFiles();

const host = (process.env.POSTHOG_HOST?.trim() || (dryRun ? 'https://us.posthog.com' : requiredEnv('POSTHOG_HOST'))).replace(
  /\/+$/,
  '',
);
const environmentId =
  process.env.POSTHOG_ENVIRONMENT_ID || process.env.POSTHOG_PROJECT_ID || (dryRun ? 'dry-run' : '');
const apiKey =
  process.env.POSTHOG_PERSONAL_API_KEY?.trim() ||
  (dryRun ? 'dry-run' : requiredEnv('POSTHOG_PERSONAL_API_KEY'));

if (!environmentId) {
  fail('Missing POSTHOG_ENVIRONMENT_ID. POSTHOG_PROJECT_ID is also accepted as an alias.');
}

if (environmentId.startsWith('phc_')) {
  fail(
    'POSTHOG_ENVIRONMENT_ID must be the numeric PostHog project/environment id from the app URL, not the phc_ project API key.',
  );
}

if (host.includes('.i.posthog.com')) {
  fail(
    'POSTHOG_HOST must be the PostHog app/API host, such as https://us.posthog.com, not the ingest host.',
  );
}

const apiPrefix = `/api/environments/${encodeURIComponent(environmentId)}`;

const events = {
  apiKeyCreated: 'api_key.created',
  auditCompleted: 'audit.completed',
  cliCommandCompleted: 'cli.command.completed',
  contentPublishCompleted: 'content.publish.completed',
  contentValidationCompleted: 'content.validation.completed',
  critiqueCompleted: 'critique.completed',
  executionPackCompiled: 'execution_pack.compiled',
  executionPackSelected: 'execution_pack.selected',
  orgCreated: 'org.created',
  registryItemResolved: 'registry.item.resolved',
  registrySyncCompleted: 'registry.sync.completed',
  userSignupCompleted: 'user.signup.completed',
};

const insightSpecs = [
  {
    name: 'Activation funnel: signup to compiled pack',
    description:
      'Tracks the enterprise activation path from hosted signup through API key creation, registry usage, and execution-pack compilation.',
    query: insightViz({
      kind: 'FunnelsQuery',
      dateRange: last30Days(),
      filterTestAccounts: false,
      funnelsFilter: {
        funnelVizType: 'steps',
        layout: 'horizontal',
      },
      series: [
        eventNode(events.userSignupCompleted, 'Signup completed'),
        eventNode(events.apiKeyCreated, 'API key created'),
        eventNode(events.registryItemResolved, 'Registry item resolved'),
        eventNode(events.executionPackCompiled, 'Execution pack compiled'),
      ],
    }),
  },
  {
    name: 'Core product usage',
    description:
      'Daily volume for the primary Decantr usage events across registry resolution, execution packs, audits, critiques, CLI, and MCP/API surfaces.',
    query: trendLine([
      [events.registryItemResolved, 'Registry item resolved'],
      [events.executionPackCompiled, 'Execution pack compiled'],
      [events.executionPackSelected, 'Execution pack selected'],
      [events.auditCompleted, 'Audit completed'],
      [events.critiqueCompleted, 'Critique completed'],
      [events.cliCommandCompleted, 'CLI command completed'],
    ]),
  },
  {
    name: 'Commercial intent',
    description:
      'Daily commercial-intent signals: new hosted profiles, API keys, and team/org creation.',
    query: trendLine([
      [events.userSignupCompleted, 'Signup completed'],
      [events.apiKeyCreated, 'API key created'],
      [events.orgCreated, 'Organization created'],
    ]),
  },
  {
    name: 'Content pipeline health',
    description:
      'Daily health of the official content pipeline: validation and registry publish events from CI.',
    query: trendLine([
      [events.contentValidationCompleted, 'Validation completed'],
      [events.contentPublishCompleted, 'Publish completed'],
      [events.registrySyncCompleted, 'Registry sync completed'],
    ]),
  },
  {
    name: 'Hosted intelligence workload',
    description:
      'Hosted API workload from execution-pack compilation, audits, and critiques.',
    query: trendLine([
      [events.executionPackCompiled, 'Execution pack compiled'],
      [events.auditCompleted, 'Audit completed'],
      [events.critiqueCompleted, 'Critique completed'],
    ]),
  },
  {
    name: 'Event volume by Decantr source',
    description:
      'All Decantr telemetry volume split by source-adjacent event streams so CLI, API, MCP, and content CI usage are easy to compare.',
    query: trendBar([
      [events.cliCommandCompleted, 'CLI'],
      [events.registryItemResolved, 'Registry/API/MCP'],
      [events.executionPackCompiled, 'Execution packs'],
      [events.contentValidationCompleted, 'Content CI'],
      [events.contentPublishCompleted, 'Content publish'],
    ]),
  },
  {
    name: 'Failure signals',
    description:
      'Daily failure signal volume from events that carry success=false or valid=false semantics.',
    query: trendLine([
      [events.apiKeyCreated, 'API key creation failed', [failureProperty('success')]],
      [events.registryItemResolved, 'Registry resolution failed', [failureProperty('success')]],
      [events.executionPackCompiled, 'Execution-pack compilation failed', [failureProperty('success')]],
      [events.auditCompleted, 'Audit failed', [failureProperty('success')]],
      [events.critiqueCompleted, 'Critique failed', [failureProperty('success')]],
      [events.contentValidationCompleted, 'Content validation failed', [failureProperty('valid')]],
      [events.contentPublishCompleted, 'Content publish failed', [failureProperty('success')]],
    ]),
  },
  {
    name: 'Registry adoption mix',
    description:
      'Registry source adoption trend for official, custom, cache, private-ready, and none/offline flows.',
    query: trendLine([[events.registryItemResolved, 'Registry item resolved']], {
      breakdownFilter: {
        breakdown: 'registry_source',
        breakdown_type: 'event',
      },
    }),
  },
];

const dashboard = await upsertDashboard();
const insightResults = [];

for (const [index, spec] of insightSpecs.entries()) {
  const insight = await upsertInsight({
    ...spec,
    dashboards: [dashboard.id],
    order: index,
    tags: TAGS,
  });
  insightResults.push(insight);
}

const dashboardUrl = `${host}/project/${encodeURIComponent(environmentId)}/dashboard/${dashboard.id}`;
console.log(`Dashboard ready: ${DASHBOARD_NAME}`);
console.log(`Dashboard id: ${dashboard.id}`);
console.log(`Dashboard URL: ${dashboardUrl}`);
console.log(`Insights attached: ${insightResults.length}`);

async function upsertDashboard() {
  const existing = await findByExactName(`${apiPrefix}/dashboards/`, DASHBOARD_NAME);
  const body = {
    name: DASHBOARD_NAME,
    description: DASHBOARD_DESCRIPTION,
    pinned: true,
    tags: TAGS,
  };

  if (existing) {
    console.log(`Updating dashboard: ${DASHBOARD_NAME}`);
    return ph(`${apiPrefix}/dashboards/${existing.id}/`, {
      method: 'PATCH',
      body,
    });
  }

  console.log(`Creating dashboard: ${DASHBOARD_NAME}`);
  return ph(`${apiPrefix}/dashboards/`, {
    method: 'POST',
    body,
  });
}

async function upsertInsight(spec) {
  const existing = await findByExactName(`${apiPrefix}/insights/`, spec.name);
  const body = {
    name: spec.name,
    description: spec.description,
    dashboards: spec.dashboards,
    order: spec.order,
    query: spec.query,
    tags: spec.tags,
  };

  if (existing) {
    console.log(`Updating insight: ${spec.name}`);
    return ph(`${apiPrefix}/insights/${existing.id}/`, {
      method: 'PATCH',
      body,
    });
  }

  console.log(`Creating insight: ${spec.name}`);
  return ph(`${apiPrefix}/insights/`, {
    method: 'POST',
    body,
  });
}

async function findByExactName(path, name) {
  const url = new URL(`${host}${path}`);
  url.searchParams.set('search', name);
  url.searchParams.set('limit', '100');
  const response = await ph(`${url.pathname}${url.search}`, { method: 'GET' });
  const results = Array.isArray(response.results) ? response.results : [];
  return results.find((item) => item?.name === name && item.deleted !== true) ?? null;
}

async function ph(path, options = {}) {
  if (dryRun) {
    if (!options.method || options.method === 'GET') return { results: [] };
    return { id: `dry-run-${Math.random().toString(16).slice(2)}` };
  }

  const response = await fetch(`${host}${path}`, {
    method: options.method || 'GET',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const text = await response.text();
  const parsed = text ? parseJson(text) : {};

  if (!response.ok) {
    const message =
      typeof parsed === 'object' && parsed !== null
        ? JSON.stringify(parsed)
        : text.slice(0, 600);
    throw new Error(`PostHog API ${response.status} ${response.statusText}: ${message}`);
  }

  return parsed;
}

function trendLine(series, options = {}) {
  return trend(series, {
    display: 'ActionsLineGraph',
    ...options,
  });
}

function trendBar(series, options = {}) {
  return trend(series, {
    display: 'ActionsBar',
    ...options,
  });
}

function trend(series, options = {}) {
  return insightViz({
    kind: 'TrendsQuery',
    dateRange: last30Days(),
    filterTestAccounts: false,
    interval: 'day',
    properties: options.properties || [],
    breakdownFilter: options.breakdownFilter,
    series: series.map(([event, name, properties]) => eventNode(event, name, properties)),
    trendsFilter: {
      display: options.display || 'ActionsLineGraph',
      showLegend: true,
    },
  });
}

function insightViz(source) {
  return {
    kind: 'InsightVizNode',
    source,
  };
}

function eventNode(event, name, properties) {
  return {
    custom_name: name,
    event,
    kind: 'EventsNode',
    name,
    properties,
  };
}

function failureProperty(key) {
  return {
    key,
    operator: 'exact',
    type: 'event',
    value: false,
  };
}

function last30Days() {
  return {
    date_from: '-30d',
    date_to: null,
  };
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
  console.error('  node scripts/create-posthog-operating-dashboard.mjs');
  console.error('');
  console.error('You can also place those values in .env.posthog.local or .env.local.');
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
