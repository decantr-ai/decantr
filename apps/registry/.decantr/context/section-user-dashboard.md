# Section: user-dashboard

**Role:** primary | **Shell:** sidebar-main | **Archetype:** user-dashboard
**Description:** Authenticated user area with content management, API key management, account settings, and activity overview.

## Quick Start

**Shell:** Responsive sidebar shell with a desktop split layout, a compact sticky header, and an overlay drawer below the md breakpoint. Used by dashboards, account workspaces, and admin operations surfaces. (nav: 240px, header: 52px)
**Pages:** 9 (overview, content, content-new, api-keys, settings, billing, team, governance, private-registry)
**Key patterns:** kpi-grid, reputation-badge, activity-feed, content-card-grid [moderate], form [complex], json-viewer, api-key-row, account-settings [moderate], tier-upgrade-card [moderate], team-member-row [moderate], search-filter-bar [moderate]
**Theme decorators:** 11 classes — see `section-user-dashboard-pack.md` for the Class | Intent | Apply-to contract
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

**Theme decorators:** 11 `luminarum-*` classes — full Class/Intent/Apply-to table in `section-user-dashboard-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** kpi-grid
**Compositions:** **hero:** Split hero with large logo (1/3) and content (2/3). Canvas bg with breathing gradient orbs behind. Logo floats gently.
**pipeline:** Grid of outlined cards showing process steps. Each card has a different accent color stroke with numbered badge.
**tool-list:** Two-column list with colored dot bullets and colored left border stripes on hover.
**feature-grid:** Grid of vibrant filled cards with corner brackets. Each card a different brand color.
**Spatial hints:** Density bias: none. Section padding: 7.5rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface luminarum-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

auth, api-keys

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


### reputation-badge

User reputation score display with numeric score, trust level indicator, and progress toward next trust threshold. Used in dashboards, content cards, and moderation views.

**Visual brief:** Compact inline badge displaying a user's reputation score and trust level. Shows a trust-level icon (shield, star, or checkmark based on level), a numeric score in medium-weight text, and a text label for the trust level (New, Trusted, Verified, etc.) in muted smaller text. A subtle progress indicator shows advancement toward the next trust threshold. The large preset enlarges everything and adds a detailed breakdown tooltip on hover. The compact preset shows icon and score only. Color varies by trust level — gray for new, blue for trusted, gold for verified.

**Components:** Badge, icon

**Layout slots:**
- `icon`: Trust level icon: shield for trusted, star for rising, circle for new
- `label`: Trust level text (Trusted / Rising / New)
- `score`: Numeric reputation score
  **Layout guidance:**
  - levels: Level names: Newcomer (0-10), Contributor (11-50), Trusted (51-200), Expert (201+). Color intensifies with level.
  - badge_layout: Inline pill: star icon + score number (font-semibold) + level text (text-muted). Background: subtle primary tint. Tooltip on hover shows breakdown.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Level indicators and progress cues may brighten or animate softly on hover, but the badge should remain calm and compact. |
| transitions | Score and level updates should cross-fade or count smoothly over 150-220ms without causing layout shift. |

**Responsive:**
- **Mobile (<640px):** Compact preset preferred. Badge renders inline at standard body text size.
- **Tablet (640-1024px):** Standard badge with icon, score, and label visible.
- **Desktop (>1024px):** Full badge with progress indicator. Large preset with tooltip on hover.

**Accessibility:**
- Role: `status`
- Keyboard: If the badge exposes a tooltip or breakdown, keyboard users should be able to reveal it via focus and dismiss it via Escape.
- Announcements: Score and trust level should be announced together rather than relying on color or iconography alone.
- Focus: If the badge is interactive, preserve focus on the badge trigger when tooltips or detail popovers close.


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


### form

Structured form with labeled field groups, validation states, and action buttons

**Visual brief:** Well-organized form with clear field grouping under section headings. Each section has a heading in heading4 weight and a muted description line, followed by form fields arranged in a one- or two-column grid. Labels sit above their respective fields (stacked, never side-by-side) in small medium-weight text. Input fields use consistent height (~40px), rounded corners (r2), and border styling that brightens on focus with a primary-color ring. Select dropdowns match input styling with a custom chevron. Textareas have a taller minimum height (6rem). Required fields show a small asterisk. Validation errors display below the field in small destructive-red text. The form is constrained to 640px max-width for readability. Action buttons (Save, Cancel) sit at the bottom right, separated by a top border or spacing from the form fields.

**Components:** Card, Input, Select, Switch, Checkbox, Button, Label, Textarea, RadioGroup

**Composition:**
```
Form = Container(d-section, flex-col, gap-6, max-width) > [FormSection[] + ActionButtons]
Field = Stack(flex-col) > [Label(d-control, font-medium) + Input(d-control) + ValidationError?(d-annotation, text-destructive)]
FieldGroup = Grid > Field[]
FormSection = Card(d-surface) > [SectionTitle(heading4) + SectionDescription?(text-muted) + FieldGroup(d-control, grid: 1/2-col)]
ActionButtons = Row(d-interactive, gap-2) > [SaveButton(variant: primary) + CancelButton(variant: ghost)]
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
| error-shake | translateX(-4px, 4px, -2px, 2px, 0) 300ms ease-out on validation error |
| field-focus | border-color transition 150ms ease-out |
| button-press | scale(0.97) 100ms ease-out |
| success-submit | fade-out form + fade-in success message 300ms ease-out |
| validation-error | fade + slideDown 200ms ease-out for error message |

