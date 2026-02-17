/**
 * Demo mode scaffold: multi-page showcase of all themes, styles, and components.
 */

import { welcomeJs, iconName, iconExpr, iconImport } from './shared.js';

export function demoFiles(opts) {
  return [
    ['src/app.js', appJs(opts)],
    ['src/pages/welcome.js', welcomeJs(opts)],
    ['src/pages/home.js', homeJs()],
    ['src/pages/buttons.js', buttonsJs(opts)],
    ['src/pages/inputs.js', inputsJs(opts)],
    ['src/pages/cards.js', cardsJs(opts)],
    ['src/pages/badges.js', badgesJs(opts)],
    ['src/pages/modals.js', modalsJs(opts)],
    ['src/pages/forms.js', formsJs()],
    ['src/pages/layout.js', layoutJs()],
    ['src/pages/data.js', dataJs()],
    ['src/pages/feedback.js', feedbackJs()],
    ['src/pages/blocks.js', blocksJs()]
  ];
}

function appJs(opts) {
  return `import { h, mount } from 'decantr/core';
import { createRouter, link } from 'decantr/router';
import { setTheme } from 'decantr/css';
import { setStyle } from 'decantr/css';
import { Welcome } from './pages/welcome.js';
import { Home } from './pages/home.js';
import { ButtonsPage } from './pages/buttons.js';
import { InputsPage } from './pages/inputs.js';
import { CardsPage } from './pages/cards.js';
import { BadgesPage } from './pages/badges.js';
import { ModalsPage } from './pages/modals.js';
import { FormsPage } from './pages/forms.js';
import { LayoutPage } from './pages/layout.js';
import { DataPage } from './pages/data.js';
import { FeedbackPage } from './pages/feedback.js';
import { BlocksPage } from './pages/blocks.js';

setTheme('${opts.theme}');
setStyle('${opts.style}');

const router = createRouter({
  mode: '${opts.router}',
  routes: [
    { path: '/', component: Welcome },
    { path: '/home', component: Home },
    { path: '/buttons', component: ButtonsPage },
    { path: '/inputs', component: InputsPage },
    { path: '/cards', component: CardsPage },
    { path: '/badges', component: BadgesPage },
    { path: '/modals', component: ModalsPage },
    { path: '/forms', component: FormsPage },
    { path: '/layout', component: LayoutPage },
    { path: '/data', component: DataPage },
    { path: '/feedback', component: FeedbackPage },
    { path: '/blocks', component: BlocksPage }
  ]
});

const navItems = [
  { href: '/', label: 'Welcome' },
  { href: '/home', label: 'Showcase' },
  { href: '/buttons', label: 'Buttons' },
  { href: '/inputs', label: 'Inputs' },
  { href: '/cards', label: 'Cards' },
  { href: '/badges', label: 'Badges' },
  { href: '/modals', label: 'Modals' },
  { href: '/forms', label: 'Forms' },
  { href: '/layout', label: 'Layout' },
  { href: '/data', label: 'Data' },
  { href: '/feedback', label: 'Feedback' },
  { href: '/blocks', label: 'Blocks' }
];

function App() {
  return h('div', null,
    h('nav', {
      style: {
        display: 'flex', gap: '0.25rem', padding: '0.75rem 1.5rem', background: 'var(--c2)',
        borderBottom: '1px solid var(--c5)', flexWrap: 'wrap', alignItems: 'center'
      }
    },
      h('span', { style: { fontWeight: '700', color: 'var(--c1)', marginRight: '1rem' } }, '${opts.name}'),
      ...navItems.map(item =>
        link({
          href: item.href,
          style: { padding: '0.375rem 0.75rem', borderRadius: '6px', color: 'var(--c3)', fontSize: '0.875rem' }
        }, item.label)
      )
    ),
    h('main', { style: { padding: '2rem', maxWidth: '960px', margin: '0 auto' } },
      router.outlet()
    )
  );
}

mount(document.getElementById('app'), App);
`;
}

