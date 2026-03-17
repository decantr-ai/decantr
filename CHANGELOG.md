# Changelog

## 0.9.1 — Production Cleanup

### Style System
- **Addon architecture**: Only `auradecantism` ships as core builtin. 10 styles moved to `src/css/styles/addons/` — import individually via `decantr/styles/clean` + `registerStyle()`
- **Plugin style wiring**: `mergePluginStyles()` added to theme-registry for plugin-contributed styles

### New Atom Features
- **Pseudo-class prefixes**: `_h:` (hover), `_f:` (focus), `_fv:` (focus-visible), `_a:` (active), `_fw:` (focus-within) — compose with ANY existing atom
- **Responsive + pseudo**: `_sm:h:bgmuted` — breakpoint-wrapped pseudo-class atoms
- **Ring utilities**: `_ring1`, `_ring2`, `_ring4`, `_ring0`, `_ringPrimary`, `_ringAccent`, `_ringBorder`
- **Transition shortcuts**: `_transColors`, `_transOpacity`, `_transTransform`, `_transShadow`
- **Prose atom**: `_prose` maps to `d-prose` class for nested rich-text typography (h1-h4, p, code, blockquote, etc.)
- **Divide utilities**: `_divideY`, `_divideX` — child separator borders
- **Text wrapping**: `_textBalance`, `_textPretty`
- **Scroll behavior**: `_scrollSmooth`

### Behaviors
- **createScrollReveal()**: IntersectionObserver wrapper that adds `d-visible` class on viewport entry. Returns cleanup function for `onDestroy`.

### Documentation Fixes
- CLAUDE.md: Updated style list to 11 (1 core + 10 addons), documented opacity modifiers and arbitrary transitions
- Docs essence synced to match actual 14 routes (was claiming 5-pattern homepage with only 1 implemented)
- Workbench essence: added version field, verified sidebar data-driven from registry
- Fixed markdown path resolution (relative → absolute) in tutorial and cookbook pages
- Added explorer module exports to package.json
- Reference docs: atoms.md documents all new atoms, llm-primer.md updated

### Consolidation
- Workbench integrated into docs site as `/workbench` route section
- `de-card-grid`/`de-card-item` custom CSS replaced with framework atoms
- docs/src/style.js: hardcoded pixel values replaced with design tokens

## 0.9.0 — Release Candidate

### Docs Site
- Full documentation site at decantr.ai with nested routing (17 routes)
- Markdown renderer (260 LOC) for tutorial and cookbook content
- ShadCN-style component gallery with search, category filters, and detail views
- Live component showcase carousel on landing page
- Framework comparison table (decantr vs React vs Angular)
- Sidebar layout with mobile hamburger, active link tracking
- JSON-LD structured data, enhanced OpenGraph/Twitter meta tags
- Explorer modules (icons, charts, tokens, atoms, patterns, archetypes, recipes, shells, tools) integrated into docs

### Registry Enrichment
- Icon groups (24) moved from workbench JS → `icons.json` registry
- Chart groups (5) + type metadata (25) in new `chart-showcase.json`
- Data subsection added to `foundations.json`
- Component group categorization in `components.json` (form, layout, data, feedback, navigation, overlay, typography, chart)

### CLI
- `decantr doctor` — 8 health checks with colored pass/warn/fail output
- Doctor accepts both `decantr` and `decantr` package names

### Infrastructure
- CI/CD: `ci.yml` (Node 20.x/22.x matrix), `docs-deploy.yml` (GitHub Pages), `release.yml` (tag → npm publish)
- `tools/verify-pack.js` — npm package verification (expected files, sensitive leak detection, size reporting)
- MIT LICENSE file
- README: CI/npm/license badges, expanded CLI commands list

### Playground
- Ellafi Lending Dashboard validated end-to-end (validate, doctor, lint, a11y, build)
- Playground README documenting validation checklist

## Unreleased

### Added
- **SSR + Hydration** (`decantr/ssr`) — server-side rendering for SEO-dependent apps. Zero DOM dependencies at module level.
  - `renderToString(component)` — renders component tree to HTML string in pure Node.js
  - `renderToStream(component)` — streaming render via Web Streams API (Node 18+)
  - `hydrate(root, component)` — walks existing SSR DOM, attaches signal bindings + event listeners without re-creating elements
  - SSR context: `h()`, `text()`, `cond()`, `list()`, `css()` all work transparently in server environment
