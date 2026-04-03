import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Download, Calendar, Edit2, Trash2 } from 'lucide-react';
import type { ContentItem } from '@/data/mock';
import { TYPE_COLORS, formatNumber } from '@/data/mock';

interface Props {
  items: ContentItem[];
  editable?: boolean;
}

export function ContentCardGrid({ items, editable }: Props) {
  return (
    <>
      <div className="content-card-grid">
        {items.map((item) => (
          <div
            key={item.id}
            className="lum-card-outlined"
            data-type={item.type}
          >
            {/* Header badges */}
            <div className={css('_flex _aic _gap2')} style={{ marginBottom: '0.75rem' }}>
              <span
                className="d-annotation"
                style={{
                  background: `color-mix(in srgb, ${TYPE_COLORS[item.type]} 15%, transparent)`,
                  color: TYPE_COLORS[item.type],
                }}
              >
                {item.type}
              </span>
              <span className="d-annotation">{item.namespace}</span>
            </div>

            {/* Title */}
            <Link
              to={`/${item.type}/${item.namespace}/${item.slug}`}
              className={css('_fontsemi')}
              style={{
                color: 'var(--d-text)',
                textDecoration: 'none',
                fontSize: '1rem',
                display: 'block',
                marginBottom: '0.375rem',
              }}
            >
              {item.name}
            </Link>

            {/* Description */}
            <p
              className={css('_textsm')}
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

            {/* Footer */}
            <div className={css('_flex _aic _jcsb')} style={{ fontSize: '0.75rem', color: 'var(--d-text-muted)' }}>
              <div className={css('_flex _aic _gap3')}>
                <span style={{ fontFamily: 'var(--d-font-mono, monospace)' }}>v{item.version}</span>
                <span className={css('_flex _aic _gap1')}>
                  <Download size={12} />
                  {formatNumber(item.downloads)}
                </span>
                <span className={css('_flex _aic _gap1')}>
                  <Calendar size={12} />
                  {item.updatedAt}
                </span>
              </div>

              {editable && (
                <div className={css('_flex _aic _gap1')}>
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem' }} aria-label="Edit">
                    <Edit2 size={14} />
                  </button>
                  <button className="d-interactive" data-variant="ghost" style={{ padding: '0.25rem', color: 'var(--d-error)' }} aria-label="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .content-card-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1rem;
        }
        @media (min-width: 640px) {
          .content-card-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (min-width: 1024px) {
          .content-card-grid { grid-template-columns: repeat(3, 1fr); }
        }
      `}</style>
    </>
  );
}
