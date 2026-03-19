import { tags } from 'decantr/tags';
import { cond, mount, onDestroy, onMount, text } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { css, setMode, setShape } from 'decantr/css';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { Breadcrumb, Button, Command, Dropdown, Popover, Shell, icon } from 'decantr/components';

setMode('light');
setShape('rounded');

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/overview.js').then(m => m.default) },
    { path: '/analytics', component: () => import('./pages/analytics.js').then(m => m.default) },
    { path: '/products', component: () => import('./pages/products.js').then(m => m.default) },
    { path: '/products/:id', component: () => import('./pages/product-detail.js').then(m => m.default) },
    { path: '/orders', component: () => import('./pages/orders.js').then(m => m.default) },
    { path: '/orders/:id', component: () => import('./pages/order-detail.js').then(m => m.default) },
    { path: '/customers', component: () => import('./pages/customers.js').then(m => m.default) },
    { path: '/customers/:id', component: () => import('./pages/customer-detail.js').then(m => m.default) },
    { path: '/inventory', component: () => import('./pages/inventory.js').then(m => m.default) },
    { path: '/promotions', component: () => import('./pages/promotions.js').then(m => m.default) },
    { path: '/media-library', component: () => import('./pages/media-library.js').then(m => m.default) },
    { path: '/support', component: () => import('./pages/support.js').then(m => m.default) },
    { path: '/store-settings', component: () => import('./pages/store-settings.js').then(m => m.default) },
    { path: '/login', component: () => import('./pages/login.js').then(m => m.default) },
    { path: '/:404', component: () => import('./pages/not-found.js').then(m => m.default) }
  ]
});

const navSections = [
  {
    label: 'DASHBOARD',
    items: [
      { href: '/', ic: 'layout-dashboard', label: 'Overview' },
      { href: '/analytics', ic: 'bar-chart', label: 'Analytics' },
    ]
  },
  {
    label: 'CATALOG',
    items: [
      { href: '/products', ic: 'package', label: 'Products' },
      { href: '/inventory', ic: 'warehouse', label: 'Inventory' },
      { href: '/media-library', ic: 'image', label: 'Media Library' },
      { href: '/promotions', ic: 'tag', label: 'Promotions' },
    ]
  },
  {
    label: 'ORDERS',
    items: [
      { href: '/orders', ic: 'shopping-cart', label: 'Orders' },
      { href: '/customers', ic: 'users', label: 'Customers' },
      { href: '/support', ic: 'headphones', label: 'Support' },
    ]
  },
  {
    label: 'SETTINGS',
    items: [
      { href: '/store-settings', ic: 'settings', label: 'Store Settings' },
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
    return item ? item.label : 'Store';
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

  return Shell({ config: 'sidebar-main', navState, onNavStateChange: setNavState, class: css('_h[100vh]') },

    Shell.Nav({ class: css('_flex _col _gap1 d-glass _borderR') },
      div({ class: css('_flex _aic _jcsb _px4 _py3 _mb2') },
        cond(() => navState() !== 'rail',
          () => span({ class: css('d-gradient-text _heading5 _bold') }, 'Store Admin'),
          () => icon('shopping-bag', { size: '1em' })
        ),
        Button({ variant: 'ghost', size: 'sm', onclick: () => setNavState(navState() === 'expanded' ? 'rail' : 'expanded') },
          icon('panel-left', { size: '1em' })
        )
      ),
      div({ class: css('_flex _col _gap1 _flex1 _overflow[auto] d-stagger') },
        ...navSections.map(section =>
          div({ class: css('_flex _col _gap1 _mb3') },
            cond(() => navState() !== 'rail',
              () => span({ class: css('_textxs _bold _fgmuted _px3 _mb1') }, section.label)
            ),
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
      div({ class: css('_px4 _py3 _borderT _flex _aic _gap2') },
        div({ class: css('_w[8px] _h[8px] _rfull _bgsuccess') }),
        cond(() => navState() !== 'rail', () => span({ class: css('_textxs _fgmuted') }, 'Store Online'))
      )
    ),

    Shell.Header({ class: css('_flex _aic _jcsb _px6 d-glass _borderB') },
      Breadcrumb({ items: () => [
        { label: 'Store', href: '/' },
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
            span({ class: css('_fgmuted _textsm') }, '3 new orders today.')
          )
        ),
        Dropdown({
          trigger: () => Button({ variant: 'ghost', size: 'sm' }, icon('user', { size: '1em' })),
          align: 'right',
          items: [
            { label: 'Profile', icon: 'user' },
            { label: 'Store Settings', icon: 'settings', onSelect: () => navigate('/store-settings') },
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

    Shell.Body({ class: css('_flex _col _gap4 _p5 _overflow[auto] _flex1') },
      router.outlet()
    )
  );
}

mount(document.getElementById('app'), App);
