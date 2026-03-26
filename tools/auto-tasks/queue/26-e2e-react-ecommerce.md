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

## React Quality Compliance

All generated React code MUST follow these Vercel React best practices (enforced by quality-rules.ts if it exists, otherwise enforce manually):

**CRITICAL — zero tolerance:**
- NO barrel imports (import from specific paths: `@/components/ui/button` not `@/components/ui`)
- NO inline component definitions (never define a component inside another component)
- React.lazy() for page imports in router files
- Suspense boundaries around lazy-loaded routes

**HIGH — zero tolerance:**
- Functional setState when new state depends on previous (`setCount(prev => prev + 1)` not `setCount(count + 1)`)
- No useEffect for derived state (use useMemo instead of useEffect + setState)
- Hoist non-primitive default props to module level (`const DEFAULT_ITEMS: Item[] = []` outside component)

**MEDIUM — fix if encountered:**
- Hoist static JSX to module level
- Use React.memo for components receiving complex props
- Use primitive values in useEffect dependency arrays

**After completing your implementation**, if `packages/generator-react/src/quality-rules.ts` exists, run:
```ts
import { validateReactOutput } from './quality-rules.js';
// Pass your generated files through validation
```
If it doesn't exist yet, manually verify the CRITICAL rules by reading your generated output.

Add to acceptance criteria: "Generated React code has zero CRITICAL or HIGH quality violations"

### Acceptance Criteria
- [ ] Ecommerce essence file exists in examples/
- [ ] E2e test created and passing
- [ ] 4 pages generated with correct patterns
- [ ] Top-nav-main shell (not sidebar)
- [ ] Catalog page has filter-bar + card-grid wiring
- [ ] Product detail has route parameter
- [ ] All shadcn imports valid
- [ ] All tests pass
