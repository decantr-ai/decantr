import { api } from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';
import { Pagination } from '@/components/pagination';
import { ModerationCard } from './moderation-card';
import type { Metadata } from 'next';
import type { ModerationQueueItem } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Moderation Queue',
};

const LIMIT = 20;

/* ── Icons ── */

function ShieldIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
function ClockIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
function UserIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="var(--d-amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
function SearchIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// Type colors match showcase mock.ts TYPE_COLORS (singular names)
const TYPE_COLORS: Record<string, string> = {
  pattern: 'var(--d-coral)',
  theme: 'var(--d-amber)',
  blueprint: 'var(--d-cyan)',
  shell: 'var(--d-green)',
  archetype: 'var(--d-purple)',
};

function singularType(type: string): string {
  return type.endsWith('s') ? type.slice(0, -1) : type;
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

const STATUS_TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

function StatusTabs({ current, query }: { current: string; query: string }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {STATUS_TABS.map((tab) => {
        const isActive = tab.value === current;
        const href = `/admin/moderation?status=${tab.value}${query ? `&q=${encodeURIComponent(query)}` : ''}`;
        return (
          <a
            key={tab.value}
            href={href}
            className="d-interactive"
            data-variant={isActive ? 'primary' : 'ghost'}
            style={{
              borderRadius: 'var(--d-radius-full)',
              fontSize: '0.8125rem',
              padding: '0.25rem 0.75rem',
              textDecoration: 'none',
            }}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}

export default async function ModerationQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = (typeof params.status === 'string' ? params.status : 'pending') as
    | 'pending' | 'approved' | 'rejected';
  const offset = typeof params.offset === 'string' ? parseInt(params.offset, 10) || 0 : 0;
  const query = typeof params.q === 'string' ? params.q : '';

  const { token, adminKey } = await requireAdminRequestContext();

  let queue = { total: 0, limit: LIMIT, offset, items: [] as ModerationQueueItem[] };
  let error: string | null = null;

  try {
    queue = await api.getModerationQueue(token, adminKey, { status, limit: LIMIT, offset });
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load moderation queue';
  }

  const q = query.toLowerCase();
  const filtered = q
    ? queue.items.filter((item) => {
        const name = typeof item.content.data?.name === 'string' ? item.content.data.name.toLowerCase() : '';
        return (
          item.content.slug.toLowerCase().includes(q) ||
          item.content.type.toLowerCase().includes(q) ||
          item.submitted_by.toLowerCase().includes(q) ||
          name.includes(q)
        );
      })
    : queue.items;

  const pendingCount = status === 'pending' ? queue.total : 0;

  return (
    <div className="d-section" data-density="compact">
      <div className="registry-page-stack">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span style={{ color: 'var(--d-accent)' }}>
              <ShieldIcon size={20} />
            </span>
            <h1
              className="font-bold"
              style={{ margin: 0, fontSize: '1.25rem', color: 'var(--d-text)' }}
            >
              Moderation Queue
            </h1>
          </div>
          {pendingCount > 0 && (
            <span className="d-annotation" data-status="warning">
              <ClockIcon size={12} />
              {pendingCount} pending
            </span>
          )}
        </div>

        {/* Search + filters */}
        <div className="flex flex-col gap-4">
          <form method="get" action="/admin/moderation" className="relative">
            <input type="hidden" name="status" value={status} />
            <span
              className="pointer-events-none"
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--d-text-muted)',
              }}
            >
              <SearchIcon size={16} />
            </span>
            <input
              className="d-control w-full"
              name="q"
              type="search"
              defaultValue={query}
              placeholder="Search patterns, themes, blueprints..."
              style={{ paddingLeft: '2.25rem' }}
            />
          </form>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <StatusTabs current={status} query={query} />
            <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
              {filtered.length} results
            </span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="d-annotation" data-status="error" style={{ display: 'block' }}>
            {error}
          </div>
        )}

        {/* Queue items */}
        <div className="flex flex-col gap-3">
          {filtered.length === 0 && !error ? (
            <div
              className="d-surface"
              style={{
                textAlign: 'center',
                padding: '2rem',
                color: 'var(--d-text-muted)',
              }}
            >
              No items in the moderation queue.
            </div>
          ) : (
            filtered.map((item) => {
              const singular = singularType(item.content.type);
              const typeColor = TYPE_COLORS[singular] ?? 'var(--d-primary)';
              const name =
                typeof item.content.data?.name === 'string'
                  ? item.content.data.name
                  : `${item.content.namespace}/${item.content.slug}`;
              const description =
                typeof item.content.data?.description === 'string'
                  ? item.content.data.description
                  : '';
              const statusVariant =
                item.status === 'pending'
                  ? 'warning'
                  : item.status === 'approved'
                  ? 'success'
                  : 'error';

              return (
                <div
                  key={item.id}
                  className="d-surface lum-card-outlined"
                  data-type={singular}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="d-annotation"
                          style={{
                            background: typeColor,
                            color: '#141414',
                            fontWeight: 600,
                          }}
                        >
                          {singular}
                        </span>
                        <span
                          className="font-bold text-lg"
                          style={{ color: 'var(--d-text)' }}
                        >
                          {name}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                          v{item.content.version}
                        </span>
                      </div>
                      <span className="d-annotation" data-status={statusVariant}>
                        <ClockIcon size={12} />
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </div>

                    {/* Description */}
                    {description && (
                      <p
                        className="text-sm"
                        style={{ color: 'var(--d-text-muted)', margin: 0 }}
                      >
                        {description}
                      </p>
                    )}

                    {/* Submitter row + actions */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex items-center gap-1">
                          <span style={{ color: 'var(--d-text-muted)' }}>
                            <UserIcon size={14} />
                          </span>
                          <span className="text-sm font-semibold">
                            {item.submitted_by}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <StarIcon size={14} />
                          <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                            — rep
                          </span>
                        </div>
                        <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>
                          {formatDate(item.submitted_at)}
                        </span>
                      </div>

                      {item.status === 'pending' && (
                        <ModerationCard item={item} />
                      )}
                    </div>

                    {item.status === 'rejected' && item.rejection_reason && (
                      <div
                        className="text-xs"
                        style={{
                          color: 'var(--d-error)',
                          background: 'color-mix(in srgb, var(--d-error) 10%, transparent)',
                          borderRadius: 'var(--d-radius-sm)',
                          padding: '0.5rem 0.75rem',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>Rejected:</span> {item.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <Pagination total={queue.total} limit={LIMIT} offset={offset} />
      </div>
    </div>
  );
}
