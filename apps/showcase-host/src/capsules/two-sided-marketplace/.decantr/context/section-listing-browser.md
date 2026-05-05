# Section: listing-browser

**Role:** primary | **Shell:** top-nav-main | **Archetype:** listing-browser
**Description:** Browse and search marketplace listings with grid, map, and detail views. Core discovery interface for two-sided marketplaces.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 3 (browse, listing-detail, search)
**CSS classes:** `.clean-nav`, `.clean-card`, `.clean-input`
**Density:** comfortable
**Voice:** Friendly and trustworthy.

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
| `--d-text` | `#111111` | Body text, headings, primary content |
| `--d-border` | `#E5E5E5` | Dividers, card borders, separators |
| `--d-primary` | `#1366D9` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-bg` | `#FFFFFF` | Page canvas / base layer |
| `--d-text-muted` | `#6B7280` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#0D4EA6` | Hover state for primary elements |
| `--d-surface-raised` | `#F8F8F8` | Elevated containers, modals, popovers |
| `--d-accent` | `#0891b2` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.clean-nav` | Minimal navigation with text links, no backgrounds. |
| `.clean-card` | Bordered card with 1px border, 8px radius, no shadow at rest, subtle shadow on hover transition. |
| `.clean-input` | Standard input with thin border, rounded corners, and blue focus ring using primary color. |
| `.clean-surface` | Pure white (#FFFFFF) or near-black (#111111) depending on mode. |
| `.clean-surface-raised` | Slightly elevated surface for cards (2% darker/lighter). |

**Spatial hints:** Density bias: none. Section padding: 64px. Card wrapping: standard.


Usage: `className={css('_flex _col _gap4') + ' d-surface clean-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — top-nav-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

search, filters, map-view, image-gallery

---

## Visual Direction

**Personality:** Clean, trustworthy marketplace that serves both sides fairly. White/light surfaces with a single accent color for CTAs. Listing cards are image-forward with clean typography. Search and filtering are powerful but never overwhelming. Reviews are prominent — social proof drives conversion. Messaging is simple and contextual. Seller dashboard is data-rich but not intimidating. Comparison tools help buyers decide. Lucide icons. Mobile-first thinking.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pages

### browse (/browse)

Layout: search-filters → listings → map

### listing-detail (/listings/:id)

Layout: header → details → availability

### search (/search)

Layout: search-filters → results
