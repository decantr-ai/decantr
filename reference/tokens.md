# Design Token Reference

Components use a two-layer CSS system: base CSS (`_base.js`) for structure, style CSS (`styles/*.js` + `derive.js`) for visual identity. All spacing and typography references design tokens via `var()` with fallbacks.

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

## Spacing Tokens

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
| `--d-compound-gap` | `var(--d-sp-3)` | Gap between header/body/footer in compound components |
| `--d-compound-pad` | `var(--d-pad)` | Inline + block-end padding in compound components |
| `--d-offset-dropdown` | `2px` | Trigger->panel offset for form dropdowns (select, combobox, etc.) |
| `--d-offset-menu` | `4px` | Trigger->panel offset for dropdown/context menus |
| `--d-offset-tooltip` | `6px` | Trigger->panel offset for tooltips |
| `--d-offset-popover` | `8px` | Trigger->panel offset for popovers/hovercards |

**Style-specific token overrides (retro):**

| Token | clean (default) | retro |
|-------|----------------|-------|
| `--d-fw-heading` | 700 | 800 |
| `--d-fw-title` | 600 | 800 |
| `--d-fw-medium` | 500 | 700 |
| `--d-ls-heading` | -0.025em | 0.05em |

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
| `--d-z-modal` | 1200 | Modal, drawer, sheet, image overlay, tour |
| `--d-z-popover` | 1300 | Popover, popconfirm, context menu, hovercard |
| `--d-z-toast` | 1400 | Toast, notification, message containers |
| `--d-z-tooltip` | 1500 | Tooltip |

## Interaction Tokens

`--d-hover-translate`, `--d-hover-shadow`, `--d-hover-brightness`, `--d-active-scale`, `--d-active-translate`, `--d-active-shadow`, `--d-focus-ring-width`, `--d-focus-ring-color`, `--d-focus-ring-offset`, `--d-focus-ring-style`, `--d-selection-bg`, `--d-selection-fg`

## Motion Tokens

`--d-duration-instant`, `--d-duration-fast`, `--d-duration-normal`, `--d-duration-slow`, `--d-easing-standard`, `--d-easing-decelerate`, `--d-easing-accelerate`, `--d-easing-bounce`

## Gradient Tokens

`--d-gradient-brand`, `--d-gradient-brand-alt`, `--d-gradient-brand-full`, `--d-gradient-surface`, `--d-gradient-overlay`, `--d-gradient-subtle`, `--d-gradient-text`, `--d-gradient-text-alt`, `--d-gradient-angle`, `--d-gradient-intensity`

## Chart Tokens

`--d-chart-0` through `--d-chart-7` (resolved hex for SVG/canvas compat), `--d-chart-tooltip-bg`

## Radius Token Hierarchy

Components use semantic radius tokens that resolve differently per personality preset:

| Token | sharp | rounded | pill | Semantic Role |
|-------|-------|---------|------|---------------|
| `--d-radius-sm` | 2px | 4px | 9999px | Checkboxes, inline code |
| `--d-radius` | 0 | 8px | 9999px | Inline controls: buttons, inputs, chips, tags, select triggers |
| `--d-radius-panel` | 0 | 8px | 16px | Containers/panels: dropdowns, tooltips, alerts, textarea, menus, popovers |
| `--d-radius-inner` | 0 | 6px | 8px | Nested interactive cells: datepicker days, toggle/segmented items, close buttons |
| `--d-radius-lg` | 0 | 12px | 24px | Large surfaces: cards, modals, tables |
| `--d-radius-full` | 9999px | 9999px | 9999px | Circles, always-pill elements |

**Assignment rules:**
- Single-line inline controls (buttons, inputs, chips, tags, select triggers) -> `--d-radius`
- Floating panels, overlays, feedback containers, tall form fields -> `--d-radius-panel`
- Interactive elements nested inside panels/groups (calendar cells, menu links, toggle items) -> `--d-radius-inner`
- Large container surfaces (cards, modals, dialogs, tables) -> `--d-radius-lg`

New components MUST use the appropriate semantic radius token. Never use `--d-radius` for panels or inner cells.

## Composition Guidelines

- **External layout** — Use atomic CSS (`_gap4`, `_grid _gc3`, `_p6`) for spacing between components
- **Internal spacing** — Components handle their own padding via `--d-pad` token; don't add padding inside Card/Modal wrappers
- **Theme overrides** — Only add padding in theme CSS when it intentionally differs from base (e.g. retro's accordion/tabs)
- **Token-backed atoms** — Use `_textbase`, `_fwheading`, `_lhnormal` etc. in kit/block code for theme-customizable typography (see `reference/atoms.md`)
