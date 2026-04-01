import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { css } from '@decantr/css';
import { navigate } from '@decantr/ui/router';
import { getCategories } from '@decantr/ui-catalog';
import { Card, Input } from '@decantr/ui/components';

export function ChartsIndex() {
  const [query, setQuery] = createSignal('');

  const container = h('div', { class: css('_flex _col _gap6 _p6 _max-w-6xl _mx-auto') });

  // Page header
  const header = h('div', { class: css('_flex _col _gap2 _mb2') });
  header.appendChild(h('h1', { class: css('_text-3xl _font-bold') }, 'Charts'));
  header.appendChild(h('p', { class: css('_text-muted _text-lg') }, 'Explore the chart library. Click any chart to see variants, usage examples, and live demos.'));
  container.appendChild(header);

  // Search input
  const searchWrap = h('div', { class: css('_mb2') });
  const searchInput = Input({
    placeholder: 'Search charts...',
    type: 'text',
    oninput: (e) => setQuery(e.target.value),
  });
  searchWrap.appendChild(searchInput);
  container.appendChild(searchWrap);

  // Grid container for chart cards
  const grid = h('div', {
    class: css('_grid _gap4'),
    style: 'grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))',
  });
  container.appendChild(grid);

  // Reactive rendering
  createEffect(() => {
    const q = query().trim().toLowerCase();
    grid.innerHTML = '';

    // Get chart categories (category === 'charts')
    const chartCategories = getCategories().filter(c => c.category === 'charts');
    const allCharts = chartCategories.flatMap(c => c.stories);

    if (allCharts.length === 0) {
      grid.appendChild(h('p', { class: css('_text-muted _p4') }, 'No charts registered in the catalog.'));
      return;
    }

    // Filter by search query
    const filtered = q
      ? allCharts.filter(s =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q))
      : allCharts;

    if (filtered.length === 0) {
      grid.appendChild(h('p', { class: css('_text-muted _p4') }, `No charts match "${query()}".`));
      return;
    }

    for (const story of filtered) {
      const card = Card({
        class: css('_flex _col _gap2 _p4 _cursor-pointer _hover:shadow-md _transition'),
        onclick: () => navigate(`/charts/${story.slug}`),
      });

      card.appendChild(h('h3', { class: css('_text-base _font-semibold') }, story.title));
      card.appendChild(h('p', { class: css('_text-sm _text-muted _line-clamp-2') }, story.description));

      grid.appendChild(card);
    }
  });

  return container;
}
