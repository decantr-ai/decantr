# Decantr vNext Phase 0 — Product Boundary Cleanup and Archive Plan

**Date:** 2026-04-08
**Status:** In progress on `codex/decantr-vnext-reset`
**Author:** Codex
**Depends on:** `docs/programs/2026-04-08-decantr-vnext-master-program.md`
**Companion audits:**
- `docs/audit/2026-04-08-system-baseline.md`
- `docs/audit/2026-04-08-keep-cut-extract-matrix.md`
- `docs/audit/2026-04-08-package-release-surface-audit.md`
- `docs/audit/2026-04-08-showcase-provenance-audit.md`

---

## Overview

Decantr currently has too many simultaneous identities:

- design intelligence platform for AI-generated UI
- hosted content and registry product
- MCP and CLI product
- standalone UI framework experiment
- workbench / component ecosystem
- showcase sprawl spanning generated and hand-patched apps

This phase establishes a hard product boundary before deeper architecture work begins.

The objective is not merely cleanup. The objective is to make the repo, package surface, docs, and roadmap all agree on what Decantr is and what it is not.

Implementation note:
- the legacy UI runtime line (`packages/ui`, `packages/ui-chart`, `packages/ui-catalog`, `apps/ui-site`, `apps/workbench`) has already been removed from this reset branch
- remaining Phase 0 work is now mostly documentation, package-surface, and roadmap cleanup

## Goals

- Lock the Decantr vNext product nucleus.
- Decide which surfaces are core, secondary, archived, extracted, or deleted.
- Establish an archive strategy before destructive cleanup begins.
- Remove framework-first confusion from the public and internal product story.
- Set package support and deprecation rules for the reset.
- Reclassify showcase apps as benchmark corpus rather than product surface.

## Non-Goals

- Implement the contract compiler itself.
- Normalize the content taxonomy and API data model in depth.
- Complete the showcase provenance scoring for every app.
- Ship new product code or runtime capabilities.

---

## Product Boundary Decisions

These decisions are the basis for all work in this phase.

### Locked Product Nucleus

The following surfaces are in-scope for Decantr vNext:

- `decantr-content`
- `apps/api`
- `apps/registry`
- `docs/` public site
- `packages/essence-spec`
- `packages/registry`
- `packages/mcp-server`
- `packages/cli`
- `packages/css`
- `packages/core` (pending scope tightening)

### Reframed, Not Removed

The following surfaces stay for now but change role:

- `apps/showcase/*` becomes a benchmark and evidence corpus
- `packages/vite-plugin` becomes a parked verification-adjacent surface
- `docs/audit/decantr-meta-alignment.md` becomes strategic context only

### Archive / Extract Candidates

The following surfaces are not part of the Decantr vNext core product:

- `packages/ui`
- `packages/ui-chart`
- `packages/ui-catalog`
- `apps/ui-site`
- `apps/workbench`
- MCP and docs surfaces that exist only for the standalone UI framework line

### Guiding Principle

If a surface does not strengthen Decantr as the control plane for AI-generated UI, it should not remain central in the repo or product story.

---

## Core Deliverables

### Deliverable A: Archive Boundary Decision Record

Create a formal decision record that answers:

- Which packages and apps are core and supported?
- Which are parked and secondary?
- Which are archived in place?
- Which are extracted to a separate repo later?
- Which are deleted outright after an archive point?

This decision record should be treated as a release and roadmap input, not only a docs artifact.

### Deliverable B: Package Support Matrix

Every publishable package gets one support label:

- `core-supported`
- `supported-secondary`
- `parked`
- `archived`
- `extracted`

This must drive:

- README package table
- npm deprecation strategy
- docs-site package references
- release sequencing

### Deliverable C: Public Story Reset

Rewrite public and operator-facing framing so Decantr is consistently described as:

- design intelligence and governance for AI-generated UI

Not:

- a standalone UI framework
- a React competitor
- a component workbench ecosystem

Surfaces impacted:

- root README
- docs homepage
- docs navigation
- package descriptions and READMEs
- MCP onboarding copy

### Deliverable D: Showcase Reclassification

Define a new home and role for showcase apps:

- benchmark corpus
- regression corpus
- golden-app candidate pool
- failure evidence

They should no longer be used as unqualified proof of product correctness.

### Deliverable E: Workspace Trimming Plan

Design the repo changes needed once archive decisions are final:

- workspace membership changes
- root build script changes
- docs navigation cleanup
- MCP tool cleanup
- package-table cleanup
- extraction branch/repo plan for the UI line if chosen

---

## Decision Options

### 1. Standalone UI Line

Two viable paths:

#### Option A: Archive in Place

Keep the code in the monorepo for historical value, but:

- mark it as archived
- remove it from primary product docs
- stop treating it as part of the roadmap
- optionally stop publishing future versions

