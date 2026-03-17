# Decantr LLM Primer

Single-file reference for code generation. Covers the 20% that handles 80% of scaffolding needs.

---

## 1. All Imports

```js
import { tags } from 'decantr/tags';                              // HTML elements
import { h, text, cond, list, mount, onMount, onDestroy } from 'decantr/core';
import { createSignal, createEffect, createMemo, createStore, batch } from 'decantr/state';
import { createRouter, link, navigate, useRoute, back, forward, isNavigating } from 'decantr/router';
import { css, setStyle, setMode } from 'decantr/css';
import { Button, Input, Card, Modal, Tabs, Select, ... } from 'decantr/components';
import { Chart, Sparkline, chartSpec, createStream } from 'decantr/chart';
```

**Usage pattern:**
```js
const { div, span, h1, p, a, nav, main, header, aside, section, ul, li } = tags;
div({ class: css('_flex _col _gap4 _p6') }, child1, child2);
```

---

## 2. Common Atoms (with Tailwind equivalences)

Both naming styles work. Decantr terse names are canonical.

| Decantr Atom | Tailwind Alias | CSS Output |
|-------------|---------------|-----------|
| `_flex` | — | `display:flex` |
| `_grid` | — | `display:grid` |
| `_col` | `_flex-col` | `flex-direction:column` |
| `_row` | `_flex-row` | `flex-direction:row` |
| `_aic` | `_items-center` | `align-items:center` |
| `_aifs` | `_items-start` | `align-items:flex-start` |
| `_aife` | `_items-end` | `align-items:flex-end` |
| `_ais` | `_items-stretch` | `align-items:stretch` |
| `_aibs` | `_items-baseline` | `align-items:baseline` |
| `_jcc` | `_justify-center` | `justify-content:center` |
| `_jcsb` | `_justify-between` | `justify-content:space-between` |
| `_jcsa` | `_justify-around` | `justify-content:space-around` |
| `_jcse` | `_justify-evenly` | `justify-content:space-evenly` |
| `_jcfs` | `_justify-start` | `justify-content:flex-start` |
| `_jcfe` | `_justify-end` | `justify-content:flex-end` |
| `_center` | — | `align-items:center;justify-content:center` |
| `_wrap` | `_flex-wrap` | `flex-wrap:wrap` |
| `_flex1` | `_flex-1` | `flex:1 1 0%` |
| `_gap4` | `_gap-4` | `gap:1rem` |
| `_p4` | `_p-4` | `padding:1rem` |
| `_px6` | `_px-6` | `padding-inline:1.5rem` |
| `_py3` | `_py-3` | `padding-block:0.75rem` |
| `_m0` | `_m-0` | `margin:0` |
| `_mt4` | — | `margin-top:1rem` |
| `_mxa` | — | `margin-inline:auto` |
| `_gc2` | `_grid-cols-2` | `grid-template-columns:repeat(2,minmax(0,1fr))` |
| `_gc4` | `_grid-cols-4` | `grid-template-columns:repeat(4,minmax(0,1fr))` |
| `_span2` | `_col-span-2` | `grid-column:span 2/span 2` |
| `_wfull` | `_w-full` | `width:100%` |
| `_hfull` | `_h-full` | `height:100%` |
| `_tc` | `_text-center` | `text-align:center` |
| `_bold` | `_font-bold` | `font-weight:700` |
| `_fgfg` | — | `color:var(--d-fg)` |
| `_fgmuted` | `_text-muted` | `color:var(--d-muted)` |
| `_fgmutedfg` | `_text-muted-foreground` | `color:var(--d-muted-fg)` |
| `_bgmuted` | `_bg-muted` | `background:var(--d-muted)` |
| `_bgprimary` | `_bg-primary` | `background:var(--d-primary)` |
| `_b1` | `_border` | `border:1px solid` |
| `_r4` | `_rounded-lg` | `border-radius:1rem` |
| `_rfull` | `_rounded-full` | `border-radius:9999px` |
| `_shadow` | `_shadow` | `box-shadow:0 1px 3px ...` |
| `_shadowmd` | `_shadow-md` | `box-shadow:0 4px 6px ...` |
| `_trans` | `_transition` | `transition:all 0.2s ease` |
| `_pointer` | `_cursor-pointer` | `cursor:pointer` |
| `_ohidden` | `_overflow-hidden` | `overflow:hidden` |
| `_relative` | `_relative` | `position:relative` |
| `_absolute` | `_absolute` | `position:absolute` |
| `_none` | — | `display:none` |
| `_truncate` | `_truncate` | `overflow:hidden;text-overflow:ellipsis;white-space:nowrap` |
| `_nounder` | `_no-underline` | `text-decoration:none` |
| `_borderB` | — | `border-bottom:1px solid var(--d-border)` |
| `_bcborder` | `_border-border` | `border-color:var(--d-border)` |

