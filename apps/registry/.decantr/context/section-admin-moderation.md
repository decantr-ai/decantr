# Section: admin-moderation

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** admin-moderation
**Description:** Admin moderation queue for reviewing, approving, and rejecting community-submitted registry content.

## Quick Start

**Shell:** Responsive sidebar shell with a desktop split layout, a compact sticky header, and an overlay drawer below the md breakpoint. Used by dashboards, account workspaces, and admin operations surfaces. (nav: 240px, header: 52px)
**Pages:** 7 (moderation-queue, commercial-reports, organizations, organization-detail, moderation-detail, telemetry, telemetry-usage)
**Key patterns:** search-filter-bar [moderate], moderation-queue-item [complex], kpi-grid, activity-feed, content-card-grid [moderate], detail-header [moderate], content-detail-hero [moderate], json-viewer
**Theme decorators:** 11 classes — see `section-admin-moderation-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Welcoming and developer-friendly.

## Shell Implementation (sidebar-main)

### body

- **flex:** 1
- **note:** Sole scroll container. Page content renders directly here. No wrapper div around outlet. Inner sections should inherit the shell rhythm rather than redefining page padding.
- **atoms:** _flex1 _minh0 _overauto _p6
- **padding:** clamp(1rem, 2vw, 1.5rem)
- **overflow_y:** auto

### root

- **atoms:** _flex _h[100vh] _overhidden
- **height:** 100vh
- **display:** flex
- **direction:** row

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 clamp(1rem, 2vw, 1.5rem)
- **left_content:** Breadcrumb — omit segment when it equals page title
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Theme toggle (sun/moon icon) + Search/command trigger + mobile navigation toggle when the sidebar is in drawer mode. Theme toggle toggles light/dark class on html element.

### sidebar

- **nav:**
  - flex: 1
  - note: This is the sidebar's only scroll region. The footer remains pinned below it.
  - padding: 0.5rem
  - item_gap: 2px
  - group_gap: 0.5rem
  - overflow_y: auto
  - item_content: icon (16px) + label text. Collapsed: icon only, text hidden.
  - item_padding: 0.375rem 0.75rem
  - item_treatment: d-interactive[ghost]
  - group_header_treatment: d-label
- **atoms:** _flex _col _br[1px_solid_var(--d-border)] _minh0
- **brand:**
  - align: center
  - border: bottom
  - height: 52px
  - content: Logo/brand + collapse toggle. Collapsed rail: center the toggle and omit extra brand copy if it no longer fits cleanly.
  - display: flex
  - padding: 0 1rem
- **width:** 240px
- **border:** right
- **footer:**
  - border: top
  - content: Workspace identity summary + sign-out control. The label should reuse the shared workspace identity and tier presentation rather than recomputing a separate fallback string inside the sidebar.
  - padding: 0.5rem
  - position_within: bottom (mt-auto)
- **position:** left
- **direction:** column
- **background:** var(--d-surface)
- **collapsed_width:** 64px
- **mobile_behavior:** Overlay drawer below md. Closed state occupies no layout width. Open state uses a fixed panel + scrim.
- **collapse_breakpoint:** md

### main_wrapper

- **flex:** 1
- **atoms:** _flex _col _flex1 _minh0 _overhidden
- **overflow:** hidden
- **direction:** column

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label[data-anchor]` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Left accent border anchor (data-anchor variant)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: compact (--d-density-scale: 0.65)

## Shell Notes (sidebar-main)

- **Hotkeys:** Navigation hotkeys defined in the essence are keyboard shortcuts. Implement as useEffect keydown event listeners — do NOT render hotkey text in the sidebar UI.
- **Collapse:** Sidebar collapse toggle should be integrated into the sidebar header area (next to the brand/logo), not floating at the bottom of the sidebar.
- **Breadcrumbs:** For nested routes (e.g., /resource/:id), show a breadcrumb trail above the page heading inside the main content area. On narrow widths, truncate gracefully rather than wrapping into a second shell row.
- **Empty States:** When a section has zero data, show a centered empty state: 48px muted icon + descriptive message + optional CTA button.
- **Mobile Drawer:** Below the md breakpoint, the sidebar leaves the permanent split layout and becomes an overlay drawer. Use a scrim, Escape handling, and a header toggle. The closed drawer must not consume layout width.
- **Shell Spacing:** Header, body, sidebar, and footer all share one inset rhythm. Use a tighter shell inset on mobile and the full comfortable inset on tablet/desktop instead of page-local padding overrides.
- **Viewport Lock:** The authenticated shell should stay locked to the viewport height. The main body region owns page scrolling, while the sidebar keeps its footer and account controls pinned within the shell instead of letting them drift to the bottom of the full document.
- **Nav Visibility:** Sidebar navigation visibility should reflect actual capabilities, not generic route presence. Team, governance, private-registry, and admin groups appear only when the active workspace state says the user can reach them.
- **Section Labels:** Dashboard section labels use d-label[data-anchor] for accent-bordered headers with density-responsive spacing.
- **Collapsed Brand:** When the sidebar collapses to a rail, the header should behave like a compact rail control state, not like a cramped mini brand lockup. Prefer centering the collapse/expand control and omitting extra brand copy or stray decorative marks if they do not fit cleanly.
- **Workspace State:** Authenticated shells should derive identity, tier, entitlements, active organization, and admin capability from one shared workspace state. Do not let sidebar navigation, footer identity, billing state, and page-level access drift through separate fetches or local fallbacks.
- **Page Transitions:** Apply the entrance-fade class (if generated) to the main content area for smooth page transitions.

