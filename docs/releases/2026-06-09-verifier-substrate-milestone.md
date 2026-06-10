# Decantr 3.2.0 Evidence Tier Dashboard

Date: 2026-06-09
Status: Planned
Version: `3.2.0`

Decantr `3.2.0` is the planned dashboard-readiness release for the Decantr 3 governance line. The goal is to make Project Health and Evidence Bundles safe to summarize in a team view without changing the local-first privacy boundary.

## Planned Scope

- Introduce the Evidence Tier model for dashboard and repair-loop consumers.
- Keep v1 Project Health, CI, and Evidence Bundle schemas valid.
- Add a v2 Evidence Bundle schema asset with `evidenceTier`, local artifact references, dashboard upload posture, and optional runtime probe embedding.
- Document how MCP clients should move from resolver-first flows to project state, task context, graph capsule, findings, repair plans, and Evidence Bundles.
- Keep hosted upload opt-in. Source, prompts, raw file paths, environment variables, and screenshots remain out of the default payload.

## Schema Notes

- `packages/verifier/schema/evidence-bundle.v1.json` remains unchanged.
- `packages/verifier/schema/evidence-bundle.v2.json` defines the dashboard-ready evidence tier payload.
- Consumers must branch on `$schema` and cannot assume v2 just because packages are on `3.2.0`.

## Compatibility

No Essence migration is planned. Existing Decantr 3 projects should continue to use the same Contract / Context / Evidence workflow:

```bash
decantr doctor --project apps/web
decantr task /route "task" --project apps/web
decantr verify --brownfield --local-patterns --project apps/web
```

## Release Exit Criteria

- v1 evidence payloads remain valid in schema tests.
- v2 Evidence Bundle examples validate against `evidence-bundle.v2.json`.
- MCP migration docs describe the Decantr 3 task-context loop.
- Dashboard consumers can distinguish local-only artifacts from upload-safe summaries.
