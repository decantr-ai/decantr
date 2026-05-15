# Brownfield Hardening 2.9.7

This patch tightens the Brownfield day-two loop after fresh monorepo dogfood against a tmp-only culinary platform copy.

Release target: `@decantr/cli@2.9.7`.

## Highlights

- `decantr rules preview --project <app>` now inherits package-manager detection from the workspace root, so monorepo apps no longer show `unknown` when the root owns `pnpm`, `npm`, `yarn`, or `bun`.
- `decantr suggest --from-code` ranks accepted `.decantr/local-patterns.json` against the selected source file, not just the typed query. Project-owned button, card, and form law can now surface from real code.
- `decantr setup` inside an attached app reflects accepted local law and recommends `verify --brownfield --local-patterns` instead of telling users to codify again.
- Brownfield section aliases now work for `remove page` and scoped `remove feature --section`, matching the add-command behavior for observed sections such as `observed-primary`.
- Contract-only Brownfield no longer emits Decantr CSS interaction-class remediation; teams should enforce motion and interaction behavior through project-owned local law when they are not using Decantr CSS.
- Refresh now removes obsolete compiled execution-pack artifacts after page removal, so stale `page-*-pack` files do not keep Project Health in a confusing needs-refresh state.

## Dogfood Evidence

- Cold tmp monorepo attach against `culinary-platform`.
- `setup`, `adopt`, `doctor`, `ci init`, `codify`, `task`, `suggest`, `add page`, `remove page`, `refresh --check`, `verify`, and `ci` exercised from the monorepo root and app root.
- Tmp-only rogue button/card drift confirmed local law reports file/line evidence without touching the real culinary repo.
