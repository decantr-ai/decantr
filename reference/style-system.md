# Style + Mode System

Decantr uses an orthogonal **style x mode** architecture. Visual personality (style) is independent from color mode (light/dark/auto).

## Styles (Visual Personality)

| Style | Description | Personality |
|-------|-------------|-------------|
| auradecantism | **(default)** Dark glass aesthetic — vibrant purple/cyan/pink palette, mesh gradients, luminous glow, frosted surfaces | radius:pill, elevation:glass, motion:bouncy, borders:thin |
| clean | Modern minimal — rounded corners, subtle shadows, smooth motion | radius:rounded, elevation:subtle, motion:smooth, borders:thin |
| retro | Neobrutalism — sharp corners, offset shadows, bold borders | radius:sharp, elevation:brutalist, motion:snappy, borders:bold |
| glassmorphism | Frosted glass — translucent surfaces, vivid gradients, bouncy motion | radius:pill, elevation:glass, motion:bouncy, borders:thin |

## Modes

| Mode | Behavior |
|------|----------|
| light | Light color scheme |
| dark | Dark color scheme |
| auto | Tracks system `prefers-color-scheme`, listens for changes |

## Seed-Derived Token System

10 seed colors + 6 personality traits are algorithmically expanded into **170+ CSS custom properties** by `src/css/derive.js`. No manual color definitions needed — everything is computed.

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
  components: '',                            // optional component CSS
});
```

## Legacy Backward Compatibility

`--c0` through `--c9` are automatically mapped from the new tokens via `legacyColorMap()`. Legacy atoms `_bg0`-`_bg9`, `_fg0`-`_fg9`, `_bc0`-`_bc9` still work. `setTheme()`, `getTheme()`, `registerTheme()` are backward-compatible wrappers.

## Key Files

- `src/css/derive.js` — Color math, personality presets, main `derive()` function
- `src/css/styles/auradecantism.js` / `clean.js` / `retro.js` / `glassmorphism.js` — Style definitions
- `src/css/theme-registry.js` — State management, DOM injection, public API
- `src/css/index.js` — Public CSS module exports
