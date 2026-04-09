# Decantr vNext Phase 2 — Contract Compiler and Execution Pack Foundation

**Date:** 2026-04-08
**Status:** Draft
**Author:** Codex
**Depends on:**
- `docs/programs/2026-04-08-decantr-vnext-master-program.md`
- `docs/specs/2026-04-08-vnext-phase-1-registry-contract-normalization-design.md`
**Companion audits:**
- `docs/audit/2026-04-08-system-baseline.md`
- `docs/audit/2026-04-08-registry-content-api-contract-audit.md`
- `docs/audit/2026-04-08-showcase-provenance-audit.md`

---

## Overview

Phase 2 is the turning point where Decantr stops acting like a prose-heavy guidance system and starts acting like a compiler for AI execution context.

The central change is architectural:

- Decantr content remains the source of design intelligence
- but the primary runtime output becomes compiled execution packs, not free-form markdown stitched together ad hoc

This phase establishes the pack schema, compilation pipeline, target adapters, and initial consumer surfaces needed to make Decantr genuinely LLM-first, token-efficient, and commercially repeatable.

## Goals

- Define one task-scoped execution pack contract for Decantr vNext.
- Compile registry content into deterministic scaffold and section packs.
- Preserve target, preset, shell, and theme identity all the way through the generation surface.
- Replace generic React-flavored examples with explicit target-aware example families.
- Make markdown a rendered view of compiled pack data rather than the primary source of truth.
- Give CLI and MCP consumers a stable pack interface they can rely on.

## Non-Goals

- Build the full verification engine.
- Support every framework on day one.
- Rewrite every content item to the new example format in this phase.
- Replace all existing CLI scaffolding flows immediately.
- Solve enterprise governance and hosted commercial policy concerns here.

---

## Core Problem Statement

Decantr’s current generation surface still has several structural problems:

- execution context is assembled from multiple prose-heavy sources
- important identity is lost during composition, especially preset and target specificity
- examples are inconsistent, incomplete, or framework-leaky
- token budgets are not explicit
- markdown artifacts are treated as the primary runtime object even though the consumer is a model

These issues limit first-pass quality even when the underlying design intelligence is strong.

Phase 2 exists to replace “documentation for models” with “compiled execution contracts for models.”

---

## Design Principles

### 1. One Pack Per Task Scope

Every common AI task should map to one primary pack:

- scaffold pack
- section pack
- page pack
- mutation pack
- review pack

The model should not need to read a graph of loosely connected files for a normal task.

### 2. Packs Are Data First, Markdown Second

The canonical object is structured data. Markdown is a renderer for human inspection and model compatibility.

### 3. Preserve Identity End to End

The compiler may not drop:

- target framework/runtime
- preset identity
- theme identity
- shell identity
- blueprint and archetype composition choices

If the compiler loses that information, the generated output becomes improvisational.

### 4. Target Adapters Own Framework Differences

Framework-specific concerns belong in adapters, not in generic content or prompt glue:

- imports
- routing conventions
- file layout
- CSS bootstrap
- JSX vs template syntax
- app shell conventions

### 5. Explicit Token Budgets

Each pack should carry an explicit token budget target and a packing strategy that prefers:

- compact vocabularies
- short canonical examples
- anti-pattern deltas instead of repeated prose
- only the content necessary for the current task scope

### 6. Compiler Inputs Must Be Verifiable

Examples, anti-patterns, imports, and setup rules need machine-readable shapes so Phase 3 can verify them.

---

## Pack Model

### Pack Types

#### 1. Scaffold Pack

Used for full app scaffolds.

Expected inputs:
- essence
- target adapter
- blueprint
- archetypes
- theme
- shell

Expected outputs:
- app objective
- route plan
- shell plan
- required setup
- target-aware examples
- allowed vocabulary
- success checks

#### 2. Section Pack

Used for implementing or regenerating a single page section or pattern region.

Expected inputs:
- section objective
- selected patterns
- shell context
- theme context
- target adapter

Expected outputs:
- exact task scope
- layout and treatment guidance
- required imports
- code examples
- anti-patterns
- local success checks

#### 3. Page Pack

Used for multi-section page generation or page-level repair.

Expected inputs:
- route intent
- page shell
- selected sections/patterns
- navigation context

Expected outputs:
- page structure contract
- region ordering
- shell behavior
- data and state expectations
- page-level examples

#### 4. Mutation Pack

Used for targeted edits such as:

- add a pattern
- switch theme
- replace shell
- update a route region

Expected outputs:
- exact allowed touch surface
- required preservation constraints
- migration hints
- local validation checks

#### 5. Review Pack

Used for critique and remediation tasks.

Expected outputs:
- contract expectations
- known anti-patterns
- required checks
- target-specific review rules

### Shared Pack Shape

Every pack should be able to expose:

- `pack_version`
- `pack_type`
- `objective`
- `target`
- `preset`
- `scope`
- `inputs`
- `required_setup`
- `allowed_vocabulary`
- `examples`
- `anti_patterns`
- `success_checks`
- `token_budget`
- `rendered_markdown`

---

## Compiler Architecture

### Layer A: Content Normalization

Purpose:
- normalize registry content into compiler-ready internal shapes
- resolve slug references
- merge theme, shell, blueprint, archetype, and pattern inputs
- preserve provenance and compatibility metadata

Likely homes:
- `packages/registry`
- new compiler-focused normalization modules under `packages/core` or a new `packages/compiler`

