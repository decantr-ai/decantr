# Decantr Monorepo

Design intelligence layer for AI-generated web applications.

**v0/Bolt/Lovable race to generate code faster. Decantr generates code better.**

Do not add Co-Authored-By lines to commits.

---

## Package Overview

| Package | npm | Description |
|---------|-----|-------------|
| `packages/essence-spec` | `@decantr/essence-spec` | Essence schema (JSON Schema v2), validator, and TypeScript types |
| `packages/generator-core` | `@decantr/generator-core` | Framework-agnostic IR pipeline for code generation |
| `packages/generator-decantr` | `@decantr/generator-decantr` | Decantr-native code emitter (IR to Decantr components, atoms, signals) |
| `packages/generator-react` | `@decantr/generator-react` | React + Tailwind + shadcn/ui code emitter (IR to React components) |
| `packages/registry` | `@decantr/registry` | Registry format, content resolver, and wiring rules |
| `packages/cli` | `@decantr/cli` | CLI (`npx decantr init/generate/validate/registry`) |
| `packages/mcp-server` | `@decantr/mcp-server` | MCP server exposing design intelligence tools to AI coding assistants |
| `apps/registry-server` | (private) | Hono + SQLite registry API server deployed on Fly.io |

## Terminology

Decantr uses wine-making metaphors as its domain language. Normalized mapping:

| Term | Meaning |
|------|---------|
| **Essence** | Design specification file (`decantr.essence.json`) — the machine-readable UI intent |
| **Essence Pipeline** | Structured methodology: POUR > TASTE > SETTLE > CLARIFY > DECANT > SERVE > AGE |
| **Vintage** | Style configuration — style name, mode (light/dark), recipe, shape |
| **Vignette** | Archetype composition — a composed set of archetype blocks that define an app type |
| **Archetype** | A reusable UI block (e.g., `dashboard-core`, `auth-flow`, `ecommerce`) |
| **Pattern** | A UI component template with layout, props, and wiring metadata (e.g., `hero`, `data-table`) |
| **Recipe** | Decoration rules — background effects, nav styles, spatial hints, pattern overrides |
| **Carafe** | Shell layout preset — `sidebar-main`, `top-nav-main`, `centered`, etc. |
| **Blend** | Page layout composition — ordered array of pattern rows with responsive grid rules |
| **Character** | Brand personality traits (e.g., `professional`, `playful`, `minimal`) |
| **Clarity** | Spatial density profile derived from Character traits — controls gaps and spacing |
| **Tannins** | Functional systems — auth, search, payments, realtime-data, etc. |
| **Cork** | Guard/drift-prevention rules — enforce style, recipe, and structure consistency |
| **Vessel** | App shell type — SPA, MPA, routing mode |
| **Plumbing** | Cross-pattern wiring — automatic shared signals between related patterns on the same page |

## Build, Test, Run

Prerequisites: Node >= 20, pnpm >= 9.

```bash
# Install all dependencies
pnpm install

# Build all packages
pnpm build

# Run all tests
pnpm test

# Watch mode
pnpm test:watch

# Type-check without emitting
pnpm lint

# Clean all dist/ directories
pnpm clean

# Run CLI (after build)
pnpm cli

# Run MCP server (after build)
pnpm mcp

# Registry server
pnpm registry:dev    # dev mode
pnpm registry:test   # run registry server tests
```

Build tooling: tsup (bundler), TypeScript (strict mode), Vitest (test runner).

## Content Directory

The `content/` directory contains framework-agnostic design intelligence content (JSON files). This is the registry's source of truth.

```
content/
  core/                    # Ships with the framework (core content)
    carafes.json           # Shell layout presets
    patterns/hero.json     # Core hero pattern
    recipes/auradecantism.json  # Default recipe
  patterns/                # Community patterns (9 patterns)
    card-grid.json, data-table.json, filter-bar.json,
    kpi-grid.json, chart-grid.json, form-sections.json,
    detail-header.json, activity-feed.json, cta-section.json
  archetypes/              # Reusable UI blocks (19 archetypes)
    dashboard-core.json, auth-flow.json, ecommerce.json,
    saas-dashboard.json, portfolio.json, settings.json, ...
  vignettes/               # Archetype compositions (10 vignettes)
    saas-dashboard.json, ecommerce.json, portfolio.json,
    financial-dashboard.json, cloud-platform.json, ...
  styles/                  # Style metadata (10 styles, JSON only)
    clean.json, glassmorphism.json, retro.json, dopamine.json,
    bioluminescent.json, launchpad.json, editorial.json,
    liquid-glass.json, prismatic.json, gaming-guild.json
  recipes/                 # Community recipes (when added)
```

