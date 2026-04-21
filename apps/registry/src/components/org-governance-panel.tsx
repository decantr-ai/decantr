'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { KPIGrid } from '@/components/kpi-grid';
import {
  api,
  type DashboardContentItem,
  type MeResponse,
  type OrgAuditEntry,
  type OrgPolicy,
  type OrgUsageSummary,
} from '@/lib/api';
import { createClient } from '@/lib/supabase/client';

const AUDIT_SCOPE_OPTIONS = [
  { value: '', label: 'All scopes' },
  { value: 'organization', label: 'Organization' },
  { value: 'content', label: 'Content' },
  { value: 'membership', label: 'Membership' },
  { value: 'billing', label: 'Billing' },
] as const;

const AUDIT_ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'policy.updated', label: 'Policy updated' },
  { value: 'member.invited', label: 'Member invited' },
  { value: 'member.role_updated', label: 'Role updated' },
  { value: 'member.removed', label: 'Member removed' },
  { value: 'org_content.published', label: 'Org package published' },
  { value: 'org_content.approved', label: 'Org package approved' },
  { value: 'org_content.rejected', label: 'Org package rejected' },
] as const;

async function getAccessToken() {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session?.access_token ?? '';
}

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatActionLabel(action: string) {
  return action
    .split('.')
    .map((part) => part.replace(/_/g, ' '))
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' · ');
}

