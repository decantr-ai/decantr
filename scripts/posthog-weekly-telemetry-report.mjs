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
const alertThresholds = {
  customerDropRate: readNumberEnv('TELEMETRY_CUSTOMER_DROP_RATE_ALERT_THRESHOLD', 0.25),
  failureEvents: readNumberEnv('TELEMETRY_FAILURE_ALERT_THRESHOLD', 3),
  failureRate: readNumberEnv('TELEMETRY_FAILURE_RATE_ALERT_THRESHOLD', 0.05),
};

if (!projectId) {
  fail('Missing POSTHOG_ENVIRONMENT_ID. POSTHOG_PROJECT_ID is also accepted as an alias.');
}

if (projectId.startsWith('phc_')) {
  fail('POSTHOG_ENVIRONMENT_ID must be the numeric PostHog project/environment id, not the phc_ project API key.');
}

const dashboardUrl = `${host}/project/${encodeURIComponent(projectId)}/dashboard/${dashboardId}`;
const currentRows = await runHogQl(countsQuery(7, 0));
const previousRows = await runHogQl(countsQuery(14, 7));
const customerRows = await runHogQl(customerCountsQuery(7, 0));
const previousCustomerRows = await runHogQl(customerCountsQuery(14, 7));
const sourceRows = await runHogQl(sourceQuery(7, 0));
const customerSourceRows = await runHogQl(customerSourceQuery(7, 0));
const actorRows = await runHogQl(actorQuery(7, 0));
const failureRows = await runHogQl(failureQuery(7, 0));
const customerIdentityRows = await runHogQl(customerIdentityQuery(7, 0));
const marketingAttributionRows = await runHogQl(marketingAttributionQuery(7, 0));

