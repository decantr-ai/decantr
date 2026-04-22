# @decantr/core

Support status: `core-supported`  
Release channel: `stable`

Low-level Decantr compiler and execution-pack foundation.

Most teams should use `@decantr/cli`, `@decantr/registry`, or `@decantr/mcp-server` directly. This package remains inside the Decantr implementation boundary and is not part of the supported public package contract.

## Install

```bash
npm install @decantr/core
```

## Stability

`@decantr/core` is published for advanced package consumers that need low-level execution-pack primitives. It is stable in the `1.x` line for the documented exports in this package, but it is still not the recommended first integration surface for most Decantr adopters.

## What It Exports

- execution-pack builders for scaffold, section, page, mutation, and review scopes
- execution-pack schema URLs
- markdown rendering for compiled packs
- IR and pipeline helpers used by higher-level Decantr surfaces

## Example

```ts
import { buildReviewPack, renderExecutionPackMarkdown } from '@decantr/core';

const pack = buildReviewPack({
  projectName: 'Acme Console',
  target: 'react',
  routeCount: 4,
  sections: ['overview', 'settings'],
});

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

## License

MIT
