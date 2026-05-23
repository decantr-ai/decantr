# Decantr 3.0 AI Frontend Governance Reset

Date: 2026-05-21
Status: Active implementation program
Owner: Founder + Codex

Relationship to existing docs:

- This document supersedes the older vNext and Hybrid plans as the strategic planning source for the Decantr 3.x reset.
- It is now the active strategic source for the Decantr 3.x prerelease line. Shipped 2.x operational docs remain valid for users intentionally staying on npm `latest` / `@decantr/*@2`.
- When this document conflicts with current 2.x commands or package behavior, treat the 2.x docs as describing today's product and this document as describing the target operating model.

## Executive Decision

Decantr 3.0 is a hard product reset around AI Frontend Governance for existing applications.

The north star:

> Decantr is the AI Frontend Governance layer for existing applications. When AI assistants edit your codebase, Decantr keeps every change inside your product standards through typed contracts, route-scoped agent context, and machine-actionable evidence.

This plan intentionally moves Decantr away from the public story of design-intelligence registry, blueprint marketplace, stack-agnostic UI scaffolding, and Decantr CSS as a central product surface.

The new product center is:

1. Contract: a typed graph of product standards.
2. Context: route-scoped agent context derived from that graph.
3. Evidence: stable findings, repair plans, screenshots, CI artifacts, and audit trails.

The strategic wedge is not "generate apps." Vercel v0, Lovable, Bolt, Replit, Stitch, Figma Make, and adjacent tools own large parts of that story. Decantr owns the reliability loop after AI touches a real frontend.

## Live Production Baseline

The reset must respect what is live today without letting it dictate the new architecture.

Current live facts as of 2026-05-21:

- `@decantr/cli` latest on npm is `2.13.1`.
- Public docs at `decantr.ai/llms.txt` still frame Decantr as evidence-backed design intelligence and "OpenAPI for AI-generated UI."
- The registry docs at `registry.decantr.ai/llms.txt` still frame blueprints as full app compositions and "usually the best starting point."
- Hosted registry intelligence reports 567 official public items: 42 blueprints, 213 archetypes, 259 patterns, 34 themes, and 19 shells.
- Hosted shortlist verification reports 42/42 build and smoke passes, but 35/42 elevated drift and only 5 with pack manifests.
- Existing Brownfield and Hybrid work in 2.x is credible and should be preserved as maintenance-line value, not stretched into the 3.0 architecture.

This means 3.0 should be a new major line, not a slow rewording of 2.x.

Implementation status after the first 2026-05-23 prerelease closeout:

- Research gate inputs were created and folded into the architecture direction.
- The first Decantr 3 foundation package line was published as `3.0.0-next.0` under npm `next`; npm `latest` remains on the 2.x line.
- Git tag and GitHub prerelease: `v3.0.0-next.0`.
- Public docs and package READMEs now lead with AI Frontend Governance, Contract / Context / Evidence, typed graph artifacts, and Brownfield/Hybrid governance.
- The monorepo reset work landed on `main`; historical implementation branches are no longer the release authority.
- The content-doc alignment work landed on `main` in `decantr-content`.
- The official registry was synced after maintainer approval: 567 records synced, 0 pruned, 0 failed; the follow-up drift audit reported 567 matched, 0 missing, 0 extra, and 0 changed.
- Community announcement dispatch completed through `decantr-ai/community-ops`.
- Post-publish security hardening patched the `qs` and `ws` advisories, left 0 open Dependabot alerts, and passed CI, CodeQL, Code Quality, and Project Health on `main`.
- The prerelease runbook is [Decantr 3 Prerelease Runbook](../runbooks/decantr-3-prerelease.md).

## Compatibility Policy

Decantr 3.0 is not required to be backwards-compatible with Decantr 2.x contracts, packs, registry flows, or Decantr CSS-centered scaffolds.

Required compatibility:

- Keep the `2.x` line installable.
- Create a `2.x` maintenance branch.
- Leave `@decantr/cli@2`, `@decantr/mcp-server@2`, and related packages available on npm.
- Keep read-only registry/API behavior alive for 2.x users while there is meaningful usage.
- Make 3.x detect 2.x projects and fail clearly with two choices:
  - continue with `npx @decantr/cli@2 ...`
  - re-adopt with Decantr 3 governance.

Not required:

- Deep Essence V4 to Graph migration.
- Old blueprint realization parity.
- Old context markdown parity.
- Old command aliases in the primary v3 surface.
- Old registry publishing flows.
- Decantr CSS adoption parity.

Recommended public line:

```text
Decantr 2.x remains available for design-intelligence and blueprint workflows.
Decantr 3.x is the AI Frontend Governance line for existing applications.
```

## Product Boundary

### What Decantr 3 Is

- AI Frontend Governance for existing applications.
- A local-first contract, context, and evidence layer.
- A typed graph of frontend product standards.
- A verifier-centered workflow for AI-touched UI.
- An MCP-native substrate for agentic IDEs.
- A CI and audit artifact generator.

### What Decantr 3 Is Not

- Not a code generator.
- Not a UI framework.
- Not a component library.
- Not a replacement for shadcn/ui, Storybook, Chromatic, ESLint, or Playwright.
- Not a registry marketplace.
- Not a generic RAG product.
- Not a graph database product.
- Not a cross-stack shallow scanner that claims equal depth everywhere.

### Canonical Stack

Decantr 3 should go deep first on:

- React
- TypeScript
- Tailwind
- shadcn/ui
- Next.js and Vite as first target environments

The architecture remains extensible, but the public promise should stop leading with stack-agnostic breadth. Governance depth requires semantic understanding.

## Core Rollout Recommendation

Use a gated major-line reset.

### Research Gate: Competitive Architecture Calibration

Purpose:

- Ground the reset in current adjacent systems before implementation starts.
- Separate durable architecture patterns from hype.
- Prevent Decantr from rebuilding generic GraphRAG, generic memory, or generic code search.

Required research input:

- `docs/research/2026-05-21-graph-ai-governance-competitive-research.md`
- `docs/research/2026-05-21-retrieval-architecture-research.md`

Actions:

