import type { TelemetryActorType } from '@decantr/telemetry';
import type {
  AdminTelemetryAttributionResponse,
  AdminTelemetryUsageResponse,
  TelemetryAttributionRow,
  TelemetryUsageOperatingAlert,
  TelemetryUsageSignalBucket,
  TelemetryUsageSource,
} from './posthog-telemetry-usage.js';

export type TelemetryUsageSnapshotActor = TelemetryActorType | 'all';
export type TelemetryUsageSnapshotSource = TelemetryUsageSource | 'all';

export interface TelemetryUsageSnapshotRunRequest {
  actorType?: TelemetryActorType;
  days: number;
  source?: TelemetryUsageSource;
}

export interface TelemetryUsageSnapshotRecord {
  active_anonymous_ids: number;
  active_identities: number;
  active_installs: number;
  active_orgs: number;
  active_projects: number;
  actor_mix: unknown[];
  actor_type: TelemetryUsageSnapshotActor;
  anonymous_events: number;
  candidate_aliases: number;
  captured_at: string;
  created_at: string;
  customer_events: number;
  data_quality: Record<string, unknown>;
  event_counts: unknown[];
  failure_counts: unknown[];
  failure_events: number;
  id: string;
  internal_events: number;
  official_pipeline_events: number;
  previous_summary: Record<string, unknown>;
  range_days: number;
  service_events: number;
  snapshot_date: string;
  source: TelemetryUsageSnapshotSource;
  source_mix: unknown[];
  summary: Record<string, unknown>;
  total_events: number;
  trends: Record<string, unknown>;
  unclassified_events: number;
  updated_at: string;
}

export interface TelemetryAttributionSnapshotRecord {
  actor_type: TelemetryUsageSnapshotActor;
  captured_at: string;
  created_at: string;
  events: number;
  id: string;
  last_seen: string | null;
  org_id: string | null;
  org_is_internal: boolean;
  org_is_test: boolean;
  org_name: string | null;
  org_slug: string | null;
  org_tier: string | null;
  project_id: string | null;
  range_days: number;
  row_actor_type: string;
  row_rank: number;
  row_source: string;
  snapshot_date: string;
  source: TelemetryUsageSnapshotSource;
  summary: Record<string, unknown>;
  updated_at: string;
}

export interface TelemetrySignalBucketSnapshotRecord {
  bucket_key: string;
  change_rate: number | null;
  created_at: string;
  current_events: number;
  delta: number;
  id: string;
  label: string;
  previous_events: number;
  usage_snapshot_id: string;
}

export interface TelemetryOperatingAlertSnapshotRecord {
  created_at: string;
  detail: string;
  id: string;
  level: TelemetryUsageOperatingAlert['level'];
  title: string;
  usage_snapshot_id: string;
}

export interface TelemetryUsageSnapshotDetail extends TelemetryUsageSnapshotRecord {
  operating_alerts: TelemetryOperatingAlertSnapshotRecord[];
  signal_buckets: TelemetrySignalBucketSnapshotRecord[];
}

export type TelemetrySnapshotHealthStatus = 'success' | 'warning' | 'error' | 'info';

export interface TelemetrySnapshotHealthMetric {
  captured_at: string | null;
  rows: number;
  snapshot_date: string | null;
  total_events: number;
}

export interface TelemetrySnapshotHealthSummary {
  actor_type: TelemetryUsageSnapshotActor;
  attribution_snapshot: TelemetrySnapshotHealthMetric;
  detail: string;
  generated_at: string;
  label: string;
  latest_captured_at: string | null;
  latest_snapshot_age_days: number | null;
  range_days: number | null;
  source: TelemetryUsageSnapshotSource;
  status: TelemetrySnapshotHealthStatus;
  usage_snapshot: TelemetrySnapshotHealthMetric;
}

interface SupabaseLikeClient {
  from: (table: string) => any;
}

