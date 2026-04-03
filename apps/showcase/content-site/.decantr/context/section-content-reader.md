# Section: content-reader

**Role:** primary | **Shell:** top-nav-main | **Archetype:** content-reader
**Description:** Article reading experience with browsable article listings, full article detail view, and category navigation. Optimized for long-form consumption with generous typography and effortless scanning.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 3 (articles, article-detail, categories)
**CSS classes:** `.editorial-card`, `.editorial-caption`, `.editorial-divider`
**Density:** comfortable
**Voice:** Clear and editorial.

## Shell Implementation (top-nav-main)

### body

- **gap:** 1rem
- **flex:** 1
- **note:** Full-width scrollable content area below the nav bar.
- **atoms:** _flex _col _gap4 _p6 _overflow[auto] _flex1
- **padding:** 1.5rem
- **direction:** column
- **overflow_y:** auto

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **nav_links:** Nav links use text-sm font-medium with no background. Hover: text color transitions to primary. Active: font-semibold or underline-offset-4.
- **background:** var(--d-bg)
- **left_content:** Brand/logo link
- **button_sizing:** Buttons and CTAs in the header must use compact sizing: py-1.5 px-4 text-sm (not the default d-interactive padding). The header is 52px — buttons should be ~32px tall, not 40px+.
- **right_content:** Theme toggle (sun/moon icon, toggles light/dark class on html element) + Search trigger + CTA button or user avatar. Theme toggle uses a simple icon button — no dropdown.
- **center_content:** Nav links — flex with gap 1.5rem

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

**Zone:** App (primary) — top-nav-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

search, reading, rss, bookmarks

---

## Visual Direction

**Personality:** Reading-first content site optimized for long-form consumption. Generous line-height, comfortable measure (65-75 characters), and a clear typographic hierarchy that makes scanning effortless. Article cards feature bold headlines with subtle metadata. The reading view strips away distractions — just text, well-set. Author dashboard is functional and focused. Newsletter archive is clean and browsable. Think Substack meets Medium's typography. Lucide icons. Dark mode available for night reading.

## Pages

### articles (/articles)

Layout: article-search → article-cards

### article-detail (/articles/:id)

Layout: breadcrumbs → article-body

### categories (/categories)

Layout: category-grid
