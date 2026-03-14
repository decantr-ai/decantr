# Design Token Reference

Components use a two-layer CSS system: base CSS (`_base.js`) for structure, style CSS (`styles/*.js` + `derive.js`) for visual identity. Component CSS is organized as a keyed object (`componentCSSMap` in `src/css/components.js`) with 78 sections, enabling build-time pruning of unused component styles. The backward-compatible `componentCSS` export (joined string) is maintained for runtime use. All spacing and typography references design tokens via `var()` with fallbacks.

## Typography Tokens

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
| `--d-ls-caps` | `0.05em` | Uppercase label contexts (group labels, table headers, codeblock lang) |

## Spacing Tokens

> For strategic guidance on when to use these tokens, see `reference/spatial-guidelines.md` §1 The Spacing Scale and §3 Gestalt Proximity Rules.

| Token | Default | Common Usage |
|-------|---------|-------------|
| `--d-sp-0-5` | `0.125rem` | Segmented padding/gap |
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
| `--d-compound-gap` | `var(--d-sp-3)` | Gap between header/body/footer in compound components |
| `--d-compound-pad` | `var(--d-pad)` | Inline + block-end padding in compound components |
| `--d-offset-dropdown` | `2px` | Trigger->panel offset for form dropdowns (select, combobox, etc.) |
| `--d-offset-menu` | `4px` | Trigger->panel offset for dropdown/context menus |
| `--d-offset-tooltip` | `6px` | Trigger->panel offset for tooltips |
| `--d-offset-popover` | `8px` | Trigger->panel offset for popovers/hovercards |

## Field Sizing Tokens

> For tier selection logic and touch target rules, see `reference/spatial-guidelines.md` §7 Component Sizing.

Height-first, 4-tier sizing system for form components. `md` = density comfortable (zero regression).

| Tier | Height | Padding-Y | Padding-X | Font Size | Gap |
|------|--------|-----------|-----------|-----------|-----|
| **xs** | `--d-field-h-xs` (1.5rem/24px) | `--d-field-py-xs` (sp-1) | `--d-field-px-xs` (sp-2) | `--d-field-text-xs` (text-xs) | `--d-field-gap-xs` (sp-1) |
| **sm** | `--d-field-h-sm` (1.75rem/28px) | `--d-field-py-sm` (sp-1) | `--d-field-px-sm` (sp-2-5) | `--d-field-text-sm` (text-sm) | `--d-field-gap-sm` (sp-1-5) |
| **md** | `--d-field-h-md` (2.25rem/36px) | `--d-field-py-md` (sp-2) | `--d-field-px-md` (sp-4) | `--d-field-text-md` (text-base) | `--d-field-gap-md` (sp-2) |
| **lg** | `--d-field-h-lg` (2.75rem/44px) | `--d-field-py-lg` (sp-2-5) | `--d-field-px-lg` (sp-6) | `--d-field-text-lg` (text-md) | `--d-field-gap-lg` (sp-2-5) |

**Density ↔ tier mapping:** compact → sm tokens, comfortable → md tokens, spacious → lg tokens.

**Switch dimension tokens per tier:**

| Tier | Width | Height | Thumb |
|------|-------|--------|-------|
| xs | `--d-switch-w-xs` (1.5rem) | `--d-switch-h-xs` (0.875rem) | `--d-switch-thumb-xs` (0.625rem) |
| sm | `--d-switch-w-sm` (1.75rem) | `--d-switch-h-sm` (1rem) | `--d-switch-thumb-sm` (0.75rem) |
| md | `--d-switch-w` (2.5rem) | `--d-switch-h` (1.375rem) | `--d-switch-thumb` (1rem) |
| lg | `--d-switch-w-lg` (3.25rem) | `--d-switch-h-lg` (1.75rem) | `--d-switch-thumb-lg` (1.25rem) |

**Checkbox/Radio dimension tokens:**

