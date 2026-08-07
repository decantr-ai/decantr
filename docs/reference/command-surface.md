# Decantr Command Surface

Decantr 3.11 makes the current Git change the default product surface while preserving callable 3.x compatibility. No new top-level command is required: bare `verify` now selects Changed-UI Assurance.

**Status:** 3.11.0 is the current stable release. The behavior below is shipped product behavior, not a frontier-model value claim.

## 3.11 Default Entry Point

```bash
npx @decantr/cli@3.11.0 verify
```

Bare `verify` is zero-write and adoption-free. It resolves the Git change, auto-selects one changed UI app when provable, excludes non-production authority, and emits at most three findings under `change-assurance-report.v1`. `--json`, `--markdown`, `--ci`, `--since`, `--project`, and explicit `--output` refine this mode. An explicit output file is the only write in changed-UI mode.

Use `verify --full` or an existing Project Health flag such as `--brownfield`, `--local-patterns`, `--base-url`, `--evidence`, `--since-baseline`, or `--workspace` to select the previous full workflow. See [Change Assurance](change-assurance.md).

## Deeper Workflow

| Command | Stage | Mutates | Role |
| --- | --- | --- | --- |
| `scan` | Observe | No | Read-only selected-app reconnaissance with independent UI-authority axes. |
| `adopt` | Attach once | Yes | Reviewed Brownfield attachment over existing lower-level primitives. |
| `task` | Prepare | No | Compact authority-aware agent context for one route or non-route UI change. |
| `verify` | Verify/Report | No by default | Local reliability gate over the diff and available evidence. |
| `ci` / `ci init` | Report/Enforce | Gate: no; init: yes | Run the automation gate or install it once. |

The release uses existing commands:

```bash
decantr scan
decantr adopt --yes
decantr task /feed "add saved actions"
decantr verify --full
decantr ci init
```

`adopt` and `ci init` are setup boundaries, not daily ceremony. The normal change loop is `task -> edit -> verify`; CI enforces it.

In monorepos, keep one app scope:

```bash
decantr scan --project apps/web
decantr adopt --project apps/web --yes
decantr task /feed "add saved actions" --project apps/web
decantr verify --project apps/web
decantr ci init --project apps/web
```

## Command Semantics

### `scan`

- Reads the selected app without writing project artifacts, installing dependencies, building, running package scripts, or uploading source.
- Reports evidence and limitations; a successful exit is not an authority-correctness result.
- Must not let confidence, fit, route count, or component count conceal unresolved authority.
- Changed-UI Assurance uses `pass`, `attention`, or `not_proven`. Full authority and task preparation retain `ready`, `limited`, `blocked`, or `unsupported` across independent axes.

### `adopt`

- Is the one-time user-facing attach path over analysis, contract/context creation, graph/evidence setup, baseline creation, and optional CI.
- Must explain writes before mutation and preserve the host framework, router, styling, components, tests, and instructions.
- A force override records an operator decision; it does not upgrade weak evidence to proof.
- Active 3.11 implementation investment remains focused on change assurance and observe/prepare/verify. Adoption is the attachment bridge, not a platform-expansion surface.

### `task`

- Prepares compact, ranked, change-specific context for any coding agent.
- Attached route behavior remains compatible through `TaskCapsuleV1` and requires current graph evidence.
- Missing, stale, conflicting, blocked, or unsupported authority must return non-success guidance rather than guessed sources.
- Deployment-conditioned, unknown, ambiguous, inferred, or unresolved targets return no edit read set. Attached route capsules lead with the implementation and preserve ordered workspace/app styling evidence within the compact budget.
- The 3.10 UI-surface model covers routes, layouts, components, stories, overlays, flows, packages, and runtime states. Do not mislabel a non-route surface as a route to fit the old capsule.

### `verify`

- Composes Decantr checks with project-owned build, test, lint, browser, visual, accessibility, and evidence inputs where available.
- Must not claim runtime behavior from static source or visual correctness from a screenshot hash.
- Keeps missing and incomplete evidence visible.

### `ci`

- Runs the non-interactive project or workspace gate.
- `ci init` generates integration files and therefore mutates the repository; ordinary `ci` is a gate.
- CI v2 remains the compatibility default. Explicit `--report-version v3` includes the same Changed-UI Assurance report used by bare CLI verify and MCP action `changes`.
- A missing or incompatible comparison basis remains `not_proven`, not clean.

