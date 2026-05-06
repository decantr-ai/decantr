import Link from 'next/link';
import type { Metadata } from 'next';
import {
  api,
  type AdminTelemetryCandidateAlias,
  type AdminTelemetryIdentityAlias,
  type AdminTelemetryUsageResponse,
  type TelemetryActorType,
  type TelemetryIdentityType,
} from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';
import {
  deleteTelemetryAlias,
  updateTelemetryAlias,
  upsertTelemetryAlias,
} from './actions';

export const metadata: Metadata = {
  title: 'Telemetry',
};

const identityOptions: Array<{ label: string; value: TelemetryIdentityType }> = [
  { label: 'Install', value: 'install' },
  { label: 'Project', value: 'project' },
  { label: 'Anonymous', value: 'anonymous' },
];

const actorOptions: Array<{ label: string; value: TelemetryActorType }> = [
  { label: 'Customer', value: 'customer' },
  { label: 'Internal', value: 'internal' },
  { label: 'Official pipeline', value: 'official_pipeline' },
  { label: 'Anonymous', value: 'anonymous' },
  { label: 'Service', value: 'service' },
];
const triageActorOptions = actorOptions.filter((option) =>
  ['customer', 'internal', 'official_pipeline'].includes(option.value)
);

function isIdentityType(value: unknown): value is TelemetryIdentityType {
  return identityOptions.some((option) => option.value === value);
}

