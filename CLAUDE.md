# decantr — Framework Reference

AI-first web framework. Zero dependencies. Native JS/CSS/HTML. v0.2.0

## Project Structure

```
src/
  core/         — DOM engine: h(), text(), cond(), list(), mount(), lifecycle hooks
  state/        — Reactivity: signals, effects, memos, stores, batching
  router/       — Client-side routing: hash and history strategies
  css/          — Themes, design styles, atomic CSS, runtime injection
    styles/     — 6 design style definitions (glass, flat, brutalist, skeuo, sketchy, lava)
  components/   — UI component library (21 components + icon)
  blocks/       — Content block library (Hero, Features, Pricing, Testimonials, CTA, Footer)
  test/         — Test runner with lightweight DOM implementation
cli/
  commands/     — CLI commands: init, dev, build, test
  templates/    — Project scaffolding templates (shared, dashboard, landing, demo)
tools/          — Build tooling: dev-server, builder, css-extract, minify
test/           — Framework test suite
playground/     — Scaffolded test project
```

## Module Exports

### `decantr/core` — src/core/index.js
- `h(tag, attrs, ...children)` — Create DOM elements (hyperscript)
- `text(fn)` — Create reactive text node from getter function
- `cond(predicate, trueBranch, falseBranch)` — Conditional rendering
- `list(items, keyFn, renderFn)` — Keyed list rendering
- `mount(component, target)` — Mount component to DOM element
- `onMount(fn)` — Register callback for after mount
- `onDestroy(fn)` — Register callback for teardown

### `decantr/state` — src/state/index.js
- `createSignal(initial)` — Returns `[getter, setter]` reactive primitive
- `createEffect(fn)` — Auto-tracking reactive effect
- `createMemo(fn)` — Cached derived computation
- `createStore(obj)` — Reactive object with per-property proxy tracking
- `batch(fn)` — Batch multiple signal updates into one effect flush

### `decantr/router` — src/router/index.js
- `createRouter(routes, options)` — Create router with route config
- `link(href, attrs, ...children)` — Router-aware anchor element
- `navigate(path)` — Programmatic navigation
- `useRoute()` — Get current route signal

Strategies: `hash` (default), `history` (History API)

### `decantr/css` — src/css/index.js
- `css(...classes)` — Compose atomic CSS class names
- `define(name, declarations)` — Define custom atomic classes
- `extractCSS()` — Get all generated CSS as string
- `reset()` — Clear injected styles
- `setTheme(id)` / `getTheme()` / `getThemeMeta()` — Theme control
- `registerTheme(theme)` / `getThemeList()` — Custom themes
- `setStyle(id)` / `getStyle()` — Style control
- `registerStyle(style)` / `getStyleList()` — Custom styles
- `getActiveCSS()` — Get complete CSS for active style
- `resetStyles()` — Reset to default (flat) style
- `setAnimations(enabled)` / `getAnimations()` — JS animation control (disable all transitions/animations)

### `decantr/components` — src/components/index.js

**Form Components:**
- `Button(props, ...children)` — `{ variant: 'primary'|'secondary'|'destructive'|'success'|'warning'|'outline'|'ghost'|'link', size: 'sm'|'lg', disabled, loading, block, onclick }`
- `Input(props)` — `{ type, placeholder, value, disabled, error, prefix, suffix, readonly, oninput, ref }`
- `Textarea(props)` — `{ placeholder, value, disabled, error, rows, resize, oninput, ref }`
- `Checkbox(props)` — `{ checked, disabled, label, indeterminate, onchange }`
- `Switch(props)` — `{ checked, disabled, label, onchange }`
- `Select(props)` — `{ options: [{value,label,disabled?}], value, placeholder, disabled, error, onchange }` — Custom dropdown, keyboard navigable

**Display Components:**
- `Card(props, ...children)` — `{ title, hoverable }` with `Card.Header()`, `Card.Body()`, `Card.Footer()`
- `Badge(props, ...children)` — `{ count, dot, status: 'success'|'error'|'warning'|'processing' }`
- `Table(props)` — `{ columns: [{key,label,width?,render?}], data, striped, hoverable, compact }`
- `Avatar(props)` — `{ src, alt, size: 'sm'|'lg', fallback }`
- `Progress(props)` — `{ value, max, label, variant, striped, animated }` — reactive value
- `Skeleton(props)` — `{ variant: 'text'|'rect'|'circle', width, height, lines }`

**Layout Components:**
- `Tabs(props)` — `{ tabs: [{id,label,content:()=>Node}], active, onchange }` — keyboard navigable
- `Accordion(props)` — `{ items: [{id,title,content:()=>Node}], multiple }`
- `Separator(props)` — `{ vertical, label }`
- `Breadcrumb(props)` — `{ items: [{label,href?,onclick?}], separator }`

**Overlay & Feedback:**
- `Modal(props, ...children)` — `{ title, visible, onClose, width }` portals to body, Escape + click-outside
- `Tooltip(props, ...children)` — `{ content, position: 'top'|'bottom'|'left'|'right', delay }`
- `Alert(props, ...children)` — `{ variant: 'info'|'success'|'warning'|'error', dismissible, onDismiss, icon }`
- `toast(props)` — `{ message, variant, duration, position }` — imperative API, returns `{ dismiss }`
- `icon(name, props)` — `{ size, color, class }` inline SVG icons

