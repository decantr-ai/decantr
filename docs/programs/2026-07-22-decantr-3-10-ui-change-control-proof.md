# Decantr 3.10 UI Change Control Proof

**Status:** active implementation program; Decantr 3.10 is unreleased
**Frozen:** 2026-07-22
**Current stable baseline:** Decantr 3.9.4
**Release lane:** direct stable only; no RC or `next` lane

## Decision

Decantr 3.10 must prove one narrow claim:

> Decantr gives AI coding agents more accurate project authority before a UI change and produces measurably better, safer UI outcomes afterward.

This replaces the broader assumption that more corpus content, generated governance files, route inventory, or product surface automatically makes an agent more effective. Frontier models already read repositories, use tools, inspect screenshots, and follow local instructions well. Decantr earns a place only when an external authority and evidence layer materially improves those outcomes without excessive context, cost, or workflow burden.

The primary product loop is:

1. **Observe** project-owned UI authority.
2. **Prepare** a compact change-scoped context capsule.
3. **Verify** the resulting diff against that authority and runtime evidence.
4. **Report** typed, reproducible evidence.

Routes remain evidence, but they are not the product ontology. The governed UI surface includes routes, layouts, components, stories, overlays, flows, packages, and runtime states.

## Product Boundary

Active investment in 3.10 is limited to:

- `@decantr/verifier` and framework authority adapters;
- `@decantr/cli` for `scan`, `task`, and `verify`;
- the existing eight-tool MCP server with compatible tool identities;
- local-first evidence, CI integration, and deterministic policy packs;
- additive evolution of `AdoptionTruthV1` and `TaskCapsuleV1`.

The following surfaces remain compatible but receive no feature investment in 3.10:

- `@decantr/css`;
- `@decantr/vite-plugin`;
- registry publishing, login, logout, and community discovery;
- greenfield themes, blueprints, and generic corpus expansion;
- telemetry product work;
- Studio and showcase expansion;
- hosted cross-repository intelligence.

Normal CLI help must stop presenting those legacy surfaces as the product. Existing 3.x scripts continue to resolve silently. Package consolidation or removal is a 4.0 decision after the proof result.

## Frozen Corpus

The machine-readable corpus is [`scripts/benchmark-3-10/corpus.json`](../../scripts/benchmark-3-10/corpus.json). It pins 28 public repositories by full commit, branch, license, framework stratum, selected app root, and corpus acquisition partition.

The corpus intentionally retains current failures. A repository is never removed because Decantr reports it as unsupported, chooses the wrong monorepo target, finds no routes, misses components, misidentifies styling authority, or cannot run the host build.

Eighteen repositories carry development corpus labels and ten carry qualification corpus labels. Those labels record corpus acquisition and do not determine the benchmark's task partition or task kind. Repository identities were observed during the 3.9.4 Day-0 audit, so this is not a repository-blind holdout. Qualification task solutions and evaluator oracles remain sealed. Every published result must state this contamination limitation. A future independent external holdout is required before making a general industry-wide claim.

Repositories are cloned for evaluation only. Their source is never copied into the Decantr repository or published artifacts. AGPL projects remain test targets; Decantr does not redistribute modified copies.

## Task Construction

The benchmark contains 40 UI change tasks:

- one repository-authentic change for each of the 28 corpus repositories;
- 12 adversarial tasks covering component reuse, styling authority, surface scope, overlays, monorepo isolation, accessibility, and runtime state.
- 24 development tasks and 16 sealed qualification tasks, independently of the corpus's 18/10 acquisition labels.

Repository-authentic tasks are derived from real repository changes. Every sealed qualification task's expected change is later than the independent `2026-05-01T23:59:59Z` qualification embargo and both locked models' official knowledge cutoffs: 2026-02-16 for GPT-5.6 Sol and 2026-01-31 for Claude Fable 5. The May embargo is a conservative contamination buffer, not a vendor-reported cutoff. Each task is reset to the parent commit and the prompt is rewritten without PR numbers, solution links, filenames that reveal the patch, or hidden evaluator details.

