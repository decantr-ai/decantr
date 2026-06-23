# Decantr 3.5 Proof Field Report

Generated locally on 2026-06-23 with:

```bash
pnpm benchmark:proof-field -- --config fixtures/proof-corpus/proof-apps.json --out /tmp/decantr-proof-field-3.5-fixtures --keep-workdir
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
| fixture-local-law-react | healthy / 97 | 0 | warning / 87 | pass `component-reuse-raw-control` |
| fixture-runtime-vite-visual | warning / 92 | 0 | warning / 82 | pass `AUDIT389` |
| fixture-route-drift-react | healthy / 97 | 0 | error / 72 | pass `brownfield-route-drift`, pass `brownfield-stale-route` |
| fixture-style-bridge-tailwind | healthy / 97 | 0 | warning / 87 | pass `brownfield-style-drift` |
| fixture-stale-context-nextish | healthy / 97 | 0 | healthy / 97 | no mutation in this run |

## What This Proves

The committed 3.5 proof corpus now covers route drift, component reuse drift, style/local-law drift, behavior/accessibility drift, stale graph/context readiness, and one optional visual/runtime evidence lane. Clean baselines have no unexpected warning/error findings. The runtime fixture explicitly allows the optional `browser-playwright-missing` environment note when Playwright is not installed, so that setup fact is not counted as an application false positive.

Every expected adversarial rule was observed after mutation, and the emitted v2 findings carried graph anchors and repair plans after the harness prepared `.decantr/graph` before health checks.

## Harness Output

The local run wrote:

- `/tmp/decantr-proof-field-3.5-fixtures/proof-field-report.json`
- `/tmp/decantr-proof-field-3.5-fixtures/proof-field-report.v2.json`
- `/tmp/decantr-proof-field-3.5-fixtures/proof-field-report.md`
