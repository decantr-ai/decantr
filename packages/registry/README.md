# @decantr/registry

Support status: `supported-secondary`
Release channel: `stable`

Legacy Decantr 3.x compatibility facade for content contracts, schemas, API client naming, ranking helpers, and resolver utilities. Runtime implementations and TypeScript contracts are owned by `@decantr/content`; this package only preserves old names and import paths.

Prefer `@decantr/content` for new official corpus integrations. Keep `@decantr/registry` when existing scripts or MCP/directory-compatible code still use registry naming.

The public registry portal and marketplace are retired. This is a stable 3.x compatibility package, not an active product foundation. Decantr 3.10 is an unreleased UI change-control proof program and assigns this package no feature investment. Do not use registry search volume, compatibility aliases, or corpus size as evidence that Decantr improves an AI coding agent. Removal or consolidation is a future major-version decision; Decantr 3.x compatibility remains intact.

## Install

```bash
npm install @decantr/registry
```

## What It Exports

- re-exported types for patterns, themes, official blueprints, archetypes, shells, and intelligence metadata
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
const results = await client.search('dashboard', 'blueprint');
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

- `RegistryAPIClient`, `RegistryAPIError`, and `createRegistryClient` are aliases over the content-owned client runtime
- `@decantr/registry/client` preserves every runtime and type export from the public 3.8.1 client entrypoint while delegating implementation to `@decantr/content`
- `RegistryIntelligenceSummaryResponse` and `RegistryIntelligenceSummaryBucket` remain aliases for the preferred content-named response types
- exported schema paths and documented client entrypoints are expected to remain stable across compatible releases
- additive response fields may be introduced without breaking the stable contract
- breaking client, schema, or path changes require a major version

The release boundary is exercised from packed artifacts with:

```bash
pnpm audit:packed-content-facade
```

That audit installs `@decantr/content` and `@decantr/registry` tarballs into a clean npm prefix, proves delegated runtime identity and legacy schema parity, compiles the frozen public 3.8.1 `/client` type surface, checks no-`process` construction and `REGISTRY_URL`, and rejects workspace links or retired-host leakage. It does not revive a public registry service.

## Security And Permissions

`@decantr/registry` provides legacy schema paths, content utilities, and API clients. It may read explicit local content JSON files when resolver helpers are used, and it may call the configured Decantr API base URL when client methods are invoked. It does not write files, spawn processes, emit telemetry, or upload source by itself. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## License

MIT
