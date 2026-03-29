# Decantr Deep Audit & Evolution Plan

> Generated 2026-03-29 from full codebase analysis of every source file across all packages and apps.

---

## Table of Contents

1. [Audit Findings](#1-audit-findings)
2. [The DNA/Blueprint Split](#2-the-dnablueprint-split)
3. [Bi-directional Drift Resolution](#3-bi-directional-drift-resolution)
4. [Implementation Roadmap](#4-implementation-roadmap)
5. [Honest Assessment](#5-honest-assessment)

---

## 1. Audit Findings

### 1.1 Strengths

**Guard system is well-designed.** 8 distinct rules across 3 enforcement tiers (creative/guided/strict), proper severity levels, fuzzy "did you mean?" suggestions. The `evaluateGuard()` function in `packages/essence-spec/src/guard.ts` is cleanly structured with individual check functions. This is the product's core differentiator and it works.

**Type system is comprehensive.** 26 exported types from essence-spec, 24 from registry, 22 from core. The discriminated union `EssenceFile = Essence | SectionedEssence` with runtime discriminators `isSimple()`/`isSectioned()` is clean. The wine-to-normalized terminology migration is complete in the type layer.

**Registry content tests are excellent.** 138 tests across 16 files in `packages/registry/test/` validate individual patterns (activity-feed, card-grid, chart-grid, cta-section, data-table, detail-header, filter-bar, form-sections, kpi-grid) and archetypes (content-site, ecommerce, portfolio). Each test validates JSON structure, presets, IO declarations, components, code quality, and preset resolution.

**API is full-featured.** The Hono-based API in `apps/api/` has auth (JWT + API key), tiered rate limiting, Stripe billing (checkout, portal, webhooks), moderation queue with reputation system, org/team support, and content publishing. 25+ endpoints covering the full registry platform lifecycle.

**Web app is functional.** Next.js 16 + React 19 + Tailwind 4 + Supabase SSR. Registry browser with search/filter, dashboard with API key management, admin moderation panel, OAuth login (GitHub, Google).

**IR pipeline is genuinely useful.** The core package transforms an Essence spec into a framework-agnostic IR tree with resolved patterns, presets, wiring signals, visual effects, card wrapping logic, and shell configuration. This is the kind of structured output that actually helps AI code generators produce coherent UIs.

**CLI init flow is thorough.** Project detection (framework, package manager, TypeScript, Tailwind, existing AI rule files), blueprint selection with registry search, interactive prompts, CSS token generation from theme seeds, decorator CSS generation from recipe descriptions.

### 1.2 Critical Issues

#### The Blueprint/Contract Conflict (Core Problem)

The Essence file serves dual roles:

1. **Blueprint** — Initial scaffolding decisions (which patterns on which pages, shell choices, feature list)
2. **Contract** — Ongoing enforcement (theme consistency, spacing tokens, layout order)

These roles directly conflict. In strict guard mode, every intentional design change becomes a "violation." The test app (`decantr-test-app/decantr.essence.json`) demonstrates this: a gaming community app with strict mode means any layout reordering, page addition, or pattern swap triggers guard errors. The developer must manually update the essence before making any change, which inverts the natural workflow (change code → update spec) into an unnatural one (update spec → change code).

**Impact:** Guard system loses credibility. Developers will either abandon strict mode or stop using Decantr entirely.

#### One-Directional Drift

Drift detection is read-only. The MCP `decantr_check_drift` tool reports violations but provides no way to resolve them. The DECANTR.md instructs AI assistants to "STOP and ask the user to update the essence," but there's no tool for the AI to actually perform that update. The `decantr_update_essence` MCP tool referenced in DECANTR.md line 393 **does not exist**.

**Impact:** Every drift detection creates manual work with no assisted resolution path.

#### Sectioned Essence is Broken

`SectionedEssence` is a first-class type (defined, validated by schema, normalized from v1) but the core pipeline in `packages/core/src/resolve.ts` silently discards all sections except the first:

```typescript
// handle sectioned by flattening first section for now
```

**Impact:** Any project using sectioned essences will lose all sections after the first when processed through the IR pipeline.

#### Schema/Types Drift

`ColumnLayout` in TypeScript (`packages/essence-spec/src/types.ts`) has `breakpoints` and `responsive` fields that are NOT in the JSON schema (`packages/essence-spec/schema/essence.v2.json`). The schema has `additionalProperties: false`, so documents using these features will fail validation even though the TypeScript types allow them.

**Impact:** Silent validation failures for valid use cases.

#### Dead Code and Unfinished Features

| Location | Issue |
|----------|-------|
| `packages/mcp-server/src/tools.ts` — `decantr_check_drift` | `components_used` parameter is accepted but never used |
| `packages/mcp-server/src/helpers.ts` — `fuzzyScore()` | Exported but never called by any tool |
| `packages/core/src/types.ts` — `IRNavNode`, `IRSlotNode` | Defined but never constructed |
| `packages/registry/src/client.ts` — `cacheDir`, `cacheTtl` options | Accepted but never used |
| `packages/core/src/types.ts` — `source: 'installed'` | Defined in union type but unreachable |

#### MCP Server Has No Fallback

The MCP server uses `RegistryAPIClient` directly — API only, no cache, no custom, no bundled fallback. If `api.decantr.ai` is down, all resolve/search/suggest tools fail. The CLI has a proper fallback chain (Custom → API → Cache → Bundled) but the MCP server does not.

**Impact:** MCP tools are unreliable for offline or air-gapped development.

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

The `decantr-content` repo maintains official registry items. Patterns are detailed enough to be useful — they include component lists, layout types (row/stack/grid), IO contracts (produces/consumes/actions), code snippets, and multiple presets. Archetypes provide page structures with feature dependencies. Recipes capture spatial hints, shell decoration, and visual effects.

**Strength:** Pattern IO contracts enable wiring detection. The `produces`/`consumes` model is a good foundation for cross-pattern communication.

**Weakness:** Wiring is hardcoded to 3 pairs in `packages/registry/src/wiring.ts` (filter-bar+data-table, filter-bar+activity-feed, filter-bar+card-grid). Any new pattern combination requires code changes. Wiring rules should be data-driven from pattern IO declarations, not hardcoded.

### 1.5 CSS Package Assessment

`@decantr/css` is a standalone CSS-in-JS atomic runtime (300+ atoms, responsive prefixes, pseudo-classes, container queries, SSR support, CSS layers). It's well-built with solid architecture (microtask batching, `@layer` ordering, color-mix opacity).

**Assessment:** This package is scope creep for the core product. Decantr's value proposition is design intelligence and drift prevention, not a CSS runtime. Most projects using Decantr will already have Tailwind, UnoCSS, or framework CSS. The CSS package adds maintenance burden without serving the core mission.

**Recommendation:** Keep it as an optional companion package but do not invest further. It should not be part of the critical path for any implementation plan.

### 1.6 Competitive Context: drift-guard

`drift-guard` takes a snapshot-based approach: capture the current state of your design tokens/components as a baseline, then diff against it on each commit/PR. It's a CLI tool, not an MCP server.

**Decantr advantages:** Richer semantic model (patterns, archetypes, recipes vs. flat snapshots), AI-native (MCP tools), content registry, blueprint-driven scaffolding.

**drift-guard advantages:** Simpler mental model, works with existing code (no spec file to maintain), snapshot-based means the spec auto-updates when code changes (bi-directional by default).

**Key lesson:** drift-guard's snapshot approach solves the blueprint/contract conflict by making the code the source of truth and detecting deviations from a known-good state. Decantr should learn from this — the DNA layer should be developer-declared invariants, and the Blueprint layer should auto-track from code state.

---

## 2. The DNA/Blueprint Split

### 2.1 Architecture

Split the flat Essence file into two conceptual layers within the same file:

```
decantr.essence.json
├── dna {}          ← Guarded. Developer-declared design axioms.
│                     Violations here are real drift.
│
├── blueprint {}    ← Tracked. Scaffolding decisions that evolve.
│                     Changes are logged as history, not violations.
│
└── meta {}         ← Metadata. Version, target, features.
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
- `blueprint` is loosely typed — `pages[].layout` allows arbitrary pattern refs, and `dna_overrides` accepts any subset of DNA properties
- `meta.guard` gains `dna_enforcement` and `blueprint_enforcement` fields
- `version` moves to top level and must be `"3.0.0"`

### 2.3 Migration Path (v2 → v3)

```
v2 flat essence
├── theme → dna.theme
├── personality → dna.personality
├── density → dna.spacing (remap fields)
├── accessibility → dna.accessibility
├── guard → meta.guard (add enforcement split)
├── structure → blueprint.pages (rename structure→pages)
├── features → blueprint.features
├── platform → meta.platform
├── archetype → meta.archetype
├── target → meta.target
└── version → "3.0.0"
```

New fields with sensible defaults:
- `dna.typography` — inferred from recipe if available, else `{ scale: "modular", heading_weight: 600, body_weight: 400 }`
- `dna.color` — `{ palette: "semantic", accent_count: 1, cvd_preference: "auto" }`
- `dna.radius` — inferred from `theme.shape`: pill→12, rounded→8, sharp→2
- `dna.elevation` — `{ system: "layered", max_levels: 3 }`
- `dna.motion` — `{ preference: "subtle", duration_scale: 1.0, reduce_motion: true }`
- `meta.guard.dna_enforcement` — mapped from v2 `guard.mode`: strict→"error", guided→"error", creative→"off"
- `meta.guard.blueprint_enforcement` — strict→"warn", guided→"off", creative→"off"

**Implementation:** Add `migrateV2ToV3()` to `packages/essence-spec/src/normalize.ts` alongside the existing `normalizeEssence()` (v1→v2). The CLI `init` command generates v3 by default. The `validate` command accepts both v2 and v3 (detects by `version` field).

### 2.4 Updated Guard Rules

| Rule | DNA | Blueprint | Behavior Change |
|------|-----|-----------|----------------|
| 1. Style match | Yes | No | No change — checks `dna.theme.style` |
| 2. Page exists | No | Yes | **Downgraded** from error to warning. Auto-suggests adding page to blueprint. |
| 3. Layout order | No | Yes | **Downgraded** from error to advisory. Auto-suggests reordering or updating blueprint. |
| 4. Recipe match | Yes | No | No change — checks `dna.theme.recipe` |
| 5. Density | Yes | No | No change — checks `dna.spacing.content_gap`. Page-level overrides from `blueprint.pages[].dna_overrides.density` are respected. |
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
| `decantr_accept_drift` | **NEW** — see Phase 3 below. |
| `decantr_update_essence` | **NEW** — applies patches to DNA or Blueprint layer. |

### 2.6 CLI Changes

- `decantr init` generates v3 essence by default, with an interactive step to confirm DNA axioms
- `decantr validate` accepts v2 and v3, reports which layer violations belong to
- `decantr migrate` — **NEW** command to migrate v2 → v3
- `decantr status` shows DNA axioms and Blueprint page count separately
- DECANTR.md template updated to explain the two-layer model

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

This replaces the phantom `decantr_update_essence` referenced in DECANTR.md line 393 with a real implementation.

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

**CLI command** — `decantr sync`:

1. Reads `.decantr/drift-log.json`
2. For each deferred violation, presents an interactive accept/reject/skip prompt
3. Accepted changes are applied to the essence file
4. Rejected changes generate a `.decantr/revert-suggestions.md` with code diff hints
5. The drift log is cleared of resolved items

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
Browser ←→ WebSocket ←→ Vite Plugin ←→ Essence File
                              ↓
                        Guard Engine
                              ↓
                     Drift Notifications
                     (via Vite error overlay)
```

**MVP (detection only):**
- Watches `decantr.essence.json` and source files for changes
- On source file save, runs guard evaluation
- Pushes violations to Vite's error overlay as warnings
- No interactive resolution — just visibility

**V2 (interactive):**
- Local WebSocket server on a random port
- Custom overlay component with accept/reject/defer buttons
- Buttons send resolution back through WebSocket → plugin → essence file update

**Auto-wiring in `decantr init`:**
- Detect Vite config (`vite.config.ts/js`)
- Add `import decantr from '@decantr/vite-plugin'` to plugins array
- Detect Next.js config → suggest adding to `next.config.ts` via `withDecantr()` wrapper

**ESLint plugin concept** (`eslint-plugin-decantr`):
- `decantr/theme-consistency`: Warn when CSS classes don't match the essence theme
- `decantr/page-declared`: Warn when a route file exists without a corresponding essence page
- `decantr/spacing-tokens`: Warn when hardcoded pixel values appear instead of design tokens
- Maps to DNA guard rules 1, 5, 6

### 3.5 Priority Order

1. `decantr_accept_drift` MCP tool — highest impact, enables AI-assisted resolution
2. `decantr_update_essence` MCP tool — unblocks the DECANTR.md reference
3. CLI `decantr sync` command — enables non-MCP workflow
4. Drift log format + DECANTR.md instructions — enables file-based workflow
5. Vite plugin MVP — detection only
6. ESLint plugin — enforcement in editor
7. Vite plugin V2 — interactive resolution

---

## 4. Implementation Roadmap

### Phase A: Essence v3 Schema Split (Foundation)

**Scope:** Split the flat essence into DNA/Blueprint/Meta layers.

**Files to change:**
- `packages/essence-spec/src/types.ts` — New types: `EssenceDNA`, `EssenceBlueprint`, `EssenceMeta`, `EssenceV3`
- `packages/essence-spec/schema/essence.v3.json` — New JSON schema
- `packages/essence-spec/src/validate.ts` — Support both v2 and v3 validation
- `packages/essence-spec/src/normalize.ts` — Add `migrateV2ToV3()`
- `packages/essence-spec/src/guard.ts` — Add `layer` field to violations, `autoFixable` flags
- `packages/essence-spec/src/index.ts` — Export new types and functions

**New files:**
- `packages/essence-spec/schema/essence.v3.json`
- `packages/essence-spec/src/migrate.ts` — v2→v3 migration logic

**Tests to write:**
- `packages/essence-spec/test/migrate.test.ts` — v2→v3 conversion (10+ cases)
- `packages/essence-spec/test/validate-v3.test.ts` — v3 schema validation (15+ cases)
- `packages/essence-spec/test/guard-v3.test.ts` — Layer-aware guard evaluation (10+ cases)

**Dependencies:** None — this is the foundation.

**Acceptance criteria:**
- v3 schema validates correctly with DNA/Blueprint/Meta sections
- v2 documents still validate (backward compatible)
- `migrateV2ToV3()` correctly transforms all existing test fixtures
- Guard violations carry `layer` and `autoFixable` metadata
- All existing tests still pass

**Estimated effort:** 2-3 days

**Risk:** Medium — schema changes ripple through every package. Mitigate with backward-compatible v2 support.

---

### Phase B: Core Pipeline v3 Support

**Scope:** Update the IR pipeline to consume v3 essences.

**Files to change:**
- `packages/core/src/resolve.ts` — Read from `dna` and `blueprint` layers, respect `dna_overrides`
- `packages/core/src/pipeline.ts` — Detect v2 vs v3, auto-migrate v2 before processing
- `packages/core/src/types.ts` — Add `layer` metadata to IR nodes

**Also fix:**
- Sectioned essence handling (currently discards all but first section)
- `ColumnLayout.breakpoints`/`responsive` schema gap (add to v3 schema)
- Remove dead IR node types (`IRNavNode`, `IRSlotNode`) or implement them

**Tests to write:**
- `packages/core/test/pipeline-v3.test.ts` — v3 essence through full pipeline (6+ cases)
- `packages/core/test/resolve-v3.test.ts` — DNA override resolution, per-page overrides (6+ cases)

**Dependencies:** Phase A complete.

**Acceptance criteria:**
- v3 essences produce correct IR trees
- v2 essences still work (auto-migrated internally)
- Per-page DNA overrides are reflected in IR node metadata
- Sectioned essences process all sections (not just first)

**Estimated effort:** 2 days

**Risk:** Low — the pipeline is already well-structured for this change.

---

### Phase C: MCP Server Updates

**Scope:** Update existing tools for v3, add `decantr_accept_drift` and `decantr_update_essence`.

**Files to change:**
- `packages/mcp-server/src/tools.ts` — Update all 10 tools for v3, add 2 new tools
- `packages/mcp-server/src/helpers.ts` — Add essence file write helpers, drift log helpers

**New tools:**
- `decantr_accept_drift` — Resolve violations with accept/scope/reject/defer
- `decantr_update_essence` — Structured essence mutations (add_page, update_dna, etc.)

**Also fix:**
- Add fallback chain to MCP server (cache → bundled, matching CLI behavior)
- Implement `components_used` in `decantr_check_drift` (currently dead code)
- Remove unused `fuzzyScore` import or wire it into pattern suggestion

**Tests to write:**
- `packages/mcp-server/test/tools-v3.test.ts` — v3-aware tool tests (10+ cases)
- `packages/mcp-server/test/accept-drift.test.ts` — Drift resolution scenarios (8+ cases)
- `packages/mcp-server/test/update-essence.test.ts` — Mutation operations (8+ cases)

**Dependencies:** Phase A complete (Phase B not required — MCP tools work at the spec level, not IR level).

**Acceptance criteria:**
- All existing MCP tools handle v3 essences
- `decantr_accept_drift` correctly updates essence or drift log for all 4 resolution types
- `decantr_update_essence` correctly applies all 7 operation types
- MCP server has cache fallback when API is unavailable
- DNA acceptance requires explicit `confirm_dna: true`

**Estimated effort:** 3 days

**Risk:** Medium — MCP tools are the primary interface for AI assistants. Must test thoroughly with real AI assistant workflows.

---

### Phase D: CLI Updates

**Scope:** Update CLI for v3, add `migrate` and `sync` commands.

**Files to change:**
- `packages/cli/src/index.ts` — Update `init` to generate v3, add `migrate` command
- `packages/cli/src/scaffold.ts` — Generate v3 essence with DNA axiom confirmation step
- `packages/cli/src/templates/DECANTR.md.template` — Rewrite for two-layer model

**New files:**
- `packages/cli/src/commands/migrate.ts` — v2→v3 migration command
- `packages/cli/src/commands/sync.ts` — Interactive drift resolution

**Also fix:**
- Update DECANTR.md generation to properly reference `decantr_accept_drift` and `decantr_update_essence` (currently references non-existent tools)
- Verify no `[object Object]` serialization issues exist (confirmed current code is clean, but add a regression test)

**Tests to write:**
- `packages/cli/test/migrate.test.ts` — Migration command (5+ cases)
- `packages/cli/test/sync.test.ts` — Sync command (5+ cases)
- `packages/cli/test/e2e/init-v3.test.ts` — V3 init flow (3+ cases)

**Dependencies:** Phase A complete.

**Acceptance criteria:**
- `decantr init` generates v3 essence with DNA/Blueprint split
- `decantr migrate` converts v2 files to v3 in-place with backup
- `decantr sync` interactively resolves drift log entries
- DECANTR.md correctly explains the two-layer model and references real tools
- All existing CLI commands work with both v2 and v3

**Estimated effort:** 2-3 days

**Risk:** Low — CLI is well-structured with clean separation of concerns.

---

### Phase E: Registry Package Cleanup

**Scope:** Fix accumulated technical debt in the registry package.

**Files to change:**
- `packages/registry/src/wiring.ts` — Make wiring data-driven from pattern IO declarations
- `packages/registry/src/client.ts` — Remove unused `cacheDir`/`cacheTtl` options, or implement them
- `packages/registry/src/resolver.ts` — Add `source: 'installed'` path, or remove from type

**Consolidation:**
- Merge `client.ts` (simple client) and `api-client.ts` (full client) into one `api-client.ts`. The simple client is a strict subset with no unique functionality.

**Tests to write:**
- `packages/registry/test/wiring-dynamic.test.ts` — Data-driven wiring from pattern IO (5+ cases)

**Dependencies:** None — can run in parallel with Phases B-D.

**Acceptance criteria:**
- Wiring rules are derived from pattern IO declarations, not hardcoded
- Single API client with consistent error handling and caching
- No dead code in the registry package

**Estimated effort:** 1-2 days

**Risk:** Low.

---

### Phase F: API & Platform Hardening

**Scope:** Fill critical test coverage gaps and fix platform issues.

**Files to change/create:**
- `apps/api/test/routes/` — Test files for each route group (content, auth, billing, admin, orgs)
- `apps/api/test/middleware/` — Auth and rate-limit middleware tests

**Focus areas:**
1. API route handler tests — at least happy-path + auth-failure for each endpoint
2. Stripe webhook handler tests — mock webhook events for each type
3. Rate limiter tests — verify tier-based limits
4. Auth middleware tests — JWT validation, API key hashing, tier checking

**Dependencies:** None — can run in parallel with all other phases.

**Acceptance criteria:**
- Every API endpoint has at least one happy-path and one error-path test
- Stripe webhook handlers have mock tests for all 4 event types
- Rate limiter respects tier limits correctly
- Auth middleware properly validates JWT and API key authentication

**Estimated effort:** 3-4 days

**Risk:** Medium — requires mocking Supabase and Stripe. May need test infrastructure setup.

---

### Phase Summary

| Phase | What | Effort | Dependencies | Priority |
|-------|------|--------|-------------|----------|
| A | Essence v3 schema split | 2-3 days | None | **P0 — Foundation** |
| B | Core pipeline v3 | 2 days | A | P1 |
| C | MCP server updates | 3 days | A | **P0 — User-facing** |
| D | CLI updates | 2-3 days | A | P1 |
| E | Registry cleanup | 1-2 days | None | P2 |
| F | API hardening | 3-4 days | None | P2 |

**Critical path:** A → (B + C + D in parallel) → integration test

**Parallel track:** E and F can start immediately and run alongside everything.

**Total estimated effort:** ~15-20 days of focused work.

---

## 5. Honest Assessment

### Is this solving a real problem?

**Yes, but the market is narrower than "OpenAPI for UI" implies.** Design drift is real — any team with AI-assisted code generation has experienced it. But the severity varies enormously. Solo developers building MVPs don't care. Teams with design systems and brand guidelines care a lot. The sweet spot is teams of 3-10 developers using AI code generation on a product with established design language.

The "OpenAPI for UI" framing is aspirational. OpenAPI succeeded because it solved machine-to-machine interop (client generation, server stubs, documentation). Decantr solves human-to-machine interop (developer intent → AI understanding). These are different problems. A more accurate framing: **"Design system enforcement for the AI code generation era."**

### Can this succeed as a solo-founder effort?

For the monorepo scope (essence spec, guard system, MCP server, CLI, registry) — yes. This is a focused developer tool with a clear value chain. The API and web app are already built. The DNA/Blueprint split and bi-directional drift resolution are achievable solo.

For the decantr-meta scope (7 layers, 5 domains, intelligence, prediction, audit, compliance, marketplace) — absolutely not as a solo effort. That's a venture-backed team of 5-10 engineers over 2 years. But that's a separate project.

### 6-month kill criterion

If, after 6 months with the DNA/Blueprint split and bi-directional drift shipped:
- Fewer than 500 weekly active MCP tool calls (across all users)
- Fewer than 50 projects with an active `decantr.essence.json`
- No organic mentions in developer communities (Twitter/X, Discord, HN)

Then the thesis is invalidated and the project should be shelved or pivoted.

### Single most impactful 1-week build

**Ship `decantr_accept_drift` and `decantr_update_essence` MCP tools with the current v2 schema.** Don't wait for the v3 split. These two tools transform Decantr from a read-only lint tool into an interactive design partner. An AI assistant that can both detect drift AND fix it (with developer approval) is immediately more valuable than one that only reports problems.

### Competitive moat

If Anthropic, Vercel, or Cursor built native design drift detection:
- They would likely build it as a feature within their existing products (e.g., Cursor's rules system)
- They would NOT build a content registry of 87+ patterns, 53+ archetypes, 16+ blueprints
- They would NOT build the recipe/theme/decoration system
- The registry content and the community around it IS the moat

**Defensibility:** The content registry and the community that contributes to it. Raw drift detection is commoditizable. A curated, structured library of UI patterns with IO contracts, presets, and wiring rules is not.

### Does the DNA/Blueprint split actually solve the core identity crisis?

**Mostly yes.** It cleanly separates "things that should never change without deliberate intent" (DNA) from "things that naturally evolve as you build" (Blueprint). The key improvement is that Blueprint changes become tracked history rather than violations — this means the guard system stays credible because it only fires hard errors for actual design axiom violations.

**The remaining risk** is DNA scope creep — developers might put too much into DNA (every decision feels "important" when you're making it) and end up with the same over-enforcement problem. Mitigation: the `decantr init` flow should suggest a minimal DNA (theme + spacing + accessibility) and let developers add more axioms over time as they discover what actually matters to them.
