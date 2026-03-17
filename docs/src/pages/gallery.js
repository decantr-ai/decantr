import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { createSignal, createEffect, createMemo } from 'decantr/state';
import { useRoute } from 'decantr/router';
import { Input, Chip } from 'decantr/components';
import { DocsLayout } from '../layouts/docs-layout.js';
import { ComponentDetail as ExplorerComponentDetail, loadComponentItems } from 'decantr/explorer/components.js';

const { div, h1, p, span } = tags;

// ── Category definitions ──────────────────────────────────────────
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'form', label: 'Form' },
  { id: 'layout', label: 'Layout' },
  { id: 'data', label: 'Data' },
  { id: 'feedback', label: 'Feedback' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'overlay', label: 'Overlay' },
  { id: 'typography', label: 'Typography' },
  { id: 'chart', label: 'Chart' },
];

// ── Registry loading ──────────────────────────────────────────────
let registry = null;
let componentList = [];

async function ensureRegistry() {
  if (registry) return;
  try {
    const resp = await fetch('/__decantr/registry/components.json');
    registry = await resp.json();
    componentList = Object.entries(registry.components || {}).map(([name, meta]) => ({
      name,
      group: meta.group || 'other',
      description: meta.description || '',
    }));
    componentList.sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    registry = { components: {} };
    componentList = [];
  }
}

function docsNavigate(path) {
  window.location.hash = '#/docs' + path;
}

// ── Component Card ────────────────────────────────────────────────
function ComponentCard(comp, navigateTo) {
  return div({
    class: `ds-glass ${css('_flex _col _gap2 _p4 _cursor[pointer]')}`,
    onclick: () => navigateTo(comp.name),
  },
    div({ class: css('_flex _aic _jcsb') },
      span({ class: css('_label _bold _fgfg') }, comp.name),
      Chip({ label: comp.group, variant: 'outline', size: 'sm' }),
    ),
    p({ class: css('_caption _fgmutedfg _clamp2') }, comp.description),
  );
}

// ── Gallery List ──────────────────────────────────────────────────
function GalleryList(navigateTo) {
  const [search, setSearch] = createSignal('');
  const [category, setCategory] = createSignal('all');

  const filtered = createMemo(() => {
    const s = search().toLowerCase();
    const cat = category();
    return componentList.filter(c => {
      if (cat !== 'all' && c.group !== cat) return false;
      if (s && !c.name.toLowerCase().includes(s)) return false;
      return true;
    });
  });

  // Category filter chips
  const chips = div({ class: css('_flex _row _gap2 _wrap') },
    ...CATEGORIES.map(cat => {
      const chip = Chip({
        label: cat.label,
        variant: 'outline',
        size: 'sm',
        selected: category() === cat.id,
        onClick: () => setCategory(cat.id),
      });

      createEffect(() => {
        const isActive = category() === cat.id;
        if (isActive) {
          chip.classList.add('d-chip-selected');
        } else {
          chip.classList.remove('d-chip-selected');
        }
      });

      return chip;
    }),
  );

  // Grid
  const grid = div({ class: css('_grid _gc3 _gap4 _lg:gc2 _sm:gc1') });

  createEffect(() => {
    const items = filtered();
    grid.innerHTML = '';
    for (const comp of items) {
      grid.appendChild(ComponentCard(comp, navigateTo));
    }
  });

  // Count
  const countEl = span({ class: css('_caption _fgmutedfg') });
  createEffect(() => {
    countEl.textContent = `${filtered().length} component${filtered().length !== 1 ? 's' : ''}`;
  });

  return div({ class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap2') },
      h1({ class: css('_heading3') }, 'Components'),
      p({ class: css('_body _fgmutedfg') }, 'Browse all 100+ built-in UI components. Click any component for props, usage, and examples.'),
    ),
    div({ class: css('_flex _col _gap3') },
      Input({
        placeholder: 'Search components...',
        oninput: (e) => setSearch(e.target.value),
      }),
      chips,
      countEl,
    ),
    grid,
  );
}

// ── Page Entry Point ──────────────────────────────────────────────
export function GalleryPage() {
  const route = useRoute();
  const content = div({});
  content.textContent = 'Loading components...';

  ensureRegistry().then(() => {
    content.textContent = '';
    const id = route().params.id;
    if (id) {
      // Delegate to explorer module for full live showcases, props table, and usage links
      content.appendChild(ExplorerComponentDetail(id, docsNavigate));
    } else {
      content.appendChild(GalleryList((name) => {
        window.location.hash = `#/docs/components/${name}`;
      }));
    }
  });

  return DocsLayout(content);
}