### `decantr/test` — src/test/index.js
- `describe`, `it`, `test`, `before`, `after`, `beforeEach`, `afterEach`, `mock` — Re-exports from `node:test`
- `assert` — `node:assert/strict`
- `createDOM()` — Create isolated DOM environment
- `render(fn)` — Render component, returns `{ container }`
- `fire(element, event, detail)` — Dispatch DOM events
- `flush()` — Flush pending reactive effects

## Color Variable Semantics

All 8 themes use CSS variables `--c0` through `--c9` with consistent semantic meaning:

| Variable | Semantic Role  | Example (light)  | Example (dark)   |
|----------|---------------|------------------|------------------|
| `--c0`   | background    | `#ffffff`        | `#0f172a`        |
| `--c1`   | primary       | `#3b82f6`        | `#3b82f6`        |
| `--c2`   | surface       | `#f8fafc`        | `#1e293b`        |
| `--c3`   | foreground    | `#0f172a`        | `#f1f5f9`        |
| `--c4`   | muted         | `#64748b`        | `#94a3b8`        |
| `--c5`   | border        | `#e2e8f0`        | `#334155`        |
| `--c6`   | primary-hover | `#2563eb`        | `#60a5fa`        |
| `--c7`   | success       | `#22c55e`        | `#4ade80`        |
| `--c8`   | warning       | `#f59e0b`        | `#fbbf24`        |
| `--c9`   | destructive   | `#ef4444`        | `#f87171`        |

Theme metadata: each theme also exposes `isDark`, `contrastText`, and `surfaceAlpha` via `getThemeMeta()`.

## Style Tokens Reference

Each design style sets CSS custom properties for consistent component rendering:

| Style       | `--d-radius`  | `--d-radius-lg` | `--d-shadow`                                          | `--d-transition`                       |
|-------------|--------------|-----------------|-------------------------------------------------------|----------------------------------------|
| flat        | `6px`        | `8px`           | `none`                                                | `all 0.15s ease`                       |
| brutalist   | `4px`        | `4px`           | `4px 4px 0 var(--c3)`                                | `all 0.1s ease`                        |
| glass       | `12px`       | `16px`          | `0 8px 32px rgba(0,0,0,0.1)`                         | `all 0.2s ease`                        |
| skeuo       | `8px`        | `10px`          | `0 2px 4px rgba(0,0,0,0.2), 0 1px 2px ...`           | `all 0.2s ease`                        |
| sketchy     | `255px 15px 225px 15px / 15px 225px 15px 255px` | `255px 25px 225px 25px / 25px 225px 25px 255px` | `2px 3px 0 rgba(0,0,0,0.15)` | `all 0.2s cubic-bezier(0.34,1.56,0.64,1)` |
| lava        | `10px`       | `14px`          | `0 4px 24px rgba(249,115,22,0.15), 0 2px 8px ...` | `all 0.3s cubic-bezier(0.22,1,0.36,1)` |

Each style also defines component-specific CSS for button, card, input, badge, and modal.

## CLI Commands

```
decantr init          # Interactive project scaffolding (dashboard, landing, demo)
decantr dev           # Dev server with hot reload
decantr build         # Production build to dist/
decantr test          # Run tests via node --test
decantr test --watch  # Watch mode
```

## Framework Conventions

- **No JSX** — Use `h(tag, attrs, ...children)` for all DOM creation
- **Inline styles** — Style objects on `h()` calls, not external CSS files
- **Function components** — `function(props, ...children) → HTMLElement`
- **Signal reactivity** — Pass getter functions for reactive props: `Button({ disabled: () => isLoading() })`
- **Real DOM** — `h()` returns actual DOM nodes, not virtual DOM
- **Atomic CSS** — `css('p4', 'flex', 'bg1')` for utility classes (150+ atoms available)
- **Any theme + any style** — 8 themes × 6 styles = 48 visual combinations

## Testing

```javascript
import { describe, it, assert, render, flush } from 'decantr/test';

describe('MyComponent', () => {
  it('renders', () => {
    const { container } = render(() => MyComponent());
    assert.ok(container.querySelector('.my-class'));
  });
});
```

Run: `node --test test/*.test.js`

## Build Tooling (tools/)

- `dev-server.js` — Development server with file watching and hot reload
- `builder.js` — Production bundler (HTML, JS, CSS extraction)
- `css-extract.js` — Extract and deduplicate atomic CSS from source
- `minify.js` — JS/CSS/HTML minification

## Accessibility (WCAG 2.1 AA)

All generated code **must** meet WCAG 2.1 AA. Follow these rules:

- **Accessible names** — Every interactive element must have an accessible name (visible text, `aria-label`, or `aria-labelledby`)
- **Icon-only buttons** — Must include `aria-label`: `Button({ 'aria-label': 'Close' }, icon('x'))`
- **Decorative icons** — Use `aria-hidden="true"` on icons that don't convey meaning
- **Modal** — Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to the title, and trap focus within the modal while open
- **Focus indicators** — All interactive elements must have visible focus indicators (`:focus-visible` outline)
- **Color is not enough** — Never use color as the sole indicator of state; pair with text, icons, or patterns
- **Reduced motion** — `prefers-reduced-motion` is respected automatically via base CSS; use `setAnimations(false)` for in-app animation toggle
- **Semantic HTML** — Use `<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>` over generic `<div>`/`<span>` where appropriate
- **Keyboard navigation** — All interactive components must be operable with keyboard alone (Tab, Enter, Escape, arrow keys)
- **No flashing** — Content must not flash more than 3 times per second
