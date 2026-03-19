import { mount } from 'decantr/core';
import { createRouter, link } from 'decantr/router';
import { createSignal } from 'decantr/state';
import { setStyle, setMode } from 'decantr/css';
import { Shell, Command, Select } from 'decantr/components';
import { tags } from 'decantr/tags';

import { HomePage } from './pages/home.js';
import { DocsPage } from './pages/docs.js';
import { APIPage } from './pages/api.js';

const { div, nav, a, span } = tags;

setStyle('clean');
setMode('auto');

const router = createRouter({
  routes: [
    { path: '/', component: HomePage },
    { path: '/docs/:section?', component: DocsPage },
    { path: '/api/:section?', component: APIPage },
  ],
  fallback: () => div({ class: '_p8 _textcenter' }, 'Page not found'),
});

const sidebarItems = [
  { type: 'header', label: 'Getting Started' },
  { path: '/docs/introduction', label: 'Introduction' },
  { path: '/docs/installation', label: 'Installation' },
  { path: '/docs/quick-start', label: 'Quick Start' },
  { type: 'header', label: 'Guides' },
  { path: '/docs/routing', label: 'Routing' },
  { path: '/docs/state-management', label: 'State Management' },
  { path: '/docs/styling', label: 'Styling' },
  { type: 'header', label: 'API Reference' },
  { path: '/api/core', label: 'Core' },
  { path: '/api/components', label: 'Components' },
  { path: '/api/hooks', label: 'Hooks' },
];

function App() {
  const [route] = router.useRoute();
  const [version, setVersion] = createSignal('v1.0');

  return Shell({
    class: '_h[100vh]',
    children: [
      Shell.Nav({
        children: [
          div({ class: '_p4 _flex _justifybetween _itemscenter' },
            span({ class: '_fwbold _fslg' }, 'Docs'),
            Select({
              value: version,
              onChange: setVersion,
              size: 'sm',
              options: [
                { value: 'v1.0', label: 'v1.0' },
                { value: 'v0.9', label: 'v0.9' },
              ],
            }),
          ),
          nav({ class: '_flex _col _gap1 _p2' },
            sidebarItems.map(item =>
              item.type === 'header'
                ? div({ class: '_px3 _py2 _fssm _fgmuted _fwbold _mt4 _first:mt0' }, item.label)
                : a({
                    ...link(item.path),
                    class: () => `_px3 _py2 _rounded _block ${route().path === item.path ? '_bgprimary/10 _fgprimary' : '_fgmuted _hover:bgmuted/10'}`,
                  }, item.label)
            )
          ),
        ],
      }),
      Shell.Header({
        children: [
          div({ class: '_flex _gap4 _itemscenter' },
            Command({ placeholder: 'Search docs... (Cmd+K)' }),
          ),
        ],
      }),
      Shell.Body({
        class: 'd-page-enter _overflow[auto]',
        children: router.outlet,
      }),
    ],
  });
}

mount(document.getElementById('app'), App);
