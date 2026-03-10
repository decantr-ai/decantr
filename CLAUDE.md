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
- **EXISTING**: Does Decantr already have infrastructure for this? Check: `_base.js`, `_shared.js`, `css/styles/*.js`, `css/derive.js`, `css/index.js`, `registry/*.json`. Extend before inventing.
- **CONTRACT**: Am I changing a public API? What ecosystem code calls this? What registry entries reference it?
- **TOKENS**: Is this the most token-efficient design? Could the API be terser? Could the file be smaller? Could the registry describe it more compactly?

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
- **Style API** (visual personality):
  - `setStyle(id)` / `getStyle()` / `getStyleList()` / `registerStyle(style)` — Set/get/register visual styles ('clean', 'retro', or custom)
- **Mode API** (light/dark):
  - `setMode('light'|'dark'|'auto')` / `getMode()` / `getResolvedMode()` — Color mode control ('auto' tracks system preference)
  - `onModeChange(fn)` — Register callback for resolved mode changes, returns unsubscribe function
- **Convenience / backward compat**:
  - `setTheme(id, mode?)` — Combines setStyle + setMode; accepts legacy theme IDs
  - `getTheme()` / `getThemeMeta()` / `getThemeList()` / `registerTheme(theme)` — Backward-compatible wrappers
- `getActiveCSS()` — Get complete CSS for active style's theme layer
- `resetStyles()` — Reset to default (clean + light)
- `setAnimations(enabled)` / `getAnimations()` — JS animation control (disable all transitions/animations)

### `decantr/tags` — src/tags/index.js (primary API for code generation — always prefer over h())
- `tags` — Proxy object that creates tag functions on demand
- Destructure what you need: `const { div, h2, p, button, span } = tags;`
- First arg auto-detected as props object or child node
- `div({ class: 'card' }, h2('Title'))` — with props
- `p('Hello')` — no props, just children
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

**Reactive prop pattern**: Kit components accept signal getters OR static values:
```javascript
// Signal getter — auto-tracks changes
StatsGrid({ items: () => stats() })
// Static value — no tracking
StatsGrid({ items: staticArray })
```
Detection: `typeof prop === 'function'`

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

## Style + Mode System

Decantr uses an orthogonal **style × mode** architecture. Visual personality (style) is independent from color mode (light/dark/auto).

### Styles (Visual Personality)

| Style | Description | Personality |
|-------|-------------|-------------|
| auradecantism | **(default)** Dark glass aesthetic — vibrant purple/cyan/pink palette, mesh gradients, luminous glow, frosted surfaces | radius:pill, elevation:glass, motion:bouncy, borders:thin |
| clean | Modern minimal — rounded corners, subtle shadows, smooth motion | radius:rounded, elevation:subtle, motion:smooth, borders:thin |
| retro | Neobrutalism — sharp corners, offset shadows, bold borders | radius:sharp, elevation:brutalist, motion:snappy, borders:bold |
| glassmorphism | Frosted glass — translucent surfaces, vivid gradients, bouncy motion | radius:pill, elevation:glass, motion:bouncy, borders:thin |

### Modes

| Mode | Behavior |
|------|----------|
| light | Light color scheme |
| dark | Dark color scheme |
| auto | Tracks system `prefers-color-scheme`, listens for changes |

### Seed-Derived Token System

10 seed colors + 6 personality traits are algorithmically expanded into **170+ CSS custom properties** by `src/css/derive.js`. No manual color definitions needed — everything is computed.

**Seed colors:** primary, accent, tertiary, neutral, success, warning, error, info, bg, bgDark
**Personality traits:** radius (sharp/rounded/pill), elevation (flat/subtle/raised/glass/brutalist), motion (instant/snappy/smooth/bouncy), borders (none/thin/bold), density (compact/comfortable/spacious), gradient (none/subtle/vivid/mesh)

### Semantic Color Tokens

