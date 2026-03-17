# Atomic CSS Reference

All atoms are prefixed with `_` (underscore) for namespace safety — zero conflicts with Tailwind, Bootstrap, or any CSS framework. Every decantr atom starts with `_`.

All atoms are available via `css()`. Example: `css('_grid _gc3 _gap4 _p6 _ctr')`.

## Spacing (_p, _m, _gap — scale 0-12 + 14,16,20,24,32,40,48,56,64)

> For decision logic on which spacing atoms to use, see `reference/spatial-guidelines.md` §2 Spatial Taxonomy and §18 Quick Reference Decision Table.
| Prefix | Property | Example |
|--------|----------|---------|
| `_p` | padding | `_p4` -> `1rem` |
| `_px/_py` | padding-inline/block | `_px2` -> `0.5rem` |
| `_pt/_pr/_pb/_pl` | padding sides | `_pt1` -> `0.25rem` |
| `_m` | margin | `_m4` -> `1rem` |
| `_mx/_my` | margin-inline/block | `_mx2` -> `0.5rem` |
| `_mt/_mr/_mb/_ml` | margin sides | `_mt1` -> `0.25rem` |
| `_gap/_gx/_gy` | gap/column-gap/row-gap | `_gap4` -> `1rem` |

## Negative Margins (scale 1-12 + 14,16,20,24,32)
`_-m2` -> `margin:-0.5rem`, `_-mt4` -> `margin-top:-1rem`, `_-mx1`, `_-my3`, `_-mr2`, `_-mb1`, `_-ml4`

## Auto Margins
`_ma` (margin:auto), `_mxa` (margin-inline:auto), `_mya` (margin-block:auto), `_mta`, `_mra`, `_mba`, `_mla`

## Width/Height (scale 0-12 + extended + keywords)
| Atom | Output |
|------|--------|
| `_w4/_h4` | width/height: 1rem |
| `_wfull/_hfull` | 100% |
| `_wscreen` | width:100vw |
| `_hscreen` | height:100vh |
| `_wauto/_hauto` | auto |
| `_wfit/_hfit` | fit-content |
| `_wmin/_wmax` | min-content/max-content |
| `_hmin/_hmax` | min-content/max-content |
| `_mw4/_mh4` | max-width/max-height |
| `_mwmin/_mwmax` | max-width: min/max-content |
| `_mhmin/_mhmax` | max-height: min/max-content |

## Min-Width/Height (scale 0-12 + extended + keywords)
`_minw0`-`_minw64`, `_minwfull`, `_minwscreen` (100vw), `_minwfit`, `_minwmin`, `_minwmax`
`_minh0`-`_minh64`, `_minhfull`, `_minhscreen` (100vh), `_minhfit`, `_minhmin`, `_minhmax`

## Display
`_block`, `_inline`, `_flex`, `_grid`, `_none`, `_contents`, `_iflex`, `_igrid`

## Flexbox
| Atom | Output |
|------|--------|
| `_col/_row` | flex-direction |
| `_colr/_rowr` | column-reverse/row-reverse |
| `_wrap/_nowrap/_wrapr` | flex-wrap |
| `_grow/_grow0` | flex-grow: 1/0 |
| `_shrink/_shrink0` | flex-shrink: 1/0 |
| `_flex1` | flex: 1 1 0% |
| `_flexauto` | flex: 1 1 auto |
| `_flexnone` | flex: none |
| `_flexinit` | flex: 0 1 auto |

## Flex-Basis (scale 0-12 + extended + percentages)
`_basis0`-`_basis12`, `_basis14`-`_basis64`, `_basisa` (auto)
`_basis25` (25%), `_basis33` (33.333%), `_basis50` (50%), `_basis66` (66.667%), `_basis75` (75%), `_basisfull` (100%)

## Order
`_ord0`-`_ord12`, `_ord-1` (-1), `_ordfirst` (-9999), `_ordlast` (9999)

