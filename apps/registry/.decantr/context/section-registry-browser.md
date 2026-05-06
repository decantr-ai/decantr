# Section: registry-browser

**Role:** primary | **Shell:** top-nav-main | **Archetype:** registry-browser
**Description:** Public content browsing for a design registry. Search, filter, and explore patterns, themes, blueprints, archetypes, and shells.

## Quick Start

**Shell:** Horizontal navigation shell with a compact sticky header, shared content insets, and a curated page-width rhythm. Used by public browsing, editorial catalog pages, and marketing-style registry surfaces. (header: 52px)
**Pages:** 5 (homepage, browse, browse-type, detail, profile)
**Key patterns:** blueprint-launch-hero, search-filter-bar [moderate], featured-launchpad-list, content-card-grid [moderate], json-viewer, detail-header [moderate], activity-feed
**Theme decorators:** 11 classes — see `section-registry-browser-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Welcoming and developer-friendly.

## Shell Implementation (top-nav-main)

### body

- **gap:** 1rem
- **flex:** 1
- **note:** Scrollable content area below the nav bar. Public registry pages should use a consistent page max-width rhythm inside this region instead of page-local guesses. When multiple editorial sections are stacked in the public registry shell, the shell owns inter-section spacing; do not stack shell gap on top of full default d-section padding.
- **atoms:** _flex _col _gap4 _p6 _overflow[auto] _flex1
- **padding:** clamp(1rem, 2vw, 1.5rem)
- **direction:** column
- **overflow_y:** auto

### root

- **atoms:** _flex _col _h[100vh]
- **height:** 100vh
- **display:** flex
- **direction:** column

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 clamp(1rem, 2vw, 1.5rem)
- **nav_links:** Nav links use text-sm font-medium with no background. Hover: text color transitions to primary. Active: font-semibold or underline-offset-4. Keep the visible label to the route name itself — if hotkeys are declared in the essence, treat them as keyboard bindings or command-palette hints, not inline nav text.
- **background:** var(--d-bg)
- **left_content:** Brand/logo link
- **button_sizing:** Buttons and CTAs in the header must use compact sizing: py-1.5 px-4 text-sm (not the default d-interactive padding). The header is 52px — buttons should be ~32px tall, not 40px+.
- **right_content:** Theme toggle (sun/moon icon, toggles light/dark class on html element) + Search trigger + CTA button or user avatar. Theme toggle uses a simple icon button — no dropdown.
- **center_content:** Nav links — flex with gap 1.5rem on tablet/desktop and gracefully reduced clutter on narrow widths

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: comfortable (--d-density-scale: 1)

## Shell Notes (top-nav-main)

- **Hotkeys:** When navigation hotkeys are declared in the essence, implement them as keyboard shortcuts or command-palette affordances. Do not append hotkey text to the persistent top navigation unless the route contract explicitly asks for visible shortcut hints.
- **Mobile Nav:** Below md, preserve brand + essential actions first and collapse or hide secondary links rather than squeezing the whole nav row.
- **Shell Spacing:** Header, body, and footer share the same horizontal inset rhythm. Public pages should feel like one shell system, not separate handcrafted blocks. Editorial registry surfaces should use a compact shell-owned section rhythm rather than layering shell gap, d-section padding, and sibling section margins all at once.

## Theme Reference

**Theme:** luminarum (dark) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 11 `luminarum-*` classes — full Class/Intent/Apply-to table in `section-registry-browser-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Compositions:** **hero:** Split hero with large logo (1/3) and content (2/3). Canvas bg with breathing gradient orbs behind. Logo floats gently.
**pipeline:** Grid of outlined cards showing process steps. Each card has a different accent color stroke with numbered badge.
**tool-list:** Two-column list with colored dot bullets and colored left border stripes on hover.
**feature-grid:** Grid of vibrant filled cards with corner brackets. Each card a different brand color.
**Spatial hints:** Density bias: none. Section padding: 7.5rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface luminarum-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — top-nav-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

search, pagination

---

## Visual Direction

**Personality:** Vibrant design intelligence registry. Warm coral and amber accents on a rich dark canvas (or crisp warm-white in light mode). Content cards are the hero — outlined with colored type borders, hovering with purpose. Search is instant and faceted. Publishing feels like sharing art. The Decantr dogfood app — built with its own system, proudly showing what the platform produces. Think Figma Community meets shadcn/ui registry.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### blueprint-launch-hero



**Components:** Button, Icon, Image

**Layout slots:**

### search-filter-bar

Search-first public registry filter bar with type tabs, a source filter, sort controls, and result count. Designed for builders browsing Decantr content, not for exposing internal registry-intelligence taxonomy.

