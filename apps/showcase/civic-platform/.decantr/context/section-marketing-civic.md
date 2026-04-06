# Section: marketing-civic

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-civic
**Description:** Public marketing surface for civic engagement platforms with landing and about pages. Positions the platform to municipal buyers and citizen communities.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 2 (home, about)
**Key patterns:** civic-hero, feature-grid, join-cta, about-hero [moderate]
**CSS classes:** `.gov-nav`, `.gov-card`, `.gov-form`
**Density:** comfortable
**Voice:** Clear and inclusive.

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

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing

---

## Visual Direction

**Personality:** Accessible civic engagement platform built for trust and clarity. High-contrast government-standard typography with generous spacing. Budget Sankey flows show taxpayer dollars from source to category to line item. Petition cards display signature progress prominently. Council meeting archives have full video with synchronized transcripts. WCAG AAA compliance throughout. Lucide icons. Accessible.

## Pattern Reference

### civic-hero



**Components:** Button, Icon, Image

**Layout slots:**

### feature-grid



**Components:** Card, Icon, Text

**Layout slots:**
- `grid`: Grid of feature cards (icon + title + description)
- `feature-card`: Individual feature with icon, heading, and description text

### join-cta



**Components:** Button, Text

**Layout slots:**
- `headline`: CTA headline text
- `description`: Supporting description text
- `actions`: CTA button(s)

### about-hero



**Components:** Button, Icon, Image, Text

**Layout slots:**

---

## Pages

### home (/)

Layout: civic-hero → feature-grid → community-quotes → join-cta

### about (/about)

Layout: about-hero
