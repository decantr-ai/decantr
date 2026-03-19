import { tags } from 'decantr/tags';
import { cond, mount, onDestroy, onMount, text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css, setStyle, setMode, setShape, getResolvedMode, registerStyle } from 'decantr/css';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { Button, Command, Dropdown, Popover, Shell, icon } from 'decantr/components';
import { launchpad } from 'decantr/styles/community/launchpad';

registerStyle(launchpad);
setStyle('launchpad');
setMode('light');
setShape('rounded');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/home.js').then(m => m.default) },
    { path: '/apps', component: () => import('./pages/apps.js').then(m => m.default) },
    { path: '/apps/:id', component: () => import('./pages/app-detail.js').then(m => m.default) },
    { path: '/team', component: () => import('./pages/team.js').then(m => m.default) },
    { path: '/activity', component: () => import('./pages/activity.js').then(m => m.default) },
    { path: '/services', component: () => import('./pages/services.js').then(m => m.default) },
    { path: '/tokens', component: () => import('./pages/tokens.js').then(m => m.default) },
    { path: '/usage', component: () => import('./pages/usage.js').then(m => m.default) },
    { path: '/billing', component: () => import('./pages/billing.js').then(m => m.default) },
    { path: '/settings', component: () => import('./pages/settings.js').then(m => m.default) },
    { path: '/status', component: () => import('./pages/status.js').then(m => m.default) },
    { path: '/compliance', component: () => import('./pages/compliance.js').then(m => m.default) },
    { path: '/login', component: () => import('./pages/login.js').then(m => m.default) },
    { path: '/:404', component: () => import('./pages/not-found.js').then(m => m.default) }
  ]
});

const navSections = [
  [
    { href: '/apps', ic: 'box', label: 'Apps' },
    { href: '/team', ic: 'users', label: 'Team' },
    { href: '/activity', ic: 'activity', label: 'Activity' },
  ],
  [
    { href: '/services', ic: 'database', label: 'Managed Postgres' },
  ],
  [
    { href: '/status', ic: 'circle-dot', label: 'Status' },
    { href: '/compliance', ic: 'shield-check', label: 'Compliance' },
    { href: '/tokens', ic: 'key', label: 'Tokens' },
  ],
  [
    { href: '/usage', ic: 'gauge', label: 'Usage' },
    { href: '/billing', ic: 'credit-card', label: 'Billing' },
    { href: '/settings', ic: 'settings', label: 'Settings' },
  ]
];

const allNav = navSections.flat();

function App() {
  const { div, span, hr } = tags;
  const [navState, setNavState] = createSignal('expanded');
  const [cmdOpen, setCmdOpen] = createSignal(false);
  const route = useRoute();

  const isHome = () => route().path === '/' || route().path === '';

  const toggleMode = () => {
    const current = getResolvedMode();
    setMode(current === 'dark' ? 'light' : 'dark');
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

  return cond(isHome,
    () => div({ class: css('_hfull') }, router.outlet()),
    () => Shell({ config: 'top-nav-sidebar', navState, onNavStateChange: setNavState, class: css('_h[100vh]') },

      Shell.Header({ class: css('_flex _aic _jcsb _px6 lp-header') },
        div({ class: css('_flex _aic _gap3') },
          icon('cloud', { size: '1.25rem', class: css('_fgprimary') }),
          span({ class: css('_bold') }, 'CloudLaunch')
        ),
        div({ class: css('_flex _aic _gap2') },
          Button({ variant: 'ghost', size: 'sm', onclick: () => setCmdOpen(true) },
            icon('search', { size: '1em' })
          ),
          Button({ variant: 'ghost', size: 'sm', onclick: toggleMode },
            icon(getResolvedMode() === 'dark' ? 'sun' : 'moon', { size: '1em' })
          ),
          Popover({
            trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('bell', { size: '1em' })),
            align: 'end'
          },
            div({ class: css('_p4 _flex _col _gap2') },
              span({ class: css('_bold _textsm') }, 'Notifications'),
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

      Shell.Nav({ class: css('_flex _col _py3 _px3') },
        div({ class: css('_flex _aic _jcsb _gap2 _mb3') },
          cond(() => navState() !== 'rail',
            () => Dropdown({
              trigger: () => div({ class: css('lp-btn-outline _flex1 _textsm') },
                icon('building', { size: '1em', class: css('_fgmuted') }),
                span({}, 'Acme Corp'),
                icon('chevron-down', { size: '0.75em', class: css('_fgmuted') })
              ),
              items: [
                { label: 'Acme Corp', icon: 'building' },
                { label: 'Personal', icon: 'user' },
                { separator: true },
                { label: 'Create Organization', icon: 'plus' },
              ]
            }),
            () => icon('building', { size: '1em', class: css('_fgmuted') })
          ),
          cond(() => navState() !== 'rail',
            () => div({ class: css('lp-btn-gradient _textsm _cursor[pointer]'), onclick: () => navigate('/apps') },
              icon('rocket', { size: '0.875em' }), text('Launch')
            )
          )
        ),
        hr({ class: css('lp-divider') }),
        div({ class: css('_flex _col _gap0 _flex1 _overflow[auto]') },
          ...navSections.flatMap((section, i) => [
            ...(i > 0 ? [hr({ class: css('lp-divider') })] : []),
            div({ class: css('_flex _col _gap0') },
              ...section.map(item =>
                link({
                  href: item.href,
                  class: () => css(`lp-nav-item ${route().path === item.href ? 'lp-nav-active' : ''}`)
                },
                  icon(item.ic, { size: '1em' }),
                  cond(() => navState() !== 'rail', () => text(item.label))
                )
              )
            )
          ])
        ),
        div({ class: css('_flex _aic _gap2 _py2 _px2') },
          div({ class: css('_w[8px] _h[8px] _rfull _bgsuccess') }),
          cond(() => navState() !== 'rail', () => span({ class: css('_textxs _fgmuted') }, 'All Systems Operational'))
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

      Shell.Body({ class: css('lp-panel _flex _col _gap4 _p6 _overflow[auto] _flex1') },
        router.outlet()
      )
    )
  );
}

mount(document.getElementById('app'), App);
