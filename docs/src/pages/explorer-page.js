/**
 * Unified Explorer page — single implementation of the component/pattern/archetype
 * explorer with sidebar, HUD controls, global search, and viewport simulator.
 *
 * Replaces the old /workbench route and the duplicated code between
 * docs/pages/workbench.js and workbench/src/app.js.
 */
import { onDestroy } from 'decantr/core';
import { createSignal, createEffect, createMemo, untrack } from 'decantr/state';
import { css, setStyle, getStyleList, setMode, setShape, setColorblindMode } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Select, Drawer, icon, Input } from 'decantr/components';
import { link, navigate, useRoute } from 'decantr/router';
import { createFocusTrap } from '../../../src/components/_behaviors.js';
import { initUsageIndex } from '../../../src/explorer/shared/usage-links.js';
import { injectExplorerCSS } from '../../../src/explorer/styles.js';

// Explorer data loaders for sidebar
import { loadFoundationItems } from '../../../src/explorer/foundations.js';
import { loadAtomItems } from '../../../src/explorer/atoms.js';
import { loadTokenItems } from '../../../src/explorer/tokens.js';
import { loadComponentItems } from '../../../src/explorer/components.js';
import { loadIconItems } from '../../../src/explorer/icons.js';
import { loadChartItems } from '../../../src/explorer/charts.js';
import { loadPatternItems } from '../../../src/explorer/patterns.js';
import { loadArchetypeItems } from '../../../src/explorer/archetypes.js';
import { loadRecipeItems } from '../../../src/explorer/recipes.js';
import { loadToolItems } from '../../../src/explorer/tools.js';
import { loadShellItems } from '../../../src/explorer/shells.js';

// Page facades (local copies, /explorer prefix)
import { ComponentsIndex, ComponentGroupPage, ComponentDetailPage } from '../explorer/components.js';
import { IconsIndex, IconGroupPage, IconDetailPage } from '../explorer/icons.js';
import { ChartsIndex, ChartGroupPage, ChartDetailPage } from '../explorer/charts.js';
import { PatternsIndex, PatternDetailPage } from '../explorer/patterns.js';
import { ShellsIndex, ShellDetailPage } from '../explorer/shells.js';
import { ArchetypesIndex, ArchetypeDetailPage } from '../explorer/archetypes.js';
import { RecipesIndex, RecipeDetailPage } from '../explorer/recipes.js';
import { FoundationsIndex, FoundationPage } from '../explorer/foundations.js';
import { AtomsIndex, AtomPage } from '../explorer/atoms.js';
import { TokensIndex, TokenPage } from '../explorer/tokens.js';
import { ToolsIndex, ToolDetailPage } from '../explorer/tools.js';

injectExplorerCSS();

const { div, header, main, nav, h1, span, button, input, img } = tags;

const PREFIX = '/explorer';

// ─── Layer definitions ─────────────────────────────────────────
const LAYERS = [
  { id: 'components', label: 'Components' },
  { id: 'icons', label: 'Icons' },
  { id: 'charts', label: 'Charts' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'shells', label: 'Shells' },
  { id: 'archetypes', label: 'Archetypes' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'atoms', label: 'Atoms' },
  { id: 'tokens', label: 'Tokens' },
  { id: 'tools', label: 'Tools' },
];

// ─── Sidebar data ──────────────────────────────────────────────
const [sidebarData, setSidebarData] = createSignal({});
let sidebarLoaded = false;

function getSidebarItems(layer) {
  return sidebarData()[layer] || [];
}

async function loadAllSidebarItems() {
  if (sidebarLoaded) return;
  sidebarLoaded = true;
  const loaders = {
    foundations: loadFoundationItems,
    atoms: loadAtomItems,
    tokens: loadTokenItems,
    components: loadComponentItems,
    icons: loadIconItems,
    charts: loadChartItems,
    patterns: loadPatternItems,
    shells: loadShellItems,
    archetypes: loadArchetypeItems,
    recipes: loadRecipeItems,
    tools: loadToolItems,
  };
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([k, fn]) => [k, await fn()])
  );
  setSidebarData(Object.fromEntries(entries));
}

// ─── Search index ──────────────────────────────────────────────
const searchIndex = createMemo(() => {
  sidebarData(); // track
  const index = [];
  for (const layer of LAYERS) {
    const items = getSidebarItems(layer.id);
    for (const item of items) {
      if (item.children) {
        for (const child of item.children) {
          index.push({ name: child, layer: layer.id, group: item.id, label: layer.label + ' > ' + item.label });
        }
      } else {
        index.push({ name: item.label, layer: layer.id, group: item.id, label: layer.label });
      }
    }
  }
  return index;
});

