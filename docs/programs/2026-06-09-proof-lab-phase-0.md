# Decantr 3 Proof Lab Phase 0

Date: 2026-06-09
Status: Implemented locally as Decantr 3.1 preflight hardening
Owner: Founder + Codex

## Executive Verdict

Decantr 3.0.2 is viable enough to move forward, but the next phase should start with a small hardening sprint rather than a new architectural expansion.

The controlled proof lab used the published `@decantr/cli@3.0.2` package against three artificial brownfield apps in `/tmp/decantr-proof-lab`:

- `pristine-react-saas`: clean Vite + React + TypeScript + React Router + shadcn-style primitives.
- `messy-react-support`: ugly React app with route switching, raw overlays, unlabeled inputs, duplicated button styles, and inline styling.
- `hybrid-next-product`: Next App Router style product with public full-bleed routes plus app-shell routes.

The product loop worked: scan, adopt, codify, graph, task context, Project Health, Evidence Bundles, behavior obligations, graph anchors, and repair prompts all produced real signal. The issues that surfaced are concrete and fixable.

## Implementation Status

The Phase 0 hardening pass has been implemented in the monorepo and verified against the proof lab with the rebuilt local CLI.

Changes landed:

- messy React route discovery now detects pathname-branch routes such as `/tickets`, `/customers`, and `/admin`
- Brownfield proposals infer public/full-bleed route shells separately from the global app shell when route evidence is strong
- Brownfield checks emit `brownfield-shell-drift` when an adopted section shell contradicts obvious public/full-bleed or app-shell source evidence
- behavior-obligation form checks skip project-owned primitive definitions such as reusable `Input` components
- style bridge drift no longer treats plain project CSS variable usage such as `var(--foreground)` as arbitrary drift
- graph SourceArtifact generation skips directory handles, fixing direct `decantr graph --route`, `--file --impact`, and `--node --impact` filesystem failures
- Project Health and MCP repair prompts now point interaction fixes at the v3 `decantr verify --brownfield --local-patterns` loop
- `decantr task --project <app>` scopes git changed files to the selected app instead of leaking sibling-app changes

Verification performed:

- `pnpm build:packages`
- `pnpm vitest run packages/cli/test/routes-analyzer.test.ts packages/cli/test/local-law.test.ts packages/cli/test/graph-command.test.ts`
- `pnpm --filter @decantr/verifier test -- test/scan.test.ts test/behavior-obligations.test.ts test/component-reuse.test.ts`
- local proof-lab smoke against `/tmp/decantr-proof-lab` for scan, analyze, task, graph route context, file impact, Project Health, behavior findings, style findings, and changed-file scoping

## What Worked

- Published npm reality held up. The lab used `@decantr/cli@3.0.2`, not local monorepo source.
- All three fixtures could scan, adopt, codify, accept local law, generate base graph artifacts, and run verification/evidence.
- Behavior obligations proved useful when scoped through local law. They appeared in `.decantr/local-patterns.json`, `decantr task --json`, graph `LocalRule` nodes, Project Health, Evidence Bundles, and repair prompts.
- Graph anchors are real enough for agents. Behavior findings such as `COMP020`, `A11Y011`, and `INT013` anchored to `rule:behavior:*` nodes.
- Repair prompts are meaningfully better than generic lint findings because they include diagnostic code, repair id, graph anchor, file evidence, local obligation id, and preservation constraints.

## Initial Failures Or Weak Spots

### Route Discovery

The messy React fixture used route-like branches in `src/App.tsx`, but Decantr detected only `/` and classified routing as `static-html`. As a result:

```bash
decantr task /tickets "repair the destructive ticket delete flow" --project apps/messy-react-support
```

failed with:

```text
Route not found in Decantr contract: /tickets
Known routes: /
```

This is the highest-priority Phase 0 issue because it blocks the day-two agent loop.

### Shell Provenance

The hybrid Next fixture had full-bleed public routes and app-shell routes. Decantr adopted `/pricing` with shell `sidebar-topnav-main` even though the source route used a public marketing treatment. After mutating `/pricing` into an app-frame layout, Project Health did not flag shell drift.

This directly touches the original product concern: Decantr must help agents extend layouts without being trapped by old or misread shells.

### Behavior Verification Precision

Behavior obligations are worth keeping, but `A11Y011` currently fires on reusable input primitive definitions such as `src/components/ui/input.tsx`. The obligation should primarily inspect usage sites. Primitive files should usually be authority evidence, not failure targets.

### Style Bridge Noise

`TOKEN010` fired on project CSS variable usage such as `color: var(--foreground)` and `color: var(--ink)`. That is likely project-owned token usage, not arbitrary drift. The same detector correctly caught true raw inline/hex style debt in the messy fixture, so the fix is precision, not removal.

### Direct Graph Query Commands

Base graph generation worked, and `decantr task --json` could return route graph context. Direct CLI graph inspection failed with bare `EISDIR` for:

```bash
decantr graph --route /billing --json
decantr graph --file src/pages/BillingPage.tsx --impact --json
decantr graph --node rule:behavior:confirmation-dialog:project-dialog-primitive --impact --json
```

Those modes matter for CLI-only graph inspection and should not fail with an unhelpful filesystem error.

### Repair Prompt Tail

`decantr health --prompt ...` produced useful repair prompts, but the final instructions still recommended:

```text
decantr check --strict
decantr health
```

The Decantr 3 loop should recommend `decantr verify --brownfield --local-patterns`, with `--project <app>` in monorepos.

### Project-Scoped Dirty Files

`decantr task --project apps/pristine-react-saas` reported changed files from `apps/hybrid-next-product`. Project-scoped task context should separate selected-project changes from wider workspace changes.

## Phase 0 Scope

Phase 0 is a hardening sprint, not a new product surface. The items below are the implemented scope for the pre-3.1 readiness pass.

1. Improve Brownfield route discovery for route constants and `window.location.pathname` branch apps.
2. Add route shell provenance and first-pass shell drift warnings.
3. Scope form behavior verification to usage sites instead of generic primitive definitions.
4. Reduce style bridge false positives around accepted CSS variables and token definitions.
5. Fix direct `decantr graph --route`, `--file --impact`, and `--node --impact` query modes.
6. Align repair prompt tails to the v3 `verify` loop.
7. Filter or clearly label project-scoped versus workspace-wide changed files in `decantr task`.

## Acceptance Criteria

The Phase 0 proof lab passes when:

- all three fixtures can run `scan`, `adopt`, `codify`, `graph`, `task`, and `verify --evidence`
- messy React has targetable `/tickets`, `/customers`, and `/admin` routes
- public/full-bleed and app-shell routes are not conflated
- mutating a public route into an app shell creates an evidence-backed finding or explicit shell warning
- behavior obligation findings stay high-confidence
- `Input` primitive definitions do not trigger label-association warnings by themselves
- CSS variable token usage does not trigger `TOKEN010`
- direct graph query modes work without `EISDIR`
- repair prompts end with the v3 verify command
- project-scoped task context does not leak unrelated app changes as if they belonged to the selected project

## Non-Goals

- No Essence schema change.
- No registry/content schema change.
- No new package.
- No broad UX ontology.
- No hosted dashboard work.
- No enterprise/RBAC work.
- No attempt to make every framework equally deep.

## Roadmap Placement

Insert this before the larger Decantr 3.1 theme:

```text
3.0.2 stable -> Phase 0 proof-lab hardening -> 3.1 Project Health / Evidence / Repair
```

The 3.1 north star remains Project Health, Evidence, and Repair Loop. Phase 0 exists to make that loop trustworthy before the next expansion.
