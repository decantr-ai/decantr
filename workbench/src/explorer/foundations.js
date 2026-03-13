import { h, cond, list, text } from 'decantr/core';
import { createSignal, createEffect, createMemo, createStore } from 'decantr/state';
import { createForm, validators } from 'decantr/form';
import { css } from 'decantr/css';
import { tags } from 'decantr/tags';
import { Button, Input, Badge, Chip, Separator, CodeBlock } from 'decantr/components';

const { div, h2, h3, h4, p, span, section, label } = tags;

// ─── Shared section structure ───────────────────────────────
// Follows component-showcase pattern layout: _flex _col _gap10

function DemoSection(title, description, ...children) {
  return div({ class: css('_flex _col _gap4') },
    Separator({}),
    div({ class: css('_flex _col _gap1') },
      h3({ class: css('_heading5') }, title),
      description ? p({ class: css('_body _fgmutedfg') }, description) : null
    ),
    ...children
  );
}

function DemoRow(...children) {
  return div({ class: css('_flex _gap3 _wrap _aic') }, ...children);
}

// ─── Core Demos ─────────────────────────────────────────────

function CoreDemo() {
  return div({ class: css('_flex _col _gap10') },
    DemoSection(
      'h() — Element Creation',
      'Creates DOM elements. Tags proxy provides the same capability with terser syntax.',
      DemoRow(
        Button({ variant: 'primary' }, 'Click me'),
        span({ class: css('_body _fgmutedfg') }, 'Created with Button({variant:\'primary\'}, \'Click me\')')
      ),
      CodeBlock({ language: 'javascript' },
        `import { h } from 'decantr/core';\nimport { tags } from 'decantr/tags';\n\n// Using h()\nconst el = h('div', { class: 'my-class' }, 'Hello');\n\n// Using tags proxy (~25% fewer tokens)\nconst { div, span } = tags;\nconst el2 = div({ class: 'my-class' }, 'Hello');`
      )
    ),
    DemoSection(
      'cond() — Conditional Rendering',
      'Reactively toggles between two DOM branches.',
      CondDemo(),
      CodeBlock({ language: 'javascript' },
        `const [show, setShow] = createSignal(true);\nconst el = cond(show,\n  () => Badge({ variant: 'success' }, 'Visible'),\n  () => Badge({ variant: 'error' }, 'Hidden')\n);`
      )
    ),
    DemoSection(
      'list() — Keyed List Rendering',
      'Renders a reactive list with keyed reconciliation.',
      ListDemo(),
      CodeBlock({ language: 'javascript' },
        `const [items, setItems] = createSignal(['Alpha', 'Beta']);\nconst el = list(items, item => item, item =>\n  Chip({ variant: 'primary', label: item })\n);`
      )
    )
  );
}

function CondDemo() {
  const [show, setShow] = createSignal(true);
  const toggle = Button({ variant: 'outline', size: 'sm', onclick: () => setShow(!show()) }, 'Toggle');
  const conditional = cond(show,
    () => Badge({ variant: 'success' }, 'Visible'),
    () => Badge({ variant: 'error' }, 'Hidden')
  );
  return DemoRow(toggle, span({ class: css('_body') }, conditional));
}

function ListDemo() {
  const [items, setItems] = createSignal(['Alpha', 'Beta', 'Gamma']);
  const addBtn = Button({ variant: 'outline', size: 'sm', onclick: () => {
    setItems([...items(), `Item-${items().length + 1}`]);
  }}, 'Add Item');
  const rendered = list(items, (item) => item, (item) =>
    Chip({ variant: 'primary', label: item })
  );
  return div({ class: css('_flex _col _gap4') },
    addBtn,
    div({ class: css('_flex _gap2 _wrap') }, rendered)
  );
}

// ─── State Demos ────────────────────────────────────────────

