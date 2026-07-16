# Decantr 3.9 Governed Change Proof Program

Date: 2026-07-16

Status: Approved implementation program for the Decantr 3.9 line. The shipped baseline is Decantr 3.8.3 until 3.9.0 publication and closeout. Requirements and target behavior below are not shipped behavior until public package verification proves them.

## Program Decision

Decantr 3.9 will prove a governed change from project selection through task context and verification without expanding the product into an agent, marketplace, or hosted control plane.

The release will:

- use Decantr 3.8.3 as the compatibility and performance baseline
- move first-party production code from registry-owned internals to `@decantr/content`, while retaining registry-named 3.x compatibility surfaces
- make `@decantr/verifier` the sole owner of `AdoptionTruthV1`, `TaskCapsuleV1`, and `GovernanceDeltaV1`
- keep existing v2 machine reports as the default throughout 3.9.x
- expose the new CI contract only through explicit v3 selection
- keep Studio read-only with respect to project files, contracts, baselines, source, and external automation
- keep exactly the existing eight MCP tools
- add no npm package and no CLI command
- machine-qualify unpublished packed artifacts and then publish straight to stable `3.9.0`, with no RC, `next`, or `candidate` release

## Product Boundary

Decantr remains AI Frontend Governance: Contract, Context, Evidence, and explicit Authority for codebases changed by existing coding agents. It does not invoke an agent or own application source.

For existing applications, the governing order remains:

1. production source
2. accepted local law and an explicitly accepted style bridge
3. Essence V4 structural contract
4. official `@decantr/content` guidance

Official content is advisory until it is incorporated into project-owned law or a contract through an explicit workflow. A refresh or package upgrade must not rewrite accepted local law.

The program is complete when the same selected application and source evidence produce one canonical adoption truth, one bounded task capsule, and one reproducible governance delta across CLI, MCP, CI, and read-only Studio renderers.

## 3.8.3 Baseline

The baseline is the completed public-artifact audit in `docs/audit/2026-07-16-decantr-3-8-3-post-publish-adoption.md`, not the earlier 3.8.2 trial.

Established 3.8.3 facts:

- clean public npm installation of `@decantr/verifier@3.8.3`, `@decantr/mcp-server@3.8.3`, and `@decantr/cli@3.8.3` passed without workspace links
- the pinned two-project Brownfield matrix ran 36 commands with no unexpected failures, crashes, route misses, project-scope failures, or commit-parity failures
- the TanStack dashboard selected `src/routes/dashboard/overview.tsx` for `/dashboard/overview`
- the Bulletproof React monorepo app selected `apps/react-vite/src/app/routes/app/discussions/discussions.tsx` for `/app/discussions`
- a generated TanStack Start control preferred `src/routes/index.tsx` over `src/routes/__root.tsx` for `/`
- contract-only adoption left authored application source unchanged on the audited targets
- host builds passed, and the pristine-versus-adopted source-check comparison found no Decantr regression
- one retained corpus run observed command P50 of 304 ms and P95 of 1,132 ms; this is descriptive evidence from one run, not a percentile guarantee

The baseline does not establish runtime or visual correctness, ecosystem-wide router coverage, finding precision, finding recall, or release-grade latency percentiles. Decantr 3.9 must not claim those properties without the qualification evidence defined here.

The rollback version set for the baseline is package-specific:

| Package | Baseline version |
| --- | --- |
| `@decantr/content` | `3.8.1` |
| `@decantr/registry` | `3.8.1` |
| `@decantr/core` | `3.8.2` |
| `@decantr/verifier` | `3.8.3` |
| `@decantr/mcp-server` | `3.8.3` |
| `@decantr/cli` | `3.8.3` |

## Fixed Architecture Decisions

### 1. Verifier Owns Governed-Change Truth

`@decantr/verifier` will own the TypeScript types, JSON Schemas, validation, normalization, and builders for:

- `AdoptionTruthV1` / `adoption-truth.v1.json`
- `TaskCapsuleV1` / `task-capsule.v1.json`
- `GovernanceDeltaV1` / `governance-delta.v1.json`

The canonical schemas will ship from `@decantr/verifier/schema/*`; documentation copies must be generated or parity-checked from those files. CLI, MCP, and Studio may render or adapt these contracts but must not define competing local shapes or repeat discovery heuristics.

