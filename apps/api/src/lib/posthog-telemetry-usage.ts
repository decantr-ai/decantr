import {
  DECANTR_TELEMETRY_ACTOR_TYPES,
  DECANTR_TELEMETRY_EVENT_NAMES,
  type TelemetryActorType,
  type TelemetrySource,
} from '@decantr/telemetry';

export const TELEMETRY_USAGE_SOURCES = [
  'api',
  'cli',
  'content-ci',
  'marketing-web',
  'mcp',
  'registry-web',
] as const;
export const TELEMETRY_USAGE_DAY_RANGES = [1, 7, 14, 30, 90] as const;

const POSTHOG_QUERY_TIMEOUT_MS = 8_000;
const DEFAULT_POSTHOG_QUERY_HOST = 'https://us.posthog.com';
const TELEMETRY_SIGNAL_BUCKETS = [
  {
    key: 'activation',
    label: 'Activation',
    events: ['marketing_web.cta_clicked', 'user.signup.completed', 'api_key.created'],
  },
  {
    key: 'paid_acquisition',
    label: 'Paid acquisition',
    events: [
      'marketing_web.page_viewed',
      'marketing_web.cta_clicked',
      'marketing_web.outbound_clicked',
      'marketing_web.command_clicked',
    ],
  },
  {
    key: 'registry_discovery',
    label: 'Registry discovery',
    events: ['registry_web.search_performed', 'registry_web.content_opened', 'registry.item.resolved'],
  },
  {
    key: 'cli_adoption',
    label: 'CLI adoption',
    events: ['cli.command.completed', 'registry.sync.completed'],
  },
  {
    key: 'hosted_intelligence',
    label: 'Hosted intelligence',
    events: ['execution_pack.compiled', 'execution_pack.selected', 'critique.completed', 'audit.completed'],
  },
  {
    key: 'content_pipeline',
    label: 'Content pipeline',
    events: ['content.validation.completed', 'content.publish.completed'],
  },
  {
    key: 'commercial_intent',
    label: 'Commercial intent',
    events: [
      'marketing_web.cta_clicked',
      'registry_web.billing_viewed',
      'registry_web.api_key_page_viewed',
      'registry_web.organization_viewed',
      'org.created',
    ],
  },
] as const;

export type TelemetryUsageSource = (typeof TELEMETRY_USAGE_SOURCES)[number];

export interface TelemetryAliasIdentityRef {
  identity_id: string;
  identity_type: 'anonymous' | 'install' | 'project';
}

export interface PostHogTelemetryUsageConfig {
  apiKey: string;
  host: string;
  projectId: string;
}

export interface TelemetryUsageEventCount {
  actor_type: string;
  count: number;
  event: string;
}

export interface TelemetryUsageSourceCount {
  count: number;
  source: string;
}

export interface TelemetryUsageActorCount {
  actor_type: string;
  count: number;
  source: string;
}

export interface TelemetryUsageFailureCount {
  count: number;
  event: string;
}

export interface TelemetryUsageActiveIdentity {
  actor_type: string;
  anonymous_id: string | null;
  distinct_id: string;
  events: number;
  install_id: string | null;
  last_seen: string | null;
  org_id: string | null;
  project_id: string | null;
  source: string;
}

export interface TelemetryAttributionOrganization {
  id: string;
  is_internal: boolean;
  is_test: boolean;
  name: string;
  slug: string;
  tier: 'team' | 'enterprise';
}

export interface TelemetryAttributionRow {
  actor_type: string;
  events: number;
  last_seen: string | null;
  org_id: string | null;
  organization: TelemetryAttributionOrganization | null;
  project_id: string | null;
  source: string;
}

interface TelemetryMarketingAttributionRow {
  campaign: string | null;
  count: number;
  event: string;
  landing_path: string | null;
  last_seen: string | null;
  medium: string | null;
  source: string | null;
}

export interface TelemetryUsageCandidateAlias {
  actor_type: string;
  events: number;
  identity_id: string;
  identity_type: 'anonymous' | 'install' | 'project';
  last_seen: string | null;
  sources: string[];
}

export interface TelemetryUsageSummary {
  active_anonymous_ids: number;
  active_identities: number;
  active_installs: number;
  active_orgs: number;
  active_projects: number;
  anonymous_events: number;
  candidate_aliases: number;
  customer_events: number;
  failure_events: number;
  internal_events: number;
  official_pipeline_events: number;
  service_events: number;
  total_events: number;
  unclassified_events: number;
}

export interface TelemetryUsageTrend {
  change_rate: number | null;
  current: number;
  delta: number;
  previous: number;
}

export interface TelemetryUsageSignalBucket {
  change_rate: number | null;
  current_events: number;
  delta: number;
  key: string;
  label: string;
  previous_events: number;
}

