import { Suspense } from 'react';
import { listContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { KPIGrid } from '@/components/kpi-grid';

async function FeaturedContent() {
  let items: ContentItem[] = [];

  try {
    const result = await listContent('patterns', { limit: 9 });
    items = result.items;
  } catch {
    // API unavailable
  }

  return <ContentCardGrid items={items} emptyMessage="No patterns published yet." />;
}

async function RegistryStats() {
  const counts = { patterns: 0, themes: 0, blueprints: 0, shells: 0 };

  try {
    const results = await Promise.allSettled([
      listContent('patterns', { limit: 1 }),
      listContent('themes', { limit: 1 }),
      listContent('blueprints', { limit: 1 }),
      listContent('shells', { limit: 1 }),
    ]);

    const types = ['patterns', 'themes', 'blueprints', 'shells'] as const;
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        counts[types[i]] = r.value.total;
      }
    });
  } catch {
    // Silently fail
  }

  const total = counts.patterns + counts.themes + counts.blueprints + counts.shells;

  return (
    <KPIGrid
      items={[
        { label: 'Total Items', value: total },
        { label: 'Patterns', value: counts.patterns },
        { label: 'Themes', value: counts.themes },
        { label: 'Blueprints', value: counts.blueprints },
      ]}
    />
  );
}

function CardGridSkeleton() {
  return (
    <div className="content-card-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="lum-card-outlined animate-pulse">
          <div className="flex gap-2 mb-3">
            <div className="h-5 w-16 rounded-full bg-d-surface-raised" />
            <div className="h-5 w-14 rounded-full bg-d-surface-raised" />
          </div>
          <div className="h-5 w-3/4 rounded bg-d-surface-raised mb-2" />
          <div className="h-4 w-full rounded bg-d-surface-raised mb-1" />
          <div className="h-4 w-2/3 rounded bg-d-surface-raised" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="lum-canvas" style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Search section */}
      <section className="entrance-fade">
        <h2 className="font-semibold" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Explore the Registry
        </h2>
        <p className="text-sm" style={{ color: 'var(--d-text-muted)', marginBottom: '1.5rem' }}>
          Browse, install, and publish patterns, themes, blueprints, and shells.
        </p>
        <Suspense>
          <SearchFilterBar baseUrl="/browse" showSort={false} />
        </Suspense>
      </section>

      <div className="lum-divider" />

      {/* Featured Content */}
      <section>
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Featured
        </span>
        <Suspense fallback={<CardGridSkeleton />}>
          <FeaturedContent />
        </Suspense>
      </section>

      <div className="lum-divider" />

      {/* Registry Stats */}
      <section className="d-section" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
        <span
          className="d-label block mb-4"
          style={{ paddingLeft: '0.75rem', borderLeft: '2px solid var(--d-accent)' }}
        >
          Registry Stats
        </span>
        <Suspense>
          <RegistryStats />
        </Suspense>
      </section>
    </div>
  );
}