A task reconstructs a historical change, while its corpus binding identifies the later pinned source used by the program. Its historical base commit and project path may therefore legitimately differ from the corpus pin and selected app path. Both pairs must be bound explicitly, and Git lineage and tree identity must be verified; forcing them to be equal would corrupt valid historical tasks.

Before implementation work uses a task, its owner freezes:

- base and expected commits;
- user-facing prompt;
- allowed and forbidden paths;
- expected interactions and states;
- screenshot and accessibility expectations;
- approved policy card;
- authority oracle;
- hidden functional and governance evaluators;
- host install, build, test, and runtime commands.

The public qualification index contains only opaque IDs and canonical SHA-256 bindings. Detailed qualification task, repository, prompt, expected-change, and oracle data stays in the private bundle and outside every agent workspace. A failure-driven implementation change invalidates that qualification task and requires a newly selected replacement.

The 40 task candidates and their 24/16 partition are frozen, but candidate records alone are not runnable benchmark manifests. Every runnable task additionally requires an independently approved delivery target, candidate-independent evaluator and oracle-source binding, reviewed historical environment spec, locked Linux runtime profile, and prepared dependency-tree attestation. Any missing link keeps execution closed.

## Environment Gate

Every task binds its exact historical Linux x64 runtime, package-manager version, lockfiles, fixed preparation commands, and clean-worktree requirement. Runtime profiles are deduplicated into a matrix, built from immutable base-image digests, published to repository-scoped GHCR, pulled back by an exact registry-manifest reference, and self-checked for exact Docker config digest, runtime, package manager, controller, browser, and evaluator-lock identity. Qualification receives package read permission only. The matrix cannot lock until all 40 task environment reviews and all profile probes pass; publishing a profile is infrastructure preparation, not product-value evidence.

Preparation runs before benchmark timing in a credential-free container whose network is operator-restricted to the dependency registry. It emits an attestation for the reviewed spec, runtime matrix, benchmark image, Git base, lockfiles, preparation steps, and installed dependency tree. The run plan binds the locked matrix bytes; every run verifies its attestation and dependency tree before model execution and again after evaluation. A free-form environment hash, draft matrix, modified ignored dependency, or arm-specific preparation is invalid evidence.

## Evaluator Qualification Gate

An authored evaluator cannot become a runnable task merely because it parses or passes on a maintainer workstation. The authoring step emits only a content-bound prequalification seal. An optional host probe may help diagnose the evaluator, but its result is explicitly non-materializable.

Materializable qualification requires an external GitHub-hosted Linux run at the exact committed controller revision. The run must verify an immutable sealed input closure, hydrate base and expected workspaces from content-addressed Git object packs into a disjoint workspace root, prepare both roles in the locked profile, execute the evaluator with no evaluation network or writable source overlay, retain exact result and isolation evidence, and create a GitHub OIDC provenance attestation for the execution record. Finalization verifies that provenance offline against the exact repository, workflow, source commit, source ref, predicate type, and GitHub-hosted-runner policy. The receipt binds the canonical request and manifest file/self digests, execution attestation, controller closure, evaluator-source closure, runner commit, and provenance bundle through materialization, run planning, every run record, and the release audit.

Qualification source and oracle bytes must never enter either model arm or the public repository. The public development producer and private qualification producer use pinned, one-day fallback GitHub Actions artifacts and are accepted only when the consumer run matches the repository, workflow, dispatch event, successful `main` commit, and exact source SHA. Maintainer automation must archive and verify every input, qualification, and prepared-workspace artifact locally, then delete the GitHub copy before dispatching the next task. Split-run staging verifies one paired content binding and emits physically separate agent-safe and evaluator-only artifacts. The evaluator artifact is downloaded only after the signed agent subject is verified. Private execution must remain inside `decantr-ai/decantr-qualification-private`; this mechanism still requires a hosted end-to-end exercise after current runtime images and tasks materialize.