| Tier | Size |
|------|------|
| xs | `--d-checkbox-size-xs` (0.875rem/14px) |
| sm | `--d-checkbox-size-sm` (1rem/16px) |
| md | `--d-checkbox-size` (1.125rem/18px) |
| lg | `--d-checkbox-size-lg` (1.375rem/22px) |

**OTP slot tokens:**

| Tier | Width | Height | Font |
|------|-------|--------|------|
| sm | `--d-otp-w-sm` (2rem) | `--d-otp-h-sm` (2.25rem) | `--d-otp-text-sm` (text-base) |
| md | `--d-otp-w` (2.5rem) | `--d-otp-h` (2.75rem) | `--d-otp-text` (text-lg) |
| lg | `--d-otp-w-lg` (3rem) | `--d-otp-h-lg` (3.25rem) | `--d-otp-text-lg` (text-xl) |

**Style-specific token overrides (retro):**

| Token | clean (default) | retro |
|-------|----------------|-------|
| `--d-fw-heading` | 700 | 800 |
| `--d-fw-title` | 600 | 800 |
| `--d-fw-medium` | 500 | 700 |
| `--d-ls-heading` | -0.025em | 0.05em |

## Component Anatomy Tokens

Fixed dimensions for component internals. These centralize magic numbers and allow density/style overrides.

| Token | Default | Component |
|-------|---------|-----------|
| `--d-avatar-size-sm` | 24px | Avatar small |
| `--d-avatar-size` | 36px | Avatar default |
| `--d-avatar-size-lg` | 48px | Avatar large |
| `--d-avatar-size-xl` | 64px | Avatar extra-large |
| `--d-spinner-size-xs` | 12px | Spinner extra-small |
| `--d-spinner-size-sm` | 16px | Spinner small |
| `--d-spinner-size-lg` | 28px | Spinner large |
| `--d-spinner-size-xl` | 36px | Spinner extra-large |
| `--d-progress-h` | 8px | Progress bar default height |
| `--d-progress-h-sm` | 4px | Progress bar small |
| `--d-progress-h-md` | 16px | Progress bar medium |
| `--d-progress-h-lg` | 24px | Progress bar large |
| `--d-slider-thumb` | 18px | Slider thumb diameter |
| `--d-slider-track-h` | 6px | Slider/RangeSlider track height |
| `--d-badge-dot` | 8px | Badge dot diameter |
| `--d-carousel-dot` | 8px | Carousel indicator dot diameter |
| `--d-float-btn-size` | 48px | Float button diameter |
| `--d-backtop-size` | 40px | Back-to-top button diameter |
| `--d-step-icon-size` | 2rem | Step/stepper icon diameter |
| `--d-colorpicker-swatch` | 24px | Color swatch preview |
| `--d-colorpicker-thumb` | 14px | Picker cursor thumb |
| `--d-colorpicker-preset` | 20px | Preset color swatch |
| `--d-colorpicker-sat-h` | 150px | Saturation panel height |
| `--d-colorpicker-bar-h` | 12px | Hue/alpha bar height |
| `--d-timeline-dot` | 10px | Timeline dot diameter |
| `--d-timeline-dot-lg` | 24px | Timeline large dot |
| `--d-timeline-sm-dot` | 8px | Timeline small-size dot |
| `--d-timeline-sm-dot-lg` | 20px | Timeline small-size large dot |
| `--d-timeline-lg-dot` | 32px | Timeline large-size dot |
| `--d-timeline-lg-dot-lg` | 40px | Timeline large-size large dot |
| `--d-timeline-line-w` | 2px | Timeline connector line width |
| `--d-rangeslider-thumb` | 16px | Range slider thumb diameter |
| `--d-slide-distance` | 8px | Slide-in/out animation distance |

