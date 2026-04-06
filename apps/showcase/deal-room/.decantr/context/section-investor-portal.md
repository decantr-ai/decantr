# Section: investor-portal

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** investor-portal
**Description:** Investor management portal tracking NDA status, access history, and document activity per investor. Centralizes the bidder and limited-partner roster for deal rooms.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (investors, investor-detail)
**CSS classes:** `.bespoke-card`, `.bespoke-seal`, `.bespoke-stamp`, `.mono-data`
**Density:** comfortable
**Voice:** Formal and authoritative.

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
| `--d-text` | `#F1E9D2` | Body text, headings, primary content |
| `--d-accent` | `#D4AF37` |  |
| `--d-border` | `#2D3B52` | Dividers, card borders, separators |
| `--d-primary` | `#D4AF37` | Brand color, key interactive, selected states |
| `--d-surface` | `#1A2332` | Cards, panels, containers |
| `--d-secondary` | `#1E293B` | Secondary brand color, supporting elements |
| `--d-bg` | `#0F172A` | Page canvas / base layer |
| `--d-text-muted` | `#94A3B8` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#E8C252` |  |
| `--d-primary-hover` | `#B8941F` | Hover state for primary elements |
| `--d-surface-raised` | `#22304A` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#334155` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.bespoke-card` | Gold-bordered cards with deep navy background and generous interior padding for premium content presentation. |
| `.bespoke-seal` | Wax-seal style circular badge with gold border and embossed emblem. Formal authority indicator. |
| `.bespoke-stamp` | Approval stamp overlay with rotated serif text in gold. Executive sign-off aesthetic. |
| `.bespoke-ledger` | Formal table styling with hairline dividers, tabular-nums, and right-aligned figures. |
| `.bespoke-divider` | Thin gold hairline separator (1px #D4AF37 at 40% opacity) for elegant section breaks. |
| `.bespoke-leather` | Subtle leather texture overlay using fine noise pattern. Adds tactile richness to surfaces. |
| `.bespoke-monogram` | Large serif monogram displays using Playfair or Cormorant. Single-letter or initial typography. |
| `.bespoke-serif-display` | Large serif titles in Playfair Display with refined letter-spacing. Authoritative headlines. |

**Compositions:** **dealroom:** Deal room dashboard with portfolio metrics, transaction ledger, and executive summaries.
**marketing:** Advisory firm marketing page with quiet luxury aesthetic and monogram branding.
**portfolio:** Portfolio summary with gold-accented cards and ledger-style financial tables.
**prospectus:** Investment prospectus presentation with serif headlines and formal document layout.
**Spatial hints:** Density bias: -1. Section padding: 96px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface bespoke-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

investor-management, nda-tracking

---

## Visual Direction

**Personality:** Secure private equity deal room with authoritative quiet-luxury aesthetics. Deep navy surfaces bordered with gold hairlines. Serif display typography on titles, monospace on financial figures. Document viewer has diagonal watermarks showing viewer name and timestamp. Stage gates track deal progression with approval checkpoints. Q&A threads attach to specific document paragraphs. Investors see only what they're cleared for. Lucide icons. Refined.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

## Pages

### investors (/investors)

Layout: investor-table → investor-row

### investor-detail (/investors/:id)

Layout: investor-header → investor-activity → investor-documents
