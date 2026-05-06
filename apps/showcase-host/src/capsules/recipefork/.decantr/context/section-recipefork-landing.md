# Section: recipefork-landing

**Role:** public | **Shell:** recipefork-top-nav | **Archetype:** recipefork-landing
**Description:** Recipefork's public landing page under the shared product nav, combining hero marketing, featured recipes, community proof, and conversion calls without switching to a separate shell.

## Quick Start

**Shell:** Shared Recipefork application shell with sticky top nav, compact utility actions, and a wide scrollable content region below. Mirrors the current app's persistent nav model across public and authenticated product routes. (header: 64px)
**Pages:** 1 (home)
**Key patterns:** hero, card-grid [moderate], testimonials [moderate], cta-section
**Density:** comfortable
**Voice:** Encouraging, practical, and food-aware without becoming gimmicky.

## Shell Implementation (recipefork-top-nav)

### root

- **display:** flex
- **direction:** column
- **min_height:** 100vh
- **atoms:** _flex _col _minh[100vh]

### header

- **height:** 64px
- **display:** flex
- **align:** center
- **justify:** space-between
- **padding:** 0 1rem
- **border:** bottom
- **sticky:** true
- **z_index:** 20
- **background:** recipefork-nav
- **left_content:** Brand icon + Recipefork wordmark
- **center_content:** Home, Chat, Generate, Feed, Cookbooks navigation links
- **right_content:** Create Recipe CTA + theme toggle + notification bell + profile button or sign-in button + mobile menu trigger
- **button_sizing:** Use compact controls. Create CTA should feel prominent but still fit inside the 64px row without oversized padding.

### body

- **flex:** 1
- **overflow_y:** auto
- **padding:** 0
- **atoms:** _flex1 _overflow[auto]
- **note:** Individual pages own their spacing. Preserve the wide, app-like content region used by feed, recipe detail, profile, and authoring pages.

### Anti-patterns

- Do NOT nest `overflow-y-auto` inside another `overflow-y-auto` — one scroll container per region.
- Do NOT apply `d-surface` to shell frame regions (sidebar, header). Use `var(--d-surface)` or `var(--d-bg)` directly.
- Do NOT add wrapper `<div>` elements around shell regions — the grid areas handle placement.

## Section Label Treatment

Apply `d-label` to section headers in this shell.
- Uppercase monospace label typography (d-label base treatment)
- Density-responsive bottom gap via `--d-label-mb` x `--d-density-scale`

Section density: comfortable (--d-density-scale: 1)

## Shell Notes (recipefork-top-nav)

- **Nav Identity:** Brand mark on the left, route links in the center-left, create CTA plus utility actions on the right. Keep the overall feel product-like rather than marketing-heavy.
- **Mobile Menu:** Collapse route links into a dropdown or menu button below md breakpoint. The create action may stay visible as an icon button or move into the menu when width is constrained.
- **Auth Variation:** Unauthenticated states may still reuse the same shell. Swap the profile entry for a sign-in button while keeping spacing and alignment stable.
- **Notification Behavior:** Authenticated states include a bell menu in the utility cluster. The bell should expose unread count, recent follow/comment/reaction/save/fork activity, and quick mark-as-read behavior without forcing a dedicated page route.

## Theme Reference

**Theme:** recipefork (light) · **Density:** comfortable

Full palette tokens, spacing-guide table, and decorator reference live in `DECANTR.md` (project root). These values are identical across sections in this scaffold unless a DNA override above changes density.

---

**Guard:** strict mode | DNA violations = error | Blueprint violations = warn

**Theme decorators:** 6 `recipefork-*` classes — full Class/Intent/Apply-to table in `section-recipefork-landing-pack.md` (preferred) and DECANTR.md "Decorator Quick Reference". MUST apply.

**Preferred:** card-grid
**Spatial hints:** Density bias: none. Section padding: 4rem. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface recipefork-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — recipefork-top-nav shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing, seo

---

## Visual Direction

