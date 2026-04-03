# Section: cloud-marketing

**Role:** public | **Shell:** full-bleed | **Archetype:** cloud-marketing
**Description:** Marketing landing page for cloud and infrastructure platforms

## Quick Start

**Shell:** No persistent navigation. Scroll-driven hero-first layout. Used by portfolio landing pages. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** hero, card-grid [moderate], cta-section, footer
**CSS classes:** `.lp-nav`, `.lp-header`, `.lp-fade-in`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and trustworthy.

## Shell Implementation (full-bleed)

### body

- **flex:** 1
- **note:** Full-width sections stack vertically. Each section is full viewport height or auto. Sections own their own padding. Natural document scroll, no scroll container.
- **atoms:** _flex _col
- **direction:** column

### root

- **atoms:** _flex _col
- **display:** flex
- **direction:** column

### header

- **top:** 0
- **left:** 0
- **note:** Floating nav overlays hero. No border, transparent background.
- **align:** center
- **atoms:** _fixed _top0 _left0 _wfull _flex _aic _jcsb _px8 _py4 _z[40]
- **width:** 100%
- **height:** 52px
- **display:** flex
- **justify:** space-between
- **padding:** 0 2rem
- **z_index:** 40
- **position:** fixed
- **background:** transparent
- **left_content:** Brand/logo link
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** Nav links — flex with gap 1.5rem

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

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
| `--d-text` | `#F0EEF8` | Body text, headings, primary content |
| `--d-border` | `#2E2848` | Dividers, card borders, separators |
| `--d-primary` | `#9F6EFF` | Brand color, key interactive, selected states |
| `--d-surface` | `#141020` | Cards, panels, containers |
| `--d-bg` | `#0C0A14` | Page canvas / base layer |
| `--d-text-muted` | `#9890B0` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#B08AFF` | Hover state for primary elements |
| `--d-surface-raised` | `#1C1830` | Elevated containers, modals, popovers |
| `--d-accent` | `#06B6D4` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.lp-nav` | Sticky navigation with blur backdrop. Minimal branding. |
| `.lp-header` | Large hero with gradient mesh background. |
| `.lp-fade-in` | Simple fade-in on scroll, 0.4s duration. |
| `.lp-surface` | Base surface with subtle texture. Light mode: #FAFAFA, Dark mode: #111111. |
| `.lp-card-elevated` | Card with elevation shadow, hover lift effect. |
| `.lp-gradient-mesh` | Subtle gradient mesh in primary/accent colors at 5% opacity. |
| `.lp-button-primary` | Solid primary color button with hover scale. |

**Spatial hints:** Density bias: none. Section padding: 96px. Card wrapping: standard.


Usage: `className={css('_flex _col _gap4') + ' d-surface launchpad-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — full-bleed shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Visual Direction

**Personality:** Enterprise-grade cloud console built for reliability and scale. Clean, systematic layout with a left sidebar for service navigation. Status indicators use semantic colors — green healthy, amber degraded, red incident. Deploy logs stream in monospace with ANSI color support. Usage charts are functional, not decorative. Dense data tables with sort, filter, and bulk actions. Think AWS Console meets Vercel — powerful but approachable. Every view should feel like a control plane.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

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


### footer

Page footer with link columns, social icons, and copyright notice.

**Visual brief:** Full-width footer section with a top border separating it from page content. The standard preset uses a multi-column grid layout: 3-4 columns of link groups, each headed by an uppercase, small, bold, muted label (e.g. 'Product', 'Company', 'Resources'). Links beneath each heading are regular-weight, muted text that brightens on hover. Below the columns, a bottom bar contains the logo or brand name on the left with a copyright line, and social media icon links (GitHub, Twitter, LinkedIn) on the right. The simple preset is a single horizontal row with inline links on one side and copyright on the other. Background uses the page surface color or a slightly darker shade.

**Components:** Link, icon

**Layout slots:**
- `columns`: Grid of link groups: _grid _gc2 _md:gc4 _gap6
- `bottom-bar`: Horizontal bar: logo/copyright left, social icons right with _flex _jcsb _aic
- `column-links`: Vertical list of links with _flex _col _gap2
- `social-icons`: Row of social media icon links with _flex _gap3
- `column-heading`: Group heading with _textsm _fontbold _fgmuted _uppercase _tracking[wider]
**Responsive:**
- **Mobile (<640px):** Link columns stack to 2-column grid (gc2). Bottom bar stacks vertically — copyright above, social icons below, both centered. Padding reduces to px4 py6.
- **Tablet (640-1024px):** Three or four columns depending on content. Bottom bar stays horizontal. Comfortable spacing.
- **Desktop (>1024px):** Full four-column grid with generous gap6 spacing. Bottom bar horizontal with logo left, social right. Full px6 py8 padding.


---

## Pages

### home (/)

Layout: hero (brand) as brand-hero → card-grid (icon) as feature-grid → logo-strip (marquee) as tech-logos → card-grid (icon) as capability-grid → stats-section (hero) as platform-stats → cta-section (brand) as enterprise-cta → footer (minimal) as footer
