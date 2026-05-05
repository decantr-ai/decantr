# Section: collaboration-hub

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** collaboration-hub
**Description:** Producer collaborator directory and royalty split management surface with contributor cards and split calculators.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (collaborators, splits)
**Key patterns:** card-grid [moderate], team-member-row [moderate], split-calculator [moderate], data-table [moderate]
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

collaboration, royalties

---

## Visual Direction

**Personality:** Electric music production workspace with cyan waveforms pulsing across deep purple canvases. Multi-track DAW layout with stem-stack channel strips, meter bars glowing on transients, and automation lanes curving below. Split-royalty calculators with real-time percentage validation. Live session rooms with voice chat and collaborative scrubbing. Think Ableton meets Splice. Lucide icons. Electric.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis

## Pattern Reference

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


### split-calculator

Royalty split calculator for music collaborators with percentage allocation, role tagging, preset splits, and validation that totals equal 100%.

**Visual brief:** A vertical list of collaborator rows inside a rounded card. Each collaborator row has a drag handle on the far left (6-dot grip icon, visible on hover), a 40px circular avatar with initials fallback, a name text in semibold 14px with role tag beneath as a small colored pill (Producer=purple, Songwriter=blue, Performer=amber, Engineer=gray), and on the right a percentage input combining a horizontal slider (flex-grow, 0-100%) with a coupled numeric spinbox (60px wide) showing the exact percentage with % suffix. A visible remove-row X button appears on hover at far right. Below the rows sits a total badge showing the sum of all percentages (e.g. '100.0%') as a prominent pill: green background if exactly 100%, red background with warning icon if over or under. Preset buttons row below the total shows common allocations ('50/50', '70/30', 'Equal shares', 'Custom') as outlined buttons that apply instantly. Add-collaborator button at bottom spans full width as a dashed-border outlined button with plus icon.

**Components:** SplitRow, PercentageInput, CollaboratorAvatar, RoleTag, TotalBadge, PresetButton

**Composition:**
```
SplitRow = Row(d-interactive) > [DragHandle + CollaboratorAvatar + NameAndRole + PercentageInput + RemoveButton?]
TotalBadge = Pill(d-annotation, state-colored) > [SumText + WarningIcon?]
PresetButtons = FlexRow > PresetButton*(d-control, outlined)
PercentageInput = Compound > [Slider(0-100) + Spinbox(numeric, %)]
SplitCalculator = Root(d-surface, stack) > [SplitRow* + TotalBadge + PresetButtons + AddRowButton]
```

**Layout slots:**
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| slider-drag | slider fill follows pointer at 60fps with spinbox number update |
| total-change | total badge color transitions 200ms ease-out when crossing 100% |
| row-add | scale-in + fade 250ms spring at bottom of list |
| row-remove | slide-out + fade + collapse 200ms ease-in |
| preset-apply | all percentages animate simultaneously to new values 400ms ease-out |
| invalid-total-pulse | total badge red pulse 1.5s ease-in-out infinite when sum ≠ 100% |

**Responsive:**
- **Mobile (<640px):** Rows wrap: avatar + name on top, slider + spinbox on bottom. Remove button moves next to drag handle. Preset buttons scroll horizontally.
- **Tablet (640-1024px):** Standard layout with slightly condensed spacing.
- **Desktop (>1024px):** Full inline layout with all controls and hover states visible.

**Accessibility:**
- Role: `form`
- Keyboard: Tab: cycle through collaborator inputs; Arrow keys: adjust focused percentage by 1%; Shift+Arrow: fine adjust by 0.1%; Enter: confirm value; Delete: remove focused collaborator; Ctrl+A: add new collaborator
- Announcements: {collaborator} set to {percent}%; Total is now {total}%; Warning: total does not equal 100%; Preset {name} applied


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

### collaborators (/collab)

Layout: card-grid → team-member-row

### splits (/collab/splits)

Layout: split-calculator → data-table
