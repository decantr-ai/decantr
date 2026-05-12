# CLI Blueprint List Polish

Release target: `@decantr/cli@2.5.1`.

`decantr list blueprints` now prefers human-readable registry slugs over internal UUIDs when the hosted API returns both. This keeps the new blueprint portfolio output aligned with the commands users actually run, such as `decantr new <name> --blueprint=esports-hq`.

## Verification

- `pnpm --filter @decantr/cli test -- registry-commands.test.ts`
- `pnpm --filter @decantr/cli build`
- `node scripts/publish-packages.mjs --publish-dry-run --only=@decantr/cli`