- Study Graphiti/Zep, Cognee, TrustGraph/OntologyRAG, Aider Repo Map, Sourcegraph MCP, Microsoft GraphRAG, VeritasGraph, TDAD, CGM, Letta, and selected peripheral tools.
- Study RAG-Verus, Cache-Augmented Generation, HippoRAG, Agentic RAG, A-RAG, Self-RAG, CRAG, Chain-of-Verification, DSPy, and RAPTOR as retrieval/context architecture inputs.
- Produce ADRs for graph storage, temporal snapshots, provenance, and code graph extraction before implementation.
- Compare Decantr's intended MCP tool surface against Graphiti and Sourcegraph.
- Spike tree-sitter extraction for React/TypeScript/TSX before committing to the code graph design.
- Decide whether a graph store beyond SQLite is justified.
- Implement a provider-neutral cache-friendly contract capsule in Phase 1.

Exit criteria:

- Research dossiers are reviewed.
- Storage ADR is accepted.
- Temporal snapshot and provenance schemas are drafted.
- Contract capsule shape is accepted.
- Phase 1 implementation work has a scoped technical target.

### Gate 0: Freeze 2.x

Purpose:

- Preserve user trust.
- Stop expanding the old product story.
- Create space for the reset.

Actions:

- Create and document a `2.x` maintenance branch.
- Publish a final 2.x release note that positions 2.x as the design-intelligence/blueprint line.
- Keep security and critical bug fixes only.
- Add archive banners to v2 docs once v3 docs exist.
- Keep registry/API read paths working.

Exit criteria:

- Users can intentionally install 2.x.
- Maintainers know which branch receives 2.x fixes.
- No new roadmap items are added to registry marketplace, blueprint-first, or Decantr CSS-first positioning.

Local status:

- `2.x-maintenance` branch pointers have been created locally from `origin/main`.
- Pushes, protection rules, and any public maintenance-branch announcement remain maintainer-controlled release operations.

### Gate 1: Reframe In Public Artifacts

Purpose:

- Make the category claim visible before deep rebuild work disappears into internals.
- Stop sending users toward the wrong mental model.

Actions:

- Update `decantr.ai` homepage to AI Frontend Governance.
- Change primary CTA to `npx @decantr/cli scan`.
- Replace the public mental model with Contract / Context / Evidence.
- Demote Registry to Official Packs or Vocabulary.
- Demote Greenfield to Starter Kits.
- Demote `@decantr/css` to adapter/demo status.
- Preserve security posture and local-first promises.

Exit criteria:

- A new visitor understands Decantr in under 30 seconds.
- Brownfield is the first story.
- Registry is not a top-level product promise.
- The homepage no longer says or implies blueprint-first marketplace.

### Gate 2: Build 3.0 Next Beside 2.x

Purpose:

- Let v3 break cleanly without destabilizing live users.

Actions:

- Publish `3.0.0-next.x` under npm `next`.
- Mark affected package-surface entries with `releaseChannel: "prerelease"` and `defaultDistTag: "next"` before any real publish.
- Introduce graph-derived project state.
- Introduce stable finding codes and typed repair IDs.
- Narrow CLI and MCP surfaces.
- Keep v2 packages on `latest` until proof is ready.

Exit criteria:

- v3 can adopt a real app and produce a graph snapshot.
- v3 can return typed task context through MCP.
- v3 can emit at least one graph-anchored finding and repair plan.
- v3 can run CI in a monorepo without old command-surface confusion.

### Gate 3: Build The Proof Engine

Purpose:

- Prove the product before moving `latest`.

Actions:

- Create a new `governance-proof` corpus of 5 to 8 realistic apps.
- For each app, capture:
  - adopted graph contract
  - route inventory
  - local law or style bridge
  - baseline screenshots
  - synthetic 20 to 50 commit AI edit history
  - typed drift findings
  - repair prompts
  - before/after evidence bundles
  - replayable transcript
- Use this as the homepage demo and benchmark seed.

Exit criteria:

- At least 5 proof apps show repeatable drift detection and repair.
- At least 3 drift classes are demonstrated:
  - component reuse drift
  - token/style drift
  - route/shell/context drift
- At least 1 visual drift case is demonstrated with screenshot evidence.

### Gate 4: Flip Latest

Purpose:

- Launch the new product line only after docs, proof, CLI, MCP, and package posture agree.

Actions:

- Publish `@decantr/*@3.0.0`.
- Move npm `latest` to 3.x.
- Move old docs to `/v2` or equivalent archive.
- Update public docs, package READMEs, MCP registry copy, skills, and release notes.
- Update registry portal language to vocabulary/reference catalog.

Exit criteria:

- `npx @decantr/cli scan` is the default first action across public docs.
- `decantr task` uses typed graph-backed context.
- `decantr verify` emits stable structured findings.
- The new homepage, README, MCP README, docs, and skills all say the same thing.

## Typed Graph Architecture

The typed graph is the core architectural shift.

Today, Decantr contracts are shaped as:

- hierarchical essence JSON
- generated markdown packs
- registry content records
- verifier reports
- local-law files
- evidence bundles

In Decantr 3, these become a queryable graph with typed nodes, typed edges, stable identifiers, and snapshot history.

The graph is not new product data. It is the current product reality reshaped into the form agents and verifiers need.

### Design Principles

1. Graph first, vector second.
   Structured traversal should answer known contract questions. Semantic retrieval is a fallback for ambiguous discovery, not the primary substrate.

2. Derived first, source later.
   Phase 1 graph generation should derive from existing essence, local law, registry packs, scans, and verifier reports. Do not make graph the source of truth on day one.

3. Storage adapter first, SQLite default.
   Decantr does not need Neo4j or a hosted graph database as the default developer path. Project graphs are small enough for embedded storage plus JSON snapshots. Start with SQLite unless the storage ADR proves that an embedded property graph store is worth the install and maintenance cost. Kuzu is conceptually relevant, but it must not be a hard v3 dependency while its upstream repository is archived/read-only.

4. Temporal identity from day one.
   Snapshot IDs, parent IDs, source hashes, and graph diffs should exist in Phase 1. Full temporal analytics can wait; stable temporal shape cannot.

5. Provenance as a first-class graph concern.
   Every production-grade finding should trace to the graph anchor, violated rule, source artifact, evidence item, and commit or baseline when known.

6. Markdown as a view.
   Human docs can still render from the graph. Agents should get typed JSON.

7. Stable identity everywhere.
   Findings, repairs, pages, routes, tokens, rules, and evidence must have stable IDs so CI, dashboards, MCP tools, and transcripts can point to the same thing.

8. Findings are graph nodes.
   Governance becomes operational when drift has identity, anchors, evidence, and repair actions.

### Graph Storage

Working recommendation:

