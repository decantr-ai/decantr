# Section: content-newsletter

**Role:** auxiliary | **Shell:** minimal-header | **Archetype:** content-newsletter
**Description:** Newsletter signup and archive experience. Landing-style subscribe page with hero and contact form, plus a browsable archive of past newsletters.

## Quick Start

**Shell:** Slim header with centered content below. Used for checkout flows, focused task pages. (header: 44px)
**Pages:** 2 (subscribe, archive)
**Key patterns:** subscribe-hero, subscribe-form [moderate], newsletter-archive
**CSS classes:** `.editorial-card`, `.editorial-caption`, `.editorial-divider`
**Density:** comfortable
**Voice:** Clear and editorial.

## Shell Implementation (minimal-header)

### body

- **flex:** 1
- **align:** center
- **atoms:** _flex _col _aic _overflow[auto] _flex1 _py8
- **padding:** 2rem 0
- **direction:** column
- **overflow_y:** auto
- **content_wrapper:**
  - gap: 1.5rem
  - note: Centered column for focused content. Checkout forms, task pages.
  - atoms: _w[720px] _mw[100%] _px4 _flex _col _gap6
  - width: 720px
  - padding: 0 1rem
  - direction: column
  - max_width: 100%

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **note:** Slim header with centered brand. Minimal — no nav links.
- **align:** center
- **border:** bottom
- **height:** 44px
- **sticky:** true
- **content:** Back arrow icon + brand link, centered
- **display:** flex
- **justify:** center
- **padding:** 0.75rem 0
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

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
| `--d-text` | `#1A1A1A` | Body text, headings, primary content |
| `--d-border` | `#E8E4DD` | Dividers, card borders, separators |
| `--d-primary` | `#1A1A1A` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-bg` | `#FEFCF9` | Page canvas / base layer |
| `--d-text-muted` | `#6B665E` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#C41E3A` | Hover state for primary elements |
| `--d-surface-raised` | `#F8F5F0` | Elevated containers, modals, popovers |
| `--d-accent` | `#1a5276` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.editorial-card` | Clean white card with thin hairline border, generous whitespace, and elegant serif typography framing. |
| `.editorial-caption` | Small uppercase tracking-wide text in muted color for image captions and metadata labels. |
| `.editorial-divider` | Thin single-pixel line separator with generous vertical spacing to create breathing room between sections. |
| `.editorial-dropcap` | Oversized initial letter spanning three lines in bold serif weight to open article sections. |
| `.editorial-pullquote` | Large italic serif text with bold left accent border in secondary red, generous vertical margins. |

**Spatial hints:** Density bias: comfortable. Section padding: generous. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface editorial-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — minimal-header shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

subscription, email

---

## Visual Direction

**Personality:** Reading-first content site optimized for long-form consumption. Generous line-height, comfortable measure (65-75 characters), and a clear typographic hierarchy that makes scanning effortless. Article cards feature bold headlines with subtle metadata. The reading view strips away distractions — just text, well-set. Author dashboard is functional and focused. Newsletter archive is clean and browsable. Think Substack meets Medium's typography. Lucide icons. Dark mode available for night reading.

## Pattern Reference

### subscribe-hero



**Components:** Button, Icon, Image

**Layout slots:**

### subscribe-form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### newsletter-archive



**Components:** Icon, Text, Button

**Layout slots:**

---

## Pages

### subscribe (/subscribe)

Layout: subscribe-hero → subscribe-form

### archive (/newsletter)

Layout: newsletter-archive
