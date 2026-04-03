# Section: trace-explorer

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** trace-explorer
**Description:** Distributed tracing viewer with trace search, latency histograms, full waterfall visualization, and service topology mapping.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (traces, trace-detail, service-topology)
**Key patterns:** chart-grid, data-table [moderate], trace-waterfall [moderate], service-map [moderate]
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

traces, service-map, latency-analysis

---

## Visual Direction

**Personality:** Data-dense monitoring command center. Dark backgrounds with accent-colored metric highlights. Multiple visualization types per screen — line charts, heatmaps, sparklines, gauge rings. Monospace for all metric values, timestamps, and trace IDs. Universal green/yellow/red status. Think Datadog meets Grafana. Alert system feels urgent but not panic-inducing. Lucide icons. Every millisecond matters.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

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


### service-map

Topology graph showing service dependencies with health indicators, animated traffic flow, and interactive detail panels for monitoring distributed service architectures.

**Visual brief:** Force-directed graph rendered on a dark canvas where each service is a rounded rectangle node (approximately 120x60px) containing a small service type icon (database cylinder, server rack, cloud function, etc.), the service name in medium-weight text below the icon, and a small circular health dot in the top-right corner glowing green (healthy), yellow (degraded), or red (down). Curved bezier edges connect dependent services with animated dot particles flowing along the edge in the direction of requests. Edge thickness scales with traffic volume — thin hairlines for low-traffic dependencies, thick 4px lines for high-traffic paths. Hovering a node highlights all its direct dependency edges in the node's health color and fades all unrelated nodes and edges to 20% opacity. A detail panel slides in from the right side showing the selected service's key metrics: p50/p95/p99 latency as a mini histogram, error rate as a percentage with trend arrow, requests per second as a sparkline, and a list of direct upstream and downstream dependencies. A legend in the bottom-left corner explains health dot colors, edge thickness meaning, and node icon types. The hierarchy preset arranges nodes top-to-bottom with straight downward edges. The grid preset places nodes in labeled group boxes.

**Components:** MapCanvas, ServiceNode, DependencyEdge, HealthIndicator, DetailPanel, Legend

**Composition:**
```
Legend = Card(d-annotation, bottom-left) > [HealthColors + EdgeScale + NodeIcons]
MapCanvas = Canvas(d-data, pannable, zoomable, dot-grid-bg) > [DependencyEdge* + ServiceNode*]
ServiceMap = Container(d-section, spatial) > [MapCanvas > ServiceNode*(d-interactive) + DependencyEdge*] + DetailPanel?(d-surface) + Legend(d-annotation)
DetailPanel = Panel(d-surface, slide-right) > [Header > [ServiceName + TypeBadge + HealthStatus] + Metrics > [Latency + ErrorRate + Throughput] + DependencyList]
ServiceNode = Node(d-interactive, rounded-rect) > [TypeIcon + ServiceName + HealthIndicator(d-annotation, dot)]
DependencyEdge = Edge(d-data, curved, animated-particles) > [PathLine + FlowParticles + MidpointLabel?]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| node-hover | scale(1→1.05) + elevation increase + border-color shift 150ms ease-out |
| edge-highlight | opacity 0.4→1 + color shift 200ms ease-out |
| focus-fade | opacity 1→0.2 300ms ease-out on unfocused nodes/edges |
| detail-slide | translateX(100%→0) 300ms ease-out for panel entry |
| layout-reflow | node positions lerp 600ms ease-in-out when switching presets |
| health-pulse | scale(1→1.3→1) + opacity pulse 2s ease-in-out infinite on degraded/down health dots |
| edge-particles | dot particles flowing along edges at speed proportional to request rate, continuous |

**Responsive:**
- **Mobile (<640px):** Map canvas fills the screen with touch-based pan and pinch-to-zoom. Service nodes render at minimum size with name only (no icon). Detail panel opens as a bottom sheet instead of a side panel. Legend hides behind an info button. Edges simplified to straight lines without particles.
- **Tablet (640-1024px):** Standard force-directed layout with touch support. Detail panel slides in from the right at reduced width (280px). Service nodes show icon and name. Edge particles render at reduced density.
- **Desktop (>1024px):** Full interactive map with hover effects, animated edge particles, and side detail panel. Zoom controls in the top-right corner. Legend always visible. Generous node sizing with icons, names, and health indicators.

**Accessibility:**
- Role: `img`
- Keyboard: Tab: cycle focus between service nodes in alphabetical order; Enter: select focused node and open detail panel; Escape: close detail panel and deselect node; Arrow keys: pan the map canvas; Plus/Minus: zoom in/out; 0: reset zoom to fit all nodes; L: toggle legend visibility
- Announcements: Service {name}: {healthStatus}, {requestRate} req/s, {errorRate}% error rate; Detail panel opened for {name}; {name} depends on {count} downstream services; {count} upstream services call {name}; Map zoomed to {zoomLevel}%


---

## Pages

### traces (/traces)

Layout: chart-grid → data-table

### trace-detail (/traces/:id)

Layout: trace-waterfall

### service-topology (/traces/topology)

Layout: service-map
