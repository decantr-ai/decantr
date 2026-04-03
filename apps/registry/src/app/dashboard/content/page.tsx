import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import Link from 'next/link';

const TYPE_BORDER_COLORS: Record<string, string> = {
  patterns: 'border-l-d-coral',
  themes: 'border-l-d-amber',
  blueprints: 'border-l-d-cyan',
  shells: 'border-l-d-green',
  archetypes: 'border-l-d-purple',
};

const TYPE_BADGE_COLORS: Record<string, string> = {
  patterns: 'bg-d-coral/15 text-d-coral',
  themes: 'bg-d-amber/15 text-d-amber',
  blueprints: 'bg-d-cyan/15 text-d-cyan',
  shells: 'bg-d-green/15 text-d-green',
  archetypes: 'bg-d-purple/15 text-d-purple',
};

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function ContentPage() {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token ?? '';

  let items: ContentItem[] = [];
  try {
    const result = await api.getMyContent(token);
    items = Array.isArray(result) ? result : result?.items ?? [];
  } catch {
    // Fallback to empty
  }

  return (
    <div className="d-section max-w-5xl" data-density="compact">
      <div className="flex items-center justify-between mb-6">
        <h1 className="d-label border-l-2 border-d-accent pl-2 text-lg">
          My Content
        </h1>
        <Link
          href="/dashboard/content/new"
          className="d-interactive inline-flex items-center gap-2 py-1.5 px-4 text-sm rounded-md no-underline"
          data-variant="primary"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Content
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-d-muted mb-3"
          >
            <path d="m16.5 9.4-9-5.19" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.29 7 12 12 20.71 7" />
            <line x1="12" y1="22" x2="12" y2="12" />
          </svg>
          <p className="text-sm text-d-muted mb-4">
            No content yet. Publish your first item.
          </p>
          <Link
            href="/dashboard/content/new"
            className="d-interactive inline-flex items-center gap-2 py-1.5 px-4 text-sm rounded-md no-underline"
            data-variant="primary"
          >
            Publish Content
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((item) => {
            const borderColor =
              TYPE_BORDER_COLORS[item.type] ?? 'border-l-d-border';
            const badgeColor =
              TYPE_BADGE_COLORS[item.type] ?? 'bg-d-surface text-d-muted';

            return (
              <div
                key={item.id}
                className={`lum-card-outlined border-l-[3px] ${borderColor} flex flex-col`}
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className={`d-annotation text-xs ${badgeColor}`}>
                    {item.type.replace(/s$/, '')}
                  </span>
                  <span className="d-annotation text-xs">
                    {item.namespace}
                  </span>
                  {item.status && item.status !== 'published' && (
                    <span
                      className="d-annotation text-xs"
                      data-status="warning"
                    >
                      {item.status}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-semibold text-d-text mb-1 leading-snug">
                  {item.name || item.slug}
                </h3>

                {item.description && (
                  <p className="text-sm text-d-muted line-clamp-2 mb-3">
                    {item.description}
                  </p>
                )}

                <div className="flex items-center gap-3 text-xs text-d-muted font-mono mt-auto pt-3 border-t border-d-border/50">
                  <span>v{item.version}</span>
                  {item.published_at && (
                    <>
                      <span className="opacity-40">|</span>
                      <span>{formatDate(item.published_at)}</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
