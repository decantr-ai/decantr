# Governance Proof Methodology

Decantr proof benchmarks measure whether Contract / Context / Evidence keeps AI edits inside an app's real frontend standards over time.

## Corpus Shape

Use 5 to 8 realistic apps across Brownfield and Hybrid lanes:

- a clean React or Next app with reusable primitives
- a messy React app with route branches, raw controls, and mixed styles
- a hybrid app with public routes and authenticated app-shell routes
- a design-system consumer that should import shared primitives
- a content or commerce app with high route variety

Each app should include a known route inventory, a real package manifest, production source files, existing styling conventions, and enough UI behavior to produce meaningful findings.

## Baseline Setup

For each app:

1. Run `decantr scan`.
2. Run `decantr adopt --yes` with `--project` when the app is in a monorepo.
3. Run `decantr codify --from-audit --style-bridge` when local law or style authority is present.
4. Accept reviewed proposals with `decantr codify --accept`.
5. Generate graph artifacts with `decantr graph`.
6. Run `decantr verify --brownfield --local-patterns --evidence`.
7. Capture optional browser or visual evidence only when the app has a runnable local server.

The baseline is valid only when the app has a Decantr contract, generated context, graph artifacts, Project Health output, and an Evidence Bundle.

For external first-mile dogfood runs that should clone public repositories and avoid target-repo package-manager policy leaks, use:

```bash
pnpm benchmark:realworld-corpus -- --config scripts/realworld-corpus.first-mile.json --cli-package @decantr/cli@<version> --out /tmp/decantr-realworld-corpus --keep-repos
```

Use the checked-in hard-mode monorepo set when ranking, route/context scale, and command timing are the question:

```bash
pnpm benchmark:realworld-corpus -- --config scripts/realworld-corpus.hard-mode.json --cli-package @decantr/cli@<version> --out /tmp/decantr-hardmode-corpus --keep-repos --budget-multiplier 1.5
```

This harness measures clone, scan, adopt, graph, task, verify, CI, resolver, freshness, unhappy-path command behavior, root-smoke vs app-scoped command classification, timing percentiles, slow-command budgets, route fallback, and stable failure categories. It is compatibility evidence, not a replacement for mutation replay or browser/runtime proof. Custom corpus configs run all candidates by default; pass `--limit` only when sampling intentionally.

For monorepos, add `projectPath` per candidate so the command matrix runs app-scoped commands such as `scan --project apps/web`, `adopt --project apps/web`, `task --project apps/web`, and `verify --project apps/web`. The harness preflights missing project paths as `missing_project_scope` before running the full matrix. Always keep a root-level smoke first when candidate ranking is part of the question.

Failure categories should stay stable across public reports:

- `setup_friction`: clone/install/package-manager/service setup issues outside Decantr's command contract.
- `missing_project_scope`: monorepo root or bad project-path selection issues.
- `route_context_failure`: route discovery, route activation, task context, or graph route-context failures.
- `decantr_command_failure`: Decantr command failures not covered by a narrower class.
- `runtime_proof_gap`: browser, screenshot, Playwright, base URL, or runnable-app setup gaps.

## Edit History

Each benchmark app should receive a synthetic AI edit history of 20 to 50 commits or replay steps.

The edit set should include:

- benign feature additions
- route layout changes
- component reuse drift
- token/style drift
- behavior-obligation drift
- runtime or route-document failures
- at least one repair loop after a detected finding

Every step should record the prompt, changed files, command sequence, findings, repair plan, and verification result. Prompts may be summarized in public reports, but raw private prompts should stay out of upload-safe artifacts.

## Evidence Artifacts

Minimum artifacts per app:

- `decantr.essence.json`
- `.decantr/context/pack-manifest.json`
- `.decantr/graph/graph.snapshot.json`
- `.decantr/graph/graph.manifest.json`
- `.decantr/graph/graph.diff.json`
- `.decantr/graph/contract-capsule.json`
- `.decantr/evidence/latest.json`
- Project Health JSON or Markdown

Optional artifacts:

- runtime probe payload
- visual manifest
- screenshots
- health baseline and baseline diff
- repair prompts
- benchmark transcript

Artifact paths should be project-relative in public summaries. Absolute paths, source excerpts, secrets, environment values, and raw screenshots stay local unless explicitly redacted and approved.

## Metrics

Track these metrics for every run:

- adoption success
- route coverage
- shell classification precision
- graph freshness
- source artifact count and capsule truncation status
- finding count by severity and diagnostic code
- graph-anchor coverage
- repair-plan coverage
- runtime probe pass rate
- visual artifact coverage
- false positive count after manual review
- fixed-after-repair count
- replay determinism across repeated runs
- command p50/p95/max duration and slow-command count against the configured budget
- root-smoke vs app-scoped command counts

Score proof apps with the smallest useful scale:

- `A`: repeatable detection and repair evidence across the intended drift classes
- `B`: useful detection with minor precision or coverage gaps
- `C`: partial evidence, manual interpretation required
- `D`: benchmark does not prove the intended governance loop

## Runtime And Visual Probes

Runtime probes should prefer local build artifacts first. Browser and visual probes are opt-in and should state their setup requirements.

Probe outputs should use `runtime-probe-payload.v2.json` once runtime implementation emits v2. Before then, store v1 Project Health and audit artifacts with enough metadata to reproduce the run.

Visual evidence should start narrow:

- route screenshot capture
- screenshot hashes
- route render failures
- viewport metadata
- obvious blank or overflow checks where feasible

Element-level layout comparison and screenshot diff thresholds belong in later benchmark waves.

## Pass Conditions

A release-quality proof run must show:

- at least five apps with replayable artifacts
- at least three drift classes detected
- at least one visual drift case with local evidence
- at least one repair loop that resolves or reduces a finding
- schema-valid Evidence Bundle output
- no source upload requirement

## Non-Goals

The benchmark is not a design contest, generic scaffold leaderboard, visual regression service, hosted source-ingestion pipeline, or replacement for project-owned tests. It exists to prove that Decantr can keep AI edits coherent, auditable, and repairable inside real app standards.