`@decantr/core` remains the owner of typed graph and Contract capsule primitives. `@decantr/content` remains the owner of official corpus data, content resolution, and content provenance. The verifier composes those inputs into proof contracts.

### 2. Internal De-Registry Migration

First-party production paths will use content terminology and `@decantr/content` implementations. The target governed-change/content dependency direction is below; unrelated existing dependencies are omitted:

```text
@decantr/registry -> @decantr/content
@decantr/core -> @decantr/content + @decantr/essence-spec
@decantr/verifier -> @decantr/core + @decantr/essence-spec
@decantr/cli -> @decantr/content + @decantr/core + @decantr/verifier
@decantr/mcp-server -> @decantr/content + @decantr/core + @decantr/verifier
apps/api -> @decantr/content
```

Resolver, client, ranking, wiring, content type, schema-loader, and execution-pack compatibility implementations needed by first-party consumers will live in `@decantr/content`. `@decantr/registry` will be a thin compatibility facade over those implementations.

The migration must preserve these public Decantr 3.x compatibility names:

- npm package `@decantr/registry`, including documented root, client, and schema export paths
- CLI `decantr registry ...` aliases
- `REGISTRY_URL` as a compatibility environment alias
- MCP tool `decantr_registry` and its current action names

No first-party production source under `packages/core`, `packages/verifier`, `packages/cli`, `packages/mcp-server`, or `apps/api` may import `@decantr/registry` after the migration. Deliberate compatibility tests and the facade package itself are the allowlist. `@decantr/content` must not depend on `@decantr/registry`.

This is an internal ownership migration, not removal of the compatibility package, revival of registry infrastructure, or a breaking rename.

### 3. Machine Report Compatibility

Existing v2 machine reports remain the default for all current report-producing commands in every 3.9.x release. Existing v2 schema IDs, required fields, enums, and exit semantics must not be changed to carry 3.9 data.

The only new top-level report generation in 3.9.0 is `decantr-ci-report.v3.json`:

```bash
decantr ci --json --report-version v3
decantr ci init --report-version v3 --provider github
```

Without `--report-version v3`, both `decantr ci` and generated CI remain on v2. There will be no environment variable, config migration, package-version inference, or automatic negotiation that silently selects v3. Existing generated workflows are not rewritten by package upgrade.

The v3 project report will contain the existing health evidence plus `AdoptionTruthV1` and `GovernanceDeltaV1`. V3 workspace mode will contain the same contracts per selected project plus a deterministic aggregate gate. `TaskCapsuleV1` remains a task-time contract and is not copied into CI reports.

Existing `decantr task --json` and MCP task-context fields remain available in 3.9 and will be populated from `TaskCapsuleV1`. CLI adds `taskCapsuleVersion: "task-capsule.v1"`; MCP adds `task_capsule_version: "task-capsule.v1"`. The adapters must not duplicate the capsule as a nested copy, remove current top-level fields, or semantically repurpose them.

### 4. Studio Is Read-Only

Studio may read a current project, read a saved v2 or v3 report, recompute verifier output in memory, filter findings, preview task context, and copy commands or repair prompts.

Studio must not:

- modify application source, Essence, local law, style bridges, graph artifacts, report files, ignore files, or baselines
- run adoption, repair, acceptance, migration, package-manager, build, or verification commands on behalf of the user
- invoke an agent, post to a provider, or upload source
- turn a displayed recommendation into a write endpoint

Refresh requests may recompute read-only state. Filesystem before/after snapshots must prove that Studio requests do not write to the workspace. `--report` mode must read only the supplied artifact and static Studio assets.

### 5. MCP Remains Eight Tools

The advertised and callable MCP surface must contain exactly these eight names:

1. `decantr_project`
2. `decantr_contract`
3. `decantr_context`
4. `decantr_graph`
5. `decantr_registry`
6. `decantr_verify`
7. `decantr_repair`
8. `decantr_contract_write`

No `decantr_content` ninth tool, hidden legacy tool, alias registration, or renamed server identity is permitted. New governed-change data must travel through existing actions. `decantr_registry` remains the compatibility tool name but will call content-owned implementations. Existing write actions remain explicit and path-contained under `decantr_contract_write`; the other integrations in this program do not gain mutation behavior.

