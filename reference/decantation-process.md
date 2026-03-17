# The Decantation Process

The intelligence layer between user intent and generated code. A formalized methodology that decomposes raw UI requirements into structured, drift-free specifications.

## The Six Stages

```
POUR → SETTLE → CLARIFY → DECANT → SERVE → AGE
```

### POUR (Intent Capture)
User expresses what they want in natural language. No forms, no wizards.

### SETTLE (Intent Decomposition)
The LLM decomposes intent into five named layers:

| Layer | Resolves | Registry Source |
|-------|----------|-----------------|
| **Terroir** | Domain archetype | `src/registry/archetypes/` |
| **Vintage** | Style + mode + recipe | `src/css/styles/` + `src/registry/recipe-*.json` |
| **Character** | Brand personality traits | User-defined (e.g. "tactical", "minimal") |
| **Structure** | Page/view map | Archetype `pages` + user customization |
| **Tannins** | Functional systems | Archetype `tannins` + user requirements |

### CLARIFY (Essence Crystallization)
The LLM writes `decantr.essence.json` — the project's persistent DNA. User confirms. From this point, every decision references the Essence.

### Pattern Design Review Gate

**Mandatory checkpoint between CLARIFY and DECANT.** Before resolving any Blend specs, review every pattern referenced in the Essence's `blend` arrays against this checklist:

1. **Can this be a preset on an existing pattern?** Check the pattern registry (`src/registry/patterns/`) for structurally similar patterns that already support presets. If the desired variation differs only in content slots, label placement, or density — add a preset instead of a new pattern file.
2. **Does a structurally similar pattern already exist?** If two patterns share the same grid layout, component set, and slot structure but differ in domain-specific naming, merge the new one as a preset on the existing pattern. Example: `recipe-stats-bar` and `product-stats-bar` are the same structure — one pattern with domain presets.
3. **Is the new pattern reusable across 2+ domains?** A pattern must be justified by cross-domain utility. If a pattern is only useful within a single archetype, it should be a preset on a more general pattern. Exception: if the archetype is new and the pattern is fundamental to its identity.
4. **Does the domain-specific name justify a standalone file?** Only create a new pattern file when the structure (grid layout, component composition, slot arrangement) is fundamentally different from all existing patterns. A different name alone does not justify a new file.

**If any check fails**, refactor the blend to reference an existing pattern with a preset:
```json
{ "pattern": "stats-bar", "preset": "recipe", "as": "recipe-stats-bar" }
```

**Proceeding to DECANT without completing this review is a Cork violation.**

### DECANT (Spec Resolution)
Each Structure page resolves to a **Blend** — a row-based layout tree that specifies spatial arrangement of patterns. The archetype provides `default_blend` per page; the LLM copies it into the Essence's `blend` and customizes.

### SERVE (Code Generation)
Code generated from resolved Blend specs. The LLM reads each page's `blend` array and applies the SERVE algorithm (see Blend Spec below). No spatial improvisation — row order, column splits, and responsive breakpoints are all pre-specified.

### AGE (Session Fortification)
On every subsequent prompt, the LLM reads the Essence first. New pages inherit the Vintage. Drift is detected and flagged.

---

## Vocabulary

### Project Identity

| Term | Definition |
|------|-----------|
| **Terroir** | Domain archetype. What kind of product this is. |
| **Vintage** | Visual identity — style + mode + recipe + shape. |
| **Character** | Brand personality as trait words. Guides density, tone, animation. |
| **Essence** | The persistent project DNA file (`decantr.essence.json`). |

### Architecture

| Term | Definition |
|------|-----------|
| **Vessel** | App container type + routing strategy (SPA/MPA, hash/history). |
| **Structure** | Page/view map — all screens in the app. |
| **Skeleton** | Layout type per page (sidebar-main, top-nav-main, full-bleed, centered). |

### Composition

| Term | Definition |
|------|-----------|
| **Blend** | Per-page spatial arrangement — a row-based layout tree specifying pattern order, column splits, and responsive breakpoints. |
| **Recipe** | Visual language composition rules — how standard components are wrapped/decorated differently. |
| **Plumbing** | State signals, stores, and data flows for the page. |
| **Pattern** | Reusable UI building block (kpi-grid, data-table, wizard, etc.) referenced by archetypes. |

