# Decantr 3.0 Phase 1 - Typed Graph Foundation

Date: 2026-05-21
Status: Draft with Phase 1 implementation slices
Author: Codex
Program: `docs/programs/2026-05-21-ai-frontend-governance-reset-plan.md`
Research: `docs/research/2026-05-21-graph-ai-governance-competitive-research.md`
Decisions:

- `docs/architecture/decisions/2026-05-21-graph-storage-adapter.md`
- `docs/architecture/decisions/2026-05-21-temporal-provenance-model.md`
- `docs/architecture/decisions/2026-05-21-code-graph-extraction.md`
- `docs/architecture/decisions/2026-05-21-contract-capsule-context-architecture.md`

## Overview

Phase 1 makes the Decantr 3 graph real as a derived view of existing project authority.

The graph is not the source of truth in this phase. It is a deterministic operating model generated from current project artifacts:

- Decantr project config
- Essence or observed proposal
- local law
- style bridge
- registry or vocabulary cache
- Brownfield intelligence
- visual manifest
- verifier reports
- health baselines

The immediate win is typed, scoped, graph-backed context for CLI, MCP, and CI without forcing a migration away from existing 2.x artifacts.

Implemented slices as of this document revision:

- `@decantr/core` graph schema/types, memory store, deterministic Essence/IR graph builders, typed snapshot diffing, and Contract capsule builder.
- `decantr graph` writing `graph.snapshot.json`, content-addressed snapshot history under `.decantr/graph/snapshots/`, `graph.manifest.json`, `graph.diff.json`, and `contract-capsule.json`, with typed diff summaries, optional `--route <route>` subgraph inspection, `--snapshot-id` replay, and `--compare-to` snapshot comparison for CLI/MCP consumers.
- Published graph artifact schemas under `@decantr/core/schema/*` and `https://decantr.ai/schemas/*`: `graph.common.v1.json`, `graph-snapshot.v1.json`, `graph-manifest.v1.json`, `graph-diff.v1.json`, and `contract-capsule.v1.json`.
- MCP `decantr_get_contract_capsule` and `decantr_get_graph_snapshot`, plus graph readiness, stable diagnostic catalog, and typed diff summaries through `decantr_get_project_state`.
- `decantr task` inclusion of the Contract capsule and route-scoped typed graph context when present.
- Project Health and Evidence Bundle optional `graph` anchors for findings when `.decantr/graph/graph.snapshot.json` exists.
- First AST-derived component reuse drift slice: `auditComponentReuse()` emits `COMP001` / `import-existing-component` when production source redeclares a common primitive while a reusable project-owned component already exists.
- First accepted style bridge drift slice: `auditStyleBridgeDrift()` emits `TOKEN010` / `replace-arbitrary-style-with-bridge-token` when production JSX or common class-helper calls use arbitrary Tailwind values, or hardcoded inline color styles, after a bridge has been accepted.
- Visual manifest ingestion: `decantr graph` reads `.decantr/evidence/visual-manifest.json` and local route screenshots as `Evidence` nodes linked back to Route/Page graph nodes.
- Evidence Bundle ingestion: `decantr graph` reads `.decantr/evidence/latest.json` when present and projects saved findings, evidence text, graph anchors, repair IDs, and referenced repair/evidence source files into Finding/Evidence/Repair/SourceArtifact graph nodes. If a saved finding lacks a graph anchor but references a local source file, the graph can infer a `FINDING_ANCHORED_AT` edge to that `SourceArtifact`. Evidence Bundle graph provenance hashes for the snapshot, manifest, diff, and contract capsule are also part of the bundle SourceArtifact hash, so provenance-only timestamp churn is ignored while real graph input changes mark artifacts stale.
- Brownfield analysis ingestion: `decantr graph` reads `.decantr/analysis.json` when present, adds route source files as `SourceArtifact` nodes, and links Route/Page nodes back to the source file implementing the observed route.
- Lightweight code graph ingestion: `decantr graph` reuses the verifier source scan to add exported reusable component declarations as `Component` nodes and links them to local source artifacts. This is the first bridge toward the tree-sitter code graph without introducing a new parser dependency.
- Temporal evidence ingestion: `decantr graph` reads `.decantr/health-baseline-diff.json` when present and materializes changed files, changed routes, screenshot drift, and contract drift as Evidence nodes linked to SourceArtifact, Route, or Project nodes.

