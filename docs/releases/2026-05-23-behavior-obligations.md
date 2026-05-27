# Behavior Obligations For Local Law

Date: 2026-05-23
Status: Draft release note
Channel: Decantr 3 prerelease

Behavior obligations add a narrow local-law facet for project-owned interaction and accessibility expectations in Brownfield and Hybrid apps.

They are not a public `ux_contract`, not an Essence V4 change, not a registry schema change, and not a standalone UX package. Accepted obligations live in `.decantr/local-patterns.json` under `behavior_obligations`, then flow through the existing Decantr 3 Contract, Context, and Evidence surfaces.

## What Changed

- `decantr codify --from-audit` can propose form-control and destructive confirmation-dialog obligations when source evidence is strong.
- `decantr task <route> --json` and the text task output surface accepted behavior obligations before an AI assistant edits dialogs, forms, destructive actions, or other interactive surfaces.
- MCP `decantr_prepare_task_context` returns accepted obligations as typed local-law data.
- `decantr graph` projects each obligation into a `LocalRule` node with ids like `rule:behavior:<pattern-id>:<obligation-id>` and `payload.kind = "behavior-obligation"`.
- Project Health and `decantr verify` now emit high-confidence behavior-obligation findings for dialogs and forms, including stable diagnostic codes, typed repair IDs, file evidence, repair payloads, and graph anchors when a graph snapshot exists.
- Evidence Bundles and repair prompts include the owning local pattern, obligation id, graph local-rule anchor, file evidence, and expected project-owned primitive when known.

## Initial Diagnostic Codes

- `A11Y010` / `restore-dialog-accessible-name`
- `A11Y011` / `restore-label-association`
- `INT010` / `restore-visible-consequence-copy`
- `INT011` / `restore-cancel-affordance`
- `INT012` / `restore-submitting-guard`
- `INT013` / `set-explicit-button-type`
- `COMP020` / `use-project-owned-interaction-primitive`

## Boundaries

Decantr only verifies obligations where static source evidence is strong. It does not claim to prove focus trapping, real keyboard traversal, temporal UI states, or screen-reader behavior without project tests or explicit source signals. WCAG tooling, axe, Playwright, Storybook, Chromatic, ESLint, Biome, and project tests remain complementary authority.

`decantr-content` remains schema-stable: official patterns can carry accessibility and interaction guidance, but project-specific behavior obligations stay in consuming apps as local law.

## Verification

```bash
pnpm vitest run packages/cli/test/local-law.test.ts packages/cli/test/graph-command.test.ts
pnpm vitest run packages/mcp-server/test/tools.test.ts --testNamePattern "prepare|task context|local law"
pnpm --filter @decantr/verifier exec vitest run test/behavior-obligations.test.ts test/diagnostics.test.ts
pnpm --filter @decantr/verifier --filter @decantr/core --filter @decantr/mcp-server --filter @decantr/cli run build
```
