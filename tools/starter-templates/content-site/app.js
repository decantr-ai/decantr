/**
 * Starter template app.js: Content Site
 */
export function appJs() {
  return `import { createRouter, link } from 'decantr/router';
import { css, setStyle, setMode, registerStyle } from 'decantr/css';
import { h, text, mount } from 'decantr/core';
import { tags } from 'decantr/tags';
import { Button, icon } from 'decantr/components';
import { clean } from 'decantr/styles/clean';

import PostsPage from './pages/posts.js';
import ArticlePage from './pages/article.js';

registerStyle(clean);
setStyle('clean');
setMode('light');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: PostsPage },
    { path: '/article', component: ArticlePage }
  ]
});

function App() {
  const { div, header, main, nav: navEl } = tags;

  return div({ class: css('_flex _col _h[100vh]') },
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB _bgbg') },
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, 'Blog'),
      navEl({ class: css('_flex _aic _gap6') },
        link({ href: '/', class: css('_fgmuted _nounder _trans') }, 'Posts'),
        link({ href: '/article', class: css('_fgmuted _nounder _trans') }, 'Article')
      ),
      div({ class: css('_flex _aic _gap2') },
        Button({ variant: 'ghost', size: 'sm' }, icon('search'))
      )
    ),
    main({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
      router.outlet()
    )
  );
}

mount(document.getElementById('app'), App);
`;
}
