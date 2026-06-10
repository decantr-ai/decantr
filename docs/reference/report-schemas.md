# Decantr Report Schemas

Decantr verifier report schemas are published from `packages/verifier/schema`.

## Compatibility Model

- v1 report schemas remain the active emitted contract for Decantr 3.1 Project Health, CI reports, audit reports, scans, workspace health, file critiques, showcase shortlist verification, and Evidence Bundles.
- v2 schema files are additive siblings. They do not mutate or replace v1 files.
- Consumers must branch on the payload `$schema` URL instead of guessing by package version.
- Source inclusion stays explicit. The v2 evidence schemas reserve source payloads out of band and require `sourceIncluded: false` for the local Evidence Bundle/runtime probe contract.

## Active v1 Schemas

- `verification-report.common.v1.json`
- `project-audit-report.v1.json`
- `project-health-report.v1.json`
- `decantr-ci-report.v1.json`
- `evidence-bundle.v1.json`
- `scan-report.v1.json`
- `workspace-health-report.v1.json`
- `file-critique-report.v1.json`
- `showcase-shortlist-report.v1.json`

## v2 Evidence Tier Schemas

`evidence-bundle.v2.json` adds an `evidenceTier` block for dashboards, benchmark replays, and MCP repair loops that need to understand how strong the current evidence is without parsing prose.

The tier block records:

- `stage`: static, graph, runtime, visual, repair, or proof.
- `capabilities`: which evidence layers are present, such as Project Health, typed graph, runtime probe, visual baseline, repair plan, or benchmark replay.
- `coverage`: route counts, runtime route checks, graph-anchored findings, repair-plan coverage, runtime probe count, and visual artifact count.
- `confidence`: a normalized score, level, and reasons that explain whether the payload is enough for repair, dashboarding, or proof-corpus use.

The v2 Evidence Bundle can also embed a `runtimeProbe` payload and enumerate local artifacts such as visual manifests, screenshots, baseline diffs, repair prompts, and benchmark transcripts. Artifact paths remain local unless an explicit hosted workflow uploads a redacted report.

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

The v2 files are schema assets for the Decantr 3.2-3.4 proof-train work. Current runtime code may continue emitting v1 payloads until the CLI/MCP/verifier implementation intentionally switches individual commands to v2. When that happens, update the relevant package README, schema export map, command docs, and AJV round-trip tests in the same implementation lane.
