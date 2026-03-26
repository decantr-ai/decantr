# CLAUDE.md -- Decantr

Do not add Co-Authored-By lines to commits.

## Project

Decantr is a Design Intelligence API. It is a structured schema (like OpenAPI for UI) and design intelligence layer that AI coding assistants use to generate consistent, production-quality web applications. Decantr does not generate code.

## Packages

| Package | Path | Description |
|---------|------|-------------|
| `@decantr/essence-spec` | `packages/essence-spec/` | Schema, validator, guard rules, TypeScript types |
| `@decantr/registry` | `packages/registry/` | Content resolver, wiring rules, pattern preset resolution |
| `@decantr/core` | `packages/core/` | Design Pipeline IR engine |
| `@decantr/mcp-server` | `packages/mcp-server/` | MCP server exposing tools to AI assistants |

## Terminology

Wine metaphors are used in branding only. Code and schema use normalized terms.

| Wine Term | Normalized Term | Meaning |
|-----------|----------------|---------|
| Essence | Essence (kept) | The spec file (`decantr.essence.json`) |
| Essence Pipeline | Design Pipeline | The seven-stage methodology |
| POUR | Intent | User expresses what they want |
| TASTE | Interpret | System interprets intent into structured form |
| SETTLE | Decompose | Break intent into layers |
| CLARIFY | Specify | Write the machine-readable spec |
| DECANT | Compose | Resolve page layouts from patterns and recipes |
| SERVE | Generate | Produce code (done by user's AI, not Decantr) |
| AGE | Guard | Validate changes against the spec |
| Vintage | Theme | Style, mode, shape |
| Vignette | Blueprint | A composed app template |
| Archetype | Archetype (kept) | App-level template (e.g., dashboard) |
| Pattern | Pattern (kept) | Composable UI section |
| Recipe | Recipe (kept) | Visual decoration rules |
| Carafe | Shell | App shell layout |
| Blend | Layout | Page composition |
| Character | Personality | Brand traits |
| Clarity | Density | Spatial density |
| Tannins | Features | Functional systems (auth, search, payments) |
| Cork | Guard | Drift prevention rules |
| Vessel | Platform | SPA/MPA, routing mode |
| Plumbing | Wiring | Cross-pattern state sharing |

## Content Directory

```
content/
  archetypes/     # 19 app archetypes (e.g., saas-dashboard.json, ecommerce.json)
  blueprints/     # 10 composed app templates
  patterns/       # 9 UI section patterns (e.g., kpi-grid.json, data-table.json)
  recipes/        # Visual decoration rules (currently empty)
  themes/         # 10 theme definitions (e.g., clean.json, glassmorphism.json)
  core/           # Core defaults (shells, base patterns, base recipes)
```

## Design Pipeline

The seven stages of the Design Pipeline:

1. **Intent** -- User describes what they want to build.
2. **Interpret** -- Parse intent into structured form.
3. **Decompose** -- Split into theme, structure, features.
4. **Specify** -- Write `decantr.essence.json`.
5. **Compose** -- Resolve layouts from patterns and recipes.
6. **Generate** -- User's AI generates code from the composition.
7. **Guard** -- Validate every change against the spec. Prevent drift.

## Guard Rules

The guard system (`packages/essence-spec/src/guard.ts`) enforces five rules:

1. **Style guard** -- Code must use the theme specified in the Essence. Changing themes without updating the Essence is a violation (error severity).
2. **Structure guard** -- Pages referenced in code must exist in the Essence structure. Generating code for an undefined page is a violation (error severity). Enforced in both `guided` and `strict` modes.
3. **Layout guard** -- Pattern order in a page must match the Essence layout spec. Strict mode only (error severity).
4. **Recipe guard** -- Visual recipe used in code must match the Essence recipe. Switching recipes without updating the Essence is a violation (error severity).
5. **Density guard** -- Content gap values must match the Essence density setting. Strict mode only (warning severity).

Guard modes: `creative` (no enforcement), `guided` (rules 1, 2, 4), `strict` (all rules).

## Build and Test

```bash
pnpm install        # Install all dependencies
pnpm build          # Build all packages (essence-spec and registry first, then core and mcp-server)
pnpm test           # Run all tests via vitest
pnpm lint           # Type-check with tsc --noEmit
pnpm clean          # Remove all dist/ directories
```

Requires Node.js >= 20 and pnpm >= 9.

## MCP Server Tools

The MCP server (`@decantr/mcp-server`) exposes 10 tools:

| Tool | Description |
|------|-------------|
| `decantr_read_essence` | Read the current `decantr.essence.json` from the working directory |
| `decantr_validate` | Validate an essence file against the schema and guard rules |
| `decantr_search_registry` | Search the content registry for patterns, archetypes, recipes, and themes |
| `decantr_resolve_pattern` | Get full pattern details including layout spec, components, and presets |
| `decantr_resolve_archetype` | Get archetype details including pages, features, and suggested theme |
| `decantr_resolve_recipe` | Get recipe decoration rules (shell styles, spatial hints, effects) |
| `decantr_resolve_blueprint` | Get a blueprint with archetype list, theme, personality, and page structure |
| `decantr_suggest_patterns` | Given a page description, suggest matching patterns from the registry |
| `decantr_check_drift` | Check if code changes violate the Essence spec (guard rule violations) |
| `decantr_create_essence` | Generate a valid Essence spec skeleton from a project description |
