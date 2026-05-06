import { Suspense } from 'react';
import { listAvailableShowcases } from '@/lib/showcase';
import { listContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { RegistryDiscoveryCtaGrid } from '@/components/registry-discovery-cta-grid';
import { SearchFilterBar } from '@/components/search-filter-bar';

async function FeaturedBlueprints() {
  let items: ContentItem[] = [];

  try {
    const result = await listContent('blueprints', {
      source: 'official',
      sort: 'recommended',
      limit: 6,
      offset: 0,
    });
    items = result.items;
  } catch {
    // API unavailable
  }

  return (
    <ContentCardGrid
      items={items}
      emptyMessage="No featured blueprints are available yet."
    />
  );
}

async function ShowcaseBlueprints() {
  let items: ContentItem[] = [];

  try {
    const [result, showcases] = await Promise.all([
      listContent('blueprints', {
        source: 'official',
        sort: 'recommended',
        limit: 18,
        offset: 0,
      }),
      listAvailableShowcases(),
    ]);

    const showcaseSlugs = new Set(showcases.map((item) => item.slug));
    items = result.items.filter((item) => showcaseSlugs.has(item.slug)).slice(0, 6);
  } catch {
    // API unavailable
  }

  return (
    <ContentCardGrid
      items={items}
      emptyMessage="No live showcase blueprints are available yet."
    />
  );
}

export default function HomePage() {
  return (
    <div className="registry-page-max registry-browser-shell">
      <section className="registry-home-hero entrance-fade" aria-labelledby="registry-home-heading">
        <div className="registry-page-intro">
          <h1 id="registry-home-heading" className="registry-home-title">
            Start building with the Decantr Registry
          </h1>
          <p className="registry-home-description">
            Discover official blueprints, browse production-ready patterns and themes, and jump into live showcases before you scaffold your next Decantr application.
          </p>
        </div>

        <Suspense>
          <SearchFilterBar
            baseUrl="/browse"
            showSort={false}
            showSourceFilter
            activeType="all"
          />
        </Suspense>
      </section>

      <section className="d-section" data-density="comfortable" aria-labelledby="registry-home-quickstart">
        <span id="registry-home-quickstart" className="d-label registry-anchor-label">
          Quick start
        </span>
        <RegistryDiscoveryCtaGrid />
      </section>

      <section className="d-section" data-density="comfortable" aria-labelledby="registry-home-featured">
        <div className="registry-home-section-head">
          <span id="registry-home-featured" className="d-label registry-anchor-label">
            Featured blueprints
          </span>
          <p className="registry-home-section-copy">
            Start from official Decantr app foundations that already carry route structure, shells, patterns, and showcase guidance.
          </p>
        </div>
        <Suspense>
          <FeaturedBlueprints />
        </Suspense>
      </section>

      <section className="d-section" data-density="comfortable" aria-labelledby="registry-home-showcases">
        <div className="registry-home-section-head">
          <span id="registry-home-showcases" className="d-label registry-anchor-label">
            Live showcases
          </span>
          <p className="registry-home-section-copy">
            These official blueprints have live showcase builds so you can inspect the runtime before committing to a direction.
          </p>
        </div>
        <Suspense>
          <ShowcaseBlueprints />
        </Suspense>
      </section>
    </div>
  );
}
