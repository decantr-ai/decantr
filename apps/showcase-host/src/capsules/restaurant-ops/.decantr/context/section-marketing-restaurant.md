# Section: marketing-restaurant

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-restaurant
**Description:** Public-facing marketing landing page for the restaurant operations platform. Hero, features, testimonials, and conversion CTA.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** landing-hero, platform-features [moderate], signup-cta
**CSS classes:** `.bistro-menu`, `.bistro-tile`, `.bistro-daily`
**Density:** comfortable
**Voice:** Warm and operational.

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
| `--d-text` | `#431407` | Body text, headings, primary content |
| `--d-accent` | `#EA580C` |  |
| `--d-border` | `#FED7AA` | Dividers, card borders, separators |
| `--d-primary` | `#C2410C` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#7C2D12` | Secondary brand color, supporting elements |
| `--d-bg` | `#FFF7ED` | Page canvas / base layer |
| `--d-text-muted` | `#9A3412` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#C2410C` |  |
| `--d-primary-hover` | `#9A3412` | Hover state for primary elements |
| `--d-surface-raised` | `#FFEDD5` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#431407` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.bistro-menu` | Menu-card styling with warm cream background and artisanal dividers. Dish listing aesthetic. |
| `.bistro-tile` | Ceramic tile patterns using terracotta and cream checkered or hexagonal backgrounds. |
| `.bistro-daily` | Daily special callouts with chalkboard ribbon and handwritten accent text. |
| `.bistro-stamp` | Vintage stamp badges in terracotta with distressed border. Specialty item marks. |
| `.bistro-warm-card` | Warm cream cards with soft orange-tinted shadows and rounded corners. |
| `.bistro-chalkboard` | Chalkboard-style headers with dark slate background and chalk-white handwritten titles. |
| `.bistro-handwritten` | Handwritten accent text using Caveat or Kalam font for warmth and personality. |

**Compositions:** **pos:** Point-of-sale interface with warm cards, order tracking, and table management.
**marketing:** Restaurant marketing page with inviting hero, daily specials, and handwritten charm.
**menu-display:** Restaurant menu with chalkboard section headers and handwritten accents.
**reservations:** Reservation booking interface with warm card aesthetic and friendly accents.
**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: warm.


Usage: `className={css('_flex _col _gap4') + ' d-surface bistro-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing

---

## Visual Direction

**Personality:** Warm restaurant operations hub with terracotta accents and handwritten chalkboard headers. Floor map shows live table status as colored shapes with party sizes. Kitchen display system rail shows order tickets flowing through stations with prep timers. Menu engineering grid highlights profitability per dish. Inventory depletion bars warn on low stock. Tip pool calculators split fairly. Think Toast meets Resy. Lucide icons. Hospitable.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### landing-hero



**Components:** Button, Icon, Image

**Layout slots:**

### platform-features



**Components:** Card, Icon, Text, Input, Textarea, Button, Label

**Layout slots:**
- `grid`: Grid of feature cards (icon + title + description)
- `feature-card`: Individual feature with icon, heading, and description text
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

### signup-cta



**Components:** Button, Text

**Layout slots:**
- `headline`: CTA headline text
- `description`: Supporting description text
- `actions`: CTA button(s)

---

## Pages

### home (/)

Layout: landing-hero → platform-features → social-proof → signup-cta
