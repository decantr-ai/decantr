# Decantr Showcase Host

This app is the canonical Decantr showcase runtime. It hosts all blueprint showcase capsules under stable `/showcase/:slug/*` URLs and isolates each capsule in an iframe so generated global CSS, route assumptions, and local storage behavior stay scoped to the selected blueprint.

## Operating Contract

- Add or refresh showcase UI through `scripts/blueprint-harness/harness.mjs promote`, not by creating a new app workspace under `apps/showcase`.
- Keep `apps/showcase/manifest.json` as the canonical showcase metadata source.
- Keep capsule source under `src/capsules/<blueprint-slug>/`.
- Keep capsule route URLs stable as `/showcase/<blueprint-slug>` and `/showcase/<blueprint-slug>/<route>`.
- Do not import capsule components into documentation or product apps directly. Static showcase surfaces should link to the host URL or embed it with `?embed=1`.
- Keep showcase screenshots in `apps/showcase/assets/thumbnails/<blueprint-slug>.png` at 1600x1000. Treat those files as canonical assets for docs and showcase metadata; there is no registry build copy.

## Visual Direction

The host chrome is intentionally quiet and operational. The showcase itself owns the visual personality inside the iframe.
