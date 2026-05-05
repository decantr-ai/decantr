# Section: marketing-health

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-health
**Description:** Public marketing landing page for a health and wellness portal. Split hero, feature highlights, patient testimonials, and call-to-action sections.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** hero-split, features, testimonials [moderate], cta-section
**CSS classes:** `.health-nav`, `.health-card`, `.health-alert`
**Density:** comfortable
**Voice:** Caring, clear, and professional.

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
| `--d-text` | `#0F172A` | Body text, headings, primary content |
| `--d-accent` | `#7C3AED` |  |
| `--d-border` | `#E2E8F0` | Dividers, card borders, separators |
| `--d-primary` | `#0284C7` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-secondary` | `#0D9488` | Secondary brand color, supporting elements |
| `--d-bg` | `#FAFAF8` | Page canvas / base layer |
| `--d-text-muted` | `#64748B` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#6D28D9` |  |
| `--d-primary-hover` | `#0369A1` | Hover state for primary elements |
| `--d-surface-raised` | `#F5F7FA` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#0F766E` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.health-nav` | Clean spacious navigation with generous spacing. Clear active states and focus indicators. |
| `.health-card` | White card with subtle shadow and large 12px radius. Clean, spacious padding for medical content readability. |
| `.health-alert` | Left-border severity stripe (4px) with tinted background. Color indicates severity: info, warning, critical. |
| `.health-badge` | Rounded pill badge with tinted semantic background. Always includes text label for accessibility. |
| `.health-input` | Large input with generous 14px padding. Clear focus ring for accessibility. Designed for clinical data entry. |
| `.health-metric` | Large prominent number with color-coded status dot indicator. Used for vitals, lab results, and patient stats. |
| `.health-status` | Color-coded status with always-visible text label. Never relies on color alone per WCAG guidelines. |
| `.health-surface` | Warm white background with minimal 1px border. Creates gentle separation without harsh contrast. |

**Compositions:** **auth:** Centered authentication forms with clean card styling. HIPAA-compliant login with MFA support.
**clinical:** Clinical data entry and review. Dense but readable layouts with large inputs and clear labels.
**dashboard:** Patient dashboard with sidebar navigation. Vitals overview, appointments, medication schedule, and health metrics.
**marketing:** Healthcare marketing pages with trust signals. Professional hero sections and feature grids.
**patient-portal:** Patient-facing portal with top navigation. Simplified interface for appointments, records, and messaging.
**Spatial hints:** Density bias: -1. Section padding: 48px. Card wrapping: subtle.


Usage: `className={css('_flex _col _gap4') + ' d-surface healthcare-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing, seo

---

## Visual Direction

**Personality:** Calming, trust-building health portal with emphasis on clarity and accessibility. Soft blues and teals on warm white backgrounds. Large, readable typography — nothing small or dense. Vitals use color-coded status indicators always supplemented with text labels. Appointment booking is straightforward. Telehealth rooms are calm and functional. Document vault feels secure. Every interaction prioritizes patient confidence. Lucide icons. WCAG AAA compliance throughout.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### hero-split

Split hero section with media (logo or image) on one side and text with CTAs on the other. Supports breathing gradient orbs background, pill-shaped buttons, and responsive stacking. The split layout places emphasis on brand identity alongside a clear value proposition.

**Visual brief:** Two-column section with a media area (logo or hero image) taking roughly one-third width on the left and a text content area on the right. The text area contains a large primary heading with accent-colored punctuation, a supporting tagline paragraph with accent-colored inline spans, and a row of pill-shaped CTA buttons (primary filled, secondary outlined). Background features breathing gradient orbs with slow animation. Reversed preset flips the columns. Centered preset stacks both columns vertically with centered alignment.

**Components:** Button, Image

**Layout slots:**
- `title`: Large heading with _heading1 _fw800 _lh[1.1] _ls[-0.03em] _mb7. Supports inline accent color spans for punctuation or keywords.
- `tagline`: Supporting paragraph with _body _fgmuted/60 _mw[540px] _lh[1.75] _mb10. Supports inline accent spans with _fgprimary _fw700 _italic.
- `cta-group`: Horizontal button group with _flex _gap4 _flexwrap. Contains primary pill Button (rounded-full, shadow) and ghost pill Button (border, transparent bg).
- `media-area`: Left column at flex: 0 0 35%, centered content. Contains logo or hero image with float animation and drop-shadow. Wrapper: _flex _items[center] _justify[center]
**Responsive:**
- **Mobile (<640px):** Columns stack vertically — media on top, text content below. CTA buttons go full-width stacked. Gradient orbs scale down or simplify.
- **Tablet (640-1024px):** Side-by-side layout maintained with tighter proportions. Media area shrinks to 40% width.
- **Desktop (>1024px):** Full split layout with generous whitespace. Media at one-third, content at two-thirds. Orbs animate at full size.


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

Layout: hero-split → features → testimonials → cta-section