const dayInMs = 24 * 60 * 60 * 1000;
const freshSnapshotWindowDays = 8;
const staleSnapshotWindowDays = 14;

export async function persistTelemetryUsageSnapshot(
  client: SupabaseLikeClient,
  usage: AdminTelemetryUsageResponse,
): Promise<TelemetryUsageSnapshotDetail> {
  const snapshotDate = usage.generated_at.slice(0, 10);
  const actorType = normalizeSnapshotActor(usage.actor_type);
  const source = normalizeSnapshotSource(usage.source);
  const summary = usage.summary;

  const payload = {
    active_anonymous_ids: summary.active_anonymous_ids,
    active_identities: summary.active_identities,
    active_installs: summary.active_installs,
    active_orgs: summary.active_orgs,
    active_projects: summary.active_projects,
    actor_mix: usage.actor_mix,
    actor_type: actorType,
    anonymous_events: summary.anonymous_events,
    candidate_aliases: summary.candidate_aliases,
    captured_at: usage.generated_at,
    customer_events: summary.customer_events,
    data_quality: buildTelemetryDataQuality(usage),
    event_counts: usage.event_counts,
    failure_counts: usage.failure_counts,
    failure_events: summary.failure_events,
    internal_events: summary.internal_events,
    official_pipeline_events: summary.official_pipeline_events,
    previous_summary: usage.previous_summary,
    range_days: usage.range_days,
    service_events: summary.service_events,
    snapshot_date: snapshotDate,
    source,
    source_mix: usage.source_mix,
    summary,
    total_events: summary.total_events,
    trends: usage.trends,
    unclassified_events: summary.unclassified_events,
  };

  const { data, error } = await client
    .from('telemetry_usage_snapshots')
    .upsert(payload, { onConflict: 'snapshot_date,range_days,actor_type,source' })
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Failed to persist telemetry usage snapshot');
  }

  await replaceSignalBuckets(client, data.id, {
    actorType,
    buckets: usage.signal_buckets,
    rangeDays: usage.range_days,
    snapshotDate,
    source,
  });
  await replaceOperatingAlerts(client, data.id, {
    actorType,
    alerts: usage.operating_alerts,
    rangeDays: usage.range_days,
    snapshotDate,
    source,
  });

  return {
    ...formatUsageSnapshot(data),
    signal_buckets: await listSignalBucketsForSnapshot(client, data.id),
    operating_alerts: await listOperatingAlertsForSnapshot(client, data.id),
  };
}

export async function listTelemetryUsageSnapshots(
  client: SupabaseLikeClient,
  filters: {
    actorType?: TelemetryActorType;
    days?: number;
    limit: number;
    source?: TelemetryUsageSource;
  },
): Promise<TelemetryUsageSnapshotDetail[]> {
  let query = client
    .from('telemetry_usage_snapshots')
    .select('*')
    .order('captured_at', { ascending: false })
    .limit(filters.limit);

  if (filters.days) {
    query = query.eq('range_days', filters.days);
  }
  if (filters.actorType) {
    query = query.eq('actor_type', filters.actorType);
  }
  if (filters.source) {
    query = query.eq('source', filters.source);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error('Failed to fetch telemetry usage snapshots');
  }

  const snapshots = ((data ?? []) as unknown[]).map(formatUsageSnapshot);
  if (!snapshots.length) return [];

  const ids = snapshots.map((snapshot) => snapshot.id);
  const [bucketResult, alertResult] = await Promise.all([
    client.from('telemetry_signal_bucket_snapshots').select('*').in('usage_snapshot_id', ids),
    client.from('telemetry_operating_alert_snapshots').select('*').in('usage_snapshot_id', ids),
  ]);

  if (bucketResult.error) {
    throw new Error('Failed to fetch telemetry signal bucket snapshots');
  }
  if (alertResult.error) {
    throw new Error('Failed to fetch telemetry operating alert snapshots');
  }

  const bucketsBySnapshot = groupBySnapshot(
    ((bucketResult.data ?? []) as unknown[]).map(formatSignalBucketSnapshot),
  );
  const alertsBySnapshot = groupBySnapshot(
    ((alertResult.data ?? []) as unknown[]).map(formatOperatingAlertSnapshot),
  );

  return snapshots.map((snapshot) => ({
    ...snapshot,
    signal_buckets: bucketsBySnapshot.get(snapshot.id) ?? [],
    operating_alerts: alertsBySnapshot.get(snapshot.id) ?? [],
  }));
}

