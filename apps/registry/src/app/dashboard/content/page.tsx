import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import type { DashboardContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';

function PlusIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

function PackageIcon({ size = 48 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

interface ContentPageProps {
  searchParams: Promise<{ q?: string; scope?: string }>;
}

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const params = await searchParams;
  const query = typeof params.q === 'string' ? params.q : '';
  const scope = typeof params.scope === 'string' ? params.scope : 'all';
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  let items: DashboardContentItem[] = [];
  let orgItems: DashboardContentItem[] = [];
  let privateItems: DashboardContentItem[] = [];
  let orgName: string | null = null;
  let privateRegistryEnabled = false;
  try {
    const [me, result] = await Promise.all([
      api.getMe(token).catch(() => null),
      api.getMyContent(token),
    ]);
    items = Array.isArray(result) ? result : result?.items ?? [];
    const activeOrg = me?.organizations?.[0] ?? null;
    privateRegistryEnabled = Boolean(me?.entitlements?.private_registry_portal && activeOrg?.tier === 'enterprise');
    if (activeOrg?.slug) {
      const orgResult = await api.getOrgContent(token, activeOrg.slug).catch(() => null);
      orgItems = Array.isArray(orgResult) ? orgResult : orgResult?.items ?? [];
      orgName = activeOrg.name;
    }
    const privateResult = await api.getPrivateContent(token, {
      q: query || undefined,
      scope: scope === 'personal' || scope === 'organization' ? (scope as 'personal' | 'organization') : 'all',
      limit: 50,
      offset: 0,
    }).catch(() => null);
    privateItems = Array.isArray(privateResult) ? privateResult : privateResult?.items ?? [];
  } catch {
    items = [];
    orgItems = [];
    privateItems = [];
  }

  return (
    <div className="registry-page-stack">
      {/* Header row */}
      <div className="registry-inline-actions" style={{ justifyContent: 'space-between' }}>
        <h3 className="text-lg font-semibold">Content</h3>
        <div className="registry-inline-actions">
          {privateRegistryEnabled ? (
            <Link href="/dashboard/private-registry" className="d-interactive" data-variant="ghost">
              Open Private Registry
            </Link>
          ) : null}
          <Link
            href="/dashboard/content/new"
            className="d-interactive"
            data-variant="primary"
            style={{
              fontSize: '0.875rem',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <PlusIcon size={16} />
            New Content
          </Link>
        </div>
      </div>

      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">
          Private Discovery
        </span>
        <form
          method="get"
          action="/dashboard/content"
          className="d-surface registry-surface-stack"
          style={{ marginBottom: '1rem' }}
        >
          <div className="registry-form-grid">
            <label className="text-sm font-semibold" htmlFor="q">
              Search private packages
            </label>
            <input
              id="q"
              name="q"
              className="d-control"
              defaultValue={query}
              placeholder="Search by slug, namespace, name, or description"
            />
          </div>
          <div className="registry-inline-actions">
            <label className="text-sm font-semibold" htmlFor="scope">
              Scope
            </label>
            <select id="scope" name="scope" className="d-control" defaultValue={scope} style={{ width: 'auto' }}>
              <option value="all">All accessible private packages</option>
              <option value="personal">Personal private packages</option>
              <option value="organization">Organization private packages</option>
            </select>
            <button type="submit" className="d-interactive" data-variant="primary">
              Search
            </button>
          </div>
        </form>

        {privateItems.length > 0 ? (
          <ContentCardGrid items={privateItems} editable />
        ) : (
          <div className="d-surface">
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              {query
                ? 'No private packages matched this search.'
                : 'No accessible private packages found yet.'}
            </p>
          </div>
        )}
      </section>

      {/* Personal content grid */}
      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">
          Published ({items.length})
        </span>
        {items.length > 0 ? (
          <ContentCardGrid items={items} editable />
        ) : (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.75rem',
              padding: '3rem 0',
            }}
          >
            <span style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
              <PackageIcon size={48} />
            </span>
            <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              No content published yet.
            </p>
            <Link
              href="/dashboard/content/new"
              className="d-interactive"
              data-variant="primary"
              style={{
                fontSize: '0.875rem',
                textDecoration: 'none',
              }}
            >
              Publish Your First Item
            </Link>
          </div>
        )}
      </section>

      {orgName ? (
        <section className="d-section" data-density="compact">
          <span className="d-label registry-anchor-label">
            {orgName} Packages ({orgItems.length})
          </span>
          {orgItems.length > 0 ? (
            <ContentCardGrid items={orgItems} editable />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                padding: '2rem 0',
              }}
            >
              <span style={{ color: 'var(--d-text-muted)', opacity: 0.5 }}>
                <PackageIcon size={48} />
              </span>
              <p className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                No organization packages yet.
              </p>
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
