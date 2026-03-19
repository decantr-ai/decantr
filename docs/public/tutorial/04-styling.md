# 04 — Styling

Decantr's styling system has three layers: atomic CSS atoms, visual styles, and color modes. All three are zero-dependency and built from scratch.

## The Atom System

Atoms are single-purpose CSS classes prefixed with `_`. Apply them through the `css()` function:

```js
import { css } from 'decantr/css';

div({ class: css('_flex _col _gap4 _p6 _bgbg _fgfg _r4') })
```

### Layout Atoms

```js
css('_flex')         // display: flex
css('_grid')         // display: grid
css('_col')          // flex-direction: column
css('_row')          // flex-direction: row
css('_wrap')         // flex-wrap: wrap
css('_flex1')        // flex: 1 1 0%
css('_none')         // display: none
```

### Alignment

```js
css('_aic')          // align-items: center
css('_aifs')         // align-items: flex-start
css('_aife')         // align-items: flex-end
css('_jcc')          // justify-content: center
css('_jcsb')         // justify-content: space-between
css('_jcsa')         // justify-content: space-around
css('_center')       // align-items: center + justify-content: center
```

### Grid

```js
css('_gc2')          // grid-template-columns: repeat(2, minmax(0, 1fr))
css('_gc3')          // 3 columns
css('_gc4')          // 4 columns
css('_span2')        // grid-column: span 2
css('_gcaf280')      // auto-fit columns, min 280px
```

### Spacing (Padding & Margin)

```js
css('_p4')           // padding: 1rem (all sides)
css('_px6')          // padding-inline: 1.5rem (left + right)
css('_py3')          // padding-block: 0.75rem (top + bottom)
css('_pt4')          // padding-top: 1rem
css('_m0')           // margin: 0
css('_mt4')          // margin-top: 1rem
css('_mxa')          // margin-inline: auto (center horizontally)
css('_gap4')         // gap: 1rem
```

### Typography

```js
css('_heading1')     // Large heading preset
css('_heading2')     // ...through _heading6
css('_body')         // Body text preset
css('_bodylg')       // Large body text
css('_caption')      // Small caption text
css('_label')        // Form label text
css('_bold')         // font-weight: 700
css('_tc')           // text-align: center
css('_textxs')       // font-size: 0.625rem
css('_textsm')       // font-size: 0.875rem
css('_textlg')       // font-size: 1.125rem
css('_textxl')       // font-size: 1.25rem
css('_text2xl')      // font-size: 1.5rem
css('_truncate')     // overflow: hidden + text-overflow: ellipsis + white-space: nowrap
```

### Colors — Semantic Tokens

Decantr uses semantic color atoms that reference CSS custom properties. These adapt automatically when you change styles or modes:

```js
// Foreground (text) colors
css('_fgfg')         // color: var(--d-fg)         — primary text
css('_fgmutedfg')    // color: var(--d-muted-fg)   — secondary text
css('_fgmuted')      // color: var(--d-muted)      — tertiary text
css('_fgprimary')    // color: var(--d-primary)     — accent text

// Background colors
css('_bgbg')         // background: var(--d-bg)     — page background
css('_bgmuted')      // background: var(--d-muted)  — subtle background
css('_bgprimary')    // background: var(--d-primary) — accent background

// Semantic status colors
css('_fgsuccess')    // color: var(--d-success)
css('_fgwarning')    // color: var(--d-warning)
css('_fgerror')      // color: var(--d-error)
css('_bgsuccess')    // background: var(--d-success)

// Borders
css('_b1')           // border: 1px solid
css('_bcborder')     // border-color: var(--d-border)
css('_borderB')      // border-bottom: 1px solid var(--d-border)
css('_borderT')      // border-top: 1px solid var(--d-border)
css('_bcprimary')    // border-color: var(--d-primary)
```

### Decoration

