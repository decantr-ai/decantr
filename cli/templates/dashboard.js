/**
 * Dashboard scaffold: sidebar + header + pages (Welcome, Overview, Data, Settings).
 */

import { welcomeJs, iconName, iconExpr, iconImport } from './shared.js';

export function dashboardFiles(opts) {
  return [
    ['src/app.js', appJs(opts)],
    ['src/components/sidebar.js', sidebarJs(opts)],
    ['src/components/header.js', headerJs(opts)],
    ['src/components/stats-card.js', statsCardJs(opts)],
    ['src/pages/welcome.js', welcomeJs(opts)],
    ['src/pages/overview.js', overviewJs(opts)],
    ['src/pages/data.js', dataJs(opts)],
    ['src/pages/settings.js', settingsJs(opts)],
    ['test/overview.test.js', overviewTestJs()]
  ];
}

function appJs(opts) {
  return `import { h, mount } from 'decantr/core';
import { createRouter } from 'decantr/router';
import { setTheme } from 'decantr/css';
import { setStyle } from 'decantr/css';
import { Welcome } from './pages/welcome.js';
import { Overview } from './pages/overview.js';
import { DataPage } from './pages/data.js';
import { Settings } from './pages/settings.js';
import { Sidebar } from './components/sidebar.js';
import { Header } from './components/header.js';

setTheme('${opts.theme}');
setStyle('${opts.style}');

const router = createRouter({
  mode: '${opts.router}',
  routes: [
    { path: '/', component: Welcome },
    { path: '/overview', component: Overview },
    { path: '/data', component: DataPage },
    { path: '/settings', component: Settings }
  ]
});

function App() {
  return h('div', { style: { display: 'flex', minHeight: '100vh' } },
    Sidebar({ router }),
    h('div', { style: { flex: '1', display: 'flex', flexDirection: 'column' } },
      Header({ title: 'Dashboard' }),
      h('main', { style: { flex: '1', padding: '1.5rem', background: 'var(--c0)' } },
        router.outlet()
      )
    )
  );
}

mount(document.getElementById('app'), App);
`;
}

