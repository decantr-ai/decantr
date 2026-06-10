# /tmp Proof Corpus Field Report

Date: 2026-06-10
Decantr version: `@decantr/cli@3.4.0`
Run root: `/private/tmp/decantr-proof-lab-3-4-benchmark`
Raw results: `/private/tmp/decantr-proof-lab-3-4-benchmark/results/3.4.0/raw`

## Verdict

This is a useful field test, but it is not enough to publish as the Decantr proof benchmark.

Only three realistic non-`node_modules` app projects were available under `/private/tmp`. Most other `/tmp` candidates were empty harness shells, package caches, or folders containing only `node_modules`. I created a clean run directory from the existing `/private/tmp/decantr-proof-lab` git baseline and ran the Decantr 3.4.0 loop against the three viable apps.

The signal is encouraging: Decantr 3.4.0 is materially better than the older 3.0.2 proof-lab result. Route discovery, task targeting, shell drift, direct graph queries, graph freshness, local law, and evidence bundles all produced useful output. But the run also exposed enough benchmark and verifier gaps that the right next move is a small 3.4.1 hardening/doc/harness release before a public five-app benchmark, unless we decide to add first-class benchmark commands and call that 3.5.0.

## Viable /tmp Apps

| App | Path | Shape | Viability |
| --- | --- | --- | --- |
| Pristine React SaaS | `/private/tmp/decantr-proof-lab-3-4-benchmark/apps/pristine-react-saas` | React Router/Vite SaaS app with project UI primitives | Viable, but baseline has false-positive shell drift |
| Messy React Support | `/private/tmp/decantr-proof-lab-3-4-benchmark/apps/messy-react-support` | Route-branching React app with raw controls and style debt | Viable adversarial Brownfield app |
| Hybrid Next Product | `/private/tmp/decantr-proof-lab-3-4-benchmark/apps/hybrid-next-product` | Next App Router hybrid public/app-shell product | Viable Hybrid shell-drift app |

No fourth or fifth realistic `/tmp` app was found. The official benchmark still needs two additional real apps or generated-and-committed benchmark fixtures with stable provenance.

## Commands

Each app ran:

```bash
npx --yes @decantr/cli@3.4.0 scan --project <app> --json
npx --yes @decantr/cli@3.4.0 adopt --project <app> --yes --no-packs
npx --yes @decantr/cli@3.4.0 codify --from-audit --style-bridge --project <app>
npx --yes @decantr/cli@3.4.0 codify --accept --project <app>
npx --yes @decantr/cli@3.4.0 graph --project <app> --json
npx --yes @decantr/cli@3.4.0 graph --project <app> --route <route> --json
npx --yes @decantr/cli@3.4.0 task <route> "<task>" --project <app> --json
npx --yes @decantr/cli@3.4.0 verify --brownfield --local-patterns --project <app>
npx --yes @decantr/cli@3.4.0 verify --brownfield --local-patterns --project <app> --evidence
```

After manual adversarial edits, each app reran graph and verify. The run also checked:

```bash
npx --yes @decantr/cli@3.4.0 graph --project apps/pristine-react-saas --file src/pages/BillingPage.tsx --impact --json
npx --yes @decantr/cli@3.4.0 graph --project apps/pristine-react-saas --node rule:behavior:confirmation-dialog:project-dialog-primitive --impact --json
```

## Results Summary

| Capability | Result | Notes |
| --- | --- | --- |
| Published CLI smoke | Pass | `@decantr/cli@3.4.0 --version` returned `3.4.0` |
| Scan/adopt/codify/graph/task/verify command loop | Pass | All three viable apps completed the command loop |
| Messy React route discovery | Pass | `scan` detected `/tickets`, `/customers`, and `/admin`; `task /tickets` succeeded |
| Direct graph route query | Pass | `graph --route` succeeded for all three apps |
| Direct graph file impact query | Pass | `graph --file src/pages/BillingPage.tsx --impact --json` succeeded |
| Direct graph node impact query | Pass | `graph --node rule:behavior:confirmation-dialog:project-dialog-primitive --impact --json` succeeded |
| Evidence bundle write | Pass | Each app wrote `.decantr/evidence/latest.json` |
| Shell drift catch | Pass, with caveat | Hybrid `/pricing` mutation emitted `ROUTE368`; pristine baseline emitted noisy `ROUTE274` |
| Dialog primitive drift catch | Pass | Pristine raw overlay mutation emitted `COMP020` |
| Form safety catch | Partial | Pristine raw form button emitted `INT013`; unlabeled mutated input did not emit explicit `A11Y011` |
| Style drift catch | Partial | Messy raw styles emitted `TOKEN010`; Hybrid `app/globals.css` still looks noisy |
| Runtime/browser/axe evidence | Not collected | All apps emitted `RUNTIME467` because no dist output/runtime was available |
| Legacy mutation script | Fail | Exact snippet matching failed on `BillingPage.tsx`; manual mutations were applied instead |

