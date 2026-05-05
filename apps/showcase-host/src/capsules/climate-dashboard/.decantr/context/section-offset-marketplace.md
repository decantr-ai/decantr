# Section: offset-marketplace

**Role:** auxiliary | **Shell:** sidebar-main | **Archetype:** offset-marketplace
**Description:** Carbon offset marketplace for browsing verified projects, reviewing details, and completing offset purchases with cart-based checkout.

## Quick Start

**Shell:** Collapsible sidebar with header bar and scrollable main content area. Used by saas-dashboard, financial-dashboard, workbench, ecommerce (account pages). (nav: 240px, header: 52px)
**Pages:** 3 (marketplace, project-detail, checkout)
**Key patterns:** search-filter-bar [moderate], card-grid [moderate], offset-cart [moderate], detail-header [moderate], checkout-flow [moderate]
**CSS classes:** `.earth-nav`, `.earth-card`, `.earth-hero`
**Density:** comfortable
**Voice:** Factual and urgent.

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
| `--d-text` | `#1A2E0A` | Body text, headings, primary content |
| `--d-accent` | `#0F766E` |  |
| `--d-border` | `#E5DFC0` | Dividers, card borders, separators |
| `--d-primary` | `#4D7C0F` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFEF5` | Cards, panels, containers |
| `--d-secondary` | `#92400E` | Secondary brand color, supporting elements |
| `--d-bg` | `#FEFCE8` | Page canvas / base layer |
| `--d-text-muted` | `#6B7A52` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#115E59` |  |
| `--d-primary-hover` | `#3F6212` | Hover state for primary elements |
| `--d-surface-raised` | `#FDF8E0` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#78350F` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.earth-nav` | Spacious natural navigation with generous padding. Warm tones and organic feel. |
| `.earth-card` | Paper-textured card with warm shadow. Soft border and natural color palette create an organic, handcrafted feel. |
| `.earth-hero` | Hero section with organic shape dividers. Wavy or curved bottom edges for natural flow. |
| `.earth-badge` | Muted earth tone badge with rounded corners. Soft backgrounds in greens, ambers, and teals. |
| `.earth-input` | Rounded input with warm border. Natural, inviting form styling with earthy focus ring. |
| `.earth-metric` | Growth-oriented metric display with nature-inspired icon. Leaf or sprout indicator for positive trends. |
| `.earth-section` | Section container with subtle grain texture overlay. Adds tactile quality to flat backgrounds. |
| `.earth-surface` | Warm layered background with cream base. Creates depth through warm tonal variation. |

**Compositions:** **auth:** Centered auth with warm cream background, paper-textured card, and organic border accents.
**blog:** Content-focused blog layout with serif headings, generous whitespace, and paper-like reading experience.
**dashboard:** Sustainability dashboard with organic cards, growth metrics, and nature-inspired data visualization.
**marketing:** Eco-conscious marketing page with organic hero shapes, grain textures, and earthy typography.
**Spatial hints:** Density bias: -1. Section padding: 64px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface earth-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — sidebar-main shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

offsets, marketplace, purchasing

---

## Visual Direction

**Personality:** Carbon accounting and emissions dashboard with organic earth-tone palette. Sankey diagrams show emissions flowing from sources through Scope 1/2/3 categories. Supply chain maps pin suppliers with tier rings showing Scope 3 complexity. Target progress rings track reduction commitments against science-based targets. Regulatory reporting for CSRD, SEC climate rules, Scope 3 disclosure. Lucide icons. Grounded.

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


### offset-cart

A carbon offset marketplace cart with browsable project cards, tonnage selectors, certification badges, and a running impact summary sidebar.

**Visual brief:** A marketplace grid of offset project cards, each showing a high-quality photograph at the top depicting project type (dense forest canopy for reforestation, wind turbines at sunset for renewable, industrial scrubbers for direct air capture, mangrove coastline for blue carbon). Below the image: project name in bold sans-serif, location in muted italic, certification chips arranged in a row (Verra VCS, Gold Standard, CCB, ACR) with small recognisable logos. Cost per tonne displayed prominently in monospace (e.g. '$18.50/tCO2e'), vintage year, and verification status pill (Verified / Pending). A tonnage selector with minus/plus buttons and numeric input sits at the bottom of each card with an 'Add to Cart' button. Right-docked cart sidebar displays total tonnes, total cost, projected impact in monospace, certification mix as tiny stacked bars, and a prominent checkout button. Cart line items show thumbnail, project name, tonnes x rate, and remove button.

