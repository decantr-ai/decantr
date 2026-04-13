# Section: registry-browser

**Role:** primary | **Shell:** top-nav-main | **Archetype:** registry-browser
**Description:** Public content browsing for a design registry. Search, filter, and explore patterns, themes, blueprints, archetypes, and shells.

## Quick Start

**Shell:** Horizontal navigation bar with full-width main content below. Used by ecommerce (storefront), portfolio, content-site. (header: 52px)
**Pages:** 5 (homepage, browse, browse-type, detail, profile)
**Key patterns:** search-filter-bar [moderate], content-card-grid [moderate], kpi-grid, content-detail-hero [moderate], json-viewer, detail-header [moderate], activity-feed
**CSS classes:** `.lum-orbs`, `.lum-brand`, `.lum-glass`
**Density:** comfortable
**Voice:** Welcoming and developer-friendly.

## Shell Implementation (top-nav-main)

### body

- **gap:** 1rem
- **flex:** 1
- **note:** Full-width scrollable content area below the nav bar.
- **atoms:** _flex _col _gap4 _p6 _overflow[auto] _flex1
- **padding:** 1.5rem
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
- **padding:** 0 1.5rem
- **nav_links:** Nav links use text-sm font-medium with no background. Hover: text color transitions to primary. Active: font-semibold or underline-offset-4.
- **background:** var(--d-bg)
- **left_content:** Brand/logo link
- **button_sizing:** Buttons and CTAs in the header must use compact sizing: py-1.5 px-4 text-sm (not the default d-interactive padding). The header is 52px — buttons should be ~32px tall, not 40px+.
- **right_content:** Theme toggle (sun/moon icon, toggles light/dark class on html element) + Search trigger + CTA button or user avatar. Theme toggle uses a simple icon button — no dropdown.
- **center_content:** Nav links — flex with gap 1.5rem

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Spacing Guide

| Context | Token | Value | Usage |
|---------|-------|-------|-------|
| Content gap | `--d-content-gap` | `1rem` | Gap between sibling elements |
| Section padding | `--d-section-py` | `7.5rem` | Vertical padding on d-section |
| Surface padding | `--d-surface-p` | `1.25rem` | Inner padding for d-surface |
| Interactive V | `--d-interactive-py` | `0.5rem` | Vertical padding on buttons |
| Interactive H | `--d-interactive-px` | `1rem` | Horizontal padding on buttons |
| Control | `--d-control-py` | `0.5rem` | Vertical padding on inputs |
| Data row | `--d-data-py` | `0.625rem` | Vertical padding on table rows |
| Label gap | `--d-label-mb` | `0.75rem` | Gap below d-label section headers |
| Label indent | `--d-label-px` | `0.75rem` | Anchor indent for d-label[data-anchor] |
| Section gap | `--d-section-gap` | `1.5rem` | Gap between adjacent d-sections |
| Annotation gap | `--d-annotation-mt` | `0.5rem` | Top margin on d-annotation |

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Key palette tokens:**

