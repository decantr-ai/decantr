# decantr — Framework Reference

AI-first web framework. Zero dependencies. Native JS/CSS/HTML. v0.4.0

For LLMs translating from other frameworks (React, Vue, Svelte, Angular), see `AGENTS.md`.

Decantr is designed for LLMs to generate, read, and maintain — not for human readability. Every API is optimized for token efficiency: terse atomic CSS atoms, proxy-based tag functions that eliminate string tag names, and a machine-readable registry (`src/registry/`) so agents can look up props and exports without parsing source files.

## The Decantr Way

**This section is the supreme governing authority for all work on Decantr. Every instruction below overrides any default behavior. Read it in full before writing a single line of code.**

### Identity

Decantr is a **shipped product used by hundreds of thousands of developers.** You are not completing a task — you are evolving a public framework. Every function signature, file location, CSS class name, and registry entry is a published API contract. Treat it as such.

### The Three Laws

1. **Think in systems, not tasks.** NEVER solve only the problem in front of you. Every change MUST be evaluated as a framework-wide decision. If you are modifying Button, your solution MUST work identically for all 100+ components, all patterns, all archetypes, and any component added in the future. A pattern that serves one component but not 200 is not a pattern — it is technical debt.

2. **Extend infrastructure, never circumvent it.** Decantr has layered architecture: `_base.js` for structural CSS and variant resolution (via `cx()` + the `d-{component}-{variant}` naming convention), `styles/*.js` for visual identity, the registry for machine-readable specs, the scaffolder for code generation. Before creating anything new, ALWAYS ask: does existing infrastructure already handle this? Can it be extended? If a new abstraction is genuinely needed, it MUST plug into the existing layer stack and serve the entire framework — not one feature.

3. **Optimize for machines, not humans.** Every API, naming convention, and file structure decision MUST minimize token cost for LLM consumption. Terse is better. Predictable is better. Machine-readable (registry JSON) is better than requiring source parsing. This is not a style preference — it is an architectural requirement.

### Mandatory Reasoning Checklist

Before writing ANY code, you MUST explicitly reason through every item below. Do not skip any.

- **SCOPE**: Does this pattern scale to ALL components (100+), ALL patterns (35+), ALL styles (5)? If not, redesign until it does.
- **LAYER**: Where does this live in the architecture? (core | state | css | tags | components | patterns | archetypes | recipes | registry | cli | tools). Justify the placement.
- **CHAIN**: What is the upstream/downstream impact? Trace the full path: themes → components → patterns → archetypes → recipes → registry → CLI → docs → generated user code. What needs updating?
- **EXISTING**: Does Decantr already have infrastructure for this? Check: `_base.js`, `_behaviors.js`, `css/styles/*.js`, `css/derive.js`, `css/index.js`, `registry/*.json`. Extend before inventing.
- **CONTRACT**: Am I changing a public API? What ecosystem code calls this? What registry entries reference it?
- **TOKENS**: Is this the most token-efficient design? Could the API be terser? Could the file be smaller? Could the registry describe it more compactly?
- **CLEANUP**: Does this component add document listeners, timers, or observers? Wire up cleanup via `onDestroy`. See `reference/component-lifecycle.md`.
- **STYLE**: Am I using `style:` or `.style.` for ANY value that is known at author time? If the value is static in source code, it MUST be an atom (`css('_bold')`), arbitrary bracket notation (`css('_w[32px]')`), `define()` custom atom, or `var(--d-*)` token — NEVER inline `style:`. The ONLY acceptable `style:` uses are values computed at runtime from JS (signals, DOM measurements, user-provided data, `setProperty()`).
- **SPATIAL**: What density zone is this? (chrome | controls | content | showcase | data-dense). What proximity tier applies? (intimate | related | grouped | sectional | landmark). Does containment hold (inner spacing < outer spacing)? See `reference/spatial-guidelines.md`.
- **CORK**: Does the project have a `decantr.essence.json`? If yes, verify changes match Vintage, Structure, and Recipe. See `reference/decantation-process.md` §Cork Rules.
- **BOUQUET**: Does this change affect color tokens? Check contrast validation, colorblind safety, surface relationships. See `reference/color-guidelines.md`.
- **FIELD**: Does this component contain a form field? If yes, it MUST use `.d-field` base class. Does it use `var(--d-disabled-opacity)` for disabled state? Never hardcode `opacity:0.5` for disabled.

