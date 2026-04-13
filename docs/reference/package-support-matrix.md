# Decantr Package Support Matrix

Generated from `config/package-surface.json` and `config/package-retirements.json`.
Do not edit manually. Run `node scripts/sync-package-support-matrix.mjs` after package-surface changes.

Release readiness audit: `pnpm audit:release-readiness`
Package surface audit: `pnpm audit:package-surface`

This matrix defines which npm packages are part of the active Decantr vNext product surface on the reset branch.

## Active Packages

| Package | Support status | Maturity | Release wave | Default npm tag | Publish default | Stable candidate | Blockers | Graduation lane | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@decantr/essence-spec` | core-supported | beta | `foundation` (`10`) | `beta` | `true` | `false` | `2` | `beta-blocked` | Essence schemas, validation, migration, and TypeScript types. |
| `@decantr/registry` | core-supported | beta | `foundation` (`20`) | `beta` | `true` | `false` | `2` | `beta-blocked` | Registry contracts, schemas, API client, and public content utilities. |
| `@decantr/core` | core-supported | beta | `foundation` (`30`) | `beta` | `true` | `false` | `2` | `beta-blocked` | Execution-pack compiler primitives and shared Decantr core utilities. |
| `@decantr/css` | core-supported | stable | `foundation` (`40`) | `latest` | `true` | `true` | `0` | `stable-now` | Framework-agnostic CSS atom runtime for Decantr projects. |
| `@decantr/verifier` | core-supported | beta | `foundation` (`50`) | `beta` | `true` | `false` | `2` | `beta-blocked` | Shared verification, critique, and report-schema engine. |
| `@decantr/mcp-server` | core-supported | beta | `delivery` (`10`) | `beta` | `true` | `false` | `2` | `beta-blocked` | MCP delivery surface for Decantr design intelligence, packs, and verification. |
| `@decantr/cli` | core-supported | stable | `delivery` (`20`) | `latest` | `true` | `true` | `0` | `stable-now` | Local scaffold, audit, registry, and maintenance workflows for Decantr projects. |
| `@decantr/vite-plugin` | supported-secondary | experimental | `experimental` (`10`) | `beta` | `false` | `false` | `2` | `experimental-hold` | Experimental Vite overlay for Decantr guard feedback during local development. |

## Interpretation

- `core-supported` means part of the product nucleus and expected to track the vNext architecture closely.
- `supported-secondary` means still available, but not a strategic anchor for the main product story.
- `parked` means intentionally paused and not expected to move with the main delivery cadence.
- `archived` means preserved for history only and not expected to receive new product work.
- `extracted` means moved out of the monorepo reset surface into a separate line.
- `stable` means intended to publish under npm `latest`.
- `beta` means public and supported, but still expected to evolve before stable graduation.
- `experimental` means opt-in and not part of the default publish wave.
- `release wave` defines the intended publish order for coordinated npm releases.
- `publish default` reflects whether the package participates in the default publish flow without opt-in overrides.
- `stable candidate` means the package is intended to be eligible for stable graduation once its blockers reach zero.
- `graduation lane` is the operator-facing bucket for release planning: `stable-now`, `ready-next`, `beta-blocked`, or `experimental-hold`.

## Graduation Snapshot

- Stable now: 2
- Ready next: 0
- Beta blocked: 5
- Experimental hold: 1

### Stable Now

- `@decantr/css` in `foundation` wave
- `@decantr/cli` in `delivery` wave

### Ready Next

- none

### Beta Blocked

- `@decantr/essence-spec`: The v3/v3.1 essence evolution and compatibility policy still needs a clearly frozen stable contract.
- `@decantr/registry`: Registry content and hosted verification contracts are still being tightened across public API and client surfaces.
- `@decantr/core`: Execution-pack contracts are still expanding with selected-pack, mutation, and pack-first hosted workflow refinements.
- `@decantr/verifier`: Runtime verification is stronger now but still expanding toward deeper auth, security, and route-level assurance.
- `@decantr/mcp-server`: The MCP tool surface is still evolving alongside pack-select fallbacks and deeper verifier/runtime coverage.

### Experimental Hold

- `@decantr/vite-plugin` stays outside the default graduation path

## Current Product Nucleus

The active Decantr product surface is:

- `@decantr/essence-spec`
- `@decantr/registry`
- `@decantr/core`
- `@decantr/css`
- `@decantr/verifier`
- `@decantr/mcp-server`
- `@decantr/cli`

## Explicitly Not Part of the Active Product Story

These lines were removed from the monorepo reset branch and should not be treated as current product surfaces:

- `@decantr/ui` -> replacement: @decantr/css, @decantr/cli, and the hosted Decantr registry/API surfaces
- `@decantr/ui-catalog` -> replacement: registry.decantr.ai and the hosted registry/API surfaces
- `@decantr/ui-chart` -> replacement: @decantr/css, @decantr/cli, and compiled execution packs

That retirement path is now executable through:

1. `config/package-retirements.json`
2. `pnpm package:retire:dry-run`
3. `node scripts/deprecate-retired-packages.mjs`

## Working Rule

Any future public package change should update all of:

1. `config/package-surface.json`
2. `config/package-retirements.json` when a line is being removed
3. `node scripts/sync-package-support-matrix.mjs`
4. the relevant package README
5. publish/deprecation workflow behavior

Beta packages now also need explicit `releaseReadiness.blockers` in `config/package-surface.json` until they are ready to graduate.
