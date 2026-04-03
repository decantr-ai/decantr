# Section: appointment-center

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** appointment-center
**Description:** Appointment management hub with list view, booking flow, and appointment details with telehealth join capability.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (appointments, book, appointment-detail)
**Key patterns:** data-table [moderate], booking-calendar [moderate], detail-header [moderate]
**CSS classes:** `.health-nav`, `.health-card`, `.health-alert`
**Density:** comfortable
**Voice:** Caring, clear, and professional.

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
| `--d-text` | `#0F172A` | Body text, headings, primary content |
| `--d-accent` | `#7C3AED` |  |
| `--d-border` | `#E2E8F0` | Dividers, card borders, separators |
| `--d-primary` | `#0284C7` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#0D9488` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAFAF8` | Page canvas / base layer |
| `--d-text-muted` | `#64748B` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#6D28D9` |  |
| `--d-primary-hover` | `#0369A1` | Hover state for primary elements |
| `--d-surface-raised` | `#F5F7FA` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#0F766E` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.health-nav` | Clean spacious navigation with generous spacing. Clear active states and focus indicators. |
| `.health-card` | White card with subtle shadow and large 12px radius. Clean, spacious padding for medical content readability. |
| `.health-alert` | Left-border severity stripe (4px) with tinted background. Color indicates severity: info, warning, critical. |
| `.health-badge` | Rounded pill badge with tinted semantic background. Always includes text label for accessibility. |
| `.health-input` | Large input with generous 14px padding. Clear focus ring for accessibility. Designed for clinical data entry. |
| `.health-metric` | Large prominent number with color-coded status dot indicator. Used for vitals, lab results, and patient stats. |
| `.health-status` | Color-coded status with always-visible text label. Never relies on color alone per WCAG guidelines. |
| `.health-surface` | Warm white background with minimal 1px border. Creates gentle separation without harsh contrast. |

**Compositions:** **auth:** Centered authentication forms with clean card styling. HIPAA-compliant login with MFA support.
**clinical:** Clinical data entry and review. Dense but readable layouts with large inputs and clear labels.
**dashboard:** Patient dashboard with sidebar navigation. Vitals overview, appointments, medication schedule, and health metrics.
**marketing:** Healthcare marketing pages with trust signals. Professional hero sections and feature grids.
**patient-portal:** Patient-facing portal with top navigation. Simplified interface for appointments, records, and messaging.
**Spatial hints:** Density bias: -1. Section padding: 48px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface healthcare-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

appointments, booking, telehealth

---

## Visual Direction

**Personality:** Calming, trust-building health portal with emphasis on clarity and accessibility. Soft blues and teals on warm white backgrounds. Large, readable typography — nothing small or dense. Vitals use color-coded status indicators always supplemented with text labels. Appointment booking is straightforward. Telehealth rooms are calm and functional. Document vault feels secure. Every interaction prioritizes patient confidence. Lucide icons. WCAG AAA compliance throughout.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### data-table

Sortable, filterable, paginated data table with row selection

**Visual brief:** Full-width data table with a sticky header row. Header cells use uppercase, small, muted text with sort-direction arrows on sortable columns. Data rows have consistent vertical padding (py3) for scan-ability, with subtle zebra-stripe background on hover. Row-selection checkboxes align in the first column. Active selections highlight the row with a faint primary-color tint. A toolbar above the table holds a search input on the left and action buttons (export, delete) on the right. Pagination controls at the bottom show current range, total count, and prev/next buttons with disabled states at boundaries.

**Components:** Table, Checkbox, Button, Input, Badge, icon

**Composition:**
```
Table = Table(d-data) > [TableHeader > HeaderCell(sortable?, sort-indicator?)[] + TableBody > DataRow(d-data-row, hoverable, striped?)[]]
DataRow = Row > [Checkbox?(d-control) + DataCell(d-data-cell)[]]
Toolbar = Row(d-control) > [SearchInput(d-control) + ActionButtons(d-interactive)]
DataTable = Container(d-data, full-width) > [Toolbar + Table + Pagination]
Pagination = Row(d-control) > [PageInfo(text-muted) + PageButtons(d-interactive, variant: ghost)[]]
```

