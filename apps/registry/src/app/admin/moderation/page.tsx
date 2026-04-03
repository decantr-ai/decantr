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
            className="d-interactive rounded-full text-sm py-1.5 px-4"
            data-variant={isActive ? 'primary' : 'ghost'}
          >
            {tab.label}
          </a>
        );
      })}
    </div>
  );
}

function EmptyState({ status }: { status: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        width="48"
        height="48"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-d-muted mb-4"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <p className="text-d-muted text-sm">
        No {status} submissions in the queue.
      </p>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    pattern: 'var(--d-cyan)',
    theme: 'var(--d-amber)',
    blueprint: 'var(--d-coral)',
    shell: 'var(--d-green)',
    archetype: 'var(--d-purple)',
  };
  return (
    <span
      className="d-annotation text-xs"
      data-status="info"
      style={{ borderColor: colors[type] ?? 'var(--d-border)' }}
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
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function statusBorderColor(status: ModerationQueueItem['status']): string {
  switch (status) {
    case 'pending':
      return 'var(--d-amber)';
    case 'approved':
      return 'var(--d-green)';
    case 'rejected':
      return 'var(--d-crimson)';
    default:
      return 'var(--d-border)';
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
  const offset = typeof params.offset === 'string' ? parseInt(params.offset, 10) || 0 : 0;

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.email || !isAdmin(session.user.email)) {
    redirect('/dashboard');
  }

  const token = session.access_token;
  const adminKey = process.env.DECANTR_ADMIN_KEY ?? '';

  let queue = { total: 0, limit: LIMIT, offset, items: [] as ModerationQueueItem[] };
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

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1
          className="d-label text-lg"
          style={{ borderLeft: '2px solid var(--d-accent)', paddingLeft: '0.5rem' }}
        >
          Moderation Queue
        </h1>
        <span className="text-sm text-d-muted tabular-nums">
          {queue.total} total
        </span>
      </div>

      {/* Filter tabs */}
      <div className="mb-6">
        <StatusTabs current={status} />
      </div>

      {/* Error */}
      {error && (
        <div className="d-surface rounded-lg p-4 mb-6 border border-d-error/30">
          <p className="text-sm text-d-error">{error}</p>
        </div>
      )}

      {/* Queue items */}
      {queue.items.length === 0 && !error ? (
        <EmptyState status={status} />
      ) : (
        <div className="flex flex-col gap-3">
          {queue.items.map((item) => (
            <div
              key={item.id}
              className="lum-card-outlined rounded-lg overflow-hidden"
              style={{ borderLeftColor: statusBorderColor(item.status) }}
            >
              <div className="p-4">
                {/* Header row */}
                <div className="flex items-center gap-2.5 mb-2">
                  <TypeBadge type={item.content.type} />
                  <a
                    href={`/admin/moderation/${item.id}`}
                    className="text-sm font-medium text-d-text hover:text-d-accent transition-colors"
                  >
                    {item.content.namespace}/{item.content.slug}
                  </a>
                  <span className="text-xs text-d-muted ml-auto tabular-nums">
                    {formatDate(item.submitted_at)}
                  </span>
                </div>

                {/* Submitter row */}
                <div className="flex items-center gap-2 mb-3">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-d-muted"
                  >
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="text-xs text-d-muted">
                    {item.submitted_by}
                  </span>
                  {item.content.version && (
                    <span className="d-annotation text-xs ml-1" data-status="info">
                      v{item.content.version}
                    </span>
                  )}
                </div>

                {/* Description preview */}
                {typeof item.content.data?.description === 'string' && (
                  <p className="text-sm text-d-muted line-clamp-2 mb-3">
                    {item.content.data.description}
                  </p>
                )}

                {/* Rejection reason (if rejected) */}
                {item.status === 'rejected' && item.rejection_reason && (
                  <div className="text-xs text-d-error bg-d-error/10 rounded px-3 py-2 mb-3">
                    <span className="font-medium">Rejected:</span>{' '}
                    {item.rejection_reason}
                  </div>
                )}

                {/* Reviewed info */}
                {item.reviewed_at && (
                  <div className="text-xs text-d-muted mb-3">
                    Reviewed by {item.reviewed_by} on {formatDate(item.reviewed_at)}
                  </div>
                )}

                {/* Actions */}
                {item.status === 'pending' && (
                  <ModerationCard item={item} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <Pagination total={queue.total} limit={LIMIT} offset={offset} />
    </div>
  );
}
