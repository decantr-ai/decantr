# @decantr/registry

Support status: `core-supported`  
Release channel: `stable`

Registry contracts, schemas, API client, ranking helpers, and content utilities for Decantr.

## Install

```bash
npm install @decantr/registry
```

## What It Exports

- strong types for patterns, themes, blueprints, archetypes, shells, and intelligence metadata
- `ContentHealthReport` types for registry content supply-chain health artifacts
- `RegistryAPIClient` for server-side and tool-side registry access
- `@decantr/registry/client` for web-safe API usage
- public schema exports for registry content, content health, and summary responses
- ranking and sorting helpers for public registry content

## Example

Node/runtime usage:

```ts
import { RegistryAPIClient } from '@decantr/registry';

const client = new RegistryAPIClient({ baseUrl: 'https://api.decantr.ai/v1' });
const results = await client.search({ query: 'dashboard', type: 'blueprint' });
```

Browser-safe usage:

```ts
import { createRegistryClient } from '@decantr/registry/client';

const client = createRegistryClient({ baseUrl: 'https://api.decantr.ai/v1' });
const summary = await client.getIntelligenceSummary();
```

## Related Schemas

This package owns the canonical registry schemas published under `@decantr/registry/schema/*`, including `content-health-report.v1.json` for local content repository health reports emitted by `decantr content-health`.

## Compatibility

`@decantr/registry` is part of the stable public Decantr package surface in the `2.x` line.

- exported schema paths and documented client entrypoints are expected to remain stable across `1.x`
- additive response fields may be introduced without breaking the stable contract
- breaking client, schema, or path changes require a major version

## License

MIT