**Responsive:**
- **Mobile (<640px):** Single column for all field groups. Fields go full-width. Action buttons stack vertically at full width, primary on top. Section headings go full-width above fields. Padding reduces to p3.
- **Tablet (640-1024px):** Two-column field grid activates for shorter fields (name, email). Textareas span full width. Action buttons stay horizontal, right-aligned.
- **Desktop (>1024px):** Full two-column grid for field groups. Settings preset shows section label column on the left, fields on the right. Generous p4 spacing. Inline validation visible without layout shift.

**Accessibility:**
- Role: `form`
- Keyboard: Tab navigates between fields; Shift+Tab navigates backwards between fields; Enter submits when focus is on submit button; Escape cancels or closes modal forms; Arrow keys navigate within radio groups; Space toggles checkboxes and switches
- Announcements: Validation errors announced on field blur; Required field indicator announced on focus; Success confirmation announced on submit; Field group label announced on section entry
- Focus: First invalid field receives focus on failed validation. On successful submit, focus moves to success message or next logical action.


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


### api-key-row

API key management surface with responsive key rows/cards, masked key metadata, create-key workflow, copy/revoke actions, and a save-once creation banner.

**Visual brief:** Single horizontal row with a key icon on the far left, followed by the key name in medium-weight text and a masked key value (e.g. 'sk-****...3f2a') in monospace below it. Scope badges (read, write) appear as small colored pills in the middle. Created and last-used dates render in muted small text. Copy and revoke action buttons sit on the far right, with revoke styled as a destructive variant. Rows are separated by bottom borders. The card preset stacks everything vertically inside a bordered card for mobile use.

**Components:** Badge, Button, icon

**Composition:**
```
Actions = Row(d-interactive) > [CopyButton(variant: ghost) + RevokeButton(variant: destructive)]
KeyInfo = Stack(flex-col) > [KeyName(font-medium) + MaskedKey(mono-data, text-muted)]
ApiKeyRow = Row(d-data-row, hoverable) > [KeyIcon + KeyInfo + ScopeBadges + DateInfo + Actions]
ScopeBadges = Row(gap-2) > Badge(d-annotation)[]
CreationBanner = AlertCard(d-surface, success-tint) > [BannerTitle + FullKey(mono-data) + CopyAction + DismissAction]
ApiKeyWorkspace = Stack > [WorkspaceHeader + CreatePanel? + CreationBanner? + ApiKeyRow[]]
```

