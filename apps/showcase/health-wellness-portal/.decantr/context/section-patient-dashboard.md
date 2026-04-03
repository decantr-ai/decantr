# Section: patient-dashboard

**Role:** primary | **Shell:** sidebar-main | **Archetype:** patient-dashboard
**Description:** Patient overview dashboard with appointments, vitals tracking, and medication management. Central hub for health and wellness portal users.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (overview, vitals, medications)
**Key patterns:** kpi-grid, calendar-view [complex], chart-grid, data-table [moderate], sparkline-cell
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

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

vitals, medications, appointments, health-records

---

## Visual Direction

**Personality:** Calming, trust-building health portal with emphasis on clarity and accessibility. Soft blues and teals on warm white backgrounds. Large, readable typography — nothing small or dense. Vitals use color-coded status indicators always supplemented with text labels. Appointment booking is straightforward. Telehealth rooms are calm and functional. Document vault feels secure. Every interaction prioritizes patient confidence. Lucide icons. WCAG AAA compliance throughout.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### kpi-grid

A grid of key performance indicator cards showing metrics with labels, values, and trend indicators

**Visual brief:** Row of four KPI cards in a responsive grid. Each card is a compact surface with an icon in a rounded muted-background circle at top-left, a small muted label below describing the metric, the primary value in large heading2-scale bold text, and a trend badge showing percentage change — green with an up-arrow for positive, red with a down-arrow for negative. Cards have equal height and consistent internal padding (p4). The compact preset removes icons and replaces the trend badge with an inline sparkline chart placeholder. Cards use subtle border or shadow to delineate from the background.

**Components:** Card, icon, Badge

**Composition:**
```
KPICard = Card(d-surface, padding) > [Icon(d-annotation, rounded-bg) + Label(text-muted, text-sm) + Value(heading2, mono-data) + TrendBadge(d-annotation, variant: positive|negative)]
KPIGrid = Grid(d-section, responsive: 2/4-col) > KPICard[]
```

**Layout slots:**
- `icon`: Abstract icon placeholder for each KPI category
- `trend`: Change percentage Badge with positive/negative variant
- `value`: Primary metric value with _heading2 styling
- `kpi-card`: Repeated Card with icon, label, value, and trend Badge
  **Layout guidance:**
  - grid: 4 columns desktop, 2 tablet, 1 mobile. Cards should breathe — generous padding.
  - animation: Counter animation on mount — numbers count from 0 to value over 500ms.
  - stat_treatment: Each KPI uses lum-stat-glow: filled circle in accent/primary color with number inside (dark text). Label below in text-muted. Sparkline trend to the right.
**Responsive:**
- **Mobile (<640px):** Two columns (2x2 grid). Card padding reduces to p3. Value text drops to heading3 scale. Icons shrink to 20px. Sparklines in compact preset maintain aspect ratio.
- **Tablet (640-1024px):** Two columns at default, four columns if space allows. Standard padding. Full heading2 values.
- **Desktop (>1024px):** Four-column single row. Full layout with icons, values, and trend badges. Comfortable gap4 spacing between cards.


### calendar-view

Multi-mode calendar with day, week, and month views, event creation via click-and-drag, and drag-to-reschedule functionality.