- **Accessibility testing** (`decantr a11y`) — static analysis for 8 WCAG rules: button-label, input-label, img-alt, focus-visible, keyboard-handler, role-valid, heading-order, contrast-ratio. Zero dependencies. Also available via `decantr audit --a11y`.
- **`decantr migrate` command** — automated migration for `decantr.essence.json` between versions. Supports `--dry-run` for preview, `--target` for specific version. Migrations: 0.5.0 (organs→tannins, anatomy→structure) and 0.6.0 (pattern consolidation to preset format).
- **Starter templates** — `decantr init --template=<name>` with 5 templates: `saas-dashboard`, `ecommerce`, `portfolio`, `content-site`, `landing-page`. Each provides pre-filled essence, router setup, and page stubs.
- **Archetype inheritance** — Archetypes now support `extends` field for inheriting pages, tannins, and skeletons from parent archetypes. Circular dependency detection and max depth (5) enforced. `financial-dashboard` updated to extend `saas-dashboard` as a reference example.
- **Component-level HMR** — Dev server now sends targeted `hmr` messages for `src/pages/` and `src/components/` file changes instead of full-page reloads. Module-level state (signals, stores) is preserved across updates. Infrastructure files (`state/`, `css/`, `router/`, `app.js`, essence) still trigger full reload. HMR remount hook in `src/core/index.js` is gated behind `globalThis.__DECANTR_DEV__` for zero production cost.
- **Auth reference tannin** (`decantr/tannins/auth`) — token-based authentication with reactive signals, persistent cross-tab token storage, auto-refresh on 401, and route guard helper.
  - `createAuth(config)` — creates an auth instance with `user()`, `token()`, `isAuthenticated()`, `login()`, `logout()`, `refresh()`, `destroy()`
  - `requireAuth(router, options)` — installs route guard that redirects unauthenticated users to login page
  - Fetch middleware: auto-injects Bearer token, intercepts 401 → refresh → retry
  - Token persistence via `createPersisted()` with cross-tab sync

## v0.7.0 — Internationalization (2026-03-16)

### Added
- **i18n module** (`decantr/i18n`) — reactive internationalization built on Decantr signals and `Intl.PluralRules`. Zero external dependencies.
  - `createI18n({ locale, messages, fallbackLocale })` — creates a reactive i18n instance
  - `t(key, params?)` — translate with dot notation, `{param}` interpolation, and automatic pluralization via `_one`/`_other` suffixes
  - `locale()` — signal getter for the current locale
  - `setLocale(loc)` — reactively switch locales (all `t()` consumers auto-update)
  - `setDirection('rtl' | 'ltr')` — set `dir` attribute on `<html>` for RTL languages
  - `addMessages(locale, messages)` — deep-merge translations at runtime for lazy loading
  - Fallback chain: current locale -> fallback locale -> raw key
- **TypeScript declarations** for i18n (`types/i18n.d.ts`)
- **Reference docs** (`reference/i18n.md`) — API, interpolation, pluralization rules, RTL setup, lazy loading patterns
- **Test suite** (`test/i18n.test.js`) — comprehensive tests covering translation, dot notation, interpolation, pluralization, locale switching, fallback chain, direction setting, addMessages, edge cases, and reactivity

### Changed
- `package.json` — added `./i18n` export
- `tools/dev-server.js` — added `decantr/i18n` import map entry
- `tools/dts-gen.js` — added i18n declaration generator
- `src/registry/index.json` — added `decantr/i18n` module entry
- `CLAUDE.md` — added i18n import to Framework Imports section
- `AGENTS.md` — added react-intl/vue-i18n/svelte-i18n equivalence row for `createI18n`

## v0.6.0 — Architectural Audit & Pattern v2 (2026-03-16)

