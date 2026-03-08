# Kit Architecture

Domain-specific component kits that compose primitives into higher-level, ready-to-use UI blocks.

## Three-Tier Model

```
Primitives (decantr/components)  →  23 abstract components (Button, Input, Card...)
         ↓ composed by
Kits (decantr/kit/*)             →  Domain-specific (Sidebar, LoginForm, PostList...)
         ↓ referenced by
Blueprints (blueprints/)         →  Declarative JSON specs for full website variants
```

## Available Kits

| Kit | Import | Components |
|-----|--------|------------|
| dashboard | `decantr/kit/dashboard` | Sidebar, DashboardHeader, StatsGrid, KPICard, ActivityFeed, DataTable, ChartPlaceholder |
| auth | `decantr/kit/auth` | LoginForm, RegisterForm, ForgotPasswordForm, AuthLayout |
| content | `decantr/kit/content` | ArticleLayout, AuthorCard, TableOfContents, PostList, CategoryNav |

## Shared Utilities — `src/kit/_shared.js`

All kit components import from `_shared.js`:

```javascript
import { h, createEffect, css, injectBase, cx, resolve, reactiveText } from '../_shared.js';
```

| Export | Purpose |
|--------|---------|
| `h` | Re-export from `decantr/core`. Kit components use `h()` not `tags` — see below |
| `createEffect` | Re-export from `decantr/state` |
| `css` | Re-export from `decantr/css` |
| `injectBase` | From `components/_base.js`. Injects base CSS — called at top of every kit component |
| `cx` | From `components/_base.js`. CSS class composition — merges user `class` prop safely |
| `resolve(prop)` | Returns `prop()` if function (signal getter), else returns `prop` as-is |
| `reactiveText(prop)` | Creates a `Text` node that auto-updates when signal changes |

### `resolve(prop)`

Handles props that may be signal getters OR static values:

```javascript
export function resolve(prop) {
  return typeof prop === 'function' ? prop() : prop;
}
```

Use when you need the current value in a non-reactive context (e.g., initial setup).

### `reactiveText(prop)`

Creates a text node that tracks signal changes:

```javascript
export function reactiveText(prop) {
  if (typeof prop === 'function') {
    const node = document.createTextNode(prop());
    createEffect(() => { node.textContent = prop(); });
    return node;
  }
  return document.createTextNode(String(prop ?? ''));
}
```

Use when rendering a prop value as text content that should update reactively.

## Why Kits Use `h()` Not `tags`

Kit components use `h()` internally (matching how primitives in `src/components/` are built). This is intentional:

- Kit components compose primitives (`Button`, `Input`, `Card`) which are imported as functions, not tag names
- `h()` is more natural when mixing element creation with component function calls
- User-facing code (pages, app.js) should still use `tags` for markup — kits abstract that away

**Rule**: Kit source uses `h()`. Generated scaffold code and user code uses `tags`.

## Component Pattern

Every kit component follows this structure:

```javascript
import { h, createEffect, css, injectBase, cx, resolve, reactiveText } from '../_shared.js';
// Import any primitives needed
import { Button, Input } from '../../components/index.js';

/**
 * JSDoc with @param tags for all props.
 * @param {Object} [props]
 * @param {string} [props.title] - Component title
 * @param {string|Function} [props.value] - Static value or signal getter
 * @param {string} [props.class] - Custom CSS class
 * @param {...Node} children
 * @returns {HTMLElement}
 */
export function MyKitComponent(props = {}, ...children) {
  injectBase();  // Always first

  const { title, value, class: cls } = props;

  // Build DOM using h()
  const el = h('div', { class: cx('d-component-name', cls) });

  // Reactive updates via createEffect
  if (typeof value === 'function') {
    createEffect(() => { /* update DOM from value() */ });
  }

  return el;
}
```

### Key conventions:

1. **`injectBase()` first** — ensures base CSS is loaded
2. **Destructure props** — with defaults for optional values
3. **`cx()` for class merging** — combines kit class with user's `class` prop
4. **Signal detection** — check `typeof prop === 'function'` to handle reactive vs static
5. **Named export** — PascalCase function name matching the component
6. **JSDoc required** — the registry generator (`tools/registry.js`) extracts props from JSDoc

