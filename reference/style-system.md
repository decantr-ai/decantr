# Style + Mode System

Decantr uses an orthogonal **style x mode** architecture. Visual personality (style) is independent from color mode (light/dark/auto).

## Styles (Visual Personality)

| Style | Description | Personality |
|-------|-------------|-------------|
| auradecantism | **(default)** Dark glass aesthetic — vibrant purple/cyan/pink palette, mesh gradients, luminous glow, frosted surfaces | radius:pill, elevation:glass, motion:bouncy, borders:thin, density:comfortable, gradient:vivid |
| clean | Modern minimal — rounded corners, subtle shadows, smooth motion | radius:rounded, elevation:subtle, motion:smooth, borders:thin, density:comfortable, gradient:none |
| retro | Neobrutalism — sharp corners, offset shadows, bold borders | radius:sharp, elevation:brutalist, motion:snappy, borders:bold, density:comfortable, gradient:none |
| glassmorphism | Frosted glass — translucent surfaces, vivid gradients, bouncy motion | radius:pill, elevation:glass, motion:bouncy, borders:thin, density:comfortable, gradient:vivid |
| command-center | HUD/radar monochromatic — dark operational panels, beveled frames, scanlines, scoped monospace on data elements | radius:sharp, elevation:flat, motion:snappy, borders:bold, density:compact, gradient:none, palette:monochrome |

## Modes

| Mode | Behavior |
|------|----------|
| light | Light color scheme |
| dark | Dark color scheme |
| auto | Tracks system `prefers-color-scheme`, listens for changes |

## Seed-Derived Token System

10 seed colors + 6 personality traits are algorithmically expanded into **280+ CSS custom properties** by `src/css/derive.js`. No manual color definitions needed — everything is computed.

**Seed colors:** primary, accent, tertiary, neutral, success, warning, error, info, bg, bgDark
**Personality traits:** radius (sharp/rounded/pill), elevation (flat/subtle/raised/glass/brutalist), motion (instant/snappy/smooth/bouncy), borders (none/thin/bold), density (compact/comfortable/spacious), gradient (none/subtle/vivid/mesh)

## Custom Styles

```javascript
registerStyle({
  id: 'my-style',
  name: 'My Style',
  seed: { primary: '#6366f1', accent: '#ec4899', bg: '#ffffff', bgDark: '#0a0a0a' },
  personality: { radius: 'pill', elevation: 'glass', motion: 'bouncy', borders: 'none' },
  typography: { '--d-fw-heading': '800' },  // optional overrides
  overrides: { light: {}, dark: {} },       // optional per-mode token overrides
  components: '',                            // optional component CSS (array of CSS rule strings or joined string)
  // Component CSS overrides let styles transform standard components:
  // e.g., command-center overrides .d-card → cc-frame aesthetic,
  //        .d-statistic → cc-glow + cc-data, .d-table-wrap → cc-scanline
  // This is the primary mechanism for recipe visual transforms.
});
```

## Shape API

Shapes control border-radius personality independently from the style. Available shapes: `sharp`, `rounded`, `pill`.

```javascript
setShape('pill');   // All components use pill radius
getShape();         // 'pill'
getShapeList();     // ['sharp', 'rounded', 'pill']
```

Shapes override the style's default radius. The command-center style defaults to `sharp`; glassmorphism defaults to `pill`.

## Colorblind Mode

Colorblind mode is an orthogonal axis alongside style, mode, and shape: `Style x Mode x Shape x ColorblindMode`.

```javascript
setColorblindMode('protanopia');  // Red-green CVD safety
setColorblindMode('deuteranopia'); // Red-green CVD safety (same shifts)
setColorblindMode('tritanopia');   // Blue-yellow CVD safety
setColorblindMode('off');          // Default (no transformation)
getColorblindMode();               // Signal getter
```

**Architecture:** Seeds are transformed BEFORE `derive()` processes them, so all derived tokens (hover, active, subtle, border, chart, gradient) automatically adapt. Chart tokens are replaced with Wong/Okabe-Ito adapted palettes for maximum CVD safety.

**Seed shifts (protanopia/deuteranopia):** error red -> magenta (OKLCH H ~345), success green -> teal (OKLCH H ~190). Primary/accent/tertiary shifted if in red or green hue zones.