export interface TelemetryMarketingCampaignSummary {
  campaign: string;
  cta_clicks: number;
  events: number;
  last_seen: string | null;
  medium: string;
  page_views: number;
  registry_follow_through_events: number;
  signup_clicks: number;
  source: string;
}

export interface TelemetryMarketingLandingSummary {
  cta_clicks: number;
  events: number;
  landing_path: string;
  last_seen: string | null;
  page_views: number;
  registry_follow_through_events: number;
}

export interface TelemetryMarketingAttributionSummary {
  campaign_attributed_events: number;
  campaign_attribution_rate: number;
  landing_attributed_events: number;
  landing_attribution_rate: number;
  registry_follow_through_events: number;
  total_events: number;
  warnings: string[];
}

export interface TelemetryUsageOperatingAlert {
  detail: string;
  level: 'critical' | 'info' | 'warning';
  title: string;
}

export interface AdminTelemetryUsageResponse {
  actor_type: TelemetryActorType | null;
  active_identities: TelemetryUsageActiveIdentity[];
  actor_mix: TelemetryUsageActorCount[];
  candidate_aliases: TelemetryUsageCandidateAlias[];
  event_counts: TelemetryUsageEventCount[];
  failure_counts: TelemetryUsageFailureCount[];
  generated_at: string;
  marketing_attribution: TelemetryMarketingAttributionSummary;
  marketing_campaigns: TelemetryMarketingCampaignSummary[];
  marketing_landing_paths: TelemetryMarketingLandingSummary[];
  operating_alerts: TelemetryUsageOperatingAlert[];
  previous_summary: TelemetryUsageSummary;
  range_days: number;
  signal_buckets: TelemetryUsageSignalBucket[];
  source: TelemetryUsageSource | null;
  source_mix: TelemetryUsageSourceCount[];
  summary: TelemetryUsageSummary;
  trends: {
    active_identities: TelemetryUsageTrend;
    active_installs: TelemetryUsageTrend;
    active_projects: TelemetryUsageTrend;
    customer_events: TelemetryUsageTrend;
    failure_events: TelemetryUsageTrend;
    failure_rate: TelemetryUsageTrend;
    total_events: TelemetryUsageTrend;
  };
}

export interface AdminTelemetryAttributionResponse {
  actor_type: TelemetryActorType | null;
  generated_at: string;
  range_days: number;
  rows: TelemetryAttributionRow[];
  source: TelemetryUsageSource | null;
  summary: {
    active_orgs: number;
    active_projects: number;
    attributed_events: number;
    result_limit: number;
    returned_events: number;
    returned_rows: number;
    scanned_rows: number;
    total_events: number;
    unattributed_events: number;
  };
}

class PostHogTelemetryUsageError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'PostHogTelemetryUsageError';
  }
}

export function isTelemetryUsageSource(value: unknown): value is TelemetryUsageSource {
  return (
    typeof value === 'string' &&
    (TELEMETRY_USAGE_SOURCES as readonly string[]).includes(value)
  );
}

export function parseTelemetryUsageDays(value: string | undefined): number {
  const parsed = Number.parseInt(value ?? '7', 10);
  return TELEMETRY_USAGE_DAY_RANGES.includes(parsed as (typeof TELEMETRY_USAGE_DAY_RANGES)[number])
    ? parsed
    : 7;
}

export function getPostHogTelemetryUsageConfig(
  env: NodeJS.ProcessEnv = process.env,
): { config: PostHogTelemetryUsageConfig } | { error: string; missing: string[] } {
  const projectId = (env.POSTHOG_ENVIRONMENT_ID || env.POSTHOG_PROJECT_ID || '').trim();
  const apiKey = env.POSTHOG_PERSONAL_API_KEY?.trim() ?? '';
  const rawHost = (
    env.POSTHOG_QUERY_HOST ||
    env.POSTHOG_APP_HOST ||
    env.POSTHOG_HOST ||
    DEFAULT_POSTHOG_QUERY_HOST
  ).trim();
  const host = normalizePostHogQueryHost(rawHost);
  const missing: string[] = [];

  if (!projectId) missing.push('POSTHOG_ENVIRONMENT_ID');
  if (!apiKey) missing.push('POSTHOG_PERSONAL_API_KEY');
  if (!host) missing.push('POSTHOG_QUERY_HOST');

  if (missing.length) {
    return {
      error: 'PostHog query environment is not configured',
      missing,
    };
  }

  if (projectId.startsWith('phc_')) {
    return {
      error: 'POSTHOG_ENVIRONMENT_ID must be the numeric PostHog project id, not the phc_ ingestion key',
      missing: ['POSTHOG_ENVIRONMENT_ID'],
    };
  }

  if (!/^https?:\/\//i.test(host)) {
    return {
      error: 'POSTHOG_QUERY_HOST must be an absolute PostHog app URL',
      missing: ['POSTHOG_QUERY_HOST'],
    };
  }

  return {
    config: {
      apiKey,
      host,
      projectId,
    },
  };
}

