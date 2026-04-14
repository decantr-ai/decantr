import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { api, type DashboardContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';

interface PrivateRegistryPageProps {
  searchParams: Promise<{
    org?: string;
    q?: string;
    type?: string;
    visibility?: string;
    status?: string;
  }>;
}

export default async function PrivateRegistryPage({ searchParams }: PrivateRegistryPageProps) {
  const params = await searchParams;
  const selectedOrgParam = typeof params.org === 'string' ? params.org : '';
  const query = typeof params.q === 'string' ? params.q : '';
  const type = typeof params.type === 'string' ? params.type : '';
  const visibility = typeof params.visibility === 'string' ? params.visibility : '';
  const status = typeof params.status === 'string' ? params.status : '';

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  const me = token ? await api.getMe(token).catch(() => null) : null;
  const enterpriseOrgs = (me?.organizations ?? []).filter((org) => org.tier === 'enterprise');
  const activeOrg = enterpriseOrgs.find((org) => org.slug === selectedOrgParam) ?? enterpriseOrgs[0] ?? null;

  if (!me?.entitlements.private_registry_portal || !activeOrg) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-lg font-semibold">Private Registry</h3>
          <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
            Private registry workspaces are available on Enterprise for organizations that need a dedicated internal catalog.
          </p>
        </div>

        <section className="d-section" data-density="compact">
          <div className="d-surface flex flex-col gap-3">
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              Upgrade to Enterprise to browse an internal org registry with dedicated discovery and governance controls.
            </p>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/billing" className="d-interactive" data-variant="primary">
                Review plans
              </Link>
              <Link href="/dashboard/team" className="d-interactive" data-variant="ghost">
                Open team workspace
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  let items: DashboardContentItem[] = [];
  try {
    const result = await api.getOrgContent(token, activeOrg.slug, {
      q: query || undefined,
      type: type || undefined,
      visibility: visibility || undefined,
      status: status || undefined,
      limit: 100,
      offset: 0,
    });
    items = Array.isArray(result) ? result : result?.items ?? [];
  } catch {
    items = [];
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-semibold">Private Registry</h3>
        <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
          Browse the internal package catalog for your enterprise organization, including private packages and governed public releases.
        </p>
      </div>

      <section className="d-section" data-density="compact">
        <form
          method="get"
          action="/dashboard/private-registry"
          className="d-surface"
          style={{ display: 'grid', gap: '0.75rem' }}
        >
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="org">
                Organization
              </label>
              <select id="org" name="org" className="d-control" defaultValue={activeOrg.slug}>
                {enterpriseOrgs.map((org) => (
                  <option key={org.id} value={org.slug}>
                    {org.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="q">
                Search
              </label>
              <input
                id="q"
                name="q"
                className="d-control"
                defaultValue={query}
                placeholder="Search slug, namespace, name, or description"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="type">
                Type
              </label>
              <select id="type" name="type" className="d-control" defaultValue={type}>
                <option value="">All types</option>
                <option value="pattern">Patterns</option>
                <option value="theme">Themes</option>
                <option value="blueprint">Blueprints</option>
                <option value="archetype">Archetypes</option>
                <option value="shell">Shells</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="visibility">
                Visibility
              </label>
              <select id="visibility" name="visibility" className="d-control" defaultValue={visibility}>
                <option value="">All visibility</option>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold" htmlFor="status">
                Status
              </label>
              <select id="status" name="status" className="d-control" defaultValue={status}>
                <option value="">All status</option>
                <option value="published">Published</option>
                <option value="pending">Pending approval</option>
                <option value="rejected">Rejected</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button type="submit" className="d-interactive" data-variant="primary">
              Filter registry
            </button>
            <Link href="/dashboard/content" className="d-interactive" data-variant="ghost">
              Manage content
            </Link>
          </div>
        </form>
      </section>

      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
          {activeOrg.name} Registry ({items.length})
        </span>

        {items.length > 0 ? (
          <ContentCardGrid items={items} editable />
        ) : (
          <div className="d-surface">
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              No packages matched the current internal registry filters.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
