# Section: track-library

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** track-library
**Description:** Producer track catalog with searchable table of finished and in-progress tracks plus a per-track detail view with waveform preview and version history.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (tracks, track-detail)
**Key patterns:** search-filter-bar [moderate], data-table [moderate], waveform-track [moderate], version-history
**CSS classes:** `.studio-beat`, `.studio-knob`, `.studio-rack`, `.neon-glow`
**Density:** comfortable
**Voice:** Creative and technical.

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
| `--d-text` | `#E0E7FF` | Body text, headings, primary content |
| `--d-accent` | `#D946EF` |  |
| `--d-border` | `#4338CA` | Dividers, card borders, separators |
| `--d-primary` | `#22D3EE` | Brand color, key interactive, selected states |
| `--d-surface` | `#2A2565` | Cards, panels, containers |
| `--d-secondary` | `#D946EF` | Secondary brand color, supporting elements |
| `--d-bg` | `#1E1B4B` | Page canvas / base layer |
| `--d-text-muted` | `#A5B4FC` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#E879F9` |  |
| `--d-primary-hover` | `#06B6D4` | Hover state for primary elements |
| `--d-surface-raised` | `#332E80` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#C026D3` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.studio-beat` | Beat grid lines with subdivision markers for timeline and arrangement views. |
| `.studio-knob` | Circular control knobs with cyan indicator and rotational value display. |
| `.studio-rack` | Equipment rack styling with 1U slot dividers and industrial metal aesthetic. |
| `.studio-wave` | Cyan waveform displays with glowing stroke and animated playhead. Audio visualization aesthetic. |
| `.studio-meter` | VU meter styling with gradient fill from cyan through yellow to magenta at peak. |
| `.studio-channel` | Vertical channel strips with fader, meter, and knob stack. Mixing console layout. |
| `.studio-glow-cyan` | Cyan glow effects on active elements using box-shadow and text-shadow. |
| `.studio-glow-magenta` | Magenta glow on peaks, alerts, and secondary highlights. |

**Compositions:** **daw:** Digital audio workstation with track arrangement, mixer view, and transport controls.
**mixer:** Mixing console with channel strips, busses, and master section.
**library:** Sample library browser with waveform previews and tag filtering.
**marketing:** Music production marketing with waveform visuals and electric color palette.
**Spatial hints:** Density bias: 1. Section padding: 32px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface studio-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

track-management, versions

---

## Visual Direction

**Personality:** Electric music production workspace with cyan waveforms pulsing across deep purple canvases. Multi-track DAW layout with stem-stack channel strips, meter bars glowing on transients, and automation lanes curving below. Split-royalty calculators with real-time percentage validation. Live session rooms with voice chat and collaborative scrubbing. Think Ableton meets Splice. Lucide icons. Electric.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

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


### waveform-track

Audio waveform track displaying regions, automation lanes, gain control, and beat grid for DAW-style audio editing interfaces.

**Visual brief:** A horizontal track row approximately 96px tall (track preset). Track header on the left (160px fixed width) contains: track name in semibold 13px, mute/solo/arm circular buttons (24px each) in a row, and a horizontal gain slider with dB value display. Track header has subtle border-right separating it from the waveform. Waveform canvas fills remaining horizontal space rendering symmetrical amplitude envelope: mirrored above and below horizontal centerline in accent color (e.g. blue for audio, green for synth), against a muted background. Regions appear as colored semi-transparent rectangles overlaid on the waveform with 2px colored borders and clip names in 11px text at top-left. Beat grid lines run vertically through the waveform at BPM-synced intervals (1px, subtle muted color, brighter on bar lines). Automation lanes (optional, 32px tall each) stack below the main waveform showing parameter curves (volume, pan) as line graphs with draggable node points. Hovering on the waveform shows a vertical playhead indicator and timecode tooltip.

**Components:** WaveformCanvas, RegionBlock, AutomationLane, GainSlider, TrackHeader, MuteSolo

**Composition:**
```
RegionBlock = Overlay(absolute, d-interactive) > [ClipName + TrimHandles + FadeCurves]
TrackHeader = Column(d-control) > [TrackName + MuteSoloArm + GainSlider]
WaveformArea = Container > [WaveformCanvas + RegionBlock* + BeatGrid + AutomationLane*]
WaveformTrack = Root(d-surface, flex-row) > [TrackHeader + WaveformArea]
```

**Layout slots:**
- `fields`: Form fields (name, email, message, etc.)
- `submit`: Submit button
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| gain-drag | slider follows pointer at 60fps with real-time dB update |
| mute-solo-toggle | button color transition 150ms + ripple on click |
| region-add | region scale-in + fade 200ms spring |
| automation-node-drag | curve reshape 16ms per frame during drag |
| active-playback | vertical playhead line moves continuously across waveform at playback rate |
| armed-recording-pulse | arm button red pulse 1s ease-in-out infinite when recording |

**Responsive:**
- **Mobile (<640px):** Track header collapses to 64px with icon-only controls. Gain slider becomes popover. Automation lanes hidden; toggle to view. Waveform height reduces to 56px.
- **Tablet (640-1024px):** Standard layout with condensed track name. Full mute/solo/arm visible.
- **Desktop (>1024px):** Full 96px track with all automation lanes expanded and hover interactions.

**Accessibility:**
- Role: `region`
- Keyboard: M: toggle mute on focused track; S: toggle solo on focused track; R: toggle record-arm on focused track; Up/Down: adjust gain 1dB; Shift+Up/Down: adjust gain 0.1dB; Delete: remove focused region
- Announcements: Track {name} gain set to {value} dB; Track {name} {muted|soloed|armed}; Region {name} added at {timestamp}


### version-history

Document revision timeline with version preview, diff view, and restore functionality. Shows auto-saves and named checkpoints.

**Visual brief:** Sidebar or modal panel showing a chronological list of document versions grouped by date. Each version entry shows a timestamp, an auto-save or named-checkpoint label, the author avatar and name, and a brief summary of changes. Selecting a version shows a preview of the document at that point. A compare toggle enables diff view between the selected version and the current or another version. A 'Restore' button allows reverting to the selected version with a confirmation dialog. The sidebar preset renders as a right-side panel. The modal preset opens as a centered modal. The compact preset shows a condensed timeline with fewer details.

**Components:** Avatar, Button, icon

**Composition:**
```
DiffView = Panel(d-surface, split) > [OldContent + NewContent(highlighted-changes)]
VersionList = List(d-data, flex-col) > VersionEntry[]
VersionEntry = Row(d-data-row, hoverable, active?: selected) > [Avatar(small) + EntryInfo > [AuthorName(font-medium) + Timestamp(text-muted, mono-data)] + VersionLabel?(d-annotation) + RestoreButton?(d-interactive)]
VersionHistory = Panel(d-section, flex-col) > [VersionList + DiffView?]
```

**Layout slots:**
- `header`: Panel header with close button
- `actions`: Restore and compare buttons
- `timeline`: Chronological version list
**Responsive:**
- **Mobile (<640px):** Version history opens as a full-screen overlay. Timeline entries are compact. Preview replaces the timeline view (back button to return). Restore button at the bottom.
- **Tablet (640-1024px):** Sidebar at 320px width with timeline and inline preview. Compare mode uses a bottom sheet.
- **Desktop (>1024px):** Sidebar with timeline, adjacent preview panel, and inline diff view. Full author details and change summaries visible.


---

## Pages

### tracks (/tracks)

Layout: search-filter-bar → data-table

### track-detail (/tracks/:id)

Layout: waveform-track → version-history