// ─── Viewports ─────────────────────────────────────────────────
const VIEWPORTS = [
  { id: 'desktop', label: 'Desktop', width: 0, cssVar: null },
  { id: 'tablet', label: 'Tablet', width: 768, cssVar: 'var(--de-vp-tablet)' },
  { id: 'mobile', label: 'Mobile', width: 375, cssVar: 'var(--de-vp-mobile)' },
];

// ─── Search Modal ──────────────────────────────────────────────
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
        navigate(`${PREFIX}/${item.layer}/${item.group}/${item.name}`);
      } else {
        navigate(`${PREFIX}/${item.layer}/${item.group}`);
      }
    } else {
      navigate(`${PREFIX}/${item.layer}`);
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

// ─── Sidebar Nav ───────────────────────────────────────────────
const expandedGroups = new Set();

function ExplorerSidebar() {
  const route = useRoute();
  const [filter, setFilter] = createSignal('');

  const activeLayer = createMemo(() => {
    const path = route().path || '';
    const stripped = path.replace(/^\/explorer\/?/, '');
    return stripped.split('/').filter(Boolean)[0] || 'components';
  });

  createEffect(() => { expandedGroups.add(activeLayer()); });

  const filterInput = Input({
    placeholder: 'Filter...',
    size: 'sm',
    oninput: (e) => setFilter(e.target.value)
  });

  const itemsContainer = div({ class: 'de-sidebar-items' });

  function buildNav() {
    itemsContainer.replaceChildren();
    const q = filter().toLowerCase();

    for (const layer of LAYERS) {
      const items = getSidebarItems(layer.id);

      let visibleItems = items;
      if (q) {
        visibleItems = items.filter(item => {
          if (item.children) {
            return item.label.toLowerCase().includes(q) ||
              item.children.some(c => c.toLowerCase().includes(q));
          }
          return item.label.toLowerCase().includes(q);
        });
        if (visibleItems.length === 0) continue;
      }

      const filteredItems = q ? visibleItems.map(item => {
        if (!item.children) return item;
        const matchingChildren = item.children.filter(
          c => c.toLowerCase().includes(q) || item.label.toLowerCase().includes(q)
        );
        return { ...item, children: matchingChildren };
      }) : visibleItems;

      const itemCount = filteredItems.reduce(
        (sum, item) => sum + (item.children ? item.children.length : 1), 0
      );

      const isExpanded = q || expandedGroups.has(layer.id);

      const headerBtn = button({
        class: 'de-nav-header' + (activeLayer() === layer.id ? ' de-active' : ''),
        onclick: () => {
          if (expandedGroups.has(layer.id)) {
            expandedGroups.delete(layer.id);
          } else {
            expandedGroups.add(layer.id);
          }
          buildNav();
        }
      },
        span({}, layer.label),
        span({ class: 'de-nav-count' }, String(itemCount))
      );
      itemsContainer.appendChild(headerBtn);

      if (!isExpanded) continue;

      for (const item of filteredItems) {
        if (item.children) {
          itemsContainer.appendChild(
            div({ class: 'de-nav-group-label' }, item.label)
          );
          for (const child of item.children) {
            itemsContainer.appendChild(
              link({
                href: `${PREFIX}/${layer.id}/${item.id}/${child}`,
                class: 'de-nav-child',
                activeClass: 'de-active'
              }, child)
            );
          }
        } else {
          itemsContainer.appendChild(
            link({
              href: `${PREFIX}/${layer.id}/${item.id}`,
              class: 'de-nav-child',
              activeClass: 'de-active'
            }, item.label)
          );
        }
      }
    }
  }

  createEffect(() => { sidebarData(); filter(); buildNav(); });

  return nav({ class: 'de-sidebar', 'aria-label': 'Explorer navigation' },
    div({ class: 'de-sidebar-search' }, filterInput),
    itemsContainer
  );
}

// ─── Route content resolver ────────────────────────────────────
function resolveContent(route) {
  const path = route.path || '';
  const stripped = path.replace(/^\/explorer\/?/, '');
  const segments = stripped.split('/').filter(Boolean);
  const section = segments[0] || 'components';
  const params = route.params || {};
  const p1 = params.group || params.section || segments[1];
  const p2 = params.item || segments[2];

  switch (section) {
    case 'components':
      if (p2) return ComponentDetailPage({ group: p1, name: p2 });
      if (p1) return ComponentGroupPage({ group: p1 });
      return ComponentsIndex();
    case 'icons':
      if (p2) return IconDetailPage({ group: p1, name: p2 });
      if (p1) return IconGroupPage({ group: p1 });
      return IconsIndex();
    case 'charts':
      if (p2) return ChartDetailPage({ group: p1, name: p2 });
      if (p1) return ChartGroupPage({ group: p1 });
      return ChartsIndex();
    case 'patterns':
      if (p1) return PatternDetailPage({ id: p1, group: segments[1] });
      return PatternsIndex();
    case 'shells':
      if (p1) return ShellDetailPage({ id: p1 });
      return ShellsIndex();
    case 'archetypes':
      if (p1) return ArchetypeDetailPage({ id: p1 });
      return ArchetypesIndex();
    case 'recipes':
      if (p1) return RecipeDetailPage({ id: p1 });
      return RecipesIndex();
    case 'foundations':
      if (p1) return FoundationPage({ subsection: p1 });
      return FoundationsIndex();
    case 'atoms':
      if (p1) return AtomPage({ category: p1 });
      return AtomsIndex();
    case 'tokens':
      if (p1) return TokenPage({ group: p1 });
      return TokensIndex();
    case 'tools':
      if (p1) return ToolDetailPage({ tool: p1 });
      return ToolsIndex();
    default:
      return ComponentsIndex();
  }
}

// ─── ExplorerPage component ────────────────────────────────────
export function ExplorerPage() {
  const route = useRoute();
  const styles = getStyleList();

  const [activeStyle, setActiveStyle] = createSignal(localStorage.getItem('de-style') || 'auradecantism');
  const [activeMode, setActiveMode] = createSignal(localStorage.getItem('de-mode') || 'dark');
  const [activeShape, setActiveShape] = createSignal(localStorage.getItem('de-shape') || '');
  const [activeCB, setActiveCB] = createSignal(localStorage.getItem('de-cb') || 'off');
  const [viewport, setViewport] = createSignal('desktop');
  const [searchVisible, setSearchVisible] = createSignal(false);
  const [hudOpen, setHudOpen] = createSignal(false);

  // Persist style/mode/shape to localStorage
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

  // HUD controls
  const styleOptions = styles.map(s => ({ value: s.id, label: s.name }));
  const modeOptions = [{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }, { value: 'auto', label: 'Auto' }];
  const shapeOptions = [{ value: '', label: 'Default' }, { value: 'sharp', label: 'Sharp' }, { value: 'rounded', label: 'Rounded' }, { value: 'pill', label: 'Pill' }];
  const cbOptions = [{ value: 'off', label: 'Off' }, { value: 'protanopia', label: 'Protanopia' }, { value: 'deuteranopia', label: 'Deuteranopia' }, { value: 'tritanopia', label: 'Tritanopia' }];

  const hudDrawer = Drawer({
    visible: hudOpen,
    onClose: () => setHudOpen(false),
    side: 'right',
    title: 'Controls',
    size: 'var(--de-hud-w)'
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

  // Header
  const isMac = typeof navigator !== 'undefined' && navigator.platform.indexOf('Mac') >= 0;
  const shortcutHint = isMac ? '\u2318K' : 'Ctrl+K';

  const headerEl = header({ class: 'de-header' },
    div({ class: 'de-header-left' },
      h1({
        class: 'de-logo',
        onclick: () => navigate(`${PREFIX}/components`)
      },
        span({ class: css('_bold _ls[-0.02em] _textlg') },
          'decantr', span({ class: 'de-pink' }, '.'), 'a', span({ class: 'de-pink' }, 'i')
        ),
        span({ class: css('_fgmutedfg _textsm _ml2') }, 'explorer')
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
      hudToggle,
      button({
        class: 'de-hud-toggle',
        'aria-label': 'Back to home',
        title: 'Back to home',
        onclick: () => navigate('/')
      }, icon('arrow-left', { size: '1rem' }))
    )
  );

  // Main content area
  const mainArea = main({ class: 'de-main' });

  function updateContent() {
    mainArea.replaceChildren();
    const r = route();
    const contentEl = resolveContent(r);
    const contentWrap = div({ class: 'de-content' }, contentEl);
    const vp = viewport();

    if (vp === 'desktop') {
      mainArea.appendChild(contentWrap);
    } else {
      const vpDef = VIEWPORTS.find(v => v.id === vp);
      mainArea.appendChild(div({
        class: 'de-viewport-frame',
        style: () => `width:${vpDef.cssVar}`
      },
        div({ class: 'de-viewport-label' }, `${vpDef.label} \u2014 ${vpDef.width}px`),
        contentWrap
      ));
    }
  }
  createEffect(updateContent);

  // Search modal
  const searchModal = SearchModal(searchVisible, setSearchVisible);

  // Load sidebar data
  loadAllSidebarItems();

  // Initialize usage links index
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
    } catch { /* registry not available */ }
  })();

  // Compose the shell
  return div({ class: 'de-shell' },
    headerEl,
    div({ class: 'de-body d-mesh' },
      ExplorerSidebar(),
      mainArea
    ),
    hudDrawer,
    searchModal
  );
}
