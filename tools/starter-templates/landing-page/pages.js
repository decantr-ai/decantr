/**
 * Starter template pages: Landing Page
 */
export function pageFiles() {
  return [
    ['src/pages/home.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h1, p } = tags;

export default function HomePage() {
  return div({ class: css('_flex _col _gap0') },
    div({ class: css('_flex _col _center _minhscreen _p8') },
      h1({ class: css('_heading1 _tac') }, 'Your Product, Launched'),
      p({ class: css('_fgmuted _body _tac _mt4') }, 'Hero, features grid, and signup form go here. Run decantr generate to scaffold from your essence.')
    )
  );
}
`]
  ];
}
