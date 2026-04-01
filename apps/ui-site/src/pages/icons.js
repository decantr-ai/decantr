import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { getIconNames } from '@decantr/ui/icons';
import { icon, Input, Badge } from '@decantr/ui/components';

const PAGE_STYLE = 'max-width: 960px; margin: 0 auto; padding: 48px 24px';
const HEADING_STYLE = 'font-size: 32px; font-weight: 700; margin: 0 0 8px';
const SUB_STYLE = 'font-size: 14px; color: var(--d-muted-fg, rgba(255,255,255,0.5)); margin: 0 0 24px';
const GRID_STYLE = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 8px';
const CELL_STYLE = 'display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px; border-radius: var(--d-radius-md, 8px); background: var(--d-surface-1, rgba(255,255,255,0.04)); cursor: pointer; border: 1px solid transparent; transition: border-color 0.15s, background 0.15s';
const CELL_HOVER = 'border-color: var(--d-border, rgba(255,255,255,0.1)); background: var(--d-surface-2, rgba(255,255,255,0.08))';
const LABEL_STYLE = 'font-size: 11px; color: var(--d-muted-fg, rgba(255,255,255,0.5)); text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%';
const COPIED_STYLE = 'position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--d-accent, #7c3aed); color: white; padding: 8px 20px; border-radius: var(--d-radius-md, 8px); font-size: 13px; font-weight: 500; z-index: 1000; transition: opacity 0.3s';

export function Icons() {
  const allNames = getIconNames();
  const [getQuery, setQuery] = createSignal('');
  const [getSelected, setSelected] = createSignal(null);

  const container = h('div', { style: PAGE_STYLE });

  // Header
  container.appendChild(h('h1', { style: HEADING_STYLE }, 'Icons'));
  const subtitle = h('p', { style: SUB_STYLE });
  container.appendChild(subtitle);

  // Search
  const searchRow = h('div', { style: 'margin-bottom: 24px' });
  const input = Input({
    placeholder: 'Search icons...',
    size: 'md',
    oninput(e) { setQuery(e.target.value.toLowerCase()); },
  });
  searchRow.appendChild(input);
  container.appendChild(searchRow);

  // Grid container
  const grid = h('div', { style: GRID_STYLE });
  container.appendChild(grid);

  // Copied toast
  const toast = h('div', { style: COPIED_STYLE + '; opacity: 0; pointer-events: none' });
  container.appendChild(toast);
  let toastTimer = null;

  function showCopied(name) {
    toast.textContent = `Copied "${name}"`;
    toast.style.opacity = '1';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 1500);
  }

  function copyName(name) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(name).then(() => showCopied(name));
    } else {
      setSelected(name);
      showCopied(name);
    }
  }

  // Render filtered grid
  createEffect(() => {
    const query = getQuery();
    const filtered = query
      ? allNames.filter(n => n.includes(query))
      : allNames;

    subtitle.textContent = `${filtered.length} of ${allNames.length} icons`;

    grid.innerHTML = '';
    for (const name of filtered) {
      const cell = h('div', {
        style: CELL_STYLE,
        title: name,
        onclick() { copyName(name); },
        onmouseenter() { this.style.cssText = CELL_STYLE + '; ' + CELL_HOVER; },
        onmouseleave() { this.style.cssText = CELL_STYLE; },
      });
      cell.appendChild(icon(name, { size: '24px' }));
      cell.appendChild(h('span', { style: LABEL_STYLE }, name));
      grid.appendChild(cell);
    }
  });

  return container;
}
