# ADR: Temporal Snapshots And Provenance Model

Date: 2026-05-21
Status: Accepted for Phase 1
Program: `docs/programs/2026-05-21-ai-frontend-governance-reset-plan.md`
Research: `docs/research/2026-05-21-graph-ai-governance-competitive-research.md`

## Decision

Decantr 3.0 will include temporal snapshot identity and first-class provenance in the first typed-graph implementation.

Full temporal analytics can wait, but every graph snapshot, finding, evidence item, source artifact, and repair plan must have stable identity and lineage hooks from day one.

Phase 1 writes the canonical latest snapshot to `.decantr/graph/graph.snapshot.json` and a replayable content-addressed copy to `.decantr/graph/snapshots/<snapshot-id>.json`. `graph.diff.json` is emitted for every run, including a self-diff baseline on the first run, so CI and MCP consumers can rely on a stable temporal artifact shape.

## Context

Decantr's core value is drift governance over time. A graph that only describes the present app state is useful, but incomplete. Drift requires comparing current reality against a prior contract, baseline, or edit history.

Graphiti/Zep validates temporal graph design for agent context. VeritasGraph and GraphRAG systems validate attribution as a trust mechanism. TDAD validates impact analysis over code/test graphs for AI-induced changes.

Decantr should apply those lessons narrowly:

- not generic temporal memory
- not document GraphRAG attribution
- not agent self-managed memory
- typed frontend governance evidence over time

## Drivers

- Drift is temporal by definition.
- Findings must be explainable and auditable.
- CI artifacts need stable identifiers.
- MCP tools need stable anchors for follow-up queries.
- Enterprise buyers will ask why a finding exists and what contract source caused it.
- Proof demos need replayable before/after evidence.

## Core Objects

### Graph Snapshot

Represents one deterministic view of Decantr's graph for a project.

Required fields:

```json
{
  "id": "graph:2026-05-21:abc123",
  "schema_version": "3.0.0-draft",
  "project_id": "proj:default",
  "created_at": "2026-05-21T00:00:00.000Z",
  "parent_id": "graph:2026-05-20:def456",
  "source_hash": "sha256:...",
  "git": {
    "commit": "unknown",
    "branch": "unknown",
    "dirty": true
  },
  "summary": {
    "nodes": 0,
    "edges": 0,
    "findings": 0
  }
}
```

### Source Artifact

Represents an input that produced graph facts.

Examples:

- `decantr.essence.json`
- `.decantr/rules.json`
- `.decantr/style-bridge.json`
- `tailwind.config.ts`
- `components.json`
- `src/components/Button.tsx`
- Playwright test files
- screenshots
- registry/vocabulary records

Required fields:

```json
{
  "id": "src:.decantr/rules.json",
  "kind": "local-rule-file",
  "path": ".decantr/rules.json",
  "hash": "sha256:...",
  "commit": "unknown",
  "payload": {}
}
```

### Provenance Edge

Links a graph fact to its source.

```json
{
  "src": "cmp:Button",
  "dst": "src:src/components/ui/button.tsx",
  "relation": "NODE_DERIVED_FROM_SOURCE",
  "payload": {
    "line": 12,
    "confidence": "observed",
    "adapter": "tree-sitter-tsx"
  }
}
```

### Graph Diff

Represents difference between snapshots.

```json
{
  "id": "diff:graph:abc123..graph:def456",
  "from": "graph:abc123",
  "to": "graph:def456",
  "ops": [
    {
      "op": "node.added",
      "id": "cmp:AccountButton",
      "type": "Component"
    },
    {
      "op": "edge.removed",
      "src": "pg:settings-profile",
      "relation": "PAGE_USES_SHELL",
      "dst": "sh:settings-shell"
    }
  ]
}
```

Allowed first-pass diff ops:

- `node.added`
- `node.removed`
- `node.changed`
- `edge.added`
- `edge.removed`
- `edge.changed`
- `finding.added`
- `finding.resolved`
- `evidence.added`

### Finding Lineage

Every production-grade finding should link:

- finding ID
- stable code
- anchor graph node
- violated rule
- source artifact
- evidence item
- baseline snapshot
- repair plan where available

```json
{
  "id": "find:TOKEN042:6f8a",
  "code": "TOKEN042",
  "anchored_at": "cmp:NavLink",
  "violates": ["rule:nav-uses-primary-token"],
  "derived_from": ["src:.decantr/rules.json", "src:src/components/NavLink.tsx"],
  "evidence": ["ev:ast:src/components/NavLink.tsx:22"],
  "baseline": {
    "snapshot_id": "graph:2026-05-21:abc123",
    "commit": "unknown"
  },
  "repair": {
    "id": "repair:restore-token-binding"
  }
}
```

## Non-Goals

- Build a full temporal graph database.
- Persist every agent token or chat message.
- Reconstruct arbitrary git history without an explicit baseline.
- Let the agent become the authority over its own constraints.
- Require hosted storage for temporal history.

## Consequences

Positive:

- Drift is modelled as a first-class temporal object.
- CI artifacts become replayable.
- Findings become auditable.
- MCP follow-up queries can refer to stable IDs.
- The proof corpus can show before/after governance clearly.

Negative:

- More schema work before implementation.
- More bookkeeping in graph builder and verifier.
- Requires discipline around deterministic IDs and source hashes.

## Acceptance Criteria

- Phase 1 graph output includes snapshot ID, optional parent ID, source hash, and manifest.
- Phase 1 emits `graph.diff.json` for every run and preserves content-addressed local snapshot history.
- Source artifacts are represented as graph nodes or storage records.
- Contract and observed graph facts can link back to source artifacts.
- Findings include graph anchor, evidence, violated rule where known, and baseline reference where known.
