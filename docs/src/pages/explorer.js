import { tags } from 'decantr/tags';
import { css } from 'decantr/css';
import { useRoute } from 'decantr/router';
import { Card } from 'decantr/components';
import { injectExplorerCSS } from 'decantr/explorer/styles.js';
import { DocsLayout } from '../layouts/docs-layout.js';

injectExplorerCSS();

const { div, p, h1 } = tags;

// Map route paths to explorer modules — single source of truth from decantr/explorer
const EXPLORER_MAP = {
  patterns: () => import('decantr/explorer/patterns.js'),
  icons: () => import('decantr/explorer/icons.js'),
  tokens: () => import('decantr/explorer/tokens.js'),
  foundations: () => import('decantr/explorer/foundations.js'),
  archetypes: () => import('decantr/explorer/archetypes.js'),
  charts: () => import('decantr/explorer/charts.js'),
  shells: () => import('decantr/explorer/shells.js'),
  recipes: () => import('decantr/explorer/recipes.js'),
  tools: () => import('decantr/explorer/tools.js'),
  components: () => import('decantr/explorer/components.js'),
};

function docsNavigate(path) {
  window.location.hash = '#/docs' + path;
}

function renderIndex(title, itemsPromise, basePath) {
  const container = div({ class: css('_flex _col _gap4') });
  container.textContent = 'Loading...';
  itemsPromise.then(items => {
    container.textContent = '';
    container.appendChild(h1({ class: css('_heading3 _mb4') }, title));
    const grid = div({ class: css('_grid _gc3 _gap4 _md:gc2 _sm:gc1') });
    for (const item of items) {
      grid.appendChild(Card({
        hoverable: true,
        class: css('_cursor[pointer]'),
        onclick: () => { window.location.hash = `#/docs/${basePath}/${item.id}`; },
      },
        p({ class: css('_label _bold _p4') }, item.label || item.name || item.id),
      ));
    }
    container.appendChild(grid);
  });
  return container;
}

export function ExplorerPage() {
  const route = useRoute();
  const r = route();
  const path = r.path;
  const segments = path.replace('/docs/', '').split('/');
  const section = segments[0];

  const content = div({ class: css('_flex _col _gap4') });
  content.textContent = 'Loading...';

  const loader = EXPLORER_MAP[section];
  if (!loader) {
    content.textContent = '';
    content.appendChild(p({ class: css('_fgmutedfg') }, `Unknown section: ${section}`));
  } else {
    loader().then(mod => {
      content.textContent = '';

      if (section === 'components') {
        const group = r.params.group;
        const name = r.params.name || r.params.id;
        if (name && mod.ComponentDetail) {
          content.appendChild(mod.ComponentDetail(name, docsNavigate, group));
        } else if (group && mod.ComponentGroupView) {
          content.appendChild(mod.ComponentGroupView(group, docsNavigate));
        } else if (mod.loadComponentItems) {
          content.appendChild(renderIndex('Components', mod.loadComponentItems(), 'components'));
        }
      } else if (section === 'icons') {
        const group = r.params.group;
        const id = r.params.id;
        if (id && mod.IconDetail) {
          content.appendChild(mod.IconDetail(id));
        } else if (group && mod.IconGroupView) {
          content.appendChild(mod.IconGroupView(group, docsNavigate));
        } else if (mod.loadIconItems) {
          content.appendChild(renderIndex('Icons', mod.loadIconItems(), 'icons'));
        }
      } else if (section === 'charts') {
        const group = segments[1];
        const type = segments[2];
        if (type && mod.ChartDetail) {
          content.appendChild(mod.ChartDetail(type, docsNavigate));
        } else if (group && mod.ChartGroupView) {
          content.appendChild(mod.ChartGroupView(group, docsNavigate));
        } else if (mod.loadChartItems) {
          content.appendChild(renderIndex('Charts', mod.loadChartItems(), 'charts'));
        }
      } else if (section === 'patterns') {
        // Handle both /docs/patterns/:id and /docs/patterns/:group/:id routes
        const id = r.params.group && r.params.id ? r.params.id : (r.params.id || segments[1]);
        if (id && mod.PatternDetail) {
          content.appendChild(mod.PatternDetail(id, docsNavigate));
        } else if (mod.PatternListView) {
          content.appendChild(mod.PatternListView(docsNavigate));
        } else if (mod.loadPatternItems) {
          content.appendChild(renderIndex('Patterns', mod.loadPatternItems(), 'patterns'));
        }
      } else if (section === 'archetypes') {
        const id = r.params.id || segments[1];
        if (id && mod.ArchetypeDetail) {
          content.appendChild(mod.ArchetypeDetail(id, docsNavigate));
        } else if (mod.ArchetypeListView) {
          content.appendChild(mod.ArchetypeListView(docsNavigate));
        } else if (mod.loadArchetypeItems) {
          content.appendChild(renderIndex('Archetypes', mod.loadArchetypeItems(), 'archetypes'));
        }
      } else if (section === 'shells') {
        const id = r.params.id || segments[1];
        if (id && mod.ShellDetail) {
          content.appendChild(mod.ShellDetail(id));
        } else if (mod.ShellListView) {
          content.appendChild(mod.ShellListView(docsNavigate));
        } else if (mod.loadShellItems) {
          content.appendChild(renderIndex('Shells', mod.loadShellItems(), 'shells'));
        }
      } else if (section === 'recipes') {
        const id = r.params.id || segments[1];
        if (id && mod.RecipeDetail) {
          content.appendChild(mod.RecipeDetail(id, docsNavigate));
        } else if (mod.RecipeListView) {
          content.appendChild(mod.RecipeListView(docsNavigate));
        } else if (mod.loadRecipeItems) {
          content.appendChild(renderIndex('Recipes', mod.loadRecipeItems(), 'recipes'));
        }
      } else if (section === 'foundations') {
        const sub = r.params.section || r.params.subsection || segments[1];
        if (sub && mod.FoundationsExplorer) {
          content.appendChild(mod.FoundationsExplorer(sub));
        } else if (mod.loadFoundationItems) {
          content.appendChild(renderIndex('API Reference', mod.loadFoundationItems(), 'foundations'));
        }
      } else if (section === 'tokens') {
        const group = r.params.group || segments[1];
        if (mod.TokensExplorer) {
          content.appendChild(mod.TokensExplorer(group));
        }
      } else if (section === 'tools') {
        if (mod.ThemeStudio) {
          content.appendChild(mod.ThemeStudio());
        }
      }
    }).catch((err) => {
      console.error(`[docs] Failed to load explorer/${section}:`, err);
      content.textContent = 'Failed to load explorer module.';
    });
  }

  return DocsLayout(content);
}