**Visual brief:** Public registry filter bar with one clear purpose: help builders find the right Decantr starting point quickly. Search is the hero. Type tabs are distinct and color-coded. Source filtering is understandable to humans: Official, Community, Organizations. Sort remains available but visually secondary. The bar should feel premium, breathable, and unambiguous, not like an operator console.

**Components:** Input, Select, Button, Badge, Chip, icon

**Composition:**
```
MobileFilters = Surface(d-surface) > [SourceFilter + SortSelect]
SearchFilterBar = Stack > [SearchRow > SearchInput(d-control, icon: search) + TypeRow > TypeTabs(d-interactive)[] + MetaRow > [ResultCount + SourceFilter + SortSelect(d-control)]]
```

**Layout slots:**
- `meta-row`: Result count on the left, source filter and sort on the right
- `type-row`: Scrollable row of type tabs (All, Patterns, Themes, Blueprints, Archetypes, Shells)
- `search-row`: Search input with icon prefix
- `mobile-filters`: Collapsible mobile filter surface for source and sort
  **Layout guidance:**
  - filter_tabs: Type tabs should use distinct type-linked treatments so all-type browsing is easy to parse at a glance. The patterns icon should read like a puzzle-piece rather than a generic component glyph.
  - search_input: Full-width search input with magnifying glass icon. Placeholder should explicitly mention Decantr content types and app-starting intent.
  - sort_dropdown: Right-aligned sort with a restrained visual footprint. Keep sort available, but subordinate to search and content-type/source selection.
  - source_filter: Use human-facing source language: Official, Community, Organizations. Do not expose authored/benchmark/hybrid intelligence taxonomy here.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Tabs, chips, and filter controls may animate lightly on hover and selection, but search remains the dominant visual action. |
| transitions | Filter-surface expansion, chip removal, and result-state updates should animate over 150-240ms without making the bar feel operator-heavy. |

**Responsive:**
- **Mobile (<640px):** Search input full-width on its own row. Type tabs become a horizontal scrollable strip. Source and sort move into a collapsible filter surface instead of squeezing the main bar.
- **Tablet (640-1024px):** Search and filters fit comfortably in stacked rows. Type tabs remain visible. Source filter can stay inline if space allows.
- **Desktop (>1024px):** Search, type tabs, source filter, and sort remain visible without feeling like one dense toolbar. Result count stays readable but subdued.

**Accessibility:**
- Role: `search`
- Keyboard: Tab moves from search input to tabs to source and sort controls in logical order.; Arrow keys may move between tab-style filters when implemented as a tab list.
- Announcements: Active filters, source selection, and sort changes should be announced clearly.; Result count updates should remain available without depending on purely visual placement.
- Focus: Opening mobile filter surfaces should move focus into the filter panel and return it to the invoking control on close.


### featured-launchpad-list



**Components:** Card, Icon, Text

**Layout slots:**
- `grid`: Grid of feature cards (icon + title + description)
- `feature-card`: Individual feature with icon, heading, and description text

### content-card-grid

Responsive grid of registry content cards with optional thumbnail media, strong type identity, builder-friendly descriptions, and a clean source/version/date footer. Used for browsing patterns, themes, blueprints, archetypes, and shells. This pattern owns the card grid, not outer section spacing.

**Visual brief:** Responsive grid of bordered cards that feel editorial, calm, and app-forward. Each card can open with an optional 16:9 screenshot-style thumbnail. The title and description should dominate, with one distinct type chip acting as the only browse-card chip. The footer should feel like a clean authored source line rather than a metadata bucket: source first, then version, then date. If a showcase exists, its CTA should feel obvious and inviting. The overall impression should be curated and useful, not operator-heavy or diagnostic.

**Components:** Card, CardHeader, CardBody, CardFooter, Badge, Button, icon

**Composition:**
```
ContentCard = Card(d-surface, hoverable) > [Thumbnail(optional, 16:9) + TitleRow > [Title(heading4, clickable) + TypeChip(d-annotation, color-coded)] + Description(text-muted, line-clamp-3) + Footer > [SourceLine(mono-data) + Version + PublishDate + ShowcaseAction(optional)]]
EditableCard = ContentCard > FooterSecondary > [StatusBadge + EditButton(d-interactive) + DeleteButton(d-interactive, variant: destructive)]
ContentCardGrid = Grid(d-data, responsive: 1/2/3-col) > ContentCard[]
```

