# Decantr Report Schemas

Decantr verifier report schemas are published from `packages/verifier/schema`.

## Compatibility Model

- Decantr 3.9 continues to emit v2 report contracts by default for Project Health, CI reports, workspace health, Evidence Bundles, runtime probe payloads, authority resolution, loop readiness, common verification findings, proof field reports, and Brownfield scan reports.
- `decantr-ci-report.v3.json` is opt-in only through `decantr ci --report-version v3` or `decantr ci init --report-version v3`. Package version, environment, and stored config never negotiate it implicitly.
- `AdoptionTruthV1`, `TaskCapsuleV1`, and `GovernanceDeltaV1` are verifier-owned 3.9 contracts. They compose existing evidence without changing v2 required fields or enums.
- v1 report schemas remain published as historical references for existing consumers. They are no longer the default payload for 3.5 Project Health, CI, workspace health, or Evidence Bundle commands.
- Audit, file-critique, and showcase shortlist reports remain on their v1 schemas until those contracts need a wire change.
- Consumers must branch on the payload `$schema` URL instead of guessing by package version.
- Source inclusion stays explicit. The v2 evidence schemas reserve source payloads out of band and require `sourceIncluded: false` for the local Evidence Bundle/runtime probe contract.

## Decantr 3.11 Changed-UI Assurance

- `change-assurance-report.v1.json`

`ChangeAssuranceReportV1` records complete Git change scope, one fail-closed selected app, affected and ignored files, impacted UI surfaces, independent authority, explicit limitations, and concise `AUTH001`, `AUTH010`, `COMP001`, `COMP010`, or `TOKEN010` findings. Its primary status is `pass`, `attention`, or `not_proven`. The default finding cap is three; consumers must not convert omitted lower-priority findings or unresolved authority into a clean result.

Bare CLI `decantr verify`, MCP `decantr_verify` action `changes`, and explicit CI v3 use the same verifier-owned report. CI v2 and full Project Health report schemas remain compatible and are not silently upgraded.

## Active v2 Schemas

- `verification-report.common.v2.json`
- `project-health-report.v2.json`
- `decantr-ci-report.v2.json`
- `workspace-health-report.v2.json`
- `evidence-bundle.v2.json`
- `runtime-probe-payload.v2.json`
- `authority-resolution.v2.json`
- `loop-readiness.v2.json`
- `proof-field-report.v2.json`
- `scan-report.v2.json`

## Decantr 3.9 Governed Change Schemas

- `adoption-truth.v1.json`
- `task-capsule.v1.json`
- `governance-delta.v1.json`
- `decantr-ci-report.v3.json`

`AdoptionTruthV1` records workspace/app selection, independent observation/governance/mutation axes, confidence, workspace-relative provenance, complete mutation receipts, limitations, and one next action. A discovered fact is not automatically governed, and an unreceipted write cannot be reported as created, updated, or untouched.

`TaskCapsuleV1` is task-time context rather than a CI report. It requires a current graph and a rank-one required route implementation read target, then carries authority, changed-file/route/node impact, stable findings, content identities and `sha256` digests, stop conditions, and one verify command. Canonical compact output is limited to 12,000 UTF-8 bytes and `tokenEstimateV1 <= 4,000`, where `tokenEstimateV1` is `ceil(canonicalBytes / 3)`. Existing CLI/MCP task fields remain available and identify the source contract with `taskCapsuleVersion` / `task_capsule_version`; the capsule is not duplicated as a nested payload.

`GovernanceDeltaV1` records comparison scope, Git change base, compatible debt baseline, current health/graph/evidence/contract/content/source identities, and findings partitioned as `new`, `inherited`, `resolved`, or `unclassified` by stable `gfo1:` occurrence fingerprints. Inherited debt does not block the delta gate. Missing, stale, incompatible, or unresolved evidence yields `gate.result: "not_proven"` and `gate.status: "incomplete"` rather than an empty/all-new delta.

The CI v3 project shape embeds existing v2 health evidence plus `AdoptionTruthV1`, `GovernanceDeltaV1`, and Changed-UI Assurance when Git scope is available. Workspace v3 contains one project report per selected app and a deterministic aggregate gate with pass/fail/not-proven counts. CI v3 reads but never creates or updates a baseline.

## Historical And Still-Active v1 Schemas

- `verification-report.common.v1.json`
- `project-audit-report.v1.json`
- `project-health-report.v1.json`
- `decantr-ci-report.v1.json`
- `evidence-bundle.v1.json`
- `scan-report.v1.json`
- `workspace-health-report.v1.json`
- `file-critique-report.v1.json`
- `showcase-shortlist-report.v1.json`

