# @decantr/content

Support status: `core-supported`  
Release channel: `stable`

Official Decantr content corpus for `@official` patterns, themes, shells, archetypes, and blueprints. This package is the source of truth for content-corpus search, schema validation, resolution, content health, and the Fly-hosted content API.

In current stable Decantr 3.10.0, first-party resolver, client, ranking, wiring, content-type, and provenance implementations live here. `@decantr/registry` delegates to this package and exists only to preserve Decantr 3.x import and naming compatibility.

Decantr 3.10 is an authority-aware UI change-control release, not a corpus-expansion release. This package may supply versioned reference records or the same approved policy guidance available to both research arms, but content volume is not proof of product value and must not give a treatment arm extra information. No public marketplace, community publishing, registry revival, or Decantr CSS coupling belongs in the product claim.

## Install

```bash
npm install @decantr/content
```

## What It Exports

- official corpus records under `patterns/`, `themes/`, `blueprints/`, `archetypes/`, and `shells/`
- JSON Schemas under `schemas/`, with `schema/` retained as an import-path alias
- `listContentRecords()`, `searchContent()`, `getContentRecord()`, and `resolveContent()`
- `createContentResolver()` for the installed official corpus and `createResolver()` for explicit filesystem roots and overrides
- `ContentAPIClient`, `ContentAPIError`, and `createContentAPIClient()` for content API reads
- `@decantr/content/client` for the web-safe client, response, and ranking surface
- `ContentIntelligenceSummaryResponse` and `ContentIntelligenceSummaryBucket` as the preferred intelligence response names
- `validateContentData()` and `validateOfficialCorpus()`
- `buildContentIntelligenceSummary()` for content coverage and recommendation metadata
- canonical `Pattern`, `Theme`, `Blueprint`, `Archetype`, `Shell`, resolver, public-record, and Content Health types
- `ContentRef`, canonical JSON SHA-256 helpers, and deterministic corpus manifests
- strict provenance schemas: `content-identity.v1.json`, `content-ref.v1.json`, and `content-corpus-manifest.v1.json`

## Example

```ts
import {
  createContentResolver,
  searchContent,
  validateOfficialCorpus,
} from '@decantr/content';

const results = searchContent({ q: 'dashboard', type: 'blueprints', recommended: true });
const resolver = createContentResolver();
const pattern = await resolver.resolve('pattern', 'data-table');
const health = validateOfficialCorpus();
```

Content API usage:

```ts
import { createContentAPIClient } from '@decantr/content/client';

const client = createContentAPIClient();
const results = await client.search({ q: 'dashboard', type: 'blueprint' });
const intelligence = await client.getContentIntelligenceSummary({ namespace: '@official' });
```

The client resolves its base URL from an explicit `baseUrl`, then `DECANTR_API_URL`, then the legacy `REGISTRY_URL` alias, and finally `https://api.decantr.ai/v1`. No-argument construction is safe when a browser runtime has no global `process`, and the package root and `/client` entrypoint expose the same client class and factory identities in packed installs.

## Canonical Provenance

`buildContentRef()` emits the frozen 3.9 reference shape: namespace/type/ID identity, nullable local version, semantic payload digest, Decantr compatibility, origin, resolution source, and an optional exact override reference. Official refs require SemVer; legacy local refs may use `null`. Slugs are lookup/display aliases and are not identity.

The SHA-256 digest covers the RFC 8785/JCS-style canonical semantic payload. Identity/schema aliases plus conventional top-level transport path and timestamp fields are projected out; callers can keep additional loader metadata in the input `transport` envelope. Authored fields inside `data`, including a theme's authored `source`, remain digest-significant.

```ts
import {
  buildContentCorpusManifest,
  buildContentRef,
  getContentPackageVersion,
  getContentRecord,
} from '@decantr/content';

const record = getContentRecord('patterns', 'data-table');
if (!record) throw new Error('Missing official pattern');

const ref = buildContentRef(record);

const manifest = buildContentCorpusManifest({
  packageVersion: getContentPackageVersion(),
  compatibility: { decantr: '>=2.0.0' },
  refs: [ref],
});
```

`buildContentCorpusManifest()` validates and sorts exact refs by namespace, type, ID, version, and deterministic tie-breakers; rejects duplicate versioned identities; and hashes the sorted refs. It emits `packageName: "@decantr/content"`, `packageVersion`, `corpusDigest`, corpus compatibility, and `refs`. Repackaging unchanged refs preserves `corpusDigest` while `packageVersion` records the installed corpus release.

## Local Development

From the monorepo root:

```bash
pnpm --filter @decantr/content validate
pnpm --filter @decantr/content content:health
pnpm --filter @decantr/content test
pnpm audit:packed-content-facade
```

The packed facade audit builds tarballs, installs them into a clean npm consumer with no workspace links, checks content/registry runtime identity and schema parity, compiles the public 3.8.1 registry client type surface, verifies browser-safe construction and the `REGISTRY_URL` compatibility alias, and rejects retired-host or local-path leakage. It is package-boundary evidence, not human finding qualification. Stable 3.10 publication preserves these machine checks while keeping precision, recall, qualification, adoption-proof, and model-lift claims outside the product release gate.

`decantr content check` is the preferred content-author workflow. `decantr content-health` remains as a backward-compatible primitive.

## Product Boundary

This corpus is official reference material. It is not a public marketplace, account system, or styling runtime. Brownfield attach and contract-only adoption must work without content API access. Project-owned local law created by `decantr codify --from-audit` belongs in the consuming app under `.decantr/local-patterns.json` and `.decantr/rules.json`.

Some pattern and shell records retain `atoms` fields as 3.x compatibility hints for the explicit `@decantr/css` adapter. Contract-only and style-bridge workflows ignore those hints and translate semantic layout, interaction, and visual intent into the consuming project's own styling authority.

`@decantr/registry`, `decantr registry ...`, and MCP `decantr_registry` remain compatibility names in Decantr 3.x. The registry package is a re-export facade over this package; new docs and scripts should prefer `@decantr/content` and `decantr content ...`.

## License

MIT
