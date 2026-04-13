# @decantr/registry

Support status: `core-supported`  
Release channel: `beta`

Registry contracts, schemas, API client, ranking helpers, and content utilities for Decantr.

## Install

```bash
npm install @decantr/registry
```

## What It Exports

- strong types for patterns, themes, blueprints, archetypes, shells, and intelligence metadata
- `RegistryAPIClient` for server-side and tool-side registry access
- `@decantr/registry/client` for web-safe API usage
- public schema exports for registry content and summary responses
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

This package owns the canonical registry schemas published under `@decantr/registry/schema/*`.

## License

MIT