## Alignment
| Atom | Property | Value |
|------|----------|-------|
| `_center` | align-items + justify-content | center |
| `_aic/_ais/_aifs/_aife/_aibs` | align-items | center/stretch/flex-start/flex-end/baseline |
| `_jcc/_jcsb/_jcsa/_jcse/_jcfs/_jcfe` | justify-content | center/space-between/around/evenly/flex-start/flex-end |
| `_acc/_acsb/_acsa/_acse/_acfs/_acfe/_acs` | align-content | center/space-between/around/evenly/flex-start/flex-end/stretch |
| `_asc/_ass/_asfs/_asfe/_asa/_asbs` | align-self | center/stretch/flex-start/flex-end/auto/baseline |
| `_jic/_jis/_jifs/_jife` | justify-items | center/stretch/start/end |
| `_jsc/_jss/_jsfs/_jsfe/_jsa` | justify-self | center/stretch/start/end/auto |
| `_pic/_pis` | place-items | center/stretch |
| `_pcc/_pcse/_pcsb` | place-content | center/space-evenly/space-between |

## Grid System

> For column count by content type and container width guidance, see `reference/spatial-guidelines.md` §14 Grid & Column System.

| Atom | Output |
|------|--------|
| `_gc1`-`_gc12` | grid-template-columns: repeat(N,minmax(0,1fr)) |
| `_gcnone` | grid-template-columns: none |
| `_gr1`-`_gr6` | grid-template-rows: repeat(N,minmax(0,1fr)) |
| `_grnone` | grid-template-rows: none |
| `_span1`-`_span12` | grid-column: span N/span N |
| `_spanfull` | grid-column: 1/-1 |
| `_rspan1`-`_rspan6` | grid-row: span N/span N |
| `_rspanfull` | grid-row: 1/-1 |
| `_gcs1`-`_gcs13` | grid-column-start |
| `_gce1`-`_gce13` | grid-column-end |
| `_grs1`-`_grs7` | grid-row-start |
| `_gre1`-`_gre7` | grid-row-end |
| `_gcaf160/200/220/250/280/300/320` | repeat(auto-fit,minmax(Npx,1fr)) |
| `_gcaf` | repeat(auto-fit,minmax(0,1fr)) |
| `_gcafl` | repeat(auto-fill,minmax(0,1fr)) |
| `_gflowr/_gflowc/_gflowd/_gflowrd/_gflowcd` | grid-auto-flow |
| `_gacfr/_gacmin/_gacmax` | grid-auto-columns |
| `_garfr/_garmin/_garmax` | grid-auto-rows |

## Aspect Ratio
`_arsq` (1), `_ar169` (16/9), `_ar43` (4/3), `_ar219` (21/9), `_ar32` (3/2), `_ara` (auto)

## Container Utilities
`_ctrsm` (640px), `_ctr` (960px), `_ctrlg` (1080px), `_ctrxl` (1280px), `_ctrfull` (100%) — all include margin-inline:auto

## Overflow
`_ohidden`, `_oauto`, `_oscroll`, `_ovisible`
`_oxhidden`, `_oxauto`, `_oxscroll`, `_oyhidden`, `_oyauto`, `_oyscroll`

## Text & Visibility
`_visible`, `_invisible`, `_wsnw` (nowrap), `_wsnormal`, `_wspre`, `_wsprewrap`
`_truncate` (overflow:hidden + text-overflow:ellipsis + white-space:nowrap)
`_clamp2`, `_clamp3` (line clamping via -webkit-line-clamp)

## Line-Height
`_lh1` (1), `_lh1a`/`_lh125` (1.25), `_lh1b`/`_lh150` (1.5), `_lh175` (1.75), `_lh2` (2)

## Typography
`_t10`-`_t48` (font-size, fixed rem), `_bold/_medium/_normal/_light` (weight), `_italic`, `_underline/_strike/_nounder`, `_upper/_lower/_cap`, `_tl/_tc/_tr`

## Token-Backed Typography (theme-customizable)

