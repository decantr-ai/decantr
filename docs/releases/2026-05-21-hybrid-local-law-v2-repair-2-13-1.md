# Hybrid Local Law V2 Repair 2.13.1

Release targets: `@decantr/verifier@2.5.1` and `@decantr/cli@2.13.1`.

## What Changed

- Repairs the public npm install surface for `@decantr/cli@2.13.x` by publishing the verifier scan export consumed by the CLI package.
- Keeps the Hybrid Local Law V2 behavior from `2.13.0`: richer source-derived local law, advisory hosted-pattern mapping, and clearer enforceable-versus-advisory Hybrid output.
- Updates the docs package cards so the public site reflects the repaired CLI and verifier versions.

## Why

`@decantr/cli@2.13.0` was published with an exact dependency on `@decantr/verifier@2.5.0`, but the published verifier package did not yet expose the `scanProject` export required by the CLI scan command surface. Because npm package versions are immutable, the correct repair is a patch release for both packages rather than moving or overwriting `2.13.0`.

## Compatibility

No Essence V4 schema changes. Existing projects should install or upgrade to `@decantr/cli@2.13.1`.

## Verification

- `pnpm run build:packages`
- `pnpm --filter @decantr/cli exec vitest run test/local-law.test.ts test/style-bridge.test.ts test/e2e/operating-layer.test.ts`
- `pnpm audit:package-surface`