| Token Pattern | Count | Description |
|---------------|-------|-------------|
| `--d-{role}` | 7 | Base palette: primary, accent, tertiary, success, warning, error, info |
| `--d-{role}-fg` | 7 | WCAG AA foreground on base |
| `--d-{role}-hover` | 7 | Hover state |
| `--d-{role}-active` | 7 | Active/pressed state |
| `--d-{role}-subtle` | 7 | Low-opacity tint background |
| `--d-{role}-subtle-fg` | 7 | Text on subtle background |
| `--d-{role}-border` | 7 | Semi-transparent border |
| `--d-bg`, `--d-fg` | 2 | Page background / foreground |
| `--d-muted`, `--d-muted-fg` | 2 | Muted text (labels, descriptions) |
| `--d-border`, `--d-border-strong` | 2 | Border colors |
| `--d-ring` | 1 | Focus ring color (defaults to primary) |
| `--d-overlay` | 1 | Modal/dialog backdrop |
| `--d-surface-{0-3}` | 4 | Surface backgrounds (canvas → overlay) |
| `--d-surface-{0-3}-fg` | 4 | Surface foregrounds |
| `--d-surface-{0-3}-border` | 4 | Surface borders |
| `--d-surface-{1-3}-filter` | 3 | Backdrop-filter for glass styles |
| `--d-elevation-{0-3}` | 4 | Box-shadow by level |

### Z-Index Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--d-z-dropdown` | 1000 | Select, combobox, datepicker, cascader, dropdown, menu |
| `--d-z-sticky` | 1100 | Affix, float button |
| `--d-z-modal` | 1200 | Modal, drawer, sheet, image overlay, tour |
| `--d-z-popover` | 1300 | Popover, popconfirm, context menu, hovercard |
| `--d-z-toast` | 1400 | Toast, notification, message containers |
| `--d-z-tooltip` | 1500 | Tooltip |

### Interaction Tokens

`--d-hover-translate`, `--d-hover-shadow`, `--d-hover-brightness`, `--d-active-scale`, `--d-active-translate`, `--d-active-shadow`, `--d-focus-ring-width`, `--d-focus-ring-color`, `--d-focus-ring-offset`, `--d-focus-ring-style`, `--d-selection-bg`, `--d-selection-fg`

### Motion Tokens

`--d-duration-instant`, `--d-duration-fast`, `--d-duration-normal`, `--d-duration-slow`, `--d-easing-standard`, `--d-easing-decelerate`, `--d-easing-accelerate`, `--d-easing-bounce`

### Gradient Tokens

`--d-gradient-brand`, `--d-gradient-brand-alt`, `--d-gradient-brand-full`, `--d-gradient-surface`, `--d-gradient-overlay`, `--d-gradient-subtle`, `--d-gradient-text`, `--d-gradient-text-alt`, `--d-gradient-angle`, `--d-gradient-intensity`

### Chart Tokens

`--d-chart-0` through `--d-chart-7` (resolved hex for SVG/canvas compat), `--d-chart-tooltip-bg`

### Density Classes

`.d-compact`, `.d-comfortable`, `.d-spacious` — cascade to children, override `--d-density-pad-x`, `--d-density-pad-y`, `--d-density-gap`, `--d-density-min-h`, `--d-density-text`, `--d-compound-pad`, `--d-compound-gap`

| Density | `--d-compound-pad` | `--d-compound-gap` | Controls | Interiors |
|---------|--------------------|--------------------|----------|-----------|
| compact | `var(--d-sp-3)` | `var(--d-sp-2)` | Tighter | Tighter |
| comfortable | `var(--d-sp-5)` | `var(--d-sp-3)` | Default | Default |
| spacious | `var(--d-sp-8)` | `var(--d-sp-4)` | Wider | Wider |

### Custom Styles

```javascript
registerStyle({
  id: 'my-style',
  name: 'My Style',
  seed: { primary: '#6366f1', accent: '#ec4899', bg: '#ffffff', bgDark: '#0a0a0a' },
  personality: { radius: 'pill', elevation: 'glass', motion: 'bouncy', borders: 'none' },
  typography: { '--d-fw-heading': '800' },  // optional overrides
  overrides: { light: {}, dark: {} },       // optional per-mode token overrides
  components: '',                            // optional component CSS
});
```

### Legacy Backward Compatibility