### Spacing Scale
`0`=0, `1`=0.25rem, `2`=0.5rem, `3`=0.75rem, `4`=1rem, `5`=1.25rem, `6`=1.5rem, `8`=2rem, `10`=2.5rem, `12`=3rem, `16`=4rem, `20`=5rem, `24`=6rem

> For spacing decision rules beyond defaults, see `reference/spatial-guidelines.md`.

### Opacity Modifiers
Append `/N` to any semantic color atom for alpha transparency (uses `color-mix()`):
`_bgprimary/50` (50% opacity bg), `_fgaccent/30` (30% opacity text), `_bcborder/80` (80% opacity border).
Valid opacities: 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95. Works with responsive prefixes: `_sm:bgprimary/20`.

### Arbitrary Transitions
Use `_trans[...]` for custom transitions: `_trans[color_0.15s_ease]` (underscores become spaces).
Standard shortcuts: `_trans` (all 0.2s ease), `_transfast` (0.1s), `_transslow` (0.4s), `_transnone`.

### Custom values
Use bracket syntax: `_w[300px]`, `_h[100vh]`, `_p[2px]`, `_bg[#ff0000]`, `_grid-template-columns[240px_1fr]`

### Typography Presets
`_heading1`–`_heading6`, `_body`, `_bodylg`, `_caption`, `_label`, `_overline`

Font sizes: `_textxs` (0.625rem) → `_textsm` → `_textbase` → `_textmd` → `_textlg` → `_textxl` → `_text2xl` → `_text3xl` → `_text4xl` (2.5rem)

### Semantic Colors
| Role | Background | Foreground | Border |
|------|-----------|-----------|--------|
| Primary | `_bgprimary` | `_fgprimary` | `_bcprimary` |
| Success | `_bgsuccess` | `_fgsuccess` | `_bcsuccess` |
| Warning | `_bgwarning` | `_fgwarning` | `_bcwarning` |
| Error | `_bgerror` | `_fgerror` | `_bcerror` |
| Subtle | `_bgprimarysub` | `_fgprimarysub` | — |

---

## 3. Top 15 Component Signatures

```js
// Button
Button({ variant: 'primary'|'outline'|'ghost'|'destructive'|'link', size: 'sm'|'md'|'lg',
         disabled, loading, onclick, class }, ...children)

// Input
Input({ label, type, placeholder, value, onchange, oninput, disabled, class })

// Card (with sub-components)
Card({ title, extra, hoverable, bordered, loading, size, type, cover, actions, class },
  Card.Header({ extra }, ...), Card.Body({}, ...), Card.Footer({}, ...),
  Card.Cover({}, img), Card.Meta({ avatar, title, description }),
  Card.Grid({ hoverable }, ...), Card.Actions({}, ...)
)

// Select
Select({ label, value, onchange, options: [{ label, value }], placeholder, class })

// Modal
Modal({ visible: signal, onClose: fn, class }, ...children)

// Tabs
Tabs({ items: [{ label, content: () => node }], class })

// DataTable
DataTable({ columns: [{ key, label, sortable, render }], data, sortable, paginate, pageSize, class })

// Statistic
Statistic({ label, value, prefix, suffix, trend: 'up'|'down', trendValue, icon, class })

// Badge
Badge({ variant: 'default'|'primary'|'success'|'warning'|'error', size }, ...children)

// Alert
Alert({ variant: 'default'|'info'|'success'|'warning'|'error' }, ...children)

// Dropdown
Dropdown({ trigger, items: [{ label, onclick }], class })

// Breadcrumb
Breadcrumb({ items: [{ label, href }] })

// Pagination
Pagination({ current, total, onChange })

// Progress
Progress({ value: 0-100, class })

// Skeleton
Skeleton({ width, height, class })  // Loading placeholder

// Avatar
Avatar({ src, name, size: 'sm'|'md'|'lg' })

// Separator
Separator()  // Horizontal divider

// Chip
Chip({ label, onClose, variant })

// icon
icon('icon-name')  // Returns SVG icon element
```

---

## 4. Chart API

