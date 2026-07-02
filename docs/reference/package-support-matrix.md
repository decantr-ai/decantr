# Decantr Package Support Matrix

Generated from `config/package-surface.json` and `config/package-retirements.json`.
Do not edit manually. Run `node scripts/sync-package-support-matrix.mjs` after package-surface changes.

Release readiness audit: `pnpm audit:release-readiness`
Package surface audit: `pnpm audit:package-surface`
Package permissions audit: `pnpm audit:package-permissions`
Security permissions reference: `docs/reference/security-permissions.md`

This matrix defines which npm packages are part of the active Decantr 3 product surface.

## Active Packages

| Package | Support status | Surface class | Maturity | Release wave | Release channel | Default npm tag | Publish default | Stable candidate | Blockers | Release lane | Summary |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@decantr/essence-spec` | core-supported | `public-foundation` | stable | `foundation` (`10`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | Essence schemas, validation, migration, and TypeScript types. |
| `@decantr/content` | core-supported | `public-foundation` | stable | `foundation` (`20`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | Official Decantr content corpus, schemas, local search/resolution helpers, and content validation for AI frontend governance. |
| `@decantr/registry` | supported-secondary | `public-foundation` | stable | `foundation` (`30`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | 3.x compatibility package for registry-named schema exports, API clients, resolver types, and legacy content utilities. New integrations should prefer @decantr/content for the official corpus. |
| `@decantr/css` | supported-secondary | `public-foundation` | stable | `foundation` (`40`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | Legacy optional CSS atom runtime retained for compatibility and showcase demos; no longer the default greenfield adoption path. |
| `@decantr/core` | core-supported | `public-foundation` | stable | `foundation` (`50`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | Execution-pack compiler primitives, typed graph builders, Contract capsule helpers, and shared Decantr core utilities for advanced package consumers. |
| `@decantr/telemetry` | core-supported | `public-foundation` | stable | `foundation` (`60`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | Privacy-preserving telemetry event contracts, clients, and analytics sinks. |
| `@decantr/verifier` | core-supported | `public-operator` | stable | `delivery` (`10`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | Shared read-only Brownfield discovery and scan-report v2 engine, verification, critique, source-grounded interaction evidence, contract assertions, Evidence Bundle, Project Health, Decantr CI report, Workspace Health, and report-schema engine. |
| `@decantr/mcp-server` | core-supported | `public-operator` | stable | `delivery` (`20`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | MCP delivery surface for Decantr Contract context, shared discovery metadata, typed graph artifacts, packs, Brownfield and Hybrid task context with authority, local law, change impact, evidence bundles, workspace health, and repair prompts. |
| `@decantr/cli` | core-supported | `public-delivery` | stable | `delivery` (`30`) | `stable` | `latest` | `true` | `true` | `0` | `stable-public` | Workflow commands for setup/scan/adopt/doctor/task/verify/ci/codify/connect/content, local workflow/adoption policy resolution, adapter-backed bootstrap/attach, scan-report v2 Brownfield discovery previews, Cursor activation, Brownfield intelligence, Hybrid authority lanes, monorepo app targeting, artifact ownership guidance, project-owned local law, content sync, Evidence Bundles, visual manifests, health baselines, workspace health, pinned CI generation, Project Health, Studio, Content Health, and project governance. |
| `@decantr/vite-plugin` | supported-secondary | `experimental` | experimental | `experimental` (`10`) | `stable` | `-` | `false` | `false` | `2` | `experimental-hold` | Experimental Vite-specific overlay for Decantr guard feedback during local development; remains a verification-adjacent sidecar, not a default reliability adapter. |

## Adapter Capability Matrix

Adapter support is intentionally separate from npm package support. `@decantr/cli` is the supported delivery package; adapters describe which framework/project targets it can bootstrap, realize, attach to, style, and verify today.

| Adapter | Target | Bootstrap | Realize | Attach | Styling | Verify | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `react-vite` | React + Vite | yes | yes | yes | yes | yes | Primary runnable starter and certified first-mile realization adapter. |
| `next-app` | Next.js App Router / Pages Router | yes | yes | yes | yes | yes | Boots App Router greenfield projects and records App/Pages Router attach metadata. |
| `vanilla-vite` | Plain HTML/CSS/JavaScript + Vite | yes | yes | yes | yes | yes | Framework-free runnable starter that proves the contract is not React-shaped. |
| `vue-vite` | Vue 3 + Vite | yes | yes | yes | yes | yes | Boots Vue Router projects and records Vue route/component attach metadata. |
| `sveltekit` | SvelteKit | yes | yes | yes | yes | yes | Boots SvelteKit file-route projects and records route/layout attach metadata. |
| `angular` | Angular standalone | yes | yes | yes | yes | yes | Boots modern standalone Angular projects and records Angular Router attach metadata. |
| `solid-vite` | Solid + Vite | yes | yes | yes | yes | yes | Boots Solid Vite projects and records Solid route/component attach metadata. |
| `generic-web` | Unsupported or unspecified web targets | no | no | yes | contract-only | basic | Fallback adapter for contract-only Decantr adoption without runtime ownership. |

Unsupported framework targets are still valid Decantr contract targets. They should resolve through `generic-web` unless and until a runnable adapter lands.

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
- `stable` means intended to publish under npm `latest` on the stable channel or npm `next` on an explicit prerelease channel.
- `internal` means not part of the public npm release promise.
- `experimental` means opt-in and not part of the default publish wave.
- release channel `stable` means normal public release channel; publishable packages default to npm `latest`.
- release channel `prerelease` means major-line preview channel; publishable packages use prerelease semver and default to npm `next`.
- `release wave` defines the intended publish order for coordinated npm releases.
- `publish default` reflects whether the package participates in the default publish flow without opt-in overrides.
- `stable candidate` means the package is intended to be eligible for stable graduation once its blockers reach zero.
- `release lane` is the operator-facing bucket for release planning: `stable-public`, `prerelease-public`, `internal-only`, or `experimental-hold`.

## Surface Snapshot

- Stable public: 9
- Prerelease public: 0
- Internal only: 0
- Experimental hold: 1

### Stable Public

- `@decantr/essence-spec` in `foundation` wave
- `@decantr/content` in `foundation` wave
- `@decantr/registry` in `foundation` wave
- `@decantr/css` in `foundation` wave
- `@decantr/core` in `foundation` wave
- `@decantr/telemetry` in `foundation` wave
- `@decantr/verifier` in `delivery` wave
- `@decantr/mcp-server` in `delivery` wave
- `@decantr/cli` in `delivery` wave

### Prerelease Public

- none

### Internal Only

- none

### Experimental Hold

- `@decantr/vite-plugin` stays outside the default supported public surface

## Current Product Nucleus

The active Decantr product surface is:

- `@decantr/essence-spec`
- `@decantr/content`
- `@decantr/core`
- `@decantr/telemetry`
- `@decantr/verifier`
- `@decantr/mcp-server`
- `@decantr/cli`

## Explicitly Not Part of the Active Product Story

These lines were removed from the active Decantr 3 product surface and should not be treated as current product surfaces:

- `@decantr/ui` -> replacement: @decantr/cli, @decantr/core, and @decantr/content
- `@decantr/ui-catalog` -> replacement: @decantr/content and decantr.ai documentation
- `@decantr/ui-chart` -> replacement: @decantr/cli, @decantr/verifier, and compiled execution packs

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

Public stable packages must keep `releaseReadiness.blockers` empty. Public prerelease work must use `releaseChannel: "prerelease"`, prerelease semver, and npm `next` instead of quietly moving the stable channel.
