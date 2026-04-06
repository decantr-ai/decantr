# Section: research-workspace

**Role:** primary | **Shell:** sidebar-aside | **Archetype:** research-workspace
**Description:** Primary legal research workspace for searching case law, inspecting case detail with citation graphs, and drafting research memos side-by-side with supporting briefs.

## Quick Start

**Shell:** Three-column layout with left navigation and right inspector/detail panel. Used for admin dashboards, email clients, IDE-style apps. (nav: 240px, header: 52px)
**Pages:** 3 (search, case-detail, research-memo)
**Key patterns:** search-filter-bar [moderate], data-table [moderate], citation-graph [moderate], case-brief-card [moderate], doc-editor
**CSS classes:** `.counsel-page`, `.counsel-seal`, `.counsel-header`, `.mono-data`
**Density:** comfortable
**Voice:** Formal and precise.

## Shell Implementation (sidebar-aside)

### body

- **flex:** 1
- **note:** Main scroll container for primary content.
- **padding:** 1.5rem
- **overflow_y:** auto

### root

- **atoms:** _grid _h[100vh]
- **height:** 100vh
- **display:** grid
- **grid_template:** columns: sidebar 1fr aside; rows: 52px 1fr

### aside

- **note:** Right inspector/detail panel. Toggleable. Shows contextual details, properties, or preview.
- **atoms:** _flex _col _borderL
- **width:** 280px
- **border:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-bg)
- **collapsible:** true

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **left_content:** Breadcrumb / page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Actions / search

### sidebar

- **nav:**
  - flex: 1
  - padding: 0.5rem
  - item_gap: 2px
  - overflow_y: auto
  - item_content: icon + label text
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
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
  - content: User avatar + settings
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
- **position:** left
- **direction:** column
- **grid_span:** row 1/3
- **background:** var(--d-surface)
- **collapsed_width:** 64px
- **collapse_breakpoint:** md

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

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
| `--d-text` | `#1C1917` | Body text, headings, primary content |
| `--d-accent` | `#991B1B` |  |
| `--d-border` | `#D6CFC0` | Dividers, card borders, separators |
| `--d-primary` | `#1E3A5F` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#7F1D1D` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAF7F2` | Page canvas / base layer |
| `--d-text-muted` | `#6B6054` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#7F1D1D` |  |
| `--d-primary-hover` | `#14284A` | Hover state for primary elements |
| `--d-surface-raised` | `#F4F0E8` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#991B1B` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.counsel-page` | Warm cream document page (#FAF7F2) with generous margins and serif body text. Document-inspired foundation. |
| `.counsel-seal` | Official seal with ribbon embellishment in navy and oxblood. Authority and certification mark. |
| `.counsel-header` | Georgia or Garamond serif heading with deep navy color. Formal section and page headers. |
| `.counsel-margin` | Annotation margin area with dashed divider for notes and references. Legal pad aesthetic. |
| `.counsel-divider` | Thin horizontal rule with warm border tone for clean section separation. |
| `.counsel-oxblood` | Deep oxblood red accent elements for emphasis, warnings, and critical status indicators. |
| `.counsel-citation` | Indented citation blocks with left border accent and italic serif type. Legal reference styling. |
| `.counsel-highlight` | Subtle highlight on key text using warm cream background tint. Marks important passages. |

**Compositions:** **document:** Legal document viewer with serif body, citation styling, and annotation margins.
**marketing:** Law firm marketing page with authoritative serif headlines and seal branding.
**client-portal:** Client portal with case status, document access, and secure messaging.
**case-dashboard:** Legal case dashboard with matter listings, docket calendar, and client directory.
**Spatial hints:** Density bias: none. Section padding: 72px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface counsel-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — sidebar-aside shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

case-law, citations, research

---

## Visual Direction

**Personality:** Authoritative legal research workspace with warm cream backgrounds and deep navy accents. Serif body typography with monospace case citations. Citation graphs visualize case law networks showing which decisions cite which. Contract diffs reveal redlining with author attribution in margins. Matter cards track billable hours and deadlines with urgency indicators. Lucide icons. Scholarly.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

## Pattern Reference

### search-filter-bar

Search input with type and namespace dropdown filters for browsing registry content. Supports real-time search, type tabs, namespace dropdown, and sort controls.

**Visual brief:** Two-row filter bar. The first row contains a search input with a magnifying glass icon on the left. The second row contains type filter tabs (All, Patterns, Themes, Blueprints, Shells) rendered as pill-shaped toggles, a namespace dropdown selector, and a sort dropdown (Relevance, Newest, Popular). Active filter selections appear as removable chip badges below the bar. The compact preset combines search and filters into a single row. The with-results-count preset adds a 'Showing N results' label.

**Components:** Input, Select, Button, Badge, Chip, icon

