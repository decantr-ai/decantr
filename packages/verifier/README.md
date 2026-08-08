# @decantr/verifier

Support status: `core-supported`  
Release channel: `stable`

Shared local discovery, verification, critique, and report-schema engine used by the Decantr CLI, MCP server, and CI adapters.

## Release Boundary

Decantr 3.11.2 is the current stable line. It adds Changed-UI Assurance to the independent UI authority axes, route and non-route task context, compatible route-backed task capsules, adoption truth, governance deltas, and report schemas. The release is not quantitatively adoption-proven.

The verifier models routes, layouts, components, stories, overlays, flows, packages, and runtime states as independent UI surfaces and reports selected-app, surface-authority, topology, taskability, component-inventory, styling-authority, and runtime-evidence axes separately. These shipped APIs do not establish that Decantr improves model outcomes; only a separate controlled A/B program can support that claim.

## Install

```bash
npm install @decantr/verifier
```

## Compatible 3.x Exports

- `verifyUIChanges()` for zero-write, Git-scoped UI assurance with fail-closed app selection and at most three consequential findings by default
- `resolveChangedUISurfaces()` for mapping staged, unstaged, deleted, renamed, untracked, commit-range, or unborn-branch files to one selected app and its affected UI surfaces
- `auditProject()` for project-level Decantr audits
- `auditBuiltDist()` for built-output runtime verification against emitted HTML, assets, and route hints
- `discoverProject()` for shared read-only Brownfield discovery of workspace/app scope, package manager, framework, language, source-declared routes, taskable routes, component inventory, styling authority, Decantr presence, and inherited assistant-rule files. Authored framework routes remain implementation authority; TanStack generated route metadata may corroborate public paths without becoming the edit target. Angular discovery begins at the selected production bootstrap/router graph while excluding test and fixture source.
- `scanProject()` for read-only Brownfield reconnaissance that emits `scan-report.v2` by default using the shared discovery substrate
- `auditComponentReuse()` for the first AST-derived component reuse drift slice, focused on AI reimplementing common UI primitives instead of importing project-owned components, plus local import references that the typed graph can turn into source-to-source impact edges
- `auditStyleBridgeDrift()` for accepted style bridge drift, focused on production `className`, common class-helper values, stylesheet declarations, and hardcoded inline color styles that bypass project-owned token/class authority
- `collectProjectSourceFiles()` for the shared production-source file selection used by Project Health, component reuse drift, style bridge drift, and typed graph source provenance
- `resolveGitHubScanInput()` and `probePublishedSite()` as caller-invoked compatibility utilities for URL normalization and HTML-only site probes; Decantr does not operate a hosted source scanner
- `critiqueFile()` for file-level review against compiled review-pack contracts
- `createContractAssertions()` for explicit route, shell, accessibility, context, and design-token assertions derived from Essence/context
- `createEvidenceBundle()` for privacy-redacted local evidence artifacts used by AI repair loops and CI
- `createEvidenceTier()`, `createAuthorityResolution()`, and `createLoopReadiness()` for the shared v2 Brownfield control-loop blocks used by CLI, MCP, Studio, and verifier consumers
- `createAdoptionTruthV1()` for receipt-backed adoption facts whose observation, governance, and mutation states remain independent
- `createProjectAdoptionTruthV1()` for one read-only, discovery-backed project truth; `createProjectIdentityV1()` provides the clone-independent workspace-relative identity shared by task capsules, CI v3, MCP, and local baselines, while `createStableProjectIdentityV1()` derives the same identity directly from a selected project root
- `createTaskCapsuleV1()` for the shipped attached-route contract: structured project, graph, ranked read-target, authority, impact, finding, official-guidance, stop-condition, and exact verification-command context under deterministic 12,000 canonical UTF-8 byte / 4,000 estimated-token limits using conservative `tokenEstimateV1 = ceil(bytes / 3)` accounting; task-request truncation, omitted counts, canonical byte/token measurements, and downstream digests must all derive from this final canonical result
- `createGovernanceDeltaV1()` and `fingerprintFindingOccurrenceV1()` for Git-scope-independent debt comparison with deterministic new, inherited, resolved, and unclassified finding occurrences plus explicit incomplete-proof gates
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
- broad project-owned Brownfield inline-style/accessibility signals and server-only localhost fallbacks remain advisory; client-reachable localhost, accepted obligations, host/browser tests, and source-corroborated security evidence retain stronger severity. Generic minified framework-bundle marker volume is not proof by itself.
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