## Findings

### What Improved Since The Older Proof Lab

Route discovery is much better. The old 3.0.2 proof-lab notes said `messy-react-support` only detected `/` and `decantr task /tickets` failed. In this run, Decantr 3.4.0 detected all three branch routes and task context for `/tickets` worked.

Direct graph query modes also improved. The older scorecard called out `EISDIR` failures for route, file, and node graph queries. In this run, route queries succeeded for all three apps, and the file/node impact queries succeeded on `pristine-react-saas`.

Shell drift is real now. Mutating the hybrid public `/pricing` page into an app frame produced `ROUTE368`:

```text
Observed route shell signals disagree with the Decantr section shell: /pricing (topnav-main vs app-shell source).
```

Behavior obligations are still valuable. Replacing the project `Dialog` primitive with a raw destructive overlay produced `COMP020`, and raw form button behavior produced `INT013`.

### What Is Still Not Good Enough

The `/tmp` corpus is too small. Three apps is useful dogfood, not enough for the published benchmark criteria. Calling this a five-app proof benchmark would be dishonest.

The pristine app baseline has shell-drift noise. Before adversarial edits, `pristine-react-saas` emitted `ROUTE274` across `/`, `/dashboard`, `/billing`, and `/settings`:

```text
Observed route shell signals disagree with the Decantr section shell: / (main-only vs app-shell source), /dashboard (main-only vs app-shell source), /billing (main-only vs app-shell source), /settings (main-only vs app-shell source).
```

That means shell drift is catching real Hybrid drift, but the classifier/proposal layer is still too eager or too coarse for simple React Router app shells.

The unlabeled input mutation was under-specific. After removing the `Label` from `SettingsPage.tsx`, the evidence bundle included generic `AUDIT389` and form-safety `INT013`, but not an explicit `A11Y011` for the mutated pristine form. The messy app did emit `A11Y011`, so this is not total absence; it is inconsistent precision.

Style bridge drift is still noisy. Messy raw inline and legacy CSS findings are desirable, but `hybrid-next-product` flagged `app/globals.css` with `TOKEN010`. For a Next app, global CSS may be project-owned token authority rather than arbitrary drift. This needs better distinction between token definitions, token usage, and one-off values.

Runtime proof is missing. The apps did not have installed runtime dependencies or built `dist` output in the fresh run, so every evidence bundle included `RUNTIME467`. This field report proves static/source/graph behavior, not rendered accessibility or interaction quality.

The old mutation harness is brittle. It used exact multi-line snippet matching and failed before applying adversarial edits. The benchmark harness should use AST-aware or marker-based mutations if we want replayable proof.

## Evidence Codes After Manual Mutation

| App | Notable codes |
| --- | --- |
| Pristine React SaaS | `COMP020`, `INT013`, `AUDIT389`, `ROUTE274`, `GRAPH001`, `RUNTIME467` |
| Messy React Support | `A11Y011`, `INT013`, `TOKEN010`, `AUDIT421`, `AUDIT389`, `GRAPH001`, `RUNTIME467` |
| Hybrid Next Product | `ROUTE368`, `TOKEN010`, `AUDIT389`, `GRAPH001`, `RUNTIME467` |

`GRAPH001` after mutation is expected: the source changed after graph generation, and Decantr correctly marked the typed graph stale.

## Recommendation

Do not publish this as the public Decantr proof benchmark yet.

Do publish or land a small 3.4.1 hardening wave if the scope is:

- benchmark harness repair: deterministic clean workspace, marker/AST mutations, stable raw-result summarizer
- shell drift precision for simple React Router app shells
- explicit `A11Y011` consistency for mutated form usage sites
- style bridge distinction between project global CSS/token authority and arbitrary drift
- docs update that says `/tmp` proof-lab is a field report, not the official five-app corpus

Call it 3.5.0 only if we add product-facing benchmark commands or generated benchmark reports, such as:

- `decantr benchmark run`
- benchmark result schema/export
- runtime server orchestration
- optional Playwright/axe capture in the benchmark loop
- public proof-corpus fixture package or committed fixture workspace

My honest recommendation is `3.4.1` first. The engine does not need a new product surface yet; it needs a sharper harness and a couple of verifier precision fixes so the official five-app benchmark is defensible.
