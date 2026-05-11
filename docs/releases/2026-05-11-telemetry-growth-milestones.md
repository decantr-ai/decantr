# Decantr Telemetry Growth Milestones

`@decantr/cli@2.2.0` adds authenticated telemetry identity linking for projects that explicitly opt into CLI telemetry.

## Highlights

- `decantr telemetry status` shows local opt-in state plus opaque install/project ids.
- `decantr telemetry link` links opted-in opaque ids to an authenticated Decantr account or organization through `POST /v1/me/telemetry-link`.
- The telemetry digest now includes npm download interest beside durable usage rollups.
- New `pnpm telemetry:npm-downloads` and `pnpm telemetry:threshold-alerts` scripts support install-demand reporting and daily Discord threshold alerts.
- The PostHog operating dashboard now includes install-interest-to-healthy-project and private-registry readiness signals.

The CLI identity link sends only opaque ids and optional organization/label metadata. It does not upload source code, prompts, reports, finding evidence, routes, local paths, secrets, or environment values.