```js
import { Chart, Sparkline } from 'decantr/chart';

// Full chart
Chart({
  type: 'line'|'bar'|'area'|'pie'|'scatter'|'bubble'|'histogram'|'funnel'|
        'radar'|'gauge'|'heatmap'|'treemap'|'candlestick'|'waterfall'|
        'box-plot'|'range-bar'|'range-area'|'radial'|'sunburst'|'sankey'|
        'chord'|'swimlane'|'org-chart'|'combination',
  data: arrayOrSignal,
  x: 'fieldName',           // x-axis data key
  y: 'fieldName',           // y-axis data key (or array for multi-series)
  title: 'Chart Title',
  height: 300,              // pixels
  live: false,              // enable streaming updates
})

// Inline sparkline (no axes, no labels)
Sparkline({ data: [1, 4, 2, 8, 3], height: 32 })
```

### Working Examples

**Line chart:**
```js
Chart({
  type: 'line',
  data: [
    { date: '2024-01', revenue: 4200 },
    { date: '2024-02', revenue: 5100 },
    { date: '2024-03', revenue: 4800 },
  ],
  x: 'date', y: 'revenue', title: 'Monthly Revenue', height: 300
})
```

**Bar chart:**
```js
Chart({
  type: 'bar',
  data: [
    { category: 'Electronics', sales: 1200 },
    { category: 'Clothing', sales: 800 },
    { category: 'Books', sales: 600 },
  ],
  x: 'category', y: 'sales', title: 'Sales by Category', height: 280
})
```

**Pie chart:**
```js
Chart({
  type: 'pie',
  data: [
    { name: 'Desktop', value: 65 },
    { name: 'Mobile', value: 30 },
    { name: 'Tablet', value: 5 },
  ],
  x: 'name', y: 'value', title: 'Traffic Sources', height: 280
})
```

---

## 5. Skeleton Code (5 layouts)

### sidebar-main
```js
function SidebarMain({ nav, children }) {
  const { div, aside, main, header, span } = tags;
  const [collapsed, setCollapsed] = createSignal(false);

  return div({ class: css('_grid _h[100vh]'),
               style: () => `grid-template-columns:${collapsed() ? '64px' : '240px'} 1fr;grid-template-rows:auto 1fr` },
    aside({ class: css('_flex _col _gap1 _p3 _bgmuted _overflow[auto] _borderR'), style: 'grid-row:1/3' },
      div({ class: css('_flex _aic _jcsb _mb4') },
        cond(() => !collapsed(), () => span({ class: css('_heading5') }, 'App')),
        Button({ variant: 'ghost', size: 'sm', onclick: () => setCollapsed(!collapsed()) }, icon('panel-left'))
      ),
      ...nav.map(item =>
        link({ href: item.href, class: css('_flex _aic _gap2 _p2 _px3 _r2 _trans _fgfg') },
          icon(item.icon), cond(() => !collapsed(), () => text(item.label))
        )
      )
    ),
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB') },
      span({ class: css('_heading4') }, 'Page Title')
    ),
    main({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') }, ...children)
  );
}
```

### Children Rules

> **Function children = reactive TEXT only.** When an element receives a function as a child, the framework calls `String(fn())` and creates a reactive text node. It does **not** expect DOM elements from that function.

Use `cond()` for conditional DOM elements:

```js
// WRONG — returns "[object HTMLSpanElement]"
div({}, () => show() ? span({}, 'Hello') : null)

// CORRECT — use cond() for conditional DOM
div({}, cond(() => show(), () => span({}, 'Hello')))

// CORRECT — function children work for reactive text
span({}, () => `Count: ${count()}`)
```

### top-nav-main
```js
function TopNavMain({ brand, nav, children }) {
  const { div, header, main, nav: navEl } = tags;
  return div({ class: css('_flex _col _h[100vh]') },
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB _bgbg') },
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, brand),
      navEl({ class: css('_flex _aic _gap6') },
        ...nav.map(item => link({ href: item.href, class: css('_fgmuted _nounder _trans') }, item.label))
      ),
      div({ class: css('_flex _aic _gap2') },
        Button({ variant: 'ghost', size: 'sm' }, icon('search')),
        Button({ variant: 'ghost', size: 'sm' }, icon('user'))
      )
    ),
    main({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') }, ...children)
  );
}
```

### centered
```js
function Centered({ children, width = '400px' }) {
  const { div } = tags;
  return div({ class: css('_flex _center _h[100vh] _bgmuted _p4') },
    Card({ class: css(`_w[${width}] _mw[100%]`) }, ...children)
  );
}
```

