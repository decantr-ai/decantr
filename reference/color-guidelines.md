# Color Design Language

Comprehensive color intelligence for Decantr. Every color, palette, and token decision an LLM makes should be traceable to a rule in this document. Color is not decoration -- it encodes meaning.

## The Five Functions of Color

| Function | What it communicates | Primary tool |
|----------|---------------------|-------------|
| **Identity** | Brand recognition, product personality | Palette roles: primary, accent, tertiary |
| **Hierarchy** | Visual importance, reading order | Surface tiers, foreground weight |
| **State** | Interactive feedback, enabled/disabled/focus | Hover, active, subtle tokens |
| **Feedback** | Success, warning, error, information | Semantic roles: success, warning, error, info |
| **Aesthetics** | Mood, atmosphere, polish | Gradients, mesh backgrounds, glow effects |

In the Decantation Process vocabulary, this is the **Bouquet** layer -- palette tokens from `derive()`. The Bouquet resolves during SETTLE based on the chosen Vintage and Character traits.

---

## 1. The Seed-to-Token Pipeline

Authors never write hex values. All color flows through a deterministic pipeline:

```
10 seed colors + 6 personality traits
          |
      derive()          (src/css/derive.js)
          |
  color math (OKLCH)    lighten/darken/alpha/mix/rotateHue (perceptually uniform)
          |
  validateContrast()    WCAG AA auto-adjustment
          |
  171+ CSS custom properties   (injected into :root)
          |
  atoms (css())         _fgprimary, _bgmuted, _surface2 ...
          |
  DOM                   rendered via var(--d-*)
```

### The 10 seed colors

| Seed | Purpose | Required |
|------|---------|----------|
| `primary` | Brand action color -- buttons, links, active states | Yes |
| `accent` | Secondary brand color -- complementary to primary | Auto-derived if missing (primary + 60deg) |
| `tertiary` | Third palette entry -- charts, badges, variety | Auto-derived if missing (primary - 60deg) |
| `neutral` | Chrome, muted text, borders | Yes |
| `success` | Positive feedback | Yes |
| `warning` | Caution feedback | Yes |
| `error` | Destructive/error feedback | Yes |
| `info` | Informational feedback | Auto-derived if missing (primary + 20deg) |
| `bg` | Light mode page background | Yes |
| `bgDark` | Dark mode page background | Yes |

### The 6 personality traits

| Trait | Values | Color impact |
|-------|--------|-------------|
| `radius` | sharp, rounded, pill | None (spatial only) |
| `elevation` | flat, subtle, raised, glass, brutalist | Hover/active shift intensity, subtle alpha, border alpha |
| `motion` | instant, snappy, smooth, bouncy | None (temporal only) |
| `borders` | none, thin, bold | Focus ring width (2px vs 3px) |
| `density` | compact, comfortable, spacious | None (spatial only) |
| `gradient` | none, subtle, vivid, mesh | Gradient token values, `--d-gradient-intensity` |

The `palette` meta-trait (`standard` or `monochrome`) controls whether all 7 role colors derive independently or from a single hue.

**Cross-ref:** `reference/style-system.md` for style definitions, `src/css/derive.js` for implementation.

---

## 2. Palette Roles and Semantic Meaning

7 roles x 7 modifiers = 49 palette tokens. Each role carries a semantic meaning that must not be misused.

### Role definitions

| Role | Semantic meaning | Typical usage |
|------|-----------------|---------------|
| `primary` | Brand action | Buttons, links, active indicators, focus rings |
| `accent` | Secondary brand | Complementary highlights, secondary CTAs, tags |
| `tertiary` | Third palette | Charts, badges, variety indicators |
| `success` | Positive outcome | Confirmation, completed steps, valid input |
| `warning` | Caution needed | Alerts, approaching limits, unsaved changes |
| `error` | Destructive/failed | Errors, deletion, validation failure |
| `info` | Neutral information | Tooltips, informational banners, help text |

### The 7 modifiers per role

| Modifier | Token pattern | Purpose | Example usage |
|----------|--------------|---------|--------------|
| `base` | `--d-{role}` | Solid fill | Button background, active tab indicator |
| `fg` | `--d-{role}-fg` | Text on base | Button text, badge text on solid fill |
| `hover` | `--d-{role}-hover` | Hover state fill | Button hover background |
| `active` | `--d-{role}-active` | Pressed state fill | Button active/pressed background |
| `subtle` | `--d-{role}-subtle` | Tinted background | Alert background, inline badge background |
| `subtle-fg` | `--d-{role}-subtle-fg` | Text on subtle | Alert text, badge text on tinted fill |
| `border` | `--d-{role}-border` | Semi-transparent border | Alert border, card accent border |

### Decision table: "I need a color for X"

| I need to color... | Token | Atom |
|-------------------|-------|------|
| A primary CTA button fill | `--d-primary` | `_bgprimary` |
| Text on that button | `--d-primary-fg` | `_fgprimaryon` |
| A primary button on hover | `--d-primary-hover` | N/A (handled by `_base.js`) |
| A success inline alert background | `--d-success-subtle` | `_bgsuccesssub` |
| Text in that alert | `--d-success-subtle-fg` | `_fgsuccesssub` |
| Border on that alert | `--d-success-border` | `_bcsuccessbdr` |
| An error badge (solid) | `--d-error` | `_bgerror` |
| Text on that error badge | `--d-error-fg` | `_fgerroron` |
| A generic informational tag | `--d-info-subtle` | `_bginfosub` |

---

## 3. The 60-30-10 Distribution Rule

Color distribution follows a proportional hierarchy that ensures visual balance:

| Proportion | Role | Token families | Where it appears |
|-----------|------|---------------|-----------------|
| **60%** | Neutrals and surfaces | `--d-bg`, `--d-fg`, `--d-surface-*`, `--d-muted-*`, `--d-border-*` | Page background, card backgrounds, text, borders, chrome |
| **30%** | Secondary palette | `--d-accent`, `--d-tertiary`, `--d-*-subtle` | Section accents, tags, badges, tinted backgrounds, charts |
| **10%** | Primary action | `--d-primary`, `--d-success`, `--d-warning`, `--d-error` | CTAs, notifications, active indicators, focus rings |

### Per density-zone breakdown

| Zone | 60% (neutrals) | 30% (secondary) | 10% (action) |
|------|----------------|-----------------|-------------|
| **Chrome** | Surface-0/1 bg, muted-fg text | Accent badges, icon tints | Active nav indicator |
| **Controls** | Surface-1 bg, borders, label text | Subtle tints on selected filters | Submit button, validation states |
| **Content** | Surface-0 bg, fg body text | Accent highlights, chart colors | Links, inline CTAs |
| **Showcase** | bg/surface-0 breathing space | Gradient backgrounds, accent decoration | Hero CTA button |
| **Data-dense** | Surface-0/1 bg, grid lines, text | Chart palette, status badges | Error cells, action icons |

### Rules

