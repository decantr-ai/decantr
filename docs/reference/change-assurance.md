# Changed UI Assurance

Decantr 3.11 makes bare `decantr verify` a zero-setup, zero-write assurance pass for the current UI change. It does not require Decantr adoption, an Essence file, generated graph artifacts, an account, or the content API.

```bash
npx @decantr/cli@3.11.2 verify
```

The command reads Git state, selects one app, resolves changed production UI files to project-owned surfaces, and returns at most three consequential findings with exact source locations and repair targets.

## Scope

Working-tree assurance includes:

- staged and unstaged tracked files;
- deleted and renamed files;
- untracked files;
- an unborn repository's staged and untracked files.

Use `--since <ref>` for a merge-base commit range. If Git scope cannot be established, the report is `not_proven`; Decantr does not substitute a whole-project scan and call it changed-file evidence.

Tests, stories, fixtures, mocks, generated files, build output, and sibling apps are excluded from production authority. They remain visible as excluded evidence when they occur in the selected change.

## App Selection

In a single-app repository, the current app is selected. In a monorepo, changed files may select exactly one product UI app. Decantr fails closed when changes span multiple app candidates or no app can be selected safely. Use `--project <path>` to make the boundary explicit.

## Findings

The v1 report can return:

- `AUTH001` when a changed production UI file cannot be mapped to a discovered UI surface;
- `AUTH010` when a central route-topology change is not backed by proven, complete route authority;
- `COMP001` when a changed file reimplements a project-owned reusable primitive;
- `COMP010` when changed JSX/TSX renders a raw control despite an app or directly referenced workspace package owning the corresponding primitive;
- `TOKEN010` when a changed file bypasses an accepted project style bridge.

Project-prefixed primitives such as `CulinaryButton` are preserved by name in the repair payload. A changed Next page maps to its direct route and component surfaces; only central topology files such as `routes.ts` or `router.ts` fan out across the route graph.

The default output shows three findings. `--max-findings <1-20>` changes the display cap while the report retains total and truncated counts.

## Status

- `pass`: the Git scope is complete, changed UI authority is resolved, and no supported changed-file finding is open.
- `attention`: authority is resolved and one or more supported findings need review.
- `not_proven`: Git scope, app selection, changed surface authority, or route authority is incomplete.

By default, `attention` and `not_proven` exit nonzero. Use `--fail-on error`, `--fail-on info`, or `--fail-on none` deliberately when integrating with another gate.

## Output

```bash
decantr verify --json
decantr verify --markdown
decantr verify --ci
decantr verify --since origin/main --ci
decantr verify --project apps/web --output .decantr/change-assurance.json --json
```

`--ci` writes GitHub workflow annotations to stderr so JSON stdout remains parseable. An output file is written only when `--output` is explicit.

The public schema is `@decantr/verifier/schema/change-assurance-report.v1.json` and `https://decantr.ai/schemas/change-assurance-report.v1.json`.

## CLI, CI, And MCP Parity

The same verifier-owned `verifyUIChanges()` report is used by:

- bare `decantr verify`;
- the existing MCP `decantr_verify` tool with `{ "action": "changes" }`;
- explicit CI v3 under `changeAssurance`.

CI v2 remains the compatibility default. No ninth MCP tool was added.

## Full Project Health

Use `decantr verify --full` for the previous full Project Health workflow. Existing Brownfield, local-pattern, baseline, browser, and evidence flags also select full mode. Those workflows may read or write their documented artifacts; bare changed-UI assurance does not.

## Evidence Limits

Changed UI assurance is static and diff-scoped. It does not run project tests, build the app, open a browser, compare screenshots, execute accessibility tooling, or prove runtime behavior.

JSX/TSX primitive reuse is supported in 3.11. Angular, Vue, Svelte, Astro, Nuxt, and Solid authority and surface scoping remain available, but template-level primitive-reuse parity is not claimed. A `pass` means no supported changed-file authority violation was found; it does not mean the UI is correct.

