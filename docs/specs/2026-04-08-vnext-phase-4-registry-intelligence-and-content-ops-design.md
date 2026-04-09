# Decantr vNext Phase 4 — Registry Intelligence and Content Operations

**Date:** 2026-04-08
**Status:** Draft
**Author:** Codex
**Depends on:**
- `docs/programs/2026-04-08-decantr-vnext-master-program.md`
- `docs/specs/2026-04-08-vnext-phase-1-registry-contract-normalization-design.md`
- `docs/specs/2026-04-08-vnext-phase-2-contract-compiler-design.md`
- `docs/specs/2026-04-08-vnext-phase-3-verification-and-golden-corpus-design.md`
**Companion audits:**
- `docs/audit/2026-04-08-system-baseline.md`
- `docs/audit/2026-04-08-registry-content-api-contract-audit.md`
- `docs/audit/2026-04-08-showcase-provenance-audit.md`

---

## Overview

By Phase 4, Decantr should already have:

- a focused product boundary
- a normalized registry contract
- a compiler surface
- a verification foundation

The next step is to turn the registry from “a large content corpus” into “a managed intelligence system.”

This phase defines the metadata, workflows, scoring, and operating model that make Decantr content trustworthy at scale.

## Goals

- Attach quality, coverage, verification, and confidence metadata to registry content.
- Build a repeatable operating model for official content authoring, review, and drift management.
- Connect showcase and benchmark evidence back into content decisions.
- Make registry recommendations and content selection evidence-based rather than purely manual.
- Give the future portal and hosted product a real intelligence layer to present.

## Non-Goals

- Full enterprise approval and compliance flows across customer orgs.
- Perfect automatic scoring for every content type in the first version.
- Rewriting the entire content corpus in a single wave.

---

## Core Problem Statement

`decantr-content` already holds a large and valuable corpus, but at the moment the registry mostly knows:

- what content exists
- basic taxonomy
- enough structure to sync and consume it

That is not enough for a commercial intelligence system.

The vNext registry should also know:

- how verified each item is
- which targets it supports
- where examples are complete or incomplete
- whether it participates in a golden or benchmark flow
- how much confidence Decantr should place in it

Without that layer, content volume becomes noise instead of leverage.

---

## Design Principles

### 1. Metadata Should Explain Trust

Every important content item should eventually be able to answer:

- how it was authored
- how recently it was verified
- what targets it supports
- how complete its examples are
- whether it is recommended

### 2. Scoring Should Be Explainable

Quality and confidence scores must be decomposable into understandable signals, not opaque magic.

### 3. Official Operations Need a Real Workflow

Official content should have a repeatable lifecycle:

- authored
- validated
- reviewed
- verified
- published
- audited
- deprecated or archived

### 4. Drift Must Be Operationalized

Repo-to-live drift and benchmark-to-content drift should be part of normal operations, not emergency cleanup.

### 5. Content Intelligence Feeds the Compiler

The compiler should eventually prefer better-supported and better-verified content by default.

---

## Registry Intelligence Model

### Content Metadata Additions

The registry should support metadata such as:

- `verification_status`
- `last_verified_at`
- `target_coverage`
- `example_coverage`
- `anti_pattern_coverage`
- `benchmark_confidence`
- `golden_usage`
- `quality_score`
- `confidence_score`
- `recommended_for`

These may begin as optional metadata but should become increasingly important to content selection and ranking.

### Quality Dimensions

Scores should be driven by dimensions such as:

- contract completeness
- example completeness
- target coverage
- verification freshness
- benchmark performance
- human review status
- drift status

### Recommendation Dimensions

Recommendations should eventually consider:

- model family
- target adapter
- blueprint/archetype context
- verified compatibility
- maturity level

---

## Content Operations Model

### Official Content Lifecycle

Initial target lifecycle:

1. authored in `decantr-content`
2. validated locally and in CI
3. optionally benchmarked or verified
4. synced to the hosted registry
5. audited for live drift
6. periodically re-verified or deprecated

### Review Modes

Official content review should support at least:

- contract review
- example quality review
- verification review
- benchmark/golden review

### Drift and Reconciliation

The reset branch already introduces:

- dry-run sync reporting
- live registry drift audit

Phase 4 should formalize those into a content ops cadence, including:

- recurring audits
- human-readable summaries
- triage categories
- explicit reconciliation decisions

---

## Initial Implementation Plan

### Workstream A: Content Intelligence Metadata

Tasks:

1. Extend the registry contract with optional intelligence metadata.
2. Decide which metadata is authored, computed, or system-managed.
3. Add type-safe surfaces for these fields in packages and API responses.

Acceptance criteria:

- metadata shape is versioned
- API and consumers can safely read it

### Workstream B: Scoring and Coverage Computation

Tasks:

1. Define quality and confidence scoring rules.
2. Compute coverage metrics for examples, targets, and verification.
3. Store or derive scores consistently.

Acceptance criteria:

- scores are explainable
- coverage gaps are visible

### Workstream C: Official Content Operations

Tasks:

1. Define author-review-verify-publish lifecycle states.
2. Add review checklists or structured review metadata.
3. Make drift audit and sync reports part of normal ops.

Acceptance criteria:

- official content changes follow a clear operational path
- repo-to-live drift is visible without ad hoc investigation

### Workstream D: Benchmark and Golden Feedback Loop

Tasks:

1. Connect benchmark and golden results back to content items.
2. Record which items are used in goldens and high-performing outputs.
3. Feed that signal into recommendation and scoring.

Acceptance criteria:

- content intelligence reflects real usage and verification evidence

---

## Package and Repo Impact

Primary repos:
- `decantr-content`
- `decantr-monorepo`

Primary packages and apps:
- `packages/registry`
- `apps/api`
- `apps/registry`
- `packages/cli`
- `packages/mcp-server`

Likely file surfaces:
- registry schemas and metadata types
- API responses
- registry portal listing and recommendation logic
- content repo authoring and audit workflows

---

## Acceptance Criteria

Phase 4 is complete when:

- registry content can expose verification, coverage, and confidence metadata
- official content operations have a clear lifecycle and drift-audit loop
- quality and recommendation signals are explainable
- benchmark and golden evidence can flow back into registry intelligence

---

## Risks and Open Decisions

### 1. Scoring Theater

Scores that do not affect decisions or cannot be explained will become noise.

### 2. Metadata Overload

Not every field needs to be authored by humans. The split between authored and computed metadata must stay disciplined.

### 3. Ops Complexity

Content operations should become more rigorous, but not so heavy that the official corpus stops evolving.

---

## Exit Criteria

This phase is considered resolved when the registry behaves like an evidence-backed intelligence system with explicit quality and confidence signals, rather than just a typed content store.
