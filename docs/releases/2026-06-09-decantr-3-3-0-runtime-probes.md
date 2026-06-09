# Decantr 3.3.0 Runtime Probes

Date: 2026-06-09
Status: Planned
Version: `3.3.0`

Decantr `3.3.0` is the planned runtime and visual evidence release. It turns built-output smoke checks, route-document coverage, browser probes, and visual baseline artifacts into a typed payload that can stand alone or embed inside an Evidence Bundle.

## Planned Scope

- Add the runtime probe payload as the typed Evidence surface for local builds, published-site probes, browser render checks, visual baselines, showcase checks, and proof-corpus runs.
- Keep the v1 `project-audit-report.runtimeAudit` shape intact for existing consumers.
- Preserve the local-only screenshot boundary. Screenshot files remain local artifacts unless a hosted workflow explicitly uploads a redacted report.
- Carry graph anchors on runtime and visual probe findings when `.decantr/graph` exists.
- Make runtime probe output useful to MCP repair tools without requiring a full Project Health scan.

## Schema Notes

- `packages/verifier/schema/runtime-probe-payload.v2.json` defines standalone probe scope, summary, probe results, artifacts, provenance, and findings.
- `packages/verifier/schema/evidence-bundle.v2.json` can embed a runtime probe payload through `runtimeProbe`.
- The optional `legacyRuntimeAudit` field exists for comparison with v1 audits, but new dashboards and benchmark consumers should prefer typed `probes` and `artifacts`.

## Compatibility

No Essence, registry, or graph schema migration is planned. Runtime probes add evidence around existing contracts; they do not become a new source of truth.

## Release Exit Criteria

- Runtime probe examples validate against `runtime-probe-payload.v2.json`.
- v1 audit reports continue to validate.
- Browser/visual evidence docs preserve local-only defaults.
- MCP repair docs explain when runtime probe evidence should be read before proposing a fix.
