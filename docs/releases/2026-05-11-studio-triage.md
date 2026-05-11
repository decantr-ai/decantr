# Studio Triage Upgrade

`@decantr/cli@2.1.2` improves Decantr Studio as a Project Health triage surface.

- The Overview now explains blocking issues, warnings, health sources, runtime/pack status, and CI readiness more clearly.
- Findings include a friendlier repair flow with visible AI prompt previews and copy actions.
- `decantr studio --report <path>` opens a read-only dashboard from a saved `decantr-health.json` artifact.
- The UI keeps report data local and does not send paths, findings, routes, prompts, or report contents through telemetry.