```js
css('_r4')           // border-radius: 1rem
css('_rfull')        // border-radius: 9999px (circle/pill)
css('_shadow')       // box-shadow: subtle
css('_shadowmd')     // box-shadow: medium
css('_trans')        // transition: all 0.2s ease
css('_pointer')      // cursor: pointer
css('_ohidden')      // overflow: hidden
css('_nounder')      // text-decoration: none
css('_relative')     // position: relative
css('_absolute')     // position: absolute
```

### Sizing

```js
css('_wfull')        // width: 100%
css('_hfull')        // height: 100%
css('_minhscreen')   // min-height: 100vh
css('_mw[640px]')    // max-width: 640px (bracket syntax)
css('_w[300px]')     // width: 300px
css('_h[200px]')     // height: 200px
```

## Styles and Modes

Decantr separates visual identity (style) from color scheme (mode). They are independent axes.

### Setting a Style

```js
import { setStyle, setMode } from 'decantr/css';

setStyle('auradecantism');   // Default — glass, gradients, vibrant
setStyle('clean');           // Professional, subtle shadows
setStyle('glassmorphism');   // Stormy blue glass
setStyle('retro');           // Neobrutalism, offset shadows
```

Each style defines a complete set of 170+ CSS custom properties — colors, shadows, radii, typography weights — that all components and atoms consume.

### Setting a Mode

```js
setMode('dark');    // Dark color scheme
setMode('light');   // Light color scheme
setMode('auto');    // Follow system preference
```

Modes work with any style. `auradecantism` in light mode looks different from `clean` in light mode.

### Typical Setup in `app.js`

```js
import { setStyle, setMode } from 'decantr/css';

setStyle('auradecantism');
setMode('dark');
```

### Runtime Switching

You can change style and mode at runtime. Changes take effect immediately:

```js
import { tags } from 'decantr/tags';
import { css, setStyle, setMode } from 'decantr/css';
import { Button, Select } from 'decantr/components';

const { div } = tags;

function ThemeSwitcher() {
  return div({ class: css('_flex _gap3 _aic') },
    Select({
      label: 'Style',
      options: [
        { label: 'Auradecantism', value: 'auradecantism' },
        { label: 'Clean', value: 'clean' },
        { label: 'Glassmorphism', value: 'glassmorphism' },
        { label: 'Retro', value: 'retro' },
      ],
      onchange: (val) => setStyle(val)
    }),
    Select({
      label: 'Mode',
      options: [
        { label: 'Dark', value: 'dark' },
        { label: 'Light', value: 'light' },
        { label: 'Auto', value: 'auto' },
      ],
      onchange: (val) => setMode(val)
    })
  );
}
```

## CSS Custom Properties (Design Tokens)

All styles produce the same set of tokens. You can reference them directly in bracket syntax atoms or in custom CSS:

```
--d-bg                — Page background
--d-fg                — Primary text color
--d-primary           — Accent color
--d-primary-fg        — Text on accent background
--d-primary-hover     — Accent hover state
--d-muted             — Subtle background
--d-muted-fg          — Secondary text
--d-border            — Default border color
--d-surface-0         — Card/panel background
--d-surface-1         — Elevated surface
--d-elevation-0       — No shadow
--d-elevation-1       — Subtle shadow
--d-elevation-2       — Medium shadow
--d-ring              — Focus ring color
--d-overlay           — Modal overlay color
```

### Using Tokens in Bracket Syntax

```js
css('_bg[var(--d-surface-1)]')    // Use a surface token as background
css('_shadow[var(--d-elevation-2)]')  // Use an elevation token
```

## Responsive Prefixes

Apply atoms conditionally at breakpoints:

```js
css('_col _md:row')             // Column on mobile, row on md+
css('_gc1 _md:gc2 _lg:gc4')    // 1 col → 2 cols → 4 cols
css('_none _lg:flex')           // Hidden until lg breakpoint
css('_p4 _lg:p8')              // Tighter padding on mobile
```

Breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px).

## What's Next

Pages and components look good, but they are static. The next section introduces reactive state with signals.

---

Previous: [03 — Components](./03-components.md) | Next: [05 — State](./05-state.md)
