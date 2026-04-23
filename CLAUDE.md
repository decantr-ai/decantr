# CLAUDE.md -- Decantr

Do not add Co-Authored-By lines to commits.

## Project

Decantr is a Design Intelligence API. It is a structured schema (like OpenAPI for UI) and design intelligence layer that AI coding assistants use to generate consistent, production-quality web applications. Decantr does not generate code -- the AI does.

Current strategic program: `docs/programs/2026-04-08-decantr-vnext-master-program.md`. A forward-looking successor architecture is tracked in `docs/audit/decantr-meta-alignment.md` (`decantr-meta` project, separate from this monorepo).

## Packages

| Package | Path | Description |
|---------|------|-------------|
| `@decantr/essence-spec` | `packages/essence-spec/` | Schema, validator, guard rules, TypeScript types (v2 + v3) |
| `@decantr/registry` | `packages/registry/` | Content resolver, wiring rules, pattern preset resolution |
| `@decantr/core` | `packages/core/` | Design Pipeline IR engine |
| `@decantr/mcp-server` | `packages/mcp-server/` | MCP server exposing tools to AI assistants (20 tools) |
| `@decantr/css` | `packages/css/` | Framework-agnostic CSS atoms runtime for layout utilities |
| `@decantr/verifier` | `packages/verifier/` | Shared verification, critique, and report-schema engine |
| `@decantr/vite-plugin` | `packages/vite-plugin/` | Vite plugin for real-time design drift detection |
| `decantr` | `packages/cli/` | CLI for project initialization, registry queries, validation |

## Apps

| App | Path | Description |
|-----|------|-------------|
| `decantr-api` | `apps/api/` | Registry API (Hono + Supabase + Stripe) |
| `decantr-registry` | `apps/registry/` | Registry web app (Next.js + Supabase) |
| `decantr-showcase` | `apps/showcase/` | ~40 blueprint scaffolds used as regression fixtures and harness test subjects (agent-marketplace, agent-studio, ai-copilot-shell, ecommerce, observability-platform, …). See `apps/showcase/manifest.json`. |

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

Content lives in **decantr-content** (separate repository at `/Users/davidaimi/projects/decantr-content`) and is the source of truth for all `@official` registry content.

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

## Essence Schemas

- **v2** (`docs/schemas/essence.v2.json`) -- legacy flat schema, still supported for migration
- **v3** (`docs/schemas/essence.v3.json`) -- current schema with DNA/Blueprint split, `dna_enforcement` / `blueprint_enforcement` fields, per-page `dna_overrides`

All resource schemas live in `docs/schemas/`.

## Content Schema Fields (v3)

Patterns, blueprints, themes, and archetypes carry enriched fields for visual intelligence:

| Field | Content Type | Description |
|-------|-------------|-------------|
| `visual_brief` | Pattern | 2-5 sentence visual description of the pattern |
| `composition` | Pattern | Component composition algebra expressions |
| `motion` | Pattern | Micro-interactions, transitions, ambient animations |
| `responsive` | Pattern | Mobile/tablet/desktop adaptation strategies |
| `accessibility` | Pattern | ARIA, keyboard, focus, screen reader patterns |
| `layout_hints` | Pattern | Freeform rendering guidance key-value pairs |
| `voice` | Blueprint | Copy/tone intelligence (CTA verbs, empty states, errors) |
| `personality` | Blueprint | Visual personality narrative (min 100 chars) |
| `responsive_strategy` | Blueprint | Global responsive breakpoint strategy |
| `decorator_definitions` | Theme | Structured decorator data (intent, properties, usage) |
| `internal_layout` | Shell | Semantic spatial specs per region (width, height, padding, gap, scroll) |
| `page_briefs` | Archetype | Per-page visual descriptions |
| `role` | Archetype | Section role: primary, gateway, public, auxiliary |

## Execution Packs

Compact, compiled contracts consumed by AI agents during scaffolding. Generated into a project's `.decantr/context/` directory by `decantr init` / `decantr registry compile-packs`. Schemas live in `docs/schemas/`.

