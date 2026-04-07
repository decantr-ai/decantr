# Bento Detail Page — Design Spec

**Date:** 2026-04-07
**App:** `apps/registry` (Next.js 16 + Tailwind CSS 4)
**Blueprint:** `registry-platform`
**Theme:** Luminarum
**Scope:** Content detail page (`/:type/:namespace/:slug`) redesign

---

## Problem

The current detail page is a flat database record viewer — type badge, slug name, version, copy button, then a raw JSON dump. It fails to surface the rich data available in each content type (personality narratives, visual briefs, composition algebra, color palettes, route maps, feature lists). It doesn't sell the content or make it effortless to use. The page should be the most visually stunning part of the registry.

## Goal

Redesign the content detail page as a spatial bento grid with glass-treated cards floating over an immersive backdrop. Each content type surfaces its unique data through purpose-built cards. The install prompt is a polished macOS terminal animation — the centerpiece of the prompting experience.

## Approach

- Bento grid layout with CSS Grid named areas, responsive (4-col desktop → 2-col tablet → 1-col mobile)
- Full-bleed immersive backdrop (screenshot for blueprints, animated orbs + geometric SVG for others)
- Glass-treated cards (`lum-glass`) with depth, hover effects, and stagger animations
- Animated terminal card for the install/prompt experience
- Per-content-type card arrangements surfacing all rich data fields
- No tabs — everything spatial. JSON collapsed behind "View Source" toggle.
- All styling through Decantr tokens, treatments, decorators, and Tailwind — no inline styles

## Out of Scope

- Interactive prompt builder (future — Direction C from brainstorm)
- Real download/usage analytics data (sparkline uses placeholder data for now)
- User avatars in "Used by" card (count only)
- Mobile parallax (desktop only)
- View Demo functionality (deferred — separate hosting decision)

---

## 1. Full-Bleed Backdrop

The backdrop extends edge-to-edge, full viewport width, behind the entire page content.

### When screenshot exists (blueprints with showcase):
- The screenshot image rendered as `background-image`, `background-size: cover`, `background-position: top center`
- Layered gradient overlay: `linear-gradient(180deg, transparent 0%, var(--d-bg) 70%)`
- Additional dark scrim at ~40% opacity for card readability
- Min-height: 100vh (the backdrop covers the full page)

### When no screenshot (patterns, themes, shells, archetypes):
Two layers composited:

**Layer 1 — Animated gradient orbs:**
- Two large radial gradients using the content type's accent color
- Primary orb: 500px, top-left, 18% opacity
- Secondary orb: 400px, bottom-right, 12% opacity, animation offset
- Drift animation (12s ease-in-out infinite alternate) — same pattern as existing `lum-orbs` but using the per-type color instead of hardcoded primary/accent

**Layer 2 — Geometric SVG pattern:**
- A subtle SVG overlay at 6% opacity, rendered as a CSS background-image
- The pattern derives from the content data:
  - Patterns: connected node graph (node count = component count)
  - Themes: concentric circles (circle count = palette color count)
  - Blueprints: intersecting circles (count = compose archetype count)
  - Shells: rectangular wireframe regions
  - Archetypes: radial spokes (count = page count)
- All geometry uses the type's accent color
- Fixed position, doesn't scroll with content

### Type accent colors:
```
pattern  → var(--d-coral)  / #F58882
theme    → var(--d-amber)  / #FDA303
blueprint → var(--d-cyan)  / #0AF3EB
shell    → var(--d-green)  / #00E0AB
archetype → var(--d-purple) / #6500C6
```

---

## 2. Bento Grid Layout

Centered container (max-width 1200px) floating over the backdrop.

> **Shell padding note:** The `top-nav-main` shell body region already applies `padding: 1.5rem` to all page content. The bento grid container must use `padding: 0` to avoid double-padding, and rely on `max-width: 1200px; margin: 0 auto` for centering. The shell owns the outer padding.

### Grid structure:
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  padding: 0;
  max-width: 1200px;
  margin: 0 auto;
}

