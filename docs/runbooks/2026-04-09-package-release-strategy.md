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
- release wave
- publish order within the wave
- whether a package publishes by default
- default npm dist-tag
- release-readiness state:
  - stable-candidate flag
  - docs / CI / product-integration checks
  - explicit blockers for beta packages

## Current Release Waves

The reset branch now treats npm releases as explicit waves instead of a flat publish list.

| Wave | Publish order | Packages | Purpose |
| --- | --- | --- | --- |
| `foundation` | `10`-`50` | `@decantr/essence-spec`, `@decantr/registry`, `@decantr/core`, `@decantr/css`, `@decantr/verifier` | schemas, contracts, compiler/runtime, and verification primitives |
| `delivery` | `10`-`20` | `@decantr/mcp-server`, `@decantr/cli` | user-facing delivery surfaces that depend on the foundation layer |
| `experimental` | `10` | `@decantr/vite-plugin` | non-default experiments that should not ride normal publish waves |

Release planning and publish tooling now respect this order automatically.

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
- `pnpm audit:npm-surface`
- `node scripts/release-plan.mjs --json`
- `node scripts/release-plan.mjs --wave=foundation`
- `node scripts/release-plan.mjs --summary-markdown=/tmp/package-release-plan.md`
- manual GitHub Actions publish runs can now choose:
  - `release_wave`
  - `dist_tag`
  - `include_experimental`
  - `dry_run_only`

The workflow:

- builds and tests the monorepo
- runs `pnpm audit:package-surface`
- runs `pnpm audit:release-readiness`
- writes the selected release plan into the GitHub Actions step summary before publishing
- publishes only the packages marked `publish: true`
- skips experimental packages unless `include_experimental=true`
- publishes in release-wave order from `config/package-surface.json`
- supports `--wave=<wave>` for targeted publish rehearsals
- supports a manual `dist_tag` override for coordinated release waves
- supports `dry_run_only=true` in the publish workflow so a wave can be rehearsed in GitHub Actions without mutating npm

Retired package handling now uses `config/package-retirements.json` plus:

- `pnpm package:retire:dry-run`
- `node scripts/deprecate-retired-packages.mjs`

The live npm dist-tag surface now also has an executable audit:

- `pnpm audit:npm-surface`
- `pnpm npm-surface:normalize:dry-run`

That audit compares `config/package-surface.json` against the real npm registry and flags:

- beta packages promoted on `latest`
- missing expected `beta` dist-tags
- unexpected stray dist-tags
- packages marked `publish: true` that are not published yet

The normalization script is intentionally dry-run first. It can safely automate:

- adding missing `beta` dist-tags when npm `latest` already points to the intended prerelease
- removing stray unexpected dist-tags

It does not automatically retag `latest`; that remains a deliberate manual release-wave decision.
When run with `--write`, it now also performs an npm auth preflight so broken credentials fail fast before any dist-tag mutation attempt starts.

## Stable Graduation Rule

A package should move from `beta` to `latest` only when all of the following are true:

1. Its README and npm metadata match the actual supported API.
2. Its schema or runtime contract is covered by CI and docs.
3. The package is actively used by one of the product nucleus surfaces.
4. The release is part of an intentional wave, not a one-off publish.

When a package graduates:

1. update `config/package-surface.json`
2. decide whether it stays in its current release wave or moves into a later stable-delivery wave
3. clear its `releaseReadiness.blockers` and mark it `stableCandidate: true`
4. update this runbook and the package support matrix
5. update the package version if needed
6. publish with the stable dist-tag

## Remaining Cleanup After This Runbook

This runbook improves forward release discipline, and retired-package handling is now executable, but a few package-surface tasks still remain:

- fix current live npm drift observed on April 9, 2026:
  - `@decantr/essence-spec`, `@decantr/registry`, `@decantr/core`, and `@decantr/mcp-server` are still beta packages effectively riding `latest`
  - `@decantr/cli` has stray npm dist-tags (`latestnpm`, `latest.`)
  - `@decantr/verifier` is now part of the planned public surface but is not yet published
  - `@decantr/verifier` tarball and package metadata now pass `npm publish --dry-run --tag beta`; the remaining blocker is npm auth/publish execution, not package shape
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
pnpm audit:npm-surface
pnpm release:plan
```

Dry-run the publish selection locally:

```bash
node scripts/release-plan.mjs --json
node scripts/release-plan.mjs --wave=foundation
node scripts/publish-packages.mjs --dry-run
node scripts/publish-packages.mjs --dry-run --wave=foundation
node scripts/publish-packages.mjs --dry-run --include-experimental
pnpm npm-surface:normalize:dry-run
```

For GitHub Actions rehearsals, trigger `.github/workflows/publish.yml` with:

- `release_wave=foundation` to publish or rehearse the dependency base first
- `release_wave=delivery` for CLI/MCP delivery surfaces after the foundation wave is green
- `dry_run_only=true` to exercise the selection logic and summary output without touching npm
