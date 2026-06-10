# Decantr 3.4.0 Proof Benchmarks

Date: 2026-06-09
Status: Shipped
Version: `3.4.0`

Decantr `3.4.0` closes the 3.2-3.4 proof-engine train. It ships the benchmark methodology, evidence schemas, runtime-probe contract, source-substrate exports, and consolidated MCP surface needed to replace vague showcase confidence with replayable governance evidence.

## Shipped Scope

- Published the governance-proof methodology for realistic Brownfield and Hybrid apps.
- Added schema-backed v2 Evidence Bundle and runtime-probe payload contracts for proof runs.
- Kept benchmark artifacts local and reproducible through existing Decantr 3 commands.
- Documented metrics for scaffold quality, Brownfield adoption quality, runtime evidence, visual continuity, finding precision, and repair-loop reliability.
- Completed release closeout with all publishable packages on npm `latest` at `3.4.0`.

## Methodology

The benchmark methodology lives in [Governance Proof Methodology](../benchmarks/governance-proof-methodology.md).

Benchmark runs measure:

- adoption success
- route and shell coverage
- local law/style bridge activation
- graph freshness and anchor coverage
- runtime probe pass rate
- visual artifact coverage
- finding precision
- repair-plan coverage
- replay determinism

## Compatibility

Proof benchmarks use existing Decantr 3 commands and schema-backed artifacts. They do not require source upload, registry mutation, npm publishing, or a new Essence schema.

## Benchmark Publication Criteria

The corpus is ready for release-quality publication when:

- At least five proof apps have replayable benchmark artifacts.
- At least three drift classes are covered: component reuse drift, token/style drift, and route/shell/context drift.
- At least one visual drift case has local screenshot evidence.
- Benchmark artifacts validate against the documented v1/v2 schema set.
