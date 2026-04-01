import { h } from '@decantr/ui/runtime';
import { createSignal, createEffect } from '@decantr/ui/state';
import { getAllStories, getStory } from '@decantr/ui-catalog';
import { Sidebar } from './shell/sidebar.js';
import { Toolbar } from './shell/toolbar.js';
import { IsolationView } from './views/isolation.js';
import { PlaygroundView } from './views/playground.js';
import { CSSPanel } from './panels/css-panel.js';

export function App() {
  const stories = getAllStories();
  const [selectedSlug, setSelectedSlug] = createSignal(stories.length > 0 ? stories[0].slug : null);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [viewMode, setViewMode] = createSignal('isolation');

  // Tab buttons for view switching
  const tabBtnStyle = (active) =>
    `padding: 6px 14px; font-size: 13px; cursor: pointer; border: none; border-bottom: 2px solid ${active ? 'var(--color-primary, #3b82f6)' : 'transparent'}; background: none; color: ${active ? 'inherit' : 'rgba(255,255,255,0.5)'}`;

  const isolationBtn = h('button', { style: tabBtnStyle(true) }, 'Isolation');
  const playgroundBtn = h('button', { style: tabBtnStyle(false) }, 'Playground');

  isolationBtn.addEventListener('click', () => setViewMode('isolation'));
  playgroundBtn.addEventListener('click', () => setViewMode('playground'));

  createEffect(() => {
    const mode = viewMode();
    isolationBtn.style.cssText = tabBtnStyle(mode === 'isolation');
    playgroundBtn.style.cssText = tabBtnStyle(mode === 'playground');
  });

  const tabBar = h(
    'div',
    { style: 'display: flex; gap: 0; border-bottom: 1px solid rgba(255,255,255,0.1); padding: 0 16px' },
    isolationBtn,
    playgroundBtn,
  );

  // Main content area that re-renders when selection or view mode changes
  const mainContent = h('div', { style: 'flex: 1; overflow: auto' });

  createEffect(() => {
    const slug = selectedSlug();
    const mode = viewMode();
    mainContent.innerHTML = '';
    if (slug) {
      const story = getStory(slug);
      if (story) {
        if (mode === 'playground') {
          mainContent.appendChild(PlaygroundView({ story }));
        } else {
          mainContent.appendChild(IsolationView({ story }));
        }
      }
    }
  });

  const mainPanel = h('div', { style: 'flex: 1; display: flex; flex-direction: column; overflow: hidden' },
    tabBar,
    mainContent,
  );

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