| Token | Value | Role |
|-------|-------|------|
| `--d-cyan` | `#0AF3EB` |  |
| `--d-pink` | `#FE4474` |  |
| `--d-text` | `#FAFAFA` | Body text, headings, primary content |
| `--d-amber` | `#FDA303` |  |
| `--d-coral` | `#F58882` |  |
| `--d-green` | `#00E0AB` |  |
| `--d-border` | `#2E2E2E` | Dividers, card borders, separators |
| `--d-orange` | `#FC8D0D` |  |
| `--d-purple` | `#6500C6` |  |
| `--d-yellow` | `#FCD021` |  |
| `--d-crimson` | `#D80F4A` |  |
| `--d-primary` | `#FE4474` | Brand color, key interactive, selected states |
| `--d-surface` | `#1E1E1E` | Cards, panels, containers |
| `--d-bg` | `#141414` | Page canvas / base layer |
| `--d-text-muted` | `#A1A1AA` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#FF5C8A` | Hover state for primary elements |
| `--d-surface-raised` | `#262626` | Elevated containers, modals, popovers |
| `--d-accent` | `#FDA303` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.lum-orbs` | Breathing gradient orbs behind hero/feature sections. Large radial gradients in primary/secondary/accent at 15-22% opacity, slowly pulsing and drifting. |
| `.lum-brand` | Brand text with accent color on punctuation (e.g. 'decantr.ai' with coral period and 'i'). |
| `.lum-glass` | Subtle glass panel (dark: rgba(255,255,255,0.03), light: rgba(0,0,0,0.02)) with soft border. No heavy blur — clean transparency. |
| `.lum-canvas` | Particle network background (dark: #141414, light: #FAFAF9). Scattered small dots and thin connecting lines in brand colors at low opacity. Apply to page root. |
| `.lum-divider` | Section divider: thin horizontal line with centered colored dot. Dot color matches the next section's accent. |
| `.lum-fade-up` | Scroll-reveal animation: fade in + translate up 24px over 0.6s. |
| `.lum-particles` | Fixed-position small dots (2-8px) in brand colors scattered across the viewport at 15% opacity with subtle pulse animation. |
| `.lum-stat-glow` | Number badge with filled circle in accent color, contrasting text inside. |
| `.lum-code-block` | Code block (dark: #111113, light: #F5F5F4) with colored top border (2px) matching section accent. Monospace font, syntax highlighting. |
| `.lum-card-vibrant` | Filled card with vibrant gradient background, white text, corner accent brackets. |
| `.lum-card-outlined` | Outlined card with colored border stroke, transparent bg, colored heading. The stroke color comes from the section's accent. |

**Preferred:** kpi-grid
**Compositions:** **hero:** Split hero with large logo (1/3) and content (2/3). Canvas bg with breathing gradient orbs behind. Logo floats gently.
**pipeline:** Grid of outlined cards showing process steps. Each card has a different accent color stroke with numbered badge.
**tool-list:** Two-column list with colored dot bullets and colored left border stripes on hover.
**feature-grid:** Grid of vibrant filled cards with corner brackets. Each card a different brand color.
**Spatial hints:** Density bias: none. Section padding: 120px. Card wrapping: minimal.


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


### content-card-grid

Responsive grid of registry content cards with type badges, namespace indicators, version info, and quick-action buttons. Used for browsing patterns, themes, blueprints, and other registry items.

**Visual brief:** Responsive grid of bordered cards, each representing a registry content item. Card header shows a color-coded type badge (pattern in blue, theme in purple, blueprint in green) and a namespace badge (@official, @community). Card body displays the content name as a clickable link heading, a two-line description in muted text, and a meta row with version number, download count icon, and last-updated date. Card footer contains quick-action buttons (copy JSON, use in project). Compact preset reduces card height by hiding description. Editable preset adds edit and delete actions.

**Components:** Card, CardHeader, CardBody, CardFooter, Badge, Button, icon

**Composition:**
```
ContentCard = Card(d-surface, hoverable) > [CardHeader > [TypeBadge(d-annotation, color-coded) + NamespaceBadge(d-annotation)] + CardBody > [Title(heading4, clickable) + Description(text-muted, line-clamp-2)] + CardFooter > [Version(mono-data) + DownloadCount + UpdatedAt(text-muted)]]
EditableCard = ContentCard > CardFooter > [EditButton(d-interactive) + DeleteButton(d-interactive, variant: destructive)]
ContentCardGrid = Grid(d-section, responsive: 1/2/3-col) > ContentCard[]
```

**Layout slots:**
- `card-meta`: Version number, download count, and updated-at in CardFooter
- `card-title`: Content name with _heading4 styling, clickable link to detail
- `card-namespace`: Namespace badge (@official/@community/@org) inline with type
- `card-type-badge`: Type badge (pattern/theme/blueprint) with color-coded variant in CardHeader
- `card-description`: Short description with _bodysm _fgmuted, max 2 lines
  **Layout guidance:**
  - grid_layout: Responsive grid: 3 columns desktop, 2 tablet, 1 mobile. Gap: 1rem. Equal height cards per row.
  - card_content: Card shows: type badge (d-annotation) top-left, title (font-semibold), namespace-badge, one-line description, bottom row: version + download count + compatibility badge. Clean vertical stack with gap-2.
  - card_treatment: Each card uses lum-card-outlined: transparent bg, colored border-left (3px) by content type — coral for patterns, amber for themes, cyan for blueprints, green for shells. Hover: border-color intensifies + translateY(-2px) + subtle shadow.
**Responsive:**
- **Mobile (<640px):** Single-column card stack. Cards take full width. Quick actions use icon-only buttons. Description limited to one line.
- **Tablet (640-1024px):** Two-column grid. Standard card sizes with full descriptions visible.
- **Desktop (>1024px):** Three or four column grid depending on container width. Cards show all metadata and actions.


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


### content-detail-hero

Header section for content detail pages showing name, namespace, type, description, version history, and action buttons (copy JSON, use in project).

**Visual brief:** Full-width header section for a content detail page. A breadcrumb navigation trail sits at the top. Below it, type and namespace badges render inline. The content name appears as a large heading. A description paragraph follows in standard text. A meta row shows version, author name, and publish date separated by dots. An action button group on the right contains 'Copy JSON', 'Use in Project', and 'Share' buttons. Compact preset reduces vertical spacing and uses a single-line layout for badges and meta.

**Components:** Badge, Button, Chip, icon

**Composition:**
```
MetaRow = Row(d-data, gap-3) > [Version(mono-data) + Author + PublishDate(text-muted)]
BadgeRow = Row(gap-2) > [TypeChip(d-annotation, color-coded) + NamespaceBadge(d-annotation)]
ActionGroup = Row(d-interactive, gap-2) > [CopyJSONButton + UseButton(variant: primary) + ShareButton(variant: ghost)]
ContentDetailHero = Section(d-section, flex-col, gap-4, border-bottom) > [Breadcrumb + BadgeRow + Title(heading2) + Description(text-muted) + MetaRow + ActionGroup]
```

**Layout slots:**
- `title`: Content name with _heading2 styling
- `badges`: Horizontal row of type Chip and namespace Badge
- `meta-row`: Version, author, updated date, download count
- `breadcrumb`: Breadcrumb navigation: Registry > Type > Namespace > Slug
- `description`: Full description with _body _fgmuted
- `action-group`: Copy JSON Button, Use in Project Button, share icon
  **Layout guidance:**
  - actions: Right-aligned action buttons: Install (primary), Preview (ghost), Fork (ghost). Mobile: full-width stacked.
  - background: Subtle gradient matching content type color at 5-8% opacity, fading to var(--d-bg).
  - hero_layout: Full-width section with breadcrumb trail (type > namespace > slug). Large title (heading2) with namespace-badge inline. Metadata row: version, downloads, last updated, compatibility. For themes: live color swatch. For patterns: component count + slot summary.
**Responsive:**
- **Mobile (<640px):** Breadcrumb collapses to back-arrow + parent name. Badges and meta stack below the title. Action buttons go full-width stacked at the bottom.
- **Tablet (640-1024px):** Standard layout. Action buttons align right of the title. Breadcrumb shows full path.
- **Desktop (>1024px):** Full layout with action group floating right. All metadata and breadcrumb visible in one comfortable view.


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


---

## Pages

### homepage (/)

Layout: search-filter-bar → content-card-grid → kpi-grid

### browse (/browse)

Layout: search-filter-bar → content-card-grid

### browse-type (/browse/:type)

Layout: search-filter-bar → content-card-grid

### detail (/:type/:namespace/:slug)

Layout: content-detail-hero → json-viewer

### profile (/profile/:username)

Layout: detail-header → content-card-grid → activity-feed