**Layout slots:**
- `dates`: Created and last-used timestamps
- `scopes`: Horizontal row of scope Badge elements (read, write, org:read, org:write)
- `actions`: Copy key Button and Revoke Button (destructive variant)
- `key-icon`: Key icon indicator on the left
- `key-info`: Key name (_textsm _fontmedium) and masked key value (_textxs _mono _fgmuted) stacked vertically
  **Layout guidance:**
  - reveal: Click masked value to reveal for 5 seconds, then re-mask. Copy button copies full key.
  - row_layout: Key icon (16px, muted) + key name + masked value + scope badges + date metadata + actions. On narrow widths, collapse into stacked cards before the metadata starts crowding.
  - create_form: Inline form at top: text input for key name + scope controls + Create button (primary). Appears on 'New API Key' click.
  - creation_banner: After key creation, surface a prominent one-time reveal banner with copy action and dismissal control. This banner should feel like a temporary alert card, not just a paragraph.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Copy and revoke controls may brighten or lift subtly on hover and focus, but the row itself should remain operational and stable. |
| transitions | Reveal, creation-banner, and revoked-state changes should animate softly over 150-220ms without shifting the table rhythm. |

**Responsive:**
- **Mobile (<640px):** Prefer the card preset — stacked vertical layout with wrapped scope badges and actions that sit beneath the key metadata instead of forcing a rigid table.
- **Tablet (640-1024px):** Standard row or card-list layout is acceptable, but metadata should wrap before the key row overflows.
- **Desktop (>1024px):** Full row layout with clear separation between key info, scopes, dates, and actions.

**Accessibility:**
- Role: `row`
- Keyboard: Tab moves through reveal, copy, revoke, and scope controls in row order.; Keyboard users should be able to reveal and copy keys without relying on hover-only UI.
- Announcements: One-time key creation and reveal states should be announced clearly.; Revocation outcomes should be announced explicitly.
- Focus: Keep focus on the row or invoked action after copy or reveal events so the user does not lose context.


### account-settings

Account management workspace with responsive settings navigation, grouped forms, and stable save/action zones for profile, security, preferences, and danger-zone flows.

**Visual brief:** Settings page with vertical navigation tabs on the left (Profile, Security, Notifications, Danger Zone) and form content on the right. Active tab highlighted with an accent border. On small screens, the nav becomes a horizontal scrollable strip while the forms keep the same comfortable shell spacing. Each settings section is a d-surface card with grouped form fields, section heading, and a stable save action zone.

**Components:** Button, Avatar, Badge, icon

**Composition:**
```
SettingsNav = SettingsNavPattern(vertical-tabs, responsive)
AccountSettings = Container(d-section, split) > [SettingsNav + SettingsContent]
SettingsContent = Panel(d-surface, flex-col, gap-8) > [SectionHeading + AvatarUpload? + FormFields + ActionZone]
```

**Layout slots:**
- `nav`: Responsive settings navigation using vertical tabs on larger widths and horizontal tabs on small screens
- `form`: Name, email, bio inputs grouped in a content panel
- `save`: Save changes button in a stable action zone
- `avatar`: Avatar with upload/change button
  **Layout guidance:**
  - spacing: Nav items have consistent padding. Active item stands out but doesn't shift layout. Content cards should share the same shell inset rhythm as the rest of the dashboard.
  - active_state: Active nav/tab item should have a visible indicator: accent-colored left border (for vertical nav) or bottom border (for horizontal tabs), plus accent text color.
  - nav_position: For settings pages, use a vertical tab nav on the left at larger widths. On small screens, switch to a horizontal scrollable tab strip or segmented control without changing the content spacing rhythm.
  - cta_treatment: Primary save/update actions should sit in a stable action zone and feel distinct from secondary utility buttons such as avatar change, sign out, or cancel.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Active nav indicators, save confirmations, and destructive warning states may animate softly over 150-200ms. |
