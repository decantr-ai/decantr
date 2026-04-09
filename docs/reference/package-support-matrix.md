# Decantr Package Support Matrix

Date: 2026-04-09
Source of truth: `config/package-surface.json`
Retirement manifest: `config/package-retirements.json`
Release readiness audit: `pnpm audit:release-readiness`

This matrix defines which npm packages are part of the active Decantr vNext product surface on the reset branch.

## Active Packages

| Package | Support status | Maturity | Default npm tag | Intended audience |
|---|---|---|---|---|
| `@decantr/cli` | core-supported | stable | `latest` | app teams, local operators |
| `@decantr/css` | core-supported | stable | `latest` | generated projects and hand-authored Decantr apps |
| `@decantr/essence-spec` | core-supported | beta | `beta` | package consumers, validation tooling |
| `@decantr/registry` | core-supported | beta | `beta` | package consumers, API/browser clients |
| `@decantr/core` | core-supported | beta | `beta` | compiler and pack-aware integrations |
| `@decantr/mcp-server` | core-supported | beta | `beta` | AI coding assistants and MCP clients |
| `@decantr/verifier` | core-supported | beta | `beta` | CLI, MCP, CI, and hosted verification consumers |
| `@decantr/vite-plugin` | supported-secondary | experimental | `beta` | local dev experiments only |

## Interpretation

- `core-supported` means part of the product nucleus and expected to track the vNext architecture closely.
- `supported-secondary` means still available, but not a strategic anchor for the main product story.
- `stable` means the package is intended to publish under npm `latest`.
- `beta` means the package is public and supported, but still expected to evolve before stable graduation.
- `experimental` means opt-in and not part of the default publish wave.

## Current Product Nucleus

The active Decantr product surface is:

- `@decantr/cli`
- `@decantr/mcp-server`
- `@decantr/essence-spec`
- `@decantr/registry`
- `@decantr/core`
- `@decantr/verifier`
- `@decantr/css`

## Explicitly Not Part of the Active Product Story

These lines were removed from the monorepo reset branch and should not be treated as current product surfaces:

- `@decantr/ui`
- `@decantr/ui-chart`
- `@decantr/ui-catalog`

They still need npm deprecation/archive handling as a separate release-governance task, but they are no longer part of the active vNext story.

That retirement path is now executable through:

1. `config/package-retirements.json`
2. `pnpm package:retire:dry-run`
3. `node scripts/deprecate-retired-packages.mjs`

## Working Rule

Any future public package change should update all of:

1. `config/package-surface.json`
2. `config/package-retirements.json` when a line is being removed
3. this matrix
4. the relevant package README
5. publish/deprecation workflow behavior

Beta packages now also need explicit `releaseReadiness.blockers` in `config/package-surface.json` until they are ready to graduate.