## Day-0 Discovery Gate

Before model A/B runs, Decantr must pass an automatic authority audit against human-approved oracles:

- select the correct app root or report unsupported for all 28 repositories;
- never promote tests, stories, fixtures, mocks, generated files, build outputs, or sibling apps to production authority;
- correctly label route, surface, component, and styling evidence independently;
- rank the correct implementation source first whenever it claims a task is ready;
- use only `ready`, `limited`, `blocked`, or `unsupported` as primary readiness language;
- never let a numeric score or aggregate fit label conceal an unresolved axis.

The original Angular failure is a release-blocking regression target: test navigation metadata must not outrank the production `routes.ts` graph, and a Tailwind dependency must not outrank PrimeNG, Angular builder styles, or SCSS authority.

The current candidate Day-0 rerun reports 17 `ready`, 11 `limited`, and zero `blocked` or `unsupported` targets. That is a scanner/discovery diagnostic on the pinned corpus. It is not the human-oracle Day-0 gate, a task-outcome result, or evidence that Decantr improves model performance.

## A/B Design

The control arm receives the frontier model, repository-native instructions, existing Storybook or design-system evidence, tests, and a concise approved policy card.

The treatment arm receives the same information entitlement and tools, delivered through Decantr task context and Decantr verification. Decantr may compress, rank, cite, or validate evidence; it may not receive extra human facts.

The frozen model lock is [`scripts/benchmark-3-10/models.json`](../../scripts/benchmark-3-10/models.json):

- OpenAI `gpt-5.6-sol`, whose official page documents a 2026-02-16 knowledge cutoff;
- Anthropic `claude-fable-5`, whose official model documentation reports a January 2026 cutoff, locked by this program as 2026-01-31.

The provider-returned model identifier is recorded for every run. A fallback, routed substitute, or identifier mismatch is a visible failure and is not pooled with the requested model.

The full design is 40 tasks x 2 models x 2 arms x 2 repetitions = 320 runs. Repetitions are averaged within each task and are not counted as independent samples. Only sealed qualification tasks contribute to confirmatory release-gate estimates; development tasks are tuning and power-pilot evidence. At least 16 qualification tasks are required, and the paid qualification run cannot start until a frozen development pilot demonstrates at least 80% power to detect the predeclared five-point effect. Every run starts from a fresh copy of the attested workspace in the task's locked non-root Linux profile, with an empty home directory, no host secrets, no personal skills, no personal MCP configuration, no model memory, and no network except an audited model proxy. Dependencies and browser binaries are installed and attested before timing begins. Release evidence must execute the agent and hidden evaluator in externally attested, separate stages. The agent stage must use a dedicated minimal immutable image with no evaluator code or contracts, expected revisions or patches, qualification controllers, oracle sources, private task manifests, or hidden-review material. Its workspace and trajectory are content-addressed before the separately attested evaluator stage receives sealed inputs. The current host runner and benchmark image are test-only and cannot satisfy this requirement.

The benchmark agent must not receive the Decantr engineering or release-engineering skills in either arm.

## Evaluation

Hidden evaluation combines:

- functional and host tests;
- DOM and interaction behavior;
- visual fidelity;
- accessibility;
- component reuse;
- project token and styling authority;
- changed-file scope and forbidden edits;
- first-read and target-selection accuracy;
- agent self-report accuracy;
- clean install and host build status.

Two independent frontend reviewers score each result while blinded to model and arm. Disagreements are adjudicated before labels are revealed. Missing evaluators, build failures, unsupported targets, and model substitutions stay in the denominator.