export async function persistTelemetryAttributionSnapshot(
  client: SupabaseLikeClient,
  attribution: AdminTelemetryAttributionResponse,
): Promise<TelemetryAttributionSnapshotRecord[]> {
  const snapshotDate = attribution.generated_at.slice(0, 10);
  const actorType = normalizeSnapshotActor(attribution.actor_type);
  const source = normalizeSnapshotSource(attribution.source);

  const deleteResult = await client
    .from('telemetry_attribution_snapshots')
    .delete()
    .eq('snapshot_date', snapshotDate)
    .eq('range_days', attribution.range_days)
    .eq('actor_type', actorType)
    .eq('source', source);

  if (deleteResult.error) {
    throw new Error('Failed to replace telemetry attribution snapshots');
  }

  if (!attribution.rows.length) return [];

  const { error } = await client
    .from('telemetry_attribution_snapshots')
    .insert(attribution.rows.map((row, index) => attributionRowPayload({
      actorType,
      capturedAt: attribution.generated_at,
      rangeDays: attribution.range_days,
      row,
      rowRank: index + 1,
      snapshotDate,
      source,
      summary: attribution.summary,
    })));

  if (error) {
    throw new Error('Failed to persist telemetry attribution snapshots');
  }

  return listTelemetryAttributionSnapshots(client, {
    days: attribution.range_days,
    limit: Math.max(attribution.rows.length, 1),
    snapshotActor: actorType,
    snapshotDate,
    snapshotSource: source,
  });
}

export async function listTelemetryAttributionSnapshots(
  client: SupabaseLikeClient,
  filters: {
    actorType?: TelemetryActorType;
    days?: number;
    limit: number;
    orgId?: string;
    projectId?: string;
    snapshotActor?: TelemetryUsageSnapshotActor;
    snapshotDate?: string;
    snapshotSource?: TelemetryUsageSnapshotSource;
    source?: TelemetryUsageSource;
  },
): Promise<TelemetryAttributionSnapshotRecord[]> {
  let query = client
    .from('telemetry_attribution_snapshots')
    .select('*')
    .order('captured_at', { ascending: false })
    .order('row_rank', { ascending: true })
    .limit(filters.limit);

  if (filters.snapshotDate) {
    query = query.eq('snapshot_date', filters.snapshotDate);
  }
  if (filters.days) {
    query = query.eq('range_days', filters.days);
  }
  if (filters.snapshotActor) {
    query = query.eq('actor_type', filters.snapshotActor);
  } else if (filters.actorType) {
    query = query.eq('actor_type', filters.actorType);
  }
  if (filters.snapshotSource) {
    query = query.eq('source', filters.snapshotSource);
  } else if (filters.source) {
    query = query.eq('source', filters.source);
  }
  if (filters.orgId) {
    query = query.eq('org_id', filters.orgId);
  }
  if (filters.projectId) {
    query = query.eq('project_id', filters.projectId);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error('Failed to fetch telemetry attribution snapshots');
  }

  return ((data ?? []) as unknown[]).map(formatAttributionSnapshot);
}

