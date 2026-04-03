import Link from 'next/link';
import { Suspense } from 'react';
import { listContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
import { SearchFilterBar } from '@/components/search-filter-bar';

async function LatestPatterns() {
  let items: ContentItem[] = [];

  try {
    const result = await listContent('patterns', { limit: 12 });
    items = result.items;
  } catch {
    // API unavailable — show empty state
  }

  return <ContentCardGrid items={items} emptyMessage="No patterns published yet. Check back soon." />;
}

interface StatCardProps {
  label: string;
  value: number;
  accent: string;
}

function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div className="d-surface flex flex-col items-center gap-2 py-5 px-4">
      <span className={`lum-stat-glow text-lg ${accent}`}>
        {value.toLocaleString()}
      </span>
      <span className="text-xs text-d-muted font-medium uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
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
    // Silently fail — stats are supplementary
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lum-stagger">
      <StatCard label="Patterns" value={counts.patterns} accent="" />
      <StatCard label="Themes" value={counts.themes} accent="" />
      <StatCard label="Blueprints" value={counts.blueprints} accent="" />
      <StatCard label="Shells" value={counts.shells} accent="" />
    </div>
  );
}

function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="d-surface flex flex-col items-center gap-2 py-5 px-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-d-surface-raised" />
          <div className="h-3 w-16 rounded bg-d-surface-raised" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* Hero section */}
      <section className="lum-orbs relative rounded-xl py-16 px-8 text-center lum-fade-up">
        <div className="relative z-10 flex flex-col items-center gap-5">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-d-text leading-tight tracking-tight">
            Design Intelligence Registry
          </h1>
          <p className="text-d-muted text-base sm:text-lg max-w-2xl leading-relaxed">
            Browse production-ready patterns, themes, blueprints, and shells.
            Built for AI assistants that generate consistent, high-quality interfaces.
          </p>
          <Link
            href="/browse"
            className="d-interactive py-2 px-6 text-sm font-medium no-underline mt-2"
            data-variant="primary"
          >
            Browse Registry
          </Link>
        </div>
      </section>

      {/* Search */}
      <Suspense>
        <SearchFilterBar baseUrl="/browse" showSort={false} />
      </Suspense>

      {/* Latest patterns */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="d-label border-l-2 border-d-accent pl-2">
            Latest Patterns
          </h2>
          <Link
            href="/browse?type=patterns"
            className="text-xs text-d-muted no-underline hover:text-d-primary transition-colors"
          >
            View all &rarr;
          </Link>
        </div>
        <Suspense fallback={<CardGridSkeleton />}>
          <LatestPatterns />
        </Suspense>
      </section>

      <div className="lum-divider" />

      {/* Registry stats */}
      <section>
        <h2 className="d-label border-l-2 border-d-accent pl-2 mb-4">
          Registry Stats
        </h2>
        <Suspense fallback={<StatsSkeleton />}>
          <RegistryStats />
        </Suspense>
      </section>
    </div>
  );
}