### 6. Surface And Release Size Stay Bounded

The program adds no npm package and no CLI command. It may add verifier schemas, existing-command flags, existing-tool response fields, tests, fixtures, and release qualification scripts.

The expected npm release wave is:

- `@decantr/content@3.9.0`
- `@decantr/registry@3.9.0`
- `@decantr/core@3.9.0`
- `@decantr/verifier@3.9.0`
- `@decantr/mcp-server@3.9.0`
- `@decantr/cli@3.9.0`

`@decantr/essence-spec`, `@decantr/css`, `@decantr/telemetry`, and `@decantr/vite-plugin` are not to be changed or version-bumped solely for alignment. The release tooling remains authoritative for the final changed-package dependency closure.

## Canonical Contracts

### AdoptionTruthV1

`AdoptionTruthV1` answers what Decantr selected, what evidence supports that selection, what is governed, what was changed, and what remains outside Decantr ownership.

Required information:

- schema version and generation metadata
- workspace root, selected application root, and project selection reason
- package-manager evidence from the workspace scope and app facts from the selected app scope
- framework, language, route, component, styling-authority, assistant-rule, and contract facts
- independent observation (`found`, `not_found`, `unknown`, `unsupported`), governance (`governed`, `partial`, `advisory`, `uncovered`, `not_applicable`), and mutation (`created`, `updated`, `untouched`, `not_checked`, `not_applicable`) axes for every surfaced fact
- confidence and source provenance for every discovery claim
- governance artifacts created, updated, preserved, or absent
- all remaining initialization/adoption support writes, including `DECANTR.md`, assistant bridges, and any narrowly scoped host ignore-file entries
- application-source integrity result and any allowed non-source file changes
- explicit limitations, unsupported evidence, and one ordered next action

Invariants:

- all paths exposed to project consumers are workspace-relative unless an existing report contract explicitly requires otherwise
- a fact cannot be `governed` merely because it was discovered or mentioned by official content
- low-confidence facts carry their basis and a limitation; renderers may not upgrade the wording
- planned writes and completed writes are distinct
- CLI, MCP, CI v3, and Studio use one verifier-built value for the same project state
- direct `init` and the user-facing `adopt` workflow both retain a complete receipt when they write project files

### TaskCapsuleV1

`TaskCapsuleV1` is the compact, task-time governance input for an existing coding agent.

Required information:

- selected project, route, and task intent
- graph snapshot identity, source hash, freshness, and known limitations
- ranked implementation read targets, with the discovered route implementation first
- active authority lane and ordered applicable local law, behavior obligations, style-bridge mappings, Essence requirements, and official guidance
- content item identity, version, digest, and source for applicable official guidance
- changed-file, changed-route, graph-node, and open-finding impact
- stable finding codes and repair IDs where findings exist
- stop conditions and one exact, project-scoped verification command
- byte count, byte limit, truncation state, and omitted-item counts

The compact serialized capsule and each default CLI/MCP task payload built from it have hard limits of 12,000 canonical UTF-8 bytes and 4,000 deterministic estimated tokens. `tokenEstimateV1` is `ceil(canonicalBytes / 3)`; it is a reproducible qualification estimate, not a model-specific billing or tokenizer claim.

Truncation order is deterministic: omit full evidence bodies, lower-ranked advisory content, lower-ranked graph nodes, and extra context excerpts first. Truncation must never remove selected-project identity, the first implementation target, active authority, blocking findings, stop conditions, or the verification command. Existing `detail: "full"` diagnostics remain separate from the default capsule budget.

### GovernanceDeltaV1

`GovernanceDeltaV1` proves what a proposed change introduced relative to compatible saved evidence.

Required information:

- selected project and comparison scope
- base and current health, graph, contract, content, and source identities
- changed files, routes, graph nodes, and applicable authorities
- findings partitioned into `new`, `resolved`, `inherited`, and `unclassified`
- violated authority, stable diagnostic code, repair ID, graph anchor, and repair target for each new blocking finding
- evidence freshness, missing evidence, and limitations
- deterministic gate result and the `failOn` threshold used to compute it

Invariants:

- only stable finding identity may classify a finding across the baseline
- inherited debt remains visible but does not fail the delta gate
- resolved findings are evidence, not negative counts hidden from the report
- changed routes and nodes come from source/graph evidence, not prose inference
- comparisons across different selected apps or incompatible baseline identities are `incompatible`, not empty deltas
- a missing baseline produces `unclassified` findings and a `not_proven` delta; v3 CI must not label all current findings as new
- v3 CI does not create or update a baseline

For opt-in v3 CI, a missing, stale, or incompatible baseline is a non-passing proof result unless the caller explicitly uses `--fail-on none`. The default v2 command retains its shipped fallback semantics.

## Content Provenance And Override Rules

Official guidance used by a contract, execution pack, task capsule, or delta must identify:

- `@decantr/content` package/corpus version
- item type and slug
- item-declared version when present
- deterministic content digest
- source as bundled local corpus, local cache, or configured API

Online and offline resolution of the same official item version must produce the same identity and digest. A configured API may refresh official content, but the product must remain useful with network access denied.

Update impact is classified as:

- `advisory`: guidance changed but no accepted project law or required contract migration changed
- `migratory`: a versioned contract or stored artifact requires an explicit migration
- `behavior_affecting`: applicable verification or task guidance changed for the selected project

An accepted local rule that overrides official guidance must remain active and visible as the higher authority. Content refresh, sync, upgrade, or pack compilation must not silently replace it.

## Surface Mapping

| Existing surface | Canonical input | 3.9 requirement |
| --- | --- | --- |
| `scan`, `adopt`, `doctor` | `AdoptionTruthV1` | Agree on selected app, provenance, ownership status, limitations, and next action. Preserve each command's current human/JSON surface; where a v2 projection exists, it remains the default. |
| `task --json` | `TaskCapsuleV1` | Preserve current compatibility fields, lead with implementation source, stay within the compact budget, and emit one verify command. |
| `verify` | verifier findings and evidence | Reuse stable finding identity and current project scope; do not create a second delta implementation. |
| `ci` | `AdoptionTruthV1` + `GovernanceDeltaV1` | Emit v2 by default; emit strict `decantr-ci-report.v3` only with `--report-version v3`. |
| `ci init` | selected report version | Generate v2 workflows by default and v3 workflows only when explicitly requested. |
| Studio | verifier contracts and saved v2/v3 reports | Render and recompute read-only state; never mutate or execute repairs. |
| MCP project/context/verify/repair actions | verifier contracts | Reuse the canonical builders while preserving exactly eight tool names and existing actions. |
| `content`, `refresh`, `sync`, `upgrade` | `@decantr/content` | Preserve explicit update behavior and expose provenance without changing accepted project law. |

## Qualification Standard

### Reference Matrix

Qualification must include all of the following:

- the two Brownfield repositories and exact commits pinned in `scripts/realworld-corpus.post-publish.json`
- a generated TanStack Start application from an exact generator version recorded at qualification freeze time
- in-repo route fixtures for TanStack root/page precedence, React Router nested object/lazy routes and constants, Next routing, Vue Router object declarations, and monorepo sibling-app negative selection
- Greenfield, Brownfield contract-only, and Hybrid accepted-local-law lanes
- online and network-denied content resolution
- project and workspace CI modes
- Studio current-project, workspace, saved-v2-report, and saved-v3-report modes
- unpacked workspace tests, final-version packed npm artifacts in a clean install prefix, and public npm artifacts after publication

External refs and generator versions are frozen before measurement. Generated reports stay in `/tmp` or CI artifacts; only reviewed conclusions are committed.

### Measurement Protocol

- Run each latency gate in 30 independently initialized runs per reference target.
- Use fresh processes and fresh temporary project state; exclude host dependency installation from Decantr command latency and report it separately.
- Record OS, CPU, Node version, package-manager version, exact source ref, exact package versions, command, exit code, and raw duration for every sample.
- Compute P50 and P95 with a documented nearest-rank method; retain raw samples. Do not combine unlike commands or targets into one percentile.
- Normalize timestamps and temporary absolute paths only for determinism comparisons. Do not normalize finding IDs, project selection, ordering, hashes, or gate results.
- Freeze the human-labeled finding set before implementation work can tune against it. Use exactly 200 sampled warning/error judgments across Greenfield, Brownfield, and Hybrid targets, two reviewers, and adjudicated disagreements.
- Replay public 3.8.3 on that frozen set before measuring 3.9. Report precision, recall, sample counts, and a 95% confidence interval. Precision is a release gate; recall must be reported and may not regress by more than five percentage points from the measured 3.8.3 replay.

