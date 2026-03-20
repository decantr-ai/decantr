import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect, createMemo } from 'decantr/state';
import { onDestroy } from 'decantr/core';
import { link, useRoute } from 'decantr/router';
import { icon } from 'decantr/components';
import { CommandPaletteTrigger } from './docs-command-palette.js';

const { div, nav, span, button, kbd } = tags;

// ── Navigation structure (prompt-first curriculum) ─────────────────
const NAV_SECTIONS = [
  {
    id: 'start',
    label: 'Start Here',
    highlight: true,
    items: [
      { id: 'quick-setup', label: 'Quick Setup', path: '/docs/quick-setup', icon: 'zap' },
      { id: 'first-prompt', label: 'Your First Prompt', path: '/docs/first-prompt', icon: 'message-square' },
      { id: 'decantation', label: 'The Decantation Process', path: '/docs/decantation', icon: 'wine' },
    ],
  },
  {
    id: 'building',
    label: 'Building',
    collapsible: true,
    items: [
      { id: 'adding-pages', label: 'Adding Pages', path: '/docs/building/pages', icon: 'file' },
      { id: 'adding-features', label: 'Adding Features', path: '/docs/building/features', icon: 'sparkles' },
      { id: 'prompt-patterns', label: 'Prompt Patterns', path: '/docs/building/prompts', icon: 'lightbulb' },
      { id: 'working-essence', label: 'Working with Essence', path: '/docs/building/essence', icon: 'file-code' },
    ],
  },
  {
    id: 'styling',
    label: 'Styling',
    collapsible: true,
    items: [
      { id: 'themes-recipes', label: 'Themes & Recipes', path: '/docs/styling/themes', icon: 'palette' },
      { id: 'customizing-colors', label: 'Customizing Colors', path: '/docs/styling/colors', icon: 'droplet' },
      { id: 'visual-effects', label: 'Visual Effects', path: '/docs/styling/effects', icon: 'wand' },
    ],
  },
  {
    id: 'customizing',
    label: 'Customizing',
    collapsible: true,
    items: [
      { id: 'creating-patterns', label: 'Creating Patterns', path: '/docs/customizing/patterns', icon: 'puzzle' },
      { id: 'creating-themes', label: 'Creating Themes', path: '/docs/customizing/themes', icon: 'brush' },
      { id: 'publishing', label: 'Publishing to Registry', path: '/docs/customizing/publishing', icon: 'package' },
    ],
  },
  {
    id: 'reference',
    label: 'Reference',
    collapsible: true,
    dividerBefore: true,
    items: [
      { id: 'ref-components', label: 'Components', path: '/explorer/components', icon: 'blocks' },
      { id: 'ref-patterns', label: 'Patterns', path: '/explorer/patterns', icon: 'layout-grid' },
      { id: 'ref-atoms', label: 'Atoms & Tokens', path: '/explorer/atoms', icon: 'grid-3x3' },
      { id: 'ref-api', label: 'API', path: '/explorer/foundations', icon: 'code' },
    ],
  },
];

// ── Styles ──────────────────────────────────────────────────────────
const styles = {
  sidebar: css('_flex _col _h100 _bgbg'),
  searchWrap: css('_px3 _pt3 _pb2'),
  searchInput: css('_w100'),
  nav: css('_flex _col _gap1 _py2 _px2 _flex1 _overflow[auto]'),
  divider: css('_h[1px] _mx3 _my2 _bg[linear-gradient(90deg,transparent,var(--c-border),transparent)]'),
  sectionHeader: css('_flex _aic _jcsb _px2 _py1 _r1 _cursor[pointer] _trans[background_0.15s] _select[none]'),
  sectionHeaderHover: '_h:bgmuted/20',
  sectionLabel: css('_caption _fgmutedfg _uppercase _ls[0.06em] _fw[600]'),
  sectionLabelHighlight: css('_fgprimary'),
  sectionChevron: css('_fgmutedfg _trans[transform_0.2s]'),
  sectionChevronOpen: css('_rot[90deg]'),
  sectionItems: css('_flex _col _gap0 _overflow[hidden] _trans[max-height_0.25s_ease,opacity_0.2s]'),
  sectionItemsCollapsed: css('_mh0 _op0'),
  navItem: css('_flex _aic _gap2 _px3 _py2 _r1 _textsm _nounder _fgmutedfg _trans[all_0.15s] _cursor[pointer]'),
  navItemHover: '_h:bgmuted/30 _h:fgfg',
  navItemActive: css('_bgprimary/15 _fgprimary _shadow[0_0_12px_var(--c-primary)/30,inset_0_0_0_1px_var(--c-primary)/20]'),
  navItemIcon: css('_w[18px] _h[18px] _shrink0'),
  highlightBar: css('_absolute _left0 _top0 _bottom0 _w[3px] _bgprimary _r[0_2px_2px_0]'),
};

