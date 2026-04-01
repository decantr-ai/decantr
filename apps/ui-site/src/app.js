import { h } from '@decantr/ui/runtime';
import { css } from '@decantr/css';
import { createRouter } from '@decantr/ui/router';
import { Nav } from './shell/nav.js';
import { Footer } from './shell/footer.js';

export function App() {
  const router = createRouter({
    mode: 'history',
    routes: [
      { path: '/', component: () => import('./pages/home.js').then(m => m.Home) },
      { path: '/components', component: () => import('./pages/components/index.js').then(m => m.ComponentsIndex) },
      { path: '/components/:slug', component: () => import('./pages/components/detail.js').then(m => m.ComponentDetail) },
      { path: '/charts', component: () => import('./pages/charts/index.js').then(m => m.ChartsIndex) },
      { path: '/charts/:slug', component: () => import('./pages/charts/detail.js').then(m => m.ChartDetail) },
      { path: '/icons', component: () => import('./pages/icons.js').then(m => m.Icons) },
      { path: '/css', component: () => import('./pages/css.js').then(m => m.CSS) },
      { path: '/getting-started', component: () => import('./pages/getting-started.js').then(m => m.GettingStarted) },
      { path: '/why', component: () => import('./pages/why.js').then(m => m.Why) },
    ],
  });

  const container = h('div', { class: css('flex', 'col', 'minh100vh') });
  container.appendChild(Nav());

  const main = h('main', { class: css('flex1') });
  main.appendChild(router.outlet());
  container.appendChild(main);
  container.appendChild(Footer());

  return container;
}
