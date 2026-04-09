# Decantr vNext Phase 5 — Portal, Docs, and Package Surface Cleanup

**Date:** 2026-04-08
**Status:** Draft
**Author:** Codex
**Depends on:**
- `docs/programs/2026-04-08-decantr-vnext-master-program.md`
- `docs/specs/2026-04-08-vnext-phase-0-product-boundary-cleanup-design.md`
- `docs/specs/2026-04-08-vnext-phase-1-registry-contract-normalization-design.md`
**Companion audits:**
- `docs/audit/2026-04-08-system-baseline.md`
- `docs/audit/2026-04-08-keep-cut-extract-matrix.md`
- `docs/audit/2026-04-08-package-release-surface-audit.md`

---

## Overview

By Phase 5, the product core should be much healthier internally. This phase makes the external and operator-facing surfaces tell the same story.

The objective is not only “better docs.” The objective is alignment across:

- public positioning
- registry portal information architecture
- package READMEs and npm metadata
- release and archive signals
- operator guidance for the product Decantr actually is

## Goals

- Rewrite public-facing docs and package surfaces around the vNext product thesis.
- Make the registry portal reflect the real taxonomy, contract, and intelligence model.
- Remove stale references to deleted or archived product lines.
- Align npm metadata, package support status, and README claims.
- Make operator workflows legible for the focused Decantr product.

## Non-Goals

- Deep enterprise workflow implementation.
- Full marketing site brand redesign beyond what the product reset requires.
- Maintaining historical narratives for archived framework experiments.

---

## Core Problem Statement

Even when the internal architecture improves, Decantr still loses trust if external surfaces keep saying different things.

Current risks:

- public docs carry older framework-first or experimental messaging
- package READMEs may overstate or misstate current support
- registry portal taxonomy can lag behind the actual content model
- archived surfaces continue to look current

Phase 5 exists to make the outward-facing product coherent.

---

## Design Principles

### 1. One Product Story

Every public surface should reinforce the same thesis:

- Decantr is design intelligence and governance for AI-generated UI

### 2. Support Status Must Be Visible

Users should be able to tell whether a package or surface is:

- core-supported
- supported-secondary
- parked
- archived
- extracted

### 3. Portal Should Reflect Intelligence, Not Just Inventory

The registry portal should increasingly emphasize:

- compatibility
- verification status
- recommendation and maturity

Not just raw lists of content items.

### 4. Remove Stale Promises Aggressively

Since this is a greenfield reset, the public surface should prefer clarity over compatibility narratives.

---

## Scope

### Docs Site

Expected work:

- homepage and positioning rewrite
- product architecture explanation
- updated getting-started flows
- package support matrix
- clear archive references for removed lines

### Registry Portal

Expected work:

- align filters and labels with live content taxonomy
- expose intelligence metadata as it becomes available
- improve browse and detail flows around real content use cases
- remove UI-runtime-era assumptions

### Package Surface

Expected work:

- root README cleanup
- package README cleanup
- package descriptions and keywords cleanup
- npm deprecation/archive notes where appropriate

---

## Initial Implementation Plan

### Workstream A: Public Positioning Rewrite

Tasks:

1. Rewrite docs site core pages around the vNext thesis.
2. Remove stale framework and workbench framing.
3. Add architecture pages for compiler, verification, registry, and governance.

Acceptance criteria:

- docs site reflects the actual vNext product
- archived lines are clearly historical

### Workstream B: Registry Portal Alignment

Tasks:

1. Align portal taxonomy, browse flows, and terminology.
2. Expose intelligence metadata and support status where useful.
3. Make official versus community distinctions explicit when relevant.

Acceptance criteria:

- portal matches the actual registry contract
- users can understand content maturity and recommendation signals

### Workstream C: Package and npm Cleanup

Tasks:

1. Update package READMEs and descriptions.
2. Apply support labels consistently.
3. Decide and execute npm deprecation/archive strategy for off-strategy packages.

Acceptance criteria:

- npm and README surfaces no longer market deleted or archived lines as active product

### Workstream D: Operator Guidance

Tasks:

1. Update CLI/MCP onboarding copy.
2. Add guidance for content audit, sync, and verification flows.
3. Make reset-era workflows visible and easy to follow.

Acceptance criteria:

- operator docs match the actual repo and runtime workflow

---

## Package and Repo Impact

Primary repos:
- `decantr-monorepo`
- `decantr-content`

Primary apps and packages:
- `docs/`
- `apps/registry`
- `packages/cli`
- `packages/mcp-server`
- all published npm package metadata and READMEs

---

## Acceptance Criteria

Phase 5 is complete when:

- docs, portal, and package surfaces all tell the same vNext story
- users can distinguish active, parked, and archived surfaces
- stale UI-runtime promises are gone from primary public surfaces
- operator guidance reflects the real compiler, verification, and registry workflows

---

## Risks and Open Decisions

### 1. Cosmetic Rewrite Without Structural Follow-Through

This phase should trail real platform decisions, not front-run them.

### 2. README Drift Returning

Support labels and product framing should be managed as a system, not one-off edits.

### 3. Portal Scope Creep

The registry portal should stay focused on product clarity and content intelligence, not turn into a general app overhaul.

---

## Exit Criteria

This phase is considered resolved when the public and operator-facing Decantr surfaces consistently reflect the focused vNext product and no longer advertise dead or off-strategy product lines as current.