## Semantic Color Tokens

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
| `--d-surface-{0-3}` | 4 | Surface backgrounds (canvas -> overlay) |
| `--d-surface-{0-3}-fg` | 4 | Surface foregrounds |
| `--d-surface-{0-3}-border` | 4 | Surface borders |
| `--d-surface-{1-3}-filter` | 3 | Backdrop-filter for glass styles |
| `--d-elevation-{0-3}` | 4 | Box-shadow by level |

## Z-Index Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `--d-z-dropdown` | 1000 | Select, combobox, datepicker, cascader, dropdown, menu |
| `--d-z-sticky` | 1100 | Affix, float button |
| `--d-z-modal` | 1200 | Modal, drawer, image overlay, tour |
| `--d-z-popover` | 1300 | Popover, popconfirm, context menu, hovercard |
| `--d-z-toast` | 1400 | Toast, notification, message containers |
| `--d-z-tooltip` | 1500 | Tooltip |

## Interaction Tokens

`--d-hover-translate`, `--d-hover-shadow`, `--d-hover-brightness`, `--d-active-scale`, `--d-active-translate`, `--d-active-shadow`, `--d-focus-ring-width`, `--d-focus-ring-color`, `--d-focus-ring-offset`, `--d-focus-ring-style`, `--d-selection-bg`, `--d-selection-fg`

## Motion Tokens

`--d-duration-instant`, `--d-duration-fast`, `--d-duration-normal`, `--d-duration-slow`, `--d-duration-spin`, `--d-easing-standard`, `--d-easing-decelerate`, `--d-easing-accelerate`, `--d-easing-bounce`

| Token | instant | snappy | smooth | bouncy |
|-------|---------|--------|--------|--------|
| `--d-duration-spin` | 200ms | 500ms | 850ms | 1000ms |

Spinner variants use `calc(var(--d-duration-spin) * N)` for staggered timings (dots ×1.6, bars ×1.4, pulse/orbit ×1.8).

## Gradient Tokens

`--d-gradient-brand`, `--d-gradient-brand-alt`, `--d-gradient-brand-full`, `--d-gradient-surface`, `--d-gradient-overlay`, `--d-gradient-subtle`, `--d-gradient-text`, `--d-gradient-text-alt`, `--d-gradient-angle`, `--d-gradient-intensity`

## Chart Tokens

| Token Pattern | Count | Description |
|---|---|---|
| `--d-chart-{0-7}` | 8 | Base chart palette (resolved hex for SVG/canvas compat) |
| `--d-chart-{0-7}-ext-1` | 8 | Extended: lightness-shifted variation |
| `--d-chart-{0-7}-ext-2` | 8 | Extended: hue-rotated +30 variation |
| `--d-chart-{0-7}-ext-3` | 8 | Extended: hue-rotated -30 + lightness variation |
| `--d-chart-tooltip-bg` | 1 | Chart tooltip background (= surface-2) |
| `--d-chart-grid` | 1 | Grid lines (mode-aware alpha) |
| `--d-chart-axis` | 1 | Axis lines (mode-aware alpha) |
| `--d-chart-crosshair` | 1 | Crosshair indicator (mode-aware alpha) |
| `--d-chart-selection` | 1 | Selection highlight (primary @ 15% alpha) |

When colorblind mode is active (`setColorblindMode()`), `--d-chart-{0-7}` are replaced with Wong/Okabe-Ito adapted palettes. Extended tokens are re-derived from the CVD-safe base.

All color derivation uses **OKLCH** (perceptually uniform color space). See `reference/color-guidelines.md` §13 and `reference/style-system.md`.

## Radius Token Hierarchy

Components use semantic radius tokens that resolve differently per personality preset:

| Token | sharp | rounded | pill | Semantic Role |
|-------|-------|---------|------|---------------|
| `--d-radius-sm` | 2px | 4px | 9999px | Checkboxes, inline code |
| `--d-radius` | 0 | 8px | 9999px | Inline controls: buttons, inputs, chips, tags, select triggers |
| `--d-radius-panel` | 0 | 8px | 16px | Containers/panels: dropdowns, tooltips, alerts, textarea, menus, popovers |
| `--d-radius-inner` | 0 | 6px | 14px | Nested interactive cells: datepicker days, toggle/segmented items, close buttons |
| `--d-radius-lg` | 0 | 12px | 24px | Large surfaces: cards, modals, tables |
| `--d-radius-full` | 9999px | 9999px | 9999px | Circles, always-pill elements |

**Assignment rules:**
- Single-line inline controls (buttons, inputs, chips, tags, select triggers) -> `--d-radius`
- Floating panels, overlays, feedback containers, tall form fields -> `--d-radius-panel`
- Interactive elements nested inside panels/groups (calendar cells, menu links, toggle items) -> `--d-radius-inner`
- Large container surfaces (cards, modals, dialogs, tables) -> `--d-radius-lg`

**Concentric radius rule:** `--d-radius-inner` MUST equal `--d-radius-panel` minus the container's padding so that nested rounded rectangles follow concentric curves. For pill: `16px - 2px (--d-sp-0-5) = 14px`. Mismatched inner/outer radii create a visually jarring flat-inside-round artifact. When adding a new radius preset, always derive `inner` from `panel - padding`.

New components MUST use the appropriate semantic radius token. Never use `--d-radius` for panels or inner cells.

## Composition Guidelines