### full-bleed
```js
function FullBleed({ children }) {
  const { div, header, main, nav: navEl } = tags;
  return div({ class: css('_flex _col') },
    header({ class: css('_fixed _top0 _left0 _wfull _flex _aic _jcsb _px8 _py4 _z[40]') },
      link({ href: '/', class: css('_heading5 _nounder _fgfg') }, 'Brand'),
      navEl({ class: css('_flex _aic _gap6') })
    ),
    main({ class: css('_flex _col') }, ...children)
  );
}
```

### minimal-header
```js
function MinimalHeader({ brand, children }) {
  const { div, header, main } = tags;
  return div({ class: css('_flex _col _h[100vh]') },
    header({ class: css('_flex _aic _jcc _py3 _borderB') },
      link({ href: '/', class: css('_flex _aic _gap2 _nounder _fgfg') }, icon('arrow-left'), brand)
    ),
    main({ class: css('_flex _col _aic _overflow[auto] _flex1 _py8') },
      div({ class: css('_w[720px] _mw[100%] _px4 _flex _col _gap6') }, ...children)
    )
  );
}
```

---

## 6. Top 15 Pattern Code Snippets

> **Spacing note:** Snippets below use comfortable-density defaults (`_gap4`, `_p4`).
> Actual spacing must match the project's Clarity profile — see `reference/spatial-guidelines.md` §17.

### kpi-grid
```js
function KpiGrid() {
  const { div, h2 } = tags;
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, 'Key Metrics'),
    div({ class: css('_grid _gc4 _gap4') },
      Statistic({ label: 'Revenue', value: 1248500, prefix: '$', trend: 'up', trendValue: '+12.5%' }),
      Statistic({ label: 'Users', value: 84230, trend: 'up', trendValue: '+8.1%' }),
      Statistic({ label: 'Orders', value: 6420, trend: 'down', trendValue: '-2.3%' }),
      Statistic({ label: 'Conversion', value: 3.24, suffix: '%', trend: 'up', trendValue: '+0.5%' })
    )
  );
}
```

### data-table
```js
function DataTablePattern({ columns, data }) {
  const { div } = tags;
  const [search, setSearch] = createSignal('');
  return div({ class: css('_flex _col _gap4') },
    div({ class: css('_flex _gap3 _aic _jcsb') },
      Input({ placeholder: 'Search...', value: search, onchange: e => setSearch(e.target.value) }),
      Button({ variant: 'outline' }, 'Export')
    ),
    DataTable({ columns, data, sortable: true, paginate: true, pageSize: 10 })
  );
}
```

### chart-grid
```js
function ChartGrid({ data }) {
  const { div, h2 } = tags;
  return div({ class: css('_flex _col _gap4') },
    h2({ class: css('_heading4') }, 'Analytics'),
    div({ class: css('_grid _gc2 _gap4') },
      Chart({ type: 'line', data: data.revenue, x: 'date', y: 'value', title: 'Revenue', height: 280 }),
      Chart({ type: 'bar', data: data.orders, x: 'month', y: 'count', title: 'Orders', height: 280 }),
      Chart({ type: 'pie', data: data.categories, x: 'name', y: 'value', title: 'Categories', height: 280 }),
      Chart({ type: 'area', data: data.traffic, x: 'date', y: 'visits', title: 'Traffic', height: 280 })
    )
  );
}
```

### hero
```js
function Hero() {
  const { div, h1, p } = tags;
  return div({ class: css('_flex _col _aic _tc _gap6 _py16 _px6') },
    h1({ class: css('_heading1') }, 'Build Faster, Ship Smarter'),
    p({ class: css('_body _fgmuted _mw[640px]') }, 'The AI-first framework that turns ideas into production-ready apps.'),
    div({ class: css('_flex _gap3') },
      Button({ variant: 'primary', size: 'lg' }, 'Get Started'),
      Button({ variant: 'outline', size: 'lg' }, 'View Source')
    )
  );
}
```

### auth-form
```js
function AuthForm() {
  const { div, h2, p, span } = tags;
  const [email, setEmail] = createSignal('');
  const [password, setPassword] = createSignal('');
  return div({ class: css('_flex _col _aic _jcc _minhscreen _p6') },
    Card({ class: css('_w[400px] _mw[100%]') },
      Card.Header({},
        h2({ class: css('_heading4 _tc') }, 'Sign In'),
        p({ class: css('_fgmuted _tc _mt1') }, 'Enter your credentials')
      ),
      Card.Body({ class: css('_flex _col _gap3') },
        Input({ label: 'Email', type: 'email', value: email, onchange: e => setEmail(e.target.value) }),
        Input({ label: 'Password', type: 'password', value: password, onchange: e => setPassword(e.target.value) }),
        Button({ variant: 'primary', class: css('_wfull _mt2') }, 'Sign In')
      ),
      Card.Footer({ class: css('_tc') },
        span({ class: css('_fgmuted _textsm') }, 'No account? ', link({ href: '/register' }, 'Sign Up'))
      )
    )
  );
}
```