- Default to SQLite plus JSON snapshots for the first implementation.
- Add a storage adapter boundary before query logic spreads across the codebase.
- Complete a storage ADR before implementation starts.
- Evaluate embedded graph-store options only if they preserve zero-infra local install and active maintenance.
- Treat Kuzu as a useful architectural reference, not a required dependency, because the upstream repository is currently archived/read-only.

Recommended local layout:

```text
.decantr/graph/
  graph.sqlite
  graph.snapshot.json
  snapshots/
    <snapshot-id>.json
  graph.manifest.json
  graph.diff.json
```

Default SQLite tables:

```text
nodes(id text primary key, type text not null, payload json not null, created_at text, updated_at text)
edges(src text not null, dst text not null, relation text not null, payload json, idx integer)
snapshots(id text primary key, parent_id text, created_at text, source_hash text, summary json)
sources(id text primary key, kind text not null, path text, commit text, hash text, payload json)
```

Required indexes:

```text
nodes(type)
edges(src, relation)
edges(dst, relation)
edges(relation)
sources(kind)
```

The JSON snapshot is the distribution artifact for MCP and CI. SQLite is the default local working store until the storage ADR says otherwise.

### Node Types

Initial node types:

| Node Type | Source Today | Stable ID Example |
| --- | --- | --- |
| Project | project root and Decantr project config | `proj:default` |
| Section | `essence.blueprint.sections[]` | `sec:app` |
| Page | section pages or observed routes | `pg:settings-profile` |
| Route | route map or scanner output | `rt:/settings/profile` |
| Shell | registry shell or observed shell | `sh:sidebar-main` |
| Region | shell internal layout region | `rg:sidebar-main.main` |
| Pattern | registry or local pattern | `pat:data-table` |
| Component | observed or declared UI component | `cmp:Button` |
| Token | CSS variable, Tailwind token, or theme token | `tkn:color.primary` |
| Theme | registry or observed theme | `theme:existing` |
| Decorator | theme decorator or local style recipe | `decor:card-elevated` |
| Feature | product feature flag or capability | `feat:billing` |
| LocalRule | accepted local rule | `rule:no-raw-button` |
| StyleBridge | accepted style bridge mapping | `bridge:tailwind-shadcn` |
| SourceArtifact | input or implementation file that produced graph facts | `src:decantr.essence.json` |
| Finding | verifier result | `find:CODE042:abc123` |
| Evidence | source, screenshot, test, AST, runtime proof | `ev:screenshot:/settings` |
| Repair | typed repair plan | `repair:restore-token-binding` |
| Test | detected or declared test surface | `test:e2e-settings` |
| AgentRun | transcript/checkpoint for an AI edit loop | `run:2026-05-21T...` |

Later node types:

- StorybookStory
- FigmaTokenSet
- ScreenshotBaseline
- VisualDiff
- PolicyPack
- OwnershipBoundary
- PackageDependency
- RuntimeAdapter

### Edge Types

Initial edge types:

| Edge | Meaning |
| --- | --- |
| `PROJECT_CONTAINS_SECTION` | project topology |
| `PROJECT_ENABLES_FEATURE` | declared product capability |
| `PROJECT_USES_THEME` | selected theme binding |
| `SECTION_CONTAINS_PAGE` | structural hierarchy |
| `PAGE_ROUTED_AT_ROUTE` | URL binding |
| `PAGE_USES_SHELL` | layout binding |
| `SHELL_HAS_REGION` | shell anatomy |
| `PAGE_COMPOSES_PATTERN` | page composition with slot and ordinal |
| `PATTERN_NEEDS_COMPONENT` | component vocabulary |
| `COMPONENT_STYLED_WITH_TOKEN` | design coupling |
| `THEME_DEFINES_TOKEN` | token provenance |
| `THEME_DEFINES_DECORATOR` | decorator provenance |
| `COMPONENT_DECORATED_WITH_DECORATOR` | style recipe application |
| `LOCAL_RULE_APPLIES_TO` | governance binding |
| `STYLE_BRIDGE_MAPS_TO` | project style-system mapping |
| `NODE_DERIVED_FROM_SOURCE` | provenance for contract and observed graph facts |
| `FINDING_VIOLATES_RULE` | drift cause |
| `FINDING_ANCHORED_AT` | graph location of drift |
| `EVIDENCE_SUPPORTS_FINDING` | proof attachment |
| `EVIDENCE_CAPTURED_FOR` | visual or runtime evidence captured for a route/page node |
| `REPAIR_FIXES_FINDING` | action binding |
| `TEST_COVERS_NODE` | test coverage |
| `AGENT_RUN_CHANGED_NODE` | replay and history |

Edge payloads should carry structured details such as `slot`, `ordinal`, `confidence`, `source`, `line`, `path`, `hash`, and `adapter`.

### Graph IDs

Use readable prefixes and stable slugs where possible:

```text
proj:
sec:
pg:
rt:
sh:
rg:
pat:
cmp:
tkn:
theme:
decor:
feat:
rule:
bridge:
src:
find:
ev:
repair:
test:
run:
```

IDs must be deterministic across runs when the underlying contract entity has not changed.

Do not use random UUIDs for common contract entities. Random IDs are acceptable only for time-bound evidence or agent-run events.

### Graph Build Pipeline

Phase 1 graph build order:

1. Read project config and current Decantr files.
2. Read essence or observed proposal.
3. Read local law:
   - `.decantr/local-patterns.json`
   - `.decantr/rules.json`
   - `.decantr/style-bridge.json`
4. Read generated context packs if present.
5. Read registry/vocabulary records if cached or online.
6. Read Brownfield intelligence and theme inventory.
7. Read visual manifest and baseline evidence if present.
8. Read verifier reports and health baselines if present.
9. Attach source/provenance nodes for every derived contract fact where practical.
10. Emit project graph.
11. Emit JSON snapshot, content-addressed snapshot history, manifest, and typed diff on every graph run.

Phase 2 adds:

1. Tree-sitter based AST/code graph extraction for React, TypeScript, and TSX.
2. Component import and reuse graph.
3. Token usage graph.
4. Route to source-file graph.
5. Finding anchors as graph IDs.
6. Test impact graph for route smoke, Playwright, unit, and Storybook surfaces where present.

Phase 3 adds:

1. Temporal queries across git history.
2. Graph diff over arbitrary git refs and baselines.
3. Agent-run transcripts.
4. Continuous MCP/IDE verification.

### Graph Queries

Queries that should become first-class product capabilities:

```text
What context does /settings need for this task?
What pages consume tkn:color.primary?
What source files implement pg:settings-profile?
What local rules apply to cmp:Button?
What findings are anchored to this route?
What repairs are available for this finding?
What changed in the contract since the baseline?
What pages would be affected by this token change?
What duplicate components look like existing local law?
What is the smallest subgraph needed for /pricing?
What tests and evidence should run after this graph change?
Which contract source introduced this finding?
```

MCP tools should expose these as typed graph traversal and pre-baked task-context queries rather than asking the agent to parse markdown.

### Retrieval And Context Architecture

Decantr 3 should not be shaped as a single RAG system.

Use different context patterns for different governance surfaces:

| Layer | Pattern | Reason |
| --- | --- | --- |
| Contract | Cache-Augmented Generation shape | stable, small, high-authority, reused across many agent calls |
| Route Context | graph-ranked agentic retrieval | task-specific and best served through narrow follow-up queries |
| Evidence | retrieval-backed graph/provenance | changing, cumulative, attribution-critical |
| Verification | verification-augmented generation | generated code is checked against contract, code graph, evidence, and repairs |

Phase 1 should emit a cache-friendly contract capsule:

```text
.decantr/graph/contract-capsule.json
```

The capsule should be model-provider-neutral. It may include a stable cache key or source hash, but Decantr must not require a specific prompt-caching API to deliver value. Use a contract-only hash/cache key beside the full graph source hash so changing findings or screenshot evidence does not invalidate the stable Contract layer.

Candidate contents:

- graph snapshot ID
- route topology
- component vocabulary
- token vocabulary
- local rules
- style bridge
- bounded source artifact path index for `file_path` graph-tool handles
- open blocking findings
- source hash/cache key

Phase 1 now includes deterministic weighted traversal with optional task-keyword boosts for route context selection. HippoRAG's Personalized PageRank pattern remains the reference model for a later Phase 2 upgrade once the code graph and evidence graph have enough density to justify iterative graph relevance scoring.

### Graph Snapshot Shape

MCP route context should return typed JSON like:

```json
{
  "graph_id": "graph:2026-05-21:abc123",
  "route": {
    "id": "rt:/settings/profile",
    "path": "/settings/profile",
    "page_id": "pg:settings-profile"
  },
  "page": {
    "id": "pg:settings-profile",
    "shell_id": "sh:sidebar-aside",
    "patterns": ["pat:settings-form", "pat:danger-zone"]
  },
  "shell": {
    "id": "sh:sidebar-aside",
    "regions": [
      { "id": "rg:sidebar-aside.sidebar", "role": "navigation" },
      { "id": "rg:sidebar-aside.main", "role": "content" }
    ]
  },
  "local_rules": [
    { "id": "rule:no-raw-button", "applies_to": ["cmp:Button"] }
  ],
  "style_bridge": [
    { "id": "bridge:surface-card", "maps_to": ["class:rounded-md", "class:border"] }
  ],
  "open_findings": [],
  "evidence": []
}
```

This should be the agent-facing form. Markdown can still be rendered for humans and legacy contexts.

### Structured Findings

Findings become graph nodes and report entries with stable code, anchor, evidence, and repair.

Finding shape:

```json
{
  "id": "find:TOKEN042:6f8a",
  "code": "TOKEN042",
  "severity": "warn",
  "category": "token-drift",
  "anchored_at": "cmp:NavLink",
  "violates": ["rule:nav-uses-primary-token"],
  "derived_from": ["src:.decantr/rules.json", "src:src/components/NavLink.tsx"],
  "message": "NavLink is styled with a non-contract color token.",
  "payload": {
    "expected": "tkn:nav.primary",
    "actual": "tkn:arbitrary.color"
  },
  "evidence": ["ev:ast:src/components/NavLink.tsx:22"],
  "baseline": {
    "snapshot_id": "graph:2026-05-21:abc123",
    "commit": "unknown"
  },
  "repair": {
    "id": "repair:restore-token-binding",
    "payload": {
      "node": "cmp:NavLink",
      "target_token": "tkn:nav.primary"
    }
  }
}
```

Finding code namespaces:

| Prefix | Area |
| --- | --- |
| `CONTRACT` | invalid or stale contract graph |
| `CONTEXT` | missing route/task context |
| `ROUTE` | route map and page addressability |
| `SHELL` | shell/region mismatch |
| `PATTERN` | pattern composition mismatch |
| `COMP` | component reuse or component policy |
| `TOKEN` | token and style drift |
| `A11Y` | accessibility |
| `VISUAL` | screenshot or visual baseline drift |
| `RUNTIME` | build/runtime evidence |
| `SECURITY` | frontend security/source risk |
| `MCP` | agent context/tooling issue |
| `CI` | automation configuration issue |

Stable codes are part of the public contract. Wording can change; code semantics should not change casually.

### Code Graph

The code graph is the observed implementation graph extracted from source.

Implementation posture:

- Use tree-sitter for React, TypeScript, and TSX extraction in the first serious code-graph pass.
- Start narrow and deep rather than claiming broad language support.
- Evaluate PageRank or a similar graph-ranking method after deterministic extraction works.
- Keep generic repo mapping out of scope unless it directly improves UI governance findings.

Initial code graph facts:

- component declarations
- component imports and exports
- JSX component usage
- raw HTML element usage
- className usage
- Tailwind utility usage
- CSS variable usage
- style attributes
- route file ownership
- shadcn imports
- local design-system imports

The verifier compares:

```text
contract graph - expected frontend law
code graph     - observed implementation facts
evidence graph - screenshots, AST snippets, runtime outputs
```

Drift becomes graph diff, not loose prose.

### Typed Graph Phases

#### Phase 1: Graph As Derived View

Value:

- agent context becomes typed and scoped
- graph can be demoed without breaking 2.x logic
- markdown remains available as a view

Implementation:

- Add graph schema.
- Add graph builder from existing project artifacts.
- Add `graph.snapshot.json`.
- Add MCP graph context read.
- Add CLI advanced graph inspection.

Exit criteria:

- `decantr scan` or `decantr adopt` can produce graph snapshot.
- Snapshot IDs, parent IDs, source hashes, typed graph diff ops, and baseline diff shape exist.
- MCP can return a route subgraph for `decantr task`.
- No existing verifier behavior needs to change yet.

#### Phase 2: Graph As Findings Substrate

Value:

- stable finding codes
- graph anchors
- typed repair plans
- CI and MCP become machine-actionable

Implementation:

- Convert Project Health findings into typed finding nodes.
- Add repair ID registry.
- Add evidence node links.
- Add AST-derived component/token facts.
- Update `verify` and `ci` report schemas.

