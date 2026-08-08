# Decantr Docs

Decantr is an **agent-neutral UI change-control layer**. It observes project-owned authority, prepares change-scoped context, verifies an agent's diff, and reports typed evidence.

**Decantr 3.11.2 is the current stable release. Its default entry point is zero-setup Changed-UI Assurance: run `decantr verify` in a Git worktree to inspect only the current UI change with zero writes.**

The default report returns `pass`, `attention`, or `not_proven`, with at most three consequential findings tied to exact changed source and repair targets. It selects one changed app only when that choice is provable. Adoption, generated context, an account, and the hosted content API are not prerequisites. [Read the contract](reference/change-assurance.md).

The separate 3.10 model-lift harness and dual-signed split-stage design are testable, but the frozen experiment is not yet runnable. All 40 evaluator specs, all 40 environment specs, and the 28-repository Day-0 oracle have explicit sole-maintainer approval. All 26 dual-image runtime profiles passed GitHub-hosted run `30577939983` with exact retained-evidence retries from source commit `cfcb849454d68f2e9b8ff91fdf6b22751eb016cd`; their v3 attestations are independently reverified in locked matrix `ce55618610740db332d19c6314f78d0141f440bc5ca04ec79698b3359d6c93bc`. Repair commit `98e92472` closes one oracle-assisted Next.js adoption failure but is not a control/treatment result. No complete current-head 40-task evaluator receipt set, paid model result, or independent blinded outcome review exists. These are research-claim gaps, not product publication blockers. See the research program for the full evidence ledger.

The deeper product loop remains:

1. **Observe** the selected app and its UI authority.
2. **Prepare** compact context for a specific change.
3. **Verify** the resulting diff and available runtime evidence.
4. **Report** reproducible results for people, agents, and CI.

The 3.10 authority model remains the foundation beneath 3.11: routes, layouts, components, stories, overlays, flows, packages, and runtime states are UI surfaces. Selected-app authority, surface authority, topology completeness, taskability, component inventory, styling authority, and runtime evidence remain independent. A score or component count cannot hide an unresolved axis.

## Start Here

- [Change Assurance](reference/change-assurance.md): the default 3.11 zero-write, Git-scoped verification contract.
- [Existing app adoption](guides/existing-apps.md): optional scan, attachment, authority-aware task preparation, full Project Health, and CI.
- [AI assistant setup](guides/ai-assistant-setup.md): model-neutral CLI and MCP integration without duplicate instruction files.
- [Workflow model](reference/workflow-model.md): shipped Observe -> Prepare -> Verify -> Report behavior, authority order, and local-first boundaries.
- [Command surface](reference/command-surface.md): the shipped authority-aware workflow and callable advanced/compatibility commands.
- [FAQ](faq.md): status, product boundary, evidence, CI, MCP, Greenfield, CSS, registry, and benchmark questions.
- [Security and permissions](reference/security-permissions.md): installed-package filesystem, network, process, telemetry, and MCP behavior.
- [Published schemas](https://decantr.ai/schemas/): current public wire contracts.

## Current Program And Evidence

- [Decantr 3.11.2 route-authority hardening](releases/2026-08-08-decantr-3-11-2-route-authority-hardening.md): current stable delivery patch for TanStack, Astro, and Angular authority/task resolution.
- [Decantr 3.11.1 MCP metadata patch](releases/2026-08-07-decantr-3-11-1-mcp-metadata-compatibility.md): corrected directory metadata packaged with `@decantr/mcp-server`.
- [Decantr 3.11.0 Changed-UI Assurance release](releases/2026-08-07-decantr-3-11-0-changed-ui-assurance.md): original 3.11 delivery release.
- [Decantr 3.11 qualification evidence](research/2026-08-07-decantr-3-11-change-assurance-trials.md): nine disposable repositories plus one real Brownfield replay, with explicit evidence limits.
- [Decantr 4.0 entry criteria](reference/decantr-4-entry-criteria.md): proof and migration gates; 4.0 is not scheduled.
- [Decantr 3.10.0 authority-model release](releases/2026-08-07-decantr-3-10-0-authority-aware-ui-change-control.md): foundation retained in 3.11.
- [Frontier-model lift research program](programs/2026-07-22-decantr-3-10-ui-change-control-proof.md): separate causal-claim and falsification boundary.
- [Decantr 3.10 Culinary Platform clean-slate adoption](benchmarks/2026-08-07-culinary-platform-clean-slate-adoption.md): the failed Next.js authority gate, repair commit, negative controls, bounded task, native verification, and responsive browser replay. This is oracle-assisted development evidence, not model-lift proof.
- [Decantr 3.10 exploratory adoption evidence](benchmarks/2026-07-24-decantr-3-10-exploratory-adoption-evidence.md): five external Brownfield targets, one generated Greenfield control, the 28-repository scanner rerun, and hosted runtime-profile evidence. This is deterministic development evidence, not model-lift proof.
- [Decantr 3.9.4 Day-0 Authority Baseline](benchmarks/2026-07-22-decantr-3-9-4-day-zero.md): 28-repository scanner baseline. A parseable scan is explicitly not a correctness result.
- [Decantr 3.9 Governed Change Proof program](programs/2026-07-16-decantr-3-9-adoption-proof-program.md): historical program for the previous published line.
- [Decantr 3.9.4 release note](releases/2026-07-21-decantr-3-9-4-tailwind-source-isolation.md): previous stable release history.

The 3.9 route/source and machine evidence lanes are complete. The two-human finding lane is not. The sole-maintainer publication waiver does not establish human precision, recall, release qualification, adoption proof, or model-outcome improvement.

## Active Reference Areas

- `guides/`: user workflows for existing apps, monorepos, assistants, CI, graph context, and contracts.
- `reference/`: current command, workflow, report, security, Project Health, package, MCP, and API contracts.
- `schemas/`: public schema copies and the schema index.
- `runbooks/`: release, deployment, and operational verification procedures.
- `programs/`: approved historical and research programs. Active product behavior belongs in current guides, references, and release notes.
- `benchmarks/`: measured or diagnostic evidence with its original limits.

## Compatibility And Historical Areas

Greenfield blueprints, themes, Studio, showcase, broad content-corpus workflows, telemetry, registry-named commands, and `@decantr/css` remain documented where they are still callable in 3.x. They are advanced, compatibility, or historical surfaces, not the 3.11 product lead.

Retain dated material under `releases/`, `audit/`, `benchmarks/`, `programs/`, `research/`, `specs/`, and `architecture/decisions/` as historical evidence. A dated document records the claim and architecture at that time; it does not silently become current product truth.

Pre-reset material under `archive/` is reference-only. Registry portal deployment material is historical after the public portal retirement. The Fly content API is an optional reference helper, not the authority for a local codebase.

## Working Rule

When documentation conflicts, use this order:

1. shipped package behavior and published schemas for 3.11.2;
2. active files under `guides/` and `reference/` for current usage;
3. the active model-lift research program for experimental protocol and claim boundaries;
4. dated release, benchmark, audit, program, research, and specification files as historical evidence.

Describe 3.11.2 as released only after package closeout passes. Do not describe it as value-proven until the separate frozen A/B research gates pass.
