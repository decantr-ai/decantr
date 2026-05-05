# Section: log-explorer-pro

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** log-explorer-pro
**Description:** Advanced log search and analysis interface with streaming log viewer, structured query filters, and contextual log detail inspection.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (logs, log-detail)
**Key patterns:** filter-bar [moderate], log-stream, data-table [moderate], json-viewer, trace-waterfall [moderate]
**CSS classes:** `.fin-card`, `.fin-alert`, `.fin-badge`, `.mono-data`
**Density:** comfortable
**Voice:** Operational and direct.

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
| `--d-text` | `#E2E8F0` | Body text, headings, primary content |
| `--d-accent` | `#22D3EE` |  |
| `--d-border` | `#2A2D3A` | Dividers, card borders, separators |
| `--d-primary` | `#6366F1` | Brand color, key interactive, selected states |
| `--d-surface` | `#12141C` | Cards, panels, containers |
| `--d-secondary` | `#818CF8` | Secondary brand color, supporting elements |
| `--d-bg` | `#0C0E14` | Page canvas / base layer |
| `--d-text-muted` | `#94A3B8` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#67E8F9` |  |
| `--d-primary-hover` | `#818CF8` | Hover state for primary elements |
| `--d-surface-raised` | `#1A1D28` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#A5B4FC` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.fin-card` | Dark card with 1px border, no shadow. Minimal surface separation for data-dense layouts. |
| `.fin-alert` | Top-border severity stripe with dark tinted background. Compact for dense dashboard layouts. |
| `.fin-badge` | Compact monospace badge for status and values. Minimal padding, tabular-nums. |
| `.fin-chart` | Chart container with subtle grid lines and dark background. Optimized for financial chart overlays. |
| `.fin-input` | Dark input with minimal 1px border. Compact styling for trading interfaces and data entry. |
| `.fin-table` | Dense table with alternating row tints and tight padding. Optimized for financial data scanning. |
| `.fin-metric` | Large monospace number with optional inline sparkline. Tabular-nums for alignment in data grids. |
| `.fin-ticker` | Horizontal scrolling ticker strip for real-time price data. Color-coded gain/loss values. |
| `.fin-surface` | Dark layered background with subtle depth. Creates visual hierarchy in data-heavy interfaces. |

**Compositions:** **auth:** Minimal dark authentication with centered card. Professional and secure appearance.
**analytics:** Financial analytics with dense data tables, comparison charts, and metric grids.
**dashboard:** Trading dashboard with multi-panel layout. Real-time charts, order books, positions, and ticker.
**marketing:** Fintech marketing page with dark hero, data visualization showcases, and feature grids.
**Spatial hints:** Density bias: 2. Section padding: 16px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface fintech-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

logs, search, structured-queries, context

---

## Visual Direction

**Personality:** Data-dense monitoring command center. Dark backgrounds with accent-colored metric highlights. Multiple visualization types per screen — line charts, heatmaps, sparklines, gauge rings. Monospace for all metric values, timestamps, and trace IDs. Universal green/yellow/red status. Think Datadog meets Grafana. Alert system feels urgent but not panic-inducing. Lucide icons. Every millisecond matters.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### filter-bar

Search input and filter controls for filtering page content. Sits above data-consuming patterns like data-table, card-grid, and activity-feed.

**Visual brief:** Horizontal bar containing a search input with magnifying glass icon on the left, one or more dropdown Select filters in the middle (category, status, date range), and action buttons on the right (Clear All, Apply). Active filters may display as small removable badge chips below the bar. The compact preset places the search input and filters in a single tight row. The advanced preset adds an expandable panel with additional filter fields (date pickers, range sliders, checkboxes).

**Components:** Input, Select, Button, Badge, icon

**Composition:**
```
FilterBar = Row(d-control, full-width) > [SearchInput(d-control, icon: search) + FilterSelects > Select(d-control)[] + ActionButtons(d-interactive)]
ActiveFilters = Row(gap-2) > FilterChip(d-annotation, removable)[]
AdvancedFilters = Panel(d-surface, expandable) > [FilterRow > Select[] + SavedFilters > Button(variant: outline)[]]
```

**Layout slots:**
- `search`: Search Input with placeholder text
- `actions`: Action Buttons (clear, apply, etc.)
- `filters`: One or more Select dropdowns for category/status filtering
**Responsive:**
- **Mobile (<640px):** Search input takes full width on its own row. Filter selects stack below or collapse into a 'Filters' button that opens a bottom sheet. Active filter chips wrap to multiple lines.
- **Tablet (640-1024px):** Search and primary filters fit in one row. Less common filters in a collapsible section.
- **Desktop (>1024px):** All elements in a single horizontal row. Advanced filters expand inline below the bar.


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


### json-viewer

Collapsible JSON viewer with syntax highlighting, line numbers, copy-to-clipboard, and expandable/collapsible nodes. Used for inspecting registry content data on detail pages.

**Visual brief:** Code viewer panel with a header toolbar containing a title and a copy-to-clipboard button. The body displays syntax-highlighted JSON with color-coded keys (accent color), string values (green), numbers (blue), booleans (orange), and null (muted). Collapsible nodes show expand/collapse chevron icons next to objects and arrays, with an item count badge when collapsed (e.g., '{3}' or '[5]'). Line numbers appear in a left gutter column. The inline preset removes the header and renders JSON inline with reduced formatting. The diff preset highlights additions in green background and removals in red background.

**Components:** Button, icon

**Layout slots:**
- `footer`: Optional footer with byte size and node count
- `header`: Toolbar row with title, expand/collapse all toggle, and copy-to-clipboard Button
- `json-content`: Syntax-highlighted JSON with collapsible nodes. Keys in _fgprimary, strings in _fgsuccess, numbers in _fgwarning, booleans in _fgdestructive
- `line-numbers`: Gutter column with line numbers, _fgmuted _textxs _mono
  **Layout guidance:**
  - syntax: Syntax highlighting using theme accent colors: strings=amber, numbers=cyan, keys=coral, booleans=green.
  - toolbar: Header bar: title (filename or 'Preview') left, Copy button (ghost) right. Language badge if applicable.
  - viewer_treatment: Use lum-code-block: dark bg (#111113 or var(--d-surface)) with colored top border (2px, accent). Monospace font. Line numbers in text-muted.
**Responsive:**
- **Mobile (<640px):** Full-width viewer with horizontal scroll for deeply nested content. Nodes default to collapsed beyond depth 2. Copy button prominently placed.
- **Tablet (640-1024px):** Standard viewer width. Nodes expand to depth 3 by default.
- **Desktop (>1024px):** Full viewer with comfortable width. All nodes expandable. Horizontal space accommodates deep nesting without scroll.


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


---

## Pages

### logs (/logs)

Layout: filter-bar → log-stream → data-table

### log-detail (/logs/:id)

Layout: json-viewer → trace-waterfall
