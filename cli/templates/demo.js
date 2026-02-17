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
    ['src/pages/modals.js', modalsJs(opts)]
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
    { path: '/modals', component: ModalsPage }
  ]
});

const navItems = [
  { href: '/', label: 'Welcome' },
  { href: '/home', label: 'Showcase' },
  { href: '/buttons', label: 'Buttons' },
  { href: '/inputs', label: 'Inputs' },
  { href: '/cards', label: 'Cards' },
  { href: '/badges', label: 'Badges' },
  { href: '/modals', label: 'Modals' }
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
