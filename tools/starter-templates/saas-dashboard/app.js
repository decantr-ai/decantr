/**
 * Starter template app.js: SaaS Dashboard
 */
export function appJs() {
  return `import { createRouter, link } from 'decantr/router';
import { css, setStyle, setMode, registerStyle } from 'decantr/css';
import { h, text, cond, mount } from 'decantr/core';
import { tags } from 'decantr/tags';
import { createSignal } from 'decantr/state';
import { Button, icon } from 'decantr/components';
import { useRoute } from 'decantr/router';
import { commandCenter } from 'decantr/styles/command-center';

import OverviewPage from './pages/overview.js';
import SettingsPage from './pages/settings.js';

registerStyle(commandCenter);
setStyle('command-center');
setMode('dark');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: OverviewPage },
    { path: '/settings', component: SettingsPage }
  ]
});

function App() {
  const { div, aside, main, header, span } = tags;
  const [collapsed, setCollapsed] = createSignal(false);
  const route = useRoute();

  const nav = [
    { href: '/', icon: 'layout-dashboard', label: 'Overview' },
    { href: '/settings', icon: 'settings', label: 'Settings' }
  ];

  const pageTitle = () => {
    const item = nav.find(n => n.href === route().path);
    return item ? item.label : 'Dashboard';
  };

  return div({ class: css('_grid _h[100vh]'), style: () => \`grid-template-columns:\${collapsed() ? '64px' : '240px'} 1fr;grid-template-rows:auto 1fr\` },
    aside({ class: css('_flex _col _gap1 _p3 _bgmuted _overflow[auto] _borderR'), style: 'grid-row:1/3' },
      div({ class: css('_flex _aic _jcsb _mb4') },
        cond(() => !collapsed(), () => span({ class: css('_heading5') }, 'Dashboard')),
        Button({ variant: 'ghost', size: 'sm', onclick: () => setCollapsed(!collapsed()) },
          icon('panel-left')
        )
      ),
      ...nav.map(item =>
        link({ href: item.href, class: css('_flex _aic _gap2 _p2 _px3 _r2 _trans _fgfg') },
          icon(item.icon),
          cond(() => !collapsed(), () => text(() => item.label))
        )
      )
    ),
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB') },
      span({ class: css('_heading4') }, pageTitle)
    ),
    main({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
      router.outlet()
    )
  );
}

mount(document.getElementById('app'), App);
`;
}