@media (max-width: 1024px) {
  .bento-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .bento-grid { grid-template-columns: 1fr; }
}
```

### Card base treatment:
Every bento card uses:
- `lum-glass` decorator (subtle transparency + soft border)
- `d-surface` treatment for padding and base styling
- Hover: `translateY(-4px)`, border brightens to type accent color, `box-shadow` increases
- `lum-stagger` on the grid for sequential fade-in on mount

---

## 3. Ambient Cursor Glow

A soft radial gradient (type-colored, ~15% opacity, 200px radius) follows the mouse cursor behind the glass cards.

Implementation:
- A `pointermove` listener on the bento grid container updates two CSS custom properties (`--mouse-x`, `--mouse-y`)
- A pseudo-element (`::before`) on the grid container renders a `radial-gradient` at those coordinates
- The pseudo-element sits behind the cards (z-index below cards)
- Performance: uses `will-change: background` and throttled to rAF
- Disabled on touch devices and when `prefers-reduced-motion` is set

---

## 4. Card Depth on Hover

When hovering a bento card:
- The card lifts: `transform: translateY(-4px)`, `box-shadow` increases to `var(--d-shadow-lg)`
- The card's border color transitions to the type accent color
- Adjacent cards subtly push away (1-2px via CSS `gap` increase on the hovered card's grid area, or via negative margin on siblings)
- Transition: 200ms ease-out

---

## 5. Universal Cards (all content types)

### 5a. Identity Card (spans 2 columns)

The primary info card — replaces the current "hero section."

Contents:
- Type badge: filled with type accent color, dark text, `d-annotation`
- Namespace badge: standard `d-annotation`
- Content name: `text-2xl font-bold`
- Version: monospace, muted
- Description: body text, muted, max 70ch line length
- Published date and author (if available)

### 5b. Terminal Card (spans 2 columns)

The install/prompt centerpiece. Looks like a real macOS terminal window.

**Visual structure:**
- Outer container: rounded-lg, dark background (#111113), subtle shadow, border
- Title bar: 40px height, top section with three traffic light dots (12px circles: #FF5F57 red, #FFBD2E yellow, #27C93F green), centered "decantr" text in muted monospace
- Body: padding 1rem 1.25rem, monospace font, the command text

**Animation:**
- On mount (or when scrolled into view via IntersectionObserver), the command types character-by-character over ~1.5s
- Blinking cursor (block cursor, 1s interval blink) follows the text as it types
- After typing completes: cursor disappears, a "Copy" button fades in on the right side of the title bar
- Animation respects `prefers-reduced-motion` — shows the full command immediately

**Copy feedback:**
- On copy: the card border briefly pulses green (a radial ripple expanding outward over 600ms)
- All three traffic light dots turn green for 1.5 seconds, then return to normal colors
- "Copied!" text replaces "Copy" button text for 2 seconds

**Commands per type:**
- Blueprint: `decantr init --blueprint={slug}`
- Pattern: `decantr get pattern {namespace}/{slug}`
- Theme: `decantr theme switch {slug}`
- Shell: `decantr get shell {namespace}/{slug}`
- Archetype: `decantr get archetype {namespace}/{slug}`

**"What happens next?" expandable:**
Below the terminal, a small collapsed section. Click to expand, showing a 3-step flow:
1. Run the command in your project directory
2. Read the generated DECANTR.md for the design spec
3. Let your AI assistant build from the context files

### 5c. Tags Card (1 column)

Simple card showing content tags as `d-annotation` pills in a flex-wrap layout. If no tags, card is not rendered.

### 5d. Schema Card (expandable, spans full width at bottom)

A "View Source" toggle button. Collapsed by default — shows only the button. Clicking expands to reveal the full JSON viewer (`lum-code-block` with syntax highlighting, collapsible nodes, line numbers, copy button). The expand/collapse is animated (height transition 300ms).

### 5e. Used By Card (1 column)

Social proof card:
- Animated download/install counter (same rAF animation as KPI grid)
- Large number with "installs" label
- A row of small gray avatar circles (placeholder) suggesting community usage
- If count is 0, show "Be the first to use this"

---

## 6. Blueprint-Specific Cards

### 6a. Compose Card (spans 2 columns)

Visual list of the archetypes that compose this blueprint.

Each archetype row:
- Role badge: `d-annotation` colored by role (primary=coral, gateway=amber, auxiliary=green, public=cyan)
- Archetype name (font-medium)
- One-line description (muted, truncated)

Laid out as a vertical stack with subtle dividers between items.

### 6b. Features Card (1 column)

Feature names rendered as `d-annotation` pills in a flex-wrap grid. Each pill has a subtle colored left border matching its category (auth=green, search=blue, billing=amber, etc. — or just accent-colored).

### 6c. Theme Card (1 column)

Mini preview of the blueprint's associated theme:
- Theme name as heading
- Swatch strip showing 4-5 seed colors (reuse `lum-swatch` / `lum-swatch-strip`)
- Mode badge (dark/light)
- Shape badge (pill/rounded/sharp)

### 6d. Routes Card (1 column)

Route list grouped by section:
- Section name as `d-label` with accent left border
- Routes as monospace text, indented under each section
- Route count badge next to section name

### 6e. Personality Card (1 column, or spans 2 if text is long)

The personality narrative as a styled pull quote:
- Oversized accent-colored open-quote mark (`"`) at 3rem, positioned top-left as a decorative element
- Text at slightly larger than body size (1.0625rem), italic or normal weight depending on length
- Accent left border (3px, type color)
- The most evocative phrase auto-highlighted in the type accent color (first sentence or first clause)

### 6f. Animated Route Map Card (1 column)

Mini topology diagram:
- SVG rendered inline
- Nodes for each section (circles with section initial letter), positioned in a small layout
- Connection lines between nodes based on zone transitions (gateway→app, etc.)
- Node fill colors match their role (same as compose card roles)
- Subtle pulse animation on nodes (scale 1→1.05→1, 3s infinite)
- Clicking a node shows a tooltip with the section's route count

### 6g. Sparkline Card (1 column)

A tiny SVG sparkline showing install trend:
- 60px tall, full card width
- Line in type accent color, area fill at 10% opacity
- "30 day trend" label in muted text-xs
- If no real data: render a gentle sine wave as placeholder

---

## 7. Pattern-Specific Cards

### 7a. Visual Brief Card (spans 2 columns)

The visual_brief text rendered as a rich description:
- Slightly larger text (0.9375rem)
- Accent left border
- Key terms in the brief auto-bolded (component names, layout terms)

### 7b. Components Card (1 column)

Component list with small icons:
- Each component name as a row with a small box icon
- Component count badge in the card header

### 7c. Presets Card (1 column)

Preset names as interactive-looking pills:
- Each preset as a `d-annotation` pill
- Active/default preset highlighted with accent border
- Preset description shown on hover (title attribute)

### 7d. Responsive Card (1 column)

Three-section mini breakdown:
- Mobile / Tablet / Desktop
- Each with a small device icon and the responsive hint text (truncated to 1-2 lines)
- Device icon sizes: 14px phone, 18px tablet, 22px monitor

