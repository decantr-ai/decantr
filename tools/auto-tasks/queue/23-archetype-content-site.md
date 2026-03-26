---
type: enrich
name: archetype-content-site
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

## Task: Create Content Site Archetype

Create the `content-site` archetype JSON for blog/magazine/documentation-style sites.

### Step 1: Study existing archetypes

Read any existing archetype files in `content/archetypes/` or `content/core/archetypes/`. Match their schema.

### Step 2: Create `content/archetypes/content-site.json`

The content-site archetype is for blogs, magazines, and content-heavy sites. Create with:

```json
{
  "id": "content-site",
  "name": "Content Site",
  "description": "Blog, magazine, or documentation site with article listings, categories, and search",
  "default_carafe": "top-nav-main",
  "default_recipe": "auradecantism",
  "character_suggestions": ["editorial", "readable", "clean"],
  "tannin_suggestions": ["search", "analytics", "rss"],
  "pages": [
    {
      "id": "home",
      "name": "Home",
      "path": "/",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "hero", "preset": "landing" },
        { "pattern": "card-grid", "preset": "content", "as": "latest-articles" }
      ]
    },
    {
      "id": "article",
      "name": "Article",
      "path": "/article/:slug",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "detail-header", "preset": "standard" }
      ],
      "notes": "Article body content is rendered below the detail-header. Generator should emit a prose content area."
    },
    {
      "id": "categories",
      "name": "Categories",
      "path": "/categories",
      "carafe": "top-nav-main",
      "default_blend": [
        { "cols": ["filter-bar", "card-grid"], "at": "lg", "span": { "card-grid": 3 } }
      ],
      "notes": "Filter bar and card-grid are wired for search/filter signals"
    }
  ]
}
```

Adjust to match the exact schema of existing archetypes.

### Step 3: Add to content index if applicable

### Step 4: Write tests

- Archetype JSON is valid
- Has 3 pages: home, article, categories
- Categories page has wired filter-bar + card-grid
- Article page uses detail-header
- Registry resolver can load the archetype

### Acceptance Criteria
- [ ] `content/archetypes/content-site.json` exists with valid schema
- [ ] 3 pages: home, article, categories
- [ ] Categories page uses cols layout with filter-bar + card-grid
- [ ] Article page uses detail-header[standard]
- [ ] Registry resolver can find and load the archetype
- [ ] All tests pass
