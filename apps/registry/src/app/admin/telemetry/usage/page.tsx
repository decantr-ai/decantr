import Link from 'next/link';
import type { Metadata } from 'next';
import {
  api,
  type AdminTelemetryOperatingAlert,
  type AdminTelemetryUsageTrend,
  type TelemetryActorType,
  type TelemetryUsageSource,
} from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';
import { upsertTelemetryAlias } from '../actions';

export const metadata: Metadata = {
  title: 'Telemetry Usage',
};

const dayOptions = [1, 7, 14, 30, 90] as const;
const actorOptions: Array<{ label: string; value: TelemetryActorType }> = [
  { label: 'Customer', value: 'customer' },
  { label: 'Internal', value: 'internal' },
  { label: 'Official pipeline', value: 'official_pipeline' },
  { label: 'Anonymous', value: 'anonymous' },
  { label: 'Service', value: 'service' },
];
const sourceOptions: Array<{ label: string; value: TelemetryUsageSource }> = [
  { label: 'API', value: 'api' },
  { label: 'CLI', value: 'cli' },
  { label: 'Content CI', value: 'content-ci' },
  { label: 'MCP', value: 'mcp' },
  { label: 'Registry web', value: 'registry-web' },
];

function isActorType(value: unknown): value is TelemetryActorType {
  return actorOptions.some((option) => option.value === value);
}

function isSource(value: unknown): value is TelemetryUsageSource {
  return sourceOptions.some((option) => option.value === value);
}