### Quantitative Gates

| Gate | Required result |
| --- | --- |
| Scan latency | P95 at or below 2 seconds per reference app |
| Contract-only attach | P95 at or below 10 seconds per reference app, excluding host dependency install |
| Task preparation | P95 at or below 2 seconds with a current graph |
| Task source precision | 84/84 labeled routes put the implementation source first; all 24 forbidden-source assertions reject layouts, generated trees, and sibling apps when a labeled implementation exists |
| Adoption agreement | 100% agreement on selected app and normalized `AdoptionTruthV1` across CLI, MCP, CI v3, and Studio |
| Immediate Brownfield CI | V2 reports zero new findings and v3 reports an empty new-finding delta after untouched contract-only adoption |
| Host source integrity | Zero authored application-source edits by contract-only adoption or Studio |
| Task capsule budget | Every default canonical capsule and CLI/MCP task payload is at most 12,000 UTF-8 bytes and at most 4,000 `tokenEstimateV1` tokens |
| Finding precision | The two-sided 95% Wilson lower bound is at least 0.90 for the 200 sampled warning/error findings; every emitted error is actionable |
| Finding recall | Reported and no more than five percentage points below the measured public-3.8.3 replay on the same frozen set |
| Determinism | Equal normalized contract and delta output for repeated equal inputs; deterministic array ordering |
| MCP surface | Exactly eight advertised and callable tools, with all existing action compatibility tests passing |
| V2 compatibility | All v2 defaults validate against unchanged v2 schemas and pass normalized 3.8.3 golden-output consumer tests |
| Reproducibility | Every qualification target records exact source ref, package version, environment, and command evidence |

Passing these gates does not establish runtime or visual correctness unless browser/runtime evidence was explicitly collected for the claim.

## Ordered Executable Backlog

Work must proceed in this order. A dependent item does not start integration until its dependency gate is green.

