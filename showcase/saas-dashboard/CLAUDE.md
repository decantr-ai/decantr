# saas-dashboard

Built with [decantr](https://decantr.ai) v0.9.6 — AI-first web framework.

## Quick Start

**Read this first:** `node_modules/decantr/reference/llm-primer.md` — single-file guide with all imports, top atoms with Tailwind equivalences, component signatures, Chart API, skeleton code, and pattern examples. This covers 80% of code generation needs.

## Project Structure

- `src/app.js` — Entry point, mounts the app to `#app`
- `src/pages/` — Route page components
- `src/components/` — Project-specific reusable components
- `public/index.html` — HTML shell with theme CSS variables
- `decantr.config.json` — Project configuration
- `decantr.essence.json` — Project DNA (generated during Decantation Process)
- `AGENTS.md` — Framework translation layer (read this for API equivalences)

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

**Blend format**: Each `blend` is an ordered array of rows:
- `"pattern-id"` — full-width pattern row
- `{ "cols": ["a", "b"], "at": "lg" }` — equal-width side-by-side, collapse below `lg`
- `{ "cols": ["a", "b"], "span": { "a": 3 }, "at": "md" }` — weighted columns (a=3fr, b=1fr)

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
5. Density and tone match the Character.
If a request conflicts with the Essence, flag the conflict and ask for confirmation.

## Essence Schema

You MUST create `decantr.essence.json` during CLARIFY. Do NOT proceed to DECANT without it.

**Simple (single domain):**
```json
{
  "terroir": "saas-dashboard",
  "vintage": { "style": "command-center", "mode": "dark", "recipe": "command-center", "shape": "sharp" },
  "character": ["tactical", "data-dense"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [
    { "id": "overview", "skeleton": "sidebar-main", "blend": ["kpi-grid", "data-table"] }
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
import { createSignal, createEffect, createMemo, createStore, batch } from 'decantr/state';
import { createRouter, link, navigate, useRoute } from 'decantr/router';
import { css, setStyle, setMode } from 'decantr/css';
import { Button, Input, Card, Modal, Tabs, ... } from 'decantr/components';
```

## Styles

Available: `auradecantism` (default), `clean`, `retro`, `glassmorphism`, `command-center`
Modes: `light`, `dark`, `auto`
Shapes: `sharp`, `rounded`, `pill`

## Registry

- `node_modules/decantr/src/registry/index.json` — Full API catalog
- `node_modules/decantr/src/registry/components.json` — Component props/types
- `node_modules/decantr/src/registry/archetypes/` — Domain archetypes
- `node_modules/decantr/src/registry/patterns/` — Experience patterns
- `node_modules/decantr/src/registry/recipe-*.json` — Visual language recipes

## Commands

- `npx decantr dev` — Dev server with hot reload
- `npx decantr build` — Production build to `dist/`
- `npx decantr test` — Run tests
- `npx decantr validate` — Validate `decantr.essence.json`
- `npx decantr generate` — Generate code from `decantr.essence.json`

