# Decantr 3.9 Adoption Proof Program

Date: 2026-07-16

Status: Active successor program. This document defines 3.9 work; it does not claim that 3.9 behavior is shipped.

## Product Thesis

Decantr does not need more surface area. It needs stronger proof that an AI agent receives the right project law, the right source targets, and a bounded verification loop quickly enough to use on real work.

Decantr 3.9 should make adoption truth and governance impact obvious in Greenfield, Brownfield, and Hybrid applications while staying stack agnostic. The official `@decantr/content` corpus supplies certified vocabulary and reference guidance. Project source, accepted local law, and explicit style bridges remain the governing authority for existing applications.

The program succeeds when a team can attach Decantr, prepare a real task, let its existing coding agent work inside a compact governance capsule, and prove the resulting delta without handing application ownership to Decantr.

## Baseline

The 3.8.2 post-publish audit established:

- public npm installation works without workspace links or retired registry infrastructure
- Brownfield scan completes in under 500ms on two reference targets
- contract-only adoption completes in under two seconds on those targets
- task preparation completes in under one second and selects the correct source in both Brownfield targets
- baseline-aware CI reports zero new findings immediately after Brownfield adoption
- host builds and host source checks remain independently runnable
- the latest TanStack greenfield template exposed a root-layout versus page-source precedence defect

These are single-run observations, not percentile claims. Finding precision has not yet been measured against a human-labeled set.

## Outcomes

### 1. Adoption Truth

`scan`, `adopt`, `doctor`, and Studio should present one consistent answer to:

- what application Decantr selected
- which framework, routes, components, styling authority, and assistant rules were observed
- what Decantr created or changed
- what remains governed by project source
- what is uncertain or unsupported
- what the next useful task is

The output should distinguish `found`, `governed`, `advisory`, and `untouched` facts. Confidence and provenance must travel with every discovery claim.

### 2. Model-Ready Governance Capsules

The existing CLI and eight-tool MCP surface should deliver a compact task capsule containing:

- route and implementation source targets
- authority order and relevant accepted local law
- behavior obligations and applicable corpus guidance
- graph impact and current findings
- stop conditions and one exact verification command

Default context must stay bounded. Full graph or evidence detail remains an explicit diagnostic request. No ninth MCP tool is needed.

### 3. Delta Governance

CI and PR workflows should answer what the proposed change introduced, not merely restate inherited project debt. Required output includes:

- changed routes and impacted graph nodes
- new, resolved, and inherited findings
- violated authority and repair target
- evidence freshness and limits
- a stable machine-readable result suitable for check annotations

Decantr should not post comments, edit source, or invoke an agent by default. It should emit deterministic evidence for the team's existing automation.

### 4. Corpus And Policy Change Impact

`@decantr/content` should be versioned as official guidance, not treated as remote marketplace data. A project should be able to determine:

- which content version or item informed a local contract or pack
- whether a content update changes applicable guidance
- whether an accepted local rule intentionally overrides official guidance
- whether a refresh is advisory, migratory, or behavior-affecting

Content changes must never silently rewrite accepted project law.

### 5. Maintained Adoption Proof

The release process should maintain:

- pinned external Brownfield targets for ecosystem realism
- a current generated Greenfield lane for starter drift
- focused in-repo fixtures for contracts that external projects cannot stably guarantee
- packed-artifact tests before publication
- public npm tests after publication
- host builds, host checks, and source-integrity comparisons

Generated reports remain CI artifacts. Human-reviewed conclusions live in dated audits.

## Quantitative Gates

Measure each timing across at least 20 clean runs per reference target before claiming a percentile.

| Gate | 3.9 target |
| --- | --- |
| Scan latency | P95 at or below 2 seconds per reference app |
| Contract-only attach | P95 at or below 10 seconds, excluding host dependency install |
| Task preparation | P95 at or below 2 seconds with a current graph |
| Task source precision | 100% of labeled reference routes put the implementation source first |
| Immediate Brownfield CI | Zero new findings after untouched contract-only adoption |
| Host source integrity | Zero application-source edits by contract-only adoption |
| Context budget | Default task capsule remains within a versioned byte/token budget |
| Finding precision | At least 90% precision for sampled warning/error findings on a human-labeled set |
| Reproducibility | Every release target records exact source ref, package version, and command evidence |

Recall should be reported separately from precision once a labeled corpus exists. Do not optimize precision by suppressing all useful warnings.

## Workstreams

### A. Truth Report Contract

Define one typed adoption-truth structure and render it through CLI, MCP project context, Studio, and CI summaries. Reuse verifier discovery and existing report schemas where possible; add a schema only if no current contract can carry provenance and governed-state distinctions.

### B. Source And Graph Precision

Build a labeled route-to-implementation set across supported routing styles. Treat generated route trees, layouts, pathname fallbacks, and sibling applications as explicit negative-selection cases. Keep the verifier as the shared owner of discovery facts.

### C. PR-Ready Evidence Delta

Make baseline and graph diffs sufficient for a CI consumer to annotate a pull request without parsing prose. Preserve stable diagnostic codes and repair IDs. Keep provider-specific posting outside the core product.

### D. Content Provenance

Carry official content identity and version into execution packs and refresh decisions. Expose update impact without making the Fly API mandatory for offline or enterprise adoption.

### E. Acceptance Automation

Promote `scripts/realworld-corpus.post-publish.json` and `docs/runbooks/post-publish-adoption-proof.md` into release gates. Add repeated-run aggregation and a reviewed findings-label format before making percentile or precision claims.

## Release Gates

Decantr 3.9 is ready only when:

1. The quantitative gates have machine-readable evidence.
2. Greenfield, Brownfield, and monorepo reference lanes pass from packed artifacts and public npm artifacts.
3. CLI and MCP agree on selected project, route source, authority, graph freshness, and verify command.
4. Contract-only adoption leaves host source untouched.
5. Content provenance works online and offline.
6. Package permissions, docs drift, public links, package surface, and release closeout audits pass.
7. The release note names measured limitations and does not claim unsupported frameworks or precision.

## Explicit Non-Goals

- Reviving `registry.decantr.ai` or community publishing
- Expanding `@decantr/css` or making it a default
- Accounts, organizations, billing, usage metering, or hosted source upload
- A ninth MCP tool or a renamed MCP identity
- An autonomous coding agent inside Decantr
- Framework-specific source generation as the core product
- New public schemas or packages solely to make the release appear larger

## 3.8 Relationship

3.8.x remains limited by `docs/runbooks/decantr-3-8-maintenance.md`. Defects discovered while building this program may be backported only when they violate an already shipped 3.8 contract. New adoption-truth, delta, provenance, or benchmark contracts belong to 3.9.
