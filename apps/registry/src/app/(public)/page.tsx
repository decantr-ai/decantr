import Link from 'next/link';
import { Suspense } from 'react';
import { listAvailableShowcases } from '@/lib/showcase';
import { listContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { ContentCardGrid } from '@/components/content-card-grid';
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

const QUICK_START_STEPS = [
  {
    eyebrow: 'Start with blueprints',
    title: 'Pick a full app starting point',
    description:
      'Browse official blueprints first when you want the fastest path from Decantr contract to scaffolded application.',
    href: '/browse/blueprints?source=official',
    cta: 'Browse blueprints',
  },
  {
    eyebrow: 'See it running',
    title: 'Open live showcases',
    description:
      'Use audited showcases to understand the interaction model and visual rhythm before committing to a direction.',
    href: '/browse/blueprints?source=official',
    cta: 'Explore showcases',
  },
  {
    eyebrow: 'Build your own stack',
    title: 'Mix patterns, themes, shells, and archetypes',
    description:
      'When you already know the workflow shape, browse the lower-level building blocks and compose your own system.',
    href: '/browse',
    cta: 'Browse the registry',
  },
];

function QuickStartSection() {
  return (
    <div className="registry-quickstart-grid">
      {QUICK_START_STEPS.map((step) => (
        <article key={step.title} className="d-surface registry-quickstart-card" data-elevation="raised">
          <span className="d-label registry-quickstart-eyebrow">{step.eyebrow}</span>
          <h2 className="registry-quickstart-title">{step.title}</h2>
          <p className="registry-quickstart-description">{step.description}</p>
          <Link href={step.href} className="d-interactive registry-quickstart-link" data-variant="ghost">
            {step.cta}
          </Link>
        </article>
      ))}
    </div>
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
        <QuickStartSection />
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
