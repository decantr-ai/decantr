# 02 — Your First Page

Learn how to create a page, render HTML with tag functions, and apply atomic CSS classes.

## The Page Pattern

Every page in Decantr is a JavaScript module that default-exports a function returning an `HTMLElement`. There is no JSX, no virtual DOM, no template syntax — just functions that create real DOM elements.

Create `src/pages/home.js`:

```js
import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, h1, p } = tags;

export default function HomePage() {
  return div({ class: css('_flex _col _aic _jcc _gap4 _p6 _minhscreen') },
    h1({ class: css('_heading1') }, 'Hello, Decantr'),
    p({ class: css('_body _fgmuted') }, 'Your first page is alive.')
  );
}
```

## Tag Functions

The `tags` proxy gives you a function for every HTML element. Destructure the ones you need:

```js
const { div, h1, h2, p, span, a, nav, main, header, section, ul, li, img, form } = tags;
```

Each tag function has the signature:

```js
tagName(attributes?, ...children)
```

- **attributes** — An optional object of HTML attributes (`class`, `id`, `onclick`, etc.)
- **children** — Any mix of strings, DOM elements, or functions (functions become reactive text nodes)

```js
// No attributes, just text
p('Hello world')

// With attributes
p({ class: css('_body _fgmuted'), id: 'intro' }, 'Hello world')

// Multiple children
div({ class: css('_flex _gap2') },
  span('First'),
  span('Second')
)
```

### The `h()` Alternative

If you prefer a more explicit API, `h()` works the same way but takes the tag name as the first argument:

```js
import { h } from 'decantr/core';

h('div', { class: css('_flex') },
  h('p', {}, 'Hello')
);
```

The `tags` proxy is preferred because it is more concise and produces fewer tokens.

## Atomic CSS with `css()`

Decantr uses atomic CSS classes prefixed with `_`. The `css()` function resolves atom names into CSS class names:

```js
css('_flex _col _gap4 _p6')
```

This produces the equivalent of:

```css
display: flex;
flex-direction: column;
gap: 1rem;
padding: 1.5rem;
```

### Common Atoms

| Atom | CSS |
|------|-----|
| `_flex` | `display: flex` |
| `_grid` | `display: grid` |
| `_col` | `flex-direction: column` |
| `_row` | `flex-direction: row` |
| `_aic` | `align-items: center` |
| `_jcc` | `justify-content: center` |
| `_jcsb` | `justify-content: space-between` |
| `_center` | `align-items: center; justify-content: center` |
| `_gap4` | `gap: 1rem` |
| `_p4` | `padding: 1rem` |
| `_px6` | `padding-inline: 1.5rem` |
| `_py3` | `padding-block: 0.75rem` |
| `_m0` | `margin: 0` |
| `_mt4` | `margin-top: 1rem` |
| `_wfull` | `width: 100%` |
| `_hfull` | `height: 100%` |
| `_flex1` | `flex: 1 1 0%` |
| `_bold` | `font-weight: 700` |
| `_tc` | `text-align: center` |
| `_none` | `display: none` |

### Spacing Scale

The number in spacing atoms maps to a rem scale:

| Number | Value |
|--------|-------|
| `0` | 0 |
| `1` | 0.25rem |
| `2` | 0.5rem |
| `3` | 0.75rem |
| `4` | 1rem |
| `6` | 1.5rem |
| `8` | 2rem |
| `10` | 2.5rem |
| `12` | 3rem |
| `16` | 4rem |

### Custom Values with Bracket Syntax

For one-off values, use bracket notation:

```js
css('_w[300px]')          // width: 300px
css('_h[100vh]')          // height: 100vh
css('_mw[640px]')         // max-width: 640px
css('_bg[#ff6600]')       // background: #ff6600
```

## A More Complete Page

Here is a page with a header, main content area, and footer:

```js
import { tags } from 'decantr/tags';
import { css } from 'decantr/css';

const { div, header, main, footer, h1, p, nav, a } = tags;

export default function HomePage() {
  return div({ class: css('_flex _col _minhscreen _bgbg _fgfg') },

    header({ class: css('_flex _aic _jcsb _px6 _py4 _borderB') },
      h1({ class: css('_heading5') }, 'My App'),
      nav({ class: css('_flex _gap4') },
        a({ href: '#/about', class: css('_fgmuted _nounder _trans') }, 'About'),
        a({ href: '#/contact', class: css('_fgmuted _nounder _trans') }, 'Contact')
      )
    ),

    main({ class: css('_flex _col _aic _jcc _flex1 _gap6 _p8') },
      h1({ class: css('_heading1 _tc') }, 'Welcome'),
      p({ class: css('_body _fgmuted _tc _mw[640px]') },
        'This is a Decantr application. No virtual DOM, no build step magic — just signals, atoms, and real DOM elements.'
      )
    ),

    footer({ class: css('_flex _jcc _py4 _fgmuted _textsm _borderT') },
      p('Built with Decantr')
    )
  );
}
```

## Registering the Page as a Route

In `src/app.js`, add your page to the router:

```js
const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: () => import('./pages/home.js') },
    { path: '/about', component: () => import('./pages/about.js') },
  ]
});
```

Routes use lazy loading by default — pages are loaded only when navigated to.

## What's Next

Now that you can create pages with tag functions and atomic CSS, the next step is adding interactive UI components.

---

Previous: [01 — Installation](./01-install.md) | Next: [03 — Components](./03-components.md)