> For typographic spatial rules (heading asymmetry, vertical rhythm), see `reference/spatial-guidelines.md` §8 Typographic Spatial System.
| Atom | CSS Output |
|------|-----------|
| `_textxs`-`_text4xl` | `font-size:var(--d-text-{size},{fallback})` — xs/sm/base/md/lg/xl/2xl/3xl/4xl |
| `_lhtight` | `line-height:var(--d-lh-tight,1.1)` |
| `_lhsnug` | `line-height:var(--d-lh-snug,1.25)` |
| `_lhnormal` | `line-height:var(--d-lh-normal,1.5)` |
| `_lhrelaxed` | `line-height:var(--d-lh-relaxed,1.6)` |
| `_lhloose` | `line-height:var(--d-lh-loose,1.75)` |
| `_fwheading` | `font-weight:var(--d-fw-heading,700)` |
| `_fwtitle` | `font-weight:var(--d-fw-title,600)` |
| `_lsheading` | `letter-spacing:var(--d-ls-heading,-0.025em)` |

Use `_text*`/`_lh*`/`_fw*` atoms in components for theme-customizable typography. Use `_t10`-`_t48` for fixed sizes that should not change per theme.

## Typography Presets (compound atoms)

Bundles of size+weight+lineHeight+letterSpacing for common text roles. All token-backed with `var()` fallbacks — theme-customizable automatically (retro gets bolder headings, etc.).

| Atom | Size | Weight | Line Height | Extra |
|------|------|--------|-------------|-------|
| `_heading1` | `--d-text-4xl` | `--d-fw-heading` | `--d-lh-tight` | `--d-ls-heading` |
| `_heading2` | `--d-text-3xl` | `--d-fw-heading` | `--d-lh-tight` | `--d-ls-heading` |
| `_heading3` | `--d-text-2xl` | `--d-fw-heading` | `--d-lh-snug` | `--d-ls-heading` |
| `_heading4` | `--d-text-xl` | `--d-fw-title` | `--d-lh-snug` | — |
| `_heading5` | `--d-text-lg` | `--d-fw-title` | `--d-lh-snug` | — |
| `_heading6` | `--d-text-md` | `--d-fw-title` | `--d-lh-normal` | — |
| `_body` | `--d-text-base` | — | `--d-lh-normal` | — |
| `_bodylg` | `--d-text-md` | — | `--d-lh-relaxed` | — |
| `_caption` | `--d-text-sm` | — | `--d-lh-normal` | `color:--d-muted-fg` |
| `_label` | `--d-text-sm` | `--d-fw-medium` | `--d-lh-none` | — |
| `_overline` | `--d-text-xs` | `--d-fw-medium` | `--d-lh-none` | `uppercase; ls:0.08em` |

Usage: `h1({ class: css('_heading1') }, 'Page Title')` — one atom replaces 3-4 individual atoms.

## Colors (Semantic)
**Palette roles**: `_bg{role}`, `_fg{role}`, `_bc{role}` — where role = `primary`, `accent`, `tertiary`, `success`, `warning`, `error`, `info`
**Subtle variants**: `_bg{role}sub`, `_fg{role}sub` (subtle bg/fg), `_bc{role}bdr` (role border)
**Foreground-on-base**: `_fg{role}on` (contrasting text on role background)
**Neutrals**: `_bgbg`, `_fgfg`, `_bgmuted`, `_fgmuted`, `_fgmutedfg`, `_bcborder`, `_bcstrong`
**Surfaces**: `_surface0`-`_surface3`, `_fgsurface0`-`_fgsurface3`, `_bcsurface0`-`_bcsurface3`
**Opacity**: `_bg{role}/N` (e.g. `_bgprimary/50`) — color-mix with transparency (0-100)

### Color Decision Flow

| Intent | Atom | Token |
|--------|------|-------|
| Primary text | `_fgfg` | `--d-fg` |
| Muted/secondary text | `_fgmutedfg` | `--d-muted-fg` |
| Even more muted text | `_fgmuted` | `--d-muted` |
| Accent/brand text | `_fgprimary` | `--d-primary` |
| Page background | `_bgbg` | `--d-bg` |
| Muted background | `_bgmuted` | `--d-muted` |
| Primary action bg | `_bgprimary` | `--d-primary` |
| Surface card bg | `_surface0`–`_surface3` | `--d-surface-{0-3}` |
| Border default | `_bcborder` | `--d-border` |
| Border emphasis | `_bcstrong` | `--d-border-strong` |
| Error state | `_fgerror` / `_bgerror` | `--d-error` |
| Success state | `_fgsuccess` / `_bgsuccess` | `--d-success` |

