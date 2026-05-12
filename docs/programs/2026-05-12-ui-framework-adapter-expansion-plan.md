# UI Framework Adapter Expansion Plan

Date: 2026-05-12
Branch: `feature/ui-framework-adapters`

## Goal

Add certified runnable adapter support for five missing UI targets while preserving Decantr's product boundary:

- Plain HTML/CSS/JavaScript via a Vite-backed `vanilla-vite` adapter.
- Vue via `vue-vite`.
- Svelte via `sveltekit`.
- Angular via `angular`.
- Solid via `solid-vite`.

Adapters must remain a certified runtime promise, not a label. A target should only move out of `generic-web` contract-only mode when it has bootstrap, realization, attach, styling, verification, documentation, and workflow certification coverage.

## Non-Negotiables

- Keep work on a dedicated feature branch.
- Do not revert unrelated user or generated changes in the worktree.
- Preserve existing `react-vite`, `next-app`, and `generic-web` behavior.
- Keep `@decantr/core` framework-neutral; runtime file generation stays in the CLI adapter layer.
- Keep unsupported targets intentionally contract-only until their adapter is fully certified.
- Update all relevant docs, READMEs, guides, generated docs surfaces, package-support tables, release notes, and the Decantr engineering skill only when the implementation truth changes.
- Add tests before declaring an adapter supported.
- Run focused tests after each adapter and the broader package test/build suite before final handoff.

## Current Architecture

Adapter responsibilities are split across:

- `packages/core/src/packs.ts`: pack adapter label resolution.
- `packages/core/src/realization.ts`: certified realization capability.
- `packages/cli/src/bootstrap.ts`: runtime bootstrap adapters and attach/verify hints.
- `packages/cli/src/detect.ts`: framework detection.
- `packages/cli/src/analyzers/routes.ts`: brownfield route observation.
- `packages/cli/src/scaffold.ts`: generated context, CSS adoption, project metadata.
- `packages/cli/scripts/certify-workflows.mjs`: end-to-end workflow certification.
- Docs and support surfaces: root README, CLI README, workflow model, docs home, package surface generator, release notes, `llms.txt`, and Decantr skill metadata.

The content registry is mostly target-neutral. Patterns and shells generally describe framework-agnostic contracts, so this program should not require a large content migration.

## Phase 0: Safety Baseline

1. Record current branch and dirty worktree state.
2. Confirm existing unrelated changes and keep them out of adapter commits.
3. Run baseline focused tests for current adapters:
   - `pnpm --filter @decantr/core test`
   - `pnpm --filter @decantr/cli test`
   - `pnpm --filter @decantr/cli certify:workflows`
4. Capture any pre-existing failures before editing.

Exit criteria:

- Branch is confirmed.
- Baseline state is known.
- Any pre-existing failures are documented.

## Phase 1: Adapter Registry Refactor

Before adding five adapters, make the adapter surface easier to extend safely.

Implementation scope:

- Extract adapter definitions from `packages/cli/src/bootstrap.ts` into a small declarative registry module.
- Keep existing public functions stable:
  - `resolveBootstrapTarget`
  - `getBootstrapAdapter`
  - `getDecantrAdapter`
  - `detectRoutingMode`
- Add explicit adapter capability metadata and target aliases.
- Introduce a shared stack-agnostic adapter contract type before adding framework-specific adapters.
- Add unit tests that prove existing `react`, `nextjs`, and unsupported target resolution stays unchanged.

Exit criteria:

- No behavior change for existing adapters.
- `react-vite`, `next-app`, and `generic-web` tests still pass.
- New adapter registry can accept additional adapters without duplicating selection logic.

## Phase 1A: Stack-Agnostic Adapter Contract

Do this before certifying new adapters. The goal is to make adapters translate Decantr's neutral contract into framework conventions without letting framework details leak back into core.

Implementation scope:

- Define a neutral `AdapterContract` shape that all adapters implement:
  - identity: `id`, `target`, `aliases`, `packAdapter`
  - capabilities: `bootstrap`, `realize`, `attach`, `styling`, `verify`
  - routing model: `history`, `hash`, `pathname`, or framework-native
  - file layout hints: app entry, route roots, component roots, style roots
  - package plan: dependencies, dev dependencies, scripts
  - generated file writer
  - verify plan: dev command, build command, dist directory, route survival behavior
  - documentation snippets: short target-specific notes for generated context
- Keep `@decantr/core` limited to neutral labels and realization capability. No framework file templates in core.
- Keep `@decantr/css` as the shared styling substrate for runnable adapters where possible, with framework-native import wiring handled only by adapters.
- Add target aliases centrally so users can type intuitive names without multiplying adapter ids:
  - `html`, `vanilla`, `javascript`, `js` -> `vanilla-vite`
  - `vue`, `vue3` -> `vue-vite`
  - `svelte`, `sveltekit` -> `sveltekit`
  - `angular`, `ng` -> `angular`
  - `solid`, `solidjs` -> `solid-vite`
