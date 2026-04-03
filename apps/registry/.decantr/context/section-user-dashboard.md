# Section: user-dashboard

**Role:** primary | **Shell:** sidebar-main | **Archetype:** user-dashboard
**Description:** Authenticated user area with content management, API key management, account settings, and activity overview.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 7 (overview, content, content-new, api-keys, settings, billing, team)
**Key patterns:** kpi-grid, reputation-badge, activity-feed, content-card-grid [moderate], form [complex], json-viewer, api-key-row, account-settings [moderate], tier-upgrade-card [moderate], team-member-row [moderate]
**CSS classes:** `.lum-orbs`, `.lum-brand`, `.lum-glass`
**Density:** comfortable
**Voice:** Welcoming and developer-friendly.

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

## Pattern Reference

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
**Responsive:**
- **Mobile (<640px):** Compact preset preferred. Badge renders inline at standard body text size.
- **Tablet (640-1024px):** Standard badge with icon, score, and label visible.
- **Desktop (>1024px):** Full badge with progress indicator. Large preset with tooltip on hover.


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


### api-key-row

API key display row with masked key value, name, scopes, creation date, last-used timestamp, copy-to-clipboard, and revoke actions.

**Visual brief:** Single horizontal row with a key icon on the far left, followed by the key name in medium-weight text and a masked key value (e.g. 'sk-****...3f2a') in monospace below it. Scope badges (read, write) appear as small colored pills in the middle. Created and last-used dates render in muted small text. Copy and revoke action buttons sit on the far right, with revoke styled as a destructive variant. Rows are separated by bottom borders. The card preset stacks everything vertically inside a bordered card for mobile use.

**Components:** Badge, Button, icon

**Composition:**
```
Actions = Row(d-interactive) > [CopyButton(variant: ghost) + RevokeButton(variant: destructive)]
KeyInfo = Stack(flex-col) > [KeyName(font-medium) + MaskedKey(mono-data, text-muted)]
ApiKeyRow = Row(d-data-row, hoverable) > [KeyIcon + KeyInfo + ScopeBadges + DateInfo + Actions]
ScopeBadges = Row(gap-2) > Badge(d-annotation)[]
```

**Layout slots:**
- `dates`: Created and last-used timestamps
- `scopes`: Horizontal row of scope Badge elements (read, write, org:read, org:write)
- `actions`: Copy key Button and Revoke Button (destructive variant)
- `key-icon`: Key icon indicator on the left
- `key-info`: Key name (_textsm _fontmedium) and masked key value (_textxs _mono _fgmuted) stacked vertically
  **Layout guidance:**
  - reveal: Click masked value to reveal for 5 seconds, then re-mask. Copy button copies full key.
  - row_layout: Key icon (16px, muted) + key name (font-semibold) + masked value (mono-data, ••••••••) + copy button (ghost) + delete button (ghost, danger on hover). Last used timestamp on far right.
  - create_form: Inline form at top: text input for key name + Create button (primary). Appears on 'New API Key' click.
**Responsive:**
- **Mobile (<640px):** Switches to card preset — stacked vertical layout with full-width copy/revoke buttons. Scope badges wrap to a second line. Dates appear below key info.
- **Tablet (640-1024px):** Standard row layout maintained. Action buttons use icon-only mode to save horizontal space.
- **Desktop (>1024px):** Full row layout with all elements visible inline. Generous horizontal spacing between key info, scopes, dates, and actions.


### account-settings

Account management forms with presets for profile, security, preferences, and danger zone (account deletion).

**Visual brief:** Settings page with vertical navigation tabs on the left (Profile, Security, Notifications, Danger Zone) and form content on the right. Active tab highlighted with primary left-border. Each settings section is a d-surface card with grouped form fields, section heading, and Save button at bottom-right.

**Components:** Button, Avatar, Badge, icon

**Composition:**
```
SettingsNav = TabList(d-control) > Tab(active?: accent-border)[]
AccountSettings = Container(d-section, flex-col) > [SettingsNav(vertical-tabs, d-interactive) + SettingsContent]
SettingsContent = Panel(d-surface, flex-col, gap-8) > [AvatarUpload? + FormFields + SaveButton(d-interactive, variant: primary)]
```

