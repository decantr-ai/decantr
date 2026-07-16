# Decantr 3.8.3 Post-Publish Adoption Audit

Status: Completed against public npm artifacts on 2026-07-16.

## Summary

Decantr 3.8.3 passes the public-artifact adoption gate. A clean npm install, two pinned Brownfield repositories, and a current TanStack Start Greenfield application all exercised the published CLI rather than workspace links or packed local candidates.

The 3.8.3 correction behaves as intended: when a TanStack application contains both `createRootRoute()` in `src/routes/__root.tsx` and `createFileRoute('/')` in `src/routes/index.tsx`, the taskable `/` implementation and first read target are `src/routes/index.tsx`. The root declaration remains discovery evidence but no longer outranks the page declaration.

No additional 3.8 compatibility patch is indicated by this trial.

## Public Install Boundary

The clean runner installed:

- `@decantr/verifier@3.8.3`
- `@decantr/mcp-server@3.8.3`
- `@decantr/cli@3.8.3`

All three resolved from npm with `latest` pointing to 3.8.3. `decantr --version` returned `3.8.3`, `npm ls --depth=0` was clean, `npm ls --link=true --depth=0` found no linked packages, and `npm audit --omit=dev` reported zero vulnerabilities across 103 installed dependencies. The installed graph contained neither `@decantr/css` nor `@supabase/supabase-js`.

The [trusted-publish workflow](https://github.com/decantr-ai/decantr/actions/runs/29510757465) published all three packages through GitHub OIDC and verified their public manifests and command smoke tests. The [MCP directory workflow](https://github.com/decantr-ai/decantr/actions/runs/29510962672) separately validated and published `io.github.decantr-ai/mcp-server@3.8.3`.

## Brownfield Matrix

The pinned corpus ran 36 commands: 12 root-smoke commands and 24 app-scoped commands. It recorded zero unexpected failures, crash projects, route misses, slow commands, setup-friction failures, project-scope failures, route-context failures, Decantr command failures, or commit-parity failures.

| Project | Reviewed commit | Routes | Task route | First read | Task state |
| --- | --- | ---: | --- | --- | --- |
| [TanStack Start Dashboard](https://github.com/Kiranism/tanstack-start-dashboard) | `433a5a073c944d25dcd59922b4de7193bde3c03e` | 22 | `/dashboard/overview` | `src/routes/dashboard/overview.tsx` | `ready_to_edit` |
| [Bulletproof React](https://github.com/alan2207/bulletproof-react), `apps/react-vite` | `9506629ed003a561c6627735480cce4994244bb4` | 8 | `/app/discussions` | `apps/react-vite/src/app/routes/app/discussions/discussions.tsx` | `ready_to_edit` |

The TanStack target produced a warning Project Health result with score 59 and 13 findings. The Bulletproof target produced a warning result with score 58 and 14 findings. These findings stayed visible for review but did not prevent task context from resolving the correct implementation source.

One retained-corpus run observed command P50 of 304 ms, P95 of 1,132 ms, and maximum of 1,495 ms. These are descriptive measurements from one run, not release-level percentile claims.

## Brownfield Host Gates

Both adopted repositories passed their own toolchains after Decantr adoption:

| Project | Install | Build | Source check | Authored source diff |
| --- | --- | --- | --- | --- |
| TanStack Start Dashboard | `bun install --frozen-lockfile` | `bun run build` | `bun run format:check` | none |
| Bulletproof React Vite app | `yarn install --frozen-lockfile --ignore-scripts` | `yarn build` | `yarn lint` | none |

Decantr wrote only governance artifacts and narrow ignore-file entries. It did not add Decantr CSS or rewrite application source.

## Greenfield Control

The Greenfield control was generated with exact `@tanstack/cli@0.69.6` arguments for React, npm, Biome, no examples, and no intent template. Decantr then ran from the clean public-package runner.

- `scan --json` reported both `src/routes/__root.tsx` and `src/routes/index.tsx` as high-confidence `/` evidence.
- Greenfield `init` used `contract-only` adoption and applied the assistant bridge.
- `task / ... --json` returned `ready_to_edit` and listed `src/routes/index.tsx` first.
- Route and page implementation graph edges both targeted `src/routes/index.tsx`; neither targeted `__root.tsx`.
- `ci --fail-on error --json` exited zero with no errors, three warnings, four informational findings, and Project Health score 81.
- The production build passed.
- Authored route, router, Vite, and package source remained unchanged.

The host build updated TanStack's generated `src/routeTree.gen.ts`. Decantr updated `.gitignore` for its cache and created `.decantr/`, `.cursor/`, `DECANTR.md`, and `decantr.essence.json`. Those ownership boundaries were inspected separately.

The generated starter's pristine `npm run check` already failed with eight formatting/import errors and one schema-version notice because its Biome schema referenced 2.2.4 while the installed CLI was 2.4.5. The post-adoption check produced the same findings; the only log difference was the measured runtime. This is an upstream starter baseline, not a Decantr regression.

## Limitations

- The sample is two Brownfield repositories plus one Greenfield generator output, not the entire frontend ecosystem.
- Runtime browser and visual evidence were not collected, so no visual or runtime-behavior claim is made.
- There is no human-labeled findings set, so this audit does not claim false-positive precision.
- Timing values describe individual runs and must not be generalized as service-level percentiles.
- Warning-level governance findings still require project-owner review; a passing release gate does not mean every target is governance-complete.

## Release State

The formal release closeout passed 47 of 47 checks for `v3.8.3`: the tag is reachable from `origin/main`, the release note is present, all selected npm versions exist, and all selected `latest` tags point to 3.8.3. The [GitHub Release](https://github.com/decantr-ai/decantr/releases/tag/v3.8.3), live docs, public npm packages, MCP directory metadata, and community announcement are aligned.
