import { createSignal, createEffect, createMemo } from 'decantr/state';
import { tags } from 'decantr/tags';
import { link, useRoute } from 'decantr/router';
import { Input } from 'decantr/components';
import { wbPath } from './path-prefix.js';

import { loadFoundationItems } from 'decantr/explorer/foundations.js';
import { loadAtomItems } from 'decantr/explorer/atoms.js';
import { loadTokenItems } from 'decantr/explorer/tokens.js';
import { loadComponentItems } from 'decantr/explorer/components.js';
import { loadIconItems } from 'decantr/explorer/icons.js';
import { loadChartItems } from 'decantr/explorer/charts.js';
import { loadPatternItems } from 'decantr/explorer/patterns.js';
import { loadArchetypeItems } from 'decantr/explorer/archetypes.js';
import { loadRecipeItems } from 'decantr/explorer/recipes.js';
import { loadToolItems } from 'decantr/explorer/tools.js';
import { loadShellItems } from 'decantr/explorer/shells.js';

const { div, nav, span, button } = tags;

// ─── Layer definitions ─────────────────────────────────────────
export const LAYERS = [
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
  // Strip any path prefix (e.g. /workbench) before extracting the layer
  const activeLayer = createMemo(() => {
    const path = route().path || '';
    const prefix = wbPath('');
    const stripped = prefix ? path.replace(new RegExp('^' + prefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/?'), '') : path;
    return stripped.split('/').filter(Boolean)[0] || 'components';
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
                href: wbPath(`/${layer.id}/${item.id}/${child}`),
                class: 'de-nav-child',
                activeClass: 'de-active'
              }, child)
            );
          }
        } else {
          // Simple item — direct link
          itemsContainer.appendChild(
            link({
              href: wbPath(`/${layer.id}/${item.id}`),
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