## Field Atoms

Unified field container atoms. Pair with field tokens for consistent form styling.

| Atom | Output |
|------|--------|
| `_field` | Field visual base — applies `--d-field-bg`, `--d-field-border`, `--d-field-radius`, border-width |
| `_fieldOutlined` | Outlined variant (alias for `_field`) — transparent bg, visible border |
| `_fieldFilled` | Filled variant — surface bg, transparent border |
| `_fieldGhost` | Ghost variant — transparent bg + border, shows border on focus |

## Interactive State Atoms

Semantic background/foreground atoms for item selection and hover states.

| Atom | Output |
|------|--------|
| `_hoverBg` | `background:var(--d-item-hover-bg)` — hover background for list items, options, rows |
| `_activeBg` | `background:var(--d-item-active-bg)` — active/pressed item background |
| `_selectedBg` | `background:var(--d-selected-bg)` — selected item background |
| `_selectedFg` | `color:var(--d-selected-fg)` — selected item foreground |

## Semantic Opacity Atoms

| Atom | Output |
|------|--------|
| `_disabled` | `opacity:var(--d-disabled-opacity);cursor:not-allowed;pointer-events:none` — disabled state |

## Layout Atoms

| Atom | Output |
|------|--------|
| `_proseWidth` | `max-width:var(--d-prose-width,75ch)` — optimal reading line length |

## Atom Resolution

Atoms are resolved algorithmically by `resolveAtomDecl()` in `src/css/atoms.js` (rewritten from a 665-line imperative Map to a 548-line algorithmic resolver). The resolution order is:

1. **ALIASES** — long-form names to canonical terse atoms (`_gridCols4` → `_gc4`, etc.)
2. **DIRECT** — known fixed atoms looked up by exact name
3. **Algorithmic patterns** — spacing scales, grid columns, typography sizes, colors, etc. computed from naming conventions
4. **RESIDUAL** — remaining one-off atoms that don't fit algorithmic patterns

The `css()` API is unchanged. In **production builds** with static CSS extraction enabled, all atoms are pre-resolved at build time and `css()` becomes a lightweight passthrough (~673 bytes) that only converts `_group` to `d-group`, `_peer` to `d-peer`, and joins class names. The `atoms.js` and `runtime.js` modules are removed entirely from the bundle. If `define()` or dynamic `css()` patterns are detected, the full runtime is preserved as a fallback.

## Aliases
Long-form names resolve to canonical terse atoms: `_gridCols4` → `_gc4`, `_noDecoration` → `_nounder`, `_border` → `_b1`, `_borderColor` → `_bcborder`, `_radiusFull` → `_rfull`, `_radius0`-`_radius8` → `_r0`-`_r8`

## Position
`_relative/_absolute/_fixed/_sticky` (or `_rel/_abs`), `_top0/_right0/_bottom0/_left0/_inset0`

## Borders
`_b0/_b1/_b2`, `_r0`-`_r8` (border-radius), `_rfull` (9999px), `_rcircle` (50%)

### Radius Decision Flow

| Element | Atom | Rationale |
|---------|------|-----------|
| Buttons, inputs | `_r2`–`_r3` | Standard interactive controls |
| Cards, panels | `_r3`–`_r4` | Content containers |
| Avatars, tags | `_rfull` | Circular/pill shapes |
| Table cells | `_r2` | Subtle rounding |
| Modals, dialogs | `_r4` | Prominent containers |
| Sharp/no radius | `_r0` | Data-dense, technical UIs |

## Opacity, Transitions, Z-index, Shadow, Cursor
`_op0`-`_op10`, `_trans/_transfast/_transslow/_transnone`, `_z0/_z10/_z20/_z30/_z40/_z50`
`_shadow/_shadowmd/_shadowlg/_shadowno`, `_pointer/_grab`