**Layout slots:**
- `toolbar`: Top row with optional search Input and action Buttons
- `pagination`: Footer with page info and prev/next Buttons
- `table-body`: Data rows with optional row selection Checkbox
- `table-header`: Column headers with sort controls
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Row hover highlights with 150ms background-color transition. Sort arrow rotates 180deg on direction change with 200ms ease. Checkbox scales briefly on check (scale 1.1 for 100ms). |
| transitions | Rows entering from filter/search fade in with 200ms opacity transition. Bulk-selected rows highlight with a slide-in left-border accent over 150ms. |

**Responsive:**
- **Mobile (<640px):** Table transforms into a stacked card list. Each row becomes a vertical card with label-value pairs. Toolbar search goes full-width. Pagination simplifies to prev/next only. Horizontal scroll is avoided entirely.
- **Tablet (640-1024px):** Table displays with horizontal scroll if columns exceed viewport. Sticky first column for row identifiers. Toolbar remains single row.
- **Desktop (>1024px):** Full table layout with all columns visible. Sticky header on scroll. Toolbar with search, filters, and bulk action buttons. Full pagination with page numbers.

**Accessibility:**
- Role: `Table uses semantic <table>, <thead>, <tbody>, <th>, <td> elements. Sort buttons are <button> inside <th> with aria-sort attribute.`


### booking-calendar

Availability-aware booking calendar with selectable time slots, optional provider selection, timezone handling, and inline confirmation for scheduling workflows.

**Visual brief:** Calendar interface with a header row containing a DatePicker (left/right arrows flanking the current week or date label, e.g. 'Mar 24 - 30, 2026'), and a small TimezoneSelector dropdown in the top-right corner showing the detected timezone with a globe icon. Below the header, the week-view preset renders a 7-column grid: each column has a day label header (Mon 24, Tue 25, etc.) with today's date highlighted in accent. Within each column, available time slots appear as small outlined rectangular buttons (e.g. '9:00 AM', '9:30 AM', '10:00 AM') stacked vertically. Available slots have an accent-outlined style with hover fill. Unavailable/past slots are grayed out with reduced opacity and no pointer cursor. The currently selected slot has a filled accent background with white text and a subtle checkmark. Days with no availability show a muted 'No availability' label. The day-view preset shows a single vertical list of slot buttons at full width, grouped by morning/afternoon/evening with subtle section dividers. The provider-select preset adds a horizontal scrollable row of provider cards at the top: each card shows a circular avatar (48px), provider name below, and a specialty/role label in muted text. The selected provider card has an accent border ring. Below the provider row, the availability grid (week or day) loads for that provider. When a time slot is selected, a BookingConfirmation card slides up from the bottom (or appears as an adjacent panel on desktop): it shows the selected provider's avatar and name, the date and time in bold, the duration (e.g. '30 min'), the timezone, and a prominent 'Confirm Booking' primary button with a secondary 'Cancel' text button. The confirmation card has a surface background with slight elevation (shadow-md).

**Components:** AvailabilityGrid, TimeSlot, ProviderSelector, BookingConfirmation, DatePicker, TimezoneSelector

