# Decantr 2.9.2 Brownfield DX Polish

Decantr 2.9.2 is a narrow Brownfield adoption polish patch for the 2.9 operating layer.

## What Changed

- `decantr adopt` now hydrates hosted execution packs into the selected app context before Project Health when the user is online. Offline runs and `--no-packs` keep the first attach fully local.
- Project Health remediation copy is monorepo-aware. Missing-pack fixes point at `apps/web/decantr.essence.json`, and CI recommendations include `--project apps/web` when health is running for a selected app.
- `decantr ci init` still generates pinned local package-manager commands, and now prints the exact install command when `@decantr/cli` is not pinned in the workspace root yet.
- Source audit ignores test, spec, story, fixture, and mock files for production drift warnings such as localhost endpoints and unsafe rendering patterns.

## Package Versions

- `@decantr/cli`: `2.9.2`
- `@decantr/verifier`: `2.3.2`

## Upgrade Notes

No schema or Essence changes are required. Existing 2.9.x projects can keep their current `.decantr/*` artifacts. Re-run `decantr adopt --project <app> --yes` only for cold attach flows; otherwise use `decantr doctor --project <app>` and `decantr verify --project <app>` as usual.
