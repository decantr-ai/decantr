# DECANTR.md

This project uses **Decantr** for design intelligence. Read this file before generating any UI code.

---

## What is Decantr?

Decantr is a design intelligence layer that sits between you (the AI code generator) and the code you produce. It provides structured schemas, guard rules, and a two-layer model (DNA + Blueprint) that ensures consistent, production-quality output.

**Decantr does NOT generate code.** You generate the code. Decantr ensures it remains coherent and consistent.

---

## Two-Layer Model

### DNA (Design Axioms)

DNA defines the foundational design rules. **DNA violations are errors** -- they must never happen without updating the essence first.

DNA axioms include: Theme (style, mode, recipe, shape), Spacing (density, content gap), Typography (scale, weights), Color (palette, accent count), Radius (philosophy, base), Elevation (system, levels), Motion (preference, reduce-motion), Accessibility (WCAG level, focus-visible), and Personality traits.

### Blueprint (Structural Layout)

Blueprint defines sections, pages, routes, features, and pattern layouts. **Blueprint deviations are warnings** -- they should be corrected but do not block generation.

Blueprint includes: Sections (grouped by archetype with role, shell, and scoped features), Page definitions with layouts and pattern references, Routes (URL mapping), and Features (resolved from archetype union + blueprint overrides).

---

## Guard Rules

| # | Rule | Layer | What It Checks |
|---|------|-------|----------------|
| 1 | Style | DNA (error) | Code uses the theme specified in DNA |
| 2 | Recipe | DNA (error) | Decorations match the DNA recipe |
| 3 | Density | DNA (error) | Spacing follows the density profile |
| 4 | Accessibility | DNA (error) | Code meets the WCAG level |
| 5 | Theme-mode | DNA (error) | Theme/mode combination is valid |
| 6 | Structure | Blueprint (warn) | Pages exist in the blueprint sections |
| 7 | Layout | Blueprint (warn) | Pattern order matches the layout spec |
| 8 | Pattern existence | Blueprint (warn) | Patterns referenced exist in the registry |

### Enforcement Tiers

| Tier | When Used | DNA Rules | Blueprint Rules |
|------|-----------|-----------|-----------------|
| **Creative** | New project scaffolding | Off | Off |
| **Guided** | Adding pages or features | Error | Off |
| **Strict** | Modifying existing code | Error | Warn |

This project uses **strict** mode.

### Violation Response Protocol

When a user request would violate guard rules:

```
1. STOP   -- Do not proceed with code that violates DNA rules
2. EXPLAIN -- Tell the user which rule would be violated and why
3. OFFER  -- Suggest using decantr_update_essence to update the spec
4. WAIT   -- Only proceed after the essence is updated
```

**Never make "just this once" exceptions.** If the user insists, update the essence first.

### MCP Tools for Drift Management

- `decantr_check_drift` -- Check if planned changes violate rules
- `decantr_accept_drift` -- Accept a detected drift as intentional
- `decantr_update_essence` -- Update the essence spec to match desired changes

---

## How To Use This Project

### Source of truth

`decantr.essence.json` is the structural spec. Tools and guards read this.

### Initial scaffolding

Read `.decantr/context/scaffold.md` for the full app overview, topology, and route map.

### Working on a section

Read `.decantr/context/section-{name}.md` for that section's complete context. Each section file contains guard rules, theme tokens, decorator classes, pattern specs with code examples, zone context, and routes. **Everything you need is in that one file.**

### Validation

Run `decantr check` to validate code against the spec.

### Quick Commands

```bash
decantr status          # Project health
decantr check           # Detect drift violations
decantr get pattern X   # Fetch a pattern spec from registry
decantr get recipe X    # Fetch recipe decorators
decantr search <query>  # Search the registry
```

---

## CSS Implementation

This project uses **@decantr/css** for layout atoms and the generated CSS files for theme tokens and recipe decorators.

### Setup

```javascript
// 1. Import the atoms runtime
import { css } from '@decantr/css';

// 2. Import generated CSS files (created by decantr init)
import './styles/tokens.css';      // Theme tokens (--d-primary, --d-surface, etc.)
import './styles/decorators.css';  // Recipe decorators
```

### Using Atoms

The `css()` function processes atom strings and injects CSS at runtime:

```jsx
// Layout atoms
<div className={css('_flex _col _gap4 _p4')}>
  <h1 className={css('_heading1')}>Title</h1>
  <p className={css('_textsm _fgmuted')}>Description</p>
</div>

// Responsive prefixes (mobile-first)
<div className={css('_gc1 _sm:gc2 _lg:gc4')}>
  {/* 1 col -> 2 cols at 640px -> 4 cols at 1024px */}
</div>
```

### Atom Reference

#### Display
| Atom | CSS |
|------|-----|
| `_flex` | `display:flex` |
| `_grid` | `display:grid` |
| `_block` | `display:block` |
| `_inline` | `display:inline` |
| `_inlineflex` | `display:inline-flex` |
| `_none` | `display:none` |
| `_contents` | `display:contents` |

#### Flexbox
| Atom | CSS |
|------|-----|
| `_col` | `flex-direction:column` |
| `_row` | `flex-direction:row` |
| `_colrev` | `flex-direction:column-reverse` |
| `_wrap` | `flex-wrap:wrap` |
| `_nowrap` | `flex-wrap:nowrap` |
| `_flex1` | `flex:1` |
| `_flex0` | `flex:none` |
| `_flexauto` | `flex:auto` |
| `_grow` | `flex-grow:1` |
| `_grow0` | `flex-grow:0` |
| `_shrink0` | `flex-shrink:0` |

#### Alignment
| Atom | CSS |
|------|-----|
| `_aic` | `align-items:center` |
| `_aifs` | `align-items:flex-start` |
| `_aife` | `align-items:flex-end` |
| `_aist` | `align-items:stretch` |
| `_aibl` | `align-items:baseline` |
| `_jcc` | `justify-content:center` |
| `_jcfs` | `justify-content:flex-start` |
| `_jcfe` | `justify-content:flex-end` |
| `_jcsb` | `justify-content:space-between` |
| `_jcsa` | `justify-content:space-around` |
| `_jcse` | `justify-content:space-evenly` |
| `_pic` | `place-items:center` |
| `_pcc` | `place-content:center` |

#### Spacing (scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, ...)
| Atom | CSS | Notes |
|------|-----|-------|
| `_gap{n}` | `gap:{scale}` | e.g. `_gap4` = `gap:1rem` |
| `_gx{n}` | `column-gap:{scale}` | horizontal gap |
| `_gy{n}` | `row-gap:{scale}` | vertical gap |
| `_p{n}` | `padding:{scale}` | all sides |
| `_pt{n}`, `_pr{n}`, `_pb{n}`, `_pl{n}` | directional padding | top/right/bottom/left |
| `_px{n}` | `padding-inline:{scale}` | horizontal |
| `_py{n}` | `padding-block:{scale}` | vertical |
| `_m{n}` | `margin:{scale}` | same as padding variants |
| `_mx{n}`, `_my{n}` | inline/block margin | horizontal/vertical |

#### Sizing
| Atom | CSS |
|------|-----|
| `_wfull` / `_w100` | `width:100%` |
| `_hfull` / `_h100` | `height:100%` |
| `_wscreen` | `width:100vw` |
| `_hscreen` | `height:100vh` |
| `_wfit` | `width:fit-content` |
| `_hfit` | `height:fit-content` |
| `_wauto` | `width:auto` |
| `_minw0` | `min-width:0` |
| `_minh0` | `min-height:0` |
| `_w{n}`, `_h{n}` | width/height from spacing scale |
| `_minw{n}`, `_maxw{n}` | min/max width from scale |

#### Text Size
| Atom | Size | Line-height |
|------|------|-------------|
| `_textxs` | 0.75rem | 1rem |
| `_textsm` | 0.875rem | 1.25rem |
| `_textbase` | 1rem | 1.5rem |
| `_textlg` | 1.125rem | 1.75rem |
| `_textxl` | 1.25rem | 1.75rem |
| `_text2xl` | 1.5rem | 2rem |
| `_text3xl` | 1.875rem | 2.25rem |
| `_heading1`-`_heading6` | Heading presets (size + weight) |

#### Text Style
| Atom | CSS |
|------|-----|
| `_fontbold` | `font-weight:700` |
| `_fontsemi` | `font-weight:600` |
| `_fontmedium` | `font-weight:500` |
| `_fontlight` | `font-weight:300` |
| `_italic` | `font-style:italic` |
| `_underline` | `text-decoration:underline` |
| `_uppercase` | `text-transform:uppercase` |
| `_truncate` | overflow ellipsis + nowrap |
| `_textl`, `_textc`, `_textr` | text-align left/center/right |