Exit criteria:

- Every blocking/warning finding has `code`, `anchored_at`, and optional `repair.id`.
- `decantr_get_repair_plan` can return a typed repair payload for at least core finding classes.
- CI JSON can be consumed without parsing prose.

#### Phase 3: Graph As Substrate

Value:

- graph diff over time
- continuous MCP/IDE verification
- agent-run replay and audit history
- route/token/component impact analysis

Implementation:

- Extend Phase 1 snapshot IDs into temporal history queries.
- Compute graph diff between git refs and baselines.
- Attach agent-run transcripts to graph changes.
- Make Essence or its successor a graph serialization view.

Exit criteria:

- "What drift changed across the last 50 commits?" is answerable.
- Visual drift, component reuse drift, token drift, and route drift share a common finding model.
- Dashboard can render graph nodes, edges, findings, evidence, and repair state.

## CLI Plan

The primary CLI surface should be five commands:

```bash
decantr scan
decantr adopt
decantr task
decantr verify
decantr ci init
```

### Primary Commands

| Command | Role |
| --- | --- |
| `scan` | read-only project analysis, graph preview, applicability, first findings |
| `adopt` | write local governance artifacts and graph baseline |
| `task` | prepare route-scoped agent context |
| `verify` | emit graph-anchored findings and evidence |
| `ci init` | wire CI with typed artifacts and baseline policy |

### Advanced Commands

Advanced commands can remain but should not appear in first-mile docs:

- `doctor`
- `workspace`
- `graph`
- `content`
- `registry`
- `refresh`
- `health`
- `audit`
- `codify`
- `suggest`
- `theme`
- `export`
- `studio`

For v3, `doctor`, `codify`, and `suggest` may be folded into the primary command outputs:

- `scan` suggests whether to adopt.
- `adopt` suggests local law.
- `task` carries local law and suggestions.
- `verify` emits repairs.

Do not remove advanced commands until their v3 replacement is real. Hide them from onboarding first.

## MCP Plan

The MCP server is the moat because it sits inside agentic IDEs and can deliver typed context continuously.

Current MCP tool count should be narrowed for v3. The target is around 10 sharp tools.

Recommended tool set:

| Tool | Purpose |
| --- | --- |
| `decantr_get_project_state` | current project, mode, graph status, available routes, contract capsule key |
| `decantr_get_contract_capsule` | cache-friendly contract summary for session start |
| `decantr_prepare_task_context` | route/task scoped subgraph, local law, evidence, open findings |
| `decantr_query_graph` | structured query over current or historical nodes, payload fields, and edges |
| `decantr_traverse_graph` | current or historical graph traversal from a node/relation |
| `decantr_get_findings` | current typed findings with filters |
| `decantr_get_repair_plan` | typed repair plan for a finding |
| `decantr_run_verify` | run local verification loop where safe |
| `decantr_get_evidence_bundle` | local evidence bundle |
| `decantr_propose_contract_change` | write-tool proposal for contract changes |
| `decantr_accept_or_defer_finding` | explicit governance state change |

MCP principles:

- Default to read-only tools.
- Every response returns typed JSON.
- Markdown may appear only as optional `human_summary`, not primary payload.
- Load stable contract context once per session where possible; use narrow graph/evidence/finding tools for follow-up context.
- Write tools must remain explicit, annotated, path-contained, and auditable.
- Hosted upload remains opt-in.
- Tool names and schemas are public contracts.

## Verifier And Evidence Plan

The verifier becomes the product center.

### Initial Drift Classes

Core v3 drift classes:

1. Contract drift: graph invalid, stale, or missing.
2. Route drift: route/page/shell mismatch.
3. Component reuse drift: agent re-implements local primitives instead of importing them.
4. Token/style drift: raw values or wrong token families.
5. Accessibility drift: labels, landmarks, keyboard, focus, alt text.
6. Visual drift: screenshot baseline and layout regressions.
7. Runtime drift: build, route smoke, console, asset, metadata.
8. Evidence drift: missing screenshots, stale baselines, missing pack/graph snapshots.
9. Test impact drift: changed graph nodes without required test or evidence coverage.

### Component Reuse Drift

This is a key differentiator.

Detect:

- raw `<button>` where local `Button` or shadcn `Button` is the law
- duplicate card shells where `Card` exists
- repeated input wrappers where `FormField` exists
- local modal/popup implementation where `Dialog` exists
- repeated class recipes that match a local component

Inputs:

- AST component graph
- import graph
- local law
- shadcn component detection
- style bridge

Outputs:

- `COMP` findings anchored to component or source node
- repair plans that import and use the correct local primitive

### Test Impact Evidence

TDAD-style graph impact analysis should inform what Decantr asks CI and agents to verify after an edit.

Track:

- route smoke tests
- Playwright specs
- unit tests for UI primitives
- Storybook stories
- evidence bundle capture steps

Outputs:

- `TEST_COVERS_NODE` edges
- impacted test/evidence lists for changed graph nodes
- CI hints for the smallest verification set that still protects the edited UI surface

### Visual Drift

Visual drift should start narrow.

Phase 1:

- route screenshot capture
- screenshot hash baseline
- route render failure
- viewport metadata
- obvious blank/overflow detection where feasible

Phase 2:

- element-level bounding boxes for key landmarks
- screenshot diff thresholding
- responsive viewport comparison
- text overflow and overlap probes

Phase 3:

- graph-anchored visual evidence
- route/component baseline history
- drift transcript across AI edits

## Registry And Content Plan

Do not fully decommission the registry. Decommission the registry as the product story.

### New Role

The registry becomes:

- Official Vocabulary
- Governance Packs
- Certified UI Vocabulary
- optional reference content
- v2 compatibility infrastructure

It is not:

- a marketplace
- the main destination
- the first user action
- an enterprise monetization surface until customer pull proves it

### Portal Changes

Change `registry.decantr.ai` from product portal to reference catalog.

New framing:

```text
Official Decantr vocabulary packs for contracts, task context, and verification.
These packs provide optional structure. Your repo's local contract remains the authority.
```

Remove or demote:

- "publish your own content" as top-level story
- blueprint marketplace emphasis
- enterprise registry/RBAC language
- "Blueprints are usually the best starting point"

Keep:

- public item detail pages
- public API reads
- v2 compatibility
- official pack resolution
- showcase/proof evidence

### decantr-content Changes

`decantr-content` should remain the official source for vocabulary.

Change README/story from:

- official content for registry marketplace

to:

- official vocabulary and governance-pack source for Decantr contracts, context, and verification

Content schema changes should wait until graph work proves real gaps.

## Homepage And Docs Plan

`decantr.ai` should be updated before the full v3 internals are complete, but the page must not overclaim unfinished architecture.

### Bridge Homepage

Headline:

```text
AI Frontend Governance for Existing Applications
```

Subhead:

```text
Decantr keeps AI-assisted frontend changes inside your product standards through contracts, route-scoped agent context, and machine-actionable evidence.
```

Primary CTA:

```bash
npx @decantr/cli scan
```

Primary mental model:

```text
Contract: your routes, components, tokens, local rules, and style authority.
Context: route-scoped agent context loaded only when needed.
Evidence: typed findings, screenshots, CI artifacts, and repair prompts.
```

Primary workflow:

```bash
decantr scan
decantr adopt
decantr task /settings "standardize account buttons"
decantr verify
decantr ci init
```

### Remove Or Demote

- "OpenAPI for AI-generated UI"
- "design intelligence platform" as headline
- blueprint-first showcase
- registry marketplace CTAs
- `@decantr/css` as a centerpiece
- broad stack-agnostic claim
- public wine metaphor

### Keep

- local-first privacy and security posture
- MCP agent integration
- existing-app workflow
- CI/evidence story
- open-source core

## Documentation Impact Matrix

Every behavior-changing phase must update the relevant surfaces in the same branch.

### decantr-monorepo Public Docs

| File | Required Change |
| --- | --- |
| `README.md` | new north star, v2/v3 split, primary commands |
| `docs/index.html` | homepage reframe |
| `docs/README.md` | mark this program as active source of truth |
| `docs/llms.txt` | AI Frontend Governance summary for crawlers and agents |
| `docs/guides/existing-apps.md` | first-mile v3 brownfield flow |
| `docs/guides/ai-assistant-setup.md` | typed MCP context and graph-backed workflow |
| `docs/guides/project-health-ci.md` | structured findings and CI artifacts |
| `docs/guides/monorepos.md` | app-scoped graph baselines and CI |
| `docs/guides/registry-content-publishing.md` | demote/archive publishing story |
| `docs/guides/design-contract-basics.md` | Contract/Context/Evidence and graph basics |
| `docs/reference/workflow-model.md` | v3 workflow model |
| `docs/reference/command-surface.md` | five-command primary surface |
| `docs/reference/project-health.md` | graph findings and evidence |
| `docs/reference/security-permissions.md` | graph, MCP, evidence, CI read/write posture |
| `docs/reference/package-support-matrix.md` | package role changes |
| `docs/reference/registry-public-api.md` | registry as vocabulary/reference |
| `docs/schemas/*` | new graph/finding schemas |
| `docs/sitemap.xml` | new and archived pages |
| `docs/releases/*` | v3 launch and v2 freeze notes |

### Package READMEs

| Package | Required Change |
| --- | --- |
| `packages/cli/README.md` | scan/adopt/task/verify/ci init first-mile |
| `packages/mcp-server/README.md` | typed graph tools, fewer tools, agent-facing context |
| `packages/verifier/README.md` | verifier as moat, graph-anchored findings |
| `packages/essence-spec/README.md` | contract graph schema and v2/v3 boundary |
| `packages/core/README.md` | graph builder and execution primitives |
| `packages/registry/README.md` | vocabulary client, not marketplace SDK |
| `packages/css/README.md` | adapter/demo posture |
| `packages/telemetry/README.md` | v3 event names if telemetry remains |

### Apps And Hosted Surfaces

| Surface | Required Change |
| --- | --- |
| `apps/registry` | reference catalog copy and navigation |
| `apps/api` | keep v2 endpoints, add v3 graph/finding endpoints only if needed |
| `apps/showcase-host` | proof corpus or archived showcase role |
| `docs/scan.html` | scan-first governance language |

### Other Repositories

| Repo | Required Change |
| --- | --- |
| `decantr-content` | official vocabulary/governance-pack source, not marketplace center |
| `decantr-framework` | archive/deprecated status, no strategic role |
| `decantr-meta` | optional strategy reference only |

### Skills

Local skills must be updated when the new program becomes active:

| Skill | Required Change |
| --- | --- |
| `/Users/davidaimi/.agents/skills/decantr-engineering/SKILL.md` | 3.0 product boundary, graph architecture, v2/v3 split, registry demotion |
| `/Users/davidaimi/.agents/skills/decantr-release-engineering/SKILL.md` | v2 maintenance and v3 next/latest release workflow |

Do not update skills before the repo has the matching plan and implementation branch. Skills should follow durable decisions, not exploratory chat.

## Execution Plans

### Plan A: Strategy And Brand Reset

Goal:

- Establish AI Frontend Governance as the category and Decantr 3 as the product line.

Tasks:

1. Create this master program.
2. Update docs index to point at this program.
3. Create v2 freeze note.
4. Rewrite public homepage copy.
5. Rewrite root README and docs `llms.txt`.
6. Rewrite MCP README and package docs.
7. Rewrite registry portal copy.
8. Update skills after repo docs land.

Exit criteria:

- Every public artifact uses the same one-sentence positioning.
- Contract / Context / Evidence appears consistently.
- Registry and Greenfield are demoted.
- v2 users have clear install guidance.

### Plan B: Typed Graph Foundation

Goal:

- Make the graph real as a derived view before replacing core contracts.

Tasks:

1. Complete storage ADR: SQLite node/edge tables, embedded graph store, or pluggable adapter.
2. Add graph schema under package and docs schema surfaces.
3. Implement graph builder in `@decantr/core` or a dedicated internal module.
4. Generate graph from essence, local law, style bridge, registry cache, Brownfield intelligence, visual manifest, and health report.
5. Emit `contract-capsule.json` from the accepted graph snapshot.
6. Write `.decantr/graph/graph.snapshot.json`, `.decantr/graph/snapshots/<snapshot-id>.json`, `graph.manifest.json`, and `graph.diff.json`.
7. Attach source/provenance records to derived graph nodes and edges where practical.
8. Add advanced CLI graph inspection. Initial implementation includes `decantr graph --route <route> --json` for route-scoped subgraph inspection.
9. Add MCP graph read/traverse tools. Initial implementation also includes deterministic ranked route-context nodes, task-keyword boosts for top-N agent consumption, local history snapshot reads/diffs, and the stable diagnostic catalog through project state.
10. Render legacy/human markdown from graph where feasible.

