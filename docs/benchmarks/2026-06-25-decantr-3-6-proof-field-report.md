# Decantr 3.6 Proof Field Report

Generated locally on 2026-06-25 with:

```bash
pnpm benchmark:proof-field -- --config fixtures/proof-corpus/proof-apps.json --out /tmp/decantr-proof-field-3.6-fixtures --keep-workdir
```

## Summary

- Corpus size: 5 committed fixture apps.
- Mutations replayed: 4.
- Expected rules checked: 5.
- Expected-rule catch rate: 1.0.
- Baseline false-positive rate: 0.0.
- Graph-anchor coverage: 1.0.
- Repair-plan coverage: 1.0.
- Loop-verdict quality: 1.0.
- Harness honesty result: pass.
- Recommended follow-up: none.

## App Results

| App | Baseline | Unexpected baseline | Mutated | Expected Rules |
| --- | --- | ---: | --- | --- |
| fixture-local-law-react | healthy / 97 | 0 | warning / 92 | pass `component-reuse-raw-control` |
| fixture-runtime-vite-visual | warning / 92 | 0 | warning / 87 | pass `AUDIT389` |
| fixture-route-drift-react | healthy / 97 | 0 | error / 77 | pass `brownfield-route-drift`, pass `brownfield-stale-route` |
| fixture-style-bridge-tailwind | healthy / 97 | 0 | warning / 92 | pass `brownfield-style-drift` |
| fixture-stale-context-nextish | healthy / 97 | 0 | healthy / 97 | no mutation in this run |

## What This Proves

The 3.6 proof run keeps the 3.5 committed fixture guarantees intact while the Brownfield quality train changes app-candidate ranking and corpus reporting. The corpus covers route drift, component reuse drift, style/local-law drift, behavior/accessibility drift, stale graph/context readiness, and one optional visual/runtime evidence lane.

The runtime fixture still classifies the missing local Playwright environment as an allowed setup condition rather than an app false positive. Every expected adversarial rule was observed after mutation, and emitted findings carried graph anchors, repair plans, and loop verdicts.

## Harness Output

The local run wrote:

- `/tmp/decantr-proof-field-3.6-fixtures/proof-field-report.json`
- `/tmp/decantr-proof-field-3.6-fixtures/proof-field-report.v2.json`
- `/tmp/decantr-proof-field-3.6-fixtures/proof-field-report.md`
