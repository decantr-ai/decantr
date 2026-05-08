import { Suspense } from 'react';
import Link from 'next/link';
import { getShowcaseUrl, listAvailableShowcases } from '@/lib/showcase';
import { listContent } from '@/lib/api';
import type { ContentItem } from '@/lib/api';
import { SearchFilterBar } from '@/components/search-filter-bar';
import { formatContentDate } from '@/lib/content-presentation';

interface LaunchpadViewModel {
  item: ContentItem;
  showcaseUrl: string | null;
}

function ArrowIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function ShowcaseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="m10 9 5 3-5 3V9Z" />
      <path d="M8 20h8" />
    </svg>
  );
}

function getContentHref(item: ContentItem) {
  return `/${item.type}/${encodeURIComponent(item.namespace)}/${item.slug}`;
}

function getBlueprintCommand(item: ContentItem) {
  return `decantr new my-app --blueprint=${item.slug}`;
}

function getBlueprintMeta(item: ContentItem) {
  const pieces = [
    item.version ? `v${item.version}` : null,
    item.published_at ? formatContentDate(item.published_at) : null,
    item.namespace === '@official' ? 'Official' : item.namespace,
  ].filter(Boolean);

  return pieces.join(' · ');
}

function getBlueprintSignals(item: ContentItem, showcaseUrl?: string | null) {
  const signals = [
    item.namespace === '@official' ? 'Official contract' : 'Community contract',
    showcaseUrl ? 'Live showcase' : 'Contract preview',
    'CLI ready',
  ];

  return signals;
}

function buildLaunchpadViewModels(
  items: ContentItem[],
  showcaseUrls: Map<string, string>,
): LaunchpadViewModel[] {
  return items.map((item) => ({
    item,
    showcaseUrl: showcaseUrls.get(item.slug) ?? null,
  }));
}

function selectHeroLaunchpad(viewModels: LaunchpadViewModel[]) {
  return (
    viewModels.find((viewModel) => viewModel.item.slug === 'registry-platform') ??
    viewModels[0] ??
    null
  );
}

