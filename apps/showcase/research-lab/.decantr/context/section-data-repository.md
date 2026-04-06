# Section: data-repository

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** data-repository
**Description:** Research dataset library for a scientific lab. Scientists publish, browse, and inspect structured datasets produced by experiments.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (datasets, dataset-detail)
**Key patterns:** search-filter-bar [moderate], card-grid [moderate], dataset-card [complex], data-table [moderate]
**CSS classes:** `.lab-grid`, `.lab-panel`, `.lab-beaker`
**Density:** comfortable
**Voice:** Scientific and methodical.

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
| `--d-text` | `#18181B` | Body text, headings, primary content |
| `--d-accent` | `#06B6D4` |  |
| `--d-border` | `#E4E4E7` | Dividers, card borders, separators |
| `--d-primary` | `#06B6D4` | Brand color, key interactive, selected states |
| `--d-surface` | `#FAFAFA` | Cards, panels, containers |
| `--d-secondary` | `#0E7490` | Secondary brand color, supporting elements |
| `--d-bg` | `#FFFFFF` | Page canvas / base layer |
| `--d-text-muted` | `#71717A` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#0891B2` |  |
| `--d-primary-hover` | `#0891B2` | Hover state for primary elements |
| `--d-surface-raised` | `#F4F4F5` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#155E75` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.lab-grid` | Precise 8px grid alignment with visible baseline grid on hover or debug mode. |
| `.lab-panel` | White panels with precise 1px borders and sharp corners. Clean container for data and controls. |
| `.lab-beaker` | Scientific iconography with cyan stroke weight matching 1.5px precision. |
| `.lab-hazard` | Yellow and black diagonal hazard stripes for warnings and caution zones. |
| `.lab-barcode` | Monospace barcode-style displays for sample IDs and tracking codes. |
| `.lab-reading` | Monospace IBM Plex Mono data displays with tabular-nums and precise alignment. |
| `.lab-protocol` | Numbered step markers with circle badges and precise connectors for procedural displays. |
| `.lab-cyan-accent` | Cyan status indicators and highlights for active data streams and live readings. |

**Compositions:** **protocol:** Protocol step-by-step interface with numbered procedures and safety callouts.
**marketing:** Research platform marketing with technical precision and data visualization.
**data-explorer:** Data exploration interface with precise readings, barcodes, and grid alignment.
**experiment-dashboard:** Experiment monitoring dashboard with live readings, protocol steps, and sample tracking.
**Spatial hints:** Density bias: 1. Section padding: 48px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface lab-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

datasets, repository, data-catalog

---

## Visual Direction

**Personality:** Scientific research workspace with pristine white panels and technical cyan accents. Lab notebook entries with LaTeX formula blocks and image embeds. Protocol steps numbered with reagent lists, equipment chips, and safety badges. Sample trackers with barcode displays and expiry countdowns. Instrument scheduling grids show bookings across lab equipment. Dataset cards with schema trees and quality indicators. Think Benchling meets Jupyter. Lucide icons. Precise.

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


### card-grid

Responsive grid of cards with preset-specific content layouts

**Visual brief:** Responsive grid of uniformly-sized cards with consistent gap spacing. Each card is a contained surface with subtle border or shadow, rounded corners (r3), and internal padding. Product preset: top image with fixed aspect ratio, title below in medium-weight text, price in bold heading style, star-rating row with filled/empty star icons, and a full-width add-to-cart button in the card footer. Content preset: thumbnail image, colored category badge, article title, two-line excerpt in muted small text, and an author row with avatar, name, and date. Cards maintain equal height within each row via grid stretch.

**Components:** Card, CardHeader, CardBody, CardFooter, Image, Button, Badge

**Composition:**
```
CardGrid = Grid(d-section, responsive: 1/2/3/4-col) > ProductCard[]
ContentCard = Card(d-surface) > [Thumbnail + CategoryBadge(d-annotation) + Title(heading4) + Excerpt(text-muted) + MetaRow > [AuthorAvatar + AuthorName + Date]]
ProductCard = Card(d-surface, hoverable, lift-on-hover) > [Image(aspect-ratio) + Title(font-medium) + Price(heading4) + RatingRow > [StarIcon[] + CountBadge(d-annotation)] + CTAButton(d-interactive, full-width)]
```

**Layout slots:**
- `card-image`: Product image with aspect-ratio container
- `card-price`: Price with _heading4 styling
- `card-title`: Product name with _textsm _fontmedium
- `card-action`: Add-to-cart Button in CardFooter
- `card-rating`: Star rating row with icon stars and count Badge
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Cards lift on hover with translateY(-2px) and increased shadow over 200ms ease. Image within card scales to 1.03 on hover with overflow hidden. Badge pulses subtly on new items. |
| transitions | Cards entering viewport fade up from 15px below with staggered 100ms delay per card, 300ms duration. Load-more appends new cards with the same stagger animation. |

**Responsive:**
- **Mobile (<640px):** Single column (1 card per row). Cards go full-width with larger touch targets. Image aspect ratio maintained. Gap reduces to gap3.
- **Tablet (640-1024px):** Two columns for most presets. Collection preset stays at 2 columns. Gap at gap4. Cards maintain equal height per row.
- **Desktop (>1024px):** Three to four columns depending on preset. Product goes up to 4 columns at xl breakpoint. Content stays at 3. Icon preset reaches 4 columns. Full gap4-gap6 spacing.


### dataset-card