export function buildTelemetrySnapshotHealth(input: {
  actorType?: TelemetryActorType;
  attributionSnapshots?: TelemetryAttributionSnapshotRecord[];
  days?: number;
  now?: Date;
  source?: TelemetryUsageSource;
  usageSnapshots?: TelemetryUsageSnapshotDetail[];
}): TelemetrySnapshotHealthSummary {
  const now = input.now ?? new Date();
  const usageSnapshots = input.usageSnapshots ?? [];
  const attributionSnapshots = input.attributionSnapshots ?? [];
  const latestUsageSnapshot = latestByCapturedAt(usageSnapshots);
  const latestAttributionRows = latestAttributionSnapshotRows(attributionSnapshots);
  const usageTimestamp = parseTimestamp(latestUsageSnapshot?.captured_at ?? latestUsageSnapshot?.created_at);
  const attributionTimestamp = parseTimestamp(
    latestAttributionRows[0]?.captured_at ?? latestAttributionRows[0]?.created_at,
  );
  const latestSnapshotTimestamp = maxTimestamp([usageTimestamp, attributionTimestamp]);
  const latestSnapshotAgeDays = latestSnapshotTimestamp === null
    ? null
    : Math.max(0, (now.getTime() - latestSnapshotTimestamp) / dayInMs);
  const status = statusForAge(latestSnapshotAgeDays);

  return {
    actor_type: normalizeSnapshotActor(input.actorType ?? null),
    attribution_snapshot: {
      captured_at: attributionTimestamp === null ? null : new Date(attributionTimestamp).toISOString(),
      rows: latestAttributionRows.length,
      snapshot_date: latestAttributionRows[0]?.snapshot_date ?? null,
      total_events: latestAttributionRows.reduce((total, row) => total + row.events, 0),
    },
    detail: detailForSnapshotHealth(status, latestSnapshotAgeDays),
    generated_at: now.toISOString(),
    label: labelForSnapshotHealth(status),
    latest_captured_at: latestSnapshotTimestamp === null ? null : new Date(latestSnapshotTimestamp).toISOString(),
    latest_snapshot_age_days: latestSnapshotAgeDays,
    range_days: input.days ?? null,
    source: normalizeSnapshotSource(input.source ?? null),
    status,
    usage_snapshot: {
      captured_at: usageTimestamp === null ? null : new Date(usageTimestamp).toISOString(),
      rows: latestUsageSnapshot ? 1 : 0,
      snapshot_date: latestUsageSnapshot?.snapshot_date ?? null,
      total_events: latestUsageSnapshot?.total_events ?? 0,
    },
  };
}

function buildTelemetryDataQuality(usage: AdminTelemetryUsageResponse) {
  const totalEvents = usage.summary.total_events;
  const unclassifiedRate = totalEvents > 0 ? usage.summary.unclassified_events / totalEvents : 0;
  const candidateAliasRate = usage.summary.active_identities > 0
    ? usage.summary.candidate_aliases / usage.summary.active_identities
    : 0;

  return {
    candidate_alias_rate: candidateAliasRate,
    candidate_aliases: usage.summary.candidate_aliases,
    classification_coverage: totalEvents > 0 ? 1 - unclassifiedRate : 1,
    generated_at: usage.generated_at,
    unclassified_events: usage.summary.unclassified_events,
    unclassified_rate: unclassifiedRate,
  };
}

async function replaceSignalBuckets(
  client: SupabaseLikeClient,
  snapshotId: string,
  input: {
    actorType: TelemetryUsageSnapshotActor;
    buckets: TelemetryUsageSignalBucket[];
    rangeDays: number;
    snapshotDate: string;
    source: TelemetryUsageSnapshotSource;
  },
) {
  const deleteResult = await client
    .from('telemetry_signal_bucket_snapshots')
    .delete()
    .eq('usage_snapshot_id', snapshotId);

  if (deleteResult.error) {
    throw new Error('Failed to replace telemetry signal bucket snapshots');
  }

  if (!input.buckets.length) return;

  const { error } = await client
    .from('telemetry_signal_bucket_snapshots')
    .insert(input.buckets.map((bucket) => ({
      actor_type: input.actorType,
      bucket_key: bucket.key,
      change_rate: bucket.change_rate,
      current_events: bucket.current_events,
      delta: bucket.delta,
      label: bucket.label,
      previous_events: bucket.previous_events,
      range_days: input.rangeDays,
      snapshot_date: input.snapshotDate,
      source: input.source,
      usage_snapshot_id: snapshotId,
    })));

  if (error) {
    throw new Error('Failed to persist telemetry signal bucket snapshots');
  }
}

