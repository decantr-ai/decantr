import {
  api,
  type AdminTelemetryAttributionSnapshot,
  type AdminTelemetryAttributionRow,
  type AdminTelemetryOperatingAlert,
  type AdminTelemetryUsageTrend,
} from '@/lib/api';
import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdminRequestContext } from '@/lib/admin-workspace';
import { summarizeTelemetryPipelineHealth } from '@/lib/telemetry-pipeline-health';

export const metadata: Metadata = {
  title: 'Commercial Reports',
};

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDelta(value: number) {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return '0';
}

function trendMeta(trend: AdminTelemetryUsageTrend) {
  return `${formatDelta(trend.delta)} vs previous`;
}

function alertStatus(level: AdminTelemetryOperatingAlert['level']) {
  if (level === 'critical') return 'error';
  return level;
}

function formatTimestamp(value: string | null) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function attributionLabel(row: AdminTelemetryAttributionRow) {
  if (row.organization) return `${row.organization.name} (${row.organization.slug})`;
  if (row.org_id) return `Org ${row.org_id}`;
  if (row.project_id) return 'Project-only attribution';
  return 'Unattributed';
}

function attributionSnapshotLabel(row: AdminTelemetryAttributionSnapshot) {
  if (row.org_name && row.org_slug) return `${row.org_name} (${row.org_slug})`;
  if (row.org_id) return `Org ${row.org_id}`;
  if (row.project_id) return 'Project-only attribution';
  return 'Unattributed';
}

