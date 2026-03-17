# Compound Spacing, Offsets & Density

> **Strategic guide**: For the full spatial design language — proximity tiers, density zones, responsive behavior, visual weight, and decision tables — see `reference/spatial-guidelines.md`. This document covers the implementation contracts for compound components.

## Compound Spacing Contract

All compound components (Card, Modal, AlertDialog, Drawer) follow a unified spacing contract via `--d-compound-pad` and `--d-compound-gap`. This ensures consistent header/body/footer spacing across all overlay and container components.

| Section | Padding Rule |
|---------|-------------|
| **Header** | `var(--d-compound-pad) var(--d-compound-pad) 0` |
| **Body** | `var(--d-compound-gap) var(--d-compound-pad)` |
| **Body:last-child** | adds `padding-bottom: var(--d-compound-pad)` |
| **Footer** | `var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)` |

**Bordered footer exception:** When a compound footer has a visible `border-top` (e.g. Card), the border provides inter-section separation, so the footer uses `var(--d-compound-pad)` on all sides for vertical centering. The asymmetric `compound-gap` top is only appropriate when the gap alone is the separator (Modal, Drawer).

New compound components MUST follow this contract. Never hardcode padding in header/body/footer — use the compound tokens.

## Popup Offset Hierarchy

> Full elevation hierarchy and offset strategy: `reference/spatial-guidelines.md` §11 Z-Axis Spatial Rules.

All floating elements use offset tokens for trigger->panel distance. The hierarchy reflects visual weight:

`--d-offset-dropdown` (2px) < `--d-offset-menu` (4px) < `--d-offset-tooltip` (6px) < `--d-offset-popover` (8px)

New floating components MUST use the appropriate offset token, never hardcoded pixel values.

## Density Classes

> Full density rules, character mapping, and usage guidance: `reference/spatial-guidelines.md` §16 Density System Integration.

`.d-compact`, `.d-comfortable`, `.d-spacious` — cascade to children, override `--d-density-pad-x`, `--d-density-pad-y`, `--d-density-gap`, `--d-density-min-h`, `--d-density-text`, `--d-compound-pad`, `--d-compound-gap`

| Density | `--d-compound-pad` | `--d-compound-gap` | Controls | Interiors |
|---------|--------------------|--------------------|----------|-----------|
| compact | `var(--d-sp-3)` | `var(--d-sp-2)` | Tighter | Tighter |
| comfortable | `var(--d-sp-5)` | `var(--d-sp-3)` | Default | Default |
| spacious | `var(--d-sp-8)` | `var(--d-sp-4)` | Wider | Wider |

## Field Sizing Contract

> Component sizing tiers, touch targets, and inset patterns: `reference/spatial-guidelines.md` §7 Component Sizing.

All form components support a unified 4-tier sizing system (xs/sm/md/lg). Height is the primary constraint; padding and font-size follow.

**Core components** (Button, Select, Input, Toggle, Combobox) use per-component size classes (`.d-btn-sm`, `.d-select-sm .d-select`, `.d-input-sm`, etc.) that include `min-height` overrides.

**Picker components** (DatePicker, TimePicker, Cascader, TreeSelect, ColorPicker, Mentions, InputNumber, DateRangePicker, TimeRangePicker) use `.d-field-{size}` utility classes that override density tokens locally:

```css
.d-field-xs { --d-density-min-h:var(--d-field-h-xs); --d-density-pad-y:var(--d-field-py-xs); ... }
.d-field-sm { --d-density-min-h:var(--d-field-h-sm); ... }
.d-field-lg { --d-density-min-h:var(--d-field-h-lg); ... }
```

Any child `.d-select`, `.d-input`, etc. inside a `.d-field-sm` wrapper inherits sm sizing via the density cascade — no per-component CSS needed.

**Tier ↔ density mapping:** compact defaults = sm tokens, comfortable defaults = md tokens, spacious defaults = lg tokens. This means setting density to "compact" automatically makes all form elements 28px height.

**Components with own size tokens:** Switch (`--d-switch-w/h/thumb-{tier}`), Checkbox/Radio (`--d-checkbox-size-{tier}`), InputOTP (`--d-otp-w/h/text-{tier}`).

## Prose System

`.d-prose` — auto-applies vertical rhythm to child elements. Use for long-form content (articles, documentation, modal descriptions).

- Base: `font-size:var(--d-text-base); line-height:var(--d-lh-relaxed)`
- Between siblings: `> * + * { margin-top: var(--d-sp-4) }`
- Headings: graduated margin-top (sp-12->sp-10->sp-8->sp-6) + margin-bottom (sp-4->sp-3)
- Lists: left padding, per-item spacing
- Blockquote: left border + padding + italic
- Code/pre: mono font, padding, surface background
- Tables: cell padding, bottom borders

Usage: `div({ class: 'd-prose' }, h1('Title'), p('Body text...'), ul(li('Item')))`

## Spacing Utilities

Child-spacing utilities use the `d-` prefix (not `_` atom prefix) because they require child combinators (`> * + *`) which cannot be expressed in the atom resolver.

| Class | Effect |
|-------|--------|
| `d-spacey-{1-24}` | `> * + * { margin-top: {scale} }` — vertical child spacing |
| `d-spacex-{1-24}` | `> * + * { margin-left: {scale} }` — horizontal child spacing |
| `d-dividey` | `> * + * { border-top: 1px solid var(--d-border) }` |
| `d-dividex` | `> * + * { border-left: 1px solid var(--d-border) }` |
| `d-dividey-strong` | `> * + * { border-top: 1px solid var(--d-border-strong) }` |
| `d-dividex-strong` | `> * + * { border-left: 1px solid var(--d-border-strong) }` |

Scale: 1 (0.25rem) through 24 (6rem). Same spacing scale as `_p`/`_m` atoms.

---

**See also:** `reference/spatial-guidelines.md`, `reference/atoms.md`, `reference/tokens.md`
