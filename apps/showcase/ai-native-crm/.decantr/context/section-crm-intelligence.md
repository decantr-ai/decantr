# Section: crm-intelligence

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** crm-intelligence
**Description:** AI-generated sales intelligence dashboard with win/loss analysis, revenue forecasting, relationship mapping, and actionable insights derived from CRM data.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 1 (insights)
**Key patterns:** kpi-grid, chart-grid, relationship-graph [moderate]
**CSS classes:** `.glass-card`, `.glass-panel`, `.glass-header`
**Density:** comfortable
**Voice:** Confident and helpful.

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
| `--d-accent` | `#4ade80` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.glass-card` | Individual glass card element. |
| `.glass-panel` | Frosted panel with blur(20px), 5% white background, subtle border. |
| `.glass-header` | Glass hero section with layered blur panels. |
| `.glass-fade-up` | Entrance animation: fade + translateY(20px) over 0.5s. |
| `.glass-overlay` | Modal overlay with heavy blur. |
| `.glass-backdrop` | Dark gradient background with subtle noise texture. |

**Spatial hints:** Density bias: none. Section padding: 80px. Card wrapping: glass.


Usage: `className={css('_flex _col _gap4') + ' d-surface glassmorphism-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

ai-insights, forecasting, analytics

---

## Visual Direction

**Personality:** Intelligent CRM with AI enrichment at every touch. Frosted glass panels on cool-toned dark backgrounds. Contact cards show AI-gathered insights alongside manual data. Pipeline board is the center of gravity — wide, draggable, value-weighted. Email composer has AI ghost text suggestions. Meeting recaps auto-populate with action items. Relationship graph makes hidden connections visible. Smooth transitions. Lucide icons. This CRM feels alive.

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


### relationship-graph

Network graph visualizing entity relationships such as contacts, companies, and deals with force-directed, radial, and timeline layout presets, labeled edges, and interactive exploration.

**Visual brief:** Force-directed network graph on a clean canvas where entities appear as distinct node shapes: people are circular avatars (48px diameter) showing initials or a photo with a colored ring indicating entity type (blue for contacts, teal for team members), companies are rounded squares (48px) with a building icon or logo and a gray border, and deals are diamond-shaped nodes (40px) with a dollar icon colored by deal stage (green for won, amber for active, red for lost). Edges connecting entities are thin curved lines with a small text label at the midpoint describing the relationship type ('reports to', 'invested in', 'closed deal', 'referred by'). Edge thickness scales with relationship strength or recency — thicker lines for stronger or more recent connections. Selecting an entity smoothly animates it to the visual center and fans out its direct connections in a radial arrangement while fading distant unrelated nodes to 15% opacity. The radial preset places the focus entity at an exact center point with concentric dashed rings at equal intervals for 1st, 2nd, and 3rd degree connections. Colors consistently encode entity type across all presets. A search overlay in the top-left provides type-ahead entity search. An optional filter panel on the left edge allows filtering by entity type, relationship type, and date range. A detail card appears on the right when an entity is selected, showing the entity's full profile info, a list of relationships, and recent activity.

**Components:** GraphCanvas, EntityNode, RelationshipEdge, DetailCard, SearchOverlay, FilterPanel

**Composition:**
```
DetailCard = Panel(d-surface, slide-right) > [Header > [EntityAvatar + Name + TypeBadge] + Details(d-data) + RelationshipList + ActivityFeed]
EntityNode = Node(d-interactive, shape: entityType, color: typeColor) > [Avatar|Icon + NameLabel(d-annotation)]
GraphCanvas = Canvas(d-data, pannable, zoomable, dot-grid-bg) > [RelationshipEdge* + EntityNode*]
SearchOverlay = Overlay(d-control, top-left, frosted) > [SearchInput + SuggestionList?]
RelationshipEdge = Edge(d-data, curved, labeled) > [PathLine + MidpointLabel(d-annotation)]
RelationshipGraph = Container(d-section, spatial) > [SearchOverlay(d-control) + FilterPanel?(d-surface)] + GraphCanvas > EntityNode*(d-interactive) + RelationshipEdge* + DetailCard?(d-surface)
```

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| edge-hover | opacity 0.3→1 + thickness increase 150ms ease-out |
| node-hover | scale(1→1.15) + ring-glow 150ms ease-out |
| unfocus | nodes return to force-directed positions 400ms ease-out |
| detail-open | translateX(100%→0) 300ms ease-out |
| filter-apply | non-matching nodes opacity 1→0.15 300ms ease-out |
| focus-entity | selected node translates to center + connected nodes fan out radially 500ms ease-in-out |
| force-settle | nodes drift gently as force simulation converges, continuous |
| connection-pulse | subtle opacity pulse on edges of selected entity 3s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Graph canvas fills the viewport with touch pan and pinch zoom. Entity nodes render at reduced size (36px). Edge labels hidden by default (shown on tap). Search overlay is a floating action button that expands to full-width search. Filter panel opens as a bottom sheet. Detail card opens as a full-screen overlay.
- **Tablet (640-1024px):** Standard graph layout with touch support. Entity nodes at full size. Search overlay visible. Filter panel as a collapsible sidebar. Detail card slides in from the right at 300px width.
- **Desktop (>1024px):** Full interactive graph with hover tooltips, drag-to-reposition nodes, and smooth force simulation. Search overlay and filter panel visible simultaneously. Detail card opens as a side panel without obscuring the graph. Zoom controls in the corner.

**Accessibility:**
- Role: `img`
- Keyboard: Tab: cycle focus between entity nodes; Enter: select focused entity and open detail card; Escape: deselect entity and close detail card; Arrow keys: pan the graph canvas; Plus/Minus: zoom in/out; S: focus the search overlay input; F: toggle the filter panel; R: switch to radial layout centered on selected entity; 0: reset zoom to fit all entities
- Announcements: Entity: {name}, {type}, {connectionCount} connections; Relationship: {entity1} {relationshipType} {entity2}; Detail card opened for {name}; Filter applied: showing {count} of {total} entities; View centered on {name} with {degree}-degree connections visible


---

## Pages

### insights (/insights)

Layout: kpi-grid → chart-grid → relationship-graph
