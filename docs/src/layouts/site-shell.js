import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { link, useRoute } from 'decantr/router';
import { Shell, NavigationMenu } from 'decantr/components';

const { div, img, span } = tags;

const NAV_ITEMS = [
  { label: 'Showcase', href: '#/showcase' },
  { label: 'Docs', href: '#/docs' },
  { label: 'GitHub', href: 'https://github.com/decantr-ai/decantr' },
];

// ── Shared header ──────────────────────────────────────────────────

function SiteHeader() {
  const route = useRoute();
  const navEl = NavigationMenu({ items: NAV_ITEMS });

  // Set target="_blank" on the GitHub link (external nav)
  const ghLink = navEl.querySelector('a[href*="github.com"]');
  if (ghLink) {
    ghLink.setAttribute('target', '_blank');
    ghLink.setAttribute('rel', 'noopener');
  }

  // Track active nav item based on current route
  createEffect(() => {
    const path = route().path;
    navEl.querySelectorAll('.d-navmenu-item').forEach(item => {
      const href = item.getAttribute('href') || '';
      const itemPath = href.startsWith('#') ? href.slice(1) : href;
      const isActive = itemPath === path || (itemPath !== '/' && path.startsWith(itemPath));
      item.classList.toggle('ds-nav-active', isActive);
    });
  });

  const LOGO_W = '_w[150px] _shrink0';

  return Shell.Header({ class: css('_bgbg _borderB _bcborder') },
    // Logo — fixed width so nav centers symmetrically
    div({ class: css(LOGO_W) },
      link({ href: '/', class: `ds-nav-link ${css('_flex _aic _gap2 _nounder _fgfg _fw[700]')}` },
        img({ src: './images/logo-portrait.svg', alt: 'decantr', class: css('_h[28px]') }),
        span('decantr'),
        span({ class: 'ds-pink' }, '.ai'),
      ),
    ),
    // Nav — fills remaining space, centered
    div({ class: css('_flex1 _flex _jcc') },
      navEl,
    ),
    // Right spacer — matches logo width for symmetry
    div({ class: css(LOGO_W) }),
  );
}

// ── SiteShell — landing page (header + body, no sidebar) ───────────

export function SiteShell(...content) {
  return Shell(
    { config: 'top-nav-main' },
    SiteHeader(),
    Shell.Body({}, ...content),
  );
}

// ── DocsShell — docs pages (header + 240px sidebar + body) ─────────

const DOCS_CONFIG = {
  regions: ['header', 'nav', 'body'],
  grid: { areas: [['nav', 'header'], ['nav', 'body']] },
  nav: { position: 'left', width: '240px', collapseBelow: 'md' },
  header: { sticky: true },
  body: { scroll: true },
};

export function DocsShell(sidebar, content) {
  const [navState, setNavState] = createSignal('expanded');

  // On mobile collapse, go to hidden (not rail) since nav items are text-only
  const onNavChange = (state) => {
    setNavState(state === 'rail' ? 'hidden' : state);
  };

  return Shell(
    { config: DOCS_CONFIG, navState, onNavStateChange: onNavChange },
    SiteHeader(),
    Shell.Nav({ class: css('_bgbg _borderR _bcborder') }, sidebar),
    Shell.Body({ class: css('_p6 _md:p8') },
      typeof content === 'function' ? content() : content,
    ),
  );
}