### Layer B: Target Adapter Selection

Purpose:
- convert generic design intent into target-specific conventions

Initial supported adapters:
- React + Vite
- Next.js App Router

Deferred adapters:
- Vue + Vite
- Nuxt
- SvelteKit

Adapter responsibilities:
- import mapping
- routing/file layout conventions
- CSS entry assumptions
- example syntax
- shell bootstrap
- runtime token access rules

### Layer C: Pack Assembly

Purpose:
- build task-scoped pack objects from normalized content plus adapter rules

Responsibilities:
- select only relevant examples
- inject anti-patterns that apply to the current task
- preserve token budget
- include only the minimum required surrounding context

### Layer D: Pack Rendering

Purpose:
- render structured packs to:
  - markdown for model and human consumption
  - JSON for programmatic consumers

Markdown renderer rules:
- concise by default
- sectioned consistently
- no duplicated guidance tables
- no framework leakage across adapters

---

## Required Content Contract Extensions

Phase 1 normalizes the registry contract. Phase 2 extends it for compilation.

The contract should support pack-oriented fields for relevant content types:

- canonical code examples
- target coverage metadata
- adapter-specific example variants
- anti-pattern examples
- import/setup requirements
- success checks
- optional token budget hints

These fields should be machine-readable and versioned.

Example direction:

- patterns own section-level examples and anti-patterns
- shells own layout and bootstrap guidance
- themes own styling/treatment vocabulary and token access hints
- blueprints and archetypes own route, composition, and app-structure guidance

---

## Initial Implementation Plan

### Workstream A: Pack Schema and Types

Tasks:

1. Define pack schemas and TypeScript types.
2. Choose canonical package ownership for the pack contract.
3. Add pack fixtures for scaffold and section tasks.
4. Add schema validation tests.

Acceptance criteria:

- packs are machine-validated
- CLI and MCP can consume the same pack types
- markdown is generated from pack data, not vice versa

### Workstream B: Target Adapters

Tasks:

1. Introduce adapter interface and registry.
2. Implement React + Vite adapter.
3. Implement Next.js App Router adapter.
4. Move framework-specific imports and shell bootstrap guidance into adapters.

Acceptance criteria:

- no React-only syntax appears in non-React-target packs
- imports and file layout guidance are adapter-owned
- pack examples differ correctly by target

### Workstream C: Compiler Assembly Pipeline

Tasks:

1. Create normalized compiler inputs from registry content.
2. Preserve preset, target, theme, and shell identity end to end.
3. Build scaffold pack assembly.
4. Build section pack assembly.

Acceptance criteria:

- current identity-loss bugs are eliminated
- pack assembly can be unit tested from fixtures
- preferred patterns can be resolved through nested layout groups without ad hoc consumer logic

### Workstream D: Consumer Integration

Tasks:

1. Teach CLI to request/render scaffold packs.
2. Teach CLI to request/render section packs.
3. Teach MCP to expose pack-backed context surfaces.
4. Preserve a compatibility bridge only where necessary during the transition.

Acceptance criteria:

- at least one CLI path uses packs as the primary context source
- at least one MCP workflow uses packs instead of legacy stitched markdown

### Workstream E: Content Migration Pilot

Tasks:

1. Select a small golden content slice:
   - one blueprint
   - three to five archetypes
   - two shells
   - two themes
   - ten to fifteen representative patterns
2. Author pack-ready examples and anti-patterns for that slice.
3. Compile and inspect output across both initial target adapters.

Acceptance criteria:

- pilot slice produces clearly better and smaller task packs
- example quality is high enough to guide broader migration standards

---

## Package and Repo Impact

Primary repos:
- `decantr-monorepo`
- `decantr-content`

Primary packages and apps:
- `packages/registry`
- `packages/core` or new `packages/compiler`
- `packages/cli`
- `packages/mcp-server`
- `apps/api`
- `apps/registry`

Likely file surfaces:
- registry schemas and types
- CLI scaffold/context generation
- MCP tool context generation
- API schema delivery and pack endpoints if chosen
- content example payloads in `decantr-content`

---

## Acceptance Criteria

Phase 2 is complete when:

- scaffold and section packs exist as canonical structured outputs
- markdown generation is derived from pack data
- React + Vite and Next.js adapters are real and tested
- pack generation preserves preset, target, theme, and shell identity
- at least one pilot content slice has adapter-aware examples and anti-patterns
- CLI and MCP each have at least one pack-backed flow in active use

---

## Risks and Open Decisions

### 1. Package Ownership

Open question:
- should the compiler contract live in `packages/core`, `packages/registry`, or a new package?

Recommendation:
- use a dedicated compiler-focused package if pack types begin to outgrow generic core concerns

### 2. Content Migration Cost

The long tail of existing content is large. The pack contract should support gradual migration through:

- pilot slices
- adapter fallbacks
- explicit content coverage metadata

### 3. Token Budget Tradeoffs

Too much structure can still produce bloated packs if the assembly rules are not disciplined. Budget enforcement must be part of the compiler, not an afterthought.

### 4. Consumer Transition

Legacy markdown flows may need a temporary bridge. That bridge should be clearly marked transitional and removed once pack-backed flows are stable.

---

## Exit Criteria

This phase is considered resolved when Decantr can compile task-scoped, target-aware, machine-validated execution packs that materially outperform the legacy stitched-doc flow on a pilot content slice.
