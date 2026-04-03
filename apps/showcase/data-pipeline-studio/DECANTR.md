## Project Brief

- **Blueprint:** data-pipeline-studio
- **Theme:** terminal (dark mode, sharp shape)
- **Personality:** Technical data engineering workspace with terminal-inspired aesthetics. Phosphor green/amber on black for pipeline canvas and log viewers. ASCII box borders on panels. Monospace everywhere. Visual pipeline builder uses nodes and edges with animated data flow particles. Source connectors show recognizable database/API icons. Transformation nodes show SQL/code previews. Think dbt Cloud meets Prefect meets a retro terminal. Lucide icons mixed with data-type icons.
- **Sections:** 7 (pipeline-builder [primary], source-catalog [auxiliary], transformation-editor [auxiliary], job-monitor [auxiliary], marketing-pipeline [public], auth-full [gateway], settings-full [auxiliary])
- **Features:** pipelines, visual-builder, scheduling, sources, connectors, schemas, sql-editor, transformations, data-preview, monitoring, logs, job-history, marketing, seo, auth, mfa, oauth, email-verification, password-reset, profile-edit, password-change, mfa-management, session-management, theme-toggle, account-deletion, command-palette
- **Guard mode:** strict

### Decorator Quick Reference
| Class | Purpose |
|-------|---------|
| `.term-glow` | Subtle phosphor bloom effect using text-shadow with current color. 5px and 10px spread. |
| `.term-tree` | Tree view using ASCII connectors. Uses ├── └── │ for hierarchy visualization. |
| `.term-type` | Typewriter entrance animation. Characters appear one by one, 20ms per character. |
| `.term-blink` | Blinking cursor animation at 1s interval. Steps timing for authentic terminal feel. |
| `.term-input` | Terminal prompt style with '> ' prefix and blinking cursor. Monospace input. |
| `.term-panel` | ASCII box-drawing border using Unicode characters. Background surface color, 1px solid border. |
| `.term-table` | Full ASCII table borders with box-drawing characters for headers, cells, and junctions. |
| `.term-canvas` | Pure black background (#000000) for CRT authenticity. No gradients, no textures. |
| `.term-hotkey` | Function key button style '[F1]'. Border, padding, monospace. Inverse on active. |
| `.term-status` | Inverse color status bar. Background uses text color, text uses background color. |
| `.term-diff-add` | Addition highlighting. Green background with darker green text for added lines. |
| `.term-diff-del` | Deletion highlighting. Red background with darker red text for removed lines. |
| `.term-progress` | ASCII progress bar using block characters. [||||....] style with percentage. |
| `.term-scanlines` | Optional CRT scanline overlay using repeating-linear-gradient. Semi-transparent black lines. |
| `.term-sparkline` | Inline ASCII sparkline using braille characters for high-resolution mini charts. |

## Development Workflow

The essence file (`decantr.essence.json`) is the source of truth for your project's structure. Context files in `.decantr/context/` are derived from it. When you need to add, remove, or modify pages, sections, or features:

**1. Update the essence** (use CLI commands for consistency):
- `decantr add page {section}/{page} --route /{path}`
- `decantr add section {archetype}`
- `decantr add feature {name}` (or `--section {id}` for scoped)
- `decantr remove page {section}/{page}`
- `decantr remove section {id}`
- `decantr remove feature {name}`
- `decantr theme switch {name}`

**2. Regenerate context:** `decantr refresh`

**3. Read the updated context files**, then build.

**Rules:**
- Never create page components for routes that don't exist in the essence
- Never delete pages without removing them from the essence
- Always refresh after mutations — stale context files lead to drift
- If you edit the essence directly, run `decantr refresh` before building

---
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

DNA axioms include: Theme (id, mode, shape), Spacing (density, content gap), Typography (scale, weights), Color (palette, accent count), Radius (philosophy, base), Elevation (system, levels), Motion (preference, reduce-motion), Accessibility (WCAG level, focus-visible), and Personality traits.

### Blueprint (Structural Layout)

Blueprint defines sections, pages, routes, features, and pattern layouts. **Blueprint deviations are warnings** -- they should be corrected but do not block generation.

Blueprint includes: Sections (grouped by archetype with role, shell, and scoped features), Page definitions with layouts and pattern references, Routes (URL mapping), and Features (resolved from archetype union + blueprint overrides).

---

## Guard Rules

| # | Rule | Layer | What It Checks |
|---|------|-------|----------------|
| 1 | Style | DNA (error) | Code uses the theme specified in DNA |
| 2 | Density | DNA (error) | Spacing follows the density profile |
| 3 | Accessibility | DNA (error) | Code meets the WCAG level |
| 4 | Theme-mode | DNA (error) | Theme/mode combination is valid |
| 5 | Structure | Blueprint (warn) | Pages exist in the blueprint sections |
| 6 | Layout | Blueprint (warn) | Pattern order matches the layout spec |
| 7 | Pattern existence | Blueprint (warn) | Patterns referenced exist in the registry |

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
decantr get theme X     # Fetch theme details and decorators
decantr search <query>  # Search the registry
```

---

## CSS Implementation

This project uses **@decantr/css** for layout atoms, **visual treatments** for semantic styling, and **theme decorators** for theme-specific decoration.

### Three File Setup

```
src/styles/
  tokens.css       # Design tokens: --d-primary, --d-surface, --d-bg, etc.
  treatments.css   # Visual treatments (d-interactive, d-surface, ...) + theme decorators
  global.css       # Resets, base typography, sr-only
```

```javascript
import { css } from '@decantr/css';         // Atoms runtime
import './styles/tokens.css';                // Theme tokens
import './styles/treatments.css';            // Treatments + theme decorators
import './styles/global.css';                // Resets
```

### Visual Treatments

Six base treatment classes provide semantic styling. Combine with atoms for layout:

| Treatment | Class | Variants / States |
|-----------|-------|-------------------|
| **Interactive Surface** | `d-interactive` | `data-variant="primary\|ghost\|danger"`, hover/focus-visible/disabled states |
| **Container Surface** | `d-surface` | `data-variant="raised\|overlay"`, optional `data-interactive` for hover |
| **Data Display** | `d-data`, `d-data-header`, `d-data-row`, `d-data-cell` | Row hover highlight |
| **Form Control** | `d-control` | Focus ring, placeholder, disabled, error via `aria-invalid` |
| **Section Rhythm** | `d-section` | Auto-spacing between adjacent sections, density-aware |
| **Inline Annotation** | `d-annotation` | `data-status="success\|error\|warning\|info"` |

### Composition

Atoms + treatment + theme decorator:

```tsx
<button className={css('_px4 _py2') + ' d-interactive'} data-variant="primary">Deploy</button>
<div className={css('_flex _col _gap4') + ' d-surface carbon-glass'}>Card</div>
<span className="d-annotation" data-status="success">Active</span>
```

- **Atoms:** `css('_flex _col _gap4')` — processed by @decantr/css runtime
- **Treatments:** `d-interactive`, `d-surface` — semantic base styles from treatments.css
- **Theme decorators:** `carbon-glass`, `carbon-code` — theme-specific decoration from treatments.css
- **Combined:** `css('_flex _col') + ' d-surface carbon-card'`

```tsx
// Responsive prefix — applies at breakpoint and above:
css('_col sm:_row')

// Pseudo prefix:
css('hover:_opacity80')
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
| `_bgaccent` | `background:var(--d-accent)` |
| `_bgsecondary` | `background:var(--d-secondary)` |
| `_bgsurface` | `background:var(--d-surface)` |
| `_bgsurface0`-`_bgsurface2` | surface elevation layers |
| `_bgmuted` | `background:var(--d-muted)` |
| `_bgbg` | `background:var(--d-bg)` |
| `_bgtransparent` | `background:transparent` |
| `_bgsuccess`, `_bgerror`, `_bgwarning`, `_bginfo` | status backgrounds |
| `_fgprimary` | `color:var(--d-primary)` |
| `_fgaccent` | `color:var(--d-accent)` |
| `_fgsecondary` | `color:var(--d-secondary)` |
| `_fgtext` | `color:var(--d-text)` |
| `_fgmuted` | `color:var(--d-text-muted)` |
| `_fgwhite`, `_fgblack`, `_fginherit` | absolute/inherited text colors |
| `_fgsuccess`, `_fgerror`, `_fgwarning`, `_fginfo` | status text |
| `_bcprimary` | `border-color:var(--d-primary)` |
| `_bcaccent` | `border-color:var(--d-accent)` |
| `_bcborder` | `border-color:var(--d-border)` |
| `_bcmuted` | `border-color:var(--d-muted)` |
| `_bctransparent` | `border-color:transparent` |

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

Responsive prefixes: `_sm:`, `_md:`, `_lg:` (e.g. `_md:gc2`, `_lg:gc4`, `_sm:flex`).

### Section Labels

Use the d-label class for uppercase section headings.
Anchor with a left accent border: `border-left: 2px solid var(--d-accent); padding-left: 0.5rem`.

### Empty States

Every data-driven section should handle zero-data gracefully.
Pattern: centered 48px muted icon + descriptive message + optional CTA button.

### Page Transitions

If the theme provides motion tokens, apply the `entrance-fade` class to page content containers for smooth page-to-page transitions.

### Navigation Shortcuts

If the essence defines hotkeys or command_palette, implement as keyboard event listeners (useEffect + keydown) — not as visible UI text.

### Design Tokens

| Token | Purpose | Use for |
|-------|---------|---------|
| `--d-primary` | Primary brand color | Buttons, links, focus rings |
| `--d-surface`, `--d-surface-raised` | Surface backgrounds | Cards, panels |
| `--d-bg` | Page background | Body, main container |
| `--d-border` | Border color | Dividers, card borders |
| `--d-text`, `--d-text-muted` | Text colors | Body text, secondary text |
| `--d-success`, `--d-error`, `--d-warning`, `--d-info` | Status colors | Alerts, badges, toasts |
| `--d-shadow`, `--d-shadow-lg` | Elevation shadows | Cards, overlays |
| `--d-radius`, `--d-radius-lg` | Border radii | Buttons, cards |
| `--d-font-mono` | Monospace font stack | Code, metrics, data |
| `--d-duration-hover` | Hover transition | Interactive elements |
| `--d-easing` | Animation easing | All transitions |
| `--d-accent-glow` | Glow color | Hover effects, focus rings |

### Routing

Check `decantr.essence.json` → `meta.platform.routing` for the routing strategy:
- `"hash"` → use `HashRouter` (e.g., for static hosting, GitHub Pages)
- `"history"` → use `BrowserRouter` (e.g., for server-rendered apps)

Routes are defined in `decantr.essence.json` → `blueprint.routes` and listed in `.decantr/context/scaffold.md`.

### Layout Rules

1. **Never nest d-surface inside d-surface.** Inner sections use plain containers with padding atoms.
2. **Shell regions are frames, not surfaces.** Sidebar and header use var(--d-surface) or var(--d-bg) directly. Apply d-surface only to content cards within the body region.
3. **One scroll container per region.** Body has overflow-y-auto. Sidebar nav has its own overflow-y-auto. Never nest additional scrollable wrappers.
4. **d-section spacing is self-contained.** Each d-section owns its padding. The d-section + d-section rule adds a separator. Do NOT add extra margin between adjacent sections.
5. **Responsive nav rules.** Hamburger menus appear ONLY below the shell collapse breakpoint. Full nav shows above it.

### Motion Philosophy

Every interaction should feel responsive and polished. Apply motion by default, not as an afterthought:

- **Page transitions:** Apply entrance-fade (or the personality entrance animation) to the main content area on route change
- **Stagger children:** Lists, grids, and card groups should stagger-animate on mount (50-100ms delay per item)
- **Data visualization:** Charts, gauges, progress bars, and counters should animate to their values on mount — never render static
- **Micro-interactions:** All interactive elements (buttons, toggles, cards, nav items) need hover/press transitions. Use the motion tokens (--d-duration-hover, --d-easing) for consistency.
- **Scroll reveals:** Sections below the fold should fade-in on scroll intersection (IntersectionObserver, once)
- **Reduced motion:** Wrap all animations in `prefers-reduced-motion` media query — skip animation, keep state changes instant

### Interactivity Philosophy

Build for wow factor. When a pattern describes a canvas, graph, map, or spatial visualization, implement it as a **fully interactive surface**, not a static illustration:

- **Drag and drop:** Nodes, cards, and items on spatial canvases should be draggable. Use pointer events with proper grab/grabbing cursors.
- **Pan and zoom:** Canvases and large visualizations should support pan (click-drag on background) and zoom (scroll wheel or pinch). Show zoom level indicator.
- **Connections:** When nodes exist in a graph/topology view, they should have visible connection lines. Implement click-to-select + click-target for connecting nodes.
- **Live state:** Data-driven visualizations should update in real-time with simulated data. Status changes should animate (color transitions, pulse effects).
- **Direct manipulation:** Prefer drag-to-reorder over dropdown menus. Prefer inline editing over modal forms. Prefer resize handles over fixed layouts.
- **Hover reveals:** Show contextual information (tooltips, expanded cards, action menus) on hover — don't require clicks to discover functionality.
