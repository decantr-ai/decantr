# @decantr/verifier

Support status: `core-supported`  
Release channel: `stable`

Shared Decantr verification, critique, and report-schema engine used by the CLI, MCP server, and future CI/hosted verification surfaces.

## Install

```bash
npm install @decantr/verifier
```

## What It Exports

- `auditProject()` for project-level Decantr audits
- `auditBuiltDist()` for built-output runtime verification against emitted HTML, assets, and route hints
- `critiqueFile()` for file-level review against compiled review-pack contracts
- `createContractAssertions()` for explicit route, shell, accessibility, context, and design-token assertions derived from Essence/context
- `createEvidenceBundle()` for privacy-redacted local evidence artifacts used by AI repair loops and CI
- schema-backed report types for project audits, Project Health, Decantr CI reports, Evidence Bundles, Workspace Health, file critiques, and showcase verification
- `ProjectHealthReport`, `ProjectHealthFinding`, and `ProjectHealthRemediation` types for the CLI's end-user health surface
- interaction findings now include scanned file counts, file line ranges, and expected signal evidence where available, so CLI health/check output can point agents at source-grounded remediation
- contract-only Brownfield critique avoids requiring Decantr treatments/decorators when the project keeps its own styling authority
- project audits check that `pack-manifest.json` references real pack markdown/JSON files on disk
- project source audits ignore test, spec, story, fixture, and mock files for production drift warnings such as localhost endpoints and unsafe rendering patterns
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
import {
  auditProject,
  createContractAssertions,
  createEvidenceBundle,
  critiqueFile,
  type ProjectHealthReport,
} from '@decantr/verifier';

const audit = await auditProject(process.cwd());
const assertions = createContractAssertions(process.cwd(), audit);
const critique = await critiqueFile('./src/pages/overview.tsx', process.cwd());

function isBlocking(report: ProjectHealthReport) {
  return report.status === 'error';
}
```

## Schema Exports

- `@decantr/verifier/schema/verification-report.common.v1.json`
- `@decantr/verifier/schema/project-audit-report.v1.json`
- `@decantr/verifier/schema/project-health-report.v1.json`
- `@decantr/verifier/schema/decantr-ci-report.v1.json`
- `@decantr/verifier/schema/evidence-bundle.v1.json`
- `@decantr/verifier/schema/workspace-health-report.v1.json`
- `@decantr/verifier/schema/file-critique-report.v1.json`
- `@decantr/verifier/schema/showcase-shortlist-report.v1.json`

## Compatibility

`@decantr/verifier` is stable in the `2.x` line for the documented verifier APIs and published report-schema exports.

- new checks and additive report fields may appear in compatible releases
- breaking report-shape or exported API changes require a major version
- hosted and CLI verifier consumers should treat the published schemas as the supported contract surface

## License

MIT
