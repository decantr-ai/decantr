# @decantr/core

Support status: `core-supported`  
Release channel: `stable`

Low-level Decantr compiler and execution-pack foundation.

Most teams should use `@decantr/cli`, `@decantr/content`, or `@decantr/mcp-server` directly. `@decantr/core` is part of the supported Decantr public foundation surface, but it is intentionally lower-level than the usual integration entrypoints. `@decantr/registry` remains only for Decantr 3.x compatibility imports.

Decantr 3.9.4 is the current stable line. Decantr 3.10 is an unreleased falsification program centered on **Observe -> Prepare -> Verify -> Report**. Core graph and pack primitives support that work, but a graph, route rank, or larger context pack does not by itself prove production authority or model improvement. Routes are one UI surface among layouts, components, stories, overlays, flows, packages, runtime states, and exact source files.

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
- Decantr 3 typed graph types, graph constants, Essence/IR-to-graph snapshot derivation, temporal snapshot/diff shapes, source import/reference edges, contract capsule derivation with a bounded source-artifact path index, deterministic hybrid route/impact ranking, canonical changed-file graph impact resolution, behavior-obligation LocalRule projection support through existing graph shapes, evidence/proof ingestion, test-coverage hint edges, node impact context extraction, and an in-memory `GraphStore` adapter

In the current workflow architecture, `@decantr/core` owns the canonical adapter labels used by compiled packs, while runnable greenfield bootstrap adapters are resolved in the CLI on top of those labels.

The graph exports establish the storage boundary, typed schema shape, temporal snapshot/diff shape, payload-filterable node queries, route-context ranking, node/source impact traversal, and provider-neutral contract capsule shape for higher-level integrations. Ranking is deterministic supporting evidence; it cannot promote an inferred, ambiguous, test-only, generated, or stale source into production authority. Behavior obligations remain app-owned local law in `.decantr/local-patterns.json`. Evidence Bundles, runtime probes, visual manifests, repair plans, and proof reports reuse existing graph shapes where possible; generated health-baseline diffs are excluded to avoid circular graph invalidation, and `TEST_COVERS_NODE` edges are verification hints rather than proof of production UI behavior. The core package remains pure library code: filesystem graph persistence belongs in higher-level packages such as the CLI.

## FAQ

Most teams should start with the CLI rather than this low-level package:

```bash
npx @decantr/cli scan
npx @decantr/cli adopt --yes       # only after reviewing the observed authority
npx @decantr/cli task /known-route "describe the UI change"
npx @decantr/cli verify
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
