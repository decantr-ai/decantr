import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { api } from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';

export const metadata: Metadata = {
  title: 'Organizations',
};

export default async function AdminOrganizationsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tier?: string }>;
}) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const tier = params.tier === 'team' || params.tier === 'enterprise' ? params.tier : '';

  const { token, adminKey } = await requireAdminRequestContext();

  let organizations = null;
  let error: string | null = null;
  try {
    organizations = await api.getAdminOrganizations(token, adminKey, {
      q: query || undefined,
      tier: tier || undefined,
      limit: 50,
      offset: 0,
    });
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load organizations';
  }

  return (
    <div className="registry-page-stack">
      <div className="registry-page-intro">
        <h3 className="text-lg font-semibold">Organizations</h3>
        <p className="registry-muted-copy">
          Inspect seat footprint, package mix, approval posture, and recent usage across Team and Enterprise customers.
        </p>
      </div>

      <section className="d-section" data-density="compact">
        <form method="get" action="/admin/organizations" className="d-surface registry-surface-stack">
          <div className="registry-admin-filter-grid">
            <input
              className="d-control"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search organization name or slug"
            />
            <select className="d-control" name="tier" defaultValue={tier}>
              <option value="">All tiers</option>
              <option value="team">Team</option>
              <option value="enterprise">Enterprise</option>
            </select>
            <button type="submit" className="d-interactive" data-variant="primary">
              Filter
            </button>
          </div>
        </form>
      </section>

      {error ? (
        <div className="d-annotation registry-inline-error" data-status="error">
          {error}
        </div>
      ) : null}

      {organizations ? (
        <section className="d-section" data-density="compact">
          <span className="d-label registry-anchor-label">
            Organization Footprint ({organizations.total})
          </span>

          <div className="registry-admin-card-grid">
            {organizations.items.map((org) => (
              <div key={org.id} className="d-surface registry-admin-card">
                <div className="registry-admin-card-head">
                  <div>
                    <div className="registry-admin-card-title">{org.name}</div>
                    <div className="registry-admin-card-subtitle">{org.slug}</div>
                  </div>
                  <span className="d-annotation" data-status={org.tier === 'enterprise' ? 'warning' : 'info'}>
                    {org.tier}
                  </span>
                </div>

                <div className="registry-admin-card-list">
                  <div>Seats: {org.member_count} / {org.seat_limit}</div>
                  <div>Packages: {org.package_count} total · {org.private_packages} private · {org.public_packages} public</div>
                  <div>Pending approvals: {org.pending_approvals}</div>
                  <div>API requests (30d): {org.api_requests_30d}</div>
                  <div>Approval policy: {org.require_public_content_approval ? 'Required' : 'Open publish'}</div>
                </div>

                <div className="registry-inline-actions">
                  <Link href={`/admin/organizations/${org.slug}`} className="d-interactive" data-variant="primary">
                    Open details
                  </Link>
                  <Link href="/admin/reports" className="d-interactive" data-variant="ghost">
                    View reports
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