Style runtime code (JS with color tokens) lives in `decantr-framework`. Only metadata is stored here.

## Essence Pipeline

The pipeline transforms natural language intent into validated, coherent design specifications and then into generated code.

| Stage | Name | Purpose |
|-------|------|---------|
| 1 | **POUR** | User expresses intent in natural language |
| 1.5 | **TASTE** | Interpret intent into structured Impression (vibe, references, density, layout) |
| 2 | **SETTLE** | Decompose into five layers: Vignette, Vintage, Character, Structure, Tannins |
| 3 | **CLARIFY** | Write `decantr.essence.json` — the machine-readable spec |
| 4 | **DECANT** | Resolve each page's Blend (spatial arrangement from pattern compositions) |
| 5 | **SERVE** | Generate code from Blend specs into target framework |
| Ongoing | **AGE** | Read Essence before every change; guard against drift |

## Guard Rules (Cork)

Before writing any code, read `decantr.essence.json` and verify:

1. **Style matches the Vintage.** Do not switch styles.
2. **Page exists in the Structure.** If new, add it to the Essence first.
3. **Layout follows the page's Blend.** Do not freestyle spatial arrangement.
4. **Composition follows the active Recipe.** Do not freestyle decoration.
5. **Spacing follows the Clarity profile** derived from Character. Do not default to generic spacing.

Cork enforcement tiers:
- **Creative** — rules are advisory (initial scaffolding)
- **Guided** — structure enforced, layout flexible (adding pages)
- **Strict** — all 5 rules enforced exactly (refactoring, debugging, components, styles)

If a request conflicts with the Essence, flag the conflict and ask for confirmation.

## Import Patterns

Each package is published under the `@decantr` scope. Workspace dependencies use `workspace:*`.

```ts
// Essence spec — schema validation and types
import { validateEssence, EssenceSpec, type Essence } from '@decantr/essence-spec';
import essenceSchema from '@decantr/essence-spec/schema';

// Generator core — framework-agnostic IR pipeline
import { createPipeline, type IR } from '@decantr/generator-core';

// Generator plugins — framework-specific emitters
import { DecantrEmitter } from '@decantr/generator-decantr';
import { ReactEmitter } from '@decantr/generator-react';

// Registry — content resolution and wiring
import { resolveContent, type Pattern, type Archetype } from '@decantr/registry';

// MCP server
import { createServer } from '@decantr/mcp-server';
```

Dependency graph:
```
essence-spec  (leaf — no workspace deps)
    ^
    |
registry  (depends on essence-spec)
    ^
    |
generator-core  (depends on essence-spec, registry)
    ^        ^
    |        |
generator-decantr  generator-react  (depend on core, essence-spec, registry)
    ^               ^
    |               |
    +--- cli -------+  (depends on all generators, essence-spec, registry)
    |
mcp-server  (depends on essence-spec, registry)
```

## Key Commands

```bash
# Development
pnpm install                  # Install dependencies
pnpm build                    # Build all packages
pnpm test                     # Run all tests (Vitest)
pnpm lint                     # Type-check (tsc --noEmit)
pnpm clean                    # Remove all dist/

# CLI (after build)
pnpm cli -- init              # Initialize a new Decantr project
pnpm cli -- generate          # Generate code from Essence
pnpm cli -- validate          # Validate decantr.essence.json

# MCP server (after build)
pnpm mcp                      # Start MCP server

# Registry server
pnpm registry:dev             # Start dev server
pnpm registry:test            # Run server tests

# Single package
pnpm --filter @decantr/essence-spec test
pnpm --filter @decantr/generator-react build
```

## Related Projects

The Decantr native runtime (component library, CSS engine, state management, router, compiler)
lives in a separate repository: `decantr-framework`. That project is the premium, zero-config
output target for the `generator-decantr` package in this monorepo.
