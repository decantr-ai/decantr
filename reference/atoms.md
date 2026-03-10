# Atomic CSS Reference

All atoms are prefixed with `_` (underscore) for namespace safety — zero conflicts with Tailwind, Bootstrap, or any CSS framework. Every decantr atom starts with `_`.

All atoms are available via `css()`. Example: `css('_grid _gc3 _gap4 _p6 _ctr')`.

## Spacing (_p, _m, _gap — scale 0-12 + 14,16,20,24,32,40,48,56,64)
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

Use `_text*`/`_lh*`/`_fw*` atoms in components/kits/blocks for theme-customizable typography. Use `_t10`-`_t48` for fixed sizes that should not change per theme.

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

## Colors
`_bg0`-`_bg9`, `_fg0`-`_fg9`, `_bc0`-`_bc9` (use theme CSS variables --c0 through --c9)

## Position
`_relative/_absolute/_fixed/_sticky` (or `_rel/_abs`), `_top0/_right0/_bottom0/_left0/_inset0`

## Borders
`_b0/_b1/_b2`, `_r0`-`_r8` (border-radius), `_rfull` (9999px), `_rcircle` (50%)

## Opacity, Transitions, Z-index, Shadow, Cursor
`_op0`-`_op10`, `_trans/_transfast/_transslow/_transnone`, `_z0/_z10/_z20/_z30/_z40/_z50`
`_shadow/_shadowmd/_shadowlg/_shadowno`, `_pointer/_grab`
