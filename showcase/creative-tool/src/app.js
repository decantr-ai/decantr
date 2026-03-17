import { tags } from 'decantr/tags';
import { cond, mount, onDestroy, onMount, text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css, registerStyle, setMode, setStyle } from 'decantr/css';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { Breadcrumb, Button, Command, Dropdown, Popover, Shell, icon } from 'decantr/components';
import { clay } from 'decantr/styles/community/clay';

registerStyle(clay);
setStyle('clay');
setMode('light');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/home.js').then(m => m.default) },
    { path: '/workspace', component: () => import('./pages/workspace.js').then(m => m.default) },
    { path: '/explore', component: () => import('./pages/explore.js').then(m => m.default) },
    { path: '/detail', component: () => import('./pages/detail.js').then(m => m.default) },
    { path: '/:404', component: () => import('./pages/not-found.js').then(m => m.default) },
  ],
});

const navSections = [
  {
    label: 'TOOLS',
    items: [
      { href: '/workspace', ic: 'palette', label: 'Workspace' },
      { href: '/explore', ic: 'grid', label: 'Explore' },
    ],
  },
  {
    label: 'LIBRARY',
    items: [
      { href: '/detail', ic: 'eye', label: 'Detail' },
    ],
  },
];

const allNav = [
  { href: '/', ic: 'home', label: 'Home' },
  ...navSections.flatMap(s => s.items),
];

function App() {
  const { div, span } = tags;
  const [navState, setNavState] = createSignal('expanded');
  const [cmdOpen, setCmdOpen] = createSignal(false);
  const route = useRoute();

  const isLanding = () => route().path === '/';

  const pageTitle = () => {
    const path = route().path;
    const item = allNav.find(n => n.href === path);
    return item ? item.label : 'Chromaform';
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

  return cond(isLanding,
    // ── Landing page: full-bleed, no shell ──
    () => router.outlet(),
    // ── Tool pages: Shell sidebar-main ──
    () => Shell({ config: 'sidebar-main', navState, onNavStateChange: setNavState, class: css('_h[100vh] cy-pastel-mesh') },

      // ── Nav ──
      Shell.Nav({ class: css('_flex _col _gap1') },
        // Brand
        div({ class: css('_flex _aic _gap3 _p4 _mb2') },
          div({ class: css('_flex _center _w10 _h10 _r3 _bgprimary/15 cy-float') },
            icon('palette', { size: '1.25rem', class: css('_fgprimary') })
          ),
          cond(() => navState() !== 'rail',
            () => div({ class: css('_flex _col') },
              span({ class: css('_medium _textsm d-gradient-text') }, 'Chromaform'),
              span({ class: css('_textxs _fgmuted') }, 'Color Palette Tool')
            )
          )
        ),

        // Nav sections
        ...navSections.map(section =>
          div({ class: css('_flex _col _gap1') },
            cond(() => navState() !== 'rail',
              () => span({ class: css('cy-label _mx4 _mb1 _mt3') }, section.label)
            ),
            div({ class: css('_flex _col _gap1 _px2 d-stagger') },
              ...section.items.map(item =>
                link({
                  href: item.href,
                  class: () => css(`d-shell-nav-item _flex _aic _gap2 _p2 _px3 _trans ${route().path === item.href ? 'd-shell-nav-item-active' : ''}`)
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

        // Home link at bottom
        div({ class: css('_p3') },
          link({ href: '/', class: css('d-shell-nav-item _flex _aic _gap2 _p2 _px3 _trans') },
            icon('home', { size: '1em' }),
            cond(() => navState() !== 'rail', () => text(() => 'Home'))
          )
        ),

        // Bottom status
        cond(() => navState() !== 'rail',
          () => div({ class: css('cy-dimple _m3 _p3 _r3 _tc') },
            span({ class: css('_textxs _fgmuted') }, 'Clay Style \u2022 Light Mode')
          )
        )
      ),

      // ── Header ──
      Shell.Header({ class: css('_flex _aic _jcsb _px6') },
        Breadcrumb({ items: () => [
          { label: 'Chromaform', href: '/' },
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
              span({ class: css('cy-label') }, 'NOTIFICATIONS'),
              span({ class: css('_fgmuted _textsm') }, 'No new alerts.')
            )
          ),
          Dropdown({
            trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('user', { size: '1em' })),
            align: 'right',
            items: [
              { label: 'Workspace', icon: 'palette', onSelect: () => navigate('/workspace') },
              { label: 'Explore', icon: 'grid', onSelect: () => navigate('/explore') },
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
        ],
      }),

      // ── Body ──
      Shell.Body({ class: css('_flex _col _gap6 _p6 _overflow[auto] _flex1') },
        router.outlet()
      )
    )
  );
}

mount(document.getElementById('app'), App);