async function replaceOperatingAlerts(
  client: SupabaseLikeClient,
  snapshotId: string,
  input: {
    actorType: TelemetryUsageSnapshotActor;
    alerts: TelemetryUsageOperatingAlert[];
    rangeDays: number;
    snapshotDate: string;
    source: TelemetryUsageSnapshotSource;
  },
) {
  const deleteResult = await client
    .from('telemetry_operating_alert_snapshots')
    .delete()
    .eq('usage_snapshot_id', snapshotId);

  if (deleteResult.error) {
    throw new Error('Failed to replace telemetry operating alert snapshots');
  }

  if (!input.alerts.length) return;

  const { error } = await client
    .from('telemetry_operating_alert_snapshots')
    .insert(input.alerts.map((alert) => ({
      actor_type: input.actorType,
      detail: alert.detail,
      level: alert.level,
      range_days: input.rangeDays,
      snapshot_date: input.snapshotDate,
      source: input.source,
      title: alert.title,
      usage_snapshot_id: snapshotId,
    })));

  if (error) {
    throw new Error('Failed to persist telemetry operating alert snapshots');
  }
}

async function listSignalBucketsForSnapshot(
  client: SupabaseLikeClient,
  snapshotId: string,
): Promise<TelemetrySignalBucketSnapshotRecord[]> {
  const { data, error } = await client
    .from('telemetry_signal_bucket_snapshots')
    .select('*')
    .eq('usage_snapshot_id', snapshotId);

  if (error) {
    throw new Error('Failed to fetch telemetry signal bucket snapshots');
  }

  return ((data ?? []) as unknown[]).map(formatSignalBucketSnapshot);
}

async function listOperatingAlertsForSnapshot(
  client: SupabaseLikeClient,
  snapshotId: string,
): Promise<TelemetryOperatingAlertSnapshotRecord[]> {
  const { data, error } = await client
    .from('telemetry_operating_alert_snapshots')
    .select('*')
    .eq('usage_snapshot_id', snapshotId);

  if (error) {
    throw new Error('Failed to fetch telemetry operating alert snapshots');
  }

  return ((data ?? []) as unknown[]).map(formatOperatingAlertSnapshot);
}

function normalizeSnapshotActor(actorType: TelemetryActorType | null): TelemetryUsageSnapshotActor {
  return actorType ?? 'all';
}

function normalizeSnapshotSource(source: TelemetryUsageSource | null): TelemetryUsageSnapshotSource {
  return source ?? 'all';
}

function formatUsageSnapshot(row: unknown): TelemetryUsageSnapshotRecord {
  const data = row as Record<string, unknown>;
  return {
    active_anonymous_ids: readNumber(data.active_anonymous_ids),
    active_identities: readNumber(data.active_identities),
    active_installs: readNumber(data.active_installs),
    active_orgs: readNumber(data.active_orgs),
    active_projects: readNumber(data.active_projects),
    actor_mix: readArray(data.actor_mix),
    actor_type: readSnapshotActor(data.actor_type),
    anonymous_events: readNumber(data.anonymous_events),
    candidate_aliases: readNumber(data.candidate_aliases),
    captured_at: readString(data.captured_at),
    created_at: readString(data.created_at),
    customer_events: readNumber(data.customer_events),
    data_quality: readObject(data.data_quality),
    event_counts: readArray(data.event_counts),
    failure_counts: readArray(data.failure_counts),
    failure_events: readNumber(data.failure_events),
    id: readString(data.id),
    internal_events: readNumber(data.internal_events),
    official_pipeline_events: readNumber(data.official_pipeline_events),
    previous_summary: readObject(data.previous_summary),
    range_days: readNumber(data.range_days),
    service_events: readNumber(data.service_events),
    snapshot_date: readString(data.snapshot_date),
    source: readSnapshotSource(data.source),
    source_mix: readArray(data.source_mix),
    summary: readObject(data.summary),
    total_events: readNumber(data.total_events),
    trends: readObject(data.trends),
    unclassified_events: readNumber(data.unclassified_events),
    updated_at: readString(data.updated_at),
  };
}