## Goals

- Define the first graph schema for Decantr 3.0.
- Build a graph as a derived view of existing project artifacts.
- Emit deterministic local graph files.
- Include snapshot identity and provenance from day one.
- Give MCP a typed route/task context surface.
- Decide and optionally emit a cache-friendly contract capsule.
- Give `scan`, `adopt`, `task`, and `verify` a shared graph substrate.
- Keep markdown as a human render, not the primary agent payload.

## Non-Goals

- Replace Essence as the authoring source.
- Implement full code graph extraction.
- Implement full visual drift detection.
- Implement hosted graph storage.
- Build generic GraphRAG.
- Launch the v3 public package line.
- Break the 2.x line.

## Product Boundary

The Phase 1 graph serves AI Frontend Governance:

```text
Contract: what the frontend is supposed to be.
Context: the scoped graph slice an agent needs for a task.
Evidence: facts, findings, sources, and repairs that prove governance state.
```

The graph must not become a generic memory layer or code search database.

## Local Artifact Layout

Recommended local files:

```text
.decantr/graph/
  graph.sqlite
  graph.snapshot.json
  snapshots/
    <snapshot-id>.json
  graph.manifest.json
  graph.diff.json
  contract-capsule.json
```

The JSON files are public artifacts. SQLite is an implementation detail behind the storage adapter.

`contract-capsule.json` is a Phase 1 artifact. It should be a compact, cache-friendly Contract summary for session start, not a replacement for the full graph snapshot. The capsule carries both the full graph `source_hash` and a contract-only `contract_hash` / `contract_cache_key` so Evidence changes can move without invalidating the stable Contract identity. It also includes a bounded `source_artifacts` index with project-relative paths and kinds so agents can discover valid `file_path` handles for follow-up impact and traversal queries without loading the full snapshot. `summary.source_artifacts` records the total SourceArtifact count, while `source_artifact_limit` and `source_artifacts_truncated` make the capsule size explicit. The CLI defaults to 200 source handles and exposes `--capsule-source-limit <count>` for large repositories or cache-sensitive agent sessions.

## Storage Boundary

Phase 1 must implement or stub a `GraphStore` adapter boundary before query logic spreads across packages.

Required operations:

```ts
export interface GraphStore {
  open(projectRoot: string): Promise<void>;
  close(): Promise<void>;
  upsertNode(node: GraphNode): Promise<void>;
  upsertEdge(edge: GraphEdge): Promise<void>;
  getNode(id: string): Promise<GraphNode | null>;
  queryNodes(query: GraphNodeQuery): Promise<GraphNode[]>;
  queryEdges(query: GraphEdgeQuery): Promise<GraphEdge[]>;
  traverse(query: GraphTraverseQuery): Promise<GraphSubgraph>;
  writeSnapshot(snapshot: GraphSnapshot): Promise<void>;
  readSnapshot(id?: string): Promise<GraphSnapshot | null>;
}
```

Phase 1 may start with a simple SQLite implementation. Tests should target the adapter contract where possible.

Implemented foundation:

