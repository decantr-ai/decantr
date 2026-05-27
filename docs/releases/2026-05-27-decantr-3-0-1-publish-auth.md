# Decantr 3.0.1 Publish Auth Hardening

Date: 2026-05-27
Version: `3.0.1`
Channel: npm `latest`

Decantr `3.0.1` is a narrow release-infrastructure patch for the stable Decantr 3 line. It hardens the npm publish workflow after the `3.0.0` tag run exposed a package-level trusted-publishing gap.

## What Changed

- The GitHub `Publish` workflow now supports `publish_auth_strategy` with `auto`, `oidc`, and `token` modes.
- The default `auto` path tries npm trusted publishing with GitHub OIDC first, then retries the current package once with `NPM_TOKEN` when the token is available.
- Token fallback disables npm provenance for that retry so npm does not re-enter the OIDC path.
- The publish wrapper now explains the required npm trusted-publisher settings when OIDC fails.
- Release commands and runbooks document the fallback and token-only recovery path.

## Package Surface

This patch publishes the stable public Decantr package surface as `3.0.1`:

- `@decantr/essence-spec@3.0.1`
- `@decantr/registry@3.0.1`
- `@decantr/css@3.0.1`
- `@decantr/core@3.0.1`
- `@decantr/telemetry@3.0.1`
- `@decantr/verifier@3.0.1`
- `@decantr/mcp-server@3.0.1`
- `@decantr/cli@3.0.1`

## Operator Notes

- Preferred publish path remains GitHub OIDC trusted publishing with provenance.
- The fallback is a release-continuity guard, not a replacement for trusted-publisher setup.
- Verify every package in npm has trusted publishing configured for `decantr-ai/decantr` and workflow filename `publish.yml`.

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
pnpm release:verify -- --version 3.0.1
pnpm release:closeout -- --version 3.0.1
```