| Pack | Schema | Purpose |
|------|--------|---------|
| scaffold-pack | `scaffold-pack.v1.json` | App-level contract: shell, theme, features, route map |
| section-*-pack | (section-level) | Per-section contract (shell dimensions, decorators, tokens) |
| page-*-pack | `page-pack.v1.json` | Per-route contract (patterns, voice, visual brief) |
| mutation-pack | `mutation-pack.v1.json` | Add/remove mutation contracts |
| review-pack | `review-pack.v1.json` | Review / critique flow contract |
| execution-pack-bundle | `execution-pack-bundle.v1.json` | Aggregate of all packs for a project |
| pack-manifest | `pack-manifest.v1.json` | Index of generated packs |

Related intelligence schemas: `content-intelligence.v1.json`, `registry-intelligence-summary.v1.json`, `project-audit-report.v1.json`, `file-critique-report.v1.json`, `public-content-{list,record,summary}.v1.json`.

## Section Context Enrichments

Section contexts (`.decantr/context/section-*.md`) include additional blocks generated from shell `internal_layout` data:

- **Quick Start** -- Summary block: shell name, primary region, key spatial dimensions
- **Shell Implementation** -- Full spatial layout block with region dimensions, scroll container designation, responsive behavior
- **Spacing Guide** -- Computed spacing values table mapping density tokens to pixel values for the section's shell regions
- **Layout Rules** -- Nesting anti-patterns in DECANTR.md:
  1. Never nest a scroll container inside another scroll container
  2. Never place a fixed/sticky element inside an overflow:hidden container
  3. Never use viewport units (vh/vw) inside a flex/grid child
  4. Never nest grid layouts more than 2 levels deep
  5. Never apply padding to a container that also uses gap for the same axis

## Design Pipeline

1. **Intent** -- User describes what they want to build.
2. **Interpret** -- Parse intent into structured form.
3. **Decompose** -- Split into theme, structure, features.
4. **Specify** -- Write `decantr.essence.json`.
5. **Compose** -- Resolve layouts from patterns and themes.
6. **Generate** -- User's AI generates code from the composition.
7. **Guard** -- Validate every change against the spec. Prevent drift.

## Guard Rules

The guard system (`packages/essence-spec/src/guard.ts`) enforces seven rules, ordered DNA-first.

**DNA guards (errors):**

1. **Style** -- Code must use the theme specified in the Essence.
2. **Density** -- Content gap values must match the Essence density setting. Strict mode only (warning severity). v3 respects per-page `dna_overrides.density`.
3. **Accessibility** -- Code must meet the WCAG level specified in the Essence. Enforced in `guided` and `strict`.
4. **Theme-mode compatibility** -- The theme/mode combination must be compatible. Checked when `themeRegistry` is provided.

**Blueprint guards (warnings in v3, auto-fixable):**

5. **Structure** -- Pages referenced in code must exist in the Essence structure.
6. **Layout** -- Pattern order in a page must match the Essence layout spec. Strict mode only.
7. **Pattern existence** -- All patterns referenced in layouts must exist in the registry. Includes fuzzy "did you mean?" suggestions.

Modes: `creative` (no enforcement), `guided` (1, 3, 4, 5, 7), `strict` (all).

**v3 enforcement fields:** DNA violations are controlled by `dna_enforcement` (`'error'` | `'warn'` | `'off'`); Blueprint violations by `blueprint_enforcement` (`'warn'` | `'off'`). In v3, Blueprint violations are warnings and are auto-fixable.

## Build and Test

```bash
pnpm install        # Install all dependencies
pnpm build          # Build active packages and product apps
pnpm test           # Run all tests via vitest
pnpm lint           # Type-check active product surfaces
pnpm clean          # Remove all dist/ directories
```

Requires Node.js >= 20 and pnpm >= 9.

## CSS Layer Cascade

All generated CSS uses `@layer` declarations:

```css
@layer reset, tokens, treatments, decorators, utilities, app;
```

- `reset` -- normalize/reset styles (global.css)
- `tokens` -- CSS custom properties from theme (tokens.css)
- `treatments` -- base treatment classes: d-interactive, d-surface, d-data, d-control, d-section, d-annotation, d-label
- `decorators` -- theme-specific decorator classes (e.g., carbon-card, carbon-glass)
- `utilities` -- personality-derived utility classes (e.g., neon-glow, mono-data, status-ring)
- `app` -- application-specific overrides

## MCP Server Tools

