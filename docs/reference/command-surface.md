# Decantr Command Surface

This is the current command audit for the 2.x reliability layer. The goal is consolidation without breaking users: workflow commands are the human-facing product surface, while existing primitives remain available for advanced users, scripts, and CI internals.

| Command | Class | Decision | Notes |
| --- | --- | --- | --- |
| `setup` | primary | keep | Detect project state and recommend the right Decantr workflow without writing files. |
| `scan` | primary | keep | Read-only Brownfield reconnaissance over local files; prints `ScanReportV1` as terminal output or JSON and writes no files. |
| `new` | primary | keep | Greenfield workspace creation. |
| `adopt` | primary | keep | Brownfield one-liner over analyze, proposal acceptance, online pack hydration, Project Health, evidence, baseline, and optional CI. |
| `task` | primary | keep | Route/task context activation for AI coding assistants, including authority lane, local law, runtime boundary, and changed-file impact. |
| `verify` | primary | keep | One reliability gate over Project Health, optional Brownfield guard checks, baselines, evidence, local law, and workspace health. |
| `ci` | primary | keep | Non-mutating CI gate plus CI integration generator for projects and workspaces. |
| `doctor` | primary | keep | Explain project/workspace state, adoption lane, generated artifacts, local law, CI wiring, design authority signals, and the ordered next-step queue. |
| `codify` | primary | keep | Propose and accept project-owned Brownfield/Hybrid UI law and style bridges. |
| `studio` | primary | keep | Local Project Health and workspace triage UI. |
| `content` | content-author | keep | Content-author namespace over check/create/publish. |
| `magic` | advanced | keep | Intent-first greenfield path; not the primary enterprise story. |
| `init` | advanced | keep | Attach/setup primitive for Decantr contracts and context. |
| `analyze` | advanced | keep | Brownfield inventory and proposal primitive used by `adopt`. |
| `refresh` | advanced | keep | Regenerate derived context/style artifacts. |
| `check` | advanced | keep | Fast contract and guard validation. |
| `health` | advanced | keep | Canonical report, Evidence Bundle, prompt, browser/token checks, and lower-level Project Health primitive used by `verify` and `ci`. |
| `workspace` | advanced | keep | Monorepo app candidate discovery, attached Decantr project listing, and aggregate health; `verify --workspace` is the user-facing shortcut. |
| `heal` | deprecated-alias | soft-deprecate | Alias for `check`; no hard removal in 2.x. |
| `audit` | advanced | keep advanced | Lower-level verifier audit/file critique. |
| `status`, `sync`, `upgrade`, `sync-drift`, `get`, `list`, `validate`, `rules`, `export` | advanced | keep | Useful when users need direct registry, rules, export, or diagnostic control. |
| `registry`, `showcase`, `login`, `logout`, `telemetry` | operator | keep | Operator/registry/support workflows. |
| `content-health`, `create`, `publish` | content-author | keep as aliases | Backward-compatible root commands; docs should prefer `decantr content ...`. |

The typed metadata lives in `packages/cli/src/command-surface.ts` and is covered by tests against the dispatched CLI commands. Any new top-level command should update that file, command help, package docs, root docs, release notes, and relevant skills before it ships.

Brownfield intelligence is now exposed through workflows first:

