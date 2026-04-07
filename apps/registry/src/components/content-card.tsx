import Link from 'next/link';
import type { ContentItem } from '@/lib/api';

const TYPE_COLORS: Record<string, string> = {
  pattern: 'var(--d-coral)',
  theme: 'var(--d-amber)',
  blueprint: 'var(--d-cyan)',
  shell: 'var(--d-green)',
  archetype: 'var(--d-purple)',
};

function formatNumber(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  return n.toString();
}

interface Props {
  item: ContentItem;
  editable?: boolean;
  onDelete?: (id: string) => void;
}

export function ContentCard({ item, editable, onDelete }: Props) {
  const singularType = item.type.endsWith('s') ? item.type.slice(0, -1) : item.type;
  const typeColor = TYPE_COLORS[singularType] || 'var(--d-primary)';

  return (
    <div
      className="lum-card-outlined"
      data-type={singularType}
    >
      {/* Header badges */}
      <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
        <span
          className="d-annotation"
          style={{
            background: `color-mix(in srgb, ${typeColor} 15%, transparent)`,
            color: typeColor,
          }}
        >
          {singularType}
        </span>
        <span className="d-annotation">{item.namespace}</span>
      </div>

      {/* Title */}
      <Link
        href={`/${singularType}/${item.namespace}/${item.slug}`}
        className="font-semibold"
        style={{
          color: 'var(--d-text)',
          textDecoration: 'none',
          fontSize: '1rem',
          display: 'block',
          marginBottom: '0.375rem',
        }}
      >
        {item.name || item.slug}
      </Link>

      {/* Description */}
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
        {item.description || 'No description available.'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between" style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
        <div className="flex items-center gap-3">
          <span style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>v{item.version}</span>
          {item.owner_name && <span>{item.owner_name}</span>}
          {item.published_at && (
            <span className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              {new Date(item.published_at).toLocaleDateString()}
            </span>
          )}
        </div>

        {editable && onDelete && (
          <button
            className="d-interactive"
            data-variant="ghost"
            onClick={() => onDelete(item.id)}
            style={{ padding: '0.25rem', color: 'var(--d-error)' }}
            aria-label="Delete"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

export { TYPE_COLORS, formatNumber };
