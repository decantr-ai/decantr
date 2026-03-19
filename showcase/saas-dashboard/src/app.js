import { tags } from 'decantr/tags';
import { cond, mount, onDestroy, onMount, text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css, setMode, setShape } from 'decantr/css';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { Breadcrumb, Button, Command, Dropdown, Popover, Shell, icon } from 'decantr/components';

setMode('dark');
setShape('rounded');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/overview.js').then(m => m.default) },
    { path: '/analytics', component: () => import('./pages/analytics.js').then(m => m.default) },
    { path: '/users', component: () => import('./pages/users.js').then(m => m.default) },
    { path: '/users/:id', component: () => import('./pages/user-detail.js').then(m => m.default) },
    { path: '/teams', component: () => import('./pages/teams.js').then(m => m.default) },
    { path: '/pipeline', component: () => import('./pages/pipeline.js').then(m => m.default) },
    { path: '/billing', component: () => import('./pages/billing.js').then(m => m.default) },
    { path: '/notifications', component: () => import('./pages/notifications.js').then(m => m.default) },
    { path: '/reports', component: () => import('./pages/reports.js').then(m => m.default) },
    { path: '/changelog', component: () => import('./pages/changelog.js').then(m => m.default) },
    { path: '/status', component: () => import('./pages/status.js').then(m => m.default) },
    { path: '/settings', component: () => import('./pages/settings.js').then(m => m.default) },
    { path: '/login', component: () => import('./pages/login.js').then(m => m.default) },
    { path: '/:404', component: () => import('./pages/not-found.js').then(m => m.default) }
  ]
});

const navSections = [
  {
    label: 'OVERVIEW',
    items: [
      { href: '/', ic: 'layout-dashboard', label: 'Dashboard' },
      { href: '/analytics', ic: 'bar-chart', label: 'Analytics' },
      { href: '/reports', ic: 'file-text', label: 'Reports' },
    ]
  },
  {
    label: 'MANAGEMENT',
    items: [
      { href: '/users', ic: 'users', label: 'Users' },
      { href: '/teams', ic: 'users-round', label: 'Teams' },
      { href: '/pipeline', ic: 'kanban', label: 'Pipeline' },
    ]
  },
  {
    label: 'OPERATIONS',
    items: [
      { href: '/status', ic: 'activity', label: 'Status' },
      { href: '/changelog', ic: 'git-commit', label: 'Changelog' },
      { href: '/notifications', ic: 'bell', label: 'Notifications' },
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      { href: '/billing', ic: 'credit-card', label: 'Billing' },
      { href: '/settings', ic: 'settings', label: 'Settings' },
    ]
  }
];

const allNav = navSections.flatMap(s => s.items);

function App() {
  const { div, span } = tags;
  const [navState, setNavState] = createSignal('expanded');
  const [cmdOpen, setCmdOpen] = createSignal(false);
  const route = useRoute();

  const pageTitle = () => {
    const path = route().path;
    const item = allNav.find(n => n.href === path);
    return item ? item.label : 'Dashboard';
  };

  const handleKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === '\\') {
      e.preventDefault();
      setNavState(navState() === 'expanded' ? 'rail' : 'expanded');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      setCmdOpen(!cmdOpen());
    }
  };
  onMount(() => document.addEventListener('keydown', handleKey));
  onDestroy(() => document.removeEventListener('keydown', handleKey));

  return Shell({ config: 'sidebar-main', navState, onNavStateChange: setNavState, class: css('_h[100vh] d-mesh') },

    Shell.Nav({ class: css('_flex _col _gap1 d-glass') },
      div({ class: css('_flex _aic _jcsb _px4 _py3 _mb2') },
        cond(() => navState() !== 'rail',
          () => span({ class: css('d-gradient-text _heading5 _bold') }, 'SaaS Dashboard'),
          () => icon('layout-dashboard', { size: '1em' })
        ),
        Shell.Trigger({ onToggle: () => setNavState(navState() === 'expanded' ? 'rail' : 'expanded') },
          icon('panel-left', { size: '1em' })
        )
      ),
      div({ class: css('_flex _col _gap1 _flex1 _overflow[auto] d-stagger') },
        ...navSections.map(section =>
          Shell.NavGroup({},
            Shell.NavGroupLabel({}, section.label),
            ...section.items.map(item =>
              link({
                href: item.href,
                class: () => css(`d-shell-nav-item _r2 _trans ${route().path === item.href ? 'd-shell-nav-item-active' : ''}`)
              },
                icon(item.ic, { size: '1em' }),
                cond(() => navState() !== 'rail', () => text(() => item.label))
              )
            )
          )
        )
      ),
      Shell.NavFooter({},
        div({ class: css('_w[8px] _h[8px] _rfull _bgsuccess') }),
        cond(() => navState() !== 'rail', () => span({ class: css('_textxs _fgmuted') }, 'System Online'))
      )
    ),

    Shell.Header({ class: css('_flex _aic _jcsb _px6 d-glass _borderB') },
      Breadcrumb({ items: () => [
        { label: 'Dashboard', href: '/' },
        { label: pageTitle() }
      ], separator: 'slash' }),
      div({ class: css('_flex _aic _gap2') },
        Button({ variant: 'ghost', size: 'sm', onclick: () => setCmdOpen(true) },
          icon('search', { size: '1em' })
        ),
        Popover({
          trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('bell', { size: '1em' })),
          align: 'end'
        },
          div({ class: css('_p4 _flex _col _gap2') },
            span({ class: css('d-gradient-text _bold _textsm') }, 'Notifications'),
            span({ class: css('_fgmuted _textsm') }, 'All systems operational.')
          )
        ),
        Dropdown({
          trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('user', { size: '1em' })),
          align: 'right',
          items: [
            { label: 'Profile', icon: 'user' },
            { label: 'Settings', icon: 'settings', onSelect: () => navigate('/settings') },
            { separator: true },
            { label: 'Sign out', icon: 'log-out' },
          ]
        })
      )
    ),

    Command({
      visible: cmdOpen,
      onClose: () => setCmdOpen(false),
      items: allNav.map(n => ({
        label: n.label,
        icon: n.ic,
        onSelect: () => { navigate(n.href); setCmdOpen(false); }
      }))
    }),

    Shell.Body({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') },
      router.outlet()
    )
  );
}

mount(document.getElementById('app'), App);