function sidebarJs(opts) {
  const hasIcons = !!opts.icons;
  const navIconSemantics = ['home', 'dashboard', 'table', 'settings'];

  const navItemsDef = hasIcons
    ? `  const navItems = [
    { href: '/', label: 'Welcome', icon: '${iconName('home', opts)}' },
    { href: '/overview', label: 'Overview', icon: '${iconName('dashboard', opts)}' },
    { href: '/data', label: 'Data', icon: '${iconName('table', opts)}' },
    { href: '/settings', label: 'Settings', icon: '${iconName('settings', opts)}' }
  ];`
    : `  const navItems = [
    { href: '/', label: 'Welcome' },
    { href: '/overview', label: 'Overview' },
    { href: '/data', label: 'Data' },
    { href: '/settings', label: 'Settings' }
  ];`;

  const navLinkContent = hasIcons
    ? `        link({
          href: item.href,
          style: {
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            padding: '0.625rem 1rem', borderRadius: '6px',
            color: 'var(--c3)', marginBottom: '0.25rem', transition: 'background 0.15s ease'
          }
        }, icon(item.icon, { size: '1.125em', 'aria-hidden': 'true' }), item.label)`
    : `        link({
          href: item.href,
          style: {
            display: 'block', padding: '0.625rem 1rem', borderRadius: '6px',
            color: 'var(--c3)', marginBottom: '0.25rem', transition: 'background 0.15s ease'
          }
        }, item.label)`;

  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { link } from 'decantr/router';
import { Button } from 'decantr/components';
${iconImport(opts)}
export function Sidebar({ router }) {
  const [collapsed, setCollapsed] = createSignal(false);

${navItemsDef}

  return h('aside', {
    style: {
      width: '240px', background: 'var(--c2)', borderRight: '1px solid var(--c5)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease',
      flexShrink: '0'
    }
  },
    h('div', { style: { padding: '1.25rem', fontWeight: '700', fontSize: '1.125rem', color: 'var(--c1)' } }, '${opts.name}'),
    h('nav', { style: { flex: '1', padding: '0.5rem' } },
      ...navItems.map(item =>
${navLinkContent}
      )
    ),
    h('div', { style: { padding: '1rem', borderTop: '1px solid var(--c5)' } },
      Button({ variant: 'ghost', block: true, onclick: () => setCollapsed(c => !c) }, 'Toggle')
    )
  );
}
`;
}

function headerJs(opts) {
  const hasIcons = !!opts.icons;

  const headerRight = hasIcons
    ? `      Badge({ count: 3 },
        Button({ variant: 'ghost', 'aria-label': 'Notifications' }, ${iconExpr('bell', opts)})
      ),
      Button({ variant: 'ghost', 'aria-label': 'User profile' }, ${iconExpr('user', opts)}),
      h('span', { style: { color: 'var(--c4)', fontSize: '0.875rem' } }, 'Welcome back')`
    : `      h('span', { style: { color: 'var(--c4)', fontSize: '0.875rem' } }, 'Welcome back')`;

  const headerImports = hasIcons
    ? `import { h } from 'decantr/core';
import { Button, Badge } from 'decantr/components';
${iconImport(opts)}`
    : `import { h } from 'decantr/core';`;

  return `${headerImports}
export function Header({ title }) {
  return h('header', {
    style: {
      padding: '1rem 1.5rem', background: 'var(--c2)', borderBottom: '1px solid var(--c5)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }
  },
    h('h1', { style: { fontSize: '1.25rem', fontWeight: '600' } }, title),
    h('div', { style: { display: 'flex', gap: '0.75rem', alignItems: 'center' } },
${headerRight}
    )
  );
}
`;
}

function statsCardJs(opts) {
  const hasIcons = !!opts.icons;

  const trendIcon = hasIcons
    ? `
      const trendIcon = isUp
        ? ${iconExpr('trending-up', opts, { size: '0.875em', 'aria-hidden': 'true' })}
        : ${iconExpr('trending-down', opts, { size: '0.875em', 'aria-hidden': 'true' })};`
    : '';

  const badgeContent = hasIcons
    ? `      change ? h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' } },
        Badge({ status: isUp ? 'success' : 'error', count: change }),
        trendIcon
      ) : null`
    : `      change ? Badge({ status: isUp ? 'success' : 'error', count: change }) : null`;

  const categoryIconProp = hasIcons
    ? `\n      categoryIcon ? h('div', { style: { color: 'var(--c4)' } }, categoryIcon) : null`
    : '';

  const fnParams = hasIcons
    ? `{ title, value, change, status, categoryIcon }`
    : `{ title, value, change, status }`;

  return `import { h, text } from 'decantr/core';
import { Card, Badge } from 'decantr/components';
${iconImport(opts)}
export function StatsCard(${fnParams}) {
  const isUp = change && change.startsWith('+');
${trendIcon}
  return Card({ hoverable: true },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
      h('div', null,
        h('p', { style: { color: 'var(--c4)', fontSize: '0.875rem', marginBottom: '0.5rem' } }, title),
        h('p', { style: { fontSize: '1.75rem', fontWeight: '700' } },
          typeof value === 'function' ? text(value) : value
        )
      ),
      h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' } },
${badgeContent},
${categoryIconProp}
      )
    )
  );
}
`;
}

function overviewJs(opts) {
  const hasIcons = !!opts.icons;

  const categoryIcons = ['users', 'dollar', 'activity', 'chart'];

  const statsDef = hasIcons
    ? `  const categoryIcons = [
    ${categoryIcons.map(name => iconExpr(name, opts, { size: '1.5em', 'aria-hidden': 'true' })).join(',\n    ')}
  ];

  const stats = [
    { title: 'Total Users', value: '12,847', change: '+12%', status: 'success', categoryIcon: categoryIcons[0] },
    { title: 'Revenue', value: '$48,290', change: '+8%', status: 'success', categoryIcon: categoryIcons[1] },
    { title: 'Active Sessions', value: '1,429', change: '-3%', status: 'error', categoryIcon: categoryIcons[2] },
    { title: 'Conversion', value: '3.24%', change: '+0.5%', status: 'success', categoryIcon: categoryIcons[3] }
  ];`
    : `  const stats = [
    { title: 'Total Users', value: '12,847', change: '+12%', status: 'success' },
    { title: 'Revenue', value: '$48,290', change: '+8%', status: 'success' },
    { title: 'Active Sessions', value: '1,429', change: '-3%', status: 'error' },
    { title: 'Conversion', value: '3.24%', change: '+0.5%', status: 'success' }
  ];`;

  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { StatsCard } from '../components/stats-card.js';
import { Card } from 'decantr/components';
${iconImport(opts)}
export function Overview() {
${statsDef}

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' } }, 'Overview'),
    h('div', {
      style: {
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem', marginBottom: '1.5rem'
      }
    },
      ...stats.map(s => StatsCard(s))
    ),
    Card({ title: 'Recent Activity' },
      h('p', { style: { color: 'var(--c4)' } }, 'Chart placeholder \\u2014 integrate your preferred charting library here.'),
      h('div', {
        style: {
          height: '200px', background: 'var(--c2)', borderRadius: '8px',
          marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px dashed var(--c5)'
        }
      }, h('span', { style: { color: 'var(--c4)' } }, 'Chart Area'))
    )
  );
}
`;
}