### Visual Surface

| Term | Definition |
|------|-----------|
| **Bouquet** | Colors — palette tokens from `derive()` using OKLCH color math. Character traits map to palette personality (minimal->low chroma, bold->high chroma, professional->cool blue, technical->monochrome). See `reference/color-guidelines.md` §13. |
| **Body** | Typography — font, weight, spacing from style definition. |
| **Finish** | Motion + interaction — durations, easing from personality traits. |
| **Clarity** | White space — density, compound spacing from density trait. The Clarity layer is fully specified in `reference/spatial-guidelines.md` §17 Clarity Profile. |

### Drift Prevention

| Term | Definition |
|------|-----------|
| **Cork** | Validation constraints derived from the Essence. |
| **Tasting Notes** | Append-only changelog of decisions and iterations. |

---

## The Essence File

Location: `decantr.essence.json` (project root, generated during CLARIFY stage).

```json
{
  "$schema": "https://decantr.ai/schemas/essence.v1.json",
  "version": "1.0.0",
  "terroir": "saas-dashboard",
  "vintage": {
    "style": "command-center",
    "mode": "dark",
    "recipe": "command-center",
    "shape": "sharp"
  },
  "character": ["tactical", "data-dense", "operational"],
  "vessel": {
    "type": "spa",
    "routing": "hash"
  },
  "structure": [
    {
      "id": "overview",
      "skeleton": "sidebar-main",
      "surface": "_flex _col _gap4 _p4 _overflow[auto] _flex1",
      "blend": [
        "kpi-grid",
        "data-table",
        { "cols": ["activity-feed", "chart-grid"], "at": "lg" }
      ]
    },
    {
      "id": "alerts",
      "skeleton": "sidebar-main",
      "blend": [
        "filter-sidebar",
        "data-table",
        "detail-panel"
      ]
    }
  ],
  "tannins": ["auth", "realtime-data", "notifications"],
  "cork": {
    "enforce_style": true,
    "enforce_recipe": true,
    "allowed_custom_css": false
  }
}
```

### Essence Version Field

The `version` field (string, semver format e.g. `"1.0.0"`) tracks the evolution of the Essence. It is optional but strongly recommended:

- **Bump the patch** (`1.0.0` -> `1.0.1`) when adding pages, tannins, or adjusting blend details
- **Bump the minor** (`1.0.0` -> `1.1.0`) when changing structure layout, adding sections, or swapping recipes
- **Bump the major** (`1.0.0` -> `2.0.0`) when changing terroir, vintage style, or fundamentally altering the project identity

The `validate` command will warn if no `version` field is present to encourage adoption.

### Sectioned Essence (Multi-Domain)

For applications spanning multiple domains, the Essence supports a sectioned format. Instead of a single `terroir`, the Essence defines `sections` — each with its own terroir, vintage, structure, and tannins.

**Detection**: If `sections` array exists → sectioned mode. If `terroir` exists → simple mode.

**Simple format** (single-domain — backward compatible):
```json
{
  "terroir": "saas-dashboard",
  "vintage": { "style": "command-center", "mode": "dark", "recipe": "command-center", "shape": "sharp" },
  "character": ["tactical", "data-dense"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [...],
  "tannins": ["auth", "realtime-data"],
  "cork": { "enforce_style": true }
}
```