## Published 3.11 Exports

- `verifyUIChanges()`, `resolveChangedUISurfaces()`, and `CHANGE_ASSURANCE_V1_SCHEMA_URL`
- `ChangeAssuranceReportV1` plus typed status, finding, Git scope, selection, surface, and limitation contracts
- `AUTH001`, `AUTH010`, `COMP001`, `COMP010`, and `TOKEN010` assurance findings with source and repair targets
- shared consumption by CLI bare verify, explicit CI v3, and MCP `decantr_verify` action `changes`

The default finding limit is three and the maximum explicit limit is twenty. Primitive-reuse checks are strongest for JSX/TSX; template parity for Angular, Vue, and other frameworks remains limited in 3.11.

## Published 3.10 Foundation

- `buildUISurfaceDiscovery()` and `UISurfaceDiscovery` for the `ui-surfaces.v1` model: eight surface kinds, exact `ready` / `limited` / `blocked` / `unsupported` readiness, and independently visible authority axes
- `resolveUISurfaceTaskContext()` for target resolution by route, exact surface ID, component name, `kind:name`, or `file:<path>`; ambiguous and unknown targets return no read set, and non-route static evidence remains limited unless runtime reachability is proven
- `discoverUIEvidenceAdapters()` for selected-app Storybook, Figma Code Connect, design-token, project-test, runtime, visual, and accessibility evidence; configured or collected evidence does not prove freshness, pass state, task coverage, runtime behavior, or publication success
- `classifyProjectSourceScope()` for separation of production, test, story, fixture, mock, generated, build-output, package, and runtime evidence
- Next App/Pages Router discovery evaluates root or `src/` middleware/proxy policy and reachable local helpers separately from file-route declaration. Statically identified 4xx-conditioned routes remain observable but non-taskable; unresolved path-dependent policy degrades authority and fails closed.
- TanStack file-route discovery maps route groups, pathless layouts, and parameter identifiers to generated public-path metadata when available. Root and pathless layouts remain non-taskable; convention-sensitive paths without generated corroboration cap completeness at `partial`.
- Astro discovery treats `.astro`, `.md`, `.mdx`, and `.html` files under `pages` as UI pages. TypeScript and JavaScript files in that tree remain observable response endpoints but are not taskable UI surfaces.
- Angular discovery treats wildcard routes as terminal fallbacks, resolves `ng-packagr` workspace secondary entries to their exported component source, and includes static `templateUrl`, `styleUrl`/`styleUrls`, and adjacent Pug authoring sources in task reads.
- Candidate styling discovery follows ordered production stylesheet imports through local files and workspace package exports. Task read sets preserve that cascade order, and Next API route handlers are excluded from the UI component inventory.

These APIs ship in 3.10.0. Their schemas remain explicit about authority and limitations; publication does not turn them into model-value evidence.

## Example

