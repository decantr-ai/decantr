# Section: game-catalog

**Role:** primary | **Shell:** sidebar-main | **Archetype:** game-catalog
**Description:** Game discovery and browsing with search, filters, and guild recruitment pages

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 2 (games, join-guild)
**Key patterns:** search-filter-bar [moderate], filter-bar [moderate], card-grid [moderate], hero, testimonials [moderate], cta-section
**CSS classes:** `.gg-dark`, `.gg-hero`, `.gg-sidebar`, `.neon-glow`
**Density:** comfortable
**Voice:** Energetic and direct.

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

**Zone:** App (primary) — sidebar-main shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

search

---

## Visual Direction

**Personality:** High-energy gaming hub with bold, immersive visuals. Dark backgrounds with vibrant neon accents (electric blue, hot pink, lime green). Leaderboard tables use rank-colored highlights. Profile cards show achievement badges and stat bars. Game catalog uses large cover-art cards with hover-zoom effects. Competitive elements (rankings, win rates) are front and center. The vibe is Discord meets Steam — social, loud, and unapologetically gamer.

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


### filter-bar

Search input and filter controls for filtering page content. Sits above data-consuming patterns like data-table, card-grid, and activity-feed.

**Visual brief:** Horizontal bar containing a search input with magnifying glass icon on the left, one or more dropdown Select filters in the middle (category, status, date range), and action buttons on the right (Clear All, Apply). Active filters may display as small removable badge chips below the bar. The compact preset places the search input and filters in a single tight row. The advanced preset adds an expandable panel with additional filter fields (date pickers, range sliders, checkboxes).

**Components:** Input, Select, Button, Badge, icon

**Composition:**
```
FilterBar = Row(d-control, full-width) > [SearchInput(d-control, icon: search) + FilterSelects > Select(d-control)[] + ActionButtons(d-interactive)]
ActiveFilters = Row(gap-2) > FilterChip(d-annotation, removable)[]
AdvancedFilters = Panel(d-surface, expandable) > [FilterRow > Select[] + SavedFilters > Button(variant: outline)[]]
```

**Layout slots:**
- `search`: Search Input with placeholder text
- `actions`: Action Buttons (clear, apply, etc.)
- `filters`: One or more Select dropdowns for category/status filtering
**Responsive:**
- **Mobile (<640px):** Search input takes full width on its own row. Filter selects stack below or collapse into a 'Filters' button that opens a bottom sheet. Active filter chips wrap to multiple lines.
- **Tablet (640-1024px):** Search and primary filters fit in one row. Less common filters in a collapsible section.
- **Desktop (>1024px):** All elements in a single horizontal row. Advanced filters expand inline below the bar.


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


### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Visual brief:** Full-width section dominating the viewport with a bold, large-scale headline centered or left-aligned depending on preset. Generous vertical padding (4-6rem top/bottom) creates breathing room. Subtext sits beneath the headline in muted, lighter-weight type with relaxed line-height. One or two CTA buttons are arranged horizontally with equal height — the primary filled, the secondary ghost-outlined. Optional media (illustration, screenshot, or ambient gradient) appears below or beside the content. Brand preset fills the entire viewport height with decorative floating orbs in the background. Split preset uses a two-column grid with content on one side and media on the other.

**Components:** Button, icon

**Layout slots:**
- `media`: Optional image, illustration, or chart component
- `headline`: Primary heading, typically h1 with _heading1
- `cta-group`: Horizontal Button group with _flex _gap3
- `description`: Supporting paragraph with _body _muted
  **Layout guidance:**
  - note: Hero sections should NOT wrap content in d-surface cards. The hero IS the section. Use d-section for spacing.
  - subtitle: Subtitle line-height should be 1.6-1.8. Use text-muted color, smaller font than heading.
  - container: none
  - background: Hero sections should have a subtle radial or mesh gradient background using the theme palette — not a flat color. Use the primary and accent colors at very low opacity (5-10%) to create depth. Example: radial-gradient(ellipse at top center, rgba(var(--d-accent-rgb), 0.08) 0%, transparent 60%), or a soft gradient from primary to transparent. The gradient should fade to var(--d-bg) at the edges so it blends seamlessly with the page.
  - cta_sizing: Primary and secondary CTAs should have equal padding and height. Primary is filled (d-interactive[data-variant=primary]), secondary is ghost (d-interactive[data-variant=ghost]).
  - ambient_glow: For themes with neon/glow personality, add a soft ambient glow behind the hero heading or CTA area. Use a blurred pseudo-element or box-shadow with the accent color at 10-15% opacity, radius 200-400px. This creates a focal point without overwhelming the content.
  - announcement: If showing an announcement badge above the heading, use d-annotation with prominent styling — not a tiny muted pill. Accent border or accent background at 15% opacity.
  - visual_proof: The visual element below CTAs should be an ambient visualization (animated gradient, particle effect, blurred screenshot) — NOT a data widget wrapped in a card. If showing product data (agents, metrics), render as floating elements without card containment. Omit entirely if no meaningful visual is available.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | CTA buttons scale subtly on hover (scale 1.02). Badge shimmer on announcement pill. |
| transitions | Hero entrance: headline fades up from 20px below with 600ms ease-out. Subtext follows 150ms later. CTAs follow 300ms after subtext. Decorative orbs drift slowly with infinite CSS animation. Brand preset media floats with gentle vertical oscillation. |

