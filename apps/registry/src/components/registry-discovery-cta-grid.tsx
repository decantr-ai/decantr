import Link from 'next/link';
import {
  getAllTypesIcon,
  getTypePresentation,
} from '@/lib/content-presentation';

function ShowcaseIcon() {
  return (
    <svg
      className="registry-discovery-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="m10 9 5 4-5 4V9Z" />
      <path d="M8 20h8" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="registry-discovery-action-arrow-icon"
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

const DISCOVERY_PATHS = [
  {
    eyebrow: 'Start with blueprints',
    title: 'Pick a full app starting point',
    description:
      'Browse official blueprints first when you want the fastest path from Decantr contract to scaffolded application.',
    href: '/browse/blueprints?source=official',
    cta: 'Browse blueprints',
    hint: 'Official compositions ready to scaffold',
    tone: 'blueprint',
    icon: getTypePresentation('blueprints').icon,
  },
  {
    eyebrow: 'See it running',
    title: 'Open live showcases',
    description:
      'Use audited showcases to understand the interaction model and visual rhythm before committing to a direction.',
    href: '/browse/blueprints?source=official',
    cta: 'Explore showcases',
    hint: 'Inspect benchmarked runtime examples',
    tone: 'showcase',
    icon: <ShowcaseIcon />,
  },
  {
    eyebrow: 'Build your own stack',
    title: 'Mix patterns, themes, shells, and archetypes',
    description:
      'When you already know the workflow shape, browse the lower-level building blocks and compose your own system.',
    href: '/browse',
    cta: 'Browse the registry',
    hint: 'Explore the full Decantr catalog',
    tone: 'catalog',
    icon: getAllTypesIcon(),
  },
] as const;

export function RegistryDiscoveryCtaGrid() {
  return (
    <div className="registry-discovery-grid">
      {DISCOVERY_PATHS.map((path) => (
        <article
          key={path.title}
          className="d-surface registry-discovery-card"
          data-elevation="raised"
          data-tone={path.tone}
        >
          <div className="registry-discovery-card-head">
            <span className="registry-discovery-icon-badge" data-tone={path.tone}>
              {path.icon}
            </span>
            <span className="d-label registry-discovery-eyebrow">{path.eyebrow}</span>
          </div>

          <div className="registry-discovery-copy">
            <h2 className="registry-discovery-title">{path.title}</h2>
            <p className="registry-discovery-description">{path.description}</p>
          </div>

          <div className="registry-discovery-footer">
            <Link href={path.href} className="d-interactive registry-discovery-action" data-tone={path.tone}>
              <span className="registry-discovery-action-copy">
                <span className="registry-discovery-action-label">{path.cta}</span>
                <span className="registry-discovery-action-hint">{path.hint}</span>
              </span>
              <span className="registry-discovery-action-arrow">
                <ArrowRightIcon />
              </span>
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