### Arbitrary Transition Syntax

Use bracket notation `_trans[...]` for custom transitions. Underscores in the value are converted to spaces:

```js
css('_trans[color_0.15s_ease]')             // transition: color 0.15s ease
css('_trans[opacity_0.2s_ease-in-out]')     // transition: opacity 0.2s ease-in-out
css('_trans[transform_0.3s_cubic-bezier(0.4,0,0.2,1)]')  // custom easing
```

This uses the `trans` arbitrary value prefix (mapped to `transition` in `ARB_PROPS`). Prefer `_trans` (all 0.2s ease) for standard transitions and `_trans[...]` only when you need to target specific properties or non-standard durations.

---

## Composable Gradient System

Build gradients by combining direction + from + via + to atoms. Uses CSS variable composition.

```js
css('_gradBR _fromPrimary _toAccent')           // bottom-right, primary → accent
css('_gradR _fromPrimary _viaSuccess _toTransparent')  // right, with via stop
```

**Direction atoms:** `_gradR`, `_gradL`, `_gradT`, `_gradB`, `_gradBR`, `_gradBL`, `_gradTR`, `_gradTL`

**From atoms** (set start color): `_fromPrimary`, `_fromAccent`, `_fromTertiary`, `_fromSuccess`, `_fromWarning`, `_fromError`, `_fromInfo`, `_fromBg`, `_fromSurface1`, `_fromTransparent`

**Via atoms** (set middle color): `_viaPrimary`, `_viaAccent`, `_viaTertiary`, `_viaSuccess`, `_viaWarning`, `_viaError`, `_viaInfo`, `_viaBg`, `_viaSurface1`, `_viaTransparent`

**To atoms** (set end color): `_toPrimary`, `_toAccent`, `_toTertiary`, `_toSuccess`, `_toWarning`, `_toError`, `_toInfo`, `_toBg`, `_toSurface1`, `_toTransparent`

Works with responsive: `css('_sm:gradBR')`. Works with container queries: `css('_cq640:gradR')`.

## Opacity Modifiers

Append `/N` to any color atom for alpha transparency. Uses `color-mix()` (96%+ browser support).

```js
css('_bgprimary/50')    // background at 50% opacity
css('_fgaccent/30')     // text at 30% opacity
css('_bcborder/80')     // border at 80% opacity
css('_sm:bgprimary/20') // responsive: 20% at sm+
```

Valid opacities: 5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90, 95.

Works with all color atoms (`_bg*`, `_fg*`, `_bc*`), responsive prefixes, and container queries.

## Group/Peer State Modifiers

Style children based on parent state, or siblings based on peer state.

```js
// Group: parent hover affects children
div({ class: css('_group') },
  span({ class: css('_fgmuted _gh:fgprimary _trans') }, 'Turns primary on parent hover')
)

// Peer: sibling state affects next sibling
input({ class: css('_peer'), type: 'checkbox' }),
label({ class: css('_fgmuted _pf:fgprimary') }, 'Turns primary when input focused')
```

**Markers:** `_group` → outputs `d-group`, `_peer` → outputs `d-peer`

| Prefix | State | Selector Pattern |
|--------|-------|-----------------|
| `_gh:` | group-hover | `.d-group:hover .cls` |
| `_gf:` | group-focus-within | `.d-group:focus-within .cls` |
| `_ga:` | group-active | `.d-group:active .cls` |
| `_ph:` | peer-hover | `.d-peer:hover ~ .cls` |
| `_pf:` | peer-focus | `.d-peer:focus ~ .cls` |
| `_pa:` | peer-active | `.d-peer:active ~ .cls` |

Works with any atom: `_gh:elev2`, `_gh:bgprimary/50`, `_gf:bcprimary`.

## Responsive Prefixes (Mobile-First)

All atoms support responsive prefixes. Syntax: `_bp:atom`. Below the breakpoint, the base atom applies; at and above it, the prefixed atom takes over.

