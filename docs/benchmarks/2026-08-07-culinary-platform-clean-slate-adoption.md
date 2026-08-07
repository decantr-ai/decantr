# Decantr 3.10 Culinary Platform Clean-Slate Adoption

**Evidence class:** development diagnostic, oracle-assisted repair replay

**Decantr repair commit:** `98e92472`

**Decantr base before repair:** `cbb8aa964a3017c88a1215db4f940699312aa0e6`

**Target commit:** `0fb1465b4687f86c4e71eaa5ae12bdaf0cb6c85b`

**Selected app:** `apps/recipefork-web`

**Target surface:** `/recipes/[id]`

## Verdict

The original clean-slate trial correctly stopped before adoption. The candidate found the Next.js app and physical route files, but treated seven production-blocked review routes as taskable, omitted five of six stylesheet authorities, counted API handlers as UI components, and still reported 98 confidence and `strong_fit`.

Repair commit `98e92472` corrects those observed failures on the same disposable worktree. The replay now separates source declaration from deployment reachability, preserves the complete stylesheet import order across workspace packages, excludes Next server handlers from component inventory, bounds attached task payloads, and removes the false-positive warnings that blocked verification of a valid bounded change.

This is a successful regression and adoption-path diagnostic. It is not evidence that Decantr improves a frontier model: the oracle was read, no control arm ran, the implementation was not blinded, and no model outcome was scored.

## Original Failure

The source candidate at `cbb8aa96` reported:

- 24 of 24 file routes as production-taskable, including `/journey` and six `/prototype/**` routes denied by production middleware;
- only `app/globals.css` plus the layout as styling authority, despite six ordered stylesheet imports;
- 96 component candidates, including App Router API `GET` and `POST` handlers;
- aggregate confidence 98, `strong_fit`, and `UI authority ready` despite those errors;
- unpinned `npx @decantr/cli` follow-up commands.

The independent trial stopped at this mandatory scan gate. It did not adopt, prepare a task, edit source, verify, or collect browser evidence.

## Repair Scope

The repair adds or changes five related authority lanes:

1. Next middleware/proxy policy and reachable local helpers are evaluated separately from file-route declaration. Literal equality, prefix, and path-array exclusions attached to 4xx policy make matching routes observable but non-taskable. Unresolved path-dependent policy lowers route authority and blocks preparation.
2. Production stylesheet imports are retained in cascade order, including workspace package `exports` and nested CSS imports. Task context can carry up to 12 ordered style reads.
3. Next `app/**/route.ts` server handlers and HTTP method exports are excluded from UI component inventory.
4. Attached task capsules include the verifier-ranked source, style, and advisory evidence reads. Generated Decantr state is excluded from changed-file impact, and compatibility envelopes are trimmed independently to the 12,000-byte ceiling.
5. Broad static source and minified-bundle heuristics no longer become warnings without stronger source or client-reachability corroboration. Concrete browser, test, security, graph, and contract failures remain actionable.

## Replay Results

### Read-Only Scan

The repaired scan reports:

| Measure | Result |
| --- | --- |
| File-route signals | 24 |
| Production-taskable routes | 17 |
| Deployment-conditioned routes | 7 |
| Route authority/completeness | `proven` / `complete` |
| Component candidates | 85, static/advisory |
| API handler components | 0 |
| Styling authority | six ordered styles plus `app/layout.tsx` |
| Component-inventory axis | `partial` |
| Runtime-evidence axis | `not_applicable` during static scan |
| Aggregate confidence | 89, capped by the partial nonblocking axis |

The seven conditioned routes are `/journey`, `/prototype`, and five additional `/prototype/**` declarations. They remain visible in the surface inventory with `taskable: false`.

The ordered style set is:

1. `packages/design-system/src/styles/foundation.css`
2. `packages/design-system/src/styles/recipefork.css`
3. `apps/recipefork-web/app/globals.css`
4. `apps/recipefork-web/app/collections-profile-polish.css`
5. `apps/recipefork-web/app/recipe-actions-polish.css`
6. `apps/recipefork-web/app/typography.css`
7. `apps/recipefork-web/app/layout.tsx` as the production import authority

