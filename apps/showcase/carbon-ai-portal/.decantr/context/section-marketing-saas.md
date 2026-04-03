# Section: marketing-saas

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-saas
**Description:** SaaS marketing landing page with hero, features, how-it-works timeline, pricing, testimonials, and CTA sections.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** hero, features, how-it-works, pricing [moderate], testimonials [moderate], cta
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`, `.mono-data`
**Density:** comfortable
**Voice:** Intelligent and measured.

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
| `--d-text` | `#FAFAFA` | Body text, headings, primary content |
| `--d-border` | `#3F3F46` | Dividers, card borders, separators |
| `--d-primary` | `#7C93B0` | Brand color, key interactive, selected states |
| `--d-surface` | `#1F1F23` | Cards, panels, containers |
| `--d-bg` | `#18181B` | Page canvas / base layer |
| `--d-text-muted` | `#A1A1AA` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#8CA3C0` | Hover state for primary elements |
| `--d-surface-raised` | `#27272A` | Elevated containers, modals, popovers |
| `--d-accent` | `#6B8AAE` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.carbon-card` | Surface background, subtle border, 8px radius, hover shadow transition. |
| `.carbon-code` | Monospace font, surface-raised background, subtle 3px left border accent in primary color. |
| `.carbon-glass` | Glassmorphic panel with backdrop-filter blur(12px), semi-transparent surface background, 1px border. Use for nav bars, sidebars, floating panels. |
| `.carbon-input` | Soft border with gentle focus ring using primary blue. Border transitions on focus. |
| `.carbon-canvas` | Background color using theme background token. Clean, minimal foundation. |
| `.carbon-divider` | Hairline separator using border-color token. |
| `.carbon-skeleton` | Loading placeholder with subtle pulse animation for skeleton states. |
| `.carbon-bubble-ai` | Left-aligned message bubble with surface background for AI responses. |
| `.carbon-fade-slide` | Entrance animation: opacity 0 to 1, translateY 12px to 0, 200ms ease-out. |
| `.carbon-bubble-user` | Right-aligned message bubble with primary-tinted background for user messages. |

**Compositions:** **auth:** Centered auth forms with clean card styling.
**chat:** Chat interface with conversation list sidebar and message thread. Anchored input at bottom.
**marketing:** Marketing pages with top nav and footer. Clean sections with subtle separators.
**Spatial hints:** Density bias: none. Section padding: 80px. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface carbon-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

pricing-toggle, testimonials, feature-grid

---

## Visual Direction

**Personality:** Production-ready AI chatbot with refined glassmorphic depth. Muted stormy-blue palette with soft drop shadows and subtle backdrop blur on panels. Lucide icons throughout. Rich typographic hierarchy — Inter or system sans-serif for body, monospace for code and data. Polished form fields with visible focus rings, smooth hover-lift transitions on cards and buttons. No emoji in UI. Think Claude meets Linear.

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


### how-it-works

Step-by-step process section with numbered steps, descriptions, and optional connecting lines

**Visual brief:** Step-by-step process section with numbered steps arranged horizontally. Each step features a prominent circular number badge (48px diameter) with primary-color background and white bold text, a step title in heading4 weight below the circle, and a 2-3 line description in muted small text. Steps are connected by thin horizontal lines or subtle arrows running between the number circles at their vertical center, creating a visual flow from left to right. Typically 3-4 steps in a row. A centered section heading and subtext sit above the steps. The vertical preset arranges steps in a timeline format with a continuous vertical line on the left, number circles overlapping the line, and step content (title + description) to the right. The icon-steps preset replaces numbers with feature icons in larger rounded background circles.

**Components:** icon

**Layout slots:**
- `step`: Individual step block: number circle + title + description
- `heading`: Section heading with _heading2 _textCenter and optional subtext
- `connector`: Horizontal line or arrow connecting step circles, rendered via CSS pseudo-elements or a border
- `step-title`: Step heading with _heading4 _fontmedium
- `step-number`: Circled number (48px) with primary background and white text, or bordered circle with primary text
- `step-description`: Step explanation with _bodysm _fgmuted
  **Layout guidance:**
  - step_numbers: Step number circles should use background: var(--d-primary) with white text (or accent bg with dark text for neon themes). Size: 48px diameter, font-weight: bold. Active/current step should pulse subtly.
  - connector_line: Draw a horizontal connecting line (2px, var(--d-border)) between the step circles. On mobile (stacked), use a vertical line on the left side. The line should be dashed or use a gradient fade at the ends.
  - section_background: Use var(--d-bg) background (same as hero) to create a visual pairing with the hero section. This groups hero + how-it-works as the "above the fold" narrative.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Step connector lines draw in from left to right with 400ms ease as each step enters viewport. |
| transitions | Steps stagger in on section enter with fade-up (translateY(12px) to 0) at 300ms ease, 120ms stagger delay per step. |

**Responsive:**
- **Mobile (<640px):** Steps stack vertically regardless of preset. Number circles align left with content to the right (timeline style). Connecting lines become vertical. Horizontal connectors hidden. Text left-aligned. Gap reduces to gap6.
- **Tablet (640-1024px):** Horizontal preset shows 3 columns. Connectors visible. Vertical preset centered at comfortable width. Standard spacing.
- **Desktop (>1024px):** Full horizontal row with visible connecting lines between step circles. Generous gap8 spacing. Section centered with py12 padding.

**Accessibility:**
- Role: `list`
- Keyboard: Tab navigates between steps; Shift+Tab navigates backwards between steps
- Announcements: Step {number} of {total}: {title}; Process overview with {total} steps


### pricing

Pricing tier cards with plan comparison, billing toggle, and CTA buttons

**Visual brief:** Three pricing tier cards in a responsive row, centered on the page. The recommended tier (typically the middle card) is visually elevated with a highlighted border in primary color, slightly larger scale (scale 1.02), and a 'Popular' or 'Recommended' badge at the top corner. Each card shows: the plan name as a heading4, the price in large monospace text (heading1 scale) with the billing period in small muted text below, a feature checklist with green checkmark icons for included features and muted X icons for excluded ones, and a full-width CTA button at the card bottom. The recommended tier uses the primary filled button variant; other tiers use ghost. A monthly/annual billing toggle is centered above the cards with a pill-style active state and the annual option showing a small 'Save 20%' badge. The section has generous vertical padding and a centered heading above everything.

**Components:** Card, Button, Badge, Switch, icon

**Composition:**
```
PricingTier = Card(d-surface, elevated?: tier.recommended) > [PlanName(heading4) + Badge?(d-annotation, show: tier.recommended) + Price(mono-data, heading1) + Period(text-muted) + FeatureList > CheckItem(icon: check)[] + CTAButton(d-interactive, variant: tier.recommended ? primary : ghost, full-width)]
BillingToggle = Toggle(d-control) > [MonthlyLabel + Switch + AnnualLabel + SaveBadge?(d-annotation)]
PricingSection = Container(d-section, centered) > [Heading(heading2) + BillingToggle(d-control, pill) + TierGrid > PricingTier[]]
```

**Layout slots:**
- `cta`: Full-width Button per tier — primary variant for recommended, ghost for others
- `tiers`: Horizontal row of tier Cards: _grid _gc1 _md:gc3 _gap4 _aic
- `toggle`: Monthly/Annual billing toggle with pill-style active indicator
- `heading`: Section title with _heading2 _textCenter and optional subtext
- `tier-card`: Individual Card: plan name (_heading4), price (_heading1 _fontmono), billing period, feature checklist, CTA Button
- `feature-list`: Checklist of features with checkmark icons and _textsm
  **Layout guidance:**
  - card_glow: For neon/glow themes, the recommended tier gets a subtle box-shadow glow: 0 0 30px rgba(var(--d-primary-rgb), 0.15). This draws the eye without being garish.
  - toggle_treatment: The annual/monthly toggle should be a pill-style toggle with the active option using var(--d-primary) background. Show the savings percentage ("Save 20%") as a small accent-colored badge next to the annual option.
  - recommended_treatment: The recommended/popular tier card should be visually elevated: scale(1.02) or extra top padding, a primary-colored top border (3px solid var(--d-primary)), and the Popular badge using d-annotation[data-status=info]. The other tier cards should be subtly muted in comparison.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | Tier cards lift on hover with translateY(-4px) and increased shadow over 200ms. CTA buttons brighten on hover. Toggle pill slides between states with 250ms ease. |
| transitions | Cards fade in and slide up with staggered delay (100ms per card) on section enter. Price value animates (counter-style) when toggling between monthly and annual. Badge pulses once on toggle change. |

**Responsive:**
- **Mobile (<640px):** Tier cards stack vertically in a single column. Recommended tier stays visually elevated but at full width. Toggle stays centered. Alternatively, tiers display as a horizontal carousel with snap-scrolling and dot indicators below. CTA buttons go full-width.
- **Tablet (640-1024px):** Three columns at reduced gap. Cards may be slightly narrower. Toggle and heading stay centered. Feature lists may truncate to top 5 items with 'See all features' link.
- **Desktop (>1024px):** Full three-column row with comfortable gap6 spacing. Recommended tier elevated. All features visible. Toggle and heading centered above. Section padding at py16.

**Accessibility:**
- Role: `region`
- Keyboard: Tab navigates between tier cards and their CTA buttons; Shift+Tab navigates backwards; Enter or Space activates billing toggle or CTA button; Arrow Left/Right navigates between tiers
- Announcements: {plan_name} plan: {price} per {period}; Billing changed to {period}, price updated to {price}; Recommended plan: {plan_name}
- Focus: On billing toggle change, price values are announced via aria-live polite region. Focus remains on the toggle after change.


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


### cta

Prominent call-to-action section with headline, supporting text, and action buttons

**Visual brief:** Full-width call-to-action section designed to drive user action. The standard preset centers a bold heading2-scale headline, a supporting paragraph in muted text constrained to 640px max-width, and two horizontally-arranged CTA buttons — primary filled and secondary ghost-outlined. The section has generous vertical padding (py12) and can carry a subtle gradient background, pattern texture, or elevated surface treatment to visually distinguish it from surrounding content. The split preset places the text and CTAs on the left column with an illustration, screenshot, or decorative image on the right. The banner preset is a compact single-row bar with a tinted background (primary at 10% opacity), text on the left, and a single action button on the right — useful as an inline CTA between content sections.

**Components:** Button, icon

**Layout slots:**
- `headline`: Section heading with _heading2, centered
- `cta-group`: Horizontal Button group with _flex _gap3, primary + secondary
- `description`: Supporting paragraph with _body _fgmuted _mw[640px]
  **Layout guidance:**
  - urgency: Add a subtle visual urgency element — a small line of muted text below the button like "Free for teams up to 5 agents" or a trust indicator row (logos or badges). This prevents the CTA from feeling empty.
  - button_treatment: The primary CTA button should be larger than standard buttons (py-3 px-8, text-lg). For neon themes, add a subtle glow on hover: box-shadow: 0 0 20px rgba(var(--d-primary-rgb), 0.3).
  - background_treatment: CTA section should stand out from the rest of the page. Use a gradient background: linear-gradient(135deg, color-mix(in srgb, var(--d-primary) 8%, var(--d-bg)), color-mix(in srgb, var(--d-accent) 5%, var(--d-bg))). Or use a glassmorphic surface with backdrop-blur.
**Motion:**
| Interaction | Animation |
|-------------|-----------|
| micro | CTA button pulses with subtle scale(1.02) and shadow increase on idle after 3s, 1.5s duration loop. Button brightens on hover over 150ms. |
| transitions | Section content fades up (translateY(16px) to 0, opacity 0 to 1) on viewport enter with 400ms ease. |

**Responsive:**
- **Mobile (<640px):** Standard: content stacks vertically, full-width. CTA buttons stack vertically at full width, primary on top. Split: becomes single column with image below text. Banner: wraps text and button vertically with centered alignment. Padding reduces to py8 px4.
- **Tablet (640-1024px):** Standard stays centered with comfortable width. Split activates two-column grid. Banner remains horizontal. Padding at py10.
- **Desktop (>1024px):** Full layout — standard centered with py12. Split shows side-by-side columns with gap6. Banner compact horizontal with accent background.

**Accessibility:**
- Role: `complementary`
- Keyboard: Tab navigates to CTA buttons; Enter or Space activates the focused CTA button
- Announcements: Call to action section; Primary action: {button_text}
- Focus: Primary CTA button receives visible focus ring on Tab. Focus order: headline, description, primary button, secondary button.


---

## Pages

### home (/)

Layout: hero → features → how-it-works → pricing → testimonials → cta