**Composition:**
```
ActiveFilters = Row(gap-2) > Chip(d-annotation, removable)[]
SearchFilterBar = Row(d-control, full-width) > [SearchInput(d-control, icon: search, real-time) + TypeTabs > Tab(d-interactive)[] + NamespaceSelect(d-control) + SortSelect(d-control)]
```

**Layout slots:**
- `filter-row`: Horizontal row: type Chip tabs on left, namespace Select and sort Select on right
- `search-row`: Search Input with icon prefix and clear Button on the right
- `active-filters`: Optional row of active filter Badges with remove (x) action
  **Layout guidance:**
  - filter_tabs: Type tabs below search: All, Patterns, Themes, Blueprints, Shells. Active tab uses primary bg with white text (pill shape). Inactive: ghost.
  - search_input: Full-width search input with magnifying glass icon. On focus: border transitions to accent color. Placeholder: 'Search patterns, themes, blueprints...'
  - sort_dropdown: Right-aligned sort: Relevance, Most Downloaded, Recently Updated, Name A-Z.
**Responsive:**
- **Mobile (<640px):** Search input full-width on its own row. Type tabs become a horizontal scrollable strip. Namespace and sort collapse into a 'Filters' button that opens a bottom sheet.
- **Tablet (640-1024px):** Search and filters fit in two rows. Type tabs visible. Dropdowns inline.
- **Desktop (>1024px):** Single or two row bar with all controls visible. Type tabs, namespace, and sort all inline.


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


### citation-graph

An interactive network graph visualizing case citation relationships, cross-references, and legal authority chains for research and precedent analysis.

**Visual brief:** A full-bleed dark canvas with circular nodes representing cases. Node size scales logarithmically with citation count (leading cases become large hubs). Node color encodes court level (SCOTUS dark purple, Circuit Courts blue, District Courts teal, State courts amber) or topic area depending on filter. Edges are directed curved arrows: 'cites' edges in muted gray, 'cited-by' in primary blue, 'overruled' in red with dashed stroke, 'distinguished' in orange. Hovering any node expands a tooltip with full case citation (e.g. 'Brown v. Board of Education, 347 U.S. 483 (1954)'), year, jurisdiction, key holding excerpt, and in/out citation counts. Left-side filter panel contains collapsible sections for jurisdiction, date range slider, topic tags, and citation-depth control. A depth indicator pill in the top-right shows current traversal depth (e.g. '3 hops from root case'). Nodes can be dragged to reposition.

**Components:** CitationNode, CitationEdge, CaseLabel, DepthIndicator, FilterPanel

**Composition:**
```
FilterPanel = Panel(d-surface) > [JurisdictionFilter + DateRangeFilter + TopicFilter + DepthSlider]
GraphCanvas = Viewport(zoomable, pannable) > [EdgeLayer + NodeLayer + LabelLayer]
CitationEdge = Path(arrow, styled-by-relation) > RelationBadge?
CitationNode = Circle(sized, court-colored) > [CaseLabel + HoverTooltip > FullCitation]
CitationGraph = Section(d-section, full-bleed) > [FilterPanel(left) + GraphCanvas > [CitationNode[](d-interactive) + CitationEdge[]] + DepthIndicator(top-right) + Legend]
```

**Layout slots:**
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)
  **Layout guidance:**
  - note: Full-bleed graph canvas. Node hit targets minimum 24px. Case labels must render textually, not symbolically.
  - container: d-section
  - edge_semantics: Edge style MUST encode relationship type (cites/overruled/distinguished). Do not collapse to single style.
  - citation_format: Always use Bluebook citation format for case labels. Court and year required.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| edge-hover | stroke-width +1.5px + opacity-boost 150ms |
| node-hover | scale(1.15) + highlight-ring 180ms ease-out |
| filter-apply | nodes fade to 0.2 then back 400ms ease-in-out |
| layout-reflow | position lerp 800ms spring |
| preset-switch | layout morph 600ms ease |
| active-path | dash-offset drift 3s linear infinite on focused-path edges |

**Responsive:**
- **Mobile (<640px):** Graph remains interactive but filter panel becomes a bottom sheet. Node labels hidden by default, shown on tap.
- **Tablet (640-1024px):** Filter panel collapses to icon bar. Graph canvas expanded.

**Accessibility:**
- Role: `application`
- Keyboard: Tab: cycle through citation nodes; Enter: focus node and show full detail; Arrow keys: pan canvas; +/-: zoom in/out; F: open filter panel; Escape: clear selection
- Announcements: Case {citation} has {inCount} inbound and {outCount} outbound citations; Filter {name} set to {value}; Traversal depth changed to {depth}


### case-brief-card

A case brief summary card displaying Bluebook citation, court, outcome, holding summary, key facts, and optional research annotation margin.

