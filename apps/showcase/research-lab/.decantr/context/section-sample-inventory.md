# Section: sample-inventory

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** sample-inventory
**Description:** Biological and chemical sample inventory management with chain-of-custody tracking. Researchers locate, log, and audit every sample in the lab.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (samples, sample-detail)
**Key patterns:** search-filter-bar [moderate], sample-tracker [complex], detail-header [moderate]
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

**Preferred:** sample-tracker
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

samples, chain-of-custody, inventory

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


### sample-tracker

A laboratory sample inventory tracker rendering biological or chemical samples with barcode identifiers, storage location tags, expiry countdowns, chain-of-custody logs, and status indicators across grid, freezer-map, or timeline views.

**Visual brief:** A scientific inventory view rendered as a responsive grid of SampleCards inside a d-section container. Each SampleCard is a d-surface with subtle border, padding 12px, and hover elevation. At the top of each card, a BarcodeDisplay renders the sample's unique ID as a visible 1D barcode (Code 128) with the human-readable identifier beneath in mono-data small text (e.g., 'SMPL-2026-00342'). Below the barcode sits the sample name in semibold text-sm with an optional species/type subline in body-muted. A LocationTag renders as a pill-shaped chip with a freezer-icon prefix showing storage position in mono-data format: 'FRZ-3 / Rack B / Box 4 / A3'. Beside it, an ExpiryBadge is color-coded by days remaining: emerald (>90 days), amber (30-90 days), red (<30 days), gray (expired/used). The badge shows the expiry date and a relative countdown ('28 days'). A StatusIcon sits in the top-right corner of each card indicating current state: available (green circle), checked-out (blue arrow-right), in-use (amber pulse dot), depleted (gray X), contaminated (red warning). A CustodyLog footer shows the most recent custody event with a small user avatar, action ('Accessed by J. Chen'), and timestamp ('2h ago'). Clicking a card opens a detail drawer with full custody history, freezer-cooldown logs, QC results, and derived-samples lineage. For freezer preset, cards arrange into a physical 9×9 grid mimicking cryobox layout with position labels (A1-I9) along edges and empty cells showing dashed borders. For timeline preset, SampleCards transform into horizontal rows with a vertical CustodyTimeline rail on the left; each custody event renders as a circular node on the rail with a connector line to the next event, with event details (user, action, timestamp) flowing to the right.

**Components:** SampleCard, LocationTag, ExpiryBadge, CustodyLog, BarcodeDisplay, StatusIcon, FreezerGrid, CustodyTimeline

**Composition:**
```
CustodyLog = Footer(d-annotation, data-custody) > [UserAvatar + ActionVerb + Timestamp]
SampleCard = Surface(d-surface, data-interactive) > [BarcodeDisplay + SampleName + LocationTag + ExpiryBadge + CustodyLogPreview + StatusIcon]
StatusIcon = Indicator(d-annotation, data-status) > [StatusDot]
ExpiryBadge = Badge(d-annotation, data-expiry-urgency) > [ExpiryIcon + DateText + CountdownText]
FreezerGrid = Grid(d-section, data-freezer-layout, 9x9) > [PositionLabels + OccupiedCell[] + EmptyCell[]]
LocationTag = Chip(d-annotation, data-location) > [FreezerIcon + LocationPath]
SampleTracker = Section(d-section) > [SampleGrid | FreezerGrid | CustodyTimeline]
BarcodeDisplay = Element(d-annotation, data-barcode) > [BarcodeImage + HumanReadableID]
CustodyTimeline = Timeline(d-section) > [CustodyRail + CustodyEvent[]]
```

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)
  **Layout guidance:**
  - note: Sample tracking is regulatory-grade lab data (GLP/GMP compliant). Every access must be logged. Expiry dates must be visible and color-coded. Chain-of-custody cannot be edited after creation.
  - container: d-section with grid layout
  - sample_card: SampleCard uses d-surface[data-interactive] with cursor:pointer. Minimum width 200px, maximum 280px. Internal padding 12px, gap 8px between sections.
  - status_icons: StatusIcon uses d-annotation[data-status] in top-right corner 16px diameter. available=green, checked-out=blue, in-use=amber-pulse, depleted=gray, contaminated=red.
  - expiry_colors: ExpiryBadge colors MUST be consistent: emerald (>90d), amber (30-90d), red (<30d), gray (expired). Colorblind-safe with icon prefixes (clock, warning, skull).
  - barcode_format: BarcodeDisplay renders actual scannable Code 128 or QR barcode (not decorative). Human-readable ID always visible beneath for manual entry fallback.
  - custody_immutability: CustodyLog entries are append-only. Display includes user avatar, action verb, and ISO timestamp. Never editable after creation — corrections require new custody entry.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-hover | scale 1.02 + shadow-elevation 150ms ease-out |
| status-pulse | in-use amber dot opacity 0.5 to 1.0 to 0.5 1.5s ease-in-out infinite |
| expiry-warning | ExpiryBadge red <7 days subtle shake 300ms every 10s |
| drawer-open | right-side drawer slide-in 250ms ease-out |
| layout-swap | grid reflow 400ms ease-in-out between grid/freezer/timeline presets |
| custody-append | new custody event fade-in + slide-up 300ms ease-out |
| expiry-countdown | ExpiryBadge text updates live as days elapse |

**Responsive:**
- **Mobile (<640px):** Grid collapses to 2 columns with SampleCards stacking vertically. BarcodeDisplay remains scannable. LocationTag truncates to freezer+box only. Custody log preview hidden, available via tap.
- **Tablet (640-1024px):** Grid renders 3-4 columns. All card sections visible. Freezer preset maintains 9×9 grid with horizontal scroll if needed.

**Accessibility:**
- Role: `grid`
- Keyboard: Arrow keys: navigate between sample cards in grid; Enter: open sample detail drawer; Escape: close drawer; /: focus search / barcode input; L: toggle layout (grid/freezer/timeline)
- Announcements: Sample {id}: {name}, expires {date}, status {status}; Opened detail for sample {id}; Custody: {user} {action} at {timestamp}


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


---

## Pages

### samples (/samples)

Layout: search-filter-bar → sample-tracker

### sample-detail (/samples/:id)

Layout: detail-header → sample-tracker
