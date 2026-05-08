# Product Activation Telemetry

`@decantr/telemetry@0.3.0` expands the public telemetry event contract with Project Health and CLI lifecycle signals. `@decantr/cli@1.12.0` emits those signals only for projects that explicitly opt into CLI telemetry. `@decantr/essence-spec@1.0.9` carries the export-map ordering fix needed for downstream DTS builds to resolve its public types cleanly.

New events:

- `decantr.init.completed`
- `decantr.refresh.completed`
- `decantr.check.completed`
- `decantr.health.healthy`
- `health.report.generated`
- `health.finding.prompt_requested`
- `health.ci.failed`
- `studio.started`
- `studio.health_refreshed`

Project Health remains local project observability. Opted-in telemetry includes only aggregate outcome metadata such as status, score, finding counts, CI failure outcome, Studio usage, and remediation prompt requests. It does not upload reports, prompts, evidence, routes, source code, local paths, or environment values.

The admin telemetry usage view now includes a Product Activation section, the PostHog operating dashboard creates Project Activation and Project Health outcome insights, and the weekly telemetry snapshot reports lifecycle, health, Studio, and CI activation movement.