`--c0` through `--c9` are automatically mapped from the new tokens via `legacyColorMap()`. Legacy atoms `_bg0`-`_bg9`, `_fg0`-`_fg9`, `_bc0`-`_bc9` still work. `setTheme()`, `getTheme()`, `registerTheme()` are backward-compatible wrappers.

## Design Token Architecture

Components use a two-layer CSS system: base CSS (`_base.js`) for structure, style CSS (`styles/*.js` + `derive.js`) for visual identity. All spacing and typography references design tokens via `var()` with fallbacks.

### Typography Tokens

| Token | Default | Semantic Role |
|-------|---------|---------------|
| `--d-font` | `system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif` | Body font family |
| `--d-font-mono` | `ui-monospace,SFMono-Regular,"SF Mono",Menlo,Consolas,"Liberation Mono",monospace` | Code font family |
| `--d-text-xs` | `0.625rem` | Progress labels, avatar-fallback-sm |
| `--d-text-sm` | `0.75rem` | Badges, tooltips, captions |
| `--d-text-base` | `0.875rem` | Body default, inputs, tables, tabs, alerts |
| `--d-text-md` | `1rem` | Feature titles, btn-lg |
| `--d-text-lg` | `1.125rem` | Card headers, lead text |
| `--d-text-xl` | `1.25rem` | Dashboard header, sidebar branding |
| `--d-text-2xl` | `1.5rem` | Section titles |
| `--d-text-3xl` | `2rem` | Article/page headings, stat values |
| `--d-text-4xl` | `2.5rem` | Hero headlines, pricing price |
| `--d-lh-none` | `1` | Single-line (buttons, badges, icons) |
| `--d-lh-tight` | `1.1` | Large headings, hero text |
| `--d-lh-snug` | `1.25` | Subheadings |
| `--d-lh-normal` | `1.5` | Body text, tables, form labels |
| `--d-lh-relaxed` | `1.6` | Descriptive/long-form text |
| `--d-lh-loose` | `1.75` | Article body, reading mode |
| `--d-fw-heading` | `700` | Heading font-weight (retro: `800`) |
| `--d-fw-title` | `600` | Title/subtitle font-weight (retro: `800`) |
| `--d-ls-heading` | `-0.025em` | Heading letter-spacing (retro: `0.05em`, stormy-ai: `-0.015em`) |

### Spacing Tokens

| Token | Default | Common Usage |
|-------|---------|-------------|
| `--d-sp-1` | `0.25rem` | Badge padding, minimal gaps |
| `--d-sp-1-5` | `0.375rem` | Button-sm padding, tooltip padding, chip gap, table-compact |
| `--d-sp-2` | `0.5rem` | Button gap, input padding, control gaps |
| `--d-sp-2-5` | `0.625rem` | Button-lg padding, tab vertical padding, tooltip horizontal |
| `--d-sp-3` | `0.75rem` | Cell padding, alert/toast, accordion |
| `--d-sp-4` | `1rem` | Tab/accordion padding, element spacing |
| `--d-sp-5` | `1.25rem` | Container padding (dark/retro `--d-pad`) |
| `--d-sp-6` | `1.5rem` | Container padding (light), card/feature padding |
| `--d-sp-8` | `2rem` | Section inline padding, hero margins |
| `--d-sp-10` | `2.5rem` | Reserved for larger layouts |
| `--d-sp-12` | `3rem` | Section block padding |
| `--d-sp-16` | `4rem` | Hero block padding |
| `--d-pad` | `1.25rem` | Card/Modal container padding (per-theme) |
| `--d-compound-gap` | `var(--d-sp-3)` | Gap between header↔body↔footer in compound components |
| `--d-compound-pad` | `var(--d-pad)` | Inline + block-end padding in compound components |
| `--d-offset-dropdown` | `2px` | Trigger→panel offset for form dropdowns (select, combobox, etc.) |
| `--d-offset-menu` | `4px` | Trigger→panel offset for dropdown/context menus |
| `--d-offset-tooltip` | `6px` | Trigger→panel offset for tooltips |
| `--d-offset-popover` | `8px` | Trigger→panel offset for popovers/hovercards |

