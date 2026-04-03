import { css } from '@decantr/css';
import { Link } from 'react-router-dom';
import { Plus, Package } from 'lucide-react';
import { ContentCardGrid } from '@/components/ContentCardGrid';
import { CONTENT_ITEMS } from '@/data/mock';

export function ContentPage() {
  const userItems = CONTENT_ITEMS.filter((item) => item.author === 'decantr');

  return (
    <div className={css('_flex _col _gap6')}>
      {/* Header row */}
      <div className={css('_flex _aic _jcsb')}>
        <h3 className={css('_textlg _fontsemi')}>My Content</h3>
        <Link
          to="/dashboard/content/new"
          className="d-interactive"
          data-variant="primary"
          style={{ fontSize: '0.875rem', textDecoration: 'none' }}
        >
          <Plus size={16} />
          New Item
        </Link>
      </div>

      {/* Content grid */}
      <section className="d-section" data-density="compact">
        {userItems.length > 0 ? (
          <ContentCardGrid items={userItems} editable />
        ) : (
          <div className={css('_flex _col _aic _jcc _gap3')} style={{ padding: '3rem 0' }}>
            <Package size={48} style={{ color: 'var(--d-text-muted)', opacity: 0.5 }} />
            <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)' }}>
              You haven't published any content yet.
            </p>
            <Link
              to="/dashboard/content/new"
              className="d-interactive"
              data-variant="primary"
              style={{ fontSize: '0.875rem', textDecoration: 'none' }}
            >
              Publish Your First Item
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}
