import { api } from '@/lib/api';
import Link from 'next/link';
import type { Metadata } from 'next';
import { requireAdminRequestContext } from '@/lib/admin-workspace';

export const metadata: Metadata = {
  title: 'Commercial Reports',
};

export default async function AdminReportsPage() {
  const { token, adminKey } = await requireAdminRequestContext();

  let summary = null;
  let error: string | null = null;
  try {
    summary = await api.getCommercialSummary(token, adminKey);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load commercial summary';
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
        <Link href="/admin/organizations" className="d-interactive" data-variant="ghost">
          Open organizations
        </Link>
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
        </>
      ) : null}
    </div>
  );
}
