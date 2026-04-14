import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Commercial Reports',
};

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/dashboard');
  }

  const token = session.access_token;
  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';

  let summary = null;
  let error: string | null = null;
  try {
    summary = await api.getCommercialSummary(token, adminKey);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load commercial summary';
  }

  return (
    <div className="registry-page-stack">
      <div className="registry-inline-actions" style={{ justifyContent: 'space-between' }}>
        <h3 className="text-lg font-semibold">Commercial Reports</h3>
        <Link href="/admin/organizations" className="d-interactive" data-variant="ghost">
          Open organizations
        </Link>
      </div>

      {error ? (
        <div className="d-annotation" data-status="error" style={{ display: 'block' }}>
          {error}
        </div>
      ) : null}

      {summary ? (
        <>
          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Tier Distribution
            </span>
            <div className="d-surface registry-surface-stack">
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Users — Free: {summary.users_by_tier.free} · Pro: {summary.users_by_tier.pro} · Team: {summary.users_by_tier.team} · Enterprise: {summary.users_by_tier.enterprise}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Organizations — Team: {summary.organizations_by_tier.team} · Enterprise: {summary.organizations_by_tier.enterprise}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Total seat capacity: {summary.totals.seat_limit_total}
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              Package Footprint
            </span>
            <div className="d-surface registry-surface-stack">
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Public packages: {summary.totals.public_packages}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Private packages: {summary.totals.private_packages}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Org packages: {summary.totals.org_packages}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Pending approvals: {summary.totals.pending_approvals}
              </div>
            </div>
          </section>

          <section className="d-section" data-density="compact">
            <span className="d-label registry-anchor-label">
              30-Day Usage
            </span>
            <div className="d-surface registry-surface-stack">
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                API requests: {summary.totals.api_requests_30d}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Personal publishes: {summary.totals.content_publishes_30d}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Private package publishes: {summary.totals.private_package_publishes_30d}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Org package publishes: {summary.totals.org_package_publishes_30d}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Approval actions: {summary.totals.approval_actions_30d}
              </div>
              <div className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                Audit events: {summary.totals.audit_events_30d}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
