import Link from 'next/link';
import type { ContentItem } from '@/lib/api';
import { getShowcaseMetadata, getShowcaseUrl } from '@/lib/showcase';

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

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatId(id: string): string {
  return id.length > 12 ? id.slice(0, 12) : id;
}

export function ContentCard({ item, editable }: { item: ContentItem; editable?: boolean }) {
  const singular = singularType(item.type);
  const typeColor = TYPE_COLORS[singular] ?? 'var(--d-primary)';
  const href = `/${item.type}/${encodeURIComponent(item.namespace)}/${item.slug}`;
  const showcaseMeta = singular === 'blueprint' ? getShowcaseMetadata(item.slug) : null;
  const hasShortlistedShowcase = Boolean(showcaseMeta?.goldenCandidate);
  const showcaseVerification = showcaseMeta?.verification ?? null;

  return (
    <div className="lum-card-outlined" data-type={singular}>
      {/* Header badges */}
      <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
        <span
          className="d-annotation"
          style={{
            background: `color-mix(in srgb, ${typeColor} 15%, transparent)`,
            color: typeColor,
          }}
        >
          {singular}
        </span>
        <span className="d-annotation">{item.namespace}</span>
        {showcaseMeta && (
          <span className="d-annotation" data-status={hasShortlistedShowcase ? 'success' : undefined}>
            {hasShortlistedShowcase ? 'shortlisted showcase' : 'live showcase'}
          </span>
        )}
        {showcaseVerification?.build.passed && (
          <span className="d-annotation" data-status="success">
            build verified
          </span>
        )}
      </div>

      {/* Title */}
      <Link
        href={href}
        className="font-semibold block no-underline"
        style={{
          color: 'var(--d-text)',
          fontSize: '1rem',
          marginBottom: '0.375rem',
        }}
      >
        {item.name || item.slug}
      </Link>

      {/* Description */}
      {item.description && (
        <p
          className="text-sm"
          style={{
            color: 'var(--d-text-muted)',
            marginBottom: '0.75rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {item.description}
        </p>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between"
        style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}
      >
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>
            v{item.version}
          </span>
          {item.owner_username && (
            <span className="flex items-center gap-1">
              <span className="opacity-40">|</span>
              <span style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>
                {item.owner_username}
              </span>
            </span>
          )}
          {!item.owner_username && item.id && (
            <span className="flex items-center gap-1">
              <span className="opacity-40">|</span>
              <span style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>
                {formatId(item.id)}
              </span>
            </span>
          )}
          {item.published_at && (
            <span className="flex items-center gap-1">
              <span className="opacity-40">|</span>
              <span>{formatDate(item.published_at)}</span>
            </span>
          )}
          {showcaseMeta && (
            <span className="flex items-center gap-1">
              <span className="opacity-40">|</span>
              <Link
                href={getShowcaseUrl(item.slug)}
                className="no-underline transition-colors hover:text-d-primary"
                style={{ color: 'var(--d-text)' }}
              >
                Open showcase
              </Link>
            </span>
          )}
          {showcaseVerification && (
            <span className="flex items-center gap-1">
              <span className="opacity-40">|</span>
              <span className="d-annotation">
                drift {showcaseVerification.drift.signal}
              </span>
            </span>
          )}
        </div>

        {editable && (
          <div className="flex items-center gap-1">
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.25rem' }}
              aria-label="Edit"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            <button
              className="d-interactive"
              data-variant="ghost"
              style={{ padding: '0.25rem', color: 'var(--d-error)' }}
              aria-label="Delete"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
