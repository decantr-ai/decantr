# Section: alert-manager-pro

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** alert-manager-pro
**Description:** Alert and incident management interface with active alert views, rule builder, incident timelines, and war-room detail pages for coordinated response.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 4 (alerts, alert-rules, incidents, incident-detail)
**Key patterns:** kpi-grid, data-table [moderate], alert-rule-builder [complex], timeline [moderate], activity-feed, chart-grid
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

alerts, incidents, rules, on-call

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


### alert-rule-builder

Visual condition builder for creating alert rules, filters, or automation triggers using nested AND/OR logic groups with metric selectors, operators, threshold sliders, and live rule testing.

**Visual brief:** Card-based rule builder with indented groups representing AND/OR logic. The top level is a bordered card (the root group) containing condition rows stacked vertically. Each condition row is a horizontal strip with four inline elements: a metric dropdown selector showing the metric name (e.g., 'CPU Usage', 'Error Rate', 'Latency p99'), an operator dropdown (>, <, =, !=, contains, between), a value input field (numeric or text depending on metric type), and a small circular remove button with an X icon at the right edge. Between each condition row sits a small pill-shaped logic toggle button showing 'AND' or 'OR' in uppercase — clicking toggles between the two. The pill color is blue for AND and orange for OR. Nested groups appear as indented bordered cards within the parent group, with a colored left border matching their logic operator color. An 'Add condition' button with a plus icon sits at the bottom of each group, alongside an 'Add group' button for nesting. The ThresholdSlider variant replaces the plain value input with a slider overlaid on a mini sparkline chart of recent metric data, with a draggable horizontal line showing the threshold position. A prominent 'Test Rule' button at the bottom evaluates the complete rule against recent data and shows a pass (green checkmark) or fail (red X) result with a count of matching data points. The entire builder has a subtle background tint distinguishing it from surrounding content.

**Components:** RuleGroup, ConditionRow, MetricSelector, OperatorSelector, ValueInput, ThresholdSlider, AddConditionButton, TestButton

