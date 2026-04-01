import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
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
    class: css('_flex _col _overflow-auto _border-r _border-subtle _bg-surface'),
    style: 'width: 220px',
  });

  const searchBox = h('div', { class: css('_p-2') }, Search({ onSearch }));
  container.appendChild(searchBox);

  const content = h('div', { class: css('_flex-1 _overflow-auto') });
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
