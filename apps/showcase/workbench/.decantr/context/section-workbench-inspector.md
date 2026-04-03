# Section: workbench-inspector

**Role:** auxiliary | **Shell:** sidebar-aside | **Archetype:** workbench-inspector
**Description:** Property inspector and live preview for the design-system workbench. Editable form sections for component properties with real-time preview in split-pane layout.

## Quick Start

**Shell:** Three-column layout with left navigation and right inspector/detail panel. Used for admin dashboards, email clients, IDE-style apps. (nav: 240px, header: 52px)
**Pages:** 2 (inspector, preview)
**Key patterns:** property-form [moderate]
**CSS classes:** `.d-mesh`, `.d-glass`, `.aura-orb`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and efficient.

## Shell Implementation (sidebar-aside)

### body

- **flex:** 1
- **note:** Main scroll container for primary content.
- **padding:** 1.5rem
- **overflow_y:** auto

### root

- **atoms:** _grid _h[100vh]
- **height:** 100vh
- **display:** grid
- **grid_template:** columns: sidebar 1fr aside; rows: 52px 1fr

### aside

- **note:** Right inspector/detail panel. Toggleable. Shows contextual details, properties, or preview.
- **atoms:** _flex _col _borderL
- **width:** 280px
- **border:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-bg)
- **collapsible:** true

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **left_content:** Breadcrumb / page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Actions / search

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 2px
  - overflow_y: auto
  - item_content: icon + label text
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
- **atoms:** _flex _col _borderR
- **brand:**
  - align: center
  - border: bottom
  - height: 52px
  - content: Logo/brand + collapse toggle
  - display: flex
  - padding: 0 1rem
- **width:** 240px
- **border:** right
- **footer:**
  - border: top
  - content: User avatar + settings
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
- **position:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-surface)
- **collapsed_width:** 64px
- **collapse_breakpoint:** md

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

**Zone:** App (auxiliary) — sidebar-aside shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

live-preview, editing

---

## Visual Direction

**Personality:** Technical design-system workbench for power users. Dense, IDE-like layout with multi-panel navigation. Monospace typography for code and data, system fonts for UI labels. The workspace splits into resizable panes — component tree on the left, live preview center, property inspector right. Catalog is a browsable grid with instant search. Everything responds to keyboard shortcuts. Command palette for quick navigation. Think VS Code crossed with Storybook. Lucide icons. No wasted space.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

## Pattern Reference

### property-form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

---

## Pages

### inspector (/inspector)

Layout: property-form → property-data

### preview (/preview)

Layout: preview-panes
