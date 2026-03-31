import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { Input } from '@decantr/ui/components';
import { getCategories, searchStories } from '@decantr/ui-catalog';

function Search({ onSearch }) {
  return Input({
    placeholder: 'Search components...',
    size: 'sm',
    onInput: (e) => onSearch(e.target.value),
  });
}

export function Sidebar({ onSelect, selectedSlug, searchQuery, onSearch }) {
  const [expanded, setExpanded] = createSignal(new Set());

  const container = h('div', {
    style: 'width: 220px; border-right: 1px solid var(--color-border, rgba(255,255,255,0.1)); background: var(--color-surface, #1a1a1a); overflow: auto; display: flex; flex-direction: column',
  });

  const searchBox = h('div', { style: 'padding: 8px' }, Search({ onSearch }));
  container.appendChild(searchBox);

  const content = h('div', { style: 'flex: 1; overflow: auto' });
  container.appendChild(content);

  createEffect(() => {
    content.innerHTML = '';
    const query = searchQuery();

    if (query) {
      const results = searchStories(query);
      for (const story of results) {
        const isSelected = selectedSlug() === story.slug;
        const item = h('div', {
          style: `padding: 4px 12px; cursor: pointer; font-size: 13px; ${isSelected ? 'background: var(--color-primary, #4a9eff); color: #fff;' : ''}`,
          onclick: () => onSelect(story.slug),
        }, story.title);
        content.appendChild(item);
      }
    } else {
      const categories = getCategories();
      const exp = expanded();

      for (const cat of categories) {
        const isExpanded = exp.has(cat.name);
        const header = h('div', {
          style: 'padding: 6px 8px; cursor: pointer; font-weight: 600; font-size: 13px; user-select: none',
          onclick: () => {
            const next = new Set(expanded());
            if (next.has(cat.name)) {
              next.delete(cat.name);
            } else {
              next.add(cat.name);
            }
            setExpanded(next);
          },
        }, `${isExpanded ? '\u25BE' : '\u25B8'} ${cat.name} (${cat.stories.length})`);
        content.appendChild(header);

        if (isExpanded) {
          for (const story of cat.stories) {
            const isSelected = selectedSlug() === story.slug;
            const item = h('div', {
              style: `padding: 4px 12px 4px 20px; cursor: pointer; font-size: 13px; ${isSelected ? 'background: var(--color-primary, #4a9eff); color: #fff;' : ''}`,
              onclick: () => onSelect(story.slug),
            }, story.title);
            content.appendChild(item);
          }
        }
      }
    }
  });

  return container;
}
