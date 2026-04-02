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
| `@decantr/css` | `packages/css/` | Framework-agnostic CSS atoms runtime for layout utilities |
| `@decantr/ui` | `packages/ui/` | UI framework — signal-based reactivity, atomic CSS, components (TypeScript, tree-scoped context) |
| `@decantr/ui-chart` | `packages/ui-chart/` | Charting library — SVG, Canvas, WebGPU renderers |
| `@decantr/vite-plugin` | `packages/vite-plugin/` | Vite plugin for real-time design drift detection |
| `@decantr/ui-catalog` | `packages/ui-catalog/` | Component stories, demo definitions, and metadata |
| `decantr` | `packages/cli/` | CLI for project initialization, registry queries, validation |

## Apps

| App | Path | Description |
|-----|------|-------------|
| `decantr-api` | `apps/api/` | Registry API (Hono + Supabase + Stripe) |
| `decantr-web` | `apps/web/` | Registry web app (Next.js + Supabase) |
| `decantr-workbench` | `apps/workbench/` | Component dev workbench (Decantr-native SPA) |

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
| DECANT | Compose | Resolve page layouts from patterns and themes |
| SERVE | Generate | Produce code (done by user's AI, not Decantr) |
| AGE | Guard | Validate changes against the spec |
| Vintage | Theme | Style, mode, shape |
| Vignette | Blueprint | A composed app template |
| Archetype | Archetype (kept) | App-level template (e.g., dashboard) |
| Pattern | Pattern (kept) | Composable UI section |
| Carafe | Shell | App shell layout |
| Blend | Layout | Page composition |
| Character | Personality | Brand traits |
| Clarity | Density | Spatial density |
| Tannins | Features | Functional systems (auth, search, payments) |
| Cork | Guard | Drift prevention rules |
| Vessel | Platform | SPA/MPA, routing mode |
| Plumbing | Wiring | Cross-pattern state sharing |

## Content Architecture

Content lives in **decantr-content** (separate repository) and is the source of truth for all `@official` registry content.

**Publishing pipeline:**
```
decantr-content repo (JSON files)
    → push to main triggers GitHub Actions
    → validate.js checks all files
    → scripts/sync-to-registry.js POSTs each item to POST /v1/admin/sync
    → Supabase content table (namespace=@official, status=published)
    → API serves via GET /v1/:type/:namespace/:slug
```

**Content resolution fallback chains:**
- **CLI single items** (`get`): Custom → API → Cache
- **CLI lists** (`list`): API → Cache → merge Custom
- **CLI `get` fallback**: API → Cache → Bundled
- **MCP Server**: API only (via `RegistryAPIClient`)
- **CLI Bundled**: Offline fallback defaults in `packages/cli/src/bundled/`

```
packages/cli/src/bundled/    # Offline fallback content (not from RegistryClient)
  blueprints/                # Default blueprint for offline init
  patterns/                  # Core patterns (hero, nav-header, footer, etc.)
  themes/                    # Default theme
  shells/                    # Default shell layout
```

## Design Pipeline

The seven stages of the Design Pipeline:

1. **Intent** -- User describes what they want to build.
2. **Interpret** -- Parse intent into structured form.
3. **Decompose** -- Split into theme, structure, features.
4. **Specify** -- Write `decantr.essence.json`.
5. **Compose** -- Resolve layouts from patterns and themes.
6. **Generate** -- User's AI generates code from the composition.
7. **Guard** -- Validate every change against the spec. Prevent drift.

## Guard Rules

The guard system (`packages/essence-spec/src/guard.ts`) enforces seven rules, ordered by DNA-first (matching the DECANTR.md template):

**DNA guards (errors):**

1. **Style guard** -- Code must use the theme specified in the Essence. Changing themes without updating the Essence is a violation.
2. **Density guard** -- Content gap values must match the Essence density setting. Strict mode only (warning severity). In v3 essences, per-page `dna_overrides.density` is respected.
3. **Accessibility guard** -- Code must meet the WCAG level specified in the Essence. Enforced in both `guided` and `strict` modes.
4. **Theme-mode compatibility** -- The theme/mode combination must be compatible (e.g., a dark-only theme rejects `mode: "light"`). Checked when `themeRegistry` is provided.

**Blueprint guards (warnings in v3, auto-fixable):**

5. **Structure guard** -- Pages referenced in code must exist in the Essence structure. Generating code for an undefined page is a violation.
6. **Layout guard** -- Pattern order in a page must match the Essence layout spec. Strict mode only.
7. **Pattern existence** -- All patterns referenced in layouts must exist in the registry. Checked when `patternRegistry` is provided. Includes fuzzy "did you mean?" suggestions.

Guard modes: `creative` (no enforcement), `guided` (rules 1, 3, 4, 5, 7), `strict` (all rules).

**v3 enforcement fields:** DNA violations are controlled by `dna_enforcement` (`'error'` | `'warn'` | `'off'`). Blueprint violations are controlled by `blueprint_enforcement` (`'warn'` | `'off'`). In v3, Blueprint violations are warnings (not errors) and are auto-fixable.

## Build and Test

```bash
pnpm install        # Install all dependencies
pnpm build          # Build all packages (essence-spec and registry first, then core and mcp-server)
pnpm test           # Run all tests via vitest
pnpm lint           # Type-check with tsc --noEmit
pnpm clean          # Remove all dist/ directories

pnpm --filter @decantr/ui build    # Build @decantr/ui (TypeScript → JS + .d.ts)
pnpm --filter @decantr/ui test     # Run @decantr/ui tests
pnpm --filter @decantr/ui typecheck # Type-check without emit
```

Requires Node.js >= 20 and pnpm >= 9.

## MCP Server Tools

The MCP server (`@decantr/mcp-server`) exposes 13 tools:

| Tool | Description |
|------|-------------|
| `decantr_read_essence` | Read the current `decantr.essence.json` from the working directory |
| `decantr_validate` | Validate an essence file against the schema and guard rules |
| `decantr_search_registry` | Search the content registry for patterns, archetypes, themes, and shells |
| `decantr_resolve_pattern` | Get full pattern details including layout spec, components, and presets |
| `decantr_resolve_archetype` | Get archetype details including pages, features, and suggested theme |
| `decantr_resolve_blueprint` | Get a blueprint with archetype list, theme, personality, and page structure |
| `decantr_suggest_patterns` | Given a page description, suggest matching patterns from the registry |
| `decantr_check_drift` | Check if code changes violate the Essence spec (guard rule violations) |
| `decantr_create_essence` | Generate a valid Essence spec skeleton from a project description |
| `decantr_accept_drift` | Resolve drift violations by accepting, scoping, rejecting, or deferring |
| `decantr_update_essence` | Apply structured updates to DNA or Blueprint layers |
| `decantr_get_section_context` | Get self-contained context for a specific blueprint section (guard rules, theme tokens, visual treatments, pattern specs) |
| `decantr_component_api` | Query @decantr/ui component API (props, usage, examples) |

## CLI Commands

```bash
decantr init              # Initialize a new Decantr project
decantr status            # Show project status
decantr sync              # Sync registry from API
decantr audit             # Audit project for issues
decantr migrate           # Migrate essence file to latest schema version
decantr check             # Detect and fix drift issues
decantr sync-drift        # Sync drift resolutions to essence
decantr validate [path]   # Validate essence file
decantr search <query>    # Search registry
decantr suggest           # Suggest patterns for a page
decantr get <type> <id>   # Get full item details (patterns, themes, shells, etc.)
decantr list <type>       # List all items of type
decantr theme             # Theme management
decantr create            # Create a new content item
decantr publish           # Publish content to the registry
decantr login             # Authenticate with the registry
decantr logout            # Log out of the registry
decantr upgrade           # Check for content updates from registry
decantr help              # Show help
```

## Documentation

| File | Purpose |
|------|---------|
| `docs/css-scaffolding-guide.md` | Full CSS implementation spec (@layer structure, theme scoping, color-scheme, variable naming). Generated DECANTR.md includes a condensed version; this is the expanded reference. |
| `docs/plans/` | Implementation plans and specs for major features |
| `docs/architecture/` | Architecture diagrams and flow documentation |
| `docs/audit/` | Audit reports (archived after implementation) |
| `docs/specs/` | Design specifications for major features |

## Development Notes

- Do not commit `decantr.essence.json` or `DECANTR.md` files in package directories (these are test artifacts)
- The `.gitignore` excludes `packages/*/decantr.essence.json` and `packages/*/.decantr/`