- If primary appears in more than ~15% of the viewport, the UI feels overwhelming. Reduce usage.
- If neutrals drop below ~50%, the page looks like a color wheel. Add more surface area.
- Semantic colors (success, warning, error) should appear only when their meaning is present -- never as decoration.
- The 60-30-10 ratio applies per viewport, not per component. A Button is 100% primary -- but it occupies a small fraction of the screen.

---

## 4. Surface Lightness Architecture

Four surface tiers create depth via monotonic lightness progression. The direction depends on mode and elevation type.

### Non-glass styles (clean, retro)

**Dark mode** -- surfaces get progressively lighter:

| Surface | Lightness shift | Derivation | Purpose |
|---------|----------------|-----------|---------|
| `--d-surface-0` | Base (bgDark) | `bgHex` | Page canvas |
| `--d-surface-1` | +4 L (OKLCH) | `lighten(bgHex, 4)` | Cards, panels |
| `--d-surface-2` | +7 L (OKLCH) | `lighten(bgHex, 7)` | Modals, drawers, elevated panels |
| `--d-surface-3` | +10 L (OKLCH) | `lighten(bgHex, 10)` | Tooltips, popovers, highest emphasis |

**Light mode** -- surfaces get progressively tinted:

| Surface | Mix ratio | Derivation | Purpose |
|---------|----------|-----------|---------|
| `--d-surface-0` | Base (bg) | `bgHex` | Page canvas |
| `--d-surface-1` | 4% neutral | `mixColors(bgHex, neutralHex, 0.04)` | Cards, panels |
| `--d-surface-2` | 7% neutral | `mixColors(bgHex, neutralHex, 0.07)` | Elevated panels |
| `--d-surface-3` | 10% neutral | `mixColors(bgHex, neutralHex, 0.10)` | Highest emphasis |

### Glass styles (auradecantism, glassmorphism)

Glass surfaces use alpha transparency + backdrop-filter instead of lightness shifts:

| Surface | Dark alpha | Light alpha | Backdrop-filter |
|---------|-----------|-------------|----------------|
| `--d-surface-0` | 1.0 (base) | 1.0 (base) | None |
| `--d-surface-1` | 0.55-0.70 | 0.60 | `blur(12-16px) saturate(1.4-1.6)` |
| `--d-surface-2` | 0.70-0.78 | 0.72 | `blur(16-20px) saturate(1.5-1.8)` |
| `--d-surface-3` | 0.80-0.85 | 0.82 | `blur(20-24px) saturate(1.6-2.0)` |

### Surface-specific tokens

Each surface tier has three companions:

| Token | Purpose |
|-------|---------|
| `--d-surface-{N}` | Background color |
| `--d-surface-{N}-fg` | Text color on that surface |
| `--d-surface-{N}-border` | Border color appropriate for that surface |
| `--d-surface-{N}-filter` | Backdrop-filter (glass styles only, tiers 1-3) |

### Rules

- **Monotonic progression**: Surface-0 is always the base. Each tier adds exactly one level of visual elevation. Never skip tiers (surface-0 directly to surface-3).
- **Containment holds**: A surface-2 element should contain surface-1 or surface-0 children -- never surface-3.
- **Never pure black**: The darkest dark-mode background (`bgDark`) should be at least `#060918` (auradecantism). Pure `#000000` causes eye strain and removes all depth perception.
- **Never pure white**: The lightest light-mode background should be `#ffffff` at most, but surfaces tint away from it. Pure white `#fff` for the base is acceptable; surfaces must be tinted.

---

## 5. Color Harmony Types

Color harmony describes how seed colors relate on the color wheel. Decantr's built-in styles demonstrate five harmony types:

| Harmony type | Hue relationship | Built-in example | Character feel |
|-------------|-----------------|-----------------|---------------|
| **Monochromatic** | Single hue, varies by L/S | (custom style) | Technical, focused, military |
| **Complementary** | 180deg apart | N/A (too high contrast for full UI) | Bold, dramatic (use sparingly) |
| **Analogous** | Within 60deg | glassmorphism (sky-blue + cyan + green) | Calm, harmonious, natural |
| **Triadic** | 120deg apart | auradecantism (pink + cyan + purple) | Vibrant, energetic, creative |
| **Analogous-cool** | Within ~80deg | clean (blue + violet + teal) | Balanced, versatile, professional |
| **Tetradic** | Two complementary pairs | retro (red + blue + teal + orange) | Complex, eclectic, maximalist |

### Decision table: personality to harmony

| Character traits | Recommended harmony | Reasoning |
|-----------------|-------------------|-----------|
| minimal, clean, focused | Monochromatic or analogous | Restraint; fewer hue contrasts reduce visual noise |
| professional, balanced, corporate | Analogous-cool or split-complementary | Versatility without chaos; distinct accent |
| bold, creative, playful | Triadic | Energy and variety from evenly spaced hues |
| tactical, operational, technical | Monochromatic | Single-hue focus communicates precision |
| luxurious, editorial, premium | Analogous | Sophisticated restraint with depth |
| eclectic, retro, maximalist | Tetradic | High variety enables neobrutalist expression |

### Hue distance rules

- **Palette roles** (primary, accent, tertiary) should be at least 30deg apart on the hue wheel for distinguishability.
- **Semantic roles** (success, warning, error) have fixed hue associations (green, amber, red) regardless of harmony. Never reassign red to success or green to error.
- The `info` role should be blue-adjacent. If primary is already blue, info can match primary.

---

## 6. Light vs Dark Mode Color Math

The `derive()` function branches on mode for every derived token. The core differences:

### Foreground/Background

| Token | Light mode | Dark mode |
|-------|-----------|----------|
| `--d-bg` | `seed.bg` (e.g. `#ffffff`) | `seed.bgDark` (e.g. `#0a0a0a`) |
| `--d-fg` | `#09090b` (near-black) | `#fafafa` (near-white) |
| `--d-overlay` | `rgba(0,0,0,0.5)` | `rgba(0,0,0,0.7)` |

### Palette color derivation (per role)

| Modifier | Light mode | Dark mode |
|----------|-----------|----------|
| `hover` | `darken(base, hoverShift)` | `lighten(base, hoverShift)` |
| `active` | `darken(base, activeShift)` | `lighten(base, hoverShift/2)` |
| `subtle` | `alpha(base, subtleAlphaLight)` | `alpha(base, subtleAlphaDark)` |
| `subtle-fg` | `darken(base, 10)` | `lighten(base, 15)` |
| `border` | `alpha(base, borderAlphaLight)` | `alpha(base, borderAlphaDark)` |
| `fg` | `pickForeground(base)` -- white or near-black | `pickForeground(base)` -- same logic |

### Shift intensities by elevation type

| Elevation | Hover shift | Active shift | Subtle alpha (L/D) | Border alpha (L/D) |
|-----------|-----------|-------------|--------------------|--------------------|
| flat | 8 | 15 | 0.10 / 0.15 | 0.30 / 0.40 |
| subtle | 8 | 15 | 0.10 / 0.15 | 0.30 / 0.40 |
| raised | 8 | 15 | 0.10 / 0.15 | 0.30 / 0.40 |
| glass | 5 | 10 | 0.20 / 0.25 | 0.20 / 0.30 |
| brutalist | 12 | 20 | 0.15 / 0.20 | 0.80 / 0.80 |

