# Decantr 4 Entry Criteria

Decantr 4.0 is a gated compatibility decision, not the next automatic version number. Continue the 3.x line unless field evidence shows that a breaking change materially simplifies the product or removes a contract that cannot be corrected compatibly.

## Product Gate

Before scheduling 4.0, retain privacy-reviewed evidence from at least:

- 30 real UI changes;
- 10 independent repositories;
- four supported framework families;
- three multi-app workspaces;
- five changes made without prior Decantr adoption.

The evidence must record app selection, changed surfaces, shown and suppressed findings, repair targets, user disposition, execution time, and whether Decantr changed the final implementation. Synthetic fixtures can guard regressions but do not satisfy this gate.

## Accuracy Gate

On a frozen, manually labeled field set:

- no test, fixture, story, generated file, build output, or sibling app may be promoted to production authority;
- no multi-app change may silently select one app;
- at least 90% of shown findings must be judged actionable and correctly located;
- every claimed reusable primitive must resolve to a real exported project or workspace symbol;
- unsupported authority must remain `not_proven`, not pass through confidence scoring;
- central topology changes and direct route-page changes must have distinguishable impact sets.

Framework-level claims require separate results. React/Next JSX evidence cannot grant Angular, Vue, Svelte, Astro, Nuxt, or Solid template parity.

## Workflow Gate

At least three independent users or automation environments must exercise each proposed breaking surface:

- bare CLI assurance;
- CI annotations and machine-readable report consumption;
- MCP changed-UI assurance;
- full Project Health compatibility or its proposed replacement.

Measure setup failures, ambiguous app selection, false authority, ignored recommendations, and time-to-repair. GitHub stars, downloads, and generated demo output do not substitute for workflow evidence.

## Candidate Breaking Decisions

4.0 may be justified to:

- make the best validated report version the CI default;
- remove or rename compatibility packages and commands that still distort the product model;
- simplify overlapping scan, health, audit, and verification envelopes;
- add framework-template primitive contracts that cannot fit the 3.x report safely;
- revise MCP envelopes after a migration path is proven.

It is not justified merely to align package versions, rename marketing language, or declare the 3.11 direction complete.

## Migration Gate

Every breaking proposal requires:

- a written old-to-new contract map;
- a deterministic migration or compatibility adapter where feasible;
- explicit CLI, schema, CI, MCP, and package impacts;
- one minor-release deprecation window unless a security issue prevents it;
- clean-consumer package tests for both the final 3.x line and the 4.0 candidate;
- updated local permissions and data-boundary documentation.

## Decision

If these gates do not pass, ship compatible 3.x improvements. If field evidence shows Decantr adds no material value beyond existing linters, tests, and agent context, narrow or stop the product instead of using 4.0 to hide that result.

