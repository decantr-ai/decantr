# Section: community-feed

**Role:** auxiliary | **Shell:** top-nav-main | **Archetype:** community-feed
**Description:** Social community feed with posts, discussions, reactions, comments, and a member directory. Drives engagement and connection in event and community platforms.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 3 (feed, post-detail, members)
**CSS classes:** `.dopamine-card`, `.dopamine-glow`, `.dopamine-badge`
**Density:** comfortable
**Voice:** Enthusiastic and inclusive.

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
| `--d-text` | `#FFF0FA` | Body text, headings, primary content |
| `--d-border` | `#6B2068` | Dividers, card borders, separators |
| `--d-primary` | `#FF40ED` | Brand color, key interactive, selected states |
| `--d-surface` | `#2A0028` | Cards, panels, containers |
| `--d-bg` | `#1A0018` | Page canvas / base layer |
| `--d-text-muted` | `#C890B8` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#FF70F2` | Hover state for primary elements |
| `--d-surface-raised` | `#3A0038` | Elevated containers, modals, popovers |
| `--d-accent` | `#ffea00` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.dopamine-card` | Pill-rounded card with vivid gradient border, raised shadow in magenta-tinted color, and white surface. |
| `.dopamine-glow` | Background glow effect using radial gradient of primary and accent colors at 20% opacity behind elements. |
| `.dopamine-badge` | Neon-bright pill badge with gradient fill from primary to secondary, bold white text overlay. |
| `.dopamine-input` | Rounded input with gradient focus ring cycling primary to accent, generous padding and bouncy scale on focus. |
| `.dopamine-shimmer` | Animated shimmer gradient sweeping left to right across element surface for loading or emphasis. |

**Spatial hints:** Density bias: comfortable. Section padding: generous. Card wrapping: standard.


Usage: `className={css('_flex _col _gap4') + ' d-surface dopamine-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — top-nav-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

feed, discussions, reactions, comments

---

## Visual Direction

**Personality:** High-energy community hub with bold, vibrant visuals. Y2K-inspired maximalism with saturated event imagery. Event cards are punchy — bold titles, gradient accents, clear date badges. Community feed is social and lively with reactions and comments. Ticket selection is fun, not transactional. Live streams feel immersive with floating chat. Organizer dashboard balances energy with clarity. Lucide icons. Every interaction feels like joining a party.

## Pages

### feed (/feed)

Layout: posts → activity → reactions

### post-detail (/feed/:id)

Layout: comments → reactions

### members (/members)

Layout: member-cards
