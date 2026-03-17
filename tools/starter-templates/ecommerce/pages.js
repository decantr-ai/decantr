/**
 * Starter template pages: E-commerce
 */
export function pageFiles() {
  return [
    ['src/pages/catalog.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h2, p } = tags;

export default function CatalogPage() {
  return div({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
    h2({ class: css('_heading3') }, 'Product Catalog'),
    p({ class: css('_fgmuted _body') }, 'Product grid goes here. Run decantr generate to scaffold from your essence.')
  );
}
`],
    ['src/pages/cart.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h2, p } = tags;

export default function CartPage() {
  return div({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
    h2({ class: css('_heading3') }, 'Shopping Cart'),
    p({ class: css('_fgmuted _body') }, 'Cart contents go here. Run decantr generate to scaffold from your essence.')
  );
}
`]
  ];
}
