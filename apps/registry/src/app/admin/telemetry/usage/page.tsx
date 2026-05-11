import Link from 'next/link';
import type { Metadata } from 'next';
import {
  api,
  type AdminTelemetryAttributionSnapshot,
  type AdminTelemetryAttributionRow,
  type AdminTelemetryOperatingAlert,
  type AdminTelemetryCandidateAlias,
  type AdminTelemetryUsageTrend,
  type TelemetryActorType,
  type TelemetryUsageSource,
} from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';
import { summarizeTelemetryPipelineHealth } from '@/lib/telemetry-pipeline-health';
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
  { label: 'Marketing web', value: 'marketing-web' },
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

function identityCoverage(summary: { total_events: number; unclassified_events: number }) {
  if (summary.total_events <= 0) return 1;
  return 1 - (summary.unclassified_events / summary.total_events);
}

function candidateAliasRate(summary: { active_identities: number; candidate_aliases: number }) {
  if (summary.active_identities <= 0) return 0;
  return summary.candidate_aliases / summary.active_identities;
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

function candidateLabel(identityId: string, sources: string[]) {
  return `Usage candidate ${identityId} (${sources.join(', ')})`.slice(0, 160);
}

function candidateAliasHref(candidate: AdminTelemetryCandidateAlias) {
  const params = new URLSearchParams({
    q: candidate.identity_id,
    new_identity_type: candidate.identity_type,
    new_identity_id: candidate.identity_id,
    new_actor_type: isActorType(candidate.actor_type) ? candidate.actor_type : 'customer',
    new_label: candidateLabel(candidate.identity_id, candidate.sources),
  });
  return `/admin/telemetry?${params}`;
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
  let snapshotHistory = null;
  let attribution = null;
  let attributionSnapshots = null;
  let error: string | null = null;
  let snapshotError: string | null = null;
  let attributionError: string | null = null;
  let attributionSnapshotError: string | null = null;
  try {
    const [usageResult, snapshotResult, attributionResult, attributionSnapshotResult] = await Promise.allSettled([
      api.getAdminTelemetryUsage(token, adminKey, {
        actor_type: actorType,
        days,
        source,
      }),
      api.getAdminTelemetrySnapshots(token, adminKey, {
        actor_type: actorType,
        days,
        limit: 6,
        source,
      }),
      api.getAdminTelemetryAttribution(token, adminKey, {
        actor_type: actorType,
        days,
        limit: 20,
        source,
      }),
      api.getAdminTelemetryAttributionSnapshots(token, adminKey, {
        actor_type: actorType,
        days,
        limit: 12,
        source,
      }),
    ]);

    if (usageResult.status === 'fulfilled') {
      usage = usageResult.value;
    } else {
      error = usageResult.reason instanceof Error
        ? usageResult.reason.message
        : 'Failed to load telemetry usage';
    }

    if (snapshotResult.status === 'fulfilled') {
      snapshotHistory = snapshotResult.value;
    } else {
      snapshotError = snapshotResult.reason instanceof Error
        ? snapshotResult.reason.message
        : 'Failed to load telemetry snapshots';
    }

    if (attributionResult.status === 'fulfilled') {
      attribution = attributionResult.value;
    } else {
      attributionError = attributionResult.reason instanceof Error
        ? attributionResult.reason.message
        : 'Failed to load telemetry attribution';
    }

    if (attributionSnapshotResult.status === 'fulfilled') {
      attributionSnapshots = attributionSnapshotResult.value;
    } else {
      attributionSnapshotError = attributionSnapshotResult.reason instanceof Error
        ? attributionSnapshotResult.reason.message
        : 'Failed to load telemetry attribution snapshots';
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load telemetry usage';
  }

  const pipelineHealth = summarizeTelemetryPipelineHealth({
    attributionSnapshots: attributionSnapshots?.items ?? [],
    usageSnapshots: snapshotHistory?.items ?? [],
  });

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

      <section className="d-section" data-density="compact">
        <form method="get" action="/admin/telemetry/usage" className="d-surface registry-surface-stack">
          <div className="registry-admin-telemetry-filter-grid">
            <select
              className="d-control"
              name="days"
              defaultValue={String(days)}
              aria-label="Usage lookback window"
            >
              {dayOptions.map((option) => (
                <option key={option} value={option}>{option} days</option>
              ))}
            </select>
            <select
              className="d-control"
              name="actor_type"
              defaultValue={actorType ?? ''}
              aria-label="Filter usage by actor type"
            >
              <option value="">All actors</option>
              {actorOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select
              className="d-control"
              name="source"
              defaultValue={source ?? ''}
              aria-label="Filter usage by source"
            >
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

      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">
          Telemetry Pipeline Health
        </span>
        <div className="registry-admin-stat-grid">
          <div className="d-surface registry-admin-stat">
            <span className="registry-admin-row-title">{pipelineHealth.label}</span>
            <span className="registry-admin-row-meta">{pipelineHealth.detail}</span>
            <span className="d-annotation" data-status={pipelineHealth.status}>
              {pipelineHealth.status}
            </span>
          </div>
          <div className="d-surface registry-admin-stat">
            <span className="registry-admin-row-title">
              {formatTimestamp(pipelineHealth.usageSnapshotLastCapturedAt)}
            </span>
            <span className="registry-admin-row-meta">Latest usage snapshot</span>
            <span className="registry-admin-row-meta">
              {formatNumber(pipelineHealth.usageSnapshotCount)} stored rows
            </span>
          </div>
          <div className="d-surface registry-admin-stat">
            <span className="registry-admin-row-title">
              {formatTimestamp(pipelineHealth.attributionSnapshotLastCapturedAt)}
            </span>
            <span className="registry-admin-row-meta">Latest attribution snapshot</span>
            <span className="registry-admin-row-meta">
              {formatNumber(pipelineHealth.attributionSnapshotCount)} stored rows
            </span>
          </div>
        </div>
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
              Identity Coverage
            </span>
            <div className="registry-admin-stat-grid">
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatPercent(identityCoverage(usage.summary))}</span>
                <span className="registry-admin-row-meta">Classification coverage</span>
                <span className="registry-admin-row-meta">
                  {formatNumber(usage.summary.unclassified_events)} unclassified events
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.candidate_aliases)}</span>
                <span className="registry-admin-row-meta">Candidate aliases</span>
                <span className="registry-admin-row-meta">
                  {formatPercent(candidateAliasRate(usage.summary))} of active identities
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.active_orgs)}</span>
                <span className="registry-admin-row-meta">Active customer orgs</span>
                <span className="registry-admin-row-meta">
                  {formatNumber(usage.summary.active_projects)} active projects
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.summary.customer_events)}</span>
                <span className="registry-admin-row-meta">Customer-attributed events</span>
                <span className="registry-admin-row-meta">{trendMeta(usage.trends.customer_events)}</span>
              </div>
            </div>
            <div className="d-surface registry-admin-stack">
              <div className="registry-admin-row">
                <span className="registry-admin-row-copy">
                  <span className="registry-admin-row-title">Operator playbook</span>
                  <span className="registry-admin-row-meta">
                    Review candidate aliases, mark internal/test traffic first, then ask customer teams to run decantr telemetry link after login so opted-in CLI usage attaches to their org.
                  </span>
                </span>
                <Link href="/admin/telemetry" className="d-interactive" data-variant="ghost">
                  Review identities
                </Link>
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Product Activation
            </span>
            <div className="registry-admin-stat-grid">
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.product_activation.health_report_events)}</span>
                <span className="registry-admin-row-meta">Health reports</span>
                <span className="registry-admin-row-meta">
                  {formatNumber(usage.product_activation.healthy_project_events)} healthy milestones
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatPercent(usage.product_activation.activation_rate)}</span>
                <span className="registry-admin-row-meta">Healthy report rate</span>
                <span className="registry-admin-row-meta">
                  {formatPercent(usage.product_activation.ci_failure_rate)} CI failure rate
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.product_activation.studio_started_events)}</span>
                <span className="registry-admin-row-meta">Studio starts</span>
                <span className="registry-admin-row-meta">
                  {formatNumber(usage.product_activation.studio_refresh_events)} refreshes
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.product_activation.remediation_prompt_events)}</span>
                <span className="registry-admin-row-meta">Remediation prompts</span>
                <span className="registry-admin-row-meta">
                  {formatNumber(usage.product_activation.ci_failure_events)} CI failures
                </span>
              </div>
            </div>
            <div className="d-surface registry-admin-stack">
              <div className="registry-admin-row">
                <span className="registry-admin-row-copy">
                  <span className="registry-admin-row-title">Lifecycle commands</span>
                  <span className="registry-admin-row-meta">
                    Analyze {formatNumber(usage.product_activation.analyze_completed_events)} · new {formatNumber(usage.product_activation.new_completed_events)} · init {formatNumber(usage.product_activation.init_completed_events)} · refresh {formatNumber(usage.product_activation.refresh_completed_events)} · check {formatNumber(usage.product_activation.check_completed_events)}
                  </span>
                </span>
              </div>
              {usage.product_activation.warnings.length ? usage.product_activation.warnings.map((warning) => (
                <div key={warning} className="registry-admin-row">
                  <span className="registry-admin-row-title">{warning}</span>
                  <span className="d-annotation" data-status="warning">warning</span>
                </div>
              )) : (
                <span className="registry-admin-row-meta">No Project Health activation warnings in this range.</span>
              )}
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Marketing Attribution
            </span>
            <div className="registry-admin-stat-grid">
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.marketing_attribution.total_events)}</span>
                <span className="registry-admin-row-meta">Marketing-web events</span>
                <span className="registry-admin-row-meta">
                  {formatNumber(usage.marketing_attribution.campaign_attributed_events)} campaign-attributed
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatPercent(usage.marketing_attribution.campaign_attribution_rate)}</span>
                <span className="registry-admin-row-meta">Campaign coverage</span>
                <span className="registry-admin-row-meta">
                  {formatPercent(usage.marketing_attribution.landing_attribution_rate)} landing coverage
                </span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(usage.marketing_attribution.registry_follow_through_events)}</span>
                <span className="registry-admin-row-meta">Registry follow-through</span>
                <span className="registry-admin-row-meta">Attributed registry events</span>
              </div>
            </div>
            {usage.marketing_attribution.warnings.length ? (
              <div className="d-surface registry-admin-stack">
                {usage.marketing_attribution.warnings.map((warning) => (
                  <div key={warning} className="registry-admin-row">
                    <span className="registry-admin-row-title">{warning}</span>
                    <span className="d-annotation" data-status="warning">warning</span>
                  </div>
                ))}
              </div>
            ) : null}
            <div className="registry-admin-card-grid">
              <div className="d-surface registry-admin-stack">
                <span className="d-label registry-anchor-label">Top Campaigns</span>
                {usage.marketing_campaigns.length ? usage.marketing_campaigns.map((row) => (
                  <div key={`${row.campaign}-${row.source}-${row.medium}`} className="registry-admin-row">
                    <span className="registry-admin-row-copy">
                      <span className="registry-admin-row-title">{row.campaign}</span>
                      <span className="registry-admin-row-meta">
                        {row.source} · {row.medium} · {formatNumber(row.page_views)} views · {formatNumber(row.cta_clicks)} CTAs · {formatNumber(row.registry_follow_through_events)} registry
                      </span>
                    </span>
                    <span className="registry-admin-row-meta">{formatNumber(row.events)}</span>
                  </div>
                )) : (
                  <span className="registry-admin-row-meta">No campaign-attributed events in this range.</span>
                )}
              </div>
              <div className="d-surface registry-admin-stack">
                <span className="d-label registry-anchor-label">Top Landing Paths</span>
                {usage.marketing_landing_paths.length ? usage.marketing_landing_paths.map((row) => (
                  <div key={row.landing_path} className="registry-admin-row">
                    <span className="registry-admin-row-copy">
                      <span className="registry-admin-row-title registry-admin-monospace">{row.landing_path}</span>
                      <span className="registry-admin-row-meta">
                        {formatNumber(row.page_views)} views · {formatNumber(row.cta_clicks)} CTAs · {formatNumber(row.registry_follow_through_events)} registry · {formatTimestamp(row.last_seen)}
                      </span>
                    </span>
                    <span className="registry-admin-row-meta">{formatNumber(row.events)}</span>
                  </div>
                )) : (
                  <span className="registry-admin-row-meta">No landing-path attribution in this range.</span>
                )}
              </div>
            </div>
          </section>

          {attribution ? (
            <section className="d-section" data-density="compact">
              <span className="d-label registry-anchor-label">
                Org / Project Attribution
              </span>
              <div className="registry-admin-stat-grid">
                <div className="d-surface registry-admin-stat">
                  <span className="registry-admin-row-title">{formatNumber(attribution.summary.active_orgs)}</span>
                  <span className="registry-admin-row-meta">Active orgs</span>
                  <span className="registry-admin-row-meta">{formatNumber(attribution.summary.active_projects)} projects</span>
                </div>
                <div className="d-surface registry-admin-stat">
                  <span className="registry-admin-row-title">{formatNumber(attribution.summary.attributed_events)}</span>
                  <span className="registry-admin-row-meta">Attributed events</span>
                  <span className="registry-admin-row-meta">{formatNumber(attribution.summary.unattributed_events)} unattributed</span>
                </div>
                <div className="d-surface registry-admin-stat">
                  <span className="registry-admin-row-title">{formatNumber(attribution.summary.returned_rows)}</span>
                  <span className="registry-admin-row-meta">Shown rows</span>
                  <span className="registry-admin-row-meta">{formatNumber(attribution.summary.scanned_rows)} scanned</span>
                </div>
              </div>
              <div className="d-surface registry-admin-stack">
                {attribution.rows.length ? attribution.rows.map((row) => (
                  <div key={`${row.org_id ?? 'no-org'}-${row.project_id ?? 'no-project'}-${row.source}-${row.actor_type}`} className="registry-admin-row">
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
                        {row.source} · {row.actor_type} · {row.project_id ?? 'no project'} · {formatTimestamp(row.last_seen)}
                      </span>
                    </span>
                    <span className="registry-admin-row-meta">{formatNumber(row.events)}</span>
                  </div>
                )) : (
                  <span className="registry-admin-row-meta">No attributed usage in this range.</span>
                )}
              </div>
            </section>
          ) : null}

          {attributionSnapshots?.items.length ? (
            <section className="d-section" data-density="compact">
              <span className="d-label registry-anchor-label">
                Stored Attribution History
              </span>
              <div className="d-surface registry-admin-stack">
                {attributionSnapshots.items.map((row) => (
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
                        {row.snapshot_date} · {row.row_source} · {row.row_actor_type} · {row.project_id ?? 'no project'} · {formatTimestamp(row.last_seen)}
                      </span>
                    </span>
                    <span className="registry-admin-row-meta">{formatNumber(row.events)}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

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

          {snapshotHistory?.items.length ? (
            <section className="d-section" data-density="compact">
              <span className="d-label registry-anchor-label">
                Stored Snapshots
              </span>
              <div className="d-surface registry-admin-stack">
                {snapshotHistory.items.map((snapshot) => (
                  <div key={snapshot.id} className="registry-admin-row">
                    <span className="registry-admin-row-copy">
                      <span className="registry-admin-row-title">
                        {snapshot.snapshot_date} · {snapshot.actor_type} · {snapshot.source}
                      </span>
                      <span className="registry-admin-row-meta">
                        {formatNumber(snapshot.active_installs)} installs · {formatNumber(snapshot.active_projects)} projects · {formatNumber(snapshot.failure_events)} failures
                      </span>
                    </span>
                    <span className="registry-admin-row-meta">{formatNumber(snapshot.total_events)}</span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

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
                      href={candidateAliasHref(candidate)}
                      className="d-interactive"
                      data-variant="ghost"
                    >
                      Review
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