- Add a clear adapter lifecycle:
  - `contract-only`: valid target, no runtime ownership.
  - `experimental`: hidden or warned runnable adapter, not advertised as certified.
  - `certified`: documented, tested, and included in realization capability.
  - `deprecated`: still resolved, with migration guidance.
- Add a certification manifest so docs/help/support matrices can be generated from one source instead of manually restating adapter availability in many files.

Exit criteria:

- Adapter status is data-driven and docs can consume the same truth as CLI resolution.
- Adding an adapter requires filling a contract, not editing scattered switch statements.
- Framework-specific code remains adapter-local.

## Phase 1B: Realization Plan Boundary

Decantr should not become a framework code generator. To keep first-mile realization stack-agnostic:

- Treat `compileRealizationPlan` as a neutral app plan: routes, shells, mock data, interactions, theme, and constraints.
- Add adapter-specific realization mappers only in the CLI adapter layer.
- Avoid putting framework component syntax, imports, or router APIs into core pack data.
- Where generated context needs examples, render them as target-specific adapter notes, not as canonical core instructions.
- Keep pattern examples in registry as Decantr-native or JSX-like illustrative examples until target-specific example sets exist.

Exit criteria:

- New adapters consume the same neutral realization plan.
- No new core fields are added just to support one framework unless they describe a genuine UI contract concept.

## Phase 2: Vanilla HTML/JS Adapter

Add `vanilla-vite` for `target=html` and optionally `target=vanilla`.

Expected files:

- `package.json`
- `index.html`
- `src/main.js`
- `src/styles/global.css`
- `src/styles/tokens.css`
- `src/styles/treatments.css`

Adapter behavior:

- Use Vite with no UI framework dependency.
- Import generated Decantr styles from `src/main.js`.
- Render a real skip link, `main#main-content`, starter route handling, and starter content.
- Use plain DOM APIs for theme toggle and simple navigation placeholders.
- Build command: `npm run build`.
- Dist dir: `dist`.

Tests:

- `decantr new vanilla-smoke --blueprint=agent-marketplace --target=html --offline`.
- Assert `package.json`, `index.html`, and `src/main.js` exist.
- Assert no React dependencies are written.
- Assert project metadata adapter is `vanilla-vite`.
- Assert scaffold pack adapter is `vanilla-vite`.

Exit criteria:

- HTML/JS target is runnable and certified.
- Docs no longer list Native HTML/CSS as contract-only.

## Phase 3: Vue Adapter

Add `vue-vite` for `target=vue`.

Expected files:

- `package.json`
- `vite.config.ts`
- `index.html`
- `src/main.ts`
- `src/App.vue`
- `src/router.ts` or equivalent minimal Vue Router setup
- `src/styles/*`

Adapter behavior:

- Use Vue 3, Vue Router, Vite, TypeScript.
- Use route mode from Essence where possible.
- Import Decantr CSS in `main.ts`.
- Render skip nav and `main#main-content`.
- Include attach hints for `src/router.ts`, `src/views`, `src/components`.

Tests:

- New project e2e for `--target=vue`.
- Route/scaffold pack adapter assertions.
- Package dependency assertions.
- Brownfield Vue route analyzer remains valid.

Exit criteria:

- `vue-vite` is runnable, certified, and documented.

## Phase 4: SvelteKit Adapter

Add `sveltekit` for `target=svelte`.

Expected files:

- `package.json`
- `svelte.config.js`
- `vite.config.ts`
- `src/app.html`
- `src/routes/+layout.svelte`
- `src/routes/+page.svelte`
- `src/styles/*`

Adapter behavior:

- Use SvelteKit conventions rather than forcing SPA-only layout assumptions.
- Import generated Decantr CSS from root layout.
- Use SvelteKit file routing and existing `pathname`/history expectations.
- Attach hints should name `src/routes`, `+layout.svelte`, and component roots.

Tests:

- New project e2e for `--target=svelte`.
- Assert SvelteKit files exist.
- Assert adapter metadata is `sveltekit`.
- Verify brownfield SvelteKit route analyzer coverage remains intact.

Exit criteria:

- `sveltekit` is runnable, certified, and documented.

## Phase 5: Angular Adapter

Add `angular` for `target=angular`.

Expected files:

- `package.json`
- `angular.json`
- `tsconfig.json`
- `tsconfig.app.json`
- `src/main.ts`
- `src/index.html`
- `src/styles.css`
- `src/app/app.component.ts`
- `src/app/app.routes.ts`
- `src/app/app.config.ts`

