# Section: vod-review

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** vod-review
**Description:** Auxiliary esports VOD review surface for browsing a library of match recordings and annotating frames with coaching notes and timestamps.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (vods, vod-detail)
**Key patterns:** data-table [moderate], card-grid [moderate], vod-annotator [moderate], timeline [moderate]
**CSS classes:** `.gg-dark`, `.gg-hero`, `.gg-sidebar`, `.neon-glow`
**Density:** comfortable
**Voice:** Competitive and operational.

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
| `--d-text` | `#E8EDF5` | Body text, headings, primary content |
| `--d-border` | `#2A2A40` | Dividers, card borders, separators |
| `--d-primary` | `#60A5FA` | Brand color, key interactive, selected states |
| `--d-surface` | `#111118` | Cards, panels, containers |
| `--d-bg` | `#0A0A0F` | Page canvas / base layer |
| `--d-text-muted` | `#8888AA` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#93C5FD` | Hover state for primary elements |
| `--d-surface-raised` | `#1A1A25` | Elevated containers, modals, popovers |
| `--d-accent` | `#a855f7` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.gg-dark` | Near-black background (#0A0A0F) with subtle grid pattern. |
| `.gg-hero` | Hero with animated gradient background. |
| `.gg-sidebar` | Dark sidebar with accent-colored active states. |
| `.gg-slide-in` | Entrance: slide from left with slight bounce. |
| `.gg-neon-glow` | Neon glow effect behind hero elements. |
| `.gg-rank-badge` | Rank position with metallic gradient (gold/silver/bronze). |
| `.gg-stat-pulse` | Stats with subtle pulse animation. |
| `.gg-achievement-shine` | Achievement cards with shine animation on hover. |

**Spatial hints:** Density bias: -1. Section padding: 64px. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface gaming-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

vod-review, annotations

---

## Visual Direction

**Personality:** Professional esports team operations hub with vibrant neon-accented rosters and live scoreboards. Player form trackers show sparklines of K/D ratios, win rates, and self-reported mood indicators. Scrim calendars map team availability to opponent windows. VOD review interface with frame-by-frame annotations and drawing tools. Sponsor dashboards track activation metrics. Think Overwatch League backstage. Lucide icons. Competitive.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

## Pattern Reference

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


### vod-annotator

A video-on-demand playback surface with timeline annotation flags, drawing overlay tools, tag filtering, and replay markers for esports coaching review.

**Visual brief:** A dark-background coaching surface. Large 16:9 video player at top with standard playback controls (play/pause, scrub, time, speed, volume, fullscreen) overlaid at bottom of the video on hover. A transparent drawing overlay sits atop the video, enabled by toolbar toggle, allowing arrows, circles, rectangles, and freehand lines in brand-accent colors. Directly below the player, an annotation timeline strip spans full width with colored marker flags planted at annotation timestamps (color encodes tag type: red=mistake, green=highlight, blue=rotation, purple=teamfight, amber=objective). Hovering a flag reveals a mini-preview thumbnail and annotation text. A horizontal tag chip rail below timeline acts as filters — click a chip to hide/show flag types. Each annotation in the list has a replay button that jumps to that timestamp and loops the moment. Commenter avatars appear as small circles on each flag showing who created it.

**Components:** VideoPlayer, AnnotationTimeline, DrawingOverlay, MarkerFlag, TagChip, ReplayButton

**Composition:**
```
MarkerFlag = Flag(d-interactive, tag-colored) > [FlagIcon + AuthorAvatar + PreviewOnHover]
VideoPlayer = Player(aspect-16-9) > [Video + Overlays + Controls(scrub, play, speed, vol, fs)]
VodAnnotator = Section(d-section) > [VideoPlayer(16:9) > [VideoElement + DrawingOverlay + PlaybackControls] + AnnotationTimeline > MarkerFlag[] + TagChipRail > TagChip[] + AnnotationList > AnnotationEntry[] > [Timestamp + TagBadge + AuthorAvatar + NoteText + ReplayButton]]
DrawingOverlay = SVG(layered, toggleable) > DrawLayer(arrows, shapes, freehand)
AnnotationTimeline = Strip(horizontal, scrub-synced) > [TimelineTrack + MarkerFlag[] + Playhead]
```

**Layout slots:**
- `steps`: Numbered steps (step number, title, description)
  **Layout guidance:**
  - note: Video player must be 16:9 aspect. Drawing overlay must be toggleable to avoid interfering with scrub controls.
  - container: d-section
  - tag_colors: Tag color semantics must stay consistent across annotations: mistake=red, highlight=green, rotation=blue, teamfight=purple, objective=amber.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| flag-hover | marker scale(1.3) + preview thumbnail slide-up 180ms ease-out |
| chip-toggle | chip opacity dim when disabled 150ms |
| seek-jump | playhead smooth-scrub 300ms ease-in-out |
| drawing-draw | stroke path draw-in with follow-cursor immediate |
| playhead-pulse | timeline playhead subtle glow pulse 2s ease-in-out infinite while playing |

**Responsive:**
- **Mobile (<640px):** Tag chip rail scrolls horizontally. Drawing tools move to bottom action sheet. Multi-angle collapses to single view with tab switcher.
- **Tablet (640-1024px):** Standard layout retained. Timeline marker size reduced.

**Accessibility:**
- Role: `application`
- Keyboard: Space: play/pause video; J / L: seek back/forward 5s; M: mute; F: fullscreen; N: create new annotation at current timestamp; D: toggle drawing overlay; Arrow Left/Right: previous/next annotation
- Announcements: Annotation at {timestamp}: {tag} by {author}; Filter {tag} {enabled|disabled}


### timeline

Chronological sequence of events with dates, descriptions, and optional media.

**Visual brief:** Vertical sequence of timeline entries connected by a thin vertical line. Each entry has a small circle dot on the line, a date or timestamp label, an event title in medium weight, and a description paragraph. Optional media (images, icons) can appear beside entries. The compact preset reduces spacing and hides descriptions, showing only date and title. The horizontal preset arranges entries left-to-right along a horizontal line with dates below and content above. Milestone entries may have a larger dot or distinct icon.

**Components:** Card, Badge, icon, Text

**Layout slots:**
**Responsive:**
- **Mobile (<640px):** Vertical timeline only. Line on the left edge with content to the right. Dates above entries. Compact spacing.
- **Tablet (640-1024px):** Standard vertical timeline with comfortable spacing. Content beside the timeline dots.
- **Desktop (>1024px):** Full vertical or horizontal timeline. Entries alternate left and right of the center line (vertical) or spread evenly (horizontal).


---

## Pages

### vods (/vods)

Layout: data-table → card-grid

### vod-detail (/vods/:id)

Layout: vod-annotator → timeline