**Sectioned format** (multi-domain):
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
      "structure": [
        { "id": "home", "skeleton": "full-bleed", "blend": ["hero", "cta-section"] },
        { "id": "about", "skeleton": "top-nav-main", "blend": ["detail-header", "timeline"] }
      ],
      "tannins": ["analytics"]
    },
    {
      "id": "docs",
      "path": "/docs",
      "terroir": "content-site",
      "vintage": { "style": "clean", "mode": "light" },
      "structure": [
        { "id": "home", "skeleton": "sidebar-main", "blend": ["category-nav", "post-list"] },
        { "id": "article", "skeleton": "sidebar-main", "blend": ["article-content", "table-of-contents"] }
      ],
      "tannins": ["search", "content-state"]
    }
  ],
  "shared_tannins": ["auth"],
  "cork": { "enforce_style": true, "enforce_sections": true }
}
```

**Sectioned rules:**
- `vessel` and `character` are project-wide (shared across sections)
- Each section has its own `terroir`, `vintage`, `structure`, and `tannins`
- `shared_tannins` are available to all sections (auth, analytics, etc.)
- Section-level tannins MUST NOT duplicate shared_tannins
- Section `path` values define the URL namespace boundary
- During SERVE, the LLM generates a `beforeEach` router guard that switches style/mode per section

---

## Archetypes

Location: `src/registry/archetypes/`

Each archetype pre-maps domain knowledge for a type of application:
- **Pages**: Typical views with their skeleton layouts and patterns
- **Tannins**: Common functional systems (auth, search, payments, etc.)
- **Skeletons**: Layout descriptions per page type
- **Suggested Vintage**: Recommended styles and modes for the domain

Available archetypes: `ecommerce`, `saas-dashboard`, `portfolio`, `content-site`, `docs-explorer`, `financial-dashboard`, `recipe-community`

The LLM reads the archetype, gets 80% of the Structure for free, then customizes based on user requirements.

---

## Patterns

Location: `src/registry/patterns/`

Composable building blocks that archetypes reference. Each pattern describes:
- **Components**: Which Decantr components are used
- **Default Blend**: Layout, atoms, and slot descriptions
- **Recipe-Agnostic**: Patterns contain no recipe knowledge. Visual transforms happen via style CSS overrides on standard components (Card, Statistic, DataTable). Extra decorative classes (backgrounds) come from the recipe JSON's `pattern_overrides` section.

Patterns resolve to concrete component compositions during the DECANT stage.

### Pattern Preset Checklist

Before creating a new pattern file, check if it can be a preset on an existing pattern:

| Pattern | Available Presets |
|---------|------------------|
| `hero` | `landing`, `image-overlay`, `image-overlay-compact` |
| `card-grid` | `product`, `content`, `collection`, `icon` |
| `form-sections` | `settings`, `creation`, `structured` |
| `detail-header` | `standard`, `profile` |

If the desired variation shares the same grid layout, component set, and slot structure as an existing pattern but differs only in content slots, label placement, or density, add a preset instead of a new pattern file. Reference presets in blend specs:
```json
{ "pattern": "card-grid", "preset": "product", "as": "product-grid" }
```

---

## Recipes

Location: `src/registry/recipe-*.json`

Visual language composition rules for drastic visual transformations that go beyond token-level styling. A recipe describes:
- **Style**: Which Decantr style to activate
- **Decorators**: Available CSS classes (e.g., `cc-frame`, `cc-bar`)
- **Compositions**: Per-component examples showing how to compose standard components differently

Available recipes: `command-center`

---

## Cork Rules (Anti-Drift)

### Visual Drift → Vintage Lock
The Essence records the Vintage. The LLM applies recipe composition rules consistently.

### Architectural Drift → Structure Lock
New pages must be added to the Structure before generation. Skeleton assignments are enforced.

### Intent Drift → Character Lock
Character traits persist across sessions. "Minimal" means compact density and restraint — always.

### Enforcement
```
Before writing ANY code, read decantr.essence.json. Verify:
1. Style matches the Vintage
2. Page exists in the Structure
3. Composition follows the active Recipe
4. Density and tone match the Character
If a request conflicts with the Essence, flag it and ask for confirmation.
```

### Cork Response Protocol

For each cork rule violation type, the LLM MUST respond with a specific action. NEVER silently violate a cork rule. ALWAYS surface the conflict to the user.

| Violation Type | LLM Response |
|----------------|-------------|
| **Style mismatch** | Ask user: "Your essence specifies {X} style but you're requesting {Y}. Update essence or keep current?" Do not proceed until resolved. |
| **Unlisted page** | Ask user: "This page isn't in your structure. Add it to essence first?" If confirmed, add the page to the essence's `structure` array before generating code. |
| **Blend violation** | Warn the user that the requested layout conflicts with the page's blend spec. Propose a blend-compatible alternative that achieves the same goal within the existing spatial arrangement. |
| **Recipe violation** | Show the correct recipe composition from the active recipe's `compositions` and `decorators`. Explain which wrapper or decorator class should be used instead. |
| **Character drift** | Flag the tone mismatch: "Your essence character is [{traits}] but this request feels [{conflicting traits}]." Suggest alternatives that align with the declared character. |
| **Section boundary violation** (sectioned essence) | Warn that the change crosses section boundaries. Each section has its own vintage and terroir — changes must stay within the correct section. |

### Essence-Config Reconciliation

The Essence (`decantr.essence.json`) is authoritative. The config (`decantr.config.json`) is derived from it.

When the Essence is written or updated, the LLM MUST also update the config to match:

| Essence Field | Config Field |
|--------------|-------------|
| `essence.vintage.style` | `config.style` |
| `essence.vintage.mode` | `config.mode` |
| `essence.vessel.routing` | `config.router` |

**Conflict resolution**: Essence always wins. If a user manually edits `decantr.config.json` to diverge from the Essence, the LLM updates the config back to match the Essence and warns the user: "Config was out of sync with essence. Updated config.{field} from '{old}' to '{new}' to match essence."

For sectioned essences, the config reflects the first section's vintage (the primary visual identity). If sections have different styles, the LLM sets the config to the first section's style and adds a comment in the generated `app.js` noting that style switching happens per-section via `setStyle()`.

---

## The Blend Spec

The Blend is the per-page spatial arrangement — a row-based layout tree that specifies how patterns are positioned relative to each other. It closes the gap between "what patterns go on a page" (archetypes) and "how to decorate components" (recipes).

### Schema

Two keys on each `structure[]` entry in the Essence:

```
blend    : Row[]           — ordered layout rows (replaces flat patterns array)
surface  : string          — container atoms for the page body (optional)
```

**Row types:**

```
Row = string                                           // full-width pattern
    | { cols: string[], at?: string }                  // equal-width columns
    | { cols: string[], span: Record<string,number>, at?: string }  // weighted columns
