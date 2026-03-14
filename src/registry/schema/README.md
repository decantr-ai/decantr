# Decantr Registry Extension Schemas

Decantr's registry (patterns, recipes, archetypes, traits) is community-extensible. This document describes the JSON schemas for each registry type so you can create and share your own.

## Discovery Mechanism

1. **Local overrides:** Place files in your project's `src/registry/patterns/`, `src/registry/recipe-*.json`, or `src/registry/archetypes/`
2. **NPM packages:** Packages with `"decantr-registry": true` in `package.json` are auto-scanned
3. **CLI discovery:** `decantr generate` merges local + npm registries (local takes priority)

---

## Pattern Schema

**Location:** `src/registry/patterns/{id}.json`

```json
{
  "$schema": "https://decantr.ai/schemas/pattern.v1.json",
  "id": "my-pattern",
  "name": "My Pattern",
  "description": "When and where to use this pattern.",
  "components": ["ComponentA", "ComponentB"],
  "default_blend": {
    "layout": "stack | grid | row | flex",
    "atoms": "_flex _col _gap4 _p4",
    "slots": {
      "slot-name": "Description of what goes in this slot"
    }
  },
  "recipe_overrides": {
    "recipe-id": {
      "wrapper": "css-class-name",
      "atoms": "additional-atoms",
      "notes": "How to adapt this pattern for the recipe"
    }
  },
  "code": {
    "imports": "import { tags } from 'decantr/tags';...",
    "example": "function MyPattern() { ... }"
  }
}
```

### Required Fields
- `id` — Unique kebab-case identifier
- `name` — Human-readable name
- `description` — When/where/why to use this pattern
- `components` — Array of component names used (from `decantr/components` or `decantr/chart`)
- `default_blend` — Layout specification
  - `layout` — One of: `stack` (vertical), `grid` (responsive cells), `row` (horizontal), `flex` (flexible)
  - `atoms` — Space-separated atom classes for the container
  - `slots` — Named semantic regions with descriptions

### Optional Fields
- `recipe_overrides` — Per-recipe visual customizations
- `code.imports` — Import statements for the example
- `code.example` — Complete working code example (highest-leverage field for LLM code generation)

---

## Recipe Schema

**Location:** `src/registry/recipe-{id}.json`

```json
{
  "$schema": "https://decantr.ai/schemas/recipe.v1.json",
  "id": "my-recipe",
  "name": "My Recipe",
  "style": "auradecantism",
  "mode": "dark",
  "description": "Visual language description.",
  "setup": "import { setStyle, setMode } from 'decantr/css';\nsetStyle('my-style');\nsetMode('dark');",
  "decorators": {
    "class-name": "What this decorator does and where to apply it"
  },
  "compositions": {
    "panel": {
      "description": "How to compose a panel with this recipe",
      "example": "const { div } = tags;\ndiv({ class: css('...') }, ...)"
    },
    "card": {
      "wraps": "Card",
      "description": "How to style a Card component",
      "example": "..."
    }
  }
}
```

### Required Fields
- `id` — Unique kebab-case identifier
- `name` — Human-readable name
- `style` — Which Decantr style this recipe is designed for
- `mode` — Preferred color mode (`light`, `dark`, `auto`)
- `description` — Visual language overview

### Required Compositions (10 standard)
Every recipe should include these 10 compositions for consistency:
`panel`, `card`, `kpi`, `table`, `form`, `sidebar`, `layout`, `alert`, `modal`, `chart`

### Optional Fields
- `setup` — Code to initialize the style/mode
- `decorators` — Custom CSS classes provided by the recipe's style
- `compositions.*.wraps` — Which standard component this composition wraps

---

## Archetype Schema

**Location:** `src/registry/archetypes/{id}.json`

```json
{
  "$schema": "https://decantr.ai/schemas/archetype.v1.json",
  "id": "my-archetype",
  "name": "My Archetype",
  "description": "Domain overview.",
  "suggested_vintage": {
    "styles": ["clean", "auradecantism"],
    "modes": ["light", "auto"]
  },
  "tannins": ["auth", "search", "analytics"],
  "pages": [
    {
      "id": "home",
      "skeleton": "top-nav-main",
      "default_blend": ["hero", { "cols": ["product-grid"], "at": "md" }, "cta-section"]
    }
  ]
}
```

### Required Fields
- `id` — Unique kebab-case identifier
- `name` — Human-readable domain name
- `description` — What kind of application this archetype represents
- `pages` — Array of page definitions with `id`, `skeleton`, and `default_blend`

### Blend Format
Each item in `default_blend` is either:
- `"pattern-id"` — Full-width pattern row
- `{ "cols": ["a", "b"], "at": "lg" }` — Equal-width side-by-side, collapse below breakpoint
- `{ "cols": ["a", "b"], "span": { "a": 3 }, "at": "md" }` — Weighted columns (a=3fr, b=1fr)

---

## Trait Schema

**Location:** `src/registry/architect/traits.json`

Traits are the compositional building blocks the LLM uses to dynamically compose archetypes.

```json
{
  "traits": {
    "trait-id": {
      "description": "What this UI trait provides",
      "triggers": ["keyword1", "keyword2"],
      "skeleton": "skeleton-id or null",
      "patterns": ["pattern-id"],
      "co-occurs": {
        "other-trait-id": 0.85
      }
    }
  },
  "composites": {
    "composite-id": {
      "description": "Pre-packaged trait combination",
      "traits": ["trait-a", "trait-b", "trait-c"],
      "suggested_vintage": { "style": "clean", "mode": "light" }
    }
  }
}
```

### Trait Fields
- `triggers` — Keywords that activate this trait from user intent
- `skeleton` — Optional skeleton to use when this trait is the primary layout driver
- `patterns` — Patterns this trait maps to
- `co-occurs` — Other traits that commonly appear alongside, with affinity weight (0.0-1.0)

### Composite Fields
- `traits` — Ordered list of trait IDs that form this composite
- `suggested_vintage` — Recommended style/mode for this composite

---

## Publishing a Registry Package

1. Create your patterns/recipes/archetypes following the schemas above
2. Add `"decantr-registry": true` to your `package.json`
3. Place registry files under `src/registry/` in your package
4. Publish to npm

Users install your package and Decantr automatically discovers the registry files.