function StateDemo() {
  return div({ class: css('_flex _col _gap10') },
    DemoSection(
      'createSignal — Reactive Primitive',
      'Returns [getter, setter]. Reading the getter inside createEffect auto-tracks.',
      SignalDemo(),
      CodeBlock({ language: 'javascript' },
        `const [count, setCount] = createSignal(0);\ncreateEffect(() => {\n  display.textContent = String(count());\n});`
      )
    ),
    DemoSection(
      'createMemo — Cached Derivation',
      'Derives a cached value from other signals. Recomputes only when dependencies change.',
      MemoDemo(),
      CodeBlock({ language: 'javascript' },
        `const sum = createMemo(() => a() + b());\nconst product = createMemo(() => a() * b());`
      )
    ),
    DemoSection(
      'createStore — Reactive Object',
      'Returns a Proxy that tracks per-property reads/writes. Direct assignment triggers effects.',
      StoreDemo(),
      CodeBlock({ language: 'javascript' },
        `const store = createStore({ name: 'Decantr', stars: 0 });\nstore.stars = store.stars + 1; // triggers effects`
      )
    )
  );
}

function SignalDemo() {
  const [count, setCount] = createSignal(0);
  const inc = Button({ variant: 'primary', size: 'sm', onclick: () => setCount(count() + 1) }, '+1');
  const dec = Button({ variant: 'outline', size: 'sm', onclick: () => setCount(count() - 1) }, '-1');
  const display = span({ class: css('_heading3') });
  createEffect(() => { display.textContent = String(count()); });

  return DemoRow(dec, display, inc);
}

function MemoDemo() {
  const [a, setA] = createSignal(3);
  const [b, setB] = createSignal(5);
  const sum = createMemo(() => a() + b());
  const product = createMemo(() => a() * b());

  const aDisplay = span({});
  const bDisplay = span({});

  createEffect(() => { aDisplay.textContent = String(a()); });
  createEffect(() => { bDisplay.textContent = String(b()); });

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: () => setA(a() + 1) }, 'a++'),
      span({}, 'a='), aDisplay,
      Button({ size: 'sm', variant: 'outline', onclick: () => setB(b() + 1) }, 'b++'),
      span({}, 'b='), bDisplay
    ),
    DemoRow(
      span({ class: css('_flex _gap1 _aic') }, 'sum:', Badge({ variant: 'primary', count: sum })),
      span({ class: css('_flex _gap1 _aic') }, 'product:', Badge({ variant: 'accent', count: product }))
    )
  );
}

function StoreDemo() {
  const store = createStore({ name: 'Decantr', version: '0.3.0', stars: 0 });
  const nameEl = span({});
  const versionEl = span({});
  const starsEl = span({});

  createEffect(() => { nameEl.textContent = store.name; });
  createEffect(() => { versionEl.textContent = store.version; });
  createEffect(() => { starsEl.textContent = String(store.stars); });

  return div({ class: css('_flex _col _gap4') },
    DemoRow(
      span({ class: css('_fgmutedfg') }, 'name:'), nameEl,
      Separator({ vertical: true }),
      span({ class: css('_fgmutedfg') }, 'version:'), versionEl,
      Separator({ vertical: true }),
      span({ class: css('_fgmutedfg') }, 'stars:'), starsEl
    ),
    DemoRow(
      Button({ size: 'sm', variant: 'outline', onclick: () => { store.stars = store.stars + 1; } }, 'Star'),
      Button({ size: 'sm', variant: 'outline', onclick: () => { store.name = 'Decantr Pro'; } }, 'Rename')
    )
  );
}

// ─── Router Demo ────────────────────────────────────────────

function RouterDemo() {
  return div({ class: css('_flex _col _gap10') },
    DemoSection(
      'Client-Side Routing',
      'Hash and History mode routing with nested routes, guards, and lazy loading.',
      p({ class: css('_body _fgmutedfg') }, 'Router demos require full page context. The workbench itself uses hash routing.'),
      CodeBlock({ language: 'javascript' },
        `import { createRouter, navigate, link, useRoute } from 'decantr/router';\n\nconst router = createRouter({\n  mode: 'hash',\n  routes: [\n    { path: '/', component: HomePage },\n    { path: '/about', component: AboutPage },\n    { path: '/user/:id', component: UserPage }\n  ]\n});\n\n// Programmatic navigation\nnavigate('/about');\n\n// Route-aware links\nconst nav = link('/about', { class: 'nav-link' }, 'About');`
      )
    )
  );
}

