# Section: engagement-hub

**Role:** primary | **Shell:** top-nav-main | **Archetype:** engagement-hub
**Description:** Citizen engagement hub with dashboards, petitions, voting, and threaded comments. Primary entry point for civic participation platforms enabling residents to track and influence local decisions.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 3 (home, petitions, petition-detail)
**Key patterns:** petition-hero
**CSS classes:** `.gov-nav`, `.gov-card`, `.gov-form`
**Density:** comfortable
**Voice:** Clear and inclusive.

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
| `--d-text` | `#111827` | Body text, headings, primary content |
| `--d-accent` | `#B91C1C` |  |
| `--d-border` | `#D1D5DB` | Dividers, card borders, separators |
| `--d-primary` | `#1D4ED8` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#4338CA` | Secondary brand color, supporting elements |
| `--d-bg` | `#FFFFFF` | Page canvas / base layer |
| `--d-text-muted` | `#4B5563` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#991B1B` |  |
| `--d-primary-hover` | `#1E40AF` | Hover state for primary elements |
| `--d-surface-raised` | `#F3F4F6` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#3730A3` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.gov-nav` | High-contrast navigation with visible focus indicators. 3px solid outline with offset. |
| `.gov-card` | White card with 1px solid border, no shadow, square corners. Maximum clarity and formality. |
| `.gov-form` | Generous spacing with large input fields. Clear labels above inputs. Required field indicators. |
| `.gov-alert` | Full-width alert bar with high-contrast background. Bold text and clear icon for immediate recognition. |
| `.gov-badge` | Rectangular badge with solid background. High-contrast text. No rounded corners. |
| `.gov-input` | Large input with clear label positioning. Bold focus indicator and generous padding. |
| `.gov-table` | Clear bordered table with large text and strong header contrast. Optimized for data accessibility. |
| `.gov-surface` | Pure white background with clear borders. Maximum contrast and readability. |

**Compositions:** **auth:** Accessible authentication with large inputs, clear instructions, and high-contrast form styling.
**forms:** Government form pages with generous spacing, clear labels, large inputs, and step indicators.
**portal:** Citizen portal with service cards, status tracking, and document management.
**dashboard:** Government service dashboard with clear navigation, large text, and high-contrast data displays.
**marketing:** Government service information page with clear headings, structured content, and accessible navigation.
**Spatial hints:** Density bias: -1. Section padding: 48px. Card wrapping: bordered.


Usage: `className={css('_flex _col _gap4') + ' d-surface government-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — top-nav-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

petitions, voting, comments

---

## Visual Direction

**Personality:** Accessible civic engagement platform built for trust and clarity. High-contrast government-standard typography with generous spacing. Budget Sankey flows show taxpayer dollars from source to category to line item. Petition cards display signature progress prominently. Council meeting archives have full video with synchronized transcripts. WCAG AAA compliance throughout. Lucide icons. Accessible.

## Pattern Reference

### petition-hero



**Components:** Button, Icon, Image

**Layout slots:**

---

## Pages

### home (/engage)

Layout: civic-metrics → civic-activity → active-items

### petitions (/engage/petitions)

Layout: petition-filters → petition-grid

### petition-detail (/engage/petitions/:id)

Layout: petition-hero → petition-votes → petition-comments