| Prefix | Min-Width | Example |
|--------|-----------|---------|
| `_sm:` | 640px | `css('_gc1 _sm:gc2')` — 1 col, 2 at sm+ |
| `_md:` | 768px | `css('_p4 _md:p8')` — p4 default, p8 at md+ |
| `_lg:` | 1024px | `css('_col _lg:row')` — column default, row at lg+ |
| `_xl:` | 1280px | `css('_ctr _xl:ctrxl')` — 960px default, 1280px at xl+ |

Works with all atoms including arbitrary values: `css('_sm:w[512px]')`, color opacity: `css('_sm:bgprimary/20')`, gradients: `css('_sm:gradBR')`.

## Container Query Prefixes

Style children based on container width, not viewport. Syntax: `_cqN:atom` where N is the min-width in pixels.

| Prefix | Min-Width | Example |
|--------|-----------|---------|
| `_cq320:` | 320px | `css('_cq320:gc2')` |
| `_cq480:` | 480px | `css('_cq480:gc3')` |
| `_cq640:` | 640px | `css('_cq640:gc4')` |
| `_cq768:` | 768px | `css('_cq768:row')` |
| `_cq1024:` | 1024px | `css('_cq1024:gc6')` |

Only these 5 widths are valid. Parent must have `container-type: inline-size` (use `_ctype[inline-size]` or set via CSS).

## Arbitrary Values

Escape hatch for one-off values without leaving utility-first flow.

```js
css('_w[512px]')                          // width:512px
css('_bg[#1a1d24]')                       // background:#1a1d24
css('_shadow[0_4px_6px_rgba(0,0,0,0.1)]') // box-shadow (underscores → spaces)
css('_p[clamp(1rem,2vw,2rem)]')           // padding with clamp()
css('_sm:w[512px]')                       // responsive arbitrary value
```

Syntax: `_prop[value]`. Underscores in value are converted to spaces.

| Prefix | Property | Prefix | Property |
|--------|----------|--------|----------|
| `w` | width | `h` | height |
| `mw` | max-width | `mh` | max-height |
| `minw` | min-width | `minh` | min-height |
| `p/pt/pr/pb/pl` | padding | `px/py` | padding-inline/block |
| `m/mt/mr/mb/ml` | margin | `mx/my` | margin-inline/block |
| `gap/gx/gy` | gap | `t` | font-size |
| `lh` | line-height | `fw` | font-weight |
| `ls` | letter-spacing | `r` | border-radius |
| `bg` | background | `fg` | color |
| `bc` | border-color | `z` | z-index |
| `op` | opacity | `shadow` | box-shadow |
| `top/right/bottom/left` | position | `inset` | inset |
| `bf` | backdrop-filter | | |

## Backdrop Filter Atoms (Composable)

Composable backdrop-filter via CSS variable composition. Combine blur + saturate + brightness.

```js
css('_bfblur12 _bfsat150')             // blur(12px) + saturate(1.5)
css('_bfblur8 _bfsat180 _bfbright110') // blur + saturate + brightness
css('_lg:bfblur16')                    // responsive backdrop blur
```

**Blur:** `_bfblur0`, `_bfblur4`, `_bfblur8`, `_bfblur12`, `_bfblur16`, `_bfblur20`, `_bfblur24`

**Saturate:** `_bfsat100`, `_bfsat125`, `_bfsat150`, `_bfsat180`, `_bfsat200`

**Brightness:** `_bfbright90`, `_bfbright100`, `_bfbright110`, `_bfbright120`

**Regular filter atoms:** `_fblur4`, `_fblur8`, `_fblur16`, `_fgray`, `_fgray50`, `_finvert`, `_fbright50`, `_fbright75`, `_fbright110`

## Custom Atoms via `define()`

When neither standard atoms nor `ARB_PROPS` bracket notation cover a CSS property, use `define()` to create a reusable atom instead of falling back to inline `style:`.