**Seed shifts (tritanopia):** info blue -> teal (OKLCH H ~170), warning yellow -> orange (OKLCH H ~50). Primary shifted if in blue hue zone.

`resetStyles()` resets colorblind mode to `'off'`. See `reference/color-guidelines.md` for full documentation.

## OKLCH Color Space

All color math in `derive.js` uses **OKLCH** (perceptually uniform color space) instead of HSL. This means:
- `lighten(hex, amount)` and `darken(hex, amount)` adjust the OKLCH L channel
- `mixColors(hex1, hex2, weight)` interpolates in OKLCH space with short-arc hue blending
- `rotateHue(hex, degrees)` rotates the OKLCH H channel
- Hover states look more consistent across all 7 palette roles (same perceived brightness shift regardless of hue)
- `adjustForContrast()` converges faster due to perceptual uniformity

Internal exports for testing/advanced use: `rgbToOklch(r,g,b)`, `oklchToRgb(L,C,H)`, `gamutMap(L,C,H)`.

## Monochrome Palette

The `palette: 'monochrome'` personality trait (used by command-center) constrains **decorative** role colors (accent, tertiary, info) within ±20° of the primary hue. **Semantic** roles (success, warning, error) retain their standard hues (green, amber, red) so that trend indicators, status badges, and alerts have correct color meaning even in monochrome mode. WCAG AA validated via `validateContrast()`.

## Animation System

Decantr provides built-in animations for all overlay/dialog lifecycle transitions:

**Entry animations** (CSS keyframes, automatic):
- Modal panel: `d-scalein` (scale 0.95→1 + fade)
- Drawer panel: `d-slidein-l/r/t/b` (directional slide + fade)
- Popover, Dropdown, Select, Combobox, ContextMenu: `d-scalein` (scale + fade)
- Tooltip: `d-fadein` (fade only)
- Tab panel: `d-fadein` on switch
- Toast: `d-slidein-t` (slide down)

**Exit animations** (automatic on close):
- Modal: `d-scaleout` (reverse scale + fade) before `dialog.close()`
- Drawer: `d-slideout-l/r/t/b` (reverse directional slide) before `dialog.close()`
- Overlay types (Dropdown, Select, etc.): `d-overlay-exit` class applied during close timeout

**Stagger animations** (opt-in via CSS classes):
- `d-stagger` — children fade in sequentially (50ms delay per child)
- `d-stagger-up` — children slide up sequentially
- `d-stagger-scale` — children scale in sequentially

**Statistic count-up** (opt-in via `animate` prop):
- `Statistic({ value: 12480, animate: true })` — counts from 0 with easeOutExpo
- `Statistic({ value: 12480, animate: 2000 })` — custom duration in ms

**Toast progress bar** — visual countdown automatically added when `duration > 0`.

**Tab indicator** — sliding underline animates between tabs via CSS transitions.

All animations respect `prefers-reduced-motion: reduce` media query.

## Backward Compatibility

`setTheme()`, `getTheme()`, `registerTheme()` are backward-compatible wrappers around the Style+Mode API. Legacy `--c0`–`--c9` color variables and `_fg0`–`_fg9` atoms have been removed — use semantic atoms (`_fgfg`, `_fgmutedfg`, `_fgprimary`, etc.) instead.

## Build-Time Style Elimination

At build time, unused style modules are automatically detected and removed from the bundle. The build pipeline scans user code for `setStyle()` and `setTheme()` calls, and checks `decantr.essence.json` and `decantr.config.json` for style references. Only the default style (auradecantism) and explicitly referenced styles are shipped. For a default app using only auradecantism, this eliminates 4 unused styles and saves ~17 KB raw.

See `reference/build-tooling.md` for full details on the detection and elimination pipeline.

## Key Files

- `src/css/derive.js` — Color math, personality presets, main `derive()` function
- `src/css/styles/auradecantism.js` / `clean.js` / `retro.js` / `glassmorphism.js` / `command-center.js` — Style definitions
- `src/css/theme-registry.js` — State management, DOM injection, public API
- `src/css/index.js` — Public CSS module exports

---

**See also:** `reference/tokens.md`, `reference/decantation-process.md`, `reference/atoms.md`