### filter-bar
```js
function FilterBar() {
  const { div } = tags;
  const [search, setSearch] = createSignal('');
  return div({ class: css('_flex _gap3 _aic _wrap _py3') },
    Input({ placeholder: 'Search...', value: search, onchange: e => setSearch(e.target.value), class: css('_w[240px]') }),
    Select({ value: 'all', options: [
      { label: 'All', value: 'all' }, { label: 'Active', value: 'active' }
    ] }),
    DatePicker({ placeholder: 'Date range' }),
    Button({ variant: 'ghost', size: 'sm' }, 'Clear')
  );
}
```

### activity-feed
```js
function ActivityFeed({ items }) {
  const { div, span, h3 } = tags;
  return div({ class: css('_flex _col _gap2 _p4') },
    h3({ class: css('_heading5') }, 'Recent Activity'),
    ...items.map(item =>
      div({ class: css('_flex _gap3 _aic _py2 _borderB') },
        Avatar({ src: item.avatar, name: item.user, size: 'sm' }),
        div({ class: css('_flex _col _flex1') },
          span({ class: css('_textsm') }, span({ class: css('_bold') }, item.user), ` ${item.action}`),
          span({ class: css('_textxs _fgmuted') }, item.time)
        ),
        Badge({ variant: 'default' }, item.type)
      )
    )
  );
}
```

### card-grid (preset: product)
```js
function ProductGrid({ products }) {
  const { div, span, h3 } = tags;
  return div({ class: css('_grid _gcaf280 _gap4 _p4') },
    ...products.map(p =>
      Card({},
        Image({ src: p.image, alt: p.name, class: css('_wfull _h[200px] _object[cover]') }),
        Card.Body({ class: css('_flex _col _gap2') },
          h3({ class: css('_heading5') }, p.name),
          span({ class: css('_fgmuted _textsm') }, p.description),
          div({ class: css('_flex _aic _jcsb _mt2') },
            span({ class: css('_heading4') }, `$${p.price}`),
            Button({ variant: 'primary', size: 'sm' }, 'Add to Cart')
          )
        )
      )
    )
  );
}
```

### pricing-table
```js
function PricingTable({ plans }) {
  const { div, span, h3, ul, li } = tags;
  return div({ class: css('_grid _gc3 _gap6 _p4 _aic') },
    ...plans.map(plan =>
      Card({ class: css(plan.featured ? '_b2 _bcprimary' : '') },
        Card.Header({ class: css('_tc') },
          h3({ class: css('_heading4') }, plan.name),
          div({ class: css('_mt2') },
            span({ class: css('_heading1') }, `$${plan.price}`),
            span({ class: css('_fgmuted') }, '/month')
          )
        ),
        Card.Body({},
          ul({ class: css('_flex _col _gap2') },
            ...plan.features.map(f => li({ class: css('_flex _aic _gap2 _textsm') }, icon('check'), f))
          )
        ),
        Card.Footer({},
          Button({ variant: plan.featured ? 'primary' : 'outline', class: css('_wfull') }, 'Get Started')
        )
      )
    )
  );
}
```

### contact-form
```js
function ContactForm() {
  const { div, h2, p } = tags;
  return Card({ class: css('_mw[600px] _mxa') },
    Card.Header({},
      h2({ class: css('_heading4') }, 'Get in Touch'),
      p({ class: css('_fgmuted _mt1') }, 'We\'ll respond within 24 hours.')
    ),
    Card.Body({ class: css('_flex _col _gap4') },
      div({ class: css('_grid _gc2 _gap4') },
        Input({ label: 'First Name' }), Input({ label: 'Last Name' })
      ),
      Input({ label: 'Email', type: 'email' }),
      Textarea({ label: 'Message', rows: 4 }),
      Button({ variant: 'primary', class: css('_wfull') }, 'Send Message')
    )
  );
}
```

