# Decantr 3.5.5 Legacy Static Dogfood Report

Generated on June 25, 2026 against published `@decantr/cli@3.5.4` and a local 3.5.5 candidate.

## Corpus

| Project | Stack | Selected task route |
| --- | --- | --- |
| `gabrielecirulli/2048` | vanilla JS static app | `/` |
| `tastejs/todomvc/examples/javascript-es6` | vanilla JS / webpack static app | `/` |
| `vitejs/vite/packages/create-vite/template-vanilla-ts` | vanilla TypeScript / Vite template | `/` |
| `tastejs/todomvc/examples/jquery` | jQuery TodoMVC | `/` |
| `jquery/jquery-ui` | jQuery UI static demos | `/demos/accordion/default` |

## Command Matrix

Each target ran 13 commands:

- `decantr --version`
- `decantr scan --json`
- `decantr scan`
- `decantr adopt --yes --no-packs`
- `decantr setup`
- `decantr doctor`
- `decantr task <selected-route> "Review route before editing"`
- `decantr task <selected-route> "Review route before editing" --json`
- `decantr task /not-a-real-route "Bad route smoke" --json`
- `decantr verify`
- `decantr verify --json`
- `decantr refresh --check`
- `decantr graph --check`

## Results

| Run | Commands | Unexpected failures | Findings |
| --- | ---: | ---: | ---: |
| Published 3.5.4 baseline | 65 | 2 | 6 |
| Local 3.5.5 candidate | 65 | 0 | 0 |

## Findings Fixed

- `tastejs/todomvc/examples/javascript-es6` stores its source HTML entrypoint at `src/index.html`; 3.5.4 reported no routes, while 3.5.5 reports `/`.
- `jquery/jquery-ui` is a package-managed library repo with static demo pages under `demos/**`; 3.5.4 reported no routes and `task /demos/accordion/default` failed, while 3.5.5 reports representative demo routes and task context resolves.
- Large demo folders can exceed the route report cap. 3.5.5 prioritizes `index.html` and `default.html` pages across demo/example folders before lower-value variants so common demo routes remain taskable.

## Interpretation

This does not make Decantr a jQuery-specific analyzer. The useful product boundary is generic web surface detection: static HTML entrypoints, demo/example page trees, route-scoped task context, and graph SourceArtifact anchors. jQuery selector/event semantics remain future evidence work.
