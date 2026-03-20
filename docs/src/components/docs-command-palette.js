/**
 * DocsCommandPalette — Cmd+K search for docs navigation
 * Features: fuzzy search, keyboard navigation, recent searches
 */
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect, createMemo } from 'decantr/state';
import { onDestroy } from 'decantr/core';
import { navigate } from 'decantr/router';
import { icon } from 'decantr/components';

const { div, input, span, kbd } = tags;

// ── Searchable docs index ───────────────────────────────────────────
const DOCS_INDEX = [
  // Start Here
  { id: 'quick-setup', title: 'Quick Setup', section: 'Start Here', path: '/docs/quick-setup', icon: 'zap', keywords: ['install', 'setup', 'start', 'begin', 'create'] },
  { id: 'first-prompt', title: 'Your First Prompt', section: 'Start Here', path: '/docs/first-prompt', icon: 'message-square', keywords: ['prompt', 'ai', 'first', 'learn'] },
  { id: 'decantation', title: 'The Decantation Process', section: 'Start Here', path: '/docs/decantation', icon: 'wine', keywords: ['process', 'pour', 'settle', 'clarify', 'decant', 'serve', 'workflow'] },

  // Building
  { id: 'adding-pages', title: 'Adding Pages', section: 'Building', path: '/docs/building/pages', icon: 'file', keywords: ['page', 'route', 'create', 'new'] },
  { id: 'adding-features', title: 'Adding Features', section: 'Building', path: '/docs/building/features', icon: 'sparkles', keywords: ['feature', 'add', 'build', 'tannin'] },
  { id: 'prompt-patterns', title: 'Prompt Patterns', section: 'Building', path: '/docs/building/prompts', icon: 'lightbulb', keywords: ['prompt', 'pattern', 'template', 'example'] },
  { id: 'working-essence', title: 'Working with Essence', section: 'Building', path: '/docs/building/essence', icon: 'file-code', keywords: ['essence', 'json', 'config', 'structure', 'cork'] },

  // Styling
  { id: 'themes-recipes', title: 'Themes & Recipes', section: 'Styling', path: '/docs/styling/themes', icon: 'palette', keywords: ['theme', 'recipe', 'style', 'mode', 'shape'] },
  { id: 'customizing-colors', title: 'Customizing Colors', section: 'Styling', path: '/docs/styling/colors', icon: 'droplet', keywords: ['color', 'token', 'primary', 'bg', 'fg'] },
  { id: 'visual-effects', title: 'Visual Effects', section: 'Styling', path: '/docs/styling/effects', icon: 'wand', keywords: ['effect', 'glass', 'glow', 'gradient', 'animation', 'shadow'] },

  // Customizing
  { id: 'creating-patterns', title: 'Creating Patterns', section: 'Customizing', path: '/docs/customizing/patterns', icon: 'puzzle', keywords: ['pattern', 'create', 'custom', 'local'] },
  { id: 'creating-themes', title: 'Creating Themes', section: 'Customizing', path: '/docs/customizing/themes', icon: 'brush', keywords: ['theme', 'create', 'custom', 'style', 'recipe'] },
  { id: 'publishing', title: 'Publishing to Registry', section: 'Customizing', path: '/docs/customizing/publishing', icon: 'package', keywords: ['publish', 'registry', 'share', 'community'] },

  // Reference (links to explorer)
  { id: 'ref-components', title: 'Components', section: 'Reference', path: '/explorer/components', icon: 'blocks', keywords: ['component', 'button', 'card', 'input', 'modal'] },
  { id: 'ref-patterns', title: 'Patterns', section: 'Reference', path: '/explorer/patterns', icon: 'layout-grid', keywords: ['pattern', 'hero', 'card-grid', 'data-table'] },
  { id: 'ref-atoms', title: 'Atoms & Tokens', section: 'Reference', path: '/explorer/atoms', icon: 'grid-3x3', keywords: ['atom', 'token', 'css', 'class', 'utility'] },
  { id: 'ref-api', title: 'API Reference', section: 'Reference', path: '/explorer/foundations', icon: 'code', keywords: ['api', 'core', 'state', 'router', 'function'] },
];

