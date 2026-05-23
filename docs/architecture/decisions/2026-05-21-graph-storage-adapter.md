# ADR: Graph Storage Adapter For Decantr 3.0

Date: 2026-05-21
Status: Proposed
Program: `docs/programs/2026-05-21-ai-frontend-governance-reset-plan.md`
Research: `docs/research/2026-05-21-graph-ai-governance-competitive-research.md`

## Decision

Decantr 3.0 will use a graph storage adapter boundary with SQLite as the default local implementation and JSON snapshots as the public interchange format.

Decantr will not hard-depend on Neo4j, Kuzu, FalkorDB, Memgraph, or any hosted graph database for the v3 launch path.

## Context

The v3 plan centers Decantr around a typed UI governance graph:

- contract graph: expected product standards
- code graph: observed implementation facts
- evidence graph: screenshots, tests, AST snippets, runtime proof
- finding graph: drift, provenance, repair, and audit state

Adjacent systems validate graph-shaped infrastructure:

- Graphiti/Zep validates temporal graphs and MCP-native graph context.
- Cognee validates poly-store thinking for agent memory.
- TrustGraph validates ontology-grounded retrieval.
- Aider validates tree-sitter based code maps.
- Sourcegraph validates MCP plus code intelligence for enterprise teams.

The external feedback suggested Kuzu as an embedded graph database. Kuzu is conceptually relevant, but its upstream repository is archived/read-only as of 2025-10-10. That makes it a risky hard dependency for a v3 product line intended to be long-lived and easy to install.

Decantr project graphs are expected to be small enough for local embedded storage:

- hundreds to low thousands of nodes for many apps
- low tens of thousands for larger monorepos
- query needs centered on scoped traversal, impact, diff, and provenance

## Drivers

- Zero-infra install path.
- Local-first privacy posture.
- Deterministic snapshots for MCP, CI, and evidence bundles.
- Reversible storage implementation.
- Fast enough graph traversal for route-scoped context.
- No dependency on archived or server-only graph infrastructure.
- Clear path to a richer graph engine later if project scale justifies it.

## Shape

The graph layer exposes a storage adapter. Implementation code should depend on the adapter, not on raw SQLite tables.

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

Default local layout:

```text
.decantr/graph/
  graph.sqlite
  graph.snapshot.json
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

## Public Contract

SQLite is an implementation detail. JSON snapshots are the public contract.

MCP tools, CI reports, dashboards, and evidence bundles should consume:

- `graph.snapshot.json`
- `graph.manifest.json`
- `graph.diff.json`
- structured finding reports

They should not require direct SQLite access.

## Consequences

Positive:

- Keeps v3 install friction low.
- Keeps storage decision reversible.
- Allows future property graph adapters.
- Matches Decantr's local-first posture.
- Avoids hard dependency on archived Kuzu.

Negative:

- Decantr must implement some traversal helpers itself.
- SQLite node/edge tables are less ergonomic than Cypher/property-graph queries.
- Complex graph queries may need explicit query helpers rather than free-form graph query language.

## Alternatives Considered

### Kuzu As Default

Pros:

- Embedded property graph.
- Strong query ergonomics.
- Good conceptual fit for graph traversal.

Cons:

- Upstream repository is archived/read-only.
- Adds dependency and packaging risk.
- Decantr's v3 launch graph scale does not require it.

Decision: reject as hard dependency for v3 launch. Keep as architectural reference.

### Neo4j/FalkorDB/Memgraph As Default

Pros:

- Mature graph query surfaces.
- Familiar to GraphRAG ecosystem.

Cons:

- Breaks zero-infra local-first posture.
- Adds operational burden.
- Not needed for initial graph scale.

Decision: reject for default local path. May be future enterprise export targets.

### JSON Only

Pros:

- Simplest possible implementation.
- Easy to inspect and version.

Cons:

- Poor incremental updates.
- Awkward traversal and reverse lookups.
- Weak foundation for IDE/MCP long-running sessions.

Decision: reject as working store. Keep JSON as interchange snapshot.

## Acceptance Criteria

- Graph builder can run without network or hosted services.
- Graph snapshot is deterministic for unchanged inputs.
- Query logic depends on `GraphStore`, not raw SQLite.
- MCP and CI can operate from JSON snapshots.
- Future storage adapter can be introduced without changing public graph snapshot shape.
