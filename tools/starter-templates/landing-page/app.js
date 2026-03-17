/**
 * Starter template app.js: Landing Page
 */
export function appJs() {
  return `import { createRouter, link } from 'decantr/router';
import { css, setStyle, setMode } from 'decantr/css';
import { h, mount } from 'decantr/core';
import { tags } from 'decantr/tags';

import HomePage from './pages/home.js';

setStyle('auradecantism');
setMode('dark');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: HomePage }
  ]
});

function App() {
  const { div, header, main, nav: navEl } = tags;

  return div({ class: css('_flex _col') },
    header({ class: css('_fixed _top0 _left0 _wfull _flex _aic _jcsb _px8 _py4 _z[40]') },
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, 'Brand'),
      navEl({ class: css('_flex _aic _gap6') })
    ),
    main({ class: css('_flex _col') },
      router.outlet()
    )
  );
}

mount(document.getElementById('app'), App);
`;
}