| transitions | Switching between settings sections should cross-fade or slide minimally so the workspace still feels stable and operational. |
| ambient | Avoid decorative ambient motion in settings surfaces. Keep movement functional and low-noise. |

**Responsive:**
- **Mobile (<640px):** Collapse the workspace to a single column with a horizontal scrollable tab strip or segmented control above the active section. Keep the content max-width comfortable and place save or destructive actions close to the relevant field group.
- **Tablet (640-1024px):** Allow either a narrow left settings rail or a horizontal tab strip depending on width. Preserve stable action zones and avoid overly wide form rows.
- **Desktop (>1024px):** Use a clear split between navigation and content with enough gap to keep settings work readable. Do not let profile or preferences forms stretch edge-to-edge.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves through settings navigation, fields, and actions in source order.; Arrow keys may move between tab-style navigation items when rendered as a tab list.; Enter or Space activates save, cancel, and destructive confirmation actions.
- Announcements: Announce settings section changes such as 'Security settings selected'.; Announce save success, validation errors, and destructive confirmations clearly.
- Focus: When changing settings sections, move focus to the section heading or first field. Keep destructive actions visually separated and reachable without trapping focus.


### tier-upgrade-card

Pricing tier card with plan name, price, feature list, upgrade CTA, and current-plan/recommended emphasis. Used in billing portal and landing page pricing sections.

**Visual brief:** Pricing card for upgrade flows with a header showing the plan name and an optional 'Current Plan' or 'Recommended' badge. Price displayed prominently with monthly billing amount. A short plan description below the price. A feature checklist with checkmark icons lists included features. The CTA button reads 'Upgrade' (or 'Current Plan' in disabled state for the current plan). The highlighted preset adds a primary-color border and a 'Most Popular' ribbon. The horizontal preset arranges plans side by side in a comparison table layout instead of separate cards.

**Components:** Card, CardHeader, CardBody, CardFooter, Badge, Button, icon

**Composition:**
```
CTAButton = Button(d-interactive, full-width, variant: highlighted ? primary : secondary-strong)
FeatureList = List > FeatureItem(d-data-row) > [CheckIcon(color: success) + FeatureText][]
HighlightedCard = TierUpgradeCard(border-primary, accent-bar-top) > PopularBadge(d-annotation)
TierUpgradeCard = Card(d-surface, bordered) > [CardHeader > [PlanName(heading4) + PopularBadge?(d-annotation)] + Price(mono-data, heading2) + Description(text-muted) + FeatureList + CTAButton]
```

**Layout slots:**
- `cta`: Upgrade/downgrade Button, full-width in CardFooter
- `price`: Monthly price with large _heading2 number and /mo suffix
- `header`: Plan name with _heading4 and optional 'Popular' Badge
- `features`: Checklist of included features, each with check icon
- `description`: One-line plan description with _bodysm _fgmuted
  **Layout guidance:**
  - comparison: Feature comparison as checklist — checkmarks for included, dashes for excluded. Premium features in accent color. Use staged or auto-fit columns, never a rigid four-up grid.
  - cta_treatment: The upgrade/manage action should always read as a decisive billing action. Current-plan state should still preserve a stable button/action slot so the card rhythm does not collapse.
  - card_treatment: Current plan highlighted with a distinct active treatment and a clear 'Current' badge. Recommended upgrade options should feel stronger than generic cards and should not rely on generic ghost-button treatment for their main CTA.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Highlighted or recommended plans may use subtle border and shadow emphasis on hover, while current-plan states remain calm and stable. |
| transitions | Billing-state and current-plan changes should animate softly over 150-220ms without causing the comparison grid to shift. |

**Responsive:**
- **Mobile (<640px):** Cards stack vertically with full-width CTAs and intact feature lists.
- **Tablet (640-1024px):** Two-column or auto-fit comparison. Cards should never shrink below comfortable reading width.
- **Desktop (>1024px):** Auto-fit comparison layout with generous feature spacing. Avoid hardcoded column counts when more plans are present.