**Style-specific token overrides (retro):**

| Token | clean (default) | retro |
|-------|----------------|-------|
| `--d-fw-heading` | 700 | 800 |
| `--d-fw-title` | 600 | 800 |
| `--d-fw-medium` | 500 | 700 |
| `--d-ls-heading` | -0.025em | 0.05em |

### Composition Guidelines

- **External layout** — Use atomic CSS (`_gap4`, `_grid _gc3`, `_p6`) for spacing between components
- **Internal spacing** — Components handle their own padding via `--d-pad` token; don't add padding inside Card/Modal wrappers
- **Theme overrides** — Only add padding in theme CSS when it intentionally differs from base (e.g. retro's accordion/tabs)
- **Token-backed atoms** — Use `_textbase`, `_fwheading`, `_lhnormal` etc. in kit/block code for theme-customizable typography (see Atomic CSS Reference)

### Compound Spacing Contract

All compound components (Card, Modal, AlertDialog, Drawer, Sheet) follow a unified spacing contract via `--d-compound-pad` and `--d-compound-gap`. This ensures consistent header↔body↔footer spacing across all overlay and container components.

| Section | Padding Rule |
|---------|-------------|
| **Header** | `var(--d-compound-pad) var(--d-compound-pad) 0` |
| **Body** | `var(--d-compound-gap) var(--d-compound-pad)` |
| **Body:last-child** | adds `padding-bottom: var(--d-compound-pad)` |
| **Footer** | `var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)` |

New compound components MUST follow this contract. Never hardcode padding in header/body/footer — use the compound tokens.

### Popup Offset Hierarchy

All floating elements use offset tokens for trigger→panel distance. The hierarchy reflects visual weight:

`--d-offset-dropdown` (2px) < `--d-offset-menu` (4px) < `--d-offset-tooltip` (6px) < `--d-offset-popover` (8px)

New floating components MUST use the appropriate offset token, never hardcoded pixel values.

### Prose System

`.d-prose` — auto-applies vertical rhythm to child elements. Use for long-form content (articles, documentation, modal descriptions).

- Base: `font-size:var(--d-text-base); line-height:var(--d-lh-relaxed)`
- Between siblings: `> * + * { margin-top: var(--d-sp-4) }`
- Headings: graduated margin-top (sp-12→sp-10→sp-8→sp-6) + margin-bottom (sp-4→sp-3)
- Lists: left padding, per-item spacing
- Blockquote: left border + padding + italic
- Code/pre: mono font, padding, surface background
- Tables: cell padding, bottom borders

Usage: `div({ class: 'd-prose' }, h1('Title'), p('Body text...'), ul(li('Item')))`

### Spacing Utilities

Child-spacing utilities use the `d-` prefix (not `_` atom prefix) because they require child combinators (`> * + *`) which cannot be expressed in the flat atomMap.

| Class | Effect |
|-------|--------|
| `d-spacey-{1-24}` | `> * + * { margin-top: {scale} }` — vertical child spacing |
| `d-spacex-{1-24}` | `> * + * { margin-left: {scale} }` — horizontal child spacing |
| `d-dividey` | `> * + * { border-top: 1px solid var(--d-border) }` |
| `d-dividex` | `> * + * { border-left: 1px solid var(--d-border) }` |
| `d-dividey-strong` | `> * + * { border-top: 1px solid var(--d-border-strong) }` |
| `d-dividex-strong` | `> * + * { border-left: 1px solid var(--d-border-strong) }` |

Scale: 1 (0.25rem) through 24 (6rem). Same spacing scale as `_p`/`_m` atoms.

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

### Init Flow

1. `decantr init myapp` — creates minimal skeleton (package.json, config, HTML shell, AGENTS.md, example app.js)
2. `cd myapp && npm install && npx decantr dev` — dev server starts
3. User prompts their AI to build the app using AGENTS.md as the translation layer

## Framework Conventions

- **Function components** — `function(props, ...children) → HTMLElement`. Real DOM nodes, not virtual DOM.
- **Style + Mode system** — Visual personality (clean, retro) × color mode (light/dark/auto), controlled via `setStyle(id)` + `setMode(mode)`. 170+ tokens derived from 10 seed colors.
- **Atomic CSS engine** — 1000+ utility atoms available via `css()`. All atoms are prefixed with `_` for namespace safety. See reference below.

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

- `dev-server.js` — Development server with file watching, hot reload, import rewriting. Accepts optional `options.watchDirs` array for watching additional directories (used by workbench). Routes reference: `reference/dev-server-routes.md`
- `builder.js` — Production bundler (HTML, JS, CSS extraction)
- `init-templates.js` — Template functions for `decantr init` (packageJson, indexHtml, configJson, claudeMd, appJs, agentsMd)
- `css-extract.js` — Extract and deduplicate atomic CSS from source
- `minify.js` — JS/CSS/HTML minification
- `registry.js` — Auto-generates `src/registry/` (index + per-module specs) from JSDoc annotations. Auto-runs in pre-commit hook; manual: `node tools/registry.js`

## Reference Docs (reference/)

Deep-dive documentation for each subsystem. Read when working on that specific area.

- `reference/kit-architecture.md` — Kit component patterns, _shared.js utilities, reactive props, how to add new kits
- `reference/dev-server-routes.md` — Special routes, import rewriting, HMR, framework source serving

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

## Atomic CSS Reference

All atoms are prefixed with `_` (underscore) for namespace safety — zero conflicts with Tailwind, Bootstrap, or any CSS framework. Every decantr atom starts with `_`.

All atoms are available via `css()`. Example: `css('_grid _gc3 _gap4 _p6 _ctr')`.

### Spacing (_p, _m, _gap — scale 0-12 + 14,16,20,24,32,40,48,56,64)
| Prefix | Property | Example |
|--------|----------|---------|
| `_p` | padding | `_p4` → `1rem` |
| `_px/_py` | padding-inline/block | `_px2` → `0.5rem` |
| `_pt/_pr/_pb/_pl` | padding sides | `_pt1` → `0.25rem` |
| `_m` | margin | `_m4` → `1rem` |
| `_mx/_my` | margin-inline/block | `_mx2` → `0.5rem` |
| `_mt/_mr/_mb/_ml` | margin sides | `_mt1` → `0.25rem` |
| `_gap/_gx/_gy` | gap/column-gap/row-gap | `_gap4` → `1rem` |

### Negative Margins (scale 1-12 + 14,16,20,24,32)
`_-m2` → `margin:-0.5rem`, `_-mt4` → `margin-top:-1rem`, `_-mx1`, `_-my3`, `_-mr2`, `_-mb1`, `_-ml4`

### Auto Margins
`_ma` (margin:auto), `_mxa` (margin-inline:auto), `_mya` (margin-block:auto), `_mta`, `_mra`, `_mba`, `_mla`

### Width/Height (scale 0-12 + extended + keywords)
| Atom | Output |
|------|--------|
| `_w4/_h4` | width/height: 1rem |
| `_wfull/_hfull` | 100% |
| `_wscreen` | width:100vw |
| `_hscreen` | height:100vh |
| `_wauto/_hauto` | auto |
| `_wfit/_hfit` | fit-content |
| `_wmin/_wmax` | min-content/max-content |
| `_hmin/_hmax` | min-content/max-content |
| `_mw4/_mh4` | max-width/max-height |
| `_mwmin/_mwmax` | max-width: min/max-content |
| `_mhmin/_mhmax` | max-height: min/max-content |

### Min-Width/Height (scale 0-12 + extended + keywords)
`_minw0`-`_minw64`, `_minwfull`, `_minwscreen` (100vw), `_minwfit`, `_minwmin`, `_minwmax`
`_minh0`-`_minh64`, `_minhfull`, `_minhscreen` (100vh), `_minhfit`, `_minhmin`, `_minhmax`

### Display
`_block`, `_inline`, `_flex`, `_grid`, `_none`, `_contents`, `_iflex`, `_igrid`

### Flexbox
| Atom | Output |
|------|--------|
| `_col/_row` | flex-direction |
| `_colr/_rowr` | column-reverse/row-reverse |
| `_wrap/_nowrap/_wrapr` | flex-wrap |
| `_grow/_grow0` | flex-grow: 1/0 |
| `_shrink/_shrink0` | flex-shrink: 1/0 |
| `_flex1` | flex: 1 1 0% |
| `_flexauto` | flex: 1 1 auto |
| `_flexnone` | flex: none |
| `_flexinit` | flex: 0 1 auto |

### Flex-Basis (scale 0-12 + extended + percentages)
`_basis0`-`_basis12`, `_basis14`-`_basis64`, `_basisa` (auto)
`_basis25` (25%), `_basis33` (33.333%), `_basis50` (50%), `_basis66` (66.667%), `_basis75` (75%), `_basisfull` (100%)

### Order
`_ord0`-`_ord12`, `_ord-1` (-1), `_ordfirst` (-9999), `_ordlast` (9999)

### Alignment
| Atom | Property | Value |
|------|----------|-------|
| `_center` | align-items + justify-content | center |
| `_aic/_ais/_aifs/_aife/_aibs` | align-items | center/stretch/flex-start/flex-end/baseline |
| `_jcc/_jcsb/_jcsa/_jcse/_jcfs/_jcfe` | justify-content | center/space-between/around/evenly/flex-start/flex-end |
| `_acc/_acsb/_acsa/_acse/_acfs/_acfe/_acs` | align-content | center/space-between/around/evenly/flex-start/flex-end/stretch |
| `_asc/_ass/_asfs/_asfe/_asa/_asbs` | align-self | center/stretch/flex-start/flex-end/auto/baseline |
| `_jic/_jis/_jifs/_jife` | justify-items | center/stretch/start/end |
| `_jsc/_jss/_jsfs/_jsfe/_jsa` | justify-self | center/stretch/start/end/auto |
| `_pic/_pis` | place-items | center/stretch |
| `_pcc/_pcse/_pcsb` | place-content | center/space-evenly/space-between |

### Grid System
| Atom | Output |
|------|--------|
| `_gc1`-`_gc12` | grid-template-columns: repeat(N,minmax(0,1fr)) |
| `_gcnone` | grid-template-columns: none |
| `_gr1`-`_gr6` | grid-template-rows: repeat(N,minmax(0,1fr)) |
| `_grnone` | grid-template-rows: none |
| `_span1`-`_span12` | grid-column: span N/span N |
| `_spanfull` | grid-column: 1/-1 |
| `_rspan1`-`_rspan6` | grid-row: span N/span N |
| `_rspanfull` | grid-row: 1/-1 |
| `_gcs1`-`_gcs13` | grid-column-start |
| `_gce1`-`_gce13` | grid-column-end |
| `_grs1`-`_grs7` | grid-row-start |
| `_gre1`-`_gre7` | grid-row-end |
| `_gcaf160/200/220/250/280/300/320` | repeat(auto-fit,minmax(Npx,1fr)) |
| `_gcaf` | repeat(auto-fit,minmax(0,1fr)) |
| `_gcafl` | repeat(auto-fill,minmax(0,1fr)) |
| `_gflowr/_gflowc/_gflowd/_gflowrd/_gflowcd` | grid-auto-flow |
| `_gacfr/_gacmin/_gacmax` | grid-auto-columns |
| `_garfr/_garmin/_garmax` | grid-auto-rows |

### Aspect Ratio
`_arsq` (1), `_ar169` (16/9), `_ar43` (4/3), `_ar219` (21/9), `_ar32` (3/2), `_ara` (auto)

### Container Utilities
`_ctrsm` (640px), `_ctr` (960px), `_ctrlg` (1080px), `_ctrxl` (1280px), `_ctrfull` (100%) — all include margin-inline:auto

### Overflow
`_ohidden`, `_oauto`, `_oscroll`, `_ovisible`
`_oxhidden`, `_oxauto`, `_oxscroll`, `_oyhidden`, `_oyauto`, `_oyscroll`

### Text & Visibility
`_visible`, `_invisible`, `_wsnw` (nowrap), `_wsnormal`, `_wspre`, `_wsprewrap`
`_truncate` (overflow:hidden + text-overflow:ellipsis + white-space:nowrap)
`_clamp2`, `_clamp3` (line clamping via -webkit-line-clamp)

### Line-Height
`_lh1` (1), `_lh1a`/`_lh125` (1.25), `_lh1b`/`_lh150` (1.5), `_lh175` (1.75), `_lh2` (2)

### Typography
`_t10`-`_t48` (font-size, fixed rem), `_bold/_medium/_normal/_light` (weight), `_italic`, `_underline/_strike/_nounder`, `_upper/_lower/_cap`, `_tl/_tc/_tr`

### Token-Backed Typography (theme-customizable)
| Atom | CSS Output |
|------|-----------|
| `_textxs`-`_text4xl` | `font-size:var(--d-text-{size},{fallback})` — xs/sm/base/md/lg/xl/2xl/3xl/4xl |
| `_lhtight` | `line-height:var(--d-lh-tight,1.1)` |
| `_lhsnug` | `line-height:var(--d-lh-snug,1.25)` |
| `_lhnormal` | `line-height:var(--d-lh-normal,1.5)` |
| `_lhrelaxed` | `line-height:var(--d-lh-relaxed,1.6)` |
| `_lhloose` | `line-height:var(--d-lh-loose,1.75)` |
| `_fwheading` | `font-weight:var(--d-fw-heading,700)` |
| `_fwtitle` | `font-weight:var(--d-fw-title,600)` |
| `_lsheading` | `letter-spacing:var(--d-ls-heading,-0.025em)` |

Use `_text*`/`_lh*`/`_fw*` atoms in components/kits/blocks for theme-customizable typography. Use `_t10`-`_t48` for fixed sizes that should not change per theme.

### Typography Presets (compound atoms)

Bundles of size+weight+lineHeight+letterSpacing for common text roles. All token-backed with `var()` fallbacks — theme-customizable automatically (retro gets bolder headings, etc.).

| Atom | Size | Weight | Line Height | Extra |
|------|------|--------|-------------|-------|
| `_heading1` | `--d-text-4xl` | `--d-fw-heading` | `--d-lh-tight` | `--d-ls-heading` |
| `_heading2` | `--d-text-3xl` | `--d-fw-heading` | `--d-lh-tight` | `--d-ls-heading` |
| `_heading3` | `--d-text-2xl` | `--d-fw-heading` | `--d-lh-snug` | `--d-ls-heading` |
| `_heading4` | `--d-text-xl` | `--d-fw-title` | `--d-lh-snug` | — |
| `_heading5` | `--d-text-lg` | `--d-fw-title` | `--d-lh-snug` | — |
| `_heading6` | `--d-text-md` | `--d-fw-title` | `--d-lh-normal` | — |
| `_body` | `--d-text-base` | — | `--d-lh-normal` | — |
| `_bodylg` | `--d-text-md` | — | `--d-lh-relaxed` | — |
| `_caption` | `--d-text-sm` | — | `--d-lh-normal` | `color:--d-muted-fg` |
| `_label` | `--d-text-sm` | `--d-fw-medium` | `--d-lh-none` | — |
| `_overline` | `--d-text-xs` | `--d-fw-medium` | `--d-lh-none` | `uppercase; ls:0.08em` |

Usage: `h1({ class: css('_heading1') }, 'Page Title')` — one atom replaces 3-4 individual atoms.

### Colors
`_bg0`-`_bg9`, `_fg0`-`_fg9`, `_bc0`-`_bc9` (use theme CSS variables --c0 through --c9)

### Position
`_relative/_absolute/_fixed/_sticky` (or `_rel/_abs`), `_top0/_right0/_bottom0/_left0/_inset0`

### Borders
`_b0/_b1/_b2`, `_r0`-`_r8` (border-radius), `_rfull` (9999px), `_rcircle` (50%)

### Opacity, Transitions, Z-index, Shadow, Cursor
`_op0`-`_op10`, `_trans/_transfast/_transslow/_transnone`, `_z0/_z10/_z20/_z30/_z40/_z50`
`_shadow/_shadowmd/_shadowlg/_shadowno`, `_pointer/_grab`
