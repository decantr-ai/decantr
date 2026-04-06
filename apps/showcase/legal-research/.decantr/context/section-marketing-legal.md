# Section: marketing-legal

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-legal
**Description:** Public marketing landing surface for a legal research platform with hero, feature grid, testimonials, and final call to action.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** hero, features, testimonials [moderate], cta-section
**CSS classes:** `.counsel-page`, `.counsel-seal`, `.counsel-header`, `.mono-data`
**Density:** comfortable
**Voice:** Formal and precise.

## Shell Implementation (top-nav-footer)

### body

- **flex:** 1
- **note:** Full-width sections stack vertically. Each section uses d-section with --d-section-py. Body has NO padding — sections own their spacing. Natural document scroll.
- **padding:** none

### root

- **atoms:** _flex _col _minh[100vh]
- **display:** flex
- **direction:** column
- **min_height:** 100vh

### footer

- **note:** Multi-column footer with link groups and legal.
- **border:** top
- **padding:** 2rem 1.5rem
- **position_within:** bottom (mt-auto for short pages)

### header

- **align:** center
- **border:** bottom
- **height:** 52px
- **sticky:** true
- **display:** flex
- **justify:** space-between
- **padding:** 0 1.5rem
- **z_index:** 10
- **background:** var(--d-bg)
- **left_content:** Brand/logo
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.
- **right_content:** CTA button + mobile hamburger. Hamburger ONLY below md breakpoint.
- **center_content:** Nav links — flex with gap 1.5rem. Hidden below md, visible above.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Shell Notes (top-nav-footer)

- **Cta Sections:** CTA sections at the bottom of marketing pages should stand out visually — subtle background gradient or glass effect, not just a plain card.
- **Section Labels:** Section overline labels (CAPABILITIES, HOW IT WORKS) should be uppercase, small, accent-colored, center-aligned, with letter-spacing: 0.1em. Use d-label class with text-align: center.
- **Section Spacing:** Marketing sections use spacious density. Each d-section uses full --d-section-py padding.

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
| `--d-text` | `#1C1917` | Body text, headings, primary content |
| `--d-accent` | `#991B1B` |  |
| `--d-border` | `#D6CFC0` | Dividers, card borders, separators |
| `--d-primary` | `#1E3A5F` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#7F1D1D` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAF7F2` | Page canvas / base layer |
| `--d-text-muted` | `#6B6054` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#7F1D1D` |  |
| `--d-primary-hover` | `#14284A` | Hover state for primary elements |
| `--d-surface-raised` | `#F4F0E8` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#991B1B` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.counsel-page` | Warm cream document page (#FAF7F2) with generous margins and serif body text. Document-inspired foundation. |
| `.counsel-seal` | Official seal with ribbon embellishment in navy and oxblood. Authority and certification mark. |
| `.counsel-header` | Georgia or Garamond serif heading with deep navy color. Formal section and page headers. |
| `.counsel-margin` | Annotation margin area with dashed divider for notes and references. Legal pad aesthetic. |
| `.counsel-divider` | Thin horizontal rule with warm border tone for clean section separation. |
| `.counsel-oxblood` | Deep oxblood red accent elements for emphasis, warnings, and critical status indicators. |
| `.counsel-citation` | Indented citation blocks with left border accent and italic serif type. Legal reference styling. |
| `.counsel-highlight` | Subtle highlight on key text using warm cream background tint. Marks important passages. |

**Compositions:** **document:** Legal document viewer with serif body, citation styling, and annotation margins.
**marketing:** Law firm marketing page with authoritative serif headlines and seal branding.
**client-portal:** Client portal with case status, document access, and secure messaging.
**case-dashboard:** Legal case dashboard with matter listings, docket calendar, and client directory.
**Spatial hints:** Density bias: none. Section padding: 72px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface counsel-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing

---

## Visual Direction

**Personality:** Authoritative legal research workspace with warm cream backgrounds and deep navy accents. Serif body typography with monospace case citations. Citation graphs visualize case law networks showing which decisions cite which. Contract diffs reveal redlining with author attribution in margins. Matter cards track billable hours and deadlines with urgency indicators. Lucide icons. Scholarly.

**Personality utilities available in treatments.css:**
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps

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


### features

Feature showcase grid with icon, heading, and description for each feature

**Visual brief:** Grid of feature cards showcasing product capabilities. Each card contains a rounded background circle (48px) holding a feature icon in primary or accent color, a feature heading in medium-weight heading4 text below the icon, and a 2-3 line description in smaller muted text. Cards are evenly distributed in a 3-column grid with consistent gap6 spacing. Cards can be contained surfaces with padding and border, or borderless blocks that rely on spacing alone. An optional centered section heading and subtext sit above the grid. The alternating preset uses wide two-column rows instead — text on one side with a heading, description paragraph, and optional 'Learn more' link, and an image or illustration on the other, with the sides alternating each row. The icon-list preset is a compact single-column list with inline icons.

**Components:** Card, icon

**Layout slots:**
- `heading`: Optional section heading with _heading2 _textCenter and subtext
- `feature-card`: Card or borderless block: icon + heading + description
- `feature-icon`: Icon in a rounded background circle (48px) with muted primary fill
- `feature-title`: Feature name with _heading4 _fontmedium
- `feature-description`: Short explanation with _bodysm _fgmuted, 2-3 lines
  **Layout guidance:**
  - card_treatment: Feature cards should use a subtle border (1px solid var(--d-border)) with a soft hover effect: translateY(-2px) + border-color transitions to primary on hover. Do NOT use heavy shadows — keep it flat and clean with border-based elevation.
  - icon_treatment: Feature icons should sit inside a rounded-lg container with a tinted background: background: color-mix(in srgb, var(--d-accent) 10%, transparent). The icon itself uses var(--d-accent) color. This creates a subtle brand-tinted icon well.
  - section_background: Alternate section background from the hero — if hero fades to var(--d-bg), features should have a slightly elevated background: var(--d-surface) or a 2% lighter shade, creating visual rhythm between sections.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Feature cards lift on hover with translateY(-2px) and subtle shadow increase over 200ms ease. |
| transitions | Cards stagger in on section enter with fade-up (translateY(12px) to 0) at 300ms ease, 80ms stagger delay per card. |

**Responsive:**
- **Mobile (<640px):** Single column. Feature cards stack vertically full-width. Icons center above text or align left in a row layout. Alternating preset stacks to single column with image above text. Gap reduces to gap4.
- **Tablet (640-1024px):** Two-column grid. Alternating preset activates side-by-side layout. Icon-list stays single column. Comfortable spacing.
- **Desktop (>1024px):** Three-column grid for standard. Alternating preset at full two-column width with generous gap8. Icon-list centered at 640px max-width.

**Accessibility:**
- Role: `region`
- Keyboard: Tab navigates between feature cards; Shift+Tab navigates backwards between feature cards
- Announcements: Feature section with {count} items; Feature: {title}


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

### home (/)

Layout: hero → features → testimonials → cta-section
