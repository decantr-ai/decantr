import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { css } from '@decantr/css';
import { navigate } from '@decantr/ui/router';
import { getCategories, searchStories } from '@decantr/ui-catalog';
import { Card, Badge, Input } from '@decantr/ui/components';

export function ComponentsIndex() {
  const [query, setQuery] = createSignal('');

  const container = h('div', { class: css('_flex _col _gap6 _p6 _max-w-6xl _mx-auto') });

  // Page header
  const header = h('div', { class: css('_flex _col _gap2 _mb2') });
  header.appendChild(h('h1', { class: css('_text-3xl _font-bold') }, 'Components'));
  header.appendChild(h('p', { class: css('_text-muted _text-lg') }, 'Browse the full component library. Click any component to see variants, usage, and a live playground.'));
  container.appendChild(header);

  // Search input
  const searchWrap = h('div', { class: css('_mb2') });
  const searchInput = Input({
    placeholder: 'Search components...',
    type: 'text',
    oninput: (e) => setQuery(e.target.value),
  });
  searchWrap.appendChild(searchInput);
  container.appendChild(searchWrap);

  // Grid container for category cards
  const grid = h('div', {
    class: css('_grid _gap6'),
    style: 'grid-template-columns: repeat(auto-fill, minmax(320px, 1fr))',
  });
  container.appendChild(grid);

  // Reactive rendering
  createEffect(() => {
    const q = query().trim().toLowerCase();
    grid.innerHTML = '';

    // Get component categories (starting with 'components/')
    const categories = getCategories().filter(c => c.category.startsWith('components/'));

    if (categories.length === 0) {
      grid.appendChild(h('p', { class: css('_text-muted _p4') }, 'No components registered in the catalog.'));
      return;
    }

    let hasResults = false;

    for (const { category, stories } of categories) {
      // Filter stories by search query
      const filtered = q
        ? stories.filter(s =>
            s.title.toLowerCase().includes(q) ||
            s.description.toLowerCase().includes(q))
        : stories;

      if (filtered.length === 0) continue;
      hasResults = true;

      // Category display name — strip 'components/' prefix and capitalize
      const catName = category.replace('components/', '').replace(/(^|\-)(\w)/g, (_, sep, c) => (sep ? ' ' : '') + c.toUpperCase());

      const card = Card({
        class: css('_flex _col _gap3 _p5 _cursor-default'),
      });

      // Card header
      const cardHeader = h('div', { class: css('_flex _items-center _justify-between _gap2') });
      cardHeader.appendChild(h('h2', { class: css('_text-lg _font-semibold') }, catName));
      cardHeader.appendChild(Badge({ variant: 'secondary' }, `${filtered.length}`));
      card.appendChild(cardHeader);

      // Story list
      const list = h('div', { class: css('_flex _col _gap1') });
      for (const story of filtered) {
        const item = h('button', {
          class: css('_text-left _px3 _py2 _rounded _text-sm _hover:bg-subtle _transition _cursor-pointer _border-none _bg-transparent _w-full'),
          onclick: () => navigate(`/components/${story.slug}`),
        });
        const titleRow = h('div', { class: css('_flex _items-center _gap2') });
        titleRow.appendChild(h('span', { class: css('_font-medium') }, story.title));
        item.appendChild(titleRow);
        list.appendChild(item);
      }
      card.appendChild(list);

      grid.appendChild(card);
    }

    if (!hasResults) {
      grid.appendChild(h('p', { class: css('_text-muted _p4') }, `No components match "${query()}".`));
    }
  });

  return container;
}
