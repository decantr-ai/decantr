# @decantr/css

Support status: `core-supported`  
Release channel: `stable`

Framework-agnostic CSS atoms runtime for Decantr projects.

## Installation

```bash
npm install @decantr/css
```

## Usage

```js
import { css } from '@decantr/css';

// In your components
<div className={css('_flex _col _gap4 _p4')}>
  <h1 className={css('_heading1')}>Title</h1>
  <p className={css('_textsm _fgmuted')}>Description</p>
</div>
```

## How It Works

The `css()` function:
1. Parses atom strings (e.g., `'_flex _col _gap4'`)
2. Resolves each atom to CSS (e.g., `_flex` -> `display:flex`)
3. Injects the CSS into the DOM via `<style>` tags
4. Returns the class names for use in your markup

CSS is injected into `@layer d.atoms` for proper cascade control.

## API

### css(...classes)

Process atom strings and inject CSS. Returns space-separated class names.

```js
css('_flex _col')  // Returns: '_flex _col', injects CSS
css('_flex', '_col', condition && '_gap4')  // Handles multiple args, falsy values
```

### define(name, declaration)

Register a custom atom.

```js
define('_brand', 'color:var(--brand);font-weight:700');
css('_brand')  // Now works
```

### extractCSS()

Get all injected CSS as a string (for SSR).

```js
const cssString = extractCSS();
// Returns: '@layer d.atoms{._flex{display:flex}...}'
```

### reset()

Clear all injected styles (for testing).

```js
reset();
```

## Atom Reference

### Display
`_flex`, `_grid`, `_block`, `_inline`, `_none`, `_contents`

### Flexbox
`_col`, `_row`, `_wrap`, `_nowrap`, `_flex1`, `_grow`, `_shrink0`

### Alignment
`_aic` (align-items:center), `_jcc` (justify-content:center), `_jcsb` (space-between)

### Spacing
`_gap{n}`, `_p{n}`, `_m{n}`, `_pt{n}`, `_px{n}`, `_my{n}` where n = 0-96

### Sizing
`_wfull`, `_hfull`, `_w{n}`, `_h{n}`, `_minw0`, `_maxwfull`

### Typography
`_textsm`, `_textlg`, `_text2xl`, `_heading1`-`_heading6`, `_fontbold`

### Colors (use CSS variables)
`_bgprimary`, `_bgsurface`, `_fgmuted`, `_bcborder`

### Responsive Prefixes
Mobile-first breakpoints: `_sm:` (640px), `_md:` (768px), `_lg:` (1024px), `_xl:` (1280px)

```jsx
<div className={css('_gc1 _sm:gc2 _lg:gc4')}>
  {/* 1 col -> 2 cols at 640px -> 4 cols at 1024px */}
</div>
```

### Pseudo-class Prefixes
`_h:` (hover), `_f:` (focus), `_fv:` (focus-visible), `_a:` (active)

```jsx
<button className={css('_bgprimary _h:bgprimary/80')}>
  Hover me
</button>
```

### Opacity Modifiers
`_bgprimary/50` -> 50% opacity via `color-mix()`

### Arbitrary Values
`_w[512px]`, `_p[clamp(1rem,3vw,2rem)]`, `_bg[#1a1a2e]`

## Integration with Decantr

When you scaffold a project with `@decantr/cli`, it generates:

- `src/styles/tokens.css` - Theme tokens (colors, spacing, radii)
- `src/styles/treatments.css` - Visual treatment classes (interactive, surface, data, control, section, annotation)
- `src/styles/decorators.css` - Optional decorator classes

Import these alongside @decantr/css:

```js
import { css } from '@decantr/css';
import './styles/tokens.css';
import './styles/treatments.css';
import './styles/decorators.css';
```

## License

MIT