**Pros**
- fastest path
- low operational overhead
- preserves history in place

**Cons**
- monorepo still carries conceptual weight from dead surfaces
- easier for future planning to relapse into mixed product identity

#### Option B: Extract to Separate Repo

Move the UI framework line to a dedicated repo or archive repo:

- `packages/ui`
- `packages/ui-chart`
- `packages/ui-catalog`
- `apps/ui-site`
- `apps/workbench`

**Pros**
- cleanest product boundary
- removes confusion from the main repo
- preserves a path if the framework idea ever matters again

**Cons**
- more upfront repo and release work
- requires clear ownership and documentation of the extraction

**Recommendation:** Option B if energy exists to do it cleanly during Phase 1. Option A if speed matters more than repo purity in the first wave.

### 2. `packages/vite-plugin`

Two viable paths:

- keep as parked verification infrastructure
- archive with the framework line if it proves too immature or misleading

**Recommendation:** Keep parked for now. It still aligns with verification better than the UI framework line does.

### 3. Showcase Corpus

Two viable paths:

- keep inside the monorepo but move it conceptually under benchmark ownership
- later relocate it under a dedicated `benchmarks/` or `goldens/` area once provenance metadata exists

**Recommendation:** Keep in place during Phase 0, reclassify immediately, and only move it after audit metadata is defined.

---

## Workstreams

### Workstream A: Archive and Support Classification

Tasks:

1. Lock the support label for each package and app.
2. Decide archive-in-place vs extract for the UI line.
3. Decide whether `decantr_component_api` remains in MCP default surface.
4. Record the decision in a single machine-readable or table-based matrix.

Acceptance criteria:

- every major surface has an explicit support status
- no surface remains in a vague "maybe core later" state

### Workstream B: Public Narrative Cleanup

Tasks:

1. Rewrite root README around the vNext product nucleus.
2. Remove or demote UI-framework-centric package framing.
3. Align docs and onboarding copy with the new product boundary.
4. Make showcase language benchmark-oriented rather than proof-oriented.

Acceptance criteria:

- a new reader can identify Decantr’s real product in under one minute
- no top-level doc makes Decantr look like a React competitor

### Workstream C: Package and Release Governance

Tasks:

1. Define which packages remain actively published.
2. Define deprecation messaging for archived packages.
3. Define whether unsupported packages stay visible on the site.
4. Plan a vNext release wave rather than piecemeal package churn.

Acceptance criteria:

- every publishable package has a public-state plan
- release and docs surfaces agree on support status

### Workstream D: Workspace and Build Cleanup Plan

Tasks:

1. Define target `pnpm-workspace.yaml` membership after archive decisions.
2. Define target root build and test scope.
3. Define which docs and scripts move to archive.
4. Define extraction steps if the UI line leaves the repo.

Acceptance criteria:

- there is a documented target workspace shape
- there is a documented rollback/archive strategy before deletions happen

### Workstream E: Showcase Reframing

Tasks:

1. Establish showcase classification rules.
2. Define golden candidate criteria.
3. Define which showcase outputs are benchmark-only vs discard.
4. Make sure future plans refer to showcase apps as evidence, not canonical product apps.

Acceptance criteria:

- showcase role is explicit in docs and planning
- no roadmap doc treats the whole showcase folder as equally authoritative

---

## Recommended Implementation Order

1. Lock archive/support decisions in docs.
2. Rewrite public product framing.
3. Trim package tables, docs references, and MCP/docs surfaces.
4. Archive or extract off-strategy packages and apps.
5. Update workspace membership and root scripts.
6. Re-run the baseline audit to confirm the new product boundary is clean.

---

## Risks

### Risk 1: Archiving Too Slowly

If off-strategy surfaces remain in place too long without strong labeling, the repo will continue to attract mixed planning and accidental dependencies.

Mitigation:

- make support status explicit immediately
- remove public-first positioning before extraction if extraction will take longer

### Risk 2: Archiving Too Aggressively Without an Archive Point

If code is deleted without a clean archive strategy, useful historical knowledge may be lost.

Mitigation:

- branch or tag before destructive cleanup
- preserve archive docs
- prefer deliberate extraction over ad hoc deletion when a surface still has historical value

### Risk 3: Public Package Confusion

Even without users to migrate, npm and docs can continue to advertise dead surfaces.

Mitigation:

- include package metadata and README cleanup in the same phase
- make deprecation notices part of the plan, not an afterthought

---

## Exit Criteria

This phase is complete when:

- the product nucleus is explicitly locked
- every major surface has a keep / park / archive / extract / delete decision
- public docs and package surfaces reflect the same boundary
- the standalone UI framework line no longer shapes Decantr’s central story
- showcase apps have been reclassified as benchmark assets
- the repo is ready for contract normalization and compiler work without product-identity drift
