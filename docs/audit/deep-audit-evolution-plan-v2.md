# Decantr Deep Audit & Evolution Plan (v2)

> Revised 2026-03-29. Incorporates full codebase audit of every source file, config, test fixture, bundled content, and the `decantr-content` repository (214 items). Corrects gaps, missing phases, effort underestimates, and migration blind spots from v1 of this plan.

---

## Table of Contents

1. [Audit Findings](#1-audit-findings)
2. [The DNA/Blueprint Split](#2-the-dnablueprint-split)
3. [Bi-directional Drift Resolution](#3-bi-directional-drift-resolution)
4. [Implementation Roadmap](#4-implementation-roadmap)
5. [Content Migration Strategy](#5-content-migration-strategy)
6. [Honest Assessment](#6-honest-assessment)

---

## 1. Audit Findings

### 1.1 Strengths

**Guard system is well-designed.** 8 distinct rules across 3 enforcement tiers (creative/guided/strict), proper severity levels, fuzzy "did you mean?" suggestions. The `evaluateGuard()` function in `packages/essence-spec/src/guard.ts` is cleanly structured with individual check functions. This is the product's core differentiator and it works.

> **Correction from v1:** CLAUDE.md documents only 6 guard rules but the code implements 8. Rules 6 (theme-mode) and 7 (pattern-exists) are undocumented. This must be fixed as part of Phase A.

**Type system is comprehensive.** 26 exported types from essence-spec, 24 from registry, 22 from core. The discriminated union `EssenceFile = Essence | SectionedEssence` with runtime discriminators `isSimple()`/`isSectioned()` is clean. The wine-to-normalized terminology migration is complete in the type layer.

**Registry content tests are excellent.** 138 tests across 16 files in `packages/registry/test/` validate individual patterns (activity-feed, card-grid, chart-grid, cta-section, data-table, detail-header, filter-bar, form-sections, kpi-grid) and archetypes (content-site, ecommerce, portfolio). Each test validates JSON structure, presets, IO declarations, components, code quality, and preset resolution.

**API is full-featured.** The Hono-based API in `apps/api/` has auth (JWT + API key), tiered rate limiting, Stripe billing (checkout, portal, webhooks), moderation queue with reputation system, org/team support, and content publishing. 25+ endpoints covering the full registry platform lifecycle.

**Web app is functional.** Next.js 16 + React 19 + Tailwind 4 + Supabase SSR. Registry browser with search/filter, dashboard with API key management, admin moderation panel, OAuth login (GitHub, Google).

**IR pipeline is genuinely useful.** The core package transforms an Essence spec into a framework-agnostic IR tree with resolved patterns, presets, wiring signals, visual effects, card wrapping logic, and shell configuration.

**CLI init flow is thorough.** Project detection (framework, package manager, TypeScript, Tailwind, existing AI rule files), blueprint selection with registry search, interactive prompts, CSS token generation from theme seeds, decorator CSS generation from recipe descriptions.

### 1.2 Critical Issues

#### The Blueprint/Contract Conflict (Core Problem)

The Essence file serves dual roles:

1. **Blueprint** -- Initial scaffolding decisions (which patterns on which pages, shell choices, feature list)
2. **Contract** -- Ongoing enforcement (theme consistency, spacing tokens, layout order)

These roles directly conflict. In strict guard mode, every intentional design change becomes a "violation." The developer must manually update the essence before making any change, which inverts the natural workflow (change code -> update spec) into an unnatural one (update spec -> change code).

**Impact:** Guard system loses credibility. Developers will either abandon strict mode or stop using Decantr entirely.

#### One-Directional Drift

Drift detection is read-only. The MCP `decantr_check_drift` tool reports violations but provides no way to resolve them. The DECANTR.md instructs AI assistants to "STOP and ask the user to update the essence," but there's no tool for the AI to actually perform that update. The `decantr_update_essence` MCP tool referenced in DECANTR.md **does not exist**.

**Impact:** Every drift detection creates manual work with no assisted resolution path.

#### Sectioned Essence is Broken

`SectionedEssence` is a first-class type (defined, validated by schema, normalized from v1) but the core pipeline in `packages/core/src/resolve.ts` silently discards all sections except the first:

```typescript
// handle sectioned by flattening first section for now
```

This is tested and confirmed behavior (resolve.test.ts line 103 asserts only first section is processed). There is no TODO or tracking of this limitation.

**Impact:** Any project using sectioned essences will lose all sections after the first when processed through the IR pipeline.

#### Schema/Types Drift

`ColumnLayout` in TypeScript (`packages/essence-spec/src/types.ts`) has `breakpoints` and `responsive` fields that are NOT in the JSON schema (`packages/essence-spec/schema/essence.v2.json`). The schema has `additionalProperties: false`, so documents using these features will fail validation even though the TypeScript types allow them.

**Impact:** Silent validation failures for valid use cases.

#### Dead Code and Unfinished Features

| Location | Issue |
|----------|-------|
| `packages/mcp-server/src/tools.ts` -- `decantr_check_drift` | `components_used` parameter is accepted but never used |
| `packages/mcp-server/src/helpers.ts` -- `fuzzyScore()` | Exported but never called by any tool |
| `packages/core/src/types.ts` -- `IRNavNode` | Defined but never constructed. Nav data lives in `IRShellConfig.nav` instead |
| `packages/core/src/types.ts` -- `slot` in `IRNodeType` | In the union but has no corresponding interface or construction |
| `packages/registry/src/client.ts` -- `cacheDir`, `cacheTtl` options | Accepted but never used |
| `packages/core/src/types.ts` -- `source: 'installed'` | Defined in union type but unreachable |
| `packages/core/src/resolve.ts` -- `resolveVisualEffects()` | Exported and tested but never called from the pipeline; `buildPatternNode` always sets `visualEffects: null` |
| `packages/core/src/ir.ts`, `pipeline.ts`, `resolve.ts` -- `pascalCase()` | Duplicated across 3 files |

#### MCP Server Has No Fallback

The MCP server uses `RegistryAPIClient` directly -- API only, no cache, no custom, no bundled fallback. If `api.decantr.ai` is down, all resolve/search/suggest tools fail. The CLI has a proper fallback chain (Custom -> API -> Cache -> Bundled) but the MCP server does not.

Additionally, `openWorldHint: false` is set on tools that make network calls (tools 3-8 and 10), which is incorrect per MCP spec.

**Impact:** MCP tools are unreliable for offline or air-gapped development.

#### Apps Are Fully Decoupled From Packages

**Neither `apps/api/` nor `apps/web/` has any `workspace:` dependency on `@decantr/*` packages.** They are standalone apps that share no code with the library packages:

- The API's `POST /v1/validate` endpoint does its own minimal field check (`version`, `platform`, `structure`) instead of using `@decantr/essence-spec`'s `validateEssence()`
- Content stored in Supabase has no v2/v3 schema validation
- The web app renders content from the API with no type safety

**Impact:** Schema changes in Phase A won't automatically propagate to the API or web app. V3 content could be uploaded without v3 validation.

#### `@decantr/css` Is Orphaned From Build/Publish Pipeline

- Not included in root `package.json` build script
- Not included in `.github/workflows/publish.yml` (publishes 5 packages, skips css)
- Does not extend `tsconfig.base.json`
- Has its own `tsup`, `vitest`, `typescript` devDependencies

**Impact:** The CSS package that the plan calls "load-bearing" has no CI coverage and no publish path.

### 1.3 Test Coverage Gaps

| Area | Tests | Gap |
|------|-------|-----|
| API route handlers | 0 | 25+ endpoints untested |
| Stripe webhooks | 0 | 4 webhook event types untested |
| Auth middleware | 0 | JWT + API key auth untested |
| Rate limiter | 0 | Tier-based limiting untested |
| MCP happy paths | 0 | Only error cases tested |
| Web app | 0 | No test directory exists |
| CLI E2E | 4 | Requires built dist/, may be stale |

**Total test count: ~293 across 33 files.** Essence-spec, registry, core, and CSS have good coverage. API, MCP, and web have near-zero.

### 1.4 Content Quality Assessment

The `decantr-content` repo maintains **214 official registry items**: 97 patterns, 59 archetypes, 17 themes, 17 blueprints, 13 shells, 11 recipes.

**Strength:** Pattern IO contracts enable wiring detection. The `produces`/`consumes` model is a good foundation for cross-pattern communication.

**Weakness:** Wiring is hardcoded to 3 pairs in `packages/registry/src/wiring.ts` (filter-bar+data-table, filter-bar+activity-feed, filter-bar+card-grid). Any new pattern combination requires code changes. Wiring rules should be data-driven from pattern IO declarations, not hardcoded.

**Content schema inconsistencies:**
- Two blueprint schema versions coexist: `blueprint.v1.json` and `decantr-vignette-v1.0` with different key names (`suggested_theme` vs `theme`)
- Legacy patterns (e.g., `hero.json` in fixtures) lack `$schema`, `decantr_compat`, `io`, `dependencies`
- Core patterns in `fixtures/core/patterns/` use a completely different minimal format
- Theme validation in `decantr-content/validate.js` only checks for `id` or `slug` -- no structural validation

### 1.5 CSS Package Assessment

`@decantr/css` is a standalone CSS-in-JS atomic runtime (300+ atoms, responsive prefixes, pseudo-classes, container queries, SSR support, CSS layers). It's well-built with solid architecture (microtask batching, `@layer` ordering, color-mix opacity).

**Assessment:** This package is core infrastructure. Atom strings (`_flex`, `_gap4`, `_col`, `_bgprimary`, etc.) are embedded throughout the entire content ecosystem -- every pattern in `decantr-content` uses `atoms` fields to describe layout, and the core pipeline generates atom strings for page surfaces. `@decantr/css` is the runtime that resolves those strings into actual CSS.

The CLI's `scaffoldProject()` generates `tokens.css` from `themeData.seed` and `themeData.palette`, and `decorators.css` from `recipeData.decorators`. If v3 restructures where theme/recipe data lives, these generation paths break.

### 1.6 Pre-existing Infrastructure Issues

| Issue | Location | Impact |
|-------|----------|--------|
| Web app middleware not wired | `apps/web/src/proxy.ts` exists but session refresh may not be active | Auth sessions not refreshing on navigation |
| Dockerfile runs source, not build | `apps/api/Dockerfile` runs `node src/index.js` (TypeScript) not `dist/index.js` | Deployment may fail without tsx |
| In-memory rate limiter | `apps/api/src/middleware/rate-limit.ts` | Resets on restart, not shared across instances |
| Hardcoded admin check | `apps/web/src/lib/admin.ts` | Single email address, no database role |
| Live credentials in .env.local | Both apps have actual Supabase keys | Security risk if not gitignored at app level |
| `require('node:fs')` in ESM | `packages/cli/src/index.ts` `buildRegistryContext()` | May fail in strict ESM environments |
| Missing org members endpoint | Web app calls `api.getOrgMembers` but API route doesn't exist | 404 on team member listing |

### 1.7 Competitive Context: drift-guard

`drift-guard` takes a snapshot-based approach: capture the current state of your design tokens/components as a baseline, then diff against it on each commit/PR. It's a CLI tool, not an MCP server.

**Decantr advantages:** Richer semantic model (patterns, archetypes, recipes vs. flat snapshots), AI-native (MCP tools), content registry, blueprint-driven scaffolding.

**drift-guard advantages:** Simpler mental model, works with existing code (no spec file to maintain), snapshot-based means the spec auto-updates when code changes (bi-directional by default).

**Key lesson:** drift-guard's snapshot approach solves the blueprint/contract conflict by making the code the source of truth. Decantr should learn from this -- the DNA layer should be developer-declared invariants, and the Blueprint layer should auto-track from code state.

---

## 2. The DNA/Blueprint Split

### 2.1 Architecture

Split the flat Essence file into two conceptual layers within the same file:

```
decantr.essence.json
+-- dna {}          <- Guarded. Developer-declared design axioms.
|                     Violations here are real drift.
|
+-- blueprint {}    <- Tracked. Scaffolding decisions that evolve.
|                     Changes are logged as history, not violations.
|
+-- meta {}         <- Metadata. Version, target, features.
```

#### Layer 1: Design DNA (Guarded)

These are invariant design properties the developer explicitly chose and wants enforced. Changing these requires deliberate intent.

```json
{
  "version": "3.0.0",
  "dna": {
    "theme": {
      "style": "luminarum",
      "mode": "dark",
      "recipe": "luminarum",
      "shape": "pill"
    },
    "spacing": {
      "base_unit": 4,
      "scale": "linear",
      "density": "comfortable",
      "content_gap": "_gap4"
    },
    "typography": {
      "scale": "modular",
      "heading_weight": 600,
      "body_weight": 400
    },
    "color": {
      "palette": "semantic",
      "accent_count": 1,
      "cvd_preference": "auto"
    },
    "radius": {
      "philosophy": "pill",
      "base": 12
    },
    "elevation": {
      "system": "layered",
      "max_levels": 3
    },
    "motion": {
      "preference": "subtle",
      "duration_scale": 1.0,
      "reduce_motion": true
    },
    "accessibility": {
      "wcag_level": "AA",
      "focus_visible": true,
      "skip_nav": true
    },
    "personality": ["professional"]
  }
}
```

**Guard rules that apply to DNA:**
- Rule 1 (Style): theme must match `dna.theme.style`
- Rule 4 (Recipe): decorations must match `dna.theme.recipe`
- Rule 5 (Density): spacing must follow `dna.spacing.content_gap`
- Rule 6 (Theme-mode): theme/mode combination must be compatible
- Rule 8 (Accessibility): WCAG level must be met

#### Layer 2: Blueprint (Tracked, not guarded)

These are scaffolding decisions that naturally evolve. Changes are recorded in a history log, not flagged as violations.

```json
{
  "blueprint": {
    "shell": "sidebar-main",
    "pages": [
      {
        "id": "main",
        "shell_override": null,
        "layout": [
          { "pattern": "hero", "preset": "landing", "as": "guild-hero" },
          "kpi-grid",
          { "cols": ["activity-feed", "top-players"], "at": "lg" }
        ],
        "dna_overrides": {
          "density": "spacious"
        }
      },
      {
        "id": "news",
        "layout": ["filter-bar", "post-list"]
      }
    ],
    "features": ["guild-state", "achievements", "realtime-data"],
    "icon_style": "lucide",
    "avatar_style": "initials"
  }
}
```

**Guard rules that apply to Blueprint (advisory only in guided/strict):**
- Rule 2 (Page existence): warn if code references a page not in `blueprint.pages`
- Rule 3 (Layout order): warn if pattern order deviates from `blueprint.pages[].layout`
- Rule 7 (Pattern exists): warn if pattern is not in registry

**Key difference:** Blueprint violations produce warnings with auto-fix suggestions ("Add page X to blueprint?"), not errors that block code generation.

#### Meta section

```json
{
  "meta": {
    "archetype": "gaming-community",
    "target": "react",
    "platform": { "type": "spa", "routing": "hash" },
    "guard": {
      "mode": "strict",
      "dna_enforcement": "error",
      "blueprint_enforcement": "warn"
    }
  }
}
```

### 2.2 Full JSON Schema (v3)

The v3 schema lives at `packages/essence-spec/schema/essence.v3.json`. Key structural changes:

- Top-level splits into `dna`, `blueprint`, `meta` (required)
- `dna` is strictly typed with `additionalProperties: false`
- `blueprint` is loosely typed -- `pages[].layout` allows arbitrary pattern refs, and `dna_overrides` accepts any subset of DNA properties
- `meta.guard` gains `dna_enforcement` and `blueprint_enforcement` fields
- `version` moves to top level and must be `"3.0.0"`
- `ColumnLayout` gains `breakpoints` and `responsive` fields (fixing the v2 TS/schema gap)

### 2.3 Migration Path (v2 -> v3)

```
v2 flat essence
+-- theme -> dna.theme
+-- personality -> dna.personality
+-- density -> dna.spacing (remap fields)
+-- accessibility -> dna.accessibility
+-- guard -> meta.guard (add enforcement split)
+-- structure -> blueprint.pages (rename structure->pages)
+-- features -> blueprint.features
+-- platform -> meta.platform
+-- archetype -> meta.archetype
+-- target -> meta.target
+-- version -> "3.0.0"
```

New fields with sensible defaults:
- `dna.typography` -- inferred from recipe if available, else `{ scale: "modular", heading_weight: 600, body_weight: 400 }`
- `dna.color` -- `{ palette: "semantic", accent_count: 1, cvd_preference: "auto" }`
- `dna.radius` -- inferred from `theme.shape`: pill->12, rounded->8, sharp->2
- `dna.elevation` -- `{ system: "layered", max_levels: 3 }`
- `dna.motion` -- `{ preference: "subtle", duration_scale: 1.0, reduce_motion: true }`
- `meta.guard.dna_enforcement` -- mapped from v2 `guard.mode`: strict->"error", guided->"error", creative->"off"
- `meta.guard.blueprint_enforcement` -- strict->"warn", guided->"off", creative->"off"

**Implementation:** Add `migrateV2ToV3()` to `packages/essence-spec/src/normalize.ts` alongside the existing `normalizeEssence()` (v1->v2). The CLI `init` command generates v3 by default. The `validate` command accepts both v2 and v3 (detects by `version` field).

**Critical: version-based detection must come first.** The existing `normalizeEssence()` detects v2 via `input.theme && input.platform`. A v3 document has neither at the top level (they're under `dna.theme` and `meta.platform`), so the normalizer would misclassify v3 as v1 and corrupt it. The fix:

```typescript
export function normalizeEssence(input: Record<string, unknown>): EssenceFile {
  // v3 -- pass through (new)
  if (input.version === '3.0.0' || ('dna' in input && 'blueprint' in input)) {
    return input as EssenceV3;
  }
  // v2 -- pass through (existing)
  if (input.theme && input.platform) {
    return input as EssenceFile;
  }
  // v1 -- normalize (existing)
  // ...
}
```

**Critical: `EssenceFile` union must become a 3-way union.** The existing discriminators `isSimple()` (`'archetype' in essence`) and `isSectioned()` (`'sections' in essence`) both return `false` for v3 documents. A new `isV3()` discriminator is required, and every consumer that switches on `isSimple()`/`isSectioned()` must handle the v3 case.

### 2.4 Updated Guard Rules

| Rule | DNA | Blueprint | Behavior Change |
|------|-----|-----------|----------------|
| 1. Style match | Yes | No | No change -- checks `dna.theme.style` |
| 2. Page exists | No | Yes | **Downgraded** from error to warning. Auto-suggests adding page to blueprint. |
| 3. Layout order | No | Yes | **Downgraded** from error to advisory. Auto-suggests reordering or updating blueprint. |
| 4. Recipe match | Yes | No | No change -- checks `dna.theme.recipe` |
| 5. Density | Yes | No | No change -- checks `dna.spacing.content_gap`. Page-level overrides from `blueprint.pages[].dna_overrides.density` are respected. |
| 6. Theme-mode | Yes | No | No change |
| 7. Pattern exists | No | Yes | **Downgraded** from error to warning |
| 8. Accessibility | Yes | No | No change |

The `evaluateGuard()` function gains a `layer` field on each `GuardViolation`:

```typescript
interface GuardViolation {
  rule: string;
  severity: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  layer: 'dna' | 'blueprint';  // NEW
  autoFixable?: boolean;        // NEW
  autoFix?: AutoFix;            // NEW
}

interface AutoFix {
  type: 'add_page' | 'update_layout' | 'update_blueprint';
  patch: Record<string, unknown>;
}
```

### 2.5 MCP Tool Changes

| Tool | Change |
|------|--------|
| `decantr_read_essence` | Returns the split structure. Adds optional `layer` param to read only DNA or Blueprint. |
| `decantr_validate` | Validates v3 schema. Reports DNA violations separately from Blueprint violations. |
| `decantr_check_drift` | Returns `{ dna_violations: [...], blueprint_drift: [...] }` with `autoFixable` flags. |
| `decantr_create_essence` | Generates v3 format with DNA defaults inferred from archetype/recipe. |
| `decantr_accept_drift` | **NEW** -- see Phase 3 below. |
| `decantr_update_essence` | **NEW** -- applies patches to DNA or Blueprint layer. |

### 2.6 CLI Changes

- `decantr init` generates v3 essence by default, with an interactive step to confirm DNA axioms
- `decantr validate` accepts v2 and v3, reports which layer violations belong to
- `decantr migrate` -- **NEW** command to migrate v2 -> v3
- `decantr status` shows DNA axioms and Blueprint page count separately
- DECANTR.md template updated to explain the two-layer model
- **Both** `scaffoldProject()` (template-based) and `scaffoldMinimal()` (inline) DECANTR.md paths must be updated

---

## 3. Bi-directional Drift Resolution

### 3.1 MCP: `decantr_accept_drift` Tool

```typescript
// Input schema
{
  name: "decantr_accept_drift",
  description: "Resolve drift violations by accepting, scoping, or rejecting changes",
  inputSchema: {
    type: "object",
    required: ["violations", "resolution"],
    properties: {
      violations: {
        type: "array",
        items: {
          type: "object",
          properties: {
            rule: { type: "string" },
            page_id: { type: "string" },
            details: { type: "string" }
          }
        },
        description: "Violations from decantr_check_drift to resolve"
      },
      resolution: {
        type: "string",
        enum: ["accept", "accept_scoped", "reject", "defer"],
        description: "How to resolve: accept (update essence), accept_scoped (page-level override), reject (revert suggestion), defer (log for later)"
      },
      scope: {
        type: "string",
        description: "Page ID for scoped acceptance (required when resolution=accept_scoped)"
      },
      path: { type: "string", description: "Essence file path" }
    }
  }
}
```

**Resolution behaviors:**

| Resolution | DNA violation | Blueprint violation |
|------------|--------------|-------------------|
| `accept` | Updates `dna` field (with confirmation warning) | Updates `blueprint` field |
| `accept_scoped` | Adds to `blueprint.pages[scope].dna_overrides` | Updates specific page's layout |
| `reject` | Returns code diff suggestion to revert the change | Returns code diff suggestion |
| `defer` | Writes to `.decantr/drift-log.json` | Writes to `.decantr/drift-log.json` |

**For DNA acceptance:** The tool emits a prominent warning: "You are changing a design axiom. This affects the entire project." It requires the AI to confirm by passing `confirm_dna: true`.

### 3.2 MCP: `decantr_update_essence` Tool

```typescript
{
  name: "decantr_update_essence",
  description: "Apply a structured update to the essence file",
  inputSchema: {
    type: "object",
    required: ["operation"],
    properties: {
      operation: {
        type: "string",
        enum: ["add_page", "remove_page", "update_page_layout", "update_dna", "update_blueprint", "add_feature", "remove_feature"]
      },
      payload: { type: "object", description: "Operation-specific data" },
      path: { type: "string" }
    }
  }
}
```

### 3.3 File-Based Drift Resolution (Non-MCP)

**Drift log format** (`.decantr/drift-log.json`):

```json
{
  "deferred": [
    {
      "timestamp": "2026-03-29T10:00:00Z",
      "rule": "layout_order",
      "layer": "blueprint",
      "page_id": "main",
      "message": "Pattern order changed: expected [hero, kpi-grid] got [kpi-grid, hero]",
      "suggested_fix": { "type": "update_layout", "page": "main", "layout": ["kpi-grid", "hero", "..."] }
    }
  ],
  "accepted": [
    {
      "timestamp": "2026-03-29T09:30:00Z",
      "rule": "style_match",
      "resolution": "accept_scoped",
      "scope": "landing",
      "details": "Landing page uses 'glassmorphism' instead of 'luminarum'"
    }
  ]
}
```

**CLI command** -- `decantr sync`:

1. Reads `.decantr/drift-log.json`
2. For each deferred violation, presents an interactive accept/reject/skip prompt
3. Accepted changes are applied to the essence file
4. Rejected changes generate a `.decantr/revert-suggestions.md` with code diff hints
5. The drift log is cleared of resolved items

> **Note:** The existing `decantr heal` command only reports issues (doesn't fix them despite the name). It should be deprecated in favor of `decantr sync` or renamed to `decantr check` to avoid confusion.

**DECANTR.md instructions** for non-MCP AI assistants:

```markdown
## When You Change the Design

If you make an intentional design change that deviates from this spec:

1. Add an entry to `.decantr/drift-log.json` under `deferred[]`
2. Include: which rule, which page, what changed, and why
3. The developer will run `decantr sync` to accept or reject your changes
4. Do NOT modify `decantr.essence.json` directly
```

### 3.4 Build Tool Integration (Future)

**Vite plugin architecture** (`@decantr/vite-plugin`):

```
Browser <-> WebSocket <-> Vite Plugin <-> Essence File
                              |
                        Guard Engine
                              |
                     Drift Notifications
                     (via Vite error overlay)
```

**MVP (detection only):**
- Watches `decantr.essence.json` and source files for changes
- On source file save, runs guard evaluation
- Pushes violations to Vite's error overlay as warnings
- No interactive resolution -- just visibility

**V2 (interactive):**
- Local WebSocket server on a random port
- Custom overlay component with accept/reject/defer buttons
- Buttons send resolution back through WebSocket -> plugin -> essence file update

**ESLint plugin concept** (`eslint-plugin-decantr`):
- `decantr/theme-consistency`: Warn when CSS classes don't match the essence theme
- `decantr/page-declared`: Warn when a route file exists without a corresponding essence page
- `decantr/spacing-tokens`: Warn when hardcoded pixel values appear instead of design tokens
- Maps to DNA guard rules 1, 5, 6

### 3.5 Priority Order

1. `decantr_accept_drift` MCP tool -- highest impact, enables AI-assisted resolution
2. `decantr_update_essence` MCP tool -- unblocks the DECANTR.md reference
3. CLI `decantr sync` command -- enables non-MCP workflow
4. Drift log format + DECANTR.md instructions -- enables file-based workflow
5. Vite plugin MVP -- detection only
6. ESLint plugin -- enforcement in editor
7. Vite plugin V2 -- interactive resolution

---

## 4. Implementation Roadmap

### Phase 0: Foundation Fixes (Pre-requisite)

**Scope:** Fix version detection, type discrimination, and validator routing so that v3 documents don't get corrupted by existing code paths.

**Files to change:**
- `packages/essence-spec/src/normalize.ts` -- Add version-based detection before v2/v1 checks. V3 documents (`version: "3.0.0"` or `'dna' in input`) pass through without normalization.
- `packages/essence-spec/src/types.ts` -- Add `EssenceV3` type, update `EssenceFile = Essence | SectionedEssence | EssenceV3`, add `isV3()` discriminator
- `packages/essence-spec/src/validate.ts` -- Make version-aware: detect version field -> select v2 or v3 schema -> validate
- `packages/essence-spec/src/guard.ts` -- Update `getAllPages()` helper to handle v3 structure (`blueprint.pages`), update every rule to read from `dna.*` or `blueprint.*` when `isV3()`
- `packages/essence-spec/src/index.ts` -- Export new `EssenceV3`, `EssenceDNA`, `EssenceBlueprint`, `EssenceMeta` types and `isV3()`
- `CLAUDE.md` -- Update guard rule documentation to list all 8 rules (currently documents only 6)

**Why this is Phase 0:** Every downstream phase depends on the type system and validator correctly handling v3 documents. Without this, v3 documents get corrupted by the normalizer, rejected by the validator, and misrouted by discriminators.

**Tests to write:**
- `packages/essence-spec/test/normalize-v3.test.ts` -- v3 passthrough (not corrupted), v2 still normalizes correctly, v1 still normalizes correctly
- `packages/essence-spec/test/validate-v3.test.ts` -- v3 validates against v3 schema, v3 fails against v2 schema, v2 still validates against v2 schema
- `packages/essence-spec/test/discriminators.test.ts` -- `isV3()` returns true for v3, false for v2/v1; `isSimple()`/`isSectioned()` still work for v2/v1

**Acceptance criteria:**
- `normalizeEssence(v3Doc)` returns the v3 doc unchanged
- `normalizeEssence(v2Doc)` still works as before
- `validateEssence(v3Doc)` uses v3 schema
- `isV3(doc)` correctly identifies v3 documents
- All existing tests still pass

**Estimated effort:** 2-3 days

**Risk:** Medium -- this touches the most sensitive package in the monorepo. Every other package depends on `@decantr/essence-spec`.

---

### Phase A: Essence v3 Schema & Migration

**Scope:** Create the v3 JSON schema and the v2->v3 migration function.

**Files to create:**
- `packages/essence-spec/schema/essence.v3.json` -- New JSON schema with `dna`/`blueprint`/`meta` top-level sections
- `packages/essence-spec/src/migrate.ts` -- `migrateV2ToV3()` function

**Files to change:**
- `packages/essence-spec/src/guard.ts` -- Add `layer` field to violations, `autoFixable` flags
- `packages/essence-spec/src/index.ts` -- Export `migrateV2ToV3` and new types
- `packages/essence-spec/schema/essence.v2.json` -- Add `breakpoints` and `responsive` to `ColumnLayout` (fixing pre-existing TS/schema gap)

**Tests to write:**
- `packages/essence-spec/test/migrate.test.ts` -- v2->v3 conversion (10+ cases covering all field mappings, defaults, edge cases)
- `packages/essence-spec/test/guard-v3.test.ts` -- Layer-aware guard evaluation, DNA vs Blueprint violation routing (10+ cases)

**Dependencies:** Phase 0 complete.

**Acceptance criteria:**
- v3 schema validates correctly with DNA/Blueprint/Meta sections
- `migrateV2ToV3()` correctly transforms all existing test fixtures
- Guard violations carry `layer` and `autoFixable` metadata
- v2 `ColumnLayout` schema now includes `breakpoints`/`responsive`
- All existing tests still pass

**Estimated effort:** 3-4 days

**Risk:** Medium -- schema changes ripple through every package. Mitigate with backward-compatible v2 support in Phase 0.

---

### Phase B: Core Pipeline v3 Support

**Scope:** Update the IR pipeline to consume v3 essences.

**Files to change:**
- `packages/core/src/resolve.ts` -- Read from `dna` and `blueprint` layers, respect `dna_overrides`. Handle v3 via `isV3()` check. Wire in `resolveVisualEffects()` (currently exported but never called).
- `packages/core/src/pipeline.ts` -- Detect v2 vs v3, auto-migrate v2 before processing. Remove duplicated `pascalCase()`.
- `packages/core/src/ir.ts` -- Remove duplicated `pascalCase()`, import from shared location.
- `packages/core/src/types.ts` -- Add `layer` metadata to IR nodes. Remove dead `IRNavNode` (nav lives in `IRShellConfig`). Remove `slot` from `IRNodeType` union (no interface exists).

**Also fix:**
- Sectioned essence handling (currently discards all but first section -- either implement multi-section IR or emit a clear error)
- Remove dead IR node types (`IRNavNode`, `slot`) or implement them
- Consolidate `pascalCase()` into a shared utility
- Wire `resolveVisualEffects()` into the pipeline (currently always returns `null`)

**Tests to write:**
- `packages/core/test/pipeline-v3.test.ts` -- v3 essence through full pipeline (6+ cases)
- `packages/core/test/resolve-v3.test.ts` -- DNA override resolution, per-page overrides (6+ cases)

**Dependencies:** Phase 0 + Phase A complete.

**Acceptance criteria:**
- v3 essences produce correct IR trees
- v2 essences still work (auto-migrated internally)
- Per-page DNA overrides are reflected in IR node metadata
- Sectioned essences either process all sections or error clearly (no silent discard)
- Visual effects are wired into the pipeline (not always null)
- No duplicate utility functions

**Estimated effort:** 3-4 days

**Risk:** Medium -- must test that v2 auto-migration doesn't break existing behavior.

---

### Phase C: MCP Server Updates

**Scope:** Update existing tools for v3, add `decantr_accept_drift` and `decantr_update_essence`, add fallback chain.

**Files to change:**
- `packages/mcp-server/src/tools.ts` -- Update all 10 tools for v3, add 2 new tools
- `packages/mcp-server/src/helpers.ts` -- Add essence file write helpers, drift log helpers. Remove unused `fuzzyScore()` or wire it into pattern suggestion. Fix `openWorldHint` annotations.
- `packages/mcp-server/src/index.ts` -- Update server metadata

**New tools:**
- `decantr_accept_drift` -- Resolve violations with accept/scope/reject/defer
- `decantr_update_essence` -- Structured essence mutations (add_page, update_dna, etc.)

**Also fix:**
- Add fallback chain to MCP server (cache -> bundled, matching CLI behavior)
- Implement `components_used` in `decantr_check_drift` (currently dead code) or remove parameter
- Set `openWorldHint: true` on tools that make network calls (3-8, 10)
- Consolidate duplicate theme-match/page-exists logic in `decantr_check_drift` with `evaluateGuard()`

**Tests to write:**
- `packages/mcp-server/test/tools-v3.test.ts` -- v3-aware tool tests (10+ cases)
- `packages/mcp-server/test/accept-drift.test.ts` -- Drift resolution scenarios (8+ cases)
- `packages/mcp-server/test/update-essence.test.ts` -- Mutation operations (8+ cases)

**Dependencies:** Phase 0 + Phase A complete.

**Acceptance criteria:**
- All existing MCP tools handle v3 essences
- `decantr_accept_drift` correctly updates essence or drift log for all 4 resolution types
- `decantr_update_essence` correctly applies all 7 operation types
- MCP server has cache fallback when API is unavailable
- DNA acceptance requires explicit `confirm_dna: true`
- No unused exports (`fuzzyScore`) or dead parameters (`components_used`)

**Estimated effort:** 3-4 days

**Risk:** Medium -- MCP tools are the primary interface for AI assistants. Must test thoroughly with real AI assistant workflows.

---

### Phase D: CLI Updates

**Scope:** Update CLI for v3, add `migrate` and `sync` commands, fix both DECANTR.md generation paths, align CSS generation.

**Files to change:**
- `packages/cli/src/index.ts` -- Update `init` to generate v3, add `migrate` command
- `packages/cli/src/scaffold.ts` -- Generate v3 essence with DNA axiom confirmation step. Update CSS generation (`tokens.css`, `decorators.css`) to read from v3 structure (`dna.theme` instead of `theme`). Fix `scaffoldMinimal()` to use template instead of inline markdown.
- `packages/cli/src/templates/DECANTR.md.template` -- Rewrite for two-layer model, reference real `decantr_accept_drift` and `decantr_update_essence` tools
- `packages/cli/src/registry.ts` -- Fix fragile bundled content path resolution (`../src/bundled/` from dist)

**New files:**
- `packages/cli/src/commands/migrate.ts` -- v2->v3 migration command (with backup)
- `packages/cli/src/commands/sync.ts` -- Interactive drift resolution

**Also fix:**
- `heal` command should be deprecated or renamed to `check` (it doesn't heal anything)
- `scaffoldMinimal()` should use the template engine instead of inline markdown (currently generates an inferior DECANTR.md)
- `suggest` command is functionally identical to `search` -- consolidate or differentiate
- Duplicate theme creation paths (`decantr theme create` vs `decantr create theme`) -- pick one
- `require('node:fs')` in ESM context in `buildRegistryContext()`

**Tests to write:**
- `packages/cli/test/migrate.test.ts` -- Migration command (5+ cases)
- `packages/cli/test/sync.test.ts` -- Sync command (5+ cases)
- `packages/cli/test/e2e/init-v3.test.ts` -- V3 init flow (3+ cases)
- `packages/cli/test/scaffold-minimal.test.ts` -- Minimal scaffold generates correct v3 (3+ cases)

**Dependencies:** Phase 0 + Phase A complete.

**Acceptance criteria:**
- `decantr init` generates v3 essence with DNA/Blueprint split
- `decantr migrate` converts v2 files to v3 in-place with backup
- `decantr sync` interactively resolves drift log entries
- DECANTR.md correctly explains the two-layer model and references real tools
- Both `scaffoldProject()` and `scaffoldMinimal()` produce consistent v3 DECANTR.md
- CSS generation (`tokens.css`, `decorators.css`) works with v3 essence structure
- All existing CLI commands work with both v2 and v3

**Estimated effort:** 4-5 days

**Risk:** Medium -- two DECANTR.md code paths, CSS generation changes, and fragile bundled paths all need careful testing.

---

### Phase E: Registry Package Cleanup + CSS Pipeline

**Scope:** Fix accumulated technical debt in the registry package, add CSS to the build/publish pipeline.

**Files to change:**
- `packages/registry/src/wiring.ts` -- Make wiring data-driven from pattern IO declarations (`produces`/`consumes` fields already exist on patterns but are ignored)
- `packages/registry/src/client.ts` -- Remove (merge into `api-client.ts`)
- `packages/registry/src/api-client.ts` -- Absorb `createRegistryClient()` interface
- `packages/registry/src/resolver.ts` -- Add `source: 'installed'` path, or remove from type
- `packages/registry/src/types.ts` -- Add typed `Blueprint` and `Shell` interfaces (currently `Record<string, unknown>`). Unify `ContentType` (5 values) and `ApiContentType` (6 values, includes `shells`)

**Client merge impact:**
- `packages/mcp-server/src/helpers.ts` imports `RegistryAPIClient` from registry -- no change needed
- `packages/cli/src/registry.ts` uses its own `RegistryClient` class (not from the package) -- no change needed
- But verify no other consumers use `createRegistryClient` from `client.ts`

**CSS pipeline fixes:**
- Add `packages/css/` to root `package.json` build script
- Add `@decantr/css` to `.github/workflows/publish.yml`
- Make `packages/css/tsconfig.json` extend `../../tsconfig.base.json`

**Tests to write:**
- `packages/registry/test/wiring-dynamic.test.ts` -- Data-driven wiring from pattern IO (5+ cases)

**Dependencies:** None -- can run in parallel with Phases B-D.

**Acceptance criteria:**
- Wiring rules are derived from pattern IO declarations, not hardcoded
- Single API client with consistent error handling and caching
- `Blueprint` and `Shell` have typed interfaces
- `ContentType` includes `'shell'`
- No dead code in the registry package
- `@decantr/css` builds in CI and publishes to npm

**Estimated effort:** 3-4 days

**Risk:** Low-Medium -- client merge affects both MCP and CLI import paths.

---

### Phase F: API & Platform Hardening

**Scope:** Fill critical test coverage gaps, wire API to use `@decantr/essence-spec`, fix infrastructure issues.

**Files to change/create:**
- `apps/api/package.json` -- Add `@decantr/essence-spec: workspace:*` dependency
- `apps/api/src/routes/content.ts` -- Replace minimal validation with `validateEssence()` from essence-spec, supporting both v2 and v3
- `apps/api/test/routes/` -- Test files for each route group (content, auth, billing, admin, orgs)
- `apps/api/test/middleware/` -- Auth and rate-limit middleware tests
- `apps/api/Dockerfile` -- Fix to run `dist/index.js` instead of `src/index.js`

**Focus areas:**
1. Wire `@decantr/essence-spec` into the API for content validation (both v2 and v3)
2. API route handler tests -- at least happy-path + auth-failure for each endpoint
3. Stripe webhook handler tests -- mock webhook events for each type
4. Rate limiter tests -- verify tier-based limits
5. Auth middleware tests -- JWT validation, API key hashing, tier checking
6. Fix Dockerfile to run compiled output

**Also fix:**
- Web app middleware wiring (`proxy.ts` may not be correctly connected for Supabase session refresh)
- In-memory rate limiter -- document limitation (or replace with Redis-based if Upstash is available)

**Dependencies:** Phase 0 + Phase A complete (for v3-aware validation).

**Acceptance criteria:**
- Every API endpoint has at least one happy-path and one error-path test
- Content validation uses `@decantr/essence-spec`'s `validateEssence()` for both v2 and v3
- Stripe webhook handlers have mock tests for all 4 event types
- Dockerfile correctly runs the built output
- Rate limiter tests verify tier limits
- Auth middleware properly validates JWT and API key authentication

**Estimated effort:** 5-7 days

**Risk:** Medium -- requires mocking Supabase and Stripe. May need test infrastructure setup. Wiring `@decantr/essence-spec` into the API introduces a new workspace dependency.

---

### Phase Summary

| Phase | What | Effort | Dependencies | Priority |
|-------|------|--------|-------------|----------|
| 0 | Foundation fixes (detection, discrimination, routing) | 2-3 days | None | **P0 -- Prerequisite** |
| A | Essence v3 schema + migration | 3-4 days | Phase 0 | **P0 -- Foundation** |
| B | Core pipeline v3 | 3-4 days | 0 + A | P1 |
| C | MCP server updates | 3-4 days | 0 + A | **P0 -- User-facing** |
| D | CLI updates | 4-5 days | 0 + A | P1 |
| E | Registry cleanup + CSS pipeline | 3-4 days | None | P2 |
| F | API hardening | 5-7 days | 0 + A | P2 |
| G | Content migration (decantr-content) | 3-4 days | 0 + A | **P0 -- Required for v3 launch** |

**Critical path:** 0 -> A -> (B + C + D + G in parallel) -> integration test

**Parallel track:** E and F can start immediately and run alongside everything.

**Total estimated effort:** 27-35 days of focused work.

---

## 5. Content Migration Strategy

### 5.1 The Problem

The `decantr-content` repository has **214 items** (97 patterns, 59 archetypes, 17 themes, 17 blueprints, 13 shells, 11 recipes). These content items are consumed by:

1. **The registry API** -- serves them to users via `api.decantr.ai`
2. **The MCP server** -- fetches them from the API for AI assistants
3. **The CLI** -- fetches them for `init`, `search`, `get`, `list`, `validate`
4. **The core pipeline** -- resolves patterns, recipes, themes to build IR trees

The v3 Essence file restructures where design properties live (DNA/Blueprint/Meta). But **the content items themselves are not Essence files** -- they are patterns, archetypes, recipes, themes, blueprints, and shells. The question is: does v3 change how content is structured, or only how the Essence file is structured?

### 5.2 What Changes and What Doesn't

**Content types that do NOT need structural migration:**

| Type | Count | Why |
|------|-------|-----|
| Patterns | 97 | Patterns are pure structural/compositional. They define layout slots and reference components. No theme/DNA properties. Load-bearing fields (`id`, `presets`, `io`, `components`, `code`) are unchanged by v3. |
| Shells | 13 | Shells are spatial layout containers. No color/typography/DNA properties. Load-bearing fields (`id`, `layout`, `config`, `configurable`) are unchanged. |

**Content types that need schema normalization (but not DNA restructuring):**

| Type | Count | Issue | Migration |
|------|-------|-------|-----------|
| Blueprints | 17 | Two schema versions coexist (`blueprint.v1.json` vs `decantr-vignette-v1.0`). Some use `suggested_theme`, others use `theme`. | Normalize all to a single schema. Add explicit `personality` -> maps to `dna.personality` in generated essences. |
| Archetypes | 59 | Legacy archetypes lack `$schema`, `decantr_compat`, `classification`, `suggested_theme`. V2 archetypes have `suggested_theme.styles` + `suggested_theme.modes`. | Add missing fields to legacy items. Ensure `suggested_theme` maps cleanly to `dna.theme` when used in `decantr init`. |

**Content types that need DNA-awareness:**

| Type | Count | DNA properties carried | Migration |
|------|-------|----------------------|-----------|
| Themes | 17 | `seed` (colors), `palette`, `modes`, `shapes`, `personality`, `tokens`, `cvd_support` | These ARE DNA source data. When a user selects a theme, these values populate `dna.color`, `dna.radius` (from shapes), `dna.accessibility` (from cvd_support). No schema change needed -- the CLI reads these fields to generate DNA defaults. But we should add: `typography` hints (font scale, weights) and `motion` hints to themes, so DNA defaults for new fields can be inferred. |
| Recipes | 11 | `spatial_hints` (density), `animation` (motion), `visual_effects`, `shell` preferences, `decorators` | Recipes ARE DNA source data for spacing, motion, and visual treatment. When a user selects a recipe, these values influence `dna.spacing` (from `spatial_hints`), `dna.motion` (from `animation`), `dna.elevation` (from `visual_effects.intensity`). No schema change needed -- the CLI and pipeline read these fields to compute DNA. But we should add: explicit `typography` hints and `radius` hints to recipes. |

### 5.3 Migration Plan for `decantr-content`

#### Phase G: Content Migration (runs parallel with B/C/D)

**Step 1: Schema normalization (no DNA changes)**

Normalize all 214 items to consistent schemas:

```
patterns/     -- Already consistent v2 format. No changes needed.
shells/       -- Already consistent. No changes needed.
archetypes/   -- Normalize legacy items to v2 format:
                 - Add $schema, decantr_compat where missing
                 - Add classification for legacy items
                 - Ensure all have suggested_theme
blueprints/   -- Normalize to single schema:
                 - Standardize on one key name (theme vs suggested_theme)
                 - Add $schema where missing
                 - Ensure personality is always an array
recipes/      -- Already consistent v2 format. No changes needed.
themes/       -- Already consistent v1 format. No changes needed.
```

**Step 2: Add DNA-inference hints to themes and recipes**

Add optional fields that the CLI uses to generate better DNA defaults:

```json
// Theme addition -- typography and motion hints
{
  "id": "luminarum",
  // ... existing fields ...
  "typography_hints": {
    "scale": "modular",
    "heading_weight": 600,
    "body_weight": 400,
    "font_family_suggestion": "system-ui"
  },
  "motion_hints": {
    "preference": "subtle",
    "reduce_motion_default": true
  }
}
```

```json
// Recipe addition -- radius hints
{
  "id": "auradecantism",
  // ... existing fields ...
  "radius_hints": {
    "philosophy": "rounded",
    "base": 8
  }
}
```

These are **additive** -- they don't break any existing consumers because they're optional fields. The CLI's `scaffoldProject()` reads them when generating `dna.typography`, `dna.motion`, and `dna.radius` defaults.

**Step 3: Update `validate.js`**

The current validator in `decantr-content` only checks for `id` or `slug`. Update it to:
- Validate each item against its declared `$schema` (using Ajv)
- Report items missing `$schema`
- Optionally validate against `@decantr/essence-spec` schema for essence files

**Step 4: Write a migration script**

Create `tools/migrate-content.ts` in the monorepo:

```typescript
// Reads all 214 items from decantr-content
// Applies normalization rules per type
// Adds DNA-inference hints to themes/recipes
// Validates all items post-migration
// Writes back to decantr-content directory
```

Run once, commit the results, publish new content versions.

**Step 5: Update the bundled CLI content**

The CLI bundles 8 fallback content items in `packages/cli/src/bundled/`:
- `blueprints/default.json` -- update schema, normalize `theme` key
- `themes/default.json` -- add `typography_hints` and `motion_hints`
- `shells/default.json` -- no changes needed
- `patterns/*.json` (5 files) -- no changes needed

**Estimated effort:** 3-4 days

**Risk:** Low -- all changes are additive. No existing consumers break. The migration script can be tested against fixtures first.

### 5.4 Load-Bearing Property Paths (must survive migration)

These are the exact property paths that the core pipeline, CLI, and MCP server access on content items. Any migration that moves, renames, or removes these fields will break the system:

**Patterns (consumed by core + registry):**
- `pattern.id`, `pattern.name`, `pattern.components`, `pattern.contained`
- `pattern.default_preset`, `pattern.presets`, `pattern.code`
- `pattern.presets[*].layout.layout`, `pattern.presets[*].layout.atoms`, `pattern.presets[*].layout.slots`
- `pattern.presets[*].code.imports`, `pattern.presets[*].code.example`
- `pattern.io.produces`, `pattern.io.consumes`, `pattern.io.actions`

**Recipes (consumed by core + CLI):**
- `recipe.spatial_hints.density_bias`, `recipe.spatial_hints.content_gap_shift`, `recipe.spatial_hints.card_wrapping`
- `recipe.shell.root`, `recipe.shell.nav`, `recipe.shell.header`, `recipe.shell.nav_style`, `recipe.shell.dimensions`
- `recipe.visual_effects.enabled`, `recipe.visual_effects.type_mapping`, `recipe.visual_effects.component_fallback`, `recipe.visual_effects.intensity`, `recipe.visual_effects.intensity_values`
- `recipe.pattern_preferences.default_presets`
- `recipe.decorators` (CLI-only, for CSS generation)

**Archetypes (consumed by CLI):**
- `archetype.pages[].id`, `archetype.pages[].shell`, `archetype.pages[].default_layout`
- `archetype.pages[].patterns[].pattern`, `archetype.pages[].patterns[].preset`, `archetype.pages[].patterns[].as`
- `archetype.features`
- `archetype.seo_hints.schema_org`, `archetype.seo_hints.meta_priorities`

**Themes (consumed by CLI):**
- `theme.seed.primary`, `theme.seed.secondary`, `theme.seed.accent`
- `theme.palette.*[mode]` (background, surface, surface-raised, border, text, text-muted, primary-hover)
- `theme.tokens.base.success`, `theme.tokens.base.danger`, `theme.tokens.base.warning`
- `theme.cvd_support`, `theme.modes`, `theme.shapes`

**Blueprints (consumed by CLI):**
- `blueprint.compose` (array of archetype IDs)
- `blueprint.theme` or `blueprint.suggested_theme` (style, mode, recipe, shape)
- `blueprint.personality` (array)
- `blueprint.overrides` (pattern preset overrides)

**None of these paths change in the v3 migration.** Content migration is purely additive (new optional fields) and normalization (consistent schemas).

---

## 6. Honest Assessment

### Is this solving a real problem?

**Yes, but the market is narrower than "OpenAPI for UI" implies.** Design drift is real -- any team with AI-assisted code generation has experienced it. But the severity varies enormously. Solo developers building MVPs don't care. Teams with design systems and brand guidelines care a lot. The sweet spot is teams of 3-10 developers using AI code generation on a product with established design language.

The "OpenAPI for UI" framing is aspirational. OpenAPI succeeded because it solved machine-to-machine interop (client generation, server stubs, documentation). Decantr solves human-to-machine interop (developer intent -> AI understanding). These are different problems. A more accurate framing: **"Design system enforcement for the AI code generation era."**

### Can this succeed as a solo-founder effort?

For the monorepo scope (essence spec, guard system, MCP server, CLI, registry) -- yes. This is a focused developer tool with a clear value chain. The API and web app are already built. The DNA/Blueprint split and bi-directional drift resolution are achievable solo.

For the decantr-meta scope (7 layers, 5 domains, intelligence, prediction, audit, compliance, marketplace) -- absolutely not as a solo effort.

### 6-month kill criterion

If, after 6 months with the DNA/Blueprint split and bi-directional drift shipped:
- Fewer than 500 weekly active MCP tool calls (across all users)
- Fewer than 50 projects with an active `decantr.essence.json`
- No organic mentions in developer communities (Twitter/X, Discord, HN)

Then the thesis is invalidated and the project should be shelved or pivoted.

### Single most impactful 1-week build

**Ship `decantr_accept_drift` and `decantr_update_essence` MCP tools with the current v2 schema.** Don't wait for the v3 split. These two tools transform Decantr from a read-only lint tool into an interactive design partner. An AI assistant that can both detect drift AND fix it (with developer approval) is immediately more valuable than one that only reports problems.

> **Important caveat:** Even shipping these tools on v2 requires Phase 0's foundation fixes to avoid creating a migration burden later. At minimum, add version detection to the normalizer so v3 can be added incrementally.

### Competitive moat

If Anthropic, Vercel, or Cursor built native design drift detection:
- They would likely build it as a feature within their existing products
- They would NOT build a content registry of 97+ patterns, 59+ archetypes, 17+ blueprints
- They would NOT build the recipe/theme/decoration system
- The registry content and the community around it IS the moat

**Defensibility:** The content registry and the community that contributes to it. Raw drift detection is commoditizable. A curated, structured library of UI patterns with IO contracts, presets, and wiring rules is not.

### Does the DNA/Blueprint split actually solve the core identity crisis?

**Mostly yes.** It cleanly separates "things that should never change without deliberate intent" (DNA) from "things that naturally evolve as you build" (Blueprint). The key improvement is that Blueprint changes become tracked history rather than violations -- this means the guard system stays credible because it only fires hard errors for actual design axiom violations.

**The remaining risk** is DNA scope creep -- developers might put too much into DNA (every decision feels "important" when you're making it) and end up with the same over-enforcement problem. Mitigation: the `decantr init` flow should suggest a minimal DNA (theme + spacing + accessibility) and let developers add more axioms over time.

### What changed from v1 of this plan

| Area | v1 Plan | v2 Correction |
|------|---------|---------------|
| Phase count | 6 phases (A-F) | 8 phases (0-G) |
| Total effort | 15-20 days | 27-35 days |
| Foundation | Not addressed | Phase 0 -- version detection, type discrimination, validator routing |
| CSS package | Mentioned in audit, no phase | Phase E includes CSS pipeline integration |
| Content migration | Not addressed | Phase G -- 214 items in decantr-content |
| Apps decoupling | Not identified | Phase F -- wire @decantr/essence-spec into API |
| DECANTR.md paths | One mentioned | Phase D -- both scaffoldProject() and scaffoldMinimal() |
| Guard rule count | Inconsistent (6 vs 8) | Phase 0 -- update CLAUDE.md to document all 8 |
| `decantr-test-app` | Referenced as evidence | Does not exist -- removed reference |
| `heal` command | Not addressed | Phase D -- deprecate or rename |
| Bundled content | Not addressed | Phase G Step 5 -- update 8 bundled items |
| Blueprint schema inconsistency | Not identified | Phase G -- normalize 17 blueprints to single schema |
| Typed Blueprint/Shell | Not identified | Phase E -- add interfaces |
| Dockerfile bug | Not identified | Phase F -- fix to run dist/ |
| Web app middleware | Not identified | Phase F -- verify proxy.ts wiring |
