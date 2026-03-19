# The Essence File

The Essence file (`decantr.essence.json`) is your project's DNA — a single source of truth that captures everything about your application's identity, structure, and behavior.

## Why Essence?

Traditional frameworks scatter configuration across dozens of files. Decantr consolidates your project's identity into one file that both humans and AI can read:

- **AI understands it** — The structured format lets AI assistants generate consistent code
- **Prevents drift** — Cork rules enforce alignment between code and intent
- **Single source of truth** — No more hunting through configs to understand a project

## File Location

The Essence file lives at your project root:

```
my-app/
├── decantr.essence.json   ← Here
├── src/
├── public/
└── package.json
```

---

## Core Fields

### terroir

The domain archetype — what kind of application you're building.

```json
{
  "terroir": "saas-dashboard"
}
```

Available archetypes: `saas-dashboard`, `ecommerce`, `portfolio`, `documentation`, `blog`, `landing`, `admin-panel`, `social-platform`

Each archetype comes with default patterns, page structures, and recommended blends.

### vintage

The visual identity — style, color mode, recipe, and shape.

```json
{
  "vintage": {
    "style": "auradecantism",
    "mode": "dark",
    "recipe": "auradecantism",
    "shape": "rounded"
  }
}
```

- **style** — Visual language (`auradecantism`, `clean`, `glassmorphism`)
- **mode** — Color scheme (`dark`, `light`, `auto`)
- **recipe** — Decoration rules for the style
- **shape** — Border radius preference (`sharp`, `rounded`, `pill`)

### character

Brand personality traits that influence spacing, density, and tone.

```json
{
  "character": ["professional", "data-rich"]
}
```

Character traits map to a **Clarity profile** that determines spacing throughout the app.

### vessel

Application type and routing strategy.

```json
{
  "vessel": {
    "type": "spa",
    "routing": "hash"
  }
}
```

- **type** — `spa` (single-page app) or `ssr` (server-side rendered)
- **routing** — `hash` (#/path) or `history` (/path)

### structure

The pages/views in your application with their layouts and patterns.

```json
{
  "structure": [
    {
      "id": "overview",
      "skeleton": "sidebar-main",
      "blend": ["kpi-grid", "data-table"]
    },
    {
      "id": "catalog",
      "skeleton": "top-nav-main",
      "blend": [
        { "pattern": "card-grid", "preset": "product", "as": "product-grid" }
      ]
    }
  ]
}
```

- **id** — Page identifier (becomes route)
- **skeleton** — Layout type (`sidebar-main`, `top-nav-main`, `full-bleed`)
- **blend** — Array of patterns to compose the page

### tannins

Functional systems integrated into the app.

```json
{
  "tannins": ["auth", "realtime-data", "search"]
}
```

Available tannins: `auth`, `auth-enterprise`, `realtime-data`, `search`, `payments`, `analytics`, `i18n`

### cork

Drift prevention rules that enforce consistency.

```json
{
  "cork": {
    "enforce_style": true,
    "enforce_recipe": true,
    "mode": "maintenance"
  }
}
```

- **enforce_style** — Prevent style changes without explicit approval
- **enforce_recipe** — Prevent decoration changes
- **mode** — `creative` (flexible), `guided` (structure enforced), `maintenance` (strict)

### clarity

Spacing and density configuration.

```json
{
  "clarity": {
    "density": "comfortable",
    "content_gap": "_gap4"
  }
}
```

---

## Complete Example

```json
{
  "version": "1.0.0",
  "terroir": "saas-dashboard",
  "vintage": {
    "style": "auradecantism",
    "mode": "dark",
    "recipe": "auradecantism",
    "shape": "rounded"
  },
  "character": ["professional", "data-rich"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [
    {
      "id": "overview",
      "skeleton": "sidebar-main",
      "blend": ["kpi-grid", "chart-grid", "data-table"]
    },
    {
      "id": "analytics",
      "skeleton": "sidebar-main",
      "blend": ["filter-bar", "chart-grid"]
    },
    {
      "id": "users",
      "skeleton": "sidebar-main",
      "blend": ["filter-bar", "data-table"]
    },
    {
      "id": "settings",
      "skeleton": "sidebar-main",
      "blend": ["form-sections"]
    }
  ],
  "tannins": ["auth", "realtime-data"],
  "cork": {
    "enforce_style": true,
    "enforce_recipe": true,
    "mode": "maintenance"
  },
  "clarity": {
    "density": "comfortable",
    "content_gap": "_gap4"
  }
}
```

---

## Simple vs Sectioned

### Simple (Single Domain)

Use when your entire app shares the same terroir and vintage:

```json
{
  "terroir": "saas-dashboard",
  "vintage": { "style": "auradecantism", "mode": "dark" },
  "structure": [...]
}
```

### Sectioned (Multi-Domain)

Use when different parts of your app need different styles or archetypes:

```json
{
  "vessel": { "type": "spa", "routing": "hash" },
  "character": ["professional", "technical"],
  "sections": [
    {
      "id": "marketing",
      "path": "/",
      "terroir": "landing",
      "vintage": { "style": "glassmorphism", "mode": "dark" },
      "structure": [{ "id": "home", "blend": ["hero", "features"] }]
    },
    {
      "id": "app",
      "path": "/app",
      "terroir": "saas-dashboard",
      "vintage": { "style": "clean", "mode": "light" },
      "structure": [{ "id": "dashboard", "blend": ["kpi-grid"] }]
    }
  ],
  "shared_tannins": ["auth"]
}
```

---

## Validation

Validate your Essence file at any time:

```bash
npx decantr validate
```

This checks for:
- Valid archetype references
- Valid pattern names in blends
- Consistent style/recipe pairing
- Required fields present