**Responsive:**
- **Mobile (<640px):** Single column, stacked vertically. Headline drops to heading2 scale. CTAs stack full-width. Padding reduces to py8 px4. Media goes below content at full width. Min-height removed on brand/vision presets.
- **Tablet (640-1024px):** Content remains centered or stacked. Headline at heading1 scale. CTAs stay horizontal. Split preset still single-column. Padding at py12 px6.
- **Desktop (>1024px):** Full layout as designed — centered or split two-column. Headline at display scale for brand/vision. Generous py16-py24 padding. Split preset activates side-by-side grid. Decorative elements visible.

**Accessibility:**
- Role: `banner`
- Keyboard: Tab to CTA button; Enter activates CTA
- Announcements: Page title announced on load
- Focus: CTA button is the primary focus target


### testimonials

Customer testimonial quotes with avatars, names, roles, and optional company logos

**Visual brief:** Section displaying customer testimonials in a grid of cards. Each card has a large decorative open-quote icon (in muted primary color) at the top-left, followed by the testimonial text in italic body-size type with relaxed line-height. At the bottom of each card, an author row shows a circular avatar (40px), the person's name in medium-weight small text, and their role/company in muted small text. Cards have consistent padding (p6), rounded corners, and subtle border or shadow. The carousel preset shows one testimonial at a time with large centered text, prev/next arrow buttons on either side, and dot navigation indicators below. The featured preset centers a single prominent testimonial with the company logo above the quote.

**Components:** Card, Avatar, Image, icon

**Composition:**
```
Testimonials = Grid(d-section, responsive: 1/2/3-col) > TestimonialCard[]
TestimonialCard = Card(d-surface) > [QuoteIcon(d-annotation) + QuoteText(italic) + AuthorRow > [Avatar + AuthorInfo > [Name(font-medium) + Role(text-muted)] + CompanyLogo?]]
```

**Layout slots:**
- `author`: Row: Avatar (40px) + name (_textsm _fontmedium) + role/company (_textsm _fgmuted)
- `heading`: Optional section heading with _heading2 _textCenter
- `quote-icon`: Large decorative open-quote icon in muted primary color at top
- `quote-text`: Testimonial paragraph with _body _italic _leading[relaxed]
- `testimonial-card`: Card with quote icon, testimonial text, and author row
  **Layout guidance:**
  - card_treatment: Testimonial cards should use d-surface with a thin left border (3px solid) that rotates through accent/primary colors per card. This creates visual variety without inconsistency. Include a large decorative open-quote mark in low-opacity accent color.
  - avatar_treatment: Avatars should have a subtle ring: 2px solid var(--d-primary) with 2px gap (outline-offset). This frames the person and adds polish.
  - section_background: Use a very subtle gradient background: linear-gradient(180deg, var(--d-bg), color-mix(in srgb, var(--d-surface) 30%, var(--d-bg))). This creates visual separation from pricing above without being heavy.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Carousel slides transition with 400ms ease translateX. Auto-play advances every 5s. |
| transitions | Testimonial cards fade in on section enter with 300ms ease. Carousel dot indicators pulse on active transition. |

**Responsive:**
- **Mobile (<640px):** Grid collapses to single column. Cards go full-width. Carousel shows one testimonial with swipe gesture support and dot indicators. Featured preset reduces quote text size. Padding to px4 py8.
- **Tablet (640-1024px):** Two-column grid. Carousel controls visible. Featured preset centered with comfortable max-width.
- **Desktop (>1024px):** Three-column grid with gap6. Carousel shows prev/next buttons on hover. Featured preset at 720px max-width centered.

**Accessibility:**
- Role: `region`
- Keyboard: Tab moves to next/previous carousel controls; Enter or Space activates carousel navigation buttons; Arrow Left/Right navigates between slides in carousel preset
- Announcements: Testimonial {number} of {total}; Slide changed to testimonial by {author}
- Focus: Carousel pauses auto-play when any element within receives focus. Resumes on blur after 3s delay.


### cta-section

Full-width call-to-action section with headline, description, and action buttons

**Visual brief:** Full-width call-to-action section with generous vertical padding (py12) and centered content. A bold heading2-scale headline sits at top, followed by a supporting paragraph in muted text constrained to 640px max-width for readability. Two CTA buttons arranged horizontally below — the primary button filled with brand color, the secondary as a ghost/outlined variant. The section background can carry a subtle gradient, pattern, or elevated surface treatment to stand out from adjacent content sections. The split preset places text and CTA on the left with an illustration or image on the right. The banner preset is a compact horizontal bar with accent background tint, text on the left and a single button on the right.

**Components:** Button

**Layout slots:**
- `headline`: Section heading with _heading2, centered
- `cta-group`: Horizontal Button group with _flex _gap3, primary + secondary
- `description`: Supporting paragraph with _body _fgmuted _mw[640px]
**Responsive:**
- **Mobile (<640px):** Standard preset: content stacks vertically, full-width. CTA buttons stack vertically at full width. Split preset becomes single column with image below text. Banner preset wraps text and button vertically.
- **Tablet (640-1024px):** Standard stays centered. Split preset activates two-column grid. Banner remains horizontal. Padding adjusts to py8.
- **Desktop (>1024px):** Full layout as designed. Standard centered with generous spacing. Split shows two-column with image. Banner compact and horizontal with accent background.


---

## Pages

### games (/games)

Layout: search-filter-bar → filter-bar → card-grid (collection) as game-catalog

### join-guild (/join)

Layout: hero (landing) as join-hero → card-grid (icon) as perks-grid → testimonials → cta-section
