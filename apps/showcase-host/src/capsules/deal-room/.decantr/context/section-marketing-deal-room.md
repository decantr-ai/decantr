# Section: marketing-deal-room

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-deal-room
**Description:** Public marketing landing page for deal-room software positioning trust, security, and workflow velocity. Primary acquisition surface for enterprise sales.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** marketing-hero, feature-grid
**CSS classes:** `.bespoke-card`, `.bespoke-seal`, `.bespoke-stamp`, `.mono-data`
**Density:** comfortable
**Voice:** Formal and authoritative.

## Shell Implementation (top-nav-footer)

### body

- **flex:** 1
- **note:** Full-width sections stack vertically. Each section uses d-section with --d-section-py. Body has NO padding — sections own their spacing. Natural document scroll.
- **padding:** none

### root

- **atoms:** _flex _col _minh[100vh]
- **display:** flex
- **direction:** column
- **min_height:** 100vh

### footer

- **note:** Multi-column footer with link groups and legal.
- **border:** top
- **padding:** 2rem 1.5rem
- **position_within:** bottom (mt-auto for short pages)

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **z_index:** 10
- **background:** var(--d-bg)
- **left_content:** Brand/logo
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** CTA button + mobile hamburger. Hamburger ONLY below md breakpoint.
- **center_content:** Nav links — flex with gap 1.5rem. Hidden below md, visible above.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (top-nav-footer)

- **Cta Sections:** CTA sections at the bottom of marketing pages should stand out visually — subtle background gradient or glass effect, not just a plain card.
- **Section Labels:** Section overline labels (CAPABILITIES, HOW IT WORKS) should be uppercase, small, accent-colored, center-aligned, with letter-spacing: 0.1em. Use d-label class with text-align: center.
- **Section Spacing:** Marketing sections use spacious density. Each d-section uses full --d-section-py padding.

## Spacing Guide

| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Content gap | `--d-content-gap` | `1rem` | Gap between sibling elements |
| Section padding | `--d-section-py` | `5rem` | Vertical padding on d-section |
| Surface padding | `--d-surface-p` | `1.25rem` | Inner padding for d-surface |
| Interactive V | `--d-interactive-py` | `0.5rem` | Vertical padding on buttons |
| Interactive H | `--d-interactive-px` | `1rem` | Horizontal padding on buttons |
| Control | `--d-control-py` | `0.5rem` | Vertical padding on inputs |
| Data row | `--d-data-py` | `0.625rem` | Vertical padding on table rows |

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Key palette tokens:**

| Token | Value | Role |
|-------|-------|------|
| `--d-text` | `#F1E9D2` | Body text, headings, primary content |
| `--d-accent` | `#D4AF37` |  |
| `--d-border` | `#2D3B52` | Dividers, card borders, separators |
| `--d-primary` | `#D4AF37` | Brand color, key interactive, selected states |
| `--d-surface` | `#1A2332` | Cards, panels, containers |
| `--d-secondary` | `#1E293B` | Secondary brand color, supporting elements |
| `--d-bg` | `#0F172A` | Page canvas / base layer |
| `--d-text-muted` | `#94A3B8` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#E8C252` |  |
| `--d-primary-hover` | `#B8941F` | Hover state for primary elements |
| `--d-surface-raised` | `#22304A` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#334155` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.bespoke-card` | Gold-bordered cards with deep navy background and generous interior padding for premium content presentation. |
| `.bespoke-seal` | Wax-seal style circular badge with gold border and embossed emblem. Formal authority indicator. |
| `.bespoke-stamp` | Approval stamp overlay with rotated serif text in gold. Executive sign-off aesthetic. |
| `.bespoke-ledger` | Formal table styling with hairline dividers, tabular-nums, and right-aligned figures. |
| `.bespoke-divider` | Thin gold hairline separator (1px #D4AF37 at 40% opacity) for elegant section breaks. |
| `.bespoke-leather` | Subtle leather texture overlay using fine noise pattern. Adds tactile richness to surfaces. |
| `.bespoke-monogram` | Large serif monogram displays using Playfair or Cormorant. Single-letter or initial typography. |
| `.bespoke-serif-display` | Large serif titles in Playfair Display with refined letter-spacing. Authoritative headlines. |

**Compositions:** **dealroom:** Deal room dashboard with portfolio metrics, transaction ledger, and executive summaries.
**marketing:** Advisory firm marketing page with quiet luxury aesthetic and monogram branding.
**portfolio:** Portfolio summary with gold-accented cards and ledger-style financial tables.
**prospectus:** Investment prospectus presentation with serif headlines and formal document layout.
**Spatial hints:** Density bias: -1. Section padding: 96px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface bespoke-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing

---

## Visual Direction

**Personality:** Secure private equity deal room with authoritative quiet-luxury aesthetics. Deep navy surfaces bordered with gold hairlines. Serif display typography on titles, monospace on financial figures. Document viewer has diagonal watermarks showing viewer name and timestamp. Stage gates track deal progression with approval checkpoints. Q&A threads attach to specific document paragraphs. Investors see only what they're cleared for. Lucide icons. Refined.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

## Pattern Reference

### marketing-hero



**Components:** Button, Icon, Image

**Layout slots:**

### feature-grid



**Components:** Card, Icon, Text

**Layout slots:**
- `grid`: Grid of feature cards (icon + title + description)
- `feature-card`: Individual feature with icon, heading, and description text

---

## Pages

### home (/)

Layout: marketing-hero → feature-grid → customer-quotes → request-demo
