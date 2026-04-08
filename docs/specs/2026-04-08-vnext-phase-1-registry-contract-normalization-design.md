# Decantr vNext Phase 1 — Registry, Content, and API Contract Normalization

**Date:** 2026-04-08
**Status:** Draft
**Author:** Codex
**Depends on:** `docs/programs/2026-04-08-decantr-vnext-master-program.md`
**Companion audits:**
- `docs/audit/2026-04-08-system-baseline.md`
- `docs/audit/2026-04-08-registry-content-api-contract-audit.md`
- `docs/audit/2026-04-08-package-release-surface-audit.md`

---

## Overview

Decantr already has the right macro shape for a content platform:

- `decantr-content` as official curated source
- `apps/api` as hosted ingestion and publish layer
- CLI, MCP, and portal as consumers

What it does not yet have is one canonical contract that all of those surfaces derive from.

Today the contract is split across:

- README conventions
- content JSON structure
- API runtime type definitions
- database constraints
- route behavior
- consumer assumptions in packages and docs

This phase defines and normalizes that contract so later compiler, verification, and governance work has a stable foundation.

## Goals

- Define one canonical registry content contract for Decantr vNext.
- Resolve content taxonomy drift, especially the `recipe` ambiguity.
- Align source, ingestion, storage, and consumption layers around the same rules.
- Add the metadata needed for future compiler and verification systems.
- Create tests that fail when the contract drifts across repos or runtime layers.

## Non-Goals

- Build the compiler pack schema itself.
- Rewrite every content JSON file in this phase.
- Build quality scoring or benchmark confidence computation.
- Fully redesign the portal UI.

---

## Core Problem Statement

The current system has a real contract mismatch:

- `decantr-content` README still describes `recipes/`
- `apps/api` runtime `ContentType` excludes `recipe`
- the content table migration still allows `recipe`

That mismatch is a signal of a broader issue: Decantr does not yet have one authoritative contract for registry content.

Without fixing that, the following future work will be fragile:

- pack compilation
- target-aware examples
- quality and provenance metadata
- CI contract tests
- official/community content guarantees
- portal filters and API compatibility

---

## Design Principles

### 1. One Canonical Contract

There should be one versioned contract definition that answers:

- which content types exist
- which shared fields every item must carry
- which type-specific fields exist
- how provenance, status, and visibility work
- what consumers may rely on

### 2. Separate the Contract Layers

The contract should be explicit at four levels:

- authoring contract
- ingestion contract
- storage contract
- consumption contract

These layers can differ internally, but they may not disagree semantically.

### 3. Prefer Explicit Metadata Over Inference

If Decantr wants to score confidence, target support, or verification state later, the contract should reserve explicit fields for those concepts instead of relying on hidden conventions.

### 4. Official and Community Content Share a Platform, Not a Trust Level

Both should be supported in the same system, but the contract must distinguish:

- source provenance
- trust
- review state
- quality expectations

### 5. Optimize for Compiler and Verification Readiness

The normalized contract should support future fields for:

- target-aware examples
- anti-patterns
- setup/import requirements
- preset-specific examples
- success checks
- compatibility and verification metadata

---

## Contract Layers

### Layer A: Authoring Contract

Where:

- `decantr-content`

Purpose:

- define what authors put in JSON
- define required fields and folder/type mapping
- define how official content is structured before sync

Required outputs:

- authoring schema references
- folder-to-type mapping
- content README and contribution rules aligned to canonical taxonomy

### Layer B: Ingestion Contract

Where:

- `/v1/admin/sync`
- community publish endpoints in `apps/api`

Purpose:

- validate inbound content envelope
- apply provenance, status, and namespace rules
- reject unsupported types or malformed payloads consistently

Required outputs:

- shared validation layer
- official sync invariants
- community publish invariants

### Layer C: Storage Contract

Where:

- Supabase schema
- content table and moderation/version tables

Purpose:

- persist normalized content semantics
- preserve provenance and moderation state
- support versioning and future quality metadata

Required outputs:

- aligned DB constraints
- migration plan for taxonomy cleanup
- explicit provenance/status columns or normalized fields as needed

### Layer D: Consumption Contract

Where:

- CLI
- MCP server
- registry package
- portal
- future compiler surfaces

Purpose:

- define what each consumer can safely assume
- guarantee type and metadata consistency

Required outputs:

- typed package interfaces
- test fixtures
- consumer-level invariant tests

---

## Canonical Contract Proposal

### Shared Envelope

Every content item should conceptually expose:

- `type`
- `slug`
- `namespace`
- `version`
- `decantr_compat`
- `name`
- `description`
- `data`
- `source`
- `status`
- `visibility`
- `created_at`
- `updated_at`

