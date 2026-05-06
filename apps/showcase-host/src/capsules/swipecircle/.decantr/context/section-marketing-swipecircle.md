# Section: marketing-swipecircle

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-swipecircle
**Description:** Public marketing landing page for SwipeCircle — a mobile-first swipe-based social rating community. Photo-first hero with 'Rate. Connect. Vibe.' tagline, dual sign-up/log-in CTAs plus a demo mode entry, feature highlights showing the swipe loop, social proof, and a final conversion CTA. Optimized for casual consumer first-impressions.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** hero-split, cta-section, features, how-it-works, testimonials [moderate], footer
**Theme decorators:** 10 classes — see `section-marketing-swipecircle-pack.md` for the Class | Intent | Apply-to contract
**Density:** comfortable
**Voice:** Playful, warm, encouraging — never desperate, never pushy.

## Shell Implementation (top-nav-footer)

### root

- **display:** flex
- **direction:** column
- **min_height:** 100vh
- **atoms:** _flex _col _minh[100vh]

### header

- **height:** 52px
- **display:** flex
- **align:** center
- **justify:** space-between
- **padding:** 0 1.5rem
- **border:** bottom
- **sticky:** true
- **z_index:** 10
- **background:** var(--d-bg)
- **left_content:** Brand/logo
- **center_content:** Nav links — flex with gap 1.5rem. Hidden below md, visible above.
- **right_content:** CTA button + mobile hamburger. Hamburger ONLY below md breakpoint.
- **button_sizing:** Buttons in the header use compact sizing: py-1.5 px-3 text-sm (~32px tall). The header is a tight 52px bar — default d-interactive padding is too large here.

### body

- **flex:** 1
- **padding:** none
- **note:** Full-width sections stack vertically. Each section uses d-section with --d-section-py. Body has NO padding — sections own their spacing. Natural document scroll.

### footer

- **border:** top
- **padding:** 2rem 1.5rem
- **position_within:** bottom (mt-auto for short pages)
- **note:** Multi-column footer with link groups and legal.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: comfortable (--d-density-scale: 1)

## Shell Notes (top-nav-footer)

- **Section Spacing:** Marketing sections use spacious density. Each d-section uses full --d-section-py padding.
- **Section Labels:** Section overline labels use d-label for uppercase, accent-colored headers with density-responsive spacing.
- **Cta Sections:** CTA sections at the bottom of marketing pages should stand out visually — subtle background gradient or glass effect, not just a plain card.
- **Shell Spacing:** Header, body sections, and footer should feel like one coherent public shell. Let the shell own horizontal inset rhythm and footer spacing instead of layering extra page-local wrappers.

## Theme Reference