### Breaking Changes
- **Pattern v2 schema** — Patterns now support `presets` (named variants within a single file) and `default_preset`. Archetypes reference patterns as `{ "pattern": "hero", "preset": "image-overlay", "as": "recipe-hero" }` instead of separate files.
- **13 domain-specific patterns removed** and consolidated into presets on generic patterns:
  - `recipe-hero`, `cookbook-hero` → `hero` (presets: `image-overlay`, `image-overlay-compact`)
  - `product-grid`, `recipe-card-grid`, `cookbook-grid`, `feature-grid` → `card-grid` (presets: `product`, `content`, `collection`, `icon`)
  - `recipe-stats-bar` → `stats-bar`
  - `recipe-ingredients` → `checklist-card`
  - `recipe-instructions` → `steps-card`
  - `nutrition-card` → `stat-card`
  - `recipe-form-simple`, `recipe-form-chef` → `form-sections` (presets: `creation`, `structured`)
  - `profile-header` → `detail-header` (preset: `profile`)
- Pattern count: 49 → 41 (4 new generics + presets replace 13 domain-specific files)

### Added
- **Three-tier pattern architecture** — Tier 1 (structural patterns), Tier 2 (presets within patterns), Tier 3 (domain compositions in archetypes)
- **Pattern Design Review Gate** — mandatory checkpoint between CLARIFY and DECANT stages to prevent pattern proliferation
- **Plugin system** (`src/plugins/index.js`) — extend Decantr without forking via `plugins` config in `decantr.config.json`. Hooks: `onBuild`, `onDev`, `onGenerate`, `registerStyle`, `registerPattern`, `registerRecipe`
- **`decantr lint` command** — code quality gates: atom validation, essence drift detection, inline style detection
- **Error telemetry hooks** — `setErrorHandler(fn)` for ErrorBoundary integration with external error services
- **Request middleware** — `queryClient.use(middleware)` chain for auth headers, logging, retry logic
- **Cache invalidation API** — `queryClient.invalidateQueries('user.*')` glob-based query invalidation
- **Route metadata** — `meta` field on route definitions, merged parent→child, accessible via `useRoute().meta`
- **Bundle size budgets** — `build.sizeBudget` config with warnings for JS, CSS, total, and chunk size limits
- **Essence versioning** — `version` field (semver) for tracking essence evolution
- **Blend validation depth** — validates `at` breakpoints, `span` values, and span/cols consistency
- **Package distribution** — `files` field and `publishConfig` in package.json for clean npm publishing

### Changed
- Archetype schemas updated to v2 (`ecommerce.json`, `recipe-community.json`) with preset references
- Pattern index updated to v2 format with `presets` arrays per pattern
- `tools/generate.js` — `resolvePatternRef()` handles both v1 strings and v2 `{pattern, preset, as}` objects
- `test/decantation/engine.js` — `resolveBlend()` and `validateBlend()` handle v2 format
- `cli/commands/validate.js` — validates preset existence against pattern index
- `tools/figma-patterns.js` — preset-aware `patternToFigmaFrame()` and archetype composition
- `workbench/src/explorer/patterns.js` — displays presets as expandable sub-items within pattern detail
- All reference docs updated for v2 pattern architecture

## v0.5.1 — Recipe Community Archetype (2026-03-16)

### Added
- **New archetype: `recipe-community`** — AI-powered recipe sharing platform with 12 pages (home, feed, recipe detail, create/edit, AI generate, chef chat, cookbooks, profile, auth), 8 tannins, and 3 skeletons
- **14 new patterns** (now consolidated into presets in v0.6.0)
- **New pattern category: Social** — groups community and social cooking patterns in the workbench explorer
- Registry: 35 → 49 patterns, 6 → 7 archetypes

## v0.5.0 — Greenfield Component Rebuild (2026-03-13)

### Breaking Changes
- **`createFormField()` wrapper class** renamed from `d-field` → `d-form-field`. CSS classes `.d-field-label`, `.d-field-help`, `.d-field-error`, `.d-field-required` → `.d-form-field-*`. The `.d-field` class is now reserved for field visual styling (border/bg/focus).
- **`createFormField()` return value** changed from `HTMLElement` to `{ wrapper, setError, setSuccess, destroy }`.
- **ColorPicker** now uses OKLCH color space instead of HSV. Saturation panel is now a Lightness/Chroma plane. API unchanged (hex in/out).
- All 14 field components now apply `.d-field` class on their bordered container. Consumers querying DOM structure may need updates.

