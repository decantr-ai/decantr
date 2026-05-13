# Decantr Command Surface

This is the current command audit for the 2.x reliability layer. The goal is consolidation without breaking users: workflow commands are the human-facing product surface, while existing primitives remain available for advanced users, scripts, and CI internals.

| Command | Class | Decision | Notes |
| --- | --- | --- | --- |
| `setup` | primary | keep | Detect project state and recommend the right Decantr workflow without writing files. |
| `new` | primary | keep | Greenfield workspace creation. |
| `adopt` | primary | keep | Brownfield one-liner over analyze, proposal acceptance, Project Health, evidence, baseline, and optional CI. |
| `task` | primary | keep | Route/task context activation for AI coding assistants, including local law and changed-file impact. |
| `verify` | primary | keep | One reliability gate over Project Health, optional Brownfield guard checks, baselines, evidence, local law, and workspace health. |
| `codify` | primary | keep | Propose and accept project-owned Brownfield UI patterns and rules. |
| `studio` | primary | keep | Local Project Health and workspace triage UI. |
| `content` | content-author | keep | Content-author namespace over check/create/publish. |
| `magic` | advanced | keep | Intent-first greenfield path; not the primary enterprise story. |
| `init` | advanced | keep | Attach/setup primitive for Decantr contracts and context. |
| `analyze` | advanced | keep | Brownfield inventory and proposal primitive used by `adopt`. |
| `refresh` | advanced | keep | Regenerate derived context/style artifacts. |
| `check` | advanced | keep | Fast contract and guard validation. |
| `health` | advanced | keep | Canonical report, Evidence Bundle, prompt, browser/token checks, and CI spine used by `verify`. |
| `workspace` | advanced | keep | Monorepo Decantr project discovery and aggregate health; `verify --workspace` is the user-facing shortcut. |
| `heal` | deprecated-alias | soft-deprecate | Alias for `check`; no hard removal in 2.x. |
| `audit` | advanced | keep advanced | Lower-level verifier audit/file critique. |
| `status`, `sync`, `upgrade`, `sync-drift`, `get`, `list`, `validate`, `rules`, `export` | advanced | keep | Useful when users need direct registry, rules, export, or diagnostic control. |
| `registry`, `showcase`, `login`, `logout`, `telemetry` | operator | keep | Operator/registry/support workflows. |
| `content-health`, `create`, `publish` | content-author | keep as aliases | Backward-compatible root commands; docs should prefer `decantr content ...`. |

The typed metadata lives in `packages/cli/src/command-surface.ts` and is covered by tests against the dispatched CLI commands. Any new top-level command should update that file, command help, package docs, root docs, release notes, and relevant skills before it ships.

Brownfield intelligence is now exposed through workflows first:

- `decantr adopt` runs the full adoption path and explains the underlying primitives before writing.
- `decantr task <route>` surfaces the relevant context files, patterns, screenshot references, accepted local laws, changed files, and impacted routes for the next LLM edit.
- `decantr codify --from-audit` proposes `.decantr/local-patterns.proposal.json` and `.decantr/rules.proposal.json`; `decantr codify --accept` promotes them to `.decantr/local-patterns.json` and `.decantr/rules.json`.
- `decantr verify --brownfield --local-patterns` runs the reliability gate, requires accepted local patterns, and scans accepted local rules when present.
- `decantr analyze` still writes Brownfield intelligence, theme inventory, and enrichment backlog artifacts.
- `decantr suggest` accepts `--route`, `--file`, and `--from-code` for better pattern discovery without adding a new top-level command.
- `decantr registry get-pack page --route <route>` is the CLI task-context path through the existing pack surface.
- `decantr health --browser --base-url <url> --evidence` writes local screenshots and a visual manifest; `--save-baseline` / `--since-baseline` add continuity.

Command help must be side-effect free. `decantr <command> --help`, `decantr <command> -h`, and `decantr <command> help` should print help and never execute command bodies or write project files.

`@decantr/vite-plugin` remains experimental after this audit. It may become a verifier-backed dev adapter later, but it is not part of the default reliability layer and should not be treated as a graduated 2.x surface yet.
