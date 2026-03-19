import { mount } from 'decantr/core';
import { createRouter, link } from 'decantr/router';
import { createSignal } from 'decantr/state';
import { setStyle, setMode } from 'decantr/css';
import { Shell, Button, Card, Dropdown, Popover, Breadcrumb, Command } from 'decantr/components';
import { tags } from 'decantr/tags';

import { OverviewPage } from './pages/overview.js';
import { AnalyticsPage } from './pages/analytics.js';
import { UsersPage } from './pages/users.js';
import { SettingsPage } from './pages/settings.js';

const { div, span, nav, a } = tags;

// Initialize style
setStyle('auradecantism');
setMode('dark');

// Router setup
const router = createRouter({
  routes: [
    { path: '/', component: OverviewPage },
    { path: '/analytics', component: AnalyticsPage },
    { path: '/users', component: UsersPage },
    { path: '/settings', component: SettingsPage },
  ],
  fallback: () => div({ class: '_p8 _textcenter' }, 'Page not found'),
});

// Navigation items
const navItems = [
  { path: '/', label: 'Overview', icon: 'home' },
  { path: '/analytics', label: 'Analytics', icon: 'chart' },
  { path: '/users', label: 'Users', icon: 'users' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

function App() {
  const [route] = router.useRoute();

  return Shell({
    class: '_h[100vh]',
    children: [
      Shell.Nav({
        class: 'd-shell-nav-style-pill',
        children: [
          div({ class: '_p4 _fwbold _fslg' }, 'Dashboard'),
          nav({ class: '_flex _col _gap1 _mt4' },
            navItems.map(item =>
              a({
                ...link(item.path),
                class: () => `d-shell-nav-item ${route().path === item.path ? 'd-shell-nav-item-active' : ''}`,
              }, item.label)
            )
          ),
        ],
      }),
      Shell.Header({
        children: [
          Breadcrumb({ items: () => [{ label: 'Dashboard' }, { label: route().path.slice(1) || 'Overview' }] }),
          div({ class: '_flex _gap2 _itemscenter' },
            Command({ placeholder: 'Search...' }),
            Popover({
              trigger: Button({ variant: 'ghost', size: 'sm' }, 'Notifications'),
              content: div({ class: '_p4' }, 'No new notifications'),
            }),
            Dropdown({
              trigger: Button({ variant: 'ghost', size: 'sm' }, 'User'),
              items: [
                { label: 'Profile', onClick: () => {} },
                { label: 'Logout', onClick: () => {} },
              ],
            })
          ),
        ],
      }),
      Shell.Body({
        class: 'd-page-enter',
        children: router.outlet,
      }),
    ],
  });
}

mount(document.getElementById('app'), App);
