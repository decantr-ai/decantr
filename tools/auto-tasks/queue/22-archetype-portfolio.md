---
type: enrich
name: archetype-portfolio
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

## Task: Create Portfolio Archetype

Create the `portfolio` archetype JSON for personal portfolio / creative showcase projects.

### Step 1: Study existing archetypes

Read any existing archetype files in `content/archetypes/` or `content/core/archetypes/`. Match their schema.

### Step 2: Create `content/archetypes/portfolio.json`

The portfolio archetype is for creative professionals showcasing their work. Create with:

```json
{
  "id": "portfolio",
  "name": "Portfolio",
  "description": "Personal portfolio for showcasing projects, skills, and professional background",
  "default_carafe": "top-nav-main",
  "default_recipe": "auradecantism",
  "character_suggestions": ["creative", "minimal", "elegant"],
  "tannin_suggestions": ["analytics", "contact-form"],
  "pages": [
    {
      "id": "home",
      "name": "Home",
      "path": "/",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "hero", "preset": "landing" },
        { "pattern": "card-grid", "preset": "content", "as": "featured-projects" },
        "cta-section"
      ]
    },
    {
      "id": "project-detail",
      "name": "Project Detail",
      "path": "/project/:id",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "detail-header", "preset": "standard" },
        "cta-section"
      ]
    },
    {
      "id": "about",
      "name": "About",
      "path": "/about",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "hero", "preset": "split" },
        "activity-feed"
      ]
    },
    {
      "id": "contact",
      "name": "Contact",
      "path": "/contact",
      "carafe": "top-nav-main",
      "default_blend": [
        { "pattern": "form-sections", "preset": "creation" }
      ]
    }
  ]
}
```

Adjust to match the exact schema used by existing archetypes.

### Step 3: Add to content index if applicable

### Step 4: Write tests

- Archetype JSON is valid
- Has 4 pages: home, project-detail, about, contact
- Each page has default_blend
- Pattern presets reference valid presets
- Registry resolver can load the archetype

### Acceptance Criteria
- [ ] `content/archetypes/portfolio.json` exists with valid schema
- [ ] 4 pages: home, project-detail, about, contact
- [ ] Hero uses split preset on about page
- [ ] Form-sections uses creation preset on contact page
- [ ] Registry resolver can find and load the archetype
- [ ] All tests pass