function parseDays(value: unknown) {
  const parsed = Number.parseInt(String(value ?? '7'), 10);
  return dayOptions.includes(parsed as (typeof dayOptions)[number]) ? parsed : 7;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function formatDelta(value: number) {
  const formatted = formatNumber(Math.abs(value));
  if (value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return '0';
}

function formatPercent(value: number) {
  return `${Math.round(value * 1000) / 10}%`;
}

function trendMeta(trend: AdminTelemetryUsageTrend) {
  return `${formatDelta(trend.delta)} vs previous`;
}

function rateTrendMeta(trend: AdminTelemetryUsageTrend) {
  return `${formatPercent(trend.current)} rate · ${formatDelta(Math.round(trend.delta * 1000) / 10)} pts`;
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

function actorStatus(actorType: string) {
  if (actorType === 'customer') return 'success';
  return 'info';
}

function candidateLabel(identityId: string, sources: string[]) {
  return `Usage candidate ${identityId} (${sources.join(', ')})`.slice(0, 160);
}

export default async function AdminTelemetryUsagePage({
  searchParams,
}: {
  searchParams: Promise<{
    actor_type?: string;
    days?: string;
    source?: string;
  }>;
}) {
  const params = await searchParams;
  const days = parseDays(params.days);
  const actorType = isActorType(params.actor_type) ? params.actor_type : undefined;
  const source = isSource(params.source) ? params.source : undefined;
  const { token, adminKey } = await requireAdminRequestContext();

  let usage = null;
  let error: string | null = null;
  try {
    usage = await api.getAdminTelemetryUsage(token, adminKey, {
      actor_type: actorType,
      days,
      source,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load telemetry usage';
  }

  return (
    <div className="registry-page-stack">
      <div className="registry-page-intro registry-admin-head">
        <div>
          <h3 className="text-lg font-semibold">Telemetry Usage</h3>
          <p className="registry-muted-copy">
            PostHog-backed operator view for customer-clean adoption, identity, and failure signals.
          </p>
        </div>
        <div className="registry-inline-actions">
          <Link href="/admin/telemetry" className="d-interactive" data-variant="ghost">
            Identity Control
          </Link>
          <Link href="/admin/reports" className="d-interactive" data-variant="ghost">
            Reports
          </Link>
        </div>
      </div>

      {error ? (
        <div className="d-annotation registry-inline-error" data-status="error">
          {error}
        </div>
      ) : null}

      <section className="d-section" data-density="compact">
        <form method="get" action="/admin/telemetry/usage" className="d-surface registry-surface-stack">
          <div className="registry-admin-telemetry-filter-grid">
            <select className="d-control" name="days" defaultValue={String(days)}>
              {dayOptions.map((option) => (
                <option key={option} value={option}>{option} days</option>
              ))}
            </select>
            <select className="d-control" name="actor_type" defaultValue={actorType ?? ''}>
              <option value="">All actors</option>
              {actorOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select className="d-control" name="source" defaultValue={source ?? ''}>
              <option value="">All sources</option>
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button type="submit" className="d-interactive" data-variant="primary">
              Filter
            </button>
          </div>
        </form>
      </section>

      {usage ? (
        <>
          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Usage Summary
            </span>
            <div className="registry-admin-stat-grid">
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.total_events)}</span>
                <span className="registry-admin-row-meta">Tracked events</span>
                <span className="registry-admin-row-meta">{trendMeta(usage.trends.total_events)}</span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.customer_events)}</span>
                <span className="registry-admin-row-meta">Customer events</span>
                <span className="registry-admin-row-meta">{trendMeta(usage.trends.customer_events)}</span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.internal_events)}</span>
                <span className="registry-admin-row-meta">Internal events</span>
                <span className="registry-admin-row-meta">
                  Previous {formatNumber(usage.previous_summary.internal_events)}
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.active_installs)}</span>
                <span className="registry-admin-row-meta">Active installs</span>
                <span className="registry-admin-row-meta">{trendMeta(usage.trends.active_installs)}</span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.active_projects)}</span>
                <span className="registry-admin-row-meta">Active projects</span>
                <span className="registry-admin-row-meta">{trendMeta(usage.trends.active_projects)}</span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.failure_events)}</span>
                <span className="registry-admin-row-meta">Failure signals</span>
                <span className="registry-admin-row-meta">{rateTrendMeta(usage.trends.failure_rate)}</span>
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Operating Alerts
            </span>
            <div className="d-surface registry-admin-stack">
              {usage.operating_alerts.length ? usage.operating_alerts.map((alert) => (
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
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Signal Buckets
            </span>
            <div className="d-surface registry-admin-stack">
              {usage.signal_buckets.map((bucket) => (
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
          </section>

          <section className="d-section" data-density="compact">
            <div className="registry-admin-card-grid">
              <div className="d-surface registry-admin-stack">
                <span className="d-label registry-anchor-label">Source Mix</span>
                {usage.source_mix.map((row) => (
                  <div key={row.source} className="registry-admin-row">
                    <span className="registry-admin-row-title">{row.source}</span>
                    <span className="registry-admin-row-meta">{formatNumber(row.count)}</span>
                  </div>
                ))}
              </div>
              <div className="d-surface registry-admin-stack">
                <span className="d-label registry-anchor-label">Actor Mix</span>
                {usage.actor_mix.map((row) => (
                  <div key={`${row.actor_type}-${row.source}`} className="registry-admin-row">
                    <span className="registry-admin-row-title">{row.actor_type}</span>
                    <span className="registry-admin-row-meta">{row.source} · {formatNumber(row.count)}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <div className="registry-admin-card-grid">
              <div className="d-surface registry-admin-stack">
                <span className="d-label registry-anchor-label">Top Events</span>
                {usage.event_counts.slice(0, 12).map((row) => (
                  <div key={`${row.event}-${row.actor_type}`} className="registry-admin-row">
                    <span className="registry-admin-row-copy">
                      <span className="registry-admin-row-title">{row.event}</span>
                      <span className="registry-admin-row-meta">{row.actor_type}</span>
                    </span>
                    <span className="registry-admin-row-meta">{formatNumber(row.count)}</span>
                  </div>
                ))}
              </div>
              <div className="d-surface registry-admin-stack">
                <span className="d-label registry-anchor-label">Failure Signals</span>
                {usage.failure_counts.length ? usage.failure_counts.map((row) => (
                  <div key={row.event} className="registry-admin-row">
                    <span className="registry-admin-row-title">{row.event}</span>
                    <span className="registry-admin-row-meta">{formatNumber(row.count)}</span>
                  </div>
                )) : (
                  <span className="registry-admin-row-meta">No failures in this range.</span>
                )}
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Candidate Aliases
            </span>
            <div className="d-surface registry-admin-stack">
              {usage.candidate_aliases.length ? usage.candidate_aliases.map((candidate) => (
                <div key={`${candidate.identity_type}:${candidate.identity_id}`} className="registry-admin-row">
                  <span className="registry-admin-row-copy">
                    <span className="registry-admin-row-title registry-admin-monospace">
                      {candidate.identity_type}:{candidate.identity_id}
                    </span>
                    <span className="registry-admin-row-meta">
                      {candidate.sources.join(', ')} · {formatNumber(candidate.events)} events · {formatTimestamp(candidate.last_seen)}
                    </span>
                  </span>
                  <div className="registry-inline-actions">
                    <span className="d-annotation" data-status={actorStatus(candidate.actor_type)}>
                      {candidate.actor_type}
                    </span>
                    {actorOptions.slice(0, 3).map((option) => (
                      <form key={option.value} action={upsertTelemetryAlias}>
                        <input type="hidden" name="identity_type" value={candidate.identity_type} />
                        <input type="hidden" name="identity_id" value={candidate.identity_id} />
                        <input type="hidden" name="actor_type" value={option.value} />
                        <input type="hidden" name="label" value={candidateLabel(candidate.identity_id, candidate.sources)} />
                        <button type="submit" className="d-interactive" data-variant="ghost">
                          Mark {option.label.toLowerCase()}
                        </button>
                      </form>
                    ))}
                    <Link
                      href={`/admin/telemetry?q=${encodeURIComponent(candidate.identity_id)}`}
                      className="d-interactive"
                      data-variant="ghost"
                    >
                      Alias
                    </Link>
                  </div>
                </div>
              )) : (
                <span className="registry-admin-row-meta">No unaliased identities in this range.</span>
              )}
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Active Identities
            </span>
            <div className="d-surface registry-admin-stack">
              {usage.active_identities.slice(0, 20).map((identity) => (
                <div key={`${identity.distinct_id}-${identity.source}-${identity.project_id ?? ''}`} className="registry-admin-row">
                  <span className="registry-admin-row-copy">
                    <span className="registry-admin-row-title registry-admin-monospace">
                      {identity.distinct_id}
                    </span>
                    <span className="registry-admin-row-meta">
                      {identity.source} · {identity.install_id ?? 'no install'} · {identity.project_id ?? 'no project'}
                    </span>
                  </span>
                  <span className="registry-admin-row-meta">
                    {formatNumber(identity.events)} · {formatTimestamp(identity.last_seen)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
