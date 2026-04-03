# Section: marketing-content

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-content
**Description:** Marketing landing page for a content site with hero, feature highlights, testimonials, and call-to-action sections. Public-facing entry point designed to attract readers and subscribers.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** landing-hero, content-features [moderate], reader-testimonials, subscribe-cta
**CSS classes:** `.editorial-card`, `.editorial-caption`, `.editorial-divider`
**Density:** comfortable
**Voice:** Clear and editorial.

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
| `--d-text` | `#1A1A1A` | Body text, headings, primary content |
| `--d-border` | `#E8E4DD` | Dividers, card borders, separators |
| `--d-primary` | `#1A1A1A` | Brand color, key interactive, selected states |
| `--d-surface` | `#FFFFFF` | Cards, panels, containers |
| `--d-bg` | `#FEFCF9` | Page canvas / base layer |
| `--d-text-muted` | `#6B665E` | Secondary text, placeholders, labels |
| `--d-primary-hover` | `#C41E3A` | Hover state for primary elements |
| `--d-surface-raised` | `#F8F5F0` | Elevated containers, modals, popovers |
| `--d-accent` | `#1a5276` | CTAs, links, active states, glow effects |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.editorial-card` | Clean white card with thin hairline border, generous whitespace, and elegant serif typography framing. |
| `.editorial-caption` | Small uppercase tracking-wide text in muted color for image captions and metadata labels. |
| `.editorial-divider` | Thin single-pixel line separator with generous vertical spacing to create breathing room between sections. |
| `.editorial-dropcap` | Oversized initial letter spanning three lines in bold serif weight to open article sections. |
| `.editorial-pullquote` | Large italic serif text with bold left accent border in secondary red, generous vertical margins. |

**Spatial hints:** Density bias: comfortable. Section padding: generous. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface editorial-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

marketing, seo

---

## Visual Direction

**Personality:** Reading-first content site optimized for long-form consumption. Generous line-height, comfortable measure (65-75 characters), and a clear typographic hierarchy that makes scanning effortless. Article cards feature bold headlines with subtle metadata. The reading view strips away distractions — just text, well-set. Author dashboard is functional and focused. Newsletter archive is clean and browsable. Think Substack meets Medium's typography. Lucide icons. Dark mode available for night reading.

## Pattern Reference

### landing-hero



**Components:** Button, Icon, Image

**Layout slots:**

### content-features



**Components:** Card, Icon, Text, Heading, List

**Layout slots:**
- `grid`: Grid of feature cards (icon + title + description)
- `feature-card`: Individual feature with icon, heading, and description text
- `body`: Long-form text content with headings and paragraphs
- `toc`: Table of contents sidebar (optional)

### reader-testimonials



**Components:** Card, Avatar, Text

**Layout slots:**
- `quotes`: Testimonial cards (quote text, author name, role, avatar)

### subscribe-cta



**Components:** Button, Text

**Layout slots:**
- `headline`: CTA headline text
- `description`: Supporting description text
- `actions`: CTA button(s)

---

## Pages

### home (/)

Layout: landing-hero → content-features → reader-testimonials → subscribe-cta
