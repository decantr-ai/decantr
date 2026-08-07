# Decantr 3.11 Changed-UI Assurance Trials

**Date:** 2026-08-07  
**Status:** deterministic release qualification, not model-lift evidence

## Question

Does the 3.11 report keep a current UI change narrow, select the correct app, exclude false authority, fail closed when evidence is ambiguous, and identify an exact project-owned repair target?

## Disposable Matrix

`pnpm qualification:3-11:changes` creates nine temporary Git repositories, runs the built CLI, asserts the expected report contract, and removes the repositories in a `finally` block.

| Trial | Required result |
| --- | --- |
| Unborn React | Complete staged/untracked scope and exact raw-control repair |
| React workspace | One changed app selected; shared package primitive resolved |
| Next App Router | Changed page mapped directly; no topology fan-out |
| TanStack Router | Real `createFileRoute` authority and changed-file finding |
| Angular workspace | Bootstrap-reachable `routes.ts` proven complete; Vitest route metadata excluded |
| Vue Router | Surface scoped; unsupported template primitive check not claimed |
| Fixture-only change | Test metadata excluded from production authority |
| Multi-app change | Ambiguous root invocation rejected with `--project` guidance |
| Outside Git | Incomplete change scope reported as `not_proven` |

All nine passed in the final local release run. Individual timings in that run ranged from roughly 0.3 to 0.9 seconds on the maintainer's machine; those timings are diagnostic only and are not a performance claim.

## Real Brownfield Control

A no-hardlink local clone of committed Culinary Platform revision `0fb1465b4687f86c4e71eaa5ae12bdaf0cb6c85b` supplied a multi-app Next.js workspace with a shared design-system package. The source worktree was not touched.

Negative control:

- a clean root invocation refused to choose among six UI candidates;
- `--project apps/recipefork-web` produced a complete empty working-tree scope and `pass`.

Controlled mutation:

- one untracked Next page was added inside `apps/recipefork-web`;
- the page contained one raw `<button>`;
- root `decantr verify` selected `apps/recipefork-web` through changed files;
- the change mapped only to the new route and page component;
- route topology fan-out remained false;
- one `COMP010` pointed to line 5;
- the target was the actual `CulinaryButton` export at `packages/design-system/src/foundation/index.tsx`;
- explicit CI v3 returned the same changed file, code, target, and repair target.

The temporary clone and mutation were removed after evidence collection.

## External Acquisition

Pinned GitHub acquisitions were attempted for Angular RealWorld, TanStack Start Dashboard, Bulletproof React, and shadcn-vue. Outbound GitHub HTTPS was unavailable in the qualification environment, so none was cloned and none is counted as 3.11 evidence. Existing pinned 3.10 corpus records remain historical and were not relabeled as 3.11 runs.

## What This Proves

- The checked CLI, CI v3, MCP adapter tests, and verifier use one report contract.
- The specified source-scope, app-selection, route-authority, component-authority, and fail-closed cases behave deterministically.
- The original Angular fixture-authority failure has an executable regression case.
- A real multi-app workspace can resolve a project-prefixed shared primitive without whole-app impact noise.

## What This Does Not Prove

- that Decantr makes a frontier model materially better;
- finding precision or recall across the industry;
- Angular, Vue, Svelte, Astro, Nuxt, or Solid template primitive parity;
- runtime, visual, accessibility, or behavioral correctness;
- production adoption value or developer retention;
- performance on repositories larger than the exercised workspace.

Those limits are product facts, not release exceptions.

