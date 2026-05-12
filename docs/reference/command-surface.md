# Decantr Command Surface

This is the current command audit for the 2.x reliability layer. The goal is consolidation without breaking users: `health` is the canonical reliability command, `check` remains the fast guard validator, `audit` remains the advanced verifier surface, and `heal` stays as a soft-deprecated alias for `check`.

| Command | Class | Decision | Notes |
| --- | --- | --- | --- |
| `new` | primary | keep | Greenfield workspace creation. |
| `magic` | primary | keep | Intent-first greenfield path. |
| `init` | primary | keep | Attach/setup command for Decantr contracts and context. |
| `analyze` | primary | keep | Brownfield inventory and proposal entrypoint. |
| `refresh` | primary | keep | Regenerate derived context/style artifacts. |
| `check` | primary | keep | Fast contract and guard validation. |
| `health` | primary | keep | Canonical report, Evidence Bundle, prompt, browser/token checks, and CI spine. |
| `studio` | primary | keep | Local Project Health and workspace triage UI. |
| `workspace` | primary | keep | Monorepo Decantr project discovery and aggregate health. |
| `heal` | deprecated-alias | soft-deprecate | Alias for `check`; no hard removal in 2.x. |
| `audit` | advanced | keep advanced | Lower-level verifier audit/file critique. |
| `status`, `sync`, `upgrade`, `sync-drift`, `get`, `list`, `validate`, `rules`, `export` | advanced | keep | Useful when users need direct registry, rules, export, or diagnostic control. |
| `registry`, `showcase`, `login`, `logout`, `telemetry` | operator | keep | Operator/registry/support workflows. |
| `content-health`, `create`, `publish` | content-author | keep | Registry content repository workflows. |

The typed metadata lives in `packages/cli/src/command-surface.ts` and is covered by tests against the dispatched CLI commands. Any new top-level command should update that file, command help, package docs, root docs, release notes, and relevant skills before it ships.

`@decantr/vite-plugin` remains experimental after this audit. It may become a verifier-backed dev adapter later, but it is not part of the default reliability layer and should not be treated as a graduated 2.x surface yet.