- **External layout** — Use atomic CSS (`_gap4`, `_grid _gc3`, `_p6`) for spacing between components
- **Internal spacing** — Components handle their own padding via `--d-pad` token; don't add padding inside Card/Modal wrappers
- **Theme overrides** — Only add padding in theme CSS when it intentionally differs from base (e.g. retro's accordion/tabs)
- **Token-backed atoms** — Use `_textbase`, `_fwheading`, `_lhnormal` etc. in kit/block code for theme-customizable typography (see `reference/atoms.md`)

## Token Compliance

ALL consumer CSS (workbench, docs, generated code) MUST use design tokens. No hardcoded values.

### Quick-Reference Mapping

| Literal Value | Token |
|--------------|-------|
| `0.25rem` / `4px` | `var(--d-sp-1)` |
| `0.375rem` / `6px` | `var(--d-sp-1-5)` |
| `0.5rem` / `8px` | `var(--d-sp-2)` |
| `0.75rem` / `12px` | `var(--d-sp-3)` |
| `1rem` / `16px` | `var(--d-sp-4)` |
| `1.25rem` / `20px` | `var(--d-sp-5)` |
| `1.5rem` / `24px` | `var(--d-sp-6)` |
| `2rem` / `32px` | `var(--d-sp-8)` |
| `2.5rem` / `40px` | `var(--d-sp-10)` |
| `3rem` / `48px` | `var(--d-sp-12)` |
| `4rem` / `64px` | `var(--d-sp-16)` |

### Required Token Categories

| CSS Property | Token Family | Notes |
|-------------|-------------|-------|
| `padding`, `gap`, `margin` | `--d-sp-*` | Never use raw `px`/`rem` |
| `border-radius` | `--d-radius`, `--d-radius-panel`, `--d-radius-inner`, `--d-radius-lg`, `--d-radius-sm` | Use semantic role (see Radius section above) |
| `transition-duration` | `--d-duration-instant`, `--d-duration-fast`, `--d-duration-normal`, `--d-duration-slow` | Never hardcode `150ms`, `200ms` |
| `z-index` | `--d-z-dropdown`, `--d-z-sticky`, `--d-z-modal`, `--d-z-popover`, `--d-z-toast`, `--d-z-tooltip` | Never use raw numbers |
| `font-size` | `--d-text-xs` through `--d-text-4xl` | When a token exists for the size |
| `outline` (focus) | `--d-focus-ring-width`, `--d-focus-ring-style`, `--d-focus-ring-color`, `--d-focus-ring-offset` | All four tokens required |

### Workbench-Specific Layout Tokens

Workbench/tooling code may define named custom properties for layout dimensions that have no framework equivalent:

```css
:root {
  --de-header-h: 52px;
  --de-sidebar-w: 240px;
}
```

These use the `--de-*` prefix (not `--d-*`) and are the ONLY acceptable place for raw dimension values in consumer CSS.

## Field Tokens

Unified visual system for all form field containers. Applied via `.d-field` base class.

| Token | Default | Description |
|-------|---------|-------------|
| `--d-field-bg` | `transparent` | Field background (outlined default) |
| `--d-field-bg-hover` | Surface shift | Background on hover |
| `--d-field-bg-disabled` | alpha(fg, 0.05) | Disabled field background |
| `--d-field-bg-readonly` | alpha(fg, 0.03) | Read-only field background |
| `--d-field-border` | `var(--d-border)` | Default border color |
| `--d-field-border-hover` | `var(--d-border-strong)` | Border on hover |
| `--d-field-border-focus` | `var(--d-primary)` | Border on focus-within |
| `--d-field-border-error` | `var(--d-error)` | Border for error state |
| `--d-field-border-success` | `var(--d-success)` | Border for success state |
| `--d-field-border-disabled` | alpha(border, 0.5) | Disabled border |
| `--d-field-border-width` | `var(--d-border-width)` | Field border width |
| `--d-field-ring` | Focus shadow | Focus ring (box-shadow) |
| `--d-field-ring-error` | Error focus shadow | Error focus ring |
| `--d-field-ring-success` | Success focus shadow | Success focus ring |
| `--d-field-radius` | `var(--d-radius)` | Field border radius |
| `--d-field-placeholder` | `var(--d-muted)` | Placeholder text color |

### Variants

| Class | Effect |
|-------|--------|
| `.d-field-outlined` | Default — transparent bg, visible border |
| `.d-field-filled` | Surface bg, transparent border |
| `.d-field-ghost` | Transparent bg + border, shows border on focus |

### State Matrix

| State | Background | Border | Shadow |
|-------|-----------|--------|--------|
| Default | `--d-field-bg` | `--d-field-border` | none |
| Hover | `--d-field-bg-hover` | `--d-field-border-hover` | none |
| Focus | `--d-field-bg` | `--d-field-border-focus` | `--d-field-ring` |
| Error | `--d-field-bg` | `--d-field-border-error` | none |
| Error+Focus | `--d-field-bg` | `--d-field-border-error` | `--d-field-ring-error` |
| Success | `--d-field-bg` | `--d-field-border-success` | none |
| Disabled | `--d-field-bg-disabled` | `--d-field-border-disabled` | none |
| Readonly | `--d-field-bg-readonly` | `--d-field-border` | none |

## Interactive State Tokens

Semantic tokens for item hover, selection, and disabled states.

| Token | Default | Description |
|-------|---------|-------------|
| `--d-item-hover-bg` | `var(--d-surface-1)` / glass alpha | Hover background for list items, options, rows |
| `--d-item-active-bg` | `var(--d-primary-subtle)` | Active/pressed item background |
| `--d-selected-bg` | `var(--d-primary-subtle)` | Selected item background |
| `--d-selected-fg` | `var(--d-primary)` | Selected item text color |
| `--d-selected-border` | `var(--d-primary-border)` | Selected item border |
| `--d-disabled-opacity` | `0.5` | Primary disabled opacity |
| `--d-disabled-opacity-soft` | `0.35` | Secondary disabled opacity (steppers, pagination) |
| `--d-icon-muted` | `0.55` | Opacity for close buttons, clear icons, prefix/suffix |
| `--d-icon-subtle` | `0.35` | Opacity for very subtle elements (out-of-range dates, hidden sort) |

### Migration Guide

| Old Pattern | New Token |
|-------------|-----------|
| `opacity:0.5` on disabled | `var(--d-disabled-opacity)` |
| `opacity:0.3` on soft disabled | `var(--d-disabled-opacity-soft)` |
| `opacity:0.6` on close/clear icons | `var(--d-icon-muted)` |
| `opacity:0.4` on sort/pagination | `var(--d-disabled-opacity-soft)` |
| `background:var(--d-surface-1)` on hover | `var(--d-item-hover-bg)` |
| `background:var(--d-primary-subtle)` on selected | `var(--d-selected-bg)` |

## Overlay Tokens

Three overlay intensity levels for modal backdrops and scrims.

| Token | Dark | Light | Description |
|-------|------|-------|-------------|
| `--d-overlay` | `rgba(0,0,0,0.7)` | `rgba(0,0,0,0.5)` | Standard overlay (existing) |
| `--d-overlay-light` | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.2)` | Light overlay for non-modal scrims |
| `--d-overlay-heavy` | `rgba(0,0,0,0.85)` | `rgba(0,0,0,0.7)` | Heavy overlay for image lightboxes |

## Table Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--d-table-stripe-bg` | alpha(fg, 0.02-0.03) | Striped row background |
| `--d-table-header-bg` | `var(--d-surface-1)` | Table header background |
| `--d-table-hover-bg` | `var(--d-item-hover-bg)` | Row hover background |
| `--d-table-selected-bg` | `var(--d-selected-bg)` | Selected row background |