**Layout slots:**
- `form`: Name, email, bio inputs with inline edit
- `save`: Save changes button
- `avatar`: Avatar with upload/change button
  **Layout guidance:**
  - spacing: Nav items have consistent padding. Active item stands out but doesn't shift layout.
  - active_state: Active nav/tab item should have a visible indicator: accent-colored left border (for vertical nav) or bottom border (for horizontal tabs), plus accent text color.
  - nav_position: For settings pages, vertical tab nav on the left. Content area scrolls independently.

### tier-upgrade-card

Pricing tier card with plan name, price, feature list, and upgrade CTA button. Used in billing portal and landing page pricing sections.

**Visual brief:** Pricing card for upgrade flows with a header showing the plan name and an optional 'Current Plan' or 'Recommended' badge. Price displayed prominently with monthly billing amount. A short plan description below the price. A feature checklist with checkmark icons lists included features. The CTA button reads 'Upgrade' (or 'Current Plan' in disabled state for the current plan). The highlighted preset adds a primary-color border and a 'Most Popular' ribbon. The horizontal preset arranges plans side by side in a comparison table layout instead of separate cards.

**Components:** Card, CardHeader, CardBody, CardFooter, Badge, Button, icon

**Composition:**
```
CTAButton = Button(d-interactive, full-width, variant: highlighted ? primary : ghost)
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
  - comparison: Feature comparison as checklist — checkmarks for included, dashes for excluded. Premium features in accent color.
  - card_treatment: Current plan highlighted with primary border + 'Current' badge. Upgrade options show price, feature list, and Upgrade CTA (primary).
**Responsive:**
- **Mobile (<640px):** Cards stack vertically. CTA buttons full-width. Feature lists fully visible.
- **Tablet (640-1024px):** Two or three column card comparison. Standard card sizes.
- **Desktop (>1024px):** Three-column comparison layout. Highlighted plan slightly elevated. Generous feature list spacing.


### team-member-row

Team member display row with avatar, name, email, role badge, join date, and management actions (change role, remove).

**Visual brief:** Horizontal row displaying a team member with a circular avatar on the left, followed by name (medium weight) and email (muted, smaller text) stacked vertically, a role badge (Owner, Admin, Member) color-coded in the middle, join date in muted text, and action controls on the right (role change dropdown, remove button). Rows are separated by bottom borders. The card preset wraps each member in a bordered card with a vertical layout. The invite preset shows a pending invite row with email, role, and resend/cancel actions.

**Components:** Avatar, Badge, Button, Select, icon

**Composition:**
```
Actions = Row(d-interactive) > [RoleSelect(d-control) + RemoveButton(variant: destructive, icon-only)]
MemberInfo = Stack(flex-col) > [Name(font-medium) + Email(text-muted, text-sm)]
TeamMemberRow = Row(d-data-row, hoverable) > [Avatar + MemberInfo + RoleBadge(d-annotation) + JoinDate(text-muted) + Actions]
```

**Layout slots:**
- `role`: Role Badge (owner=primary, admin=secondary, member=outline)
- `avatar`: Team member Avatar, medium size
- `joined`: Join date with _textxs _fgmuted
- `actions`: Role Select dropdown and Remove Button
- `identity`: Name (_textsm _fontmedium) and email (_textxs _fgmuted) stacked
  **Layout guidance:**
  - row_layout: Avatar (32px circle) + name (font-semibold) + email (text-muted) + role badge (d-annotation: owner/admin/member) + actions dropdown (ghost). Hover: subtle bg.
  - invite_form: Inline invite form: email input + role dropdown + Invite button. Appears above member list.
**Responsive:**
- **Mobile (<640px):** Card preset used — members as stacked cards. Avatar, name, role badge, and actions visible. Join date hidden. Actions as icon buttons.
- **Tablet (640-1024px):** Standard row layout. All fields visible. Actions as text buttons.
- **Desktop (>1024px):** Full row with generous spacing. All information and actions visible inline.


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
