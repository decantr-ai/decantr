---
type: enrich
name: e2e-react-ecommerce
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

## Task: End-to-End Test — React E-commerce Generation

Generate an e-commerce project using the React target and verify correctness.

### Step 1: Create e-commerce essence (if not already existing)

Check if `examples/ecommerce/` exists. If not, create `examples/ecommerce/decantr.essence.json` using the ecommerce archetype:

```json
{
  "version": "1.0.0",
  "terroir": "ecommerce",
  "vintage": { "style": "auradecantism", "mode": "light", "recipe": "auradecantism", "shape": "rounded" },
  "character": ["modern", "trustworthy", "clean"],
  "vessel": { "type": "spa", "routing": "hash" },
  "structure": [
    { "id": "home", "carafe": "top-nav-main", "blend": [
      { "pattern": "hero", "preset": "landing" },
      { "pattern": "card-grid", "preset": "collection", "as": "featured-collections" },
      { "pattern": "card-grid", "preset": "product", "as": "trending-products" },
      "cta-section"
    ]},
    { "id": "catalog", "carafe": "top-nav-main", "blend": [
      "filter-bar",
      { "pattern": "card-grid", "preset": "product" }
    ]},
    { "id": "product-detail", "carafe": "top-nav-main", "blend": [
      { "pattern": "detail-header", "preset": "standard" },
      { "pattern": "card-grid", "preset": "product", "as": "related-products" }
    ]},
    { "id": "cart", "carafe": "top-nav-main", "blend": [
      { "pattern": "data-table", "preset": "standard" },
      "cta-section"
    ]}
  ],
  "tannins": ["auth", "payments", "search"],
  "cork": { "enforce_style": true, "enforce_recipe": true },
  "clarity": { "density": "comfortable", "content_gap": "_gap4" }
}
```

### Step 2: Create the e2e test

Create a test that:

1. Loads the ecommerce essence
2. Validates against essence spec
3. Runs the React generator pipeline
4. Verifies output:
   - **4 pages generated**: HomePage, CatalogPage, ProductDetailPage, CartPage
   - **top-nav-main shell**: NavigationMenu in App.tsx (not sidebar)
   - **Home page**: Contains hero pattern + two card-grid instances + cta-section
   - **Catalog page**: Contains filter-bar + card-grid[product] with wired search state
   - **Product detail page**: Contains detail-header + card-grid (related products)
   - **Cart page**: Contains data-table + cta-section
   - **Wiring**: Catalog page has shared search/filter state between filter-bar and card-grid
   - **Routing**: Product detail has `:id` route parameter
   - **Imports**: All shadcn imports are correct

### Step 3: Run and fix

Run the test. Fix any pipeline, generator, or content issues. Create stub patterns if needed.

### Acceptance Criteria
- [ ] Ecommerce essence file exists in examples/
- [ ] E2e test created and passing
- [ ] 4 pages generated with correct patterns
- [ ] Top-nav-main shell (not sidebar)
- [ ] Catalog page has filter-bar + card-grid wiring
- [ ] Product detail has route parameter
- [ ] All shadcn imports valid
- [ ] All tests pass
