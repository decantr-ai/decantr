'use client';

import { useEffect, useState, useTransition } from 'react';
import { createClient } from '@/lib/supabase/client';
import { api, type DashboardContentItem, type MeResponse, type OrgPolicy } from '@/lib/api';

export function OrgGovernancePanel() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [policy, setPolicy] = useState<OrgPolicy | null>(null);
  const [approvals, setApprovals] = useState<DashboardContentItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function load() {
    try {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token ?? '';
      if (!token) return;

      const profile = await api.getMe(token);
      setMe(profile);
      const activeOrg = profile.organizations[0] ?? null;
      if (!activeOrg) return;

      const [orgPolicy, approvalsResult] = await Promise.all([
        api.getOrgPolicy(token, activeOrg.slug).catch(() => null),
        api.getOrgApprovals(token, activeOrg.slug, { limit: 10, offset: 0 }).catch(() => null),
      ]);
      setPolicy(orgPolicy);
      setApprovals(Array.isArray(approvalsResult) ? approvalsResult : approvalsResult?.items ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organization governance');
    }
  }

  useEffect(() => {
    load();
  }, []);

  const activeOrg = me?.organizations[0] ?? null;
  const canManage =
    activeOrg && ['owner', 'admin'].includes(activeOrg.role);

  if (!me?.entitlements.org_collaboration || !activeOrg) {
    return (
      <div className="d-surface">
        <div className="flex flex-col gap-2">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Organization Governance</h3>
          <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
            Team governance becomes available once this account is attached to an active organization plan.
          </p>
        </div>
      </div>
    );
  }

  function handlePolicyChange(nextValue: boolean) {
    if (!activeOrg) return;
    setError(null);
    startTransition(async () => {
      try {
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? '';
        const updated = await api.updateOrgPolicy(token, activeOrg.slug, {
          require_public_content_approval: nextValue,
        });
        setPolicy(updated);
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
        const supabase = createClient();
        const {
          data: { session },
        } = await supabase.auth.getSession();
        const token = session?.access_token ?? '';
        if (decision === 'approve') {
          await api.approveOrgContent(token, activeOrg.slug, contentId);
        } else {
          await api.rejectOrgContent(token, activeOrg.slug, contentId);
        }
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update approval');
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="d-surface">
        <div className="flex flex-col gap-3">
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>Organization Governance</h3>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)', marginTop: '0.25rem' }}>
              {activeOrg.name} ({activeOrg.slug}) · {activeOrg.role}
            </p>
          </div>

          {error ? (
            <div className="d-annotation" data-status="error" style={{ display: 'block' }}>
              {error}
            </div>
          ) : null}

          <label
            className="flex items-center justify-between gap-4"
            style={{
              padding: '0.75rem 0',
              borderTop: '1px solid var(--d-border)',
              borderBottom: '1px solid var(--d-border)',
            }}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm" style={{ fontWeight: 600 }}>
                Require approval for public org packages
              </span>
              <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                When enabled, new public organization packages enter a pending queue until an org admin approves them.
              </span>
            </div>
            <input
              type="checkbox"
              checked={policy?.require_public_content_approval === true}
              disabled={!canManage || isPending}
              onChange={(e) => handlePolicyChange(e.target.checked)}
            />
          </label>
        </div>
      </div>

      <div className="d-surface">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>Pending Approvals</h4>
            <span className="d-annotation" data-status="info">
              {approvals.length} pending
            </span>
          </div>

          {approvals.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              No organization packages are waiting for approval.
            </p>
          ) : (
            approvals.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '0.75rem 0',
                  borderTop: '1px solid var(--d-border)',
                }}
              >
                <div className="flex flex-col gap-1" style={{ minWidth: 0 }}>
                  <div className="text-sm" style={{ fontWeight: 600 }}>
                    {item.name || item.slug}
                  </div>
                  <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                    {item.type} · {item.namespace} · {item.visibility}
                  </div>
                </div>
                <div className="flex items-center gap-2">
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
