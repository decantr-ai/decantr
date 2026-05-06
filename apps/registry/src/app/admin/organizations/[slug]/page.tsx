import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import {
  api,
  type AdminTelemetryAttributionSnapshot,
} from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';
import {
  updateOrganizationTelemetryClassification,
  updateUserTelemetryClassification,
} from '../actions';

export const metadata: Metadata = {
  title: 'Organization Detail',
};

function formatTimestamp(value: string | null) {
  if (!value) return 'Unknown';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

function summarizeTelemetryRows(rows: AdminTelemetryAttributionSnapshot[]) {
  const projectIds = new Set<string>();
  const sources = new Set<string>();
  let events = 0;
  let lastSeen: string | null = null;

  for (const row of rows) {
    events += row.events;
    if (row.project_id) projectIds.add(row.project_id);
    if (row.row_source) sources.add(row.row_source);
    if (row.last_seen && (!lastSeen || new Date(row.last_seen) > new Date(lastSeen))) {
      lastSeen = row.last_seen;
    }
  }

  return {
    events,
    lastSeen,
    projects: projectIds.size,
    sources: sources.size,
  };
}

export default async function AdminOrganizationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { token, adminKey } = await requireAdminRequestContext();

  let detail = null;
  let telemetrySnapshots = null;
  let error: string | null = null;
  let telemetryError: string | null = null;
  try {
    detail = await api.getAdminOrganization(token, adminKey, slug);
    telemetrySnapshots = await api.getAdminTelemetryAttributionSnapshots(token, adminKey, {
      days: 30,
      limit: 12,
      org_id: detail.organization.id,
    });
  } catch (err) {
    if (!detail) {
      error = err instanceof Error ? err.message : 'Failed to load organization detail';
    } else {
      telemetryError = err instanceof Error ? err.message : 'Failed to load organization telemetry';
    }
  }

  const telemetrySummary = telemetrySnapshots ? summarizeTelemetryRows(telemetrySnapshots.items) : null;

  return (
    <div className="registry-page-stack">
      <div className="registry-page-intro registry-admin-head">
        <div>
          <h3 className="text-lg font-semibold">Organization Operations</h3>
          <p className="registry-muted-copy">
            Support and inspect a single org across seats, package posture, governance, and recent operational events.
          </p>
        </div>
        <Link href="/admin/organizations" className="d-interactive" data-variant="ghost">
          Back to organizations
        </Link>
      </div>

      {error ? (
        <div className="d-annotation registry-inline-error" data-status="error">
          {error}
        </div>
      ) : null}

      {detail ? (
        <>
          <section className="d-section" data-density="compact">
            <div className="d-surface registry-admin-card">
              <div className="registry-admin-card-head">
                <div>
                  <div className="registry-admin-card-title">{detail.organization.name}</div>
                  <div className="registry-admin-card-subtitle">{detail.organization.slug}</div>
                </div>
                <span className="d-annotation" data-status={detail.organization.tier === 'enterprise' ? 'warning' : 'info'}>
                  {detail.organization.tier}
                </span>
                {detail.organization.is_internal ? (
                  <span className="d-annotation" data-status="success">
                    internal
                  </span>
                ) : null}
                {detail.organization.is_test ? (
                  <span className="d-annotation" data-status="info">
                    test
                  </span>
                ) : null}
              </div>

              <div className="registry-admin-card-list">
                <div>Seats: {detail.usage.member_count} / {detail.organization.seat_limit}</div>
                <div>Public packages: {detail.usage.public_packages}</div>
                <div>Private packages: {detail.usage.private_packages}</div>
                <div>Pending approvals: {detail.usage.pending_approvals}</div>
                <div>API requests (30d): {detail.usage.api_requests_30d}</div>
                <div>Policy: {detail.policy.require_public_content_approval ? 'Public content approval required' : 'Public content can publish directly'}</div>
                <div>Member submissions: {detail.policy.allow_member_submissions ? 'Enabled' : 'Admins and owners only'}</div>
                <div>Private package review: {detail.policy.require_private_content_approval ? 'Required' : 'Direct private publish'}</div>
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Telemetry Classification
            </span>

            <form
              action={updateOrganizationTelemetryClassification.bind(null, detail.organization.slug)}
              className="d-surface registry-admin-stack"
            >
              <label className="registry-admin-row">
                <span className="registry-admin-row-copy">
                  <span className="registry-admin-row-title">Internal Decantr organization</span>
                  <span className="registry-admin-row-meta">Exclude this org from customer product metrics.</span>
                </span>
                <input
                  name="is_internal"
                  type="checkbox"
                  defaultChecked={detail.organization.is_internal}
                />
              </label>
              <label className="registry-admin-row">
                <span className="registry-admin-row-copy">
                  <span className="registry-admin-row-title">Synthetic or QA organization</span>
                  <span className="registry-admin-row-meta">Treat this org as diagnostic/test telemetry.</span>
                </span>
                <input
                  name="is_test"
                  type="checkbox"
                  defaultChecked={detail.organization.is_test}
                />
              </label>
              <div className="registry-inline-actions">
                <button type="submit" className="d-interactive" data-variant="primary">
                  Save classification
                </button>
                <Link
                  href={`/admin/telemetry?org_id=${encodeURIComponent(detail.organization.id)}`}
                  className="d-interactive"
                  data-variant="ghost"
                >
                  View aliases
                </Link>
              </div>
            </form>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Stored Telemetry Attribution
            </span>

            {telemetryError ? (
              <div className="d-annotation registry-inline-error" data-status="info">
                {telemetryError}
              </div>
            ) : null}

            {telemetrySummary && telemetrySnapshots?.items.length ? (
              <div className="registry-admin-stack">
                <div className="registry-admin-stat-grid">
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatNumber(telemetrySummary.events)}</span>
                    <span className="registry-admin-row-meta">Attributed events</span>
                    <span className="registry-admin-row-meta">Stored 30-day rows</span>
                  </div>
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatNumber(telemetrySummary.projects)}</span>
                    <span className="registry-admin-row-meta">Active projects</span>
                    <span className="registry-admin-row-meta">{formatNumber(telemetrySummary.sources)} sources</span>
                  </div>
                  <div className="d-surface registry-admin-stat">
                    <span className="registry-admin-row-title">{formatTimestamp(telemetrySummary.lastSeen)}</span>
                    <span className="registry-admin-row-meta">Last seen</span>
                    <span className="registry-admin-row-meta">From snapshot history</span>
                  </div>
                </div>

                <div className="d-surface registry-admin-stack">
                  {telemetrySnapshots.items.map((row) => (
                    <div key={row.id} className="registry-admin-row">
                      <span className="registry-admin-row-copy">
                        <span className="registry-admin-row-title registry-admin-monospace">
                          {row.project_id ?? 'no project'}
                        </span>
                        <span className="registry-admin-row-meta">
                          {row.snapshot_date} · {row.row_source} · {row.row_actor_type} · {formatTimestamp(row.last_seen)}
                        </span>
                      </span>
                      <span className="registry-admin-row-meta">{formatNumber(row.events)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="d-surface registry-admin-stack">
                <span className="registry-admin-row-meta">
                  No stored attribution rows for this organization in the latest 30-day snapshot.
                </span>
                <Link
                  href="/admin/telemetry/usage?days=30"
                  className="d-interactive"
                  data-variant="ghost"
                >
                  Open telemetry usage
                </Link>
              </div>
            )}
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Members ({detail.members.length})
            </span>

            <div className="d-surface registry-admin-stack">
              {detail.members.map((member) => (
                <div key={member.user_id} className="registry-admin-row">
                  <div className="registry-admin-row-copy">
                    <span className="registry-admin-row-title">
                      {member.display_name || member.email}
                    </span>
                    <span className="registry-admin-row-meta">
                      {member.email}
                    </span>
                  </div>
                  <span className="d-annotation">{member.role}</span>
                  {member.is_internal ? (
                    <span className="d-annotation" data-status="success">
                      internal
                    </span>
                  ) : null}
                  {member.is_test ? (
                    <span className="d-annotation" data-status="info">
                      test
                    </span>
                  ) : null}
                  <form
                    action={updateUserTelemetryClassification.bind(null, detail.organization.slug, member.user_id)}
                    className="registry-inline-actions"
                  >
                    <label className="d-annotation">
                      <input
                        name="is_internal"
                        type="checkbox"
                        defaultChecked={member.is_internal}
                      />{' '}
                      Internal
                    </label>
                    <label className="d-annotation">
                      <input
                        name="is_test"
                        type="checkbox"
                        defaultChecked={member.is_test}
                      />{' '}
                      Test
                    </label>
                    <button type="submit" className="d-interactive" data-variant="ghost">
                      Save
                    </button>
                    <Link
                      href={`/admin/telemetry?user_id=${encodeURIComponent(member.user_id)}`}
                      className="d-interactive"
                      data-variant="ghost"
                    >
                      Aliases
                    </Link>
                  </form>
                </div>
              ))}
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Recent Package Activity
            </span>

            <div className="d-surface registry-admin-stack">
              {detail.recent_content.map((item) => (
                <div key={item.id} className="registry-admin-row">
                  <div className="registry-admin-row-copy">
                    <span className="registry-admin-row-title">
                      {item.name || item.slug}
                    </span>
                    <span className="registry-admin-row-meta">
                      {item.type} · {item.visibility} · {item.status}
                    </span>
                  </div>
                  <Link href={`/${item.type}/${encodeURIComponent(item.namespace)}/${item.slug}`} className="d-interactive" data-variant="ghost">
                    Open
                  </Link>
                </div>
              ))}
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Recent Audit
            </span>

            <div className="d-surface registry-admin-stack">
              {detail.recent_audit.map((entry) => (
                <div key={entry.id} className="registry-admin-log-entry">
                  <div className="registry-admin-log-head">
                    <span className="registry-admin-row-title">
                      {entry.action}
                    </span>
                    <span className="d-annotation" data-status="info">
                      {entry.scope}
                    </span>
                  </div>
                  <div className="registry-admin-row-meta">
                    {entry.target_type}{entry.target_id ? ` · ${entry.target_id}` : ''}
                  </div>
                  <div className="registry-admin-row-meta">
                    {formatTimestamp(entry.created_at)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
