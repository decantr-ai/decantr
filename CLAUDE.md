# decantr — Framework Reference

AI-first web framework. Zero dependencies. Native JS/CSS/HTML. v0.3.0

Decantr is designed for LLMs to generate, read, and maintain — not for human readability. Every API is optimized for token efficiency: terse atomic CSS atoms, proxy-based tag functions that eliminate string tag names, and a machine-readable registry (`src/registry/`) so agents can look up props and exports without parsing source files.

## The Decantr Way

**This section is the supreme governing authority for all work on Decantr. Every instruction below overrides any default behavior. Read it in full before writing a single line of code.**

### Identity

Decantr is a **shipped product used by hundreds of thousands of developers.** You are not completing a task — you are evolving a public framework. Every function signature, file location, CSS class name, and registry entry is a published API contract. Treat it as such.

### The Three Laws

1. **Think in systems, not tasks.** NEVER solve only the problem in front of you. Every change MUST be evaluated as a framework-wide decision. If you are modifying Button, your solution MUST work identically for all 23+ components, all 3 kits, all blocks, and any component added in the future. A pattern that serves one component but not 200 is not a pattern — it is technical debt.

2. **Extend infrastructure, never circumvent it.** Decantr has layered architecture: `_base.js` for structural CSS and variant resolution (via `cx()` + the `d-{component}-{variant}` naming convention), `themes/*.js` for visual identity, `_shared.js` for kit utilities, the registry for machine-readable specs, the scaffolder for code generation. Before creating anything new, ALWAYS ask: does existing infrastructure already handle this? Can it be extended? If a new abstraction is genuinely needed, it MUST plug into the existing layer stack and serve the entire framework — not one feature.

3. **Optimize for machines, not humans.** Every API, naming convention, and file structure decision MUST minimize token cost for LLM consumption. Terse is better. Predictable is better. Machine-readable (registry JSON) is better than requiring source parsing. This is not a style preference — it is an architectural requirement.

### Mandatory Reasoning Checklist

Before writing ANY code, you MUST explicitly reason through every item below. Do not skip any.

- **SCOPE**: Does this pattern scale to ALL components (23+), ALL kits (3+), ALL themes (5+)? If not, redesign until it does.
- **LAYER**: Where does this live in the architecture? (core | state | css | tags | components | kit | blocks | registry | cli | tools). Justify the placement.
- **CHAIN**: What is the upstream/downstream impact? Trace the full path: themes → components → kits → blocks → registry → CLI → docs → generated user code. What needs updating?
- **EXISTING**: Does Decantr already have infrastructure for this? Check: `_base.js`, `_shared.js`, `_behaviors.js`, `css/styles/*.js`, `css/derive.js`, `css/index.js`, `registry/*.json`. Extend before inventing.
- **CONTRACT**: Am I changing a public API? What ecosystem code calls this? What registry entries reference it?
- **TOKENS**: Is this the most token-efficient design? Could the API be terser? Could the file be smaller? Could the registry describe it more compactly?
- **CLEANUP**: Does this component add document listeners, timers, or observers? Wire up cleanup via `onDestroy`. See `reference/component-lifecycle.md`.

### Anti-Patterns — Violations That MUST Be Rejected

NEVER do any of the following. If you find yourself doing one, stop and redesign.

