# Section: job-monitor

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** job-monitor
**Description:** Pipeline job run monitoring with run history, step-by-step trace waterfall, live log streaming, and performance KPIs.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (jobs, job-detail)
**Key patterns:** data-table [moderate], kpi-grid, trace-waterfall [moderate], log-stream
**CSS classes:** `.term-glow`, `.term-tree`, `.term-type`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and direct.

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
| `--d-text` | `#00FF00` | Body text, headings, primary content |
| `--d-accent` | `#00FFFF` |  |
| `--d-border` | `#333333` | Dividers, card borders, separators |
| `--d-primary` | `#00FF00` | Brand color, key interactive, selected states |
| `--d-surface` | `#0A0A0A` | Cards, panels, containers |
| `--d-secondary` | `#FFB000` | Secondary brand color, supporting elements |
| `--d-bg` | `#000000` | Page canvas / base layer |
| `--d-text-muted` | `#00AA00` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#00CCCC` |  |
| `--d-primary-hover` | `#00CC00` | Hover state for primary elements |
| `--d-surface-raised` | `#111111` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#CC8C00` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.term-glow` | Subtle phosphor bloom effect using text-shadow with current color. 5px and 10px spread. |
| `.term-tree` | Tree view using ASCII connectors. Uses ├── └── │ for hierarchy visualization. |
| `.term-type` | Typewriter entrance animation. Characters appear one by one, 20ms per character. |
| `.term-blink` | Blinking cursor animation at 1s interval. Steps timing for authentic terminal feel. |
| `.term-input` | Terminal prompt style with '> ' prefix and blinking cursor. Monospace input. |
| `.term-panel` | ASCII box-drawing border using Unicode characters. Background surface color, 1px solid border. |
| `.term-table` | Full ASCII table borders with box-drawing characters for headers, cells, and junctions. |
| `.term-canvas` | Pure black background (#000000) for CRT authenticity. No gradients, no textures. |
| `.term-hotkey` | Function key button style '[F1]'. Border, padding, monospace. Inverse on active. |
| `.term-status` | Inverse color status bar. Background uses text color, text uses background color. |
| `.term-diff-add` | Addition highlighting. Green background with darker green text for added lines. |
| `.term-diff-del` | Deletion highlighting. Red background with darker red text for removed lines. |
| `.term-progress` | ASCII progress bar using block characters. [||||....] style with percentage. |
| `.term-scanlines` | Optional CRT scanline overlay using repeating-linear-gradient. Semi-transparent black lines. |
| `.term-sparkline` | Inline ASCII sparkline using braille characters for high-resolution mini charts. |

**Preferred:** log-stream
**Compositions:** **auth:** Terminal-styled authentication forms with ASCII borders.
**logs:** Log viewer with real-time streaming and filtering.
**dashboard:** Terminal dashboard with split panes, status bar, and hotkey bar.
**marketing:** Dev tool marketing page with terminal aesthetic hero.
**Spatial hints:** Density bias: 2. Section padding: 16px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface terminal-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

monitoring, logs, job-history

---

## Visual Direction

**Personality:** Technical data engineering workspace with terminal-inspired aesthetics. Phosphor green/amber on black for pipeline canvas and log viewers. ASCII box borders on panels. Monospace everywhere. Visual pipeline builder uses nodes and edges with animated data flow particles. Source connectors show recognizable database/API icons. Transformation nodes show SQL/code previews. Think dbt Cloud meets Prefect meets a retro terminal. Lucide icons mixed with data-type icons.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
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


### trace-waterfall

Horizontal waterfall chart showing execution trace spans with nested parent-child relationships, color-coded by span type, time axis alignment, and expandable span detail panels for debugging distributed systems.

**Visual brief:** Vertical list of horizontal bars where each bar represents a trace span. A horizontal time axis runs across the top with millisecond markers and thin vertical gridlines descending the full height. Each span row contains a left-aligned label area (service name, operation name, duration text) and a horizontal bar positioned and sized proportionally to its start time and duration relative to the total trace. Nested child spans indent further right in the label column and align beneath their parent bars. Bar colors indicate span type: blue for HTTP calls, green for database queries, purple for AI/LLM calls, orange for cache operations, red for errored spans. Hovering a span highlights it with increased opacity and dims all non-ancestor/non-descendant spans. Clicking a span expands a detail panel below it showing metadata key-value pairs, tags, log entries, and timing breakdown. Error spans display a red left border and a small warning triangle icon in the label area. The filter bar at the top provides service name dropdown, minimum duration slider, and error-only toggle.

**Components:** TraceContainer, SpanBar, SpanLabel, TimeAxis, SpanDetail, FilterBar

**Composition:**
```
SpanRow = Row(d-interactive, indent: depth) > [SpanLabel > [Chevron? + ServiceBadge + OperationName + Duration] + SpanBar(color: type, position: startTime, width: duration)] + SpanDetail?(d-surface)
SpanList = Stack(d-data) > SpanRow*
TimeAxis = Ruler(d-annotation, sticky-top) > [TimeMarker* + Gridlines]
FilterBar = Row(d-control) > [ServiceFilter + DurationSlider + ErrorToggle + SearchInput]
SpanDetail = Panel(d-surface, expandable) > [Metadata(d-data) + Tags + Logs + TimingBreakdown]
TraceWaterfall = TraceContainer(d-section, flex-col) > [FilterBar(d-control) + TimeAxis(d-annotation) + SpanList]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| span-hover | opacity 0.7→1 + background-tint 150ms ease-out on hovered span, opacity 1→0.3 on non-related spans |
| bar-highlight | box-shadow glow matching span color 200ms ease-out |
| filter-apply | opacity transition 300ms ease-out on non-matching spans |
| detail-expand | max-height 0→auto + fade 250ms ease-out |
| detail-collapse | max-height auto→0 + fade 150ms ease-in |
| error-pulse | border-left color pulse red 2s ease-in-out infinite on error spans |

**Responsive:**
- **Mobile (<640px):** Label area collapses to show only service icon and duration. Span bars use full width. Tap a span to open detail in a bottom sheet. Filter bar collapses to a single filter icon button that opens a dropdown. Time axis shows fewer markers.
- **Tablet (640-1024px):** Standard layout with slightly narrower label area. Span detail opens inline. Filter bar fully visible. Comfortable touch targets on span rows.
- **Desktop (>1024px):** Full waterfall with generous label area showing service name, operation, and duration. Hover effects active. Span detail expands inline with full metadata. Filter bar shows all controls in a single row.

**Accessibility:**
- Role: `tree`
- Keyboard: Arrow Up/Down: navigate between span rows; Arrow Right: expand collapsed span children or open span detail; Arrow Left: collapse expanded children or close span detail; Enter: toggle span detail panel; F: focus the filter bar; E: toggle error-only filter; Home: jump to root span; End: jump to last span
- Announcements: Span: {service} {operation}, duration {duration}ms, {status}; Expanded {childCount} child spans under {operation}; Detail panel opened for {service} {operation}; Filter applied: showing {count} of {total} spans; Error span: {service} {operation} failed after {duration}ms


### log-stream

Real-time log streaming display with filtering, search, and auto-scroll behavior.

**Visual brief:** Terminal-style scrolling log display on a dark background with monospace text. Each log entry is a single line showing a timestamp in muted color, a log level badge (INFO in blue, WARN in yellow, ERROR in red, DEBUG in gray), and the message text. New entries append at the bottom with auto-scroll behavior. A controls header contains a search input, level filter toggles, and a pause/resume button. The filtered preset dims non-matching entries. The grouped preset collapses repeated messages with a count badge. A small stats bar shows entries/second and total count.

**Components:** Button, icon

**Layout slots:**
- `stats`: Error/warn/info counts
- `header`: Pause/play controls and stats
- `stream`: Scrolling log entries
**Responsive:**
- **Mobile (<640px):** Full-width log view. Controls collapse into a top bar with a filter toggle button. Log entries use smaller font. Search is a full-width overlay.
- **Tablet (640-1024px):** Standard layout with controls visible. Comfortable font size for log entries.
- **Desktop (>1024px):** Full log stream with controls bar, search, and stats visible. Wide view accommodates long log messages without wrapping.


---

## Pages

### jobs (/jobs)

Layout: data-table

### job-detail (/jobs/:id)

Layout: kpi-grid → trace-waterfall → log-stream