export async function fetchPostHogTelemetryUsage(input: {
  actorType?: TelemetryActorType;
  config: PostHogTelemetryUsageConfig;
  days: number;
  existingAliases: TelemetryAliasIdentityRef[];
  source?: TelemetrySource;
}): Promise<AdminTelemetryUsageResponse> {
  const filters = {
    actorType: input.actorType,
    days: input.days,
    source: input.source,
  };

  const [
    eventCounts,
    previousEventCounts,
    sourceMix,
    actorMix,
    failureCounts,
    previousFailureCounts,
    activeIdentities,
    previousActiveIdentities,
    marketingAttributionRows,
  ] = await Promise.all([
    runHogQl(input.config, eventCountsQuery(filters)),
    runHogQl(input.config, eventCountsQuery({ ...filters, offsetDays: input.days })),
    runHogQl(input.config, sourceMixQuery(filters)),
    runHogQl(input.config, actorMixQuery(filters)),
    runHogQl(input.config, failureCountsQuery(filters)),
    runHogQl(input.config, failureCountsQuery({ ...filters, offsetDays: input.days })),
    runHogQl(input.config, activeIdentitiesQuery(filters)),
    runHogQl(input.config, activeIdentitiesQuery({ ...filters, offsetDays: input.days })),
    runHogQl(input.config, marketingAttributionRowsQuery(filters)),
  ]);

  const eventRows = eventCounts.map(toEventCount);
  const previousEventRows = previousEventCounts.map(toEventCount);
  const sourceRows = sourceMix.map(toSourceCount);
  const actorRows = actorMix.map(toActorCount);
  const failureRows = failureCounts.map(toFailureCount);
  const previousFailureRows = previousFailureCounts.map(toFailureCount);
  const activeRows = activeIdentities.map(toActiveIdentity);
  const previousActiveRows = previousActiveIdentities.map(toActiveIdentity);
  const candidateAliases = collectCandidateAliases(activeRows, input.existingAliases);
  const previousSummary = summarizeUsage({
    activeRows: previousActiveRows,
    candidateAliases: [],
    eventRows: previousEventRows,
    failureRows: previousFailureRows,
  });
  const summary = summarizeUsage({
    activeRows,
    candidateAliases,
    eventRows,
    failureRows,
  });
  const trends = buildUsageTrends(summary, previousSummary);
  const signalBuckets = buildSignalBuckets(eventRows, previousEventRows);
  const marketingAttribution = buildMarketingAttribution(marketingAttributionRows.map(toMarketingAttributionRow));

  return {
    actor_type: input.actorType ?? null,
    active_identities: activeRows,
    actor_mix: actorRows,
    candidate_aliases: candidateAliases,
    event_counts: eventRows,
    failure_counts: failureRows,
    generated_at: new Date().toISOString(),
    marketing_attribution: marketingAttribution.summary,
    marketing_campaigns: marketingAttribution.campaigns,
    marketing_landing_paths: marketingAttribution.landingPaths,
    operating_alerts: buildOperatingAlerts({
      candidateAliases,
      signalBuckets,
      summary,
      trends,
    }),
    previous_summary: previousSummary,
    range_days: input.days,
    signal_buckets: signalBuckets,
    source: (input.source as TelemetryUsageSource | undefined) ?? null,
    source_mix: sourceRows,
    summary,
    trends,
  };
}

export async function fetchPostHogTelemetryAttribution(input: {
  actorType?: TelemetryActorType;
  config: PostHogTelemetryUsageConfig;
  days: number;
  limit: number;
  source?: TelemetrySource;
}): Promise<AdminTelemetryAttributionResponse> {
  const resultLimit = 500;
  const filters = {
    actorType: input.actorType,
    days: input.days,
    source: input.source,
  };
  const rawRows = await runHogQl(input.config, attributionRowsQuery(filters, resultLimit));
  const scannedRows = rawRows.map(toAttributionRow);
  const rows = scannedRows.slice(0, input.limit);

  return {
    actor_type: input.actorType ?? null,
    generated_at: new Date().toISOString(),
    range_days: input.days,
    rows,
    source: (input.source as TelemetryUsageSource | undefined) ?? null,
    summary: summarizeAttribution(scannedRows, rows, resultLimit),
  };
}

export function isPostHogTelemetryUsageError(error: unknown): error is PostHogTelemetryUsageError {
  return error instanceof PostHogTelemetryUsageError;
}

function normalizePostHogQueryHost(host: string): string {
  const trimmed = host.replace(/\/+$/, '');
  if (!trimmed) return '';
  return trimmed.replace('.i.posthog.com', '.posthog.com');
}

