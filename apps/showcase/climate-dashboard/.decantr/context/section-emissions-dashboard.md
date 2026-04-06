# Section: emissions-dashboard

**Role:** primary | **Shell:** sidebar-main | **Archetype:** emissions-dashboard
**Description:** Climate emissions tracking dashboard with scope 1/2/3 breakdown, Sankey flows, and reduction target progress rings.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (overview, scope-detail, targets)
**Key patterns:** kpi-grid, emissions-sankey [moderate], target-progress-ring [moderate], scope-breakdown [moderate], chart-grid
**CSS classes:** `.earth-nav`, `.earth-card`, `.earth-hero`
**Density:** comfortable
**Voice:** Factual and urgent.

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
| `--d-text` | `#1A2E0A` | Body text, headings, primary content |
| `--d-accent` | `#0F766E` |  |
| `--d-border` | `#E5DFC0` | Dividers, card borders, separators |
| `--d-primary` | `#4D7C0F` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFEF5` | Cards, panels, containers |
| `--d-secondary` | `#92400E` | Secondary brand color, supporting elements |
| `--d-bg` | `#FEFCE8` | Page canvas / base layer |
| `--d-text-muted` | `#6B7A52` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#115E59` |  |
| `--d-primary-hover` | `#3F6212` | Hover state for primary elements |
| `--d-surface-raised` | `#FDF8E0` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#78350F` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.earth-nav` | Spacious natural navigation with generous padding. Warm tones and organic feel. |
| `.earth-card` | Paper-textured card with warm shadow. Soft border and natural color palette create an organic, handcrafted feel. |
| `.earth-hero` | Hero section with organic shape dividers. Wavy or curved bottom edges for natural flow. |
| `.earth-badge` | Muted earth tone badge with rounded corners. Soft backgrounds in greens, ambers, and teals. |
| `.earth-input` | Rounded input with warm border. Natural, inviting form styling with earthy focus ring. |
| `.earth-metric` | Growth-oriented metric display with nature-inspired icon. Leaf or sprout indicator for positive trends. |
| `.earth-section` | Section container with subtle grain texture overlay. Adds tactile quality to flat backgrounds. |
| `.earth-surface` | Warm layered background with cream base. Creates depth through warm tonal variation. |

**Compositions:** **auth:** Centered auth with warm cream background, paper-textured card, and organic border accents.
**blog:** Content-focused blog layout with serif headings, generous whitespace, and paper-like reading experience.
**dashboard:** Sustainability dashboard with organic cards, growth metrics, and nature-inspired data visualization.
**marketing:** Eco-conscious marketing page with organic hero shapes, grain textures, and earthy typography.
**Spatial hints:** Density bias: -1. Section padding: 64px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface earth-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

emissions-tracking, scope-123, targets

---

## Visual Direction

**Personality:** Carbon accounting and emissions dashboard with organic earth-tone palette. Sankey diagrams show emissions flowing from sources through Scope 1/2/3 categories. Supply chain maps pin suppliers with tier rings showing Scope 3 complexity. Target progress rings track reduction commitments against science-based targets. Regulatory reporting for CSRD, SEC climate rules, Scope 3 disclosure. Lucide icons. Grounded.

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


### emissions-sankey

A left-to-right Sankey diagram visualising the flow of greenhouse gas emissions from sources, through scope categories, to a final total footprint with target markers.