The MCP server (`@decantr/mcp-server`) exposes **20 tools** (authoritative list at `packages/mcp-server/src/tools.ts`).

**Core / essence:**
- `decantr_read_essence` -- Read the current `decantr.essence.json`
- `decantr_validate` -- Validate an essence against schema + guard rules
- `decantr_create_essence` -- Generate a valid Essence skeleton from a description
- `decantr_update_essence` -- Apply structured updates to DNA or Blueprint layers

**Registry lookup:**
- `decantr_search_registry` -- Search patterns, archetypes, themes, shells
- `decantr_resolve_pattern` -- Full pattern (layout, components, presets)
- `decantr_resolve_archetype` -- Archetype pages, features, suggested theme
- `decantr_resolve_blueprint` -- Blueprint archetype list, theme, personality, pages
- `decantr_suggest_patterns` -- Suggest patterns for a page description

**Drift / guard:**
- `decantr_check_drift` -- Check if code violates the Essence spec
- `decantr_accept_drift` -- Resolve drift (accept / scope / reject / defer)

**Context & Execution Packs:**
- `decantr_get_scaffold_context` -- App-level scaffold context
- `decantr_get_section_context` -- Per-section self-contained context
- `decantr_get_page_context` -- Per-route self-contained context
- `decantr_get_execution_pack` -- Fetch a single compiled execution pack
- `decantr_compile_execution_packs` -- Compile all packs for a project

**Intelligence & audit:**
- `decantr_get_showcase_benchmarks` -- Benchmark data from showcase apps
- `decantr_get_registry_intelligence_summary` -- Registry health / content coverage
- `decantr_audit_project` -- Run a full project audit
- `decantr_critique` -- Evaluate generated code for visual quality

## CLI Commands

Authoritative dispatch: `packages/cli/src/index.ts` switch statement. Groups:

**Project lifecycle:** `new`, `init`, `status`, `upgrade`
**Registry sync:** `sync`, `refresh`
**Content queries:** `search`, `suggest`, `get`, `list`, `showcase`
**Validation / drift:** `validate`, `check`, `heal`, `migrate`, `audit`
**Essence mutations:** `add {section|page|feature}`, `remove {section|page|feature}`, `analyze`, `magic`
**Content authoring:** `create {pattern|theme|blueprint|archetype|shell}`, `publish`
**Themes:** `theme {create|list|validate|delete|import|switch}`
**Export:** `export {shadcn|tailwind}`
**Registry admin (contributor-facing):** `registry {mirror|summary|compile-packs|get-pack|critique-file|audit-project}`
**Auth:** `login`, `logout`
**Help:** `help`

Run `decantr help` for current flags and sub-flags. The `check` and `heal` commands share a case (heal is check with auto-fix).

## Documentation

| Path | Purpose |
|------|---------|
| `docs/css-scaffolding-guide.md` | Full CSS implementation spec (@layer, theme scoping, variable naming). Generated `DECANTR.md` includes a condensed version. |
| `docs/programs/` | Strategic programs (multi-phase initiatives, current vnext master program) |
| `docs/runbooks/` | Operational runbooks (releases, deploys, certification matrix) |
| `docs/specs/` | Design specifications for major features |
| `docs/architecture/` | Architecture diagrams and flow documentation |
| `docs/audit/` | Audit reports (including `decantr-meta-alignment.md` for successor-project context) |
| `docs/reference/` | API and support reference (`package-support-matrix.md`, `workflow-model.md`, `registry-public-api.md`) |
| `docs/schemas/` | Canonical JSON schemas for every resource type (essence v2/v3, patterns, archetypes, blueprints, all execution-pack variants, intelligence & audit reports) |
| `docs/llms.txt` | LLM-readable documentation index |

## Development Notes

- Do not commit `decantr.essence.json` or `DECANTR.md` files in package directories (these are test artifacts)
- The `.gitignore` excludes `packages/*/decantr.essence.json` and `packages/*/.decantr/`
- Detection of existing AI rule files (for `decantr init`) is controlled at `packages/cli/src/detect.ts`
- Release/audit automation lives in `scripts/*.mjs` (30+ scripts covering showcases, package surface, npm, blueprint governance, etc.)
- Root `config/` carries machine-readable package retirement and surface manifests (`package-retirements.json`, `package-surface.json`)