### Neutral derivation

| Token | Light mode | Dark mode |
|-------|-----------|----------|
| `--d-muted` | `neutralHex` (unchanged) | `lighten(neutralHex, 10)` |
| `--d-muted-fg` | `darken(neutralHex, 10)` | `lighten(neutralHex, 25)` |
| `--d-border` | `darken(bgHex, 12)` | `lighten(bgHex, 12)` |
| `--d-border-strong` | `darken(bgHex, 30)` | `lighten(bgHex, 25)` |

### Chart tokens

| Token | Light mode | Dark mode |
|-------|-----------|----------|
| `--d-chart-grid` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.08)` |
| `--d-chart-axis` | `rgba(0,0,0,0.3)` | `rgba(255,255,255,0.3)` |
| `--d-chart-crosshair` | `rgba(0,0,0,0.3)` | `rgba(255,255,255,0.4)` |

### Rules

- **Never pure black** in dark mode: use `#09090b` for text or `#0a0a0a` for backgrounds. Pure `#000` creates infinite contrast that is harsh on eyes.
- **Elevation via lightness**: In dark mode, "higher" surfaces are lighter -- opposite of real-world shadows. This is correct perceptually because screens emit light.
- **Hover direction inverts**: Light mode darkens on hover (pressing into surface), dark mode lightens on hover (illuminating surface). The shift magnitudes are identical.
- **Subtle alpha increases in dark mode**: Dark backgrounds need higher alpha to achieve the same perceived tint. Glass styles use higher base alpha for this reason.

---

## 7. Contrast and Accessibility Requirements

### WCAG 2.1 AA thresholds

| Content type | Minimum contrast ratio | Applies to |
|-------------|----------------------|-----------|
| Normal text (<18px or <14px bold) | 4.5:1 | Body text, labels, descriptions, button text |
| Large text (>=18px or >=14px bold) | 3:1 | Headings, display text |
| Non-text (UI components, icons) | 3:1 | Borders, icons, focus indicators, form outlines |

### The 24 validated pairs (20 text + 4 non-text)

`validateContrast()` in `derive.js` checks and auto-adjusts these pairs at token generation time:

| Foreground token | Background token | Min ratio |
|-----------------|-----------------|-----------|
| `--d-primary-fg` | `--d-primary` | 4.5 |
| `--d-accent-fg` | `--d-accent` | 4.5 |
| `--d-tertiary-fg` | `--d-tertiary` | 4.5 |
| `--d-success-fg` | `--d-success` | 4.5 |
| `--d-warning-fg` | `--d-warning` | 4.5 |
| `--d-error-fg` | `--d-error` | 4.5 |
| `--d-info-fg` | `--d-info` | 4.5 |
| `--d-fg` | `--d-bg` | 4.5 |
| `--d-muted-fg` | `--d-bg` | 4.5 |
| `--d-surface-0-fg` | `--d-surface-0` | 4.5 |
| `--d-surface-1-fg` | `--d-surface-1` | 4.5 |
| `--d-surface-2-fg` | `--d-surface-2` | 4.5 |
| `--d-surface-3-fg` | `--d-surface-3` | 4.5 |
| `--d-primary-subtle-fg` | `--d-primary-subtle` | 4.5 |
| `--d-error-subtle-fg` | `--d-error-subtle` | 4.5 |
| `--d-success-subtle-fg` | `--d-success-subtle` | 4.5 |
| `--d-warning-subtle-fg` | `--d-warning-subtle` | 4.5 |
| `--d-info-subtle-fg` | `--d-info-subtle` | 4.5 |
| `--d-accent-subtle-fg` | `--d-accent-subtle` | 4.5 |
| `--d-tertiary-subtle-fg` | `--d-tertiary-subtle` | 4.5 |
| **Non-text (3:1)** | | |
| `--d-border` | `--d-bg` | 3 |
| `--d-surface-1-border` | `--d-surface-1` | 3 |
| `--d-surface-2-border` | `--d-surface-2` | 3 |
| `--d-surface-3-border` | `--d-surface-3` | 3 |

### Auto-adjustment algorithm

When a pair fails the threshold, `adjustForContrast()` iteratively adjusts the foreground:

1. Determine direction: if background luminance < 0.5, lighten foreground; otherwise darken it.
2. Shift L by 2% per iteration (up to 50 iterations).
3. If contrast threshold is met, use the adjusted value.
4. Fallback: pure white (`#ffffff`) for dark backgrounds, near-black (`#09090b`) for light backgrounds.

### Rules

- **Never assume a color pair passes**: Always use paired tokens (`--d-{role}` with `--d-{role}-fg`). The derive engine guarantees contrast only for declared pairs.
- **Opacity reduces contrast**: `_bgprimary/50` on a white background halves the effective contrast. Validate manually when using opacity modifiers.
- **Focus indicators**: Must have 3:1 contrast against adjacent colors. The `--d-ring` token defaults to `var(--d-primary)`, which is validated against `--d-bg`.
- **Placeholder text**: Should use `--d-muted` (NOT `--d-muted-fg`). The WCAG requirement for placeholder is 3:1 (non-text), not 4.5:1.

### APCA reference (future consideration)

APCA (Accessible Perceptual Contrast Algorithm) provides perceptually linear contrast measurement. When browser support matures, Decantr may adopt APCA thresholds (Lc 60+ for body text, Lc 45+ for large text). Current implementation uses WCAG 2.1 relative luminance.

---

## 8. Colorblind Safety and Colorblind Mode

### Prevalence

Approximately 8% of males and 0.5% of females have some form of color vision deficiency (CVD). The three primary types:

| Type | Affected cone | Prevalence (male) | Colors confused |
|------|-------------|-------------------|----------------|
| Deuteranopia | Green (M-cone) | ~6% | Red-green |
| Protanopia | Red (L-cone) | ~2% | Red-green |
| Tritanopia | Blue (S-cone) | ~0.01% | Blue-yellow |

### Architecture: colorblind mode as orthogonal axis

Colorblind mode is a new orthogonal axis in the token system:

```
Style x Mode x Shape x ColorblindMode
```

API (planned):
```javascript
setColorblindMode('protanopia' | 'deuteranopia' | 'tritanopia' | 'off');
getColorblindMode();
```

### Seed transformation approach

Rather than maintaining separate palettes, colorblind mode transforms the existing seeds before passing them to `derive()`. This preserves all 171+ token derivations -- only the input changes.

| Original role | Protanopia shift | Deuteranopia shift | Tritanopia shift |
|-------------|-----------------|-------------------|-----------------|
| success (green) | Shift toward blue-green (+30deg H) | Shift toward blue-green (+30deg H) | Shift toward green (-20deg H) |
| error (red) | Increase L contrast, add orange shift | Increase L contrast, add orange shift | Keep red (unaffected) |
| warning (amber) | Keep amber (distinguishable) | Keep amber (distinguishable) | Shift toward red-orange (-15deg H) |

