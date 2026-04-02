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

### Atoms Quick Reference

| Category | Examples | Purpose |
|----------|----------|---------|
| Layout | `_flex`, `_col`, `_row`, `_wrap`, `_grid` | Flex/grid containers |
| Spacing | `_gap4`, `_p4`, `_px4`, `_py2`, `_m0` | Gaps, padding, margin |
| Sizing | `_w100`, `_h100`, `_minw0`, `_maxwfull` | Width, height |
| Text | `_textlg`, `_text2xl`, `_fontbold`, `_textc` | Typography |
| Alignment | `_aic`, `_jcc`, `_jcsb`, `_pic` | Flex/grid alignment |
| Position | `_rel`, `_abs`, `_sticky`, `_z10` | Positioning |
| Visual | `_rounded`, `_shadow`, `_trans`, `_op50` | Decoration |
| Color | `_bgprimary`, `_fgtext`, `_fgmuted`, `_bcborder` | Theme colors |
| Responsive | `_md:gc2`, `_lg:gc4`, `_sm:flex` | Breakpoint prefixes |

Scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24. Example: `_gap4` = `gap:1rem`.

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
