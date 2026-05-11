# Release Verification

Decantr now has a post-publish release verifier:

```bash
pnpm release:verify
node scripts/verify-published-packages.mjs --only=@decantr/cli
```

The verifier checks selected packages against the live npm registry, confirms the expected dist-tag points at the local package version, audits the published manifest for `workspace:*` leakage, and smoke-tests the published CLI through `npx`.

The GitHub publish workflow runs the verifier after a real publish. Operators can post a Discord-compatible release result with `RELEASE_VERIFICATION_WEBHOOK_URL` or, for small teams, the existing `TELEMETRY_HEALTH_WEBHOOK_URL`. Local runs load `.env.release.local`, `.env.telemetry.local`, and `.env.local`, with `--env-file <path>` available for one-off verification.

The executive telemetry digest now also calls out Project Health adoption directly: reports, healthy milestones, CI failures, Studio starts, remediation prompt usage, and lifecycle command movement.
