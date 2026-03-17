import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect } from 'decantr/state';
import { onDestroy } from 'decantr/core';
import { link, useRoute } from 'decantr/router';
import { Input } from 'decantr/components';
import { DocsShell } from './site-shell.js';

const { div, nav, h3 } = tags;

// Ensure _none atom CSS rule is injected for class toggling
const NONE_CLS = css('_none');

// ── Sidebar navigation structure ──────────────────────────────────
const NAV_SECTIONS = [
  {
    label: 'Getting Started',
    items: [
      { id: 'overview', label: 'Overview', path: '/docs' },
    ],
  },
  {
    label: 'Tutorial',
    items: [
      { id: 'tut-01', label: '1. Install & Setup', path: '/docs/tutorial/01-install' },
      { id: 'tut-02', label: '2. Your First Page', path: '/docs/tutorial/02-first-page' },
      { id: 'tut-03', label: '3. Components', path: '/docs/tutorial/03-components' },
      { id: 'tut-04', label: '4. Styling', path: '/docs/tutorial/04-styling' },
      { id: 'tut-05', label: '5. State', path: '/docs/tutorial/05-state' },
      { id: 'tut-06', label: '6. Routing', path: '/docs/tutorial/06-routing' },
      { id: 'tut-07', label: '7. Data Fetching', path: '/docs/tutorial/07-data' },
      { id: 'tut-08', label: '8. Build & Deploy', path: '/docs/tutorial/08-deploy' },
    ],
  },
  {
    label: 'Cookbook',
    items: [
      { id: 'ck-dashboard', label: 'SaaS Dashboard', path: '/docs/cookbook/dashboard' },
      { id: 'ck-auth', label: 'Authentication', path: '/docs/cookbook/auth' },
      { id: 'ck-i18n', label: 'Internationalization', path: '/docs/cookbook/i18n' },
      { id: 'ck-data', label: 'Data Fetching', path: '/docs/cookbook/data-fetching' },
      { id: 'ck-forms', label: 'Forms', path: '/docs/cookbook/forms' },
    ],
  },
  {
    label: 'Explore',
    items: [
      { id: 'components', label: 'Components', path: '/docs/components' },
      { id: 'patterns', label: 'Patterns', path: '/docs/patterns' },
      { id: 'icons', label: 'Icons', path: '/docs/icons' },
      { id: 'tokens', label: 'Tokens', path: '/docs/tokens' },
      { id: 'foundations', label: 'API Reference', path: '/docs/foundations' },
      { id: 'archetypes', label: 'Archetypes', path: '/docs/archetypes' },
      { id: 'charts', label: 'Charts', path: '/docs/charts' },
      { id: 'shells', label: 'Shells', path: '/docs/shells' },
      { id: 'recipes', label: 'Recipes', path: '/docs/recipes' },
      { id: 'tools', label: 'Theme Studio', path: '/docs/tools' },
    ],
  },
];

// ── Sidebar component ─────────────────────────────────────────────
function Sidebar() {
  const route = useRoute();
  const [query, setQuery] = createSignal('');

  const navEl = nav({ class: css('_flex _col _gap4 _py4') });

  // Search input
  const searchInput = Input({
    placeholder: 'Search docs... (\u2318K)',
    class: css('_mx4'),
    oninput: (e) => setQuery(e.target.value.toLowerCase()),
  });
  navEl.appendChild(div({ class: css('_px0 _pb2') }, searchInput));

  // Cmd+K shortcut to focus search
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const inp = searchInput.querySelector('input') || searchInput;
      inp.focus();
    }
  };
  document.addEventListener('keydown', onKeyDown);
  onDestroy(() => document.removeEventListener('keydown', onKeyDown));

  // Track all groups and their items for filtering
  const groupEls = [];

  for (const section of NAV_SECTIONS) {
    const sectionHeader = h3({ class: css('_caption _fgmutedfg _px4 _py1 _uppercase _ls[0.08em]') }, section.label);
    const group = div({ class: css('_flex _col _gap0') }, sectionHeader);
    const itemEls = [];

    for (const item of section.items) {
      const navLink = link({
        href: item.path,
        class: css('_flex _aic _gap2 _px4 _py2 _textsm _nounder _r1 _fgmutedfg'),
      }, item.label);

      // Active state tracking
      createEffect(() => {
        const current = route().path;
        const isActive = current === item.path || (item.path !== '/docs' && current.startsWith(item.path));
        navLink.classList.toggle('ds-nav-active', isActive);
      });

      itemEls.push({ el: navLink, label: item.label.toLowerCase() });
      group.appendChild(navLink);
    }

    groupEls.push({ group, sectionHeader, itemEls });
    navEl.appendChild(group);
  }

  // Filter items reactively based on search query
  createEffect(() => {
    const q = query();
    for (const { group, sectionHeader, itemEls } of groupEls) {
      let anyVisible = false;
      for (const { el, label } of itemEls) {
        const match = !q || label.includes(q);
        el.classList.toggle(NONE_CLS, !match);
        if (match) anyVisible = true;
      }
      // Hide section header if no items match
      sectionHeader.classList.toggle(NONE_CLS, !anyVisible);
      group.classList.toggle(NONE_CLS, !anyVisible);
    }
  });

  return navEl;
}

// ── Main layout ───────────────────────────────────────────────────
export function DocsLayout(outlet) {
  return DocsShell(Sidebar(), outlet);
}