### 7e. Slots Card (spans 2 columns)

Slot definitions rendered as a clean list:
- Slot name in monospace font-medium
- Slot description in muted text
- Subtle dividers between slots

---

## 8. Theme-Specific Cards

### 8a. Palette Card (spans 2 columns)

Full color palette as a visual swatch grid:
- Organized by role: Brand (primary, accent, secondary), Surfaces (bg, surface, surface-raised), Text (text, text-muted), Borders (border), Status (success, error, warning, info)
- Each color as a 40px circle with the hex value shown below in text-xs monospace
- Dark and light mode values shown side by side (or toggle)
- Color names as labels

### 8b. Decorators Card (1 column)

List of decorator class names with descriptions:
- Each decorator as a row: `.lum-glass` — "Subtle glass panel with soft border"
- Decorator name in monospace accent color
- Description in muted text

### 8c. Modes Card (1 column, small)

Mode support badges: "Dark" and "Light" as `d-annotation` pills with appropriate styling (dark pill on dark bg, light pill on light bg).

### 8d. Shapes Card (1 column, small)

Shape options: "Pill" / "Rounded" / "Sharp" as visual badges. Each shows a tiny preview shape (a 24px rounded rectangle with the corresponding border-radius).

### 8e. Live Theme Preview

When viewing a theme detail page, the entire page automatically previews that theme's colors:
- The backdrop orbs use the theme's primary/accent colors (not Luminarum's)
- The bento card borders subtly shift to the theme's border color
- A small `lum-preview-banner` at the bottom says "Viewing in {theme name} colors"
- The ThemeLabProvider is called with the theme's seed tokens on page load
- Dismissible — clicking the banner resets to Luminarum

---

## 9. Animations Summary

| Element | Animation | Trigger | Duration | Reduced Motion |
|---------|-----------|---------|----------|----------------|
| Bento cards | Stagger fade-in + translateY | Page load | 400ms per card, 60ms stagger | Instant appear |
| Terminal typing | Character-by-character | IntersectionObserver | ~1.5s total | Show full command |
| Terminal cursor | Block blink | During typing | 1s interval | Hidden |
| Copy ripple | Green border pulse outward | Click copy | 600ms | Instant color flash |
| Traffic lights | All turn green | Click copy | 1.5s | Instant |
| Card hover lift | translateY(-4px) + shadow | Hover | 200ms ease-out | No transform, shadow only |
| Cursor glow | Radial gradient follows pointer | Pointermove | Continuous (rAF throttled) | Disabled |
| Backdrop orbs | Drift + scale + opacity | Continuous | 12s alternate | Static |
| Topology nodes | Subtle pulse scale | Continuous | 3s infinite | Static |
| Palette swatches | Scale bounce on mount | Page load | 300ms per swatch, staggered | Instant appear |
| Schema expand | Height transition | Click toggle | 300ms ease | Instant |

---

## 10. New Decorator Definitions

These 12 decorators must be added to Luminarum's `decorator_definitions` in `decantr-content/themes/luminarum.json` and flow through the content pipeline. Each definition follows the exact structure used by existing Luminarum decorators (`description`, `intent`, `suggested_properties`, `pairs_with`, `usage`, plus `mode_overrides`, `variants`, `pseudo` where applicable).

