import { mount } from 'decantr/core';
import { createRouter, link } from 'decantr/router';
import { setStyle, setMode } from 'decantr/css';
import { Button } from 'decantr/components';
import { tags } from 'decantr/tags';

import { HomePage } from './pages/home.js';
import { ArticlesPage } from './pages/articles.js';
import { ArticleDetailPage } from './pages/article-detail.js';
import { AboutPage } from './pages/about.js';

const { div, nav, a, header, footer } = tags;

setStyle('clean');
setMode('light');

const router = createRouter({
  routes: [
    { path: '/', component: HomePage },
    { path: '/articles', component: ArticlesPage },
    { path: '/articles/:slug', component: ArticleDetailPage },
    { path: '/about', component: AboutPage },
  ],
  fallback: () => div({ class: '_p8 _textcenter' }, 'Page not found'),
});

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/articles', label: 'Articles' },
  { path: '/about', label: 'About' },
];

function App() {
  const [route] = router.useRoute();

  return div({ class: '_minh[100vh] _flex _col _bgbg' },
    header({ class: '_bgsurface _bcborder _bb' },
      div({ class: '_maxw[1100px] _mx[auto] _px6 _py4 _flex _justifybetween _itemscenter' },
        a({ ...link('/'), class: '_fslg _fwbold _fgtext' }, 'Blog'),
        nav({ class: '_flex _gap6' },
          navItems.map(item =>
            a({
              ...link(item.path),
              class: () => route().path === item.path ? '_fgprimary _fwmedium' : '_fgmuted _hover:fgtext',
            }, item.label)
          )
        ),
      )
    ),
    div({ class: '_flex1 d-page-enter' },
      router.outlet
    ),
    footer({ class: '_bgsurface _bcborder _bt _py8 _textcenter _fgmuted' },
      'Built with Decantr'
    )
  );
}

mount(document.getElementById('app'), App);