**Visual brief:** A clean, structured calendar interface built on hairline borders (1px, var(--d-border-subtle)) forming a precise grid. The NavigationBar spans the full width at the top: a left-aligned row with back/forward chevron buttons, a bold month+year title (e.g., 'April 2026' in text-lg font-semibold), and a 'Today' pill button that jumps to the current date. Right-aligned is the ViewSwitcher — a segmented control with four options (Month, Week, Day, Agenda) rendered as connected pill buttons with the active one filled with accent color and white text. Below the nav bar in month view, a day-of-week header row shows abbreviated day names (Mon, Tue, ...) in text-xs uppercase tracking-wide text-muted. The month grid itself has 5-6 rows of 7 cells each. Each DayCell has the date number in the top-left corner (text-sm), with today's date rendered inside a filled accent-color circle (24px diameter) with white text, creating a distinctive marker. Days outside the current month show muted text at 40% opacity. Events within each cell are rendered as small rounded pill chips (border-radius: 4px, height 20px) with a category-specific left color stripe (4px wide): blue for meetings, green for personal, purple for external, amber for deadlines. Event chip text is truncated with ellipsis at the cell boundary. When more than 3 events exist in a day, a '+N more' text link in text-xs text-muted appears below the visible chips, clickable to expand. In week view, time columns show alternating subtle background stripes (transparent and var(--d-bg-muted) at 30% opacity) for each hour block, with 15-minute subdivisions marked by dotted hairlines. Events are absolutely positioned rectangles spanning their time range, with rounded corners (6px), category-colored left border (3px), white/surface background, and a subtle left-edge shadow. Overlapping events are laid out side-by-side at reduced width. The current time is indicated by a horizontal red line (2px) with a small red circle (8px) on the left edge, extending across all columns. Click-and-drag event creation renders a translucent preview chip (40% opacity, accent-colored) that snaps to 15-minute increments. The EventPopover appears on click as a 320px-wide floating card with event title, time range, location, description, attendee avatars, and edit/delete actions. The optional MiniCalendar is a small (200px wide) month grid in the sidebar showing dots beneath days that have events.

**Components:** CalendarGrid, DayCell, WeekColumn, TimeSlot, EventChip, EventPopover, ViewSwitcher, NavigationBar, MiniCalendar

**Composition:**
```
DayCell = Cell(d-surface, clickable) > [DateNumber(today?: accent-circle) + EventChip*(max-3) + OverflowLink?]
WeekView = Grid(d-surface, 8-col) > [TimeGutter + WeekColumn* > TimeSlot* > EventChip*]
EventChip = Chip(d-interactive, draggable, category-colored) > [ColorStrip + Title + Time?]
MonthGrid = Grid(d-surface, 7-col) > [DayHeaderRow + DayCell*]
CalendarView = Container(d-section, flex-col, full-height) > [NavigationBar + ViewContent]
EventPopover = Popover(d-surface, floating, anchored) > [Title + CategoryDot + DateTime + Location? + Description? + Attendees? + Actions]
ViewSwitcher = SegmentedControl(d-interactive) > Segment[](Month|Week|Day|Agenda)
NavigationBar = Bar(d-surface, flex-row, sticky-top) > [PrevButton + PeriodLabel + TodayButton + NextButton + ViewSwitcher]
```

**Layout slots:**
  **Layout guidance:**
  - note: Month view uses CSS Grid with 7 columns. Week view uses 8 columns (1 for time labels + 7 for days). Day cells in month view should have min-height of 100px to accommodate event chips.
  - container: bordered-grid
  - time_grid: In week/day views, the time gutter on the left shows hour labels (text-xs, text-muted) aligned to the top of each hour row. The grid lines are hairline (1px solid var(--d-border-subtle)). Alternate hour blocks use a barely-visible background tint for scanability.
  - event_chips: Event chips use a compact pill style. Height 20px in month view, dynamic height in week/day view based on duration. Category colors are communicated via a left border strip, NOT full background fill — the chip background stays var(--d-bg-surface) or very light tint of the category color.
  - today_marker: Today's date number MUST be rendered inside a filled circle. Use a 24px width/height circle with background var(--d-accent), color white, border-radius 50%, display flex align-items-center justify-center. This is the most recognizable calendar convention — do not omit it.
  - current_time_line: A 2px-tall horizontal line in var(--d-error) red spanning the full width of the time grid, positioned at the exact current time. A small 8px filled circle sits at the left edge. This line updates its position every minute.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| chip-hover | translateY(-1px) + subtle shadow elevation, 100ms ease-out |
| today-pulse | Today's accent circle has a single subtle scale pulse (1.0→1.05→1.0) on initial render, 400ms ease-out |
| view-switch | Active segment background slides to new position, 200ms ease-out |
| view-change | Cross-fade between views with 250ms ease-in-out, content scales from 0.98 to 1.0 |
| event-create | New event chip scales from 0.9 to 1.0 + fade in, 200ms ease-out |
| popover-open | Popover scales from 0.95 to 1.0 + fade from 0 to 1, 200ms ease-out with origin at anchor point |
| month-navigate | Grid slides left/right (depending on direction) with 300ms ease-out, new month content fades in |
| drag-preview | Translucent event preview chip during drag creation pulses opacity 0.3→0.5→0.3, 1.5s ease-in-out infinite |
| current-time-line | The red current-time indicator line smoothly translates its Y position every minute (transition: top 60s linear) |

