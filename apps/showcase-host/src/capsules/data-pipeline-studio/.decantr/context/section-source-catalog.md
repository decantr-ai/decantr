# Section: source-catalog

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** source-catalog
**Description:** Data source management with browsable connector catalog, setup wizards, and active connection monitoring.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (sources, source-detail, connections)
**Key patterns:** data-source-connector [moderate], json-viewer
**CSS classes:** `.term-glow`, `.term-tree`, `.term-type`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and direct.

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
| `--d-text` | `#00FF00` | Body text, headings, primary content |
| `--d-accent` | `#00FFFF` |  |
| `--d-border` | `#333333` | Dividers, card borders, separators |
| `--d-primary` | `#00FF00` | Brand color, key interactive, selected states |
| `--d-surface` | `#0A0A0A` | Cards, panels, containers |
| `--d-secondary` | `#FFB000` | Secondary brand color, supporting elements |
| `--d-bg` | `#000000` | Page canvas / base layer |
| `--d-text-muted` | `#00AA00` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#00CCCC` |  |
| `--d-primary-hover` | `#00CC00` | Hover state for primary elements |
| `--d-surface-raised` | `#111111` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#CC8C00` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.term-glow` | Subtle phosphor bloom effect using text-shadow with current color. 5px and 10px spread. |
| `.term-tree` | Tree view using ASCII connectors. Uses ├── └── │ for hierarchy visualization. |
| `.term-type` | Typewriter entrance animation. Characters appear one by one, 20ms per character. |
| `.term-blink` | Blinking cursor animation at 1s interval. Steps timing for authentic terminal feel. |
| `.term-input` | Terminal prompt style with '> ' prefix and blinking cursor. Monospace input. |
| `.term-panel` | ASCII box-drawing border using Unicode characters. Background surface color, 1px solid border. |
| `.term-table` | Full ASCII table borders with box-drawing characters for headers, cells, and junctions. |
| `.term-canvas` | Pure black background (#000000) for CRT authenticity. No gradients, no textures. |
| `.term-hotkey` | Function key button style '[F1]'. Border, padding, monospace. Inverse on active. |
| `.term-status` | Inverse color status bar. Background uses text color, text uses background color. |
| `.term-diff-add` | Addition highlighting. Green background with darker green text for added lines. |
| `.term-diff-del` | Deletion highlighting. Red background with darker red text for removed lines. |
| `.term-progress` | ASCII progress bar using block characters. [||||....] style with percentage. |
| `.term-scanlines` | Optional CRT scanline overlay using repeating-linear-gradient. Semi-transparent black lines. |
| `.term-sparkline` | Inline ASCII sparkline using braille characters for high-resolution mini charts. |

**Compositions:** **auth:** Terminal-styled authentication forms with ASCII borders.
**logs:** Log viewer with real-time streaming and filtering.
**dashboard:** Terminal dashboard with split panes, status bar, and hotkey bar.
**marketing:** Dev tool marketing page with terminal aesthetic hero.
**Spatial hints:** Density bias: 2. Section padding: 16px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface terminal-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

sources, connectors, schemas

---

## Visual Direction

**Personality:** Technical data engineering workspace with terminal-inspired aesthetics. Phosphor green/amber on black for pipeline canvas and log viewers. ASCII box borders on panels. Monospace everywhere. Visual pipeline builder uses nodes and edges with animated data flow particles. Source connectors show recognizable database/API icons. Transformation nodes show SQL/code previews. Think dbt Cloud meets Prefect meets a retro terminal. Lucide icons mixed with data-type icons.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### data-source-connector

Card-based interface for connecting to external data sources with status indicators, configuration forms, connection testing, and sync controls for integration management.

**Visual brief:** Responsive grid of SourceCard components. Each card is a surface card (border, rounded-lg, padding 24px) containing: a large recognizable SourceIcon at the top center (48px, e.g. PostgreSQL blue elephant, MySQL dolphin, Stripe purple logo, Snowflake snowflake, MongoDB green leaf, Google Sheets green document icon, Salesforce cloud), the source name in semibold text below the icon, a short one-line description in muted text (e.g. 'Relational database'), and a ConnectionStatus badge at the bottom. Connected sources show a green dot + 'Connected' label with 'Last sync: 2m ago' in small muted text below. Disconnected sources show a gray dot + 'Not connected' and the card has slightly reduced opacity (0.85). Sources with sync errors show a red dot + 'Error' with a warning icon. Hovering a card elevates it with shadow-md and a subtle border accent. Clicking a disconnected card opens the setup panel: a centered form card that slides in from the right (or replaces the grid on mobile). The ConfigForm contains: the source icon and name at the top, a horizontal divider, then input fields specific to the source type (e.g. for PostgreSQL: Host, Port, Database Name, Username, Password with a show/hide toggle, SSL toggle). Each field has a label and placeholder text. Below the fields, a TestConnectionButton: a secondary outlined button that on click shows a spinner, then either a green checkmark + 'Connection successful' or a red X + error message with detail text. Below the test button, a primary 'Save & Connect' button (disabled until test passes). For connected sources, clicking the card shows a detail panel with: connection info summary (host, database, masked credentials), last sync timestamp, sync duration, record counts, a SyncButton (secondary button with rotating arrows icon during sync, 'Sync Now' label), a 'Disconnect' destructive text button, and an 'Edit' button to modify configuration. The SyncButton shows rotating arrows during active sync with a progress label ('Syncing... 45%'), then transitions to a checkmark + 'Synced' on completion.

**Components:** SourceCard, SourceIcon, ConnectionStatus, SyncButton, ConfigForm, TestConnectionButton, SourceCatalog

**Composition:**
```
ConfigForm = Panel(d-surface, slide-from-right, padding-lg) > [Header > [SourceIcon(32px) + SourceName + CloseButton(d-interactive)] + Divider + FormFields(d-data, flex-col, gap-4) > [Input(d-interactive, type: per-field)]* + TestConnectionButton(d-interactive, secondary, inline-result) + SaveButton(d-interactive, primary, disabled-until-tested)]
SourceCard = Card(d-interactive, surface, rounded-lg, hover: elevate) > [SourceIcon(d-annotation, brand-icon, 48px, centered) + SourceName(d-data, semibold, centered) + SourceDescription(d-annotation, muted, one-line) + ConnectionStatus(d-annotation) > [StatusDot(color: status) + StatusLabel + LastSync?(muted, small)]]
SourceCatalog = Grid(d-surface, responsive-columns) > SourceCard(d-interactive)[] + AddCustomCard(d-interactive, dashed-border)
ConnectionDetail = Panel(d-surface) > [ConnectionSummary(d-data) + SyncStats(d-data) > [LastSync + Duration + RecordCount] + SyncButton(d-interactive, icon: rotating-arrows) + EditButton(d-interactive, secondary) + DisconnectButton(d-interactive, destructive)]
DataSourceConnector = Container(d-section, flex-col, gap-4) > [SearchBar?(d-control) + CategoryTabs?(d-control) + SourceCatalog(d-surface, grid: responsive)] > SourceCard(d-interactive, hover-elevate)* > [SourceIcon(d-annotation, centered, 48px) + SourceName(d-data, semibold) + SourceDescription(d-annotation, muted) + ConnectionStatus(d-annotation, dot + label)] + ConfigForm?(d-surface, slide-panel)
```

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-hover | translateY(-2px) + shadow-md + border-color accent/30 150ms ease-out |
| status-dot-pulse | scale(1→1.3→1) 2s ease-in-out infinite on connected status |
| test-button-press | scale(0.97) 100ms ease-in |
| card-connect | border-color gray→accent + status-dot-color gray→green 500ms ease-out |
| test-failure | spinner-fade-out 200ms + error-icon-shake translateX(-3px→3px→0) 300ms ease-out |
| test-success | spinner-fade-out 200ms + checkmark-scale(0→1) 300ms ease-out bounce |
| sync-complete | rotating-arrows-stop + checkmark-fade-in 400ms ease-out |
| config-panel-open | translateX(100%)→0 + opacity 0→1 300ms ease-out |
| config-panel-close | translateX(0)→100% + opacity 1→0 250ms ease-in |
| error-glow | box-shadow red/10 pulse 2s ease-in-out infinite on error status cards |
| sync-in-progress | rotate(0→360deg) 1.2s linear infinite on sync arrows icon |

**Responsive:**
- **Mobile (<640px):** Grid becomes single column. Source cards are full-width. Config form opens as a full-screen overlay or pushed view. Test connection result shows inline. Search input full-width above cards. Category tabs become a horizontal scrollable chip row.
- **Tablet (640-1024px):** Two-column grid. Config form opens as a right-side panel (50% width) overlaying the grid. Comfortable card sizes with full icon and text visibility.
- **Desktop (>1024px):** Three-column grid with generous card spacing. Config form opens as a slide-out panel from the right (400px fixed width) with the grid still visible and dimmed behind. Connection detail can show as a popover or the same slide-out panel.

**Accessibility:**
- Role: `grid`
- Keyboard: Arrow keys: navigate between source cards in the grid; Enter: open configuration form or connection detail for focused card; Tab: move between form fields within config panel; Escape: close config panel or connection detail; T: trigger test connection (when config form is open); S: trigger sync (when connection detail is open); Backspace/Delete: disconnect source (with confirmation)
- Announcements: {source_name}: {connection_status}; Configuration form opened for {source_name}; Testing connection to {source_name}...; Connection test {result}: {detail}; Connected to {source_name} successfully; Sync started for {source_name}; Sync complete: {record_count} records in {duration}; Disconnected from {source_name}


### json-viewer

Collapsible JSON viewer with syntax highlighting, line numbers, copy-to-clipboard, and expandable/collapsible nodes. Used for inspecting registry content data on detail pages.

**Visual brief:** Code viewer panel with a header toolbar containing a title and a copy-to-clipboard button. The body displays syntax-highlighted JSON with color-coded keys (accent color), string values (green), numbers (blue), booleans (orange), and null (muted). Collapsible nodes show expand/collapse chevron icons next to objects and arrays, with an item count badge when collapsed (e.g., '{3}' or '[5]'). Line numbers appear in a left gutter column. The inline preset removes the header and renders JSON inline with reduced formatting. The diff preset highlights additions in green background and removals in red background.

**Components:** Button, icon

**Layout slots:**
- `footer`: Optional footer with byte size and node count
- `header`: Toolbar row with title, expand/collapse all toggle, and copy-to-clipboard Button
- `json-content`: Syntax-highlighted JSON with collapsible nodes. Keys in _fgprimary, strings in _fgsuccess, numbers in _fgwarning, booleans in _fgdestructive
- `line-numbers`: Gutter column with line numbers, _fgmuted _textxs _mono
  **Layout guidance:**
  - syntax: Syntax highlighting using theme accent colors: strings=amber, numbers=cyan, keys=coral, booleans=green.
  - toolbar: Header bar: title (filename or 'Preview') left, Copy button (ghost) right. Language badge if applicable.
  - viewer_treatment: Use lum-code-block: dark bg (#111113 or var(--d-surface)) with colored top border (2px, accent). Monospace font. Line numbers in text-muted.
**Responsive:**
- **Mobile (<640px):** Full-width viewer with horizontal scroll for deeply nested content. Nodes default to collapsed beyond depth 2. Copy button prominently placed.
- **Tablet (640-1024px):** Standard viewer width. Nodes expand to depth 3 by default.
- **Desktop (>1024px):** Full viewer with comfortable width. All nodes expandable. Horizontal space accommodates deep nesting without scroll.


---

## Pages

### sources (/sources)

Layout: data-source-connector

### source-detail (/sources/:id)

Layout: data-source-connector → json-viewer

### connections (/connections)

Layout: data-source-connector
