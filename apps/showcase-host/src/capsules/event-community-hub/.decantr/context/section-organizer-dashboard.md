# Section: organizer-dashboard

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** organizer-dashboard
**Description:** Event organizer management hub with event editing, attendee management, revenue analytics, and performance dashboards.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 4 (org-overview, org-event-edit, org-attendees, org-analytics)
**Key patterns:** event-form [moderate]
**CSS classes:** `.dopamine-card`, `.dopamine-glow`, `.dopamine-badge`
**Density:** comfortable
**Voice:** Enthusiastic and inclusive.

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

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

event-management, attendees, analytics, revenue

---

## Visual Direction

**Personality:** High-energy community hub with bold, vibrant visuals. Y2K-inspired maximalism with saturated event imagery. Event cards are punchy — bold titles, gradient accents, clear date badges. Community feed is social and lively with reactions and comments. Ticket selection is fun, not transactional. Live streams feel immersive with floating chat. Organizer dashboard balances energy with clarity. Lucide icons. Every interaction feels like joining a party.

## Pattern Reference

### event-form



**Components:** Input, Textarea, Button, Label

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button

---

## Pages

### org-overview (/organizer)

Layout: metrics → upcoming-events

### org-event-edit (/organizer/events/:id/edit)

Layout: event-form

### org-attendees (/organizer/attendees)

Layout: attendee-table

### org-analytics (/organizer/analytics)

Layout: summary-kpis → charts → earnings
