import {
  DECANTR_TELEMETRY_ACTOR_TYPES,
  DECANTR_TELEMETRY_EVENT_NAMES,
  type TelemetryActorType,
  type TelemetrySource,
} from '@decantr/telemetry';

export const TELEMETRY_USAGE_SOURCES = ['api', 'cli', 'content-ci', 'mcp', 'registry-web'] as const;
export const TELEMETRY_USAGE_DAY_RANGES = [1, 7, 14, 30, 90] as const;

const POSTHOG_QUERY_TIMEOUT_MS = 8_000;
const DEFAULT_POSTHOG_QUERY_HOST = 'https://us.posthog.com';

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

export interface TelemetryUsageCandidateAlias {
  actor_type: string;
  events: number;
  identity_id: string;
  identity_type: 'anonymous' | 'install' | 'project';
  last_seen: string | null;
  sources: string[];
}

export interface AdminTelemetryUsageResponse {
  actor_type: TelemetryActorType | null;
  active_identities: TelemetryUsageActiveIdentity[];
  actor_mix: TelemetryUsageActorCount[];
  candidate_aliases: TelemetryUsageCandidateAlias[];
  event_counts: TelemetryUsageEventCount[];
  failure_counts: TelemetryUsageFailureCount[];
  generated_at: string;
  range_days: number;
  source: TelemetryUsageSource | null;
  source_mix: TelemetryUsageSourceCount[];
  summary: {
    active_anonymous_ids: number;
    active_identities: number;
    active_installs: number;
    active_orgs: number;
    active_projects: number;
    candidate_aliases: number;
    customer_events: number;
    failure_events: number;
    internal_events: number;
    official_pipeline_events: number;
    total_events: number;
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
    sourceMix,
    actorMix,
    failureCounts,
    activeIdentities,
  ] = await Promise.all([
    runHogQl(input.config, eventCountsQuery(filters)),
    runHogQl(input.config, sourceMixQuery(filters)),
    runHogQl(input.config, actorMixQuery(filters)),
    runHogQl(input.config, failureCountsQuery(filters)),
    runHogQl(input.config, activeIdentitiesQuery(filters)),
  ]);

  const eventRows = eventCounts.map(toEventCount);
  const sourceRows = sourceMix.map(toSourceCount);
  const actorRows = actorMix.map(toActorCount);
  const failureRows = failureCounts.map(toFailureCount);
  const activeRows = activeIdentities.map(toActiveIdentity);
  const candidateAliases = collectCandidateAliases(activeRows, input.existingAliases);

  return {
    actor_type: input.actorType ?? null,
    active_identities: activeRows,
    actor_mix: actorRows,
    candidate_aliases: candidateAliases,
    event_counts: eventRows,
    failure_counts: failureRows,
    generated_at: new Date().toISOString(),
    range_days: input.days,
    source: (input.source as TelemetryUsageSource | undefined) ?? null,
    source_mix: sourceRows,
    summary: summarizeUsage({
      activeRows,
      candidateAliases,
      eventRows,
      failureRows,
    }),
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

function eventCountsQuery(filters: { actorType?: TelemetryActorType; days: number; source?: TelemetrySource }) {
  return `
    select
      event,
      properties.decantr_actor_type as actor_type,
      count() as count
    from events
    where timestamp >= now() - interval ${filters.days} day
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by event, actor_type
    order by count desc
    limit 100
  `;
}

function sourceMixQuery(filters: { actorType?: TelemetryActorType; days: number; source?: TelemetrySource }) {
  return `
    select
      properties.decantr_source as source,
      count() as count
    from events
    where timestamp >= now() - interval ${filters.days} day
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by source
    order by count desc
    limit 50
  `;
}

function actorMixQuery(filters: { actorType?: TelemetryActorType; days: number; source?: TelemetrySource }) {
  return `
    select
      properties.decantr_actor_type as actor_type,
      properties.decantr_source as source,
      count() as count
    from events
    where timestamp >= now() - interval ${filters.days} day
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by actor_type, source
    order by count desc
    limit 100
  `;
}

function failureCountsQuery(filters: { actorType?: TelemetryActorType; days: number; source?: TelemetrySource }) {
  return `
    select
      event,
      count() as count
    from events
    where timestamp >= now() - interval ${filters.days} day
      and event in (${eventListSql()})
      ${filterSql(filters)}
      and (properties.success = false or properties.valid = false)
    group by event
    order by count desc
    limit 50
  `;
}

function activeIdentitiesQuery(filters: { actorType?: TelemetryActorType; days: number; source?: TelemetrySource }) {
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
    where timestamp >= now() - interval ${filters.days} day
      and event in (${eventListSql()})
      ${filterSql(filters)}
    group by distinct_id, actor_type, source, install_id, project_id, anonymous_id, org_id
    order by events desc
    limit 100
  `;
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
}): AdminTelemetryUsageResponse['summary'] {
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
    candidate_aliases: input.candidateAliases.length,
    customer_events: sumEventRows(input.eventRows, 'customer'),
    failure_events: input.failureRows.reduce((total, row) => total + row.count, 0),
    internal_events: sumEventRows(input.eventRows, 'internal'),
    official_pipeline_events: sumEventRows(input.eventRows, 'official_pipeline'),
    total_events: input.eventRows.reduce((total, row) => total + row.count, 0),
  };
}

function sumEventRows(rows: TelemetryUsageEventCount[], actorType: TelemetryActorType) {
  return rows.reduce((total, row) => total + (row.actor_type === actorType ? row.count : 0), 0);
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
