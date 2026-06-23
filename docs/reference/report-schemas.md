# Decantr Report Schemas

Decantr verifier report schemas are published from `packages/verifier/schema`.

## Compatibility Model

- Decantr 3.5 emits v2 report contracts for Project Health, CI reports, workspace health, Evidence Bundles, runtime probe payloads, authority resolution, loop readiness, common verification findings, and proof field reports.
- v1 report schemas remain published as historical references for existing consumers. They are no longer the default payload for 3.5 Project Health, CI, workspace health, or Evidence Bundle commands.
- Audit, scan, file-critique, and showcase shortlist reports remain on their v1 schemas until those contracts need a wire change.
- Consumers must branch on the payload `$schema` URL instead of guessing by package version.
- Source inclusion stays explicit. The v2 evidence schemas reserve source payloads out of band and require `sourceIncluded: false` for the local Evidence Bundle/runtime probe contract.

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

`project-audit-report.v1.json`, `scan-report.v1.json`, `file-critique-report.v1.json`, and `showcase-shortlist-report.v1.json` remain active for their specific commands. The v1 health, CI, workspace, and evidence files are retained so older integrations can validate stored artifacts.

## v2 Loop And Evidence Schemas

`loop-readiness.v2.json` is the common Brownfield control-loop block used by CLI, MCP, verifier, and Studio. It names the current state, next action, maker/checker instructions, authority summary, read targets, graph impact, stop conditions, and verify command.

`authority-resolution.v2.json` groups source-vs-contract conflicts by authority lane and reports explicit resolution actions such as repair source, accept observed source into contract, codify local law, update style bridge, regenerate graph/context, defer to drift log, or mark advisory.

`evidence-bundle.v2.json` includes an `evidenceTier` block for dashboards, benchmark replays, and MCP repair loops that need to understand how strong the current evidence is without parsing prose.

The tier block records:

- `stage`: static, graph, runtime, visual, repair, or proof.
- `capabilities`: which evidence layers are present, such as Project Health, typed graph, runtime probe, visual baseline, repair plan, or benchmark replay.
- `coverage`: route counts, runtime route checks, graph-anchored findings, repair-plan coverage, runtime probe count, and visual artifact count.
- `confidence`: a normalized score, level, and reasons that explain whether the payload is enough for repair, dashboarding, or proof-corpus use.

The v2 Evidence Bundle can also embed a `runtimeProbe` payload and enumerate local artifacts such as visual manifests, screenshots, baseline diffs, repair prompts, and benchmark transcripts. Artifact paths remain local unless an explicit hosted workflow uploads a redacted report.

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

The v2 schemas are the Decantr 3.5 control-loop contract. New Project Health, CI, workspace health, evidence, Studio, and MCP loop integrations should consume the v2 shapes directly. Keep v1 validators available for stored artifacts, but do not add new default emitters that silently fall back to v1 health or evidence payloads.
