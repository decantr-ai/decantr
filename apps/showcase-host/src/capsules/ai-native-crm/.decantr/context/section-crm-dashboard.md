# Section: crm-dashboard

**Role:** primary | **Shell:** sidebar-main | **Archetype:** crm-dashboard
**Description:** Primary sales overview dashboard with pipeline visualization, contact management, deal tracking, AI-powered enrichment, and revenue forecasting.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 6 (dashboard, pipeline, contacts, contact-detail, deals, deal-detail)
**Key patterns:** kpi-grid, deal-pipeline-board [moderate], activity-feed, data-table [moderate], creator-profile [moderate], relationship-graph [moderate], detail-header [moderate], timeline [moderate], form-sections [complex]
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

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

pipeline, contacts, deals, ai-enrichment, forecasting

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


### deal-pipeline-board

Sales pipeline Kanban board specialized for deal management with stage columns, deal cards showing amounts and close probability, drag-to-advance functionality, and value aggregation per stage.

**Visual brief:** Horizontal Kanban board with five or more stage columns arranged left to right representing the sales pipeline: Lead, Qualified, Proposal, Negotiation, Won, and Lost. Each column is a vertical container (240-280px wide) with a sticky header and scrollable card area below. Stage headers display the stage name in bold, a deal count badge (e.g., '12 deals'), and a total dollar value with a small dollar-sign icon (e.g., '$340,000'). The header has a subtle bottom border colored to match the stage. Deal cards within each column are white rounded rectangles (full column width, approximately 100px tall) with: the company name in bold 14px text at the top, the contact name in muted 12px text below, the deal amount in prominent 16px semi-bold text with dollar formatting, and a thin horizontal progress bar at the bottom representing close probability (0-100%). The progress bar fills from left to right with the stage's accent color. Cards have a subtle left border colored by how long the deal has been in the current stage (green for recent, amber for aging, red for stale). Dragging a card shows a lifted shadow state and destination columns highlight with a dashed border drop zone. The Won column has a light green background tint with a subtle checkmark watermark. The Lost column has a light red background tint with dimmed card opacity (60%). The forecast preset shows a secondary weighted amount below the raw amount in a smaller muted style. Cards in all presets show a small avatar circle for the deal owner in the top-right corner.

**Components:** PipelineBoard, StageColumn, DealCard, StageHeader, DealAmount, ProbabilityIndicator, WonLostBanner