**Responsive:**
- **Mobile (<640px):** Defaults to agenda view (list). Month view simplifies to a scrollable list of weeks with horizontal swipe between weeks. Week view shows 3 days at a time with horizontal scroll. Event chips show only the color dot and truncated title. EventPopover becomes a bottom sheet. Drag-to-create is replaced with a tap-to-create flow. MiniCalendar is hidden. Navigation bar stacks: period label on top, view switcher below as icon-only tabs.
- **Tablet (640-1024px):** Month view shows full grid with event chips. Week view shows all 7 days with horizontal scroll if needed. Touch drag for event creation and rescheduling with haptic feedback. EventPopover is a centered modal on smaller tablets, anchored popover on larger ones. MiniCalendar available in a collapsible sidebar.
- **Desktop (>1024px):** Full month grid with generous cell heights (120px+). Week view shows all 7 day columns with scrollable time grid. Click-and-drag event creation. Hover previews on event chips showing time and first line of description. Keyboard shortcuts fully enabled. MiniCalendar in persistent sidebar when space allows. EventPopover anchored to click position.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: move focus between navigation, view switcher, and calendar grid; Arrow keys: navigate between days in month view, time slots in week/day view; Enter: open event detail popover or create event on empty day; Escape: close popover or cancel event creation; T: jump to today; M/W/D/A: switch to month/week/day/agenda view; Page Up/Down: navigate to previous/next month or week; Space: select/deselect date for multi-date operations
- Announcements: View changed to {month|week|day|agenda}; Navigated to {month year}; Event {title} on {date} at {time}; Event {title} moved to {new date/time}; New event created on {date}


### chart-grid

Grid of chart cards for dashboard data visualization

**Visual brief:** Grid of chart cards for dashboard analytics. Each card is a contained surface (d-surface) with a compact header showing the chart title in small medium-weight text and an optional time-range selector. The chart area occupies the card body with a minimum height of 200px and renders line charts, bar charts, area charts, or pie charts via data-chart-type attributes. A simple horizontal legend sits below the chart area with colored dots and labels. The mixed preset features one large chart spanning two columns in the first row, with two smaller charts below. Cards have consistent rounded corners and border styling.

**Components:** Card, CardHeader, CardBody

**Composition:**
```
Legend = Row(gap-2) > LegendItem(dot + label)[]
ChartCard = Card(d-surface) > [CardHeader > Title(font-medium) + ChartArea(d-data, min-height) + Legend(d-annotation)]
ChartGrid = Grid(d-section, responsive: 1/2-col) > ChartCard[]
```

**Layout slots:**
- `legend`: Simple legend row below chart area
- `chart-area`: Placeholder div with min-height and data-chart-type attribute
- `chart-card`: Repeated Card wrapping a chart placeholder area
- `chart-title`: Chart title in CardHeader with _textsm _fontmedium
**Responsive:**
- **Mobile (<640px):** Single column — all charts stack vertically at full width. Chart minimum height reduces to 160px. Legend wraps to multiple lines if needed. Wide preset becomes vertical stack instead of horizontal scroll.
- **Tablet (640-1024px):** Two-column grid activates. Mixed preset large chart still spans full width, smaller charts go side by side below. Chart height at 200px.
- **Desktop (>1024px):** Full two-column grid. Mixed preset spans correctly. Wide preset shows horizontal scrollable row. Charts at full minimum height with comfortable legend spacing.


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


### sparkline-cell

An inline mini-chart designed for table cells, showing trend data over time as a compact SVG sparkline with trend indicator and value label.