**Composition:**
```
BookingCalendar = Container(d-section, flex-col, gap-4) > [ControlsBar(d-control) > [ProviderSelector?(d-control, horizontal-scroll) + DatePicker(d-control) + TimezoneSelector(d-control, dropdown)] + AvailabilityGrid(d-surface, grid: week|day) > TimeSlot(d-interactive, selectable, state: available|unavailable|selected)* + BookingConfirmation?(d-surface, elevation-md, conditional: slot-selected)]
AvailabilityGrid = Grid(d-surface, columns: 7|1) > DayColumn(d-data, sticky-header) > [DayLabel(d-annotation) + TimeSlot(d-interactive)[]]
ProviderSelector = Row(d-control, horizontal-scroll) > ProviderCard(d-interactive, selectable) > [Avatar(d-annotation, circle) + Name(d-data) + Role(d-annotation, muted)]
BookingConfirmation = Card(d-surface, shadow-md) > [ProviderRow > [Avatar + Name] + Divider + DateLabel(d-data, bold) + TimeRange(d-data) + TimezoneLabel(d-annotation) + DurationBadge(d-annotation) + ConfirmButton(d-interactive, variant: primary, full-width) + CancelLink(d-interactive, text)]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| slot-hover | background-color accent/10 + border-color accent 120ms ease-out |
| slot-select | scale(0.97→1) + background-fill 150ms ease-out |
| provider-card-hover | translateY(-2px) + shadow-md 150ms ease-out |
| week-navigate | translateX(±100%)→0 + opacity 0→1 300ms ease-out |
| confirm-success | button-width shrink + checkmark-scale(0→1) 400ms ease-out |
| confirmation-exit | translateY(0)→24px + opacity 1→0 250ms ease-in |
| confirmation-enter | translateY(24px)→0 + opacity 0→1 350ms ease-out |
| skeleton-shimmer | background-position sweep left→right 1.5s ease-in-out infinite during loading |

**Responsive:**
- **Mobile (<640px):** Week-view switches to a horizontal scrollable day strip (shows 3 days visible, swipe for more) with the selected day's slots below as a vertical list. DatePicker becomes a compact single-date selector. Provider cards scroll horizontally. Booking confirmation renders as a bottom sheet that slides up. Time slots are full-width buttons with larger tap targets (min 44px height).
- **Tablet (640-1024px):** Week-view shows all 7 columns at comfortable width. Provider cards remain a horizontal row. Booking confirmation appears as a right-side panel or inline below the grid. Standard touch target sizes.
- **Desktop (>1024px):** Full 7-column week grid with generous slot spacing. Booking confirmation appears as a fixed sidebar panel on the right (30% width) alongside the grid. Provider cards display with additional detail (next available time). Hover states are fully active.

**Accessibility:**
- Role: `application`
- Keyboard: Arrow Left/Right: navigate between days in week-view; Arrow Up/Down: navigate between time slots within a day; Enter/Space: select the focused time slot or confirm booking; Tab: move between controls (date picker, timezone, provider, grid, confirmation); Escape: deselect current slot or dismiss confirmation; P: focus provider selector (when available); T: open timezone selector
- Announcements: Viewing availability for {date_range}; Provider {name} selected, loading availability; Time slot {time} on {date}: {status}; Selected {time} on {date} with {provider}. Confirm or press Escape to cancel; Booking confirmed: {date} at {time} with {provider}; Timezone changed to {timezone}


### detail-header

Page header for detail views with title, metadata, status, and action buttons

**Visual brief:** Page header area with a breadcrumb navigation trail at the top, followed by a title row containing a large heading on the left and action buttons on the right. Below the title, a subtitle or description paragraph in muted text. An optional status badge appears inline next to the title. The profile preset adds an avatar to the left of the title. All elements are separated by consistent vertical spacing with a subtle bottom border below the entire header block.

**Components:** Avatar, Badge, Button, Breadcrumb

**Composition:**
```
TitleRow = Row(space-between) > [Title(heading2) + StatusBadge?(d-annotation) + ActionButtons(d-interactive)]
DetailHeader = Section(d-section, flex-col, gap-4, border-bottom) > [Breadcrumb + TitleRow + Subtitle?(text-muted)]
ActionButtons = Row(gap-2) > Button(variant: ghost)[]
ProfileHeader = Row(d-section, gap-6) > [Avatar(large, 96px) + InfoColumn > [Name(heading2) + Title(text-muted) + Bio + StatsRow + ActionButtons]]
```

**Layout slots:**
- `title`: Page heading with _heading2
- `status`: Badge showing current status (active, draft, archived)
- `actions`: Action buttons group: edit, delete, share with _flex _gap2
- `subtitle`: Description text with _bodysm _fgmuted
- `title-row`: Horizontal row with title on left and action buttons on right: _flex _row _jcsb _aic
- `breadcrumb`: Navigation breadcrumb trail with BreadcrumbItem links
**Responsive:**
- **Mobile (<640px):** Breadcrumb collapses to back arrow with parent name. Action buttons move below the title and stack full-width. Status badge wraps below the title on its own line.
- **Tablet (640-1024px):** Standard layout. Actions remain inline right of title. Breadcrumb shows full path.
- **Desktop (>1024px):** Full header with all elements comfortably positioned. Generous whitespace above and below.


---

## Pages

### appointments (/appointments)

Layout: data-table

### book (/appointments/book)

Layout: booking-calendar

### appointment-detail (/appointments/:id)

Layout: detail-header