**Personality:** Recipefork is a neutral, production-grade recipe product that lets food photography and authoring depth carry the experience. Public browsing feels clean and modern; Chef Mode is the critical differentiator, with structured ingredients, nested instruction groups, optional plating presentation, dynamic cooking tips, explicit recipe visibility controls, draft workflows, and no-loss hydrated editing.

**Personality utilities available in treatments.css:**
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

Scaffold-tier rule: implement the core visual structure, states, and required slots first.
Treat advanced capabilities such as drag/drop, force-layout, minimaps, or simulated live streaming as optional unless the slot guidance or section contract makes them explicitly required.

### hero

Full-width hero with headline, subtext, CTA buttons, and optional media. Entry point for landing pages, recipe detail headers, and marketing sections.

**Components:** Button, icon

**Layout slots:**
- `headline`: Primary heading, typically h1 with _heading1
- `description`: Supporting paragraph with _body _muted
- `cta-group`: Horizontal Button group with _flex _gap3
- `media`: Optional image, illustration, or chart component
  **Layout guidance:**
  - container: none
  - note: Hero sections should NOT wrap content in d-surface cards. The hero IS the section. Use d-section for spacing.
  - visual_proof: The visual element below CTAs should be an ambient visualization (animated gradient, particle effect, blurred screenshot) — NOT a data widget wrapped in a card. If showing product data (agents, metrics), render as floating elements without card containment. Omit entirely if no meaningful visual is available.
  - subtitle: Subtitle line-height should be 1.6-1.8. Use text-muted color, smaller font than heading.
  - cta_sizing: Primary and secondary CTAs should have equal padding and height. Primary is filled (d-interactive[data-variant=primary]), secondary is ghost (d-interactive[data-variant=ghost]).
  - announcement: If showing an announcement badge above the heading, use d-annotation with prominent styling — not a tiny muted pill. Accent border or accent background at 15% opacity.
  - background: Hero sections should have a subtle radial or mesh gradient background using the theme palette — not a flat color. Use the primary and accent colors at very low opacity (5-10%) to create depth. Example: radial-gradient(ellipse at top center, rgba(var(--d-accent-rgb), 0.08) 0%, transparent 60%), or a soft gradient from primary to transparent. The gradient should fade to var(--d-bg) at the edges so it blends seamlessly with the page.
  - ambient_glow: For themes with neon/glow personality, add a soft ambient glow behind the hero heading or CTA area. Use a blurred pseudo-element or box-shadow with the accent color at 10-15% opacity, radius 200-400px. This creates a focal point without overwhelming the content.

### card-grid

Responsive grid of cards with preset-specific content layouts

**Components:** Card, CardHeader, CardBody, CardFooter, Image, Button, Badge

**Layout slots:**
- `card-image`: Product image with aspect-ratio container
- `card-title`: Product name with _textsm _fontmedium
- `card-price`: Price with _heading4 styling
- `card-rating`: Star rating row with icon stars and count Badge
- `card-action`: Add-to-cart Button in CardFooter
  **Layout guidance:**
  - card_surface: Each item should feel like one coherent card surface. Do not wrap grid items in an extra shell-level d-surface if the pattern already provides the card treatment.
  - description_clamp: Allow enough room for meaningful summary copy. In most content grids, descriptions should get at least two to three lines before truncation.
  - footer_rhythm: Meta rows and CTA rows should align consistently across cards. Footers should not jump vertically between items in the same grid.
  - hover_behavior: Use CSS-driven hover lift or media scaling rather than inline event handlers that mutate style values in component code.
  - icon_preset_scope: The icon preset is intentionally compact. Use it for icon + title + short description only, not for longer body copy plus nested capability rows.
  - capability_preset_scope: When a route needs richer category cards with supporting rows or badges, use the capability preset and keep the grid to one, two, or three columns rather than forcing a compact four-up layout.
  - nested_surface_avoidance: Capability cards should read as one card surface. Avoid creating a card within a card or wrapping each supporting row in its own mini-panel unless a route explicitly asks for nested grouping.

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

---

## Pages

### home (/)

Layout: hero (landing) → card-grid (content) → testimonials (standard) → cta-section (standard)