- `@decantr/core` exposes the initial `GraphStore` interface and `createMemoryGraphStore` test adapter.
- `GraphStore.queryNodes` supports ID/type selectors plus payload key, exact payload value, and payload substring filters so MCP/CLI callers can query findings by stable codes without reading full snapshots.
- `@decantr/core` owns `buildGraphRouteContext`, the canonical route-scoped subgraph extractor used by both CLI task context and MCP graph reads. It accepts optional task text and boosts ranked nodes whose IDs, labels, or payloads match task keywords.
- `@decantr/core` owns `buildGraphImpactContext`, the canonical node-impact extractor for questions such as "which routes depend on this component/token/rule/finding/source artifact?" It ranks affected routes, pages, patterns, components, local law, findings, evidence, repairs, and provenance nodes for agent-sized follow-up reads. CLI `--file <path> --impact` and MCP `file_path` resolve project-relative paths to SourceArtifact node IDs before calling the same extractor, so agents can start from the source file they are editing without knowing Decantr's internal IDs.
- The CLI graph builder promotes accepted style bridge `tokenHints` into first-class Token nodes linked back to the bridge mapping and source artifact, so Brownfield/Hybrid style authority is queryable even when the app does not use Decantr CSS.
- The CLI graph builder projects local relative TypeScript/TSX imports and common `tsconfig`/`jsconfig` path aliases such as `@/*` into `SOURCE_IMPORTS_SOURCE` edges between `SourceArtifact` nodes, giving source-file impact reads a first code-graph hop without requiring tree-sitter.
- Kuzu/SQLite persistence remains a Phase 2 storage decision; Phase 1 keeps JSON artifacts as the durable disk format.

## Graph Schema

### Node

```ts
export interface GraphNode<TPayload = Record<string, unknown>> {
  id: string;
  type: GraphNodeType;
  payload: TPayload;
  created_at?: string;
  updated_at?: string;
}
```

Initial node types:

```text
Project
Section
Page
Route
Shell
Region
Pattern
Component
Token
Theme
Decorator
Feature
LocalRule
StyleBridge
SourceArtifact
Finding
Evidence
Repair
Test
AgentRun
```

### Edge

```ts
export interface GraphEdge<TPayload = Record<string, unknown>> {
  src: string;
  dst: string;
  relation: GraphRelation;
  payload?: TPayload;
  idx?: number;
}
```

Initial relations:

```text
PROJECT_CONTAINS_SECTION
PROJECT_ENABLES_FEATURE
PROJECT_USES_THEME
SECTION_CONTAINS_PAGE
PAGE_ROUTED_AT_ROUTE
PAGE_USES_SHELL
SHELL_HAS_REGION
PAGE_COMPOSES_PATTERN
PATTERN_NEEDS_COMPONENT
COMPONENT_STYLED_WITH_TOKEN
THEME_DEFINES_TOKEN
THEME_DEFINES_DECORATOR
COMPONENT_DECORATED_WITH_DECORATOR
LOCAL_RULE_APPLIES_TO
STYLE_BRIDGE_MAPS_TO
NODE_DERIVED_FROM_SOURCE
FINDING_VIOLATES_RULE
FINDING_ANCHORED_AT
EVIDENCE_SUPPORTS_FINDING
EVIDENCE_CAPTURED_FOR
REPAIR_FIXES_FINDING
TEST_COVERS_NODE
AGENT_RUN_CHANGED_NODE
```

### Snapshot

```ts
export interface GraphSnapshot {
  id: string;
  schema_version: string;
  project_id: string;
  created_at: string;
  parent_id?: string;
  source_hash: string;
  git?: {
    commit?: string;
    branch?: string;
    dirty?: boolean;
  };
  nodes: GraphNode[];
  edges: GraphEdge[];
  summary: {
    nodes: number;
    edges: number;
    findings: number;
    evidence: number;
  };
}
```

### Manifest

```ts
export interface GraphManifest {
  schema_version: string;
  snapshot_id: string;
  project_id: string;
  generated_at: string;
  sources: SourceArtifact[];
  outputs: {
    sqlite?: string;
    snapshot: string;
    history?: string;
    diff?: string;
  };
  warnings: Array<{
    code: string;
    message: string;
  }>;
}
```

### Diff

```ts
export interface GraphDiff {
  id: string;
  from?: string;
  to: string;
  ops: GraphDiffOp[];
}
```

Initial diff ops:

```text
node.added
node.removed
node.changed
edge.added
edge.removed
edge.changed
finding.added
finding.resolved
evidence.added
```

