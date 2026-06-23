# @decantr/core

Support status: `core-supported`  
Release channel: `stable`

Low-level Decantr compiler and execution-pack foundation.

Most teams should use `@decantr/cli`, `@decantr/registry`, or `@decantr/mcp-server` directly. `@decantr/core` is part of the supported Decantr public foundation surface, but it is intentionally lower-level than the usual integration entrypoints.

## Install

```bash
npm install @decantr/core
```

## Stability

`@decantr/core` is published for advanced package consumers that need low-level execution-pack primitives. It is stable in the Decantr 3 line for the documented exports in this package, but it is still not the recommended first integration surface for most Decantr adopters.

## What It Exports

- execution-pack builders for scaffold, section, page, mutation, and review scopes
- execution-pack bundle compilation and pack selection helpers
- canonical pack adapter resolution used by higher-level Decantr surfaces
- execution-pack schema URLs
- markdown rendering for compiled packs
- IR and pipeline helpers used by higher-level Decantr surfaces
- Decantr 3 typed graph types, graph constants, Essence/IR-to-graph snapshot derivation, temporal snapshot/diff shapes, source import/reference edges, contract capsule derivation with a bounded source-artifact path index, deterministic hybrid route/impact ranking, behavior-obligation LocalRule projection support through existing graph shapes, evidence/proof ingestion, test-coverage hint edges, node impact context extraction, and an in-memory `GraphStore` adapter

In the current workflow architecture, `@decantr/core` owns the canonical adapter labels used by compiled packs, while runnable greenfield bootstrap adapters are resolved in the CLI on top of those labels.

The graph exports establish the storage boundary, typed schema shape, temporal snapshot/diff shape, payload-filterable node queries, hybrid route-context ranking, hybrid node/source impact traversal, and provider-neutral contract capsule shape for CLI, MCP, verifier, Studio, and CI integration. Ranking blends deterministic weighted traversal with local personalized PageRank and optional task-text boosts, so central graph nodes and task-relevant nodes both surface without introducing a graph database dependency. Behavior obligations remain app-owned local law in `.decantr/local-patterns.json`; higher-level packages project accepted obligations into existing `LocalRule` graph nodes with `payload.kind = "behavior-obligation"` instead of adding a new graph node type. Evidence Bundles, runtime probes, visual manifests, baseline diffs, repair plans, and proof reports are ingested through existing graph node/edge shapes where possible, and `TEST_COVERS_NODE` edges act as verification hints rather than proof of production UI behavior. The capsule keeps the contract cache key stable while listing bounded SourceArtifact paths agents can use for file-impact follow-up queries. The core package remains pure library code: filesystem graph persistence belongs in higher-level packages such as the CLI.

## FAQ

Most teams should start with the CLI rather than this low-level package:

```bash
npx @decantr/cli new my-app
npx @decantr/cli analyze
npx @decantr/cli check
```

For common setup, brownfield, Studio, migration, CI, and agent-alignment questions, see the user-facing [Decantr FAQ](https://github.com/decantr-ai/decantr/blob/main/docs/faq.md).

## Example

```ts
import {
  buildReviewPack,
  renderExecutionPackMarkdown,
  resolvePackAdapter,
} from '@decantr/core';

const pack = buildReviewPack({
  projectName: 'Acme Console',
  target: 'react',
  routeCount: 4,
  sections: ['overview', 'settings'],
});

const adapter = resolvePackAdapter('react', 'spa');
const markdown = renderExecutionPackMarkdown(pack);
```

## Schema Exports

This package publishes execution-pack schemas under:

- `@decantr/core/schema/scaffold-pack.v1.json`
- `@decantr/core/schema/section-pack.v1.json`
- `@decantr/core/schema/page-pack.v1.json`
- `@decantr/core/schema/mutation-pack.v1.json`
- `@decantr/core/schema/review-pack.v1.json`
- `@decantr/core/schema/pack-manifest.v1.json`
- `@decantr/core/schema/execution-pack-bundle.v1.json`
- `@decantr/core/schema/selected-execution-pack.v1.json`

It also publishes the draft Decantr 3 typed graph artifact schemas:

- `@decantr/core/schema/graph.common.v1.json`
- `@decantr/core/schema/graph-snapshot.v1.json`
- `@decantr/core/schema/graph-manifest.v1.json`
- `@decantr/core/schema/graph-diff.v1.json`
- `@decantr/core/schema/contract-capsule.v1.json`

## Security And Permissions

`@decantr/core` is a local execution-pack compiler and type/schema package. It does not read or write project files, call the network, spawn processes, emit telemetry, or upload source by itself. The draft graph exports include pure builders and an in-memory adapter only; filesystem graph persistence belongs in higher-level CLI/verifier wiring. Schema URLs in emitted packs are identifiers, not network calls. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## License

MIT
