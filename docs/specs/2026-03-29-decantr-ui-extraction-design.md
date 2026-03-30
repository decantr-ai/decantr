# Decantr UI Extraction Design Spec

**Date:** 2026-03-29
**Status:** Approved
**Author:** David Aimi + Claude

## Overview

Extract the valuable UI framework assets from `decantr-framework` (legacy) into the `decantr-monorepo` as two new packages: `@decantr/ui` and `@decantr/ui-chart`. Archive the legacy repo after extraction.

## Context

### Current State

**decantr-framework** (legacy):
- Full opinionated UI framework with 100+ components, charting library, icons
- Custom compiler (tokenizer, parser, emitter, optimizer)
- CSS engine, state management, router, SSR, i18n
- Published as `decantr` on npm (v0.9.11)
- No longer actively used — contains "frankenfolder" of pre-monorepo code

**decantr-monorepo** (active):
- Stack-agnostic design intelligence layer
- Packages: @decantr/core, @decantr/essence-spec, @decantr/registry, @decantr/css, @decantr/mcp-server, @decantr/cli
- Published as @decantr/* on npm

### Target State

- `@decantr/ui` — self-contained UI framework (like Angular/Solid), one of the targets Decantr can generate code for
- `@decantr/ui-chart` — charting library, separate due to size and specialized nature
- `decantr-framework` — archived, git history preserved

## Architecture Decisions

### Package Organization

Chosen approach: **Hybrid (Core + Extensions)**

- Single bundled `@decantr/ui` package with subpath exports
- Separate `@decantr/ui-chart` for the charting library
- Minimal changes to existing monorepo packages

```
packages/
├── core/             # @decantr/core (UNCHANGED)
├── css/              # @decantr/css (UNCHANGED)
├── essence-spec/     # @decantr/essence-spec (UNCHANGED)
├── registry/         # @decantr/registry (UNCHANGED)
├── mcp-server/       # @decantr/mcp-server (UNCHANGED)
├── cli/              # @decantr/cli (update to support @decantr/ui target)
├── ui/               # @decantr/ui (NEW)
└── ui-chart/         # @decantr/ui-chart (NEW)
```

### Why This Approach

1. **Minimal disruption** — existing monorepo packages unchanged
2. **Charts are specialized** — different renderers (SVG/Canvas/WebGPU), animation systems
3. **Core framework is cohesive** — components, icons, state, router typically used together
4. **Industry precedent** — Angular keeps core together but separates @angular/charts

### Token/Theme Pipeline

```
@decantr/essence-spec (schema) + @decantr/registry (data)
                    ↓
            @decantr/cli (generates tokens.css)
                    ↓
         @decantr/css (atoms reference CSS variables)
                    ↓
         @decantr/ui (components use atoms + tokens)
```

- Essence spec defines theme SCHEMA (validation)
- Registry contains theme DATA (actual colors)
- CLI generates `tokens.css` from Essence
- CSS provides atoms that reference `var(--token)`
- UI components consume atoms — no token ownership

## Package Specifications

### @decantr/ui

```
packages/ui/
├── src/
│   ├── runtime/        # h(), mount(), onMount, onDestroy (named to avoid conflict with @decantr/core)
│   ├── state/          # createSignal, createEffect, createStore, batch
│   ├── components/     # 100+ components
│   ├── icons/          # Icon system
│   ├── router/         # createRouter, navigate, useRoute
│   ├── data/           # createQuery, createMutation, realtime
│   ├── ssr/            # renderToString, renderToStream, hydrate
│   ├── i18n/           # createI18n
│   ├── form/           # Form utilities
│   ├── tags/           # Tag helpers
│   ├── tannins/        # Auth, telemetry systems
│   └── css/            # Extended atoms (component-specific)
├── compiler/           # Tokenizer, parser, emitter
├── package.json
└── tsconfig.json
```

**package.json exports:**

```json
{
  "name": "@decantr/ui",
  "version": "0.1.0",
  "exports": {
    "./runtime": "./src/runtime/index.js",
    "./state": "./src/state/index.js",
    "./components": "./src/components/index.js",
    "./icons": "./src/icons/index.js",
    "./router": "./src/router/index.js",
    "./data": "./src/data/index.js",
    "./ssr": "./src/ssr/index.js",
    "./i18n": "./src/i18n/index.js",
    "./form": "./src/form/index.js",
    "./tags": "./src/tags/index.js",
    "./tannins/auth": "./src/tannins/auth.js",
    "./tannins/telemetry": "./src/tannins/telemetry.js",
    "./css": "./src/css/index.js"
  },
  "peerDependencies": {
    "@decantr/css": "^0.x.x"
  }
}
```

**Usage:**

```js
import { h, mount } from '@decantr/ui/runtime';
import { createSignal } from '@decantr/ui/state';
import { Button, Modal } from '@decantr/ui/components';
import { createRouter } from '@decantr/ui/router';
```

### @decantr/ui-chart

```
packages/ui-chart/
├── src/
│   ├── types/              # Chart implementations (bar, pie, sankey, etc.)
│   ├── renderers/          # svg.js, canvas.js, webgpu.js
│   ├── layouts/            # cartesian.js, polar.js, hierarchy.js
│   ├── _animate.js
│   ├── _interact.js
│   ├── _data.js
│   ├── _palette.js
│   └── index.js
├── package.json
└── tsconfig.json
```

**package.json:**

```json
{
  "name": "@decantr/ui-chart",
  "version": "0.1.0",
  "exports": {
    ".": "./src/index.js",
    "./types/*": "./src/types/*.js",
    "./renderers/*": "./src/renderers/*.js"
  },
  "peerDependencies": {
    "@decantr/ui": "^0.1.0",
    "@decantr/css": "^0.x.x"
  }
}
```

## Extraction Mapping

### Into @decantr/ui

| Source (decantr-framework) | Destination | Notes |
|---------------------------|-------------|-------|
| `src/core/` | `packages/ui/src/runtime/` | Renamed to avoid conflict |
| `src/components/` | `packages/ui/src/components/` | 100+ components |
| `src/icons/` | `packages/ui/src/icons/` | Icon system |
| `src/state/` | `packages/ui/src/state/` | Signals, stores |
| `src/router/` | `packages/ui/src/router/` | Hash + history |
| `src/data/` | `packages/ui/src/data/` | Query, mutation |
| `src/ssr/` | `packages/ui/src/ssr/` | SSR |
| `src/i18n/` | `packages/ui/src/i18n/` | i18n |
| `src/form/` | `packages/ui/src/form/` | Form utilities |
| `src/tags/` | `packages/ui/src/tags/` | Tag helpers |
| `src/tannins/` | `packages/ui/src/tannins/` | Auth, telemetry |
| `src/css/` | `packages/ui/src/css/` | Extended atoms |
| `tools/compiler/` | `packages/ui/compiler/` | Build tooling |

### Into @decantr/ui-chart

| Source | Destination |
|--------|-------------|
| `src/chart/` | `packages/ui-chart/src/` |

### Left Behind (Not Extracted)

| Item | Reason |
|------|--------|
| `src/registry/` | Duplicated in @decantr/registry |
| `src/registry-content/` | Duplicated in content/ |
| `src/workbench/` | Rebuild later as apps/workbench/ |
| `playground/` | Obsolete |
| `showcase/` | Migrated to web app |
| `llm/` | Framework-specific, obsolete |
| `reference/` | Review individually |
| `tools/` (most) | Obsolete or duplicated |
| `AGENTS.md` | Framework-specific |
| `decantr.*.json` | Project-specific configs |

## Migration Plan

### Phase 1: Prepare Monorepo (Minimal Changes)

- Create `packages/ui/` skeleton
- Create `packages/ui-chart/` skeleton
- Update `pnpm-workspace.yaml` (add new packages only)

### Phase 2: Extract @decantr/ui

- Copy source directories per extraction mapping
- Rename `core/` → `runtime/` to avoid conflict
- Set up package.json with exports
- Fix internal imports (change `decantr/*` to relative paths)
- Verify build passes

### Phase 3: Extract @decantr/ui-chart

- Copy `src/chart/` → `packages/ui-chart/src/`
- Set up package.json with peer dependencies
- Fix imports to reference @decantr/ui
- Verify build passes

### Phase 4: Integration & Verification

- Update @decantr/cli to support @decantr/ui as target
- Run full test suite
- Update documentation
- Create `apps/workbench/` placeholder

### Phase 5: Publish & Archive

- Publish @decantr/ui (0.1.0)
- Publish @decantr/ui-chart (0.1.0)
- Publish `decantr` deprecation notice pointing to @decantr/ui
- Archive decantr-framework repo (preserve git history)
- Update README pointers

## npm Publishing Strategy

| Package | Action | Version |
|---------|--------|---------|
| `decantr` | Deprecate | 0.9.12 (final, deprecation notice) |
| `@decantr/ui` | New | 0.1.0 |
| `@decantr/ui-chart` | New | 0.1.0 |
| `@decantr/core` | Unchanged | Continues |
| `@decantr/css` | Unchanged | Continues |
| `@decantr/cli` | Update | Version bump |

**Deprecation message for `decantr`:**

```
This package is deprecated.
The Decantr UI framework is now available as @decantr/ui.
Install: npm install @decantr/ui @decantr/css
```

## Future Work (Deferred)

### Workbench

Vision: Unified tool combining:
- Component development environment (like Storybook)
- Design system explorer (patterns, archetypes, recipes)
- Interactive playground (compose pages, see generated code)

Location: `apps/workbench/`

Priority: After clean extraction is complete and verified.

## Success Criteria

1. @decantr/ui builds and passes tests
2. @decantr/ui-chart builds and passes tests
3. Existing monorepo packages unaffected
4. `decantr` npm package deprecated with clear migration path
5. decantr-framework archived with preserved history
6. Documentation updated
