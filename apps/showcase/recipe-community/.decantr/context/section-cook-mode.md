# Section: cook-mode

**Role:** auxiliary | **Shell:** minimal-header | **Archetype:** cook-mode
**Description:** Distraction-free step-by-step cooking interface with large text, step navigation, and minimal chrome for hands-free kitchen use.

## Quick Start

**Shell:** Slim header with centered content below. Used for checkout flows, focused task pages. (header: 44px)
**Pages:** 1 (cooking)
**CSS classes:** `.d-mesh`, `.d-glass`, `.aura-orb`
**Density:** comfortable
**Voice:** Warm and encouraging.

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

**Zone:** App (auxiliary) — minimal-header shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

timer, voice-control, wake-lock

---

## Visual Direction

**Personality:** Warm, appetite-driven recipe community with rich food photography as the visual anchor. Earthy tones with pops of warm orange and herb green. Card-based recipe grid where each card is a gorgeous food photo with overlaid title. Recipe detail pages flow: hero image, ingredient list with drag-to-reorder, step-by-step instructions with the stepper pattern. Cook mode is distraction-free with large text and step navigation. Social features include emoji reactions, collections, and creator profiles. Lucide icons. Everything makes you hungry.

## Pages

### cooking (/recipes/:id/cook)

Layout: step-nav → step-carousel
