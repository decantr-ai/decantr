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
- `discoverProject()` for shared read-only Brownfield discovery of workspace/app scope, package manager, framework, language, source-declared routes, taskable routes, component inventory, styling authority, Decantr presence, and inherited assistant-rule files. Formal TanStack source routes outrank generated trees; nested React Router objects resolve lazy implementation files; Vue Router objects are recognized; pathname fallbacks carry medium confidence.
- `scanProject()` for read-only Brownfield reconnaissance that emits `scan-report.v2` by default using the shared discovery substrate
- `auditComponentReuse()` for the first AST-derived component reuse drift slice, focused on AI reimplementing common UI primitives instead of importing project-owned components, plus local import references that the typed graph can turn into source-to-source impact edges
- `auditStyleBridgeDrift()` for accepted style bridge drift, focused on production `className`, common class-helper values, stylesheet declarations, and hardcoded inline color styles that bypass project-owned token/class authority
- `collectProjectSourceFiles()` for the shared production-source file selection used by Project Health, component reuse drift, style bridge drift, and typed graph source provenance
- `resolveGitHubScanInput()` and `probePublishedSite()` as caller-invoked compatibility utilities for URL normalization and HTML-only site probes; Decantr does not operate a hosted source scanner
- `critiqueFile()` for file-level review against compiled review-pack contracts
- `createContractAssertions()` for explicit route, shell, accessibility, context, and design-token assertions derived from Essence/context
- `createEvidenceBundle()` for privacy-redacted local evidence artifacts used by AI repair loops and CI
- `createEvidenceTier()`, `createAuthorityResolution()`, and `createLoopReadiness()` for the shared v2 Brownfield control-loop blocks used by CLI, MCP, Studio, and verifier consumers
- `resolveGraphAnchorForFinding()` and `anchorFindingsToGraph()` for attaching verifier/Project Health findings to typed Contract graph nodes when a graph snapshot exists
- `deriveVerificationDiagnostic()` and `KNOWN_VERIFICATION_DIAGNOSTICS` for stable finding codes and typed repair IDs used by Project Health, MCP health, and Evidence Bundles
- schema-backed report types for project audits, v2 Project Health, v2 Decantr CI reports, v2 Evidence Bundles, v2 Workspace Health, v2 authority resolution, v2 loop readiness, v2 proof field reports, file critiques, and showcase verification
- `ProjectHealthReport`, `ProjectHealthFinding`, and `ProjectHealthRemediation` types for the CLI's end-user health surface
- Project Health and Evidence Bundle finding schemas include optional `code`, `repair`, `repairPlan`, and `graph` fields so agents can identify, anchor, and act on findings without parsing prose; Evidence Bundle provenance also records graph snapshot, manifest, diff, and contract-capsule hashes when present
- interaction findings now include scanned file counts, file line ranges, and expected signal evidence where available, so CLI health/check output can point agents at source-grounded remediation
- production source audits exclude tests, fixtures, generated code, E2E/Playwright/Cypress trees, and testing utilities; explicit router guards satisfy protected-surface topology, while callback utilities and generic fixed-position components require semantic evidence before auth/dialog findings are emitted
- contract-only and style-bridge Brownfield critique avoids requiring Decantr treatments/decorators when the project keeps its own styling authority
- Decantr CI report schemas include accepted style bridge status, mapping count, styling approach, theme modes, evidence tier, authority resolution, and loop readiness alongside local-law findings
- project audits check that `pack-manifest.json` references real pack markdown/JSON files on disk
- project audits tolerate partial or malformed generated review packs without crashing Project Health, so half-attached Brownfield projects still receive actionable findings
- Next.js static/document outputs are treated as framework-rendered documents instead of requiring a Vite-style `id="root"` mount element
- generic static apps can satisfy runtime root proof through semantic app roots such as `main`, `role="main"`, `section.todoapp`, or `#todoapp`, while framework targets still require framework mount/document evidence
- project source audits ignore test, spec, story, fixture, and mock files for production drift warnings such as localhost endpoints and unsafe rendering patterns
- project audits emit `COMP001` / `import-existing-component` findings when a production source file locally redeclares a primitive such as `Button`, `Card`, or `Dialog` while an exported reusable primitive already exists under common component paths
- project audits emit `COMP010` / `replace-raw-control-with-local-component` findings when production JSX renders generic raw controls such as `<button>` or text-like `<input>` while a project-owned primitive already exists; specialized inputs such as file, hidden, checkbox, radio, color, range, and Dropzone `getInputProps()` controls are not treated as generic `Input` drift
- project audits emit behavior-obligation findings when accepted `.decantr/local-patterns.json` patterns declare `behavior_obligations` and production source strongly violates statically checkable dialog/form obligations:
  - `A11Y010` / `restore-dialog-accessible-name`
  - `A11Y011` / `restore-label-association`
  - `INT010` / `restore-visible-consequence-copy`
  - `INT011` / `restore-cancel-affordance`
  - `INT012` / `restore-submitting-guard`
  - `INT013` / `set-explicit-button-type`
  - `COMP020` / `use-project-owned-interaction-primitive`