Exit criteria:

- A real attached app can produce a graph.
- Contract capsule is implemented with provider-neutral shape.
- Route context is extracted from graph.
- Snapshot is deterministic under repeated runs.
- Storage decision is documented and reversible behind an adapter boundary.

### Plan C: Structured Findings And Repairs

Goal:

- Convert verification from prose reports into machine-actionable governance artifacts.

Tasks:

1. Define finding schema with stable codes. Initial implementation complete for Project Health and Evidence Bundle findings.
2. Define repair ID registry. Initial implementation complete for known Project Health rules plus deterministic fallbacks.
3. Anchor existing Project Health findings to graph nodes where possible. Initial implementation complete for LocalRule, Route, Page, Pattern, SourceArtifact, and Project fallback anchors.
4. Convert evidence bundle to reference graph IDs. Initial implementation complete through optional `graph` anchors on Evidence Bundle findings and graph ingestion of saved `.decantr/evidence/latest.json` findings/evidence/repair IDs plus referenced repair/read target files.
5. Add provenance fields linking finding, rule, graph anchor, source artifact, evidence, and baseline. Initial implementation complete for graph snapshot, manifest, diff, and contract-capsule provenance in Evidence Bundles, with those hashes folded into the evidence-bundle SourceArtifact so real graph input changes affect typed graph freshness while timestamp-only churn does not.
6. Update CI report schema. Initial implementation flows through `ProjectHealthReport.graph`, so `decantr health --json` and `decantr ci --json` expose graph readiness, stale artifacts, snapshot/capsule identity, source artifact counts, and capsule source-handle bounds without parsing findings prose.
7. Add MCP repair-plan tool.
8. Add human rendering for the same typed findings.

Exit criteria:

- Core findings carry `code`, `anchored_at`, `evidence`, and `repair`.
- Production-grade findings carry lineage back to rule and source artifact.
- CI can be consumed without parsing markdown.
- Agent can request one repair plan and get structured payload.

### Plan D: Code Graph And Component Reuse Drift

Goal:

- Catch the drift that most AI coding agents actually create: duplicate local UI primitives and raw styling.

Tasks:

1. Use TypeScript AST now, then evaluate tree-sitter for broader language coverage, to parse React/TypeScript/TSX component definitions and usage. Initial primitive reimplementation detector is implemented through `auditComponentReuse()`.
2. Detect local component exports and shadcn imports.
3. Map raw HTML controls to local component law. Initial raw-control detector emits `COMP010` when a reusable primitive exists.
4. Map Tailwind/class recipes to token/style bridge facts. Initial accepted style bridge detector emits `TOKEN010` when production JSX, common class-helper calls, inline styles, or production CSS/module stylesheets use arbitrary or hardcoded visual values after `.decantr/style-bridge.json` is accepted.
5. Map route files and import/reference relationships. Initial implementation resolves local relative imports plus common `tsconfig`/`jsconfig` path aliases such as `@/*` into `SOURCE_IMPORTS_SOURCE` graph edges between `SourceArtifact` nodes.
6. Evaluate PageRank or similar graph ranking for scoped context selection.
7. Emit `COMP` and `TOKEN` findings. Initial `COMP001` / `import-existing-component`, `COMP010` / `replace-raw-control-with-local-component`, and `TOKEN010` / `replace-arbitrary-style-with-bridge-token` findings are implemented.
8. Add repair plans for import-and-replace and style-bridge scenarios. Initial typed repair payloads include local file, canonical component file, component name, arbitrary value, accepted mapping IDs, and token/class hints.

Exit criteria:

- Decantr catches raw button/card/form duplication in proof apps.
- Findings point at component graph nodes and source evidence.
- Repair prompts are precise enough for an agent to act.

### Plan E: Visual Drift And Evidence

Goal:

- Make the proof visual enough for buyers and concrete enough for agents.

Tasks:

1. Standardize local screenshot baseline capture.
2. Attach screenshot evidence to route/page graph nodes.
3. Add visual manifest graph ingestion.
4. Add viewport matrix for proof apps.
5. Add initial diff thresholds and blank/overflow checks.
6. Generate replayable before/after evidence for demos.

Exit criteria:

- At least 5 proof apps have screenshot baselines.
- Visual findings can link route, screenshot, and repair context.
- Demo can show visual drift caught after AI edit.

### Plan F: CLI And MCP Simplification

Goal:

- Make the product operable with five CLI commands and a smaller MCP tool set.

Tasks:

1. Rework help text around scan/adopt/task/verify/ci init.
2. Move old primitives under advanced docs.
3. Add v2 project detection and v3 re-adopt guidance.
4. Add session-level contract capsule support where the agent can benefit from cache-friendly context.
5. Collapse task context around task-ranked route subgraphs.
6. Prune MCP docs to the target tool set.
7. Keep old MCP tools only behind compatibility where needed.

Exit criteria:

- New user can complete first-mile flow without reading command-surface reference.
- Agent can prepare task context with one MCP call.
- Agent can load stable contract context once and ask narrower follow-up questions.
- `verify` produces typed findings and human summary.

### Plan G: Proof Corpus

Goal:

- Replace vague showcase proof with replayable governance proof.

Tasks:

1. Select 5 to 8 proof apps.
2. Ensure they are realistic Brownfield/Hybrid targets.
3. Create synthetic AI edit histories.
4. Record findings and repair loops.
5. Attach screenshots and evidence bundles.
6. Publish one public replay.
7. Use corpus to drive homepage and pitch.

Exit criteria:

- Homepage has one replayable demo.
- At least 3 drift classes are shown.
- The proof artifacts are deterministic enough for release QA.

### Plan H: Registry Demotion

Goal:

- Preserve infrastructure value without selling the wrong product.

Tasks:

1. Rename portal language to Official Vocabulary or Governance Packs.
2. Remove marketplace/publish CTAs from primary navigation.
3. Keep public read endpoints.
4. Keep v2 content compatibility.
5. Update content README and publishing guide.
6. Stop new enterprise registry work until customer pull.

Exit criteria:

- Registry is a resource, not the product.
- Existing v2 users do not break.
- New users are directed to scan/adopt, not browse blueprints.

### Plan I: Release And Operations

Goal:

- Make the cut without confusing npm, docs, or release processes.

Tasks:

1. Create `2.x` branch and policy.
2. Add v3 prerelease tags.
3. Update release scripts if package waves change.
4. Add closeout checks for docs/skills/package READMEs.
5. Add v3 launch release note template.
6. Update release-engineering skill.

