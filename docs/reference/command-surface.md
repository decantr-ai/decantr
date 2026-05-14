# Decantr Command Surface

This is the current command audit for the 2.x reliability layer. The goal is consolidation without breaking users: workflow commands are the human-facing product surface, while existing primitives remain available for advanced users, scripts, and CI internals.

| Command | Class | Decision | Notes |
| --- | --- | --- | --- |
| `setup` | primary | keep | Detect project state and recommend the right Decantr workflow without writing files. |
| `new` | primary | keep | Greenfield workspace creation. |
| `adopt` | primary | keep | Brownfield one-liner over analyze, proposal acceptance, online pack hydration, Project Health, evidence, baseline, and optional CI. |
| `task` | primary | keep | Route/task context activation for AI coding assistants, including local law and changed-file impact. |
| `verify` | primary | keep | One reliability gate over Project Health, optional Brownfield guard checks, baselines, evidence, local law, and workspace health. |
| `ci` | primary | keep | Non-mutating CI gate plus CI integration generator for projects and workspaces. |
| `doctor` | primary | keep | Explain project/workspace state, generated artifacts, local law, CI wiring, design authority signals, and the next command. |
| `codify` | primary | keep | Propose and accept project-owned Brownfield UI patterns and rules. |
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

- `decantr adopt --yes` runs the full adoption path and explains the underlying primitives before writing. In monorepos, use `decantr adopt --project apps/web --yes`; `--base-url` is optional visual evidence, not the default attach command. Online adoption hydrates hosted execution packs automatically; use `--no-packs` to defer that step.
- `decantr task <route>` surfaces the relevant context files, patterns, screenshot references, accepted local laws, changed files, and impacted routes for the next LLM edit.
- `decantr codify --from-audit` proposes `.decantr/local-patterns.proposal.json` and `.decantr/rules.proposal.json`; `decantr codify --accept` promotes them to `.decantr/local-patterns.json` and `.decantr/rules.json`.
- `decantr verify --brownfield --local-patterns` runs the reliability gate, requires accepted local patterns, and scans accepted local rules when present.
- `decantr doctor --project <path>` explains whether the app is attached, whether generated context is present, whether local law exists, whether CI is wired, and which command to run next.
- `decantr ci --project <path>` is the blessed CI command. It is non-mutating, adoption-mode aware, and emits a `DecantrCiReport`. `decantr ci init` writes root GitHub workflows or generic pipeline snippets using the pinned package-manager command instead of `@latest`, and prints the install command when `@decantr/cli` is not pinned yet.
- `decantr analyze` still writes Brownfield intelligence, theme inventory, and enrichment backlog artifacts.
- `decantr suggest` accepts `--route`, `--file`, and `--from-code` for better pattern discovery without adding a new top-level command.
- `decantr check --brownfield --project <path>` validates the selected app from a monorepo root; app-scoped primitives should not silently fall back to the workspace root.
- `decantr registry get-pack page --route <route>` is the CLI task-context path through the existing pack surface. `decantr registry compile-packs apps/web/decantr.essence.json --write-context` hydrates app packs beside the provided essence path.
- `decantr health --browser --base-url <url> --evidence` writes local screenshots and a visual manifest; `--save-baseline` / `--since-baseline` add continuity.
- `decantr refresh --check` is the CI-safe generated-context freshness check and fails when `pack-manifest.json` references missing files. `decantr refresh --list-changes` prints created, updated, and removed generated files after regeneration.

Command help must be side-effect free. `decantr <command> --help`, `decantr <command> -h`, and `decantr <command> help` should print help and never execute command bodies or write project files.

`@decantr/vite-plugin` remains experimental after this audit. It may become a verifier-backed dev adapter later, but it is not part of the default reliability layer and should not be treated as a graduated 2.x surface yet.