## ID Policy

Use deterministic readable IDs for contract entities:

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

Random or time-based IDs are acceptable only for:

- evidence generated at a point in time
- agent run events
- transient scan sessions

## Build Pipeline

Phase 1 graph build order:

1. Resolve project root and Decantr project config.
2. Load existing Decantr files if present.
3. Load Essence or observed proposal.
4. Load local law:
   - `.decantr/local-patterns.json`
   - `.decantr/rules.json`
   - `.decantr/style-bridge.json`
5. Load generated context packs if present.
6. Load registry or vocabulary records from cache or online lookup when already allowed.
7. Load Brownfield intelligence and theme inventory if present.
8. Load visual manifest and baseline evidence if present.
9. Load verifier reports and health baselines if present.
10. Create source artifacts for every loaded input.
11. Emit graph nodes and edges.
12. Attach `NODE_DERIVED_FROM_SOURCE` provenance edges where practical.
13. Compute snapshot ID and source hash.
14. Compare with prior snapshot when available.
15. Write SQLite store, snapshot, manifest, and diff.
16. Write a provider-neutral contract capsule.

Network access behavior must follow existing package permission and hosted upload rules. Phase 1 should work offline from local artifacts.

## CLI Integration

### `decantr scan`

Required Phase 1 behavior:

- runs read-only analysis
- builds graph preview in memory or temp output
- reports graph summary
- reports whether project can be adopted
- emits first findings when obvious

Implemented Phase 1 behavior:

- `decantr scan` now attaches optional `graphPreview` to `scan-report.v1` terminal and JSON output without writing files.
- unattached projects report `not_attached` and recommend adoption.
- attached Essence V4 projects derive the typed Contract graph in memory, report snapshot/capsule counts plus capsule source-handle bounds, and identify stale or missing `.decantr/graph` artifacts with a `decantr graph` next command.
- pre-v4 Decantr contracts report `needs_migration` rather than attempting graph output.

### `decantr adopt`

Required Phase 1 behavior:

- writes local governance artifacts
- writes graph baseline
- writes graph snapshot and manifest
- preserves v2 detection and re-adopt guidance

Implemented Phase 1 behavior:

- `decantr adopt` now runs `decantr graph` after the app is initialized and before verification, writing `graph.snapshot.json`, `graph.manifest.json`, `graph.diff.json`, and `contract-capsule.json` as the first typed Contract baseline.

### `decantr graph`

Implemented Phase 1 behavior:

- reads `decantr.essence.json`, accepted `.decantr/rules.json`, and accepted `.decantr/style-bridge.json`
- writes `.decantr/graph/graph.snapshot.json`
- writes `.decantr/graph/snapshots/<snapshot-id>.json`
- writes `.decantr/graph/graph.manifest.json`
- writes `.decantr/graph/graph.diff.json`
- writes `.decantr/graph/contract-capsule.json`
- supports `--check` for CI-safe freshness without writing
- supports `--json` for machine-readable summaries
- supports `--node <id> --impact` and `--file <path> --impact` for graph-shaped blast-radius reads from either a known graph node or a project-relative SourceArtifact path

### `decantr task`

Required Phase 1 behavior:

- accepts route and task string
- loads graph snapshot
- extracts route/task subgraph
- returns local law, style bridge, route, page, shell, patterns, open findings, and evidence references
- keeps markdown as optional human summary

If `contract-capsule.json` exists, `task` should reference its snapshot ID or cache key instead of repeating stable contract context in every response.

Implemented Phase 1 behavior:

- `decantr task --json` includes `graph.routeContext` with the route node, page/shell/pattern/component/token/local-law/style-bridge/finding/evidence ID summaries, plus the scoped nodes and edges.
- Route graph context includes deterministic ranked nodes with scores, reasons, ranking metadata, and optional matched terms so agents can consume a top-N relevance view without a vector lookup. When task text is provided, matched route, component, finding, evidence, and source nodes receive a small deterministic task boost.
- When git changed files resolve to SourceArtifact nodes, `decantr task --json` includes `graph.changedFileContext` with the source-file impact summary, affected node IDs, ranked nodes, and supporting edges.
- Human `decantr task` output reports the route subgraph node/edge count and route pattern IDs.
- The task read list points agents to `contract-capsule.json` when present, and only falls back to the full snapshot read target when a capsule is unavailable.

