/**
 * DocsShell — Purpose-built docs layout with sidebar navigation,
 * main content area, and optional right-side TOC.
 *
 * Layout: sidebar-aside (no header - uses global NavHeader)
 * ┌──────────────────────────────────────────────────────────────┐
 * │                    [Global NavHeader]                         │
 * ├────────────┬─────────────────────────────────────┬───────────┤
 * │            │                                     │           │
 * │  Sidebar   │           Content Area              │    TOC    │
 * │  (260px)   │                                     │  (200px)  │
 * │            │                                     │  sticky   │
 * │            │                                     │           │
 * └────────────┴─────────────────────────────────────┴───────────┘
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { link } from 'decantr/router';
import { Shell, icon } from 'decantr/components';
import { DocsSidebar } from '../components/docs-sidebar.js';
import { DocsToc, extractHeadings } from '../components/docs-toc.js';
import { DocsCommandPalette } from '../components/docs-command-palette.js';

const { div, h1, nav, button, span } = tags;

// ── Styles ──────────────────────────────────────────────────────────
const styles = {
  // Shell container - offset for fixed NavHeader (approx 56px)
  shell: css('_pt[56px] _minh[100vh] _relative'),
  nav: css('_bgbg _borderR _bcborder _overflow[auto] _pt4'),
  body: css('_p6 _lg:p8 _maxw[800px]'),
  aside: css('_bgbg _borderL _bcborder _lg:flex _hidden'),
  breadcrumb: css('_flex _aic _gap2 _textsm _fgmutedfg _mb4'),
  breadcrumbSep: css('_fgmuted'),
  breadcrumbLink: css('_nounder _fgmutedfg _h:fgfg _trans[color_0.15s]'),
  breadcrumbCurrent: css('_fgfg'),
  pageTitle: css('_heading2 _mb6 _relative _pb3'),
  pageTitleUnderline: css('_absolute _bottom0 _left0 _w[60px] _h[3px] _bgprimary _r1'),
  content: css('_flex _col _gap6 _anim[fadeIn_0.3s_ease]'),

  // Mobile menu bar
  mobileBar: css('_fixed _top[56px] _left0 _right0 _h[48px] _bgbg _borderB _bcborder _flex _aic _px4 _z[50] _lg:none'),
  mobileToggle: css('_flex _aic _gap2 _px3 _py2 _r1 _bgmuted/30 _border _bcborder/50 _cursor[pointer] _trans[all_0.15s] _h:bgmuted/50'),

  // Mobile overlay
  mobileOverlay: css('_fixed _inset0 _top[104px] _bg[rgba(0,0,0,0.5)] _z[40] _lg:none _anim[fadeIn_0.15s_ease]'),
  mobileSidebar: css('_fixed _top[104px] _left0 _bottom0 _w[280px] _bgbg _borderR _bcborder _z[50] _overflow[auto] _anim[slideInLeft_0.2s_ease]'),
};

// ── Shell configuration (no header - uses global NavHeader) ─────────
const DOCS_SHELL_CONFIG = {
  regions: ['nav', 'body', 'aside'],
  grid: { areas: [['nav', 'body', 'aside']] },
  nav: { position: 'left', width: '260px', collapseBelow: 'lg' },
  body: { scroll: true },
  aside: { width: '200px' },
};

const DOCS_SHELL_NO_ASIDE = {
  regions: ['nav', 'body'],
  grid: { areas: [['nav', 'body']] },
  nav: { position: 'left', width: '260px', collapseBelow: 'lg' },
  body: { scroll: true },
};

// ── Breadcrumb ──────────────────────────────────────────────────────
function Breadcrumb({ items = [] }) {
  const { span } = tags;
  const crumbs = [
    { label: 'Docs', path: '/docs' },
    ...items,
  ];

  const el = nav({ class: styles.breadcrumb, 'aria-label': 'Breadcrumb' });

  for (let i = 0; i < crumbs.length; i++) {
    const crumb = crumbs[i];
    const isLast = i === crumbs.length - 1;

    if (i > 0) {
      el.appendChild(span({ class: styles.breadcrumbSep }, '/'));
    }

    if (isLast) {
      el.appendChild(span({ class: styles.breadcrumbCurrent }, crumb.label));
    } else {
      el.appendChild(link({ href: crumb.path, class: styles.breadcrumbLink }, crumb.label));
    }
  }

  return el;
}

// ── Mobile Menu Component ───────────────────────────────────────────
function MobileMenu({ isOpen, onToggle }) {
  const container = div();

  // Mobile bar (always visible on mobile)
  const bar = div({ class: styles.mobileBar },
    button({
      class: styles.mobileToggle,
      onclick: onToggle,
      'aria-label': 'Toggle navigation',
    },
      icon('menu', { size: '18px' }),
      span({ class: css('_textsm _fgmutedfg') }, 'Menu'),
    ),
  );
  container.appendChild(bar);

  // Overlay and sidebar (visible when open)
  const overlay = div({ class: styles.mobileOverlay });
  overlay.onclick = onToggle;

  const sidebar = div({ class: styles.mobileSidebar },
    DocsSidebar(),
  );

  // Toggle visibility
  createEffect(() => {
    const open = isOpen();
    overlay.style.display = open ? 'block' : 'none';
    sidebar.style.display = open ? 'block' : 'none';
  });

  container.appendChild(overlay);
  container.appendChild(sidebar);

  return container;
}

// ── Page wrapper with title and breadcrumb ──────────────────────────
function PageWrapper({ title, breadcrumbs = [], children }) {
  const wrapper = div({ class: styles.content });

  // Breadcrumb
  if (breadcrumbs.length > 0 || title) {
    wrapper.appendChild(Breadcrumb({ items: breadcrumbs }));
  }

  // Title with gradient underline
  if (title) {
    const titleEl = h1({ class: styles.pageTitle },
      title,
      div({ class: styles.pageTitleUnderline }),
    );
    wrapper.appendChild(titleEl);
  }

  // Content
  for (const child of children) {
    if (child) wrapper.appendChild(child);
  }

  return wrapper;
}

// ── Main DocsShell export ───────────────────────────────────────────
/**
 * NewDocsShell — Layout with title, breadcrumbs, and optional TOC
 * @param {Object} options
 * @param {string} [options.title] - Page title
 * @param {Array<{label: string, path: string}>} [options.breadcrumbs] - Breadcrumb items
 * @param {Array<{id: string, label: string, level: number}>} [options.headings] - TOC headings
 * @param {boolean} [options.showToc=true] - Whether to show TOC
 * @param {...Node} content - Page content
 */
