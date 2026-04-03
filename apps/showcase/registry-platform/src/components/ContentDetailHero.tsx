import { css } from '@decantr/css';
import { Package, Download, Calendar, User } from 'lucide-react';
import type { ContentItem } from '@/data/mock';
import { TYPE_COLORS, formatNumber } from '@/data/mock';

interface Props {
  item: ContentItem;
}

export function ContentDetailHero({ item }: Props) {
  return (
    <div className="d-surface" data-elevation="raised">
      <div className={css('_flex _col _gap4')}>
        {/* Type + namespace */}
        <div className={css('_flex _aic _gap2')}>
          <span
            className="d-annotation"
            style={{ background: TYPE_COLORS[item.type], color: '#141414', fontWeight: 600 }}
          >
            {item.type}
          </span>
          <span className="d-annotation">{item.namespace}</span>
        </div>

        {/* Name + version */}
        <div>
          <h2 className={css('_fontbold')} style={{ margin: 0, fontSize: '1.5rem', color: 'var(--d-text)' }}>
            {item.name}
          </h2>
          <span className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
            v{item.version}
          </span>
        </div>

        {/* Description */}
        <p style={{ margin: 0, color: 'var(--d-text-muted)', lineHeight: 1.6 }}>
          {item.description}
        </p>

        {/* Meta row */}
        <div className={css('_flex _aic _gap4 _wrap')}>
          <div className={css('_flex _aic _gap1')}>
            <User size={14} style={{ color: 'var(--d-text-muted)' }} />
            <span className={css('_textsm')}>{item.author}</span>
          </div>
          <div className={css('_flex _aic _gap1')}>
            <Download size={14} style={{ color: 'var(--d-text-muted)' }} />
            <span className={css('_textsm')}>{formatNumber(item.downloads)} downloads</span>
          </div>
          <div className={css('_flex _aic _gap1')}>
            <Calendar size={14} style={{ color: 'var(--d-text-muted)' }} />
            <span className={css('_textsm')}>{item.updatedAt}</span>
          </div>
          {item.tags && item.tags.length > 0 && (
            <div className={css('_flex _aic _gap1 _wrap')}>
              <Package size={14} style={{ color: 'var(--d-text-muted)' }} />
              {item.tags.map((tag) => (
                <span key={tag} className="d-annotation">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