- **One-off files.** Creating `button-variants.js` or `sidebar-utils.js` that serve a single component. If a utility is needed, it belongs in a shared layer (`_base.js`, `_shared.js`) and MUST serve all components.
- **Scale-blind patterns.** "This works for Button" is not validation. It must work for all 23 components, all kit components, all blocks, and any component added next year.
- **Orphan abstractions.** Adding a new module or pattern without connecting it to the registry and the theme system. Every abstraction MUST be reachable by the full toolchain.
- **Copy-paste framework design.** Studying ShadCN/CVA, Carbon tokens, Radix slots, or Tailwind patterns is research. Copying them is not architecture. Decantr is AI-first and zero-dependency — the solution MUST be designed from those constraints. Use prior art as input, then propose a greenfield approach that surpasses it for Decantr's goals.
- **Symptom fixing.** If a component has a styling problem, the root cause is almost never in that component alone — it is in the theme layer, the base CSS layer, or the token system. Fix the system, not the symptom.
- **Deferred debt.** "We'll clean this up later" is not acceptable. Every change MUST be production-quality infrastructure that can remain in the framework permanently.
- **Hardcoded values in `_base.js`.** ALL spacing, offset, and typography values in component CSS MUST use `var(--d-*)` tokens. Never write `2px`, `4px`, `0.25rem`, or any literal dimension — use the token system (`--d-sp-*`, `--d-offset-*`, `--d-text-*`, etc.). If a token does not exist for the value you need, create one in `derive.js` SPACING first.
- **Inconsistent compound layouts.** ALL header/body/footer compound components MUST follow the compound spacing contract (`--d-compound-pad`, `--d-compound-gap`). Never invent per-component padding for these sections.
- **Raw pixel offsets on floating elements.** ALL popup/tooltip/popover offsets MUST use offset tokens (`--d-offset-dropdown`, `--d-offset-menu`, `--d-offset-tooltip`, `--d-offset-popover`). Never hardcode `margin-top: 2px` or similar.
- **Leaked listeners.** Components adding document-level listeners, observers, or timers MUST clean them up via `onDestroy` or element cleanup. See `reference/component-lifecycle.md`.
- **Bypassing `_behaviors.js`.** Components with overlay, listbox, drag, or focus-trap behavior MUST use the corresponding `_behaviors.js` primitive. Never re-implement click-outside, escape-to-close, or arrow-key navigation.
- **Inconsistent reactive patterns.** All components MUST use `createEffect` for reactive prop tracking. No ad-hoc DOM mutation.

### The Ecosystem is Coupled by Design

Decantr is not a loose collection of utilities. It is a tightly integrated pipeline:

```
core/state/css (foundations)
      ↓
components (_base.js structure + cx() variants + themes/*.js identity)
      ↓
kit/ (_shared.js utilities + domain composition)
      ↓
blocks/ (content section library)
      ↓
registry (machine-readable API catalog)
      ↓
CLI (init/dev/build/test)
      ↓
docs/ (GitHub Pages — API docs + live examples)
```

Changes at ANY level ripple through this pipeline. A new prop on a component means: new base CSS, new theme CSS across 5 themes, new registry entry, possible docs page update. ALWAYS trace the full chain before committing to a design.

### Design for Permanence

Every pattern you introduce will be replicated across the framework. Ask yourself:

- If 50 components follow this pattern, does the framework still make sense?
- If 50 themes implement this pattern, is the theme contract still clean?
- If an LLM reads this pattern in the registry, can it generate correct code without reading the source?

If the answer to any is no, the pattern is wrong. Redesign it.

## Project Structure