### Added
- **New file: `_primitives.js`** — shared rendering primitives: `renderCalendar()`, `renderTimeColumns()`, `renderMenuItems()`, `applyFieldState()`, `createFieldOverlay()`, `hexToOklch()`, `oklchToHex()`.
- **Unified field API** on all 14 field components: `variant` (outlined/filled/ghost), `success`, `loading`, `label`, `help`, `required`, `aria-label`.
- **`applyFieldState()`** — single source of truth for reactive `data-error`, `data-success`, `data-disabled`, variant class, size class on `.d-field` elements.
- **`createFieldOverlay()`** — thin wrapper around `createOverlay()` with field-standard defaults (portal, matchWidth, closeOnEscape/Outside).
- **Error/aria-label** support added to Checkbox, Switch, InputOTP, RadioGroup.
- **Keyboard navigation** added to Accordion (ArrowUp/Down/Home/End between triggers).
- **`disabled` prop** added to Segmented.
- **`aria-checked`** wired on Switch.
- 58 new component rebuild tests (425 total).

### Changed
- All 23 interactive components migrated from `h()` to `tags` proxy API (~25% fewer markup tokens).
- All overlay components (Select, Combobox, DatePicker, TimePicker, Cascader, TreeSelect, Mentions, ColorPicker) now use `createFieldOverlay()` + portal positioning.
- Combobox: manual click-outside replaced with `createOverlay()`.
- Mentions: blur timeout replaced with `createOverlay()`.
- RadioGroup: manual arrow-key nav replaced with `createRovingTabindex()`.
- Slider: manual pointer handlers replaced with `createDrag()` from `_behaviors.js`.
- DatePicker/DateRangePicker: calendar rendering deduplicated via `renderCalendar()`.
- TimePicker/TimeRangePicker: column rendering deduplicated via `renderTimeColumns()`.
- ContextMenu: item rendering deduplicated via `renderMenuItems()`.
- All overlay components now wire `onDestroy()` for cleanup.
- Segmented now wires `onDestroy()` for roving tabindex cleanup.
- Net: ~555 fewer LOC across 23 components.

## v0.4.1 — Full Design Token Sweep (2026-03-12)

### Added
- **Field tokens** (15 tokens): `--d-field-bg`, `--d-field-border`, `--d-field-border-focus`, `--d-field-border-error`, `--d-field-ring`, `--d-field-radius`, `--d-field-placeholder`, and 8 more state variants
- **Interactive state tokens** (9 tokens): `--d-item-hover-bg`, `--d-selected-bg/fg/border`, `--d-disabled-opacity`, `--d-disabled-opacity-soft`, `--d-icon-muted`, `--d-icon-subtle`
- **Overlay tokens**: `--d-overlay-light`, `--d-overlay-heavy` — three intensity levels
- **Table tokens**: `--d-table-stripe-bg`, `--d-table-header-bg`, `--d-table-hover-bg`, `--d-table-selected-bg`
- **Semantic motion tokens**: `--d-motion-enter`, `--d-motion-exit`, `--d-motion-state`
- **Layout tokens**: `--d-prose-width`, `--d-sidebar-width`, `--d-drawer-width`, `--d-sheet-max-h`, `--d-content-width-*`
- **Typography semantic roles**: `--d-text-helper`, `--d-text-error`, `--d-ls-tight`, `--d-ls-wide`
- **Chart UI tokens**: `--d-chart-tooltip-shadow`, `--d-chart-axis-opacity`, `--d-chart-grid-opacity`, `--d-chart-legend-gap`
- **Glass blur tokens**: `--d-glass-blur-sm`, `--d-glass-blur`, `--d-glass-blur-lg`
- **Scrollbar tokens**: `--d-scrollbar-w`, `--d-scrollbar-track`, `--d-scrollbar-thumb`, `--d-scrollbar-thumb-hover`
- **Skeleton tokens**: `--d-skeleton-bg`, `--d-skeleton-shine`
- **Focus ring inset**: `--d-focus-ring-offset-inset` — replaces inline `calc()` in every `outline-offset`
- `.d-field` base CSS class with hover, focus, error, success, disabled, readonly states
- `.d-field-outlined`, `.d-field-filled`, `.d-field-ghost` variant modifiers
- New atoms: `_field`, `_fieldFilled`, `_fieldGhost`, `_hoverBg`, `_activeBg`, `_selectedBg`, `_selectedFg`, `_proseWidth`, `_disabled`
- Per-style field token overrides for all 5 styles
- 28 new tests for token existence + cross-style verification (367 total)

