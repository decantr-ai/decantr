# Section: landing-hero

**Role:** primary | **Shell:** full-bleed | **Archetype:** landing-hero
**Description:** High-impact product landing page with split hero, feature sections, how-it-works flow, pricing, testimonials, and conversion-optimized CTAs. Full-bleed scroll experience designed to convert visitors.

## Quick Start

**Shell:** No persistent navigation. Scroll-driven hero-first layout. Used by portfolio landing pages. (header: 52px)
**Pages:** 2 (home, demo)
**Key patterns:** split-hero, feature-showcase, workflow-steps [moderate], pricing-tiers, bottom-cta, demo-hero, demo-features
**CSS classes:** `.lum-orbs`, `.lum-brand`, `.lum-glass`
**Density:** comfortable
**Voice:** Confident and compelling.

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

**Zone:** App (primary) — full-bleed shell
Authenticated users land here. Sign out → Gateway (/login).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing, seo, analytics

---

## Visual Direction

**Personality:** Bold, high-impact product landing page designed to convert. Dark premium background with vibrant geometric accent elements. Split hero with confident typography and a prominent CTA button. Feature sections alternate between full-bleed and contained layouts for visual rhythm. Social proof is prominent — logos, testimonials, case study snippets. The pricing section is clear and decisive. Below-the-fold content builds the narrative: problem → solution → proof → action. Blog/resources add SEO depth. Lucide icons. Mobile-first, fast-loading.

## Pattern Reference

### split-hero



**Components:** Button, Icon, Image

**Layout slots:**

### feature-showcase



**Components:** Card, Icon, Text

**Layout slots:**
- `grid`: Grid of feature cards (icon + title + description)
- `feature-card`: Individual feature with icon, heading, and description text

### workflow-steps



**Components:** Card, Icon, Text, Badge

**Layout slots:**

### pricing-tiers



**Components:** Card, Button, Badge

**Layout slots:**
- `tiers`: Pricing tier cards (name, price, features list, CTA button)
- `toggle`: Monthly/annual billing toggle (optional)

### bottom-cta



**Components:** Button, Text

**Layout slots:**
- `headline`: CTA headline text
- `description`: Supporting description text
- `actions`: CTA button(s)

### demo-hero



**Components:** Button, Icon, Image

**Layout slots:**

### demo-features



**Components:** Card, Icon, Text

**Layout slots:**
- `grid`: Grid of feature cards (icon + title + description)
- `feature-card`: Individual feature with icon, heading, and description text

---

## Pages

### home (/)

Layout: split-hero → feature-showcase → workflow-steps → pricing-tiers → social-proof → bottom-cta

### demo (/demo)

Layout: demo-hero → demo-features