**Visual brief:** A compact inline element designed to sit within a table cell, composed of three parts arranged horizontally with an 8px gap: the sparkline SVG on the left, the trend indicator arrow in the middle, and the value label on the right. The sparkline SVG is 80px wide and 24px tall with no axes, labels, or grid lines — pure data visualization. In the line preset, the data renders as a smooth cubic bezier path (SVG <path> with C commands for smooth curves) stroked in the accent color at 2px width with round line-cap and line-join, no fill. The last data point has a small filled circle (4px radius, accent color) to mark the current value. In the area preset, the same bezier path is drawn but with an additional closed path below it filled with a vertical linear gradient from accent color at 30% opacity at the top to transparent at the bottom, creating a soft shaded area. The line itself remains 2px accent stroke on top of the fill. In the bar preset, the sparkline renders as a series of thin vertical rectangles (4px wide, 2px gap between each) whose heights are proportional to data values, aligned to the bottom of the 24px SVG viewport. Bars use accent color fill at 70% opacity, with the last bar at full accent opacity to highlight the current value. The TrendIndicator is a small directional arrow: an upward-pointing triangle (▲) in green (--d-success) for positive trends, a downward-pointing triangle (▼) in red (--d-error) for negative trends, or a horizontal dash (—) in muted text color for flat/neutral trends. The arrow is 10px in size, vertically centered. The ValueLabel shows the percentage change as text (e.g., '+12.4%', '-3.1%', '0.0%') in text-xs font-medium. Positive values use green (--d-success), negative use red (--d-error), neutral use text-muted. The entire component has a line-height matched to the table row for perfect vertical centering. The overall footprint is approximately 140px wide and 24px tall, fitting comfortably in standard table cells.

**Components:** Sparkline, TrendIndicator, ValueLabel

**Composition:**
```
Sparkline = SVG(80x24, viewBox, no-axes) > [Path(bezier|bars|area) + EndpointDot?]
ValueLabel = Text(text-xs, font-medium, semantic-color, nowrap) > '{sign}{value}%'
SparklineCell = Container(inline-flex, align-center, gap-2) > [Sparkline(svg) + TrendIndicator + ValueLabel]
TrendIndicator = Indicator(triangle-up|triangle-down|dash, semantic-color, aria-hidden)
```

**Layout slots:**
  **Layout guidance:**
  - note: This component is designed to be placed inside a <td> or any inline container. It should not be used standalone — it is a cell-level data visualization. The sparkline SVG has no interactivity by default but can optionally show a tooltip on hover revealing the exact data point values.
  - container: table-cell or inline
  - svg_rendering: The SVG viewBox should be '0 0 80 24'. Use vector-effect: non-scaling-stroke to keep stroke width consistent. The bezier path should use catmull-rom or monotone interpolation converted to cubic bezier commands for smooth curves that pass through all data points.
  - color_semantics: Positive trend: --d-success (green). Negative trend: --d-error (red). Neutral trend: text-muted. Sparkline path: accent color. These semantic colors ensure the component adapts to light and dark themes.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| bar-grow | each bar scaleY from 0 to 1 (transform-origin: bottom), staggered 30ms per bar, 300ms ease-out on initial render |
| path-draw | stroke-dashoffset animation from full-length to 0, 600ms ease-out on initial render (line and area presets) |
| dot-appear | scale 0→1 + opacity 0→1, 200ms ease-out, delayed until path draw completes |
| data-update | path morphs from old shape to new shape via d attribute interpolation, 400ms ease-in-out |
| trend-change | color crossfade 200ms ease when trend direction changes |

**Responsive:**
- **Mobile (<640px):** Sparkline width reduces to 60px (viewBox scales proportionally). Value label may be hidden to save space, leaving only the sparkline and trend arrow. Trend indicator remains visible. The entire component min-width is 80px on mobile.
- **Tablet (640-1024px):** Full 80px sparkline width. All three sub-components visible. Value label font remains text-xs. Component fits comfortably in standard table cells.
- **Desktop (>1024px):** Full 80px sparkline with optional hover tooltip showing exact data point values at each position along the path. Cursor changes to crosshair over the sparkline SVG when tooltips are enabled.

**Accessibility:**
- Role: `img`
- Keyboard: Tab: focus the sparkline cell (if interactive tooltips enabled); Enter: show detailed data point values in a tooltip; Escape: dismiss tooltip
- Announcements: Trend is {up|down|flat} at {percentage} change


---

## Pages

### overview (/dashboard)

Layout: kpi-grid → calendar-view

### vitals (/vitals)

Layout: chart-grid → data-table → sparkline-cell

### medications (/medications)

Layout: data-table → calendar-view