**Visual brief:** A card with the full Bluebook citation rendered at top in monospace font at prominent size (e.g. 'Roe v. Wade, 410 U.S. 113 (1973)'). Immediately below the citation, a row of badges: court badge (SCOTUS, 9th Cir., D. Mass.) with court-specific color coding, and outcome badge (Affirmed: green, Reversed: red, Remanded: amber, Vacated: purple). A short decided-date chip. Holding summary appears as a 2-3 line blockquote-styled paragraph in italic serif font set off with a left border. Key Facts section below shows a bulleted list of 3-5 concise fact bullets. Research preset adds a right margin column with annotation surface where user notes appear as sticky-note style cards in pale yellow with timestamp and optional highlight-color indicators linking to specific text spans.

**Components:** CaseCitation, CourtBadge, HoldingSummary, KeyFacts, OutcomeBadge, AnnotationMargin

**Composition:**
```
KeyFacts = List(bulleted) > FactItem[]
CourtBadge = Pill(d-annotation, data-court) > CourtAbbreviation
CaseCitation = Text(mono, prominent) > CitationString
OutcomeBadge = Pill(d-annotation, data-outcome) > OutcomeLabel
CaseBriefCard = Card(d-surface) > [Header > [CaseCitation(mono) + BadgeRow > [CourtBadge + OutcomeBadge + DateChip]] + HoldingSummary(italic-quote) + KeyFacts > FactBullet[] + AnnotationMargin?]
HoldingSummary = Blockquote(serif-italic, left-border) > SummaryText
AnnotationMargin = Column(d-annotation) > AnnotationNote[] > [Timestamp + NoteBody + HighlightLink]
```

**Layout slots:**
  **Layout guidance:**
  - note: Citations must always use Bluebook format. Court badge uses text abbreviation, never icon-only.
  - container: d-surface
  - outcome_colors: Outcome semantics are fixed: Affirmed green, Reversed red, Remanded amber, Vacated purple, Dismissed gray.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-hover | elevation raise + citation highlight 150ms ease-out |
| fact-hover | bullet point accent 120ms ease |
| expand-full | card height grow + content fade-in 300ms ease-in-out |
| annotation-add | new note slide-in from right 300ms ease-out |
| highlighted-fact | subtle background glow on linked fact when annotation hovered 2s ease-in-out |

**Responsive:**
- **Mobile (<640px):** Research preset collapses annotation margin to bottom drawer. Citation may wrap to two lines.
- **Tablet (640-1024px):** Standard layout retained. Research margin narrows to 200px.

**Accessibility:**
- Role: `article`
- Keyboard: Tab: focus card; Enter: expand to full case view; N: add annotation (research preset); H: highlight selection (research preset)
- Announcements: Case {citation}: court {court}, outcome {outcome}; Holding: {summary}


### doc-editor

Rich text block editor with real-time collaboration support. CRDT-based synchronization, floating toolbar, slash commands, and remote cursor overlay.

**Visual brief:** Contenteditable block-based document area occupying the main content region. Each block (paragraph, heading, list, image, code) is a discrete editable unit. A floating formatting toolbar appears on text selection. Typing '/' at the start of a block opens a slash command menu. Remote collaborator cursors appear as colored caret lines with name labels. Remote selections render as colored highlights. The top area may include a document title field. Minimal preset hides all chrome except the content. Presentation preset uses larger type sizes and hides editing UI.

**Components:** Button, Avatar, icon

**Composition:**
```
DocEditor = Container(d-section, flex-col, full-height, relative) > [CursorsLayer + SelectionsLayer + ContentArea + FloatingToolbar? + SlashMenu? + MentionPopup?]
ContentArea = Editor(d-surface, contenteditable) > Block[]
CursorsLayer = Overlay(absolute) > RemoteCursor(colored, named)[]
FloatingToolbar = Bar(d-control, floating, on-selection)
```

**Layout slots:**
- `content`: Contenteditable block container
- `toolbar`: Floating formatting toolbar on selection
- `slash-menu`: Block type command palette
- `cursors-layer`: Overlay for remote collaborator cursors
- `mention-popup`: @mention autocomplete dropdown
- `selections-layer`: Overlay for remote text selections
**Responsive:**
- **Mobile (<640px):** Full-width editor with bottom-fixed formatting toolbar above the keyboard. Slash menu takes full width. Remote cursors show abbreviated names.
- **Tablet (640-1024px):** Standard editor layout. Floating toolbar near selection. Comfortable block spacing.
- **Desktop (>1024px):** Full editor with generous margins. Floating toolbar tracks selection precisely. All collaboration indicators visible.


---

## Pages

### search (/research)

Layout: search-filter-bar → data-table → citation-graph

### case-detail (/research/cases/:id)

Layout: case-brief-card → citation-graph

### research-memo (/research/memo)

Layout: doc-editor → case-brief-card