function homeJs() {
  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { setTheme, getTheme, getThemeList } from 'decantr/css';
import { setStyle, getStyle, getStyleList } from 'decantr/css';
import { Card, Button } from 'decantr/components';

export function Home() {
  const themeList = getThemeList();
  const styleList = getStyleList();
  const activeTheme = getTheme();
  const activeStyle = getStyle();

  function makeSelect(items, current, onChange) {
    const sel = document.createElement('select');
    sel.style.cssText = 'padding:0.5rem;border:1px solid var(--c5);border-radius:6px;background:var(--c0);color:var(--c3);font:inherit;cursor:pointer';
    for (const item of items) {
      const opt = document.createElement('option');
      opt.value = item.id;
      opt.textContent = item.name;
      if (item.id === current()) opt.selected = true;
      sel.appendChild(opt);
    }
    sel.addEventListener('change', (e) => onChange(e.target.value));
    return sel;
  }

  return h('div', null,
    h('h1', { style: { fontSize: '2rem', fontWeight: '700', marginBottom: '0.5rem' } }, 'Component Showcase'),
    h('p', { style: { color: 'var(--c4)', marginBottom: '2rem' } }, 'Switch themes and styles to see all components adapt in real-time.'),
    Card({},
      h('div', { style: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' } },
        h('div', null,
          h('label', { style: { display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' } }, 'Theme'),
          makeSelect(themeList, activeTheme, id => setTheme(id))
        ),
        h('div', null,
          h('label', { style: { display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.375rem' } }, 'Style'),
          makeSelect(styleList, activeStyle, id => setStyle(id))
        )
      )
    ),
    h('div', { style: { marginTop: '2rem' } },
      h('h2', { style: { fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' } }, 'Quick Preview'),
      h('div', { style: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' } },
        Button({ variant: 'primary' }, 'Primary'),
        Button({ variant: 'secondary' }, 'Secondary'),
        Button({ variant: 'destructive' }, 'Destructive'),
        Button({ variant: 'success' }, 'Success'),
        Button({ variant: 'warning' }, 'Warning'),
        Button({ variant: 'outline' }, 'Outline'),
        Button({ variant: 'ghost' }, 'Ghost'),
        Button({ variant: 'link' }, 'Link')
      )
    )
  );
}
`;
}

function buttonsJs(opts) {
  const hasIcons = !!opts.icons;

  const iconSection = hasIcons
    ? `,
    section('With Icons',
      Button({ variant: 'primary' }, ${iconExpr('save', opts)}, ' Save'),
      Button({ variant: 'destructive' }, ${iconExpr('delete', opts)}, ' Delete'),
      Button({ 'aria-label': 'Search' }, ${iconExpr('search', opts)}),
      Button({ variant: 'ghost', 'aria-label': 'Settings' }, ${iconExpr('settings', opts)})
    )`
    : '';

  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Button } from 'decantr/components';
${iconImport(opts)}
export function ButtonsPage() {
  const [loading, setLoading] = createSignal(false);

  function section(title, ...children) {
    return h('div', { style: { marginBottom: '2rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, title),
      h('div', { style: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' } }, ...children)
    );
  }

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Buttons'),
    section('Variants',
      Button({ variant: 'primary' }, 'Primary'),
      Button({}, 'Default'),
      Button({ variant: 'secondary' }, 'Secondary'),
      Button({ variant: 'destructive' }, 'Destructive'),
      Button({ variant: 'success' }, 'Success'),
      Button({ variant: 'warning' }, 'Warning'),
      Button({ variant: 'outline' }, 'Outline'),
      Button({ variant: 'ghost' }, 'Ghost'),
      Button({ variant: 'link' }, 'Link')
    ),
    section('Sizes',
      Button({ variant: 'primary', size: 'sm' }, 'Small'),
      Button({ variant: 'primary' }, 'Default'),
      Button({ variant: 'primary', size: 'lg' }, 'Large')
    ),
    section('States',
      Button({ variant: 'primary', disabled: true }, 'Disabled'),
      Button({ variant: 'primary', loading: loading, onclick: () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
      }}, 'Click to Load'),
      Button({ variant: 'primary', block: true }, 'Block Button')
    )${iconSection}
  );
}
`;
}

function inputsJs(opts) {
  const hasIcons = !!opts.icons;

  const iconPrefixSection = hasIcons
    ? `,
    section('Icon Prefixes',
      Input({ prefix: ${iconExpr('search', opts)}, placeholder: 'Search...' }),
      Input({ prefix: ${iconExpr('mail', opts)}, type: 'email', placeholder: 'Email address' }),
      Input({ prefix: ${iconExpr('lock', opts)}, type: 'password', placeholder: 'Password' })
    )`
    : '';

  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Input } from 'decantr/components';
${iconImport(opts)}
export function InputsPage() {
  const [val, setVal] = createSignal('');
  const [err, setErr] = createSignal(false);

  function section(title, ...children) {
    return h('div', { style: { marginBottom: '2rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, title),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' } }, ...children)
    );
  }

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Inputs'),
    section('Types',
      Input({ placeholder: 'Text input' }),
      Input({ type: 'email', placeholder: 'Email input' }),
      Input({ type: 'password', placeholder: 'Password input' }),
      Input({ type: 'number', placeholder: 'Number input' }),
      Input({ type: 'search', placeholder: 'Search...' })
    ),
    section('States',
      Input({ placeholder: 'Normal' }),
      Input({ disabled: true, value: 'Disabled input' }),
      Input({ readonly: true, value: 'Read-only input' }),
      Input({ error: true, placeholder: 'Error state' })
    ),
    section('Prefix & Suffix',
      Input({ prefix: '$', placeholder: '0.00' }),
      Input({ suffix: '@gmail.com', placeholder: 'username' }),
      Input({ prefix: 'https://', suffix: '.com', placeholder: 'domain' })
    )${iconPrefixSection}
  );
}
`;
}

function cardsJs(opts) {
  const hasIcons = !!opts.icons;

  const iconCard = hasIcons
    ? `,
      Card({},
        Card.Header({},
          h('div', { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
            ${iconExpr('settings', opts)}, 'With Icon'
          )
        ),
        Card.Body({},
          h('p', { style: { color: 'var(--c4)' } }, 'Cards can include icons in their headers for visual context.')
        )
      )`
    : '';

  return `import { h } from 'decantr/core';
import { Card, Button } from 'decantr/components';
${iconImport(opts)}
export function CardsPage() {
  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Cards'),
    h('div', {
      style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }
    },
      Card({ title: 'Simple Card' },
        h('p', { style: { color: 'var(--c4)' } }, 'A basic card with a title prop and content body.')
      ),
      Card({ hoverable: true },
        Card.Header({}, 'Hoverable Card'),
        Card.Body({},
          h('p', { style: { color: 'var(--c4)' } }, 'Hover over this card to see the effect. Uses composable sections.')
        ),
        Card.Footer({},
          Button({ variant: 'primary', size: 'sm' }, 'Action'),
          Button({ size: 'sm' }, 'Cancel')
        )
      ),
      Card({},
        Card.Body({},
          h('h3', { style: { fontWeight: '600', marginBottom: '0.5rem' } }, 'No Header'),
          h('p', { style: { color: 'var(--c4)' } }, 'A card with just a body section. Clean and minimal.')
        )
      )${iconCard}
    )
  );
}
`;
}

function badgesJs(opts) {
  const hasIcons = !!opts.icons;

  const iconWrappedSection = hasIcons
    ? `,
    section('Icon Buttons',
      Badge({ count: 3 },
        Button({ 'aria-label': 'Notifications' }, ${iconExpr('bell', opts)})
      )
    )`
    : '';

  return `import { h } from 'decantr/core';
import { Badge, Button } from 'decantr/components';
${iconImport(opts)}
export function BadgesPage() {
  function section(title, ...children) {
    return h('div', { style: { marginBottom: '2rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, title),
      h('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' } }, ...children)
    );
  }

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Badges'),
    section('Standalone',
      Badge({ count: 5 }),
      Badge({ count: 42 }),
      Badge({ count: 'New' }),
      Badge({ count: 99 })
    ),
    section('Status',
      Badge({ status: 'success', count: 'Active' }),
      Badge({ status: 'error', count: 'Error' }),
      Badge({ status: 'warning', count: 'Warning' }),
      Badge({ status: 'processing', count: 'Syncing' })
    ),
    section('Dots',
      Badge({ dot: true, status: 'success' }, h('span', null, 'Online')),
      Badge({ dot: true, status: 'error' }, h('span', null, 'Offline')),
      Badge({ dot: true, status: 'processing' }, h('span', null, 'Syncing'))
    ),
    section('Wrapped',
      Badge({ count: 3 }, Button({}, 'Messages')),
      Badge({ count: 12 }, Button({ variant: 'primary' }, 'Notifications'))
    )${iconWrappedSection}
  );
}
`;
}

function modalsJs(opts) {
  const hasIcons = !!opts.icons;

  const confirmBtn = hasIcons
    ? `Button({ variant: 'destructive', onclick: () => setConfirm(true) }, ${iconExpr('alert', opts)}, ' Confirm Modal')`
    : `Button({ variant: 'destructive', onclick: () => setConfirm(true) }, 'Confirm Modal')`;

  const confirmBody = hasIcons
    ? `      h('div', { style: { display: 'flex', gap: '0.75rem', alignItems: 'flex-start' } },
        h('div', { style: { color: 'var(--c9)', flexShrink: '0', marginTop: '0.125rem' } }, ${iconExpr('alert', opts, { size: '1.5em', 'aria-hidden': 'true' })}),
        h('p', null, 'This action cannot be undone. This will permanently delete the item.')
      )`
    : `      h('p', null, 'This action cannot be undone. This will permanently delete the item.')`;

  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Button, Modal, Card } from 'decantr/components';
${iconImport(opts)}
export function ModalsPage() {
  const [basic, setBasic] = createSignal(false);
  const [form, setForm] = createSignal(false);
  const [confirm, setConfirm] = createSignal(false);

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Modals'),
    h('div', { style: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem' } },
      Button({ variant: 'primary', onclick: () => setBasic(true) }, 'Basic Modal'),
      Button({ onclick: () => setForm(true) }, 'Form Modal'),
      ${confirmBtn}
    ),
    Card({},
      h('p', { style: { color: 'var(--c4)' } }, 'Click the buttons above to open different modal types. Modals support title, close button, click-outside-to-close, and Escape key.')
    ),
    Modal({ visible: basic, title: 'Basic Modal', onClose: () => setBasic(false) },
      h('p', null, 'This is a basic modal with a title and close button.'),
      h('p', { style: { color: 'var(--c4)', marginTop: '0.75rem' } }, 'Click outside or press Escape to close.')
    ),
    Modal({ visible: form, title: 'Form Modal', onClose: () => setForm(false), width: '520px' },
      h('p', { style: { marginBottom: '1rem' } }, 'Modals can contain any content, including forms and interactive elements.'),
      h('div', { style: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' } },
        Button({ onclick: () => setForm(false) }, 'Cancel'),
        Button({ variant: 'primary', onclick: () => setForm(false) }, 'Submit')
      )
    ),
    Modal({ visible: confirm, title: 'Are you sure?', onClose: () => setConfirm(false), width: '400px' },
${confirmBody},
      h('div', { style: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' } },
        Button({ onclick: () => setConfirm(false) }, 'Cancel'),
        Button({ variant: 'destructive', onclick: () => setConfirm(false) }, 'Delete')
      )
    )
  );
}
`;
}

function formsJs() {
  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Textarea, Checkbox, Switch, Select, Card } from 'decantr/components';

export function FormsPage() {
  const [checked, setChecked] = createSignal(false);
  const [switchOn, setSwitchOn] = createSignal(false);
  const [selectVal, setSelectVal] = createSignal('');

  function section(title, ...children) {
    return h('div', { style: { marginBottom: '2rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, title),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' } }, ...children)
    );
  }

  function row(...children) {
    return h('div', { style: { display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' } }, ...children);
  }

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Form Components'),
    section('Textarea',
      Textarea({ placeholder: 'Write something...' }),
      Textarea({ placeholder: 'With 6 rows', rows: 6 }),
      Textarea({ disabled: true, value: 'Disabled textarea' }),
      Textarea({ error: true, placeholder: 'Error state' })
    ),
    h('div', { style: { marginBottom: '2rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, 'Checkbox'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' } },
        row(Checkbox({ label: 'Accept terms' }), Checkbox({ label: 'Checked', checked: true }), Checkbox({ label: 'Disabled', disabled: true })),
        row(Checkbox({ label: 'Reactive', checked, onchange: v => setChecked(v) }), h('span', { style: { fontSize: '0.875rem', color: 'var(--c4)' } }, 'checked: ', h('strong', null, () => String(checked()))))
      )
    ),
    h('div', { style: { marginBottom: '2rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, 'Switch'),
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' } },
        row(Switch({ label: 'Dark mode' }), Switch({ label: 'Enabled', checked: true }), Switch({ label: 'Disabled', disabled: true })),
        row(Switch({ label: 'Reactive toggle', checked: switchOn, onchange: v => setSwitchOn(v) }), h('span', { style: { fontSize: '0.875rem', color: 'var(--c4)' } }, 'on: ', h('strong', null, () => String(switchOn()))))
      )
    ),
    section('Select',
      Select({ options: [{ value: 'react', label: 'React' }, { value: 'vue', label: 'Vue' }, { value: 'svelte', label: 'Svelte' }, { value: 'decantr', label: 'decantr' }], placeholder: 'Choose a framework', value: selectVal, onchange: v => setSelectVal(v) }),
      Select({ options: [{ value: 'sm', label: 'Small' }, { value: 'md', label: 'Medium' }, { value: 'lg', label: 'Large' }], value: 'md' }),
      Select({ options: [{ value: 'a', label: 'Disabled' }], disabled: true, value: 'a' }),
      Select({ options: [{ value: 'a', label: 'Alpha' }], error: true, placeholder: 'Error state' })
    )
  );
}
`;
}

function layoutJs() {
  return `import { h } from 'decantr/core';
import { Tabs, Accordion, Separator, Breadcrumb } from 'decantr/components';

export function LayoutPage() {
  function section(title, ...children) {
    return h('div', { style: { marginBottom: '2.5rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, title),
      ...children
    );
  }

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Layout Components'),
    section('Tabs',
      Tabs({ tabs: [
        { id: 'overview', label: 'Overview', content: () => h('p', null, 'This is the overview tab. Use arrow keys to navigate.') },
        { id: 'features', label: 'Features', content: () => h('ul', { style: { paddingLeft: '1.25rem' } }, h('li', null, 'Keyboard navigable'), h('li', null, 'ARIA roles'), h('li', null, 'Reactive active tab')) },
        { id: 'code', label: 'Code', content: () => h('pre', { style: { background: 'var(--c2)', padding: '1rem', borderRadius: '6px', fontSize: '0.875rem' } }, "Tabs({ tabs: [...] })") }
      ]})
    ),
    section('Accordion',
      Accordion({ items: [
        { id: 'what', title: 'What is decantr?', content: () => h('p', null, 'An AI-first web framework with zero dependencies.') },
        { id: 'themes', title: 'How do themes work?', content: () => h('p', null, 'Themes define CSS custom properties (--c0 through --c9) that all components use.') },
        { id: 'styles', title: 'What are design styles?', content: () => h('p', null, 'Styles control visual treatment — glass, flat, brutalist, skeuo, sketchy, and lava.') }
      ]})
    ),
    section('Separator',
      h('div', { style: { maxWidth: '400px' } },
        h('p', null, 'Content above'),
        Separator({}),
        h('p', null, 'Content below'),
        Separator({ label: 'OR' }),
        h('p', null, 'Alternative content'),
        h('div', { style: { display: 'flex', alignItems: 'center', height: '60px', gap: '1rem' } },
          h('span', null, 'Left'), Separator({ vertical: true }), h('span', null, 'Right')
        )
      )
    ),
    section('Breadcrumb',
      Breadcrumb({ items: [{ label: 'Home', href: '#/' }, { label: 'Components', href: '#/home' }, { label: 'Layout' }] }),
      h('div', { style: { marginTop: '1rem' } },
        Breadcrumb({ separator: '>', items: [{ label: 'Products', href: '#/' }, { label: 'Electronics', href: '#/' }, { label: 'Phones' }] })
      )
    )
  );
}
`;
}

function dataJs() {
  return `import { h } from 'decantr/core';
import { createSignal } from 'decantr/state';
import { Table, Avatar, Progress, Skeleton, Card, Button } from 'decantr/components';

export function DataPage() {
  const [progress, setProgress] = createSignal(45);

  function section(title, ...children) {
    return h('div', { style: { marginBottom: '2.5rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, title),
      ...children
    );
  }

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Data Display'),
    section('Table',
      Table({ striped: true, hoverable: true, columns: [
        { key: 'name', label: 'Name' },
        { key: 'role', label: 'Role' },
        { key: 'status', label: 'Status', render: (v) => h('span', { style: { color: v === 'Active' ? 'var(--c7)' : 'var(--c4)' } }, v) }
      ], data: [
        { name: 'Alice Johnson', role: 'Engineer', status: 'Active' },
        { name: 'Bob Smith', role: 'Designer', status: 'Active' },
        { name: 'Carol Williams', role: 'PM', status: 'Away' }
      ]})
    ),
    section('Avatar',
      h('div', { style: { display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' } },
        Avatar({ alt: 'Alice Johnson', size: 'sm' }),
        Avatar({ alt: 'Bob Smith' }),
        Avatar({ alt: 'Carol Williams', size: 'lg' }),
        Avatar({ fallback: 'D', size: 'lg' })
      )
    ),
    section('Progress',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '400px' } },
        Progress({ value: progress, label: true }),
        h('div', { style: { display: 'flex', gap: '0.5rem' } },
          Button({ size: 'sm', onclick: () => setProgress(Math.max(0, progress() - 10)) }, '-10'),
          Button({ size: 'sm', onclick: () => setProgress(Math.min(100, progress() + 10)) }, '+10')
        ),
        Progress({ value: 75, variant: 'success' }),
        Progress({ value: 50, variant: 'warning', striped: true }),
        Progress({ value: 30, variant: 'error' })
      )
    ),
    section('Skeleton',
      Card({},
        h('div', { style: { display: 'flex', gap: '1rem', alignItems: 'flex-start' } },
          Skeleton({ variant: 'circle', width: '48px', height: '48px' }),
          h('div', { style: { flex: 1 } }, Skeleton({ lines: 3 }))
        )
      )
    )
  );
}
`;
}

function feedbackJs() {
  return `import { h } from 'decantr/core';
import { Tooltip, Alert, Button } from 'decantr/components';
import { toast } from 'decantr/components';

export function FeedbackPage() {
  function section(title, ...children) {
    return h('div', { style: { marginBottom: '2.5rem' } },
      h('h3', { style: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--c4)' } }, title),
      ...children
    );
  }

  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem' } }, 'Feedback & Overlays'),
    section('Tooltip',
      h('div', { style: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' } },
        Tooltip({ content: 'Top tooltip' }, Button({}, 'Hover me')),
        Tooltip({ content: 'Bottom', position: 'bottom' }, Button({ variant: 'secondary' }, 'Bottom')),
        Tooltip({ content: 'Left', position: 'left' }, Button({ variant: 'outline' }, 'Left')),
        Tooltip({ content: 'Right', position: 'right' }, Button({ variant: 'ghost' }, 'Right'))
      )
    ),
    section('Alert',
      h('div', { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' } },
        Alert({ variant: 'info' }, 'This is an informational message.'),
        Alert({ variant: 'success' }, 'Operation completed successfully!'),
        Alert({ variant: 'warning' }, 'Please review before proceeding.'),
        Alert({ variant: 'error' }, 'An error occurred. Please try again.'),
        Alert({ variant: 'info', dismissible: true }, 'This alert can be dismissed.')
      )
    ),
    section('Toast',
      h('p', { style: { color: 'var(--c4)', marginBottom: '0.75rem' } }, 'Click to trigger toasts:'),
      h('div', { style: { display: 'flex', gap: '0.75rem', flexWrap: 'wrap' } },
        Button({ onclick: () => toast({ message: 'Info toast', variant: 'info' }) }, 'Info'),
        Button({ variant: 'success', onclick: () => toast({ message: 'Saved!', variant: 'success' }) }, 'Success'),
        Button({ variant: 'warning', onclick: () => toast({ message: 'Check input', variant: 'warning' }) }, 'Warning'),
        Button({ variant: 'destructive', onclick: () => toast({ message: 'Error occurred', variant: 'error' }) }, 'Error')
      )
    )
  );
}
`;
}

function blocksJs() {
  return `import { h } from 'decantr/core';
import { Hero, Features, Pricing, Testimonials, CTA, Footer } from 'decantr/blocks';
import { Separator } from 'decantr/components';

export function BlocksPage() {
  return h('div', null,
    h('h2', { style: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.5rem' } }, 'Content Blocks'),
    h('p', { style: { color: 'var(--c4)', marginBottom: '2rem' } }, 'Composable page-level sections for landing pages.'),
    Hero({ headline: 'Build faster with decantr', description: 'An AI-first web framework with zero dependencies.', cta: { label: 'Get Started' }, ctaSecondary: { label: 'Learn More' } }),
    Separator({}),
    Features({ columns: 3, items: [
      { icon: '\\u26A1', title: 'Zero Dependencies', description: 'No build tools required.' },
      { icon: '\\uD83C\\uDFA8', title: '48 Visual Combos', description: '8 themes and 6 design styles.' },
      { icon: '\\uD83D\\uDD27', title: 'Signal Reactivity', description: 'Fine-grained reactivity with signals.' }
    ]}),
    Separator({}),
    Pricing({ plans: [
      { name: 'Free', price: '\\$0', period: 'mo', features: ['5 projects', 'Basic themes'], cta: { label: 'Start', variant: 'outline' } },
      { name: 'Pro', price: '\\$29', period: 'mo', features: ['Unlimited projects', 'All themes', 'Priority support'], highlighted: true, cta: { label: 'Try Free' } },
      { name: 'Enterprise', price: '\\$99', period: 'mo', features: ['Everything in Pro', 'SLA', 'Dedicated support'], cta: { label: 'Contact', variant: 'outline' } }
    ]}),
    Separator({}),
    Testimonials({ items: [
      { quote: 'decantr replaced our entire React stack.', author: 'Sarah Chen', role: 'CTO, TechCo' },
      { quote: 'The theme system saved us weeks of design work.', author: 'Marcus Rivera', role: 'Designer, StartupXYZ' }
    ]}),
    Separator({}),
    CTA({ headline: 'Ready to get started?', description: 'Join thousands of developers building with decantr.', cta: { label: 'Start Building' } }),
    Separator({}),
    Footer({ columns: [
      { title: 'Product', links: [{ label: 'Features', href: '#/' }, { label: 'Pricing', href: '#/' }] },
      { title: 'Developers', links: [{ label: 'Docs', href: '#/' }, { label: 'API', href: '#/' }] },
      { title: 'Company', links: [{ label: 'About', href: '#/' }, { label: 'Blog', href: '#/' }] }
    ], copyright: '\\u00A9 2026 decantr. All rights reserved.' })
  );
}
`;
}
