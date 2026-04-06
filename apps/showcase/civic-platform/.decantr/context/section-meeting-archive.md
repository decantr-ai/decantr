# Section: meeting-archive

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** meeting-archive
**Description:** Public archive of government meetings with searchable records, calendar browsing, and per-meeting timelines of votes and agenda items. Provides citizens long-term access to council and committee proceedings.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (meetings, meeting-detail)
**CSS classes:** `.gov-nav`, `.gov-card`, `.gov-form`
**Density:** comfortable
**Voice:** Clear and inclusive.

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

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

meetings, archives

---

## Visual Direction

**Personality:** Accessible civic engagement platform built for trust and clarity. High-contrast government-standard typography with generous spacing. Budget Sankey flows show taxpayer dollars from source to category to line item. Petition cards display signature progress prominently. Council meeting archives have full video with synchronized transcripts. WCAG AAA compliance throughout. Lucide icons. Accessible.

## Pages

### meetings (/meetings)

Layout: meeting-filters → meeting-calendar → meeting-table

### meeting-detail (/meetings/:id)

Layout: meeting-header → agenda-timeline → meeting-votes
