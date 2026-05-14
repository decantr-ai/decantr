# Decantr 2.9.1 Brownfield Correctness

Decantr 2.9.1 is a Brownfield trust patch for the 2.9 operating layer. It keeps the 2.9 command model unchanged and tightens the places where dogfood monorepos exposed confusing or unsafe behavior.

## Fixes

- `decantr check --brownfield --project <app>` now evaluates the selected app from a monorepo root instead of looking for `decantr.essence.json` at the repository root.
- `decantr registry compile-packs <path>/decantr.essence.json --write-context` now writes `.decantr/context` beside the provided essence file, so app-scoped monorepos do not accidentally receive root-level pack artifacts.
- Monorepo workspace discovery no longer suggests obvious server-only apps or React library packages as Brownfield app candidates.
- `decantr doctor` and `decantr refresh --check` now treat `pack-manifest.json` as incomplete when any markdown or JSON file named by the manifest is missing.
- Contract-only Brownfield section context no longer tells agents to use `@decantr/css`, `css(...)`, `d-*` treatments, or Decantr token CSS.
- File critique and source audit wording now respect contract-only adoption: Decantr treatments/decorators are not required unless the project chose a Decantr CSS adoption mode.
- The verifier now bounds recursive object/function resolution used by source analysis, preventing complex TSX files from crashing `adopt`, `verify`, `ci`, or Project Health.

## Updated Packages

- `@decantr/cli`: `2.9.1`
- `@decantr/verifier`: `2.3.1`

## Notes

No Essence schema changes are included. Existing 2.9 projects can upgrade in place and rerun:

```bash
pnpm exec decantr doctor --project apps/web
pnpm exec decantr ci --project apps/web
```