export function OrgGovernancePanel() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [orgSlug, setOrgSlug] = useState('');
  const [policy, setPolicy] = useState<OrgPolicy | null>(null);
  const [approvals, setApprovals] = useState<DashboardContentItem[]>([]);
  const [auditEntries, setAuditEntries] = useState<OrgAuditEntry[]>([]);
  const [usage, setUsage] = useState<OrgUsageSummary['usage'] | null>(null);
  const [auditScope, setAuditScope] = useState('');
  const [auditAction, setAuditAction] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const organizations = me?.organizations ?? [];
  const activeOrg = organizations.find((org) => org.slug === orgSlug) ?? organizations[0] ?? null;
  const canManage = Boolean(activeOrg && ['owner', 'admin'].includes(activeOrg.role));

  const governanceKpis = useMemo(() => {
    if (!usage) {
      return [];
    }

    return [
      { label: 'Pending approvals', value: usage.pending_approvals },
      { label: 'Private packages', value: usage.private_packages },
      { label: 'Seats used', value: usage.members },
      { label: 'Approval actions (30d)', value: usage.approval_actions_30d },
    ];
  }, [usage]);

  async function loadProfile() {
    try {
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        setMe(null);
        setOrgSlug('');
        return;
      }

      const profile = await api.getMe(token);
      setMe(profile);
      setOrgSlug((current) => {
        if (current && profile.organizations.some((org) => org.slug === current)) {
          return current;
        }
        return profile.organizations?.[0]?.slug ?? '';
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization governance');
    }
  }

  async function loadOrgState(nextOrgSlug: string) {
    if (!nextOrgSlug) {
      setPolicy(null);
      setApprovals([]);
      setAuditEntries([]);
      setUsage(null);
      return;
    }

    try {
      setError(null);
      const token = await getAccessToken();
      if (!token) {
        return;
      }

      const [orgPolicy, approvalsResult, auditResult, usageResult] = await Promise.all([
        api.getOrgPolicy(token, nextOrgSlug).catch(() => null),
        api.getOrgApprovals(token, nextOrgSlug, { limit: 12, offset: 0 }).catch(() => null),
        api
          .getOrgAuditLog(token, nextOrgSlug, {
            limit: 12,
            offset: 0,
            scope: auditScope || undefined,
            action: auditAction || undefined,
          })
          .catch(() => null),
        api.getOrgUsage(token, nextOrgSlug).catch(() => null),
      ]);

      setPolicy(orgPolicy);
      setApprovals(Array.isArray(approvalsResult) ? approvalsResult : approvalsResult?.items ?? []);
      setAuditEntries(auditResult?.items ?? []);
      setUsage(usageResult?.usage ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization governance');
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  useEffect(() => {
    if (!orgSlug) {
      setPolicy(null);
      setApprovals([]);
      setAuditEntries([]);
      setUsage(null);
      return;
    }

    void loadOrgState(orgSlug);
  }, [orgSlug, auditScope, auditAction]);

  function handlePolicyChange(
    updates: Partial<Pick<OrgPolicy, 'require_public_content_approval' | 'allow_member_submissions' | 'require_private_content_approval'>>,
  ) {
    if (!activeOrg) return;
    setError(null);

    startTransition(async () => {
      try {
        const token = await getAccessToken();
        const updated = await api.updateOrgPolicy(token, activeOrg.slug, {
          require_public_content_approval:
            updates.require_public_content_approval ?? policy?.require_public_content_approval ?? false,
          allow_member_submissions:
            updates.allow_member_submissions ?? policy?.allow_member_submissions ?? false,
          require_private_content_approval:
            updates.require_private_content_approval ?? policy?.require_private_content_approval ?? false,
        });
        setPolicy(updated);
        await loadOrgState(activeOrg.slug);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update organization policy');
      }
    });
  }

  function handleApproval(contentId: string, decision: 'approve' | 'reject') {
    if (!activeOrg) return;
    setError(null);

    startTransition(async () => {
      try {
        const token = await getAccessToken();
        if (decision === 'approve') {
          await api.approveOrgContent(token, activeOrg.slug, contentId);
        } else {
          await api.rejectOrgContent(token, activeOrg.slug, contentId);
        }
        await loadOrgState(activeOrg.slug);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update approval queue');
      }
    });
  }

  if (!me?.entitlements?.org_collaboration || organizations.length === 0) {
    return (
      <div className="d-surface registry-dashboard-panel">
        <div className="registry-dashboard-copy">
          <h3 className="registry-dashboard-title">Organization Governance</h3>
          <p className="registry-dashboard-description">
            Governance becomes available once this account is attached to an active Team or Enterprise organization.
          </p>
        </div>
        <div className="registry-action-band-actions">
          <Link href="/dashboard/billing" className="d-interactive no-underline" data-variant="primary">
            Review plans
          </Link>
          <Link href="/dashboard/team" className="d-interactive no-underline" data-variant="ghost">
            Open team workspace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="registry-page-stack">
      <section className="d-surface registry-dashboard-panel">
        <div className="registry-form-grid-split">
          <div className="registry-dashboard-copy">
            <h3 className="registry-dashboard-title">Organization Governance</h3>
            <p className="registry-dashboard-description">
              Manage approval rules, watch pending org packages, and inspect the audit trail for your shared workspace.
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="d-annotation" data-status="info">
                {activeOrg?.name ?? 'Organization'}
              </span>
              <span className="d-annotation" data-status="success">
                {activeOrg?.role ?? 'member'}
              </span>
              <span className="d-annotation" data-status="warning">
                {activeOrg?.tier ?? 'team'}
              </span>
            </div>
          </div>

          <div className="registry-form-grid">
            <label className="text-sm font-semibold" htmlFor="governance-org">
              Active organization
            </label>
            <select
              id="governance-org"
              className="d-control"
              value={activeOrg?.slug ?? ''}
              onChange={(event) => setOrgSlug(event.target.value)}
            >
              {organizations.map((org) => (
                <option key={org.id} value={org.slug}>
                  {org.name} ({org.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="registry-action-band" data-tone="governance">
          <div className="registry-action-band-copy">
            <h4 className="registry-action-band-title">Governance workflow</h4>
            <p className="registry-dashboard-description">
              Move between team membership and content review without losing the governance context for this organization.
            </p>
          </div>
          <div className="registry-action-band-actions">
            <Link href="/dashboard/team" className="d-interactive no-underline" data-variant="primary">
              Manage members
            </Link>
            <Link href="/dashboard/content" className="d-interactive no-underline" data-variant="ghost">
              Review packages
            </Link>
          </div>
        </div>

        {error ? (
          <div className="d-annotation registry-settings-message" data-status="error">
            {error}
          </div>
        ) : null}
      </section>

      {governanceKpis.length > 0 ? (
        <section className="d-section" data-density="compact">
          <KPIGrid items={governanceKpis} />
        </section>
      ) : null}

      <section className="d-surface registry-dashboard-panel">
        <div className="registry-panel-note">
          <h4 className="registry-panel-title">Publishing policy</h4>
          <p className="registry-dashboard-description">
            Decide whether public org packages must stop in an approval queue before they become visible.
          </p>
        </div>

          <div className="registry-policy-list">
          <label className="registry-policy-row">
            <div className="registry-policy-copy">
              <span className="text-sm font-semibold">
                Require approval for public org packages
              </span>
              <span className="registry-muted-copy">
                New public org packages remain pending until an owner or admin approves them.
              </span>
            </div>
            <input
              type="checkbox"
              checked={policy?.require_public_content_approval === true}
              disabled={!canManage || isPending}
              onChange={(event) =>
                handlePolicyChange({
                  require_public_content_approval: event.target.checked,
                })
              }
            />
          </label>

          {activeOrg?.tier === 'enterprise' ? (
            <>
              <label className="registry-policy-row">
                <div className="registry-policy-copy">
                  <span className="text-sm font-semibold">
                    Allow member submissions
                  </span>
                  <span className="registry-muted-copy">
                    Let members submit org packages without needing owner or admin publishing access.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={policy?.allow_member_submissions === true}
                  disabled={!canManage || isPending}
                  onChange={(event) =>
                    handlePolicyChange({
                      allow_member_submissions: event.target.checked,
                    })
                  }
                />
              </label>

              <label className="registry-policy-row">
                <div className="registry-policy-copy">
                  <span className="text-sm font-semibold">
                    Require approval for private org packages
                  </span>
                  <span className="registry-muted-copy">
                    Route private enterprise packages into the approval queue before they become visible to the org.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={policy?.require_private_content_approval === true}
                  disabled={!canManage || isPending}
                  onChange={(event) =>
                    handlePolicyChange({
                      require_private_content_approval: event.target.checked,
                    })
                  }
                />
              </label>
            </>
          ) : (
            <p className="registry-muted-copy">
              Advanced submission and private-review controls are part of the Enterprise governance model.
            </p>
          )}

          {!canManage ? (
            <p className="registry-muted-copy">
              Only owners and admins can change organization policy.
            </p>
          ) : null}
          </div>
      </section>

      <section className="d-surface registry-dashboard-panel">
        <div className="registry-panel-header">
            <div className="registry-panel-note">
              <h4 className="registry-panel-title">Pending approvals</h4>
              <p className="registry-dashboard-description">
                Review org packages waiting on a publish decision.
              </p>
            </div>
            <span className="d-annotation" data-status="info">
              {approvals.length} pending
            </span>
          </div>

          {approvals.length === 0 ? (
            <p className="registry-muted-copy">
              No org packages are waiting for approval right now.
            </p>
          ) : (
            <div className="registry-approval-list">
              {approvals.map((item) => (
                <div key={item.id} className="registry-approval-card">
                  <div className="registry-approval-meta">
                    <span className="text-sm font-semibold">
                      {item.name || item.slug}
                    </span>
                    <span className="registry-muted-copy">
                      {item.type} · {item.namespace} · {item.visibility}
                    </span>
                  </div>

                  <div className="registry-inline-actions">
                    <button
                      type="button"
                      className="d-interactive"
                      data-variant="ghost"
                      disabled={!canManage || isPending}
                      onClick={() => handleApproval(item.id, 'reject')}
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      className="d-interactive"
                      data-variant="primary"
                      disabled={!canManage || isPending}
                      onClick={() => handleApproval(item.id, 'approve')}
                    >
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>

      <section className="d-surface registry-dashboard-panel">
          <div className="registry-form-grid-split">
            <div className="registry-panel-note">
              <h4 className="registry-panel-title">Audit trail</h4>
              <p className="registry-dashboard-description">
                Filter the recent governance history for member changes, content decisions, and policy updates.
              </p>
            </div>

            <div className="registry-filter-bar">
              <select
                className="d-control registry-inline-select"
                value={auditScope}
                onChange={(event) => setAuditScope(event.target.value)}
              >
                {AUDIT_SCOPE_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                className="d-control registry-inline-select"
                value={auditAction}
                onChange={(event) => setAuditAction(event.target.value)}
              >
                {AUDIT_ACTION_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {auditEntries.length === 0 ? (
            <p className="registry-muted-copy">
              No audit events match the current filters.
            </p>
          ) : (
            auditEntries.map((entry) => (
              <div key={entry.id} className="registry-log-entry">
                <div className="registry-log-entry-title">
                  <span className="text-sm font-semibold">
                    {formatActionLabel(entry.action)}
                  </span>
                  <span className="d-annotation" data-status="info">
                    {entry.scope}
                  </span>
                  <span className="registry-muted-copy">
                    {formatTimestamp(entry.created_at)}
                  </span>
                </div>
                <div className="registry-muted-copy">
                  {entry.target_type}
                  {entry.target_id ? ` · ${entry.target_id}` : ''}
                </div>
              </div>
            ))
          )}
      </section>
    </div>
  );
}