function isActorType(value: unknown): value is TelemetryActorType {
  return actorOptions.some((option) => option.value === value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
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
  if (actorType === 'internal' || actorType === 'official_pipeline') return 'info';
  return 'warning';
}

function candidateLabel(candidate: AdminTelemetryCandidateAlias) {
  return `Usage candidate ${candidate.identity_id} (${candidate.sources.join(', ')})`.slice(0, 160);
}

function candidateReviewHref(candidate: AdminTelemetryCandidateAlias) {
  const params = new URLSearchParams({
    q: candidate.identity_id,
    new_identity_type: candidate.identity_type,
    new_identity_id: candidate.identity_id,
    new_actor_type: isActorType(candidate.actor_type) ? candidate.actor_type : 'customer',
    new_label: candidateLabel(candidate),
  });
  return `/admin/telemetry?${params}`;
}

function postHogEventsUrl(alias: AdminTelemetryIdentityAlias) {
  const projectId =
    process.env.POSTHOG_ENVIRONMENT_ID ||
    process.env.POSTHOG_PROJECT_ID ||
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
  if (!projectId) return null;

  const host = (process.env.POSTHOG_HOST || 'https://us.posthog.com').replace(/\/+$/, '');
  return `${host}/project/${encodeURIComponent(projectId)}/events?search=${encodeURIComponent(alias.identity_id)}`;
}

export default async function AdminTelemetryPage({
  searchParams,
}: {
  searchParams: Promise<{
    actor_type?: string;
    identity_type?: string;
    new_actor_type?: string;
    new_identity_id?: string;
    new_identity_type?: string;
    new_label?: string;
    org_id?: string;
    q?: string;
    user_id?: string;
  }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const identityType = isIdentityType(params.identity_type) ? params.identity_type : '';
  const actorType = isActorType(params.actor_type) ? params.actor_type : '';
  const newIdentityType = isIdentityType(params.new_identity_type) ? params.new_identity_type : 'install';
  const newActorType = isActorType(params.new_actor_type) ? params.new_actor_type : 'internal';
  const newIdentityId = typeof params.new_identity_id === 'string' ? params.new_identity_id : '';
  const newLabel = typeof params.new_label === 'string' ? params.new_label : '';
  const orgId = typeof params.org_id === 'string' ? params.org_id : '';
  const userId = typeof params.user_id === 'string' ? params.user_id : '';
  const { token, adminKey } = await requireAdminRequestContext();

  let aliases = null;
  let candidateUsage: AdminTelemetryUsageResponse | null = null;
  let error: string | null = null;
  let candidateError: string | null = null;
  try {
    const [aliasResult, candidateResult] = await Promise.allSettled([
      api.getAdminTelemetryAliases(token, adminKey, {
        q: query || undefined,
        identity_type: identityType || undefined,
        actor_type: actorType || undefined,
        org_id: orgId || undefined,
        user_id: userId || undefined,
        limit: 100,
        offset: 0,
      }),
      api.getAdminTelemetryUsage(token, adminKey, {
        days: 30,
      }),
    ]);

    if (aliasResult.status === 'fulfilled') {
      aliases = aliasResult.value;
    } else {
      error = aliasResult.reason instanceof Error
        ? aliasResult.reason.message
        : 'Failed to load telemetry aliases';
    }

    if (candidateResult.status === 'fulfilled') {
      candidateUsage = candidateResult.value;
    } else {
      candidateError = candidateResult.reason instanceof Error
        ? candidateResult.reason.message
        : 'Failed to load active identity candidates';
    }
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load telemetry aliases';
  }

  return (
    <div className="registry-page-stack">
      <div className="registry-page-intro registry-admin-head">
        <div>
          <h3 className="text-lg font-semibold">Telemetry Identity Control</h3>
          <p className="registry-muted-copy">
            Govern opaque install, project, and anonymous identities for customer-clean attribution.
          </p>
        </div>
        <div className="registry-inline-actions">
          <Link href="/admin/telemetry/usage" className="d-interactive" data-variant="ghost">
            Usage
          </Link>
          <Link href="/admin/organizations" className="d-interactive" data-variant="ghost">
            Organizations
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

      {aliases ? (
        <section className="d-section" data-density="compact">
          <span className="d-label registry-anchor-label">
            Alias Summary
          </span>
          <div className="registry-admin-stat-grid">
            <div className="d-surface registry-admin-stat">
              <span className="registry-admin-row-title">{aliases.total}</span>
              <span className="registry-admin-row-meta">Matching aliases</span>
            </div>
            <div className="d-surface registry-admin-stat">
              <span className="registry-admin-row-title">{aliases.summary.by_actor_type.customer}</span>
              <span className="registry-admin-row-meta">Customer</span>
            </div>
            <div className="d-surface registry-admin-stat">
              <span className="registry-admin-row-title">{aliases.summary.by_actor_type.internal}</span>
              <span className="registry-admin-row-meta">Internal</span>
            </div>
            <div className="d-surface registry-admin-stat">
              <span className="registry-admin-row-title">{aliases.summary.by_identity_type.install}</span>
              <span className="registry-admin-row-meta">Installs</span>
            </div>
          </div>
        </section>
      ) : null}

      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">
          Candidate Review Queue
        </span>
        <div className="registry-admin-stack">
          {candidateUsage ? (
            <div className="registry-admin-stat-grid">
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(candidateUsage.summary.candidate_aliases)}</span>
                <span className="registry-admin-row-meta">Unaliased identities</span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(candidateUsage.summary.unclassified_events)}</span>
                <span className="registry-admin-row-meta">Unclassified events</span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(candidateUsage.summary.customer_events)}</span>
                <span className="registry-admin-row-meta">Customer events</span>
              </div>
              <div className="d-surface registry-admin-stat">
                <span className="registry-admin-row-title">{formatNumber(candidateUsage.summary.internal_events + candidateUsage.summary.official_pipeline_events)}</span>
                <span className="registry-admin-row-meta">Decantr-owned events</span>
              </div>
            </div>
          ) : null}

          {candidateError ? (
            <div className="d-annotation registry-inline-error" data-status="info">
              {candidateError}
            </div>
          ) : null}

          {candidateUsage ? (
            <div className="d-surface registry-admin-stack">
              {candidateUsage.candidate_aliases.length ? (
                candidateUsage.candidate_aliases.slice(0, 12).map((candidate) => (
                  <div key={`${candidate.identity_type}:${candidate.identity_id}`} className="registry-admin-alias-row">
                    <div className="registry-admin-alias-row-head">
                      <span className="registry-admin-row-copy">
                        <span className="registry-admin-row-title registry-admin-monospace">
                          {candidate.identity_type}:{candidate.identity_id}
                        </span>
                        <span className="registry-admin-row-meta">
                          {candidate.sources.join(', ')} · {formatNumber(candidate.events)} events · {formatTimestamp(candidate.last_seen)}
                        </span>
                      </span>
                      <span className="d-annotation" data-status={actorStatus(candidate.actor_type)}>
                        {candidate.actor_type}
                      </span>
                    </div>
                    <div className="registry-inline-actions">
                      {triageActorOptions.map((option) => (
                        <form key={option.value} action={upsertTelemetryAlias}>
                          <input type="hidden" name="identity_type" value={candidate.identity_type} />
                          <input type="hidden" name="identity_id" value={candidate.identity_id} />
                          <input type="hidden" name="actor_type" value={option.value} />
                          <input type="hidden" name="label" value={candidateLabel(candidate)} />
                          <button type="submit" className="d-interactive" data-variant="ghost">
                            Mark {option.label.toLowerCase()}
                          </button>
                        </form>
                      ))}
                      <Link href={candidateReviewHref(candidate)} className="d-interactive" data-variant="ghost">
                        Review details
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <span className="registry-admin-row-meta">No active unaliased identities in the 30-day window.</span>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="d-section" data-density="compact">
        <form method="get" action="/admin/telemetry" className="d-surface registry-surface-stack">
          <div className="registry-admin-telemetry-filter-grid">
            {orgId ? <input type="hidden" name="org_id" value={orgId} /> : null}
            {userId ? <input type="hidden" name="user_id" value={userId} /> : null}
            <input
              className="d-control"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search identity, label, user, or org"
            />
            <select className="d-control" name="identity_type" defaultValue={identityType}>
              <option value="">All identities</option>
              {identityOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <select className="d-control" name="actor_type" defaultValue={actorType}>
              <option value="">All actors</option>
              {actorOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
            <button type="submit" className="d-interactive" data-variant="primary">
              Filter
            </button>
          </div>
          {orgId || userId ? (
            <div className="registry-inline-actions">
              <span className="d-annotation" data-status="info">
                Scoped filter active
              </span>
              <Link href="/admin/telemetry" className="d-interactive" data-variant="ghost">
                Clear scope
              </Link>
            </div>
          ) : null}
        </form>
      </section>

      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">
          Add or Update Alias
        </span>
        <form action={upsertTelemetryAlias} className="d-surface registry-admin-stack">
          {newIdentityId ? (
            <div className="registry-inline-actions">
              <span className="d-annotation" data-status="info">
                Candidate prefilled
              </span>
              <Link href="/admin/telemetry" className="d-interactive" data-variant="ghost">
                Clear prefill
              </Link>
            </div>
          ) : null}
          <div className="registry-admin-alias-grid">
            <label className="registry-field-stack">
              <span className="registry-admin-row-title">Identity type</span>
              <select className="d-control" name="identity_type" defaultValue={newIdentityType} required>
                {identityOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="registry-field-stack">
              <span className="registry-admin-row-title">Identity ID</span>
              <input className="d-control" name="identity_id" maxLength={256} defaultValue={newIdentityId} placeholder="install_..." required />
            </label>
            <label className="registry-field-stack">
              <span className="registry-admin-row-title">Actor</span>
              <select className="d-control" name="actor_type" defaultValue={newActorType} required>
                {actorOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="registry-field-stack">
              <span className="registry-admin-row-title">Label</span>
              <input className="d-control" name="label" maxLength={160} defaultValue={newLabel} placeholder="Local founder install" />
            </label>
            <label className="registry-field-stack">
              <span className="registry-admin-row-title">User</span>
              <input className="d-control" name="user_ref" maxLength={256} placeholder="Email or UUID" />
            </label>
            <label className="registry-field-stack">
              <span className="registry-admin-row-title">Organization</span>
              <input className="d-control" name="org_ref" maxLength={256} placeholder="Slug or UUID" />
            </label>
          </div>
          <div className="registry-inline-actions">
            <button type="submit" className="d-interactive" data-variant="primary">
              Save alias
            </button>
          </div>
        </form>
      </section>

      {aliases ? (
        <section className="d-section" data-density="compact">
          <span className="d-label registry-anchor-label">
            Identity Aliases
          </span>

          {aliases.items.length ? (
            <div className="d-surface registry-admin-stack">
              {aliases.items.map((alias) => {
                const eventsUrl = postHogEventsUrl(alias);

                return (
                  <div key={alias.id} className="registry-admin-alias-row">
                    <div className="registry-admin-alias-row-head">
                      <div className="registry-admin-row-copy">
                        <span className="registry-admin-row-title">
                          {alias.label || alias.identity_id}
                        </span>
                        <span className="registry-admin-row-meta registry-admin-monospace">
                          {alias.identity_type}:{alias.identity_id}
                        </span>
                      </div>
                      <span className="d-annotation" data-status={alias.actor_type === 'customer' ? 'success' : 'info'}>
                        {alias.actor_type}
                      </span>
                    </div>

                    <div className="registry-admin-card-list">
                      <div>Updated: {formatTimestamp(alias.updated_at)}</div>
                      <div>User: {alias.user?.email || alias.user_id || 'unlinked'}</div>
                      <div>Organization: {alias.organization?.slug || alias.org_id || 'unlinked'}</div>
                    </div>

                    <form
                      action={updateTelemetryAlias.bind(null, alias.id)}
                      className="registry-admin-alias-grid"
                    >
                      <label className="registry-field-stack">
                        <span className="registry-admin-row-title">Actor</span>
                        <select className="d-control" name="actor_type" defaultValue={alias.actor_type}>
                          {actorOptions.map((option) => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                          ))}
                        </select>
                      </label>
                      <label className="registry-field-stack">
                        <span className="registry-admin-row-title">Label</span>
                        <input className="d-control" name="label" maxLength={160} defaultValue={alias.label ?? ''} />
                      </label>
                      <label className="registry-field-stack">
                        <span className="registry-admin-row-title">User</span>
                        <input className="d-control" name="user_ref" maxLength={256} defaultValue={alias.user?.email ?? alias.user_id ?? ''} />
                      </label>
                      <label className="registry-field-stack">
                        <span className="registry-admin-row-title">Organization</span>
                        <input className="d-control" name="org_ref" maxLength={256} defaultValue={alias.organization?.slug ?? alias.org_id ?? ''} />
                      </label>
                      <div className="registry-inline-actions">
                        <button type="submit" className="d-interactive" data-variant="primary">
                          Save
                        </button>
                        {eventsUrl ? (
                          <Link href={eventsUrl} className="d-interactive" data-variant="ghost" target="_blank">
                            PostHog
                          </Link>
                        ) : null}
                      </div>
                    </form>

                    <form action={deleteTelemetryAlias.bind(null, alias.id)} className="registry-inline-actions">
                      <button type="submit" className="d-interactive" data-variant="ghost">
                        Delete alias
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="d-surface registry-empty-state" data-density="compact">
              <h4>No telemetry aliases found</h4>
              <p>Customer attribution is currently using account flags and default resolver behavior.</p>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
