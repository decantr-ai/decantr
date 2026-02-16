/**
 * Dashboard scaffold: sidebar + header + pages (Overview, Data, Settings).
 */

export function dashboardFiles(opts) {
  return [
    ['src/app.js', appJs(opts)],
    ['src/components/sidebar.js', sidebarJs()],
    ['src/components/header.js', headerJs()],
    ['src/components/stats-card.js', statsCardJs()],
    ['src/pages/overview.js', overviewJs()],
    ['src/pages/data.js', dataJs()],
    ['src/pages/settings.js', settingsJs()],
    ['test/overview.test.js', overviewTestJs()]
  ];
}

function appJs(opts) {
  return `import { h, mount } from 'decantr/core';
import { createRouter } from 'decantr/router';
import { setTheme } from 'decantr/css';
import { setStyle } from 'decantr/css';
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
    { path: '/', component: Overview },
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

function sidebarJs() {
  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { link } from 'decantr/router';
import { Button } from 'decantr/components';

export function Sidebar({ router }) {
  const [collapsed, setCollapsed] = createSignal(false);

  const navItems = [
    { href: '/', label: 'Overview' },
    { href: '/data', label: 'Data' },
    { href: '/settings', label: 'Settings' }
  ];

  return h('aside', {
    style: {
      width: '240px', background: 'var(--c2)', borderRight: '1px solid var(--c5)',
      display: 'flex', flexDirection: 'column', transition: 'width 0.2s ease',
      flexShrink: '0'
    }
  },
    h('div', { style: { padding: '1.25rem', fontWeight: '700', fontSize: '1.125rem', color: 'var(--c1)' } }, 'decantr'),
    h('nav', { style: { flex: '1', padding: '0.5rem' } },
      ...navItems.map(item =>
        link({
          href: item.href,
          style: {
            display: 'block', padding: '0.625rem 1rem', borderRadius: '6px',
            color: 'var(--c3)', marginBottom: '0.25rem', transition: 'background 0.15s ease'
          }
        }, item.label)
      )
    ),
    h('div', { style: { padding: '1rem', borderTop: '1px solid var(--c5)' } },
      Button({ variant: 'ghost', block: true, onclick: () => setCollapsed(c => !c) }, 'Toggle')
    )
  );
}
`;
}

function headerJs() {
  return `import { h } from 'decantr/core';

export function Header({ title }) {
  return h('header', {
    style: {
      padding: '1rem 1.5rem', background: 'var(--c2)', borderBottom: '1px solid var(--c5)',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between'
    }
  },
    h('h1', { style: { fontSize: '1.25rem', fontWeight: '600' } }, title),
    h('div', { style: { display: 'flex', gap: '0.75rem', alignItems: 'center' } },
      h('span', { style: { color: 'var(--c4)', fontSize: '0.875rem' } }, 'Welcome back')
    )
  );
}
`;
}

function statsCardJs() {
  return `import { h, text } from 'decantr/core';
import { Card, Badge } from 'decantr/components';

export function StatsCard({ title, value, change, status }) {
  const isUp = change && change.startsWith('+');

  return Card({ hoverable: true },
    h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' } },
      h('div', null,
        h('p', { style: { color: 'var(--c4)', fontSize: '0.875rem', marginBottom: '0.5rem' } }, title),
        h('p', { style: { fontSize: '1.75rem', fontWeight: '700' } },
          typeof value === 'function' ? text(value) : value
        )
      ),
      change ? Badge({ status: isUp ? 'success' : 'error', count: change }) : null
    )
  );
}
`;
}

function overviewJs() {
  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { StatsCard } from '../components/stats-card.js';
import { Card } from 'decantr/components';

export function Overview() {
  const stats = [
    { title: 'Total Users', value: '12,847', change: '+12%', status: 'success' },
    { title: 'Revenue', value: '$48,290', change: '+8%', status: 'success' },
    { title: 'Active Sessions', value: '1,429', change: '-3%', status: 'error' },
    { title: 'Conversion', value: '3.24%', change: '+0.5%', status: 'success' }
  ];

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
      h('p', { style: { color: 'var(--c4)' } }, 'Chart placeholder — integrate your preferred charting library here.'),
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

function dataJs() {
  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Card, Button, Badge, Input } from 'decantr/components';

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
        Input({ placeholder: 'Search...', oninput: e => setSearch(e.target ? e.target.value : '') }),
        Button({ variant: 'primary' }, 'Add User')
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
                  Button({ size: 'sm' }, 'Edit'),
                  Button({ size: 'sm', variant: 'destructive' }, 'Delete')
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

function settingsJs() {
  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Card, Button, Input } from 'decantr/components';

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
        Button({ variant: 'primary', onclick: handleSave }, 'Save Changes'),
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
