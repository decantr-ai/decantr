# Decantr 3.11.0: Changed UI Assurance

Decantr 3.11.0 is a direct stable delivery-wave release for `@decantr/verifier`, `@decantr/cli`, and `@decantr/mcp-server`.

Its product lead is deliberately smaller than the full governance workflow:

```bash
npx @decantr/cli@3.11.0 verify
```

Bare verify now answers one question: **what about the current UI change conflicts with authority this project already owns?**

## Shipped

- Zero-adoption, zero-write working-tree assurance.
- Complete staged, unstaged, deleted, renamed, untracked, commit-range, and unborn-repository Git scope.
- Changed-file app selection that chooses exactly one UI app or fails closed.
- Production-source filtering that excludes tests, stories, fixtures, mocks, generated files, build output, and sibling apps from authority.
- Changed-file-to-surface resolution with central topology fan-out but no whole-app fan-out for one route page.
- At most three consequential findings by default, with exact file, line, evidence, suggested fix, repair ID, and repair target.
- App-local and directly referenced workspace-package component authority.
- Project-prefixed primitive recognition while preserving the real exported name, such as `CulinaryButton`.
- One verifier-owned `change-assurance-report.v1` contract across CLI, explicit CI v3, and MCP.
- GitHub workflow annotations without contaminating JSON stdout.
- MCP compatibility through `decantr_verify` with `action: "changes"`; the public surface remains exactly eight tools.

## Compatibility

`decantr verify --full` retains full Project Health behavior. Existing Brownfield, local-pattern, baseline, browser, and evidence flags also retain that workflow. CI v2 remains the default report contract; CI v3 adds `changeAssurance`. The MCP server identity, stdio transport, tool IDs, and existing actions are unchanged.

This release changes the behavior of bare `decantr verify`. Scripts that intended a full project audit should add `--full`.

Only the changed delivery packages move to 3.11.0. `@decantr/content`, `@decantr/core`, `@decantr/registry`, and the content API remain at 3.10.0; `@decantr/essence-spec`, `@decantr/css`, and `@decantr/telemetry` remain at 3.8.1.

## Qualification

The release gate creates and removes nine disposable repositories covering React, Next App Router, TanStack Router, Angular, Vue, an unborn Git repository, a directly referenced workspace design system, fixture-only changes, multi-app ambiguity, and missing Git scope.

A controlled change in a committed multi-app Next.js brownfield workspace also verified:

- automatic selection of the one changed app;
- direct mapping to one route and one component surface;
- no whole-app route fan-out;
- one `COMP010` at the changed line;
- the exact shared `CulinaryButton` source under `packages/design-system` as the repair target;
- the same finding in explicit CI v3.

See [3.11 changed-UI assurance trials](../research/2026-08-07-decantr-3-11-change-assurance-trials.md).

## Limits

Static change assurance does not execute tests, builds, browsers, visual comparisons, or accessibility tooling. Primitive-reuse findings are currently JSX/TSX-specific; Angular, Vue, Svelte, Astro, Nuxt, and Solid template parity is not claimed.

These deterministic trials establish contract behavior, not measured frontier-model improvement, general finding precision, or production adoption value. The separate 3.10 model-lift program remains historical research infrastructure and has not produced a qualifying causal result.

## 4.0

Decantr 4.0 is not scheduled by this release. It proceeds only if field evidence justifies a breaking simplification. See [Decantr 4 entry criteria](../reference/decantr-4-entry-criteria.md).

