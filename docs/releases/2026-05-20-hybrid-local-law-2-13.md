# Hybrid Local Law V2 2.13.0

Release target: `@decantr/cli@2.13.0`.

## What Changed

- `decantr codify --from-audit` now writes richer Hybrid local-law proposals with source evidence, confidence tiers, likely variants, and enforcement notes for button, card/surface, form, shell, and theme families.
- `decantr codify --map-pattern <slug>` maps a hosted or bundled registry pattern into `.decantr/local-patterns.proposal.json` as advisory local law without changing source files.
- `decantr task`, `decantr verify`, and `decantr ci` now make the enforcement boundary clearer: accepted `.decantr/rules.json` findings are the Decantr-scanned layer, while style-bridge and hosted-pattern mappings remain advisory until paired with accepted local rules or the project's lint/test/visual stack.
- Absolute `--project` paths now resolve against the target app's workspace instead of borrowing app candidates from the caller's current monorepo.
- Hybrid docs now explain how to move from observed Brownfield context to project-owned law, registry-pattern mapping, route context, and CI without implying registry takeover.

## Compatibility

No Essence V4 schema change is required. Existing Brownfield and Hybrid projects can upgrade in place. Re-run `decantr codify --from-audit --style-bridge` when you want richer source-derived local law, and use `decantr codify --map-pattern <slug>` only when a registry pattern should become reviewed project-owned guidance.

## Suggested Loop

```bash
pnpm exec decantr doctor --project apps/web
pnpm exec decantr codify --from-audit --style-bridge --project apps/web
pnpm exec decantr codify --map-pattern hero --project apps/web
pnpm exec decantr codify --accept --project apps/web
pnpm exec decantr task /settings "standardize account actions" --project apps/web
pnpm exec decantr verify --brownfield --local-patterns --project apps/web
pnpm exec decantr ci --project apps/web
```

## Verification

- `pnpm run build:packages`
- `pnpm --filter @decantr/cli exec vitest run test/local-law.test.ts test/style-bridge.test.ts`
- `pnpm --filter @decantr/cli exec vitest run test/e2e/operating-layer.test.ts`
- `pnpm audit:package-surface`
