import type {
  AdminTelemetryAttributionSnapshot,
  AdminTelemetryUsageSnapshot,
} from '@/lib/api';

export type TelemetryPipelineHealthStatus = 'success' | 'warning' | 'error' | 'info';

export interface TelemetryPipelineHealthSummary {
  attributionSnapshotCount: number;
  attributionSnapshotLastCapturedAt: string | null;
  detail: string;
  label: string;
  latestCapturedAt: string | null;
  latestSnapshotAgeDays: number | null;
  status: TelemetryPipelineHealthStatus;
  usageSnapshotCount: number;
  usageSnapshotLastCapturedAt: string | null;
}

interface TelemetryPipelineHealthInput {
  attributionSnapshots?: AdminTelemetryAttributionSnapshot[];
  now?: Date;
  usageSnapshots?: AdminTelemetryUsageSnapshot[];
}

const dayInMs = 24 * 60 * 60 * 1000;
const freshSnapshotWindowDays = 8;
const staleSnapshotWindowDays = 14;

function parseTimestamp(value: string | null | undefined) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp) ? null : timestamp;
}

function latestTimestamp(values: Array<string | null | undefined>) {
  const timestamps = values
    .map(parseTimestamp)
    .filter((timestamp): timestamp is number => timestamp !== null);

  return timestamps.length ? Math.max(...timestamps) : null;
}

function ageCopy(ageDays: number | null) {
  if (ageDays === null) return 'unknown';
  if (ageDays < 1) return 'today';
  const roundedDays = Math.floor(ageDays);
  if (roundedDays === 1) return '1 day ago';
  return `${roundedDays} days ago`;
}

function statusForAge(ageDays: number | null): TelemetryPipelineHealthStatus {
  if (ageDays === null) return 'info';
  if (ageDays <= freshSnapshotWindowDays) return 'success';
  if (ageDays <= staleSnapshotWindowDays) return 'warning';
  return 'error';
}

function labelForStatus(status: TelemetryPipelineHealthStatus) {
  if (status === 'success') return 'Fresh';
  if (status === 'warning') return 'Stale';
  if (status === 'error') return 'Missed snapshot';
  return 'No stored snapshots';
}

function detailForStatus(status: TelemetryPipelineHealthStatus, ageDays: number | null) {
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

export function summarizeTelemetryPipelineHealth({
  attributionSnapshots = [],
  now = new Date(),
  usageSnapshots = [],
}: TelemetryPipelineHealthInput): TelemetryPipelineHealthSummary {
  const usageSnapshotLastTimestamp = latestTimestamp(
    usageSnapshots.map((snapshot) => snapshot.captured_at ?? snapshot.created_at),
  );
  const attributionSnapshotLastTimestamp = latestTimestamp(
    attributionSnapshots.map((snapshot) => snapshot.captured_at ?? snapshot.created_at),
  );
  const availableSnapshotTimestamps = [
    usageSnapshotLastTimestamp,
    attributionSnapshotLastTimestamp,
  ].filter((timestamp): timestamp is number => timestamp !== null);
  const latestSnapshotTimestamp = availableSnapshotTimestamps.length
    ? Math.max(...availableSnapshotTimestamps)
    : null;
  const latestSnapshotAgeDays = latestSnapshotTimestamp === null
    ? null
    : Math.max(0, (now.getTime() - latestSnapshotTimestamp) / dayInMs);
  const status = statusForAge(latestSnapshotAgeDays);

  return {
    attributionSnapshotCount: attributionSnapshots.length,
    attributionSnapshotLastCapturedAt: attributionSnapshotLastTimestamp
      ? new Date(attributionSnapshotLastTimestamp).toISOString()
      : null,
    detail: detailForStatus(status, latestSnapshotAgeDays),
    label: labelForStatus(status),
    latestCapturedAt: latestSnapshotTimestamp ? new Date(latestSnapshotTimestamp).toISOString() : null,
    latestSnapshotAgeDays,
    status,
    usageSnapshotCount: usageSnapshots.length,
    usageSnapshotLastCapturedAt: usageSnapshotLastTimestamp
      ? new Date(usageSnapshotLastTimestamp).toISOString()
      : null,
  };
}