### `decantr verify`

Required Phase 1 behavior:

- reads graph snapshot
- emits structured findings where existing checks can anchor to graph IDs
- writes human summary and JSON report

Implemented Phase 1 behavior:

- Project Health reads `.decantr/graph/graph.snapshot.json` when present and attaches graph anchors to findings, remediation prompts, markdown/text output, and Evidence Bundles. Evidence Bundles also include provenance entries for graph snapshot, manifest, diff, and contract capsule artifacts, including `present: false` entries when the graph has not been generated yet.
- Attached apps emit `GRAPH001` with repair ID `regenerate-typed-graph` when `.decantr/graph` artifacts are missing, stale, or cannot be derived from the current Essence/local law/style bridge sources.
- `decantr verify` and `decantr ci` inherit the same graph freshness finding through Project Health, with `decantr graph --project <app>` as the scoped repair command.

## MCP Integration

Phase 1 should expose the graph through a narrow typed tool set:

```text
decantr_get_project_state
decantr_get_contract_capsule
decantr_get_graph_snapshot
decantr_prepare_task_context
decantr_query_graph
decantr_traverse_graph
decantr_get_findings
decantr_get_evidence_bundle
```

Write tools can wait unless needed for implementation parity.

Implemented in this slice:

- `decantr_get_contract_capsule` with the cache-friendly Contract summary and SourceArtifact path index
- `decantr_get_project_state` for compact project readiness, generated-pack, graph, diagnostic catalog, and local-authority state
- `decantr_get_graph_snapshot` with metadata, compact local history, full snapshot, route-scoped subgraph modes, optional task-aware ranking, specific history snapshot reads, and typed diffs between local snapshots
- `decantr_prepare_task_context` with task-ranked typed route graph context and Contract capsule cache keys when graph artifacts exist
- `decantr_query_graph` for direct node/type/payload/relation lookups against current or historical local snapshots, including diagnostic-code queries such as `node_type=Finding` plus `payload_key=code`; callers can set `include_impact` to receive graph-shaped blast radius for the matched node IDs
- `decantr_traverse_graph` for bounded relation traversal from one or more graph node IDs or a project-relative `file_path` SourceArtifact against current or historical local snapshots
- `decantr_get_findings` for compact typed Project Health findings with stable codes, repair IDs, and optional prompts
- `decantr_get_repair_plan` for typed repair actions, evidence, read targets, preserve/avoid constraints, and rerun commands
- Project Health and Evidence Bundle graph anchors are also visible through MCP health/evidence tools when `.decantr/graph/graph.snapshot.json` exists

MCP responses should make typed JSON primary. Optional `human_summary` is allowed.

The intended context pattern is:

- load stable Contract context once per session through a capsule when possible
- query route/task subgraphs for task-specific Context
- query Evidence and Findings as needed during verification and repair

The capsule must remain model-provider-neutral. It can include a stable source hash or cache key, but it must not require a specific prompt-caching API.

## Structured Findings

Phase 1 does not need every verifier finding migrated, but migrated findings must follow the durable shape:

```ts
export interface GraphFinding {
  id: string;
  code: string;
  severity: "blocker" | "error" | "warn" | "info";
  category: string;
  anchored_at?: string;
  violates?: string[];
  derived_from?: string[];
  message: string;
  payload?: Record<string, unknown>;
  evidence?: string[];
  baseline?: {
    snapshot_id?: string;
    commit?: string;
  };
  repair?: {
    id: string;
    payload?: Record<string, unknown>;
  };
}
```

Phase 1 finding priorities:

- contract graph invalid
- missing route/page identity
- stale or missing graph snapshot
- local rule without source/provenance
- verifier finding that can be anchored to a route or source artifact

