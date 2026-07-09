# @decantr/content

Support status: `core-supported`  
Release channel: `stable`

Official Decantr content corpus for `@official` patterns, themes, shells, archetypes, and blueprints. This package is the source of truth for content-corpus search, schema validation, resolution, content health, and the Fly-hosted content API.

## Install

```bash
npm install @decantr/content
```

## What It Exports

- official corpus records under `patterns/`, `themes/`, `blueprints/`, `archetypes/`, and `shells/`
- JSON Schemas under `schemas/`
- `listContentRecords()`, `searchContent()`, `getContentRecord()`, and `resolveContent()`
- `createContentResolver()` for pack compilation and compatibility callers
- `validateContentData()` and `validateOfficialCorpus()`
- `buildContentIntelligenceSummary()` for content coverage and recommendation metadata

## Example

```ts
import {
  createContentResolver,
  searchContent,
  validateOfficialCorpus,
} from '@decantr/content';

const results = searchContent({ q: 'dashboard', type: 'blueprints', recommended: true });
const resolver = createContentResolver();
const pattern = resolver.resolvePattern('data-table', 'product');
const health = validateOfficialCorpus();
```

## Local Development

From the monorepo root:

```bash
pnpm --filter @decantr/content validate
pnpm --filter @decantr/content content:health
pnpm --filter @decantr/content test
```

`decantr content check` is the preferred content-author workflow. `decantr content-health` remains as a backward-compatible primitive.

## Product Boundary

This corpus is official reference material. It is not a public marketplace, account system, or styling runtime. Brownfield attach and contract-only adoption must work without content API access. Project-owned local law created by `decantr codify --from-audit` belongs in the consuming app under `.decantr/local-patterns.json` and `.decantr/rules.json`.

Some pattern and shell records retain `atoms` fields as 3.x compatibility hints for the explicit `@decantr/css` adapter. Contract-only and style-bridge workflows ignore those hints and translate semantic layout, interaction, and visual intent into the consuming project's own styling authority.

`@decantr/registry`, `decantr registry ...`, and MCP `decantr_registry` remain compatibility names in Decantr 3.x. New docs and scripts should prefer `@decantr/content` and `decantr content ...`.

## License

MIT