Adapter behavior:

- Use modern standalone Angular application structure.
- Keep starter minimal and production-shaped.
- Import or reference generated Decantr styles through Angular global styles.
- Use Angular Router route definitions.
- Attach hints should name `src/app/app.routes.ts`, `src/app`, and `src/styles.css`.

Tests:

- New project e2e for `--target=angular`.
- Assert Angular files exist.
- Assert no React/Next dependencies are written.
- Assert project metadata adapter is `angular`.
- Keep existing brownfield Angular certification, but rename the old "unsupported target" certification now that Angular is supported.

Exit criteria:

- Angular is no longer treated as unsupported.
- Existing brownfield Angular behavior is preserved.

## Phase 6: Solid Adapter

Add `solid-vite` for `target=solid`.

Expected files:

- `package.json`
- `vite.config.ts`
- `index.html`
- `src/main.tsx`
- `src/App.tsx`
- `src/styles/*`

Adapter behavior:

- Use Solid + Vite + TypeScript.
- Use `@solidjs/router` if routing is needed in the starter.
- Keep code idiomatic Solid, not React-shaped JSX with different imports.
- Add detection for `solid-js` dependencies.

Tests:

- New project e2e for `--target=solid`.
- Detection test for Solid projects.
- Assert metadata/scaffold adapter is `solid-vite`.

Exit criteria:

- Solid is a real target in CLI help, prompts, detection, docs, and certification.

## Phase 7: Core Realization and Pack Labels

Update core adapter labeling and certification only after each CLI adapter exists.

Implementation scope:

- Extend `resolvePackAdapter` for:
  - `html` or `vanilla` -> `vanilla-vite`
  - `vue` SPA -> `vue-vite`
  - `svelte` -> `sveltekit`
  - `angular` -> `angular`
  - `solid` SPA -> `solid-vite`
- Extend `CERTIFIED_REALIZATION_ADAPTERS` to include only adapters implemented and tested.
- Add `@decantr/core` tests for all new target resolutions and realization capability.

Exit criteria:

- Core labels match CLI adapter ids.
- Unsupported targets still resolve cleanly through `generic-web`.

## Phase 8: Documentation and Support Matrix

Update documentation in the same branch, after implementation truth is established.

Required docs:

- Root `README.md`.
- `packages/cli/README.md`.
- `docs/reference/workflow-model.md`.
- `docs/index.html` adapter availability section.
- `docs/llms.txt` if workflow references change.
- Relevant release note under `docs/releases/`.
- Package support matrix generator in `scripts/package-surface-lib.mjs`.
- Generated `config/package-surface.json` if the sync script changes it.
- Any CLI help text in `packages/cli/src/index.ts`.
- Decantr engineering skill at `/Users/davidaimi/.agents/skills/decantr-engineering/SKILL.md` once the new adapter state is true.

Exit criteria:

- No docs still claim Vue, Svelte, Angular, Native HTML/CSS, or Solid are contract-only once certified.
- Docs clearly distinguish certified runnable adapters from generic contract targets.

## Phase 9: Certification and Regression Suite

Run focused and broad checks:

- `pnpm --filter @decantr/core test`
- `pnpm --filter @decantr/cli test`
- `pnpm --filter @decantr/cli certify:workflows`
- `pnpm run build:packages`
- Schema/docs sync if schema or docs copies change:
  - `pnpm run schemas:sync`
  - `pnpm run package-surface:sync`
- Add targeted build smoke tests for generated apps where dependency installation is practical.

Exit criteria:

- All focused adapter tests pass.
- Existing React/Next/generic behavior remains green.
- Any broad-suite failure is either fixed or documented as pre-existing with evidence.

## Phase 10: Final Review Checklist

Before handoff:

- Inspect `git diff --stat`.
- Confirm no unrelated showcase/content changes were modified by this work.
- Confirm branch is still `feature/ui-framework-adapters`.
- Confirm all new adapters are represented in tests, docs, and certification.
- Confirm Decantr engineering skill reflects the final adapter truth.
- Provide a concise implementation summary, tests run, and known residual risks.

## Recommended Rollout Order

1. Adapter registry refactor.
2. `vanilla-vite`.
3. `vue-vite`.
4. `sveltekit`.
5. `angular`.
6. `solid-vite`.
7. Documentation/support matrix/skill updates.
8. Full certification.

This order maximizes safety: first remove duplication pressure, then prove Decantr is framework-neutral with vanilla, then add the Vite-adjacent frameworks, then tackle Angular's heavier conventions, then add Solid once the adapter pattern is settled.
