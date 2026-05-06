import type { TelemetryActorType } from '@decantr/telemetry';
import type {
  AdminTelemetryUsageResponse,
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

interface SupabaseLikeClient {
  from: (table: string) => any;
}

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

function readString(value: unknown) {
  return typeof value === 'string' ? value : '';
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
