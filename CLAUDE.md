# /tmp/decantr-baseline-test

Built with [decantr](https://decantr.ai) v0.4.2 — AI-first web framework.

## Project Structure

- `src/app.js` — Entry point, mounts the app to `#app`
- `src/pages/` — Route page components
- `src/components/` — Project-specific reusable components
- `public/index.html` — HTML shell with theme CSS variables
- `decantr.config.json` — Project configuration
- `decantr.essence.json` — Project DNA (generated during Decantation Process)
- `AGENTS.md` — Framework translation layer (read this for API equivalences)
- `reference/llm-primer.md` — Imports, atoms, components, pattern snippets
- `reference/spatial-guidelines.md` — Spacing rules, density zones, Clarity profiles
- `reference/atoms.md` — Valid atom class names (always check before using `_` atoms)
- `reference/shells.md` — Shell layout presets, config schema, nav states, grid area diagrams

## The Decantation Process

Follow this process for ALL new projects and major feature additions:

### Stage 1: POUR — User expresses intent in natural language
### Stage 2: SETTLE — Decompose into five layers:
- **Terroir**: Domain archetype → read `node_modules/decantr/src/registry/archetypes/`
- **Vintage**: Style + mode + recipe → read `node_modules/decantr/src/registry/recipe-*.json`
- **Character**: Brand personality traits (e.g. "tactical", "minimal", "playful")
- **Structure**: Page/view map with skeleton assignments
- **Tannins**: Functional systems (auth, search, payments, etc.)
### Stage 3: CLARIFY — Write `decantr.essence.json` and confirm with user
### Stage 4: DECANT — Resolve each page's Blend (spatial arrangement)
Read the archetype's `default_blend` for each page. Copy into the Essence's `blend` array, then customize.
Derive Clarity profile from Character traits → `reference/spatial-guidelines.md` §17. Apply density-appropriate gaps to each page's `surface` atoms.

**Blend format**: Each `blend` is an ordered array of rows:
- `"pattern-id"` — full-width pattern row (default preset)
- `{ "pattern": "hero", "preset": "image-overlay", "as": "recipe-hero" }` — pattern with preset + local alias
- `{ "cols": ["a", "b"], "at": "lg" }` — equal-width side-by-side, collapse below `lg`
- `{ "cols": ["a", "b"], "span": { "a": 3 }, "at": "md" }` — weighted columns (a=3fr, b=1fr)

**Pattern Presets (v2)**: Patterns support named presets — structural variants within a single file.
- `hero` has presets: `landing`, `image-overlay`, `image-overlay-compact`
- `card-grid` has presets: `product`, `content`, `collection`, `icon`
- `form-sections` has presets: `settings`, `creation`, `structured`
- `detail-header` has presets: `standard`, `profile`
Before creating a new pattern file, check if it can be a preset on an existing pattern.

Optional `surface` on each structure entry sets page container atoms (default: `_flex _col _gap4 _p4 _overflow[auto] _flex1`).

### Stage 5: SERVE — Generate code from Blend specs
For each page, read its `blend` array and apply:
1. Create page container with `surface` atoms
2. String rows → full-width pattern (use pattern's `default_blend.atoms`)
3. `{ cols }` rows → `_grid _gc{N} _gap4` wrapper, collapse below `at` breakpoint
4. `{ cols, span }` rows → `_gc{total}` grid, each pattern gets `_span{weight}`
5. Apply recipe wrappers per `recipe_overrides`

### Ongoing: AGE — Read Essence before every change. Guard against drift.

### Cork Rules (Anti-Drift)
Before writing ANY code, read `decantr.essence.json`. Verify:
1. Style matches the Vintage. Do not switch styles.
2. Page exists in the Structure. If new, add it to the Essence first.
3. Layout follows the page's Blend. Do not freestyle spatial arrangement.
4. Composition follows the active Recipe. Do not freestyle decoration.
5. Spacing follows the Clarity profile derived from Character → `reference/spatial-guidelines.md` §17. Do not default to `_gap4`/`_p4` everywhere.
If a request conflicts with the Essence, flag the conflict and ask for confirmation.

## Essence Schema

You MUST create `decantr.essence.json` during CLARIFY. Do NOT proceed to DECANT without it.

**Simple (single domain):**
```json
{
  "version": "1.0.0",
  "terroir": "saas-dashboard",
  "vintage": { "style": "command-center", "mode": "dark", "recipe": "command-center", "shape": "sharp" },
  "character": ["tactical", "data-dense"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [
    { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "data-table"] },
    { "id": "catalog", "skeleton": "top-nav-main", "blend": [
      { "pattern": "card-grid", "preset": "product", "as": "product-grid" }
    ]}
  ],
  "tannins": ["auth", "realtime-data"],
  "cork": { "enforce_style": true, "enforce_recipe": true }
}
```

**Sectioned (multi-domain):**
```json
{
  "vessel": { "type": "spa", "routing": "hash" },
  "character": ["professional", "technical"],
  "sections": [
    {
      "id": "brand",
      "path": "/",
      "terroir": "portfolio",
      "vintage": { "style": "glassmorphism", "mode": "dark" },
      "structure": [{ "id": "home", "skeleton": "full-bleed", "blend": ["hero", "cta-section"] }],
      "tannins": ["analytics"]
    }
  ],
  "shared_tannins": ["auth"],
  "cork": { "enforce_style": true, "enforce_sections": true }
}
```

## Framework Imports

```js
import { tags } from 'decantr/tags';
import { h, text, cond, list, mount, onMount, onDestroy } from 'decantr/core';
import { createSignal, createEffect, createMemo, createStore, batch, createRoot, on } from 'decantr/state';
import { createQuery, createMutation, queryClient, createEntityStore, createURLSignal, createPersisted } from 'decantr/data';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { css, setStyle, setMode } from 'decantr/css';
import { Button, Input, Card, Modal, Tabs, ... } from 'decantr/components';
import { createI18n } from 'decantr/i18n';
import { createAuth, requireAuth } from 'decantr/tannins/auth';
import { renderToString, renderToStream, hydrate } from 'decantr/ssr';
```

## Styles

**Core** (ships with framework, no extra import): `auradecantism` (default)

**Add-on styles** (import individually via `import { clean } from 'decantr/styles/clean'` then `registerStyle(clean)`):
`clean`, `retro`, `glassmorphism`, `command-center`, `bioluminescent`, `clay`, `dopamine`, `editorial`, `liquid-glass`, `prismatic`

Modes: `light`, `dark`, `auto`
Shapes: `sharp`, `rounded`, `pill`

### Atom Capabilities
- **Arbitrary transitions**: `_trans[color_0.15s_ease]` — underscores become spaces
- **Opacity modifiers**: Work on all semantic color atoms — `_bgprimary/50`, `_bcborder/80`, `_fgmuted/60`
- **Arbitrary values**: `_bg[#1a1a2e]`, `_w[calc(100%-2rem)]`, `_p[clamp(1rem,3vw,2rem)]`

## Registry

- `node_modules/decantr/src/registry/index.json` — Full API catalog
- `node_modules/decantr/src/registry/components.json` — Component props/types
- `node_modules/decantr/src/registry/archetypes/` — Domain archetypes (v2: `{pattern, preset, as}` references)
- `node_modules/decantr/src/registry/patterns/` — Experience patterns (v2: presets within files)
- `node_modules/decantr/src/registry/recipe-*.json` — Visual language recipes

## Build Configuration

In `decantr.config.json`:
```json
{
  "build": {
    "sizeBudget": {
      "jsRaw": 102400,
      "jsBrotli": 25600,
      "cssRaw": 51200,
      "totalBrotli": 51200,
      "chunkRaw": 51200
    }
  },
  "plugins": [
    "./plugins/my-plugin.js",
    ["@acme/decantr-plugin", { "option": true }]
  ]
}
```
See `reference/plugins.md` for plugin API documentation.

## Commands

- `npx decantr dev` — Dev server with hot reload
- `npx decantr build` — Production build to `dist/`
- `npx decantr test` — Run tests
- `npx decantr validate` — Validate `decantr.essence.json`