### Anti-Patterns — Violations That MUST Be Rejected

NEVER do any of the following. If you find yourself doing one, stop and redesign.

- **One-off files.** Creating `button-variants.js` or `sidebar-utils.js` that serve a single component. If a utility is needed, it belongs in a shared layer (`_base.js`, `_shared.js`) and MUST serve all components.
- **Scale-blind patterns.** "This works for Button" is not validation. It must work for all 100+ components, all patterns, all archetypes, and any component added next year.
- **Orphan abstractions.** Adding a new module or pattern without connecting it to the registry and the theme system. Every abstraction MUST be reachable by the full toolchain.
- **Copy-paste framework design.** Studying ShadCN/CVA, Carbon tokens, Radix slots, or Tailwind patterns is research. Copying them is not architecture. Decantr is AI-first and zero-dependency — the solution MUST be designed from those constraints. Use prior art as input, then propose a greenfield approach that surpasses it for Decantr's goals.
- **Symptom fixing.** If a component has a styling problem, the root cause is almost never in that component alone — it is in the theme layer, the base CSS layer, or the token system. Fix the system, not the symptom.
- **Deferred debt.** "We'll clean this up later" is not acceptable. Every change MUST be production-quality infrastructure that can remain in the framework permanently.
- **Hardcoded CSS values anywhere.** ALL spacing, offset, typography, color, border, radius, and dimension values in ANY file — `_base.js`, components, patterns, workbench, docs, CLI templates, generated user code — MUST use `var(--d-*)` tokens or atomic CSS classes. Never write `2px`, `4px`, `0.25rem`, `font-weight:700`, `border-top:1px solid`, or any literal CSS value in a `style:` attribute when an atom or token exists. If a token does not exist, create one in `derive.js`. If an atom does not exist, use arbitrary bracket notation (`_w[32px]`) or `define()` — NEVER fall back to inline `style:`.
- **Inconsistent compound layouts.** ALL header/body/footer compound components MUST follow the compound spacing contract (`--d-compound-pad`, `--d-compound-gap`). Never invent per-component padding for these sections.
- **Raw pixel offsets on floating elements.** ALL popup/tooltip/popover offsets MUST use offset tokens (`--d-offset-dropdown`, `--d-offset-menu`, `--d-offset-tooltip`, `--d-offset-popover`). Never hardcode `margin-top: 2px` or similar.
- **Leaked listeners.** Components adding document-level listeners, observers, or timers MUST clean them up via `onDestroy` or element cleanup. See `reference/component-lifecycle.md`.
- **Bypassing `_behaviors.js`.** Components with overlay, listbox, drag, or focus-trap behavior MUST use the corresponding `_behaviors.js` primitive. Never re-implement click-outside, escape-to-close, or arrow-key navigation.
- **Inconsistent reactive patterns.** All components MUST use `createEffect` for reactive prop tracking. No ad-hoc DOM mutation.
- **Cork violations.** If `decantr.essence.json` exists, NEVER generate code that conflicts with its Vintage, Structure, or Recipe without flagging the conflict first. See `reference/decantation-process.md` §Cork Response Protocol.
- **Registry generator clobbering.** `tools/registry.js` MUST preserve manually-added keys in JSON files it regenerates (`showcase`, `groups` in `components.json`; `archetypes`, `patterns`, `recipes`, `atoms`, `tokens`, `foundations` in `index.json`). The generator only overwrites what it can generate — never destroy hand-authored data.
- **Custom componentry.** If something can be a framework component, pattern, or registry entry — it MUST be. Never create one-off UI constructs in consumer code (workbench, docs, generated sites). Every UI composition is either a component, a pattern, or an element within the Decantation Process.
- **Hardcoded workbench/tool CSS.** ALL CSS properties in workbench/docs/tooling code MUST use atoms, `var(--d-*)` tokens, or arbitrary bracket notation — no exceptions for "just one property." This includes spacing, typography (font-size, font-weight, letter-spacing, line-height), colors, borders, radius, transitions, z-index, widths, heights, opacity, cursor, and any other visual property. Workbench-specific layout dimensions (header height, sidebar width) use named `--de-*` custom properties, never raw values.
- **Disconnected explorers.** Any workbench/docs section that displays framework data MUST consume it from the registry or derive it from framework modules. Hardcoded lists that duplicate registry data are forbidden — they drift.
- **Modals without `_behaviors.js`.** ALL overlay UI (modals, search, drawers) in ANY consumer code MUST use `createFocusTrap()` and proper focus management from `_behaviors.js`. No exceptions.
- **Inline styles for static values.** NEVER use `style:` or `.style.` to set a CSS property whose value is known at author time. Violations: `style: 'font-weight:700'` (use `_bold` or `_fw[700]`), `style: 'width:32px'` (use `_w[32px]`), `style: 'border-top:1px solid var(--d-border)'` (use atoms or `define()`), `style: 'letter-spacing:-0.02em'` (use `_ls[-0.02em]`). The ONLY acceptable `style:` uses are: (1) values computed at runtime from JS signals, DOM measurements, or user-provided data, (2) reactive style bindings via getter functions, (3) CSS custom property injection via `setProperty()`. If atoms and bracket notation cannot express it, use `define()` or propose adding the atom — never use `style:`.
- **SSR/SSG attempts.** Decantr is a client-rendered SPA framework. Never add server-side rendering, static site generation, or server components. All rendering happens in the browser.
- **Unvalidated color pairs.** Never introduce a new foreground/background token pair without adding it to `validateContrast()` PAIRS array in `derive.js`.
- **Semantic color misuse.** Never use `--d-error` for non-error UI or `--d-success` for decoration. Semantic roles are functional, not aesthetic.
- **Hardcoded disabled opacity.** ALL disabled states MUST use `var(--d-disabled-opacity)` or `var(--d-disabled-opacity-soft)`. Never write `opacity:0.5` or `opacity:0.3` for disabled states. Icon/UI elements that are intentionally muted use `var(--d-icon-muted)` or `var(--d-icon-subtle)`.
- **Field components without `.d-field`.** ALL form field containers (input wraps, select wraps, textarea wraps, etc.) MUST use the `.d-field` base class for consistent border, background, focus, error, and disabled styling. Never hardcode field borders or backgrounds.
- **Non-concentric nested radii.** When a rounded-rect child sits inside a rounded-rect parent with padding, the inner radius MUST equal `outer − padding` (concentric curves). Use `--d-radius-inner` for children inside `--d-radius-panel` containers. Never pair arbitrary radius values — mismatched inner/outer radii create a flat-inside-round artifact. When adding a new RADIUS preset in `derive.js`, always compute `inner = panel − container padding`. See `reference/spatial-guidelines.md` §10.
- **HSL color math.** All color manipulation must use OKLCH (perceptually uniform). Never use HSL/HSB for lightening, darkening, or mixing.
- **Wrong import paths.** Consumer code (playground, workbench, docs, generated user code) MUST use bare specifiers (`import { X } from 'decantr/core'`). The dev server rewrites them for the browser. Never use relative paths to framework source (`../../src/core/index.js`) in consumer code.
- **Learning from existing violations.** Some files in `workbench/src/` and `docs/src/` currently contain inline `style:` for static values (e.g., `font-weight:700`, `width:32px`, `border-top:1px solid`). These are known technical debt, NOT examples to follow. Do NOT replicate their inline style patterns. When modifying these files, migrate any inline styles you touch to atoms or bracket notation. Do not introduce new inline styles to match surrounding code.

