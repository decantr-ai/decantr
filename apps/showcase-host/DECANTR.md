# Decantr Showcase Host

This app is the canonical Decantr showcase runtime. It hosts all blueprint showcase capsules under stable `/showcase/:slug/*` URLs and isolates each capsule in an iframe so generated global CSS, route assumptions, and local storage behavior stay scoped to the selected blueprint.

## Operating Contract

- Add or refresh showcase UI through `scripts/blueprint-harness/harness.mjs promote`, not by creating a new app workspace under `apps/showcase`.
- Keep `apps/showcase/manifest.json` as the public registry metadata source.
- Keep capsule source under `src/capsules/<blueprint-slug>/`.
- Keep capsule route URLs stable as `/showcase/<blueprint-slug>` and `/showcase/<blueprint-slug>/<route>`.
- Do not import capsule components into the registry app directly. Registry pages should link to the host URL or embed it with `?embed=1`.

## Visual Direction

The host chrome is intentionally quiet and operational. The showcase itself owns the visual personality inside the iframe.
