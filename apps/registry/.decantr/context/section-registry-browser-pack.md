# Section Pack

**Objective:** Implement the registry-browser section using the compiled top-nav-main shell contract.
**Target:** nextjs (nextjs)
**Scope:** pages=homepage, browse, browse-type, detail, profile | patterns=search-filter-bar, content-card-grid, kpi-grid, content-detail-hero, json-viewer, detail-header, activity-feed

## Section Contract
- Section: registry-browser
- Role: primary
- Shell: top-nav-main
- Theme: luminarum (dark)
- Features: search, pagination
- Description: Public content browsing for a design registry. Search, filter, and explore patterns, themes, blueprints, archetypes, and shells.

## Section Routes
- / -> homepage [search-filter-bar, content-card-grid, kpi-grid]
- /browse -> browse [search-filter-bar, content-card-grid]
- /browse-type -> browse-type [search-filter-bar, content-card-grid]
- /detail -> detail [content-detail-hero, json-viewer]
- /profile -> profile [detail-header, content-card-grid, activity-feed]

## Required Setup
- Use the declared section routes as the source of truth for this slice of the app.
- Keep the section shell consistent unless the task explicitly changes the shell contract.

## Allowed Vocabulary
- registry-browser
- primary
- top-nav-main
- luminarum
- dark
- search
- pagination
- search-filter-bar
- content-card-grid
- kpi-grid
- content-detail-hero
- json-viewer
- detail-header
- activity-feed

## Success Checks
- Section pages and routes remain coherent with the compiled topology. [error]
- The section shell contract stays consistent across its routes. [error]
- Primary section patterns are represented without adding off-contract filler sections. [warn]

## Token Budget
- Target: 1400
- Max: 2200
- Prefer route summaries over repeated prose.
- Use compact vocabulary lists instead of large reference tables.
- Include only task-relevant examples and checks.