### card-grid (preset: content)
```js
function RecipeCardGrid({ recipes }) {
  const { div, span, h3, img } = tags;
  return div({ class: css('_grid _gc3 _gap6 _p4') },
    ...recipes.map(r =>
      Card({},
        img({ src: r.image, alt: r.title, class: css('_wfull _h[200px] _object[cover]') }),
        Card.Body({ class: css('_flex _col _gap2') },
          h3({ class: css('_heading5') }, r.title),
          span({ class: css('_caption _fgmuted') }, r.description),
          div({ class: css('_flex _aic _gap3 _fgmuted _textsm') },
            span({}, icon('clock'), ` ${r.time} min`),
            span({}, icon('users'), ` ${r.servings} servings`)
          ),
          div({ class: css('_flex _gap1 _wrap') },
            ...r.tags.map(t => Chip({ size: 'sm' }, t))
          ),
          div({ class: css('_flex _aic _jcsb _mt2') },
            div({ class: css('_flex _aic _gap2') },
              Avatar({ src: r.author.avatar, size: 'xs' }),
              span({ class: css('_textsm') }, r.author.name)
            ),
            span({ class: css('_textsm _fgmuted') }, icon('git-fork'), ` ${r.forks}`)
          )
        )
      )
    )
  );
}
```

### form-sections (preset: creation)
```js
function RecipeFormSimple() {
  const { div, h3 } = tags;
  const [ingredients, setIngredients] = createSignal(['']);
  const [instructions, setInstructions] = createSignal(['']);

  return div({ class: css('_flex _col _gap6 _mw[720px] _mxAuto _p4') },
    Upload({ accept: 'image/*', variant: 'dragger' }, 'Upload recipe photo'),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, 'Basic Info')),
      Card.Body({ class: css('_flex _col _gap3') },
        Input({ label: 'Title', placeholder: 'Recipe name' }),
        Textarea({ label: 'Description', rows: 3 })
      )
    ),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, 'Details')),
      Card.Body({ class: css('_flex _col _gap3') },
        div({ class: css('_grid _gc3 _gap3') },
          InputNumber({ label: 'Prep (min)', min: 0 }),
          InputNumber({ label: 'Cook (min)', min: 0 }),
          InputNumber({ label: 'Servings', min: 1 })
        ),
        Segmented({ label: 'Difficulty', options: ['Easy', 'Medium', 'Hard'] })
      )
    ),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, 'Ingredients')),
      Card.Body({ class: css('_flex _col _gap2') },
        ...ingredients().map((_, i) => Input({ placeholder: `Ingredient ${i + 1}` })),
        Button({ variant: 'outline', size: 'sm' }, icon('plus'), 'Add Ingredient')
      )
    ),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, 'Instructions')),
      Card.Body({ class: css('_flex _col _gap2') },
        ...instructions().map((_, i) => Textarea({ placeholder: `Step ${i + 1}`, rows: 2 })),
        Button({ variant: 'outline', size: 'sm' }, icon('plus'), 'Add Step')
      )
    ),
    div({ class: css('_flex _jce _gap3') },
      Button({ variant: 'outline' }, 'Save Draft'),
      Button({ variant: 'primary' }, 'Publish Recipe')
    )
  );
}
```

### chat-interface
```js
function ChatInterface() {
  const { div, p } = tags;
  const [input, setInput] = createSignal('');
  const [messages, setMessages] = createSignal([
    { role: 'assistant', text: 'Hi! I\'m your AI chef assistant.' }
  ]);
  const suggestions = ['What can I make with chicken?', 'Suggest a quick dinner'];

  const send = () => {
    if (!input()) return;
    setMessages([...messages(), { role: 'user', text: input() }]);
    setInput('');
  };

  return div({ class: css('_flex _col _h[calc(100vh-200px)] _b1 _r4 _overflow[hidden]') },
    ScrollArea({ class: css('_flex1 _p4') },
      div({ class: css('_flex _col _gap3') },
        ...messages().map(m =>
          div({ class: css(m.role === 'user' ? '_flex _jce' : '_flex _gap2') },
            m.role === 'assistant' ? Avatar({ size: 'sm', fallback: 'AI' }) : null,
            div({ class: css(`_p3 _r4 _mw[70%] ${m.role === 'user' ? '_bgprimary' : '_bgmuted'}`) },
              p({}, m.text)
            )
          )
        )
      )
    ),
    div({ class: css('_flex _gap2 _p3 _borderb') },
      ...suggestions.map(s => Chip({ variant: 'outline', onclick: () => setInput(s) }, s))
    ),
    div({ class: css('_flex _gap2 _p3 _bordert') },
      Input({ placeholder: 'Ask your chef assistant...', value: input, class: css('_flex1') }),
      Button({ variant: 'primary', onclick: send }, icon('send'))
    )
  );
}
```

