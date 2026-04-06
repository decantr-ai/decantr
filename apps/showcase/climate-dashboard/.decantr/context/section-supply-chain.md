# Section: supply-chain

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** supply-chain
**Description:** Supplier directory and per-supplier emissions profile with tier tracking and geographic mapping for supply chain climate programs.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (suppliers, supplier-detail)
**Key patterns:** supply-chain-map [moderate], data-table [moderate], detail-header [moderate], kpi-grid, chart-grid
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

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

supply-chain, tier-tracking

---

## Visual Direction

**Personality:** Carbon accounting and emissions dashboard with organic earth-tone palette. Sankey diagrams show emissions flowing from sources through Scope 1/2/3 categories. Supply chain maps pin suppliers with tier rings showing Scope 3 complexity. Target progress rings track reduction commitments against science-based targets. Regulatory reporting for CSRD, SEC climate rules, Scope 3 disclosure. Lucide icons. Grounded.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### supply-chain-map

A geographic supply chain visualization mapping suppliers, material flows, and emissions intensity across tiers of a company's upstream value chain.

**Visual brief:** A dark-canvas world map with subtle country outlines and graticule lines. Supplier pins appear as filled circles sized proportional to emissions contribution (range 6px to 28px radius), colored by emissions intensity on a heatmap scale from cool teal (low) to hot magenta (high). Thin curved flow lines connect each supplier pin to the company headquarters marker, with line width encoding trade volume and dash animation showing material flow direction. A toggleable tier ring overlay renders concentric translucent circles around HQ labeling tier-1 (innermost), tier-2, and tier-3 supplier bands. Hovering any supplier pin raises a floating detail card showing supplier name, location, emissions tCO2e, tier, risk rating badge (low/med/high), and primary commodity. Map controls (zoom, recenter, layer toggle) sit bottom-right. Legend top-left explains intensity colors and tier rings.

**Components:** MapCanvas, SupplierPin, FlowLine, EmissionBadge, TierRing, DetailCard

**Composition:**
```
FlowLine = Path(bezier, animated-dash, volume-weighted)
MapCanvas = Viewport(zoomable, pannable) > ProjectionLayer
DetailCard = Card(d-surface, floating, tooltip) > [SupplierName + Location + Emissions + TierBadge + RiskBadge + Commodity]
SupplierPin = Circle(positioned, sized, colored) > HoverTarget
SupplyChainMap = Section(d-section, full-bleed) > MapCanvas > [CountryLayer + FlowLine[] + SupplierPin[](d-interactive) + EmissionBadge[] + TierRing[]] + DetailCard? + Legend + MapControls
```

**Layout slots:**
  **Layout guidance:**
  - note: Full-bleed map. Do not wrap in card surface. Pin hit-targets must be at least 24px for tap accessibility.
  - container: d-section
  - risk_badges: Risk ratings use textual labels not icon-only. 'Low Risk' / 'Medium Risk' / 'High Risk' with consistent color semantics.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| pin-hover | scale(1.3) + glow-ring 180ms ease-out |
| flow-line-hover | stroke-width +1px 150ms |
| map-zoom | transform scale interpolate 400ms ease-in-out |
| preset-switch | cross-fade with geometry morph 600ms |
| flow-animation | dash-offset drift 4s linear infinite on all flow-lines |

**Responsive:**
- **Mobile (<640px):** Map simplifies to clustered pins. Detail card appears as bottom sheet. Tier rings hidden by default.
- **Tablet (640-1024px):** Full map retained. Detail card docks to right edge on tap.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: cycle through supplier pins; Enter: open detail card; +/-: zoom in/out; Arrow keys: pan map; Escape: dismiss detail card
- Announcements: Supplier {name} in {location}: {emissions} tCO2e, tier {tier}, {risk} risk


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


---

## Pages

### suppliers (/suppliers)

Layout: supply-chain-map → data-table

### supplier-detail (/suppliers/:id)

Layout: detail-header → kpi-grid → chart-grid