async function runHogQl(config: PostHogTelemetryUsageConfig, query: string): Promise<unknown[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), POSTHOG_QUERY_TIMEOUT_MS);

  try {
    const response = await fetch(`${config.host}/api/projects/${encodeURIComponent(config.projectId)}/query/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: {
          kind: 'HogQLQuery',
          query,
        },
      }),
      signal: controller.signal,
    });

    const text = await response.text();
    const body = text ? parseJson(text) : {};

    if (!response.ok) {
      const message = typeof body === 'object' && body !== null ? JSON.stringify(body) : text.slice(0, 600);
      throw new PostHogTelemetryUsageError(
        `PostHog query failed ${response.status} ${response.statusText}: ${message}`,
        response.status,
      );
    }

    return Array.isArray((body as { results?: unknown[] }).results)
      ? (body as { results: unknown[] }).results
      : [];
  } catch (error) {
    if (error instanceof PostHogTelemetryUsageError) {
      throw error;
    }
    throw new PostHogTelemetryUsageError(
      error instanceof Error ? error.message : 'PostHog query failed',
    );
  } finally {
    clearTimeout(timeout);
  }
}

function eventCountsQuery(filters: { actorType?: TelemetryActorType; days: number; offsetDays?: number; source?: TelemetrySource }) {
  return `
    select
      event,
      properties.decantr_actor_type as actor_type,
      count() as count
    from events
    where ${timeRangeSql(filters)}
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by event, actor_type
    order by count desc
    limit 100
  `;
}

function sourceMixQuery(filters: { actorType?: TelemetryActorType; days: number; offsetDays?: number; source?: TelemetrySource }) {
  return `
    select
      properties.decantr_source as source,
      count() as count
    from events
    where ${timeRangeSql(filters)}
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by source
    order by count desc
    limit 50
  `;
}

function actorMixQuery(filters: { actorType?: TelemetryActorType; days: number; offsetDays?: number; source?: TelemetrySource }) {
  return `
    select
      properties.decantr_actor_type as actor_type,
      properties.decantr_source as source,
      count() as count
    from events
    where ${timeRangeSql(filters)}
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by actor_type, source
    order by count desc
    limit 100
  `;
}

function failureCountsQuery(filters: { actorType?: TelemetryActorType; days: number; offsetDays?: number; source?: TelemetrySource }) {
  return `
    select
      event,
      count() as count
    from events
    where ${timeRangeSql(filters)}
      and event in (${eventListSql()})
      ${filterSql(filters)}
      and (properties.success = false or properties.valid = false)
    group by event
    order by count desc
    limit 50
  `;
}

function activeIdentitiesQuery(filters: { actorType?: TelemetryActorType; days: number; offsetDays?: number; source?: TelemetrySource }) {
  return `
    select
      distinct_id,
      properties.decantr_actor_type as actor_type,
      properties.decantr_source as source,
      properties.decantr_install_id as install_id,
      properties.decantr_project_id as project_id,
      properties.decantr_anonymous_id as anonymous_id,
      properties.decantr_org_id as org_id,
      count() as events,
      max(timestamp) as last_seen
    from events
    where ${timeRangeSql(filters)}
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by distinct_id, actor_type, source, install_id, project_id, anonymous_id, org_id
    order by events desc
    limit 100
  `;
}

function marketingAttributionRowsQuery(filters: { actorType?: TelemetryActorType; days: number; offsetDays?: number; source?: TelemetrySource }) {
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
    where ${timeRangeSql(filters)}
      and event in (${marketingAttributionEventListSql()})
      ${filterSql(filters)}
    group by campaign, source, medium, landing_path, event
    order by count desc
    limit 300
  `;
}

function attributionRowsQuery(
  filters: { actorType?: TelemetryActorType; days: number; offsetDays?: number; source?: TelemetrySource },
  limit: number,
) {
  return `
    select
      properties.decantr_org_id as org_id,
      properties.decantr_project_id as project_id,
      properties.decantr_source as source,
      properties.decantr_actor_type as actor_type,
      count() as events,
      max(timestamp) as last_seen
    from events
    where ${timeRangeSql(filters)}
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by org_id, project_id, source, actor_type
    order by events desc
    limit ${limit}
  `;
}

function timeRangeSql(filters: { days: number; offsetDays?: number }) {
  const offsetDays = filters.offsetDays ?? 0;
  const startDays = filters.days + offsetDays;
  if (offsetDays > 0) {
    return `timestamp >= now() - interval ${startDays} day
      and timestamp < now() - interval ${offsetDays} day`;
  }
  return `timestamp >= now() - interval ${filters.days} day`;
}

function filterSql(filters: { actorType?: TelemetryActorType; source?: TelemetrySource }) {
  const clauses: string[] = [];
  if (filters.actorType) {
    clauses.push(`and properties.decantr_actor_type = ${sqlString(filters.actorType)}`);
  }
  if (filters.source) {
    clauses.push(`and properties.decantr_source = ${sqlString(filters.source)}`);
  }
  return clauses.join('\n      ');
}

function eventListSql() {
  return DECANTR_TELEMETRY_EVENT_NAMES.map(sqlString).join(', ');
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
  ].map(sqlString).join(', ');
}

