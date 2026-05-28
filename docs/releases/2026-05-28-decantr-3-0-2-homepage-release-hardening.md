# Decantr 3.0.2 Homepage And Release Hardening

Date: 2026-05-28
Version: `3.0.2`
Channel: npm `latest`

Decantr `3.0.2` is a stable patch for the Decantr 3 line. It ships the redesigned public docs homepage, keeps the npm publish wrapper friendly to local `npm login` operator auth, and stabilizes the post-release CI lane that guards Brownfield mutation workflows.

## What Changed

- Redesigned the docs homepage around the Brownfield-first `scan` path, Project Health proof, and the Contract / Context / Evidence story.
- Kept a legacy copy of the prior homepage under `docs/legacy/` before the public redesign.
- Hardened npm publish auth isolation so GitHub OIDC trusted publishing does not inherit classic npm token state.
- Preserved local interactive npm auth for maintainers who publish from a terminal after `npm login`.
- Increased the operating-layer E2E CLI timeout so slower CI runners do not fail after a successful command write.

## Package Surface

This patch publishes the stable public Decantr package surface as `3.0.2`:

- `@decantr/essence-spec@3.0.2`
- `@decantr/registry@3.0.2`
- `@decantr/css@3.0.2`
- `@decantr/core@3.0.2`
- `@decantr/telemetry@3.0.2`
- `@decantr/verifier@3.0.2`
- `@decantr/mcp-server@3.0.2`
- `@decantr/cli@3.0.2`

## Operator Notes

- Preferred publish path remains GitHub OIDC trusted publishing with provenance.
- Local fallback publishing can use the wrapper after `npm login`; no OTP-specific workflow is required unless the npm account itself requests it.
- npm Trusted Publishing should still be configured for every public package so future tag publishes are fully unattended.

## Verification

```bash
pnpm release:preflight
pnpm build:packages
pnpm test
pnpm audit:package-surface
pnpm audit:release-readiness
pnpm audit:docs-marketing
pnpm audit:public-links
pnpm audit:public-api
pnpm release:verify -- --version 3.0.2
pnpm release:closeout -- --version 3.0.2
```
