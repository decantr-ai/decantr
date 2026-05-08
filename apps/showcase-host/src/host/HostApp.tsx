import { useEffect, useMemo } from 'react';
import { capsules, getCapsule } from '../capsules';

function parseShowcasePath() {
  const url = new URL(window.location.href);
  const parts = url.pathname
    .replace(/^\/showcase\/?/, '')
    .split('/')
    .filter(Boolean);
  const slug = parts[0] ?? capsules[0]?.slug ?? null;
  const routeSuffix = parts.slice(1).join('/');
  const hashRoute = routeSuffix
    ? `#/${routeSuffix}`
    : url.hash && url.hash !== '#'
      ? url.hash
      : '#/';

  return {
    embed: url.searchParams.get('embed') === '1',
    slug,
    hashRoute,
  };
}

function buildRunnerSrc(slug: string, hashRoute: string): string {
  return `/showcase/${slug}/__runner?runner=1${hashRoute}`;
}

function switchShowcase(slug: string) {
  window.location.href = `/showcase/${slug}`;
}

export function HostApp() {
  const parsed = useMemo(parseShowcasePath, []);
  const capsule = getCapsule(parsed.slug);

  useEffect(() => {
    document.title = capsule
      ? `${capsule.title} | Decantr Showcase`
      : 'Showcase not found | Decantr';
  }, [capsule]);

  if (!capsule) {
    return (
      <main className="showcase-host-shell" data-state="missing">
        <section className="showcase-host-panel">
          <p className="showcase-host-eyebrow">Showcase not found</p>
          <h1>Unknown Decantr showcase</h1>
          <p>The requested blueprint does not have a migrated showcase capsule.</p>
        </section>
      </main>
    );
  }

  return (
    <main className="showcase-host-shell" data-embed={parsed.embed ? 'true' : 'false'}>
      {!parsed.embed ? (
        <header className="showcase-host-header">
          <a href="/" className="showcase-host-brand">
            Decantr
          </a>
          <div>
            <p className="showcase-host-eyebrow">Live blueprint showcase</p>
            <h1>{capsule.title}</h1>
          </div>
          <label className="showcase-host-switcher">
            <span>Switch showcase</span>
            <select
              value={capsule.slug}
              aria-label="Switch live blueprint showcase"
              onChange={(event) => switchShowcase(event.currentTarget.value)}
            >
              {capsules.map((option) => (
                <option key={option.slug} value={option.slug}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
          <a className="showcase-host-link" href={`/blueprints/%40official/${capsule.slug}`}>
            View blueprint
          </a>
        </header>
      ) : null}
      <iframe
        title={`${capsule.title} showcase`}
        className="showcase-host-frame"
        src={buildRunnerSrc(capsule.slug, parsed.hashRoute)}
        sandbox="allow-forms allow-modals allow-popups allow-same-origin allow-scripts"
      />
    </main>
  );
}
