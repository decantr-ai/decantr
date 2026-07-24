# Day-0 Target Oracle

This directory contains the fail-closed audit mechanism and the sole-maintainer-approved
28-repository authority oracle for Decantr 3.10 UI target discovery. The oracle was
approved on 2026-07-24 after review of the pinned production authority and styling
sources. It establishes the Day-0 discovery gate only; it is not an independent
model-outcome review.

The audit compares a normalized `decantr-day-zero-report.v1` report with a corpus-bound, human-approved expectation for every repository. It checks:

- selected project mode;
- route-authority family, accepted scanner strategies, minimum authority level, and minimum completeness;
- minimum taskable route targets and component count;
- styling-authority family, accepted scanner approaches, and minimum confidence;
- required, allowed, and unexpected discovery or styling limitations.

It also fails independently of the oracle when a corpus repository is missing, incomplete, dirty, at the wrong commit, unsupported, contaminated by excluded authority paths, or marked high-confidence without a taskable target. Extra report repositories and corpus-binding mismatches fail as well. The auditor computes these conditions from result rows; it does not trust the report summary.

## Files

- `oracle.mjs`: strict validators, deterministic draft generation, and the audit engine.
- `cli.mjs`: `generate`, `validate`, and `audit` commands.
- `oracle.schema.json`: Draft 2020-12 interchange schema. The stricter executable validation in `oracle.mjs` is authoritative.
- `oracle.test.mjs`: synthetic contract, failure-mode, determinism, and CLI tests.

## Review Workflow

1. Produce a complete candidate report with `run-day-zero.mjs`. Keep candidate reports outside the frozen 3.9.4 baseline path.
2. Generate a deterministic draft:

   ```sh
   node scripts/benchmark-3-10/day-zero/cli.mjs generate \
     --report /tmp/decantr-3-10-candidate-day-zero.json \
     --out /tmp/decantr-3-10-target-oracle.draft.json
   ```

3. Review every repository at the commit and project path pinned by `corpus.json`. Do not treat `observedAtDraft` as ground truth. Inspect production entrypoints, canonical route/config sources, component roots, styling providers/imports, and exclusions independently.
4. For each repository, replace `expectations: null` with reviewed expectations. Set its review status to `approved` and cite concrete source paths or review artifacts in `review.evidence`.
5. Encode all accepted limitations. `required` matchers must remain disclosed. `allowed` matchers may appear. Unless there is a documented reason otherwise, keep `allowUnexpected: false` so a new limitation forces review.
6. After all repository reviews, set the top-level review to `approved`, identify the reviewer, record an ISO-8601 approval time, and describe the review method. Validate before committing:

   ```sh
   node scripts/benchmark-3-10/day-zero/cli.mjs validate \
     --oracle /tmp/decantr-3-10-target-oracle.draft.json \
     --require-approved
   ```

7. Only then commit the approved document as `scripts/benchmark-3-10/day-zero/oracle.json`. This step is intentionally manual; the generator never fills expectations or approval fields.
8. Audit a candidate report:

   ```sh
   node scripts/benchmark-3-10/day-zero/cli.mjs audit \
     --oracle scripts/benchmark-3-10/day-zero/oracle.json \
     --report /tmp/decantr-3-10-candidate-day-zero.json \
     --out /tmp/decantr-3-10-day-zero-target-audit.json
   ```

The audit output has no wall-clock field and is deterministic for the same three input files. Exit code `0` means no findings, `1` means the audit ran and found a failure, and `2` means an input or command was invalid.

## Expectation Semantics

`routeAuthority.family` and `stylingAuthority.family` are stable reviewer labels. The corresponding `acceptedStrategies` and `acceptedApproaches` arrays are the actual report values allowed under those labels. Minimum authority, completeness, confidence, and inventory values can improve without rewriting the oracle, but regressions fail.

Limitation matchers use literal `exact` or `contains` comparisons, never regular expressions. Their source is `discovery`, `styling`, or `either`. Discovery limitations come from `result.limitations`; styling limitations come from `result.styling.limitations`.