### The Ecosystem is Coupled by Design

Decantr is not a loose collection of utilities. It is a tightly integrated pipeline:

```
core/state/css (foundations)
      ↓
components (_base.js structure + cx() variants + themes/*.js identity)
      ↓
patterns (composable UI compositions from registry)
      ↓
archetypes (domain blueprints with pages, tannins, structure)
      ↓
recipes (visual identity overlays with decorators)
      ↓
registry (machine-readable API catalog)
      ↓
CLI (init/dev/build/test)
      ↓
docs/ (GitHub Pages — API docs + live examples)
```

### Decantation Vocabulary

| Term | Definition |
|------|-----------|
| **Terroir** | Domain archetype — what kind of product this is |
| **Vintage** | Visual identity — style + mode + recipe + shape |
| **Character** | Brand personality as trait words (guides density, tone, animation) |
| **Essence** | Persistent project DNA file (`decantr.essence.json`) |
| **Tannins** | Functional backbone systems (auth, analytics, notifications) |
| **Blend** | Per-page spatial arrangement — row-based layout tree of patterns |
| **Pattern** | Reusable UI building block from `registry/patterns/` |
| **Recipe** | Visual language overlay — composition rules for drastic visual transformations |
| **Cork** | Validation constraints derived from the Essence (drift prevention) |