### Wong/Okabe-Ito chart palette (CVD-safe)

For chart data with colorblind mode active, use these 8 colors that remain distinguishable under all CVD types:

| Index | Hex | Name |
|-------|-----|------|
| 0 | `#E69F00` | Orange |
| 1 | `#56B4E9` | Sky blue |
| 2 | `#009E73` | Bluish green |
| 3 | `#F0E442` | Yellow |
| 4 | `#0072B2` | Blue |
| 5 | `#D55E00` | Vermilion |
| 6 | `#CC79A7` | Reddish purple |
| 7 | `#000000` | Black |

### Design rules for CVD safety (always, not just in CB mode)

- **Never encode meaning with color alone**: Always pair color with shape (icons), text (labels), or pattern (hatching on charts).
- **Red-green is the danger zone**: Never use red vs green as the only differentiator. Use red vs blue, or add iconography.
- **Test with simulators**: Chrome DevTools > Rendering > Emulate vision deficiencies.
- **Lightness is the safest channel**: When two colors must be distinguishable, ensure they differ in lightness by at least 30 L* (CIELAB).

---

## 9. Chart Color Guidelines

### Token inventory (37 total)

| Token family | Count | Purpose |
|-------------|-------|---------|
| `--d-chart-{0-7}` | 8 | Base series colors (resolved hex for SVG/canvas) |
| `--d-chart-{0-7}-ext-{1-3}` | 24 | Extended palette per base (lightness/hue variations) |
| `--d-chart-tooltip-bg` | 1 | Tooltip background (`var(--d-surface-2)`) |
| `--d-chart-grid` | 1 | Grid line color (low-alpha black/white) |
| `--d-chart-axis` | 1 | Axis line color |
| `--d-chart-crosshair` | 1 | Interactive crosshair color |
| `--d-chart-selection` | 1 | Selection highlight area |

### Base chart colors (derived from seeds)

| Token | Source seed | Rationale |
|-------|-----------|-----------|
| `--d-chart-0` | `primary` | Primary data series |
| `--d-chart-1` | `accent` | Secondary series |
| `--d-chart-2` | `tertiary` | Third series |
| `--d-chart-3` | `success` | Positive/growth series |
| `--d-chart-4` | `warning` | Caution series |
| `--d-chart-5` | `error` | Negative/loss series |
| `--d-chart-6` | `info` | Informational series |
| `--d-chart-7` | `neutral` | Baseline/reference series |

### Extended palette derivation

Each base color gets 3 variations for sub-series:

| Extension | Dark mode | Light mode |
|-----------|----------|-----------|
| `ext-1` | `lighten(base, 15)` | `darken(base, 15)` |
| `ext-2` | `rotateHue(base, +30deg)` | `rotateHue(base, +30deg)` |
| `ext-3` | `lighten(rotateHue(base, -30deg), 10)` | `darken(rotateHue(base, -30deg), 10)` |

### Rules

- **Maximum 8 distinguishable series**: Human perception reliably differentiates ~7 colors in a chart. Beyond 8, use grouping, highlighting, or interactive filtering.
- **Chart colors are resolved hex**: Unlike most tokens, `--d-chart-*` values are plain hex (not `var()` references) because SVG `fill`/`stroke` and Canvas APIs require resolved values.
- **Sequential data**: Use a single hue with lightness ramp (e.g., `--d-chart-0`, `--d-chart-0-ext-1`, `--d-chart-0-ext-3`).
- **Categorical data**: Use base colors 0-7 for maximum hue separation.
- **Diverging data**: Use two hues from opposite ends (e.g., `--d-chart-5` for negative, `--d-chart-3` for positive) with neutral midpoint.
- **Chart backgrounds**: Use `transparent` or inherit from the surface. Never give charts their own background color.
- **Grid and axis colors**: Use the provided low-alpha tokens. Never use solid lines for chart grids.

### Style-specific chart overrides

Auradecantism and glassmorphism provide dark-mode chart color overrides for optimal vibrancy on dark backgrounds. These are specified in the style's `overrides.dark` block and take precedence over the derived defaults.

---

## 10. Gradient Token Usage

### Token inventory (10 total)

| Token | Value (gradient=vivid) | Value (gradient=none) | Purpose |
|-------|----------------------|---------------------|---------|
| `--d-gradient-brand` | `linear-gradient(135deg, primary, accent)` | `var(--d-primary)` | Primary brand gradient (buttons, heroes) |
| `--d-gradient-brand-alt` | `linear-gradient(135deg, accent, tertiary)` | `var(--d-accent)` | Alternative brand gradient |
| `--d-gradient-brand-full` | `linear-gradient(135deg, primary, accent, tertiary)` | `var(--d-primary)` | Full spectrum brand gradient |
| `--d-gradient-surface` | `linear-gradient(180deg, surface-0, surface-1)` | `var(--d-surface-0)` | Subtle surface depth gradient |
| `--d-gradient-overlay` | `linear-gradient(180deg, transparent, overlay)` | Same | Image overlay / scrim |
| `--d-gradient-subtle` | `linear-gradient(180deg, transparent, primary-subtle)` | `transparent` | Section fade-in accent |
| `--d-gradient-text` | `linear-gradient(135deg, primary, accent)` | `var(--d-primary)` | Gradient text fill |
| `--d-gradient-text-alt` | `linear-gradient(135deg, accent, tertiary)` | `var(--d-accent)` | Alternative gradient text fill |
| `--d-gradient-angle` | `135deg` | `135deg` | Base gradient angle |
| `--d-gradient-intensity` | `1` | `0` | Binary flag: 0=solid, 1=gradient |

### When to use which

| Scenario | Token | Notes |
|----------|-------|-------|
| Hero headline text | `--d-gradient-text` with `.d-gradient-text` class | Only with vivid/mesh gradient personality |
| Primary CTA on hero | `--d-gradient-brand` as background | Attention-grabbing; use sparingly |
| Section ambient tint | `--d-gradient-subtle` | Barely visible; use for section differentiation |
| Image card overlay | `--d-gradient-overlay` | Makes text readable over images |
| Surface depth effect | `--d-gradient-surface` | Adds depth without color; safe for all contexts |
| Check if gradients active | `--d-gradient-intensity` | `0` = solid fills preferred; `1` = gradients enabled |

### Composable gradient atoms

For custom gradients beyond tokens, use the composable gradient system:

```javascript
css('_gradBR _fromPrimary _toAccent')               // bottom-right gradient
css('_gradR _fromPrimary _viaSuccess _toTransparent') // three-stop gradient
```

See `reference/atoms.md` for the full list of direction, from, via, and to atoms.

### Mesh gradient composition

Mesh backgrounds (used by auradecantism, glassmorphism) layer multiple radial gradients:

```css
/* auradecantism .d-mesh */
background:
  radial-gradient(ellipse at 20% 50%, rgba(primary, 0.15), transparent 50%),
  radial-gradient(ellipse at 80% 20%, rgba(accent, 0.10), transparent 50%),
  radial-gradient(ellipse at 60% 80%, rgba(tertiary, 0.08), transparent 50%),
  var(--d-bg);
```