```json
{
  "lum-bento-grid": {
    "description": "Bento grid container. 4-column CSS Grid with 1rem gap, responsive down to 2-col (1024px) and 1-col (640px). Position relative for cursor glow pseudo-element.",
    "intent": "Use as the outer grid container on content detail pages. The bento layout arranges glass cards in a spatial grid over the immersive backdrop. Zero padding — the top-nav-main shell body region provides the outer 1.5rem padding.",
    "suggested_properties": {
      "display": "grid",
      "grid-template-columns": "repeat(4, 1fr)",
      "gap": "1rem",
      "padding": "0",
      "max-width": "1200px",
      "margin": "0 auto",
      "position": "relative"
    },
    "pairs_with": [
      "lum-bento-card",
      "lum-backdrop-orbs",
      "lum-backdrop-screenshot",
      "lum-stagger"
    ],
    "usage": [
      "Content detail page grid container",
      "Bento card layout wrapper"
    ]
  },
  "lum-bento-card": {
    "description": "Individual bento card. Extends lum-glass with card-specific hover lift, border accent transition, and depth shadow. The base glass treatment provides the subtle transparency.",
    "intent": "Use for every card within the bento grid. Combines the glass panel aesthetic with interactive hover behavior — cards lift, borders brighten to the type accent color, and shadows deepen on hover.",
    "suggested_properties": {
      "background": "var(--d-glass-bg, rgba(255, 255, 255, 0.03))",
      "border": "1px solid var(--d-glass-border, rgba(255, 255, 255, 0.08))",
      "border-radius": "var(--d-radius, 12px)",
      "padding": "1.25rem",
      "transition": "transform 200ms ease-out, border-color 200ms ease-out, box-shadow 200ms ease-out"
    },
    "mode_overrides": {
      "dark": {
        "background": "rgba(255, 255, 255, 0.03)",
        "border-color": "rgba(255, 255, 255, 0.08)"
      },
      "light": {
        "background": "rgba(0, 0, 0, 0.02)",
        "border-color": "rgba(0, 0, 0, 0.06)"
      }
    },
    "variants": {
      "hover": {
        "transform": "translateY(-4px)",
        "border-color": "var(--lum-type-accent, var(--d-accent))",
        "box-shadow": "var(--d-shadow-lg, 0 20px 60px rgba(0, 0, 0, 0.4))"
      }
    },
    "pairs_with": [
      "lum-bento-grid",
      "lum-glass",
      "lum-stagger"
    ],
    "usage": [
      "Bento grid cards",
      "Content detail info cards",
      "Terminal card wrapper"
    ]
  },
  "lum-terminal": {
    "description": "macOS terminal window chrome. Fixed dark background (#111113) not tokens, rounded corners, subtle border and shadow. Overflow hidden to clip the title bar's top radius.",
    "intent": "Use as the outer container for the install/prompt terminal card. Fixed neutral colors ensure the terminal looks authentic regardless of the active theme or mode.",
    "suggested_properties": {
      "background-color": "#111113",
      "border-radius": "var(--d-radius-lg, 12px)",
      "border": "1px solid rgba(255, 255, 255, 0.1)",
      "box-shadow": "0 8px 32px rgba(0, 0, 0, 0.4)",
      "overflow": "hidden"
    },
    "pairs_with": [
      "lum-terminal-titlebar",
      "lum-terminal-body",
      "lum-bento-card"
    ],
    "usage": [
      "Install command terminal card",
      "CLI prompt display",
      "Code execution preview"
    ]
  },
  "lum-terminal-titlebar": {
    "description": "Terminal title bar with traffic light dots area and centered title text. 40px height, flex layout, subtle border-bottom separating it from the terminal body.",
    "intent": "Use as the top section of the terminal card. Contains the three macOS traffic light dots on the left and a centered 'decantr' title in muted monospace. The slight background difference from the body creates visual depth.",
    "suggested_properties": {
      "height": "40px",
      "display": "flex",
      "align-items": "center",
      "padding": "0 1rem",
      "background-color": "rgba(255, 255, 255, 0.02)",
      "border-bottom": "1px solid rgba(255, 255, 255, 0.06)"
    },
    "pairs_with": [
      "lum-terminal",
      "lum-terminal-dots"
    ],
    "usage": [
      "Terminal window title bar",
      "macOS-style window chrome"
    ]
  },
  "lum-terminal-dots": {
    "description": "Traffic light dots container. Three 12px circles in macOS colors: #FF5F57 (close/red), #FFBD2E (minimize/yellow), #27C93F (maximize/green). Flex row with 8px gap.",
    "intent": "Use inside the terminal title bar to render the three macOS window control dots. On copy feedback, all three dots temporarily turn green (#27C93F) for 1.5 seconds.",
    "suggested_properties": {
      "display": "flex",
      "align-items": "center",
      "gap": "8px"
    },
    "variants": {
      "copied": {
        "description": "All dots turn green for 1.5s after a successful copy action"
      }
    },
    "pairs_with": [
      "lum-terminal-titlebar"
    ],
    "usage": [
      "Terminal traffic light dots",
      "Window control indicators"
    ]
  },
  "lum-terminal-body": {
    "description": "Terminal body content area. Monospace font, comfortable padding, generous line-height for readability. Contains the typed command text and blinking cursor.",
    "intent": "Use as the main content area of the terminal card where the CLI command is displayed. The monospace font and line-height ensure the typing animation looks authentic.",
    "suggested_properties": {
      "padding": "1rem 1.25rem",
      "font-family": "ui-monospace, 'SF Mono', 'Cascadia Code', 'Fira Code', monospace",
      "font-size": "0.875rem",
      "line-height": "1.7",
      "color": "rgba(255, 255, 255, 0.85)"
    },
    "pairs_with": [
      "lum-terminal",
      "lum-terminal-titlebar"
    ],
    "usage": [
      "Terminal command display",
      "CLI output rendering"
    ]
  },
  "lum-backdrop-orbs": {
    "description": "Full-bleed animated gradient orbs for content detail backdrops. Two large radial gradients using the content type's accent color at 12-18% opacity, with slow drift animation. Positioned absolute behind all page content.",
    "intent": "Use as the immersive backdrop layer on content detail pages when no screenshot is available. The orbs use the per-type accent color (coral for patterns, amber for themes, etc.) instead of hardcoded primary/accent. Extends the lum-orbs concept to type-colored variants.",
    "suggested_properties": {
      "position": "absolute",
      "inset": "0",
      "pointer-events": "none",
      "z-index": "0",
      "background": "radial-gradient(ellipse 500px 500px at 25% 20%, rgba(var(--lum-type-accent-rgb), 0.18), transparent 70%), radial-gradient(ellipse 400px 400px at 75% 70%, rgba(var(--lum-type-accent-rgb), 0.12), transparent 70%)",
      "animation": "lum-orb-drift 12s ease-in-out infinite alternate"
    },
    "pairs_with": [
      "lum-backdrop-geo",
      "lum-bento-grid",
      "lum-canvas"
    ],
    "usage": [
      "Content detail page backdrop (non-screenshot)",
      "Type-colored ambient background"
    ]
  },
  "lum-backdrop-geo": {
    "description": "Geometric SVG pattern overlay. Fixed-position, 6% opacity, pointer-events none. The SVG pattern is data-driven: connected nodes for patterns, concentric circles for themes, intersecting circles for blueprints, rectangular wireframes for shells, radial spokes for archetypes.",
    "intent": "Use as a secondary backdrop layer composited over lum-backdrop-orbs. The SVG geometry derives from the content data (component count, palette size, page count, etc.), creating a unique ambient pattern per item. Fixed positioning keeps it stable during scroll.",
    "suggested_properties": {
      "position": "fixed",
      "inset": "0",
      "pointer-events": "none",
      "z-index": "0",
      "opacity": "0.06",
      "background-repeat": "no-repeat",
      "background-position": "center",
      "background-size": "80% 80%"
    },
    "pairs_with": [
      "lum-backdrop-orbs",
      "lum-canvas"
    ],
    "usage": [
      "Content detail geometric backdrop overlay",
      "Data-driven ambient SVG decoration"
    ]
  },
  "lum-backdrop-screenshot": {
    "description": "Screenshot background for blueprint detail pages that have a showcase image. The screenshot renders as background-image cover with a gradient overlay dissolving to var(--d-bg), plus a dark scrim for card readability.",
    "intent": "Use as the backdrop layer on blueprint detail pages when a screenshot exists. The faded screenshot provides rich visual context while the gradient and scrim ensure glass cards layered above remain readable.",
    "suggested_properties": {
      "position": "absolute",
      "inset": "0",
      "background-size": "cover",
      "background-position": "top center",
      "z-index": "0",
      "pointer-events": "none"
    },
    "pseudo": {
      "::after": {
        "content": "''",
        "position": "absolute",
        "inset": "0",
        "background": "linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, var(--d-bg, #141414) 70%)",
        "pointer-events": "none"
      }
    },
    "mode_overrides": {
      "dark": {
        "description": "Gradient fades to dark background #141414"
      },
      "light": {
        "description": "Gradient fades to light background #FAFAF9"
      }
    },
    "pairs_with": [
      "lum-bento-grid",
      "lum-canvas"
    ],
    "usage": [
      "Blueprint detail screenshot backdrop",
      "Showcase page faded background image"
    ]
  },
  "lum-quote": {
    "description": "Pull-quote treatment for personality narratives and visual briefs. Accent-colored left border (3px), oversized decorative open-quote mark at top-left, slightly larger text (1.0625rem).",
    "intent": "Use for rendering personality text on blueprint detail pages and visual_brief text on pattern detail pages. The decorative quote mark and accent border create an evocative pull-quote aesthetic. The first sentence auto-highlights in the type accent color.",
    "suggested_properties": {
      "border-left": "3px solid var(--lum-type-accent, var(--d-accent))",
      "padding": "1.25rem 1.5rem",
      "font-size": "1.0625rem",
      "line-height": "1.65",
      "color": "var(--d-text-muted, rgba(255, 255, 255, 0.75))",
      "position": "relative"
    },
    "pseudo": {
      "::before": {
        "content": "'\\201C'",
        "position": "absolute",
        "top": "-0.25rem",
        "left": "0.5rem",
        "font-size": "3rem",
        "line-height": "1",
        "color": "var(--lum-type-accent, var(--d-accent))",
        "opacity": "0.5",
        "pointer-events": "none"
      }
    },
    "mode_overrides": {
      "dark": {
        "color": "rgba(255, 255, 255, 0.75)"
      },
      "light": {
        "color": "rgba(28, 25, 23, 0.75)"
      }
    },
    "pairs_with": [
      "lum-bento-card",
      "lum-glass"
    ],
    "usage": [
      "Personality narrative pull-quotes",
      "Visual brief display",
      "Styled descriptive text blocks"
    ]
  },
  "lum-sparkline": {
    "description": "Sparkline chart container. Fixed 60px height, full card width, overflow hidden. Contains an inline SVG with a line in the type accent color and an area fill at 10% opacity.",
    "intent": "Use for the install trend sparkline card on content detail pages. The compact height and accent coloring keep the chart subtle but informative. Placeholder sine wave renders when no real data exists.",
    "suggested_properties": {
      "height": "60px",
      "width": "100%",
      "overflow": "hidden",
      "display": "flex",
      "align-items": "flex-end"
    },
    "pairs_with": [
      "lum-bento-card"
    ],
    "usage": [
      "Install trend sparkline",
      "Compact inline chart display",
      "Metric trend visualization"
    ]
  },
  "lum-stagger": {
    "description": "Sequential stagger animation for child elements. Each direct child fades in with translateY(16px) over 400ms, with a 60ms delay between each child. Applied to the bento grid container.",
    "intent": "Use on the bento grid to create a cascading reveal of cards on page load. Each card appears sequentially using CSS animation-delay calculated from its child index. Respects prefers-reduced-motion by showing all cards instantly.",
    "suggested_properties": {
      "animation": "lum-stagger-in 400ms ease-out both",
      "opacity": "0",
      "transform": "translateY(16px)"
    },
    "pairs_with": [
      "lum-bento-grid",
      "lum-bento-card",
      "lum-fade-up"
    ],
    "usage": [
      "Bento grid card reveal",
      "Sequential element entrance",
      "Staggered list item animation"
    ]
  }
}
```

