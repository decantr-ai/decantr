# Decantr Docs

Decantr is an **agent-neutral UI change-control layer**. It observes project-owned authority, prepares change-scoped context, verifies an agent's diff, and reports typed evidence.

**Decantr 3.9.4 is the current published stable release. Decantr 3.10 is an active proof program and is neither released nor value-proven.**

The 3.10 no-cost harness and dual-signed split-stage design are testable, but the experiment is not yet runnable. All 40 evaluator specs, all 40 environment specs, and the 28-repository Day-0 oracle have explicit sole-maintainer approval. The former single-image runtime evidence is superseded: all 26 profiles must now be rebuilt and attested with separate evaluator and evaluator-free agent images before the matrix can lock. No external container-qualified evaluator receipt, hosted split-stage run, frozen candidate tarball set, paid model result, or independent blinded outcome review exists. See the active program for the full evidence ledger.

The unreleased 3.10 candidate loop is:

1. **Observe** the selected app and its UI authority.
2. **Prepare** compact context for a specific change.
3. **Verify** the resulting diff and available runtime evidence.
4. **Report** reproducible results for people, agents, and CI.

The approved 3.10 model treats routes, layouts, components, stories, overlays, flows, packages, and runtime states as UI surfaces. Selected-app authority, surface authority, topology completeness, taskability, component inventory, styling authority, and runtime evidence remain independent. A score or component count cannot hide an unresolved axis.

## Start Here

- [Existing app adoption](guides/existing-apps.md): shipped 3.9.4 read-only scan, one-time attach, route-backed task preparation, verification, and CI, with candidate behavior labeled separately.
- [AI assistant setup](guides/ai-assistant-setup.md): model-neutral CLI and MCP integration without duplicate instruction files.
- [Workflow model](reference/workflow-model.md): shipped 3.9.4 behavior, the unreleased Observe -> Prepare -> Verify -> Report candidate, authority order, and local-first boundaries.
- [Command surface](reference/command-surface.md): the shipped route-backed workflow, unreleased candidate additions, and callable advanced/compatibility commands.
- [FAQ](faq.md): status, product boundary, evidence, CI, MCP, Greenfield, CSS, registry, and benchmark questions.
- [Security and permissions](reference/security-permissions.md): installed-package filesystem, network, process, telemetry, and MCP behavior.
- [Published schemas](https://decantr.ai/schemas/): current public wire contracts.

## Current Program And Evidence

- [Decantr 3.10 UI Change Control Proof](programs/2026-07-22-decantr-3-10-ui-change-control-proof.md): active implementation and falsification boundary.
- [Decantr 3.10 exploratory adoption evidence](benchmarks/2026-07-24-decantr-3-10-exploratory-adoption-evidence.md): five external Brownfield targets, one generated Greenfield control, the 28-repository scanner rerun, and hosted runtime-profile evidence. This is deterministic development evidence, not model-lift proof.
- [Decantr 3.9.4 Day-0 Authority Baseline](benchmarks/2026-07-22-decantr-3-9-4-day-zero.md): 28-repository scanner baseline. A parseable scan is explicitly not a correctness result.
- [Decantr 3.9 Governed Change Proof program](programs/2026-07-16-decantr-3-9-adoption-proof-program.md): historical program for the current published line.
- [Decantr 3.9.4 release note](releases/2026-07-21-decantr-3-9-4-tailwind-source-isolation.md): current stable release history.

The 3.9 route/source and machine evidence lanes are complete. The two-human finding lane is not. The sole-maintainer publication waiver does not establish human precision, recall, release qualification, adoption proof, or model-outcome improvement.

## Active Reference Areas

- `guides/`: user workflows for existing apps, monorepos, assistants, CI, graph context, and contracts.
- `reference/`: current command, workflow, report, security, Project Health, package, MCP, and API contracts.
- `schemas/`: public schema copies and the schema index.
- `runbooks/`: release, deployment, and operational verification procedures.
- `programs/`: approved programs. Only the explicitly active 3.10 program describes current direction.
- `benchmarks/`: measured or diagnostic evidence with its original limits.

## Compatibility And Historical Areas

Greenfield blueprints, themes, Studio, showcase, broad content-corpus workflows, telemetry, registry-named commands, and `@decantr/css` remain documented where they are still callable in 3.x. They are advanced, compatibility, or historical surfaces, not the 3.10 product lead.

Retain dated material under `releases/`, `audit/`, `benchmarks/`, `programs/`, `research/`, `specs/`, and `architecture/decisions/` as historical evidence. A dated document records the claim and architecture at that time; it does not silently become current product truth.

Pre-reset material under `archive/` is reference-only. Registry portal deployment material is historical after the public portal retirement. The Fly content API is an optional reference helper, not the authority for a local codebase.

## Working Rule

When documentation conflicts, use this order:

1. shipped package behavior and published schemas for 3.9.4;
2. active files under `guides/` and `reference/` for current usage;
3. the active 3.10 program for intended, not-yet-released behavior;
4. dated release, benchmark, audit, program, research, and specification files as historical evidence.

Do not describe 3.10 as released or value-proven until the frozen candidate passes the declared Day-0 and 320-run A/B gates.
