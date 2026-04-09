# Decantr vNext Master Program

Status: Draft
Date: 2026-04-08
Branch: `codex/decantr-vnext-reset`
Owner: Founder + Codex

## 1. Purpose

This document replaces piecemeal planning with a single vNext program for Decantr.

The goal is not to incrementally improve every existing surface. The goal is to re-found Decantr around the product that has the clearest commercial wedge:

- design intelligence for AI-generated UI
- contract compilation for LLM execution
- verification and drift prevention
- registry, API, and governance for teams

This is a greenfield reset. There are no commercial users to preserve. Backward compatibility is optional. Clarity, focus, and long-term product quality are mandatory.

## 2. Locked Decisions

The following decisions are considered locked unless explicitly reopened:

1. Decantr is not a UI framework.
2. Decantr is not a code generator.
3. Decantr is a control plane for AI-generated UI: content, contracts, verification, registry, and governance.
4. `decantr-content` remains the official content source of truth for curated registry content.
5. `apps/api`, `apps/registry`, the docs site, and the core npm packages are the product nucleus.
6. `apps/showcase/*` is a benchmark and evidence corpus, not the core product.
7. `@decantr/ui`, `@decantr/ui-chart`, `@decantr/ui-catalog`, `apps/ui-site`, and `apps/workbench` have been removed from this reset branch and are no longer strategic anchors.
8. `decantr-meta` is strategic inspiration and future compatibility context, not current delivery scope.
9. Decantr should be UI-first, not UI-locked. Future domain expansion must remain possible, but may not bloat the near-term UI program.
10. Aggressive pruning is allowed. If a surface does not clearly serve the vNext product, it can be archived or deleted.

## 3. Product Thesis

By 2027+, Decantr should be the best way to make major coding models produce coherent, production-grade UI across multiple target stacks.

Decantr should move from "docs for models" to a complete system that:

- captures design intent in a durable contract
- compiles that contract into scoped execution packs
- verifies generated output with evidence
- manages registry content, governance, and drift
- learns from benchmarks and production feedback

The product message becomes:

**Design intelligence and governance for AI-generated UI.**

Not:

- a new frontend framework
- a generator runtime
- a React alternative
- a pile of prompt documents

## 4. Current System Topology

Decantr currently spans multiple repos and deployed surfaces.

| Surface | Current role | vNext stance |
|---|---|---|
| `decantr-content` | Official curated content source, auto-sync to hosted registry | Keep as core external source repo |
| `decantr-monorepo/apps/api` | API, MCP-adjacent backend, sync/moderation/auth/billing foundation | Keep as core product surface |
| `decantr-monorepo/apps/registry` | Registry portal (`registry.decantr.ai`) | Keep and refocus |
| `decantr-monorepo/docs/` | Public docs / marketing site (`www.decantr.ai`) | Keep and rewrite around vNext |
| `@decantr/essence-spec` | Schema + validator + rules | Keep as core |
| `@decantr/registry` | Registry resolution and content access | Keep as core |
| `@decantr/mcp-server` | MCP tool surface | Keep as core |
| `@decantr/cli` | Local scaffold and maintenance entrypoint | Keep, slim, and clarify |
| `@decantr/css` | Framework-agnostic atom runtime | Keep as core UI utility |
| `@decantr/core` | Internal design pipeline / IR layer | Keep, but tighten scope |
| `apps/showcase/*` | 39 attempted full blueprint scaffolds with mixed provenance | Reclassify as benchmark corpus |
| `@decantr/ui` line + related apps | Standalone framework experiment | Removed from reset branch; legacy line only |

## 5. vNext Architecture

The vNext architecture is organized into seven planes.

### 5.1 Intent Plane

Durable app intent and design contract.

Outputs:
- versioned essence contract
- provenance for edits and mutations
- intent diffs suitable for review and audit

### 5.2 Knowledge Plane

Registry content as structured, scored compiler input.

Outputs:
- blueprints
- archetypes
- patterns
- themes / treatments
- shells
- examples
- anti-patterns
- compatibility metadata
- quality metadata

### 5.3 Compiler Plane

Compile registry + essence into scoped execution packs.

Outputs:
- scaffold pack
- section pack
- page pack
- mutation pack
- review pack

Each pack should carry:
- objective
- target assumptions
- allowed vocabulary
- canonical examples
- anti-patterns
- imports / setup
- mock-data guidance
- success checks
- token budget

### 5.4 Verification Plane

Evidence-based checks over generated output.

Outputs:
- AST-aware critique
- build verification
- route and shell validation
- accessibility checks
- treatment / token compliance
- auth / loading / error state coverage
- performance budgets

### 5.5 Delivery Plane

How Decantr reaches users and agents.

Outputs:
- npm packages
- MCP server
- CLI
- hosted API
- registry portal
- CI integrations

### 5.6 Governance Plane

Commercial controls for teams and enterprises.

Outputs:
- private registries
- RBAC
- policy packs
- approvals
- audit trail
- org settings

### 5.7 Learning Plane

Feedback loop from benchmarks, goldens, and production usage.

Outputs:
- benchmark scores
- failure taxonomies
- content quality scores
- confidence signals
- regression baselines

## 6. Program Tracks

### Track A: Reset Governance and Surface Pruning

Purpose:
- decide what stays, what moves, and what dies
- establish archive boundaries before implementation churn

Primary outputs:
- system baseline
- keep / cut / extract matrix
- archive plan
- deprecation and deletion rules

### Track B: Contract Compiler

