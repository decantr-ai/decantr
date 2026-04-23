import { api } from '@/lib/api';
import { redirect, notFound } from 'next/navigation';
import { JsonViewer } from '@/components/json-viewer';
import { ModerationDetailActions } from './detail-actions';
import type { Metadata } from 'next';
import type { ModerationQueueItem } from '@/lib/api';
import { requireAdminRequestContext } from '@/lib/admin-workspace';

export const metadata: Metadata = {
  title: 'Moderation Detail',
};

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

function StatusBadge({ status }: { status: ModerationQueueItem['status'] }) {
  const map: Record<string, { label: string; dataStatus: string }> = {
    pending: { label: 'Pending', dataStatus: 'warning' },
    approved: { label: 'Approved', dataStatus: 'success' },
    rejected: { label: 'Rejected', dataStatus: 'error' },
  };
  const info = map[status] ?? { label: status, dataStatus: 'info' };
  return (
    <span className="d-annotation text-xs" data-status={info.dataStatus}>
      {info.label}
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

export default async function ModerationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { token, adminKey } = await requireAdminRequestContext();

  let item: ModerationQueueItem | null = null;
  let error: string | null = null;

  try {
    const queue = await api.getModerationQueue(token, adminKey, { limit: 100, offset: 0 });
    item = queue.items.find((i) => i.id === id) ?? null;
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load item';
  }

  if (!item && !error) {
    notFound();
  }

  if (error) {
    return (
      <div className="max-w-4xl">
        <div className="d-surface rounded-lg p-6 border border-d-error/30">
          <p className="text-sm text-d-error">{error}</p>
          <a
            href="/admin/moderation"
            className="d-interactive mt-4 inline-block text-sm py-1.5 px-3"
            data-variant="ghost"
          >
            Back to Queue
          </a>
        </div>
      </div>
    );
  }

  // TypeScript narrowing
  const detail = item!;

  return (
    <div className="max-w-4xl">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-d-muted mb-6">
        <a
          href="/admin/moderation"
          className="hover:text-d-text transition-colors"
        >
          Admin
        </a>
        <span>/</span>
        <a
          href="/admin/moderation"
          className="hover:text-d-text transition-colors"
        >
          Moderation
        </a>
        <span>/</span>
        <span className="text-d-text">
          {detail.content.namespace}/{detail.content.slug}
        </span>
      </nav>

      {/* Hero section */}
      <div
        className="d-section border-b border-d-border pb-6 mb-6"
        data-density="compact"
        style={{ paddingTop: 0 }}
      >
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <TypeBadge type={detail.content.type} />
          <StatusBadge status={detail.status} />
          <span className="d-annotation text-xs" data-status="info">
            v{detail.content.version}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-xl font-semibold text-d-text mb-1">
          {detail.content.namespace}/{detail.content.slug}
        </h1>

        {/* Description */}
        {typeof detail.content.data?.description === 'string' && (
          <p className="text-sm text-d-muted mb-4">
            {detail.content.data.description}
          </p>
        )}

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-d-muted">
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
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
            <span>{detail.submitted_by}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>{formatDate(detail.submitted_at)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono">{detail.content.type}</span>
            <span>&middot;</span>
            <span className="font-mono">{detail.content.namespace}</span>
          </div>
        </div>
      </div>

      {/* Rejection reason */}
      {detail.status === 'rejected' && detail.rejection_reason && (
        <div className="rounded-lg bg-d-error/10 border border-d-error/30 p-4 mb-6">
          <h3 className="text-sm font-medium text-d-error mb-1">
            Rejection Reason
          </h3>
          <p className="text-sm text-d-text">{detail.rejection_reason}</p>
        </div>
      )}

      {/* Review info */}
      {detail.reviewed_at && (
        <div className="rounded-lg bg-d-surface-raised p-4 mb-6 text-sm text-d-muted">
          Reviewed by{' '}
          <span className="text-d-text font-medium">{detail.reviewed_by}</span>{' '}
          on {formatDate(detail.reviewed_at)}
        </div>
      )}

      {/* JSON Viewer */}
      <div className="mb-6">
        <h2
          className="d-label text-sm mb-3"
          style={{
            borderLeft: '2px solid var(--d-accent)',
            paddingLeft: '0.5rem',
          }}
        >
          Content Data
        </h2>
        <JsonViewer data={detail.content.data} title={`${detail.content.slug}.json`} />
      </div>

      {/* Actions */}
      {detail.status === 'pending' && (
        <div className="border-t border-d-border pt-6">
          <h2
            className="d-label text-sm mb-4"
            style={{
              borderLeft: '2px solid var(--d-accent)',
              paddingLeft: '0.5rem',
            }}
          >
            Actions
          </h2>
          <ModerationDetailActions itemId={detail.id} />
        </div>
      )}
    </div>
  );
}
