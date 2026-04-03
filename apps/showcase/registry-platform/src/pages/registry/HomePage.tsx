import { css } from '@decantr/css';
import { SearchFilterBar } from '@/components/SearchFilterBar';
import { ContentCardGrid } from '@/components/ContentCardGrid';
import { KPIGrid } from '@/components/KPIGrid';
import { CONTENT_ITEMS, REGISTRY_KPIS } from '@/data/mock';

export function HomePage() {
  return (
    <div className="lum-canvas" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Search — prominent top element */}
      <section className="entrance-fade">
        <h2
          className={css('_fontsemi')}
          style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}
        >
          Explore the Registry
        </h2>
        <p className={css('_textsm')} style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
          Browse, install, and publish patterns, themes, blueprints, and shells.
        </p>
        <SearchFilterBar resultCount={CONTENT_ITEMS.length} />
      </section>

      <div className="lum-divider" />

      {/* Featured Content */}
      <section>
        <span
          className={css('_db _mb4') + ' d-label'}
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Featured
        </span>
        <ContentCardGrid items={CONTENT_ITEMS.slice(0, 9)} />
      </section>

      <div className="lum-divider" />

      {/* Registry Stats */}
      <section className="d-section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <span
          className={css('_db _mb4') + ' d-label'}
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Registry Stats
        </span>
        <KPIGrid stats={REGISTRY_KPIS} />
      </section>
    </div>
  );
}
