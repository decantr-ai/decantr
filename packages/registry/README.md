# @decantr/registry

Support status: `supported-secondary`
Release channel: `stable`

Legacy Decantr 3.x compatibility package for content contracts, schemas, API client naming, ranking helpers, and resolver utilities.

Prefer `@decantr/content` for new official corpus integrations. Keep `@decantr/registry` when existing scripts or MCP/directory-compatible code still use registry naming.

## Install

```bash
npm install @decantr/registry
```

## What It Exports

- strong types for patterns, themes, starter-kit blueprints, archetypes, shells, and intelligence metadata
- `ContentHealthReport` types for vocabulary supply-chain health artifacts
- `RegistryAPIClient` for server-side and tool-side content API access
- `@decantr/registry/client` for web-safe API usage
- public schema exports for vocabulary content, content health, and summary responses
- ranking and sorting helpers for public vocabulary content
- Brownfield-aware pattern discovery helpers: `patternToDiscoveryCandidate()`, `scorePatternCandidate()`, and `rankPatternCandidates()`
- blueprint portfolio metadata helpers for public `All`, `Featured`, `Certified`, and `Labs` corpus cuts
- `createCorpusResolver()`, `searchCorpusContent()`, `listCorpusRecords()`, and related helpers re-exported from `@decantr/content`

## Example

Node/runtime usage:

```ts
import { RegistryAPIClient } from '@decantr/registry';

const client = new RegistryAPIClient({ baseUrl: 'https://api.decantr.ai/v1' });
const results = await client.search({
  q: 'dashboard',
  type: 'blueprint',
  blueprintSet: 'featured',
});
```

Browser-safe usage:

```ts
import { createRegistryClient } from '@decantr/registry/client';

const client = createRegistryClient({ baseUrl: 'https://api.decantr.ai/v1' });
const summary = await client.getIntelligenceSummary();
```

Pattern discovery usage:

```ts
import { patternToDiscoveryCandidate, rankPatternCandidates } from '@decantr/registry';

const matches = rankPatternCandidates(
  { query: 'recipe feed with avatars and infinite scroll', route: '/feed' },
  patterns.map((pattern) => patternToDiscoveryCandidate(pattern)),
);
```

## Related Schemas

This package keeps the legacy canonical schema paths under `@decantr/registry/schema/*`, including `content-health-report.v1.json` for local content reports emitted by `decantr content-health`. New corpus integrations should prefer `@decantr/content/schemas/*`.

Blueprint records can include `blueprint_portfolio` metadata. List/search summaries expose that metadata so clients can show public-facing blueprint sets without leaking internal maturity labels:

- `all` — supported official blueprints, excluding Labs and folded slugs by default
- `featured` — curated default discovery picks
- `certified` — blueprints with certified artifact metadata
- `labs` — opt-in experimental directions

## Compatibility

`@decantr/registry` is maintained as a Decantr 3 compatibility package.

- exported schema paths and documented client entrypoints are expected to remain stable across compatible releases
- additive response fields may be introduced without breaking the stable contract
- breaking client, schema, or path changes require a major version

## Security And Permissions

`@decantr/registry` provides legacy schema paths, content utilities, and API clients. It may read explicit local content JSON files when resolver helpers are used, and it may call the configured Decantr API base URL when client methods are invoked. It does not write files, spawn processes, emit telemetry, or upload source by itself. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## License

MIT
