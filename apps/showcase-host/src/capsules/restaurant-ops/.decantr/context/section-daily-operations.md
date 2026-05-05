# Section: daily-operations

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** daily-operations
**Description:** Daily operations dashboard and reporting for restaurant managers. Covers, sales, labor, and P&L at a glance.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (dashboard, reports)
**CSS classes:** `.bistro-menu`, `.bistro-tile`, `.bistro-daily`
**Density:** comfortable
**Voice:** Warm and operational.

## Shell Implementation (sidebar-main)

### body

- **flex:** 1
- **note:** Sole scroll container. Page content renders directly here. No wrapper div around outlet.
- **atoms:** _flex1 _overflow[auto] _p6
- **padding:** 1.5rem
- **overflow_y:** auto

### root

- **atoms:** _flex _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** row

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **left_content:** Breadcrumb — omit segment when it equals page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Theme toggle (sun/moon icon) + Search/command trigger. Theme toggle toggles light/dark class on html element.

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 2px
  - group_gap: 0.5rem
  - overflow_y: auto
  - item_content: icon (16px) + label text. Collapsed: icon only, text hidden.
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
  - group_header_treatment: d-label
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
  - content: User avatar + settings link
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
- **position:** left
- **direction:** column
- **background:** var(--d-surface)
- **collapsed_width:** 64px
- **collapse_breakpoint:** md

### main_wrapper

- **flex:** 1
- **atoms:** _flex _col _flex1 _overflow[hidden]
- **overflow:** hidden
- **direction:** column

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (sidebar-main)

- **Hotkeys:** Navigation hotkeys defined in the essence are keyboard shortcuts. Implement as useEffect keydown event listeners — do NOT render hotkey text in the sidebar UI.
- **Collapse:** Sidebar collapse toggle should be integrated into the sidebar header area (next to the brand/logo), not floating at the bottom of the sidebar.
- **Breadcrumbs:** For nested routes (e.g., /resource/:id), show a breadcrumb trail above the page heading inside the main content area.
- **Empty States:** When a section has zero data, show a centered empty state: 48px muted icon + descriptive message + optional CTA button.
- **Section Labels:** Dashboard section labels should use the d-label class. Anchor with a left accent border: border-left: 2px solid var(--d-accent); padding-left: 0.5rem.
- **Section Density:** Dashboard sections use compact spacing. Apply data-density='compact' on d-section elements for tighter vertical rhythm than marketing pages.
- **Page Transitions:** Apply the entrance-fade class (if generated) to the main content area for smooth page transitions.

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

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

operations, reports, pnl

---

## Visual Direction

**Personality:** Warm restaurant operations hub with terracotta accents and handwritten chalkboard headers. Floor map shows live table status as colored shapes with party sizes. Kitchen display system rail shows order tickets flowing through stations with prep timers. Menu engineering grid highlights profitability per dish. Inventory depletion bars warn on low stock. Tip pool calculators split fairly. Think Toast meets Resy. Lucide icons. Hospitable.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pages

### dashboard (/ops)

Layout: daily-kpis → daily-charts → ops-activity

### reports (/ops/reports)

Layout: report-charts → report-list
