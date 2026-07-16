# Post-Publish Adoption Proof

Use this runbook after an npm release and before describing that release as adopted successfully. It tests exact public npm artifacts, pinned Brownfield commits, a current Greenfield generator, host builds, governed-change contracts, and host-source integrity. For Decantr 3.9, this public replay supplements rather than replaces the pre-publish packed-artifact and human qualification gates.

## Rules

- Use an empty `/tmp` output directory.
- Install the exact public version with npm. Do not use a workspace link, local package directory, or global Decantr binary.
- Pin Brownfield repositories to reviewed commits.
- Generate the greenfield target from an exact CLI version.
- Keep generated reports in `/tmp` or CI artifacts. Commit only the human-reviewed audit.
- Treat host formatter failures as Decantr failures only when adoption changed the failing host files or changed the result relative to a pristine control.
- Run v2 and explicit v3 CI separately. V2 remains the default; never infer v3 from the package version.
- A v3 `not_proven` result is not a pass. Record missing, stale, or incompatible baseline/change evidence instead of converting unclassified findings into new findings.
- Preserve raw per-run timings and reproducibility manifests. A percentile claim requires 30 independently initialized runs per target/command.
- Reuse the frozen two-human-reviewer finding and route corpus. Do not generate labels from Decantr output or substitute agents for reviewers.

## Brownfield Corpus

From the Decantr monorepo:

```bash
VERSION=3.9.0
OUT="/tmp/decantr-post-publish-$VERSION"
pnpm benchmark:post-publish-adoption -- \
  --cli-package "@decantr/cli@$VERSION" \
  --repeat 30 \
  --out "$OUT/brownfield"
```

The harness installs the requested CLI package in its own npm prefix, clones the refs in `scripts/realworld-corpus.post-publish.json`, runs the command matrix, and writes:

- `reports/aggregate-summary.json`
- `reports/realworld-corpus.md`
- per-command stdout and stderr under `logs/`

The harness gate passes only when every isolated target run has taskable routes, no unexpected command failures, no crash signatures, and no performance-budget failures. Inspect the raw task output and the frozen route replay to confirm that the first read target is the route implementation, not a layout, generated route tree, or unrelated sibling app. The harness alone does not establish the 84/84 and 24/24 route qualification counts.

## Greenfield Lane

Generate a current TanStack Start control with an exact generator version:

```bash
VERSION=3.9.0
OUT="/tmp/decantr-post-publish-$VERSION"
npx --yes @tanstack/cli@0.69.6 create greenfield-tanstack \
  --framework React \
  --package-manager npm \
  --toolchain biome \
  --no-examples \
  --no-git \
  --no-intent \
  --yes \
  --target-dir "$OUT/greenfield"

npm install \
  --prefix "$OUT/runner" \
  --no-package-lock \
  --no-audit \
  --no-fund \
  "@decantr/cli@$VERSION"
```

Run the installed binary without adding it to the generated application's dependencies:

```bash
CLI="$OUT/runner/node_modules/@decantr/cli/dist/bin.js"
node "$CLI" scan --json
node "$CLI" init \
  --workflow=greenfield \
  --adoption=contract-only \
  --assistant-bridge=apply \
  --yes
node "$CLI" task / "Review the generated home route" --json
node "$CLI" ci --fail-on error --json
node "$CLI" ci --report-version v3 --fail-on none --json
```

The task gate requires `ready_to_edit`, a current graph, `taskCapsuleVersion: "task-capsule.v1"`, a payload within the documented byte/token budget, and `src/routes/index.tsx` as the first implementation read for `/` when the starter uses the standard TanStack `__root.tsx` plus `index.tsx` structure. The v3 smoke uses `--fail-on none` only to inspect a Greenfield report without compatible change/baseline evidence; its governance delta must remain `not_proven`, and that invocation is not release-gate evidence.

Repeat the Greenfield lane from a fresh target and runner directory 30 times before publishing percentile claims. Record generator version, package lock, runtime versions, raw command durations, task capsule sizes, v2 status, v3 gate result, and source hashes for every run.

## CI V3 And Studio Replay

For each adopted Brownfield target, retain a compatible saved baseline and capture `BASE_REF="$(git rev-parse HEAD)"` before adoption. Then capture both report versions from the selected app root:

```bash
BASE_REF="$(git rev-parse HEAD)"
node "$CLI" ci --fail-on error --json \
  --output "$OUT/ci-v2.json"
node "$CLI" ci --since "$BASE_REF" \
  --report-version v3 --fail-on error --json \
  --output "$OUT/ci-v3.json"
```

From a monorepo root, add the same explicit `--project apps/react-vite` scope to both commands.

Validate that v2 remains the default and that v3 contains matching selected-app identity in `adoptionTruth` and `governanceDelta`. A missing or incompatible baseline/change base must fail closed as `not_proven` unless the command explicitly uses `--fail-on none`.

Open current-project, project-health-v2, project CI v2, and project CI v3 Studio modes. Snapshot every file before and after each GET/refresh sequence. Studio may recompute state in memory and expose copyable commands, but the exhaustive diff must show zero Studio writes. Saved workspace CI report mode is not supported and should not be claimed.

## Host Gates

Run each target's own install, build, and source check after Decantr adoption:

| Target | Install | Build | Source check |
| --- | --- | --- | --- |
| TanStack dashboard | `npx --yes bun@latest install --frozen-lockfile` | `npx --yes bun@latest run build` | `npx --yes bun@latest run format:check` |
| Bulletproof React app | `npx --yes yarn@1.22.22 install --frozen-lockfile --ignore-scripts` | `npx --yes yarn@1.22.22 build` | `npx --yes yarn@1.22.22 lint` |
| Generated TanStack app | generator installs dependencies | `npm run build` | `npm run check` |

Capture a pristine greenfield source-check result before adoption. If the post-adoption result fails, compare it with the pristine result and inspect `git diff` before assigning responsibility.

Contract-only adoption may create Decantr governance artifacts and narrowly update ignore files. It must not rewrite application source. Host-generated files such as TanStack's `routeTree.gen.ts` are allowed only when the host build generated them and the audit records that provenance.

## Required Evidence

Record these facts in the release audit:

- npm package names, versions, and zero-link install boundary
- repository URLs and exact commits
- generator package and exact version
- scan, adoption/init, task, CI, build, and source-check durations
- route count and first task read target
- inherited versus new CI findings
- v2-default and explicit-v3 report schema IDs, adoption identity agreement, delta classification, and gate result
- task capsule byte count, token estimate, truncation state, first read target, stop conditions, and verification command
- Studio mode exercised and exhaustive before/after filesystem hashes
- source files changed by Decantr versus by host tooling
- any defect, limitation, or unmeasured claim

Run `pnpm audit:3-9-qualification` against the completed, artifact-backed packet and retain its output with the public audit. Do not claim precision/recall without the frozen two-human-reviewer corpus and recomputable confusion matrices. Do not claim a percentile from fewer than 30 independent samples, and do not describe 3.9 as adoption-proven until the dated public audit is reviewed.