Implemented in this slice:

- `VerificationFinding`, `ProjectHealthFinding`, and Evidence Bundle finding entries accept an optional `graph` anchor.
- Project Health findings also carry stable diagnostic `code` values and typed `repair.id` actions, with payload redaction inside Evidence Bundles.
- Health reads `.decantr/graph/graph.snapshot.json` and anchors findings to LocalRule, StyleBridge, Route, Page, Pattern, SourceArtifact, or Project nodes with `exact`, `inferred`, or `fallback` confidence.
- Project audits emit `COMP001` / `import-existing-component` for the first code-graph-adjacent component reuse drift check.
- Project audits emit `TOKEN010` / `replace-arbitrary-style-with-bridge-token` for accepted style bridge arbitrary-value drift.
- Project Health emits `VISUAL010` / `review-visual-baseline-drift` when `--since-baseline` detects screenshot hash drift.
- Text, markdown, JSON, repair prompts, MCP health reports, and Evidence Bundles preserve the same code, repair ID, and anchor instead of forcing agents to infer provenance from prose.
- `decantr graph` can ingest a saved `.decantr/evidence/latest.json` Evidence Bundle and materialize its findings as graph nodes with `FINDING_ANCHORED_AT`, `FINDING_VIOLATES_RULE`, `EVIDENCE_SUPPORTS_FINDING`, and `REPAIR_FIXES_FINDING` edges where the referenced nodes exist.

## Human Renders

Markdown remains useful for:

- local inspection
- docs
- backward compatibility
- concise CLI summaries

It should not be the canonical agent payload.

Where markdown is generated from graph data, include the source snapshot ID.

## Security And Permission Notes

Phase 1 changes local filesystem behavior by writing `.decantr/graph/*`. Project Health also reads `.decantr/graph/graph.snapshot.json` when present to attach graph anchors to findings.

Before implementation lands, update:

- `config/package-permissions.json`
- `docs/reference/security-permissions.md`

Required posture:

- no telemetry unless explicitly enabled
- no hosted upload by default
- no source upload required for graph build
- MCP write behavior remains explicit and path-contained
- graph files stay inside the project `.decantr/graph/` directory

## Test Plan

Minimum implementation tests:

- graph builder produces deterministic snapshot for a fixture project
- graph builder works offline with only local artifacts
- source artifacts are created for loaded inputs
- snapshot hash changes when a source artifact changes
- diff emits `node.added`, `node.changed`, `edge.added`, `finding.added`, `finding.resolved`, and `evidence.added` cases
- contract capsule shape is validated
- route task context returns expected route subgraph and task-aware ranking metadata
- CLI graph replay can read a local history snapshot and compare selected/current snapshots with bounded typed diff ops
- structured finding can anchor to a graph node
- MCP graph context response validates against schema

## Rollout Plan

1. Add schema/types and storage adapter.
2. Add read-only graph builder.
3. Add snapshot/manifest/diff writers.
4. Add CLI graph preview behind an internal or advanced flag.
5. Wire `scan` and `adopt` to graph output.
6. Wire `task` to route subgraph extraction.
7. Wire MCP read tools.
8. Migrate first structured findings. Initial implementation includes graph-anchored Project Health findings, `COMP001` component reuse drift, `COMP010` raw-control drift, and `TOKEN010` accepted style bridge drift.
9. Update public docs only after the flow is real enough to demo.

## Acceptance Criteria

- A real attached app can produce `.decantr/graph/graph.snapshot.json`.
- Repeated runs on unchanged inputs produce the same snapshot ID or same source hash.
- Snapshot includes nodes, edges, source artifacts, and provenance links.
- Contract capsule is implemented with provider-neutral cache key and snapshot reference.
- Route context can be extracted without parsing markdown.
- MCP can return typed graph context for a route/task.
- At least one verifier finding can anchor to a graph node.
- No hosted service is required.
- Existing 2.x workflows remain installable and understandable.