**Components:** OffsetProject, ImpactBadge, TonnageSelector, ProjectImage, CertificationChip, TotalImpact

**Composition:**
```
OffsetCart = Section(d-section) > [ProjectGrid > OffsetProject[](d-interactive) + CartSidebar > TotalImpact]
TotalImpact = Panel(d-surface, sticky) > [TotalTonnes(mono) + TotalCost(mono) + CertificationMix + CartLineItem[] + CheckoutButton]
OffsetProject = Card(d-surface, data-interactive) > [ProjectImage + ProjectInfo > [ProjectName + Location + CertificationChip[] + PriceLabel + ImpactBadge] + TonnageSelector + AddToCartButton]
TonnageSelector = InputGroup > [MinusButton + NumberInput + PlusButton]
CertificationChip = Chip(d-annotation, data-standard) > [StandardLogo + StandardName]
```

**Layout slots:**
  **Layout guidance:**
  - note: Project cards use d-interactive with cursor:pointer. Images must maintain 16:9 aspect ratio. Certifications rendered with text labels, not icon-only.
  - currency: All monetary values in monospace with currency symbol prefix. Tonnage values always include tCO2e unit.
  - container: d-section
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| card-hover | elevation raise + image zoom(1.03) 200ms ease-out |
| add-to-cart | button pulse + cart icon bounce 300ms spring |
| cart-add | new line item slide-in from top 400ms ease-out |
| cart-remove | line item slide-out + height collapse 300ms ease-in |
| checkout-pulse | subtle button glow on checkout CTA 2.5s ease-in-out infinite |

**Responsive:**
- **Mobile (<640px):** Project grid becomes single column. Cart summary moves to sticky bottom sheet with expand handle.
- **Tablet (640-1024px):** Project grid 2 columns with cart sidebar remaining docked right.

**Accessibility:**
- Role: `region`
- Keyboard: Tab: cycle through project cards and cart items; Enter: add selected project to cart; Arrow Up/Down: adjust tonnage selector; Delete: remove item from cart when focused
- Announcements: Added {tonnes} tCO2e of {project} to cart; Cart total {tonnes} tCO2e at {cost}


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


### checkout-flow

Complete purchase/subscribe checkout process with payment form, promo codes, order summary, and success confirmation.

**Visual brief:** Two-column layout with an order summary card on the right and a payment form on the left. The summary card shows line items with names and prices, a promo code input field, subtotal, tax, and total in bold. The payment form includes radio buttons for payment method (card, PayPal), card number/expiry/CVC inputs with card brand icon detection, billing address fields, and a prominent submit button at the bottom. Subscribe preset adds plan name and billing cycle selector. Upgrade preset shows a comparison of current vs. new plan.

**Components:** Button, Card, Input, Badge, Radio, icon

**Composition:**
```
PaymentForm = Form(d-surface, flex-col) > [MethodSelect > Radio(d-control)[] + CardInputs > [NumberInput + ExpiryInput + CVCInput] + BillingAddress + SubmitButton(d-interactive, variant: primary, full-width)]
CheckoutFlow = Grid(d-section, 2-col, responsive: stack) > [PaymentForm + OrderSummary]
OrderSummary = Card(d-surface, sticky) > [LineItems > LineItem[] + PromoInput?(d-control) + Subtotal + Tax + Total(heading3, font-bold)]
```

**Layout slots:**
- `terms`: Terms acceptance checkbox
- `submit`: Subscribe/pay button
- `summary`: Tier/order summary card
- `promo-code`: Discount code input
- `payment-form`: Card/payment method inputs
**Responsive:**
- **Mobile (<640px):** Single column layout — order summary moves above the payment form. Submit button is full-width and sticky at the bottom. Card inputs stack vertically.
- **Tablet (640-1024px):** Two-column layout maintained. Summary panel is narrower. Payment form takes majority width.
- **Desktop (>1024px):** Standard two-column layout with comfortable spacing. Summary card is sticky within its column on scroll.


---

## Pages

### marketplace (/offsets)

Layout: search-filter-bar → card-grid → offset-cart

### project-detail (/offsets/:id)

Layout: detail-header → card-grid

### checkout (/offsets/checkout)

Layout: checkout-flow → offset-cart