function formatSignalBucketSnapshot(row: unknown): TelemetrySignalBucketSnapshotRecord {
  const data = row as Record<string, unknown>;
  return {
    bucket_key: readString(data.bucket_key),
    change_rate: readNullableNumber(data.change_rate),
    created_at: readString(data.created_at),
    current_events: readNumber(data.current_events),
    delta: readNumber(data.delta),
    id: readString(data.id),
    label: readString(data.label),
    previous_events: readNumber(data.previous_events),
    usage_snapshot_id: readString(data.usage_snapshot_id),
  };
}

function formatOperatingAlertSnapshot(row: unknown): TelemetryOperatingAlertSnapshotRecord {
  const data = row as Record<string, unknown>;
  const level = data.level === 'critical' || data.level === 'warning' ? data.level : 'info';
  return {
    created_at: readString(data.created_at),
    detail: readString(data.detail),
    id: readString(data.id),
    level,
    title: readString(data.title),
    usage_snapshot_id: readString(data.usage_snapshot_id),
  };
}

function groupBySnapshot<T extends { usage_snapshot_id: string }>(rows: T[]) {
  const grouped = new Map<string, T[]>();
  for (const row of rows) {
    const items = grouped.get(row.usage_snapshot_id) ?? [];
    items.push(row);
    grouped.set(row.usage_snapshot_id, items);
  }
  return grouped;
}

function latestByCapturedAt<T extends { captured_at: string; created_at?: string }>(items: T[]): T | null {
  let latest: T | null = null;
  let latestTimestamp: number | null = null;

  for (const item of items) {
    const timestamp = parseTimestamp(item.captured_at || item.created_at);
    if (timestamp === null) continue;
    if (latestTimestamp === null || timestamp > latestTimestamp) {
      latest = item;
      latestTimestamp = timestamp;
    }
  }

  return latest;
}

function latestAttributionSnapshotRows(
  snapshots: TelemetryAttributionSnapshotRecord[],
): TelemetryAttributionSnapshotRecord[] {
  const latest = latestByCapturedAt(snapshots);
  if (!latest) return [];

  return snapshots.filter((snapshot) =>
    snapshot.captured_at === latest.captured_at &&
    snapshot.snapshot_date === latest.snapshot_date &&
    snapshot.range_days === latest.range_days &&
    snapshot.actor_type === latest.actor_type &&
    snapshot.source === latest.source
  );
}

function parseTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function maxTimestamp(values: Array<number | null>) {
  const timestamps = values.filter((timestamp): timestamp is number => timestamp !== null);
  return timestamps.length ? Math.max(...timestamps) : null;
}

function ageCopy(ageDays: number | null) {
  if (ageDays === null) return 'unknown';
  if (ageDays < 1) return 'today';
  const roundedDays = Math.floor(ageDays);
  if (roundedDays === 1) return '1 day ago';
  return `${roundedDays} days ago`;
}

function statusForAge(ageDays: number | null): TelemetrySnapshotHealthStatus {
  if (ageDays === null) return 'info';
  if (ageDays <= freshSnapshotWindowDays) return 'success';
  if (ageDays <= staleSnapshotWindowDays) return 'warning';
  return 'error';
}

