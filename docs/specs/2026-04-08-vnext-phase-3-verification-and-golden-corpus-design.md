# Decantr vNext Phase 3 — Verification Engine and Golden Corpus

**Date:** 2026-04-08
**Status:** Draft
**Author:** Codex
**Depends on:**
- `docs/programs/2026-04-08-decantr-vnext-master-program.md`
- `docs/specs/2026-04-08-vnext-phase-2-contract-compiler-design.md`
**Companion audits:**
- `docs/audit/2026-04-08-system-baseline.md`
- `docs/audit/2026-04-08-showcase-provenance-audit.md`
- `docs/audit/2026-04-08-package-release-surface-audit.md`

---

## Overview

Phase 3 makes Decantr trustworthy.

Phases 0 through 2 clean the product boundary, normalize the content contract, and build the compiler surface. None of that alone is enough for commercial confidence. Decantr also needs a verification layer that can prove whether generated output actually satisfies the contract.

This phase introduces:

- evidence-based verification
- curated golden apps
- benchmark and regression harnesses
- severity-based findings
- first-pass quality metrics that mean something

## Goals

- Replace heuristic-only critique with a layered verification engine.
- Turn the showcase corpus into a curated golden and benchmark program.
- Verify buildability, structural correctness, theme/treatment compliance, and baseline accessibility.
- Expose verification findings in CLI, MCP, CI, and future hosted product surfaces.
- Establish measurable first-pass success criteria for Decantr output.

## Non-Goals

- Full enterprise governance and approval workflows.
- Deep business-logic verification for every backend domain.
- Every future framework adapter on day one.
- Perfect semantic correctness for arbitrary custom user code.

---

## Core Problem Statement

Today Decantr can often improve output quality, but it cannot yet give teams strong evidence that output is production-safe.

Current limitations:

- critique is still heavily heuristic
- showcase apps have mixed provenance and no strict golden criteria
- there is no canonical severity model for generation failures
- there is no first-pass verified success metric that ties back to real tasks
- runtime confidence is weak across auth, routing, build, and interaction flows

If Decantr wants to be commercially legitimate, it must move from “good guidance” to “verified generation.”

---

## Design Principles

### 1. Evidence Over Heuristics

A finding should ideally point to:

- a parsed AST fact
- a route graph fact
- a build/runtime fact
- a content contract violation
- a golden reference regression

Regex-only checks may remain as stopgaps, but they are not the end state.

### 2. Fast Checks First

Verification should run in layers:

1. schema and contract validation
2. static structure and AST checks
3. build checks
4. runtime smoke checks
5. benchmark and golden comparison

This keeps feedback fast while still allowing deeper confidence.

### 3. Goldens Must Be Curated, Not Assumed

Not every showcase app is a golden. Some are evidence of failure or partial success.

Every candidate golden must carry:

- provenance classification
- target stack
- verification status
- known manual intervention
- blueprint/archetype lineage

### 4. Findings Need Severity and Actionability

Verification output should classify issues consistently:

- `P0` blocker
- `P1` serious defect
- `P2` important drift
- `P3` polish or advisory

Each finding should describe:

- what failed
- where it failed
- why it matters
- what contract or rule it violated

### 5. Verification Must Be Target-Aware

A Next.js hydration rule is not the same as a Vite rule. Verification logic should be adapter-aware just like pack generation is.

---

## Verification Layers

### Layer A: Contract Verification

Purpose:
- ensure pack inputs and generated outputs still match registry/content contract expectations

Examples:
- schema validation
- required metadata presence
- target and preset identity preservation
- shell and route reference integrity

### Layer B: Static Code Verification

Purpose:
- inspect generated code without running it

Examples:
- AST-based import validation
- route/file presence checks
- forbidden inline style and hardcoded-color checks
- treatment/token usage checks
- target-specific syntax and convention checks

### Layer C: Build Verification

Purpose:
- prove the output compiles in the intended target stack

Examples:
- install/build pass
- no typecheck failures
- no route-import resolution failures

### Layer D: Runtime Smoke Verification

Purpose:
- catch basic runtime and interaction failures

Examples:
- boot without fatal console errors
- navigation between core routes
- shell render checks
- auth guard and loading state checks for supported blueprints

### Layer E: Golden and Benchmark Verification

Purpose:
- compare generated output quality against curated expectations

Examples:
- golden file structure checks
- route and shell composition expectations
- benchmark scoring
- regression history over time

---

## Golden Corpus Program

### Showcase Reclassification

The current showcase corpus should be formally labeled into at least four classes:

- `pure-generated`
- `generated-plus-patched`
- `mostly-hand-rolled`
- `obsolete`

This classification becomes metadata, not memory.

### Golden Selection Rules

