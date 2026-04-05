import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import { isAdmin } from '@/lib/admin';
import { redirect } from 'next/navigation';
import { Pagination } from '@/components/pagination';
import { ModerationCard } from './moderation-card';
import type { Metadata } from 'next';
import type { ModerationQueueItem } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Moderation Queue',
};

const LIMIT = 20;

function ShieldIcon({ size = 20 }: { size?: number }) {
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

function ClockIcon({ size = 12 }: { size?: number }) {
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function UserIcon({ size = 14 }: { size?: number }) {
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
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function StarIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="var(--d-amber)"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const statusTabs = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
] as const;

function StatusTabs({ current }: { current: string }) {
  return (
    <div className="flex items-center gap-1">
      {statusTabs.map((tab) => {
        const isActive = tab.value === current;
        return (
          <a
            key={tab.value}
            href={`/admin/moderation?status=${tab.value}`}
            className="d-interactive"
            data-variant={isActive ? 'primary' : 'ghost'}
            style={{
              fontSize: '0.875rem',
              padding: '0.375rem 1rem',
              borderRadius: 'var(--d-radius-full)',
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

function statusBorderColor(status: ModerationQueueItem['status']): string {
  switch (status) {
    case 'pending':
      return 'var(--d-amber)';
    case 'approved':
      return 'var(--d-green)';
    case 'rejected':
      return 'var(--d-coral)';
    default:
      return 'var(--d-border)';
  }
}

const TYPE_COLORS: Record<string, string> = {
  pattern: 'var(--d-cyan)',
  theme: 'var(--d-amber)',
  blueprint: 'var(--d-coral)',
  shell: 'var(--d-green)',
  archetype: 'var(--d-purple)',
};

function TypeBadge({ type }: { type: string }) {
  return (
    <span
      className="d-annotation"
      style={{
        background: TYPE_COLORS[type] ?? 'var(--d-border)',
        color: '#141414',
        fontWeight: 600,
      }}
    >
      {type}
    </span>
  );
}

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export default async function ModerationQueuePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = (typeof params.status === 'string' ? params.status : 'pending') as
    | 'pending'
    | 'approved'
    | 'rejected';
  const offset =
    typeof params.offset === 'string' ? parseInt(params.offset, 10) || 0 : 0;
  const query =
    typeof params.q === 'string' ? params.q.toLowerCase() : '';

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/dashboard');
  }

  const token = session.access_token;
  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';

  let queue = {
    total: 0,
    limit: LIMIT,
    offset,
    items: [] as ModerationQueueItem[],
  };
  let error: string | null = null;

  try {
    queue = await api.getModerationQueue(token, adminKey, {
      status,
      limit: LIMIT,
      offset,
    });
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load moderation queue';
  }

  const filteredItems = query
    ? queue.items.filter((item) => {
        const name =
          typeof item.content.data?.name === 'string'
            ? item.content.data.name.toLowerCase()
            : '';
        return (
          item.content.slug.toLowerCase().includes(query) ||
          item.content.type.toLowerCase().includes(query) ||
          item.submitted_by.toLowerCase().includes(query) ||
          name.includes(query)
        );
      })
    : queue.items;

  const pendingCount = status === 'pending' ? queue.total : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span style={{ color: 'var(--d-accent)' }}>
            <ShieldIcon size={20} />
          </span>
          <h3 className="text-lg font-semibold">Moderation Queue</h3>
        </div>
        <span className="d-annotation" data-status="warning">
          <ClockIcon size={12} />
          {pendingCount} pending
        </span>
      </div>

      {/* Search + filter tabs */}
      <section className="d-section" data-density="compact">
        <form
          method="get"
          action="/admin/moderation"
          className="flex items-center gap-3 mb-4"
        >
          <input
            type="hidden"
            name="status"
            value={status}
          />
          <input
            className="d-control"
            name="q"
            type="search"
            defaultValue={query}
            placeholder="Search by name, type, or submitter…"
            style={{ flex: 1, maxWidth: '28rem' }}
          />
          <button
            type="submit"
            className="d-interactive"
            data-variant="ghost"
            style={{ fontSize: '0.875rem' }}
          >
            Search
          </button>
        </form>

        <StatusTabs current={status} />
      </section>

      {/* Error */}
      {error && (
        <div
          className="d-annotation"
          data-status="error"
          style={{ display: 'block' }}
        >
          {error}
        </div>
      )}

      {/* Queue items */}
      <section className="d-section" data-density="compact">
        {filteredItems.length === 0 && !error ? (
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
          <div className="flex flex-col gap-3">
            {filteredItems.map((item) => {
              const name =
                typeof item.content.data?.name === 'string'
                  ? item.content.data.name
                  : `${item.content.namespace}/${item.content.slug}`;
              const description =
                typeof item.content.data?.description === 'string'
                  ? item.content.data.description
                  : '';
              return (
                <div
                  key={item.id}
                  className="d-surface lum-card-outlined"
                  data-type={item.content.type}
                  style={{
                    borderLeftColor: statusBorderColor(item.status),
                  }}
                >
                  <div className="flex flex-col gap-3">
                    {/* Header row */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <TypeBadge type={item.content.type} />
                        <span
                          className="font-bold text-lg"
                          style={{ color: 'var(--d-text)' }}
                        >
                          {name}
                        </span>
                        <span
                          className="text-sm"
                          style={{ color: 'var(--d-text-muted)' }}
                        >
                          v{item.content.version}
                        </span>
                      </div>
                      <span
                        className="d-annotation"
                        data-status={
                          item.status === 'pending'
                            ? 'warning'
                            : item.status === 'approved'
                            ? 'success'
                            : 'error'
                        }
                      >
                        <ClockIcon size={12} />
                        {item.status.charAt(0).toUpperCase() +
                          item.status.slice(1)}
                      </span>
                    </div>

                    {description && (
                      <p
                        className="text-sm"
                        style={{ color: 'var(--d-text-muted)', margin: 0 }}
                      >
                        {description}
                      </p>
                    )}

                    {/* Submitter info */}
                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <div className="flex items-center gap-3">
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
                          <span
                            className="text-sm"
                            style={{ color: 'var(--d-text-muted)' }}
                          >
                            —
                          </span>
                        </div>
                        <span
                          className="text-sm"
                          style={{ color: 'var(--d-text-muted)' }}
                        >
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
                        <span style={{ fontWeight: 500 }}>Rejected:</span>{' '}
                        {item.rejection_reason}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination total={queue.total} limit={LIMIT} offset={offset} />
      </section>
    </div>
  );
}
