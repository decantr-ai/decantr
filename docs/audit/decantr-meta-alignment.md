# Decantr Meta Alignment: How This Audit Fits Into the Seven-Layer Vision

> Generated 2026-03-29 from full analysis of all decantr-meta specs (Phase 0-7) and VISION.md.

---

## Context

`decantr-meta` is the next-generation successor to `decantr-monorepo`. It reimagines the project as a seven-layer platform spanning five technology domains (UI, API, Data, Infra, Observability). The monorepo contains the working UI-focused product; decantr-meta is a ground-up architectural rethink.

This document maps findings from the monorepo audit to the existing decantr-meta phase specs, identifying gaps that the meta specs should address and decisions about what to build where.

---

## Current State of decantr-meta

### Phase 0 Status (Foundation)

| Deliverable | Status | Notes |
|---|---|---|
| D0.1: Repository Setup | Done | pnpm + Turborepo + ESLint + Prettier + Husky + GitHub Actions |
| D0.2: Core Schemas | Done | 10 JSON schemas (essence, pattern, capability, archetype, guard-modes, severity, telemetry, agent-protocol, audit-event, essence.v2) |
| D0.3: Domain Schema Extensions | Done | All 5 domains have schemas (API is detailed, others are stubs) |
| D0.4: Resolver Implementation | Done | resolver-core (abstract + chain) + resolver-local. Missing: resolver-remote, resolver-cache |
| D0.5: UI Registry Migration | Partial | 5 patterns, 2 archetypes, 2 capabilities, 1 theme migrated. Monorepo has 87+ patterns, 53+ archetypes, 17 themes |
| D0.6: Basic MCP Server | Done | 6 tools over stdio |
| D0.7: Basic CLI | Done | 4 commands (validate, search, list, get) |
| D0.8: CI/CD Pipeline | Partial | ci.yml + docs.yml exist. Missing: release.yml, schema-validate.yml |
| D0.9: Documentation Site | Done | VitePress with guides, API reference, package docs |

### Phases 1-7 Status

All are NOT STARTED. Phase 1 (API Domain + Intelligence) has 2 API patterns already created (`crud-resource`, `paginated-list`), which is ahead of plan.

---

## Alignment Analysis: Monorepo Audit → Meta Specs

### 1. The DNA/Blueprint Split

**Monorepo audit finding:** The flat Essence schema conflates invariant design rules with mutable scaffolding decisions, causing the guard system to lose credibility.

**Where this fits in meta specs:** This is a **D0.2 (Core Schemas) revision** that the current Phase 0 spec does not anticipate.

**Gap in meta specs:** The `specs/core/` schemas in decantr-meta define `essence.schema.json` and `essence.v2.schema.json` but neither implements the DNA/Blueprint split. The meta schemas are structurally similar to the monorepo's v2 schema — they have guard modes and severity levels but no concept of layered enforcement.

**Recommendation:** Before declaring Phase 0 complete, the meta core schemas should be updated to reflect the v3 DNA/Blueprint/Meta split designed in the monorepo audit. This means:
- Add `essence.v3.schema.json` to `specs/core/`
- Update `src/index.ts` validation to support v3
- Update the `guard-modes.schema.json` to include `dna_enforcement` and `blueprint_enforcement`
- Update the VitePress docs to explain the two-layer model

**Priority:** High — this is foundational and affects every subsequent phase.

---

### 2. Bi-directional Drift Resolution

**Monorepo audit finding:** Drift detection is read-only. No tool exists to resolve violations.

**Where this fits in meta specs:** This maps to **D0.6 (Basic MCP Server)** — the current meta MCP server has `decantr_check_drift` but no resolution tools. It also anticipates **Phase 2 (D2.5: Conflict Detection)** which deals with multi-agent conflict resolution.

**Gap in meta specs:** Phase 0 does not include drift resolution tools. Phase 2's conflict detection is multi-agent coordination (how two AI agents resolve conflicting intents), not developer-facing drift resolution. These are related but distinct:

| Concept | Scope | Phase |
|---------|-------|-------|
| Drift resolution | Developer accepts/rejects changes to the essence | Phase 0 (should be) |
| Conflict detection | Multiple AI agents propose contradictory changes | Phase 2 |
| Arbiter | Automated resolution of multi-agent conflicts | Phase 2 |

**Recommendation:** Add `decantr_accept_drift` and `decantr_update_essence` tools to D0.6 scope. The meta MCP server currently has 6 tools; these would bring it to 8 and close the "read-only" gap before Phase 1 begins.

