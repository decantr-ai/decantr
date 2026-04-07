import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { api } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
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
    items = [];
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Content</h3>
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

      {/* Content grid */}
      <section className="d-section" data-density="compact">
        <span
          className="d-label block mb-4"
          style={{
            paddingLeft: '0.75rem',
            borderLeft: '2px solid var(--d-accent)',
          }}
        >
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
    </div>
  );
}