**Composition:**
```
DealCard = Card(d-interactive, draggable) > [CompanyName + ContactName(d-annotation) + DealAmount(d-data) + ProbabilityIndicator(d-data) + OwnerAvatar?]
StageColumn = Column(d-surface, flex-col, fixed-width, droppable) > [StageHeader(d-annotation) > [StageName + DealCount(d-annotation) + TotalValue(d-data)] + CardList(d-data, scrollable) > DealCard*]
PipelineBoard = Board(d-section, flex-row, gap-4, overflow-x-auto) > StageColumn*(d-surface)
WonLostBanner = Overlay(d-annotation, watermark, tinted-bg)
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-grab | scale(1.03) + shadow elevation 100ms ease-out |
| card-hover | translateY(-2px) + box-shadow increase 150ms ease-out |
| probability-fill | width transition 400ms ease-out on value change |
| card-drop | position lerp + scale(1.03→1) 300ms ease-out when card is dropped in new column |
| card-move | slide-out from source column + slide-in to destination column 350ms ease-in-out |
| column-highlight | border-style solid→dashed + background-tint 200ms ease-out on valid drop target |
| stage-total-update | number counter animation 500ms ease-out |
| stale-deal-pulse | subtle red border pulse on deals that have been in a stage past their expected duration, 3s infinite |

**Responsive:**
- **Mobile (<640px):** Columns stack as swipeable horizontal carousel with snap points — one column visible at a time with stage name tabs at the top for quick navigation. Deal cards use full width. Drag-to-move replaced with a 'Move to stage' dropdown on each card. Stage totals visible in the tab bar.
- **Tablet (640-1024px):** Two to three columns visible at a time with horizontal scroll. Deal cards at full detail level. Drag-and-drop supported with touch. Stage headers remain sticky.
- **Desktop (>1024px):** All stage columns visible simultaneously with horizontal scroll if needed. Full drag-and-drop with hover previews. Deal cards show all details including owner avatar and probability bar. Stage headers are sticky during vertical scroll within columns.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: move focus between stage columns; Arrow Up/Down: navigate between deal cards within a column; Arrow Left/Right: move focus between stage columns; Space: pick up focused deal card for moving; Arrow Left/Right (while holding): move picked-up card to adjacent stage; Space/Enter: drop card in current stage; Escape: cancel card move and return to original position; D: open deal detail view for focused card
- Announcements: Stage {name}: {count} deals, total value {total}; Deal: {company}, {amount}, {probability}% probability in {stage} stage; Deal {company} moved from {fromStage} to {toStage}; Deal {company} marked as won, value {amount}; Deal {company} marked as lost; Pipeline total: {totalDeals} deals worth {totalValue}


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


### creator-profile

Public creator page layout with hero, tiers, content feed, and about section. Tab-based navigation.

**Visual brief:** Full-width creator page starting with a storefront hero section (cover image, avatar, creator name, bio, follower count, subscribe CTA). Below the hero, a horizontal tab bar with tabs for Posts, Memberships, About, and Community. The tab content area fills the remaining space — Posts tab shows a content feed, Memberships tab shows tier cards, About tab shows a rich text bio with social links. Embed preset removes the hero and shows a compact card version suitable for embedding on external sites.

**Components:** Button, Card, Tabs, icon

**Composition:**
```
Hero = Section(full-width) > [CoverImage + Avatar(large) + CreatorName(heading2) + Bio(text-muted) + Stats + SubscribeCTA(d-interactive)]
TabBar = Row(d-control) > Tab(d-interactive)[]
TabContent = Panel(d-surface) > [PostsFeed? + TierCards? + AboutSection?]
CreatorProfile = Container(d-section, flex-col) > [Hero + TabBar(d-control) + TabContent]
```

**Layout slots:**
- `hero`: Storefront hero pattern
- `tabs`: Posts, About, Tiers navigation
- `content`: Tab content area
- `tiers-sidebar`: Optional tier cards sidebar
**Responsive:**
- **Mobile (<640px):** Hero cover image reduces in height. Tabs become horizontally scrollable. Content feed is single-column full-width.
- **Tablet (640-1024px):** Standard hero proportions. Tabs fit in a single row. Content area has comfortable margins.
- **Desktop (>1024px):** Full-width hero with generous cover image. Content area centered with max-width constraint. All tabs visible.


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


### timeline

Chronological sequence of events with dates, descriptions, and optional media.

**Visual brief:** Vertical sequence of timeline entries connected by a thin vertical line. Each entry has a small circle dot on the line, a date or timestamp label, an event title in medium weight, and a description paragraph. Optional media (images, icons) can appear beside entries. The compact preset reduces spacing and hides descriptions, showing only date and title. The horizontal preset arranges entries left-to-right along a horizontal line with dates below and content above. Milestone entries may have a larger dot or distinct icon.

**Components:** Card, Badge, icon, Text

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Vertical timeline only. Line on the left edge with content to the right. Dates above entries. Compact spacing.
- **Tablet (640-1024px):** Standard vertical timeline with comfortable spacing. Content beside the timeline dots.
- **Desktop (>1024px):** Full vertical or horizontal timeline. Entries alternate left and right of the center line (vertical) or spread evenly (horizontal).


### form-sections

Grouped form fields organized in labeled sections with validation

**Visual brief:** Vertical stack of grouped form fields. Each section has a heading/description on the left and form controls on the right (2-column at desktop, stacked on mobile). Labels above fields. Max-width 640px. Single card wrapping or no card. Save/cancel buttons at bottom.

**Components:** Card, Input, Select, Switch, Checkbox, Button, Label, Textarea, RadioGroup

**Composition:**
```
Field = Stack(flex-col) > [Label(font-medium) + Input(d-control) + ErrorText?(d-annotation, text-destructive)]
Section = Card(d-surface) > [SectionTitle(heading4) + Description?(text-muted) + FieldGroup(d-control, grid: 1/2-col)]
FieldGroup = Grid > Field[]
FormSections = Container(d-section, flex-col, gap-6) > [Section[] + ActionButtons]
ActionButtons = Row(d-interactive) > [SaveButton(variant: primary) + CancelButton(variant: ghost)]
```

**Layout slots:**
- `actions`: Bottom-aligned save/cancel buttons
- `section`: Card with 2-column layout: labels left, fields right
- `field-group`: Grid of form fields with _grid _gc1 _lg:gc2 _gap4
- `section-title`: Section heading with _heading4 and description with _bodysm _fgmuted
  **Layout guidance:**
  - note: Labels go ABOVE their field, not side-by-side. This prevents the label-field gap problem at wide viewports.
  - textarea: Textareas should have min-height: 6rem to visually differentiate from single-line inputs.
  - max_width: Form content should be constrained to max-width: 40rem (640px). Full-width forms are hard to read.
  - icon_placement: Section header icons render INLINE with the heading text (icon left of heading, vertically centered), not floating outside the card border.
  - label_position: stacked
  - select_styling: Apply d-control to ALL form elements including <select>. Add appearance: none and a custom SVG chevron for consistent styling.
  - section_grouping: Group related fields under section headers. Use a SINGLE d-surface card for the entire form, OR no card at all. Do NOT wrap each section in its own separate card.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Collapsible sections expand/collapse with 250ms ease height transition. Validation errors shake the invalid field with a 300ms horizontal oscillation (translateX +/-4px). |
| transitions | Section content fades in on expand with 200ms ease. Step transitions in creation preset cross-fade over 250ms. |

**Accessibility:**
- Role: `form`
- Keyboard: Tab navigates between form fields; Shift+Tab navigates backwards between fields; Enter submits when focus is on submit button; Space toggles checkboxes and switches; Arrow keys navigate within radio groups
- Announcements: Validation error: {field} — {message}; Section {name} expanded; Section {name} collapsed; Form submitted successfully
- Focus: First invalid field receives focus on failed validation. On section expand, focus moves to first field in the section. On step change in creation preset, focus moves to first field of new step.


---

## Pages

### dashboard (/dashboard)

Layout: kpi-grid → deal-pipeline-board → activity-feed

### pipeline (/pipeline)

Layout: deal-pipeline-board

### contacts (/contacts)

Layout: data-table

### contact-detail (/contacts/:id)

Layout: creator-profile → activity-feed → relationship-graph

### deals (/deals)

Layout: kpi-grid → data-table

### deal-detail (/deals/:id)

Layout: detail-header → timeline → activity-feed → form-sections
