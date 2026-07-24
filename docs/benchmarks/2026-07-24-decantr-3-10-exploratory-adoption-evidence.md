# Decantr 3.10 Exploratory Adoption Evidence

- **Run date:** 2026-07-24
- **Candidate implementation:** [`37c10c88`](https://github.com/decantr-ai/decantr/commit/37c10c88c3942ea7459c97f0de06eea3b5b55c1c)
- **Published package version during the run:** `3.9.4`
- **Evidence class:** development and falsification evidence only
- **Local evidence root:** `/tmp/decantr-3-10-exploratory-holdout-20260724`

> Point-in-time report: the blocker ledger below records the state at commit
> `37c10c88`. The active 3.10 program now has 40/40 approved evaluator specs,
> 40/40 approved environment specs, an approved Day-0 oracle, and a locked
> 26-profile dual-image runtime matrix. It still has no materializable evaluator
> receipts or paid model result.

## Verdict

The candidate materially improves the deterministic foundation needed before an
A/B model experiment:

- the reported app root, production routes, components, styling authority, graph,
  and task target agree across the tested frameworks;
- the original Angular failure mode is closed on both a formal 100-route
  regression and an unrelated public Angular application;
- ambiguous monorepo roots fail closed with a structured project-selection error;
- Brownfield adoption does not edit formatter configuration, does not install
  `@decantr/css`, and does not hydrate bulk content unless `--packs` is explicit;
- every tested task capsule leads with the production implementation file and
  stays below 800 estimated tokens.

This does not prove that Decantr makes GPT-5.6 Sol, Claude Fable 5, or any other
model better. No paid model run, blinded review, human Day-0 oracle, or
qualification statistic was produced. These trials validate scanner and
adoption mechanics, not the 3.10 product-value claim.

## Exploratory Corpus

The development-only corpus used five additional MIT-licensed public
repositories pinned to exact commits. Two deliberate monorepo-root variations
were added to test fail-closed selection.

| Target | Exact commit | Selected project | Result | Taskable routes | Components | Styling |
| --- | --- | --- | --- | ---: | ---: | --- |
| [flatlogic/angular-material-admin-full](https://github.com/flatlogic/angular-material-admin-full) | `6ec2a615aff5edb3b82b50c11877f61e944dfc6c` | `.` | `ready`, proven/complete | 65 | 169 | SCSS/high |
| [kvnxiao/tauri-tanstack-start-react-template](https://github.com/kvnxiao/tauri-tanstack-start-react-template) | `356ec5cab1b229813b86735ee55205a08c2b21c1` | `.` | `ready`, proven/complete | 1 | 3 | Tailwind/high |
| [fpindej/netrock](https://github.com/fpindej/netrock) | `699d8b63b0f59090c30a6e18db3f10ed19dc3929` | `src/frontend` | `ready`, proven/complete | 16 | 69 | Tailwind/high |
| [satnaing/astro-paper](https://github.com/satnaing/astro-paper) | `4fe3aca0e09ed8404ec2e716ac4f3b57ccc252eb` | `.` | `ready`, proven/complete | 13 | 18 | Tailwind/high |
| [t3-oss/create-t3-turbo](https://github.com/t3-oss/create-t3-turbo) | `8f945b7bb3bfb3ca8358d48b1ff0214079bc11ee` | `apps/tanstack-start` | `ready`, proven/complete | 1 | 6 | Tailwind/high |
| Netrock root variation | same pin | `.` | expected `project_selection_required` | - | - | - |
| T3 root variation | same pin | `.` | expected `project_selection_required` | - | - | - |

The two root variations exited nonzero and returned
`decantr-command-error.v1` JSON with ranked app candidates. They are expected
negative controls, not scanner crashes.

## Brownfield Adoption

Each successful target was copied into a clean variation before adoption.
Default adoption generated compact local context and skipped bulk pack
hydration.

| Target | First task read | Capsule | Graph | Host mutation receipt |
| --- | --- | ---: | --- | --- |
| Angular `/dashboard` | `src/app/modules/dashboard/containers/dashboard-page/dashboard-page.component.ts` | 754 tokens, 2,261 bytes | 65 routes, 169 components, 255 sources | `verified-untouched` |
| Astro `/posts/:slug*` | `src/pages/posts/[...slug]/index.astro` | 742 tokens, 2,224 bytes | 13 routes, 18 components, 50 sources | one verified Tailwind v4 source-isolation block |
| Netrock `/admin/users` | `src/frontend/src/routes/(app)/admin/users/+page.svelte` | 792 tokens, 2,375 bytes | 16 routes, 69 components, 313 sources | one verified Tailwind v4 source-isolation block |
| Tauri/TanStack `/` | `src/routes/index.tsx` | 722 tokens, 2,165 bytes | 1 route, 3 components, 7 sources | one verified Tailwind v4 source-isolation block |
| T3/TanStack `/` | `apps/tanstack-start/src/routes/index.tsx` | 775 tokens, 2,325 bytes | 1 route, 6 components, 14 sources | `verified-untouched` |

All five receipts report:

- `packHydration.requested: false`;
- no `hostOther` writes;
- no `.prettierignore` creation or update;
- no `@decantr/css` dependency;
- either `verified-untouched` source integrity or the exact path and before/after
  hash for Decantr's bounded Tailwind v4 `@source not` block.

The Angular graph contains 578 nodes and 1,138 edges. Its `/dashboard` route
context includes the discovered `DashboardPageComponent`, 12 source artifacts,
and the production dashboard container as the first read. Project Health scans
183 CSS/Sass files instead of treating the SCSS application as having no style
surface.

## Greenfield Control

A separate app was generated with exact `@tanstack/cli@0.69.6` at
`/tmp/decantr-3-10-greenfield-20260724`.

- Pristine discovery found React 19.2, the literal `/` implementation at
  `src/routes/index.tsx`, one component, proven route authority, complete
  topology, and high-confidence Tailwind authority.
- Pristine and post-Decantr production builds both passed.
- The complete emitted `dist` SHA-256 lists were byte-identical before and after
  Decantr initialization.
- The task capsule leads with `src/routes/index.tsx` and uses 909 estimated
  tokens / 2,727 canonical bytes.
- CI v2 passed. CI v3 passed with `--fail-on none` and correctly reported
  governance delta as `not_proven` because the new directory had no Git change
  base or accepted baseline.

The generator's pristine `npm run check` already had eight Biome formatting
errors. The post-Decantr check had the same eight errors and no additional
diagnostic. This is baseline parity, not a clean host-quality result.

The host build generated `src/routeTree.gen.ts`, so its source hash changed after
the initial pristine snapshot. The byte-identical production output is the
reliable no-regression proof for this control.

## Formal Day-0 Rerun

The unchanged 28-repository frozen corpus completed from clean exact commits:

- 28/28 scans completed;
- 17 `ready`, 11 `limited`, zero `blocked`, zero `unsupported`;
- zero test, fixture, story, generated, build-output, or sibling-app authority
  contamination;
- zero high-confidence results without a taskable implementation target;
- every unresolved or partial axis remained explicitly `limited`.

This is still an automatic scanner diagnostic. Human review has not established
that every `ready` result matches the frozen production-authority oracle.

## Hosted Runtime Profiles

The full 26-profile GitHub-hosted probe is bound to candidate commit
`37c10c88c3942ea7459c97f0de06eea3b5b55c1c`:

- [Decantr 3.10 runtime profile probes, run 30088143380](https://github.com/decantr-ai/decantr/actions/runs/30088143380)
- result: 26/26 profile jobs passed, with zero failed or cancelled jobs
- retained evidence: 26 artifact directories and 104 files, expiring
  2026-08-23
- local verification: all 26 OIDC provenance bundles passed the repository
  finalizer again; every subject, verification, bundle, and attestation file
  matched its recorded SHA-256 and byte count

The candidate corrects the two failures found by the previous diagnostic run:

- Node 10.15.1 uses the published `stretch-slim` image instead of a nonexistent
  `buster-slim` tag;
- the empty benchmark home tmpfs is owned by UID/GID 10001 with mode `0700`, so
  npm 8 can write its cache while the container remains non-root.

A successful hosted probe does not lock the runtime matrix. The matrix remains
draft until all 40 environment specs are independently approved and all
retained profile attestations can be reviewed together.

GitHub emitted an operational annotation that the pinned checkout and
setup-node action revisions still declare the deprecated Node 20 action
runtime, which GitHub now executes on Node 24. The action SHAs and hosted-runner
identity remained pinned and attested for this run, but those action revisions
should be updated before a future platform enforcement change.

## Defects Closed

The exploratory runs found and drove fixes for:

- Angular lazy NgModules that import a separate routing module;
- Angular route contamination from test navigation metadata;
- Tailwind dependency presence outranking Angular/PrimeNG/SCSS build authority;
- repeated CLI-only component heuristics disagreeing with verifier discovery;
- missing discovered component nodes and sources in the typed graph;
- Astro `_components` and `_utils` files being promoted to public routes;
- TanStack `createFileRoute` server-handler files being promoted to UI routes;
- Sass files being omitted from style-health checks;
- conventional monorepo app roots such as `src/frontend` not being ranked;
- ambiguous JSON scans emitting human prose instead of a typed error;
- Brownfield formatter-ignore mutation and default bulk pack hydration;
- legacy runtime image selection and non-root home ownership.

## Remaining Qualification Blockers

The no-cost deterministic work does not remove these gates:

- nine of 40 evaluator authoring specs remain draft;
- 32 of 40 environment specs remain draft;
- no human-approved Day-0 authority oracle exists;
- no locked runtime matrix or 40 prepared workspace attestations exist;
- no materializable externally qualified evaluator receipts exist;
- private qualification input transfer is unresolved;
- no signed split-stage agent/evaluator executor exists;
- no audited paid provider adapter, candidate-bound budget approval, provider
  run, power pilot, blinded review, or qualification statistic exists.

`paidExecutionAuthorized` remains `false`. No provider request or model spend was
made during this evidence run.

## Reproduction

```sh
pnpm install
pnpm build
pnpm test
pnpm benchmark:3-10:test
pnpm benchmark:3-10:validate

node scripts/benchmark-3-10/run-day-zero.mjs \
  --corpus /tmp/decantr-3-10-exploratory-holdout-20260724/corpus.exploratory.json \
  --corpus-root /tmp/decantr-3-10-exploratory-holdout-20260724 \
  --out /tmp/decantr-3-10-exploratory-holdout-20260724/day-zero.latest.json \
  --raw-dir /tmp/decantr-3-10-exploratory-holdout-20260724/raw-latest

pnpm benchmark:3-10:day-zero -- \
  --out /tmp/decantr-3-10-candidate-day-zero-20260724-latest.json \
  --raw-dir /tmp/decantr-3-10-day-zero-raw-20260724-latest
```

The external repositories remain under `/tmp`; their source is not copied into
this repository or a public Decantr artifact.