## Theme Reference

**Theme:** luminarum (dark) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 11 `luminarum-*` classes — full Class/Intent/Apply-to table in `section-admin-moderation-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** kpi-grid
**Compositions:** **hero:** Split hero with large logo (1/3) and content (2/3). Canvas bg with breathing gradient orbs behind. Logo floats gently.
**pipeline:** Grid of outlined cards showing process steps. Each card has a different accent color stroke with numbered badge.
**tool-list:** Two-column list with colored dot bullets and colored left border stripes on hover.
**feature-grid:** Grid of vibrant filled cards with corner brackets. Each card a different brand color.
**Spatial hints:** Density bias: none. Section padding: 7.5rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface luminarum-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth, admin

---

## Visual Direction

**Personality:** Vibrant design intelligence registry. Warm coral and amber accents on a rich dark canvas (or crisp warm-white in light mode). Content cards are the hero — outlined with colored type borders, hovering with purpose. Search is instant and faceted. Publishing feels like sharing art. The Decantr dogfood app — built with its own system, proudly showing what the platform produces. Think Figma Community meets shadcn/ui registry.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Constraints

- **effects:** {"doctrine-security-data":"Preserve the existing Supabase auth, admin authorization, billing, API-key, telemetry attribution, privacy, and hosted-registry service boundaries unless a reviewed task explicitly changes them.","doctrine-design-system":"Preserve the registry's Luminarum token bridge, Decantr treatments, shell rhythm, and public/admin/dashboard styling contracts while evolving individual pages."}

---

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

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


### moderation-queue-item

Submission card for the admin moderation queue showing content preview, submitter info, reputation score, and approve/reject action buttons.

**Visual brief:** Bordered card for a single moderation queue entry. The header row shows a type badge (pattern, theme, etc.) in a color-coded pill, the content name, and a submission timestamp. A submitter row displays a small avatar, username, and reputation score badge. The card body shows a description preview and a collapsible content preview section (rendered JSON or markdown). The footer contains Approve (primary green) and Reject (destructive red) action buttons with optional feedback textarea. Compact preset condenses to a single row with inline approve/reject icon buttons.

**Components:** Card, CardHeader, CardBody, CardFooter, Badge, Button, Avatar, icon

**Composition:**
```
Header = CardHeader > [TypeBadge(d-annotation, color-coded) + ContentName(heading4) + Timestamp(text-muted)]
ActionBar = CardFooter(d-interactive) > [ApproveButton(variant: success) + RejectButton(variant: destructive) + ViewDetailLink(variant: ghost)]
SubmitterRow = Row > [Avatar + Username(font-medium) + ReputationBadge(d-annotation)]
ContentPreview = CardBody(d-data) > [Description + JSONPreview?(collapsible, mono-data)]
ModerationQueueItem = Card(d-surface, bordered) > [Header + SubmitterRow + ContentPreview + AdminNotes? + ActionBar]
```

**Layout slots:**
- `notes`: Optional admin notes textarea
- `header`: Type badge, content name, and submission timestamp
- `actions`: Approve Button (success), Reject Button (destructive), View Detail link
- `preview`: Content description and truncated JSON preview
- `submitter`: Avatar, username, reputation score badge, and trust indicator
  **Layout guidance:**
  - density: Compact cards — this is an admin worklist, not a showcase. Minimal vertical padding.
  - card_layout: Bordered card: type badge (d-annotation) + title + namespace + submitted-by + submitted-at. Right side: Approve (primary) + Reject (danger ghost) action buttons.
  - status_indicator: Left border colored by status: pending=amber, approved=green, rejected=red.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Approve and reject controls may use clear hover/focus transitions, while status borders may brighten subtly when an item is selected. |
| transitions | Expand/collapse of previews and feedback surfaces should animate over 160-240ms without making the moderation queue feel noisy. |

**Responsive:**
- **Mobile (<640px):** Cards take full width. Approve/Reject buttons are full-width stacked. Content preview defaults to collapsed. Feedback textarea appears on button click.
- **Tablet (640-1024px):** Standard card layout. Buttons side by side in the footer.
- **Desktop (>1024px):** Full card with content preview visible. Buttons inline in footer. Feedback textarea expandable.

**Accessibility:**
- Role: `article`
- Keyboard: Tab moves through preview, approve, reject, and feedback controls in order.
- Announcements: Moderation status and decision outcomes should be announced clearly.; Collapsed preview state changes should be announced when expanded.
- Focus: After moderation actions, keep focus on the affected row or feedback control so the reviewer can continue operating without losing queue context.


### kpi-grid

A grid of key performance indicator cards showing metrics with labels, values, and trend indicators

**Visual brief:** Row of KPI cards in a responsive grid. Each card is a compact surface with an icon in a rounded muted-background circle at top-left, a small muted label below describing the metric, the primary value in large heading2-scale bold text, and a trend badge showing percentage change — green with an up-arrow for positive, red with a down-arrow for negative. Cards have equal height and consistent internal padding. The compact preset removes icons and replaces the trend badge with an inline sparkline chart placeholder. Cards use subtle border or shadow to delineate from the background. The grid itself should sit inside a parent workspace region stack rather than pretending to be a full section.

**Components:** Card, icon, Badge

**Composition:**
```
KPICard = Card(d-surface, padding) > [Icon(d-annotation, rounded-bg) + Label(text-muted, text-sm) + Value(heading2, mono-data) + TrendBadge(d-annotation, variant: positive|negative)]
KPIGrid = Grid(d-data, responsive: 2/4-col) > KPICard[]
```

**Layout slots:**
- `icon`: Abstract icon placeholder for each KPI category
- `trend`: Change percentage Badge with positive/negative variant
- `value`: Primary metric value with _heading2 styling
- `kpi-card`: Repeated Card with icon, label, value, and trend Badge
  **Layout guidance:**
  - grid: 4 columns desktop, 2 tablet, 1 mobile. Cards should breathe, but the parent workspace layout owns any gap before or after the KPI grid.
  - animation: Counter animation on mount — numbers count from 0 to value over 500ms.
  - stat_treatment: Each KPI uses lum-stat-glow: filled circle in accent/primary color with number inside (dark text). Label below in text-muted. Sparkline trend to the right.
  - semantic_direction: Each KPI has both a delta (numeric change) AND a semantic direction. Lower-is-better metrics (latency, error-rate, MTTR, SLO-budget-burn) should color the trend badge GREEN when value drops, RED when it rises. Higher-is-better metrics (throughput, requests/sec, uptime%, SLO-budget-remaining) get the inverse mapping. Direction-only coloring is wrong: latency dropping is a WIN, not a neutral change. Pass `lower_is_better: true` per KPI in the data shape and route the trend badge color from that flag, not from the delta sign alone.
  - kpi_value_unit_spacing: Value + unit pair (e.g., "82ms", "31.2k", "0.42%") should use `gap: 0.25em` between number and unit — NOT the inherited container content_gap. Larger gaps make the value read as detached from its unit.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Cards may softly elevate on hover, and trend indicators may brighten or pulse subtly when values improve. |
| transitions | Counter animations and KPI entry reveals should remain short and restrained so the grid still reads like instrumentation, not spectacle. |

**Responsive:**
- **Mobile (<640px):** Two columns (2x2 grid). Card padding reduces to p3. Value text drops to heading3 scale. Icons shrink to 20px. Sparklines in compact preset maintain aspect ratio.
- **Tablet (640-1024px):** Two columns at default, four columns if space allows. Standard padding. Full heading2 values.
- **Desktop (>1024px):** Four-column single row. Full layout with icons, values, and trend badges. Comfortable gap4 spacing between cards.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves through interactive KPI cards and any embedded actions in reading order.
- Announcements: Metric label, value, and trend should be conveyed semantically and not rely on color alone.
- Focus: If KPI cards are actionable, focused cards should receive a clear outline or selected treatment equivalent to hover.


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


### content-detail-hero

Action-first header section for content detail pages showing name, human-readable source identity, concise trust state, quick-start guidance, and type-aware next-step actions before the raw contract payload.

**Visual brief:** Full-width detail hero that feels like a product launch panel rather than a raw data dump. A breadcrumb trail sits at the top. The first visible row uses only a few high-signal badges: type and the strongest trust state. The title is large and paired with a lightweight mono-data version readout. The source line should read like a friendly publisher identity, such as @official/decantr or @community/alice, rather than exposing raw internal ids. Trust information is summarized in compact supporting cards instead of a long wall of chips.

**Components:** Badge, Button, Chip, icon

**Composition:**
```
MetaRow = Row(d-data, gap-3) > [SourceLine(mono-data) + PublishDate(text-muted) + SupportingMeta]
BadgeRow = Row(gap-2) > [TypeChip(d-annotation, color-coded) + TrustChip]
TrustStrip = Grid(2-col desktop / 1-col mobile) > [RegistryIntelligenceSummary + ShowcaseVerificationSummary]
ActionGroup = Row(d-interactive, gap-2) > [PrimaryAction(variant: primary) + SecondaryAction(variant: ghost) + ShowcaseAction(variant: ghost)]
QuickStartPanel = Panel(d-surface, compact) > [Eyebrow + PrimaryCommand + SecondaryAction + UsageGuidance]
ContentDetailHero = Section(d-section, flex-col, gap-4, border-bottom) > [Breadcrumb + BadgeRow + HeroSplit > [NarrativeColumn > [Title(heading2) + Description(text-muted) + MetaRow] + QuickStartPanel] + TrustStrip + ActionGroup]
```

**Layout slots:**
- `title`: Content name with _heading2 styling and a mono-data version label
- `badges`: Minimal badge row for type and one primary trust signal
- `meta-row`: Human-readable source line, publish date, and tightly scoped supporting metadata
- `breadcrumb`: Breadcrumb navigation: Registry > Type > Namespace > Slug
- `description`: Concise description explaining what the item does and why it matters
- `trust-strip`: Compact row of trust summary cards for registry intelligence and showcase verification
- `action-group`: Type-aware CTA buttons such as Start from blueprint, Copy reference, Inspect JSON, or Open showcase
- `quick-start-panel`: Action-first quick-start surface with a primary command, a secondary inspect action, and a short 'what to do next' note
  **Layout guidance:**
  - actions: Actions are type-aware: blueprints foreground scaffold/start actions, patterns/themes/shells foreground inspect/reference actions. Primary action should read like the next thing a human should do, not just 'copy'.
  - background: Subtle gradient matching content type color at 5-8% opacity, fading to var(--d-bg). Add a restrained accent glow behind the primary action rail rather than across the whole page.
  - hero_layout: Use a split hero rhythm with narrative on the left and a quick-start rail on the right whenever space allows. Keep the quick-start rail visually distinct using a bordered or treated panel, but avoid drowning the top of the page in chips or letting metadata outcompete the next-step actions.
  - source_line: Source identity should prioritize the human-facing publisher while preserving the registry scope, for example @official/decantr or @org:acme/alice.
  - trust_panels: Trust summaries should be compact, card-like, and human-readable. Prefer one sentence plus 2-4 supporting facts over long comma-separated evidence dumps.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Primary actions and trust-summary cards may use subtle hover elevation and accent transitions, but the hero should remain calm and editorial. |
| transitions | Hero content and quick-start rail can fade up together over 220-320ms. Trust cards may stagger lightly beneath the hero rather than popping in abruptly. |

**Responsive:**
- **Mobile (<640px):** Breadcrumb collapses to a short back path. Quick-start becomes a full-width stack below the description. Trust summaries become cards stacked beneath the hero copy. Action buttons go full-width and the metadata row trims to the most useful items.
- **Tablet (640-1024px):** Hero content and quick-start panel can sit in a 2-row composition, with trust summaries in a two-column strip. Breadcrumb remains visible and action buttons stay grouped.
- **Desktop (>1024px):** Hero reads as a split composition: descriptive content on the left, quick-start panel on the right, with trust summaries flowing underneath. The page should feel editorial, roomy, and high-confidence.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves from breadcrumb to primary actions to supporting trust cards in a predictable order.
- Announcements: Title, source identity, and primary action context should be available before supporting trust summaries.
- Focus: Keep the primary next-step action early in the focus order without skipping the page title and source identity.


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


---

## Pages

### moderation-queue (/admin/moderation)

Layout: search-filter-bar → moderation-queue-item

### commercial-reports (/admin/reports)

Layout: kpi-grid → activity-feed

### organizations (/admin/organizations)

Layout: search-filter-bar → content-card-grid → activity-feed

### organization-detail (/admin/organizations/:slug)

Layout: detail-header → kpi-grid → activity-feed → content-card-grid

### moderation-detail (/admin/moderation/:id)

Layout: content-detail-hero → json-viewer → moderation-queue-item

### telemetry (/admin/telemetry)

Layout: kpi-grid → search-filter-bar → activity-feed

### telemetry-usage (/admin/telemetry/usage)

Layout: kpi-grid → activity-feed → content-card-grid