**Priority:** High — without this, the MCP server is a passive observer, not an active design partner.

---

### 3. Wiring Intelligence

**Monorepo audit finding:** Pattern wiring is hardcoded to 3 pairs in `packages/registry/src/wiring.ts`. Should be data-driven from pattern IO declarations.

**Where this fits in meta specs:** This is core to **Phase 1 (D1.3: API Guards)** and the cross-domain intelligence in **Phase 5 (D5.7)**. The meta vision describes wiring as "cross-pattern communication rules" that should emerge from pattern IO contracts.

**Gap in meta specs:** The meta schemas define capability types but don't yet have a wiring schema. The monorepo's pattern IO model (`produces`/`consumes`/`actions`) is a good foundation, but the meta schemas would need:
- A `wiring.schema.json` defining how patterns declare their IO contracts
- A `wiring-rules.schema.json` for explicit wiring overrides
- Resolution logic in the resolver that auto-detects compatible IO pairs

**Recommendation:** Add a wiring schema to D0.2 and migrate the data-driven wiring logic from the monorepo audit's Phase E into the meta resolver. This prepares the foundation for cross-domain wiring in Phase 5.

**Priority:** Medium — useful but not blocking.

---

### 4. Content Migration (D0.5)

**Monorepo audit finding:** The monorepo's `decantr-content` repo has 87+ patterns, 53+ archetypes, 17 themes, 16+ blueprints, multiple recipes and shells.

**Meta spec D0.5 status:** Only 5 patterns, 2 archetypes, 2 capabilities, 1 theme migrated.

**Gap:** The migration is ~5% complete. The meta spec says "migrate from decantr-monorepo" but the content in question lives in `decantr-content` (a separate repo), not in the monorepo's packages.