function sqlString(value: string) {
  return `'${value.replace(/'/g, "''")}'`;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

function toEventCount(row: unknown): TelemetryUsageEventCount {
  return {
    event: readCellString(row, 0, 'event') ?? 'unknown',
    actor_type: normalizeActorType(readCellString(row, 1, 'actor_type')),
    count: readCellNumber(row, 2, 'count'),
  };
}

function toSourceCount(row: unknown): TelemetryUsageSourceCount {
  return {
    source: readCellString(row, 0, 'source') ?? 'unknown',
    count: readCellNumber(row, 1, 'count'),
  };
}

function toActorCount(row: unknown): TelemetryUsageActorCount {
  return {
    actor_type: normalizeActorType(readCellString(row, 0, 'actor_type')),
    source: readCellString(row, 1, 'source') ?? 'unknown',
    count: readCellNumber(row, 2, 'count'),
  };
}

function toFailureCount(row: unknown): TelemetryUsageFailureCount {
  return {
    event: readCellString(row, 0, 'event') ?? 'unknown',
    count: readCellNumber(row, 1, 'count'),
  };
}

function toActiveIdentity(row: unknown): TelemetryUsageActiveIdentity {
  return {
    distinct_id: readCellString(row, 0, 'distinct_id') ?? 'unknown',
    actor_type: normalizeActorType(readCellString(row, 1, 'actor_type')),
    source: readCellString(row, 2, 'source') ?? 'unknown',
    install_id: readCellString(row, 3, 'install_id'),
    project_id: readCellString(row, 4, 'project_id'),
    anonymous_id: readCellString(row, 5, 'anonymous_id'),
    org_id: readCellString(row, 6, 'org_id'),
    events: readCellNumber(row, 7, 'events'),
    last_seen: readCellString(row, 8, 'last_seen'),
  };
}

function toMarketingAttributionRow(row: unknown): TelemetryMarketingAttributionRow {
  return {
    campaign: readCellString(row, 0, 'campaign'),
    source: readCellString(row, 1, 'source'),
    medium: readCellString(row, 2, 'medium'),
    landing_path: readCellString(row, 3, 'landing_path'),
    event: readCellString(row, 4, 'event') ?? 'unknown',
    count: readCellNumber(row, 5, 'count'),
    last_seen: readCellString(row, 6, 'last_seen'),
  };
}

function toAttributionRow(row: unknown): TelemetryAttributionRow {
  return {
    org_id: readCellString(row, 0, 'org_id'),
    project_id: readCellString(row, 1, 'project_id'),
    source: readCellString(row, 2, 'source') ?? 'unknown',
    actor_type: normalizeActorType(readCellString(row, 3, 'actor_type')),
    events: readCellNumber(row, 4, 'events'),
    last_seen: readCellString(row, 5, 'last_seen'),
    organization: null,
  };
}

function readCell(row: unknown, index: number, key: string): unknown {
  if (Array.isArray(row)) {
    return row[index];
  }

  if (row && typeof row === 'object') {
    return (row as Record<string, unknown>)[key];
  }

  return undefined;
}

function readCellString(row: unknown, index: number, key: string): string | null {
  const value = readCell(row, index, key);
  if (value === undefined || value === null) return null;
  const text = String(value).trim();
  return text ? text : null;
}

function readCellNumber(row: unknown, index: number, key: string): number {
  const value = readCell(row, index, key);
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeActorType(actorType: string | null): string {
  if (!actorType) return 'unclassified';
  return DECANTR_TELEMETRY_ACTOR_TYPES.includes(actorType as TelemetryActorType)
    ? actorType
    : 'unclassified';
}

function summarizeUsage(input: {
  activeRows: TelemetryUsageActiveIdentity[];
  candidateAliases: TelemetryUsageCandidateAlias[];
  eventRows: TelemetryUsageEventCount[];
  failureRows: TelemetryUsageFailureCount[];
}): TelemetryUsageSummary {
  const activeDistinctIds = new Set<string>();
  const activeInstallIds = new Set<string>();
  const activeProjectIds = new Set<string>();
  const activeAnonymousIds = new Set<string>();
  const activeOrgIds = new Set<string>();

  for (const row of input.activeRows) {
    if (row.distinct_id) activeDistinctIds.add(row.distinct_id);
    if (row.install_id) activeInstallIds.add(row.install_id);
    if (row.project_id) activeProjectIds.add(row.project_id);
    if (row.anonymous_id) activeAnonymousIds.add(row.anonymous_id);
    if (row.org_id) activeOrgIds.add(row.org_id);
  }

  return {
    active_anonymous_ids: activeAnonymousIds.size,
    active_identities: activeDistinctIds.size,
    active_installs: activeInstallIds.size,
    active_orgs: activeOrgIds.size,
    active_projects: activeProjectIds.size,
    anonymous_events: sumEventRows(input.eventRows, 'anonymous'),
    candidate_aliases: input.candidateAliases.length,
    customer_events: sumEventRows(input.eventRows, 'customer'),
    failure_events: input.failureRows.reduce((total, row) => total + row.count, 0),
    internal_events: sumEventRows(input.eventRows, 'internal'),
    official_pipeline_events: sumEventRows(input.eventRows, 'official_pipeline'),
    service_events: sumEventRows(input.eventRows, 'service'),
    total_events: input.eventRows.reduce((total, row) => total + row.count, 0),
    unclassified_events: input.eventRows.reduce((total, row) => total + (row.actor_type === 'unclassified' ? row.count : 0), 0),
  };
}

function sumEventRows(rows: TelemetryUsageEventCount[], actorType: TelemetryActorType) {
  return rows.reduce((total, row) => total + (row.actor_type === actorType ? row.count : 0), 0);
}

function summarizeAttribution(
  scannedRows: TelemetryAttributionRow[],
  returnedRows: TelemetryAttributionRow[],
  resultLimit: number,
): AdminTelemetryAttributionResponse['summary'] {
  const activeOrgIds = new Set<string>();
  const activeProjectIds = new Set<string>();
  let attributedEvents = 0;
  let totalEvents = 0;

  for (const row of scannedRows) {
    totalEvents += row.events;
    if (row.org_id) activeOrgIds.add(row.org_id);
    if (row.project_id) activeProjectIds.add(row.project_id);
    if (row.org_id || row.project_id) {
      attributedEvents += row.events;
    }
  }

  return {
    active_orgs: activeOrgIds.size,
    active_projects: activeProjectIds.size,
    attributed_events: attributedEvents,
    result_limit: resultLimit,
    returned_events: returnedRows.reduce((total, row) => total + row.events, 0),
    returned_rows: returnedRows.length,
    scanned_rows: scannedRows.length,
    total_events: totalEvents,
    unattributed_events: totalEvents - attributedEvents,
  };
}

function buildMarketingAttribution(rows: TelemetryMarketingAttributionRow[]): {
  campaigns: TelemetryMarketingCampaignSummary[];
  landingPaths: TelemetryMarketingLandingSummary[];
  summary: TelemetryMarketingAttributionSummary;
} {
  const campaigns = new Map<string, TelemetryMarketingCampaignSummary>();
  const landingPaths = new Map<string, TelemetryMarketingLandingSummary>();
  let totalMarketingEvents = 0;
  let campaignAttributedEvents = 0;
  let landingAttributedEvents = 0;
  let registryFollowThroughEvents = 0;
  let ctaClicks = 0;

  for (const row of rows) {
    const count = row.count;
    const isMarketingEvent = row.event.startsWith('marketing_web.');
    const isRegistryFollowThrough = row.event.startsWith('registry_web.');
    const hasMarketingAttribution = Boolean(row.campaign || row.landing_path);
    if (isMarketingEvent) {
      totalMarketingEvents += count;
      if (row.campaign) campaignAttributedEvents += count;
      if (row.landing_path) landingAttributedEvents += count;
      if (row.event === 'marketing_web.cta_clicked') ctaClicks += count;
    }
    if (isRegistryFollowThrough && hasMarketingAttribution) registryFollowThroughEvents += count;

    const campaignKey = [
      attributionValue(row.campaign, 'uncategorized'),
      attributionValue(row.source, 'unknown'),
      attributionValue(row.medium, 'unknown'),
    ].join('\u0000');
    const campaign = campaigns.get(campaignKey) ?? {
      campaign: attributionValue(row.campaign, 'uncategorized'),
      cta_clicks: 0,
      events: 0,
      last_seen: null,
      medium: attributionValue(row.medium, 'unknown'),
      page_views: 0,
      registry_follow_through_events: 0,
      signup_clicks: 0,
      source: attributionValue(row.source, 'unknown'),
    };
    campaign.events += count;
    campaign.last_seen = newerDate(campaign.last_seen, row.last_seen);
    if (row.event === 'marketing_web.page_viewed') campaign.page_views += count;
    if (row.event === 'marketing_web.cta_clicked') campaign.cta_clicks += count;
    if (isRegistryFollowThrough && hasMarketingAttribution) campaign.registry_follow_through_events += count;
    if (row.event === 'registry_web.signup_clicked') campaign.signup_clicks += count;
    campaigns.set(campaignKey, campaign);

    const landingPath = attributionValue(row.landing_path, 'unknown');
    const landing = landingPaths.get(landingPath) ?? {
      cta_clicks: 0,
      events: 0,
      landing_path: landingPath,
      last_seen: null,
      page_views: 0,
      registry_follow_through_events: 0,
    };
    landing.events += count;
    landing.last_seen = newerDate(landing.last_seen, row.last_seen);
    if (row.event === 'marketing_web.page_viewed') landing.page_views += count;
    if (row.event === 'marketing_web.cta_clicked') landing.cta_clicks += count;
    if (isRegistryFollowThrough && hasMarketingAttribution) landing.registry_follow_through_events += count;
    landingPaths.set(landingPath, landing);
  }

  const campaignAttributionRate = totalMarketingEvents > 0
    ? campaignAttributedEvents / totalMarketingEvents
    : 0;
  const landingAttributionRate = totalMarketingEvents > 0
    ? landingAttributedEvents / totalMarketingEvents
    : 0;
  const warnings: string[] = [];

  if (totalMarketingEvents === 0) {
    warnings.push('No marketing-web events were observed for this filter and period.');
  }
  if (totalMarketingEvents > 0 && campaignAttributedEvents === 0) {
    warnings.push('No marketing-web events carried UTM campaign attribution.');
  }
  if (totalMarketingEvents > 0 && landingAttributionRate < 0.95) {
    warnings.push('Some marketing-web events are missing landing-path attribution.');
  }
  if (ctaClicks > 0 && registryFollowThroughEvents === 0) {
    warnings.push('Marketing CTA clicks exist, but no attributed registry follow-through was observed.');
  }

  return {
    campaigns: [...campaigns.values()]
      .sort((a, b) => b.events - a.events || compareNullableDatesDesc(a.last_seen, b.last_seen))
      .slice(0, 10),
    landingPaths: [...landingPaths.values()]
      .sort((a, b) => b.events - a.events || compareNullableDatesDesc(a.last_seen, b.last_seen))
      .slice(0, 10),
    summary: {
      campaign_attributed_events: campaignAttributedEvents,
      campaign_attribution_rate: campaignAttributionRate,
      landing_attributed_events: landingAttributedEvents,
      landing_attribution_rate: landingAttributionRate,
      registry_follow_through_events: registryFollowThroughEvents,
      total_events: totalMarketingEvents,
      warnings,
    },
  };
}

function attributionValue(value: string | null, fallback: string) {
  return value?.trim() || fallback;
}

function buildUsageTrends(
  summary: TelemetryUsageSummary,
  previousSummary: TelemetryUsageSummary,
): AdminTelemetryUsageResponse['trends'] {
  const currentFailureRate = summary.total_events > 0 ? summary.failure_events / summary.total_events : 0;
  const previousFailureRate = previousSummary.total_events > 0
    ? previousSummary.failure_events / previousSummary.total_events
    : 0;

  return {
    active_identities: buildTrend(summary.active_identities, previousSummary.active_identities),
    active_installs: buildTrend(summary.active_installs, previousSummary.active_installs),
    active_projects: buildTrend(summary.active_projects, previousSummary.active_projects),
    customer_events: buildTrend(summary.customer_events, previousSummary.customer_events),
    failure_events: buildTrend(summary.failure_events, previousSummary.failure_events),
    failure_rate: buildTrend(currentFailureRate, previousFailureRate),
    total_events: buildTrend(summary.total_events, previousSummary.total_events),
  };
}

function buildTrend(current: number, previous: number): TelemetryUsageTrend {
  return {
    change_rate: previous > 0 ? (current - previous) / previous : null,
    current,
    delta: current - previous,
    previous,
  };
}

function buildSignalBuckets(
  eventRows: TelemetryUsageEventCount[],
  previousEventRows: TelemetryUsageEventCount[],
): TelemetryUsageSignalBucket[] {
  const current = rowsToEventTotals(eventRows);
  const previous = rowsToEventTotals(previousEventRows);

  return TELEMETRY_SIGNAL_BUCKETS.map((bucket) => {
    const currentEvents = sumEvents(current, bucket.events);
    const previousEvents = sumEvents(previous, bucket.events);
    return {
      change_rate: previousEvents > 0 ? (currentEvents - previousEvents) / previousEvents : null,
      current_events: currentEvents,
      delta: currentEvents - previousEvents,
      key: bucket.key,
      label: bucket.label,
      previous_events: previousEvents,
    };
  });
}

function rowsToEventTotals(rows: TelemetryUsageEventCount[]) {
  const totals = new Map<string, number>();
  for (const row of rows) {
    totals.set(row.event, (totals.get(row.event) ?? 0) + row.count);
  }
  return totals;
}

function sumEvents(totals: Map<string, number>, events: readonly string[]) {
  return events.reduce((total, event) => total + (totals.get(event) ?? 0), 0);
}

function buildOperatingAlerts(input: {
  candidateAliases: TelemetryUsageCandidateAlias[];
  signalBuckets: TelemetryUsageSignalBucket[];
  summary: TelemetryUsageSummary;
  trends: AdminTelemetryUsageResponse['trends'];
}): TelemetryUsageOperatingAlert[] {
  const alerts: TelemetryUsageOperatingAlert[] = [];
  const failureRate = input.trends.failure_rate.current;
  const commercialIntent = input.signalBuckets.find((bucket) => bucket.key === 'commercial_intent');
  const activation = input.signalBuckets.find((bucket) => bucket.key === 'activation');

  if (input.summary.total_events === 0) {
    alerts.push({
      level: 'critical',
      title: 'No telemetry in range',
      detail: 'No Decantr telemetry events were recorded for this filter and period.',
    });
  }

  if (input.summary.failure_events >= 3 || failureRate >= 0.05) {
    alerts.push({
      level: failureRate >= 0.1 ? 'critical' : 'warning',
      title: 'Failure signals elevated',
      detail: `${input.summary.failure_events} failure events represent ${formatRate(failureRate)} of tracked events.`,
    });
  }

  if (
    input.trends.customer_events.previous > 0 &&
    input.trends.customer_events.change_rate !== null &&
    input.trends.customer_events.change_rate <= -0.25
  ) {
    alerts.push({
      level: 'warning',
      title: 'Customer usage down',
      detail: `Customer-attributed events changed ${formatSignedRate(input.trends.customer_events.change_rate)} versus the previous period.`,
    });
  }

  if (input.candidateAliases.length > 0) {
    alerts.push({
      level: 'info',
      title: 'Unaliased identities found',
      detail: `${input.candidateAliases.length} active identities need customer/internal classification review.`,
    });
  }

  if (activation && activation.current_events > 0 && activation.previous_events === 0) {
    alerts.push({
      level: 'info',
      title: 'Activation detected',
      detail: `${activation.current_events} activation events appeared with no previous-period baseline.`,
    });
  }

  if (commercialIntent && commercialIntent.current_events > commercialIntent.previous_events) {
    alerts.push({
      level: 'info',
      title: 'Commercial intent rising',
      detail: `Commercial-intent events are ${formatSignedNumber(commercialIntent.delta)} versus the previous period.`,
    });
  }

  return alerts;
}

function formatRate(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

function formatSignedRate(value: number) {
  return `${value >= 0 ? '+' : ''}${formatRate(value)}`;
}

function formatSignedNumber(value: number) {
  return `${value >= 0 ? '+' : ''}${value}`;
}

function collectCandidateAliases(
  activeRows: TelemetryUsageActiveIdentity[],
  existingAliases: TelemetryAliasIdentityRef[],
): TelemetryUsageCandidateAlias[] {
  const existingAliasKeys = new Set(
    existingAliases.map((alias) => `${alias.identity_type}:${alias.identity_id}`),
  );
  const candidates = new Map<string, TelemetryUsageCandidateAlias & { sourceSet: Set<string> }>();

  for (const row of activeRows) {
    addCandidate(candidates, existingAliasKeys, 'install', row.install_id, row);
    addCandidate(candidates, existingAliasKeys, 'project', row.project_id, row);
    addCandidate(
      candidates,
      existingAliasKeys,
      'anonymous',
      row.anonymous_id ?? (row.actor_type === 'anonymous' ? row.distinct_id : null),
      row,
    );
  }

  return [...candidates.values()]
    .map((candidate) => ({
      actor_type: candidate.actor_type,
      events: candidate.events,
      identity_id: candidate.identity_id,
      identity_type: candidate.identity_type,
      last_seen: candidate.last_seen,
      sources: [...candidate.sourceSet].sort(),
    }))
    .sort((a, b) => b.events - a.events || compareNullableDatesDesc(a.last_seen, b.last_seen))
    .slice(0, 50);
}

function addCandidate(
  candidates: Map<string, TelemetryUsageCandidateAlias & { sourceSet: Set<string> }>,
  existingAliasKeys: Set<string>,
  identityType: TelemetryUsageCandidateAlias['identity_type'],
  identityId: string | null,
  row: TelemetryUsageActiveIdentity,
) {
  if (!identityId) return;
  const key = `${identityType}:${identityId}`;
  if (existingAliasKeys.has(key)) return;

  const existing = candidates.get(key);
  if (!existing) {
    candidates.set(key, {
      actor_type: row.actor_type,
      events: row.events,
      identity_id: identityId,
      identity_type: identityType,
      last_seen: row.last_seen,
      sourceSet: new Set([row.source]),
      sources: [row.source],
    });
    return;
  }

  existing.events += row.events;
  existing.last_seen = newerDate(existing.last_seen, row.last_seen);
  existing.sourceSet.add(row.source);
  existing.sources = [...existing.sourceSet];
}

function newerDate(current: string | null, next: string | null) {
  if (!current) return next;
  if (!next) return current;
  return Date.parse(next) > Date.parse(current) ? next : current;
}

function compareNullableDatesDesc(a: string | null, b: string | null) {
  return (b ? Date.parse(b) : 0) - (a ? Date.parse(a) : 0);
}
