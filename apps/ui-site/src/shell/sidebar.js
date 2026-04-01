import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { navigate, useRoute } from '@decantr/ui/router';
import { getCategories, searchStories } from '@decantr/ui-catalog';
import { Input } from '@decantr/ui/components';

/**
 * Sidebar for the components/charts section.
 * Renders a collapsible category tree with search.
 * @param {{ baseUrl?: string }} props
 */
export function Sidebar({ baseUrl = '/components' } = {}) {
  const [query, setQuery] = createSignal('');
  const [expanded, setExpanded] = createSignal(new Set());
  const route = useRoute();

  const container = h('aside', {
    style: 'width: 240px; min-width: 240px; border-right: 1px solid rgba(255,255,255,0.1); background: var(--color-surface, #111); overflow-y: auto; display: flex; flex-direction: column; height: 100%',
  });

  // Search box
  const searchBox = h('div', { style: 'padding: 12px' });
  searchBox.appendChild(Input({
    placeholder: 'Search...',
    size: 'sm',
    onInput: (e) => setQuery(e.target.value),
  }));
  container.appendChild(searchBox);

  // Scrollable content
  const content = h('div', { style: 'flex: 1; overflow-y: auto; padding-bottom: 16px' });
  container.appendChild(content);

  createEffect(() => {
    content.innerHTML = '';
    const q = query();
    const currentRoute = route();
    const currentSlug = currentRoute.params?.slug || '';

    if (q) {
      // Search mode — flat list of matches
      const results = searchStories(q);
      for (const story of results) {
        const isActive = currentSlug === story.slug;
        const item = h('div', {
          style: `padding: 6px 16px; cursor: pointer; font-size: 13px; border-radius: 4px; margin: 1px 8px; ${isActive ? 'background: var(--color-primary, #4a9eff); color: #fff;' : 'color: rgba(255,255,255,0.75);'}`,
          onclick: () => navigate(`${baseUrl}/${story.slug}`),
        }, story.title);
        content.appendChild(item);
      }
      if (results.length === 0) {
        content.appendChild(h('div', { style: 'padding: 12px 16px; font-size: 13px; color: rgba(255,255,255,0.4)' }, 'No results'));
      }
    } else {
      // Category tree mode
      const categories = getCategories();
      const exp = expanded();

      for (const cat of categories) {
        const isExpanded = exp.has(cat.category);
        const header = h('div', {
          style: 'padding: 8px 12px; cursor: pointer; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; color: rgba(255,255,255,0.5); user-select: none',
          onclick: () => {
            const next = new Set(expanded());
            if (next.has(cat.category)) {
              next.delete(cat.category);
            } else {
              next.add(cat.category);
            }
            setExpanded(next);
          },
        }, `${isExpanded ? '\u25BE' : '\u25B8'} ${cat.category} (${cat.stories.length})`);
        content.appendChild(header);

        if (isExpanded) {
          for (const story of cat.stories) {
            const isActive = currentSlug === story.slug;
            const item = h('div', {
              style: `padding: 5px 16px 5px 24px; cursor: pointer; font-size: 13px; border-radius: 4px; margin: 1px 8px; ${isActive ? 'background: var(--color-primary, #4a9eff); color: #fff;' : 'color: rgba(255,255,255,0.75);'}`,
              onclick: () => navigate(`${baseUrl}/${story.slug}`),
            }, story.title);
            content.appendChild(item);
          }
        }
      }
    }
  });

  return container;
}
