import { Suspense } from 'react';
import { getRegistryIntelligenceSummary, listContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { KPIGrid } from '@/components/kpi-grid';
import { compareContentItems } from '@/lib/content-ranking';
import {
  CONTENT_TYPES,
  CONTENT_TYPE_LABELS,
  type RegistryContentType,
  toSingularRegistryContentType,
} from '@/lib/content-types';

async function FeaturedContent() {
  let items: ContentItem[] = [];

  try {
    const results = await Promise.allSettled(
      CONTENT_TYPES.map((type) => listContent(type, { limit: 6 })),
    );

    const featuredItems: ContentItem[] = [];
    results.forEach((result) => {
      if (result.status === 'fulfilled') {
        featuredItems.push(...result.value.items);
      }
    });

    items = featuredItems
      .sort(compareContentItems)
      .slice(0, 9);
  } catch {
    // API unavailable
  }

  return <ContentCardGrid items={items} emptyMessage="No featured registry content yet." />;
}

async function RegistryStats() {
  const counts = Object.fromEntries(
    CONTENT_TYPES.map((type) => [type, 0])
  ) as Record<RegistryContentType, number>;
  let intelligenceSummary: Awaited<ReturnType<typeof getRegistryIntelligenceSummary>> | null = null;

  try {
    intelligenceSummary = await getRegistryIntelligenceSummary({ namespace: '@official' });
    CONTENT_TYPES.forEach((type) => {
      counts[type] = intelligenceSummary?.by_type?.[toSingularRegistryContentType(type)]?.total_public_items ?? 0;
    });
  } catch {
    try {
      const results = await Promise.allSettled(
        CONTENT_TYPES.map((type) => listContent(type, { limit: 1 }))
      );

      results.forEach((r, i) => {
        if (r.status === 'fulfilled') {
          counts[CONTENT_TYPES[i]] = r.value.total;
        }
      });
    } catch {
      // Silently fail
    }
  }

  const total = CONTENT_TYPES.reduce((sum, type) => sum + counts[type], 0);
  const intelligenceItems = intelligenceSummary?.totals.with_intelligence ?? 0;
  const recommendedItems = intelligenceSummary?.totals.recommended ?? 0;
  const buildGreenItems = intelligenceSummary?.totals.build_green ?? 0;
  const smokeGreenItems = intelligenceSummary?.totals.smoke_green ?? 0;
  const highConfidenceItems = intelligenceSummary?.totals.high_confidence ?? 0;

  return (
    <KPIGrid
      items={[
        { label: 'Total Items', value: total },
        { label: 'With Intelligence', value: intelligenceItems },
        { label: 'Recommended', value: recommendedItems },
        { label: 'Build Verified', value: buildGreenItems },
        { label: 'Smoke Verified', value: smokeGreenItems },
        { label: 'High Confidence', value: highConfidenceItems },
      ].concat(
        CONTENT_TYPES.map((type) => ({
          label: CONTENT_TYPE_LABELS[type],
          value: counts[type],
        }))
      )}
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
    <div className="registry-page-max registry-browser-shell">
      <section className="registry-page-intro entrance-fade" aria-labelledby="registry-home-heading">
        <h1 id="registry-home-heading" className="mb-2 text-2xl font-semibold">
          Explore the Registry
        </h1>
        <p className="max-w-3xl text-[var(--d-text-muted)]">
          Browse, install, and publish patterns, themes, blueprints, archetypes, and shells.
        </p>
        <Suspense>
          <SearchFilterBar baseUrl="/browse" showSort={false} showRecommendedToggle={false} activeType="all" />
        </Suspense>
      </section>

      <section className="d-section" data-density="comfortable" aria-labelledby="featured-registry-heading">
        <span id="featured-registry-heading" className="d-label registry-anchor-label">
          Featured
        </span>
        <Suspense fallback={<CardGridSkeleton />}>
          <FeaturedContent />
        </Suspense>
      </section>

      <section className="d-section" data-density="comfortable" aria-labelledby="registry-stats-heading">
        <span id="registry-stats-heading" className="d-label registry-anchor-label">
          Registry Stats
        </span>
        <p className="max-w-3xl text-[var(--d-text-muted)]">
          Live totals are sourced from the hosted public registry contracts, including aggregate intelligence and verification coverage where available.
        </p>
        <Suspense>
          <RegistryStats />
        </Suspense>
      </section>
    </div>
  );
}
