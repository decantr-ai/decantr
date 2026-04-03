# Section: marketing-ai-studio

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-ai-studio
**Description:** Marketing landing page for the AI Agent Studio, showcasing features, workflow demos, pricing tiers, and conversion CTAs.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 1 (home)
**Key patterns:** landing-hero, feature-showcase, workflow-steps [moderate], pricing-tiers, bottom-cta
**CSS classes:** `.carbon-card`, `.carbon-code`, `.carbon-glass`, `.neon-glow`, `.mono-data`
**Density:** comfortable
**Voice:** Technical and precise.

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
| `--d-primary` | `#6366F1` | Brand color, key interactive, selected states |
| `--d-surface` | `#1F1F23` | Cards, panels, containers |
| `--d-secondary` | `#A78BFA` | Secondary brand color, supporting elements |
| `--d-bg` | `#18181B` | Page canvas / base layer |
| `--d-text-muted` | `#A1A1AA` | Secondary text, placeholders, labels |
| `--d-accent-glow` | `rgba(0, 212, 255, 0.3)` | Ambient glow effect for accent-colored elements |
| `--d-primary-hover` | `#818CF8` | Hover state for primary elements |
| `--d-surface-raised` | `#27272A` | Elevated containers, modals, popovers |
| `--d-accent` | `#00D4FF` | CTAs, links, active states, glow effects |

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

marketing, seo

---

## Visual Direction

**Personality:** Precision engineering studio for AI agents. Carbon-dark surfaces with neon cyan highlights on active elements. Monospace typography for all prompts, traces, and model outputs. Split-pane interfaces reminiscent of an IDE — left tree, center editor, right preview. Think VS Code meets Langsmith. Interactions are immediate and keyboard-first. Every surface exists to reduce iteration cycles. Lucide icons. No decoration — every pixel serves the builder.

**Personality utilities available in treatments.css:**
- `neon-glow`, `neon-glow-hover`, `neon-text-glow`, `neon-border-glow` — Apply to elements needing accent emphasis
- `mono-data` — Monospace + tabular-nums for metrics, IDs, timestamps
- `status-ring` with `data-status="active|idle|error|processing"` — Color-coded status with pulse animation

## Pattern Reference

### landing-hero



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

---

## Pages

### home (/)

Layout: landing-hero → feature-showcase → workflow-steps → pricing-tiers → bottom-cta