**Layout slots:**
- `card-cta`: One optional showcase CTA with external-link affordance
- `card-meta`: Friendly source line, version, and publish date
- `card-media`: Optional full-width 16:9 thumbnail image. Only render when the content item has an uploaded registry thumbnail.
- `card-title-row`: Title on the left with one color-coded type chip on the right
- `card-description`: Short description with _bodysm _fgmuted, max 3 lines
  **Layout guidance:**
  - grid_layout: Responsive grid: 3 columns desktop, 2 tablet, 1 mobile. Gap: 1rem. Equal-height cards per row. Avoid visual density spikes between cards with thumbnails and cards without thumbnails. Parent workspace layout owns any spacing between this grid and sibling filters, intros, or empty-state lead surfaces.
  - card_content: Do not use browse-card trust chips. Keep only the type chip. The footer should carry the source line first, then version, then date. Showcase CTA should sit clearly below that row when present.
  - card_treatment: Each card uses lum-card-outlined with a type-linked accent and optional media frame. Hover should feel subtle but premium: border intensifies, card lifts slightly, and shadows deepen without turning noisy.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Cards may lift slightly and intensify their border treatment on hover. Showcase CTAs should respond clearly on hover and focus without overwhelming the card. |
| transitions | Filter and sort changes should cross-fade or stagger cards in gently over 180-260ms. Thumbnail appearance should feel polished but restrained. |

**Responsive:**
- **Mobile (<640px):** Single-column card stack. Cards take full width, thumbnails remain 16:9, descriptions show up to three lines, and the footer/source line wraps naturally without overflow.
- **Tablet (640-1024px):** Two-column grid. Thumbnails, title, description, and footer all remain readable without crowded chip rows.
- **Desktop (>1024px):** Three or four column grid depending on container width. Cards feel airy and selective, with one type chip, generous description room, and a clear showcase CTA when present.

**Accessibility:**
- Role: `region`
- Keyboard: Tab should move through cards and showcase CTAs in reading order.; If the whole card is clickable, expose one clear primary interaction target.
- Announcements: Card title, source line, and showcase availability should be available to assistive technology without depending on hover.
- Focus: Focused cards should receive an obvious treatment equivalent to hover, and nested CTAs should remain distinct from the card container.


### json-viewer

Artifact viewer for registry contracts with syntax highlighting, line numbers, copy actions, summary metrics, and optional tabs for JSON, commands, and evidence.

**Visual brief:** A premium contract viewer panel with the feel of a polished shadcn-style code surface, but expressed through Decantr treatments and decorators. The header is compact and editorial: title on the left, a small metadata strip in the middle, and copy actions on the right. Every section inside the frame shares a consistent horizontal inset so the title, tabs, cards, and footer read as one curated artifact surface instead of touching the border. Below the header, a segmented tab control can switch between JSON, Commands, and Evidence views. The JSON body uses a stronger `lum-code-block` treatment with an accent top border, subdued line-number gutter, and vivid but restrained syntax colors. The whole panel should feel like a trustworthy artifact explorer, not just a raw textarea dump.

**Components:** Button, icon

**Composition:**
```
Tabs = SegmentedControl(d-interactive) > [JsonTab + CommandsTab + EvidenceTab]
Toolbar = Row(d-data, compact) > [Title + SummaryBadges + ActionButtons]
JsonPane = CodeRegion(mono, syntax-highlighted) > [LineNumbers + JsonTree]
SummaryStrip = Row(d-annotation, compact) > [Lines + Bytes + Schema + RootKeys]
ArtifactViewer = Panel(lum-code-block, stack, padded-frame) > [Toolbar + Tabs + SummaryStrip + JsonPane + Footer]
```

**Layout slots:**
- `tabs`: Segmented tab strip for JSON, Commands, and Evidence views with the same horizontal inset as the toolbar
- `footer`: Optional footer with copy confirmation, notes, or schema guidance
- `header`: Toolbar row with artifact title, summary badges, and copy-to-clipboard Button. Maintain a shared horizontal inset so title and actions never sit flush against the frame.
- `json-content`: Syntax-highlighted JSON with collapsible nodes. Keys in _fgprimary, strings in _fgwarning, numbers in _fgsuccess, booleans in _fgaccent
- `line-numbers`: Gutter column with line numbers, _fgmuted _textxs _mono
- `summary-strip`: Compact metadata row with line count, byte size, schema id, or root key count
  **Layout guidance:**
  - syntax: Syntax highlighting uses theme-accented colors: keys=coral, strings=amber, numbers=cyan, booleans=green, null=muted.
  - toolbar: Header bar: title on the left, summary metrics in the middle, and copy/secondary actions on the right. A small segmented tab strip may sit directly beneath or inside the toolbar. Keep a shared x-axis inset across toolbar, tabs, content, and footer.
  - artifact_summary: Always surface a few useful stats before the raw JSON: line count, byte size, schema id, root key count, or command availability. Summary chips should feel tucked into the frame, not pressed against the edge.
  - viewer_treatment: Use lum-code-block or an equivalent artifact treatment with a dark body, an accent top border, and a compact toolbar. The code panel should feel purposeful and premium, not like a default developer console. The outer frame owns the inset rhythm for every inner band.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Copy actions, tab switches, and collapsible node toggles may animate subtly over 120-180ms. Avoid flashy motion inside code surfaces. |
