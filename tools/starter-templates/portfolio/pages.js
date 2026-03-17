/**
 * Starter template pages: Portfolio
 */
export function pageFiles() {
  return [
    ['src/pages/home.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h1, p } = tags;

export default function HomePage() {
  return div({ class: css('_flex _col _gap0') },
    div({ class: css('_flex _col _center _minhscreen _p8') },
      h1({ class: css('_heading1') }, 'Creative Portfolio'),
      p({ class: css('_fgmuted _body _tac _mt4') }, 'Hero section and work grid go here. Run decantr generate to scaffold from your essence.')
    )
  );
}
`],
    ['src/pages/about.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h2, p } = tags;

export default function AboutPage() {
  return div({ class: css('_flex _col _gap8 _p8 _overflow[auto] _flex1') },
    h2({ class: css('_heading3') }, 'About'),
    p({ class: css('_fgmuted _body') }, 'Bio and profile go here. Run decantr generate to scaffold from your essence.')
  );
}
`]
  ];
}