Exit criteria:

- Maintainers can publish 2.x patches and 3.x next releases safely.
- `latest` is not moved until launch gate passes.
- Closeout catches stale docs and package copy.

## Success Metrics

### 30 Days

- Master plan merged.
- Competitive research dossier reviewed.
- Retrieval architecture research reviewed.
- v2/v3 branch policy decided.
- Homepage rewrite drafted.
- Typed graph schema draft written.
- Graph storage ADR drafted.
- Temporal/provenance schema draft written.
- Contract capsule Phase 1 shape implemented in core.
- First TypeScript AST component reuse and accepted style bridge drift slices implemented, including stylesheet drift; first typed visual-baseline drift finding implemented through `VISUAL010`; tree-sitter code graph spike remains scoped for broader extraction.
- Proof corpus candidates selected.

### 90 Days

- New homepage live with AI Frontend Governance framing.
- First graph-derived route context working.
- Contract capsule prototype wired into graph output path.
- One proof app with replayable drift transcript.
- First structured finding schema merged.
- Registry public copy demoted.

### 180 Days

- `3.0.0-next` usable on real Brownfield apps.
- Graph snapshots generated by scan/adopt.
- Core verifier findings have stable codes and graph anchors.
- MCP returns typed route context.
- 5 design partners or real repos have tried the v3 flow.

### 270 Days

- React/TypeScript/Tailwind/shadcn deep verifier shipped.
- Component reuse drift deepened beyond the initial primitive redeclaration slice.
- Visual drift baseline shipped.
- 5 to 8 proof apps have replayable evidence.
- Public demo shows AI edit, Decantr finding, repair, and passing verification.

### 360 Days

- `3.0.0` is on npm latest if gates pass.
- 50+ active Brownfield/Hybrid projects or strong equivalent usage signal.
- 1 to 3 enterprise pilot conversations if market pull exists.
- Decision made: solo OSS, funded team, or strategic partnership.

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| Vercel or another platform ships frontend governance | Medium-high | High | Claim category early, specialize in local-first MCP and UI-specific evidence |
| Re-architecture eats a year | Medium | High | Phase graph as derived view first |
| Old users get confused | Medium | Medium | Clear 2.x branch, install guidance, v3 detection |
| Registry attachment persists | High | Medium | Demote registry language immediately |
| Typed graph becomes architecture theater | Medium | High | Tie every graph node/edge to task context, findings, or repair |
| Graph storage dependency ages poorly | Medium | Medium | Keep SQLite default and storage adapter boundary; do not hard-depend on archived Kuzu |
| Visual drift is too hard | Medium | Medium | Start with route screenshots and baseline evidence, not full pixel perfection |
| Stack depth narrows market | Low-medium | Medium | Lead with React/shadcn depth, keep adapter seams for later |
| MCP tool changes break agent users | Medium | Medium | Version MCP schemas, keep compatibility only where cheap |
| Paid enterprise story distracts | Medium | High | Park paid registry/RBAC until customer pull |

## Open Decisions

1. Package naming:
   - Recommended: keep `@decantr/*`, use major version reset.
   - Alternative: introduce `@decantr/graph` or `@decantr/governance`.

2. Graph package home:
   - Recommended: graph builder in `@decantr/core`, schemas exported from `@decantr/essence-spec` or a renamed contract package.
   - Open: separate `@decantr/contract-graph`.

3. Graph storage:
   - Recommended: SQLite default with a storage adapter boundary.
   - Open: whether an embedded property graph store is worth the added dependency.
   - Constraint: do not hard-depend on archived/read-only Kuzu for v3 launch.

4. Homepage timing:
   - Recommended: bridge homepage before v3 internals finish, with careful no-overclaim wording.
   - Open: wait until first graph demo.

5. Registry naming:
   - Candidates: Official Vocabulary, Governance Packs, Certified UI Vocabulary, Official Packs.

6. v2 docs archive path:
   - Candidates: `/v2`, `/archive/v2`, separate branch deployment.

7. Proof corpus location:
   - Candidates: `apps/governance-proof`, `apps/showcase/governance`, or separate repo.

8. Contract capsule timing:
   - Decision: Phase 1 artifact.
   - Constraint: provider-neutral cache key and snapshot reference, no dependency on a model-provider cache API.

9. Route context ranking:
   - Implemented Phase 1 baseline: deterministic weighted traversal with task-keyword boosts.
   - Open Phase 2 upgrade: personalized PageRank, weighted traversal, or hybrid ranking over denser code/evidence graphs.

## Disagreements And Refinements From The External Feedback

This plan accepts the core typed-graph recommendation, with refinements:

- Do not make graph the source of truth immediately. Start as derived view.
- Do not claim GraphRAG as the product. This is deterministic contract graphing, not general knowledge graph extraction.
- Do not treat Decantr as one RAG system. Contract is cache-friendly; Evidence is retrieval/provenance-heavy; Context is graph-ranked and agentic; Verification is the product loop.
- Do not hard-require Kuzu. Its property-graph model is relevant, but the repository is archived/read-only; Decantr needs a storage ADR and adapter boundary.
- Do not delay temporal identity until the final phase. Snapshot IDs, parent IDs, source hashes, and baseline diff shape belong in Phase 1.
- Do not bury provenance in prose. Findings need lineage to source artifact, rule, graph node, evidence, and baseline where known.
- Do not ban markdown entirely. Markdown remains a human render and legacy compatibility format.
- Do not make "all MCP tools emit no markdown" absolute. Typed JSON is primary; optional human summaries are useful.
- Do not over-index on analyst phrasing that is not directly sourced in repo docs. Use market trend as context, not proof.
- Do not launch all 42 showcase apps as the first proof gate. A smaller governance-proof corpus can be more convincing and cheaper to repair.
- Do not make private registries a near-term business dependency. Park them until pull exists.
- Do not depend on provider-specific prompt caching. Design a cache-friendly contract capsule, but keep MCP and CLI useful without native cache APIs.

## Immediate Next Steps

1. Review and approve this master program.
2. Review the competitive research dossier.
3. Review the retrieval architecture research.
4. Review the draft ADRs for graph storage, temporal snapshots/provenance, and tree-sitter code graph extraction.
5. Review the typed graph foundation spec.
6. Decide the public name for the demoted registry surface.
7. Decide v2 archive policy.
8. Draft homepage bridge copy.
9. Select proof corpus candidates.
10. Create implementation branch for v3 graph-derived view.
