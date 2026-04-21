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

function EmptyContentState({
  copy,
  actionHref,
  actionLabel,
}: {
  copy: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="d-surface registry-empty-state" data-density="compact">
      <span className="registry-empty-state-icon">
        <PackageIcon size={48} />
      </span>
      <p className="registry-empty-state-copy">{copy}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="d-interactive no-underline" data-variant="primary">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
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
    privateRegistryEnabled = Boolean(
      me?.entitlements?.private_registry_portal && activeOrg?.tier === 'enterprise',
    );

    if (activeOrg?.slug) {
      const orgResult = await api.getOrgContent(token, activeOrg.slug).catch(() => null);
      orgItems = Array.isArray(orgResult) ? orgResult : orgResult?.items ?? [];
      orgName = activeOrg.name;
    }

    const privateResult = await api
      .getPrivateContent(token, {
        q: query || undefined,
        scope:
          scope === 'personal' || scope === 'organization'
            ? (scope as 'personal' | 'organization')
            : 'all',
        limit: 50,
        offset: 0,
      })
      .catch(() => null);
    privateItems = Array.isArray(privateResult) ? privateResult : privateResult?.items ?? [];
  } catch {
    items = [];
    orgItems = [];
    privateItems = [];
  }

  return (
    <div className="registry-page-stack">
      <div className="registry-dashboard-head">
        <div className="registry-dashboard-copy">
          <h3 className="registry-dashboard-title">Content</h3>
          <p className="registry-dashboard-description">
            Publish new registry items, inspect your private package surface, and keep personal and organization content in one coherent workspace.
          </p>
        </div>
        <div className="registry-dashboard-head-actions">
          {privateRegistryEnabled ? (
            <Link
              href="/dashboard/private-registry"
              className="d-interactive no-underline"
              data-variant="ghost"
            >
              Open Private Registry
            </Link>
          ) : null}
          <Link
            href="/dashboard/content/new"
            className="d-interactive no-underline"
            data-variant="primary"
          >
            <PlusIcon size={16} />
            New Content
          </Link>
        </div>
      </div>

      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">Private Discovery</span>
        <div className="registry-region-stack" data-density="compact">
          <form method="get" action="/dashboard/content" className="d-surface registry-dashboard-panel">
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

            <div className="registry-filter-bar">
              <label className="text-sm font-semibold" htmlFor="scope">
                Scope
              </label>
              <select
                id="scope"
                name="scope"
                className="d-control registry-inline-select"
                defaultValue={scope}
              >
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
            <EmptyContentState
              copy={
                query
                  ? 'No private packages matched this search.'
                  : 'No accessible private packages found yet.'
              }
            />
          )}
        </div>
      </section>

      <section className="d-section" data-density="compact">
        <span className="d-label registry-anchor-label">Published ({items.length})</span>
        {items.length > 0 ? (
          <ContentCardGrid items={items} editable />
        ) : (
          <EmptyContentState
            copy="No content published yet."
            actionHref="/dashboard/content/new"
            actionLabel="Publish Your First Item"
          />
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
            <EmptyContentState copy="No organization packages published yet." />
          )}
        </section>
      ) : null}
    </div>
  );
}
