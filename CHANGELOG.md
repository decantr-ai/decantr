# Changelog

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
- **State:** createResource, createContext/provide/inject, createSelector, createDeferred, createHistory, useLocalStorage
- **Router:** Nested routes, route guards (beforeEach/afterEach), lazy loading, query params, active links, scroll restoration, named routes, URL validation
- **Form system:** `decantr/form` module — createForm, validators, fieldArray, useFormField
- **DataTable:** Sort, paginate, select, pin, resize, virtual scroll, edit, expand, filter, export
- **New components:** DateRangePicker, TimeRangePicker, RangeSlider, TreeSelect, AvatarGroup, NavigationMenu, Splitter, BackTop, VisuallyHidden
- **New style:** Command Center (`command-center`) — HUD/radar visual language with recipe system
- **Accessibility:** WCAG AA contrast validation in derive(), RTL logical property atoms
- **Security:** Router URL validation (rejects javascript:, data:, absolute URLs), `sanitize()` utility
- **Build tooling:** Tree shaking, code splitting, source maps, incremental builds, CSS purging, Brotli reporting, bundle analyzer
- **TypeScript declarations:** `tools/dts-gen.js` generates `.d.ts` for all 15 modules
- **Registry:** 31 patterns, 5 archetypes, recipe system, architect domain files
- **Workbench:** Complete rewrite as "Decantation Explorer" — 7-layer navigation, token inspector, global search
- **Decantation Process:** Full POUR→SETTLE→CLARIFY→DECANT→SERVE→AGE methodology with essence files
- **Reference docs:** 14 deep-dive reference documents for all subsystems

### Fixed

- Component lifecycle cleanup: Modal, Select, Dropdown, Combobox, ContextMenu, Tooltip, Slider, Image, DataTable now properly clean up via `onDestroy`
- CSS runtime performance: `inject()`/`injectResponsive()` buffer rules and flush via microtask