### photo-to-recipe
```js
function PhotoToRecipe() {
  const { div, h3, p } = tags;
  const [analyzing, setAnalyzing] = createSignal(false);
  const [result, setResult] = createSignal(null);

  return div({ class: css('_grid _gc2 _gap6 _p4') },
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, icon('camera'), ' Upload Photo')),
      Card.Body({ class: css('_flex _col _gap4 _aic') },
        Upload({ accept: 'image/*', variant: 'dragger', class: css('_wfull') }, 'Drop a food photo here'),
        Button({ variant: 'primary', class: css('_wfull'), onclick: () => setAnalyzing(true) },
          analyzing() ? Spinner({ size: 'sm' }) : icon('sparkles'),
          analyzing() ? ' Analyzing...' : ' Generate Recipe'
        )
      )
    ),
    Card({},
      Card.Header({}, h3({ class: css('_heading5') }, icon('sparkles'), ' AI Generated Recipe')),
      Card.Body({},
        result()
          ? div({ class: css('_flex _col _gap3') }, h3({ class: css('_heading4') }, result().title))
          : p({ class: css('_fgmuted _tc') }, 'Upload a photo to generate a recipe')
      )
    )
  );
}
```

### card-grid (preset: icon)
```js
function FeatureGrid({ features }) {
  const { div, h3, p } = tags;
  return div({ class: css('_grid _gc3 _gap6 _p4') },
    ...features.map(f =>
      Card({},
        Card.Body({ class: css('_flex _col _gap3 _aic _tc') },
          div({ class: css('_w[48px] _h[48px] _r4 _bgmuted _flex _aic _jcc _fgprimary') }, icon(f.icon)),
          h3({ class: css('_heading5') }, f.title),
          p({ class: css('_caption _fgmuted') }, f.description)
        )
      )
    )
  );
}
```

---

## 7. Recipe Application Guide

Recipes overlay decorative classes onto standard components. The pattern is always: **standard component + recipe wrapper classes**.

### Without recipe (plain):
```js
div({ class: css('_b1 _r4 _p4') },
  Statistic({ label: 'Revenue', value: 125000, prefix: '$' })
)
```

### With auradecantism recipe:
```js
div({ class: css('d-glass _r4 _p4') },  // glass panel wrapper
  Statistic({ label: 'Revenue', value: 125000, prefix: '$' }),
  span({ class: css('d-gradient-text _textxs') }, 'ALL TIME HIGH')  // gradient accent text
)
```

### With command-center recipe:
```js
div({ class: css('cc-frame-sm cc-glow') },  // beveled frame + glow
  Statistic({ label: 'ACTIVE THREATS', value: 42, icon: 'alert-triangle', class: css('_bg[transparent]') })
)
```

### With clean recipe:
```js
div({ class: css('_b1 _r4 _p4') },  // simple border + radius (tokens handle the rest)
  Statistic({ label: 'Revenue', value: 125000, prefix: '$' })
)
```

**Key principle:** Recipes don't change which components you use — they change how you wrap and decorate them.

---

## 8. Styles & Modes

```js
import { setStyle, setMode, registerStyle } from 'decantr/css';

// Core style (always available, no import needed)
setStyle('auradecantism');  // Default: glass, gradients, vibrant (dark)

// Add-on styles (require import + registerStyle before use)
// Available: clean, retro, glassmorphism, command-center,
//            bioluminescent, clay, dopamine, editorial, liquid-glass, prismatic
import { clean as cleanStyle } from 'decantr/styles/clean';
registerStyle(cleanStyle);
setStyle('clean');

// Available modes
setMode('light');
setMode('dark');
setMode('auto');  // Follows system preference
```

**11 styles total:** `auradecantism` (core, default), `clean`, `retro`, `glassmorphism`, `command-center`, `bioluminescent`, `clay`, `dopamine`, `editorial`, `liquid-glass`, `prismatic` (all add-on).

### Interactive State Atoms (Pseudo-Class Prefixes)

```js
// Hover, focus, focus-visible, active, focus-within — compose with ANY atom
css('_h:bgprimary')       // background on hover
css('_f:bcprimary')       // border-color on focus
css('_fv:ring2')          // ring on keyboard focus
css('_a:bgmuted')         // background on press
css('_fw:bcprimary')      // border when child focused
css('_sm:h:bgmuted')      // responsive + hover
css('_h:bgprimary/50')    // hover + opacity modifier
```

### Ring, Transition, Prose, Divide

```js
css('_ring2 _ringPrimary')    // 2px primary ring
css('_fv:ring2 _ringAccent')  // ring on keyboard focus
css('_transColors')           // smooth color transitions
css('_prose')                 // rich text typography
css('_divideY')               // borders between stacked children
css('_textBalance')           // balanced line wrapping
```