### Changed
- ~44 hardcoded `opacity` values in `_base.js` replaced with semantic tokens (`--d-disabled-opacity`, `--d-icon-muted`, etc.)
- ~13 hardcoded `background:var(--d-surface-1)` on hover rules replaced with `var(--d-item-hover-bg)`
- ~11 `outline-offset:calc(...)` replaced with `var(--d-focus-ring-offset-inset)`
- Selected row/range backgrounds now use `var(--d-selected-bg)` instead of `var(--d-primary-subtle)`
- Default scrollbar CSS now uses tokens (overridable per style)
- Token count: ~280 → ~340 CSS custom properties
- Contrast validation: added field-placeholder and selected-fg pairs

### Documentation
- `reference/tokens.md`: 11 new sections (field, interactive state, overlay, table, scrollbar, skeleton, layout, chart UI, glass blur, semantic motion)
- `reference/atoms.md`: 4 new sections (field, interactive state, semantic opacity, layout atoms)
- `src/registry/css.json`: 7 new token family entries
- `CLAUDE.md`: new FIELD checklist item, 2 new anti-patterns, code standard #13

## v0.4.0 — Enterprise Upgrade

### Breaking Changes

- **Blocks removed.** `src/blocks/` (21 files) deleted. Use patterns (`registry/patterns/`) instead.
- **Kits removed.** `src/kit/` (16 files) deleted. Use patterns and archetypes instead.
- **Terminology renames.** "Anatomy" → "Structure", "Organs" → "Tannins".
- **Legacy color atoms removed.** `_fg0`–`_fg9`, `_bg0`–`_bg9`, `_bc0`–`_bc9`, `legacyColorMap()`, `--c0`–`--c9` variables all removed.

### Added

- **Core:** ErrorBoundary, Portal, Suspense, Transition, forwardRef; `mount()` returns unmount function
- **State:** createContext/provide/inject, createSelector, createDeferred, createHistory, useLocalStorage
- **Router:** Nested routes, route guards (beforeEach/afterEach), lazy loading, query params, active links, scroll restoration, named routes, URL validation
- **Form system:** `decantr/form` module — createForm, validators, fieldArray, useFormField
- **DataTable:** Sort, paginate, select, pin, resize, virtual scroll, edit, expand, filter, export
- **New components:** DateRangePicker, TimeRangePicker, RangeSlider, TreeSelect, AvatarGroup, NavigationMenu, Splitter, BackTop, VisuallyHidden
- **New style:** Command Center (`command-center`) — HUD/radar visual language with recipe system
- **Accessibility:** WCAG AA contrast validation in derive(), RTL logical property atoms
- **Security:** Router URL validation (rejects javascript:, data:, absolute URLs), `sanitize()` utility
- **Build tooling:** Tree shaking, code splitting, source maps, incremental builds, CSS purging, Brotli reporting, bundle analyzer
- **TypeScript declarations:** `tools/dts-gen.js` generates `.d.ts` for all 15 modules
- **Registry:** 49 patterns, 7 archetypes, recipe system, architect domain files
- **Workbench:** Complete rewrite as "Decantation Explorer" — 7-layer navigation, token inspector, global search
- **Decantation Process:** Full POUR→SETTLE→CLARIFY→DECANT→SERVE→AGE methodology with essence files
- **Reference docs:** 14 deep-dive reference documents for all subsystems

### Fixed

- Component lifecycle cleanup: Modal, Select, Dropdown, Combobox, ContextMenu, Tooltip, Slider, Image, DataTable now properly clean up via `onDestroy`
- CSS runtime performance: `inject()`/`injectResponsive()` buffer rules and flush via microtask
