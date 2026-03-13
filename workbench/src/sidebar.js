import { createSignal, createEffect, createMemo } from 'decantr/state';
import { tags } from 'decantr/tags';
import { link, useRoute } from 'decantr/router';
import { Input } from 'decantr/components';

import { loadFoundationItems } from './explorer/foundations.js';
import { loadAtomItems } from './explorer/atoms.js';
import { loadTokenItems } from './explorer/tokens.js';
import { loadComponentItems } from './explorer/components.js';
import { loadIconItems } from './explorer/icons.js';
import { loadChartItems } from './explorer/charts.js';
import { loadPatternItems } from './explorer/patterns.js';
import { loadArchetypeItems } from './explorer/archetypes.js';
import { loadRecipeItems } from './explorer/recipes.js';

const { div, nav, span, button } = tags;

// ─── Layer definitions ─────────────────────────────────────────
export const LAYERS = [
  { id: 'components', label: 'Components' },
  { id: 'icons', label: 'Icons' },
  { id: 'charts', label: 'Charts' },
  { id: 'patterns', label: 'Patterns' },
  { id: 'archetypes', label: 'Archetypes' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'foundations', label: 'Foundations' },
  { id: 'atoms', label: 'Atoms' },
  { id: 'tokens', label: 'Tokens' },
];

// ─── Sidebar data loading ──────────────────────────────────────
const [sidebarData, setSidebarData] = createSignal({});

export function getSidebarItems(layer) {
  return sidebarData()[layer] || [];
}

export async function loadAllSidebarItems() {
  const loaders = {
    foundations: loadFoundationItems,
    atoms: loadAtomItems,
    tokens: loadTokenItems,
    components: loadComponentItems,
    icons: loadIconItems,
    charts: loadChartItems,
    patterns: loadPatternItems,
    archetypes: loadArchetypeItems,
    recipes: loadRecipeItems,
  };
  const entries = await Promise.all(
    Object.entries(loaders).map(async ([k, fn]) => [k, await fn()])
  );
  setSidebarData(Object.fromEntries(entries));
}

// ─── Search index ──────────────────────────────────────────────

export const searchIndex = createMemo(() => {
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

// ─── Expanded groups state ─────────────────────────────────────
const expandedGroups = new Set();

// ─── SidebarNav component ──────────────────────────────────────

export function SidebarNav() {
  const route = useRoute();
  const [filter, setFilter] = createSignal('');

  // Derive active layer from route to auto-expand
  const activeLayer = createMemo(() => {
    const path = route().path || '';
    return path.split('/').filter(Boolean)[0] || 'components';
  });

  // Auto-expand active layer on first load
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

      // Filter items
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

      // Filter children within groups when searching
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

      // Layer header — toggles expand/collapse
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

      // Items within layer
      for (const item of filteredItems) {
        if (item.children) {
          // Component group — group label + child links
          itemsContainer.appendChild(
            div({ class: 'de-nav-group-label' }, item.label)
          );
          for (const child of item.children) {
            itemsContainer.appendChild(
              link({
                href: `/${layer.id}/${item.id}/${child}`,
                class: 'de-nav-child',
                activeClass: 'de-active'
              }, child)
            );
          }
        } else {
          // Simple item — direct link
          itemsContainer.appendChild(
            link({
              href: `/${layer.id}/${item.id}`,
              class: 'de-nav-child',
              activeClass: 'de-active'
            }, item.label)
          );
        }
      }
    }
  }

  // Rebuild when data or filter changes
  createEffect(() => { sidebarData(); filter(); buildNav(); });

  return nav({ class: 'de-sidebar', 'aria-label': 'Explorer navigation' },
    div({ class: 'de-sidebar-search' }, filterInput),
    itemsContainer
  );
}