| ID | Work | Depends on | Completion evidence |
| --- | --- | --- | --- |
| B0 | Freeze the 3.8.3 compatibility and measurement baseline: v2 schemas/golden outputs, MCP tool/action inventory, public package manifests, pinned external refs, 84 positive and 24 forbidden route-source labels, 200 adjudicated finding labels, allowed adoption writes, and the measurement protocol. Replay public 3.8.3 before implementation tuning. | None | Baseline fixtures reproduce the completed 3.8.3 audit, identify all normalized fields, and record 3.8.3 precision/recall on the frozen set. |
| B1 | Add verifier-owned TypeScript contracts, JSON Schemas, validators, deterministic sort/normalization rules, and focused fixtures for the three V1 contracts. | B0 | Package schema exports validate positive/negative fixtures; docs/package copies have parity; no consumer-local duplicate types remain. |
| B2 | Move resolver, client, ranking, wiring, content-type, schema-loader, and provenance implementation ownership into `@decantr/content`; convert `@decantr/registry` to a tested facade; migrate first-party imports and manifests. | B0 | Dependency graph matches this program; production import audit has no non-allowlisted `@decantr/registry` imports; old package/client/schema imports pass against packed artifacts. |
| B3 | Build `AdoptionTruthV1` once in verifier from shared discovery plus adoption artifacts; adapt `scan`, `adopt`, `doctor`, MCP project state, CI v3, and Studio. | B1, B2 | All renderers agree on selected app, fact status, confidence, provenance, writes, limitations, and next action across project and monorepo fixtures. |
| B4 | Build `TaskCapsuleV1` in verifier from current graph, authority, findings, changed files, and content provenance; replace CLI/MCP assembly with adapters over it. | B1, B2, B3 | Route implementation is first for every labeled route; compact budget and truncation tests pass; existing CLI/MCP task fields remain compatible. |
| B5 | Build `GovernanceDeltaV1` from compatible health baselines, graph/source diffs, stable finding identity, and evidence freshness. | B1, B3, B4 | New/resolved/inherited/unclassified fixtures pass; missing or cross-project baselines cannot produce a false empty/new delta. |
| B6 | Add strict `decantr-ci-report.v3`, `--report-version v3` to existing `ci` and `ci init`, project/workspace aggregation, and v3 exit behavior. Preserve v2 defaults. | B5 | Default invocations match v2 goldens; explicit v3 validates in project/workspace mode; generated workflows pin the local CLI and requested version. |
| B7 | Update Studio to render adoption truth, task capsules, and governance deltas without workspace mutation or command execution. | B3, B4, B5 | Filesystem snapshots are unchanged after every route/refresh action; saved v2/v3 report modes pass; no mutation endpoint or execution path exists. |
| B8 | Route MCP actions through verifier/content owners while retaining the exact eight-tool inventory and current action names. | B2, B3, B4, B5 | Tool-list equality, metadata, action compatibility, compact/full behavior, path containment, and packed-server tests pass. |
| B9 | Extend qualification harnesses with repeated-run raw samples, the already frozen route/finding labels, capsule-size metrics, truth/delta determinism, offline content, Studio read-only checks, and source-integrity attribution. The frozen release-gating labels may not be changed to accommodate 3.9 output. | B3-B8 | Harness emits machine-readable evidence for every quantitative gate and fails closed on missing samples or labels. |
| B10 | Update active command, MCP, schema, security-permission, package-support, CI, adoption-proof, and release documentation without rewriting historical audits. | B6-B9 | Docs drift, links, schema parity, package surface, package permissions, and stale-default searches pass. |
| B11 | Run full repository qualification and host builds against final 3.9.0 source. | B10 | `pnpm install`, build, tests, content validation, package-surface audit, package-permissions audit, release preflight, and host gates pass with retained logs. |
| B12 | Pack the final-version 3.9.0 package wave and run the complete matrix from clean npm prefixes with no workspace links. | B11 | Packed-artifact install graph, v2/v3 reports, eight-tool MCP server, Brownfield/Greenfield/Hybrid lanes, source integrity, timing, precision, and offline gates pass. |
| B13 | Publish the approved package wave directly as stable 3.9.0 through the repository release workflow. Do not publish a prerelease or alternate dist-tag. | B12 | Public npm manifests, `latest` tags, release note, git tag, GitHub Release, `pnpm release:verify`, and `pnpm release:closeout -- --version 3.9.0` pass. |
| B14 | Run the public npm adoption-proof matrix and write the dated 3.9.0 audit before making adoption-success claims. | B13 | Zero-link public installs, exact refs, host checks, source attribution, measured gates, limitations, and public package/MCP parity are reviewed and recorded. |

## Acceptance Gates

### Gate A: Contract And Ownership

- Verifier is the sole contract owner and all three V1 schemas have positive, negative, and deterministic-order fixtures.
- No first-party renderer rescans or independently infers canonical facts.
- The package dependency graph is acyclic and follows the target direction.
- `@decantr/registry` compatibility imports work while first-party production code uses `@decantr/content`.

### Gate B: Compatibility

- V2 is still the default for scan, health, workspace health, evidence, and CI machine reports.
- V2 schemas and default exit semantics are unchanged.
- Existing task-output fields and MCP actions remain compatible.
- MCP lists exactly the eight names in this program.
- No package, CLI command, MCP identity, or public registry compatibility name was added or removed.

### Gate C: Governed Change Proof

- Project selection and provenance agree across CLI, MCP, CI v3, and Studio.
- Task context leads with the labeled implementation source and stays within budget.
- Delta output deterministically partitions findings and reports incompatible or missing evidence honestly.
- Inherited debt remains visible without failing a valid delta gate.
- Content provenance survives online/offline resolution and local-law overrides retain priority.
- Studio and contract-only adoption leave authored application source unchanged.

### Gate D: Qualification

- Every quantitative gate has raw machine-readable evidence under the measurement protocol.
- The packed-artifact matrix passes before publication.
- Package permissions, package surface, schemas, links, docs drift, content validation, and host toolchains pass.
- Release notes name sample bounds, unsupported cases, and unmeasured runtime/visual claims.

### Sole-Maintainer Release Decision

