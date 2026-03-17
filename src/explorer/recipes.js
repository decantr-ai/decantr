import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Separator, Tabs } from 'decantr/components';
import { injectExplorerCSS } from './styles.js';
injectExplorerCSS();

const { div, h2, h3, h4, p, span, section, code, strong } = tags;

let recipesData = {};
let recipesLoaded = false;

async function loadRecipes() {
  if (recipesLoaded) return recipesData;
  try {
    const indexResp = await fetch('/__decantr/registry/index.json');
    const index = await indexResp.json();
    const recipeEntries = index.recipes?.entries || {};
    for (const [id, meta] of Object.entries(recipeEntries)) {
      try {
        const resp = await fetch(`/__decantr/registry/${meta.file}`);
        recipesData[id] = await resp.json();
      } catch { recipesData[id] = { id, name: id, decorators: {}, compositions: {} }; }
    }
    recipesLoaded = true;
  } catch {
    recipesLoaded = true;
  }
  return recipesData;
}

export function RecipeDetail(recipeId, navigateTo) {
  const container = div({ class: css('_flex _col _gap4') },
    p({ class: css('_body _fgmutedfg') }, 'Loading recipe...')
  );

  loadRecipes().then(recipes => {
    const recipe = recipes[recipeId];
    container.innerHTML = '';

    if (!recipe) {
      container.appendChild(p({ class: css('_fgmutedfg _body') }, `Recipe "${recipeId}" not found.`));
      return;
    }

    const tabs = Tabs({
      tabs: [
        {
          id: 'features',
          label: 'Features',
          content: () => featuresTab(recipe)
        },
        {
          id: 'api',
          label: 'API',
          content: () => apiTab(recipe)
        }
      ]
    });

    container.appendChild(
      div({ class: css('_flex _col _gap1 _mb3') },
        h2({ class: css('_heading4') }, recipe.name || recipeId),
        p({ class: css('_body _fgmutedfg') }, recipe.description || 'Visual identity overlay.')
      )
    );
    container.appendChild(tabs);
  });

  return container;
}

function featuresTab(recipe) {
  const sections = [];
  const decorators = recipe.decorators || {};
  const compositions = recipe.compositions || {};

  // Decorators
  if (Object.keys(decorators).length > 0) {
    sections.push(
      div({ class: css('_flex _col _gap4') },
        h4({ class: css('_heading5 _mb3') }, `${Object.keys(decorators).length} Decorators`),
        ...Object.entries(decorators).map(([name, desc]) =>
          div({ class: css('_flex _gap4 _aic _py2 _bb[var(--d-border-width)_solid_var(--d-border)]') },
            div({ class: 'de-decorator-preview' },
              div({ class: css(name + ' _p3') },
                code({ class: css('_caption') }, `.${name}`)
              )
            ),
            span({ class: css('_body _fgmutedfg _flex1') }, typeof desc === 'string' ? desc : (desc.description || ''))
          )
        )
      )
    );
  }

  // Compositions
  if (Object.keys(compositions).length > 0) {
    if (sections.length > 0) sections.push(Separator({}));
    sections.push(
      div({ class: css('_flex _col _gap4') },
        h4({ class: css('_heading5 _mb3') }, 'Compositions'),
        ...Object.entries(compositions).map(([name, comp]) =>
          div({ class: css('_flex _col _gap2 _p3 _border _bcborder _radius') },
            strong({ class: css('_heading6') }, name),
            p({ class: css('_caption _fgmutedfg') }, comp.description || ''),
            comp.code ? div({ class: css('_bgmuted/10 _p3 _radius') },
              code({ class: css('_caption _wsprewrap _fontmono') }, comp.code)
            ) : null
          )
        )
      )
    );
  }

  if (sections.length === 0) {
    return div({ class: css('_fgmutedfg _body') }, 'No decorators or compositions defined.');
  }

  return div({ class: css('_flex _col _gap8') }, ...sections);
}

function apiTab(recipe) {
  const sections = [];

  // Setup code
  sections.push(
    div({ class: css('_flex _col _gap2') },
      h4({ class: css('_heading6') }, 'Setup'),
      div({ class: css('_bgmuted/10 _p4 _radius') },
        code({ class: css('_body _wspre _fontmono') },
          recipe.setup || `import { setStyle, setMode } from 'decantr/css';\nsetStyle('${recipe.style || recipe.id}');\nsetMode('${recipe.mode || 'dark'}');`
        )
      )
    )
  );

  // Style/mode metadata
  if (recipe.style || recipe.mode) {
    sections.push(
      div({ class: css('_flex _col _gap1') },
        recipe.style ? div({}, strong({ class: css('_caption') }, 'Style: '), span({ class: css('_caption _fgmutedfg') }, recipe.style)) : null,
        recipe.mode ? div({}, strong({ class: css('_caption') }, 'Mode: '), span({ class: css('_caption _fgmutedfg') }, recipe.mode)) : null
      )
    );
  }

  return div({ class: css('_flex _col _gap6') }, ...sections);
}

export function RecipeListView(navigateTo) {
  const container = div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, 'Recipes'),
    p({ class: css('_body _fgmutedfg') }, 'Loading recipes...')
  );

  loadRecipes().then(recipes => {
    container.innerHTML = '';
    container.appendChild(h2({ class: css('_heading4 _mb2') }, 'Recipes'));
    container.appendChild(p({ class: css('_body _fgmutedfg _mb3') }, 'Visual identity overlays — composition rules for drastic visual transformations.'));

    const grid = div({ class: 'de-card-grid' });
    for (const [id, recipe] of Object.entries(recipes)) {
      grid.appendChild(div({
        class: 'de-card-item',
        onclick: () => navigateTo(`/recipes/${id}`)
      },
        div({ class: css('_flex _col _gap2') },
          h3({ class: css('_heading6') }, recipe.name || id),
          p({ class: css('_caption _fgmutedfg') }, recipe.description || ''),
          div({ class: css('_flex _gap2') },
            span({ class: css('_caption _fgmutedfg') }, `${Object.keys(recipe.decorators || {}).length} decorators`),
            span({ class: css('_caption _fgmutedfg') }, `${Object.keys(recipe.compositions || {}).length} compositions`)
          )
        )
      ));
    }
    container.appendChild(grid);
  });

  return container;
}

export async function loadRecipeItems() {
  try {
    const resp = await fetch('/__decantr/registry/index.json');
    const data = await resp.json();
    const entries = data.recipes?.entries || {};
    return Object.entries(entries).map(([id, meta]) => ({
      id, label: meta.description?.split(' — ')[0] || id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')
    }));
  } catch {
    return [];
  }
}
