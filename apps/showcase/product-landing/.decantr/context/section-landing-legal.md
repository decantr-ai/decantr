# Section: landing-legal

**Role:** auxiliary | **Shell:** top-nav-footer | **Archetype:** landing-legal
**Description:** Legal pages for a product landing site including privacy policy and terms of service. Clean prose layouts for legal content.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 2 (privacy, terms)
**Key patterns:** privacy-content, terms-content
**CSS classes:** `.lum-orbs`, `.lum-brand`, `.lum-glass`
**Density:** comfortable
**Voice:** Confident and compelling.

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

**Compositions:** **hero:** Split hero with large logo (1/3) and content (2/3). Canvas bg with breathing gradient orbs behind. Logo floats gently.
**pipeline:** Grid of outlined cards showing process steps. Each card has a different accent color stroke with numbered badge.
**tool-list:** Two-column list with colored dot bullets and colored left border stripes on hover.
**feature-grid:** Grid of vibrant filled cards with corner brackets. Each card a different brand color.
**Spatial hints:** Density bias: none. Section padding: 120px. Card wrapping: minimal.


Usage: `className={css('_flex _col _gap4') + ' d-surface luminarum-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** App (auxiliary) — top-nav-footer shell
Supporting section within App zone. Shares navigation with primary.
For full app topology, see `.decantr/context/scaffold.md`

## Features

seo

---

## Visual Direction

**Personality:** Bold, high-impact product landing page designed to convert. Dark premium background with vibrant geometric accent elements. Split hero with confident typography and a prominent CTA button. Feature sections alternate between full-bleed and contained layouts for visual rhythm. Social proof is prominent — logos, testimonials, case study snippets. The pricing section is clear and decisive. Below-the-fold content builds the narrative: problem → solution → proof → action. Blog/resources add SEO depth. Lucide icons. Mobile-first, fast-loading.

## Pattern Reference

### privacy-content



**Components:** Heading, Text, List

**Layout slots:**
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)

### terms-content



**Components:** Heading, Text, List

**Layout slots:**
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)

---

## Pages

### privacy (/privacy)

Layout: privacy-content

### terms (/terms)

Layout: terms-content