#### Color (theme variable based)
| Atom | CSS |
|------|-----|
| `_bgprimary` | `background:var(--d-primary)` |
| `_bgsurface` | `background:var(--d-surface)` |
| `_bgsurface0`-`_bgsurface2` | surface elevation layers |
| `_bgmuted` | `background:var(--d-muted)` |
| `_bgbg` | `background:var(--d-bg)` |
| `_bgsuccess`, `_bgerror`, `_bgwarning`, `_bginfo` | status backgrounds |
| `_fgprimary` | `color:var(--d-primary)` |
| `_fgtext` | `color:var(--d-text)` |
| `_fgmuted` | `color:var(--d-text-muted)` |
| `_fgsuccess`, `_fgerror`, `_fgwarning`, `_fginfo` | status text |
| `_bcborder` | `border-color:var(--d-border)` |

#### Overflow & Whitespace
| Atom | CSS |
|------|-----|
| `_overhidden` | `overflow:hidden` |
| `_overauto` | `overflow:auto` |
| `_overscroll` | `overflow:scroll` |
| `_overxauto`, `_overyauto` | axis-specific overflow |
| `_nowraptext` | `white-space:nowrap` |
| `_prewrap` | `white-space:pre-wrap` |
| `_breakword` | `overflow-wrap:break-word` |

#### Cursor & Interaction
| Atom | CSS |
|------|-----|
| `_pointer` | `cursor:pointer` |
| `_cursordefault` | `cursor:default` |
| `_notallowed` | `cursor:not-allowed` |
| `_grab` | `cursor:grab` |
| `_selectnone` | `user-select:none` |
| `_ptrnone` | `pointer-events:none` |

#### Position & Layout
| Atom | CSS |
|------|-----|
| `_rel` | `position:relative` |
| `_abs` | `position:absolute` |
| `_fixed` | `position:fixed` |
| `_sticky` | `position:sticky` |
| `_inset0` | `inset:0` |
| `_top0`, `_right0`, `_bottom0`, `_left0` | edge positioning |
| `_z10`-`_z50` | z-index scale |

#### Grid
| Atom | CSS |
|------|-----|
| `_gc1`-`_gc12` | `grid-template-columns:repeat(N,...)` |
| `_gr1`-`_gr6` | `grid-template-rows:repeat(N,...)` |
| `_span1`-`_span12`, `_spanfull` | column span |
| `_rowspan1`-`_rowspan6` | row span |

#### Visual
| Atom | CSS |
|------|-----|
| `_rounded` | `border-radius:var(--d-radius)` |
| `_roundedfull` | `border-radius:9999px` |
| `_roundedsm`, `_roundedlg`, `_roundedxl` | radius variants |
| `_shadow`, `_shadowmd`, `_shadowlg` | box-shadow presets |
| `_bordernone` | `border:none` |
| `_bw{n}` | `border-width:{n}px` |
| `_op0`-`_op100` | opacity (0, 25, 50, 75, 100) |
| `_trans` | `transition:all 0.15s ease` |
| `_visible`, `_invisible` | visibility |

### Using Recipe Decorators

Recipe decorators (from `src/styles/decorators.css`) are regular CSS class names, NOT atoms. They are applied directly as class names and combined with atoms using string concatenation:

```tsx
// Atoms use css() function, decorators are plain class names
<div className={css('_flex _col _gap4') + ' carbon-card'}>
  <div className={css('_p4') + ' carbon-glass'}>
    <pre className={css('_p3') + ' carbon-code'}>{code}</pre>
  </div>
</div>
```

**Key difference:**
- Atoms: `css('_flex _col _gap4')` — processed by @decantr/css runtime
- Decorators: `'carbon-card'`, `'carbon-glass'` — plain CSS classes from decorators.css
- Combined: `css('_flex _col') + ' carbon-card'`

### CSS Architecture

The CSS is organized into two parts:

1. **Atoms (@decantr/css)** - Layout utilities injected at runtime into `@layer d.atoms`
2. **Generated CSS files** - Theme tokens and recipe decorators created during scaffold

```
src/styles/
  tokens.css      # :root { --d-primary: #...; --d-surface: #...; }
  decorators.css  # .recipe-card { ... }
```

### Variable Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `--d-` | Core Decantr tokens | `--d-primary`, `--d-bg` |
| `--d-gap-{n}` | Spacing tokens | `--d-gap-4`, `--d-gap-8` |
| `--d-radius` | Border radius | `--d-radius`, `--d-radius-lg` |
