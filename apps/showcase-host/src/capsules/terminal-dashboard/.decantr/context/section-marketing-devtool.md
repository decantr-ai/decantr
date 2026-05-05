# Section: marketing-devtool

**Role:** public | **Shell:** top-nav-footer | **Archetype:** marketing-devtool
**Description:** Developer tool landing page with terminal-styled hero, feature highlights, and ASCII art elements. Marketing page that maintains the terminal aesthetic.

## Quick Start

**Shell:** Horizontal nav with main content and a persistent footer. Used for marketing sites, documentation with ToC footer. (header: 52px)
**Pages:** 2 (home, docs)
**Key patterns:** hero, features, cta
**CSS classes:** `.term-glow`, `.term-tree`, `.term-type`
**Density:** comfortable

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
| `--d-text` | `#00FF00` | Body text, headings, primary content |
| `--d-accent` | `#00FFFF` |  |
| `--d-border` | `#333333` | Dividers, card borders, separators |
| `--d-primary` | `#00FF00` | Brand color, key interactive, selected states |
| `--d-surface` | `#0A0A0A` | Cards, panels, containers |
| `--d-secondary` | `#FFB000` | Secondary brand color, supporting elements |
| `--d-bg` | `#000000` | Page canvas / base layer |
| `--d-text-muted` | `#00AA00` | Secondary text, placeholders, labels |
| `--d-accent-hover` | `#00CCCC` |  |
| `--d-primary-hover` | `#00CC00` | Hover state for primary elements |
| `--d-surface-raised` | `#111111` | Elevated containers, modals, popovers |
| `--d-secondary-hover` | `#CC8C00` |  |

Full token set: `src/styles/tokens.css`

**Visual Treatments:** All 6 base treatments available (see DECANTR.md for usage).
**Theme decorators:**

| Class | Usage |
|-------|-------|
| `.term-glow` | Subtle phosphor bloom effect using text-shadow with current color. 5px and 10px spread. |
| `.term-tree` | Tree view using ASCII connectors. Uses ├── └── │ for hierarchy visualization. |
| `.term-type` | Typewriter entrance animation. Characters appear one by one, 20ms per character. |
| `.term-blink` | Blinking cursor animation at 1s interval. Steps timing for authentic terminal feel. |
| `.term-input` | Terminal prompt style with '> ' prefix and blinking cursor. Monospace input. |
| `.term-panel` | ASCII box-drawing border using Unicode characters. Background surface color, 1px solid border. |
| `.term-table` | Full ASCII table borders with box-drawing characters for headers, cells, and junctions. |
| `.term-canvas` | Pure black background (#000000) for CRT authenticity. No gradients, no textures. |
| `.term-hotkey` | Function key button style '[F1]'. Border, padding, monospace. Inverse on active. |
| `.term-status` | Inverse color status bar. Background uses text color, text uses background color. |
| `.term-diff-add` | Addition highlighting. Green background with darker green text for added lines. |
| `.term-diff-del` | Deletion highlighting. Red background with darker red text for removed lines. |
| `.term-progress` | ASCII progress bar using block characters. [||||....] style with percentage. |
| `.term-scanlines` | Optional CRT scanline overlay using repeating-linear-gradient. Semi-transparent black lines. |
| `.term-sparkline` | Inline ASCII sparkline using braille characters for high-resolution mini charts. |

**Compositions:** **auth:** Terminal-styled authentication forms with ASCII borders.
**logs:** Log viewer with real-time streaming and filtering.
**dashboard:** Terminal dashboard with split panes, status bar, and hotkey bar.
**marketing:** Dev tool marketing page with terminal aesthetic hero.
**Spatial hints:** Density bias: 2. Section padding: 16px. Card wrapping: none.


Usage: `className={css('_flex _col _gap4') + ' d-surface terminal-glass'}` — atoms via css(), treatments and theme decorators as plain class strings.

---

**Zone:** Public (public) — top-nav-footer shell
Anonymous visitors. CTAs lead to Gateway (/login, /register).
For full app topology, see `.decantr/context/scaffold.md`

## Features

terminal-hero, ascii-demo, code-examples, installation-guide

---

## Visual Direction

**Personality:** technical. retro. focused. immersive

## Constraints

- **mode:** dark_only
- **borders:** ascii_box_drawing
- **corners:** sharp_only
- **effects:** {"glow":"optional","flicker":"disabled","scanlines":"optional"}
- **shadows:** none
- **typography:** monospace_only

---

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

Layout: hero → features → demo-terminal → demo-chart → cta

### docs (/docs)

Layout: documentation → code-examples