**Visual brief:** A wide, left-to-right Sankey diagram rendered on a light-neutral canvas. On the far left, a stack of source nodes (Suppliers, Operations, Travel, Energy, Waste) appear as rounded rectangles labelled with monospace tCO2e values. Curved bezier flow paths fan rightward into a central column of emission category nodes (Scope 1 deep red #B22222, Scope 2 burnt orange #D97706, Scope 3 amber yellow #F59E0B) where flow width is proportional to tonnage. Reduction flows appear as inward green (#16A34A) ribbons pointing backwards. A horizontal dashed target marker line crosses the total node on the right indicating the net-zero goal with a small flag label. Hovering any flow path reveals a tooltip with absolute tCO2e, percentage of total, and source-to-category pair. Legend box in the bottom-right lists scope colors with descriptions. Subtle grid lines in the background provide scale reference.

**Components:** SankeyCanvas, SourceNode, FlowPath, CategoryNode, TargetMarker, LegendBox

**Composition:**
```
FlowPath = Path(bezier, gradient-fill) > Tooltip(tonnage + percent)
LegendBox = Panel(d-annotation, backdrop-blur) > LegendItem[]
SourceNode = Rect(rounded, positioned) > [SourceName + TonnageLabel(mono)]
CategoryNode = Rect(scope-colored) > [CategoryName + TotalTonnage + PercentShare]
SankeyCanvas = SVG(viewBox-responsive) > [Background(grid) + NodeLayer + FlowLayer + OverlayLayer]
TargetMarker = Line(dashed) + Flag(year + reduction-target)
EmissionsSankey = Section(d-section) > SankeyCanvas > [SourceNode[] + FlowPath[](animated) + CategoryNode[] + TargetMarker] + LegendBox
```

**Layout slots:**
  **Layout guidance:**
  - note: Full-width horizontal Sankey. Min-height 480px. Flow paths must use SVG with bezier curves and animated dash-offset on hover.
  - container: d-section
  - data_labels: All tonnage values MUST appear with units (tCO2e) in monospace. Percentages shown to 1 decimal place.
  - color_semantics: Scope 1 = deep red, Scope 2 = orange, Scope 3 = yellow, reductions = green. Never reverse these semantics.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| flow-hover | opacity 0.6 to 1.0 + stroke-width +2px 180ms ease-out |
| node-hover | scale(1.02) + shadow-elevate 200ms ease-out |
| data-update | flow-path width interpolate 600ms ease-in-out |
| preset-switch | cross-fade 400ms ease |
| flow-pulse | subtle dash-offset drift 8s linear infinite on active flows |

**Responsive:**
- **Mobile (<640px):** Sankey rotates to vertical top-to-bottom flow. Flow labels hidden by default, accessible on tap. Legend collapses to expandable disclosure.
- **Tablet (640-1024px):** Horizontal Sankey retained but reduces source node count (merges smaller sources into 'Other'). Legend docks to bottom edge.

**Accessibility:**
- Role: `img`
- Keyboard: Tab: cycle through source nodes, then flow paths, then category nodes; Enter: open detail tooltip for focused element; Escape: dismiss tooltip
- Announcements: Flow from {source} to {category}: {value} tCO2e ({percent} of total); Target marker: {year} reduction goal of {percent}


### target-progress-ring

A circular progress visualization showing current achievement against a reduction target with nested ring segments, center value, and status color coding.

**Visual brief:** A bold circular progress ring rendered as concentric SVG arcs. The outer ring (stroke width 12px) represents the total target percentage span colored in muted neutral. The inner ring (stroke width 16px, same radius or slightly smaller) shows current progress filling clockwise from 12 o'clock position. The inner arc is colored according to status: vibrant green (#16A34A) when on-track (>=90% of pacing), amber (#F59E0B) when at-risk (70-90%), red (#DC2626) when off-track (<70%). Center displays current achievement as a very large monospace number (e.g. '34%') with target value below it in smaller muted text (e.g. 'of 50% by 2030'). Year label sits just below the ring. A thin tick mark indicates the pacing-expected position on the ring. In dashboard preset, rings display in a grid with each showing a different KPI label above (Scope 1, Scope 2, Water, Waste).

**Components:** RingCanvas, RingSegment, TargetLabel, CurrentValue, YearLabel

**Composition:**
```
RingCanvas = SVG(viewBox-square, aspect-1) > ArcLayer
RingSegment = Path(arc, stroke-linecap-round, stroke-width-sized)
TargetProgressRing = Surface(d-surface) > [RingCanvas > [RingSegment(background) + RingSegment(progress) + PacingTick] + CenterStack > [CurrentValue(mono-xl) + TargetLabel] + YearLabel]
```

**Layout slots:**
  **Layout guidance:**
  - note: Ring must be rendered as SVG for crisp scaling. Default ring size 240px, compact 120px, dashboard 160px each.
  - container: d-surface
  - color_logic: Status colors are computed from pacing delta (actual vs. expected by date). Do not hard-code green.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| ring-hover | outer-ring stroke-width +2px 200ms ease-out |
| color-change | stroke color transition 400ms ease |
| value-update | arc stroke-dasharray interpolate 800ms ease-in-out |
| on-track-glow | subtle drop-shadow pulse 3s ease-in-out infinite when status is on-track |

**Responsive:**
- **Mobile (<640px):** Ring diameter reduces to 180px. Dashboard preset collapses to single column.
- **Tablet (640-1024px):** Dashboard preset shifts to 2x2 grid. Standard preset maintains full size.

**Accessibility:**
- Role: `meter`
- Keyboard: Tab: focus the ring; Enter: show detail tooltip with pacing analysis
- Announcements: Current progress {value} of target {target} by {year}, status {status}


### scope-breakdown

A structured breakdown of Scope 1, 2, and 3 emissions with drill-down category detail, year-over-year change indicators, and multiple visualization modes.

**Visual brief:** Three large equal-width cards sit side-by-side (Scope 1, Scope 2, Scope 3), each with a bold header strip colored to scope semantics (red, orange, yellow). Inside each card, the total tCO2e is rendered extremely large in monospace numerals (48px) with the scope title above. Directly below the total, a percent-of-company-total badge and a YoY change chip with up/down arrow indicator (red arrow = emissions increased, green = decreased). Expanding the card reveals a list of emission categories (Stationary Combustion, Mobile Combustion, Purchased Electricity, Purchased Heat, Purchased Goods, Business Travel, Employee Commuting, etc.) as horizontal bars with category name on left, bar fill showing relative size, and tCO2e value right-aligned in monospace. Timeline preset replaces cards with a stacked area chart crossing Q1-Q4 columns.

**Components:** ScopeCard, CategoryList, EmissionBar, PercentChange, TrendIndicator

**Composition:**
```
ScopeCard = Surface(rounded, colored-header) > [Header(ScopeName + ScopeBadge) + Body(Total + Change) + Footer(ExpandToggle)]
EmissionBar = Bar(horizontal, proportional) > Fill(scope-colored)
CategoryList = List(collapsible) > CategoryRow[] > [CategoryName + EmissionBar + TonnageValue]
PercentChange = Chip(d-annotation) > [TrendIndicator + DeltaPercent]
ScopeBreakdown = Section(d-section) > ScopeCard[](d-surface, data-interactive) > [ScopeName + TotalEmissions(mono-lg) + PercentChange + TrendIndicator + CategoryList > EmissionBar[]]
```

**Layout slots:**
  **Layout guidance:**
  - note: Scope cards must be clickable (d-surface data-interactive) to expand/collapse category detail. Use elevation change on expand.
  - container: d-section
  - trend_direction: In climate contexts, decreasing emissions is POSITIVE. Green arrow for decrease, red for increase. Do not invert.
  - number_formatting: Emission totals rendered in monospace. Use comma separators for thousands. Always include tCO2e unit suffix.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| bar-fill | width 0 to target 600ms ease-out on mount |
| card-hover | elevation raise + border-highlight 150ms ease-out |
| card-expand | height auto + content fade-in 300ms ease-in-out |
| preset-switch | cross-fade 400ms |
| trend-pulse | subtle trend-indicator opacity 0.8 to 1.0 3s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Scope cards stack vertically at full width. Category lists remain expandable. Timeline preset renders as vertical time axis.
- **Tablet (640-1024px):** Two-column grid for scope cards with third card full-width below. Donut preset maintains centered layout with smaller diameter.

**Accessibility:**
- Role: `region`
- Keyboard: Tab: cycle through scope cards; Enter or Space: expand/collapse category detail; Arrow Down: move to next category within expanded card; Escape: collapse expanded card
- Announcements: Scope {n}: {value} tCO2e, {change} year over year; Category {name} expanded with {count} line items


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

### overview (/emissions)

Layout: kpi-grid → emissions-sankey → target-progress-ring

### scope-detail (/emissions/scope/:id)

Layout: scope-breakdown → chart-grid

### targets (/emissions/targets)

Layout: target-progress-ring → chart-grid