export default async function AdminReportsPage() {
  const { token, adminKey } = await requireAdminRequestContext();

  let summary = null;
  let error: string | null = null;
  let customerUsage = null;
  let telemetryUsageError: string | null = null;
  let customerSnapshots = null;
  let snapshotError: string | null = null;
  let customerAttribution = null;
  let customerAttributionSnapshots = null;
  let attributionError: string | null = null;
  let attributionSnapshotError: string | null = null;
  const [
    summaryResult,
    customerUsageResult,
    customerSnapshotsResult,
    attributionResult,
    attributionSnapshotResult,
  ] = await Promise.allSettled([
    api.getCommercialSummary(token, adminKey),
    api.getAdminTelemetryUsage(token, adminKey, {
      actor_type: 'customer',
      days: 30,
    }),
    api.getAdminTelemetrySnapshots(token, adminKey, {
      actor_type: 'customer',
      days: 30,
      limit: 8,
    }),
    api.getAdminTelemetryAttribution(token, adminKey, {
      actor_type: 'customer',
      days: 30,
      limit: 8,
    }),
    api.getAdminTelemetryAttributionSnapshots(token, adminKey, {
      actor_type: 'customer',
      days: 30,
      limit: 8,
    }),
  ]);

  if (summaryResult.status === 'fulfilled') {
    summary = summaryResult.value;
  } else {
    error = summaryResult.reason instanceof Error
      ? summaryResult.reason.message
      : 'Failed to load commercial summary';
  }

  if (customerUsageResult.status === 'fulfilled') {
    customerUsage = customerUsageResult.value;
  } else {
    telemetryUsageError = customerUsageResult.reason instanceof Error
      ? customerUsageResult.reason.message
      : 'Failed to load customer-clean telemetry';
  }

  if (customerSnapshotsResult.status === 'fulfilled') {
    customerSnapshots = customerSnapshotsResult.value;
  } else {
    snapshotError = customerSnapshotsResult.reason instanceof Error
      ? customerSnapshotsResult.reason.message
      : 'Failed to load stored telemetry snapshots';
  }

  if (attributionResult.status === 'fulfilled') {
    customerAttribution = attributionResult.value;
  } else {
    attributionError = attributionResult.reason instanceof Error
      ? attributionResult.reason.message
      : 'Failed to load telemetry attribution';
  }

  if (attributionSnapshotResult.status === 'fulfilled') {
    customerAttributionSnapshots = attributionSnapshotResult.value;
  } else {
    attributionSnapshotError = attributionSnapshotResult.reason instanceof Error
      ? attributionSnapshotResult.reason.message
      : 'Failed to load telemetry attribution snapshots';
  }

  const customerPipelineHealth = summarizeTelemetryPipelineHealth({
    attributionSnapshots: customerAttributionSnapshots?.items ?? [],
    usageSnapshots: customerSnapshots?.items ?? [],
  });

  return (
    <div className="registry-page-stack">
      <div className="registry-page-intro registry-admin-head">
        <div>
          <h3 className="text-lg font-semibold">Commercial Reports</h3>
          <p className="registry-muted-copy">
            Review customer distribution, package footprint, and the recent commercial usage signal in one admin workspace.
          </p>
        </div>
        <div className="registry-inline-actions">
          <Link href="/admin/organizations" className="d-interactive" data-variant="ghost">
            Open organizations
          </Link>
          <Link href="/admin/telemetry/usage?actor_type=customer&days=30" className="d-interactive" data-variant="ghost">
            Customer usage
          </Link>
          <Link href="/admin/telemetry" className="d-interactive" data-variant="ghost">
            Telemetry
          </Link>
        </div>
      </div>

      {error ? (
        <div className="d-annotation registry-inline-error" data-status="error">
          {error}
        </div>
      ) : null}

      {summary ? (
        <>
          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Tier Distribution
            </span>
            <div className="d-surface registry-surface-stack registry-admin-summary-list">
              <div>
                Users — Free: {summary.users_by_tier.free} · Pro: {summary.users_by_tier.pro} · Team: {summary.users_by_tier.team} · Enterprise: {summary.users_by_tier.enterprise}
              </div>
              <div>
                Organizations — Team: {summary.organizations_by_tier.team} · Enterprise: {summary.organizations_by_tier.enterprise}
              </div>
              <div>
                Total seat capacity: {summary.totals.seat_limit_total}
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Customer-Clean Telemetry
            </span>
            {telemetryUsageError ? (
              <div className="d-annotation registry-inline-error" data-status="info">
                {telemetryUsageError}
              </div>
            ) : null}
            {snapshotError ? (
              <div className="d-annotation registry-inline-error" data-status="info">
                {snapshotError}
              </div>
            ) : null}
            {attributionError ? (
              <div className="d-annotation registry-inline-error" data-status="info">
                {attributionError}
              </div>
            ) : null}
            {attributionSnapshotError ? (
              <div className="d-annotation registry-inline-error" data-status="info">
                {attributionSnapshotError}
              </div>
            ) : null}
            <div className="registry-admin-stat-grid">
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{customerPipelineHealth.label}</span>
                <span className="registry-admin-row-meta">{customerPipelineHealth.detail}</span>
                <span className="d-annotation" data-status={customerPipelineHealth.status}>
                  {customerPipelineHealth.status}
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">
                  {formatTimestamp(customerPipelineHealth.usageSnapshotLastCapturedAt)}
                </span>
                <span className="registry-admin-row-meta">Latest customer snapshot</span>
                <span className="registry-admin-row-meta">
                  {formatNumber(customerPipelineHealth.usageSnapshotCount)} stored rows
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">
                  {formatTimestamp(customerPipelineHealth.attributionSnapshotLastCapturedAt)}
                </span>
                <span className="registry-admin-row-meta">Latest attribution snapshot</span>
                <span className="registry-admin-row-meta">
                  {formatNumber(customerPipelineHealth.attributionSnapshotCount)} stored rows
                </span>
              </div>
            </div>
            {customerUsage ? (
              <div className="registry-admin-stack">
                <div className="registry-admin-stat-grid">
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatNumber(customerUsage.summary.total_events)}</span>
                    <span className="registry-admin-row-meta">Customer events</span>
                    <span className="registry-admin-row-meta">{trendMeta(customerUsage.trends.total_events)}</span>
                  </div>
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatNumber(customerUsage.summary.active_installs)}</span>
                    <span className="registry-admin-row-meta">Active installs</span>
                    <span className="registry-admin-row-meta">{trendMeta(customerUsage.trends.active_installs)}</span>
                  </div>
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatNumber(customerUsage.summary.active_projects)}</span>
                    <span className="registry-admin-row-meta">Active projects</span>
                    <span className="registry-admin-row-meta">{trendMeta(customerUsage.trends.active_projects)}</span>
                  </div>
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatNumber(customerUsage.summary.active_orgs)}</span>
                    <span className="registry-admin-row-meta">Active orgs</span>
                    <span className="registry-admin-row-meta">
                      Previous {formatNumber(customerUsage.previous_summary.active_orgs)}
                    </span>
                  </div>
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatNumber(customerUsage.summary.failure_events)}</span>
                    <span className="registry-admin-row-meta">Failure signals</span>
                    <span className="registry-admin-row-meta">{trendMeta(customerUsage.trends.failure_events)}</span>
                  </div>
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatNumber(customerUsage.summary.candidate_aliases)}</span>
                    <span className="registry-admin-row-meta">Unaliased ids</span>
                    <span className="registry-admin-row-meta">Needs attribution</span>
                  </div>
                </div>
                {customerAttribution ? (
                  <div className="d-surface registry-admin-stack">
                    <span className="registry-admin-row-title">Top customer orgs/projects</span>
                    <div className="registry-admin-row">
                      <span className="registry-admin-row-meta">
                        {formatNumber(customerAttribution.summary.active_orgs)} orgs · {formatNumber(customerAttribution.summary.active_projects)} projects · {formatNumber(customerAttribution.summary.unattributed_events)} unattributed events
                      </span>
                      <span className="registry-admin-row-meta">
                        {formatNumber(customerAttribution.summary.returned_events)}
                      </span>
                    </div>
                    {customerAttribution.rows.map((row) => (
                      <div key={`${row.org_id ?? 'no-org'}-${row.project_id ?? 'no-project'}-${row.source}`} className="registry-admin-row">
                        <span className="registry-admin-row-copy">
                          {row.organization ? (
                            <Link
                              href={`/admin/organizations/${row.organization.slug}`}
                              className="registry-admin-row-title"
                              aria-label={`Open attribution for ${attributionLabel(row)}`}
                            >
                              {attributionLabel(row)}
                            </Link>
                          ) : (
                            <span className="registry-admin-row-title registry-admin-monospace">
                              {attributionLabel(row)}
                            </span>
                          )}
                          <span className="registry-admin-row-meta">
                            {row.source} · {row.project_id ?? 'no project'}
                          </span>
                        </span>
                        <span className="registry-admin-row-meta">{formatNumber(row.events)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                <div className="registry-admin-card-grid">
                  <div className="d-surface registry-admin-stack">
                    <span className="registry-admin-row-title">Top customer events</span>
                    {customerUsage.event_counts.slice(0, 6).map((row) => (
                      <div key={`${row.event}-${row.actor_type}`} className="registry-admin-row">
                        <span className="registry-admin-row-title">{row.event}</span>
                        <span className="registry-admin-row-meta">{formatNumber(row.count)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-surface registry-admin-stack">
                    <span className="registry-admin-row-title">Signal buckets</span>
                    {customerUsage.signal_buckets.map((bucket) => (
                      <div key={bucket.key} className="registry-admin-row">
                        <span className="registry-admin-row-copy">
                          <span className="registry-admin-row-title">{bucket.label}</span>
                          <span className="registry-admin-row-meta">
                            Previous {formatNumber(bucket.previous_events)} · {formatDelta(bucket.delta)}
                          </span>
                        </span>
                        <span className="registry-admin-row-meta">{formatNumber(bucket.current_events)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="d-surface registry-admin-stack">
                    <span className="registry-admin-row-title">Operating alerts</span>
                    {customerUsage.operating_alerts.length ? customerUsage.operating_alerts.map((alert) => (
                      <div key={`${alert.level}-${alert.title}`} className="registry-admin-row">
                        <span className="registry-admin-row-copy">
                          <span className="registry-admin-row-title">{alert.title}</span>
                          <span className="registry-admin-row-meta">{alert.detail}</span>
                        </span>
                        <span className="d-annotation" data-status={alertStatus(alert.level)}>
                          {alert.level}
                        </span>
                      </div>
                    )) : (
                      <span className="registry-admin-row-meta">No alert thresholds triggered.</span>
                    )}
                  </div>
                </div>
                {customerSnapshots?.items.length ? (
                  <div className="d-surface registry-admin-stack">
                    <span className="registry-admin-row-title">Stored customer history</span>
                    {customerSnapshots.items.map((snapshot) => (
                      <div key={snapshot.id} className="registry-admin-row">
                        <span className="registry-admin-row-copy">
                          <span className="registry-admin-row-title">{snapshot.snapshot_date}</span>
                          <span className="registry-admin-row-meta">
                            {formatNumber(snapshot.active_installs)} installs · {formatNumber(snapshot.active_projects)} projects · {formatNumber(snapshot.failure_events)} failures
                          </span>
                        </span>
                        <span className="registry-admin-row-meta">{formatNumber(snapshot.total_events)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {customerAttributionSnapshots?.items.length ? (
                  <div className="d-surface registry-admin-stack">
                    <span className="registry-admin-row-title">Stored customer attribution</span>
                    {customerAttributionSnapshots.items.map((row) => (
                      <div key={row.id} className="registry-admin-row">
                        <span className="registry-admin-row-copy">
                          {row.org_slug ? (
                            <Link
                              href={`/admin/organizations/${row.org_slug}`}
                              className="registry-admin-row-title"
                              aria-label={`Open stored attribution for ${attributionSnapshotLabel(row)}`}
                            >
                              {attributionSnapshotLabel(row)}
                            </Link>
                          ) : (
                            <span className="registry-admin-row-title registry-admin-monospace">
                              {attributionSnapshotLabel(row)}
                            </span>
                          )}
                          <span className="registry-admin-row-meta">
                            {row.snapshot_date} · {row.row_source} · {row.project_id ?? 'no project'}
                          </span>
                        </span>
                        <span className="registry-admin-row-meta">{formatNumber(row.events)}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Package Footprint
            </span>
            <div className="d-surface registry-surface-stack registry-admin-summary-list">
              <div>
                Public packages: {summary.totals.public_packages}
              </div>
              <div>
                Private packages: {summary.totals.private_packages}
              </div>
              <div>
                Org packages: {summary.totals.org_packages}
              </div>
              <div>
                Pending approvals: {summary.totals.pending_approvals}
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              30-Day Usage
            </span>
            <div className="d-surface registry-surface-stack registry-admin-summary-list">
              <div>
                API requests: {summary.totals.api_requests_30d}
              </div>
              <div>
                Personal publishes: {summary.totals.content_publishes_30d}
              </div>
              <div>
                Private package publishes: {summary.totals.private_package_publishes_30d}
              </div>
              <div>
                Org package publishes: {summary.totals.org_package_publishes_30d}
              </div>
              <div>
                Approval actions: {summary.totals.approval_actions_30d}
              </div>
              <div>
                Audit events: {summary.totals.audit_events_30d}
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Telemetry Attribution
            </span>
            <div className="d-surface registry-surface-stack registry-admin-summary-list">
              <div>
                Aliases: {summary.telemetry?.aliases_total ?? 0}
              </div>
              <div>
                Actor mix — Customer: {summary.telemetry?.aliases_by_actor_type.customer ?? 0} · Internal: {summary.telemetry?.aliases_by_actor_type.internal ?? 0} · Pipeline: {summary.telemetry?.aliases_by_actor_type.official_pipeline ?? 0}
              </div>
              <div>
                Identity mix — Installs: {summary.telemetry?.aliases_by_identity_type.install ?? 0} · Projects: {summary.telemetry?.aliases_by_identity_type.project ?? 0} · Anonymous: {summary.telemetry?.aliases_by_identity_type.anonymous ?? 0}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
