import { useState, useEffect } from 'react';
import { type ContentItem, getTypeColor } from '../data/mock';

interface ContentCardGridProps {
  items: ContentItem[];
  onItemClick: (item: ContentItem) => void;
  editable?: boolean;
}

function formatDownloads(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ContentCardGrid({ items, onItemClick, editable }: ContentCardGridProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger stagger animation on mount
    const id = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: 'var(--d-gap-6)',
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id}
          className="lum-card-outlined"
          style={{
            borderLeftColor: getTypeColor(item.type),
            padding: 'var(--d-surface-p)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--d-gap-3)',
            cursor: 'pointer',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: `opacity 0.4s ease ${index * 50}ms, transform 0.4s ease ${index * 50}ms, border-color 0.2s ease, box-shadow 0.2s ease`,
          }}
          onClick={() => onItemClick(item)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onItemClick(item);
            }
          }}
        >
          {/* Header: type badge + namespace */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--d-gap-2)' }}>
            <span
              className="d-annotation"
              style={{
                background: `color-mix(in srgb, ${getTypeColor(item.type)} 15%, transparent)`,
                color: getTypeColor(item.type),
              }}
            >
              {item.type}
            </span>
            <span
              className="d-annotation"
              style={{ fontSize: '0.6875rem' }}
            >
              {item.namespace}
            </span>
            {editable && (
              <span
                className="d-annotation"
                data-status="info"
                style={{ marginLeft: 'auto', fontSize: '0.625rem' }}
              >
                editable
              </span>
            )}
          </div>

          {/* Body: title + description */}
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '1rem',
                lineHeight: 1.3,
                marginBottom: 'var(--d-gap-2)',
                color: 'var(--d-text)',
              }}
            >
              {item.name}
            </div>
            <div
              style={{
                color: 'var(--d-text-muted)',
                fontSize: '0.8125rem',
                lineHeight: 1.5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {item.description}
            </div>
          </div>

          {/* Footer: version, downloads, date */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--d-gap-4)',
              fontSize: '0.75rem',
              color: 'var(--d-text-muted)',
              borderTop: '1px solid var(--d-border)',
              paddingTop: 'var(--d-gap-3)',
              marginTop: 'auto',
            }}
          >
            <span style={{ fontFamily: 'ui-monospace, monospace', letterSpacing: '-0.02em' }}>
              v{item.version}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.6875rem' }}>↓</span>
              {formatDownloads(item.downloads)}
            </span>
            <span style={{ marginLeft: 'auto' }}>
              {formatDate(item.updatedAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