Future-ready optional metadata should include:

- `verification`
- `quality`
- `compatibility`
- `coverage`
- `provenance`

### Provenance Model

At minimum the contract should distinguish:

- `official`
- `community`
- `private-org`

This should be derivable from explicit contract fields, not from informal assumptions alone.

### Status Model

At minimum:

- `draft`
- `pending`
- `published`
- `rejected`
- `archived`

If internal storage uses a smaller subset initially, the external contract should still have a clear forward path.

### Visibility Model

At minimum:

- `public`
- `private`

This should remain distinct from provenance and moderation status.

---

## Taxonomy Decision: `recipe`

This is the first hard decision in the normalization phase.

### Option A: Reinstate `recipe`

Use `recipe` as a first-class content type for visual treatment systems.

Requirements:

- clear semantic definition
- dedicated authoring schema
- API runtime support
- storage support
- consumer support in CLI, MCP, and portal

### Option B: Retire `recipe`

Remove `recipe` as a first-class type and fold surviving semantics into:

- `theme`
- treatment metadata
- pattern guidance
- future compiler/example metadata

Requirements:

- update `decantr-content` README
- remove `recipe` from DB constraints
- ensure any living treatment semantics have a clear new home

### Recommendation

**Retire `recipe` unless a strong, current product use case re-establishes it immediately.**

Why:

- the runtime already behaves as if `recipe` is not first-class
- carrying a ghost type forward creates ongoing confusion
- treatment guidance can be modeled more cleanly as theme/treatment metadata than as a semi-detached legacy concept

---

## Workstreams

### Workstream A: Taxonomy Resolution

Tasks:

1. Decide final supported content types for vNext.
2. Resolve `recipe`.
3. Align folder expectations, runtime enums, and DB constraints.

Acceptance criteria:

- there is no disagreement about supported content types across any layer

### Workstream B: Canonical Contract Spec

Tasks:

1. Create one authoritative content contract spec.
2. Define shared envelope fields.
3. Define type-specific payload extension points.
4. Define provenance, visibility, and status semantics.

Possible implementation locations:

- inside `packages/registry`
- as a new dedicated contract/schema module

Acceptance criteria:

- all consuming surfaces can point to one contract source

### Workstream C: API and Database Alignment

Tasks:

1. Align `ContentType` and route validation with canonical taxonomy.
2. Update database constraints and migrations.
3. Make sure admin sync and community publish use the same contract rules where appropriate.

Acceptance criteria:

- official sync and community publish both validate against shared assumptions
- DB no longer contradicts runtime

### Workstream D: Content Repo Alignment

Tasks:

1. Update `decantr-content` README and folder rules.
2. Add validation that derives from the canonical contract.
3. Prepare migration rules for any content that needs taxonomy or envelope updates.

Acceptance criteria:

- authoring docs no longer contradict runtime reality
- content validation rules derive from the same contract as the platform

### Workstream E: Consumer Alignment

Tasks:

1. Update CLI and MCP assumptions.
2. Update portal filters and type views.
3. Update registry package types and helpers.

Acceptance criteria:

- consumers expose only supported, contract-valid taxonomy and metadata

### Workstream F: Contract Test Suite

Tasks:

1. Add tests that compare contract assumptions across layers.
2. Add regression tests for official sync and community publish paths.
3. Add fixtures for each supported content type.

Acceptance criteria:

- drift between content repo, runtime, and storage is caught in CI

---

## Recommended Implementation Order

1. Resolve taxonomy and `recipe`.
2. Define the canonical contract spec.
3. Align API runtime types and DB constraints.
4. Align `decantr-content` docs and validation.
5. Align consumer packages and portal assumptions.
6. Add cross-layer contract tests.

---

## Risks

### Risk 1: Overdesigning the Envelope

If the contract tries to solve every future need in one pass, the phase may stall.

Mitigation:

- define required core fields now
- reserve space for future metadata without requiring every future subsystem to exist yet

### Risk 2: Silent Consumer Drift

Updating only API types without updating CLI, portal, or content docs would recreate the same problem in a new form.

Mitigation:

- require contract tests across all major consumers

### Risk 3: `recipe` Ambiguity Persists

If the team refuses to make a hard decision, the contract will stay muddy.

Mitigation:

- make `recipe` a named decision gate at the start of the phase
- block later compiler work until it is resolved

---

## Exit Criteria

This phase is complete when:

- there is one canonical registry content contract
- supported content types are unambiguous
- `decantr-content`, API runtime, and DB constraints agree
- CLI, MCP, portal, and registry package all consume the same contract assumptions
- the system is ready for compiler and verification work without taxonomy drift