---

## 11. Content Pipeline Changes

### 11a. New pattern: `content-detail-bento`

Create `decantr-content/patterns/content-detail-bento.json` with the full v2 pattern definition:

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v2.json",
  "id": "content-detail-bento",
  "version": "1.0.0",
  "decantr_compat": ">=0.10.0",
  "name": "Content Detail Bento",
  "description": "Bento grid detail page for content items. Glass-treated cards arranged in a spatial 4-column grid over an immersive backdrop. Per-type card arrangements surface rich data fields (personality, visual brief, palette, composition, routes). Includes animated terminal card for install/prompt commands and ambient cursor glow.",
  "dependencies": {
    "patterns": {
      "namespace-badge": "^1.0.0"
    },
    "styles": {
      "luminarum": ">=1.0.0"
    },
    "requires_core": {
      "components": [
        "Badge",
        "Button",
        "Chip",
        "icon",
        "CodeBlock"
      ],
      "charts": []
    }
  },
  "contained": false,
  "components": [
    "Badge",
    "Button",
    "Chip",
    "icon",
    "CodeBlock"
  ],
  "default_preset": "default",
  "presets": {
    "default": {
      "description": "Standard bento grid with full backdrop, cursor glow, stagger animations, and all card types rendered based on content type.",
      "components": [
        "Badge",
        "Button",
        "Chip",
        "icon",
        "CodeBlock"
      ],
      "layout": {
        "layout": "grid",
        "atoms": "_grid _gap4 _p0 _mxa _maxw[1200px] _relative",
        "slots": {
          "backdrop": "Full-bleed immersive backdrop (lum-backdrop-screenshot or lum-backdrop-orbs + lum-backdrop-geo)",
          "identity": "Identity card — name, namespace, type, version, description. Spans 2 columns.",
          "terminal": "Animated macOS terminal card with install command. Spans 2 columns.",
          "tags": "Tags card — d-annotation pills in flex-wrap. 1 column.",
          "used-by": "Social proof card — install count, placeholder avatars. 1 column.",
          "type-cards": "Per-type cards rendered conditionally (see slots below). Variable span.",
          "schema": "Expandable JSON viewer behind View Source toggle. Full width."
        }
      }
    },
    "blueprint": {
      "description": "Blueprint-specific card arrangement. Adds compose, features, theme, routes, personality, route-map, and sparkline cards.",
      "components": [
        "Badge",
        "Button",
        "Chip",
        "icon",
        "CodeBlock"
      ],
      "layout": {
        "layout": "grid",
        "atoms": "_grid _gap4 _p0 _mxa _maxw[1200px] _relative",
        "slots": {
          "backdrop": "lum-backdrop-screenshot (if screenshot exists) or lum-backdrop-orbs + lum-backdrop-geo",
          "identity": "Identity card, spans 2 columns",
          "terminal": "Terminal card, spans 2 columns",
          "compose": "Archetype composition list, spans 2 columns",
          "features": "Feature pills, 1 column",
          "theme-preview": "Theme swatch preview, 1 column",
          "routes": "Route list grouped by section, 1 column",
          "personality": "Personality pull-quote (lum-quote), 1-2 columns",
          "route-map": "Animated SVG topology diagram, 1 column",
          "sparkline": "Install trend sparkline (lum-sparkline), 1 column",
          "tags": "Tags card, 1 column",
          "used-by": "Install count + avatars, 1 column",
          "schema": "Expandable JSON viewer, full width"
        }
      }
    },
    "pattern": {
      "description": "Pattern-specific card arrangement. Adds visual-brief, components, presets, responsive, and slots cards.",
      "components": [
        "Badge",
        "Button",
        "Chip",
        "icon",
        "CodeBlock"
      ],
      "layout": {
        "layout": "grid",
        "atoms": "_grid _gap4 _p0 _mxa _maxw[1200px] _relative",
        "slots": {
          "backdrop": "lum-backdrop-orbs + lum-backdrop-geo (coral accent)",
          "identity": "Identity card, spans 2 columns",
          "terminal": "Terminal card, spans 2 columns",
          "visual-brief": "Visual brief card (lum-quote), spans 2 columns",
          "components": "Component list with icons, 1 column",
          "presets": "Preset pills with active highlight, 1 column",
          "responsive": "Mobile/tablet/desktop breakdown, 1 column",
          "slot-definitions": "Slot name + description list, spans 2 columns",
          "tags": "Tags card, 1 column",
          "used-by": "Install count + avatars, 1 column",
          "schema": "Expandable JSON viewer, full width"
        }
      }
    },
    "theme": {
      "description": "Theme-specific card arrangement. Adds palette, decorators, modes, shapes cards, plus live theme preview.",
      "components": [
        "Badge",
        "Button",
        "Chip",
        "icon",
        "CodeBlock"
      ],
      "layout": {
        "layout": "grid",
        "atoms": "_grid _gap4 _p0 _mxa _maxw[1200px] _relative",
        "slots": {
          "backdrop": "lum-backdrop-orbs + lum-backdrop-geo (amber accent), live-previewed in theme colors",
          "identity": "Identity card, spans 2 columns",
          "terminal": "Terminal card, spans 2 columns",
          "palette": "Full color palette swatch grid, spans 2 columns",
          "decorators": "Decorator class list with descriptions, 1 column",
          "modes": "Mode support badges, 1 column",
          "shapes": "Shape option badges with preview, 1 column",
          "tags": "Tags card, 1 column",
          "used-by": "Install count + avatars, 1 column",
          "schema": "Expandable JSON viewer, full width",
          "preview-banner": "lum-preview-banner floating indicator (theme pages only)"
        }
      }
    }
  },
  "default_layout": {
    "layout": "grid",
    "atoms": "_grid _gap4 _p0 _mxa _maxw[1200px] _relative",
    "slots": {
      "backdrop": "Full-bleed immersive backdrop behind all content. lum-backdrop-screenshot for blueprints with screenshots, otherwise lum-backdrop-orbs + lum-backdrop-geo using the type accent color.",
      "identity": "Primary info card replacing the old hero section. Type badge (filled, type accent), namespace badge, content name (text-2xl bold), version (monospace muted), description (max 70ch), published date and author. Grid: spans 2 columns.",
      "terminal": "macOS terminal card with install command. lum-terminal + lum-terminal-titlebar (traffic light dots) + lum-terminal-body. Character-by-character typing animation on mount. Copy feedback: green border ripple, dots flash green. Grid: spans 2 columns.",
      "tags": "Tags rendered as d-annotation pills in flex-wrap. Hidden if no tags. Grid: 1 column.",
      "used-by": "Social proof card. Animated download counter, 'installs' label, placeholder avatar circles. Grid: 1 column.",
      "type-cards": "Conditional cards rendered per content type — see preset definitions for per-type slot breakdowns.",
      "schema": "Expandable JSON viewer. Collapsed by default behind 'View Source' toggle button. Expands to full lum-code-block with syntax highlighting, collapsible nodes, line numbers, copy button. Height transition 300ms. Grid: spans full width."
    }
  },
  "visual_brief": "A spatial bento grid of glass-treated cards floating over an immersive full-bleed backdrop. The backdrop is either a faded screenshot (for blueprints) or animated gradient orbs with a geometric SVG overlay colored by content type. Cards arrange in a 4-column grid: an identity card (2-col) with type badge, name, and description sits top-left; an animated macOS terminal card (2-col) with typing animation sits top-right; type-specific data cards fill the middle rows; a collapsed JSON viewer spans the bottom. A soft cursor glow follows the mouse behind the glass cards. Cards stagger-animate in on load and lift with accent-colored borders on hover.",
  "responsive": {
    "mobile": "Grid collapses to 1 column. All cards stack vertically. Backdrop orbs scale down and reduce opacity. Terminal card shows full command immediately (no typing animation). Cursor glow disabled. Cards use reduced lift on tap (2px instead of 4px).",
    "tablet": "Grid uses 2 columns. Identity and terminal cards each span full width. Type-specific cards arrange in 2-col pairs. Backdrop orbs retain animation. Cursor glow active.",
    "desktop": "Full 4-column grid. Identity and terminal span 2 columns each on the first row. Remaining cards fill subsequent rows. Full backdrop animation, cursor glow, and stagger animations active."
  },
  "composition": {
    "ContentDetailBento": "Section(lum-bento-grid, grid-4col, gap-1rem, p-0, max-w-1200, mx-auto, relative) > [Backdrop + IdentityCard + TerminalCard + TypeCards + SchemaCard]",
    "Backdrop": "Div(absolute, inset-0, z-0, pointer-events-none) > [BackdropOrbs(lum-backdrop-orbs) | BackdropScreenshot(lum-backdrop-screenshot)] + [BackdropGeo(lum-backdrop-geo)]",
    "IdentityCard": "Card(lum-bento-card, col-span-2) > [TypeBadge(d-annotation, accent-filled) + NamespaceBadge(d-annotation) + Name(heading2) + Version(mono, muted) + Description(body, muted, max-70ch) + MetaRow(d-data)]",
    "TerminalCard": "Card(lum-bento-card, col-span-2) > Terminal(lum-terminal) > [Titlebar(lum-terminal-titlebar) > [Dots(lum-terminal-dots) + Title(mono, muted) + CopyBtn] + Body(lum-terminal-body) > [TypedCommand + Cursor]]",
    "SchemaCard": "Card(lum-bento-card, col-span-full) > [ToggleButton(d-interactive) + Collapsible > CodeBlock(lum-code-block, syntax-highlight)]"
  },
  "motion": {
    "entrance": "lum-stagger on grid children — 400ms fade-in + translateY(16px), 60ms stagger delay per card",
    "micro": "Card hover lift 200ms ease-out. Terminal typing ~1.5s character-by-character. Copy ripple 600ms. Traffic light flash 1.5s. Schema expand/collapse 300ms height transition.",
    "ambient": "Backdrop orbs drift 12s ease-in-out infinite alternate. Topology nodes pulse scale 3s infinite. Cursor glow continuous at rAF.",
    "reduced_motion": "All entrance animations instant. Typing shows full command. Cursor glow disabled. Orbs static. Hover uses shadow-only (no transform)."
  },
  "accessibility": {
    "aria": "Each bento card uses role='region' with aria-label describing its content (e.g., 'Content identity', 'Install command'). Schema toggle uses aria-expanded. Terminal typing is aria-live='polite'.",
    "keyboard": "Cards are not individually focusable — interactive elements within cards (buttons, toggles, links) receive focus. Tab order: Identity actions → Terminal copy → Tags → Type cards → Schema toggle. Schema toggle is keyboard-operable (Enter/Space).",
    "focus": "Focus-visible outlines use the type accent color. Copy button shows focus ring matching the terminal border color.",
    "screen_reader": "Terminal typing animation has aria-hidden on the animated span; the full command text is in a visually-hidden element. Sparkline has aria-label describing the trend. Color swatches include sr-only labels for each color name and hex value."
  },
  "layout_hints": {
    "shell_padding": "The top-nav-main shell body applies padding 1.5rem. The bento grid uses padding: 0 and max-width: 1200px with margin: 0 auto. Do not add outer padding to the grid container.",
    "backdrop_compositing": "Backdrop layers stack: screenshot OR orbs (z-0), then geo SVG overlay (z-0, 6% opacity), then the bento grid (z-1 implicit via flow). Cards sit above the backdrop via normal document flow.",
    "cursor_glow": "Implemented via ::before pseudo-element on the grid container. Updates --mouse-x, --mouse-y custom properties via pointermove listener throttled to rAF. Disabled on touch and prefers-reduced-motion.",
    "type_accent_var": "Set --lum-type-accent and --lum-type-accent-rgb as CSS custom properties on the grid container based on content type. Pattern=#F58882, Theme=#FDA303, Blueprint=#0AF3EB, Shell=#00E0AB, Archetype=#6500C6.",
    "card_spans": "Identity and terminal always span 2 columns. Schema spans full width. Other cards default to 1 column. Personality card may span 2 if text exceeds 200 characters."
  }
}
```

### 11b. Updated archetype: `registry-browser`

The `default_layout` for pages lives on the **archetype** (`decantr-content/archetypes/registry-browser.json`), not the blueprint. The blueprint defines routes and sections but does not contain layout arrays. Apply these changes to the archetype:

**Update the `detail` page `default_layout`:**

Change the detail page entry from:
```json
{
  "id": "detail",
  "path": "/[type]/[namespace]/[slug]",
  "default_layout": [
    "content-detail-hero",
    "json-viewer"
  ],
  "shell": "top-nav-main"
}
```

To:
```json
{
  "id": "detail",
  "path": "/[type]/[namespace]/[slug]",
  "default_layout": [
    "content-detail-bento"
  ],
  "shell": "top-nav-main"
}
```

**Update `dependencies.patterns`:**

Remove `content-detail-hero` and `json-viewer`, add `content-detail-bento`:
```json
{
  "dependencies": {
    "patterns": {
      "search-filter-bar": "^1.0.0",
      "content-card-grid": "^1.0.0",
      "content-detail-bento": "^1.0.0",
      "detail-header": "^1.0.0",
      "namespace-badge": "^1.0.0",
      "kpi-grid": "^1.0.0",
      "activity-feed": "^1.0.0"
    },
    "styles": {}
  }
}
```

**Update `page_briefs.detail`:**

Change from:
```
"detail": "Content detail page. Hero card at top with item name, namespace badge, version, description, and tags. Below, a JSON viewer showing the full content schema with syntax highlighting."
```

To:
```
"detail": "Content detail page as a spatial bento grid. Glass-treated cards float over an immersive backdrop (faded screenshot for blueprints, animated type-colored orbs + geometric SVG for others). Identity card with name, namespace, type, version. Animated macOS terminal card with install command. Per-type cards surface rich data (personality, visual brief, palette, composition, routes, components, presets). JSON collapsed behind View Source toggle."
```

### 11c. Updated Luminarum theme

Add the 12 new decorator definitions from Section 10 to `decantr-content/themes/luminarum.json` under the `decorator_definitions` object.

### 11d. No blueprint layout changes needed

The `registry-platform` blueprint defines routes and sections but does **not** contain `default_layout` arrays — those live on the archetype. No changes to the blueprint's layout structure are required. The blueprint routes (`/:type/:namespace/:slug`) continue to resolve through the archetype's updated detail page layout.

### 11e. Pipeline flow

1. Create `content-detail-bento.json` pattern in `decantr-content/patterns/`
2. Update `registry-browser.json` archetype: `default_layout`, `dependencies.patterns`, `page_briefs.detail`
3. Update `luminarum.json` theme: add 12 decorator definitions
4. Push to main → CI validates → `sync-to-registry.js` POSTs to API
5. `decantr sync` + `decantr refresh` in registry app
6. Build from updated context files

---

## 12. Data Requirements

All data comes from the existing `getContent(type, namespace, slug)` API call. No new endpoints needed. The single-item endpoint returns the full `data` field which contains all the rich fields (personality, visual_brief, composition, palette, routes, etc.).

Fields consumed per card:

| Card | Data path |
|------|-----------|
| Identity | `name`, `description`, `version`, `namespace`, `type`, `published_at`, `owner_name` |
| Terminal | `type`, `namespace`, `slug` (to construct install command) |
| Tags | `data.tags` |
| Schema | `data` (full object) |
| Compose | `data.compose` (array of archetype refs) |
| Features | `data.features` or essence `blueprint.features` |
| Theme | `data.theme` (id, mode, shape) |
| Routes | `data.routes` (route map object) |
| Personality | `data.personality` (string) |
| Visual Brief | `data.visual_brief` (string) |
| Components | `data.components` (array) |
| Presets | `data.presets` (object with preset names as keys) |
| Responsive | `data.responsive` (mobile/tablet/desktop object) |
| Slots | `data.default_layout.slots` (object) |
| Palette | `data.palette` + `data.seed` (color maps) |
| Decorators | `data.decorator_definitions` (array) |
| Modes | `data.modes` (array) |
| Shapes | `data.shapes` (array) |
| Route Map | `data.compose` + `data.routes` (for topology visualization) |

---

## 13. Success Criteria

1. Detail page renders a bento grid with glass cards over an immersive backdrop
2. Blueprints with screenshots show the screenshot as a full-bleed faded background
3. Non-screenshot pages show animated type-colored orbs + geometric SVG pattern
4. Terminal card animates the install command with macOS-style chrome
5. Copy feedback: green ripple pulse + traffic lights flash
6. Cursor glow follows mouse behind cards
7. Cards lift on hover with border accent transition
8. Each content type surfaces its unique rich data (personality, visual brief, palette, etc.)
9. Theme detail pages auto-preview that theme's colors
10. JSON viewer is collapsed behind "View Source" — accessible but not the focus
11. All animations respect `prefers-reduced-motion`
12. Responsive: 4-col → 2-col → 1-col
13. All styling through Decantr decorators + treatments + Tailwind — no inline styles
14. New decorators flow through the content pipeline (decantr-content → API → CLI → context files)