**Accessibility:**
- Role: `article`
- Keyboard: Tab moves through the plan CTA and any supporting links in card order.
- Announcements: Current plan and recommended-plan states should be announced semantically rather than through color alone.; Feature availability should be conveyed in text, not only in checkmark icons.
- Focus: Keep focus on the active plan CTA or selected comparison state when billing controls update.


### team-member-row

Team collaboration surface row with member identity, role controls, join date, responsive management actions, and an invite flow that can collapse cleanly on narrower widths.

**Visual brief:** Horizontal row displaying a team member with a circular avatar on the left, followed by name (medium weight) and email (muted, smaller text) stacked vertically, a role badge (Owner, Admin, Member) color-coded in the middle, join date in muted text, and action controls on the right (role change dropdown, remove button). Rows are separated by bottom borders. The card preset wraps each member in a bordered card with a vertical layout. The invite preset shows a pending invite row with email, role, and resend/cancel actions.

**Components:** Avatar, Badge, Button, Select, icon

**Composition:**
```
Actions = Row(d-interactive) > [RoleSelect(d-control) + RemoveButton(variant: destructive, icon-only)]
MemberInfo = Stack(flex-col) > [Name(font-medium) + Email(text-muted, text-sm)]
TeamMemberRow = Row(d-data-row, hoverable) > [Avatar + MemberInfo + RoleBadge(d-annotation) + JoinDate(text-muted) + Actions]
InviteMemberForm = ResponsiveRow > [InviteeField + RoleSelect + InviteButton]
```

**Layout slots:**
- `role`: Role Badge (owner=primary, admin=secondary, member=outline)
- `avatar`: Team member Avatar, medium size
- `joined`: Join date with _textxs _fgmuted
- `actions`: Role Select dropdown and Remove Button
- `identity`: Name (_textsm _fontmedium) and email (_textxs _fgmuted) stacked
  **Layout guidance:**
  - row_layout: Avatar (32px circle) + identity block + role/date/actions trail. On narrow widths, let the trail wrap below the identity instead of squeezing the email or control cluster.
  - invite_form: Invite form uses a responsive row: email input + role dropdown + Invite button. Collapse to a stacked form on small screens.
  - cta_treatment: Supporting workspace navigation such as governance links should appear as contextual action bands or compact cards, not as detached button rows.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Role pills and row actions may animate subtly on hover and focus, but the row should still read like calm administrative data. |
| transitions | Invite, resend, and member-update states should fade or expand gently over 150-220ms without disrupting the list rhythm. |

**Responsive:**
- **Mobile (<640px):** Use a stacked card or wrapped row composition. Avatar and identity stay together, role/date/actions drop beneath, and invite/member controls stack instead of compressing.
- **Tablet (640-1024px):** Standard row layout with wrapped secondary metadata when needed. Actions can remain inline, but should break onto a second line before overflowing.
- **Desktop (>1024px):** Full row with generous spacing. All information and actions visible inline without relying on a single non-wrapping strip.

**Accessibility:**
- Role: `row`
- Keyboard: Tab moves through role controls, invite actions, and remove controls in row order.
- Announcements: Role changes, invite sends, and removals should be announced clearly.; Pending-invite state should be distinguishable from active-member state semantically, not just visually.
- Focus: After member actions, preserve focus on the affected row or the next logical row-level action.


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


---

## Pages

### overview (/dashboard)

Layout: kpi-grid → reputation-badge → activity-feed

### content (/dashboard/content)

Layout: content-card-grid

### content-new (/dashboard/content/new)

Layout: form → json-viewer

### api-keys (/dashboard/api-keys)

Layout: api-key-row

### settings (/dashboard/settings)

Layout: account-settings

### billing (/dashboard/billing)

Layout: tier-upgrade-card → kpi-grid

### team (/dashboard/team)

Layout: kpi-grid → team-member-row

### governance (/dashboard/governance)

Layout: kpi-grid → activity-feed → content-card-grid

### private-registry (/dashboard/private-registry)

Layout: search-filter-bar → content-card-grid
