import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { createSignal, createEffect } from '@decantr/ui/state';
import { getAllStories, getStory } from '@decantr/ui-catalog';
import { Sidebar } from './shell/sidebar.js';
import { Toolbar } from './shell/toolbar.js';
import { IsolationView } from './views/isolation.js';
import { PlaygroundView } from './views/playground.js';
import { ExplorerView } from './views/explorer.js';
import { CSSPanel } from './panels/css-panel.js';

export function App() {
  const stories = getAllStories();
  const [selectedSlug, setSelectedSlug] = createSignal(stories.length > 0 ? stories[0].slug : null);
  const [searchQuery, setSearchQuery] = createSignal('');
  const [viewMode, setViewMode] = createSignal('isolation');

  // Tab buttons for view switching — dynamic border/color stays inline
  const tabBtnStyle = (active) =>
    `padding: 6px 14px; font-size: 13px; cursor: pointer; border: none; border-bottom: 2px solid ${active ? 'var(--color-primary, #3b82f6)' : 'transparent'}; background: none; color: ${active ? 'inherit' : 'rgba(255,255,255,0.5)'}`;

  const isolationBtn = h('button', { style: tabBtnStyle(true) }, 'Isolation');
  const playgroundBtn = h('button', { style: tabBtnStyle(false) }, 'Playground');
  const explorerBtn = h('button', { style: tabBtnStyle(false) }, 'Explorer');

  isolationBtn.addEventListener('click', () => setViewMode('isolation'));
  playgroundBtn.addEventListener('click', () => setViewMode('playground'));
  explorerBtn.addEventListener('click', () => setViewMode('explorer'));

  createEffect(() => {
    const mode = viewMode();
    isolationBtn.style.cssText = tabBtnStyle(mode === 'isolation');
    playgroundBtn.style.cssText = tabBtnStyle(mode === 'playground');
    explorerBtn.style.cssText = tabBtnStyle(mode === 'explorer');
  });

  const tabBar = h(
    'div',
    { class: css('_flex _border-b _border-subtle _px-4') },
    isolationBtn,
    playgroundBtn,
    explorerBtn,
  );

  // Main content area that re-renders when selection or view mode changes
  const mainContent = h('div', { class: css('_flex-1 _overflow-auto') });

  createEffect(() => {
    const slug = selectedSlug();
    const mode = viewMode();
    mainContent.innerHTML = '';
    if (mode === 'explorer') {
      mainContent.appendChild(ExplorerView());
    } else if (slug) {
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

  const mainPanel = h('div', { class: css('_flex-1 _flex _col _overflow-hidden') },
    tabBar,
    mainContent,
  );

  return h('div', { class: css('_flex _col _h-screen') },
    Toolbar({ searchQuery, setSearchQuery }),
    h('div', { class: css('_flex _flex-1 _overflow-hidden') },
      Sidebar({ onSelect: setSelectedSlug, selectedSlug, searchQuery, onSearch: setSearchQuery }),
      mainPanel,
      h('aside', { class: css('_w-64 _border-l _border-subtle _bg-surface _overflow-auto') },
        CSSPanel()
      )
    )
  );
}
