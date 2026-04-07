import { Suspense } from 'react';
import { listContent } from '@/lib/api';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { ContentCardGrid } from '@/components/content-card-grid';
import { KPIGrid, type KPIStat } from '@/components/kpi-grid';

async function FeaturedContent() {
  let patterns = { total: 0, items: [] as any[] };
  let themes = { total: 0, items: [] as any[] };
  let blueprints = { total: 0, items: [] as any[] };
  let shells = { total: 0, items: [] as any[] };

  try {
    [patterns, themes, blueprints, shells] = await Promise.all([
      listContent('patterns', { limit: 3 }),
      listContent('themes', { limit: 3 }),
      listContent('blueprints', { limit: 3 }),
      listContent('shells', { limit: 3 }),
    ]);
  } catch {
    // API unavailable — show empty
  }

  const featured = [
    ...patterns.items.slice(0, 2),
    ...themes.items.slice(0, 2),
    ...blueprints.items.slice(0, 1),
    ...shells.items.slice(0, 1),
  ];

  const stats: KPIStat[] = [
    { label: 'Total Items', value: patterns.total + themes.total + blueprints.total + shells.total, trend: 12.5, icon: 'Package' },
    { label: 'Patterns', value: patterns.total, trend: 8.3, icon: 'Activity' },
    { label: 'Themes', value: themes.total, trend: 5.0, icon: 'Palette' },
    { label: 'Blueprints', value: blueprints.total, trend: 15.0, icon: 'Download' },
  ];

  return (
    <>
      {/* Featured */}
      <section>
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Featured
        </span>
        <ContentCardGrid items={featured} />
      </section>

      <div className="lum-divider" />

      {/* Registry Stats */}
      <section>
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Registry Stats
        </span>
        <KPIGrid stats={stats} />
      </section>
    </>
  );
}

export default function HomePage() {
  return (
    <div className="lum-canvas">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="flex flex-col gap-6">
          <h1 className="text-3xl font-semibold" style={{ lineHeight: 1.2 }}>
            Explore the Registry
          </h1>

          <Suspense fallback={null}>
            <SearchFilterBar baseUrl="/browse" />
          </Suspense>

          <div className="lum-divider" />

          <Suspense fallback={
            <div className="flex items-center justify-center" style={{ padding: '3rem 0' }}>
              <span className="text-sm" style={{ color: 'var(--d-text-muted)' }}>Loading registry...</span>
            </div>
          }>
            <FeaturedContent />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