Full methodology: `reference/decantation-process.md`

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
  form/         — Form system: createForm, validators, fieldArray
  css/          — Style/mode system, atomic CSS, runtime injection, seed-derived tokens
    styles/     — Style definitions (auradecantism.js, clean.js, retro.js, glassmorphism.js, command-center.js)
    derive.js   — Derivation engine: 10 seeds → 280+ tokens
  tags/         — Proxy-based tag functions for concise markup
  components/   — UI component library (100+ components + icon)
  test/         — Test runner with lightweight DOM implementation
  registry/     — Machine-readable API catalog
    components.json   — Component specs (props, types, enums)
    patterns/         — 35 composable UI compositions
    archetypes/       — 4 domain blueprints (ecommerce, saas-dashboard, portfolio, content-site)
    recipe-*.json     — Visual identity overlays (command-center)
cli/
  commands/     — CLI commands: init, dev, build, test
tools/          — Build tooling: dev-server, builder, init-templates, css-extract, minify, registry generator
test/           — Framework test suite
playground/     — Test project (simulates `decantr init` output)
workbench/      — Decantation Explorer (7-layer interactive workbench, port 4300)
```

> **v0.4.0 breaking:** `src/blocks/` and `src/kit/` removed. Replaced by patterns (`registry/patterns/`) and archetypes (`registry/archetypes/`). "Anatomy" renamed to "Structure", "Organs" renamed to "Tannins".

## Module Exports

### `decantr/core` — src/core/index.js
- `h(tag, attrs, ...children)` — Create DOM elements (hyperscript)
- `text(fn)` — Create reactive text node from getter function
- `cond(predicate, trueBranch, falseBranch)` — Conditional rendering
- `list(items, keyFn, renderFn)` — Keyed list rendering
- `mount(component, target)` — Mount component to DOM element. Call `unmount(target)` to tear down
- `unmount(root)` — Unmount a previously mounted component
- `onMount(fn)` — Register callback for after mount
- `onDestroy(fn)` — Register callback for teardown
- `ErrorBoundary(props, ...children)` — Catch errors in child tree. Props: `fallback(error)`
- `Portal(props, ...children)` — Render children into `props.target` element (default: `document.body`)
- `Suspense(props, ...children)` — Show `props.fallback` while async children load
- `Transition(props, child)` — Animate enter/leave of child element
- `forwardRef(component)` — Forward ref to inner element

### `decantr/state` — src/state/index.js
- `createSignal(initial)` — Returns `[getter, setter]` reactive primitive
- `createEffect(fn)` — Auto-tracking reactive effect
- `createMemo(fn)` — Cached derived computation
- `createStore(obj)` — Reactive object with per-property proxy tracking
- `batch(fn)` — Batch multiple signal updates into one effect flush
- `createResource(fetcher, options)` — Async data fetching with `loading`/`error`/`data` signals
- `createContext(defaultValue)` — Create a context for dependency injection
- `createSelector(source)` — Memoized selector for efficient list item tracking
- `createDeferred(fn)` — Deferred computation (runs after effects settle)
- `createHistory(signal, options)` — Undo/redo history for a signal
- `useLocalStorage(key, initial)` — Signal backed by localStorage, syncs across tabs
- `untrack(fn)` — Run `fn` without tracking signal reads
- `peek(getter)` — Read a signal without tracking

### `decantr/router` — src/router/index.js
- `createRouter(config)` — Create router. Config: `{ mode, routes, beforeEach, afterEach, transitions, scrollBehavior }`
- `link(props, ...children)` — Router-aware anchor element with active class
- `navigate(path, opts)` — Programmatic navigation. `opts: { replace, state }`
- `useRoute()` — Get current route signal (`path`, `params`, `query`, `name`)
- `useSearchParams()` — Get/set reactive query parameters

Features: nested routes, route guards (`beforeEach`/`afterEach`), lazy loading via `() => import()`, named routes, scroll restoration, URL validation (rejects `javascript:`, `data:`, absolute URLs). Strategies: `hash` (default), `history` (History API).

### `decantr/form` — src/form/index.js
- `createForm(config)` — Create reactive form. Config: `{ fields, validators, onSubmit }`. Returns FormInstance with `submit()`, `reset()`, `fieldArray(name)`
- `validators` — Built-in validators: `required`, `email`, `minLength`, `maxLength`, `min`, `max`, `pattern`, `match`, `custom`, `async`
- `useFormField(form, name)` — Bind a field to a form instance, returns `{ value, error, touched, props }`

### `decantr/css` — src/css/index.js
- `css(...classes)` — Compose atomic CSS class names
- `define(name, declarations)` — Define custom atomic classes
- `sanitize(str)` — Sanitize HTML string (XSS prevention)
- `extractCSS()` — Get all generated CSS as string
- `reset()` — Clear injected styles
- **Style API**: `setStyle(id)` / `getStyle()` / `getStyleList()` / `registerStyle(style)`
- **Mode API**: `setMode('light'|'dark'|'auto')` / `getMode()` / `getResolvedMode()` / `onModeChange(fn)`
- **Shape API**: `setShape(id)` / `getShape()` / `getShapeList()` — Control border-radius personality (sharp/rounded/pill)
- **Colorblind API**: `setColorblindMode(type)` / `getColorblindMode()` — CVD-safe seed transformation + chart palettes (`'off'|'protanopia'|'deuteranopia'|'tritanopia'`)
- **Compat**: `setTheme(id, mode?)` / `getTheme()` / `getThemeMeta()` / `getThemeList()` / `registerTheme(theme)`
- `getActiveCSS()` — Get complete CSS for active style's theme layer
- `resetStyles()` — Reset to default (auradecantism + dark)
- `setAnimations(enabled)` / `getAnimations()` — JS animation control

### `decantr/tags` — src/tags/index.js (primary API for code generation — always prefer over h())
- `tags` — Proxy object that creates tag functions on demand
- Destructure what you need: `const { div, h2, p, button, span } = tags;`
- First arg auto-detected as props object or child node
- ~25% fewer tokens than `h()` calls — no string tag names, no `null` for empty props

### `decantr/components` — src/components/index.js
100+ components + icon helper. All return HTMLElement. Reactive props accept signal getters.
Before generating component code, read `src/registry/components.json` for full props, types, and enums.

**Form:** Button, Input, Textarea, Checkbox, Switch, Select, Combobox, DatePicker, DateRangePicker, TimePicker, TimeRangePicker, TreeSelect, Cascader, RadioGroup, Slider, RangeSlider, Toggle, ColorPicker, InputNumber, InputOTP, Mentions
**Display:** Card (+Header/Body/Footer), Badge, Table, DataTable, Avatar, AvatarGroup, Progress, Skeleton, Chip, Spinner, Image, Timeline
**Layout:** Tabs, Accordion, Separator, Breadcrumb, Pagination, Splitter
**Overlay & Feedback:** Modal, Tooltip, Alert, toast(), icon(), Sheet, Drawer, Popover, Tour, Dropdown, BackTop
**Navigation:** Menu, NavigationMenu, Steps, Segmented, ContextMenu
**Typography:** Title, Text, Paragraph, Blockquote, Kbd
**Utility:** VisuallyHidden
**Chart:** Line, Bar, Area, Scatter, Pie, Radar, Gauge, Funnel, Sparkline, etc.

102 exports total. See `src/registry/components.json` for full props, types, and enums.

### Registry Architecture — `src/registry/`

The registry is the machine-readable heart of Decantr. Three layers above components:

**Patterns** (`registry/patterns/*.json`): 35 composable UI compositions (hero, kpi-grid, data-table, auth-form, pricing-table, wizard, etc.). Each defines components used, default blend (layout atoms), and optional recipe overrides.

**Archetypes** (`registry/archetypes/*.json`): 4 domain blueprints (ecommerce, saas-dashboard, portfolio, content-site). Each defines pages with structure (page skeleton), tannins (functional systems), and blend specs (pattern arrangement). Full architect trigger files (`registry/architect/domains/`) exist only for ecommerce; others use archetype blueprints directly.

**Recipes** (`registry/recipe-*.json`): Visual identity overlays with CSS decorator classes and composition rules for drastic visual transformations.

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
2. **Atoms first, inline styles almost never** — `class: css('_flex _gap4 _p6 _bg2')` for all layout, spacing, typography, color. `style:` is ONLY permitted for values that cannot be known until JS executes at runtime: signal-derived dimensions, values from DOM measurement (`getBoundingClientRect`, scroll offsets), user-provided data (color pickers, drag positions), or CSS custom property injection via `setProperty()`. A value that is static in source code (e.g., `font-weight:700`, `width:32px`, `border-top:1px solid`) is NEVER dynamic — use atoms, arbitrary bracket notation (`_w[32px]`, `_fw[700]`), or `define()`.
3. **One component per file, named export** — Signal state at top, DOM return at bottom.
4. **Reactive props use getters** — `Button({ disabled: () => isLoading() })`, not `Button({ disabled: isLoading() })`.
5. **Consult the registry** — Read `src/registry/components.json` before generating component code. `src/registry/index.json` for full API overview.
6. **No external CSS or frameworks** — All styling through `css()` atoms and theme CSS variables.
7. **Accessibility is mandatory** — Every interactive element needs an accessible name; icon-only buttons need `aria-label`.
8. **Trace the chain** — Before modifying any component, verify whether the change requires updates to `_base.js`, style definitions, `derive.js`, the registry, or the docs site. Include all required updates in the same change.
9. **Clean up resources** — Every component adding document listeners, timers, or observers MUST wire cleanup via `onDestroy`. Use `_behaviors.js` primitives. See `reference/component-lifecycle.md`.
10. **Every UI composition is a system artifact.** If you need a demo layout, a card grid, a section structure — check if a pattern exists. If not, create one in the registry. The workbench, docs site, CLI output, and generated user code all consume the same patterns. One-off layouts are technical debt.
11. **Test accessibility** — New components MUST include tests for ARIA attributes, keyboard interaction, and focus management. See `reference/component-lifecycle.md`.
12. **Never fall back to inline `style:` for static values.** When no atom exists for a CSS property you need, follow this escalation: (1) Check `reference/atoms.md` for an existing atom. (2) Use arbitrary bracket notation: `css('_w[32px]')`, `css('_top[100%]')` — see `ARB_PROPS` in `src/css/index.js`. (3) If the property has no bracket prefix, use `define('_myAtom', 'transform:rotate(45deg)')` to create a project-level atom. (4) If the property is broadly useful, propose adding it to `ARB_PROPS` in `src/css/index.js` and atoms in `src/css/atoms.js`. Inline `style:` for a value that is static in source code is ALWAYS a bug.
13. **Use `.d-field` for all form field containers** — Input wraps, select wraps, textarea wraps, combobox wraps, and all field-like containers MUST apply `.d-field` class via `applyFieldState()` from `_primitives.js`. Use `data-error`/`data-success` attributes for validation state, `data-disabled` for disabled state. Use `variant` prop to switch between `d-field-outlined` (default), `d-field-filled`, `d-field-ghost`. The structural wrapper for label+help+error is `.d-form-field` (via `createFormField()` from `_behaviors.js`).
14. **Field components use unified API** — All field components MUST accept: `variant`, `size`, `error`, `success`, `disabled`, `readonly`, `loading`, `label`, `help`, `required`, `aria-label`, `value`, `onchange`, `ref`, `class`. Use `applyFieldState()` for reactive field state, `createFormField()` when `label` or `help` is provided. Use `createFieldOverlay()` for overlay fields.
15. **Components MUST use `tags`, not `h()`** — All component files import `tags` from `decantr/tags` and destructure needed tag functions. `h()` is only used for HTML table elements (`table`, `thead`, `tbody`, `tr`, `th`, `td`) which are not in the proxy.
16. **Use shared primitives** — Calendar rendering uses `renderCalendar()`, time columns use `renderTimeColumns()`, menu items use `renderMenuItems()`, all from `_primitives.js`. Never duplicate this rendering logic in individual components.

## CLI Commands

```
decantr init [name]   # Create minimal project skeleton with AGENTS.md + essence
decantr dev           # Dev server with hot reload
decantr build         # Production build to dist/
decantr test          # Run tests via node --test
decantr test --watch  # Watch mode
decantr validate      # Validate decantr.essence.json schema and consistency
```

### Internal Dev Scripts

```
npm run workbench:dev   # Decantation Explorer on localhost:4300 — 7-layer interactive workbench, style/mode switching, HMR
```

## Framework Conventions

- **Function components** — `function(props, ...children) → HTMLElement`. Real DOM nodes, not virtual DOM.
- **Style + Mode system** — Visual personality (auradecantism, clean, retro, glassmorphism, command-center) × color mode (light/dark/auto), controlled via `setStyle(id)` + `setMode(mode)`. 280+ tokens derived from 10 seed colors via OKLCH color math.
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
| `reference/decantation-process.md` | Full decantation methodology — POUR→SETTLE→CLARIFY→DECANT→SERVE→AGE |
| `reference/dev-server-routes.md` | Dev server — special routes, import rewriting, HMR |
| `reference/registry-consumption.md` | Registry data — how consumers fetch and use registry JSON |
| `reference/behaviors.md` | Component behaviors — overlay, listbox, focus trap, drag, virtual scroll, hotkeys |
| `reference/form-system.md` | Form system — createForm, validators, fieldArray, useFormField |
| `reference/router.md` | Router — nested routes, guards, lazy loading, scroll restoration, URL validation |
| `reference/state.md` | State — createResource, createContext, createHistory, createSelector, useLocalStorage |
| `reference/build-tooling.md` | Build — tree shaking, code splitting, source maps, CSS purging, CLI flags |
| `reference/color-guidelines.md` | Color work — palette roles, surface lightness, contrast rules, colorblind safety, OKLCH, harmony types, 60-30-10 distribution |
| `reference/spatial-guidelines.md` | Layout decisions — proximity tiers, density zones, responsive behavior, component sizing, typography rhythm, visual weight, optical corrections, elevation, component anatomy, micro-spacing |
| `reference/icons.md` | Icon work — API, size tiers, component integration, essential catalog, content strategy, accessibility, custom icons |
