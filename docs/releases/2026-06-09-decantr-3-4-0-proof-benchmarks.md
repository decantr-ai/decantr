# Decantr 3.4.0 Proof Benchmarks

Date: 2026-06-09
Status: Planned
Version: `3.4.0`

Decantr `3.4.0` is the planned proof-corpus and benchmark methodology release. It replaces vague showcase confidence with replayable governance evidence across realistic Brownfield and Hybrid apps.

## Planned Scope

- Establish a governance-proof corpus of realistic apps with adoption artifacts, typed graph snapshots, local law or style bridge evidence, runtime probes, screenshots, repair prompts, and before/after Evidence Bundles.
- Use synthetic AI edit histories to measure whether Decantr catches drift and guides repair across repeated changes.
- Grade proof runs with schema-backed Evidence Bundles and runtime probe payloads instead of prose-only notes.
- Publish a benchmark methodology that separates scaffold quality, Brownfield adoption quality, runtime evidence, visual continuity, and repair-loop reliability.

## Methodology

The benchmark methodology lives in [Governance Proof Methodology](../benchmarks/governance-proof-methodology.md).

The release lane should measure:

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

Proof benchmarks should use existing Decantr 3 commands and schema-backed artifacts. They should not require source upload, registry mutation, npm publishing, or a new Essence schema.

## Release Exit Criteria

- At least five proof apps have replayable benchmark artifacts.
- At least three drift classes are covered: component reuse drift, token/style drift, and route/shell/context drift.
- At least one visual drift case has local screenshot evidence.
- Benchmark artifacts validate against the documented v1/v2 schema set.
