---
type: enrich
name: archetype-ecommerce
---

You are running in fully autonomous mode on the Decantr monorepo at /Users/davidaimi/projects/decantr-new.
Do NOT use EnterPlanMode or AskUserQuestion tools. Do NOT add Co-Authored-By lines to commits.
Make reasonable decisions and document them in code comments prefixed with // AUTO:

## Monorepo Structure
- packages/essence-spec/ — Essence v2 types, validator, density, guard
- packages/registry/ — Content resolver, pattern presets, wiring rules
- packages/generator-core/ — IR types, tree builder, resolution, pipeline
- packages/generator-decantr/ — Decantr-native code emitter
- packages/generator-react/ — React + Tailwind + shadcn/ui emitter
- packages/cli/ — CLI commands (validate, generate, init, registry)
- packages/mcp-server/ — MCP server for AI tools
- content/ — Registry content (patterns/, archetypes/, recipes/, core/)
- examples/ — Example essence files

## Workflow
1. Read relevant source files to understand current state
2. Implement the task
3. Write or update tests
4. Run tests: cd /Users/davidaimi/projects/decantr-new && pnpm test
5. Fix any failures
6. Commit with descriptive message

## Task: Create E-commerce Archetype

Create the `ecommerce` archetype JSON that defines the standard page structure for online store projects.

### Step 1: Study existing archetypes

Read any existing archetype files in `content/archetypes/` or `content/core/archetypes/`. Read `packages/registry/src/` to understand how archetypes are resolved. Read the essence-spec to understand how `terroir` maps to archetypes.

### Step 2: Create `content/archetypes/ecommerce.json`

The ecommerce archetype defines a standard online store. Create with:

```json
{
  "id": "ecommerce",
  "name": "E-commerce Store",
  "description": "Online store with product catalog, search, detail pages, and cart",
  "default_carafe": "top-nav-main",
  "default_recipe": "auradecantism",
  "character_suggestions": ["modern", "trustworthy", "clean"],
  "tannin_suggestions": ["auth", "payments", "search", "analytics"],
  "pages": [
    {
      "id": "home",
      "name": "Home",
      "path": "/",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "hero", "preset": "landing" },
        { "pattern": "card-grid", "preset": "collection", "as": "featured-collections" },
        { "pattern": "card-grid", "preset": "product", "as": "trending-products" },
        "cta-section"
      ]
    },
    {
      "id": "catalog",
      "name": "Catalog",
      "path": "/catalog",
      "carafe": "top-nav-main",
      "default_blend": [
        { "cols": ["filter-bar", "card-grid"], "at": "lg", "span": { "card-grid": 3 } }
      ],
      "notes": "Filter bar and card-grid are wired for search/filter signals"
    },
    {
      "id": "product-detail",
      "name": "Product Detail",
      "path": "/product/:id",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "detail-header", "preset": "standard" },
        { "pattern": "form-sections", "preset": "structured", "as": "product-options" },
        { "pattern": "card-grid", "preset": "product", "as": "related-products" }
      ]
    },
    {
      "id": "cart",
      "name": "Cart",
      "path": "/cart",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "data-table", "preset": "standard", "as": "cart-items" },
        "cta-section"
      ]
    }
  ]
}
```

Adjust the structure based on what you learn from existing archetype files — match their exact schema.

### Step 3: Add to content index

If there's a content index file (e.g., `content/index.json` or similar manifest), add the ecommerce archetype to it.

### Step 4: Write tests

- Archetype JSON is valid and parseable
- Has all 4 pages: home, catalog, product-detail, cart
- Each page has a default_blend
- Pattern references use correct preset names
- Archetype can be resolved by the registry resolver
- Wiring works on the catalog page (filter-bar + card-grid)

### Acceptance Criteria
- [ ] `content/archetypes/ecommerce.json` exists with valid schema
- [ ] 4 pages: home, catalog, product-detail, cart
- [ ] Each page has default_blend with correct patterns
- [ ] Pattern presets match existing pattern definitions
- [ ] Archetype registered in content index (if applicable)
- [ ] Registry resolver can find and load the archetype
- [ ] All tests pass
