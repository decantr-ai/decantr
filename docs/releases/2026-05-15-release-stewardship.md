# Decantr Release Stewardship

Decantr now has a dedicated Release Steward lane for Git + npm closeout.

## What Changed

- Added `pnpm release:closeout`, an executable audit for release version, clean git state, local/origin tag presence, tag reachability from `origin/main`, release-note parity, and npm version/dist-tag parity.
- Added the active release stewardship runbook for monorepo npm releases and `decantr-content` registry publish readiness.
- Added a local `decantr-release-engineering` skill so future release work uses deterministic project scripts before claiming success.

This is release-governance work only; no Essence, registry schema, runtime, CLI command, or public package behavior changed.
