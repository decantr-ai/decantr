# ADR: Contract Capsule And Hybrid Context Architecture

Date: 2026-05-21
Status: Accepted for Phase 1
Program: `docs/programs/2026-05-21-ai-frontend-governance-reset-plan.md`
Research: `docs/research/2026-05-21-retrieval-architecture-research.md`

## Decision

Decantr 3.0 will treat the Contract layer as cache-friendly stable context and emit a provider-neutral contract capsule as part of the typed graph foundation.

The capsule is a compact Contract summary derived from the graph snapshot. It is not a replacement for the full graph and it does not require provider-specific prompt caching.

Decantr's context architecture is hybrid:

| Layer | Pattern |
| --- | --- |
| Contract | cache-augmented shape through a stable capsule |
| Route Context | task-ranked graph context and agentic follow-up queries |
| Evidence | retrieval-backed with provenance |
| Verification | generation-checking with typed findings and repair plans |

## Context

Retrieval research has moved beyond naive vector RAG:

- CAG shows that small, stable knowledge can be preloaded and cached rather than repeatedly retrieved.
- Agentic RAG and A-RAG show that agents benefit from narrow, hierarchical retrieval tools.
- HippoRAG shows graph relevance ranking through Personalized PageRank; Phase 1 starts with deterministic weighted traversal and task-keyword boosts.
- RAG-Verus shows retrieval-augmented program verification at repository level.
- Self-RAG, CRAG, and Chain-of-Verification show the value of typed critique/verification loops.

Decantr's Contract layer is small, stable, high-authority, and reused across many agent calls. That makes it CAG-shaped.

Decantr's Evidence layer is changing, cumulative, and attribution-heavy. That makes it retrieval-shaped.

## Capsule Shape

Default artifact:

```text
.decantr/graph/contract-capsule.json
```

Required fields:

```json
{
  "schema_version": "3.0.0-draft",
  "snapshot_id": "graph:...",
  "project_id": "proj:default",
  "created_at": "2026-05-21T00:00:00.000Z",
  "source_hash": "sha256:...",
  "contract_hash": "fnv1a32:...",
  "cache_key": "decantr-contract:fnv1a32:...",
  "contract_cache_key": "decantr-contract:fnv1a32:...",
  "summary": {
    "routes": 0,
    "components": 0,
    "tokens": 0,
    "local_rules": 0,
    "style_bridge": 0,
    "source_artifacts": 0,
    "open_findings": 0
  },
  "source_artifact_limit": 200,
  "source_artifacts_truncated": false,
  "routes": [],
  "components": [],
  "tokens": [],
  "local_rules": [],
  "style_bridge": [],
  "source_artifacts": [],
  "open_findings": []
}
```

## Constraints

- Provider-neutral: no dependency on Anthropic, Gemini, OpenAI, or any other cache API.
- Snapshot-linked: every capsule points to a graph snapshot.
- Stable: unchanged graph snapshot should produce unchanged capsule content except for explicitly time-bound metadata.
- Compact: capsule summarizes authority and bounded SourceArtifact path handles, not every evidence detail or source file body. If source artifacts exceed the limit, agents use project-state and graph queries for follow-up reads.
- Evidence-light: open blocking findings can appear; full evidence stays queryable through Evidence tools.

## MCP Implications

Add or keep these MCP concepts:

- `decantr_get_project_state` returns graph status and capsule cache key.
- `decantr_get_contract_capsule` returns the capsule.
- `decantr_prepare_task_context` returns route/task graph context with ranking metadata and matched terms, and references the capsule snapshot/cache key.
- Evidence, finding, and repair tools remain narrow follow-up tools.

The agent should be able to load stable Contract once, then ask smaller route/evidence questions as needed.

## Consequences

Positive:

- Reduces repeated stable context transfer.
- Aligns Decantr with CAG without becoming provider-specific.
- Sharpens the difference between Contract and Evidence.
- Gives MCP a clean session-start surface.
- Makes graph snapshot identity useful immediately.

Negative:

- Adds one more artifact to explain.
- Requires careful docs to avoid implying provider prompt-cache support.
- Requires discipline to keep the capsule compact.

## Acceptance Criteria

- `@decantr/core` exports a contract capsule type and builder from graph snapshots.
- Capsule output is deterministic for a deterministic snapshot.
- Capsule includes route topology, component vocabulary, token vocabulary, local rules, style bridge entries, SourceArtifact paths for file-impact follow-up queries, and open findings where present.
- Capsule references `snapshot_id`, full `source_hash`, contract-only `contract_hash`, and provider-neutral cache keys.
- Route graph context exposes deterministic ranking metadata, task keywords when provided, and matched terms on boosted nodes.
- No provider-specific cache behavior is required.