// ─── Forms Demo ─────────────────────────────────────────────

function FormsDemo() {
  return div({ class: css('_flex _col _gap10') },
    DemoSection(
      'Form System',
      'createForm with validators, field-level reactivity, and fieldArray for dynamic fields.',
      FormsInteractiveDemo(),
      CodeBlock({ language: 'javascript' },
        `import { createForm, validators } from 'decantr/form';\n\nconst form = createForm({\n  fields: {\n    email: { validators: [validators.required, validators.email] },\n    password: { validators: [validators.required, validators.minLength(8)] }\n  },\n  onSubmit: (values) => console.log(values)\n});\n\n// Get field state\nform.getField('email'); // { value, error, touched, dirty }`
      )
    )
  );
}

function FormsInteractiveDemo() {
  const [submitted, setSubmitted] = createSignal('');

  const form = createForm({
    fields: {
      email: { validators: [validators.required, validators.email] },
      name: { validators: [validators.required] }
    },
    onSubmit: (values) => { setSubmitted(JSON.stringify(values, null, 2)); }
  });

  const emailField = form.getField('email');
  const nameField = form.getField('name');

  const emailError = span({ class: css('_caption _fgerror') });
  const nameError = span({ class: css('_caption _fgerror') });
  const resultEl = span({ class: css('_caption _fgprimary') });

  createEffect(() => { emailError.textContent = emailField.error() || ''; });
  createEffect(() => { nameError.textContent = nameField.error() || ''; });
  createEffect(() => { resultEl.textContent = submitted(); });

  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _col _gap1') },
      label({ class: css('_caption _fgmutedfg') }, 'Name'),
      Input({
        placeholder: 'Enter name...',
        value: nameField.value,
        oninput: (e) => nameField.setValue(e.target.value),
        onblur: () => nameField.setTouched(true)
      }),
      nameError
    ),
    div({ class: css('_flex _col _gap1') },
      label({ class: css('_caption _fgmutedfg') }, 'Email'),
      Input({
        placeholder: 'Enter email...',
        value: emailField.value,
        oninput: (e) => emailField.setValue(e.target.value),
        onblur: () => emailField.setTouched(true)
      }),
      emailError
    ),
    DemoRow(
      Button({ variant: 'primary', size: 'sm', onclick: () => form.submit() }, 'Submit'),
      Button({ variant: 'outline', size: 'sm', onclick: () => form.reset() }, 'Reset')
    ),
    submitted() ? div({ class: css('_p3 _bgmuted/10 _radius _caption _fgmutedfg') }, 'Submitted: ', resultEl) : null
  );
}

// ─── Subsection Registry ────────────────────────────────────

const SUBSECTIONS = {
  core: { label: 'Core', render: CoreDemo },
  state: { label: 'State', render: StateDemo },
  router: { label: 'Router', render: RouterDemo },
  forms: { label: 'Forms', render: FormsDemo },
};

export function FoundationsExplorer(subsection) {
  const sub = SUBSECTIONS[subsection] || SUBSECTIONS.core;
  return section({ id: 'foundations-' + subsection, class: css('_flex _col _gap6') },
    div({ class: css('_flex _col _gap1') },
      h2({ class: css('_heading4') }, `Foundations — ${sub.label}`),
      p({ class: css('_body _fgmutedfg') }, 'Interactive API playgrounds for Decantr primitives.')
    ),
    sub.render()
  );
}

export async function loadFoundationItems() {
  try {
    const resp = await fetch('/__decantr/registry/foundations.json');
    const data = await resp.json();
    return Object.entries(data.subsections || {}).map(([id, sub]) => ({
      id, label: sub.label
    }));
  } catch {
    // Fallback to local subsections
    return Object.entries(SUBSECTIONS).map(([id, sub]) => ({ id, label: sub.label }));
  }
}