// ── Styles ──────────────────────────────────────────────────────────
const styles = {
  overlay: css('_fixed _inset0 _z[100] _bg[rgba(0,0,0,0.6)] _backdrop[blur(4px)] _flex _aic _jcc _p4'),
  container: css('_w100 _maxw[560px] _maxh[70vh] _bgbg _r2 _shadow[0_25px_50px_rgba(0,0,0,0.5)] _border _bcborder _overflow[hidden] _flex _col'),

  // Search input
  inputWrap: css('_flex _aic _gap3 _px4 _py3 _borderB _bcborder'),
  inputIcon: css('_fgmutedfg _shrink0'),
  input: css('_flex1 _bg[transparent] _b0 _outline[none] _textbase _fgfg'),
  inputHint: css('_flex _aic _gap1 _shrink0'),
  kbd: css('_px1 _py[2px] _r1 _bgmuted _textsm _fgmutedfg _font[var(--d-font-mono)]'),

  // Results
  results: css('_flex _col _overflow[auto] _py2'),
  sectionLabel: css('_px4 _py2 _caption _fgmutedfg _uppercase _ls[0.06em] _sticky _top0 _bgbg'),
  item: css('_flex _aic _gap3 _px4 _py2 _cursor[pointer] _trans[background_0.1s]'),
  itemActive: css('_bgprimary/15'),
  itemIcon: css('_w[32px] _h[32px] _r1 _bgmuted/50 _flex _aic _jcc _fgmutedfg _shrink0'),
  itemContent: css('_flex _col _flex1 _minw0'),
  itemTitle: css('_textsm _fgfg _truncate'),
  itemSection: css('_caption _fgmutedfg'),
  itemArrow: css('_fgmutedfg _op0 _trans[opacity_0.1s]'),

  // Empty state
  empty: css('_flex _col _aic _jcc _py8 _fgmutedfg'),
  emptyIcon: css('_mb2 _op5'),
};

// ── Fuzzy search ────────────────────────────────────────────────────
function fuzzyMatch(query, item) {
  const q = query.toLowerCase();
  const title = item.title.toLowerCase();
  const section = item.section.toLowerCase();
  const keywords = item.keywords.join(' ').toLowerCase();

  // Exact title match scores highest
  if (title.includes(q)) return 3;
  // Section match
  if (section.includes(q)) return 2;
  // Keyword match
  if (keywords.includes(q)) return 1;

  return 0;
}