- `decantr scan` is the zero-commit preview. It detects frontend framework, routes, styling, static-hosting hints, Decantr presence, and assistant-rule files, then prints a terminal report without creating `.decantr`, installing dependencies, building the app, executing scripts, uploading source, or saving a report. Use `--project apps/web` from monorepos and `--json` for automation.
- `decantr adopt --yes` runs the full adoption path and explains the underlying primitives before writing. In monorepos, use `decantr adopt --project apps/web --yes`; `--base-url` is optional visual evidence, not the default attach command. Online adoption hydrates hosted execution packs automatically; use `--no-packs` to defer that step.
- `decantr task <route>` surfaces the relevant context files, patterns, screenshot references, accepted local laws, accepted style bridge mappings, changed files, impacted routes, and authority lane for the next LLM edit. The authority block states source authority, style authority, active authorities, runtime boundary, and warnings for cross-runtime or Decantr CSS requests.
- `decantr codify --from-audit` proposes `.decantr/local-patterns.proposal.json` and `.decantr/rules.proposal.json`; `decantr codify --style-bridge` proposes `.decantr/style-bridge.proposal.json`; `decantr codify --accept` promotes reviewed proposals, activating Hybrid local law or Hybrid style bridge.
- `decantr verify --brownfield --local-patterns` runs the reliability gate, requires accepted local patterns, and scans accepted local rules when present.
- `decantr doctor --project <path>` explains whether the app is attached, which adoption lane is active, whether generated context is present, whether local law exists, whether CI is wired, and which commands to run next.
- `decantr ci --project <path>` is the blessed CI command. It is non-mutating, adoption-mode aware, emits a `DecantrCiReport`, and prints accepted `.decantr/rules.json` findings plus style bridge status alongside Project Health. `--fail-on error` leaves warning-level local law visible; `--fail-on warn` blocks on it. `decantr ci init` writes root GitHub workflows or generic pipeline snippets using the pinned package-manager command instead of `@latest`, and prints the install command when `@decantr/cli` is not pinned yet.
- `decantr health init-ci` and `decantr verify init-ci` are legacy aliases for `decantr ci init`; they should generate the same pinned `decantr-ci.yml` surface, not the old `@latest` Project Health workflow.
- `decantr analyze` still writes Brownfield intelligence, theme inventory, and enrichment backlog artifacts.
- `decantr setup` is stateful orientation: before adoption it shows app candidates and the attach command; after adoption it shows attached projects plus `doctor`, `task`, `verify`, and `ci init` as the day-two loop.
- `decantr suggest` accepts `--route`, `--file`, `--from-code`, and `--project`; when accepted local law or a style bridge exists, project-owned patterns and mappings are shown before registry suggestions. From an app root, suggestions should discover local law from the current directory without requiring `--project`; from a monorepo root, use `--project <app>`. `--from-code` may derive the query from `--route` or `--file`, and monorepo-root file paths under the selected project are normalized to app-local paths.
- `decantr check --brownfield --project <path>` validates the selected app from a monorepo root; app-scoped primitives should not silently fall back to the workspace root.
- `decantr add page <section>/<page> --route <route> --project <path>` writes both the page and route mapping so the page is immediately usable by `decantr task <route>`.
- App-scoped primitives that support project state (`health`, `status`, `upgrade`, `add`, `remove`, `theme`, `export`, `suggest`, `magic`, `rules`, and `telemetry`) should honor `--project <path>`. Unsupported flags should fail before writing proposal/generated files.
- `decantr registry get-pack page --route <route>` is the CLI task-context path through the existing pack surface. `decantr registry compile-packs apps/web/decantr.essence.json --write-context` hydrates app packs beside the provided essence path.
- `decantr health --browser --base-url <url> --evidence` writes local screenshots and a visual manifest; `--save-baseline` / `--since-baseline` add continuity.
- `decantr refresh --check` is the CI-safe generated-context freshness check and fails when `pack-manifest.json` references missing files. In contract-only Brownfield it should not fail solely because hosted packs were intentionally deferred. `decantr refresh --list-changes` prints created, updated, and removed generated files after regeneration, using paths that are openable from the command's current directory.

Command help must be side-effect free. `decantr <command> --help`, `decantr <command> -h`, and `decantr <command> help` should print help and never execute command bodies or write project files.

Package and trust audits are repo scripts, not user-facing CLI commands. `pnpm audit:package-surface` verifies support-matrix drift and the installed permission surface, while `pnpm audit:package-permissions` runs the permission-only audit with `npm pack --dry-run --json`. The generated reference is `docs/reference/security-permissions.md`.

`@decantr/vite-plugin` remains experimental after this audit. It may become a verifier-backed dev adapter later, but it is not part of the default reliability layer and should not be treated as a graduated 2.x surface yet.
