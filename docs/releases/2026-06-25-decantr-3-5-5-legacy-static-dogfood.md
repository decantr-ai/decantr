# Decantr 3.5.5 Legacy Static Dogfood

Decantr 3.5.5 is a scoped CLI/verifier patch from vanilla JavaScript, vanilla TypeScript, and jQuery-era dogfood.

## Changes

- `decantr scan`, `decantr adopt`, and verifier project scan now treat package-managed static HTML entrypoints such as `src/index.html`, `public/index.html`, and `dist/index.html` as generic web UI surfaces.
- Nested static demo/example pages under `demos/**` and `examples/**` are observed as taskable routes, with representative `index.html` and `default.html` pages prioritized before lower-value variants when the route report cap is reached.
- Package-managed legacy projects with static HTML surfaces are classified as `html` Brownfield targets instead of unknown JavaScript repositories.
- The patch stays technology-agnostic: no jQuery adapter, no Essence schema changes, no MCP changes, and no new package permissions.

## Dogfood Evidence

The published `3.5.4` baseline ran 65 commands across five legacy/static targets and produced two unexpected command failures plus six findings. The patched local 3.5.5 candidate reran the same 65-command matrix with zero unexpected failures and zero findings.

| Project | Stack | 3.5.4 result | 3.5.5 candidate result |
| --- | --- | --- | --- |
| `gabrielecirulli/2048` | vanilla JS static | pass | pass |
| `tastejs/todomvc/examples/javascript-es6` | vanilla JS / webpack static | missed `/` from `src/index.html` | pass |
| `vitejs/vite/packages/create-vite/template-vanilla-ts` | vanilla TypeScript / Vite template | pass | pass |
| `tastejs/todomvc/examples/jquery` | jQuery TodoMVC | pass | pass |
| `jquery/jquery-ui` | jQuery UI demos | missed nested demo routes; task failed for `/demos/accordion/default` | pass |

Raw dogfood artifacts were written locally under:

```text
/private/tmp/decantr-3-5-5-legacy-corpus-20260625
```

## Compatibility

- No Essence schema changes.
- No MCP surface changes.
- No report schema changes.
- No package permission changes.
- No new runtime dependencies.
