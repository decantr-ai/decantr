import { tags } from 'decantr/tags';
import { cond, mount, onDestroy, onMount, text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css, registerStyle, setMode, setShape, setStyle } from 'decantr/css';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { Breadcrumb, Button, Command, Dropdown, Input, Modal, Popover, Shell, icon } from 'decantr/components';
import { gamingGuild } from 'decantr/styles/community/gaming-guild';

registerStyle(gamingGuild);
setStyle('gaming-guild');
setMode('dark');
setShape('rounded');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/main.js').then(m => m.default) },
    { path: '/news', component: () => import('./pages/news.js').then(m => m.default) },
    { path: '/games', component: () => import('./pages/games.js').then(m => m.default) },
    { path: '/hall-of-fame', component: () => import('./pages/hall-of-fame.js').then(m => m.default) },
    { path: '/join', component: () => import('./pages/join-guild.js').then(m => m.default) },
    { path: '/profile', component: () => import('./pages/member-profile.js').then(m => m.default) },
    { path: '/:404', component: () => import('./pages/not-found.js').then(m => m.default) },
  ],
});

const navSections = [
  {
    label: 'INFO',
    items: [
      { href: '/', ic: 'layout-dashboard', label: 'Main' },
      { href: '/news', ic: 'newspaper', label: 'News' },
      { href: '/games', ic: 'gamepad-2', label: 'Games' },
    ],
  },
  {
    label: 'SPOTLIGHT',
    items: [
      { href: '/hall-of-fame', ic: 'trophy', label: 'Hall of Fame' },
      { href: '/join', ic: 'shield', label: 'Join Guild' },
      { href: '/profile', ic: 'user', label: 'Profile' },
    ],
  },
];

const allNav = navSections.flatMap(s => s.items);

function App() {
  const { div, span, h3 } = tags;
  const [navState, setNavState] = createSignal('expanded');
  const [cmdOpen, setCmdOpen] = createSignal(false);
  const [authOpen, setAuthOpen] = createSignal(false);
  const route = useRoute();

  const pageTitle = () => {
    const path = route().path;
    const item = allNav.find(n => n.href === path);
    return item ? item.label : 'Gaming Platform';
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

  // Expose auth modal opener for pages
  if (typeof globalThis !== 'undefined') globalThis.__openAuth = () => setAuthOpen(true);

  return Shell({ config: 'sidebar-main', navState, onNavStateChange: setNavState, class: css('_h[100vh] gg-mesh') },

    // ── Nav ──
    Shell.Nav({ class: css('_flex _col _gap1') },
      // Guild brand
      div({ class: css('_flex _aic _gap3 _p4 _mb2') },
        div({ class: css('_flex _center _w10 _h10 _r3 _bgprimary/15 gg-float') },
          icon('shield', { size: '1.25rem', class: css('_fgprimary') })
        ),
        cond(() => navState() !== 'rail',
          () => div({ class: css('_flex _col') },
            span({ class: css('_medium _textsm d-gradient-text') }, 'NEXUS GUILD'),
            span({ class: css('gg-data _textxs _fgmuted') }, 'EST. 2024')
          )
        )
      ),

      // Nav sections
      ...navSections.map(section =>
        div({ class: css('_flex _col _gap1') },
          cond(() => navState() !== 'rail',
            () => span({ class: css('gg-label _fgmuted _px4 _mb1 _mt3') }, section.label)
          ),
          div({ class: css('_flex _col _gap1 d-stagger') },
            ...section.items.map(item =>
              link({
                href: item.href,
                class: () => css(`d-shell-nav-item _trans ${route().path === item.href ? 'd-shell-nav-item-active' : ''}`)
              },
                icon(item.ic, { size: '1em' }),
                cond(() => navState() !== 'rail', () => text(() => item.label))
              )
            )
          )
        )
      ),

      // Spacer
      div({ class: css('_flex1') }),

      // Bottom bar
      div({ class: css('_flex _aic _gap2 _p4') },
        span({ class: css('gg-live') }),
        cond(() => navState() !== 'rail',
          () => div({ class: css('_flex _aic _gap3') },
            span({ class: css('gg-data _textxs _fgmuted') }, 'ONLINE'),
            div({ class: css('_flex _gap2 _fgmuted') },
              icon('message-circle', { size: '0.875rem' }),
              icon('globe', { size: '0.875rem' })
            )
          )
        )
      )
    ),

    // ── Header ──
    Shell.Header({ class: css('_flex _aic _jcsb _px6') },
      Breadcrumb({ items: () => [
        { label: 'Nexus Guild', href: '/' },
        { label: pageTitle() },
      ], separator: 'slash' }),
      div({ class: css('_flex _aic _gap2') },
        Button({ variant: 'ghost', size: 'sm', onclick: () => setCmdOpen(true) },
          icon('search', { size: '1em' })
        ),
        Popover({
          trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('bell', { size: '1em' })),
          align: 'end',
        },
          div({ class: css('_p4 _flex _col _gap2') },
            span({ class: css('gg-label _fgmutedfg') }, 'NOTIFICATIONS'),
            span({ class: css('_fgmuted _textsm') }, 'No new alerts.')
          )
        ),
        Dropdown({
          trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('user', { size: '1em' })),
          align: 'right',
          items: [
            { label: 'Profile', icon: 'user', onSelect: () => navigate('/profile') },
            { label: 'Settings', icon: 'settings' },
            { separator: true },
            { label: 'Sign out', icon: 'log-out' },
          ],
        })
      )
    ),

    // ── Command Palette ──
    Command({
      visible: cmdOpen,
      onClose: () => setCmdOpen(false),
      items: [
        ...allNav.map(n => ({
          label: n.label,
          icon: n.ic,
          onSelect: () => { navigate(n.href); setCmdOpen(false); },
        })),
        { label: 'Join the Guild', icon: 'shield', onSelect: () => { setAuthOpen(true); setCmdOpen(false); } },
      ],
    }),

    // ── Auth Modal ──
    Modal({
      visible: authOpen,
      onClose: () => setAuthOpen(false),
      title: 'Join the Guild',
      class: css('gg-mesh'),
      footer: [
        Button({ variant: 'outline', onclick: () => setAuthOpen(false) }, 'Cancel'),
        Button({ variant: 'primary', class: css('gg-glow'), onclick: () => setAuthOpen(false) }, 'SIGN IN'),
      ],
    },
      div({ class: css('_flex _col _gap4') },
        div({ class: css('_tc _mb2') },
          h3({ class: css('d-gradient-text _heading4') }, 'NEXUS GUILD'),
          span({ class: css('_textsm _fgmuted') }, 'Enter your credentials to join')
        ),
        Input({ label: 'Gamertag', placeholder: 'Enter your gamertag' }),
        Input({ label: 'Access Code', type: 'password', placeholder: 'Guild access code' })
      )
    ),

    // ── Body ──
    Shell.Body({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') },
      router.outlet()
    )
  );
}

mount(document.getElementById('app'), App);
