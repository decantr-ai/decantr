import { mount } from 'decantr/core';
import { createRouter, link } from 'decantr/router';
import { setStyle, setMode } from 'decantr/css';
import { Button } from 'decantr/components';
import { tags } from 'decantr/tags';

import { HomePage } from './pages/home.js';
import { ProjectsPage } from './pages/projects.js';
import { AboutPage } from './pages/about.js';
import { ContactPage } from './pages/contact.js';

const { div, nav, a, header } = tags;

setStyle('glassmorphism');
setMode('dark');

const router = createRouter({
  routes: [
    { path: '/', component: HomePage },
    { path: '/projects', component: ProjectsPage },
    { path: '/about', component: AboutPage },
    { path: '/contact', component: ContactPage },
  ],
  fallback: () => div({ class: '_p8 _textcenter' }, 'Page not found'),
});

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/projects', label: 'Projects' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
];

function App() {
  const [route] = router.useRoute();

  return div({ class: '_minh[100vh] _flex _col' },
    header({ class: '_fixed _top0 _left0 _right0 _z50 _bgblur _bgsurface/80 _bcborder _bb' },
      div({ class: '_maxw[1200px] _mx[auto] _px6 _py4 _flex _justifybetween _itemscenter' },
        a({ ...link('/'), class: '_fslg _fwbold' }, 'Portfolio'),
        nav({ class: '_flex _gap6' },
          navItems.map(item =>
            a({
              ...link(item.path),
              class: () => `_trans[color_0.2s] ${route().path === item.path ? '_fgprimary' : '_fgmuted _hover:fgtext'}`,
            }, item.label)
          )
        ),
      )
    ),
    div({ class: '_pt[80px] _flex1 d-page-enter' },
      router.outlet
    )
  );
}

mount(document.getElementById('app'), App);