Purpose:
- replace prose-heavy scaffolding with compiled execution packs

Primary outputs:
- pack schema
- target-aware pack compiler
- preset-aware example selection
- markdown rendering as a view, not the source of truth

### Track C: Target Adapters

Purpose:
- ensure Decantr works cleanly across supported frameworks instead of leaking React conventions everywhere

Primary outputs:
- React + Vite adapter
- Next.js adapter
- Vue / Nuxt adapter plan
- SvelteKit adapter plan
- import, routing, styling, and file-layout adapters

### Track D: Verification Engine

Purpose:
- make Decantr trustworthy, not merely instructive

Primary outputs:
- AST-based critique
- route / auth / shell validators
- build-and-smoke verification
- policy severity model
- CI-ready contract enforcement

### Track E: Registry and Platform Contract

Purpose:
- unify content taxonomy, sync rules, provenance, and runtime consumption

Primary outputs:
- canonical content contract
- official sync contract
- community publish contract
- metadata and compatibility model
- schema and migration cleanup

### Track F: Registry Intelligence and Content Operations

Purpose:
- make the registry a maintained knowledge system instead of a bag of JSON

Primary outputs:
- quality scoring
- coverage matrix
- confidence metadata
- review workflow for official content
- benchmark-to-content learning loop

### Track G: Docs, Portal, and Positioning Rewrite

Purpose:
- make public surfaces reflect the focused vNext product

Primary outputs:
- rewritten docs site
- updated registry portal framing
- updated package docs
- removal of stale framework-first positioning

### Track H: Showcase Corpus and Golden Apps

Purpose:
- convert showcase sprawl into evidence, benchmarks, and curated references

Primary outputs:
- provenance audit
- classification scorecard
- golden reference shortlist
- discard archive list

### Track I: Hosted Commercial Platform

Purpose:
- turn the product into a legitimate sellable platform once the core is stable

Primary outputs:
- private registry support
- org and billing controls
- hosted MCP and API readiness
- audit and approval workflows

### Track J: Package and Release Governance

Purpose:
- keep published package surfaces coherent during the reset
- define support, deprecation, archive, and extraction rules

Primary outputs:
- package support matrix
- release wave strategy
- npm deprecation and metadata cleanup plan
- docs and README alignment

### Track K: Meta Compatibility Guardrail

Purpose:
- preserve room for future non-UI domain expansion without bloating current delivery

Primary outputs:
- domain-neutral abstractions where practical
- explicit UI-specific adapters
- migration notes for a future `decantr-meta` convergence path

## 7. Phase Order

### Phase 0: Baseline and Pruning

Goals:
- document the current system
- classify surfaces
- freeze archive boundaries
- stop scope drift

Must complete before broad code changes.

### Phase 1: Core Product Re-foundation

Goals:
- tighten package and product boundaries
- clean content and API contracts
- strip or archive off-strategy surfaces

### Phase 2: Compiler and Adapter Foundation

Goals:
- ship pack schema
- compile scaffold / section / page context
- preserve target and preset identity end-to-end

### Phase 3: Verification Foundation

Goals:
- move beyond string heuristics
- establish build, route, treatment, and a11y verification
- make CI evidence-driven

### Phase 4: Content Intelligence and Goldens

Goals:
- score content quality
- classify showcase corpus
- promote a small set of verified goldens

### Phase 5: Portal, Docs, and Packaging Cleanup

Goals:
- align public messaging
- update package docs and release surfaces
- eliminate stale promises and dead product lines

### Phase 6: Hosted Commercialization

Goals:
- add team / enterprise governance once the product core is trustworthy

## 8. Success Criteria

Decantr vNext is successful when:

- the product story is coherent and framework confusion is gone
- core packages, API, portal, and docs all agree on the same product boundary
- generated execution context is compiled, scoped, and token-budgeted
- verification can fail real regressions before a human has to spot them
- showcase sprawl is reduced to a maintained benchmark and golden-reference set
- registry content has explicit provenance, compatibility, and quality metadata
- the roadmap to hosted teams / enterprise features sits on a stable core rather than experimental sprawl

## 9. Non-Goals for This Reset

The reset is not trying to:

- preserve every existing package and app
- ship a general-purpose UI runtime
- solve API / Python / infra generation in the immediate term
- maintain hybrid product narratives for historical experiments
- optimize for soft migrations over product clarity

## 10. Immediate Next Documents

This master program depends on the following companion docs:

- `docs/audit/2026-04-08-system-baseline.md`
- `docs/audit/2026-04-08-keep-cut-extract-matrix.md`
- `docs/audit/2026-04-08-registry-content-api-contract-audit.md`
- `docs/audit/2026-04-08-showcase-provenance-audit.md`
- `docs/audit/2026-04-08-package-release-surface-audit.md`
- `docs/specs/2026-04-08-vnext-phase-0-product-boundary-cleanup-design.md`
- `docs/specs/2026-04-08-vnext-phase-1-registry-contract-normalization-design.md`
- `docs/specs/2026-04-08-vnext-phase-2-contract-compiler-design.md`
- `docs/specs/2026-04-08-vnext-phase-3-verification-and-golden-corpus-design.md`
- `docs/specs/2026-04-08-vnext-phase-4-registry-intelligence-and-content-ops-design.md`
- `docs/specs/2026-04-08-vnext-phase-5-portal-docs-and-package-surface-design.md`
- `docs/specs/2026-04-08-vnext-phase-6-hosted-commercial-platform-design.md`

These documents should be treated as the operating baseline for the first implementation wave.