```

| Field | Type | Default | Purpose |
|-------|------|---------|---------|
| `cols` | `string[]` | — | Pattern IDs placed side-by-side |
| `span` | `{id: weight}` | all 1 | Relative column widths (sum = grid column count) |
| `at` | `string` | `"md"` | Breakpoint below which columns stack vertically |
| `surface` | `string` | `"_flex _col _gap4 _p4 _overflow[auto] _flex1"` | Page container atoms |

**Backward compatible**: `patterns` (flat array) still valid — interpreted as all patterns stacked full-width, one per row.

### Examples

**Dashboard Overview:**
```json
{
  "id": "overview",
  "skeleton": "sidebar-main",
  "blend": [
    "kpi-grid",
    "data-table",
    { "cols": ["activity-feed", "chart-grid"], "at": "lg" }
  ]
}
```

**E-Commerce Catalog (asymmetric split):**
```json
{
  "id": "catalog",
  "skeleton": "top-nav-main",
  "surface": "_flex _col _gap6 _p6 _ctrxl",
  "blend": [
    "sort-bar",
    { "cols": ["filter-sidebar", "product-grid"], "span": { "product-grid": 3 }, "at": "md" },
    "pagination"
  ]
}
```

**Content Article (3:1 split):**
```json
{
  "id": "article",
  "skeleton": "top-nav-main",
  "surface": "_flex _col _gap8 _py8 _px6 _ctr",
  "blend": [
    { "cols": ["article-content", "table-of-contents"], "span": { "article-content": 3 }, "at": "lg" },
    "author-card",
    "related-posts"
  ]
}
```

### SERVE Algorithm

How the LLM reads and applies a Blend during code generation:

1. Read the structure entry's `blend` array
2. Create page container with `surface` atoms (or default `_flex _col _gap4 _p4 _overflow[auto] _flex1`)
3. For each row:
   - **String**: render the pattern full-width. Use the pattern's `default_blend.atoms` for internal layout.
   - **`{ cols }`**: create a grid wrapper with `_grid _gc{N} _gap4` where N = number of columns. Add responsive collapse: below `at` breakpoint, use single column. Render each pattern inside.
   - **`{ cols, span }`**: compute total = sum of all span values (default 1 per unspecified). Grid gets `_gc{total}`. Each pattern gets `_span{weight}`.
4. Wrap contained patterns in `Card(Card.Header, Card.Body)` — standalone patterns (layout `hero`/`row`) skip wrapping. Recipe styles override Card appearance via component CSS (e.g., command-center transforms `.d-card` into cc-frame aesthetic).
5. Apply recipe `pattern_overrides` from recipe JSON (background effects like `cc-grid`, `cc-scanline`) as Card class attributes
6. Apply Clarity-derived gap to pattern code internals (`_gap4` → clarity gap)
7. Add entrance animations: `d-page-enter` on page container, `d-stagger` / `d-stagger-up` on grid wrappers containing cards/KPIs, `animate: true` on Statistic components
8. Fill pattern slots with domain content

### Separation of Concerns

| Blend controls (spatial) | NOT Blend's concern |
|--------------------------|---------------------|
| Row ordering | Internal pattern layout (pattern's `default_blend`) |
| Column splits + weights | Recipe decoration (handled by style CSS on Card/Statistic/DataTable) |
| Responsive collapse breakpoints | Content decisions (labels, data, icons) |
| Page container atoms | Skeleton structure (sidebar, nav) |

### Default Blends in Archetypes

Archetypes provide `default_blend` per page — the domain-typical spatial arrangement. During CLARIFY, the LLM copies `default_blend` into the Essence's `blend`, then customizes. Essence `blend` always wins.

---

## Monochrome Palette

The `palette: 'monochrome'` personality trait in `derive.js` derives all 7 role colors from a single primary hue. Used by the Command Center style.

Derivation strategy (from primary H/S/L):
- accent: H+15°, S×0.8, L+8
- tertiary: H-15°, S×0.7, L-5
- success: H+10°, S×0.9, L+12
- warning: H-8°, S×1.1, L+5
- error: H-20°, S×1.2, L-3
- info: H+5°, S×0.6, L+15

All shifts within ±20° of base hue. Distinguishability via lightness/saturation. WCAG AA validated via `validateContrast()`.

---

## Style Selection Heuristics

When the user hasn't specified a style, use these domain signals:

| Domain | Recommended Style | Mode | Shape | Reasoning |
|--------|------------------|------|-------|-----------|
| SaaS / Dashboard | `clean` or `auradecantism` | `dark` | `rounded` | Data density needs neutral chrome; dark reduces eye strain for long sessions |
| E-commerce | `clean` | `light` | `rounded` | Products need accurate color rendering; light mode builds trust |
| Portfolio / Agency | `auradecantism` or `glassmorphism` | `dark` | `rounded` | Visual impact and brand differentiation; dark mode feels premium |
| Content / Blog | `clean` | `auto` | `rounded` | Readability first; auto mode respects reader preference |
| Enterprise / Internal | `clean` | `auto` | `sharp` | Professional, familiar; sharp corners signal precision |

## Character Trait Clusters

Character traits map to spatial and motion decisions. Three clusters cover most projects:

| Cluster | Traits | Density | Section Padding | Content Gap | Motion |
|---------|--------|---------|-----------------|-------------|--------|
| **Spacious** | minimal, elegant, premium, editorial | Comfortable | `_py16`–`_py24` | `_gap6`–`_gap8` | Slow, subtle |
| **Balanced** | modern, professional, friendly, clean | Default | `_py8`–`_py12` | `_gap4`–`_gap6` | Standard |
| **Compact** | tactical, dense, technical, efficient | Dense | `_py4`–`_py6` | `_gap2`–`_gap3` | Fast, minimal |

Pick the cluster closest to the user's Character words, then use its spatial values as starting points for the Clarity profile.

## Tasting Notes

A tasting-notes file (`decantr.tasting-notes.md`) is an optional append-only session log that tracks decisions made during the Decantation Process.

### Format

```markdown
## [DATE] — [STAGE]

**Changes:** What was added, modified, or decided
**Decisions:** Key choices and their reasoning
**Cork:** Any Essence constraints applied or conflicts flagged
```

### Rules

- **Append-only** — never edit previous entries
- **One entry per session** — each conversation adds at most one entry
- **Created during CLARIFY** — first entry documents Essence crystallization
- **Updated during AGE** — subsequent sessions append entries documenting drift checks and evolution
- **Location:** Project root, alongside `decantr.essence.json`

---

**See also:** `reference/spatial-guidelines.md`, `reference/style-system.md`, `reference/registry-consumption.md`, `reference/atoms.md`