**Recommendation:** This is a bulk migration task. The content format may need adaptation if the meta schemas differ from monorepo schemas (they do — meta uses `capabilities` where monorepo uses `features`, and meta patterns have a `capabilities` field that monorepo patterns don't). Write a migration script that:
1. Reads content from `decantr-content`
2. Validates against meta schemas
3. Transforms where needed (add `capabilities` field, map features to capabilities)
4. Writes to `registries/ui/`

**Priority:** Medium — Phase 0 exit criterion is "UI registry matches decantr-monorepo" which is currently unmet.

---

### 5. Resolver Fallback Chain

**Monorepo audit finding:** The MCP server has no fallback (API-only). The CLI has Custom → API → Cache → Bundled. These should be consistent.

**Where this fits in meta specs:** D0.4 (Resolver Implementation) defines `resolver-core` with `ResolverChain` that supports priority-sorted layered resolution. The chain architecture is correct, but `resolver-remote` and `resolver-cache` packages don't exist yet.

**Gap:** The meta resolver has the right abstract architecture (ResolverChain with priority ordering) but only `resolver-local` is implemented. The MCP server creates a single `LocalResolver` pointing at the registries directory.

**Recommendation:** Implementing `resolver-remote` (HTTP API calls) and `resolver-cache` (filesystem cache with TTL) would close this gap. Both the CLI and MCP server should use the same `ResolverChain` with: Local > Cache > Remote > Bundled.

**Priority:** Medium — blocks offline/air-gapped development.

---

### 6. Test Coverage Model

**Monorepo audit finding:** API has 0 route handler tests, MCP has 0 happy-path tests, web app has 0 tests.

**Where this fits in meta specs:** Phase 0 exit criterion: "All tests pass." The spec does not define a coverage target.

**Gap:** The meta repo has tests for schemas, resolver, CLI, and MCP tools — but the same pattern of "error-path-only" testing from the monorepo is emerging. The meta MCP tests check tool definitions and error cases but don't test actual content resolution.

**Recommendation:** Add explicit coverage targets to the Phase 0 exit criteria:
- Schema packages: 90%+ (they're the foundation)
- Resolver packages: 80%+ (critical path for all content access)
- CLI/MCP: 70%+ with at least one happy-path test per command/tool
- Integration: At least one end-to-end test that validates essence → resolve content → check drift

**Priority:** Low for now, high before Phase 1.

---

### 7. CSS Package (Atom Resolution Layer)

**Monorepo audit finding:** `@decantr/css` is the runtime that resolves atom strings (`_flex`, `_gap4`, `_bgprimary`) embedded throughout all pattern content. It is core infrastructure — without it, pattern layout data is unactionable.

**Where this fits in meta specs:** Not mentioned in the meta vision or specs, but the meta UI registry will inherit patterns that use atom strings. Any domain that produces layout guidance (UI, potentially Observability dashboards) will need atom resolution.

**Decision:** The CSS package should be migrated to decantr-meta as part of D0.5 (UI Registry Migration), since the migrated patterns depend on it. It belongs under a shared utilities layer, not a specific domain. Additionally, an atom-to-Tailwind mapping table should be produced for AI code generators targeting Tailwind projects.

---

### 8. Build Tool Integration (Vite/ESLint plugins)

**Monorepo audit finding:** Proposed Vite plugin for real-time drift detection and ESLint plugin for editor-level enforcement.

**Where this fits in meta specs:** Phase 7 (D7.5: LSP Servers) plans VS Code, JetBrains, and Neovim language server integrations. An ESLint plugin is a lighter-weight version of this. A Vite plugin is not mentioned.

**Gap:** There's a 21-month gap between Phase 0 and Phase 7's LSP servers. Build tool plugins (Vite, webpack, ESLint) are a practical intermediate step that ships value much sooner.

**Recommendation:** Add a "Phase 0.5" or "Phase 1 addendum" that covers:
- `@decantr/eslint-plugin` — Maps guard rules to ESLint rules (theme-consistency, page-declared, spacing-tokens)
- `@decantr/vite-plugin` — Real-time guard evaluation on file save, error overlay integration

These are much simpler than full LSP servers and provide editor-level feedback without the complexity of language server protocol.

**Priority:** Low for meta — this is better built in the monorepo first and migrated later.

---

## Strategic Decision: Monorepo vs Meta

### Should the monorepo be abandoned in favor of decantr-meta?

**Not yet.** The monorepo has:
- A working, tested product (essence spec, guard system, MCP server, CLI)
- A live API with auth, billing, and moderation
- A functional web app (registry browser, dashboard)
- 87+ patterns, 53+ archetypes in the content ecosystem
- Real users can install and use it today

The meta project has:
- A well-designed schema foundation
- A resolver architecture that's more extensible
- A vision document for 7 layers spanning 24 months
- But only 2 git commits and minimal real content

### Recommended approach

1. **Build the DNA/Blueprint split and bi-directional drift in the monorepo.** This is where the working product lives. Ship it, validate it with users, learn from feedback.

2. **Port the validated design to decantr-meta schemas.** Once the v3 schema is proven in the monorepo, update the meta core schemas to match. This ensures the meta foundation is informed by real-world usage, not just architectural theory.

3. **Continue building out meta Phase 0 in parallel.** Focus on completing D0.5 (content migration) and D0.8 (CI/CD) to close out Phase 0.

4. **When meta Phase 0 is truly complete, evaluate migration.** The trigger for full migration is when meta's resolver chain (local + cache + remote) is as capable as the monorepo's, AND the content migration is complete.

This approach avoids:
- Rebuilding working features from scratch
- Losing momentum on the shipped product
- Making architectural decisions in a vacuum without user feedback

---

## Gaps in Meta Specs That This Audit Surfaces

| Gap | Where | Recommendation |
|-----|-------|----------------|
| No DNA/Blueprint schema split | D0.2 | Add `essence.v3.schema.json` with layered enforcement |
| No drift resolution tools | D0.6 | Add `decantr_accept_drift`, `decantr_update_essence` to MCP server |
| No wiring schema | D0.2 | Add `wiring.schema.json` for data-driven pattern IO wiring |
| Content migration at ~5% | D0.5 | Write migration script for `decantr-content` → `registries/ui/` |
| No resolver-remote or resolver-cache | D0.4 | Implement to close offline development gap |
| No coverage targets | Phase 0 exit criteria | Add explicit percentage targets per package type |
| No build tool integration before Phase 7 | Gap between P0 and P7 | Add lightweight ESLint/Vite plugins to P0.5 or P1 |
| Phase 0 exit criteria partially unmet | Overall | D0.5 (content), D0.8 (release CI) need completion |

---

## Summary

The monorepo audit produced a concrete implementation plan (6 phases, ~15-20 days) centered on the DNA/Blueprint split and bi-directional drift resolution. These are the two changes that transform Decantr from a passive lint tool into an active design partner.

For decantr-meta, the audit surfaces 8 gaps in the existing Phase 0 spec. The most important are the DNA/Blueprint schema split and drift resolution tools — both should be incorporated into the meta schemas before Phase 0 is declared complete. The strategic recommendation is to build and validate these features in the monorepo first, then port the proven design to meta.

The two projects should converge over time, with the monorepo serving as the "shipping product" and meta serving as the "architecture for scale." They should not be merged prematurely — the monorepo's value is that it works today.