Decantr has one human maintainer. Stable 3.9.0 publication may therefore proceed through the version-bound `sole-maintainer-unqualified` release gate when every Gate D machine/package requirement passes and the only missing items are the two-reviewer finding identities, adjudicated finding corpus, and corresponding public 3.8.3/final 3.9.0 finding replays. This decision prevents fabricated reviewer independence; it does not satisfy the human qualification lane or authorize precision, recall, release-qualification, or adoption-proven claims.

### Gate E: Publication And Public Proof

- Stable 3.9.0 is the first and only 3.9.0 publication; there is no RC, `next`, or `candidate` version/tag.
- Release verification and closeout pass for the actual published package set.
- The public npm matrix passes before Decantr 3.9.0 is described as adoption-proven.
- Generated evidence remains an artifact; the committed audit contains human-reviewed conclusions and limitations.

## Rollout

1. Land contracts and internal ownership changes behind existing v2 serializers and current command/tool names.
2. Integrate adoption truth, task capsule, delta, and read-only Studio while keeping default outputs unchanged.
3. Expose v3 only through `--report-version v3`; require the same explicit choice in `ci init`.
4. Freeze refs, versions, labels, environment, and final 3.9.0 package manifests before measurements begin.
5. Run the full machine/package matrix against unpublished packed 3.9.0 artifacts. Any non-waived gate failure returns to implementation; it does not create a prerelease publication.
6. Publish the approved wave directly to stable 3.9.0 and `latest` through the repository workflow.
7. Run release verification/closeout and then the public npm adoption-proof matrix.
8. Update shipped-behavior and adoption-success language only after the corresponding public evidence exists.

Existing CI installations continue using v2. Teams opt into v3 by changing their pinned workflow invocation or regenerating through `decantr ci init --report-version v3`. There is no automatic fleet migration in 3.9.x.

## Rollback

### Before Publication

- Stop the release on any failed acceptance gate.
- Keep v2 defaults and the package-specific baseline public dist-tags unchanged.
- Fix forward on the release branch and rerun B11-B12; do not publish an RC, `next`, or `candidate` substitute.

### After Publication

- Do not unpublish npm versions, rewrite git tags, or hide failed evidence.
- If only opt-in v3 CI is defective, instruct users to remove `--report-version v3`, keep or regenerate the v2 workflow, mark the limitation, and ship a tested 3.9.1 fix.
- If a default install, v2 compatibility, MCP, or de-registry regression is material, move affected `latest` tags back to the package-specific baseline versions listed above through the release runbook, then ship a tested 3.9.1 fix. Treat the dependency closure as one rollback unit when mixed versions would be unsafe.
- If an `apps/api` deployment changed and regressed, roll that deployment back independently; local bundled content and v2 defaults must remain usable.
- Preserve failed public reports and publish the limitation in the release audit. A rolled-back dist-tag does not erase the immutable 3.9.0 release.

Dist-tag, tag, publish, GitHub Release, and deployment mutations require the explicit authorization and verification required by the release runbooks at execution time.

## Non-Goals

- Reviving `registry.decantr.ai`, community publishing, registry marketplace behavior, or hosted source upload
- Removing `@decantr/registry`, `decantr registry ...`, `REGISTRY_URL`, or MCP `decantr_registry` during Decantr 3.x
- Adding an npm package, CLI command, ninth MCP tool, MCP alias, or renamed MCP/server identity
- Making v3 the default in 3.9.x or silently rewriting existing CI workflows
- Giving Studio write, command-execution, agent-invocation, baseline-save, or provider-posting behavior
- Posting pull-request comments or annotations directly from the core product; CI emits deterministic evidence for existing automation
- Building an autonomous coding agent, source rewriter, or framework-specific generator as the product core
- Expanding `@decantr/css` or making it a default adoption path
- Changing Essence V4, adding hosted accounts/billing/metering, or adding default telemetry/network endpoints
- Claiming runtime, visual, ecosystem-wide, percentile, precision, or recall results beyond collected evidence
- Publishing 3.9.0 as an RC, `next`, `candidate`, canary, or other prerelease

## 3.8 Relationship

The 3.8 line remains patch-only under `docs/runbooks/decantr-3-8-maintenance.md`. A defect found during this program may be backported only when it violates an already shipped 3.8 contract. The verifier-owned proof contracts, internal de-registry migration, opt-in v3 CI report, and governed-change qualification work belong to 3.9.