## Scrollbar Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--d-scrollbar-w` | `8px` | Scrollbar width/height |
| `--d-scrollbar-track` | `transparent` | Track background |
| `--d-scrollbar-thumb` | `var(--d-border)` | Thumb color |
| `--d-scrollbar-thumb-hover` | `var(--d-border-strong)` | Thumb hover color |

## Skeleton Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--d-skeleton-bg` | `var(--d-muted)` | Skeleton element background |
| `--d-skeleton-shine` | Gradient | Shimmer animation gradient |

## Layout Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--d-prose-width` | `75ch` | Optimal reading line length |
| `--d-content-width-prose` | `75ch` | Content area max-width for prose |
| `--d-content-width-standard` | `960px` | Standard content area max-width |
| `--d-sidebar-width-sm` | `220px` | Small sidebar width |
| `--d-sidebar-width` | `260px` | Default sidebar width |
| `--d-sidebar-width-lg` | `320px` | Large sidebar width |
| `--d-drawer-width` | `360px` | Drawer panel width |
| `--d-drawer-bottom-max-h` | `85vh` | Bottom drawer max-height |

## Chart UI Tokens

Extends the existing chart section with UI tokens.

| Token | Default | Description |
|-------|---------|-------------|
| `--d-chart-tooltip-shadow` | Mode-aware shadow | Tooltip box-shadow |
| `--d-chart-axis-opacity` | `0.3` | Axis line opacity |
| `--d-chart-grid-opacity` | `0.06`/`0.08` | Grid line opacity (light/dark) |
| `--d-chart-legend-gap` | `var(--d-sp-3)` | Gap between legend items |

## Glass Blur Tokens

| Token | Value | Description |
|-------|-------|-------------|
| `--d-glass-blur-sm` | `blur(8px)` | Light glass effect |
| `--d-glass-blur` | `blur(16px)` | Standard glass effect |
| `--d-glass-blur-lg` | `blur(24px)` | Heavy glass effect |

## Semantic Motion Tokens

Semantic shorthand tokens for common transition patterns.

| Token | Value | Description |
|-------|-------|-------------|
| `--d-motion-enter` | `var(--d-duration-normal) var(--d-easing-decelerate)` | Enter/appear transition |
| `--d-motion-exit` | `var(--d-duration-fast) var(--d-easing-accelerate)` | Exit/disappear transition |
| `--d-motion-state` | `var(--d-duration-fast) var(--d-easing-standard)` | State change transition |

---

**See also:** `reference/atoms.md`, `reference/spatial-guidelines.md`, `reference/style-system.md`
