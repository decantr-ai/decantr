# @decantr/verifier

Support status: `core-supported`  
Release channel: `beta`

Shared Decantr verification, critique, and report-schema engine used by the CLI, MCP server, and future CI/hosted verification surfaces.

## Install

```bash
npm install @decantr/verifier@beta
```

## What It Exports

- `auditProject()` for project-level Decantr audits
- `auditBuiltDist()` for built-output runtime verification against emitted HTML, assets, and route hints
- `critiqueFile()` for file-level review against compiled review-pack contracts
- schema-backed report types for project audits, file critiques, and showcase verification
- published verifier report schemas are exercised by AJV-backed round-trip tests against real audit, critique, and shortlist-report outputs
- project audits include runtime evidence when a built `dist/` output is present:
  - root document
  - document title
  - document `lang` and `viewport` metadata
  - emitted assets
  - route-document coverage
  - built asset byte budgets for JS, CSS, and total payload
  - auth-topology warnings when the essence declares authentication without clear gateway or entry routes

## Example

```ts
import { auditProject, critiqueFile } from '@decantr/verifier';

const audit = await auditProject(process.cwd());
const critique = await critiqueFile('./src/pages/overview.tsx', process.cwd());
```

## Schema Exports

- `@decantr/verifier/schema/verification-report.common.v1.json`
- `@decantr/verifier/schema/project-audit-report.v1.json`
- `@decantr/verifier/schema/file-critique-report.v1.json`
- `@decantr/verifier/schema/showcase-shortlist-report.v1.json`

## License

MIT