export function NewDocsShell({ title, breadcrumbs = [], headings = [], showToc = true } = {}, ...content) {
  const [navState, setNavState] = createSignal('expanded');
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  // On mobile collapse, go to hidden (not rail) since nav items are text-only
  const onNavChange = (state) => {
    setNavState(state === 'rail' ? 'hidden' : state);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen());

  // Determine if TOC should display
  const hasToc = showToc && headings.length >= 3;
  const config = hasToc ? DOCS_SHELL_CONFIG : DOCS_SHELL_NO_ASIDE;

  return div({ class: styles.shell },
    DocsCommandPalette(),
    MobileMenu({ isOpen: mobileMenuOpen, onToggle: toggleMobileMenu }),
    Shell(
      { config, navState, onNavStateChange: onNavChange },
      Shell.Nav({ class: styles.nav },
        DocsSidebar(),
      ),
      Shell.Body({ class: `${styles.body} ${css('_lg:pt0 _pt[48px]')}` },
        PageWrapper({ title, breadcrumbs, children: content }),
      ),
      hasToc && Shell.Aside({ class: styles.aside },
        DocsToc({ headings }),
      ),
    ),
  );
}

// ── Simple DocsShell for raw content (home page, etc.) ──────────────
/**
 * DocsShell — Shell without page wrapper, for custom layouts like home
 * @param {...Node} content - Page content
 */
export function DocsShell(...content) {
  const [navState, setNavState] = createSignal('expanded');
  const [mobileMenuOpen, setMobileMenuOpen] = createSignal(false);

  const onNavChange = (state) => {
    setNavState(state === 'rail' ? 'hidden' : state);
  };

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen());

  return div({ class: styles.shell },
    DocsCommandPalette(),
    MobileMenu({ isOpen: mobileMenuOpen, onToggle: toggleMobileMenu }),
    Shell(
      { config: DOCS_SHELL_NO_ASIDE, navState, onNavStateChange: onNavChange },
      Shell.Nav({ class: styles.nav },
        DocsSidebar(),
      ),
      Shell.Body({ class: css('_p0 _lg:pt0 _pt[48px]') },
        ...content,
      ),
    ),
  );
}

// Re-export for page use
export { extractHeadings };