`scan-report.v2.json` is the active `decantr scan --json` contract. It carries the shared discovery summary: app scope, workspace package-manager evidence, framework/language, route signal count, taskable route count, component inventory confidence, source directories, styling authority, assistant-rule files, and explicit limitations. `scan-report.v1.json` remains published for stored artifact compatibility.

`decantr-ci-report.v2.json` project payloads include `baselineGate`. The block records whether a saved Brownfield baseline was applied, its path/time, inherited finding IDs, and new finding IDs/severities. Inherited debt remains visible in report status, while only new health findings determine the baseline-aware health exit gate. Workspace payloads do not use this project-only block. This v2 behavior remains the default throughout 3.9.

`project-audit-report.v1.json`, `file-critique-report.v1.json`, and `showcase-shortlist-report.v1.json` remain active for their specific commands. The v1 health, CI, workspace, evidence, and scan files are retained so older integrations can validate stored artifacts.

## v2 Loop And Evidence Schemas

`loop-readiness.v2.json` is the common Brownfield control-loop block used by CLI, MCP, verifier, and Studio. It names the current state, next action, maker/checker instructions, authority summary, read targets, graph impact, stop conditions, and verify command.

`authority-resolution.v2.json` groups source-vs-contract conflicts by authority lane and reports explicit resolution actions such as repair source, accept observed source into contract, codify local law, update style bridge, regenerate graph/context, defer to drift log, or mark advisory.

`evidence-bundle.v2.json` includes an `evidenceTier` block for dashboards, benchmark replays, and MCP repair loops that need to understand how strong the current evidence is without parsing prose.

The tier block records:

- `stage`: static, graph, runtime, visual, repair, or proof.
- `capabilities`: which evidence layers are present, such as Project Health, typed graph, runtime probe, visual baseline, repair plan, or benchmark replay.
- `coverage`: route counts, runtime route checks, graph-anchored findings, repair-plan coverage, runtime probe count, and visual artifact count.
- `confidence`: a normalized score, level, and reasons that explain whether the payload is enough for repair, dashboarding, or proof-corpus use.

The v2 Evidence Bundle can also embed a `runtimeProbe` payload and enumerate local artifacts such as visual manifests, screenshots, baseline diffs, repair prompts, and benchmark transcripts. Artifact paths remain local in Decantr 3.9; shared dashboards should consume explicitly exported redacted reports rather than raw source, prompts, screenshots, or local paths.

`proof-field-report.v2.json` records benchmark corpus runs with honest pass/fail metrics, false positives, graph-anchor coverage, repair-plan coverage, and loop-verdict quality.

## Runtime Probe Payload

`runtime-probe-payload.v2.json` is a standalone schema for runtime evidence that is useful outside a full Project Health report.

It supports these probe scopes:

- `local-build`
- `published-site`
- `browser`
- `visual-baseline`
- `showcase`
- `proof-corpus`

Each probe result has a stable `id`, `kind`, `status`, target, route, evidence strings, metrics, and optional graph anchor. The schema can carry a `legacyRuntimeAudit` object for consumers that still compare against the v1 `project-audit-report.runtimeAudit` shape, but new consumers should prefer the typed `probes` and `artifacts` arrays.

## Implementation Notes

The v2 schemas remain the default Decantr 3.9 control-loop contracts. New Project Health, workspace health, evidence, and MCP loop integrations should consume the v2 shapes directly. Use CI v3 only when the consumer explicitly needs governed-change proof and can supply/retain the required Git and baseline evidence. Keep v1 validators available for stored artifacts, but do not add default emitters that silently fall back to v1 or silently upgrade v2 consumers to v3.

`scan-report.v2` adds route authority, extraction completeness, authority files, route evidence, excluded-source counts, and styling confidence/evidence/limitations without changing the report ID. Consumers should gate route-scoped automation on those explicit fields, not on the aggregate confidence score alone.

In stable 3.10, a route signal may be source-backed but `taskable: false` when selected-app deployment policy conditions it with a non-success response. Middleware/proxy and reachable local policy files are included in route authority evidence. Consumers must use taskability and the independent authority axes rather than treating `routeSignalCount` as a production route count. Ordered styling authority can include app-relative paths to workspace package exports; those paths are relative to the selected app root.

Framework adapters may also retain non-taskable structural signals. TanStack root/pathless layouts and Astro response endpoints are observable without becoming UI edit targets; TanStack generated route metadata corroborates public-path mapping while the authored route file remains implementation authority. Angular wildcard fallbacks do not create literal `/**/...` descendants, and a resolved Angular route surface may contain its component TypeScript, external template, component styles, and adjacent authored Pug source. These are behavioral refinements within `scan-report.v2`; consumers should continue to use the existing authority, completeness, signal, surface, and taskability fields.

The committed 3.9 schemas define wire behavior; they do not establish that the separate 84 route, 24 forbidden-source, supplemental Angular Brownfield, or 200 human-adjudicated qualification gates passed.
