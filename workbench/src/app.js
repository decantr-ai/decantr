import { mount, onDestroy } from 'decantr/core';
import { createSignal, createEffect, untrack } from 'decantr/state';
import { css, setStyle, getStyleList, setMode, setShape, setColorblindMode } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Select, Drawer, icon } from 'decantr/components';
import { createRouter, navigate } from 'decantr/router';
import { createFocusTrap } from 'decantr/components/_behaviors.js';
import { initUsageIndex } from './shared/usage-links.js';

import { SidebarNav, getSidebarItems, loadAllSidebarItems, searchIndex } from './sidebar.js';

// Pages
import { ComponentsIndex, ComponentGroupPage, ComponentDetailPage } from './pages/components.js';
import { ChartsIndex, ChartGroupPage, ChartDetailPage } from './pages/charts.js';
import { PatternsIndex, PatternDetailPage } from './pages/patterns.js';
import { ArchetypesIndex, ArchetypeDetailPage } from './pages/archetypes.js';
import { RecipesIndex, RecipeDetailPage } from './pages/recipes.js';
import { FoundationsIndex, FoundationPage } from './pages/foundations.js';
import { AtomsIndex, AtomPage } from './pages/atoms.js';
import { TokensIndex, TokenPage } from './pages/tokens.js';

const { div, header, main, h1, span, button, input, img } = tags;

// ─── Viewports ──────────────────────────────────────────────────
const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', width: 0, cssVar: null },
  { id: 'tablet', label: 'Tablet', width: 768, cssVar: 'var(--de-vp-tablet)' },
  { id: 'mobile', label: 'Mobile', width: 375, cssVar: 'var(--de-vp-mobile)' },
];

// ─── Search Modal ───────────────────────────────────────────────
function SearchModal(visible, setVisible) {
  const [query, setQuery] = createSignal('');
  const [activeIdx, setActiveIdx] = createSignal(0);

  function getFiltered() {
    const q = query().toLowerCase();
    if (!q) return searchIndex().slice(0, 20);
    return searchIndex().filter(item =>
      item.name.toLowerCase().includes(q) || item.label.toLowerCase().includes(q)
    ).slice(0, 30);
  }

  function selectItem(item) {
    setVisible(false);
    setQuery('');
    if (item.group) {
      const layerItems = getSidebarItems(item.layer);
      const groupItem = layerItems.find(g => g.id === item.group);
      if (groupItem?.children) {
        navigate(`/${item.layer}/${item.group}/${item.name}`);
      } else {
        navigate(`/${item.layer}/${item.group}`);
      }
    } else {
      navigate(`/${item.layer}`);
    }
  }

  const inputEl = input({
    class: 'de-search-input',
    placeholder: 'Search across all layers...',
    oninput: (e) => { setQuery(e.target.value); setActiveIdx(0); },
    onkeydown: (e) => {
      const filtered = getFiltered();
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(Math.min(activeIdx() + 1, filtered.length - 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(Math.max(activeIdx() - 1, 0)); }
      else if (e.key === 'Enter') { e.preventDefault(); if (filtered[activeIdx()]) selectItem(filtered[activeIdx()]); }
      else if (e.key === 'Escape') { setVisible(false); setQuery(''); }
    }
  });

  const resultsList = div({ class: 'de-search-results' });
  const emptyMsg = div({ class: 'de-search-empty' }, 'No results.');

  const searchBox = div({ class: 'de-search-box' }, inputEl, resultsList, emptyMsg);
  const overlay = div({
    class: 'de-search-modal de-hidden',
    onclick: (e) => { if (e.target === overlay) { setVisible(false); setQuery(''); } }
  }, searchBox);

  // Focus trap for accessibility
  const focusTrap = createFocusTrap(searchBox);
  onDestroy(() => focusTrap.deactivate());
  let previousFocus = null;

  createEffect(() => {
    const filtered = getFiltered();
    const idx = activeIdx();
    resultsList.innerHTML = '';
    if (filtered.length === 0) { emptyMsg.classList.remove('de-hidden'); }
    else {
      emptyMsg.classList.add('de-hidden');
      filtered.forEach((item, i) => {
        resultsList.appendChild(div({
          class: 'de-search-item' + (i === idx ? ' de-active' : ''),
          onclick: () => selectItem(item)
        },
          span({}, item.name),
          span({ class: 'de-search-item-layer' }, item.label)
        ));
      });
    }
  });

  createEffect(() => {
    if (visible()) {
      previousFocus = document.activeElement;
      overlay.classList.remove('de-hidden');
      overlay.classList.add('de-search-entering');
      requestAnimationFrame(() => {
        overlay.classList.remove('de-search-entering');
        inputEl.value = '';
        setQuery('');
        setActiveIdx(0);
        inputEl.focus();
        focusTrap.activate();
      });
    } else {
      focusTrap.deactivate();
      overlay.classList.add('de-hidden');
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
        previousFocus = null;
      }
    }
  });

  return overlay;
}

