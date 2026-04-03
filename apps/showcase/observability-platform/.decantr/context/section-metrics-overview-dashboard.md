# Section: metrics-overview-dashboard

**Role:** primary | **Shell:** sidebar-main | **Archetype:** metrics-overview-dashboard
**Description:** Top-level observability dashboard with KPI summaries, real-time charts, and service health maps. Primary entry point for platform-wide metrics monitoring.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (overview, service-detail)
**Key patterns:** kpi-grid, chart-grid, service-map [moderate], usage-meter [moderate]
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

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

metrics, charts, slo-tracking, real-time

---

## Visual Direction

**Personality:** Data-dense monitoring command center. Dark backgrounds with accent-colored metric highlights. Multiple visualization types per screen — line charts, heatmaps, sparklines, gauge rings. Monospace for all metric values, timestamps, and trace IDs. Universal green/yellow/red status. Think Datadog meets Grafana. Alert system feels urgent but not panic-inducing. Lucide icons. Every millisecond matters.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
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


### usage-meter

Quota and usage visualization with color-coded thresholds, animated progress indicators, category breakdowns, and contextual upgrade prompts when nearing limits.

**Visual brief:** Horizontal bar meter on a light track (8px tall, rounded-full corners). The filled portion starts from the left and represents current usage as a proportion of the total quota. Color of the filled portion changes by threshold: under 70% uses the theme accent color (blue/indigo), 70-90% shifts to yellow/amber with a subtle warm glow, above 90% turns red with a slow pulsing glow animation on the bar edge (box-shadow pulse). Small triangular threshold markers sit below the bar at configurable points (e.g. 70%, 90%, 100%) as tiny upward-pointing carets with thin labels. To the right of the bar, two values display: the percentage in bold (e.g. '73%') and the absolute values below in muted text (e.g. '7,300 / 10,000 API calls'). A PeriodSelector sits above as small segmented control (This Month / Last Month / Custom). The radial preset renders a circular gauge: a 270-degree arc on a circular track with the same color thresholds, the percentage number large and centered inside the ring, and the label ('API Calls') below the number. The gauge ring is 8px thick with rounded caps. The breakdown preset shows a single stacked horizontal bar where each category is a different-colored segment (e.g. blue for API calls, purple for storage, green for bandwidth). Below the bar, a legend row lists each category with a color dot, category name, and individual usage value. When total usage exceeds 80%, an UpgradePrompt card appears below: a bordered card with a small lightning-bolt icon, a headline like 'Approaching your plan limit', a one-line description, and a primary 'Upgrade Plan' button. The prompt card has a subtle gradient left-border in the warning color.

**Components:** UsageBar, UsageGauge, ThresholdMarker, UpgradePrompt, UsageBreakdown, PeriodSelector

**Composition:**
```
UsageBar = Track(d-data, rounded-full, h-2) > [Fill(color: threshold, width: percentage) + ThresholdMarker(d-annotation, position: absolute)*]
UsageGauge = SVG(d-data, aspect-square) > [TrackArc(d-data, 270deg, muted) + FillArc(d-data, sweep: percentage, color: threshold) + CenterLabel(d-data, percentage, large)]
UsageMeter = Container(d-surface, flex-col, gap-3) > [PeriodSelector(d-control, segmented) + UsageBar(d-data, threshold-color) > [FilledBar(d-data, animated-width, color: threshold) + ThresholdMarker(d-annotation, caret-below)* + ValueLabel(d-data, mono)] + UpgradePrompt?(d-interactive, conditional: usage>80%)]
UpgradePrompt = Card(d-interactive, border-left: warning-color, flex-row) > [Icon(d-annotation) + Content(flex-col) > [Headline(d-data, bold) + Description(d-annotation, muted)] + CTAButton(d-interactive, variant: primary)]
UsageBreakdown = Container(d-data, flex-col) > [StackedBar(d-data) > Segment(color: category)* + Legend(d-annotation) > LegendItem(d-annotation, dot + label + value)*]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| bar-hover | bar height 8px→10px + shadow-sm 150ms ease-out |
| upgrade-dismiss | opacity 1→0 + translateY(0→-8px) 200ms ease-in |
| threshold-marker-hover | scale(1→1.3) + opacity label 0→1 150ms ease-out |
| bar-fill | width 0→target% 800ms ease-out on mount |
| color-shift | background-color 400ms ease-in-out on threshold change |
| gauge-sweep | stroke-dashoffset 0→target 1000ms ease-out on mount |
| upgrade-prompt-enter | translateY(12px)→0 + opacity 0→1 400ms ease-out |
| critical-pulse | box-shadow glow scale(1→1.05→1) + opacity(0.6→1→0.6) 2s ease-in-out infinite when usage >=90% |

**Responsive:**
- **Mobile (<640px):** Bar fills full width. Percentage and absolute values move below the bar instead of to the right. Radial gauge scales down but maintains minimum 120px diameter for readability. Breakdown legend stacks vertically as a list. Upgrade prompt is full-width.
- **Tablet (640-1024px):** Standard layout. Bar has comfortable width with values to the right. Radial gauge at natural size. Breakdown legend is a horizontal row.
- **Desktop (>1024px):** Full layout with generous spacing. Multiple usage meters can sit side by side in a grid. Radial gauge fits well in dashboard card layouts. Upgrade prompt aligns below the meter with max-width constraint.

**Accessibility:**
- Role: `meter`
- Keyboard: Tab: move focus between period selector, usage bar, and upgrade prompt; Arrow Left/Right: change selected period in period selector; Enter: activate upgrade prompt CTA button; Escape: dismiss upgrade prompt
- Announcements: Current usage: {percentage}% — {used} of {total} {unit}; Warning: usage has exceeded {threshold}% of your quota; Critical: usage at {percentage}%, approaching plan limit; Period changed to {period_label}; Upgrade prompt: {headline}


---

## Pages

### overview (/metrics)

Layout: kpi-grid → chart-grid → service-map

### service-detail (/metrics/:service)

Layout: kpi-grid → chart-grid → usage-meter