```js
import { define, css } from 'decantr/css';

define('_selectNone', 'user-select:none');
define('_peNone', 'pointer-events:none');
define('_rotated45', 'transform:rotate(45deg)');
define('_curNotAllowed', 'cursor:not-allowed');

// Use like any atom:
div({ class: css('_selectNone _peNone _rotated45') });
```

**When to use `define()`:**
- The CSS property has no `ARB_PROPS` prefix (e.g., `transform`, `user-select`, `pointer-events`, `clip-path`)
- You need the same static value in multiple places
- You want to avoid inline `style:` for a value known at author time

**When NOT to use `define()`:**
- The value is computed at runtime (use `style:` with signals/DOM measurements)
- A standard atom or bracket notation already covers it (check this file first)

**Escalation path:** (1) Standard atom → (2) Bracket notation `_w[32px]` → (3) `define()` → (4) Propose adding to `src/css/atoms.js` if broadly useful. Inline `style:` for static values is ALWAYS a bug.

---

## Pseudo-Class Prefixes

Compose ANY atom with interactive state pseudo-classes:

| Prefix | Pseudo-class | Example |
|--------|-------------|---------|
| `_h:` | `:hover` | `_h:bgprimary` — primary bg on hover |
| `_f:` | `:focus` | `_f:bcprimary` — primary border on focus |
| `_fv:` | `:focus-visible` | `_fv:ring2` — ring on keyboard focus |
| `_a:` | `:active` | `_a:bgmuted` — muted bg on press |
| `_fw:` | `:focus-within` | `_fw:bcprimary` — border when child focused |

**Combinations:**
- Responsive + pseudo: `_sm:h:bgmuted` — hover bg at sm+ breakpoint
- Pseudo + opacity: `_h:bgprimary/50` — 50% opacity primary bg on hover
- Pseudo + arbitrary: `_h:bg[rgba(255,255,255,0.1)]` — arbitrary bg on hover

## Ring Utilities

Focus indicators and decorative outlines using `--d-ring` token:

| Atom | Output |
|------|--------|
| `_ring1` | `box-shadow: 0 0 0 1px var(--d-ring)` |
| `_ring2` | `box-shadow: 0 0 0 2px var(--d-ring)` |
| `_ring4` | `box-shadow: 0 0 0 4px var(--d-ring)` |
| `_ring0` | `box-shadow: none` (remove ring) |
| `_ringPrimary` | `--d-ring: var(--d-primary)` |
| `_ringAccent` | `--d-ring: var(--d-accent)` |
| `_ringBorder` | `--d-ring: var(--d-border)` |

Common pattern: `css('_fv:ring2 _ringPrimary')` — 2px primary ring on keyboard focus.

## Transition Shortcuts

| Atom | Properties |
|------|-----------|
| `_transColors` | color, background-color, border-color, fill, stroke (0.2s ease) |
| `_transOpacity` | opacity (0.2s ease) |
| `_transTransform` | transform (0.2s ease) |
| `_transShadow` | box-shadow (0.2s ease) |
| `_trans[color_0.15s_ease]` | Arbitrary transition (underscores → spaces) |

## Prose Typography

`_prose` adds the `d-prose` class, which applies typographic styles to nested HTML content (h1-h4, p, blockquote, code, pre, ul, ol, hr, a, img, table).

```js
div({ class: css('_prose') },
  h('h2', 'Title'),
  h('p', 'Body text with ', h('code', 'inline code'), '.'),
  h('blockquote', 'A highlighted quote.')
);
```

## Divide Utilities

| Atom | Output |
|------|--------|
| `_divideY` | Horizontal border between stacked children |
| `_divideX` | Vertical border between inline children |

Uses `var(--d-border)` for color. Applied via child selector `> :not(:first-child)`.

## Text Wrapping

| Atom | Output |
|------|--------|
| `_textBalance` | `text-wrap: balance` — balanced line lengths |
| `_textPretty` | `text-wrap: pretty` — optimized line breaks |

## Scroll Behavior

| Atom | Output |
|------|--------|
| `_scrollSmooth` | `scroll-behavior: smooth` |

---

**See also:** `reference/spatial-guidelines.md`, `reference/tokens.md`, `reference/compound-spacing.md`