- project audits emit `TOKEN010` / `replace-arbitrary-style-with-bridge-token` findings when an accepted `.decantr/style-bridge.json` exists and production JSX uses arbitrary Tailwind values such as `bg-[#0f172a]`, values inside `cn()`, `clsx()`, `classnames()`, `cva()`, and `tv()` calls, hardcoded inline color styles such as `style={{ backgroundColor: "#0f172a" }}`, or hardcoded visual values in production CSS/module stylesheets
- published verifier report schemas are exercised by AJV-backed round-trip tests against real audit, critique, and shortlist-report outputs
- project audits include runtime evidence when a built `dist/` output is present:
  - root document, including semantic static app roots for generic static apps
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
- `@decantr/verifier/schema/verification-report.common.v2.json`
- `@decantr/verifier/schema/project-audit-report.v1.json`
- `@decantr/verifier/schema/project-health-report.v1.json`
- `@decantr/verifier/schema/project-health-report.v2.json`
- `@decantr/verifier/schema/decantr-ci-report.v1.json`
- `@decantr/verifier/schema/decantr-ci-report.v2.json`
- `@decantr/verifier/schema/evidence-bundle.v1.json`
- `@decantr/verifier/schema/evidence-bundle.v2.json`
- `@decantr/verifier/schema/runtime-probe-payload.v2.json`
- `@decantr/verifier/schema/authority-resolution.v2.json`
- `@decantr/verifier/schema/loop-readiness.v2.json`
- `@decantr/verifier/schema/proof-field-report.v2.json`
- `@decantr/verifier/schema/scan-report.v1.json`
- `@decantr/verifier/schema/scan-report.v2.json`
- `@decantr/verifier/schema/workspace-health-report.v1.json`
- `@decantr/verifier/schema/workspace-health-report.v2.json`
- `@decantr/verifier/schema/file-critique-report.v1.json`
- `@decantr/verifier/schema/showcase-shortlist-report.v1.json`

The v2 schema assets are the active Decantr 3 contracts for Project Health, CI, Workspace Health, Evidence Bundles, runtime probes, authority resolution, loop readiness, proof field reports, and Brownfield scan reports. v1 health/evidence/scan schemas remain published for stored-artifact compatibility; audit, file-critique, and showcase reports remain v1 until those wires need to change. See [Report Schemas](https://decantr.ai/reference/report-schemas.md).

## Security And Permissions

The verifier is a local library. It reads selected project source, Decantr context, read-only scan files, and built `dist`/`.next` output when callers request project or runtime audits. `scanProject()` returns relative evidence and does not write artifacts, install dependencies, build projects, execute scripts, or open pull requests. `probePublishedSite()` fetches HTML metadata over HTTP(S) only and does not execute JavaScript or capture screenshots. Built-output runtime audit starts a temporary loopback static server and fetches from that local server. The verifier does not write files, spawn processes, emit telemetry, or upload source by itself. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## Compatibility

`@decantr/verifier` is stable in the Decantr 3 line for the documented verifier APIs and published report-schema assets.

- new checks and additive report fields may appear in compatible releases
- report-shape changes are versioned through explicit `$schema` URLs
- hosted, CLI, MCP, and Studio consumers should treat the published schemas as the supported contract surface

## License

MIT