function labelForSnapshotHealth(status: TelemetrySnapshotHealthStatus) {
  if (status === 'success') return 'Fresh';
  if (status === 'warning') return 'Stale';
  if (status === 'error') return 'Missed snapshot';
  return 'No stored snapshots';
}

function detailForSnapshotHealth(status: TelemetrySnapshotHealthStatus, ageDays: number | null) {
  if (status === 'success') {
    return `Latest stored telemetry snapshot was captured ${ageCopy(ageDays)}.`;
  }

  if (status === 'warning') {
    return `Latest stored telemetry snapshot was captured ${ageCopy(ageDays)}; confirm the weekly job is still running.`;
  }

  if (status === 'error') {
    return `Latest stored telemetry snapshot was captured ${ageCopy(ageDays)}; investigate the weekly job.`;
  }

  return 'No stored usage or attribution snapshots are available for this filter yet.';
}

function attributionRowPayload(input: {
  actorType: TelemetryUsageSnapshotActor;
  capturedAt: string;
  rangeDays: number;
  row: TelemetryAttributionRow;
  rowRank: number;
  snapshotDate: string;
  source: TelemetryUsageSnapshotSource;
  summary: AdminTelemetryAttributionResponse['summary'];
}) {
  return {
    actor_type: input.actorType,
    captured_at: input.capturedAt,
    events: input.row.events,
    last_seen: input.row.last_seen,
    org_id: input.row.org_id,
    org_is_internal: input.row.organization?.is_internal ?? false,
    org_is_test: input.row.organization?.is_test ?? false,
    org_name: input.row.organization?.name ?? null,
    org_slug: input.row.organization?.slug ?? null,
    org_tier: input.row.organization?.tier ?? null,
    project_id: input.row.project_id,
    range_days: input.rangeDays,
    row_actor_type: normalizeAttributionRowActor(input.row.actor_type),
    row_rank: input.rowRank,
    row_source: input.row.source || 'unknown',
    snapshot_date: input.snapshotDate,
    source: input.source,
    summary: input.summary,
  };
}

function formatAttributionSnapshot(row: unknown): TelemetryAttributionSnapshotRecord {
  const data = row as Record<string, unknown>;
  return {
    actor_type: readSnapshotActor(data.actor_type),
    captured_at: readString(data.captured_at),
    created_at: readString(data.created_at),
    events: readNumber(data.events),
    id: readString(data.id),
    last_seen: readNullableString(data.last_seen),
    org_id: readNullableString(data.org_id),
    org_is_internal: readBoolean(data.org_is_internal),
    org_is_test: readBoolean(data.org_is_test),
    org_name: readNullableString(data.org_name),
    org_slug: readNullableString(data.org_slug),
    org_tier: readNullableString(data.org_tier),
    project_id: readNullableString(data.project_id),
    range_days: readNumber(data.range_days),
    row_actor_type: normalizeAttributionRowActor(readString(data.row_actor_type)),
    row_rank: readNumber(data.row_rank),
    row_source: readString(data.row_source) || 'unknown',
    snapshot_date: readString(data.snapshot_date),
    source: readSnapshotSource(data.source),
    summary: readObject(data.summary),
    updated_at: readString(data.updated_at),
  };
}

function normalizeAttributionRowActor(actorType: string) {
  return actorType || 'unclassified';
}

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function readNullableString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readBoolean(value: unknown) {
  return value === true;
}

function readNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function readNullableNumber(value: unknown) {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function readObject(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function readArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function readSnapshotActor(value: unknown): TelemetryUsageSnapshotActor {
  return typeof value === 'string' ? value as TelemetryUsageSnapshotActor : 'all';
}

function readSnapshotSource(value: unknown): TelemetryUsageSnapshotSource {
  return typeof value === 'string' ? value as TelemetryUsageSnapshotSource : 'all';
}