// ─── Root Layout (receives { outlet } from router) ─────────────
function RootLayout({ outlet }) {
  const styles = getStyleList();
  const [activeStyle, setActiveStyle] = createSignal(localStorage.getItem('de-style') || 'auradecantism');
  const [activeMode, setActiveMode] = createSignal(localStorage.getItem('de-mode') || 'dark');
  const [activeShape, setActiveShape] = createSignal(localStorage.getItem('de-shape') || '');
  const [activeCB, setActiveCB] = createSignal(localStorage.getItem('de-cb') || 'off');
  const [viewport, setViewport] = createSignal('desktop');
  const [searchVisible, setSearchVisible] = createSignal(false);
  const [hudOpen, setHudOpen] = createSignal(false);

  // Apply style/mode/shape + persist to localStorage
  createEffect(() => { const s = activeStyle(); localStorage.setItem('de-style', s); untrack(() => setStyle(s)); });
  createEffect(() => { const m = activeMode(); localStorage.setItem('de-mode', m); untrack(() => setMode(m)); });
  createEffect(() => { const s = activeShape() || null; localStorage.setItem('de-shape', s || ''); untrack(() => setShape(s)); });
  createEffect(() => { const c = activeCB(); localStorage.setItem('de-cb', c); untrack(() => setColorblindMode(c)); });

  // Cmd+K shortcut
  const onKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setSearchVisible(!searchVisible()); }
    if (e.key === 'Escape' && searchVisible()) setSearchVisible(false);
  };
  document.addEventListener('keydown', onKeyDown);
  onDestroy(() => document.removeEventListener('keydown', onKeyDown));

  // ─── Floating HUD ──────────────────────────────────────────
  const styleOptions = styles.map(s => ({ value: s.id, label: s.name }));
  const modeOptions = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'auto', label: 'Auto' }];
  const shapeOptions = [{ value: '', label: 'Default' }, { value: 'sharp', label: 'Sharp' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' }];
  const cbOptions = [{ value: 'off', label: 'Off' }, { value: 'protanopia', label: 'Protanopia' }, { value: 'deuteranopia', label: 'Deuteranopia' }, { value: 'tritanopia', label: 'Tritanopia' }];

  const hudDrawer = Drawer({
    visible: hudOpen,
    onClose: () => setHudOpen(false),
    side: 'right',
    title: 'Controls',
    width: 'var(--de-hud-w)'
  },
    div({ class: 'de-hud-row' },
      span({ class: 'de-hud-label' }, 'Style'),
      Select({ options: styleOptions, value: activeStyle, onchange: v => setActiveStyle(v), size: 'sm' })
    ),
    div({ class: 'de-hud-row' },
      span({ class: 'de-hud-label' }, 'Mode'),
      Select({ options: modeOptions, value: activeMode, onchange: v => setActiveMode(v), size: 'sm' })
    ),
    div({ class: 'de-hud-row' },
      span({ class: 'de-hud-label' }, 'Shape'),
      Select({ options: shapeOptions, value: activeShape, onchange: v => setActiveShape(v), size: 'sm' })
    ),
    div({ class: 'de-hud-row' },
      span({ class: 'de-hud-label' }, 'CVD'),
      Select({ options: cbOptions, value: activeCB, onchange: v => setActiveCB(v), size: 'sm' })
    ),
    div({ class: 'de-hud-row' },
      span({ class: 'de-hud-label' }, 'View'),
      div({ class: 'de-hud-viewports' },
        ...VIEWPORTS.map(vp =>
          button({
            class: () => 'de-hud-vp-btn' + (viewport() === vp.id ? ' de-active' : ''),
            onclick: () => setViewport(vp.id),
            'aria-label': vp.label
          }, vp.label)
        )
      )
    )
  );

  const hudToggle = button({
    class: 'de-hud-toggle',
    'aria-label': 'Toggle controls panel',
    title: 'Controls',
    onclick: () => setHudOpen(!hudOpen())
  }, icon('settings', { size: '1rem' }));

  // ─── Header ────────────────────────────────────────────────
  const isMac = navigator.platform.indexOf('Mac') >= 0;
  const shortcutHint = isMac ? '\u2318K' : 'Ctrl+K';

  const headerEl = header({ class: 'de-header' },
    div({ class: 'de-header-left' },
      h1({
        class: 'de-logo',
        onclick: () => navigate('/components')
      },
        img({ src: './images/logo.svg', alt: 'decantr', class: css('_w[28px]') }),
        span({ class: css('_bold _ls[-0.02em] _textlg _fgfg') },
          'decantr', span({ class: 'de-pink' }, '.'), 'a', span({ class: 'de-pink' }, 'i')
        )
      )
    ),
    div({ class: 'de-header-right' },
      button({
        class: 'de-search-trigger',
        'aria-label': 'Search',
        onclick: () => setSearchVisible(true)
      },
        span({}, 'Search'),
        span({ class: 'de-search-kbd' }, shortcutHint)
      ),
      hudToggle
    )
  );

  // ─── Main content area with optional viewport frame ────────
  const outletEl = outlet();
  const mainArea = main({ class: 'de-main' });

  function updateViewport() {
    mainArea.replaceChildren();
    const vp = viewport();
    const contentWrap = div({ class: 'de-content' }, outletEl);
    if (vp === 'desktop') {
      mainArea.appendChild(contentWrap);
    } else {
      const vpDef = VIEWPORTS.find(v => v.id === vp);
      mainArea.appendChild(div({
        class: 'de-viewport-frame',
        style: `width:${vpDef.cssVar}`
      },
        div({ class: 'de-viewport-label' }, `${vpDef.label} — ${vpDef.width}px`),
        contentWrap
      ));
    }
  }
  createEffect(updateViewport);

  // ─── Search modal ──────────────────────────────────────────
  const searchModal = SearchModal(searchVisible, setSearchVisible);

  // ─── Shell ─────────────────────────────────────────────────
  return div({ class: 'de-shell' },
    headerEl,
    div({ class: 'de-body d-mesh' },
      SidebarNav(),
      mainArea
    ),
    hudDrawer,
    searchModal
  );
}

// ─── Redirect component ────────────────────────────────────────
function RedirectToComponents() {
  navigate('/components', { replace: true });
  return div({});
}

// ─── Router setup ──────────────────────────────────────────────
const router = createRouter({
  mode: 'hash',
  scrollBehavior: false,
  routes: [
    { path: '/', component: RootLayout, children: [
      { path: '', component: RedirectToComponents },
      { path: 'components', component: ComponentsIndex },
      { path: 'components/:group', component: ComponentGroupPage },
      { path: 'components/:group/:name', component: ComponentDetailPage },
      { path: 'charts', component: ChartsIndex },
      { path: 'charts/:group', component: ChartGroupPage },
      { path: 'charts/:group/:name', component: ChartDetailPage },
      { path: 'patterns', component: PatternsIndex },
      { path: 'patterns/:id', component: PatternDetailPage },
      { path: 'archetypes', component: ArchetypesIndex },
      { path: 'archetypes/:id', component: ArchetypeDetailPage },
      { path: 'recipes', component: RecipesIndex },
      { path: 'recipes/:id', component: RecipeDetailPage },
      { path: 'foundations', component: FoundationsIndex },
      { path: 'foundations/:subsection', component: FoundationPage },
      { path: 'atoms', component: AtomsIndex },
      { path: 'atoms/:category', component: AtomPage },
      { path: 'tokens', component: TokensIndex },
      { path: 'tokens/:group', component: TokenPage },
    ]}
  ]
});

// ─── Mount ─────────────────────────────────────────────────────
mount(document.getElementById('app'), () => router.outlet());

// Load sidebar data
loadAllSidebarItems();

// Initialize usage links index from registry data
(async function loadUsageIndex() {
  try {
    const [patternsResp, archResp] = await Promise.all([
      fetch('/__decantr/registry/patterns/index.json'),
      fetch('/__decantr/registry/archetypes/index.json')
    ]);
    if (!patternsResp.ok || !archResp.ok) return;
    const patternsIndex = await patternsResp.json();
    const archIndex = await archResp.json();

    const patternEntries = patternsIndex.patterns || {};
    const patternData = {};
    await Promise.all(Object.entries(patternEntries).map(async ([id, meta]) => {
      try {
        const resp = await fetch(`/__decantr/registry/patterns/${meta.file}`);
        if (resp.ok) patternData[id] = await resp.json();
      } catch { /* skip */ }
    }));

    const archEntries = archIndex.archetypes || {};
    const archData = {};
    await Promise.all(Object.entries(archEntries).map(async ([id, meta]) => {
      try {
        const resp = await fetch(`/__decantr/registry/archetypes/${meta.file}`);
        if (resp.ok) archData[id] = await resp.json();
      } catch { /* skip */ }
    }));

    initUsageIndex(patternData, archData);
  } catch { /* registry not available — usage links will show fallback */ }
})();
