# Section: portfolio-showcase

**Role:** primary | **Shell:** full-bleed | **Archetype:** portfolio-showcase
**Description:** Project grid and detail views for portfolio work. Full-bleed layouts with large imagery and generous whitespace to let creative work shine.

## Quick Start

**Shell:** No persistent navigation. Scroll-driven hero-first layout. Used by portfolio landing pages. (header: 52px)
**Pages:** 2 (projects, project-detail)
**Key patterns:** project-hero
**CSS classes:** `.d-mesh`, `.d-glass`, `.aura-orb`
**Density:** comfortable
**Voice:** Confident and personal.

## Shell Implementation (full-bleed)

### body

- **flex:** 1
- **note:** Full-width sections stack vertically. Each section is full viewport height or auto. Sections own their own padding. Natural document scroll, no scroll container.
- **atoms:** _flex _col
- **direction:** column

### root

- **atoms:** _flex _col
- **display:** flex
- **direction:** column

### header

- **top:** 0
- **left:** 0
- **note:** Floating nav overlays hero. No border, transparent background.
- **align:** center
- **atoms:** _fixed _top0 _left0 _wfull _flex _aic _jcsb _px8 _py4 _z[40]
- **width:** 100%
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 2rem
- **z_index:** 40
- **position:** fixed
- **background:** transparent
- **left_content:** Brand/logo link
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Nav links — flex with gap 1.5rem

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

**Zone:** App (primary) — full-bleed shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

gallery, lightbox, lazy-loading

---

## Visual Direction

**Personality:** Bold, expressive portfolio that lets the work shine. Large hero with confident typography and strong CTA. Project showcases use generous whitespace and large imagery. Dark backgrounds make visual work pop. Case studies flow like stories with full-bleed images and concise text blocks. The about page is personal but professional — one strong photo, concise bio, skill badges. Blog posts use comfortable reading typography. Lucide icons. Every pixel showcases craft.

## Pattern Reference

### project-hero



**Components:** Button, Icon, Image

**Layout slots:**

---

## Pages

### projects (/projects)

Layout: project-grid

### project-detail (/projects/:id)

Layout: project-hero → project-header