**Theme:** swipecircle (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 10 `swipecircle-*` classes — full Class/Intent/Apply-to table in `section-marketing-swipecircle-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** hero-split
**Compositions:** **swipe-feed:** Photo-first swipe deck centered in the viewport with floating action bar above bottom tabs. Coral and violet accents punctuate the warm peach surface.
**matches:** Grid of circular avatar tiles with new-match dots, presence rail at top. Soft tile lift on hover with coral glow.
**chat:** Intimate one-to-one chat with rounded bubbles and warm timestamps. Coral mine, cream theirs.
**profile:** Mobile profile with full-bleed cover photo, overlapping circular avatar, stats bar, interest pills, and pill-shaped action buttons.
**auth:** Single centered card on warm peach background. Coral primary CTA, violet hover state. Bouncy entrance.
**marketing:** Splash with photo-first hero, swipe-card/photo mockups, pill CTAs, warm off-white scroll surface, and coral/violet accents. Friendly, not corporate. Avoid ambient blobs/orbs or a single solid peach hero slab.
**Spatial hints:** Density bias: none. Section padding: 1.5rem. Card wrapping: rounded-photo.


Usage: `className={css('_flex _col _gap4') + ' d-surface swipecircle-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing, seo, conversion, demo-mode

---

## Visual Direction

**Personality:** Mobile-first social discovery with playful coral-pink energy and warm peach undertones. Photo-centric swipe deck dominates the screen — cards feel tactile, almost like polaroids you'd shuffle through. Pill-shaped buttons everywhere with bouncy spring physics. Soft drop shadows replace harsh borders. Bottom tabs provide always-visible navigation. Match moments feel celebratory with a coral-to-violet burst; chats feel intimate with rounded bubbles and warm timestamps. Empty states encourage rather than scold. Designed to feel native on iPhone but elegantly scaled on desktop with a 480px-wide centered column. Hinge meets BeReal meets a Dribbble shot — never desperate, always inviting. Every interaction rewards: the spring of a card, the burst of a like, the warmth of a new match.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Constraints

- **mode:** light
- **effects:** {"max_width_app":"480px","photo_aspect":"3/4","tab_bar_height":"64px","header_height":"52px","swipe_threshold":"30%","card_size":"320x420"}

---

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### hero-split

Split hero section with media (logo, screenshot, product image, or photo mockup) on one side and text with CTAs on the other. Supports pill-shaped buttons, responsive stacking, and subtle background tinting when the theme calls for it. The split layout places emphasis on brand identity alongside a clear value proposition.

**Components:** Button, Image

**Layout slots:**
- `media-area`: Left column at flex: 0 0 35%, centered content. Contains logo or hero image with float animation and drop-shadow. Wrapper: _flex _items[center] _justify[center]
- `title`: Large heading with _heading1 _fw800 _lh[1.1] _ls[-0.03em] _mb7. Supports inline accent color spans for punctuation or keywords.
- `tagline`: Supporting paragraph with _body _fgmuted/60 _mw[540px] _lh[1.75] _mb10. Supports inline accent spans with _fgprimary _fw700 _italic.
- `cta-group`: Horizontal button group with _flex _gap4 _flexwrap. Contains primary pill Button (rounded-full, shadow) and ghost pill Button (border, transparent bg).
  **Layout guidance:**
  - narrative_split: The media side should support the value proposition, not compete with it. Preserve a clear left-right hierarchy where one side establishes proof or brand and the other carries the decision-making copy.
  - cta_rhythm: Primary and secondary actions should read as one compact decision cluster below the core message rather than stretching the hero vertically.
  - mobile_stack: When stacked, keep media, heading, supporting copy, and CTAs in a confident narrative order so the hero still feels intentional on small screens.

### cta-section

Full-width call-to-action section with headline, description, and action buttons

**Components:** Button

**Layout slots:**
- `headline`: Section heading with _heading2, centered
- `description`: Supporting paragraph with _body _fgmuted _mw[640px]
- `cta-group`: Horizontal Button group with _flex _gap3, primary + secondary
  **Layout guidance:**
  - shell_rhythm: CTA sections should feel like a deliberate break in the page rhythm, but they still inherit the shell-owned width and spacing system. Do not add extra page wrappers around them.
  - cta_priority: The primary CTA must be visually dominant, but secondary CTAs should still feel aligned and intentional rather than like an afterthought.
  - background_treatment: Use a distinct but controlled background treatment so the CTA reads as a purposeful moment, not as a random card dropped into the page.

### features

Feature showcase grid with icon, heading, and description for each feature

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

### how-it-works

Step-by-step process section with numbered steps, descriptions, and optional connecting lines

**Components:** icon

**Layout slots:**
- `heading`: Section heading with _heading2 _textCenter and optional subtext
- `step`: Individual step block: number circle + title + description
- `step-number`: Circled number (48px) with primary background and white text, or bordered circle with primary text
- `step-title`: Step heading with _heading4 _fontmedium
- `step-description`: Step explanation with _bodysm _fgmuted
- `connector`: Horizontal line or arrow connecting step circles, rendered via CSS pseudo-elements or a border
  **Layout guidance:**
  - connector_line: Draw a horizontal connecting line (2px, var(--d-border)) between the step circles. On mobile (stacked), use a vertical line on the left side. The line should be dashed or use a gradient fade at the ends.
  - step_numbers: Step number circles should use background: var(--d-primary) with white text (or accent bg with dark text for neon themes). Size: 48px diameter, font-weight: bold. Active/current step should pulse subtly.
  - section_background: Use var(--d-bg) background (same as hero) to create a visual pairing with the hero section. This groups hero + how-it-works as the "above the fold" narrative.

### testimonials

Customer testimonial quotes with avatars, names, roles, and optional company logos

**Components:** Card, Avatar, Image, icon

**Layout slots:**
- `heading`: Optional section heading with _heading2 _textCenter
- `testimonial-card`: Card with quote icon, testimonial text, and author row
- `quote-icon`: Large decorative open-quote icon in muted primary color at top
- `quote-text`: Testimonial paragraph with _body _italic _leading[relaxed]
- `author`: Row: Avatar (40px) + name (_textsm _fontmedium) + role/company (_textsm _fgmuted)
  **Layout guidance:**
  - card_treatment: Testimonial cards should use d-surface with a thin left border (3px solid) that rotates through accent/primary colors per card. This creates visual variety without inconsistency. Include a large decorative open-quote mark in low-opacity accent color.
  - avatar_treatment: Avatars should have a subtle ring: 2px solid var(--d-primary) with 2px gap (outline-offset). This frames the person and adds polish.
  - section_background: Use a very subtle gradient background: linear-gradient(180deg, var(--d-bg), color-mix(in srgb, var(--d-surface) 30%, var(--d-bg))). This creates visual separation from pricing above without being heavy.

### footer

Page footer with link columns, social icons, and copyright notice.

**Components:** Link, icon

**Layout slots:**
- `columns`: Grid of link groups: _grid _gc2 _md:gc4 _gap6
- `column-heading`: Group heading with _textsm _fontbold _fgmuted _uppercase _tracking[wider]
- `column-links`: Vertical list of links with _flex _col _gap2
- `bottom-bar`: Horizontal bar: logo/copyright left, social icons right with _flex _jcsb _aic
- `social-icons`: Row of social media icon links with _flex _gap3
  **Layout guidance:**
  - footer_priority: Column groupings and utility links should read clearly before social or decorative elements. The footer should feel like a calm endpoint to the page, not a second hero.
  - bottom_bar_role: Brand, copyright, and social actions belong in a restrained support band beneath the primary link grid.
  - mobile_translation: When stacked, preserve the same information hierarchy so the footer remains scannable rather than collapsing into a dense wall of links.

---

## Pages

### home (/)

Layout: hero-split (centered) → cta-section (standard) → features (standard) → how-it-works (standard) → testimonials (standard) → cta-section (banner) → footer (standard)