Rules: always layer on top of `var(--d-bg)` as the final stop; use low opacity (0.04-0.15); position ellipses off-center for organic feel.

---

## 11. Color Psychology and Brand Application

### Color-emotion associations (Western cultural context)

| Hue range | Primary associations | Secondary associations | Caution |
|-----------|---------------------|----------------------|---------|
| Red (0-15deg) | Energy, urgency, passion | Danger, error, stop | Universally associated with error/danger in UI |
| Orange (15-45deg) | Warmth, enthusiasm, creativity | Warning, attention | Can feel less serious; good for CTAs |
| Yellow (45-70deg) | Optimism, clarity, caution | Warning, highlight | Low contrast on white; needs dark text |
| Green (70-165deg) | Growth, success, nature | Go/proceed, safety, money | Universal positive indicator in UI |
| Teal/Cyan (165-195deg) | Trust, technology, calm | Info, coolness | Good primary for SaaS/tech |
| Blue (195-255deg) | Trust, stability, professionalism | Corporate, communication | Most common primary in enterprise UI |
| Purple (255-300deg) | Creativity, luxury, wisdom | Premium, spiritual | Often reads as "creative" or "premium" |
| Pink/Magenta (300-345deg) | Playfulness, boldness, warmth | Fashion, emotion | High energy; use as accent or primary |

### Cultural differences (non-exhaustive)

| Color | Western | East Asian | Middle Eastern |
|-------|---------|-----------|---------------|
| Red | Danger, passion | Luck, prosperity, celebration | Danger, caution |
| White | Purity, clean | Death, mourning (some contexts) | Purity, peace |
| Green | Nature, go | Youth, growth | Islam, paradise |
| Yellow | Warning, optimism | Royalty (imperial China) | Happiness, wealth |
| Black | Elegance, death | Power, mystery | Death, evil (some contexts) |

### Decision table: brand archetype to seed hue

| Brand archetype | Primary hue range | Accent strategy | Example styles |
|----------------|------------------|----------------|---------------|
| **Trustworthy / Corporate** | Blue (210-240deg) | Complementary warm (orange/amber) | clean |
| **Innovative / Tech** | Cyan-blue (180-210deg) | Analogous cool (teal/purple) | glassmorphism |
| **Bold / Disruptive** | Red-pink (330-15deg) | Triadic (cyan + purple) | auradecantism |
| **Natural / Sustainable** | Green (120-150deg) | Analogous earth (brown/amber) | clean with green seed |
| **Premium / Luxury** | Purple-violet (270-300deg) | Monochromatic or gold accent | glassmorphism with purple seed |
| **Operational / Military** | Cyan (180-195deg) | Monochromatic | custom monochrome style |
| **Playful / Creative** | Pink-orange (330-30deg) | Split-complementary | auradecantism or retro |

---

## 12. Bouquet Layer (Decantation Process)

In the Decantation Process, the **Bouquet** is the color personality derived from Character traits. During SETTLE, Character words map to palette preferences:

### Character trait to palette mapping

| Character trait | Chroma preference | Hue temperature | Gradient intensity | Surface contrast |
|----------------|-------------------|-----------------|-------------------|-----------------|
| minimal | Low | Cool-neutral | none | Low (surfaces close in lightness) |
| clean | Medium-low | Neutral | none | Medium |
| professional | Medium | Cool blue | none or subtle | Medium |
| bold | High | Warm or triadic | vivid | High |
| playful | High | Warm multicolor | vivid or mesh | Medium-high |
| luxurious | Medium | Cool or warm purple | subtle or vivid | Low-medium |
| technical | Low-medium | Cool cyan | none | Medium (high in data-dense) |
| tactical | Low | Cool monochrome | none | High (sharp boundaries) |
| editorial | Medium | Warm neutral | subtle | Low (content-focused) |
| energetic | High | Warm triadic | vivid or mesh | High |

### Chroma and saturation rules

- **Low chroma** (minimal, tactical): Seed colors should have HSL saturation < 60%. Muted palettes. Neutrals dominate.
- **Medium chroma** (professional, clean): Seed saturation 40-70%. Primary stands out; other roles are muted.
- **High chroma** (bold, playful): Seed saturation > 65%. Vivid palette. Multiple roles compete for attention -- the 60-30-10 rule becomes critical.

### Cork rule (anti-drift)

Once a Bouquet profile is established in the Essence, all generated code must maintain it. A "minimal" project should never produce vivid gradient buttons. A "tactical" project should never use warm pink accents. The cork validates:

1. Gradient usage matches `--d-gradient-intensity` from the Vintage.
2. Color atoms used in generated code stay within the declared role tokens.
3. Custom `define()` colors do not introduce hues outside the seed palette.

---

## 13. OKLCH Color Space and P3 Gamut

### Why OKLCH

OKLCH (Oklab Lightness, Chroma, Hue) is a perceptually uniform color space. Unlike HSL:

| Property | HSL | OKLCH |
|----------|-----|-------|
| Perceptual uniformity | No -- equal L shifts produce unequal perceived brightness | Yes -- L 0.5 looks equally bright across all hues |
| Gamut | sRGB only | Supports P3 and Rec.2020 |
| Hue stability | Hue shifts affect perceived lightness | Hue shifts preserve perceived lightness |
| Chroma behavior | Saturation 100% means different vividness per hue | Chroma is absolute -- comparable across hues |

### OKLCH channel meanings

| Channel | Range | Meaning |
|---------|-------|---------|
| L (Lightness) | 0-1 | Perceived brightness (0 = black, 1 = white) |
| C (Chroma) | 0-0.4+ | Color intensity / saturation (0 = gray) |
| H (Hue) | 0-360deg | Color angle on the perceptual color wheel |

### Implementation

Decantr's `derive.js` uses OKLCH for all color math. Key functions in `src/css/derive.js`:

- `rgbToOklch(r, g, b)` — Convert sRGB (0-255) to OKLCH `{ L, C, H }`
- `oklchToRgb(L, C, H)` — Convert OKLCH back to sRGB with gamut mapping
- `gamutMap(L, C, H)` — Clamp out-of-gamut OKLCH colors to sRGB via binary search on chroma
- `lighten(hex, amount)` — Shift OKLCH L upward (perceptually uniform)
- `darken(hex, amount)` — Shift OKLCH L downward (perceptually uniform)
- `mixColors(hex1, hex2, weight)` — Interpolate two colors in OKLCH space
- `rotateHue(hex, degrees)` — Rotate OKLCH H while preserving L and C

All operations are perceptually uniform -- a 4-unit lightness shift looks the same whether the hue is yellow (H=100) or blue (H=260). Seed colors remain hex (sRGB) for backward compatibility; derived tokens output hex via `oklchToRgb()` + `gamutMap()`.

### P3 gamut opportunity