function BlueprintPreviewFallback({ name }: { name: string }) {
  return (
    <div className="registry-home-stage-fallback" aria-hidden="true">
      <div className="registry-home-stage-fallback-nav">
        <span />
        <span />
        <span />
      </div>
      <div className="registry-home-stage-fallback-hero">
        <span>{name}</span>
        <strong>Blueprint launchpad</strong>
      </div>
      <div className="registry-home-stage-fallback-grid">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

async function BlueprintLaunchHero() {
  let viewModels: LaunchpadViewModel[] = [];

  try {
    const [result, showcases] = await Promise.all([
      listContent('blueprints', {
        source: 'official',
        sort: 'recommended',
        limit: 8,
        offset: 0,
      }),
      listAvailableShowcases(),
    ]);

    const showcaseUrls = new Map(
      showcases.map((showcase) => [showcase.slug, getShowcaseUrl(showcase.slug, showcase)]),
    );
    viewModels = buildLaunchpadViewModels(result.items, showcaseUrls);
  } catch {
    // API unavailable
  }

  const hero = selectHeroLaunchpad(viewModels);
  const item = hero?.item;
  const name = item?.name || 'Registry Platform';
  const slug = item?.slug || 'registry-platform';
  const href = item ? getContentHref(item) : '/blueprint/%40official/registry-platform';
  const showcaseUrl = hero?.showcaseUrl ?? null;
  const command = item ? getBlueprintCommand(item) : 'decantr new my-app --blueprint=registry-platform';
  const proofPoints = [
    {
      label: 'Inspect',
      title: 'Readable contract',
      copy: 'Routes, shells, theme, and voice are visible before you scaffold.',
    },
    {
      label: 'Preview',
      title: 'Live product surface',
      copy: 'Open the showcase to judge the blueprint as an app, not a document.',
    },
    {
      label: 'Ship',
      title: 'CLI-ready command',
      copy: 'Copy the blueprint into a new Decantr project with one command.',
    },
  ];

  return (
    <section className="registry-home-hero registry-home-hero-cinematic entrance-fade" aria-labelledby="registry-home-heading">
      <div className="registry-home-hero-copy">
        <span className="d-label registry-home-eyebrow">Blueprint Launchpad</span>
        <h1 id="registry-home-heading" className="registry-home-title">
          Find the blueprint that already knows the app.
        </h1>
        <p className="registry-home-description">
          The registry is a launch surface for Decantr contracts: inspect the product shape, preview the live implementation, then scaffold from the exact blueprint.
        </p>
        <div className="registry-home-hero-actions">
          <Link href="/browse/blueprints?source=official" className="d-interactive registry-home-primary-action" data-variant="primary">
            Browse blueprints
            <ArrowIcon />
          </Link>
          <Link href={href} className="registry-home-section-link" aria-label="Open featured launchpad">
            Open featured launchpad
            <ArrowIcon />
          </Link>
        </div>
      </div>

      <div className="registry-home-hero-proof-grid" aria-label="Launchpad capabilities">
        {proofPoints.map((proof) => (
          <div key={proof.label} className="registry-home-hero-proof-item">
            <span>{proof.label}</span>
            <strong>{proof.title}</strong>
            <p>{proof.copy}</p>
          </div>
        ))}
      </div>

      <div className="registry-home-launch-stage registry-home-hero-stage" aria-label={`${name} launchpad preview`}>
        <div className="registry-home-stage-canvas">
          <div className="registry-home-stage-preview">
            {item?.thumbnail_url ? (
              <img src={item.thumbnail_url} alt={`${name} blueprint preview`} />
            ) : showcaseUrl ? (
              <iframe
                src={showcaseUrl}
                title={`${name} showcase preview`}
                loading="lazy"
                tabIndex={-1}
              />
            ) : (
              <BlueprintPreviewFallback name={name} />
            )}
            <span className="registry-home-stage-scan" aria-hidden="true" />
          </div>

          <div className="registry-home-stage-contract">
            <div className="registry-home-stage-contract-head">
              <span className="d-label">Blueprint contract</span>
              <strong>{name}</strong>
            </div>

            <div className="registry-home-stage-nodes" aria-hidden="true">
              {['Routes', 'Shells', 'Theme', 'Voice'].map((node) => (
                <span key={node} className="registry-home-stage-node">
                  {node}
                </span>
              ))}
            </div>

            <div className="registry-home-stage-command registry-home-stage-command-composer" aria-label={`Blueprint scaffold command: ${command}`}>
              <span className="registry-home-command-prompt">$</span>
              <code>
                <span className="registry-home-command-base">decantr new my-app</span>
                {' '}
                <span className="registry-home-command-flag">--blueprint={slug}</span>
              </code>
            </div>

            <div className="registry-home-stage-actions">
              <Link href={href} className="d-interactive" data-variant="primary">
                Open launchpad
                <ArrowIcon />
              </Link>
              {showcaseUrl ? (
                <a href={showcaseUrl} target="_blank" rel="noopener noreferrer" className="d-interactive" data-variant="ghost">
                  Showcase
                  <ShowcaseIcon />
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RegistryHomeFlow() {
  const steps = [
    {
      label: 'Blueprint',
      title: 'Choose the product shape',
      copy: 'Start from app topology, not a pile of components.',
    },
    {
      label: 'Contract',
      title: 'Inspect the decisions',
      copy: 'Routes, shells, patterns, theme direction, and voice stay readable.',
    },
    {
      label: 'Showcase',
      title: 'See it in motion',
      copy: 'Open a live runtime before you commit to an implementation path.',
    },
    {
      label: 'Scaffold',
      title: 'Ship from the contract',
      copy: 'Run the command, then tune from a known Decantr foundation.',
    },
  ];

  return (
    <div className="registry-home-flow-shell">
      <div className="registry-home-flow-track">
        {steps.map((step, index) => (
          <article key={step.label} className="registry-home-flow-step">
            <span className="registry-home-flow-index">{String(index + 1).padStart(2, '0')}</span>
            <span className="d-label registry-home-flow-label">{step.label}</span>
            <h3>{step.title}</h3>
            <p>{step.copy}</p>
          </article>
        ))}
      </div>
      <div className="registry-home-flow-command" aria-label="Example Decantr scaffold command">
        <span>$</span>
        <code>decantr new my-app --blueprint=registry-platform</code>
      </div>
    </div>
  );
}

function RegistryHomeSecondaryLinks() {
  const links = [
    {
      label: 'Patterns',
      href: '/browse/patterns?source=official',
      role: 'UI composition',
      copy: 'Composable UI sections when you already know the page shape.',
    },
    {
      label: 'Themes',
      href: '/browse/themes?source=official',
      role: 'Visual system',
      copy: 'Token-backed visual systems for readable generated UI.',
    },
    {
      label: 'Shells',
      href: '/browse/shells?source=official',
      role: 'Page frame',
      copy: 'Layout containers for navigation, app frames, and focused workflows.',
    },
    {
      label: 'Archetypes',
      href: '/browse/archetypes?source=official',
      role: 'Product section',
      copy: 'Product-section foundations for composing custom blueprints.',
    },
  ];

  return (
    <div className="registry-home-secondary-links">
      {links.map((link, index) => (
        <Link
          key={link.label}
          href={link.href}
          className="registry-home-secondary-link"
          aria-label={`${link.label}: ${link.role}`}
        >
          <span className="registry-home-secondary-index">{String(index + 1).padStart(2, '0')}</span>
          <span className="registry-home-secondary-name">
            <strong>{link.label}</strong>
            <small>{link.role}</small>
          </span>
          <p>{link.copy}</p>
          <ArrowIcon />
        </Link>
      ))}
    </div>
  );
}

async function FeaturedBlueprintLaunchpads() {
  let items: ContentItem[] = [];
  let showcaseUrls = new Map<string, string>();

  try {
    const [result, showcases] = await Promise.all([
      listContent('blueprints', {
        source: 'official',
        sort: 'recommended',
        limit: 5,
        offset: 0,
      }),
      listAvailableShowcases(),
    ]);

    items = result.items;
    showcaseUrls = new Map(
      showcases.map((showcase) => [showcase.slug, getShowcaseUrl(showcase.slug, showcase)]),
    );
  } catch {
    // API unavailable
  }

  if (items.length === 0) {
    return (
      <div className="registry-home-empty">
        <p>No featured blueprints are available yet.</p>
      </div>
    );
  }

  const viewModels = buildLaunchpadViewModels(items, showcaseUrls);
  const hero = selectHeroLaunchpad(viewModels) ?? viewModels[0];
  const primary = hero.item;
  const rest = viewModels
    .filter((viewModel) => viewModel.item.id !== primary.id)
    .map((viewModel) => viewModel.item);
  const primaryShowcaseUrl = showcaseUrls.get(primary.slug);

  return (
    <div className="registry-home-feature-stack">
      <article className="registry-home-feature-primary">
        <Link href={getContentHref(primary)} className="registry-home-feature-image" aria-label={`Open ${primary.name || primary.slug}`}>
          {primary.thumbnail_url ? (
            <img src={primary.thumbnail_url} alt={`${primary.name || primary.slug} preview`} />
          ) : (
            <BlueprintPreviewFallback name={primary.name || primary.slug} />
          )}
        </Link>

        <div className="registry-home-feature-copy">
          <span className="d-label registry-home-feature-eyebrow">Featured blueprint</span>
          <h3>
            <Link
              href={getContentHref(primary)}
              aria-label={`Open ${primary.name || primary.slug}`}
            >
              {primary.name || primary.slug}
            </Link>
          </h3>
          {primary.description ? <p>{primary.description}</p> : null}
          <span className="registry-home-feature-meta">{getBlueprintMeta(primary)}</span>
          <div className="registry-home-feature-signals">
            {getBlueprintSignals(primary, primaryShowcaseUrl).map((signal) => (
              <span key={signal}>{signal}</span>
            ))}
          </div>
        </div>

        <div className="registry-home-feature-command" aria-label="Blueprint scaffold command">
          <span>$</span>
          <code>{getBlueprintCommand(primary)}</code>
        </div>

        <div className="registry-home-feature-actions">
          <Link href={getContentHref(primary)} className="d-interactive" data-variant="primary">
            Open launchpad
            <ArrowIcon />
          </Link>
          {primaryShowcaseUrl ? (
            <a
              href={primaryShowcaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="d-interactive"
              data-variant="ghost"
            >
              Showcase
              <ShowcaseIcon />
            </a>
          ) : null}
        </div>
      </article>

      {rest.length > 0 ? (
        <div className="registry-home-feature-list">
          {rest.map((item) => {
            const showcaseUrl = showcaseUrls.get(item.slug);
            return (
              <article key={item.id} className="registry-home-feature-row">
                {item.thumbnail_url ? (
                  <Link href={getContentHref(item)} className="registry-home-feature-row-image" aria-label={`Open ${item.name || item.slug}`}>
                    <img src={item.thumbnail_url} alt={`${item.name || item.slug} preview`} />
                  </Link>
                ) : null}
                <div className="registry-home-feature-row-copy">
                  <h3>
                    <Link
                      href={getContentHref(item)}
                      aria-label={`Open ${item.name || item.slug}`}
                    >
                      {item.name || item.slug}
                    </Link>
                  </h3>
                  {item.description ? <p>{item.description}</p> : null}
                  <span>{getBlueprintMeta(item)}</span>
                  <div className="registry-home-feature-row-signals">
                    {getBlueprintSignals(item, showcaseUrl).map((signal) => (
                      <span key={signal}>{signal}</span>
                    ))}
                  </div>
                </div>
                <div className="registry-home-feature-row-actions">
                  <Link href={getContentHref(item)} className="registry-home-text-link">
                    Open
                  </Link>
                  {showcaseUrl ? (
                    <a href={showcaseUrl} target="_blank" rel="noopener noreferrer" className="registry-home-text-link">
                      Showcase
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export default function HomePage() {
  const searchHints = [
    'registry platform',
    'agent marketplace',
    'portfolio',
    'knowledge base',
  ];
  const searchLanes = [
    ['Blueprints', 'Full app contracts'],
    ['Themes', 'Visual systems'],
    ['Patterns', 'Page sections'],
  ];

  return (
    <div className="registry-page-max registry-browser-shell registry-home-editorial">
      <Suspense>
        <BlueprintLaunchHero />
      </Suspense>

      <section className="registry-home-search-stage" aria-labelledby="registry-home-search-heading">
        <div className="registry-home-search-stage-head">
          <div>
            <span id="registry-home-search-heading" className="d-label registry-anchor-label">
              Find a starting point
            </span>
            <h2 className="registry-home-section-title">Search by product intent, not registry taxonomy.</h2>
            <p>Start with the app shape you want. Blueprints stay first, and lower-level pieces are one filter away when you need to tune the contract.</p>
          </div>
          <div className="registry-home-search-hints" aria-label="Suggested searches">
            {searchHints.map((hint) => (
              <Link
                key={hint}
                href={`/browse/blueprints?source=official&q=${encodeURIComponent(hint)}`}
                aria-label={`Browse ${hint} blueprints`}
              >
                {hint}
              </Link>
            ))}
          </div>
        </div>
        <div className="registry-home-search-lanes" aria-label="Registry discovery layers">
          {searchLanes.map(([label, copy]) => (
            <span key={label}>
              <strong>{label}</strong>
              <small>{copy}</small>
            </span>
          ))}
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

      <section className="d-section registry-home-featured-section" data-density="comfortable" aria-labelledby="registry-home-featured">
        <div className="registry-home-section-head registry-home-section-head-row">
          <div>
            <span id="registry-home-featured" className="d-label registry-anchor-label">
              Featured launchpads
            </span>
            <h2 className="registry-home-section-title">Open the blueprints that already behave like products.</h2>
            <p className="registry-home-section-copy">
              A blueprint-first shortlist with live showcase context and scaffold commands close to the decision.
            </p>
          </div>
          <Link href="/browse/blueprints?source=official" className="registry-home-section-link">
            View all blueprints
            <ArrowIcon />
          </Link>
        </div>
        <Suspense>
          <FeaturedBlueprintLaunchpads />
        </Suspense>
      </section>

      <section className="d-section registry-home-flow-section" data-density="comfortable" aria-labelledby="registry-home-flow">
        <div className="registry-home-section-head">
          <span id="registry-home-flow" className="d-label registry-anchor-label">
            How launchpads work
          </span>
          <h2 className="registry-home-section-title">Move from curiosity to scaffold confidence.</h2>
          <p className="registry-home-section-copy">
            Each launchpad keeps the decision path tight: choose the product shape, inspect the contract, preview the runtime, then scaffold.
          </p>
        </div>
        <RegistryHomeFlow />
      </section>

      <section className="d-section registry-home-secondary-section" data-density="comfortable" aria-labelledby="registry-home-secondary">
        <div className="registry-home-section-head">
          <span id="registry-home-secondary" className="d-label registry-anchor-label">
            Build below the blueprint
          </span>
          <h2 className="registry-home-section-title">Drop into the contract layers when you need more control.</h2>
          <p className="registry-home-section-copy">
            When you do not need a full app starting point, browse the contract layers directly.
          </p>
        </div>
        <RegistryHomeSecondaryLinks />
      </section>
    </div>
  );
}