### Opacity Modifiers
Works on all semantic color atoms: `_bgprimary/50`, `_fgaccent/30`, `_bcborder/80`

---

## 9. State Management Quick Reference

```js
// Signal (reactive value)
const [count, setCount] = createSignal(0);
count();           // Read (triggers tracking)
setCount(5);       // Write (triggers updates)
setCount(c => c + 1);  // Updater function

// Effect (runs when dependencies change)
createEffect(() => {
  console.log('Count is now:', count());  // auto-tracks count
});

// Memo (cached derived value)
const doubled = createMemo(() => count() * 2);

// Store (reactive object)
const [user, setUser] = createStore({ name: 'Alice', settings: { theme: 'dark' } });
setUser('name', 'Bob');                    // Update field
setUser('settings', 'theme', 'light');     // Nested update
```

---

## 10. Routing Quick Reference

```js
const router = createRouter({
  mode: 'hash',  // or 'history'
  base: '/app',  // optional — for subdirectory deployments
  routes: [
    { path: '/', component: HomePage },
    { path: '/products', component: ProductsPage },
    { path: '/product/:id', component: ProductPage },
    { path: '/admin', component: AdminPage, meta: { requiresAuth: true, title: 'Admin' } },
    { path: '/:404', component: NotFoundPage },
  ],
  beforeEach: (to, from) => {
    // Guard can read to.meta (merged parent→child)
    if (to.meta.requiresAuth && !isLoggedIn()) return '/login';
  },
});

// Navigation listener (subscribe/unsubscribe)
const unsub = router.onNavigate((to, from) => {
  analytics.track('page_view', { path: to.path, from: from.path });
});
// Later: unsub();

// Standalone variant:
// import { onNavigate } from 'decantr/router';
// const unsub = onNavigate((to, from) => { /* track */ });

// Navigation
navigate('/products');
navigate('/product/42');
back();     // history.back() — fires guards
forward();  // history.forward() — fires guards

// Loading indicator for lazy routes
// isNavigating() → reactive boolean, true while lazy components resolve

// Route params + meta
const route = useRoute();
route.params.id;  // '42'
route.query.sort; // from ?sort=price
route.meta;       // { requiresAuth: true, title: 'Admin' }

// Link component
link({ href: '/products', class: css('_fgprimary') }, 'Products')
```

### Complete SPA Entry Point

```js
import { mount } from 'decantr/core';
import { createRouter } from 'decantr/router';

const router = createRouter({
  mode: 'hash',
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
  ]
});

// mount(target, renderFn) — target is a DOM element, renderFn returns the root node
mount(document.getElementById('app'), () => router.outlet());
```

> `createRouter()` returns a plain object with `{ navigate, outlet, current, path, destroy }`. Call `router.outlet()` to get the DOM element that reactively renders the matched route. Do **not** pass the router object itself to `mount()`.

---

## 11. Common Layout Patterns

### Dashboard page (sidebar-main skeleton)
```js
// Grid: 240px sidebar + 1fr main
div({ class: css('_grid _h[100vh]'), style: 'grid-template-columns:240px 1fr' },
  aside({ class: css('_bgmuted _borderR _p3 _flex _col _gap1') }, /* nav */),
  main({ class: css('_flex _col _overflow[hidden]') },
    header({ class: css('_flex _aic _jcsb _px6 _py3 _borderB') }, /* title + actions */),
    div({ class: css('_flex _col _gap4 _p6 _overflow[auto] _flex1') }, /* content */)
  )
)
```

### Two-column layout (content + sidebar)
```js
div({ class: css('_grid _gap6'), style: 'grid-template-columns:1fr 300px' },
  main(/* primary content */),
  aside(/* sidebar */)
)
```

### Responsive card grid
```js
div({ class: css('_grid _gcaf280 _gap4 _p4') },  // auto-fit columns, min 280px
  ...items.map(item => Card(/* ... */))
)
```

### Form layout
```js
Card({ class: css('_mw[600px] _mxa') },
  Card.Header({}, h2({ class: css('_heading4') }, 'Form Title')),
  Card.Body({ class: css('_flex _col _gap4') },
    div({ class: css('_grid _gc2 _gap4') }, Input({ label: 'First' }), Input({ label: 'Last' })),
    Input({ label: 'Email', type: 'email' }),
    Button({ variant: 'primary', class: css('_wfull') }, 'Submit')
  )
)
```