// ── Section Accordion ───────────────────────────────────────────────
function SectionAccordion({ section, query, route }) {
  const [isOpen, setIsOpen] = createSignal(!section.collapsible);

  // Check if any item in section matches current route
  const hasActiveItem = createMemo(() => {
    const currentPath = route().path;
    return section.items.some(item =>
      currentPath === item.path || currentPath.startsWith(item.path + '/')
    );
  });

  // Auto-expand if has active item
  createEffect(() => {
    if (hasActiveItem()) setIsOpen(true);
  });

  // Filter items by search query
  const visibleItems = createMemo(() => {
    const q = query().toLowerCase();
    if (!q) return section.items;
    return section.items.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.id.includes(q)
    );
  });

  // Hide section if no items match
  const isVisible = createMemo(() => visibleItems().length > 0);

  const container = div({ class: css('_flex _col') });

  // Divider before (for Reference section)
  if (section.dividerBefore) {
    container.appendChild(div({ class: styles.divider }));
  }

  // Section header (clickable for collapsible sections)
  const headerClasses = section.collapsible
    ? `${styles.sectionHeader} ${styles.sectionHeaderHover}`
    : styles.sectionHeader;

  const labelClasses = section.highlight
    ? `${styles.sectionLabel} ${styles.sectionLabelHighlight}`
    : styles.sectionLabel;

  const header = div({ class: headerClasses },
    span({ class: labelClasses }, section.label),
  );

  // Add chevron for collapsible sections
  let chevronEl;
  if (section.collapsible) {
    chevronEl = icon('chevron-right', { size: '14px', class: styles.sectionChevron });
    header.appendChild(chevronEl);
    header.onclick = () => setIsOpen(!isOpen());
  }

  container.appendChild(header);

  // Items container
  const itemsContainer = div({ class: styles.sectionItems });
  container.appendChild(itemsContainer);

  // Render nav items
  for (const item of section.items) {
    const navLink = link({
      href: item.path,
      class: `${styles.navItem} ${styles.navItemHover}`,
    },
      icon(item.icon, { size: '16px', class: styles.navItemIcon }),
      span(item.label),
    );

    // Track active state
    createEffect(() => {
      const currentPath = route().path;
      const isActive = currentPath === item.path ||
        (item.path !== '/docs' && currentPath.startsWith(item.path + '/'));
      navLink.classList.toggle(styles.navItemActive.split(' ')[0], isActive);
      if (isActive) {
        // Apply glow effect classes
        navLink.className = `${styles.navItem} ${styles.navItemActive}`;
      } else {
        navLink.className = `${styles.navItem} ${styles.navItemHover}`;
      }
    });

    // Filter visibility
    createEffect(() => {
      const q = query().toLowerCase();
      const matches = !q || item.label.toLowerCase().includes(q) || item.id.includes(q);
      navLink.style.display = matches ? '' : 'none';
    });

    itemsContainer.appendChild(navLink);
  }

  // Toggle collapsed state
  createEffect(() => {
    const open = isOpen();
    if (section.collapsible) {
      if (open) {
        itemsContainer.classList.remove(...styles.sectionItemsCollapsed.split(' '));
        itemsContainer.style.maxHeight = `${section.items.length * 44}px`;
        itemsContainer.style.opacity = '1';
      } else {
        itemsContainer.style.maxHeight = '0';
        itemsContainer.style.opacity = '0';
      }
      // Rotate chevron
      if (chevronEl) {
        chevronEl.style.transform = open ? 'rotate(90deg)' : 'rotate(0deg)';
      }
    }
  });

  // Section visibility based on search
  createEffect(() => {
    container.style.display = isVisible() ? '' : 'none';
  });

  return container;
}

// ── Main Sidebar Component ──────────────────────────────────────────
export function DocsSidebar({ onSearch } = {}) {
  const route = useRoute();
  const [query, setQuery] = createSignal('');

  const sidebar = div({ class: styles.sidebar });

  // Search trigger (opens command palette)
  const searchWrap = div({ class: styles.searchWrap });
  const searchTrigger = CommandPaletteTrigger({
    onClick: () => {
      // Trigger Cmd+K programmatically
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
      if (onSearch) onSearch();
    },
  });

  searchWrap.appendChild(searchTrigger);
  sidebar.appendChild(searchWrap);

  // Navigation
  const navEl = nav({ class: styles.nav });

  for (const section of NAV_SECTIONS) {
    navEl.appendChild(SectionAccordion({ section, query, route }));
  }

  sidebar.appendChild(navEl);

  return sidebar;
}