function dataJs(opts) {
  const hasIcons = !!opts.icons;

  const searchInput = hasIcons
    ? `Input({ placeholder: 'Search...', prefix: ${iconExpr('search', opts, { size: '1em', 'aria-hidden': 'true' })}, oninput: e => setSearch(e.target ? e.target.value : '') })`
    : `Input({ placeholder: 'Search...', oninput: e => setSearch(e.target ? e.target.value : '') })`;

  const addUserBtn = hasIcons
    ? `Button({ variant: 'primary' }, ${iconExpr('user-plus', opts)}, ' Add User')`
    : `Button({ variant: 'primary' }, 'Add User')`;

  const actionBtns = hasIcons
    ? `                  Button({ size: 'sm', 'aria-label': 'Edit' }, ${iconExpr('edit', opts)}),
                  Button({ size: 'sm', variant: 'destructive', 'aria-label': 'Delete' }, ${iconExpr('delete', opts)})`
    : `                  Button({ size: 'sm' }, 'Edit'),
                  Button({ size: 'sm', variant: 'destructive' }, 'Delete')`;

  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Card, Button, Badge, Input } from 'decantr/components';
${iconImport(opts)}
const mockData = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Editor', status: 'Active' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', role: 'Viewer', status: 'Inactive' },
  { id: 4, name: 'Dave Brown', email: 'dave@example.com', role: 'Editor', status: 'Active' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', role: 'Admin', status: 'Active' }
];

export function DataPage() {
  const [search, setSearch] = createSignal('');

  const cellStyle = { padding: '0.75rem 1rem', borderBottom: '1px solid var(--c5)' };
  const headerStyle = { ...cellStyle, fontWeight: '600', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--c4)' };

  return h('div', null,
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' } },
      h('h2', { style: { fontSize: '1.5rem', fontWeight: '600' } }, 'Data Table'),
      h('div', { style: { display: 'flex', gap: '0.75rem' } },
        ${searchInput},
        ${addUserBtn}
      )
    ),
    Card({},
      h('table', { style: { width: '100%', borderCollapse: 'collapse' } },
        h('thead', null,
          h('tr', null,
            h('th', { style: headerStyle }, 'Name'),
            h('th', { style: headerStyle }, 'Email'),
            h('th', { style: headerStyle }, 'Role'),
            h('th', { style: headerStyle }, 'Status'),
            h('th', { style: headerStyle }, 'Actions')
          )
        ),
        h('tbody', null,
          ...mockData.map(row =>
            h('tr', null,
              h('td', { style: cellStyle }, row.name),
              h('td', { style: cellStyle }, row.email),
              h('td', { style: cellStyle }, row.role),
              h('td', { style: cellStyle },
                Badge({ status: row.status === 'Active' ? 'success' : 'warning', dot: true },
                  h('span', null, row.status)
                )
              ),
              h('td', { style: cellStyle },
                h('div', { style: { display: 'flex', gap: '0.5rem' } },
${actionBtns}
                )
              )
            )
          )
        )
      )
    )
  );
}
`;
}

function settingsJs(opts) {
  const hasIcons = !!opts.icons;

  const saveBtn = hasIcons
    ? `Button({ variant: 'primary', onclick: handleSave }, ${iconExpr('save', opts)}, ' Save Changes')`
    : `Button({ variant: 'primary', onclick: handleSave }, 'Save Changes')`;

  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Card, Button, Input } from 'decantr/components';
${iconImport(opts)}
export function Settings() {
  const [name, setName] = createSignal('John Doe');
  const [email, setEmail] = createSignal('john@example.com');
  const [saved, setSaved] = createSignal(false);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const fieldStyle = { marginBottom: '1rem' };
  const labelStyle = { display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem', color: 'var(--c3)' };

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' } }, 'Settings'),
    Card({ title: 'Profile' },
      h('div', { style: fieldStyle },
        h('label', { style: labelStyle }, 'Full Name'),
        Input({ value: name, oninput: e => setName(e.target ? e.target.value : '') })
      ),
      h('div', { style: fieldStyle },
        h('label', { style: labelStyle }, 'Email'),
        Input({ type: 'email', value: email, oninput: e => setEmail(e.target ? e.target.value : '') })
      ),
      h('div', { style: { display: 'flex', gap: '0.75rem', alignItems: 'center' } },
        ${saveBtn},
        Button({ variant: 'ghost' }, 'Cancel')
      )
    )
  );
}
`;
}

function overviewTestJs() {
  return `import { describe, it, assert, render, flush } from 'decantr/test';
import { Overview } from '../src/pages/overview.js';

describe('Overview', () => {
  it('renders stats cards', () => {
    const { container } = render(() => Overview());
    assert.ok(container.textContent.includes('Total Users'));
    assert.ok(container.textContent.includes('12,847'));
  });

  it('renders recent activity card', () => {
    const { container } = render(() => Overview());
    assert.ok(container.textContent.includes('Recent Activity'));
  });
});
`;
}