### Task Preparation

The attached `/recipes/:id` task produced 13 ordered reads. The required route implementation is first, followed by both workspace design-system styles, all app-local styles in import order, the layout, one advisory test, and bounded Decantr contract context.

- canonical capsule: 3,447 UTF-8 bytes;
- deterministic estimate: 1,149 tokens;
- truncation: none;
- compatibility payload: below the 12,000-byte ceiling;
- changed source impact: two retained reset tests only; generated `.decantr` churn was excluded.

Negative controls failed closed:

- `/prototype/:id`: nonzero exit, `blocked`, no read set;
- `/definitely-missing`: nonzero exit, `blocked`, no read set.

### Bounded Change

The disposable target implementation added an anonymous-safe Print action beside Save and Fork. It used a shared Lucide-backed `PrinterIcon`, a semantic labeled button, and the existing RecipeFork action treatment. It changed no auth, persistence, API, or route behavior.

Target verification passed:

- RecipeFork: 49 test files, 137 tests;
- design-system icon tests: 5 tests;
- RecipeFork and design-system typechecks;
- Next production build, including 33 static pages and `/recipes/[id]`;
- Decantr graph refresh: 123 source artifacts, no stale graph artifacts;
- final Decantr verify: `healthy`, score 89, 0 errors, 0 warnings, 11 advisory findings;
- desktop 1280x720 and mobile 390x844 browser checks: Print visible, no action overlap, no horizontal overflow, and no browser console warnings/errors.

The target edits and screenshots remain in the disposable local worktree/evidence directory. They are not redistributed by this repository.

## Residual Limits

- Next policy extraction intentionally handles statically resolvable literals, prefixes, and path arrays. Regex, computed, remote, or otherwise unresolved path policy blocks route preparation instead of guessing.
- Styling discovery still depends on explicit production imports and resolvable package exports. Dynamic loaders and nonliteral Sass module graphs may require another adapter.
- Component inventory remains static advisory evidence. Count and confidence do not prove runtime reuse or completeness.
- Project Health's broad source heuristics are advisory in project-owned Brownfield styling modes. Runtime tools, host tests, accepted behavior obligations, and concrete security evidence remain the stronger gates.
- The scan's legacy `strong_fit` applicability label means all blocking static authority axes passed. It does not mean runtime evidence exists or component inventory is complete; consumers must read the independent axes.
- The bounded task was implemented with oracle knowledge. It cannot be reused as a treatment-arm outcome in the frozen 3.10 experiment.

## Local Evidence Bindings

The raw files were retained outside the repository under `/tmp/culinary-platform-decantr-310-fix-evidence` during this run. Key SHA-256 bindings were:

| Artifact | SHA-256 |
| --- | --- |
| repaired scan | `f0a36a4507925dbd1ae7aed3befd57ca794ee09b4ff3da5258f2e82b41f8a5e0` |
| public task | `200373dfe6243607890b2416fbd2d5283ff0d2e0252ff1f264829289946e3c98` |
| conditioned task | `aeffbbc585420fb538f3464d917576fbbcf6faf63f6e60ac7c1644585269a969` |
| static health | `55308ec9778f61b3a96bebe5747b70c353171bdea858389aa3106e0fa5ff4139` |
| final verify | `a6e69aff0e83abc31027aa71115d9bddd1e4ef494642f9f36e11cac9da0b069c` |
| desktop screenshot | `0f3d98444b989e17d27c86f8d8b5e5988729fa5b8be270f6cc4cffca7a6a887e` |
| mobile viewport screenshot | `bcad7ca7c51192c6a9590cbcfb0a11456c5b6f91924bdb1d9dee6681de8db739` |

## Decantr Verification

The repair commit passed:

```sh
pnpm test
pnpm build
pnpm biome:check
```

That result covers 107 passing test files and 1,085 passing tests, with one file and six tests intentionally skipped. Package, documentation, and packed-artifact audits are recorded separately during repository closeout.