## Reactive Prop Patterns

### Pattern 1: Reactive Text Display

When a prop might be a signal getter and you need to display its value:

```javascript
// In KPICard:
if (typeof value === 'function') {
  valueEl.appendChild(reactiveText(value));
} else {
  valueEl.textContent = String(value);
}
```

### Pattern 2: External or Internal Signal State

When a component can accept external signals OR manage its own state:

```javascript
// In Sidebar:
const hasExternalSignal = typeof collapsed === 'function';
const [internalCollapsed, setInternalCollapsed] = hasExternalSignal
  ? [collapsed, null]           // Use provided signal, no setter
  : createSignal(!!collapsed);  // Create internal state
```

### Pattern 3: Effect-Based DOM Updates

When a reactive value affects DOM properties (not text content):

```javascript
// In Sidebar — reactive width:
createEffect(() => {
  const isCollapsed = internalCollapsed();
  navEl.style.width = isCollapsed ? '64px' : '240px';
});

// In Sidebar — reactive label visibility:
createEffect(() => {
  labelSpan.style.display = internalCollapsed() ? 'none' : 'inline';
});
```

### Pattern 4: Form State Management

Auth kit components use signals for internal form state:

```javascript
// In LoginForm:
const [email, setEmail] = createSignal('');
const [password, setPassword] = createSignal('');
const [remember, setRemember] = createSignal(false);

// Wire up via oninput:
const emailInput = Input({
  type: 'email',
  oninput: (e) => setEmail(e.target.value)
});

// Submit handler reads signal values:
function handleSubmit(e) {
  e.preventDefault();
  if (onSubmit) {
    onSubmit({ email: email(), password: password(), remember: remember() });
  }
}
```

## Accessibility in Kits

All kit components must follow the same WCAG 2.1 AA rules as primitives:

- **Sidebar**: `role="navigation"`, `aria-label="Main navigation"`, toggle button has `aria-label="Toggle sidebar"`
- **Auth forms**: All inputs have associated `<label>` elements via `for`/`id`, proper `autocomplete` attributes (`email`, `current-password`, `new-password`)
- **DataTable**: Proper `<table>`, `<thead>`, `<th>`, `<tbody>` structure
- **CategoryNav**: Buttons use `aria-pressed` for active state

## CSS Approach

Kit components use a mix of:

1. **Atomic CSS via `css()`** — for layout and spacing (`css('_flex _aic _gap4 _p6')`)
2. **Inline styles via `Object.assign(el.style, {...})`** — for component-specific visual styling that uses theme variables (`var(--c3)`, `var(--d-radius)`)
3. **Theme variables** — `--c0` through `--c9` for colors, `--d-radius`, `--d-pad`, `--d-shadow`, `--d-transition` for design tokens

## Registry

Kit components are auto-registered by `tools/registry.js` via `scanKits()`. Each kit gets:

- `src/registry/kit-{name}.json` — full component specs with props, types, children
- Entry in `src/registry/index.json` — summary with export count

Run `node tools/registry.js` after adding/modifying kit components (auto-runs in pre-commit hook).

## Adding a New Kit

1. Create `src/kit/{name}/` directory with component files + `index.js`
2. Add JSDoc to all exported functions (required for registry)
3. Add export to `package.json` under `exports`: `"./kit/{name}": { "import": "./src/kit/{name}/index.js" }`
4. Add to `src/kit/index.js` re-exports
5. Run `node tools/registry.js` to generate registry (auto-runs in pre-commit hook)
6. Add tests in `test/kit-{name}.test.js`
7. If blueprint-compatible, add entries to `SECTION_MAP` in `tools/scaffolder.js`

## Adding a New Kit Component

1. Create `src/kit/{name}/{component-name}.js` following the pattern above
2. Add JSDoc with all `@param` tags
3. Export from `src/kit/{name}/index.js`
4. Run `node tools/registry.js` (auto-runs in pre-commit hook)
5. Add tests