```
src/
  core/         — DOM engine: h(), text(), cond(), list(), mount(), lifecycle hooks
  state/        — Reactivity: signals, effects, memos, stores, batching
  router/       — Client-side routing: hash and history strategies
  css/          — Style/mode system, atomic CSS, runtime injection, seed-derived tokens
    styles/     — Style definitions (clean.js, retro.js)
    derive.js   — Derivation engine: 10 seeds → 170+ tokens
  tags/         — Proxy-based tag functions for concise markup
  components/   — UI component library (23 components + icon)
  blocks/       — Content block library (Hero, Features, Pricing, Testimonials, CTA, Footer)
  kit/          — Domain-specific component kits (dashboard, auth, content)
    dashboard/  — Sidebar, DashboardHeader, StatsGrid, KPICard, ActivityFeed, DataTable, ChartPlaceholder
    auth/       — LoginForm, RegisterForm, ForgotPasswordForm, AuthLayout
    content/    — ArticleLayout, AuthorCard, TableOfContents, PostList, CategoryNav
  test/         — Test runner with lightweight DOM implementation
  registry/     — Machine-readable API catalog (index.json + per-module specs, auto-generated)
cli/
  commands/     — CLI commands: init, dev, build, test
tools/          — Build tooling: dev-server, builder, init-templates, css-extract, minify, registry generator
test/           — Framework test suite
playground/     — Test project (simulates `decantr init` output)
workbench/      — Internal component showcase (all 23 components × 5 themes, port 4300)
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
- `createRouter(config)` — Create router. Config: `{ mode: 'hash'|'history', routes: [{path, component}] }`
- `link(href, attrs, ...children)` — Router-aware anchor element
- `navigate(path)` — Programmatic navigation
- `useRoute()` — Get current route signal

Strategies: `hash` (default), `history` (History API)

### `decantr/css` — src/css/index.js
- `css(...classes)` — Compose atomic CSS class names
- `define(name, declarations)` — Define custom atomic classes
- `extractCSS()` — Get all generated CSS as string
- `reset()` — Clear injected styles
- **Style API**: `setStyle(id)` / `getStyle()` / `getStyleList()` / `registerStyle(style)`
- **Mode API**: `setMode('light'|'dark'|'auto')` / `getMode()` / `getResolvedMode()` / `onModeChange(fn)`
- **Compat**: `setTheme(id, mode?)` / `getTheme()` / `getThemeMeta()` / `getThemeList()` / `registerTheme(theme)`
- `getActiveCSS()` — Get complete CSS for active style's theme layer
- `resetStyles()` — Reset to default (clean + light)
- `setAnimations(enabled)` / `getAnimations()` — JS animation control

### `decantr/tags` — src/tags/index.js (primary API for code generation — always prefer over h())
- `tags` — Proxy object that creates tag functions on demand
- Destructure what you need: `const { div, h2, p, button, span } = tags;`
- First arg auto-detected as props object or child node
- ~25% fewer tokens than `h()` calls — no string tag names, no `null` for empty props

### `decantr/components` — src/components/index.js
23 components + icon helper. All return HTMLElement. Reactive props accept signal getters.
Before generating component code, read `src/registry/components.json` for full props, types, and enums.

**Form:** Button, Input, Textarea, Checkbox, Switch, Select
**Display:** Card (+Header/Body/Footer), Badge, Table, Avatar, Progress, Skeleton, Chip, Spinner
**Layout:** Tabs, Accordion, Separator, Breadcrumb
**Overlay & Feedback:** Modal, Tooltip, Alert, toast(), icon()

### Domain Kits — `decantr/kit/*`

Three domain kits compose primitives into higher-level components. Full architecture docs: `reference/kit-architecture.md`

**`decantr/kit/dashboard`**: Sidebar, DashboardHeader, StatsGrid, KPICard, ActivityFeed, DataTable, ChartPlaceholder
**`decantr/kit/auth`**: LoginForm, RegisterForm, ForgotPasswordForm, AuthLayout
**`decantr/kit/content`**: ArticleLayout, AuthorCard, TableOfContents, PostList, CategoryNav

Registry: `src/registry/kit-dashboard.json`, `kit-auth.json`, `kit-content.json` for full props/types.

**Kit utilities** (`src/kit/_shared.js`):
- `resolve(prop)` — Returns `prop()` if function (signal getter), else `prop` as-is
- `reactiveText(prop)` — Creates auto-updating text node from signal getter
- `injectBase()` — Injects base CSS (called first in every kit component)
- `cx()` — Safe CSS class composition (merges user `class` prop)

**Reactive prop pattern**: Kit components accept signal getters OR static values. Detection: `typeof prop === 'function'`

**Note**: Kit source uses `h()` internally. User-facing code (pages, app.js) uses `tags`.

### `decantr/test` — src/test/index.js
- `describe`, `it`, `test`, `before`, `after`, `beforeEach`, `afterEach`, `mock` — Re-exports from `node:test`
- `assert` — `node:assert/strict`
- `createDOM()` — Create isolated DOM environment
- `render(fn)` — Render component, returns `{ container }`
- `fire(element, event, detail)` — Dispatch DOM events
- `flush()` — Flush pending reactive effects

## Code Standards

*These standards implement The Decantr Way. When a standard and a philosophy principle conflict, the philosophy wins.*

1. **Use `tags` for all markup** — `const { div, section, h2, p, button } = tags;` Always prefer over `h()` (~25% fewer tokens).
2. **Atoms first** — `class: css('_flex _gap4 _p6 _bg2')` for all layout, spacing, typography, color. Only `style:` for dynamic/computed values.
3. **One component per file, named export** — Signal state at top, DOM return at bottom.
4. **Reactive props use getters** — `Button({ disabled: () => isLoading() })`, not `Button({ disabled: isLoading() })`.
5. **Consult the registry** — Read `src/registry/components.json` before generating component code. `src/registry/index.json` for full API overview.
6. **No external CSS or frameworks** — All styling through `css()` atoms and theme CSS variables.
7. **Accessibility is mandatory** — Every interactive element needs an accessible name; icon-only buttons need `aria-label`.
8. **Trace the chain** — Before modifying any component, verify whether the change requires updates to `_base.js`, style definitions, `derive.js`, the registry, or the docs site. Include all required updates in the same change.
9. **Clean up resources** — Every component adding document listeners, timers, or observers MUST wire cleanup via `onDestroy`. Use `_behaviors.js` primitives. See `reference/component-lifecycle.md`.

## CLI Commands

```
decantr init [name]   # Create minimal project skeleton with AGENTS.md
decantr dev           # Dev server with hot reload
decantr build         # Production build to dist/
decantr test          # Run tests via node --test
decantr test --watch  # Watch mode
```

### Internal Dev Scripts

```
npm run workbench:dev   # Component showcase on localhost:4300 — all components, style/mode switching, HMR on framework src/ changes
```

## Framework Conventions

- **Function components** — `function(props, ...children) → HTMLElement`. Real DOM nodes, not virtual DOM.
- **Style + Mode system** — Visual personality (clean, retro) × color mode (light/dark/auto), controlled via `setStyle(id)` + `setMode(mode)`. 170+ tokens derived from 10 seed colors.
- **Atomic CSS engine** — 1000+ utility atoms available via `css()`. All atoms are prefixed with `_` for namespace safety. See `reference/atoms.md`.

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

- `dev-server.js` — Development server with file watching, hot reload, import rewriting. Routes reference: `reference/dev-server-routes.md`
- `builder.js` — Production bundler (HTML, JS, CSS extraction)
- `init-templates.js` — Template functions for `decantr init`
- `css-extract.js` — Extract and deduplicate atomic CSS from source
- `minify.js` — JS/CSS/HTML minification
- `registry.js` — Auto-generates `src/registry/` from JSDoc annotations. Auto-runs in pre-commit hook; manual: `node tools/registry.js`

## Accessibility (WCAG 2.1 AA)

All generated code **must** meet WCAG 2.1 AA:

- **Accessible names** — Every interactive element must have an accessible name (visible text, `aria-label`, or `aria-labelledby`)
- **Icon-only buttons** — Must include `aria-label`: `Button({ 'aria-label': 'Close' }, icon('x'))`
- **Modal** — Use `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and trap focus via `createFocusTrap` from `_behaviors.js`
- **Focus indicators** — All interactive elements must have visible `:focus-visible` outlines
- **Keyboard navigation** — All interactive components must be operable with keyboard alone (Tab, Enter, Escape, arrow keys)
- **Reduced motion** — `prefers-reduced-motion` is respected automatically via base CSS
- **Semantic HTML** — Use `<button>`, `<nav>`, `<main>`, `<header>`, `<footer>`, `<section>` over generic `<div>`/`<span>`

## Reference Docs (reference/)

Deep-dive documentation for each subsystem. Read when working on that specific area.

| Reference | When to read |
|-----------|-------------|
| `reference/tokens.md` | CSS/theme work — all token tables (colors, spacing, typography, z-index, radius, interaction, motion, gradient, chart) |
| `reference/atoms.md` | Writing markup — full atomic CSS reference (1000+ atoms) |
| `reference/compound-spacing.md` | Container/overlay components — compound spacing contract, popup offsets, density, prose, spacing utilities |
| `reference/style-system.md` | Theme work — styles, modes, seed-derived tokens, custom styles, legacy compat |
| `reference/component-lifecycle.md` | Component development — cleanup contract, `_behaviors.js` primitives, audit checklist |
| `reference/kit-architecture.md` | Kit development — patterns, `_shared.js` utilities, reactive props |
| `reference/dev-server-routes.md` | Dev server — special routes, import rewriting, HMR |