Display P3 gamut enables colors 25% more vivid than sRGB -- particularly in cyan, green, and deep red/magenta ranges. Since `derive.js` already operates in OKLCH, a future P3 output path would add `oklch()` or `color(display-p3 ...)` CSS with sRGB fallbacks. Relevant styles:

- **Auradecantism**: Neon cyan (`#0AF3EB`) and hot pink (`#FE4474`) approach sRGB gamut boundaries.
- **Glassmorphism**: Sky-blue and green accents benefit from P3 chroma.

### Rules

- Use `lighten(hex, amount)` and `darken(hex, amount)` for lightness shifts. The amount is an OKLCH L shift (perceptually uniform across all hues).
- All hue rotations preserve perceived lightness -- no HSL-era compensation needed.
- When choosing seed colors, verify that hover/active states derived from them remain visually distinct. `validateContrast()` in `derive.js` auto-adjusts pairs that fail WCAG AA.

---

## 14. Style Seed Inventories

Complete seed tables for all 5 built-in styles.

### Auradecantism (default)

| Seed | Hex | OKLCH approx (L, C, H) | Character |
|------|-----|------------------------|-----------|
| primary | `#FE4474` | 0.63, 0.22, 12deg | Hot pink -- energetic, bold |
| accent | `#0AF3EB` | 0.87, 0.15, 195deg | Electric cyan -- futuristic |
| tertiary | `#6500C6` | 0.35, 0.24, 303deg | Deep purple -- creative |
| neutral | `#8892a4` | 0.63, 0.03, 255deg | Cool gray-blue |
| success | `#00C388` | 0.70, 0.16, 165deg | Emerald |
| warning | `#FDA303` | 0.78, 0.17, 75deg | Amber |
| error | `#EF233C` | 0.55, 0.23, 25deg | Crimson |
| info | `#0AF3EB` | 0.87, 0.15, 195deg | Same as accent |
| bg | `#f0f4ff` | 0.96, 0.02, 265deg | Cool blue-tinted white |
| bgDark | `#060918` | 0.07, 0.03, 265deg | Deep navy-black |

**Identity**: Vibrant triadic harmony (pink/cyan/purple). High chroma. Gradient=vivid. Glass elevation. Pill radius. The most expressive built-in style.

### Clean

| Seed | Hex | OKLCH approx (L, C, H) | Character |
|------|-----|------------------------|-----------|
| primary | `#1366D9` | 0.50, 0.17, 255deg | Classic blue |
| accent | `#7c3aed` | 0.49, 0.24, 295deg | Violet |
| tertiary | `#0891b2` | 0.57, 0.11, 215deg | Teal |
| neutral | `#71717a` | 0.52, 0.01, 265deg | True gray |
| success | `#22c55e` | 0.70, 0.18, 150deg | Green |
| warning | `#f59e0b` | 0.76, 0.17, 75deg | Amber |
| error | `#ef4444` | 0.59, 0.22, 25deg | Red |
| info | `#3b82f6` | 0.59, 0.18, 260deg | Blue |
| bg | `#ffffff` | 1.00, 0.00, 0deg | Pure white |
| bgDark | `#0a0a0a` | 0.07, 0.00, 0deg | Near-black |

**Identity**: Analogous-cool (blue/violet/teal within ~80deg hue span). Medium chroma. No gradients. Subtle elevation. Rounded radius. The professional safe choice.

### Retro

| Seed | Hex | OKLCH approx (L, C, H) | Character |
|------|-----|------------------------|-----------|
| primary | `#e63946` | 0.57, 0.21, 22deg | Bold red |
| accent | `#457b9d` | 0.53, 0.07, 230deg | Dusty blue |
| tertiary | `#2a9d8f` | 0.60, 0.10, 180deg | Teal |
| neutral | `#6b7280` | 0.52, 0.02, 255deg | Cool gray |
| success | `#1a7a42` | 0.47, 0.13, 155deg | Deep green |
| warning | `#e06600` | 0.61, 0.18, 50deg | Burnt orange |
| error | `#c41e1e` | 0.47, 0.20, 25deg | Deep red |
| info | `#2e6b8a` | 0.47, 0.07, 230deg | Steel blue |
| bg | `#fffef5` | 0.99, 0.01, 95deg | Warm cream |
| bgDark | `#1a1a1a` | 0.14, 0.00, 0deg | Dark gray |

**Identity**: Tetradic (red/blue/teal/orange). Medium-high chroma but desaturated compared to auradecantism. No gradients. Brutalist elevation. Sharp radius. Physical, tactile feel.

### Glassmorphism

| Seed | Hex | OKLCH approx (L, C, H) | Character |
|------|-----|------------------------|-----------|
| primary | `#38bdf8` | 0.75, 0.14, 230deg | Sky blue |
| accent | `#22d3ee` | 0.79, 0.13, 210deg | Cyan |
| tertiary | `#4ade80` | 0.79, 0.18, 150deg | Mint green |
| neutral | `#6b7a94` | 0.54, 0.03, 250deg | Blue-gray |
| success | `#4ade80` | 0.79, 0.18, 150deg | Same as tertiary |
| warning | `#fbbf24` | 0.82, 0.16, 80deg | Gold |
| error | `#f87171` | 0.66, 0.17, 20deg | Light red |
| info | `#38bdf8` | 0.75, 0.14, 230deg | Same as primary |
| bg | `#f0f4f9` | 0.96, 0.01, 245deg | Cool blue-tinted |
| bgDark | `#0a0c10` | 0.07, 0.01, 250deg | Deep blue-black |

**Identity**: Analogous (sky-blue/cyan/green). Cool palette. Vivid gradients. Glass elevation. Pill radius. Atmospheric and stormy.

---

## 15. Custom Style Color Selection Guide

For authors using `registerStyle()` to create custom styles.

### Step 1: Choose primary hue

The primary hue sets the brand identity. Reference the color psychology table in section 11. Verify the hue produces sufficient contrast for `--d-primary-fg` on both light and dark backgrounds.

### Step 2: Choose harmony strategy

Based on Character traits (section 12), select a harmony type (section 5). Then determine accent and tertiary:

| Harmony | Accent formula | Tertiary formula |
|---------|---------------|-----------------|
| Monochromatic | Omit (auto-derived within +/-20deg) | Omit (auto-derived) |
| Analogous | Primary +/- 30-40deg | Primary +/- 60-80deg (same direction) |
| Split-complementary | Primary + 150deg | Primary - 150deg |
| Triadic | Primary + 120deg | Primary + 240deg |

### Step 3: Set bg and bgDark

| Requirement | Light bg | Dark bgDark |
|-------------|---------|-------------|
| Pure neutral | `#ffffff` | `#0a0a0a` |
| Warm tint | `#fffef5` to `#fef6ee` | `#1a1a1a` |
| Cool tint | `#f0f4ff` to `#f0f4f9` | `#050a10` to `#060918` |
| Minimum lightness (dark) | -- | L >= 0.03 (OKLCH) to avoid pure black |
| Maximum lightness (light) | L <= 100% | -- |

### Step 4: Choose personality traits

