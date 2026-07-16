# Decantr 3.9 Maintenance Policy

Date: 2026-07-16

Status: Prepared for the Decantr 3.9 line. This policy becomes the active patch boundary only after 3.9.0 is qualified, published, verified, and closed out. Until then, the 3.9.0 release gate in `release-stewardship.md` remains authoritative.

## Compatibility Boundary

Decantr 3.9 defines Governed Change Proof for existing coding agents. It keeps the product local-first and stack agnostic while connecting one selected application to canonical adoption truth, bounded task context, and deterministic change evidence.

The 3.9 compatibility boundary is:

- `@decantr/content` owns official corpus types, clients, resolution, ranking, wiring, schemas, and provenance.
- `@decantr/registry` is a thin Decantr 3.x facade; documented imports, schemas, client aliases, CLI registry aliases, `REGISTRY_URL`, and MCP `decantr_registry` remain compatible.
- `@decantr/verifier` owns `AdoptionTruthV1`, `TaskCapsuleV1`, `GovernanceDeltaV1`, and `decantr-ci-report.v3`.
- Existing v2 machine reports and CI behavior remain the default throughout 3.9.x. CI v3 requires explicit `--report-version v3` selection.
- Studio reads current state or supported project-mode report artifacts and recomputes in memory. It does not write project files, run commands, invoke agents, or upload source.
- MCP retains the existing server identity, stdio transport, eight tool names, and action compatibility. No ninth content tool exists.
- Essence V4 remains the active contract. `@decantr/css` remains a legacy optional adapter, not a default adoption path.

## Allowed Patch Work

- Correct behavior that contradicts a documented 3.9 contract or compatibility invariant.
- Fix security, privacy, package-permission, dependency, or path-containment defects.
- Restore support for documented host frameworks, routers, package managers, or monorepo selection.
- Correct adoption-truth, task-capsule, governance-delta, CI v3, Studio rendering, content provenance, or facade defects without changing their public meaning.
- Improve deterministic evidence, qualification harnesses, docs, package metadata, or release automation needed to prove an existing contract.
- Add narrowly scoped discovery support when it uses the shared verifier substrate and preserves calibrated confidence and limitations.

## Not Allowed In 3.9.x

- Making CI v3 automatic or changing existing v2 schema IDs, required fields, enums, or exit semantics.
- Adding a package, CLI command, MCP tool/alias, hosted control plane, account system, marketplace, source upload, or default telemetry endpoint.
- Removing or breaking `@decantr/registry`, `decantr registry ...`, `REGISTRY_URL`, or MCP `decantr_registry` compatibility.
- Giving Studio write endpoints, command execution, agent invocation, provider posting, baseline saving, or source upload behavior.
- Expanding `@decantr/css`, making it a default, or emitting Decantr CSS vocabulary into contract-only/style-bridge projects.
- Changing Essence V4 or silently replacing accepted project-owned local law during content refresh, sync, upgrade, or pack compilation.
- Treating discovery as governance, planned writes as completed mutations, inherited debt as new debt, or missing evidence as a passing empty delta.
- Claiming runtime, visual, ecosystem-wide, latency, precision, recall, or adoption results beyond retained evidence.

Work outside these boundaries requires an explicit successor program or major-version decision, not a 3.9 patch.

## Patch Gate

Every 3.9 patch must:

1. Name the shipped contract or regression it corrects.
2. Add focused coverage at the owning layer and preserve v2 default goldens where applicable.
3. Build, test, and pack every affected package plus its dependency closure.
4. Run package-surface, package-permission, schema-copy, docs-drift, and public-link audits.
5. Run `pnpm audit:packed-content-facade` when content, registry, API client, schema, environment alias, or dependency ownership changes.
6. Prove the exact eight-tool MCP inventory when MCP or shared task/project contracts change.
7. Snapshot the workspace before and after Studio routes when Studio or shared verifier reads change.
8. Run the relevant packed and public adoption lanes from `post-publish-adoption-proof.md`.
9. Run release verification and closeout after publication before describing the patch as complete.

Changes to filesystem, network, process execution, telemetry, hosted upload, browser evidence, MCP writes, or package `files` must also update `config/package-permissions.json`, regenerate the security-permissions reference, and pass `pnpm audit:package-permissions`.

## Qualification Claims

The committed 3.9 qualification packet remains the source of truth for quantitative claims. Structural lint is not qualification:

```bash
pnpm audit:3-9-qualification:lint
pnpm audit:3-9-qualification
```

The default command must fail closed on missing human identities, adjudication, replay artifacts, exhaustive route candidates, confusion matrices, or write-boundary evidence. A patch may preserve an already qualified corpus and replay it, but it must not tune or relabel the frozen evidence after inspecting candidate output.

## Release Closeout

Publishing, tagging, dist-tag changes, GitHub Releases, announcements, and infrastructure changes still require explicit authorization. A merged patch is not a completed release until these commands pass for the actual package wave:

```bash
pnpm release:verify
pnpm release:closeout -- --version X.Y.Z
```