```ts
import {
  auditProject,
  createContractAssertions,
  createEvidenceBundle,
  critiqueFile,
  scanProject,
  verifyUIChanges,
  type ProjectHealthReport,
} from '@decantr/verifier';

const scan = await scanProject(process.cwd());
const changedUI = verifyUIChanges({
  projectRoot: process.cwd(),
  comparisonScope: { kind: 'working_tree', identity: 'git:working-tree' },
  changeBase: {
    identity: 'git:working-tree:head',
    hash: 'sha256:<caller-computed>',
    baseRef: 'HEAD',
    headRef: '<head-sha>',
    mergeBase: '<head-sha>',
    completeness: 'complete',
    changedFiles: ['src/pages/overview.tsx'],
    changedRoutes: [],
    impactedNodeIds: [],
    unresolvedFiles: [],
    limitations: [],
  },
});
const audit = await auditProject(process.cwd());
const assertions = createContractAssertions(process.cwd(), audit);
const critique = await critiqueFile('./src/pages/overview.tsx', process.cwd());

function isBlocking(report: ProjectHealthReport) {
  return report.status === 'error';
}
```

## Schema Exports

- `@decantr/verifier/schema/adoption-truth.v1.json`
- `@decantr/verifier/schema/change-assurance-report.v1.json`
- `@decantr/verifier/schema/task-capsule.v1.json`
- `@decantr/verifier/schema/governance-delta.v1.json`
- `@decantr/verifier/schema/verification-report.common.v1.json`
- `@decantr/verifier/schema/verification-report.common.v2.json`
- `@decantr/verifier/schema/project-audit-report.v1.json`
- `@decantr/verifier/schema/project-health-report.v1.json`
- `@decantr/verifier/schema/project-health-report.v2.json`
- `@decantr/verifier/schema/decantr-ci-report.v1.json`
- `@decantr/verifier/schema/decantr-ci-report.v2.json`
- `@decantr/verifier/schema/decantr-ci-report.v3.json`
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

The adoption-truth, task-capsule, and governance-delta schemas are additive Decantr 3.9 contract primitives consumed by CLI, MCP, opt-in CI v3, and read-only Studio adapters. `decantr-ci-report.v3` is also additive and must be selected explicitly; v2 remains the default throughout 3.9.x and its schema/exit semantics are unchanged. A missing or incompatible baseline produces unclassified findings and `not_proven` rather than a false empty delta. V1 health/evidence/scan schemas remain published for stored-artifact compatibility; audit, file-critique, and showcase reports remain v1 until those wires need to change. See [Report Schemas](https://decantr.ai/reference/report-schemas.md).

These contracts define deterministic evidence shapes; they do not prove product value by themselves. Stable 3.11.2 is product-qualified, not human-qualified or adoption-proven. A separate frozen 40-task, two-model, two-arm, repeated A/B protocol gates only a measured model-improvement claim. Development-corpus results may tune implementation but cannot grant that confirmatory claim; qualification failures, unsupported targets, missing evaluators, build failures, and model substitutions remain visible in its denominator.

## Security And Permissions

The verifier is a local library. It reads selected project source, direct workspace-package component authority, Decantr context, read-only scan files, and built `dist`/`.next` output when callers request project or runtime audits. `verifyUIChanges()` accepts caller-provided Git scope and never writes. `scanProject()` returns relative evidence and does not write artifacts, install dependencies, build projects, execute scripts, or open pull requests. `probePublishedSite()` fetches HTML metadata over HTTP(S) only and does not execute JavaScript or capture screenshots. Built-output runtime audit starts a temporary loopback static server and fetches from that local server. The verifier does not write files, spawn processes, emit telemetry, or upload source by itself. See [security permissions](https://decantr.ai/reference/security-permissions.md).

## Compatibility

`@decantr/verifier` is stable in the Decantr 3 line for the documented verifier APIs and published report-schema assets.

- new checks and additive report fields may appear in compatible releases
- report-shape changes are versioned through explicit `$schema` URLs
- hosted, CLI, MCP, and Studio consumers should treat the published schemas as the supported contract surface
- `ui-surfaces.v1` and `ui-surface-task-context.v1` are stable 3.10 APIs, but their authority state and limitations must not be paraphrased into stronger readiness claims
- `change-assurance-report.v1` is the stable 3.11 changed-UI wire contract; consumers must preserve `not_proven` and explicit limitations

## License

MIT
