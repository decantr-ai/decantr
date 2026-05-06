#!/usr/bin/env node
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const DASHBOARD_NAME = process.env.POSTHOG_DASHBOARD_NAME || 'Decantr Operating Dashboard';
const DASHBOARD_DESCRIPTION =
  'CEO/operator view of Decantr activation, registry usage, content pipeline health, and commercial intent.';
const TAGS = ['decantr', 'telemetry', 'operating-dashboard'];
const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');

class PostHogApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

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
const projectApiPrefix = `/api/projects/${encodeURIComponent(environmentId)}`;

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
  registryWebApiKeyPageViewed: 'registry_web.api_key_page_viewed',
  registryWebBillingViewed: 'registry_web.billing_viewed',
  registryWebContentOpened: 'registry_web.content_opened',
  registryWebIdentityLinked: 'registry_web.identity_linked',
  registryWebOrganizationViewed: 'registry_web.organization_viewed',
  registryWebPageViewed: 'registry_web.page_viewed',
  registryWebSearchPerformed: 'registry_web.search_performed',
  registryWebSignupClicked: 'registry_web.signup_clicked',
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
        eventNode(events.registryWebSignupClicked, 'Signup clicked'),
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
      'Daily customer-attributed volume for the primary Decantr usage events across registry resolution, execution packs, audits, critiques, CLI, and MCP/API surfaces.',
    query: trendLine(
      [
        [events.registryItemResolved, 'Registry item resolved'],
        [events.executionPackCompiled, 'Execution pack compiled'],
        [events.executionPackSelected, 'Execution pack selected'],
        [events.auditCompleted, 'Audit completed'],
        [events.critiqueCompleted, 'Critique completed'],
        [events.cliCommandCompleted, 'CLI command completed'],
      ],
      { properties: [actorProperty('customer')] },
    ),
  },
  {
    name: 'Customer product usage',
    description:
      'Daily customer-attributed product usage, excluding anonymous browsing, Decantr internal traffic, and the official content pipeline.',
    query: trendLine(
      [
        [events.registryItemResolved, 'Registry item resolved'],
        [events.executionPackCompiled, 'Execution pack compiled'],
        [events.executionPackSelected, 'Execution pack selected'],
        [events.auditCompleted, 'Audit completed'],
        [events.critiqueCompleted, 'Critique completed'],
        [events.cliCommandCompleted, 'CLI command completed'],
      ],
      { properties: [actorProperty('customer')] },
    ),
  },
  {
    name: 'Commercial intent',
    description:
      'Daily commercial-intent signals: new hosted profiles, API keys, and team/org creation.',
    query: trendLine([
      [events.userSignupCompleted, 'Signup completed'],
      [events.registryWebSignupClicked, 'Signup clicked'],
      [events.registryWebApiKeyPageViewed, 'API key page viewed'],
      [events.registryWebBillingViewed, 'Billing viewed'],
      [events.apiKeyCreated, 'API key created'],
      [events.orgCreated, 'Organization created'],
    ]),
  },
  {
    name: 'Registry web adoption',
    description:
      'Daily registry web product usage across page views, search, content detail opens, and authenticated identity links.',
    query: trendLine([
      [events.registryWebPageViewed, 'Page viewed'],
      [events.registryWebSearchPerformed, 'Search performed'],
      [events.registryWebContentOpened, 'Content opened'],
      [events.registryWebIdentityLinked, 'Identity linked'],
    ]),
  },
  {
    name: 'Registry web discovery funnel',
    description:
      'Tracks browser discovery from page view to search to content detail opens and signup intent.',
    query: insightViz({
      kind: 'FunnelsQuery',
      dateRange: last30Days(),
      filterTestAccounts: false,
      funnelsFilter: {
        funnelVizType: 'steps',
        layout: 'horizontal',
      },
      series: [
        eventNode(events.registryWebPageViewed, 'Page viewed'),
        eventNode(events.registryWebSearchPerformed, 'Search performed'),
        eventNode(events.registryWebContentOpened, 'Content opened'),
        eventNode(events.registryWebSignupClicked, 'Signup clicked'),
      ],
    }),
  },
  {
    name: 'Registry web commercial intent',
    description:
      'Daily web-surface commercial signals from billing, API key, organization, private registry, and signup touchpoints.',
    query: trendLine([
      [events.registryWebSignupClicked, 'Signup clicked'],
      [events.registryWebApiKeyPageViewed, 'API key page viewed'],
      [events.registryWebBillingViewed, 'Billing viewed'],
      [events.registryWebOrganizationViewed, 'Organization viewed'],
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
      [events.registryWebPageViewed, 'Registry web'],
    ]),
  },
  {
    name: 'Actor type mix',
    description:
      'All Decantr telemetry volume split by anonymous, customer, internal, official-pipeline, and service actor classes.',
    query: trendBar(
      [
        [events.cliCommandCompleted, 'CLI'],
        [events.registryItemResolved, 'Registry/API/MCP'],
        [events.executionPackCompiled, 'Execution packs'],
        [events.contentValidationCompleted, 'Content CI'],
        [events.contentPublishCompleted, 'Content publish'],
        [events.registryWebPageViewed, 'Registry web'],
      ],
      {
        breakdownFilter: {
          breakdown: 'decantr_actor_type',
          breakdown_type: 'event',
        },
      },
    ),
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

const cohortSpecs = [
  {
    name: 'Decantr: Activated users',
    description:
      'Users who completed a hosted signup, created an API key, or compiled an execution pack in the last 30 days.',
    filters: cohortFilters('OR', [
      performedEvent(events.userSignupCompleted),
      performedEvent(events.apiKeyCreated),
      performedEvent(events.executionPackCompiled),
    ]),
  },
  {
    name: 'Decantr: Commercial-intent users',
    description:
      'Users who touched billing, API keys, organization surfaces, team creation, or signup intent in the last 30 days.',
    filters: cohortFilters('OR', [
      performedEvent(events.registryWebBillingViewed),
      performedEvent(events.registryWebApiKeyPageViewed),
      performedEvent(events.registryWebOrganizationViewed),
      performedEvent(events.registryWebSignupClicked),
      performedEvent(events.apiKeyCreated),
      performedEvent(events.orgCreated),
    ]),
  },
  {
    name: 'Decantr: Content power users',
    description:
      'Users who repeatedly search or open registry content, or repeatedly resolve registry items, in the last 30 days.',
    filters: cohortFilters('OR', [
      performedEvent(events.registryWebSearchPerformed, 5),
      performedEvent(events.registryWebContentOpened, 5),
      performedEvent(events.registryItemResolved, 10),
    ]),
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

const cohortResults = await runOptionalSetup('cohorts', ['cohort:read', 'cohort:write'], async () => {
  const results = [];
  for (const spec of cohortSpecs) {
    results.push(await upsertCohort(spec));
  }
  return results;
});

const alertResults = await runOptionalSetup('alerts', ['alert:read', 'alert:write'], async () => {
  const insightsByName = new Map(insightResults.map((insight) => [insight.name, insight]));
  const failureInsight = insightsByName.get('Failure signals');
  const commercialInsight = insightsByName.get('Commercial intent');
  const specs = [
    failureInsight
      ? {
          insightId: failureInsight.id,
          name: 'Decantr: failure events detected',
          thresholdName: 'Any failure event',
          seriesIndex: 0,
          lowerBound: 0,
        }
      : null,
    commercialInsight
      ? {
          insightId: commercialInsight.id,
          name: 'Decantr: commercial-intent spike',
          thresholdName: 'Commercial intent above baseline threshold',
          seriesIndex: 0,
          lowerBound: 10,
        }
      : null,
  ].filter(Boolean);

  const results = [];
  for (const spec of specs) {
    results.push(await upsertAlert(spec));
  }
  return results;
});

const dashboardUrl = `${host}/project/${encodeURIComponent(environmentId)}/dashboard/${dashboard.id}`;
console.log(`Dashboard ready: ${DASHBOARD_NAME}`);
console.log(`Dashboard id: ${dashboard.id}`);
console.log(`Dashboard URL: ${dashboardUrl}`);
console.log(`Insights attached: ${insightResults.length}`);
console.log(`Cohorts ready: ${cohortResults.length}`);
console.log(`Alerts ready: ${alertResults.length}`);

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

async function upsertCohort(spec) {
  const existing = await findByExactName(`${projectApiPrefix}/cohorts/`, spec.name);
  const body = {
    name: spec.name,
    description: spec.description,
    filters: spec.filters,
    is_static: false,
    cohort_type: 'behavioral',
  };

  if (existing) {
    console.log(`Updating cohort: ${spec.name}`);
    return ph(`${projectApiPrefix}/cohorts/${existing.id}/`, {
      method: 'PATCH',
      body,
    });
  }

  console.log(`Creating cohort: ${spec.name}`);
  return ph(`${projectApiPrefix}/cohorts/`, {
    method: 'POST',
    body,
  });
}

async function upsertAlert(spec) {
  const existing = await findByExactName(`${apiPrefix}/alerts/`, spec.name);
  const body = {
    insight: spec.insightId,
    name: spec.name,
    subscribed_users: [],
    threshold: {
      name: spec.thresholdName,
      configuration: {
        bounds: {
          lower: spec.lowerBound,
        },
        type: 'absolute',
      },
    },
    condition: {
      type: 'absolute_value',
    },
    config: {
      check_ongoing_interval: null,
      series_index: spec.seriesIndex,
      type: 'TrendsAlertConfig',
    },
    calculation_interval: 'hourly',
    enabled: true,
    skip_weekend: false,
  };

  if (existing) {
    console.log(`Updating alert: ${spec.name}`);
    return ph(`${apiPrefix}/alerts/${existing.id}/`, {
      method: 'PATCH',
      body,
    });
  }

  console.log(`Creating alert: ${spec.name}`);
  return ph(`${apiPrefix}/alerts/`, {
    method: 'POST',
    body,
  });
}

async function runOptionalSetup(label, scopes, fn) {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof PostHogApiError && error.status === 403) {
      console.warn(
        `Skipping ${label}: PostHog personal API key needs ${scopes.join(', ')} scopes.`,
      );
      return [];
    }
    throw error;
  }
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
    return {
      id: `dry-run-${Math.random().toString(16).slice(2)}`,
      ...(options.body ?? {}),
    };
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
    throw new PostHogApiError(response.status, `PostHog API ${response.status} ${response.statusText}: ${message}`);
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

function actorProperty(actorType) {
  return {
    key: 'decantr_actor_type',
    operator: 'exact',
    type: 'event',
    value: actorType,
  };
}

function cohortFilters(type, values) {
  return {
    properties: {
      type,
      values,
    },
  };
}

function performedEvent(event, count = 1) {
  return {
    event_type: 'events',
    key: event,
    operator: 'gte',
    operator_value: count,
    time_interval: 'day',
    time_value: 30,
    type: 'behavioral',
    value: 'performed_event',
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
