import {
  api,
  type AdminTelemetryOperatingAlert,
  type AdminTelemetryUsageTrend,
} from '@/lib/api';
import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdminRequestContext } from '@/lib/admin-workspace';

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

export default async function AdminReportsPage() {
  const { token, adminKey } = await requireAdminRequestContext();

  let summary = null;
  let error: string | null = null;
  let customerUsage = null;
  let telemetryUsageError: string | null = null;
  const [summaryResult, customerUsageResult] = await Promise.allSettled([
    api.getCommercialSummary(token, adminKey),
    api.getAdminTelemetryUsage(token, adminKey, {
      actor_type: 'customer',
      days: 30,
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