Personality traits affect how colors are derived (shift intensities, alpha values). Key interactions:

| Trait | Color impact |
|-------|-------------|
| `elevation: 'glass'` | Lower hover/active shifts (5/10 vs 8/15); higher subtle alpha (0.20/0.25); lower border alpha (0.20/0.30) |
| `elevation: 'brutalist'` | Higher hover/active shifts (12/20); high border alpha (0.80); high-contrast, bold feel |
| `gradient: 'vivid'` | Enables gradient tokens; `--d-gradient-intensity: 1` |
| `gradient: 'none'` | All gradient tokens fall back to solid colors; `--d-gradient-intensity: 0` |
| `palette: 'monochrome'` | Forces all roles to derive from primary within +/-20deg hue |

### Step 5: Verify and override

After calling `derive()`, check:

1. All 24 contrast pairs pass (automatic via `validateContrast()`).
2. Surfaces form a visible progression (test visually).
3. Hover states are perceptibly different from base (especially for light yellows/greens).
4. Use `overrides: { light: {}, dark: {} }` for manual corrections.

### Example: custom warm premium style

```javascript
registerStyle({
  id: 'premium',
  name: 'Premium',
  seed: {
    primary: '#8b5cf6',     // violet
    accent: '#d946ef',      // magenta (analogous +30deg)
    tertiary: '#6366f1',    // indigo (analogous -30deg)
    neutral: '#71717a',
    success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#8b5cf6',
    bg: '#faf9fc',          // warm purple-tinted white
    bgDark: '#0c0a12',      // deep purple-black
  },
  personality: { radius: 'pill', elevation: 'glass', motion: 'smooth', borders: 'thin', gradient: 'vivid' },
});
```

---

## 16. DOs and DON'Ts (Enforcement Rules)

### DOs

| # | Rule | Rationale |
|---|------|-----------|
| 1 | DO use semantic tokens (`--d-primary`, `--d-error`) for all color values | Colors adapt to style/mode changes automatically |
| 2 | DO pair foreground and background tokens (`--d-{role}` with `--d-{role}-fg`) | Guarantees WCAG AA contrast |
| 3 | DO use `_fgfg` for primary text, `_fgmutedfg` for secondary text, `_fgmuted` for tertiary text | Three-level text hierarchy via atoms |
| 4 | DO use subtle variants (`--d-{role}-subtle` + `--d-{role}-subtle-fg`) for inline alerts and badges | Lower visual weight than solid fills |
| 5 | DO use surface tokens for container backgrounds (`_surface0` through `_surface3`) | Automatic depth progression per style |
| 6 | DO use `--d-border` for default borders and `--d-border-strong` for emphasis borders | Consistent border system across modes |
| 7 | DO use `--d-ring` for focus indicators | Coordinated with primary color |
| 8 | DO use opacity modifiers (`_bgprimary/50`) for transparent overlays | Maintained within the atom system |
| 9 | DO use `--d-overlay` for modal/dialog backdrops | Correct alpha per mode (0.5 light, 0.7 dark) |
| 10 | DO use the composable gradient system (`_gradBR _fromPrimary _toAccent`) for custom gradients | Token-backed, responsive-compatible |
| 11 | DO check `--d-gradient-intensity` before applying gradients | Respects the style's gradient personality |
| 12 | DO pair color with non-color indicators (icons, text, patterns) | CVD safety; never color alone for meaning |
| 13 | DO test color choices in both light and dark modes | Colors that work in one mode may fail in the other |
| 14 | DO use chart tokens (`--d-chart-*`) for all data visualization colors | Resolved hex for SVG/canvas; coordinated per style |
| 15 | DO respect the 60-30-10 distribution rule | Visual balance and hierarchy |

### DON'Ts

| # | Rule | Rationale |
|---|------|-----------|
| 1 | DON'T hardcode hex values in component or consumer code | Breaks style/mode switching; bypasses contrast validation |
| 2 | DON'T use `style: 'color:red'` or `style: 'background:#1a1a1a'` for static colors | Always use atoms or tokens. See `CLAUDE.md` inline-style prohibition |
| 3 | DON'T use `--d-error` for non-error semantics (e.g., a red brand color) | Error red must mean "error." Use `--d-primary` with a red seed instead |
| 4 | DON'T use `--d-success` for decoration | Green must mean "positive outcome" |
| 5 | DON'T mix surface tiers out of order (surface-3 inside surface-0 is wrong) | Breaks monotonic depth perception |
| 6 | DON'T assume opacity modifiers pass contrast | `_bgprimary/30` on white has ~30% effective contrast of solid |
| 7 | DON'T use `rgba()` or `hsla()` directly in component code | Not token-backed; won't adapt to style/mode changes |
| 8 | DON'T use more than 8 colors in a single chart | Beyond 8, humans cannot reliably distinguish colors |
| 9 | DON'T assign semantic meaning to chart colors (e.g., chart-3 = "revenue") | Chart color indices may change per style |
| 10 | DON'T use white text on yellow/lime backgrounds | Extremely low contrast; `pickForeground()` will choose dark |
| 11 | DON'T use `--d-fg` on `--d-primary` (it is white-on-color, not guaranteed) | Use `--d-primary-fg` on `--d-primary` |
| 12 | DON'T create per-component color variables (`--my-card-bg`) | Use existing surface/palette tokens; custom variables fragment the system |
| 13 | DON'T lighten/darken tokens at usage site (`color-mix(--d-primary, white 20%)`) | The derive engine handles all variants. Use `--d-{role}-hover` or `--d-{role}-subtle` |
| 14 | DON'T use pure black (`#000000`) as a background or text color | Use `#09090b` (fg) or `#0a0a0a` (bg) for near-black |
| 15 | DON'T use gradients when `--d-gradient-intensity` is `0` | The style explicitly opts out of gradients; respect it |

---

## 17. Token-to-Atom Quick Reference

Lookup: "I want this visual effect, which atom do I use, and what token backs it?"

### Foreground (text) atoms

| Atom | CSS output | Token | Usage |
|------|-----------|-------|-------|
| `_fgfg` | `color:var(--d-fg)` | `--d-fg` | Primary body text |
| `_fgmutedfg` | `color:var(--d-muted-fg)` | `--d-muted-fg` | Secondary/label text |
| `_fgmuted` | `color:var(--d-muted)` | `--d-muted` | Tertiary/disabled text |
| `_fgprimary` | `color:var(--d-primary)` | `--d-primary` | Accent text, links |
| `_fgaccent` | `color:var(--d-accent)` | `--d-accent` | Secondary accent text |
| `_fgsuccess` | `color:var(--d-success)` | `--d-success` | Success indicator text |
| `_fgwarning` | `color:var(--d-warning)` | `--d-warning` | Warning indicator text |
| `_fgerror` | `color:var(--d-error)` | `--d-error` | Error message text |
| `_fginfo` | `color:var(--d-info)` | `--d-info` | Informational text |
| `_fgprimaryon` | `color:var(--d-primary-fg)` | `--d-primary-fg` | Text on primary fill |
| `_fgsuccesssub` | `color:var(--d-success-subtle-fg)` | `--d-success-subtle-fg` | Text on success subtle bg |

