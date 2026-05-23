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
- `scanProject()` for read-only Brownfield reconnaissance of framework, routes, components, styling, static-hosting hints, Decantr presence, and assistant-rule files
- `auditComponentReuse()` for the first AST-derived component reuse drift slice, focused on AI reimplementing common UI primitives instead of importing project-owned components, plus local import references that the typed graph can turn into source-to-source impact edges
- `auditStyleBridgeDrift()` for accepted style bridge drift, focused on production `className`, common class-helper values, stylesheet declarations, and hardcoded inline color styles that bypass project-owned token/class authority
- `collectProjectSourceFiles()` for the shared production-source file selection used by Project Health, component reuse drift, style bridge drift, and typed graph source provenance
- `resolveGitHubScanInput()` and `probePublishedSite()` for hosted scan inputs and HTML-only published-site metadata probes
- `critiqueFile()` for file-level review against compiled review-pack contracts
- `createContractAssertions()` for explicit route, shell, accessibility, context, and design-token assertions derived from Essence/context
- `createEvidenceBundle()` for privacy-redacted local evidence artifacts used by AI repair loops and CI
- `resolveGraphAnchorForFinding()` and `anchorFindingsToGraph()` for attaching verifier/Project Health findings to typed Contract graph nodes when a graph snapshot exists
- `deriveVerificationDiagnostic()` and `KNOWN_VERIFICATION_DIAGNOSTICS` for stable finding codes and typed repair IDs used by Project Health, MCP health, and Evidence Bundles
- schema-backed report types for project audits, Project Health, Decantr CI reports, Evidence Bundles, Workspace Health, file critiques, and showcase verification
- `ProjectHealthReport`, `ProjectHealthFinding`, and `ProjectHealthRemediation` types for the CLI's end-user health surface
- Project Health and Evidence Bundle finding schemas include optional `code`, `repair`, `repairPlan`, and `graph` fields so agents can identify, anchor, and act on findings without parsing prose; Evidence Bundle provenance also records graph snapshot, manifest, diff, and contract-capsule hashes when present
- interaction findings now include scanned file counts, file line ranges, and expected signal evidence where available, so CLI health/check output can point agents at source-grounded remediation
- contract-only and style-bridge Brownfield critique avoids requiring Decantr treatments/decorators when the project keeps its own styling authority
- Decantr CI report schemas include accepted style bridge status, mapping count, styling approach, and theme modes alongside local-law findings
- project audits check that `pack-manifest.json` references real pack markdown/JSON files on disk
- project audits tolerate partial or malformed generated review packs without crashing Project Health, so half-attached Brownfield projects still receive actionable findings
- Next.js static/document outputs are treated as framework-rendered documents instead of requiring a Vite-style `id="root"` mount element
- project source audits ignore test, spec, story, fixture, and mock files for production drift warnings such as localhost endpoints and unsafe rendering patterns
- project audits emit `COMP001` / `import-existing-component` findings when a production source file locally redeclares a primitive such as `Button`, `Card`, or `Dialog` while an exported reusable primitive already exists under common component paths
- project audits emit `COMP010` / `replace-raw-control-with-local-component` findings when production JSX renders raw controls such as `<button>` or `<input>` while a project-owned primitive already exists
- project audits emit `TOKEN010` / `replace-arbitrary-style-with-bridge-token` findings when an accepted `.decantr/style-bridge.json` exists and production JSX uses arbitrary Tailwind values such as `bg-[#0f172a]`, values inside `cn()`, `clsx()`, `classnames()`, `cva()`, and `tv()` calls, hardcoded inline color styles such as `style={{ backgroundColor: "#0f172a" }}`, or hardcoded visual values in production CSS/module stylesheets
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
  scanProject,
  type ProjectHealthReport,
} from '@decantr/verifier';

const scan = await scanProject(process.cwd());
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
- `@decantr/verifier/schema/scan-report.v1.json`
- `@decantr/verifier/schema/workspace-health-report.v1.json`
- `@decantr/verifier/schema/file-critique-report.v1.json`
- `@decantr/verifier/schema/showcase-shortlist-report.v1.json`

## Security And Permissions

The verifier is a local library. It reads selected project source, Decantr context, read-only scan files, and built `dist`/`.next` output when callers request project or runtime audits. `scanProject()` returns relative evidence and does not write artifacts, install dependencies, build projects, execute scripts, or open pull requests. `probePublishedSite()` fetches HTML metadata over HTTP(S) only and does not execute JavaScript or capture screenshots. Built-output runtime audit starts a temporary loopback static server and fetches from that local server. The verifier does not write files, spawn processes, emit telemetry, or upload source by itself. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## Compatibility

`@decantr/verifier` is stable in the `2.x` line for the documented verifier APIs and published report-schema exports.

- new checks and additive report fields may appear in compatible releases
- breaking report-shape or exported API changes require a major version
- hosted and CLI verifier consumers should treat the published schemas as the supported contract surface

## License

MIT
