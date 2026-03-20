import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { navigate } from 'decantr/router';
import { Breadcrumb } from 'decantr/components';
import { RecipeDetail, RecipeListView } from '../../../src/explorer/recipes.js';
import { wbPath } from './path-prefix.js';

const { div, h2, p } = tags;

const nav = (path) => navigate(wbPath(path));

export function RecipesIndex() {
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, 'Recipes'),
      p({ class: css('_body _fgmutedfg') }, 'Visual identity overlays with CSS decorators.')
    ),
    RecipeListView(nav)
  );
}

export function RecipeDetailPage({ id }) {
  return div({ class: css('_flex _col _gap4') },
    Breadcrumb({ items: [
      { label: 'Recipes', onclick: () => navigate(wbPath('/recipes')) },
      { label: id }
    ]}),
    RecipeDetail(id, nav)
  );
}
