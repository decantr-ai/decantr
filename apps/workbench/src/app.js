import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { getAllStories, getStory } from '@decantr/ui-catalog';
import { Sidebar } from './shell/sidebar.js';
import { Toolbar } from './shell/toolbar.js';
import { IsolationView } from './views/isolation.js';
import { CSSPanel } from './panels/css-panel.js';

export function App() {
  const stories = getAllStories();
  const [selectedSlug, setSelectedSlug] = createSignal(stories.length > 0 ? stories[0].slug : null);
  const [searchQuery, setSearchQuery] = createSignal('');

  // Main content area that re-renders when selection changes
  const mainPanel = h('div', { style: 'flex: 1; overflow: auto' });

  createEffect(() => {
    const slug = selectedSlug();
    mainPanel.innerHTML = '';
    if (slug) {
      const story = getStory(slug);
      if (story) {
        mainPanel.appendChild(IsolationView({ story }));
      }
    }
  });

  return h('div', { style: 'display: flex; flex-direction: column; height: 100%' },
    Toolbar({ searchQuery, setSearchQuery }),
    h('div', { style: 'display: flex; flex: 1; overflow: hidden' },
      Sidebar({ onSelect: setSelectedSlug, selectedSlug, searchQuery, onSearch: setSearchQuery }),
      mainPanel,
      h('aside', { style: 'width: 260px; border-left: 1px solid var(--color-border, rgba(255,255,255,0.1)); background: var(--color-surface, #1a1a1a); overflow: auto' },
        CSSPanel()
      )
    )
  );
}