A scientific dataset metadata card surfacing schema structure, quality indicators, size statistics, licensing, version, and a sample preview for discoverability in data catalogs and research data management systems.

**Visual brief:** A data-catalog card rendered as a d-surface with a prominent header, schema tree body, and action footer. The top section shows DatasetTitle in text-xl semibold with VersionTag pill ('v2.3.1') beside it and a QualityIndicator badge (verified=emerald-check, pending=amber-dot, flagged=red-warning, deprecated=gray-archive) in the top-right. Beneath the title, a one-line description in body-muted text. A meta row of StatsBadges shows: Rows ('124,532'), Columns ('18'), Size ('42 MB'), Last updated ('2 days ago'), Format ('CSV/Parquet'). Each badge uses mono-data for the numeric value with a small glyph icon. An AuthorBlock shows institution logo, author names (or ORCID), and publication/DOI citation with a copy icon. The SchemaTree renders as an indented tree of columns with type annotations: 'patient_id : string', 'measurement_value : float64', 'timestamp : datetime'. Each column row includes a type chip (color-coded: string=slate, numeric=blue, datetime=violet, boolean=teal, geo=green) and optional stats preview (min/max for numeric, cardinality for string, date-range for datetime). Columns with null-constraint or primary-key show small key/asterisk icons. A LicenseChip ('CC BY 4.0' or 'MIT' or 'Restricted Access') sits beneath the schema with a link-out to the full license text. Expandable tags chips for subject keywords. Preview preset adds a SamplePreview table showing first 10 rows of the dataset with column headers matching schema types and cells in mono-data; scrollable horizontally. At the footer, a DownloadButton spans full-width or primary-aligned with a format selector dropdown (CSV / Parquet / JSON / RDF) and file-size indicator beside it. Secondary actions ('View Docs', 'Cite', 'Share') appear as ghost buttons in a row.

**Components:** DatasetTitle, SchemaTree, StatsBadge, QualityIndicator, LicenseChip, DownloadButton, SamplePreview, VersionTag, AuthorBlock

**Composition:**
```
StatsRow = Row(d-row) > [StatsBadge(Rows) + StatsBadge(Columns) + StatsBadge(Size) + StatsBadge(Updated) + StatsBadge(Format)]
SchemaTree = Tree(d-annotation, data-schema) > [ColumnRow[] > [ColumnName + TypeChip + ConstraintIcon? + StatsPreview?]]
AuthorBlock = Block(d-annotation) > [InstitutionLogo + AuthorList + CitationDOI + CopyButton]
DatasetCard = Surface(d-surface, article) > [DatasetHeader + StatsRow + AuthorBlock + SchemaTree + LicenseChip + TagsChips + SamplePreview? + ActionsFooter]
LicenseChip = Chip(d-annotation, data-license) > [LicenseIcon + LicenseText + LinkOut]
DatasetHeader = Header(d-annotation) > [DatasetTitle + VersionTag + QualityIndicator + Description]
SamplePreview = Table(d-data, scrollable) > [HeaderRow + DataRow[]]
DownloadButton = Button(d-control, data-primary) > [DownloadIcon + ButtonLabel + FormatSelector + SizeText]
```

**Layout slots:**
  **Layout guidance:**
  - note: Dataset cards are discovery surfaces in data catalogs. FAIR-principle compliance requires: findable (title+DOI), accessible (license+download), interoperable (format+schema), reusable (license+citation).
  - container: d-surface card
  - schema_tree: SchemaTree columns use indentation for nesting (JSON/nested structs). Type chips color-coded: string=slate, numeric=blue, datetime=violet, boolean=teal, geo=green. Mono-data for column names.
  - license_chip: LicenseChip MUST link to SPDX-identifier or full license text. Restricted-access datasets show lock-icon prefix and access-request flow.
  - stats_badges: StatsBadge uses mono-data tabular-nums for all figures. Include unit indicators (rows, MB, GB). Format human-readable (124,532 not 124532).
  - quality_indicator: QualityIndicator MUST be top-right of card. Colors consistent: verified=emerald, pending=amber, flagged=red, deprecated=gray. Always pair with icon (check/dot/warning/archive).
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| chip-focus | ring-glow primary 150ms ease-out |
| badge-hover | subtle scale 1.03 + shadow 120ms ease-out |
| copy-citation | checkmark confirmation 400ms ease-out after copy |
| schema-expand | tree height auto + fade 250ms ease-out |
| preview-reveal | sample-preview slide-down + fade 300ms ease-out |
| download-progress | button transforms to progress-bar 200ms ease-out during download |
| quality-pending-pulse | pending QualityIndicator dot pulse 1.5s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Card expands to full width. StatsBadges wrap to multiple rows. SchemaTree renders in accordion mode (columns collapsed behind expand arrow). DownloadButton remains full-width prominent.
- **Tablet (640-1024px):** Standard card layout at max-w-720px. SchemaTree always expanded. SamplePreview shows 5 columns with horizontal scroll.

**Accessibility:**
- Role: `article`
- Keyboard: Tab: cycle through actions and interactive elements; Enter: trigger download or open selected action; S: expand/collapse schema tree; P: toggle sample preview visibility; C: copy DOI citation to clipboard
- Announcements: Dataset {title} version {version}, quality {status}; Schema contains {count} columns; Download started in {format} format, {size}


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


---

## Pages

### datasets (/datasets)

Layout: search-filter-bar → card-grid

### dataset-detail (/datasets/:id)

Layout: dataset-card → data-table