An app qualifies as a golden candidate only if:

- it builds successfully
- provenance is understood
- the blueprint/archetype lineage is recorded
- framework target is explicit
- manual intervention is either zero or clearly documented
- verification status is green for the selected checks

### Initial Golden Scope

Start with a small but representative set:

- one marketing blueprint
- one SaaS/dashboard blueprint
- one registry/content blueprint
- one auth/settings-heavy blueprint

Each should map to a supported target adapter from Phase 2.

---

## Verification Engine Architecture

### Engine Responsibilities

The engine should be able to:

- accept pack context plus generated workspace
- run layered checks
- emit structured findings
- produce summary scores without hiding the underlying evidence

### Suggested Surface

Possible package shape:
- new `packages/verifier`

Alternative:
- verification primitives in `packages/core` with thin CLI/MCP wrappers

Recommendation:
- prefer a dedicated package if AST, build, and benchmark logic grow quickly

### Finding Shape

Every finding should be able to carry:

- `id`
- `category`
- `severity`
- `message`
- `evidence`
- `target`
- `file`
- `rule`
- `suggested_fix`

### Output Surfaces

Verification results should be consumable from:

- CLI
- MCP
- CI
- future portal/admin dashboards

---

## Initial Implementation Plan

### Workstream A: Severity Model and Verification Contract

Tasks:

1. Define finding schema and severity rules.
2. Define verification run summary schema.
3. Add fixtures covering expected findings.

Acceptance criteria:

- findings are structured and stable across consumers
- review surfaces can prioritize by severity

### Workstream B: Static Verification Foundation

Tasks:

1. Introduce AST-backed checks for supported targets.
2. Replace or demote regex-only checks where possible.
3. Validate imports, route presence, shell usage, and theme/treatment rules.

Acceptance criteria:

- core checks are evidence-based
- false positives are materially reduced compared with heuristic-only checks

### Workstream C: Build and Smoke Harness

Tasks:

1. Add reproducible build verification for supported targets.
2. Add smoke checks for boot, core routes, and basic interaction states.
3. Store results in a structured report format.

Acceptance criteria:

- generated workspaces can be verified in automation
- build failures and runtime blockers are surfaced as `P0` or `P1`

### Workstream D: Golden Corpus Selection

Tasks:

1. Add provenance metadata for retained showcase apps.
2. Select the first small golden set.
3. Add golden verification fixtures and expected outputs.

Acceptance criteria:

- a maintained golden corpus exists
- non-golden showcases are explicitly marked as benchmark evidence or obsolete

### Workstream E: Consumer Integration

Tasks:

1. Add a CLI verification command.
2. Add MCP verification and critique surfaces backed by the engine.
3. Add CI-facing output suitable for pull request review.

Acceptance criteria:

- verification can be run locally and in CI
- MCP critique is driven by the same engine as CLI, not a separate heuristic world

---

## Metrics

Phase 3 should establish measurable outcomes including:

- first-pass verified scaffold rate
- build success rate by target
- accessibility rule pass rate
- theme/treatment compliance rate
- drift escape rate
- golden regression rate

These metrics should become part of Decantr’s product-quality operating model.

---

## Package and Repo Impact

Primary repos:
- `decantr-monorepo`
- `decantr-content`

Primary packages and apps:
- `packages/mcp-server`
- `packages/cli`
- `packages/core` or new `packages/verifier`
- `apps/showcase`
- `apps/api` if hosted verification surfaces are added later

Likely file surfaces:
- critique and verification logic
- showcase metadata and manifests
- benchmark scripts
- CLI command surfaces
- MCP tool surfaces

---

## Acceptance Criteria

Phase 3 is complete when:

- Decantr has a structured verification engine with severity-based findings
- supported targets have AST-backed static checks
- generated outputs can be build-verified automatically
- a curated initial golden corpus exists and is classified
- CLI and MCP can both consume the same verification results
- Decantr can report a meaningful first-pass verified success metric on a defined benchmark set

---

## Risks and Open Decisions

### 1. Over-Broad Verification Scope

Verification should start with a disciplined target slice and rule set. Trying to verify everything at once will produce shallow checks.

### 2. Golden Drift

Goldens can become stale theater if they are not maintained with provenance and verification metadata.

### 3. Runtime Cost

Build and smoke verification can get expensive. The layered model should allow fast static feedback first and deeper runtime checks only when justified.

### 4. Tooling Fragmentation

CLI, MCP, and CI must share the same findings model. Separate critique systems should be treated as debt, not as a permanent architecture.

---

## Exit Criteria

This phase is considered resolved when Decantr can verify supported generated outputs with evidence-based findings and a curated golden corpus, rather than relying primarily on heuristic critique and anecdotal showcase quality.
