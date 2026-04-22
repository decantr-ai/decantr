# Decantr Package Support Matrix

Generated from `config/package-surface.json` and `config/package-retirements.json`.
Do not edit manually. Run `node scripts/sync-package-support-matrix.mjs` after package-surface changes.

Release readiness audit: `pnpm audit:release-readiness`
Package surface audit: `pnpm audit:package-surface`

This matrix defines which npm packages are part of the active Decantr vNext product surface on the reset branch.

## Active Packages

| Package | Support status | Surface class | Maturity | Release wave | Default npm tag | Publish default | Stable candidate | Blockers | Release lane | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@decantr/essence-spec` | core-supported | `public-foundation` | stable | `foundation` (`10`) | `latest` | `true` | `true` | `0` | `stable-public` | Essence schemas, validation, migration, and TypeScript types. |
| `@decantr/registry` | core-supported | `public-foundation` | stable | `foundation` (`20`) | `latest` | `true` | `true` | `0` | `stable-public` | Registry contracts, schemas, API client, and public content utilities. |
| `@decantr/css` | core-supported | `public-foundation` | stable | `foundation` (`30`) | `latest` | `true` | `true` | `0` | `stable-public` | Framework-agnostic CSS atom runtime for Decantr projects. |
| `@decantr/core` | core-supported | `public-foundation` | stable | `foundation` (`40`) | `latest` | `true` | `true` | `0` | `stable-public` | Execution-pack compiler primitives and shared Decantr core utilities for advanced package consumers. |
| `@decantr/verifier` | core-supported | `public-operator` | stable | `delivery` (`10`) | `latest` | `true` | `true` | `0` | `stable-public` | Shared verification, critique, and report-schema engine. |
| `@decantr/mcp-server` | core-supported | `public-operator` | stable | `delivery` (`20`) | `latest` | `true` | `true` | `0` | `stable-public` | MCP delivery surface for Decantr design intelligence, packs, and verification. |
| `@decantr/cli` | core-supported | `public-delivery` | stable | `delivery` (`30`) | `latest` | `true` | `true` | `0` | `stable-public` | Local scaffold, audit, registry, and maintenance workflows for Decantr projects. |
| `@decantr/vite-plugin` | supported-secondary | `experimental` | experimental | `experimental` (`10`) | `-` | `false` | `false` | `2` | `experimental-hold` | Experimental Vite overlay for Decantr guard feedback during local development. |

## Interpretation

- `core-supported` means part of the product nucleus and expected to track the vNext architecture closely.
- `supported-secondary` means still available, but not a strategic anchor for the main product story.
- `parked` means intentionally paused and not expected to move with the main delivery cadence.
- `archived` means preserved for history only and not expected to receive new product work.
- `extracted` means moved out of the monorepo reset surface into a separate line.
- `public-foundation` means stable public package that defines Decantr foundation contracts and shared building blocks.
- `public-delivery` means stable public delivery package used directly by end users and teams.
- `public-operator` means stable public operator-facing package for advanced delivery, verification, or agent workflows.
- `internal` means internal package used inside Decantr implementation and not part of the public release promise.
- `experimental` means opt-in package outside the default supported public surface.
- `stable` means intended to publish under npm `latest`.
- `internal` means not part of the public npm release promise.
- `experimental` means opt-in and not part of the default publish wave.
- `release wave` defines the intended publish order for coordinated npm releases.
- `publish default` reflects whether the package participates in the default publish flow without opt-in overrides.
- `stable candidate` means the package is intended to be eligible for stable graduation once its blockers reach zero.
- `release lane` is the operator-facing bucket for release planning: `stable-public`, `internal-only`, or `experimental-hold`.

## Surface Snapshot

- Stable public: 7
- Internal only: 0
- Experimental hold: 1

### Stable Public

- `@decantr/essence-spec` in `foundation` wave
- `@decantr/registry` in `foundation` wave
- `@decantr/css` in `foundation` wave
- `@decantr/core` in `foundation` wave
- `@decantr/verifier` in `delivery` wave
- `@decantr/mcp-server` in `delivery` wave
- `@decantr/cli` in `delivery` wave

### Internal Only

- none

### Experimental Hold

- `@decantr/vite-plugin` stays outside the default supported public surface

## Current Product Nucleus

The active Decantr product surface is:

- `@decantr/essence-spec`
- `@decantr/registry`
- `@decantr/css`
- `@decantr/core`
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

Public stable packages must keep `releaseReadiness.blockers` empty, while internal or experimental packages must be clearly classified instead of drifting into long-lived public prerelease states.