**Composition:**
```
RuleGroup = Card(d-surface, bordered, indent: depth, color-left-border: logic) > [GroupLabel(d-annotation) + ConditionRow*(d-interactive) + LogicToggle*(d-interactive) + ActionButtons > [AddConditionButton + AddGroupButton]]
RuleHeader = Row(d-control) > [RuleNameInput + SeverityPills(d-interactive) + ChannelSelector]
RuleBuilder = Container(d-section, flex-col, gap-4) > [RuleHeader(d-control) + RuleGroup*(d-surface) + TestSection(d-control)]
TestSection = Row(d-control) > [TestButton(d-interactive) + TestResult?(d-annotation)]
ConditionRow = Row(d-interactive) > [DragHandle + MetricSelector(d-control) + OperatorSelector(d-control) + ValueInput(d-control) | ThresholdSlider(d-interactive) + RemoveButton]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| row-hover | background-tint 100ms ease-out |
| toggle-flip | background-color + text transition 200ms ease-out on logic toggle |
| remove-hover | scale(1→1.1) + color shift to red 150ms ease-out |
| row-add | height 0→auto + fade + slide-down 250ms ease-out |
| group-nest | indent slide-right + border-appear 300ms ease-out |
| row-remove | height auto→0 + fade-out 200ms ease-in |
| test-result | fade + scale(0.95→1) 300ms ease-out |
| threshold-glow | subtle pulse on threshold line when value is near current metric reading |

**Responsive:**
- **Mobile (<640px):** Condition rows stack vertically — metric selector, operator, and value input each take full width on separate lines. Logic toggles remain between conditions. Nested groups indent with a thinner left border. Threshold slider stretches to full width. Test button is sticky at the bottom of the viewport.
- **Tablet (640-1024px):** Condition rows display horizontally with slightly compressed widths. Groups maintain full indentation. Test section is visible without scrolling on most rules.
- **Desktop (>1024px):** Full horizontal condition rows with generous spacing. Threshold sliders show wider mini-charts. Drag-to-reorder is smooth with drop zone indicators. Multiple levels of nesting display cleanly with indentation guides.

**Accessibility:**
- Role: `form`
- Keyboard: Tab: move between condition row inputs and controls; Enter: confirm dropdown selection or trigger test; Arrow Up/Down: navigate dropdown options in metric and operator selectors; Delete/Backspace: remove focused condition row (with confirmation); Ctrl+G: add a new nested group; Ctrl+Enter: run rule test; Escape: close open dropdowns or cancel pending removal
- Announcements: Condition added: {metric} {operator} {value}; Condition removed from group; Logic toggled to {AND|OR} for group; Nested group added with {logic} operator; Rule test result: {pass|fail}, {matchCount} of {total} data points matched; Severity set to {level}


### timeline

Chronological sequence of events with dates, descriptions, and optional media.

**Visual brief:** Vertical sequence of timeline entries connected by a thin vertical line. Each entry has a small circle dot on the line, a date or timestamp label, an event title in medium weight, and a description paragraph. Optional media (images, icons) can appear beside entries. The compact preset reduces spacing and hides descriptions, showing only date and title. The horizontal preset arranges entries left-to-right along a horizontal line with dates below and content above. Milestone entries may have a larger dot or distinct icon.

**Components:** Card, Badge, icon, Text

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Vertical timeline only. Line on the left edge with content to the right. Dates above entries. Compact spacing.
- **Tablet (640-1024px):** Standard vertical timeline with comfortable spacing. Content beside the timeline dots.
- **Desktop (>1024px):** Full vertical or horizontal timeline. Entries alternate left and right of the center line (vertical) or spread evenly (horizontal).


### activity-feed

Chronological list of activity events with avatars, timestamps, and action descriptions

**Visual brief:** Vertical timeline of activity events grouped by date. Each date group starts with a muted, small-text date header. Individual feed items are horizontal rows: a circular avatar (with fallback initials) on the left, then a content block with the user name in medium-weight text followed by the action description in normal weight, and a relative timestamp (e.g. '2h ago') in small muted text right-aligned or below. Items are separated by subtle dividers or spacing. The compact preset drops avatars and uses small type-indicator icons instead. The detailed preset wraps each item in a bordered card with attachment previews and action buttons (reply, like).

**Components:** Avatar, Badge, Button

**Composition:**
```
FeedItem = Row(d-data-row, hoverable) > [Avatar(fallback-initials) + Content(flex-col) > [UserName(font-medium) + ActionText] + Timestamp(mono-data, text-xs, text-muted)]
DateGroup = Section > [DateHeader(d-annotation, text-muted) + FeedItem[]]
ActivityFeed = Container(d-data, flex-col, full-width) > [DateGroup[] + LoadMore?(d-interactive)]
```

**Layout slots:**
- `avatar`: User Avatar with fallback initials
- `content`: Action text with user name (_fontmedium) and description
- `feed-item`: Single activity row: _flex _row _gap3 _items[start]
- `load-more`: Button at bottom to load older activities
- `timestamp`: Relative time label with _textsm _fgmuted
- `date-header`: Date group separator with _textsm _fgmuted _fontmedium
  **Layout guidance:**
  - grouping: Group events by date. Date header: d-label with accent left-border. Today/Yesterday labels, then ISO dates.
  - empty_state: Encouraging: 'No activity yet. Publish your first item to see it here.'
  - event_treatment: Each event row: small colored dot (8px, color by event type) + timestamp (mono-data, text-xs) + description. Hover: subtle bg highlight.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Feed item rows highlight on hover with subtle background transition over 150ms. Action buttons in detailed preset scale on hover. |
| transitions | New activity items slide in from the top with 300ms ease-out translateY(-10px) to translateY(0) plus opacity 0 to 1. Staggered by 80ms per item when multiple arrive. Load-more items fade in from below. |

**Responsive:**
- **Mobile (<640px):** Full-width feed. Avatar size reduces to 32px. Timestamp moves below the content text instead of right-aligned. Detailed preset card actions stack vertically. Load-more button goes full-width.
- **Tablet (640-1024px):** Standard layout with avatars at 36px. Timestamp stays inline right-aligned. Comfortable spacing with gap3.
- **Desktop (>1024px):** Full layout with 40px avatars. Generous spacing. Detailed preset shows attachment previews inline. Actions row is fully horizontal.


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


---

## Pages

### alerts (/alerts)

Layout: kpi-grid → data-table

### alert-rules (/alerts/rules)

Layout: alert-rule-builder → data-table

### incidents (/incidents)

Layout: timeline → activity-feed

### incident-detail (/incidents/:id)

Layout: kpi-grid → chart-grid → activity-feed → timeline
