import { useState } from 'react';
import { type ContentItem, getTypeColor } from '../data/mock';

interface ContentDetailHeroProps {
  item: ContentItem;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ContentDetailHero({ item }: ContentDetailHeroProps) {
  const [copyFeedback, setCopyFeedback] = useState(false);
  const typeColor = getTypeColor(item.type);

  function handleCopyJson() {
    navigator.clipboard.writeText(JSON.stringify(item, null, 2)).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  }

  return (
    <div
      className="d-section"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--d-gap-6)',
        maxWidth: '48rem',
      }}
    >
      {/* Breadcrumb */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--d-gap-2)',
          fontSize: '0.8125rem',
          color: 'var(--d-text-muted)',
        }}
        aria-label="Breadcrumb"
      >
        <span style={{ cursor: 'pointer', transition: 'color 0.15s' }}>
          Registry
        </span>
        <span style={{ opacity: 0.4 }}>/</span>
        <span style={{ cursor: 'pointer', transition: 'color 0.15s', textTransform: 'capitalize' }}>
          {item.type}s
        </span>
        <span style={{ opacity: 0.4 }}>/</span>
        <span style={{ color: 'var(--d-text)' }}>{item.slug}</span>
      </nav>

      {/* Badge row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--d-gap-2)' }}>
        <span
          className="d-annotation"
          style={{
            background: `color-mix(in srgb, ${typeColor} 15%, transparent)`,
            color: typeColor,
            padding: '0.25rem 0.75rem',
            fontSize: '0.8125rem',
          }}
        >
          {item.type}
        </span>
        <span className="d-annotation" style={{ fontSize: '0.75rem' }}>
          {item.namespace}
        </span>
      </div>

      {/* Title */}
      <h2
        style={{
          fontSize: '1.75rem',
          fontWeight: 700,
          lineHeight: 1.2,
          letterSpacing: '-0.02em',
        }}
      >
        {item.name}
      </h2>

      {/* Description */}
      <p
        style={{
          fontSize: '1rem',
          lineHeight: 1.6,
          color: 'var(--d-text-muted)',
          maxWidth: '36rem',
        }}
      >
        {item.description}
      </p>

      {/* Meta row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--d-gap-3)',
          fontSize: '0.8125rem',
          color: 'var(--d-text-muted)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontFamily: 'ui-monospace, monospace', color: 'var(--d-text)' }}>
          v{item.version}
        </span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{item.author}</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{formatDate(item.updatedAt)}</span>
        <span style={{ opacity: 0.3 }}>·</span>
        <span>{item.downloads.toLocaleString()} downloads</span>
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--d-gap-3)', flexWrap: 'wrap' }}>
        <button
          className="d-interactive"
          data-variant="primary"
          style={{
            borderRadius: 'var(--d-radius-full)',
            padding: '0.5rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.875rem',
          }}
        >
          Install
        </button>
        <button
          className="d-interactive"
          data-variant="ghost"
          style={{
            borderRadius: 'var(--d-radius-full)',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
          }}
        >
          Preview
        </button>
        <button
          className="d-interactive"
          data-variant="ghost"
          onClick={handleCopyJson}
          style={{
            borderRadius: 'var(--d-radius-full)',
            padding: '0.5rem 1.25rem',
            fontSize: '0.875rem',
          }}
        >
          {copyFeedback ? '✓ Copied' : 'Copy JSON'}
        </button>
      </div>
    </div>
  );
}