| transitions | Tab and artifact-state changes should cross-fade or slide minimally so the viewer remains trustworthy and stable. |

**Responsive:**
- **Mobile (<640px):** Full-width viewer with horizontal scroll for deeply nested content. Tabs collapse into a compact segmented control, but the frame still keeps a small internal gutter. Nodes default to collapsed beyond depth 2 and summary metrics wrap into two rows.
- **Tablet (640-1024px):** Standard viewer width with a compact tab strip. Nodes expand to depth 3 by default and summary metrics stay visible without overwhelming the header.
- **Desktop (>1024px):** Full viewer with comfortable width. Tabs, summary metrics, and copy actions all remain visible. Horizontal space accommodates deep nesting without crowding.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves through tabs, copy actions, and expandable nodes.; Arrow keys may navigate tree nodes when the JSON body is rendered as an interactive tree.
- Announcements: Copy success and tab changes should be announced clearly.; Artifact summary metrics should be available before the raw JSON body.
- Focus: Keep focus stable when switching tabs or copying values, and do not drop keyboard users into the middle of a deep JSON tree unexpectedly.


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
  **Layout guidance:**
  - status_badge: Status indicators should read as supporting metadata and wrap gracefully below the title on narrow widths.
  - action_balance: Action controls should support the title rather than overpower it. Keep the title as the primary visual anchor and use compact buttons for secondary actions.
  - shell_alignment: Treat detail-header as a section that sits inside the shell rhythm. It should not recreate shell-level page-width wrappers or duplicate breadcrumb bars already owned by the shell.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Action buttons may use subtle hover and focus transitions. Status badges should remain visually stable rather than animate heavily. |
| transitions | Detail headers can fade up softly with the page container, but avoid dramatic motion that competes with the title hierarchy. |

**Responsive:**
- **Mobile (<640px):** Breadcrumb collapses to back arrow with parent name. Action buttons move below the title and stack full-width. Status badge wraps below the title on its own line.
- **Tablet (640-1024px):** Standard layout. Actions remain inline right of title. Breadcrumb shows full path.
- **Desktop (>1024px):** Full header with all elements comfortably positioned. Generous whitespace above and below.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves through breadcrumbs and action buttons in reading order.
- Announcements: The page title should be announced before supporting metadata and actions.
- Focus: If a route change lands at a detail header, keep the heading reachable as an early focus destination and ensure breadcrumb links remain semantically distinct from actions.


### activity-feed

Chronological list of activity events with avatars, timestamps, and action descriptions. The feed owns its rows and grouping, not the outer section spacing around it.

**Visual brief:** Vertical timeline of activity events grouped by date. Each date group starts with a muted, small-text date header. Individual feed items are horizontal rows: a circular avatar (with fallback initials) on the left, then a content block with the user name in medium-weight text followed by the action description in normal weight, and a relative timestamp (e.g. '2h ago') in small muted text right-aligned or below. Items are separated by subtle dividers or spacing. The compact preset drops avatars and uses small type-indicator icons instead. The detailed preset wraps each item in a bordered card with attachment previews and action buttons (reply, like).

**Components:** Avatar, Badge, Button

**Composition:**
```
FeedItem = Row(d-data-row, hoverable) > [Avatar(fallback-initials) + Content(flex-col) > [UserName(font-medium) + ActionText] + Timestamp(mono-data, text-xs, text-muted)]
DateGroup = Group(d-data) > [DateHeader(d-annotation, text-muted) + FeedItem[]]
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

**Accessibility:**
- Role: `feed`
- Keyboard: Tab moves through feed items and inline actions in chronological order.; Load-more controls remain reachable after the newest visible group.
- Announcements: New activity items should be announced without rereading the full feed.; Date group headers should remain semantically distinct from entries.
- Focus: Do not steal focus when new events arrive. Preserve the reader's current position unless they explicitly choose to jump to the latest item.


---

## Pages

### homepage (/)

Layout: blueprint-launch-hero → search-filter-bar → featured-launchpad-list → launchpad-flow → registry-link-list

### browse (/browse)

Layout: search-filter-bar → content-card-grid

### browse-type (/browse/:type)

Layout: search-filter-bar → content-card-grid

### detail (/:type/:namespace/:slug)

Layout: blueprint-launch-hero → command-rail → blueprint-anatomy → contract-explorer → json-viewer

### profile (/profile/:username)

Layout: detail-header → content-card-grid → activity-feed
