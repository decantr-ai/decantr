# Compound Spacing, Offsets & Density

## Compound Spacing Contract

All compound components (Card, Modal, AlertDialog, Drawer, Sheet) follow a unified spacing contract via `--d-compound-pad` and `--d-compound-gap`. This ensures consistent header/body/footer spacing across all overlay and container components.

| Section | Padding Rule |
|---------|-------------|
| **Header** | `var(--d-compound-pad) var(--d-compound-pad) 0` |
| **Body** | `var(--d-compound-gap) var(--d-compound-pad)` |
| **Body:last-child** | adds `padding-bottom: var(--d-compound-pad)` |
| **Footer** | `var(--d-compound-gap) var(--d-compound-pad) var(--d-compound-pad)` |

New compound components MUST follow this contract. Never hardcode padding in header/body/footer — use the compound tokens.

## Popup Offset Hierarchy

All floating elements use offset tokens for trigger->panel distance. The hierarchy reflects visual weight:

`--d-offset-dropdown` (2px) < `--d-offset-menu` (4px) < `--d-offset-tooltip` (6px) < `--d-offset-popover` (8px)

New floating components MUST use the appropriate offset token, never hardcoded pixel values.

## Density Classes

`.d-compact`, `.d-comfortable`, `.d-spacious` — cascade to children, override `--d-density-pad-x`, `--d-density-pad-y`, `--d-density-gap`, `--d-density-min-h`, `--d-density-text`, `--d-compound-pad`, `--d-compound-gap`

| Density | `--d-compound-pad` | `--d-compound-gap` | Controls | Interiors |
|---------|--------------------|--------------------|----------|-----------|
| compact | `var(--d-sp-3)` | `var(--d-sp-2)` | Tighter | Tighter |
| comfortable | `var(--d-sp-5)` | `var(--d-sp-3)` | Default | Default |
| spacious | `var(--d-sp-8)` | `var(--d-sp-4)` | Wider | Wider |

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
