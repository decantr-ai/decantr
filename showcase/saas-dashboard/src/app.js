import { tags } from 'decantr/tags';
import { cond, mount, onDestroy, onMount, text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css, registerStyle, setMode, setStyle } from 'decantr/css';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { Breadcrumb, Button, Command, Dropdown, Popover, Shell, icon } from 'decantr/components';
import { commandCenter } from 'decantr/styles/command-center';

registerStyle(commandCenter);
setStyle('command-center');
setMode('dark');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/overview.js').then(m => m.default) },
    { path: '/analytics', component: () => import('./pages/analytics.js').then(m => m.default) },
    { path: '/users', component: () => import('./pages/users.js').then(m => m.default) },
    { path: '/settings', component: () => import('./pages/settings.js').then(m => m.default) },
    { path: '/:404', component: () => import('./pages/not-found.js').then(m => m.default) }
  ]
});

const nav = [
  { href: '/', ic: 'layout-dashboard', label: 'Overview' },
  { href: '/analytics', ic: 'bar-chart', label: 'Analytics' },
  { href: '/users', ic: 'users', label: 'Users' },
  { href: '/settings', ic: 'settings', label: 'Settings' },
];

function App() {
  const { div, span } = tags;
  const [navState, setNavState] = createSignal('expanded');
  const [cmdOpen, setCmdOpen] = createSignal(false);
  const route = useRoute();

  const pageTitle = () => {
    const path = route().path;
    const item = nav.find(n => n.href === path);
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

  return Shell({ config: 'sidebar-main', navState, onNavStateChange: setNavState, class: css('_h[100vh] cc-mesh') },

    Shell.Nav({ class: css('_flex _col _gap1 cc-frame cc-grid') },
      div({ class: css('cc-bar _mb2') },
        cond(() => navState() !== 'rail',
          () => span({ class: css('cc-label') }, 'COMMAND CENTER'),
          () => icon('terminal', { size: '1em' })
        ),
        Button({ variant: 'ghost', size: 'sm', onclick: () => setNavState(navState() === 'expanded' ? 'rail' : 'expanded') },
          icon('panel-left', { size: '1em' })
        )
      ),
      div({ class: css('_flex _col _gap1 _px2 d-stagger') },
        ...nav.map(item =>
          link({
            href: item.href,
            class: () => css(`d-shell-nav-item _flex _aic _gap2 _p2 _px3 _trans ${route().path === item.href ? 'd-shell-nav-item-active' : ''}`)
          },
            icon(item.ic, { size: '1em' }),
            cond(() => navState() !== 'rail', () => text(() => item.label))
          )
        )
      ),
      div({ class: css('_flex1') }),
      div({ class: css('cc-bar-bottom _flex _aic _gap2') },
        span({ class: css('cc-indicator cc-indicator-ok cc-blink') }),
        cond(() => navState() !== 'rail', () => span({ class: css('cc-data _textxs _fgmuted') }, 'ONLINE'))
      )
    ),

    Shell.Header({ class: css('_flex _aic _jcsb _px6 cc-bar') },
      Breadcrumb({ items: () => [
        { label: 'Command Center', href: '/' },
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
            span({ class: css('cc-label _fgmutedfg') }, 'NOTIFICATIONS'),
            span({ class: css('_fgmuted _textsm') }, 'All systems nominal.')
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
      items: nav.map(n => ({
        label: n.label,
        icon: n.ic,
        onSelect: () => { navigate(n.href); setCmdOpen(false); }
      }))
    }),

    Shell.Body({ class: css('_flex _col _gap3 _p6 _overflow[auto] _flex1') },
      router.outlet()
    )
  );
}

mount(document.getElementById('app'), App);