// ── Command Palette Component ───────────────────────────────────────
export function DocsCommandPalette() {
  const [isOpen, setIsOpen] = createSignal(false);
  const [query, setQuery] = createSignal('');
  const [activeIndex, setActiveIndex] = createSignal(0);

  // Filter and score results
  const results = createMemo(() => {
    const q = query().trim();
    if (!q) {
      // Show all items grouped by section when no query
      return DOCS_INDEX;
    }

    return DOCS_INDEX
      .map(item => ({ ...item, score: fuzzyMatch(q, item) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
  });

  // Group results by section
  const groupedResults = createMemo(() => {
    const groups = {};
    for (const item of results()) {
      if (!groups[item.section]) groups[item.section] = [];
      groups[item.section].push(item);
    }
    return groups;
  });

  // Flat list for keyboard navigation
  const flatResults = createMemo(() => results());

  // Reset active index when results change
  createEffect(() => {
    results();
    setActiveIndex(0);
  });

  // Navigate to selected item
  function selectItem(item) {
    setIsOpen(false);
    setQuery('');
    navigate(item.path);
  }

  // Keyboard handler
  function handleKeyDown(e) {
    if (!isOpen()) {
      // Open on Cmd+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    const items = flatResults();

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setQuery('');
        break;

      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(i => Math.min(i + 1, items.length - 1));
        break;

      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(i => Math.max(i - 1, 0));
        break;

      case 'Enter':
        e.preventDefault();
        if (items[activeIndex()]) {
          selectItem(items[activeIndex()]);
        }
        break;
    }
  }

  // Global keyboard listener
  document.addEventListener('keydown', handleKeyDown);
  onDestroy(() => document.removeEventListener('keydown', handleKeyDown));

  // Build overlay (hidden by default)
  const overlay = div({ class: styles.overlay });
  overlay.style.display = 'none';

  // Close on overlay click
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      setIsOpen(false);
      setQuery('');
    }
  };

  // Container
  const container = div({ class: styles.container });
  container.onclick = (e) => e.stopPropagation();

  // Search input
  const inputEl = input({
    type: 'text',
    placeholder: 'Search docs...',
    class: styles.input,
    oninput: (e) => setQuery(e.target.value),
  });

  const inputWrap = div({ class: styles.inputWrap },
    icon('search', { size: '18px', class: styles.inputIcon }),
    inputEl,
    div({ class: styles.inputHint },
      kbd({ class: styles.kbd }, 'esc'),
      span({ class: css('_textsm _fgmutedfg') }, 'to close'),
    ),
  );

  // Results container
  const resultsEl = div({ class: styles.results });

  // Empty state
  const emptyState = div({ class: styles.empty },
    icon('search', { size: '32px', class: styles.emptyIcon }),
    span('No results found'),
  );

  // Track item elements for scroll-into-view
  let itemEls = [];

  // Render results reactively
  createEffect(() => {
    const groups = groupedResults();
    const flat = flatResults();
    const active = activeIndex();

    resultsEl.innerHTML = '';
    itemEls = [];

    if (flat.length === 0 && query().trim()) {
      resultsEl.appendChild(emptyState);
      return;
    }

    let flatIndex = 0;
    for (const [section, items] of Object.entries(groups)) {
      // Section label
      resultsEl.appendChild(
        div({ class: styles.sectionLabel }, section)
      );

      for (const item of items) {
        const isActive = flatIndex === active;
        const idx = flatIndex;

        const itemEl = div({
          class: `${styles.item} ${isActive ? styles.itemActive : ''}`,
          onmouseenter: () => setActiveIndex(idx),
          onclick: () => selectItem(item),
        },
          div({ class: styles.itemIcon },
            icon(item.icon, { size: '16px' }),
          ),
          div({ class: styles.itemContent },
            div({ class: styles.itemTitle }, item.title),
          ),
          icon('arrow-right', { size: '14px', class: `${styles.itemArrow} ${isActive ? '_opacity100' : ''}` }),
        );

        itemEls.push(itemEl);
        resultsEl.appendChild(itemEl);

        // Scroll active item into view
        if (isActive) {
          requestAnimationFrame(() => {
            itemEl.scrollIntoView({ block: 'nearest' });
          });
        }

        flatIndex++;
      }
    }
  });

  // Toggle visibility
  createEffect(() => {
    const open = isOpen();
    overlay.style.display = open ? 'flex' : 'none';
    if (open) {
      inputEl.value = '';
      setQuery('');
      requestAnimationFrame(() => inputEl.focus());
    }
  });

  container.appendChild(inputWrap);
  container.appendChild(resultsEl);
  overlay.appendChild(container);

  return overlay;
}

// ── Trigger button for mobile/visual access ─────────────────────────
export function CommandPaletteTrigger({ onClick } = {}) {
  const btn = div({
    class: css('_flex _aic _gap2 _px3 _py2 _r1 _bgmuted/30 _border _bcborder/50 _cursor[pointer] _trans[all_0.15s] _h:bgmuted/50'),
    onclick: onClick,
  },
    icon('search', { size: '14px', class: css('_fgmutedfg') }),
    span({ class: css('_textsm _fgmutedfg _flex1') }, 'Search...'),
    kbd({ class: css('_px1 _py[2px] _r1 _bgmuted _textsm _fgmutedfg _font[var(--d-font-mono)]') }, '\u2318K'),
  );
  return btn;
}
