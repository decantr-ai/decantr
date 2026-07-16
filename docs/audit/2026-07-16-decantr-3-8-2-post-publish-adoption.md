# Decantr 3.8.2 Post-Publish Adoption Audit

Date: 2026-07-16

Status: Completed against public npm artifacts. One patch-line defect was found and fixed in a packed local candidate; that fix is not part of the published 3.8.2 artifacts.

## Verdict

Decantr 3.8.2 is usable as a content-first governance layer in the two Brownfield applications tested. Installation, read-only discovery, contract-only adoption, task preparation, baseline-aware CI, and host builds all completed without registry infrastructure, Decantr CSS adoption, source upload, or workspace package links.

The latest TanStack greenfield template exposed a real discovery precedence defect. For `/`, 3.8.2 selected `src/routes/__root.tsx` instead of the page implementation at `src/routes/index.tsx`. The root layout remained valid evidence, but it should not outrank the literal file-route declaration. A candidate fix now makes the page source the task's first read target while retaining `__root.tsx` as fallback evidence.

This audit supports a narrow 3.8 patch and a feature freeze for the rest of 3.8.x. It does not justify new packages, a ninth MCP tool, hosted accounts, a registry revival, or broader Decantr CSS adoption.

## Artifact Boundary

The primary trial installed these exact public npm packages in a standalone npm prefix:

- `@decantr/cli@3.8.2`
- `@decantr/core@3.8.2`
- `@decantr/mcp-server@3.8.2`
- `@decantr/verifier@3.8.2`

The install contained no workspace links and `npm audit` reported zero vulnerabilities. `decantr --version` reported `3.8.2`.

The remediation was separately validated by packing the local verifier and CLI packages, installing those tarballs in a new standalone npm prefix, and rerunning the affected TanStack greenfield flow. That candidate is evidence for a future patch, not evidence that npm 3.8.2 already contains the fix.

## Targets

| Lane | Target | Exact source | Stack signal |
| --- | --- | --- | --- |
| Brownfield | Kiranism TanStack Start Dashboard | `433a5a073c944d25dcd59922b4de7193bde3c03e` | TanStack Start, React 19, file routes, Tailwind, shadcn/ui, Lucide, Oxfmt |
| Brownfield monorepo | Bulletproof React `apps/react-vite` | `9506629ed003a561c6627735480cce4994244bb4` | React, Vite, React Router, Yarn workspace, ESLint |
| Greenfield | `@tanstack/cli@0.69.6` generated app | generator output captured on 2026-07-16 | TanStack Start, React 19, Vite 8, Tailwind 4, Lucide, Biome |

The pinned Brownfield targets are now represented by `scripts/realworld-corpus.post-publish.json`. The greenfield lane remains generator-based so it continues to detect changes in a current framework starter.

A second run through the committed pinned-corpus harness installed `@decantr/cli@3.8.2` from npm and executed 36 commands across the two Brownfield targets. It reported zero unexpected failures, zero crash projects, zero route misses, zero slow commands, and exact requested-ref/resolved-commit parity for both targets. Across that command matrix, observed command P50 was 284ms, P95 was 968ms, and max was 1,335ms. These are descriptive values for one matrix run, not release-level percentile claims.

## Measured Results

Durations are single-run wall-clock observations from the clean-room host. They establish basic usability, not statistically meaningful performance percentiles.

| Target | Scan | Routes | Adopt or init | Task | CI | Host build | Host check |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| TanStack dashboard | 434ms | 22 | 1,734ms | 740ms | 1,152ms | 17,012ms | Oxfmt passed in 1,907ms |
| Bulletproof React | 385ms | 8 | 1,036ms | 560ms | 677ms | 7,777ms | ESLint passed in 6,225ms |
| TanStack greenfield | 306ms | 1 | 557ms | 392ms | 384ms | 2,764ms | Biome failed identically before and after adoption |

Task results:

- TanStack `/dashboard/overview` returned `ready_to_edit`; first read was `src/routes/dashboard/overview.tsx`.
- Bulletproof `/app/discussions` returned `ready_to_edit`; first read was `apps/react-vite/src/app/routes/app/discussions/discussions.tsx`.
- Published 3.8.2 chose `src/routes/__root.tsx` for greenfield `/`; the packed candidate chose `src/routes/index.tsx`.

CI results:

- TanStack applied its adoption baseline: 11 inherited findings and zero new findings.
- Bulletproof applied its adoption baseline: 12 inherited findings and zero new findings.
- Greenfield had no baseline and reported 3 warnings plus 4 informational findings under `--fail-on error`; no errors were present.

Host-source integrity:

- Contract-only adoption did not rewrite application source in either Brownfield target.
- The greenfield adoption only appended the Decantr cache path to `.gitignore` before the host build.
- The host build regenerated `src/routeTree.gen.ts`; that mutation belongs to the TanStack route generator, not Decantr.
- The generated app's Biome check reported the same eight formatting errors and one informational result in a pristine pre-adoption worktree. This is an upstream starter baseline, not a Decantr regression.

## Defect And Remediation

The affected template declares:

- `createRootRoute(...)` in `src/routes/__root.tsx`
- `createFileRoute('/')` in `src/routes/index.tsx`

Both signals are high confidence, but an exact page declaration must outrank a layout declaration for task implementation context. The verifier now uses a shared route-signal rank that:

1. Preserves confidence as the first ordering dimension.
2. Prefers formal route declarations over pathname fallback signals.
3. Gives index declarations a small positive tie-break.
4. Gives the TanStack root-layout signal a small negative tie-break.

Regression coverage exists at verifier scan, CLI graph, and CLI greenfield E2E levels. The packed candidate rerun confirmed that scan, initial graph creation, and task context all resolve `/` to `src/routes/index.tsx`.

## Product Findings

1. The content-first boundary held. None of these lanes needed the retired public registry, Supabase, Vercel registry deployment, accounts, billing, or hosted source upload.
2. Contract-only is the correct default. The target applications kept ownership of styling and source structure; `@decantr/css` provided no adoption value in these trials.
3. Source-accurate task context is a release gate, not a cosmetic detail. A fast task command that selects a layout instead of the implementation file wastes model context and weakens governance.
4. Baseline-aware CI is useful immediately in Brownfield apps. It separated inherited findings from the zero new findings introduced by adoption.
5. Decantr still lacks a labeled precision benchmark. Finding counts are measured, but false-positive precision was not established by this trial and must not be claimed.
6. One run per target is insufficient for a P95 claim. The 3.9 program defines repeated-run gates rather than promoting these observations into unsupported percentiles.

## Release Recommendation

Prepare a narrow 3.8 patch containing the TanStack root-route precedence fix and its tests. Do not add product surface to that patch. Before publication, run the post-publish corpus against packed artifacts, then repeat it against the public npm version after publication.

The rest of 3.8.x should accept only defects, security corrections, compatibility corrections, documentation drift, and release-operational repairs under `docs/runbooks/decantr-3-8-maintenance.md`.

## Reproduction

Use `docs/runbooks/post-publish-adoption-proof.md`. Generated JSON, command logs, cloned repositories, and npm prefixes belong in the selected `/tmp` output directory or CI artifacts, not in package source or the repository root.
