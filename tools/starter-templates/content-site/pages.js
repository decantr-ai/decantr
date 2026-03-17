/**
 * Starter template pages: Content Site
 */
export function pageFiles() {
  return [
    ['src/pages/posts.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h2, p } = tags;

export default function PostsPage() {
  return div({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
    h2({ class: css('_heading3') }, 'Posts'),
    p({ class: css('_fgmuted _body') }, 'Post grid goes here. Run decantr generate to scaffold from your essence.')
  );
}
`],
    ['src/pages/article.js', `import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h2, p } = tags;

export default function ArticlePage() {
  return div({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
    h2({ class: css('_heading3') }, 'Article'),
    p({ class: css('_fgmuted _body') }, 'Article content goes here. Run decantr generate to scaffold from your essence.')
  );
}
`]
  ];
}