The predeclared statistical and release gates live in [`scripts/benchmark-3-10/protocol.json`](../../scripts/benchmark-3-10/protocol.json). The primary gate requires at least a five-point paired treatment lift on a 100-point rubric with the 95% confidence interval above zero separately for each model. Governance violations must fall by at least 25%, and functional success must be non-inferior within five percentage points overall for each model. Blinded preference is aggregated by strict repetition majority into 32 qualification task/model units; at least 26 must be decisive, treatment must win at least 60% of decisive units, and the two-sided 95% Wilson lower bound must exceed 50%. Median treatment token/cost overhead must remain at or below 15%. Framework strata are reported but cannot become independent release claims unless their sample sizes are separately powered.

## Cost And Authorization

Per-run model cost is capped at $10 for GPT-5.6 Sol and $16 for Claude Fable 5. The predeclared worst-case model spend is $4,160; reviewer labor and compute are separate.

Official provider pricing was reviewed and locked on 2026-07-22 in [`scripts/benchmark-3-10/model-proxy/pricing.json`](../../scripts/benchmark-3-10/model-proxy/pricing.json). That pricing review is not spending authorization. Harness construction, local Day-0 evaluation, and dry-run validation do not authorize paid model execution. The 320-run experiment requires an audited external adapter, explicit human budget approval bound to the candidate and run plan, and configured provider credentials. A runner must stop before the first paid request when approval evidence is absent.

## Current Evidence State

As of 2026-07-24, the no-cost harness tests pass, but the experiment is not runnable and no value result exists:

- all 28 corpus repositories and the 24/16 task partition are frozen;
- all 40 evaluator specs and all 40 task environment specs have explicit sole-maintainer approval; this is not independent blinded outcome review;
- all 26 dual-image runtime profiles passed GitHub-hosted run `30116606965` from source commit `30e37b79e2f1acf1f2d264d173d9411cd313faf0`; retained v3 attestations bind both image roles and the independently reverified locked matrix has digest `def6deb33d7b9d523f3c4c416e623e4082a8c5ec530946571e9cc07bfdd56c1a`;
- no external container-qualified evaluator receipt has been retained;
- the candidate Day-0 scanner report is 17 `ready` and 11 `limited`, and the sole maintainer approved the 28-repository authority oracle; the final frozen candidate must still pass that audit;
- exact-model OpenAI and Anthropic adapters and a credential-owning audited proxy exist, but no candidate tarball set, budget approval, configured benchmark credential, provider run, blinded review, power pilot, or qualification statistic exists;
- the GitHub-hosted split-stage agent/evaluator workflow, dual provenance subjects, v3 run records, and release re-verification are implemented and pass no-cost local tests, but no hosted signed model run exists;
- public and repository-gated private evaluator-input production now share one committed, data-free controller; sealed private candidates and oracles remain only in the private repository. Disjoint short-lived split artifacts and one-shot per-run hosted reservation exist, but the hosted run-materialization packet producer is still missing and no path has been exercised end to end with materialized split-run inputs.

These are blockers, not administrative TODOs. A test-green harness proves only harness mechanics.

## Release Rule

3.10 is a direct stable release only. Candidate packages are built once, content-addressed, and frozen before the 320-run experiment. No implementation change is allowed after the candidate experiment begins.

- **Pass:** publish 3.10 with the measured, bounded claim.
- **Mixed:** publish only narrower framework/task claims whose predeclared gates pass, and narrow the product accordingly.
- **Fail:** do not claim value proof. Reduce Decantr to the verifier, authority-adapter, and CI layer, or stop broad expansion.

This is falsification, not sabotage. No repository, package, service, release, or historical evidence is automatically deleted by a failed benchmark.

## Documentation Reset

Before release, the root and package READMEs, CLI help, MCP metadata, docs homepage, docs navigation, `docs/llms.txt`, active reference and security documentation, `CLAUDE.md`, `DECANTR.md`, repository harness skill, personal Decantr engineering skill, and release skill must describe the same narrow product and proof boundary.

The docs deployment must publish from one release manifest and verify the deployed content hash. A successful Pages workflow that serves stale release copy is a failed deployment.