## Advanced Commands

These commands remain callable for diagnosis, direct control, content maintenance, or specialized workflows. They should not crowd normal help or every agent prompt.

| Area | Commands | Posture |
| --- | --- | --- |
| Orientation and diagnosis | `setup`, `doctor`, `resolve`, `health`, `workspace` | Advanced support for the primary loop. |
| Agent and graph integration | `connect`, `graph`, `rules` | Advanced integration; avoid duplicate instruction bridges. |
| Project-law workflows | `codify`, `audit`, `check` | Advanced Brownfield/Hybrid control. |
| Lower-level attachment | `init`, `analyze`, `refresh`, `migrate` | Primitives behind or beside the normal workflow. |
| Contract composition | `add`, `remove`, `theme`, `export`, `validate`, `status` | Advanced 3.x authoring/maintenance. |
| Greenfield | `new`, `magic` | Available compatibility path; not active 3.11 investment. |
| Content/reference | `content`, `search`, `suggest`, `get`, `list`, `sync`, `upgrade` | Supported utilities; broad corpus expansion is frozen. |
| Drift operations | `sync-drift` | Advanced explicit drift-log handling. |
| Local/operator views | `studio`, `showcase`, `telemetry` | No active 3.11 product expansion. |

Advanced does not mean removed or broken. It means the command is not required to understand Decantr's core value proposition.

## Compatibility Commands

These names remain callable for 3.x scripts but should not appear as the recommended product path:

| Command | Compatibility behavior |
| --- | --- |
| `heal` | Deprecated alias for `check`. |
| `registry` | Legacy facade over content-owned reads/cache/pack behavior. |
| `content-health` | Root compatibility entry for content health. |
| `create` | Root compatibility entry for content item scaffolding. |
| `publish` | Retired hosted community-publishing path; should return retirement guidance. |
| `login`, `logout` | Legacy credential helpers; hosted registry accounts are retired. |

Legacy `health init-ci` and `verify init-ci` aliases may continue to map to `ci init`. Existing `--adoption=decantr-css` behavior remains explicit compatibility and must not return to normal help.

`@decantr/registry`, MCP `decantr_registry`, and `REGISTRY_URL` are also compatibility names. They do not imply a public registry portal or marketplace.

## Product Surfaces Outside The Default Path

Greenfield blueprints, themes, broad content-corpus operations, `@decantr/css`, the Vite plugin, Studio, showcase, telemetry, and registry publishing/account workflows are advanced, compatibility, experimental, or historical surfaces. They receive no feature expansion in the 3.11 product line.

Package consolidation and command removal are deferred to a future major-version compatibility decision. The 3.10 line reduces visibility and duplicated implementation without silently breaking 3.x scripts.

## MCP Boundary

CLI simplification does not change MCP identity. Preserve exactly:

`decantr_project`, `decantr_contract`, `decantr_context`, `decantr_graph`, `decantr_registry`, `decantr_verify`, `decantr_repair`, and `decantr_contract_write`.

Do not add a ninth content tool or remove `decantr_registry` in 3.x.

## Help And Safety Rules

- Root help should lead with the five-command workflow.
- Every hidden command must have independent command-local help before it leaves root help.
- `decantr <command> --help`, `-h`, and `help` must be side-effect free.
- Command metadata, dispatch, help, docs, and tests must agree.
- Compatibility commands stay callable without becoming recommended.
- Mutation commands must identify their write boundary before changing files.
- No command may convert an unsupported or unresolved authority state into a clean result through scoring.

## Research Boundary

Command simplification is not evidence of model lift. The separate research claim requires the frozen 28-repository Day-0 authority gate and 320-run, information-equivalent model A/B experiment. See the [research program](../programs/2026-07-22-decantr-3-10-ui-change-control-proof.md), [3.10.0 release note](../releases/2026-08-07-decantr-3-10-0-authority-aware-ui-change-control.md), and [3.9.4 Day-0 baseline](../benchmarks/2026-07-22-decantr-3-9-4-day-zero.md).

The typed command metadata lives in `packages/cli/src/command-surface.ts`. Published 3.11.0 behavior is the current product floor; the 3.10 UI authority model remains its foundation.
