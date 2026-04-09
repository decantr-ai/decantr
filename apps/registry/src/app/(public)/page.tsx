import { Suspense } from 'react';
import { getRegistryIntelligenceSummary, listContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { KPIGrid } from '@/components/kpi-grid';
import { compareContentItems } from '@/lib/content-ranking';
import {
  getShowcaseShortlistVerificationSummary,
  listShortlistedShowcases,
} from '@/lib/showcase';
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

async function ShowcaseShortlist() {
  const shortlist = await listShortlistedShowcases();
  if (shortlist.length === 0) {
    return null;
  }

  let items: ContentItem[] = [];

  try {
    const result = await listContent('blueprints', { limit: 100 });
    const shortlistOrder = new Map(shortlist.map((entry, index) => [entry.slug, index]));
    items = result.items
      .filter((item) => shortlistOrder.has(item.slug))
      .sort((a, b) => (shortlistOrder.get(a.slug) ?? 999) - (shortlistOrder.get(b.slug) ?? 999));
  } catch {
    // API unavailable
  }

  return (
    <ContentCardGrid
      items={items}
      emptyMessage="No shortlisted showcase blueprints are available yet."
    />
  );
}

async function ShowcaseShortlistSummary() {
  const summary = await getShowcaseShortlistVerificationSummary();
  if (!summary) {
    return null;
  }

  return (
    <KPIGrid
      items={[
        { label: 'Build Verified', value: summary.passedBuilds },
        { label: 'Smoke Verified', value: summary.passedSmokes },
        { label: 'Lower Drift', value: summary.lowerDriftCount },
        { label: 'Moderate Drift', value: summary.moderateDriftCount },
        { label: 'Elevated Drift', value: summary.elevatedDriftCount },
        { label: 'Avg Smoke (ms)', value: summary.averageSmokeDurationMs },
      ]}
    />
  );
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
    <div className="lum-canvas mx-auto max-w-6xl px-6 py-8">
      <section className="entrance-fade">
        <h2 className="mb-2 text-2xl font-semibold">
          Explore the Registry
        </h2>
        <p className="mb-6 text-sm text-d-muted">
          Browse, install, and publish patterns, themes, blueprints, archetypes, and shells.
        </p>
        <Suspense>
          <SearchFilterBar baseUrl="/browse" showSort={false} showRecommendedToggle={false} activeType="all" />
        </Suspense>
      </section>

      <div className="lum-divider" />

      <section>
        <span className="d-label mb-4 block border-l-2 border-[var(--d-accent)] pl-3">
          Featured
        </span>
        <Suspense fallback={<CardGridSkeleton />}>
          <FeaturedContent />
        </Suspense>
      </section>

      <div className="lum-divider" />

      <section>
        <span className="d-label mb-4 block border-l-2 border-[var(--d-success)] pl-3">
          Showcase Shortlist
        </span>
        <p className="mb-4 max-w-3xl text-sm text-d-muted">
          Provisional benchmark candidates from the Decantr showcase corpus. These blueprints currently have live showcase builds and a passing served-output smoke baseline.
        </p>
        <Suspense>
          <ShowcaseShortlistSummary />
        </Suspense>
        <div className="h-4" />
        <Suspense fallback={<CardGridSkeleton />}>
          <ShowcaseShortlist />
        </Suspense>
      </section>

      <div className="lum-divider" />

      <section className="d-section py-8">
        <span className="d-label mb-4 block border-l-2 border-[var(--d-accent)] pl-3">
          Registry Stats
        </span>
        <p className="mb-4 max-w-3xl text-sm text-d-muted">
          Live totals are sourced from the hosted public registry contracts, including aggregate intelligence and verification coverage where available.
        </p>
        <Suspense>
          <RegistryStats />
        </Suspense>
      </section>
    </div>
  );
}