const markdown = renderMarkdown({
  alertThresholds,
  actorRows,
  currentRows,
  customerIdentityRows,
  customerRows,
  customerSourceRows,
  dashboardUrl,
  failureRows,
  marketingAttributionRows,
  previousCustomerRows,
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

function actorQuery(daysFrom, daysTo) {
  return `
    select
      properties.decantr_actor_type as actor_type,
      properties.decantr_source as source,
      count() as count
    from events
    where timestamp >= now() - interval ${daysFrom} day
      and timestamp < now() - interval ${daysTo} day
      and event in (${eventListSql()})
    group by actor_type, source
    order by count desc
  `;
}

function customerCountsQuery(daysFrom, daysTo) {
  return `
    select
      event,
      count() as count
    from events
    where timestamp >= now() - interval ${daysFrom} day
      and timestamp < now() - interval ${daysTo} day
      and event in (${eventListSql()})
      and properties.decantr_actor_type = 'customer'
    group by event
    order by count desc
  `;
}

function customerSourceQuery(daysFrom, daysTo) {
  return `
    select
      properties.decantr_source as source,
      count() as count
    from events
    where timestamp >= now() - interval ${daysFrom} day
      and timestamp < now() - interval ${daysTo} day
      and event in (${eventListSql()})
      and properties.decantr_actor_type = 'customer'
    group by source
    order by count desc
  `;
}

function customerIdentityQuery(daysFrom, daysTo) {
  return `
    select
      distinct_id,
      properties.decantr_install_id as install_id,
      properties.decantr_project_id as project_id,
      properties.decantr_source as source,
      count() as count
    from events
    where timestamp >= now() - interval ${daysFrom} day
      and timestamp < now() - interval ${daysTo} day
      and event in (${eventListSql()})
      and properties.decantr_actor_type = 'customer'
    group by distinct_id, install_id, project_id, source
    order by count desc
    limit 10
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

function marketingAttributionQuery(daysFrom, daysTo) {
  return `
    select
      properties.attributionUtmCampaign as campaign,
      properties.attributionUtmSource as source,
      properties.attributionUtmMedium as medium,
      properties.attributionLandingPath as landing_path,
      event,
      count() as count,
      max(timestamp) as last_seen
    from events
    where timestamp >= now() - interval ${daysFrom} day
      and timestamp < now() - interval ${daysTo} day
      and event in (${marketingAttributionEventListSql()})
    group by campaign, source, medium, landing_path, event
    order by count desc
    limit 300
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
    'marketing_web.command_clicked',
    'marketing_web.cta_clicked',
    'marketing_web.outbound_clicked',
    'marketing_web.page_viewed',
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

function marketingAttributionEventListSql() {
  return [
    'marketing_web.command_clicked',
    'marketing_web.cta_clicked',
    'marketing_web.outbound_clicked',
    'marketing_web.page_viewed',
    'registry_web.content_opened',
    'registry_web.page_viewed',
    'registry_web.search_performed',
    'registry_web.signup_clicked',
  ]
    .map((event) => `'${event}'`)
    .join(', ');
}

function renderMarkdown({
  alertThresholds,
  actorRows,
  currentRows,
  customerIdentityRows,
  customerRows,
  customerSourceRows,
  dashboardUrl,
  failureRows,
  marketingAttributionRows,
  previousCustomerRows,
  previousRows,
  sourceRows,
}) {
  const current = rowsToMap(currentRows);
  const previous = rowsToMap(previousRows);
  const customer = rowsToMap(customerRows);
  const previousCustomer = rowsToMap(previousCustomerRows);
  const eventNames = [...new Set([...current.keys(), ...previous.keys()])].sort();
  const totalCurrent = sumMap(current);
  const totalPrevious = sumMap(previous);
  const totalCustomer = sumMap(customer);
  const totalPreviousCustomer = sumMap(previousCustomer);
  const totalDelta = totalCurrent - totalPrevious;
  const customerDelta = totalCustomer - totalPreviousCustomer;
  const failureTotal = failureRows.reduce((total, [, count]) => total + (Number(count) || 0), 0);
  const failureRate = totalCurrent > 0 ? failureTotal / totalCurrent : 0;
  const customerIdentities = normalizeCustomerIdentityRows(customerIdentityRows);
  const marketingAttribution = summarizeMarketingAttribution(marketingAttributionRows);
  const alerts = buildOperatingAlerts({
    alertThresholds,
    customerDelta,
    customerIdentities,
    failureRate,
    failureTotal,
    totalCurrent,
    totalCustomer,
    totalPreviousCustomer,
  });

  const lines = [
    '# Decantr Weekly Telemetry Snapshot',
    '',
    `Dashboard: ${dashboardUrl}`,
    '',
    `Total tracked events: ${formatNumber(totalCurrent)} (${formatDelta(totalDelta)} vs previous 7 days)`,
    `Customer-attributed events: ${formatNumber(totalCustomer)} (${formatDelta(customerDelta)} vs previous 7 days)`,
    `Active customer identities: ${formatNumber(customerIdentities.length)}`,
    `Failure signals: ${formatNumber(failureTotal)} (${formatPercent(failureRate)} of tracked events)`,
    '',
    '## Operating Alerts',
    '',
    ...(alerts.length ? alerts.map((alert) => `- ${alert}`) : ['- No alert thresholds triggered.']),
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

  lines.push(
    '',
    '## Marketing Attribution Health',
    '',
    `- Marketing-web events: ${formatNumber(marketingAttribution.summary.totalEvents)}`,
    `- Campaign-attributed events: ${formatNumber(marketingAttribution.summary.campaignAttributedEvents)} (${formatPercent(marketingAttribution.summary.campaignAttributionRate)})`,
    `- Landing-attributed events: ${formatNumber(marketingAttribution.summary.landingAttributedEvents)} (${formatPercent(marketingAttribution.summary.landingAttributionRate)})`,
    `- Attributed registry follow-through events: ${formatNumber(marketingAttribution.summary.registryFollowThroughEvents)}`,
    '',
    ...(marketingAttribution.summary.warnings.length
      ? marketingAttribution.summary.warnings.map((warning) => `- Warning: ${warning}`)
      : ['- No marketing attribution warnings.']),
    '',
    '### Top Campaigns',
    '',
  );
  if (marketingAttribution.campaigns.length === 0) {
    lines.push('No campaign-attributed events were recorded in the last 7 days.');
  } else {
    lines.push('| Campaign | Source | Medium | Events | Views | CTAs | Registry |', '| --- | --- | --- | ---: | ---: | ---: | ---: |');
    for (const row of marketingAttribution.campaigns) {
      lines.push(
        `| ${row.campaign} | ${row.source} | ${row.medium} | ${formatNumber(row.events)} | ${formatNumber(row.pageViews)} | ${formatNumber(row.ctaClicks)} | ${formatNumber(row.registryFollowThroughEvents)} |`,
      );
    }
  }

  lines.push('', '### Top Landing Paths', '');
  if (marketingAttribution.landingPaths.length === 0) {
    lines.push('No landing-path-attributed events were recorded in the last 7 days.');
  } else {
    lines.push('| Landing path | Events | Views | CTAs | Registry |', '| --- | ---: | ---: | ---: | ---: |');
    for (const row of marketingAttribution.landingPaths) {
      lines.push(
        `| \`${row.landingPath}\` | ${formatNumber(row.events)} | ${formatNumber(row.pageViews)} | ${formatNumber(row.ctaClicks)} | ${formatNumber(row.registryFollowThroughEvents)} |`,
      );
    }
  }

  lines.push('', '## Source Mix', '', '| Source | Last 7d |', '| --- | ---: |');
  for (const [source, count] of sourceRows) {
    lines.push(`| ${source || 'unknown'} | ${formatNumber(Number(count) || 0)} |`);
  }

  lines.push('', '## Customer Source Mix', '', '| Source | Last 7d |', '| --- | ---: |');
  for (const [source, count] of customerSourceRows) {
    lines.push(`| ${source || 'unknown'} | ${formatNumber(Number(count) || 0)} |`);
  }

  lines.push(
    '',
    '## Actor Mix',
    '',
    '| Actor type | Source | Last 7d |',
    '| --- | --- | ---: |',
  );
  for (const [actorType, source, count] of actorRows) {
    lines.push(
      `| ${actorType || 'unclassified'} | ${source || 'unknown'} | ${formatNumber(Number(count) || 0)} |`,
    );
  }

  lines.push(
    '',
    '## Active Customer Identities',
    '',
  );
  if (customerIdentities.length === 0) {
    lines.push('No customer-attributed identities were recorded in the last 7 days.');
  } else {
    lines.push('| Identity | Install | Project | Source | Events |', '| --- | --- | --- | --- | ---: |');
    for (const row of customerIdentities) {
      lines.push(
        `| \`${row.distinctId}\` | ${row.installId || 'none'} | ${row.projectId || 'none'} | ${row.source || 'unknown'} | ${formatNumber(row.count)} |`,
      );
    }
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
    `- Paid acquisition signals: ${formatNumber((current.get('marketing_web.page_viewed') ?? 0) + (current.get('marketing_web.cta_clicked') ?? 0) + (current.get('marketing_web.outbound_clicked') ?? 0) + (current.get('marketing_web.command_clicked') ?? 0))}`,
    `- Activation signals: ${formatNumber((current.get('marketing_web.cta_clicked') ?? 0) + (current.get('user.signup.completed') ?? 0) + (current.get('api_key.created') ?? 0))}`,
    `- Customer activation signals: ${formatNumber((customer.get('marketing_web.cta_clicked') ?? 0) + (customer.get('user.signup.completed') ?? 0) + (customer.get('api_key.created') ?? 0))}`,
    `- Registry discovery signals: ${formatNumber((current.get('registry_web.search_performed') ?? 0) + (current.get('registry_web.content_opened') ?? 0) + (current.get('registry.item.resolved') ?? 0))}`,
    `- Customer registry discovery signals: ${formatNumber((customer.get('registry_web.search_performed') ?? 0) + (customer.get('registry_web.content_opened') ?? 0) + (customer.get('registry.item.resolved') ?? 0))}`,
    `- Commercial-intent signals: ${formatNumber((current.get('marketing_web.cta_clicked') ?? 0) + (current.get('registry_web.billing_viewed') ?? 0) + (current.get('registry_web.api_key_page_viewed') ?? 0) + (current.get('registry_web.organization_viewed') ?? 0) + (current.get('org.created') ?? 0))}`,
    `- Customer commercial-intent signals: ${formatNumber((customer.get('marketing_web.cta_clicked') ?? 0) + (customer.get('registry_web.billing_viewed') ?? 0) + (customer.get('registry_web.api_key_page_viewed') ?? 0) + (customer.get('registry_web.organization_viewed') ?? 0) + (customer.get('org.created') ?? 0))}`,
    `- Active customer identities: ${formatNumber(customerIdentities.length)}`,
    `- Failure rate: ${formatPercent(failureRate)}`,
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
  if (query.includes('distinct_id') && query.includes('properties.decantr_install_id as install_id')) {
    return [
      ['install_customer_1', 'install_customer_1', 'project_alpha', 'cli', 18],
      ['user_customer_2', null, 'project_beta', 'api', 7],
    ];
  }
  if (query.includes('properties.attributionUtmCampaign as campaign')) {
    return [
      ['launch-project-health', 'x', 'organic-social', '/', 'marketing_web.page_viewed', 31, '2026-05-08T12:00:00Z'],
      ['launch-project-health', 'x', 'organic-social', '/', 'marketing_web.cta_clicked', 5, '2026-05-08T12:04:00Z'],
      ['launch-project-health', 'x', 'organic-social', '/', 'registry_web.page_viewed', 4, '2026-05-08T12:05:00Z'],
      ['v2-essence4', 'npm', 'package-registry', '/', 'marketing_web.page_viewed', 17, '2026-05-07T12:00:00Z'],
      [null, null, null, '/', 'marketing_web.outbound_clicked', 1, '2026-05-07T12:01:00Z'],
    ];
  }
  if (
    query.includes('properties.decantr_source as source') &&
    query.includes("properties.decantr_actor_type = 'customer'")
  ) {
    return [
      ['cli', 18],
      ['api', 7],
    ];
  }
  if (query.includes('properties.decantr_actor_type as actor_type')) {
    return [
      ['anonymous', 'marketing-web', 54],
      ['anonymous', 'registry-web', 42],
      ['customer', 'api', 25],
      ['official_pipeline', 'content-ci', 12],
    ];
  }
  if (query.includes("properties.decantr_actor_type = 'customer'")) {
    return [
      ['registry.item.resolved', 25],
      ['execution_pack.compiled', 9],
      ['api_key.created', 2],
    ];
  }
  if (query.includes('properties.decantr_source')) {
    return [
      ['marketing-web', 54],
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
      ['marketing_web.page_viewed', 31],
      ['marketing_web.cta_clicked', 4],
      ['registry.item.resolved', 18],
      ['execution_pack.compiled', 8],
      ['registry_web.page_viewed', 11],
    ];
  }
  return [
    ['marketing_web.page_viewed', 48],
    ['marketing_web.cta_clicked', 5],
    ['marketing_web.outbound_clicked', 1],
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

function formatPercent(value) {
  return `${new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
    style: 'percent',
  }).format(value)}`;
}

function formatDelta(value) {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return '0';
}

function normalizeCustomerIdentityRows(rows) {
  return rows.map(([distinctId, installId, projectId, source, count]) => ({
    count: Number(count) || 0,
    distinctId: String(distinctId || 'unknown'),
    installId: installId ? String(installId) : '',
    projectId: projectId ? String(projectId) : '',
    source: source ? String(source) : '',
  }));
}

function summarizeMarketingAttribution(rows) {
  const campaigns = new Map();
  const landingPaths = new Map();
  let totalEvents = 0;
  let campaignAttributedEvents = 0;
  let landingAttributedEvents = 0;
  let registryFollowThroughEvents = 0;
  let ctaClicks = 0;

  for (const [campaignValue, sourceValue, mediumValue, landingValue, eventValue, countValue, lastSeenValue] of rows) {
    const campaignName = stringOrFallback(campaignValue, 'uncategorized');
    const source = stringOrFallback(sourceValue, 'unknown');
    const medium = stringOrFallback(mediumValue, 'unknown');
    const landingPath = stringOrFallback(landingValue, 'unknown');
    const event = String(eventValue || 'unknown');
    const count = Number(countValue) || 0;
    const lastSeen = lastSeenValue ? String(lastSeenValue) : null;
    const isMarketingEvent = event.startsWith('marketing_web.');
    const isRegistryFollowThrough = event.startsWith('registry_web.');
    const hasMarketingAttribution = Boolean(campaignValue || landingValue);

    if (isMarketingEvent) {
      totalEvents += count;
      if (campaignValue) campaignAttributedEvents += count;
      if (landingValue) landingAttributedEvents += count;
      if (event === 'marketing_web.cta_clicked') ctaClicks += count;
    }
    if (isRegistryFollowThrough && hasMarketingAttribution) registryFollowThroughEvents += count;

    const campaignKey = `${campaignName}\u0000${source}\u0000${medium}`;
    const campaign = campaigns.get(campaignKey) ?? {
      campaign: campaignName,
      ctaClicks: 0,
      events: 0,
      lastSeen: null,
      medium,
      pageViews: 0,
      registryFollowThroughEvents: 0,
      source,
    };
    campaign.events += count;
    campaign.lastSeen = newerDate(campaign.lastSeen, lastSeen);
    if (event === 'marketing_web.page_viewed') campaign.pageViews += count;
    if (event === 'marketing_web.cta_clicked') campaign.ctaClicks += count;
    if (isRegistryFollowThrough && hasMarketingAttribution) campaign.registryFollowThroughEvents += count;
    campaigns.set(campaignKey, campaign);

    const landing = landingPaths.get(landingPath) ?? {
      ctaClicks: 0,
      events: 0,
      landingPath,
      lastSeen: null,
      pageViews: 0,
      registryFollowThroughEvents: 0,
    };
    landing.events += count;
    landing.lastSeen = newerDate(landing.lastSeen, lastSeen);
    if (event === 'marketing_web.page_viewed') landing.pageViews += count;
    if (event === 'marketing_web.cta_clicked') landing.ctaClicks += count;
    if (isRegistryFollowThrough && hasMarketingAttribution) landing.registryFollowThroughEvents += count;
    landingPaths.set(landingPath, landing);
  }

  const campaignAttributionRate = totalEvents > 0 ? campaignAttributedEvents / totalEvents : 0;
  const landingAttributionRate = totalEvents > 0 ? landingAttributedEvents / totalEvents : 0;
  const warnings = [];

  if (totalEvents === 0) {
    warnings.push('No marketing-web events were observed.');
  }
  if (totalEvents > 0 && campaignAttributedEvents === 0) {
    warnings.push('No marketing-web events carried UTM campaign attribution.');
  }
  if (totalEvents > 0 && landingAttributionRate < 0.95) {
    warnings.push('Some marketing-web events are missing landing-path attribution.');
  }
  if (ctaClicks > 0 && registryFollowThroughEvents === 0) {
    warnings.push('Marketing CTA clicks exist, but no attributed registry follow-through was observed.');
  }

  return {
    campaigns: [...campaigns.values()]
      .sort((a, b) => b.events - a.events || compareDatesDesc(a.lastSeen, b.lastSeen))
      .slice(0, 8),
    landingPaths: [...landingPaths.values()]
      .sort((a, b) => b.events - a.events || compareDatesDesc(a.lastSeen, b.lastSeen))
      .slice(0, 8),
    summary: {
      campaignAttributedEvents,
      campaignAttributionRate,
      landingAttributedEvents,
      landingAttributionRate,
      registryFollowThroughEvents,
      totalEvents,
      warnings,
    },
  };
}

function stringOrFallback(value, fallback) {
  const text = value == null ? '' : String(value).trim();
  return text || fallback;
}

function newerDate(current, next) {
  if (!current) return next;
  if (!next) return current;
  return Date.parse(next) > Date.parse(current) ? next : current;
}

function compareDatesDesc(left, right) {
  if (!left && !right) return 0;
  if (!left) return 1;
  if (!right) return -1;
  return Date.parse(right) - Date.parse(left);
}

function buildOperatingAlerts({
  alertThresholds,
  customerDelta,
  customerIdentities,
  failureRate,
  failureTotal,
  totalCurrent,
  totalCustomer,
  totalPreviousCustomer,
}) {
  const alerts = [];

  if (totalCurrent === 0) {
    alerts.push('No Decantr telemetry events were recorded in the last 7 days.');
  }

  if (totalCustomer === 0) {
    alerts.push('No customer-attributed telemetry events were recorded in the last 7 days.');
  }

  if (failureTotal >= alertThresholds.failureEvents || failureRate >= alertThresholds.failureRate) {
    alerts.push(
      `Failure signals reached ${formatNumber(failureTotal)} events (${formatPercent(failureRate)}).`,
    );
  }

  if (
    totalPreviousCustomer > 0 &&
    customerDelta < 0 &&
    Math.abs(customerDelta) / totalPreviousCustomer >= alertThresholds.customerDropRate
  ) {
    alerts.push(
      `Customer-attributed events are down ${formatPercent(Math.abs(customerDelta) / totalPreviousCustomer)} week over week.`,
    );
  }

  if (customerIdentities.length > 0) {
    alerts.push(
      `${formatNumber(customerIdentities.length)} active customer identities were observed; review unaliased candidates in /admin/telemetry/usage.`,
    );
  }

  return alerts;
}

function readNumberEnv(key, fallback) {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
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
