# Decantr 3.9.4 Day-0 Authority Baseline

**Run date:** 2026-07-22
**Corpus:** 28 pinned public repositories
**CLI:** `@decantr/cli@3.9.4` from repository commit `f890972f`
**Raw normalized report:** [`2026-07-22-decantr-3-9-4-day-zero.json`](./2026-07-22-decantr-3-9-4-day-zero.json)

## Result

All 28 pinned checkouts produced parseable `scan-report.v2` output. No repository was removed or retried under a different project root after seeing its result.

This is a discovery baseline, not a correctness score. Route, component, and styling outputs have not yet been compared with the frozen human authority oracles. A successful process exit therefore means only that the scanner ran.

Observed baseline failures and risk signals:

| Target | 3.9.4 output | Why it matters |
| --- | --- | --- |
| `ngx-admin` | `partial_fit`, score 74, six taskable routes, partial completeness, Tailwind/high styling | The selected styling authority conflicts with stronger Bootstrap and Angular configuration evidence. Partial topology is correctly capped, but the aggregate score remains easy to overread. |
| `spartan` | score 44, zero taskable routes, unresolved/unknown route authority, 694 component candidates | A large component inventory does not make a UI task targetable. |
| `solid-start-hackernews` | `strong_fit`, score 44, zero taskable routes, unresolved/unknown route authority | `strong_fit` contradicts the absence of a proven implementation target. |
| `forma-36` | `strong_fit`, score 44, zero taskable routes, unresolved/unknown route authority, 664 components | A design system is a legitimate UI surface even when route discovery is inapplicable; route-centric fit language is the wrong ontology. |
| `primer-react` | `not_applicable`, score 85, one static route signal, 187 components | A mature design system is incorrectly dismissed because it is not an application router target. |
| `sakai-vue` | `strong_fit`, score 90, styling unknown/low | High aggregate confidence conceals unresolved styling authority. |
| `vben-web-antd` | `strong_fit`, score 90, zero component candidates, styling unknown/low | Route success conceals missing component and styling evidence. |
| `soybean-admin` | two taskable routes for a mature admin app | Formal route detection can still be materially incomplete while reporting proven/complete. |

The baseline found no test, fixture, story, generated, or build-output file in the reported `authorityFiles` array for these selected roots. That is necessary but insufficient: the authority oracle must also establish that the selected production files are the canonical files and that the reported topology is materially complete.

## Product Consequence

Decantr 3.10 cannot use a single applicability label or numeric confidence score as its primary decision. Readiness must be derived from independent axes:

- selected app authority;
- production surface authority;
- topology completeness;
- implementation taskability;
- component inventory quality;
- styling authority;
- runtime evidence.

The primary result is `ready`, `limited`, `blocked`, or `unsupported`. A route can be proven while styling remains unresolved. A design system can be supported even when route scope is not applicable. A large candidate inventory can never compensate for a missing production target.

## Reproduction

The pinned repositories are expected at `/tmp/decantr-3-10-corpus-20260722` by default.

```sh
pnpm benchmark:3-10:validate
pnpm build:packages
pnpm benchmark:3-10:day-zero -- --out /tmp/decantr-3-10-candidate-day-zero.json
```

Raw scanner stdout and stderr remain outside the repository under `/tmp/decantr-3-10-day-zero-raw`. The committed 3.9.4 JSON report is frozen historical evidence; the 3.10 runner refuses to overwrite it.
