# Brownfield Doctor Queue 2.9.8

Release target: `@decantr/cli@2.9.8`.

## What Changed

- `decantr adopt` no longer prints the nested `analyze` command's manual `init --existing --accept-proposal` follow-up during the paved adoption flow. It now says the analysis artifacts were written and that adoption is continuing automatically.
- `decantr doctor` now prints an ordered `Next steps` queue instead of only one `Next` command. Brownfield users can see pinning, local-law codification, CI setup, task-time context, verification, and automation in one short sequence.
- `doctor --json` keeps the existing `recommendedNextCommand` field for compatibility and adds `recommendedNextCommands` for tools that want the whole queue.
- Brownfield doctor recommendations now use `decantr ci --fail-on error` and keep the verification step aligned with local-law checks.

## Why It Matters

Cold monorepo dogfooding showed the main workflow was technically correct but still had a small trust leak: `adopt` appeared to ask users to run an init command it was already running, and `doctor` hid the actual day-two operating loop behind whichever single issue came first. This patch makes the path feel more like a guided checklist and less like a scavenger hunt.

## Verification

- Fresh temp copy of the `culinary-platform` monorepo with existing Decantr artifacts removed.
- `decantr adopt --project apps/recipefork-web --yes`
- `decantr doctor --project apps/recipefork-web`
- `pnpm --filter @decantr/cli test -- --run packages/cli/test/e2e/operating-layer.test.ts`
- `pnpm --filter @decantr/cli build`