### Background atoms

| Atom | CSS output | Token | Usage |
|------|-----------|-------|-------|
| `_bgbg` | `background:var(--d-bg)` | `--d-bg` | Page background |
| `_bgmuted` | `background:var(--d-muted)` | `--d-muted` | Muted/disabled background |
| `_bgprimary` | `background:var(--d-primary)` | `--d-primary` | Primary action fill |
| `_bgaccent` | `background:var(--d-accent)` | `--d-accent` | Accent fill |
| `_bgsuccess` | `background:var(--d-success)` | `--d-success` | Success indicator fill |
| `_bgwarning` | `background:var(--d-warning)` | `--d-warning` | Warning indicator fill |
| `_bgerror` | `background:var(--d-error)` | `--d-error` | Error indicator fill |
| `_bgprimarysub` | `background:var(--d-primary-subtle)` | `--d-primary-subtle` | Tinted primary background |
| `_bgerrorsub` | `background:var(--d-error-subtle)` | `--d-error-subtle` | Tinted error background |

### Surface atoms

| Atom | CSS output | Token | Usage |
|------|-----------|-------|-------|
| `_surface0` | `background:var(--d-surface-0)` | `--d-surface-0` | Page canvas level |
| `_surface1` | `background:var(--d-surface-1)` | `--d-surface-1` | Cards, panels |
| `_surface2` | `background:var(--d-surface-2)` | `--d-surface-2` | Modals, elevated panels |
| `_surface3` | `background:var(--d-surface-3)` | `--d-surface-3` | Tooltips, highest emphasis |
| `_fgsurface0` | `color:var(--d-surface-0-fg)` | `--d-surface-0-fg` | Text on surface-0 |
| `_bcsurface1` | `border-color:var(--d-surface-1-border)` | `--d-surface-1-border` | Border for surface-1 |

### Border color atoms

| Atom | CSS output | Token | Usage |
|------|-----------|-------|-------|
| `_bcborder` | `border-color:var(--d-border)` | `--d-border` | Default borders |
| `_bcstrong` | `border-color:var(--d-border-strong)` | `--d-border-strong` | Emphasis borders |
| `_bcprimary` | `border-color:var(--d-primary)` | `--d-primary` | Primary accent border |
| `_bcsuccess` | `border-color:var(--d-success)` | `--d-success` | Success state border |
| `_bcerror` | `border-color:var(--d-error)` | `--d-error` | Error state border |
| `_bcsuccessbdr` | `border-color:var(--d-success-border)` | `--d-success-border` | Success subtle border |
| `_bcerrorbdr` | `border-color:var(--d-error-border)` | `--d-error-border` | Error subtle border |

### Opacity modifiers

Append `/N` to any color atom for alpha transparency via `color-mix()`:

```javascript
css('_bgprimary/50')    // 50% opacity primary background
css('_fgaccent/30')     // 30% opacity accent text
css('_bcborder/80')     // 80% opacity border
```

Valid opacities: 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95.

---

### Badge vs Chip Decision Rules

| Component | When to use | Visual | Interactive? |
|-----------|-------------|--------|-------------|
| **Badge** | Status indicators, counts, version labels | Pill, subtle bg | No |
| **Chip** | Filters, tags, categories, removable labels | Pill, border + subtle bg | Yes (click, remove) |

**Rule**: If it's a status/count → Badge. If it's a label/filter/category → Chip. Never hand-roll status indicators with divs.

Badge now defaults to subtle token backgrounds (e.g., `--d-success-subtle` + `--d-success-on-subtle`). Use `solid` prop for the saturated look when intentionally desired.

### One Elevation Rule

Each element should receive exactly **one** depth treatment. Do not stack multiple elevation effects:
- `d-glass` OR `aura-glow` — never both on the same element
- Card already has elevation from its own `box-shadow` — adding `d-glass` suppresses the card shadow automatically
- Statistic components inside Cards should NOT receive `d-glass` or `aura-glow` — the Card provides the elevation layer

---

## 18. Quick Reference Decision Table

Master lookup: "I am coloring X -- what token/atom do I use?"

| I am coloring... | Token | Atom | Section |
|-----------------|-------|------|---------|
| Page background | `--d-bg` | `_bgbg` | S4 Surface |
| Primary body text | `--d-fg` | `_fgfg` | S2 Roles |
| Secondary/label text | `--d-muted-fg` | `_fgmutedfg` | S2 Roles |
| Disabled/tertiary text | `--d-muted` | `_fgmuted` | S2 Roles |
| Link text | `--d-primary` | `_fgprimary` | S2 Roles |
| Primary CTA button bg | `--d-primary` | `_bgprimary` | S2 Roles |
| Primary CTA button text | `--d-primary-fg` | `_fgprimaryon` | S2 Roles |
| Secondary button bg | `--d-surface-1` or `--d-muted` | `_surface1` or `_bgmuted` | S4 Surface |
| Card background | `--d-surface-1` | `_surface1` | S4 Surface |
| Modal background | `--d-surface-2` | `_surface2` | S4 Surface |
| Tooltip background | `--d-surface-3` | `_surface3` | S4 Surface |
| Modal backdrop | `--d-overlay` | N/A | S6 Mode Math |
| Default border | `--d-border` | `_bcborder` | S2 Roles |
| Emphasis border | `--d-border-strong` | `_bcstrong` | S2 Roles |
| Focus ring | `--d-ring` | N/A (handled by `_base.js`) | S7 Contrast |
| Success alert bg | `--d-success-subtle` | `_bgsuccesssub` | S2 Roles |
| Success alert text | `--d-success-subtle-fg` | `_fgsuccesssub` | S2 Roles |
| Success alert border | `--d-success-border` | `_bcsuccessbdr` | S2 Roles |
| Error message text | `--d-error` | `_fgerror` | S2 Roles |
| Error input border | `--d-error` | `_bcerror` | S2 Roles |
| Warning badge bg (solid) | `--d-warning` | `_bgwarning` | S2 Roles |
| Warning badge text | `--d-warning-fg` | `_fgwarningon` | S2 Roles |
| Chart primary series | `--d-chart-0` | N/A (use token directly) | S9 Charts |
| Chart grid lines | `--d-chart-grid` | N/A | S9 Charts |
| Gradient hero text | `--d-gradient-text` | `.d-gradient-text` class | S10 Gradients |
| Brand gradient bg | `--d-gradient-brand` | N/A (use token as background) | S10 Gradients |
| Transparent overlay on image | `--d-gradient-overlay` | N/A | S10 Gradients |
| Selection highlight | `--d-selection-bg` / `--d-selection-fg` | N/A (automatic) | S6 Mode Math |
| Scrollbar thumb | Style-defined in `components` CSS | N/A | S14 Style Inventories |

---

**See also:** `reference/tokens.md`, `reference/atoms.md`, `reference/style-system.md`, `reference/spatial-guidelines.md`, `reference/decantation-process.md`
