# Section: recipe-social

**Role:** auxiliary | **Shell:** top-nav-main | **Archetype:** recipe-social
**Description:** Social features for the recipe community: activity feed, emoji reactions, recipe collections, and creator profiles with follow functionality.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 3 (feed, collections, profile)
**CSS classes:** `.d-mesh`, `.d-glass`, `.aura-orb`
**Density:** comfortable
**Voice:** Warm and encouraging.

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
| `--d-cyan` | `#` |  |
| `--d-pink` | `#` |  |
| `--d-indigo` | `#` |  |
| `--d-purple` | `#` |  |
| `--d-violet` | `#` |  |
| `--d-magenta` | `#` |  |
| `--d-accent` | `#EC4899` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.d-mesh` | Radial mesh gradient background with pink, cyan, and purple overlays. Apply to page-level containers. |
| `.d-glass` | Frosted glass panel — backdrop-blur, semi-transparent bg, subtle border highlight. Apply to cards and panels. |
| `.aura-orb` | Floating decorative gradient orb. Position absolutely as background decoration. |
| `.aura-glow` | Soft glow shadow using primary color. Apply to featured cards or active elements. |
| `.aura-ring` | Animated ring highlight on focus/active state. Pill-shaped glow border. |
| `.d-icon-glow` | Glowing icon container with gradient background. |
| `.d-stat-glow` | Text-shadow glow for large numbers and metrics. |
| `.aura-shimmer` | Subtle shimmer animation across surface. Use sparingly for loading or premium feel. |
| `.d-glow-accent` | Box-shadow glow using accent color. For secondary highlights. |
| `.d-glass-strong` | Stronger glass effect with more opacity and thicker blur. For elevated overlays and modals. |
| `.d-glow-primary` | Box-shadow glow using primary color. Apply to stats, featured cards. |
| `.d-gradient-text` | Gradient text using primary brand colors (pink → cyan). Apply to headings and hero text. |
| `.aura-glow-strong` | Intense glow for hero KPIs and primary CTAs. 20px spread. |
| `.d-terminal-chrome` | macOS-style terminal window with traffic light dots and gradient background. |
| `.d-gradient-text-alt` | Alternate gradient text (purple → pink → cyan). For secondary headings and accents. |
| `.d-gradient-hint-accent` | Subtle gradient background toward accent color. |
| `.d-gradient-hint-primary` | Subtle gradient background toward primary color. |

**Compositions:** **kpi:** KPI metric with glass background and gradient value text.
**card:** Card with glass surface and glow on hover.
**form:** Form in a glass card with gradient submit button.
**alert:** Alert with glass background.
**chart:** Chart in glass panel with gradient title.
**modal:** Modal with strong glass backdrop and gradient title.
**panel:** Glass panel with subtle border and backdrop blur.
**table:** DataTable with glass wrapper and subtle border.
**layout:** Full page layout with mesh background, glass sidebar, and content area.
**sidebar:** Glass sidebar with gradient brand and nav items.
**Spatial hints:** Density bias: none. Section padding: default. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface auradecantism-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — top-nav-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

follow, reactions, collections, sharing

---

## Visual Direction

**Personality:** Warm, appetite-driven recipe community with rich food photography as the visual anchor. Earthy tones with pops of warm orange and herb green. Card-based recipe grid where each card is a gorgeous food photo with overlaid title. Recipe detail pages flow: hero image, ingredient list with drag-to-reorder, step-by-step instructions with the stepper pattern. Cook mode is distraction-free with large text and step navigation. Social features include emoji reactions, collections, and creator profiles. Lucide icons. Everything makes you hungry.

## Pages

### feed (/feed)

Layout: feed-grid → social-feed → reactions

### collections (/collections)

Layout: collection-grid

### profile (/profile/:id)

Layout: chef-profile → profile-recipes
