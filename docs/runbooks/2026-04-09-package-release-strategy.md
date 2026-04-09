# Package Release Strategy

Date: 2026-04-09
Status: Active

This runbook defines how the Decantr reset branch should treat npm releases while the product moves from reset work into commercial hardening.

## Goals

- keep the public npm surface aligned with the real vNext product
- stop hardcoded publish drift across packages
- make stable-vs-beta behavior explicit
- leave room to graduate packages out of beta intentionally instead of accidentally

## Current Release Policy

The package source of truth is `config/package-surface.json`.

That file currently defines:

- support status
- maturity
- whether a package publishes by default
- default npm dist-tag
- release-readiness state:
  - stable-candidate flag
  - docs / CI / product-integration checks
  - explicit blockers for beta packages

## Current Dist-Tag Strategy

Default package release policy on this branch:

- `@decantr/cli` -> `latest`
- `@decantr/css` -> `latest`
- `@decantr/essence-spec` -> `beta`
- `@decantr/registry` -> `beta`
- `@decantr/core` -> `beta`
- `@decantr/mcp-server` -> `beta`
- `@decantr/verifier` -> `beta`
- `@decantr/vite-plugin` -> excluded by default

## Why This Split Exists

`@decantr/cli` and `@decantr/css` are already the clearest user-facing surfaces and have relatively stable expectations.

The compiler, schema, registry, MCP, and verifier layers are public and important, but they are still being actively reshaped during the reset. They should remain public while publishing under `beta` until their contracts are intentionally graduated.

`@decantr/vite-plugin` remains experimental and should not ride the default publish wave.

## Workflow Contract

The npm publish workflow now uses `scripts/publish-packages.mjs`, backed by `config/package-surface.json`, instead of a hardcoded shell loop.

Release planning now also has an executable source:

- `pnpm release:plan`
- `node scripts/release-plan.mjs --json`
- `node scripts/release-plan.mjs --summary-markdown=/tmp/package-release-plan.md`

The workflow:

- builds and tests the monorepo
- runs `pnpm audit:package-surface`
- publishes only the packages marked `publish: true`
- skips experimental packages unless `include_experimental=true`
- supports a manual `dist_tag` override for coordinated release waves

Retired package handling now uses `config/package-retirements.json` plus:

- `pnpm package:retire:dry-run`
- `node scripts/deprecate-retired-packages.mjs`

## Stable Graduation Rule

A package should move from `beta` to `latest` only when all of the following are true:

1. Its README and npm metadata match the actual supported API.
2. Its schema or runtime contract is covered by CI and docs.
3. The package is actively used by one of the product nucleus surfaces.
4. The release is part of an intentional wave, not a one-off publish.

When a package graduates:

1. update `config/package-surface.json`
2. clear its `releaseReadiness.blockers` and mark it `stableCandidate: true`
3. update this runbook and the package support matrix
4. update the package version if needed
5. publish with the stable dist-tag

## Remaining Cleanup After This Runbook

This runbook improves forward release discipline, and retired-package handling is now executable, but a few package-surface tasks still remain:

- decide whether `@decantr/core` remains a public low-level package long-term or becomes a more intentionally documented integration surface
- decide whether `@decantr/vite-plugin` should graduate, stay experimental, or be archived

## Verification

Before a release wave:

```bash
pnpm build
pnpm test
pnpm lint
pnpm audit:package-surface
pnpm audit:release-readiness
```

Dry-run the publish selection locally:

```bash
pnpm release:plan
node scripts/release-plan.mjs --json
node scripts/publish-packages.mjs --dry-run
node scripts/publish-packages.mjs --dry-run --include-experimental
```
