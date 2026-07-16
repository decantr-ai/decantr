# Decantr 3.8.2 External Adoption Hardening

Date: 2026-07-10

This audit records the implementation and retrial prompted by the 2026-07-09 external adoption report. It is release evidence for the current working tree, not a claim that every frontend stack is certified.

## Targets

| Lane | Project | Commit | Stack focus |
| --- | --- | --- | --- |
| Brownfield single app | [Kiranism TanStack Start Dashboard](https://github.com/Kiranism/tanstack-start-dashboard) | `433a5a073c944d25dcd59922b4de7193bde3c03e` | React 19, TanStack Start/Router/Query/Form/Table, Vite 7, Nitro, Tailwind 4, Radix, Oxfmt, Bun |
| Brownfield nested app | [Bulletproof React](https://github.com/alan2207/bulletproof-react), `apps/react-vite` | `9506629ed003a561c6627735480cce4994244bb4` | React 18, React Router, Vite 5, TanStack Query, Tailwind 3, Radix, Vitest, Playwright, Yarn |
| Greenfield technology host | [TanStack CLI](https://github.com/TanStack/cli) generated scaffold | `f564d02999819d53d0337a04f15ef12536f9e731` | React 19, TanStack Start, Vite 8, Nitro, Biome 2, React Compiler, pnpm |

Retrial root: `/tmp/decantr-adoption-retrial.MN8PJz`

## Verdict

The tested React lanes are now suitable for reviewed Decantr adoption. The original route, authority, graph, baseline, formatter, CSS-boundary, and task-readiness blockers are closed for these fixtures.

The result does not justify an unqualified "stack agnostic" reliability claim. Shared fallback discovery remains advisory outside fixture-backed router adapters, Project Health still reports inherited debt aggressively, and static security/accessibility findings still need reviewer judgment.

## Blocker Disposition

| Original blocker | Disposition | Retrial evidence |
| --- | --- | --- |
| P0-1 route discovery wrong/build-dependent | Closed for tested adapters | TanStack resolves 22 source routes before/after build; `/dashboard/overview` resolves to `src/routes/dashboard/overview.tsx`. Bulletproof resolves all 8 nested object routes and lazy implementation files. Generated TanStack trees do not become taskable roots. |
| P0-2 confidence uncalibrated | Closed for formal/fallback split | Formal AST-backed routes carry authoritative evidence; pathname fallback is medium confidence. Generic fallback support remains a residual certification risk. |
| P0-3 monorepo authority dropped | Closed | `apps/react-vite` resolves workspace scope and inherits `../../AGENTS.md` into analysis, ambient context, and doctrine precedence. |
| P0-4 contract-only leaked Decantr CSS/Brownfield content | Closed for rendered artifacts | Contract-only packs/prompts use host-system language. Greenfield uses professional/sidebar defaults, Greenfield authority and verify commands, narrative context when packs are absent, and no `d-*`, token-file, treatment-file, decorator, registry-portal, or Brownfield-command leakage. |
| P0-5 health/baseline punished unchanged apps | Closed for Brownfield CI | Adoption saves a baseline. Project CI keeps inherited findings visible but gates only `baselineGate.newFindings`; both Brownfield fixtures exit 0 after adoption. Production audits exclude tests/generated output and use stronger semantic predicates. |
| P0-6 codify accepted inference without review | Closed | Acceptance requires `--confirm-reviewed`; style-bridge activation also requires `--accept-style-bridge`. Untouched proposals cannot silently change adoption mode. |
| P0-7 graph/task/readiness disagreed | Closed | Transient baseline diffs are excluded from graph identity. Shared discovery supplies route/page source provenance with or without Brownfield analysis. Task starts with the implementation file, blocks on stale graph, reports changed-route impact, and exits nonzero. |
| P0-8 generated files broke host formatting | Closed for Prettier/Oxfmt | Adoption writes generated-artifact entries to app/workspace `.prettierignore`. The adopted TanStack dashboard passes Oxfmt across 246 files. The Biome fixture ignores Decantr JSON under its existing include policy and has identical pre/post baseline diagnostics. |
| P0-9 MCP task payload impractical | Closed for default MCP mode | The eight-tool MCP identity is unchanged. Task context defaults to compact summaries and stable handles; `detail: "full"` is explicit. Tests enforce bounded compact output and blocked stale graph state. |

## Additional Corrections

- Narrowed auth callback evidence so unrelated `toast.error()` calls do not imply OAuth callback handling.
- Narrowed auth exit evidence so icon-map keys such as `logout: IconLogout` do not imply executable sign-out behavior.
- Kept real `handleLogout()` redirect-without-teardown findings covered.
- Removed `store`, `library`, `catalog`, and `marketplace` from the `registry` feature bucket. Explicit registry, catalog, and marketplace domains remain distinct.
- Made explicit Greenfield workflow selection override incidental host-footprint heuristics.
- Made Greenfield init write the initial typed graph so generated task-first guidance is immediately actionable.
- Added source-discovered route provenance to graph construction when `.decantr/analysis.json` is absent.
- Made blocked CLI task activation return exit code 1 while retaining structured JSON remediation.
- Made `analyze` recommend `--merge-proposal` when an Essence already exists.

## Retrial Results

### TanStack Brownfield

- Discovery: 22 taskable routes, all from source declarations.
- Graph: 378 nodes, 868 edges, 227 source artifacts, current after baseline verification.
- Task: `/dashboard/overview` reads `src/routes/dashboard/overview.tsx` first.
- Stale trial: a temporary route edit produced `blocked_missing_graph`, changed route `/dashboard/overview`, remediation `decantr graph`, and exit 1.
- CI: exit 0 with baseline gate applied; inherited debt remains visible.
- Host formatter: `oxfmt --check .` passed 246 files.
- Host production build: passed TanStack Start/Vite client, SSR, and Nitro/Vercel output.

### Bulletproof Nested Brownfield

- Discovery: 8 routes, including `/app/discussions`, `/app/discussions/:discussionId`, `/app/users`, and `/app/profile`.
- Authority: root `AGENTS.md` inherited as `../../AGENTS.md`.
- Graph/task: `/app/discussions` reads `apps/react-vite/src/app/routes/app/discussions/discussions.tsx` first and returns `ready_to_edit`.
- Feature detection: `notifications-store.ts` no longer creates a registry feature.
- CI: exit 0 with no new findings after baseline.
- Host lint: passed.
- Host production build: passed.
- Runtime smoke: `/` and `/app/discussions` returned HTTP 200 from Vite preview.
- Host tests on Node 25 remain red because `window.localStorage` is malformed under that runtime. The pinned baseline is known to pass on supported Node 22; this is not attributed to Decantr.

### Greenfield TanStack Host

- Workflow: `greenfield-contract-only`, contract-only adoption.
- Defaults: professional personality, `sidebar-main`, no observed-Brownfield defaults.
- Graph: generated during init with 30 source artifacts; `/` links to `src/routes/index.tsx` without Brownfield analysis.
- Task: reads `src/routes/index.tsx` first, uses Essence-first authority, and returns `decantr verify`.
- Assistant bridge: reads Essence, narrative scaffold/section context, Contract capsule, and task targets; absent pack files are not required.
- Content/CSS leakage scan: no Brownfield commands, Decantr atom/treatment files, `d-*` classes, or registry portal references in rendered contract context.
- Host production build: passed.
- Runtime smoke: `/` returned HTTP 200 with a 12,984-byte SSR response.
- Biome: the pristine generator and adopted fixture both report 58 errors, 17 warnings, and 1 schema info item. Explicit Decantr JSON paths are ignored by that Biome configuration, so adoption adds no diagnostics.

## Repository Verification

- `pnpm build`: pass for all packages and `apps/api`.
- `pnpm test`: 920 passed, 6 skipped; 90 files passed, 1 skipped.
- `pnpm --filter @decantr/verifier test`: 1,024 passed.
- `pnpm lint`: pass.
- Package surface and permission audit: pass.
- npm pack dry-runs: pass for all 10 public/experimental package surfaces; no install scripts.
- Docs marketing audit: pass.
- Docs drift audit: pass across 46 active docs/readmes.
- Public link audit: pass for 16 URLs.
- Live Content API audit: 7/7 checks pass.
- `@decantr/content`: 567 files, 0 errors, 4 existing quality warnings; 7 tests pass.
- Blueprint governance: no findings.
- All changed TypeScript/JSON files are Biome-clean. A broader package scan still finds one unrelated pre-existing format issue in `packages/cli/src/offline-content.ts`.

## Residual Risks

1. Router confidence is proven here for TanStack source routes, nested React Router objects, and existing Vue fixtures. Other stacks need equivalent precision/recall fixtures before being described as unattended-safe.
2. Baseline-aware CI now governs change correctly, but initial Project Health scores can remain low and `repair_required` can still reflect broad static warnings. Treat score as triage, not product truth.
3. Generic dangerous-HTML and component-style findings can be technically correct but lack framework-specific intent. They remain advisory review prompts unless backed by stronger evidence.
4. Compact MCP output is bounded, but strict 2,000-4,000-token budgets should continue to be measured against larger real repositories.
5. Biome compatibility is configuration-dependent. Decantr currently patches Prettier/Oxfmt ignore boundaries; it does not rewrite arbitrary Biome include/ignore policy.
6. `@decantr/css`, `@decantr/registry`, registry command aliases, and `decantr_registry` remain compatibility surfaces in 3.x. They must not return to default product positioning.

## Evidence Paths

- Original report: `/tmp/decantr-adoption-trial.bHLrvJ/TRIAL_REPORT.md`
- TanStack scan: `/tmp/decantr-adoption-retrial.MN8PJz/tanstack-scan-before.json`
- Bulletproof scan: `/tmp/decantr-adoption-retrial.MN8PJz/bulletproof-scan-before.json`
- Greenfield scan: `/tmp/decantr-adoption-retrial.MN8PJz/greenfield-scan-before.json`
- TanStack CI: `/tmp/decantr-adoption-retrial.MN8PJz/tanstack-ci.json`
- Bulletproof CI: `/tmp/decantr-adoption-retrial.MN8PJz/bulletproof-ci.json`
- Final Greenfield fixture: `/tmp/decantr-adoption-retrial.MN8PJz/greenfield-tanstack-clean`

## Release Posture

This hardening materially changes adoption behavior and should ship only through the normal Decantr release workflow with a version decision, changelog/release notes, and post-publish closeout. This audit did not publish packages, create tags, or deploy infrastructure.
